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
  window.addEventListener('blur', () => {
    if (window.player && window.player.isPlaying && !window.player.userPaused) {
      setTimeout(() => {
        if (window.player.isPlaying && !window.player.userPaused && window.player.ytPlayer && typeof window.player.ytPlayer.playVideo === 'function') {
          try { window.player.ytPlayer.playVideo(); } catch (e) {}
        }
      }, 100);
    }
  });
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
    this.silentAudio = null;

    this.initElements();
    this.initAudioEvents();
    this.initSilentAudio();
    this.initYouTube();
    this.initMediaSession();
    this.initDownloadEvents();
    this.initWatchdog();
  }

  initSilentAudio() {
    try {
      const silentWav = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      this.silentAudio = new Audio(silentWav);
      this.silentAudio.loop = true;
      this.silentAudio.volume = 0.01;
      this.silentAudio.setAttribute('playsinline', '');
      this.silentAudio.setAttribute('webkit-playsinline', '');
    } catch (e) {}
  }

  startSilentAudio() {
    try {
      if (!this.silentAudio) this.initSilentAudio();
      if (this.silentAudio && this.silentAudio.paused) {
        this.silentAudio.play().catch(() => {});
      }
    } catch (e) {}
  }

  stopSilentAudio() {
    try {
      if (this.silentAudio && !this.silentAudio.paused) {
        this.silentAudio.pause();
      }
    } catch (e) {}
  }

  initWatchdog() {
    setInterval(() => {
      if (this.isPlaying && !this.userPaused) {
        if (this.activeEngine === 'youtube' && this.ytReady && this.ytPlayer && typeof this.ytPlayer.getPlayerState === 'function') {
          try {
            const st = this.ytPlayer.getPlayerState();
            if (st === 2) { // Paused unexpectedly in background
              this.ytPlayer.playVideo();
            }
          } catch (e) {}
        } else if (this.activeEngine === 'audio' && this.audio && this.audio.paused) {
          this.audio.play().catch(() => {});
        }
        this.startSilentAudio();
      }
    }, 1000);
  }

  initElements() {
    // Mini Player
    this.miniPlayer = document.getElementById('mini-player');
    this.miniCover = document.getElementById('mini-cover');
    this.miniTitle = document.getElementById('mini-title');
    this.miniArtist = document.getElementById('mini-artist');
    this.btnMiniLike = document.getElementById('btn-mini-like');
    this.btnMiniDownload = document.getElementById('btn-mini-download');
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

    // Queue section in Sheet
    this.sheetQueueSection = document.getElementById('sheet-queue-section');
    this.sheetQueueCount = document.getElementById('sheet-queue-count');
    this.sheetQueueList = document.getElementById('sheet-queue-list');
    this.btnClearQueue = document.getElementById('btn-clear-queue');

    // Lyrics section in Sheet
    this.sheetLyricsSection = document.getElementById('sheet-lyrics-section');
    this.sheetLyricsStatus = document.getElementById('sheet-lyrics-status');
    this.sheetLyricsContainer = document.getElementById('sheet-lyrics-container');
    this.sheetLyricsFollowBtn = document.getElementById('sheet-lyrics-follow-btn');
    this.currentLyricsData = null;
    this.lastActiveLyricIdx = -1;
    this.userScrolledLyrics = false;
    this.lyricsScrollTimeout = null;

    // Related section in Sheet (Spotify Style)
    this.sheetRelatedSection = document.getElementById('sheet-related-section');
    this.sheetRelatedTag = document.getElementById('sheet-related-tag');
    this.sheetRelatedList = document.getElementById('sheet-related-list');

    this.timeCurrent = document.getElementById('sheet-time-current');
    this.timeTotal = document.getElementById('sheet-time-total');
    this.scrubberTrack = document.getElementById('sheet-scrubber-track');
    this.scrubberFill = document.getElementById('sheet-scrubber-fill');
    this.scrubberThumb = document.getElementById('sheet-scrubber-thumb');

    // Mini Player Tapping opens Sheet Player
    if (this.miniPlayer) {
      this.miniPlayer.addEventListener('click', (e) => {
        if (e.target.closest('.btn-mini-control')) return;
        if (window.app && typeof window.app.openPlayerSheet === 'function') {
          window.app.openPlayerSheet();
        }
      });
    }

    // Mini Controls listeners
    if (this.btnMiniLike) {
      this.btnMiniLike.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.currentTrack && window.api) {
          const isNowLiked = window.api.toggleLike(this.currentTrack);
          this.updateLikeButtonState(isNowLiked);
          if (window.app && window.app.showToast) {
            window.app.showToast(isNowLiked ? 'Added to Liked Songs' : 'Removed from Liked Songs');
          }
        }
      });
    }

    if (this.btnMiniDownload) {
      this.btnMiniDownload.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.currentTrack && window.downloader) {
          this.btnMiniDownload.classList.add('downloading-pulse');
          this.btnMiniDownload.style.transform = 'scale(0.78)';
          setTimeout(() => { this.btnMiniDownload.style.transform = 'scale(1.25)'; }, 140);
          setTimeout(() => { this.btnMiniDownload.style.transform = 'scale(1.0)'; }, 280);
          if (window.app && window.app.showToast) {
            window.app.showToast(`Starting download: ${this.currentTrack.title}`);
          }
          window.downloader.startDownload(this.currentTrack);
        }
      });
    }

    if (this.btnMiniPlay) this.btnMiniPlay.addEventListener('click', (e) => { e.stopPropagation(); this.togglePlay(); });
    if (this.btnMiniNext) this.btnMiniNext.addEventListener('click', (e) => { e.stopPropagation(); this.next(); });

    // Sheet Controls listeners
    if (this.btnSheetPlay) this.btnSheetPlay.addEventListener('click', () => this.togglePlay());
    if (this.btnSheetPrev) this.btnSheetPrev.addEventListener('click', () => this.prev());
    if (this.btnSheetNext) this.btnSheetNext.addEventListener('click', () => this.next());
    if (this.btnSheetShuffle) this.btnSheetShuffle.addEventListener('click', () => this.toggleShuffle());
    if (this.btnSheetRepeat) this.btnSheetRepeat.addEventListener('click', () => this.toggleRepeat());
    if (this.btnClearQueue) this.btnClearQueue.addEventListener('click', () => this.clearUpcomingQueue());

    if (this.sheetLikeBtn) {
      this.sheetLikeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.currentTrack && window.api) {
          const isNowLiked = window.api.toggleLike(this.currentTrack);
          this.updateLikeButtonState(isNowLiked);
          if (window.app && window.app.showToast) {
            window.app.showToast(isNowLiked ? 'Added to Liked Songs' : 'Removed from Liked Songs');
          }
        }
      });
    }

    if (this.sheetDownloadBtn) {
      this.sheetDownloadBtn.addEventListener('click', () => {
        if (this.currentTrack && window.downloader) {
          this.sheetDownloadBtn.classList.add('downloading-pulse');
          this.sheetDownloadBtn.style.transform = 'scale(0.78)';
          setTimeout(() => { this.sheetDownloadBtn.style.transform = 'scale(1.25)'; }, 140);
          setTimeout(() => { this.sheetDownloadBtn.style.transform = 'scale(1.0)'; }, 280);
          if (window.app && window.app.showToast) {
            window.app.showToast(`Starting download: ${this.currentTrack.title}`);
          }
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

    // Lyrics container touch/scroll detection (pauses auto-scroll until Follow is tapped)
    if (this.sheetLyricsContainer) {
      const handleUserLyricsScroll = () => {
        if (!this.currentLyricsData || this.currentLyricsData.type !== 'synced') return;
        this.userScrolledLyrics = true;
        if (this.sheetLyricsFollowBtn) this.sheetLyricsFollowBtn.style.display = 'inline-flex';
        clearTimeout(this.lyricsScrollTimeout);
        this.lyricsScrollTimeout = setTimeout(() => {
          this.userScrolledLyrics = false;
          if (this.sheetLyricsFollowBtn) this.sheetLyricsFollowBtn.style.display = 'none';
          this.scrollToActiveLyric();
        }, 8000);
      };

      this.sheetLyricsContainer.addEventListener('touchstart', handleUserLyricsScroll, { passive: true });
      this.sheetLyricsContainer.addEventListener('wheel', handleUserLyricsScroll, { passive: true });
    }

    if (this.sheetLyricsFollowBtn) {
      this.sheetLyricsFollowBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.userScrolledLyrics = false;
        clearTimeout(this.lyricsScrollTimeout);
        this.sheetLyricsFollowBtn.style.display = 'none';
        this.scrollToActiveLyric();
      });
    }
  }

  initYouTube() {
    const setupYT = () => {
      let carrier = document.getElementById('yt-player');
      if (!carrier) {
        const container = document.createElement('div');
        container.id = 'yt-audio-carrier';
        container.style.cssText = 'position: fixed; bottom: 0; right: 0; width: 48px; height: 48px; opacity: 0.01; pointer-events: none; z-index: 1; overflow: hidden;';
        container.innerHTML = '<div id="yt-player"></div>';
        document.body.appendChild(container);
        carrier = document.getElementById('yt-player');
      }

      if (window.YT && window.YT.Player) {
        try {
          this.ytPlayer = new window.YT.Player('yt-player', {
            height: '48',
            width: '48',
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
              origin: window.location.origin || 'http://localhost'
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
      this.userPaused = false;
      this.onPlayState(true);
      this.startTimeTicker();
    } else if (event.data === 2) { // Paused
      if (this.isPlaying && !this.userPaused) {
        // Intercept involuntary background auto-pause triggered by Android minimize or screen off
        setTimeout(() => {
          if (this.isPlaying && !this.userPaused && this.ytPlayer && typeof this.ytPlayer.playVideo === 'function') {
            try { this.ytPlayer.playVideo(); } catch (e) {}
          }
        }, 80);
        return;
      }
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
    if (!track || !track.videoId) return;

    this._playRequestId = (this._playRequestId || 0) + 1;
    const currentReq = this._playRequestId;

    // Automatically expand full player sheet like Spotify whenever any track starts
    if (window.app && typeof window.app.openPlayerSheet === 'function') {
      window.app.openPlayerSheet();
    }

    this.userScrolledLyrics = false;
    clearTimeout(this.lyricsScrollTimeout);
    if (this.sheetLyricsFollowBtn) this.sheetLyricsFollowBtn.style.display = 'none';

    if (queueList && Array.isArray(queueList)) {
      this.queue = this.filterQueueDuplicates(queueList, track);
      this.queueIndex = this.queue.findIndex(t => t.videoId === track.videoId);
      if (this.queueIndex === -1) {
        this.queue.unshift(track);
        this.queueIndex = 0;
      }
    } else if (this.queue && this.queue.length > 0) {
      const existingIdx = this.queue.findIndex(t => t.videoId === track.videoId);
      if (existingIdx !== -1) {
        this.queueIndex = existingIdx;
      } else {
        this.queue.push(track);
        this.queueIndex = this.queue.length - 1;
      }
    } else {
      this.queue = [track];
      this.queueIndex = 0;
    }

    // Auto-populate upcoming queue with intelligent diverse recommendations if upcoming queue is empty
    if (this.queue.length - 1 <= this.queueIndex) {
      this.populateSmartUpcomingQueue(track);
    }

    this.currentTrack = track;
    this.updateTrackUI(track);
    this.updateMediaSession(track);
    this.renderQueueInSheet();
    this.loadRelatedTracks(track);
    this.loadLyrics(track);
    this.updateSheetAtmosphere(track);

    // Save to recents in localStorage
    this.recordRecentTrack(track);

    // 1. Check if track is available in Offline Storage
    let offlineTrack = null;
    if (window.downloader) {
      try {
        offlineTrack = await window.downloader.getOfflineTrack(track.videoId);
      } catch (e) {}
    }

    // Guard against race conditions when another track is selected during async check
    if (this._playRequestId !== currentReq) {
      return;
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
    if (!videoId) return;
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
    if (this.miniCover) {
      this.miniCover.onerror = () => {
        this.miniCover.onerror = () => { this.miniCover.src = 'assets/default_cover.png'; };
        if (track.videoId) {
          this.miniCover.src = `https://i.ytimg.com/vi/${track.videoId}/hqdefault.jpg`;
        } else {
          this.miniCover.src = 'assets/default_cover.png';
        }
      };
      this.miniCover.src = thumb;
    }
    if (this.miniTitle) this.miniTitle.textContent = title;
    if (this.miniArtist) this.miniArtist.textContent = artist;
    if (this.miniPlayer) this.miniPlayer.style.display = 'flex';

    // Full Player Sheet (Pure Album Art Cover, ZERO Video UI)
    if (this.sheetCover) {
      this.sheetCover.onerror = () => {
        this.sheetCover.onerror = () => { this.sheetCover.src = 'assets/default_cover.png'; };
        if (track.videoId) {
          this.sheetCover.src = `https://i.ytimg.com/vi/${track.videoId}/hqdefault.jpg`;
        } else {
          this.sheetCover.src = 'assets/default_cover.png';
        }
      };
      this.sheetCover.src = thumb;
      this.sheetCover.style.opacity = '1';
    }

    if (this.sheetTitle) this.sheetTitle.textContent = title;
    if (this.sheetArtist) this.sheetArtist.textContent = artist;
    if (this.sheetAlbum) this.sheetAlbum.textContent = track.isOffline ? '⚡ Offline Master' : (track.album || 'Etsuko Master');

    const isLiked = window.api ? window.api.isLiked(track.videoId) : !!track.isLiked;
    this.updateLikeButtonState(isLiked);

    // Update Download Button State
    if (window.downloader) {
      window.downloader.isDownloaded(track.videoId).then(isDl => {
        this.updateDownloadButtonState(isDl);
      });
    }
  }

  updateLikeButtonState(isLiked) {
    const applyLike = (btn) => {
      if (!btn) return;
      btn.classList.toggle('liked', isLiked);
      const svg = btn.querySelector('svg');
      if (svg) svg.setAttribute('fill', isLiked ? '#ec4899' : 'none');
    };
    applyLike(this.sheetLikeBtn);
    applyLike(this.btnMiniLike);
  }

  updateDownloadButtonState(isDownloaded) {
    const updateBtn = (btn) => {
      if (!btn) return;
      btn.classList.toggle('downloaded', isDownloaded);
      const svg = btn.querySelector('svg');
      if (svg) {
        if (isDownloaded) {
          svg.innerHTML = '<path d="M20 6L9 17l-5-5"></path>';
          btn.style.color = '#10b981';
        } else {
          svg.innerHTML = '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>';
          btn.style.color = 'var(--text-sub)';
        }
      }
    };
    updateBtn(this.sheetDownloadBtn);
    updateBtn(this.btnMiniDownload);
  }

  renderQueueInSheet() {
    if (!this.sheetQueueList) return;
    this.sheetQueueList.innerHTML = '';

    if (!this.queue || this.queue.length === 0) {
      if (this.sheetQueueCount) this.sheetQueueCount.textContent = '0 tracks';
      return;
    }

    if (this.sheetQueueCount) {
      this.sheetQueueCount.textContent = `${this.queue.length} track${this.queue.length === 1 ? '' : 's'}`;
    }

    this.queue.forEach((track, idx) => {
      const isCurrent = idx === this.queueIndex;
      const item = document.createElement('div');
      item.className = `sheet-queue-item${isCurrent ? ' current' : ''}`;
      item.innerHTML = `
        <img src="${track.thumbnail || 'assets/default_cover.png'}" class="sheet-queue-item-thumb" alt="" onerror="this.onerror=function(){this.src='assets/default_cover.png'}; if ('${track.videoId}') this.src='https://i.ytimg.com/vi/${track.videoId}/hqdefault.jpg'; else this.src='assets/default_cover.png';">
        <div class="sheet-queue-item-info">
          <div class="sheet-queue-item-title" style="color: ${isCurrent ? 'var(--accent-cyan)' : '#fff'};">${track.title || 'Unknown Title'}</div>
          <div class="sheet-queue-item-artist">${track.artist || 'Unknown Artist'}</div>
        </div>
        ${isCurrent ? '<span style="font-size: 10px; font-weight: 700; color: var(--accent-cyan); text-transform: uppercase;">NOW</span>' : ''}
      `;

      item.addEventListener('click', () => {
        this.queueIndex = idx;
        this.playTrack(this.queue[idx]);
      });

      this.sheetQueueList.appendChild(item);
    });
  }

  async loadRelatedTracks(track) {
    if (!this.sheetRelatedList) return;
    this._relatedRequestId = (this._relatedRequestId || 0) + 1;
    const currentReq = this._relatedRequestId;

    this.sheetRelatedList.innerHTML = `
      <div style="padding: 12px; text-align: center; color: var(--text-muted); font-size: 11px;">
        <span style="color: var(--accent-cyan); font-weight: 700;">⚡ FINDING SIMILAR TRACKS...</span>
      </div>
    `;

    try {
      if (window.api && typeof window.api.getRelatedTracks === 'function') {
        const data = await window.api.getRelatedTracks(track);
        if (this._relatedRequestId !== currentReq) return;
        if (this.sheetRelatedTag && data.displayTag) {
          this.sheetRelatedTag.textContent = `${data.displayTag}`;
        }
        this.renderRelatedTracksList(data.tracks || []);
      }
    } catch (e) {
      console.warn('[Player] loadRelatedTracks notice:', e);
    }
  }

  renderRelatedTracksList(tracks) {
    if (!this.sheetRelatedList) return;
    this.sheetRelatedList.innerHTML = '';

    if (!tracks || tracks.length === 0) {
      this.sheetRelatedList.innerHTML = `
        <div style="padding: 12px; text-align: center; color: var(--text-muted); font-size: 12px;">
          No matching tracks found.
        </div>
      `;
      return;
    }

    tracks.forEach((item) => {
      const el = document.createElement('div');
      el.className = 'sheet-related-item';
      const thumb = item.thumbnail || (item.videoId ? `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg` : 'assets/default_cover.png');
      el.innerHTML = `
        <img src="${thumb}" class="sheet-related-item-thumb" alt="" onerror="this.onerror=function(){this.src='assets/default_cover.png'}; if ('${item.videoId}') this.src='https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg'; else this.src='assets/default_cover.png';">
        <div class="sheet-related-item-info">
          <div class="sheet-related-item-title">${item.title || 'Unknown Title'}</div>
          <div class="sheet-related-item-artist">${item.artist || 'Unknown Artist'} • ${item.duration || '3:30'}</div>
        </div>
        <button class="sheet-related-item-play-btn" title="Play">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>
        </button>
      `;

      el.addEventListener('click', () => {
        // Play selected related song and populate queue
        const remaining = tracks.filter(t => t.videoId !== item.videoId);
        this.playTrack(item, [item, ...remaining]);
      });

      this.sheetRelatedList.appendChild(el);
    });
  }

  updateSheetAtmosphere(track) {
    if (!this.playerSheet) return;
    const tones = {
      hindi: 'rgba(236, 72, 153, 0.22)',
      punjabi: 'rgba(245, 158, 11, 0.22)',
      phonk: 'rgba(139, 92, 246, 0.25)',
      pop: 'rgba(0, 240, 255, 0.22)',
      hiphop: 'rgba(239, 68, 68, 0.22)',
      rock: 'rgba(168, 85, 247, 0.22)',
      lofi: 'rgba(16, 185, 129, 0.22)'
    };
    const titleLower = ((track.title || '') + ' ' + (track.album || '')).toLowerCase();
    const artistLower = (track.artist || '').toLowerCase();
    let chosenTone = 'rgba(0, 240, 255, 0.2)';
    if (/moose|karan|aujla|dhillon|dosanjh|shubh/i.test(artistLower)) chosenTone = tones.punjabi;
    else if (/arijit|shreya|pritam|atif|kumar|bollywood/i.test(artistLower + titleLower)) chosenTone = tones.hindi;
    else if (/phonk|kordhell|interworld|drift|moondeity|hensonn/i.test(titleLower + artistLower)) chosenTone = tones.phonk;
    else if (/hiphop|rap|kendrick|eminem|travis|drake|carti|future/i.test(titleLower + artistLower)) chosenTone = tones.hiphop;
    else if (/rock|linkin|monkeys|queen|dragons|republic|avicii/i.test(titleLower + artistLower)) chosenTone = tones.rock;
    else if (/lofi|chill|study|sleep|peace/i.test(titleLower)) chosenTone = tones.lofi;
    else if (/sabrina|billie|taylor|weeknd|gaga|dua|olivia/i.test(artistLower)) chosenTone = tones.pop;

    this.playerSheet.style.background = `radial-gradient(circle at 50% 18%, ${chosenTone} 0%, rgba(10, 12, 20, 0.95) 75%), #07080d`;
  }

  clearUpcomingQueue() {
    if (!this.queue || this.queue.length <= 1) return;
    this.queue = [this.currentTrack];
    this.queueIndex = 0;
    this.renderQueueInSheet();
    if (window.app && window.app.showToast) {
      window.app.showToast('Cleared upcoming queue');
    }
  }

  filterQueueDuplicates(list, currentTrack) {
    if (!Array.isArray(list)) return [];
    const seenIds = new Set();
    const seenTitles = new Set();
    const filtered = [];

    const normCurrent = window.api ? window.api.normalizeTitle(currentTrack?.title) : (currentTrack?.title || '').toLowerCase().trim();

    if (currentTrack && currentTrack.videoId) {
      seenIds.add(currentTrack.videoId);
      if (normCurrent) seenTitles.add(normCurrent);
      filtered.push(currentTrack);
    }

    const artistCounts = {};
    if (currentTrack && currentTrack.artist) {
      const curArtist = currentTrack.artist.split(',')[0].replace(/\s*-\s*Topic/i, '').trim().toLowerCase();
      artistCounts[curArtist] = 1;
    }

    for (const t of list) {
      if (!t || !t.videoId || seenIds.has(t.videoId)) continue;
      const norm = window.api ? window.api.normalizeTitle(t.title) : (t.title || '').toLowerCase().trim();
      if (norm && (norm === normCurrent || seenTitles.has(norm))) continue;

      const artist = (t.artist || '').split(',')[0].replace(/\s*-\s*Topic/i, '').trim().toLowerCase();
      if (artist && (artistCounts[artist] || 0) >= 2) continue;

      seenIds.add(t.videoId);
      if (norm) seenTitles.add(norm);
      if (artist) artistCounts[artist] = (artistCounts[artist] || 0) + 1;

      filtered.push(t);
    }
    return filtered;
  }

  async populateSmartUpcomingQueue(track) {
    if (!track || !track.videoId) return;
    this._queueRequestId = (this._queueRequestId || 0) + 1;
    const currentReq = this._queueRequestId;

    try {
      if (!window.api || typeof window.api.getRelatedTracks !== 'function') return;
      const data = await window.api.getRelatedTracks(track);
      if (this._queueRequestId !== currentReq) return;
      if (this.currentTrack && this.currentTrack.videoId !== track.videoId) return;

      const candidates = (data.tracks || []).filter(t => t && t.videoId);
      const sanitized = this.filterQueueDuplicates([...this.queue, ...candidates], this.currentTrack);

      if (sanitized.length > this.queue.length) {
        this.queue = sanitized;
        this.renderQueueInSheet();
      }
    } catch (e) {
      console.warn('[Player] populateSmartUpcomingQueue notice:', e);
    }
  }

  async loadLyrics(track) {
    if (!this.sheetLyricsContainer) return;
    this._lyricsRequestId = (this._lyricsRequestId || 0) + 1;
    const currentReq = this._lyricsRequestId;
    this.currentLyricsData = null;
    this.lastActiveLyricIdx = -1;
    this.userScrolledLyrics = false;
    clearTimeout(this.lyricsScrollTimeout);
    if (this.sheetLyricsFollowBtn) this.sheetLyricsFollowBtn.style.display = 'none';

    if (this.sheetLyricsStatus) {
      this.sheetLyricsStatus.textContent = 'SEARCHING';
      this.sheetLyricsStatus.style.borderColor = 'rgba(255,255,255,0.2)';
      this.sheetLyricsStatus.style.color = 'var(--text-muted)';
    }

    this.sheetLyricsContainer.innerHTML = `
      <div class="sheet-lyrics-placeholder">
        <div class="search-pulse-dot" style="margin-bottom: 8px;"></div>
        Tuning in lyrics...
      </div>
    `;

    try {
      if (!window.api || typeof window.api.getLyrics !== 'function') return;
      const lyrics = await window.api.getLyrics(track.title, track.artist, this.getDuration());
      if (this._lyricsRequestId !== currentReq) return;
      this.currentLyricsData = lyrics;

      if (lyrics.type === 'synced' && Array.isArray(lyrics.lines) && lyrics.lines.length > 0) {
        if (this.sheetLyricsStatus) {
          this.sheetLyricsStatus.textContent = 'SYNCED';
          this.sheetLyricsStatus.style.borderColor = 'rgba(0, 240, 255, 0.4)';
          this.sheetLyricsStatus.style.color = 'var(--accent-cyan)';
        }
        this.renderSyncedLyrics(lyrics.lines);
      } else if (lyrics.type === 'plain' && lyrics.text) {
        if (this.sheetLyricsStatus) {
          this.sheetLyricsStatus.textContent = 'PLAIN';
          this.sheetLyricsStatus.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          this.sheetLyricsStatus.style.color = '#fff';
        }
        this.sheetLyricsContainer.innerHTML = `
          <div style="font-size: 15px; font-weight: 600; line-height: 1.6; color: rgba(255,255,255,0.75); white-space: pre-wrap; padding: 6px;">
            ${lyrics.text}
          </div>
        `;
      } else {
        if (this.sheetLyricsStatus) {
          this.sheetLyricsStatus.textContent = lyrics.type === 'instrumental' ? 'AUDIO' : 'OFFLINE';
          this.sheetLyricsStatus.style.borderColor = 'rgba(255,255,255,0.15)';
          this.sheetLyricsStatus.style.color = 'var(--text-muted)';
        }
        this.sheetLyricsContainer.innerHTML = `
          <div class="sheet-lyrics-placeholder">
            ${lyrics.message || 'Lyrics unavailable for this track.'}
          </div>
        `;
      }
    } catch (e) {
      console.warn('[Player] loadLyrics notice:', e);
      if (this._lyricsRequestId === currentReq && this.sheetLyricsContainer) {
        this.sheetLyricsContainer.innerHTML = `
          <div class="sheet-lyrics-placeholder">Lyrics unavailable for this track.</div>
        `;
      }
    }
  }

  renderSyncedLyrics(lines) {
    if (!this.sheetLyricsContainer) return;
    this.sheetLyricsContainer.innerHTML = '';
    lines.forEach((line, idx) => {
      const p = document.createElement('div');
      p.className = 'sheet-lyrics-line';
      p.dataset.time = line.time;
      p.dataset.index = idx;
      p.textContent = line.text;
      p.addEventListener('click', () => {
        this.seekTo(line.time);
      });
      this.sheetLyricsContainer.appendChild(p);
    });
  }

  syncLyricsTime(currentTime) {
    if (!this.currentLyricsData || this.currentLyricsData.type !== 'synced' || !this.sheetLyricsContainer) return;
    const lines = this.currentLyricsData.lines;
    if (!lines || lines.length === 0) return;

    let activeIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (currentTime >= lines[i].time - 0.25) {
        activeIdx = i;
      } else {
        break;
      }
    }

    if (activeIdx !== this.lastActiveLyricIdx) {
      this.lastActiveLyricIdx = activeIdx;
      const allLines = this.sheetLyricsContainer.querySelectorAll('.sheet-lyrics-line');
      allLines.forEach((el, idx) => {
        if (idx === activeIdx) {
          el.classList.add('active');
          // Purely container-scoped scroll — NEVER call el.scrollIntoView() which jumps the whole player sheet!
          if (!this.userScrolledLyrics) {
            const containerHeight = this.sheetLyricsContainer.clientHeight;
            const lineOffset = el.offsetTop - this.sheetLyricsContainer.offsetTop;
            this.sheetLyricsContainer.scrollTo({
              top: Math.max(0, lineOffset - containerHeight / 2 + el.clientHeight / 2),
              behavior: 'smooth'
            });
          }
        } else {
          el.classList.remove('active');
        }
      });
    }
  }

  scrollToActiveLyric() {
    if (!this.sheetLyricsContainer || this.lastActiveLyricIdx < 0) return;
    const activeEl = this.sheetLyricsContainer.querySelector(`.sheet-lyrics-line[data-index="${this.lastActiveLyricIdx}"]`);
    if (activeEl) {
      const containerHeight = this.sheetLyricsContainer.clientHeight;
      const lineOffset = activeEl.offsetTop - this.sheetLyricsContainer.offsetTop;
      this.sheetLyricsContainer.scrollTo({
        top: Math.max(0, lineOffset - containerHeight / 2 + activeEl.clientHeight / 2),
        behavior: 'smooth'
      });
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

    if (playing) {
      this.startSilentAudio();
    } else {
      this.stopSilentAudio();
    }

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

  async onEnded() {
    if (this.repeatMode === 2) {
      // Repeat One
      this.seekTo(0);
      if (this.activeEngine === 'youtube' && this.ytPlayer && this.ytPlayer.playVideo) {
        this.ytPlayer.playVideo();
      } else {
        this.audio.play().catch(() => {});
      }
    } else if (this.queueIndex < this.queue.length - 1) {
      this.next();
    } else if (this.repeatMode === 1) {
      // Repeat All
      this.queueIndex = 0;
      this.playTrack(this.queue[0]);
    } else {
      // Autoplay: Fetch related tracks and append to queue so music never stops
      try {
        if (window.api && typeof window.api.getRelatedTracks === 'function' && this.currentTrack) {
          const recs = await window.api.getRelatedTracks(this.currentTrack);
          if (recs && Array.isArray(recs.tracks) && recs.tracks.length > 0) {
            const fresh = recs.tracks.filter(t => !this.queue.some(q => q.videoId === t.videoId));
            if (fresh.length > 0) {
              this.queue = [...this.queue, ...fresh];
              this.queueIndex++;
              this.renderQueueInSheet();
              this.playTrack(this.queue[this.queueIndex]);
              if (window.app && window.app.showToast) {
                window.app.showToast(`Autoplaying: ${this.queue[this.queueIndex].title}`);
              }
              return;
            }
          }
        }
      } catch (e) {
        console.warn('[Player] Autoplay notice:', e);
      }
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

    this.syncLyricsTime(cur);
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

    if (this.isShuffle && this.queue.length > this.queueIndex + 1) {
      const remaining = this.queue.slice(this.queueIndex + 1);
      for (let i = remaining.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
      }
      this.queue = [...this.queue.slice(0, this.queueIndex + 1), ...remaining];
      this.renderQueueInSheet();
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
