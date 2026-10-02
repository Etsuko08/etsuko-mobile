// Etsuko Mobile — Resilient GitHub Releases App Update Engine
// Dual-channel update checks (Fastly CDN raw JSON + GitHub API + Native Android HttpURLConnection),
// semantic version comparison, live download progress, and native APK package installer integration.

class AppUpdater {
  constructor() {
    this.currentVersion = 'v1.3.0';
    this.repoOwner = 'Etsuko08';
    this.repoName = 'etsuko-mobile';
    this.cdnUrl = `https://raw.githubusercontent.com/${this.repoOwner}/${this.repoName}/main/version.json`;
    this.apiUrl = `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/releases/latest`;
    this.isChecking = false;
    this.latestRelease = null;
    this.apkDownloadUrl = null;

    this.initDOM();
    this.bindEvents();
    this.scheduleStartupCheck();
  }

  initDOM() {
    this.modal = document.getElementById('modal-app-update');
    this.tagCurrent = document.getElementById('update-current-version');
    this.tagNew = document.getElementById('update-new-version');
    this.releaseNotes = document.getElementById('update-release-notes');
    this.btnUpdateNow = document.getElementById('btn-update-now');
    this.btnUpdateLater = document.getElementById('btn-update-later');
    this.btnUpdateClose = document.getElementById('btn-update-close');
    this.progressPanel = document.getElementById('update-progress-panel');
    this.progressBar = document.getElementById('update-progress-bar');
    this.percentLabel = document.getElementById('update-percent-label');
    this.statusLabel = document.getElementById('update-status-label');
    this.sizeLabel = document.getElementById('update-size-label');
    this.btnInstallNow = document.getElementById('btn-update-install');
  }

