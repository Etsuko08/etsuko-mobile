// Etsuko Mobile Hybrid Audio Engine (HTML5 Audio + YouTube IFrame Engine)

class MobilePlayer {
  constructor() {
    this.audio = document.getElementById('mobile-audio-engine') || new Audio();
    this.audio.setAttribute('playsinline', '');
    this.audio.setAttribute('webkit-playsinline', '');
    this.audio.preload = 'auto';

    this.ytPlayer = null;
    this.ytReady = false;
    this.pendingVideoId = null;
    this.activeEngine = 'youtube'; // 'audio' | 'youtube'

    this.currentTrack = null;
    this.queue = [];
    this.queueIndex = -1;
    this.autoplayTracks = [];
    this.isPlaying = false;
    this.userPaused = false;
    this.repeatMode = 0; // 0: off, 1: all, 2: one
    this.isShuffle = false;
    this.audioContext = null;

    this.initElements();
    this.initAudioEvents();
    this.initMediaSession();
    this.initYouTube();
    this.startProgressTicker();
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
    this.sheetVideoContainer = document.getElementById('yt-player-container');
    this.sheetCover = document.getElementById('sheet-cover');
    this.sheetTitle = document.getElementById('sheet-title');
    this.sheetArtist = document.getElementById('sheet-artist');
    this.sheetAlbum = document.getElementById('sheet-album');
    this.sheetLikeBtn = document.getElementById('sheet-like-btn');
    this.sheetPlaylistBtn = document.getElementById('sheet-playlist-btn');
    this.sheetLyricsBtn = document.getElementById('sheet-lyrics-btn');

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

  initYouTube() {
    const setupYT = () => {
      if (window.YT && window.YT.Player) {
        try {
          this.ytPlayer = new window.YT.Player('yt-player', {
            height: '100%',
            width: '100%',
            host: 'https://www.youtube.com',
            playerVars: {
              'autoplay': 1,
              'controls': 1,
              'disablekb': 1,
              'fs': 0,
              'playsinline': 1,
              'rel': 0,
              'modestbranding': 1,
              'enablejsapi': 1
            },
            events: {
              'onReady': () => {
                this.ytReady = true;
                console.log('[Etsuko] YouTube Neural Engine connected');
                if (this.pendingVideoId) {
                  this.playYouTubeTrack(this.pendingVideoId);
                  this.pendingVideoId = null;
                }
              },
              'onStateChange': (e) => this.onYTStateChange(e),
              'onError': (e) => this.onYTError(e)
            }
          });
        } catch (err) {
          console.warn('[Etsuko] YouTube init notice:', err);
        }
      }
    };

    if (window.YT && window.YT.Player) {
      setupYT();
    } else {
      window.onYouTubeIframeAPIReady = setupYT;
    }
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
      this.ytPlayer.playVideo();
      this.onPlayState(true);
    } catch (e) {
      console.warn('[Player] YouTube stream error:', e);
    }
  }

  onYTStateChange(event) {
    // 1: Playing, 2: Paused, 0: Ended
    if (event.data === 1) {
      this.onPlayState(true);
    } else if (event.data === 2) {
      this.onPlayState(false);
    } else if (event.data === 0) {
      this.onEnded();
    }
  }

  onYTError(e) {
    console.warn('[Etsuko] YouTube Player error code:', e.data);
    if (this._errorThrottleTimer) return;
    this._errorThrottleTimer = setTimeout(() => { this._errorThrottleTimer = null; }, 2000);
    if (window.app && window.app.showToast) {
      window.app.showToast('Playback restricted, trying next track...');
    }
    setTimeout(() => {
      if (!this.userPaused) this.next();
    }, 1200);
  }

