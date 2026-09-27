// Etsuko Mobile Pure Audio Engine
// Direct HTML5 Audio, Background Playback, Native Lockscreen Notification & Playback Mode Controls

class MobilePlayer {
  constructor() {
    this.audio = document.getElementById('mobile-audio-engine') || new Audio();
    this.audio.setAttribute('playsinline', '');
    this.audio.setAttribute('webkit-playsinline', '');
    this.audio.preload = 'auto';

    this.currentTrack = null;
    this.queue = [];
    this.queueIndex = -1;
    this.isPlaying = false;
    this.userPaused = false;
    this.repeatMode = 0; // 0: off, 1: all, 2: one
    this.isShuffle = false;
    this.audioContext = null;

    this.initElements();
    this.initAudioEvents();
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
  }

  unlockAudioContext() {
    if (!this.audioContext) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioCtx();
      } catch (e) {}
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  initAudioEvents() {
    this.audio.addEventListener('play', () => this.onPlayState(true));
    this.audio.addEventListener('pause', () => this.onPlayState(false));
    this.audio.addEventListener('timeupdate', () => this.onTimeUpdate());
    this.audio.addEventListener('ended', () => this.onEnded());
    this.audio.addEventListener('error', (e) => this.onAudioError(e));

    // Scrubber drag / click handling
    if (this.scrubberTrack) {
      const doSeek = (e) => {
        const rect = this.scrubberTrack.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const pct = x / rect.width;

        if (this.scrubberFill) this.scrubberFill.style.width = `${pct * 100}%`;
        if (this.scrubberThumb) this.scrubberThumb.style.left = `${pct * 100}%`;

        if (this.audio.duration && !isNaN(this.audio.duration)) {
          this.audio.currentTime = this.audio.duration * pct;
        }
      };

      this.scrubberTrack.addEventListener('touchstart', (e) => doSeek(e), { passive: true });
      this.scrubberTrack.addEventListener('touchmove', (e) => doSeek(e), { passive: true });
      this.scrubberTrack.addEventListener('click', (e) => doSeek(e));
    }
  }

  initMediaSession() {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => this.togglePlay());
      navigator.mediaSession.setActionHandler('pause', () => this.togglePlay());
      navigator.mediaSession.setActionHandler('previoustrack', () => this.prev());
      navigator.mediaSession.setActionHandler('nexttrack', () => this.next());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime && this.audio.duration) {
          this.audio.currentTime = details.seekTime;
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
        title: track.title,
        artist: track.artist,
        album: track.album || 'Etsuko Neural Audio',
        artwork: [
          { src: track.thumbnail || 'assets/default_cover.png', sizes: '512x512', type: 'image/jpeg' }
        ]
      });
    }
  }

  updateNativeMedia(track, isPlaying) {
    if (window.AndroidMedia && window.AndroidMedia.updatePlaybackState) {
      try {
        window.AndroidMedia.updatePlaybackState(
          track.title || 'Unknown Title',
          track.artist || 'Unknown Artist',
          track.album || 'Etsuko Neural Audio',
          track.thumbnail || '',
          isPlaying
        );
      } catch (err) {
        console.warn('[Player] AndroidMedia bridge notice:', err);
      }
    }
  }

  async playTrack(track, queueList = null) {
    this.unlockAudioContext();

    if (queueList) {
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
    this.updateNativeMedia(track, true);

    try {
      let stream = track.streamUrl;

      // Check if track is downloaded offline first
      if (!stream && window.downloader) {
        const offline = await window.downloader.getOfflineTrack(track.videoId);
        if (offline && offline.streamUrl) {
          stream = offline.streamUrl;
          track.isOffline = true;
        }
      }

      // If not offline, resolve stream URL from neural resolver
      if (!stream && window.api && window.api.resolveAudioStream) {
        stream = await window.api.resolveAudioStream(track.videoId);
      }

      if (!stream) {
        throw new Error('Audio stream unavailable');
      }

      this.userPaused = false;
      this.audio.src = stream;
      await this.audio.play();
      this.onPlayState(true);
    } catch (err) {
      console.warn('[Player] Playback attempt error:', err);
      if (window.app && window.app.showToast) {
        window.app.showToast('Connecting audio stream...');
      }
      // Quick retry with fallback
      try {
        await new Promise(r => setTimeout(r, 600));
        await this.audio.play();
      } catch (e2) {}
    }

    window.dispatchEvent(new CustomEvent('etsuko:mobile-track-started', { detail: track }));
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
    if (this.sheetAlbum) this.sheetAlbum.textContent = track.isOffline ? '⚡ Offline Master' : (track.album || 'YouTube Music Master');

    if (this.sheetLikeBtn) {
      this.sheetLikeBtn.classList.toggle('liked', !!track.isLiked);
      const svg = this.sheetLikeBtn.querySelector('svg');
      if (svg) svg.setAttribute('fill', track.isLiked ? '#ec4899' : 'none');
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
    this.unlockAudioContext();
    if (!this.currentTrack) {
      if (this.queue.length > 0) this.playTrack(this.queue[0]);
      return;
    }

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

    if (this.queueIndex < this.queue.length - 1) {
      this.queueIndex++;
      this.playTrack(this.queue[this.queueIndex]);
    } else if (this.repeatMode === 1) {
      // Repeat All
      this.queueIndex = 0;
      this.playTrack(this.queue[0]);
    }
  }

  prev() {
    if (this.audio.currentTime > 3) {
      this.audio.currentTime = 0;
      return;
    }

    if (this.queueIndex > 0) {
      this.queueIndex--;
      this.playTrack(this.queue[this.queueIndex]);
    } else {
      this.audio.currentTime = 0;
    }
  }

  onEnded() {
    if (this.repeatMode === 2) {
      // Repeat One
      this.audio.currentTime = 0;
      this.audio.play().catch(() => {});
    } else {
      this.next();
    }
  }

  onAudioError(e) {
    console.warn('[Player] Audio error event:', e);
    if (!this.userPaused && this.queue.length > 1) {
      setTimeout(() => this.next(), 1000);
    }
  }

  onTimeUpdate() {
    if (!this.audio.duration || isNaN(this.audio.duration)) return;
    const cur = this.audio.currentTime;
    const dur = this.audio.duration;
    const pct = (cur / dur) * 100;

    if (this.miniProgress) this.miniProgress.style.width = `${pct}%`;
    if (this.scrubberFill) this.scrubberFill.style.width = `${pct}%`;
    if (this.scrubberThumb) this.scrubberThumb.style.left = `${pct}%`;
    if (this.timeCurrent) this.timeCurrent.textContent = this.formatTime(cur);
    if (this.timeTotal) this.timeTotal.textContent = this.formatTime(dur);

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
}

// Global Player Singleton
if (typeof window !== 'undefined') {
  window.player = new MobilePlayer();
}