  bindEvents() {
    if (this.btnUpdateLater) {
      this.btnUpdateLater.addEventListener('click', () => {
        this.postponeUpdate();
        this.closeModal();
      });
    }

    if (this.btnUpdateClose) {
      this.btnUpdateClose.addEventListener('click', () => {
        this.closeModal();
      });
    }

    if (this.btnUpdateNow) {
      this.btnUpdateNow.addEventListener('click', () => {
        if (this.latestRelease) {
          this.startDownload(this.latestRelease);
        }
      });
    }

    if (this.btnInstallNow) {
      this.btnInstallNow.addEventListener('click', () => {
        if (this.apkDownloadUrl) {
          this.triggerInstall(this.apkDownloadUrl);
        }
      });
    }

    // Dismiss on clicking modal backdrop
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.closeModal();
        }
      });
    }
  }

  scheduleStartupCheck() {
    const autoCheck = localStorage.getItem('etsuko_auto_update_check') !== 'false';
    if (!autoCheck) return;

    // Check 4 seconds after launch to ensure smooth app startup
    setTimeout(() => {
      this.checkForUpdates(true);
    }, 4000);
  }

  // Parse semantic versions: 'v1.3.0' -> [1, 3, 0]
  parseVersion(vStr) {
    if (!vStr) return [0, 0, 0];
    const clean = String(vStr).replace(/^[^0-9]*/, '').split('-')[0].trim();
    const parts = clean.split('.').map(p => parseInt(p, 10) || 0);
    while (parts.length < 3) parts.push(0);
    return parts;
  }

  // Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
  compareVersions(v1, v2) {
    const p1 = this.parseVersion(v1);
    const p2 = this.parseVersion(v2);
    for (let i = 0; i < 3; i++) {
      if (p1[i] > p2[i]) return 1;
      if (p1[i] < p2[i]) return -1;
    }
    return 0;
  }

  async fetchVersionMetadata() {
    // 1. Primary Check: Fastly CDN raw JSON (Zero rate limit, CORS enabled, no 403 blocks)
    try {
      const cacheBustUrl = `${this.cdnUrl}?t=${Date.now()}`;
      const res = await fetch(cacheBustUrl, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(6000)
      });
      if (res.ok) {
        const data = await res.json();
        if (data && (data.version || data.tagName)) {
          return {
            tag_name: data.tagName || `v${data.version}`,
            name: data.name || `Etsuko Mobile v${data.version}`,
            body: data.body || data.notes || '',
            downloadUrl: data.downloadUrl || data.apkUrl || `https://github.com/${this.repoOwner}/${this.repoName}/releases/download/v${data.version}/Etsuko.apk`,
            html_url: data.releaseUrl || `https://github.com/${this.repoOwner}/${this.repoName}/releases/latest`,
            assets: [
              {
                name: 'Etsuko.apk',
                browser_download_url: data.downloadUrl || data.apkUrl || `https://github.com/${this.repoOwner}/${this.repoName}/releases/download/v${data.version}/Etsuko.apk`
              }
            ]
          };
        }
      }
    } catch (e) {
      console.warn('[AppUpdater] CDN version check fallback:', e.message);
    }

    // 2. Native Bridge Check (if on Android, bypasses WebView security sandbox)
    if (window.AndroidMedia && typeof window.AndroidMedia.nativeCheckUpdateAsync === 'function') {
      try {
        const nativeData = await new Promise((resolve) => {
          const cbId = 'upd_' + Math.random().toString(36).substring(2, 9);
          const timeout = setTimeout(() => {
            delete window['__native_update_done_' + cbId];
            resolve(null);
          }, 8000);

          window['__native_update_done_' + cbId] = (rawJson) => {
            clearTimeout(timeout);
            delete window['__native_update_done_' + cbId];
            try {
              if (rawJson) {
                const parsed = JSON.parse(rawJson);
                resolve(parsed);
              } else {
                resolve(null);
              }
            } catch (err) {
              resolve(null);
            }
          };

          window.AndroidMedia.nativeCheckUpdateAsync(this.apiUrl, cbId);
        });

        if (nativeData && (nativeData.tag_name || nativeData.name)) {
          return nativeData;
        }
      } catch (err) {
        console.warn('[AppUpdater] Native update bridge check failed:', err);
      }
    }

    // 3. Fallback: GitHub Releases API
    try {
      const res = await fetch(this.apiUrl, {
        headers: { 'Accept': 'application/vnd.github.v3+json' },
        signal: AbortSignal.timeout(8000)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[AppUpdater] GitHub API check failed:', err.message);
    }

    return null;
  }

  async checkForUpdates(silent = false) {
    if (this.isChecking) return;
    this.isChecking = true;

    if (!silent && window.app && window.app.showToast) {
      window.app.showToast('Checking for updates...');
    }

    try {
      const release = await this.fetchVersionMetadata();

      if (!release) {
        if (!silent && window.app && window.app.showToast) {
          window.app.showToast('Unable to check for updates right now.');
        }
        return;
      }

      const latestTag = release.tag_name || release.tagName || release.name || '';
      const isNewer = this.compareVersions(latestTag, this.currentVersion) > 0;

      if (isNewer) {
        // If running in silent startup check, verify if user postponed THIS specific version today
        if (silent) {
          const postponedTag = localStorage.getItem('etsuko_postponed_update_tag');
          const postponedDate = localStorage.getItem('etsuko_postponed_update_date');
          const today = new Date().toDateString();
          if (postponedTag === latestTag && postponedDate === today) {
            return;
          }
        }

        this.latestRelease = release;
        this.showUpdateModal(release);
      } else {
        if (!silent && window.app && window.app.showToast) {
          window.app.showToast(`You are on the latest version (${this.currentVersion}).`);
        }
      }
    } catch (err) {
      console.warn('[AppUpdater] Error in checkForUpdates:', err);
      if (!silent && window.app && window.app.showToast) {
        window.app.showToast('Failed to check for updates. Check internet connection.');
      }
    } finally {
      this.isChecking = false;
    }
  }

  showUpdateModal(release) {
    if (!this.modal) return;

    const latestTag = release.tag_name || release.tagName || 'New Version';
    if (this.tagCurrent) this.tagCurrent.textContent = this.currentVersion;
    if (this.tagNew) this.tagNew.textContent = latestTag;

    const rawNotes = release.body || release.notes || 'Performance improvements, UI refinements, and bug fixes.';
    if (this.releaseNotes) this.releaseNotes.innerHTML = this.formatMarkdown(rawNotes);

    // Reset progress panel
    if (this.progressPanel) this.progressPanel.style.display = 'none';
    if (this.btnUpdateNow) this.btnUpdateNow.style.display = 'inline-flex';
    if (this.btnUpdateLater) this.btnUpdateLater.style.display = 'inline-flex';
    if (this.btnInstallNow) this.btnInstallNow.style.display = 'none';

    this.modal.classList.add('active');
  }

  closeModal() {
    if (this.modal) this.modal.classList.remove('active');
  }

  postponeUpdate() {
    if (this.latestRelease) {
      const tag = this.latestRelease.tag_name || this.latestRelease.tagName || '';
      localStorage.setItem('etsuko_postponed_update_tag', tag);
      localStorage.setItem('etsuko_postponed_update_date', new Date().toDateString());
    }
  }

  async startDownload(release) {
    // Locate Android APK asset in release or fallback URL
    const assets = release.assets || [];
    let apkAsset = assets.find(a => a.name && a.name.toLowerCase().endsWith('.apk'));
    this.apkDownloadUrl = (apkAsset && apkAsset.browser_download_url) ||
      release.downloadUrl ||
      release.apkUrl ||
      `https://github.com/${this.repoOwner}/${this.repoName}/releases/download/${release.tag_name || 'v1.3.0'}/Etsuko.apk`;

    if (this.progressPanel) this.progressPanel.style.display = 'block';
    if (this.btnUpdateNow) this.btnUpdateNow.style.display = 'none';
    if (this.btnUpdateLater) this.btnUpdateLater.style.display = 'none';

    const totalBytes = (apkAsset && apkAsset.size) || 6000000; // ~6MB Etsuko APK

    // 1. If running natively in Android with bridge
    if (window.AndroidMedia && typeof window.AndroidMedia.downloadAndInstallApk === 'function') {
      this.updateProgressUI(0, 0, totalBytes, 'Starting native download...');

      window.onNativeApkProgress = (pct, loaded, total) => {
        this.updateProgressUI(
          pct,
          loaded,
          total || totalBytes,
          pct >= 100 ? 'Installing update...' : 'Downloading Etsuko.apk...'
        );
      };

      const cbId = 'dl_' + Math.random().toString(36).substring(2, 9);
      window['__native_apk_done_' + cbId] = (success) => {
        delete window['__native_apk_done_' + cbId];
        if (success) {
          this.updateProgressUI(100, totalBytes, totalBytes, 'Download complete. Launching package installer...');
          if (this.btnInstallNow) this.btnInstallNow.style.display = 'inline-flex';
        } else {
          this.updateProgressUI(100, totalBytes, totalBytes, 'Download redirected to browser.');
          this.triggerInstall(this.apkDownloadUrl);
        }
      };

      window.AndroidMedia.downloadAndInstallApk(this.apkDownloadUrl, cbId);
      return;
    }

    // 2. Browser / Progressive Web App Download
    let currentBytes = 0;
    const steps = 15;
    for (let i = 1; i <= steps; i++) {
      await new Promise(r => setTimeout(r, 100));
      const pct = Math.min(96, Math.round((i / steps) * 100));
      currentBytes = Math.round((pct / 100) * totalBytes);
      this.updateProgressUI(pct, currentBytes, totalBytes, 'Preparing download...');
    }

    this.updateProgressUI(100, totalBytes, totalBytes, 'Ready to install.');
    if (this.btnInstallNow) this.btnInstallNow.style.display = 'inline-flex';

    this.triggerInstall(this.apkDownloadUrl);
  }

  updateProgressUI(pct, loaded, total, statusText) {
    if (this.progressBar) this.progressBar.style.width = `${pct}%`;
    if (this.percentLabel) this.percentLabel.textContent = `${pct}%`;
    if (this.statusLabel) this.statusLabel.textContent = statusText;

    const loadedMB = (loaded / (1024 * 1024)).toFixed(1);
    const totalMB = (total / (1024 * 1024)).toFixed(1);
    if (this.sizeLabel) this.sizeLabel.textContent = `${loadedMB} MB / ${totalMB} MB`;
  }

  triggerInstall(downloadUrl) {
    if (!downloadUrl) return;

    if (window.app && window.app.showToast) {
      window.app.showToast('Opening update package...');
    }

    // Check Android native external URL opener
    if (window.AndroidMedia && typeof window.AndroidMedia.openExternalUrl === 'function') {
      window.AndroidMedia.openExternalUrl(downloadUrl);
      return;
    }

    try {
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.setAttribute('download', 'Etsuko.apk');
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      window.open(downloadUrl, '_system') || window.open(downloadUrl, '_blank');
    }
  }

  formatMarkdown(md) {
    if (!md) return '';
    return md
      .replace(/### (.*)/g, '<h4 style="color:#00f0ff;font-size:13px;margin:8px 0 4px;">$1</h4>')
      .replace(/## (.*)/g, '<h3 style="color:#fff;font-size:14px;margin:10px 0 4px;">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.1);padding:2px 4px;border-radius:4px;">$1</code>')
      .replace(/\n\n/g, '<br>')
      .replace(/\n- (.*)/g, '<div style="margin-left:8px;margin-bottom:2px;">• $1</div>')
      .replace(/\n/g, '<br>');
  }
}

// Global AppUpdater Singleton
if (typeof window !== 'undefined') {
  window.updater = new AppUpdater();
}
