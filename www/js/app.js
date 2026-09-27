// Etsuko Mobile — Main Application Controller
// Fully Standalone Touch-First Cyberpunk Music Client

// Global Hardware & Gesture Back Handler (Available immediately)
window.handleHardwareBack = () => {
  if (window.app && typeof window.app.onHardwareBack === 'function') {
    window.app.onHardwareBack();
  }
};

class EtsukoMobileApp {
  constructor() {
    this.currentView = 'view-discover';
    this.searchAbortController = null;
    this.searchDebounceTimer = null;
    this.currentSearchRequestId = 0;
    this.currentSearchFilter = 'songs';
    this.activeCrateId = null;
    this.syncedLyrics = [];
    this.pendingAddTrack = null;
    this._lastBackPress = 0;

    this.initDOM();
    this.bindEvents();
    this.initPWA();
    this.loadHomeFeed();
    this.loadLibraryData();
    this.loadUserProfileOnStartup();
  }

  initDOM() {
    // Views
    this.views = {
      'view-discover': document.getElementById('view-discover'),
      'view-search': document.getElementById('view-search'),
      'view-library': document.getElementById('view-library'),
      'view-lyrics': document.getElementById('view-lyrics')
    };
    this.navBtns = document.querySelectorAll('.nav-tab-btn');

    // Home / Discover
    this.trendingGrid = document.getElementById('trending-track-grid');
    this.moodPills = document.querySelectorAll('.category-pill');
    this.btnHeroQuick = document.getElementById('btn-hero-quick-play');
    this.btnHeroSurprise = document.getElementById('btn-hero-surprise');

    // Search
    this.btnSearchBack = document.getElementById('btn-search-back');
    this.searchInput = document.getElementById('mobile-search-input');
    this.btnSearchClear = document.getElementById('btn-search-clear');
    this.searchChips = document.querySelectorAll('.chip-btn');
    this.searchResultsList = document.getElementById('search-results-list');

    // Library
    this.cardLikes = document.getElementById('card-open-likes');
    this.likesCountLabel = document.getElementById('likes-count-label');
    this.btnPlayAllLikes = document.getElementById('btn-play-all-likes');
    this.playlistsList = document.getElementById('playlists-list');
    this.btnCreateCrateModal = document.getElementById('btn-create-crate-modal');
    this.playlistDetailView = document.getElementById('playlist-detail-view');
    this.playlistTracksList = document.getElementById('playlist-tracks-list');
    this.btnBackToCrates = document.getElementById('btn-back-to-crates');
    this.activeCrateTitle = document.getElementById('active-crate-title');
    this.btnDeleteActiveCrate = document.getElementById('btn-delete-active-crate');

    // Sheet Player Elements
    this.playerSheet = document.getElementById('player-sheet');
    this.btnSheetDismiss = document.getElementById('btn-sheet-dismiss');
    this.miniPlayer = document.getElementById('mini-player');
    this.miniTouchArea = document.getElementById('mini-info-touch-area');

    // Modals
    this.modalAddPlaylist = document.getElementById('modal-add-playlist');
    this.btnClosePlaylistModal = document.getElementById('btn-close-playlist-modal');
    this.modalCratesList = document.getElementById('modal-crates-list');

    this.modalCreateCrate = document.getElementById('modal-create-crate');
    this.btnCloseCreateModal = document.getElementById('btn-close-create-modal');
    this.inputCrateName = document.getElementById('input-crate-name');
    this.inputCrateDesc = document.getElementById('input-crate-desc');
    this.btnConfirmCreateCrate = document.getElementById('btn-confirm-create-crate');

    // Lyrics
    this.lyricsContainer = document.getElementById('lyrics-container');
    this.lyricsTrackTitle = document.getElementById('lyrics-track-title');

    // Toast
    this.toast = document.getElementById('mobile-toast');

    // Profile Elements
    this.btnOpenProfile = document.getElementById('btn-open-profile');
    this.modalProfile = document.getElementById('modal-profile');
    this.btnCloseProfile = document.getElementById('btn-close-profile');
    this.profileModalAvatar = document.getElementById('profile-modal-avatar');
    this.inputProfileFile = document.getElementById('input-profile-file');
    this.btnChangeAvatar = document.getElementById('btn-change-avatar');
    this.btnResetAvatar = document.getElementById('btn-reset-avatar');
    this.inputProfileName = document.getElementById('input-profile-name');
    this.inputProfileBio = document.getElementById('input-profile-bio');
    this.profileLikesCount = document.getElementById('profile-likes-count');
    this.profileCratesCount = document.getElementById('profile-crates-count');
    this.btnSaveProfile = document.getElementById('btn-save-profile');
    this.topAvatarImg = document.getElementById('top-avatar-img');
  }

