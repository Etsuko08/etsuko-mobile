// Etsuko Mobile Hybrid Audio Engine
// Dual Engine: Invisible 144p YouTube Player (100% Online Reliability) + HTML5 Audio (100% Offline Storage Playback)
// Spotify-Tier Background Persistence, Android MediaSession Lockscreen Scrubber & Native Notification Sync

// Prevent YouTube Iframe from pausing when screen is locked or app is minimized
try {
  Object.defineProperty(document, 'hidden', { get: () => false, configurable: true });
  Object.defineProperty(document, 'visibilityState', { get: () => 'visible', configurable: true });
  window.addEventListener('visibilitychange', (e) => {
    e.stopImmediatePropagation();
  }, true);
} catch (e) {}

class MobilePlayer {
  constructor() {
    this.audio = document.getElementById('mobile-audio-engine') || new Audio();
    this.audio.setAttribute('playsinline', '');
    this.audio.setAttribute('webkit-playsinline', '');
    this.audio.preload = 'auto';

    this.ytPlayer = null;
    this.ytReady = false;
    this.pendingVideoId = null;
    this.activeEngine = 'youtube'; // 'youtube' | 'audio'

    this.currentTrack = null;
    this.queue = [];
    this.queueIndex = -1;
    this.isPlaying = false;
    this.userPaused = false;
    this.repeatMode = 0; // 0: off, 1: all, 2: one
    this.isShuffle = false;
    this.timeUpdateTimer = null;
    this.lastProgressSync = 0;

    this.initElements();
    this.initAudioEvents();
    this.initYouTube();
    this.initMediaSession();
    this.initDownloadEvents();
  }

  initElements() {
    // Mini Player
    this.miniPlayer = document.getElementById('mini-player');
    this.miniCover = document.getElementById('mini-cover');
    this.miniTitle = document.getElementById('mini-title');
    this.miniArtist = document.getElementById('mini-artist');
    this.btnMiniPlay = document.getElementById('btn-mini-play');
    this.btnMiniNext = document.getElementById('btn-mini-next');
    this.iconMiniPlay = document.getElementById('icon-mini-play');
    this.iconMiniPause = document.getElementById('icon-mini-pause');
    this.miniProgress = document.getElementById('mini-progress-bar');

    // Full Player Sheet
    this.playerSheet = document.getElementById('player-sheet');
    this.sheetCover = document.getElementById('sheet-cover');
    this.sheetTitle = document.getElementById('sheet-title');
    this.sheetArtist = document.getElementById('sheet-artist');
    this.sheetAlbum = document.getElementById('sheet-album');
    this.sheetLikeBtn = document.getElementById('sheet-like-btn');
    this.sheetDownloadBtn = document.getElementById('sheet-download-btn');

    this.btnSheetPlay = document.getElementById('btn-sheet-play');
    this.iconSheetPlay = document.getElementById('icon-sheet-play');
    this.iconSheetPause = document.getElementById('icon-sheet-pause');
    this.btnSheetPrev = document.getElementById('btn-sheet-prev');
    this.btnSheetNext = document.getElementById('btn-sheet-next');
    this.btnSheetShuffle = document.getElementById('btn-sheet-shuffle');
    this.btnSheetRepeat = document.getElementById('btn-sheet-repeat');
    this.repeatBadge = document.getElementById('sheet-repeat-badge');

    this.timeCurrent = document.getElementById('sheet-time-current');
    this.timeTotal = document.getElementById('sheet-time-total');
    this.scrubberTrack = document.getElementById('sheet-scrubber-track');
    this.scrubberFill = document.getElementById('sheet-scrubber-fill');
    this.scrubberThumb = document.getElementById('sheet-scrubber-thumb');

    // Controls listeners
    if (this.btnMiniPlay) this.btnMiniPlay.addEventListener('click', (e) => { e.stopPropagation(); this.togglePlay(); });
    if (this.btnMiniNext) this.btnMiniNext.addEventListener('click', (e) => { e.stopPropagation(); this.next(); });
    if (this.btnSheetPlay) this.btnSheetPlay.addEventListener('click', () => this.togglePlay());
    if (this.btnSheetPrev) this.btnSheetPrev.addEventListener('click', () => this.prev());
    if (this.btnSheetNext) this.btnSheetNext.addEventListener('click', () => this.next());
    if (this.btnSheetShuffle) this.btnSheetShuffle.addEventListener('click', () => this.toggleShuffle());
    if (this.btnSheetRepeat) this.btnSheetRepeat.addEventListener('click', () => this.toggleRepeat());

    if (this.sheetDownloadBtn) {
      this.sheetDownloadBtn.addEventListener('click', () => {
        if (this.currentTrack && window.downloader) {
          window.downloader.startDownload(this.currentTrack);
        }
      });
    }

    // Scrubber drag / click handling
    if (this.scrubberTrack) {
      const doSeek = (e) => {
        const rect = this.scrubberTrack.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const pct = x / rect.width;

        if (this.scrubberFill) this.scrubberFill.style.width = `${pct * 100}%`;
        if (this.scrubberThumb) this.scrubberThumb.style.left = `${pct * 100}%`;

        const dur = this.getDuration();
        if (dur > 0) {
          this.seekTo(dur * pct);
        }
      };

      this.scrubberTrack.addEventListener('touchstart', (e) => doSeek(e), { passive: true });
      this.scrubberTrack.addEventListener('touchmove', (e) => doSeek(e), { passive: true });
      this.scrubberTrack.addEventListener('click', (e) => doSeek(e));
    }
  }

