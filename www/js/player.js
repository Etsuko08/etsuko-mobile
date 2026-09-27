// Etsuko Mobile Audio Engine
class MobilePlayer {
  constructor() {
    this.audio = document.getElementById('mobile-audio-engine') || new Audio();
    this.audio.setAttribute('playsinline', '');
    this.audio.setAttribute('webkit-playsinline', '');
    this.audio.preload = 'auto';

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

  initAudioEvents() {
    this.audio.addEventListener('play', () => this.onPlayState(true));
    this.audio.addEventListener('pause', () => this.onPlayState(false));
    this.audio.addEventListener('timeupdate', () => this.onTimeUpdate());
    this.audio.addEventListener('ended', () => this.onEnded());
    this.audio.addEventListener('stalled', () => {
      if (this.isPlaying && this.audio.paused && !this.userPaused) {
        this.audio.play().catch(() => {});
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.isPlaying && this.audio.paused && !this.userPaused) {
        this.audio.play().catch(() => {});
      }
    });

    // Scrubber Touch Events
    if (this.scrubberTrack) {
      let isSeeking = false;
      const doSeek = (e) => {
        const rect = this.scrubberTrack.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const pct = x / rect.width;
        this.scrubberFill.style.width = `${pct * 100}%`;
        if (this.scrubberThumb) this.scrubberThumb.style.left = `${pct * 100}%`;
        if (this.audio.duration) {
          this.audio.currentTime = pct * this.audio.duration;
        }
      };

      this.scrubberTrack.addEventListener('touchstart', (e) => {
        isSeeking = true;
        doSeek(e);
      }, { passive: true });

      this.scrubberTrack.addEventListener('touchmove', (e) => {
        if (isSeeking) doSeek(e);
      }, { passive: true });

      this.scrubberTrack.addEventListener('touchend', () => {
        isSeeking = false;
      });
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

  updateMediaSession(track) {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        album: track.album || 'Etsuko Music',
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
    this.updateTrackUI(track);
    this.updateMediaSession(track);

    try {
      this.userPaused = false;
      this.audio.src = window.api.getStreamUrl(track.videoId);
      await this.audio.play();
      this.isPlaying = true;
      this.fetchAutoplayRadio(track.videoId);
      window.dispatchEvent(new CustomEvent('etsuko:mobile-track-started', { detail: track }));
    } catch (e) {
      if (e && (e.name === 'AbortError' || e.code === 20)) return;
      console.warn('[Player] Retrying stream start:', e);
      try {
        await new Promise(r => setTimeout(r, 400));
        await this.audio.play();
      } catch (err2) {
        if (err2 && (err2.name === 'AbortError' || err2.code === 20)) return;
        console.error('[Player] Audio failed to start:', err2);
      }
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

    // Sheet Player
    if (this.sheetCover) this.sheetCover.src = thumb;
    if (this.sheetTitle) this.sheetTitle.textContent = title;
    if (this.sheetArtist) this.sheetArtist.textContent = artist;
    if (this.sheetAlbum) this.sheetAlbum.textContent = track.album || 'Etsuko Neural Audio';
    if (this.sheetLikeBtn) {
      this.sheetLikeBtn.classList.toggle('liked', !!track.isLiked);
      const svg = this.sheetLikeBtn.querySelector('svg');
      if (svg) svg.setAttribute('fill', track.isLiked ? '#ec4899' : 'none');
    }
  }

  togglePlay() {
    this.unlockAudioContext();
    if (!this.audio.src || !this.currentTrack) {
      if (this.queue.length > 0) this.playTrack(this.queue[0]);
      return;
    }
    if (this.audio.paused) {
      this.userPaused = false;
      this.audio.play().catch(() => {});
    } else {
      this.userPaused = true;
      this.audio.pause();
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
    } else if (this.autoplayTracks.length > 0) {
      const nextTrack = this.autoplayTracks.shift();
      this.queue.push(nextTrack);
      this.queueIndex = this.queue.length - 1;
      this.playTrack(nextTrack);
    } else if (this.repeatMode === 1) {
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
      this.audio.currentTime = 0;
      this.audio.play().catch(() => {});
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

  async fetchAutoplayRadio(videoId) {
    try {
      const res = await window.api.fetchJson(`/api/radio/${encodeURIComponent(videoId)}`);
      if (res.tracks && res.tracks.length > 0) {
        this.autoplayTracks = res.tracks;
      }
    } catch (e) {}
  }
}

window.player = new MobilePlayer();