  bindEvents() {
    // Bottom Navigation
    this.navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.touch) window.touch.vibrate(10);
        const targetView = btn.getAttribute('data-view');
        this.switchView(targetView);
      });
    });

    // Expand / Collapse Player Sheet
    if (this.miniTouchArea) {
      this.miniTouchArea.addEventListener('click', () => this.openPlayerSheet());
    }
    if (this.btnSheetDismiss) {
      this.btnSheetDismiss.addEventListener('click', () => this.closePlayerSheet());
    }

    // Touch Swipe Gestures
    if (window.touch) {
      window.touch.initPlayerDrawerGestures(this.playerSheet, () => this.closePlayerSheet());
      window.touch.initMiniPlayerSwipe(
        this.miniPlayer,
        () => window.player.next(),
        () => window.player.prev()
      );
    }

    // Player Play Controls
    document.getElementById('btn-mini-play')?.addEventListener('click', (e) => {
      e.stopPropagation();
      window.player.togglePlay();
    });
    document.getElementById('btn-mini-next')?.addEventListener('click', (e) => {
      e.stopPropagation();
      window.player.next();
    });
    document.getElementById('btn-sheet-play')?.addEventListener('click', () => window.player.togglePlay());
    document.getElementById('btn-sheet-next')?.addEventListener('click', () => window.player.next());
    document.getElementById('btn-sheet-prev')?.addEventListener('click', () => window.player.prev());
    document.getElementById('btn-sheet-shuffle')?.addEventListener('click', () => window.player.toggleShuffle());
    document.getElementById('btn-sheet-repeat')?.addEventListener('click', () => window.player.toggleRepeat());

    // Like Button in Sheet
    document.getElementById('sheet-like-btn')?.addEventListener('click', async () => {
      if (!window.player.currentTrack) return;
      await this.toggleTrackLike(window.player.currentTrack);
    });

    // Add to Crate in Sheet
    document.getElementById('sheet-playlist-btn')?.addEventListener('click', () => {
      if (!window.player.currentTrack) return;
      this.openAddToPlaylistModal(window.player.currentTrack);
    });

    // Lyrics Shortcut in Sheet
    document.getElementById('sheet-lyrics-btn')?.addEventListener('click', () => {
      this.closePlayerSheet();
      this.switchView('view-lyrics');
    });

    // Mood Pills
    this.moodPills.forEach(pill => {
      pill.addEventListener('click', () => {
        if (window.touch) window.touch.vibrate(8);
        this.moodPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const cat = pill.getAttribute('data-cat');
        this.filterMoodStation(cat);
      });
    });

    // Hero Buttons
    this.btnHeroQuick?.addEventListener('click', () => {
      if (this.trendingTracks && this.trendingTracks.length > 0) {
        window.player.playTrack(this.trendingTracks[0], this.trendingTracks);
        this.openPlayerSheet();
      }
    });
    this.btnHeroSurprise?.addEventListener('click', () => {
      if (this.trendingTracks && this.trendingTracks.length > 0) {
        const rand = this.trendingTracks[Math.floor(Math.random() * this.trendingTracks.length)];
        window.player.playTrack(rand, this.trendingTracks);
        this.openPlayerSheet();
      }
    });

    // In-App Back Button in Search View
    this.btnSearchBack?.addEventListener('click', () => {
      if (window.touch) window.touch.vibrate(10);
      this.switchView('view-discover');
    });

    // Search Input with 320ms Debounce and Immediate Execution on Enter
    this.searchInput?.addEventListener('input', (e) => {
      const q = e.target.value.trim();
      if (this.btnSearchClear) this.btnSearchClear.style.display = q ? 'flex' : 'none';
      clearTimeout(this.searchDebounceTimer);
      if (q) {
        this.searchDebounceTimer = setTimeout(() => this.executeSearch(q), 320);
      } else {
        this.searchResultsList.innerHTML = '';
      }
    });

    this.searchInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        clearTimeout(this.searchDebounceTimer);
        const q = this.searchInput.value.trim();
        if (q) this.executeSearch(q);
        this.searchInput.blur();
      }
    });

    this.btnSearchClear?.addEventListener('click', () => {
      this.searchInput.value = '';
      this.btnSearchClear.style.display = 'none';
      this.searchResultsList.innerHTML = '';
      this.searchInput.focus();
    });

    this.searchChips.forEach(chip => {
      chip.addEventListener('click', () => {
        this.searchChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.currentSearchFilter = chip.getAttribute('data-filter');
        const q = this.searchInput.value.trim();
        if (q) this.executeSearch(q);
      });
    });

    // Library Controls
    this.btnPlayAllLikes?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.playAllLikedSongs();
    });
    this.cardLikes?.addEventListener('click', () => {
      this.openLikedSongsView();
    });

    this.btnCreateCrateModal?.addEventListener('click', () => {
      this.modalCreateCrate.classList.add('open');
      this.inputCrateName.focus();
    });
    this.btnCloseCreateModal?.addEventListener('click', () => {
      this.modalCreateCrate.classList.remove('open');
    });

    this.btnConfirmCreateCrate?.addEventListener('click', async () => {
      const name = this.inputCrateName.value.trim();
      const desc = this.inputCrateDesc.value.trim();
      if (!name) return;
      try {
        await window.api.createPlaylist(name, desc);
        this.inputCrateName.value = '';
        this.inputCrateDesc.value = '';
        this.modalCreateCrate.classList.remove('open');
        this.showToast('Crate created!');
        this.loadLibraryData();
      } catch (e) {
        this.showToast('Failed to create crate');
      }
    });

    this.btnBackToCrates?.addEventListener('click', () => {
      this.playlistDetailView.style.display = 'none';
      this.playlistsList.style.display = 'flex';
      this.cardLikes.style.display = 'block';
    });

    this.btnDeleteActiveCrate?.addEventListener('click', async () => {
      if (!this.activeCrateId) return;
      if (confirm('Delete this playlist crate?')) {
        await window.api.deletePlaylist(this.activeCrateId);
        this.showToast('Playlist deleted');
        this.btnBackToCrates.click();
        this.loadLibraryData();
      }
    });

    // Modal Add To Playlist
    this.btnClosePlaylistModal?.addEventListener('click', () => {
      this.modalAddPlaylist.classList.remove('open');
    });

    // Profile Modal Events
    this.btnOpenProfile?.addEventListener('click', async () => {
      if (window.touch) window.touch.vibrate(12);
      await this.openProfileModal();
    });
    this.btnCloseProfile?.addEventListener('click', () => {
      this.modalProfile?.classList.remove('open');
    });
    this.btnChangeAvatar?.addEventListener('click', () => {
      this.inputProfileFile?.click();
    });
    this.inputProfileFile?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (re) => {
          if (this.profileModalAvatar) this.profileModalAvatar.src = re.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
    this.btnResetAvatar?.addEventListener('click', () => {
      if (this.profileModalAvatar) this.profileModalAvatar.src = 'assets/default_user.png';
    });
    this.btnSaveProfile?.addEventListener('click', () => {
      this.saveUserProfile();
    });

    // Lyrics Time Sync Event Listener
    window.addEventListener('etsuko:mobile-time-update', (e) => {
      this.syncLyrics(e.detail.currentTime);
    });

    // When track starts, fetch lyrics
    window.addEventListener('etsuko:mobile-track-started', (e) => {
      const track = e.detail;
      this.loadTrackLyrics(track);
    });
  }

  // --- Modern Android Gesture & Hardware Back Button Routing ---
  onHardwareBack() {
    // 1. Close open modal if any
    const openModal = document.querySelector('.mobile-modal-backdrop.open');
    if (openModal) {
      openModal.classList.remove('open');
      return;
    }

    // 2. Close player sheet if open
    if (this.playerSheet && this.playerSheet.classList.contains('open')) {
      this.closePlayerSheet();
      return;
    }

    // 3. Close playlist detail view in Library
    if (this.playlistDetailView && this.playlistDetailView.style.display !== 'none') {
      this.btnBackToCrates?.click();
      return;
    }

    // 4. Return to Discover view from any other view
    if (this.currentView !== 'view-discover') {
      this.switchView('view-discover');
      return;
    }

    // 5. Clear search input if filled
    if (this.searchInput && this.searchInput.value) {
      this.searchInput.value = '';
      this.btnSearchClear?.click();
      return;
    }

    // 6. Double back press to exit gracefully
    const now = Date.now();
    if (this._lastBackPress && (now - this._lastBackPress < 2000)) {
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
        window.Capacitor.Plugins.App.exitApp();
      }
    } else {
      this._lastBackPress = now;
      this.showToast('Press back again to exit');
    }
  }

  initPWA() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(err => {
        console.log('SW register note:', err);
      });
    }
  }

  switchView(viewId) {
    Object.keys(this.views).forEach(vKey => {
      const view = this.views[vKey];
      if (vKey === viewId) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });

    this.navBtns.forEach(btn => {
      if (btn.getAttribute('data-view') === viewId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.currentView = viewId;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  openPlayerSheet() {
    if (this.playerSheet) {
      this.playerSheet.classList.add('open');
      if (window.touch) window.touch.vibrate(10);
    }
  }

  closePlayerSheet() {
    if (this.playerSheet) {
      this.playerSheet.classList.remove('open');
      this.playerSheet.style.transform = '';
    }
  }

  showToast(msg, duration = 2200) {
    if (!this.toast) return;
    this.toast.textContent = msg;
    this.toast.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      this.toast.classList.remove('show');
    }, duration);
  }

  // --- Profile Logic ---
  async openProfileModal() {
    let profile = { name: 'Cyber Operator', bio: 'Listening to the grid...', avatar: 'assets/default_user.png' };
    try {
      const saved = localStorage.getItem('etsuko_user_profile');
      if (saved) profile = JSON.parse(saved);
    } catch (e) {}

    if (this.inputProfileName) this.inputProfileName.value = profile.name || 'Cyber Operator';
    if (this.inputProfileBio) this.inputProfileBio.value = profile.bio || 'Listening to the grid...';
    if (this.profileModalAvatar) this.profileModalAvatar.src = profile.avatar || 'assets/default_user.png';

    const likes = await window.api.getLikedTracks();
    const crates = await window.api.getPlaylists();
    if (this.profileLikesCount) this.profileLikesCount.textContent = likes.length;
    if (this.profileCratesCount) this.profileCratesCount.textContent = crates.length;

    this.modalProfile?.classList.add('open');
  }

  saveUserProfile() {
    const name = this.inputProfileName ? this.inputProfileName.value.trim() : 'Cyber Operator';
    const bio = this.inputProfileBio ? this.inputProfileBio.value.trim() : '';
    const avatar = this.profileModalAvatar ? this.profileModalAvatar.src : 'assets/default_user.png';

    const profile = { name, bio, avatar };
    localStorage.setItem('etsuko_user_profile', JSON.stringify(profile));
    if (this.topAvatarImg) this.topAvatarImg.src = avatar;

    this.modalProfile?.classList.remove('open');
    this.showToast('Profile updated!');
  }

  loadUserProfileOnStartup() {
    try {
      const saved = localStorage.getItem('etsuko_user_profile');
      if (saved) {
        const p = JSON.parse(saved);
        if (p.avatar && this.topAvatarImg) this.topAvatarImg.src = p.avatar;
      }
    } catch (e) {}
  }

  // --- Discover Feeds ---
  async loadHomeFeed() {
    try {
      const data = await window.api.getHomeFeed();
      this.trendingTracks = data.trending || [];
      this.renderTrendingGrid(this.trendingTracks);
    } catch (e) {
      console.warn('[App] Home feed fallback:', e);
    }
  }

  renderTrendingGrid(tracks) {
    this.trendingGrid.innerHTML = '';
    tracks.slice(0, 16).forEach(track => {
      const isLiked = window.api.isLiked(track.videoId);
      const card = document.createElement('div');
      card.className = 'track-card';
      card.innerHTML = `
        <div class="track-card-thumb-wrap">
          <img src="${track.thumbnail || 'assets/default_cover.png'}" loading="lazy" alt="Cover" onerror="this.src='assets/default_cover.png'">
          <button class="track-card-like-btn ${isLiked ? 'liked' : ''}" data-vid="${track.videoId}" title="Like">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="${isLiked ? '#ec4899' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </button>
        </div>
        <div class="track-card-title">${this.escapeHtml(track.title)}</div>
        <div class="track-card-artist">${this.escapeHtml(track.artist)}</div>
      `;

      card.querySelector('.track-card-like-btn').addEventListener('click', async (e) => {
        e.stopPropagation();
        track.isLiked = window.api.isLiked(track.videoId);
        await this.toggleTrackLike(track);
        const btn = card.querySelector('.track-card-like-btn');
        const nowLiked = window.api.isLiked(track.videoId);
        btn.classList.toggle('liked', nowLiked);
        btn.querySelector('svg').setAttribute('fill', nowLiked ? '#ec4899' : 'none');
      });

      card.addEventListener('click', () => {
        track.isLiked = window.api.isLiked(track.videoId);
        window.player.playTrack(track, tracks);
        this.openPlayerSheet();
      });

      this.trendingGrid.appendChild(card);
    });
  }

  async filterMoodStation(mood) {
    const queries = {
      'trending': 'Top Global Hits',
      'phonk': 'Brazilian Phonk Drift',
      'lofi': 'Lofi Chill Study Beats',
      'synth': 'Synthwave Retro Electro',
      'gaming': 'Gaming Focus Electronic',
      'rock': 'Modern Rock Hardcore'
    };
    const q = queries[mood] || 'Trending Hits';
    this.trendingGrid.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 36px 16px; text-align: center; color: var(--text-muted); font-size: 13px;">
        Loading ${q}...
      </div>
    `;

    try {
      const res = await window.api.search(q, 'songs');
      if (res.results && res.results.length > 0) {
        this.renderTrendingGrid(res.results);
      } else {
        this.loadHomeFeed();
      }
    } catch (e) {
      this.loadHomeFeed();
    }
  }

  // --- Search Engine (Guarded Against Race Conditions & Stale Overwrites) ---
  async executeSearch(query) {
    if (!query || !query.trim()) {
      this.searchResultsList.innerHTML = '';
      return;
    }
    const q = query.trim();
    const reqId = ++this.currentSearchRequestId;

    if (this.searchAbortController) {
      this.searchAbortController.abort();
    }
    this.searchAbortController = new AbortController();

    this.searchResultsList.innerHTML = `
      <div style="padding: 36px 16px; text-align: center; color: var(--text-muted); font-size: 13px;">
        Searching YouTube Music...
      </div>
    `;

    try {
      const data = await window.api.search(q, this.currentSearchFilter, this.searchAbortController.signal);
      if (reqId !== this.currentSearchRequestId) return; // Drop stale request!

      const results = data.results || [];
      this.renderSearchResults(results);
    } catch (e) {
      if (e.name === 'AbortError') return;
      if (reqId !== this.currentSearchRequestId) return;
      this.searchResultsList.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px;">
          No matching tracks found. Try another query.
        </div>
      `;
    }
  }

  renderSearchResults(items) {
    this.searchResultsList.innerHTML = '';
    if (items.length === 0) {
      this.searchResultsList.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px;">
          No matching results found.
        </div>
      `;
      return;
    }

    items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'track-row';
      const isLiked = window.api.isLiked(item.videoId);

      row.innerHTML = `
        <img src="${item.thumbnail || 'assets/default_cover.png'}" class="track-row-thumb" alt="Track" onerror="this.src='assets/default_cover.png'">
        <div class="track-row-info">
          <div class="track-row-title">${this.escapeHtml(item.title)}</div>
          <div class="track-row-artist">${this.escapeHtml(item.artist)} • ${item.duration || '3:30'}</div>
        </div>
        <div class="track-row-actions">
          <button class="btn-track-action btn-track-like ${isLiked ? 'liked' : ''}" data-vid="${item.videoId}" title="Like">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="${isLiked ? '#ec4899' : 'none'}" stroke="${isLiked ? '#ec4899' : 'currentColor'}" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </button>
          <button class="btn-track-action btn-add-pl" title="Add to Crate">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        </div>
      `;

      row.querySelector('.btn-track-like').addEventListener('click', async (e) => {
        e.stopPropagation();
        item.isLiked = window.api.isLiked(item.videoId);
        await this.toggleTrackLike(item);
        const btn = row.querySelector('.btn-track-like');
        const nowLiked = window.api.isLiked(item.videoId);
        btn.classList.toggle('liked', nowLiked);
        btn.querySelector('svg').setAttribute('fill', nowLiked ? '#ec4899' : 'none');
        btn.querySelector('svg').setAttribute('stroke', nowLiked ? '#ec4899' : 'currentColor');
      });

      row.querySelector('.btn-add-pl').addEventListener('click', (e) => {
        e.stopPropagation();
        this.openAddToPlaylistModal(item);
      });

      row.addEventListener('click', () => {
        item.isLiked = window.api.isLiked(item.videoId);
        window.player.playTrack(item, items);
        this.openPlayerSheet();
      });

      this.searchResultsList.appendChild(row);
    });
  }

  // --- Library / Crates ---
  async loadLibraryData() {
    try {
      const likes = await window.api.getLikedTracks();
      this.likedTracks = likes;
      if (this.likesCountLabel) {
        this.likesCountLabel.textContent = `${likes.length} track${likes.length === 1 ? '' : 's'} stored`;
      }

      const crates = await window.api.getPlaylists();
      this.renderCratesList(crates);
    } catch (e) {}
  }

  renderCratesList(crates) {
    this.playlistsList.innerHTML = '';
    if (crates.length === 0) {
      this.playlistsList.innerHTML = `
        <div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 13px;">
          No custom crates yet. Tap "+ New Crate" to organize.
        </div>
      `;
      return;
    }

    crates.forEach(c => {
      const row = document.createElement('div');
      row.className = 'track-row';
      const count = c.tracks ? c.tracks.length : (c.trackCount || 0);
      row.innerHTML = `
        <div style="width: 44px; height: 44px; border-radius: 8px; background: rgba(139, 92, 246, 0.2); display: flex; align-items: center; justify-content: center; color: var(--accent-purple); flex-shrink: 0;">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
        </div>
        <div class="track-row-info">
          <div class="track-row-title">${this.escapeHtml(c.title || c.name)}</div>
          <div class="track-row-artist">${count} tracks • ${this.escapeHtml(c.description || 'Custom collection')}</div>
        </div>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--text-muted)" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
      `;
      row.addEventListener('click', () => this.openCrateDetails(c.id, c.title || c.name));
      this.playlistsList.appendChild(row);
    });
  }

  async openCrateDetails(crateId, crateName) {
    this.activeCrateId = crateId;
    this.activeCrateTitle.textContent = crateName;
    this.cardLikes.style.display = 'none';
    this.playlistsList.style.display = 'none';
    this.playlistDetailView.style.display = 'block';

    this.playlistTracksList.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--text-muted);">Loading crate tracks...</div>';
    try {
      const pl = await window.api.getPlaylist(crateId);
      const tracks = pl.tracks || [];
      this.playlistTracksList.innerHTML = '';
      if (tracks.length === 0) {
        this.playlistTracksList.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-muted);">Crate is empty.</div>';
        return;
      }
      tracks.forEach(track => {
        const row = document.createElement('div');
        row.className = 'track-row';
        row.innerHTML = `
          <img src="${track.thumbnail || 'assets/default_cover.png'}" class="track-row-thumb" alt="Track" onerror="this.src='assets/default_cover.png'">
          <div class="track-row-info">
            <div class="track-row-title">${this.escapeHtml(track.title)}</div>
            <div class="track-row-artist">${this.escapeHtml(track.artist)}</div>
          </div>
          <button class="btn-track-action btn-rm-track" title="Remove" style="color: #ef4444;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        `;
        row.querySelector('.btn-rm-track').addEventListener('click', async (e) => {
          e.stopPropagation();
          await window.api.removeTrackFromPlaylist(crateId, track.videoId);
          this.showToast('Track removed from crate');
          this.openCrateDetails(crateId, crateName);
        });
        row.addEventListener('click', () => {
          window.player.playTrack(track, tracks);
          this.openPlayerSheet();
        });
        this.playlistTracksList.appendChild(row);
      });
    } catch (e) {
      this.playlistTracksList.innerHTML = '<div style="padding: 16px; text-align: center; color: #ef4444;">Failed to load crate.</div>';
    }
  }

  async openLikedSongsView() {
    this.openCrateDetails('liked_songs_virtual', 'Liked Songs');
    this.activeCrateTitle.textContent = 'Liked Songs';
    this.btnDeleteActiveCrate.style.display = 'none';

    this.playlistTracksList.innerHTML = '';
    const likes = await window.api.getLikedTracks();
    this.likedTracks = likes;

    if (!this.likedTracks || this.likedTracks.length === 0) {
      this.playlistTracksList.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-muted);">No liked tracks yet.</div>';
      return;
    }
    this.likedTracks.forEach(track => {
      const row = document.createElement('div');
      row.className = 'track-row';
      row.innerHTML = `
        <img src="${track.thumbnail || 'assets/default_cover.png'}" class="track-row-thumb" alt="Track" onerror="this.src='assets/default_cover.png'">
        <div class="track-row-info">
          <div class="track-row-title">${this.escapeHtml(track.title)}</div>
          <div class="track-row-artist">${this.escapeHtml(track.artist)}</div>
        </div>
      `;
      row.addEventListener('click', () => {
        window.player.playTrack(track, this.likedTracks);
        this.openPlayerSheet();
      });
      this.playlistTracksList.appendChild(row);
    });
  }

  playAllLikedSongs() {
    if (this.likedTracks && this.likedTracks.length > 0) {
      window.player.playTrack(this.likedTracks[0], this.likedTracks);
      this.openPlayerSheet();
    } else {
      this.showToast('No liked songs in collection');
    }
  }

  async toggleTrackLike(track) {
    try {
      const nowLiked = await window.api.toggleLike(track);
      track.isLiked = nowLiked;
      this.showToast(nowLiked ? '❤️ Saved to Liked Songs' : 'Removed from Liked Songs');

      if (window.player.currentTrack && window.player.currentTrack.videoId === track.videoId) {
        window.player.currentTrack.isLiked = nowLiked;
        window.player.updateTrackUI(window.player.currentTrack);
      }

      // Sync visible buttons matching this videoId
      document.querySelectorAll(`[data-vid="${track.videoId}"]`).forEach(btn => {
        btn.classList.toggle('liked', nowLiked);
        const svg = btn.querySelector('svg');
        if (svg) {
          svg.setAttribute('fill', nowLiked ? '#ec4899' : 'none');
          svg.setAttribute('stroke', nowLiked ? '#ec4899' : 'currentColor');
        }
      });

      this.loadLibraryData();
    } catch (e) {
      console.warn('Like toggle notice:', e);
      this.showToast('Like updated');
    }
  }

  async openAddToPlaylistModal(track) {
    this.pendingAddTrack = track;
    this.modalAddPlaylist.classList.add('open');
    this.modalCratesList.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--text-muted);">Loading crates...</div>';

    try {
      const crates = await window.api.getPlaylists();
      this.modalCratesList.innerHTML = '';
      if (crates.length === 0) {
        this.modalCratesList.innerHTML = `
          <div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 13px;">
            No crates available. Create one first!
          </div>
        `;
        return;
      }
      crates.forEach(c => {
        const row = document.createElement('div');
        row.className = 'track-row';
        const count = c.tracks ? c.tracks.length : (c.trackCount || 0);
        row.innerHTML = `
          <div class="track-row-info">
            <div class="track-row-title">${this.escapeHtml(c.title || c.name)}</div>
            <div class="track-row-artist">${count} tracks</div>
          </div>
          <button class="btn-mobile-pill primary" style="padding: 6px 12px; font-size: 11px;">Add</button>
        `;
        row.addEventListener('click', async () => {
          try {
            await window.api.addTrackToPlaylist(c.id, this.pendingAddTrack);
            this.modalAddPlaylist.classList.remove('open');
            this.showToast(`Added to "${c.title || c.name}"`);
            this.loadLibraryData();
          } catch (e) {
            this.showToast('Failed to add track to crate');
          }
        });
        this.modalCratesList.appendChild(row);
      });
    } catch (e) {
      this.modalCratesList.innerHTML = '<div style="padding: 16px; text-align: center; color: #ef4444;">Failed to load crates.</div>';
    }
  }

  // --- Synced Lyrics Engine ---
  async loadTrackLyrics(track) {
    this.lyricsTrackTitle.textContent = `${track.title} — ${track.artist}`;
    this.lyricsContainer.innerHTML = '<p class="lyric-line" style="color: var(--text-muted);">Fetching synced lyrics...</p>';
    this.syncedLyrics = [];

    try {
      const data = await window.api.getLyrics(track.title, track.artist);
      if (data.syncedLyrics) {
        this.syncedLyrics = this.parseLRC(data.syncedLyrics);
        this.renderSyncedLyrics(this.syncedLyrics);
      } else if (data.plainLyrics) {
        this.renderPlainLyrics(data.plainLyrics);
      } else {
        this.lyricsContainer.innerHTML = '<p class="lyric-line" style="color: var(--text-muted);">No lyrics found for this track.</p>';
      }
    } catch (e) {
      this.lyricsContainer.innerHTML = '<p class="lyric-line" style="color: var(--text-muted);">Lyrics unavailable.</p>';
    }
  }

  parseLRC(lrcText) {
    const lines = lrcText.split('\n');
    const result = [];
    const timeReg = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;

    lines.forEach(line => {
      let match;
      const text = line.replace(timeReg, '').trim();
      while ((match = timeReg.exec(line)) !== null) {
        const mins = parseInt(match[1], 10);
        const secs = parseInt(match[2], 10);
        const ms = match[3] ? parseInt(match[3].padEnd(3, '0').slice(0, 3), 10) : 0;
        const time = mins * 60 + secs + ms / 1000;
        if (text) {
          result.push({ time, text });
        }
      }
    });

    result.sort((a, b) => a.time - b.time);
    return result;
  }

  renderSyncedLyrics(lyrics) {
    this.lyricsContainer.innerHTML = '';
    lyrics.forEach((line, index) => {
      const p = document.createElement('p');
      p.className = 'lyric-line';
      p.id = `lyric-line-${index}`;
      p.textContent = line.text;
      p.addEventListener('click', () => {
        if (window.player.ytPlayer && window.player.ytPlayer.seekTo) {
          window.player.ytPlayer.seekTo(line.time, true);
        } else if (window.player.audio) {
          window.player.audio.currentTime = line.time;
        }
      });
      this.lyricsContainer.appendChild(p);
    });
  }

  renderPlainLyrics(text) {
    this.lyricsContainer.innerHTML = '';
    const lines = text.split('\n');
    lines.forEach(l => {
      const p = document.createElement('p');
      p.className = 'lyric-line';
      p.style.color = 'var(--text-sub)';
      p.textContent = l || ' ';
      this.lyricsContainer.appendChild(p);
    });
  }

  syncLyrics(currentTime) {
    if (!this.syncedLyrics || this.syncedLyrics.length === 0) return;

    let activeIndex = -1;
    for (let i = 0; i < this.syncedLyrics.length; i++) {
      if (currentTime >= this.syncedLyrics[i].time) {
        activeIndex = i;
      } else {
        break;
      }
    }

    if (activeIndex !== -1) {
      document.querySelectorAll('.lyric-line').forEach((el, idx) => {
        if (idx === activeIndex) {
          el.classList.add('active');
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          el.classList.remove('active');
        }
      });
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new EtsukoMobileApp();
});
