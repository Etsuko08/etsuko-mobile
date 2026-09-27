// Etsuko Mobile Offline Downloader & IndexedDB Storage Engine
// Provides 100% offline audio playback, live download progress, speed indicator, and queue management

class OfflineDownloader {
  constructor() {
    this.dbName = 'etsuko_offline_db';
    this.storeName = 'downloads';
    this.dbVersion = 1;
    this.db = null;
    this.activeDownloads = new Map(); // videoId -> { track, progress, speed, status, controller }
    this.initDB();
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'videoId' });
          store.createIndex('title', 'title', { unique: false });
          store.createIndex('downloadedAt', 'downloadedAt', { unique: false });
        }
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        console.log('[Etsuko] Offline Storage Engine Ready (IndexedDB)');
        resolve(this.db);
      };

      request.onerror = (e) => {
        console.error('[Etsuko] IndexedDB error:', e.target.error);
        reject(e.target.error);
      };
    });
  }

  async ensureDB() {
    if (!this.db) {
      await this.initDB();
    }
    return this.db;
  }

  async isDownloaded(videoId) {
    if (!videoId) return false;
    try {
      const db = await this.ensureDB();
      return new Promise((resolve) => {
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const req = store.get(videoId);
        req.onsuccess = () => resolve(!!req.result);
        req.onerror = () => resolve(false);
      });
    } catch (e) {
      return false;
    }
  }

  async getOfflineTrack(videoId) {
    if (!videoId) return null;
    try {
      const db = await this.ensureDB();
      return new Promise((resolve) => {
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const req = store.get(videoId);
        req.onsuccess = () => {
          if (req.result && req.result.audioBlob) {
            const blobUrl = URL.createObjectURL(req.result.audioBlob);
            resolve({
              ...req.result,
              streamUrl: blobUrl,
              isOffline: true
            });
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      });
    } catch (e) {
      return null;
    }
  }

  async getAllDownloadedTracks() {
    try {
      const db = await this.ensureDB();
      return new Promise((resolve) => {
        const tx = db.transaction(this.storeName, 'readonly');
        const store = tx.objectStore(this.storeName);
        const req = store.getAll();
        req.onsuccess = () => {
          const list = (req.result || []).map(item => ({
            ...item,
            streamUrl: item.audioBlob ? URL.createObjectURL(item.audioBlob) : null,
            isOffline: true
          }));
          // Sort by latest downloaded first
          list.sort((a, b) => (b.downloadedAt || 0) - (a.downloadedAt || 0));
          resolve(list);
        };
        req.onerror = () => resolve([]);
      });
    } catch (e) {
      return [];
    }
  }

  async deleteDownloadedTrack(videoId) {
    try {
      const db = await this.ensureDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const req = store.delete(videoId);
        req.onsuccess = () => {
          window.dispatchEvent(new CustomEvent('etsuko:download-deleted', { detail: { videoId } }));
          resolve(true);
        };
        req.onerror = (e) => reject(e.target.error);
      });
    } catch (e) {
      return false;
    }
  }

  // --- Download Engine with Progress & Speed Tracking ---
  async startDownload(track) {
    if (!track || !track.videoId) return;

    if (await this.isDownloaded(track.videoId)) {
      if (window.app && window.app.showToast) {
        window.app.showToast('Already downloaded in offline library');
      }
      return;
    }

    if (this.activeDownloads.has(track.videoId)) {
      if (window.app && window.app.showToast) {
        window.app.showToast('Download already in progress');
      }
      return;
    }

    const controller = new AbortController();
    const downloadTask = {
      videoId: track.videoId,
      track: track,
      progress: 0,
      speedText: '0 KB/s',
      loadedBytes: 0,
      totalBytes: 0,
      status: 'starting',
      controller: controller
    };

    this.activeDownloads.set(track.videoId, downloadTask);
    window.dispatchEvent(new CustomEvent('etsuko:download-started', { detail: downloadTask }));

    if (window.app && window.app.showToast) {
      window.app.showToast(`Downloading: ${track.title}`);
    }

    try {
      // 1. Resolve Audio Stream URL
      let streamUrl = track.streamUrl;
      if (!streamUrl && window.api && window.api.resolveAudioStream) {
        streamUrl = await window.api.resolveAudioStream(track.videoId);
      }

      if (!streamUrl) {
        throw new Error('Unable to resolve audio stream for offline download');
      }

      // 2. Fetch thumbnail as Blob concurrently
      let thumbBlob = null;
      try {
        const thumbRes = await fetch(track.thumbnail || 'assets/default_cover.png', { signal: AbortSignal.timeout(4000) });
        if (thumbRes.ok) thumbBlob = await thumbRes.blob();
      } catch (err) {}

      // 3. Stream Download Audio with ReadableStream Reader
      const audioResponse = await fetch(streamUrl, {
        signal: controller.signal
      });

      if (!audioResponse.ok) {
        throw new Error(`Download HTTP failed: ${audioResponse.status}`);
      }

      const contentLength = audioResponse.headers.get('content-length');
      const totalBytes = contentLength ? parseInt(contentLength, 10) : 3500000; // ~3.5MB fallback estimate
      downloadTask.totalBytes = totalBytes;
      downloadTask.status = 'downloading';

      const reader = audioResponse.body.getReader();
      const chunks = [];
      let loadedBytes = 0;
      let lastTime = performance.now();
      let lastLoaded = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        loadedBytes += value.length;
        downloadTask.loadedBytes = loadedBytes;

        const now = performance.now();
        const elapsed = (now - lastTime) / 1000; // seconds

        // Calculate progress percentage
        const pct = Math.min(99, Math.round((loadedBytes / totalBytes) * 100));
        downloadTask.progress = pct;

        // Calculate speed every 250ms
        if (elapsed >= 0.25) {
          const deltaBytes = loadedBytes - lastLoaded;
          const bytesPerSec = deltaBytes / elapsed;
          downloadTask.speedText = this.formatSpeed(bytesPerSec);

          lastTime = now;
          lastLoaded = loadedBytes;

          window.dispatchEvent(new CustomEvent('etsuko:download-progress', { detail: { ...downloadTask } }));
        }
      }

      // Final 100% completion
      downloadTask.progress = 100;
      downloadTask.status = 'saving';
      window.dispatchEvent(new CustomEvent('etsuko:download-progress', { detail: { ...downloadTask } }));

      const mimeType = audioResponse.headers.get('content-type') || 'audio/webm';
      const audioBlob = new Blob(chunks, { type: mimeType });

      // 4. Save to IndexedDB
      const db = await this.ensureDB();
      const record = {
        videoId: track.videoId,
        title: track.title || 'Unknown Title',
        artist: track.artist || 'Unknown Artist',
        album: track.album || 'Etsuko Master',
        duration: track.duration || '3:30',
        thumbnail: track.thumbnail || 'assets/default_cover.png',
        thumbnailBlob: thumbBlob,
        audioBlob: audioBlob,
        mimeType: mimeType,
        size: loadedBytes,
        downloadedAt: Date.now()
      };

      await new Promise((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readwrite');
        const store = tx.objectStore(this.storeName);
        const req = store.put(record);
        req.onsuccess = () => resolve();
        req.onerror = (e) => reject(e.target.error);
      });

      this.activeDownloads.delete(track.videoId);
      window.dispatchEvent(new CustomEvent('etsuko:download-complete', { detail: { track: record } }));

      if (window.app && window.app.showToast) {
        window.app.showToast(`Saved to Downloads: ${track.title}`);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('[Downloader] Cancelled download for', track.title);
      } else {
        console.error('[Downloader] Download error:', err);
        if (window.app && window.app.showToast) {
          window.app.showToast(`Download failed: ${err.message}`);
        }
      }
      this.activeDownloads.delete(track.videoId);
      window.dispatchEvent(new CustomEvent('etsuko:download-error', { detail: { videoId: track.videoId, error: err.message } }));
    }
  }

  cancelDownload(videoId) {
    const task = this.activeDownloads.get(videoId);
    if (task && task.controller) {
      task.controller.abort();
      this.activeDownloads.delete(videoId);
      window.dispatchEvent(new CustomEvent('etsuko:download-cancelled', { detail: { videoId } }));
    }
  }

  formatSpeed(bytesPerSec) {
    if (bytesPerSec >= 1048576) {
      return `${(bytesPerSec / 1048576).toFixed(1)} MB/s`;
    }
    return `${Math.round(bytesPerSec / 1024)} KB/s`;
  }
}

// Global Downloader Singleton
if (typeof window !== 'undefined') {
  window.downloader = new OfflineDownloader();
}