  initYouTube() {
    const setupYT = () => {
      let carrier = document.getElementById('yt-player');
      if (!carrier) {
        const container = document.createElement('div');
        container.id = 'yt-audio-carrier';
        container.style.cssText = 'position: absolute; width: 1px; height: 1px; opacity: 0.001; pointer-events: none; left: -9999px; overflow: hidden;';
        container.innerHTML = '<div id="yt-player"></div>';
        document.body.appendChild(container);
        carrier = document.getElementById('yt-player');
      }

      if (window.YT && window.YT.Player) {
        try {
          this.ytPlayer = new window.YT.Player('yt-player', {
            height: '1',
            width: '1',
            playerVars: {
              autoplay: 1,
              controls: 0,
              disablekb: 1,
              fs: 0,
              playsinline: 1,
              rel: 0,
              modestbranding: 1,
              iv_load_policy: 3,
              enablejsapi: 1,
              origin: window.location.origin
            },
            events: {
              onReady: () => {
                this.ytReady = true;
                console.log('[Etsuko] YouTube Neural Stream Engine online');
                if (this.pendingVideoId) {
                  const vid = this.pendingVideoId;
                  this.pendingVideoId = null;
                  this.playYouTubeTrack(vid);
                }
              },
              onStateChange: (e) => this.onYTStateChange(e),
              onError: (e) => this.onYTError(e)
            }
          });
        } catch (e) {
          console.warn('[Etsuko] YouTube init notice:', e);
        }
      }
    };

    if (window.YT && window.YT.Player) {
      setupYT();
    } else {
      window.onYouTubeIframeAPIReady = setupYT;
      if (!document.getElementById('yt-iframe-api-script')) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }
    }
  }

  onYTStateChange(event) {
    // 1: playing, 2: paused, 0: ended, 3: buffering
    if (event.data === 1) { // Playing
      if (this.ytPlayer && this.ytPlayer.setPlaybackQuality) {
        try { this.ytPlayer.setPlaybackQuality('small'); } catch (e) {} // 144p bandwidth saving
      }
      this.onPlayState(true);
      this.startTimeTicker();
    } else if (event.data === 2) { // Paused
      this.onPlayState(false);
      this.stopTimeTicker();
    } else if (event.data === 0) { // Ended
      this.onEnded();
    }
  }

  onYTError(e) {
    console.warn('[Player] YouTube stream code:', e.data);
    this.onPlayState(false);
    if (window.app && window.app.showToast) {
      window.app.showToast('Connecting audio stream...');
    }
  }

  initAudioEvents() {
    this.audio.addEventListener('play', () => {
      this.onPlayState(true);
      this.startTimeTicker();
    });
    this.audio.addEventListener('pause', () => {
      this.onPlayState(false);
      this.stopTimeTicker();
    });
    this.audio.addEventListener('ended', () => this.onEnded());
    this.audio.addEventListener('error', (e) => {
      console.warn('[Player] HTML5 audio error:', e);
      this.onPlayState(false);
    });
  }

  initMediaSession() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => this.togglePlay());
      navigator.mediaSession.setActionHandler('pause', () => this.togglePlay());
      navigator.mediaSession.setActionHandler('previoustrack', () => this.prev());
      navigator.mediaSession.setActionHandler('nexttrack', () => this.next());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime) {
          this.seekTo(details.seekTime);
        }
      });
    }
  }

  initDownloadEvents() {
    window.addEventListener('etsuko:download-complete', (e) => {
      const track = e.detail?.track;
      if (this.currentTrack && track && this.currentTrack.videoId === track.videoId) {
        this.updateDownloadButtonState(true);
      }
    });

    window.addEventListener('etsuko:download-deleted', (e) => {
      const vid = e.detail?.videoId;
      if (this.currentTrack && this.currentTrack.videoId === vid) {
        this.updateDownloadButtonState(false);
      }
    });
  }

  updateMediaSession(track) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title || 'Unknown Title',
        artist: track.artist || 'Unknown Artist',
        album: track.album || 'Etsuko Neural Audio',
        artwork: [
          { src: track.thumbnail || 'assets/default_cover.png', sizes: '512x512', type: 'image/jpeg' }
        ]
      });
    }
  }

  updateNativeMedia(track, isPlaying) {
    if (window.AndroidMedia) {
      try {
        const cur = this.getCurrentTime();
        const dur = this.getDuration();
        if (window.AndroidMedia.updatePlaybackState) {
          window.AndroidMedia.updatePlaybackState(
            track.title || 'Unknown Title',
            track.artist || 'Unknown Artist',
            track.album || 'Etsuko Neural Audio',
            track.thumbnail || '',
            isPlaying,
            cur,
            dur
          );
        }
      } catch (err) {
        console.warn('[Player] AndroidMedia bridge notice:', err);
      }
    }
  }

  async playTrack(track, queueList = null) {
    if (!track) return;

    if (queueList && Array.isArray(queueList)) {
      this.queue = [...queueList];
      this.queueIndex = this.queue.findIndex(t => t.videoId === track.videoId);
      if (this.queueIndex === -1) {
        this.queue.unshift(track);
        this.queueIndex = 0;
      }
    } else if (this.queueIndex === -1 || (this.queue[this.queueIndex] && this.queue[this.queueIndex].videoId !== track.videoId)) {
      this.queue = [track];
      this.queueIndex = 0;
    }

    this.currentTrack = track;
    this.updateTrackUI(track);
    this.updateMediaSession(track);

    // Save to recents in localStorage
    this.recordRecentTrack(track);

    // 1. Check if track is available in Offline Storage
    let offlineTrack = null;
    if (window.downloader) {
      try {
        offlineTrack = await window.downloader.getOfflineTrack(track.videoId);
      } catch (e) {}
    }

    if (offlineTrack && offlineTrack.streamUrl) {
      // Offline Playback Engine
      this.activeEngine = 'audio';
      if (this.ytReady && this.ytPlayer && this.ytPlayer.pauseVideo) {
        try { this.ytPlayer.pauseVideo(); } catch (e) {}
      }

      track.isOffline = true;
      this.userPaused = false;
      this.audio.src = offlineTrack.streamUrl;
      this.audio.currentTime = 0;
      this.audio.play().catch(() => {});
      this.onPlayState(true);
      this.updateNativeMedia(track, true);
    } else {
      // Online Invisible 144p YouTube Engine
      this.activeEngine = 'youtube';
      try { this.audio.pause(); } catch (e) {}

      track.isOffline = false;
      this.userPaused = false;
      this.playYouTubeTrack(track.videoId);
      this.updateNativeMedia(track, true);
    }

    window.dispatchEvent(new CustomEvent('etsuko:mobile-track-started', { detail: track }));
  }

  playYouTubeTrack(videoId) {
    if (!this.ytReady || !this.ytPlayer || !this.ytPlayer.loadVideoById) {
      this.pendingVideoId = videoId;
      return;
    }

    try {
      this.userPaused = false;
      this.ytPlayer.loadVideoById({
        videoId: videoId,
        startSeconds: 0
      });
      if (this.ytPlayer.setPlaybackQuality) {
        try { this.ytPlayer.setPlaybackQuality('small'); } catch (e) {}
      }
      this.ytPlayer.playVideo();
      this.onPlayState(true);
    } catch (e) {
      console.warn('[Player] YouTube stream launch notice:', e);
    }
  }

  updateTrackUI(track) {
    const thumb = track.thumbnail || 'assets/default_cover.png';
    const title = track.title || 'Unknown Title';
    const artist = track.artist || 'Unknown Artist';

    // Mini Player
    if (this.miniCover) this.miniCover.src = thumb;
    if (this.miniTitle) this.miniTitle.textContent = title;
    if (this.miniArtist) this.miniArtist.textContent = artist;
    if (this.miniPlayer) this.miniPlayer.style.display = 'flex';

    // Full Player Sheet (Pure Album Art Cover, ZERO Video UI)
    if (this.sheetCover) {
      this.sheetCover.src = thumb;
      this.sheetCover.style.opacity = '1';
    }

    if (this.sheetTitle) this.sheetTitle.textContent = title;
    if (this.sheetArtist) this.sheetArtist.textContent = artist;
    if (this.sheetAlbum) this.sheetAlbum.textContent = track.isOffline ? '⚡ Offline Master' : (track.album || 'Etsuko Master');

    if (this.sheetLikeBtn) {
      const isLiked = window.api ? window.api.isLiked(track.videoId) : !!track.isLiked;
      this.sheetLikeBtn.classList.toggle('liked', isLiked);
      const svg = this.sheetLikeBtn.querySelector('svg');
      if (svg) svg.setAttribute('fill', isLiked ? '#ec4899' : 'none');
    }

    // Update Download Button State
    if (window.downloader) {
      window.downloader.isDownloaded(track.videoId).then(isDl => {
        this.updateDownloadButtonState(isDl);
      });
    }
  }

  updateDownloadButtonState(isDownloaded) {
    if (!this.sheetDownloadBtn) return;
    this.sheetDownloadBtn.classList.toggle('downloaded', isDownloaded);
    const svg = this.sheetDownloadBtn.querySelector('svg');
    if (svg) {
      if (isDownloaded) {
        svg.innerHTML = '<path d="M20 6L9 17l-5-5"></path>';
        this.sheetDownloadBtn.style.color = '#10b981';
      } else {
        svg.innerHTML = '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>';
        this.sheetDownloadBtn.style.color = 'var(--text-sub)';
      }
    }
  }

  togglePlay() {
    if (!this.currentTrack) {
      if (this.queue.length > 0) this.playTrack(this.queue[0]);
      return;
    }

    if (this.activeEngine === 'youtube') {
      if (this.ytReady && this.ytPlayer && this.ytPlayer.getPlayerState) {
        const state = this.ytPlayer.getPlayerState();
        if (state === 1) { // Currently playing
          this.userPaused = true;
          this.ytPlayer.pauseVideo();
          this.onPlayState(false);
        } else {
          this.userPaused = false;
          this.ytPlayer.playVideo();
          this.onPlayState(true);
        }
      }
    } else {
      if (this.audio.paused) {
        this.userPaused = false;
        this.audio.play().catch(() => {});
        this.onPlayState(true);
      } else {
        this.userPaused = true;
        this.audio.pause();
        this.onPlayState(false);
      }
    }
  }

  onPlayState(playing) {
    this.isPlaying = playing;
    if (this.iconMiniPlay) this.iconMiniPlay.style.display = playing ? 'none' : 'block';
    if (this.iconMiniPause) this.iconMiniPause.style.display = playing ? 'block' : 'none';
    if (this.iconSheetPlay) this.iconSheetPlay.style.display = playing ? 'none' : 'block';
    if (this.iconSheetPause) this.iconSheetPause.style.display = playing ? 'block' : 'none';

    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
    }

    if (this.currentTrack) {
      this.updateNativeMedia(this.currentTrack, playing);
    }
  }

  next() {
    if (this.queue.length === 0) return;

    if (this.isShuffle) {
      let randIdx = Math.floor(Math.random() * this.queue.length);
      if (this.queue.length > 1 && randIdx === this.queueIndex) {
        randIdx = (randIdx + 1) % this.queue.length;
      }
      this.queueIndex = randIdx;
      this.playTrack(this.queue[this.queueIndex]);
      return;
    }

    // Play next strictly in sequential order (1 -> 2 -> 3...)
    if (this.queueIndex < this.queue.length - 1) {
      this.queueIndex++;
      this.playTrack(this.queue[this.queueIndex]);
    } else if (this.repeatMode === 1) {
      // Repeat All: restart playlist from beginning
      this.queueIndex = 0;
      this.playTrack(this.queue[0]);
    }
  }

  prev() {
    const cur = this.getCurrentTime();
    if (cur > 3) {
      this.seekTo(0);
      return;
    }

    if (this.queueIndex > 0) {
      this.queueIndex--;
      this.playTrack(this.queue[this.queueIndex]);
    } else {
      this.seekTo(0);
    }
  }

  onEnded() {
    if (this.repeatMode === 2) {
      // Repeat One
      this.seekTo(0);
      if (this.activeEngine === 'youtube' && this.ytPlayer && this.ytPlayer.playVideo) {
        this.ytPlayer.playVideo();
      } else {
        this.audio.play().catch(() => {});
      }
    } else {
      this.next();
    }
  }

  seekTo(seconds) {
    if (this.activeEngine === 'youtube' && this.ytReady && this.ytPlayer && this.ytPlayer.seekTo) {
      this.ytPlayer.seekTo(seconds, true);
    } else if (this.audio) {
      this.audio.currentTime = seconds;
    }
  }

  seekToMs(posMs) {
    this.seekTo(posMs / 1000);
  }

  getCurrentTime() {
    if (this.activeEngine === 'youtube' && this.ytReady && this.ytPlayer && this.ytPlayer.getCurrentTime) {
      try { return this.ytPlayer.getCurrentTime() || 0; } catch (e) { return 0; }
    }
    return this.audio.currentTime || 0;
  }

  getDuration() {
    if (this.activeEngine === 'youtube' && this.ytReady && this.ytPlayer && this.ytPlayer.getDuration) {
      try { return this.ytPlayer.getDuration() || 0; } catch (e) { return 0; }
    }
    return this.audio.duration || 0;
  }

  startTimeTicker() {
    this.stopTimeTicker();
    this.timeUpdateTimer = setInterval(() => {
      this.onTimeUpdate();
    }, 400);
  }

  stopTimeTicker() {
    if (this.timeUpdateTimer) {
      clearInterval(this.timeUpdateTimer);
      this.timeUpdateTimer = null;
    }
  }

  onTimeUpdate() {
    const cur = this.getCurrentTime();
    const dur = this.getDuration();
    if (!dur || isNaN(dur) || dur <= 0) return;

    const pct = Math.min(100, (cur / dur) * 100);

    if (this.miniProgress) this.miniProgress.style.width = `${pct}%`;
    if (this.scrubberFill) this.scrubberFill.style.width = `${pct}%`;
    if (this.scrubberThumb) this.scrubberThumb.style.left = `${pct}%`;
    if (this.timeCurrent) this.timeCurrent.textContent = this.formatTime(cur);
    if (this.timeTotal) this.timeTotal.textContent = this.formatTime(dur);

    // Sync Android MediaSession progress every 1.5 seconds to keep lockscreen seekbar accurate
    const now = performance.now();
    if (now - this.lastProgressSync >= 1500) {
      this.lastProgressSync = now;
      if (window.AndroidMedia && window.AndroidMedia.updateProgress) {
        window.AndroidMedia.updateProgress(cur, dur, this.isPlaying);
      }
    }

    window.dispatchEvent(new CustomEvent('etsuko:mobile-time-update', {
      detail: { currentTime: cur, duration: dur }
    }));
  }

  formatTime(secs) {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  toggleRepeat() {
    this.repeatMode = (this.repeatMode + 1) % 3;
    if (this.btnSheetRepeat && this.repeatBadge) {
      if (this.repeatMode === 0) {
        this.repeatBadge.textContent = '';
        this.btnSheetRepeat.classList.remove('active');
        if (window.app && window.app.showToast) window.app.showToast('Repeat Off');
      } else if (this.repeatMode === 1) {
        this.repeatBadge.textContent = 'ALL';
        this.btnSheetRepeat.classList.add('active');
        if (window.app && window.app.showToast) window.app.showToast('Repeat All');
      } else {
        this.repeatBadge.textContent = '1';
        this.btnSheetRepeat.classList.add('active');
        if (window.app && window.app.showToast) window.app.showToast('Repeat One');
      }
    }
  }

  toggleShuffle() {
    this.isShuffle = !this.isShuffle;
    if (this.btnSheetShuffle) {
      this.btnSheetShuffle.classList.toggle('active', this.isShuffle);
      if (window.app && window.app.showToast) {
        window.app.showToast(this.isShuffle ? 'Shuffle On' : 'Shuffle Off');
      }
    }
  }

  recordRecentTrack(track) {
    try {
      const key = 'etsuko_recent_tracks';
      const raw = localStorage.getItem(key);
      let list = raw ? JSON.parse(raw) : [];
      list = list.filter(t => t.videoId !== track.videoId);
      list.unshift(track);
      if (list.length > 20) list = list.slice(0, 20);
      localStorage.setItem(key, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('etsuko:recents-updated', { detail: list }));
    } catch (e) {}
  }
}

// Global Player Singleton
if (typeof window !== 'undefined') {
  window.player = new MobilePlayer();
}