  startProgressTicker() {
    setInterval(() => {
      if (this.activeEngine === 'youtube' && this.ytReady && this.ytPlayer && this.isPlaying) {
        try {
          const cur = this.ytPlayer.getCurrentTime() || 0;
          const dur = this.ytPlayer.getDuration() || 0;
          if (dur > 0) {
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
        } catch (err) {}
      }
    }, 250);
  }

  initAudioEvents() {
    this.audio.addEventListener('play', () => {
      if (this.activeEngine === 'audio') this.onPlayState(true);
    });
    this.audio.addEventListener('pause', () => {
      if (this.activeEngine === 'audio') this.onPlayState(false);
    });
    this.audio.addEventListener('timeupdate', () => {
      if (this.activeEngine === 'audio') this.onTimeUpdate();
    });
    this.audio.addEventListener('ended', () => {
      if (this.activeEngine === 'audio') this.onEnded();
    });

    // Touch seeking on Scrubber
    if (this.scrubberTrack) {
      const doSeek = (e) => {
        const rect = this.scrubberTrack.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const pct = x / rect.width;
        this.scrubberFill.style.width = `${pct * 100}%`;
        if (this.scrubberThumb) this.scrubberThumb.style.left = `${pct * 100}%`;

        if (this.activeEngine === 'youtube' && this.ytReady && this.ytPlayer) {
          const dur = this.ytPlayer.getDuration() || 0;
          this.ytPlayer.seekTo(dur * pct, true);
        } else if (this.audio.duration) {
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
        if (details.seekTime) {
          if (this.activeEngine === 'youtube' && this.ytReady && this.ytPlayer) {
            this.ytPlayer.seekTo(details.seekTime, true);
          } else if (this.audio.duration) {
            this.audio.currentTime = details.seekTime;
          }
        }
      });
    }
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
    this.updateMediaSession(track);

    // Direct stream resolution (JioSaavn or Desktop custom server proxy)
    const directStream = track.streamUrl || (window.api && window.api.baseUrl ? window.api.getStreamUrl(track.videoId) : null);

    if (directStream) {
      this.activeEngine = 'audio';
      if (this.ytReady && this.ytPlayer && this.ytPlayer.pauseVideo) {
        try { this.ytPlayer.pauseVideo(); } catch (e) {}
      }

      this.updateTrackUI(track);

      try {
        this.userPaused = false;
        this.audio.src = directStream;
        await this.audio.play();
        this.onPlayState(true);
      } catch (err) {
        console.warn('[Player] Direct stream playback retry:', err);
        try {
          await new Promise(r => setTimeout(r, 400));
          await this.audio.play();
        } catch (e2) {}
      }
    } else {
      // YouTube Engine
      this.activeEngine = 'youtube';
      this.audio.pause();
      this.updateTrackUI(track);

      this.playYouTubeTrack(track.videoId);
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

    // Sheet Player Visual Engine: Video Player vs Artwork Cover
    if (this.sheetCover) {
      this.sheetCover.src = thumb;
      this.sheetCover.style.opacity = this.activeEngine === 'youtube' ? '0' : '1';
      this.sheetCover.style.pointerEvents = this.activeEngine === 'youtube' ? 'none' : 'auto';
    }

    if (this.sheetVideoContainer) {
      this.sheetVideoContainer.style.display = this.activeEngine === 'youtube' ? 'block' : 'none';
      this.sheetVideoContainer.style.zIndex = this.activeEngine === 'youtube' ? '2' : '0';
    }

    if (this.sheetTitle) this.sheetTitle.textContent = title;
    if (this.sheetArtist) this.sheetArtist.textContent = artist;
    if (this.sheetAlbum) this.sheetAlbum.textContent = track.album || (track.source === 'saavn' ? 'Lossless 320kbps' : 'YouTube Music Master');
    if (this.sheetLikeBtn) {
      this.sheetLikeBtn.classList.toggle('liked', !!track.isLiked);
      const svg = this.sheetLikeBtn.querySelector('svg');
      if (svg) svg.setAttribute('fill', track.isLiked ? '#ec4899' : 'none');
    }
  }

  togglePlay() {
    this.unlockAudioContext();
    if (!this.currentTrack) {
      if (this.queue.length > 0) this.playTrack(this.queue[0]);
      return;
    }

    if (this.activeEngine === 'youtube') {
      if (this.ytReady && this.ytPlayer && this.ytPlayer.getPlayerState) {
        const state = this.ytPlayer.getPlayerState();
        if (state === 1) { // playing
          this.ytPlayer.pauseVideo();
          this.userPaused = true;
          this.onPlayState(false);
        } else {
          this.ytPlayer.playVideo();
          this.userPaused = false;
          this.onPlayState(true);
        }
      }
    } else {
      if (this.audio.paused) {
        this.userPaused = false;
        this.audio.play().catch(() => {});
      } else {
        this.userPaused = true;
        this.audio.pause();
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
  }

  next() {
    if (this.queue.length === 0) return;
    if (this.isShuffle) {
      this.queueIndex = Math.floor(Math.random() * this.queue.length);
      this.playTrack(this.queue[this.queueIndex]);
      return;
    }
    if (this.queueIndex < this.queue.length - 1) {
      this.queueIndex++;
      this.playTrack(this.queue[this.queueIndex]);
    } else if (this.repeatMode === 1) {
      this.queueIndex = 0;
      this.playTrack(this.queue[0]);
    }
  }

  prev() {
    const curTime = this.activeEngine === 'youtube' && this.ytReady && this.ytPlayer && this.ytPlayer.getCurrentTime ? this.ytPlayer.getCurrentTime() : this.audio.currentTime;
    if (curTime > 3) {
      if (this.activeEngine === 'youtube' && this.ytReady && this.ytPlayer) this.ytPlayer.seekTo(0, true);
      else this.audio.currentTime = 0;
      return;
    }
    if (this.queueIndex > 0) {
      this.queueIndex--;
      this.playTrack(this.queue[this.queueIndex]);
    } else {
      if (this.activeEngine === 'youtube' && this.ytReady && this.ytPlayer) this.ytPlayer.seekTo(0, true);
      else this.audio.currentTime = 0;
    }
  }

  onEnded() {
    if (this.repeatMode === 2) {
      if (this.activeEngine === 'youtube' && this.ytReady && this.ytPlayer) {
        this.ytPlayer.seekTo(0, true);
        this.ytPlayer.playVideo();
      } else {
        this.audio.currentTime = 0;
        this.audio.play().catch(() => {});
      }
    } else {
      this.next();
    }
  }

  onTimeUpdate() {
    if (!this.audio.duration) return;
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
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  toggleRepeat() {
    this.repeatMode = (this.repeatMode + 1) % 3;
    if (this.repeatBadge) {
      if (this.repeatMode === 0) {
        this.repeatBadge.textContent = '';
        this.btnSheetRepeat.classList.remove('active');
      } else if (this.repeatMode === 1) {
        this.repeatBadge.textContent = 'ALL';
        this.btnSheetRepeat.classList.add('active');
      } else {
        this.repeatBadge.textContent = '1';
        this.btnSheetRepeat.classList.add('active');
      }
    }
  }

  toggleShuffle() {
    this.isShuffle = !this.isShuffle;
    if (this.btnSheetShuffle) {
      this.btnSheetShuffle.classList.toggle('active', this.isShuffle);
    }
  }
}

window.player = new MobilePlayer();
