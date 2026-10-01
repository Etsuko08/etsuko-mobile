// Etsuko Mobile — Main Application Controller
// Fully Standalone Touch-First Cyberpunk / Spotify-Tier Music Client

// Global Hardware & Gesture Back Handler
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
    this.likedTracks = [];
    this.downloadedTracks = [];
    this._lastBackPress = 0;

    this.initDOM();
    this.bindEvents();
    this.initPWA();
    this.checkOnboarding();
    this.loadHomeFeed();
    this.loadLibraryData();
    this.loadDownloadsData();
    this.loadUserProfileOnStartup();
  }

  initDOM() {
    // Views
    this.views = {
      'view-discover': document.getElementById('view-discover'),
      'view-search': document.getElementById('view-search'),
      'view-library': document.getElementById('view-library'),
      'view-downloads': document.getElementById('view-downloads'),
      'view-album-detail': document.getElementById('view-album-detail'),
      'view-artist-detail': document.getElementById('view-artist-detail')
    };
    this.navBtns = document.querySelectorAll('.nav-tab-btn');

    // Top Filter Pills
    this.topFilterPillsContainer = document.getElementById('top-filter-pills');
    this.topFilterPills = document.querySelectorAll('.top-filter-pill');

    // Home Sections
    this.jumpBackRow = document.getElementById('jump-back-row');
    this.recentsRow = document.getElementById('recents-row');
    this.trendingHitsRow = document.getElementById('trending-hits-row');
    this.dailyPicksRow = document.getElementById('daily-picks-row');
    this.topMixesRow = document.getElementById('top-mixes-row');
    this.popularAlbumsRow = document.getElementById('popular-albums-row');
    this.podcastsRow = document.getElementById('podcasts-row');
    this.dailyTagDate = document.getElementById('daily-tag-date');

    // Search
    this.btnSearchBack = document.getElementById('btn-search-back');
    this.searchInput = document.getElementById('mobile-search-input');
    this.btnSearchClear = document.getElementById('btn-search-clear');
    this.searchChips = document.querySelectorAll('.search-filter-chips .chip-btn');
    this.searchFilterChipsContainer = document.getElementById('search-filter-chips');
    this.searchDefaultContainer = document.getElementById('search-default-container');
    this.searchBrowseGrid = document.getElementById('search-browse-grid');
    this.searchRecentBox = document.getElementById('search-recent-box');
    this.recentSearchesList = document.getElementById('recent-searches-list');
    this.btnClearRecentSearches = document.getElementById('btn-clear-recent-searches');
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
    this.btnPlayAllCrate = document.getElementById('btn-play-all-crate');
    this.btnDeleteActiveCrate = document.getElementById('btn-delete-active-crate');
    this.libraryFilterChips = document.querySelectorAll('[data-lib-filter]');
    this.librarySearchInput = document.getElementById('library-search-input');
    this.btnLibrarySort = document.getElementById('btn-library-sort');
    this.currentLibFilter = 'all';
    this.currentLibSort = 'recent';

    // Detail Views (Album & Artist)
    this.btnBackFromAlbum = document.getElementById('btn-back-from-album');
    this.albumDetailCover = document.getElementById('album-detail-cover');
    this.albumDetailTitle = document.getElementById('album-detail-title');
    this.albumDetailArtist = document.getElementById('album-detail-artist');
    this.btnAlbumPlayAll = document.getElementById('btn-album-play-all');
    this.btnAlbumShuffle = document.getElementById('btn-album-shuffle');
    this.albumTracksList = document.getElementById('album-tracks-list');
    this.activeAlbumTracks = [];

    this.btnBackFromArtist = document.getElementById('btn-back-from-artist');
    this.artistDetailAvatar = document.getElementById('artist-detail-avatar');
    this.artistDetailName = document.getElementById('artist-detail-name');
    this.btnArtistPlayTop = document.getElementById('btn-artist-play-top');
    this.artistTracksList = document.getElementById('artist-tracks-list');
    this.activeArtistTracks = [];

    // Sheet Player Elements
    this.playerSheet = document.getElementById('player-sheet');
    this.btnSheetDismiss = document.getElementById('btn-sheet-dismiss');
    this.miniPlayer = document.getElementById('mini-player');
    this.miniTouchArea = document.getElementById('mini-info-touch-area');

    // Downloads Elements
    this.inputYtDownloadUrl = document.getElementById('input-yt-download-url');
    this.btnStartYtDownload = document.getElementById('btn-start-yt-download');
    this.activeDownloadsCard = document.getElementById('active-downloads-card');
    this.downloadActiveTitle = document.getElementById('download-active-title');
    this.downloadSpeedTag = document.getElementById('download-speed-tag');
    this.downloadProgressBar = document.getElementById('download-progress-bar');
    this.downloadPercentTag = document.getElementById('download-percent-tag');
    this.downloadsCountLabel = document.getElementById('downloads-count-label');
    this.btnPlayAllDownloads = document.getElementById('btn-play-all-downloads');
    this.downloadedTracksList = document.getElementById('downloaded-tracks-list');

    // Onboarding Modal
    this.modalOnboarding = document.getElementById('modal-genre-onboarding');
    this.btnConfirmOnboarding = document.getElementById('btn-confirm-onboarding');
    this.onboardChips = document.querySelectorAll('.onboard-chip');

    // Custom Crates Modals
    this.modalAddPlaylist = document.getElementById('modal-add-playlist');
    this.btnClosePlaylistModal = document.getElementById('btn-close-playlist-modal');
    this.modalCratesList = document.getElementById('modal-crates-list');
    this.modalCreateCrate = document.getElementById('modal-create-crate');
    this.btnCloseCreateModal = document.getElementById('btn-close-create-modal');
    this.inputCrateName = document.getElementById('input-crate-name');
    this.inputCrateDesc = document.getElementById('input-crate-desc');
    this.btnConfirmCreateCrate = document.getElementById('btn-confirm-create-crate');

    // Profile Elements
    this.btnOpenProfile = document.getElementById('btn-open-profile');
    this.modalProfile = document.getElementById('modal-profile');
    this.btnCloseProfile = document.getElementById('btn-close-profile');
    this.btnReopenGenres = document.getElementById('btn-reopen-genres');
    this.inputProfileName = document.getElementById('input-profile-name');
    this.profileLikesCount = document.getElementById('profile-likes-count');
    this.profileCratesCount = document.getElementById('profile-crates-count');
    this.btnSaveProfile = document.getElementById('btn-save-profile');
    this.topAvatarInitial = document.getElementById('top-avatar-initial');

    // Toast
    this.toast = document.getElementById('mobile-toast');
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

    // Top Filter Pills
    this.topFilterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        this.topFilterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const filter = pill.getAttribute('data-filter');
        this.filterHomeFeed(filter);
      });
    });

    // Search events
    if (this.btnSearchBack) {
      this.btnSearchBack.addEventListener('click', () => {
        this.switchView('view-discover');
      });
    }

    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        const val = e.target.value;
        if (this.btnSearchClear) this.btnSearchClear.style.display = val.length > 0 ? 'flex' : 'none';
        clearTimeout(this.searchDebounceTimer);
        this.searchDebounceTimer = setTimeout(() => {
          this.executeSearch(val);
        }, 280);
      });
    }

    if (this.btnSearchClear) {
      this.btnSearchClear.addEventListener('click', () => {
        this.searchInput.value = '';
        this.btnSearchClear.style.display = 'none';
        if (this.searchFilterChipsContainer) this.searchFilterChipsContainer.style.display = 'none';
        if (this.searchResultsList) this.searchResultsList.style.display = 'none';
        if (this.searchDefaultContainer) this.searchDefaultContainer.style.display = 'block';
        this.loadRecentSearches();
        this.searchInput.focus();
      });
    }

    if (this.btnClearRecentSearches) {
      this.btnClearRecentSearches.addEventListener('click', () => {
        try { localStorage.removeItem('etsuko_recent_searches'); } catch (e) {}
        if (this.searchRecentBox) this.searchRecentBox.style.display = 'none';
      });
    }

    this.searchChips.forEach(chip => {
      chip.addEventListener('click', () => {
        this.searchChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.currentSearchFilter = chip.getAttribute('data-filter') || 'songs';
        if (this.searchInput.value.trim()) {
          this.executeSearch(this.searchInput.value.trim());
        }
      });
    });

    // Library Filter Chips & In-Library Search
    this.libraryFilterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        this.libraryFilterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.currentLibFilter = chip.getAttribute('data-lib-filter') || 'all';
        this.applyLibraryFilter();
      });
    });

    if (this.librarySearchInput) {
      this.librarySearchInput.addEventListener('input', () => {
        this.applyLibraryFilter();
      });
    }

    if (this.btnLibrarySort) {
      this.btnLibrarySort.addEventListener('click', () => {
        this.currentLibSort = this.currentLibSort === 'recent' ? 'alpha' : 'recent';
        this.showToast(this.currentLibSort === 'recent' ? 'Sorted by Recently Added' : 'Sorted Alphabetically');
        this.applyLibraryFilter();
      });
    }

    // Detail Views (Album & Artist) Navigation Events
    if (this.btnBackFromAlbum) {
      this.btnBackFromAlbum.addEventListener('click', () => {
        this.switchView('view-discover');
      });
    }

    if (this.btnAlbumPlayAll) {
      this.btnAlbumPlayAll.addEventListener('click', () => {
        if (this.activeAlbumTracks && this.activeAlbumTracks.length > 0) {
          window.player.playTrack(this.activeAlbumTracks[0], this.activeAlbumTracks);
          this.openPlayerSheet();
        }
      });
    }

    if (this.btnAlbumShuffle) {
      this.btnAlbumShuffle.addEventListener('click', () => {
        if (this.activeAlbumTracks && this.activeAlbumTracks.length > 0) {
          const shuffled = [...this.activeAlbumTracks].sort(() => Math.random() - 0.5);
          window.player.playTrack(shuffled[0], shuffled);
          this.openPlayerSheet();
        }
      });
    }

    if (this.btnBackFromArtist) {
      this.btnBackFromArtist.addEventListener('click', () => {
        this.switchView('view-discover');
      });
    }

    if (this.btnArtistPlayTop) {
      this.btnArtistPlayTop.addEventListener('click', () => {
        if (this.activeArtistTracks && this.activeArtistTracks.length > 0) {
          window.player.playTrack(this.activeArtistTracks[0], this.activeArtistTracks);
          this.openPlayerSheet();
        }
      });
    }

    // Downloads Search
    if (this.downloadsSearchInput) {
      this.downloadsSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        this.filterDownloadedTracks(query);
      });
    }

    // Library Events
    if (this.cardLikes) {
      this.cardLikes.addEventListener('click', (e) => {
        if (e.target.closest('#btn-play-all-likes')) return;
        this.openLikedSongsView();
      });
    }

    if (this.btnPlayAllLikes) {
      this.btnPlayAllLikes.addEventListener('click', (e) => {
        e.stopPropagation();
        this.playAllLikedSongs();
      });
    }

    if (this.btnBackToCrates) {
      this.btnBackToCrates.addEventListener('click', () => {
        this.activeCrateId = null;
        this.playlistDetailView.style.display = 'none';
        this.cardLikes.style.display = 'block';
        this.playlistsList.style.display = 'flex';
      });
    }

    if (this.btnPlayAllCrate) {
      this.btnPlayAllCrate.addEventListener('click', () => {
        if (this.activeCrateTracks && this.activeCrateTracks.length > 0) {
          window.player.playTrack(this.activeCrateTracks[0], this.activeCrateTracks);
          this.openPlayerSheet();
        }
      });
    }

    // Downloads Link Downloader
    if (this.btnStartYtDownload) {
      this.btnStartYtDownload.addEventListener('click', () => {
        const url = this.inputYtDownloadUrl ? this.inputYtDownloadUrl.value : '';
        if (!url || !url.trim()) {
          this.showToast('Please paste a YouTube link or video ID');
          return;
        }
        this.btnStartYtDownload.style.transform = 'scale(0.88)';
        setTimeout(() => { this.btnStartYtDownload.style.transform = 'scale(1.0)'; }, 150);
        this.showToast('Connecting stream & starting download...');
        if (window.downloader) {
          window.downloader.downloadFromUrl(url.trim());
          this.inputYtDownloadUrl.value = '';
        }
      });
    }

    if (this.btnPlayAllDownloads) {
      this.btnPlayAllDownloads.addEventListener('click', () => {
        this.playAllDownloads();
      });
    }

    // Mini Player tap opens Full Screen Player Sheet
    if (this.miniPlayer) {
      this.miniPlayer.addEventListener('click', (e) => {
        if (e.target.closest('.btn-mini-control')) return;
        this.openPlayerSheet();
      });
    }

    if (this.btnSheetDismiss) {
      this.btnSheetDismiss.addEventListener('click', () => {
        this.closePlayerSheet();
      });
    }

    // Downloads Engine Event Listeners
    window.addEventListener('etsuko:download-started', (e) => {
      const task = e.detail;
      this.showActiveDownloadCard(task);
    });

    window.addEventListener('etsuko:download-progress', (e) => {
      const task = e.detail;
      this.updateActiveDownloadCard(task);
    });

    window.addEventListener('etsuko:download-complete', (e) => {
      this.hideActiveDownloadCard();
      this.loadDownloadsData();
    });

    window.addEventListener('etsuko:download-deleted', () => {
      this.loadDownloadsData();
    });

    // Profile Modals
    if (this.btnOpenProfile) {
      this.btnOpenProfile.addEventListener('click', () => {
        this.openProfileModal();
      });
    }

    if (this.btnCloseProfile) {
      this.btnCloseProfile.addEventListener('click', () => {
        this.modalProfile.classList.remove('active');
      });
    }

    if (this.btnReopenGenres) {
      this.btnReopenGenres.addEventListener('click', () => {
        this.modalProfile.classList.remove('active');
        this.openOnboardingModal();
      });
    }

    if (this.btnSaveProfile) {
      this.btnSaveProfile.addEventListener('click', () => {
        this.saveProfile();
      });
    }

    // Onboarding Chips
    this.onboardChips.forEach(chip => {
      chip.addEventListener('click', () => {
        chip.classList.toggle('selected');
      });
    });

    if (this.btnConfirmOnboarding) {
      this.btnConfirmOnboarding.addEventListener('click', () => {
        const selected = [];
        this.onboardChips.forEach(c => {
          if (c.classList.contains('selected')) selected.push(c.getAttribute('data-genre'));
        });
        if (window.api) window.api.saveUserGenres(selected.length > 0 ? selected : ['english', 'hindi', 'phonk']);
        this.modalOnboarding.classList.remove('active');
        this.showToast('Preferences saved! Refreshing your daily feed.');
        this.loadHomeFeed();
      });
    }

    // Recents update event
    window.addEventListener('etsuko:recents-updated', () => {
      this.loadHomeFeed();
    });
  }

  initPWA() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }

  checkOnboarding() {
    if (window.api && !window.api.getUserGenres()) {
      setTimeout(() => this.openOnboardingModal(), 500);
    }
  }

  openOnboardingModal() {
    if (this.modalOnboarding) {
      const saved = window.api ? window.api.getUserGenres() || [] : [];
      this.onboardChips.forEach(c => {
        const g = c.getAttribute('data-genre');
        c.classList.toggle('selected', saved.includes(g));
      });
      this.modalOnboarding.classList.add('active');
    }
  }

  switchView(viewId) {
    if (!this.views[viewId]) return;
    this.currentView = viewId;

    Object.keys(this.views).forEach(key => {
      this.views[key].classList.toggle('active', key === viewId);
    });

    this.navBtns.forEach(btn => {
      const match = btn.getAttribute('data-view') === viewId;
      btn.classList.toggle('active', match);
    });

    // The filter pills [All], [Music], [Podcasts] should ONLY show on Home (view-discover)!
    if (this.topFilterPillsContainer) {
      this.topFilterPillsContainer.style.display = (viewId === 'view-discover') ? 'flex' : 'none';
    }

    const viewport = document.getElementById('view-viewport');
    if (viewport) viewport.scrollTo({ top: 0, behavior: 'smooth' });

    if (viewId === 'view-library') this.loadLibraryData();
    if (viewId === 'view-downloads') this.loadDownloadsData();
  }

  // --- Spotify-Style Home Feed Loading ---
  async loadHomeFeed() {
    try {
      this.updateGreetingHeader();
      const feed = await window.api.getHomeFeed();

      // Today date tag
      if (this.dailyTagDate) {
        const d = new Date();
        const options = { month: 'short', day: 'numeric' };
        this.dailyTagDate.textContent = d.toLocaleDateString('en-US', options).toUpperCase();
      }

      // Jump back in & Recents: ONLY display if user has actual history!
      const jumpSection = document.getElementById('section-jump-back');
      const recentsSection = document.getElementById('section-recents');
      const hasHistory = feed.recents && feed.recents.length > 0;

      if (jumpSection) jumpSection.style.display = hasHistory ? 'block' : 'none';
      if (recentsSection) recentsSection.style.display = hasHistory ? 'block' : 'none';

      if (hasHistory) {
        this.renderHorizontalRow(this.jumpBackRow, feed.jumpBackIn);
        this.renderHorizontalRow(this.recentsRow, feed.recents);
      }

      this.renderHorizontalRow(this.trendingHitsRow, feed.trendingHits);
      this.renderHorizontalRow(this.dailyPicksRow, feed.dailyPicks);
      this.renderTopMixes(this.topMixesRow, feed.topMixes);
      this.renderHorizontalRow(this.popularAlbumsRow, feed.popularAlbums, true);
      this.renderHorizontalRow(this.podcastsRow, feed.podcasts);
    } catch (e) {
      console.warn('[HomeFeed] Error:', e);
    }
  }

  getThumbnailSrc(track) {
    if (!track) return 'assets/default_cover.png';
    if (track.thumbnail && typeof track.thumbnail === 'string') {
      if (track.thumbnail.includes('googleusercontent.com') || track.thumbnail.includes('ggpht.com')) {
        return track.thumbnail.replace(/=w\d+-h\d+[^"]*/, '=w544-h544-l90-rj');
      }
      return track.thumbnail;
    }
    if (track.videoId) {
      return `https://i.ytimg.com/vi/${track.videoId}/hqdefault.jpg`;
    }
    return 'assets/default_cover.png';
  }

  getImgFallbackAttr(videoId) {
    if (!videoId) return `onerror="this.src='assets/default_cover.png'"`;
    return `onerror="if(!this.dataset.t1){this.dataset.t1='1';this.src='https://i.ytimg.com/vi/${videoId}/hqdefault.jpg';}else if(!this.dataset.t2){this.dataset.t2='1';this.src='https://i.ytimg.com/vi/${videoId}/mqdefault.jpg';}else{this.src='assets/default_cover.png';}"`;
  }

  renderHorizontalRow(container, tracks, isAlbum = false) {
    if (!container) return;
    container.innerHTML = '';

    (tracks || []).forEach(track => {
      const card = document.createElement('div');
      card.className = 'spotify-card';
      const isLiked = window.api ? window.api.isLiked(track.videoId) : false;

      card.innerHTML = `
        <div class="spotify-card-cover-box">
          <img src="${this.getThumbnailSrc(track)}" class="spotify-card-cover" alt="Cover" ${this.getImgFallbackAttr(track.videoId)}>
          <button class="spotify-card-play-btn" title="Play">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>
          </button>
        </div>
        <div class="spotify-card-meta">
          <span class="spotify-card-tag">${isAlbum ? 'Album' : (track.tag || 'Track')}</span>
          <div class="spotify-card-title">${this.escapeHtml(isAlbum && track.album && track.album !== 'Top Hit' && track.album !== 'Single' ? track.album : track.title)}</div>
          <div class="spotify-card-artist">${this.escapeHtml(track.artist)}</div>
        </div>
      `;

      card.addEventListener('click', (e) => {
        if (isAlbum) {
          if (e.target.closest('.spotify-card-play-btn')) {
            window.player.playTrack(track, tracks);
            this.openPlayerSheet();
          } else {
            this.openAlbumDetail(track, tracks);
          }
        } else {
          window.player.playTrack(track, tracks);
          this.openPlayerSheet();
        }
      });

      container.appendChild(card);
    });
  }

  renderTopMixes(container, mixes) {
    if (!container) return;
    container.innerHTML = '';

    (mixes || []).forEach(mix => {
      const card = document.createElement('div');
      card.className = 'spotify-mix-card';

      const t1 = mix.tracks?.[0];
      const t2 = mix.tracks?.[1];
      const t3 = mix.tracks?.[2];
      const t4 = mix.tracks?.[3];

      card.innerHTML = `
        <div class="spotify-mix-artwork-grid">
          <img src="${this.getThumbnailSrc(t1)}" class="spotify-mix-art-thumb" alt="" ${this.getImgFallbackAttr(t1?.videoId)}>
          <img src="${this.getThumbnailSrc(t2)}" class="spotify-mix-art-thumb" alt="" ${this.getImgFallbackAttr(t2?.videoId)}>
          <img src="${this.getThumbnailSrc(t3)}" class="spotify-mix-art-thumb" alt="" ${this.getImgFallbackAttr(t3?.videoId)}>
          <img src="${this.getThumbnailSrc(t4)}" class="spotify-mix-art-thumb" alt="" ${this.getImgFallbackAttr(t4?.videoId)}>
        </div>
        <div class="spotify-mix-info-box" style="border-top: 3px solid ${mix.bannerColor || '#10b981'};">
          <button class="spotify-mix-play-btn" title="Play Mix">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>
          </button>
          <div class="spotify-mix-banner">${this.escapeHtml(mix.title)}</div>
          <div class="spotify-mix-sub">${this.escapeHtml(mix.subtitle)}</div>
        </div>
      `;

      card.addEventListener('click', () => {
        if (mix.tracks && mix.tracks.length > 0) {
          window.player.playTrack(mix.tracks[0], mix.tracks);
          this.openPlayerSheet();
        }
      });

      container.appendChild(card);
    });
  }

  filterHomeFeed(filter) {
    const jumpSection = document.getElementById('section-jump-back');
    const recentsSection = document.getElementById('section-recents');
    const trendingSection = document.getElementById('section-trending-hits');
    const dailySection = document.getElementById('section-daily-picks');
    const mixesSection = document.getElementById('section-top-mixes');
    const albumsSection = document.getElementById('section-popular-albums');
    const podcastsSection = document.getElementById('section-podcasts');

    const hasHistory = window.api && window.api.getRecentTracks().length > 0;

    if (filter === 'all') {
      if (jumpSection) jumpSection.style.display = hasHistory ? 'block' : 'none';
      if (recentsSection) recentsSection.style.display = hasHistory ? 'block' : 'none';
      [trendingSection, dailySection, mixesSection, albumsSection, podcastsSection].forEach(s => s && (s.style.display = 'block'));
    } else if (filter === 'music') {
      if (jumpSection) jumpSection.style.display = hasHistory ? 'block' : 'none';
      if (recentsSection) recentsSection.style.display = hasHistory ? 'block' : 'none';
      [trendingSection, dailySection, mixesSection, albumsSection].forEach(s => s && (s.style.display = 'block'));
      if (podcastsSection) podcastsSection.style.display = 'none';
    } else { // podcasts
      [jumpSection, recentsSection, trendingSection, dailySection, albumsSection].forEach(s => s && (s.style.display = 'none'));
      [mixesSection, podcastsSection].forEach(s => s && (s.style.display = 'block'));
    }
  }

  updateGreetingHeader() {
    const greetingEl = document.getElementById('home-greeting-text');
    if (!greetingEl) return;
    const hour = new Date().getHours();
    let greet = 'Good evening';
    if (hour >= 5 && hour < 12) greet = 'Good morning';
    else if (hour >= 12 && hour < 17) greet = 'Good afternoon';
    else if (hour >= 17 && hour < 22) greet = 'Good evening';
    else greet = 'Late night vibes';

    let username = '';
    try {
      const profile = localStorage.getItem('etsuko_user_profile');
      if (profile) {
        const parsed = JSON.parse(profile);
        if (parsed && parsed.name) username = parsed.name.trim();
      }
    } catch (e) {}

    greetingEl.textContent = username ? `${greet}, ${username}` : greet;
  }

  // --- Search Engine (Instant, Browse Categories, Recent Searches) ---
  initSearchTabState() {
    this.renderBrowseCategories();
    this.loadRecentSearches();
    if (!this.searchInput || !this.searchInput.value.trim()) {
      if (this.searchDefaultContainer) this.searchDefaultContainer.style.display = 'block';
      if (this.searchFilterChipsContainer) this.searchFilterChipsContainer.style.display = 'none';
      if (this.searchResultsList) {
        this.searchResultsList.style.display = 'none';
        this.searchResultsList.innerHTML = '';
      }
    }
  }

  renderBrowseCategories() {
    if (!this.searchBrowseGrid) return;
    const categories = [
      { id: 'pop', name: 'Pop Hits', badge: 'CHARTS', bg: 'linear-gradient(135deg, #ec4899, #8b5cf6)', icon: '🎵', query: 'Top Pop Hits 2024' },
      { id: 'hindi', name: 'Bollywood Romance', badge: 'TRENDING', bg: 'linear-gradient(135deg, #f43f5e, #fb923c)', icon: '🇮🇳', query: 'Bollywood Romantic Melodies' },
      { id: 'punjabi', name: 'Punjabi Heat', badge: 'VIRAL', bg: 'linear-gradient(135deg, #f59e0b, #ef4444)', icon: '🪕', query: 'Punjabi Hot Hits' },
      { id: 'phonk', name: 'Phonk & Drift', badge: 'ENERGY', bg: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', icon: '⚡', query: 'Drift Phonk Best' },
      { id: 'hiphop', name: 'Hip-Hop / Rap', badge: 'BEATS', bg: 'linear-gradient(135deg, #ea580c, #b91c1c)', icon: '🔥', query: 'Hip Hop Rap Hits' },
      { id: 'lofi', name: 'Lofi Chill Study', badge: 'CALM', bg: 'linear-gradient(135deg, #10b981, #0284c7)', icon: '☕', query: 'Lofi Hip Hop Study Session' },
      { id: 'rock', name: 'Rock & Metal', badge: 'CLASSIC', bg: 'linear-gradient(135deg, #e11d48, #475569)', icon: '🎸', query: 'Rock Anthems' },
      { id: 'telugu', name: 'South Mega Hits', badge: 'HOT', bg: 'linear-gradient(135deg, #6366f1, #06b6d4)', icon: '💫', query: 'Telugu Hits 2024' },
      { id: 'workout', name: 'Workout Gym Beats', badge: 'FOCUS', bg: 'linear-gradient(135deg, #84cc16, #059669)', icon: '🏃', query: 'Gym Workout Music' },
      { id: 'gaming', name: 'Gaming Night', badge: 'DRIVE', bg: 'linear-gradient(135deg, #06b6d4, #3b82f6)', icon: '🎮', query: 'Gaming Beats EDM' },
      { id: 'chill', name: 'Late Night Drive', badge: 'NIGHT', bg: 'linear-gradient(135deg, #4f46e5, #0f172a)', icon: '🌙', query: 'Late Night Chill Songs' },
      { id: 'podcasts', name: 'Top Podcasts', badge: 'TALK', bg: 'linear-gradient(135deg, #a855f7, #6366f1)', icon: '🎙️', query: 'Popular Podcasts Audio' }
    ];

    this.searchBrowseGrid.innerHTML = '';
    categories.forEach(cat => {
      const card = document.createElement('div');
      card.className = 'search-genre-card';
      card.style.background = cat.bg;
      card.innerHTML = `
        <div class="search-genre-title">${cat.name}</div>
        <div class="search-genre-badge">${cat.badge}</div>
        <div class="search-genre-icon">${cat.icon}</div>
      `;
      card.addEventListener('click', () => {
        if (this.searchInput) {
          this.searchInput.value = cat.name;
          if (this.btnSearchClear) this.btnSearchClear.style.display = 'flex';
          this.saveRecentSearch(cat.name);
          this.executeSearch(cat.query);
        }
      });
      this.searchBrowseGrid.appendChild(card);
    });
  }

  loadRecentSearches() {
    if (!this.searchRecentBox || !this.recentSearchesList) return;
    try {
      const raw = localStorage.getItem('etsuko_recent_searches');
      const list = raw ? JSON.parse(raw) : [];
      if (list.length === 0) {
        this.searchRecentBox.style.display = 'none';
        return;
      }
      this.searchRecentBox.style.display = 'block';
      this.recentSearchesList.innerHTML = '';
      list.slice(0, 6).forEach(q => {
        const chip = document.createElement('div');
        chip.className = 'recent-search-chip';
        chip.innerHTML = `
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <span>${this.escapeHtml(q)}</span>
        `;
        chip.addEventListener('click', () => {
          if (this.searchInput) {
            this.searchInput.value = q;
            if (this.btnSearchClear) this.btnSearchClear.style.display = 'flex';
            this.executeSearch(q);
          }
        });
        this.recentSearchesList.appendChild(chip);
      });
    } catch (e) {
      this.searchRecentBox.style.display = 'none';
    }
  }

  saveRecentSearch(query) {
    if (!query || !query.trim()) return;
    try {
      const q = query.trim();
      const raw = localStorage.getItem('etsuko_recent_searches');
      let list = raw ? JSON.parse(raw) : [];
      list = list.filter(item => item.toLowerCase() !== q.toLowerCase());
      list.unshift(q);
      if (list.length > 10) list = list.slice(0, 10);
      localStorage.setItem('etsuko_recent_searches', JSON.stringify(list));
      this.loadRecentSearches();
    } catch (e) {}
  }

  async executeSearch(query) {
    if (!query || !query.trim()) {
      if (this.searchDefaultContainer) this.searchDefaultContainer.style.display = 'block';
      if (this.searchFilterChipsContainer) this.searchFilterChipsContainer.style.display = 'none';
      if (this.searchResultsList) {
        this.searchResultsList.style.display = 'none';
        this.searchResultsList.innerHTML = '';
      }
      this.loadRecentSearches();
      return;
    }

    const q = query.trim();
    if (this.searchDefaultContainer) this.searchDefaultContainer.style.display = 'none';
    if (this.searchFilterChipsContainer) this.searchFilterChipsContainer.style.display = 'flex';
    if (this.searchResultsList) this.searchResultsList.style.display = 'block';

    const reqId = ++this.currentSearchRequestId;
    if (this.searchAbortController) {
      this.searchAbortController.abort();
    }
    this.searchAbortController = new AbortController();

    this.searchResultsList.innerHTML = `
      <div style="padding: 32px 16px; text-align: center; color: var(--text-muted); font-size: 13px;">
        <div class="search-pulse-dot"></div>
        Searching catalog...
      </div>
    `;

    try {
      const data = await window.api.search(q, this.currentSearchFilter, this.searchAbortController.signal);
      if (reqId !== this.currentSearchRequestId) return;

      const results = data.results || [];
      this.saveRecentSearch(q);
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
        <div style="padding: 32px 16px; text-align: center; color: var(--text-muted); font-size: 13px;">
          No matching results found.
        </div>
      `;
      return;
    }

    if (this.currentSearchFilter === 'artists') {
      items.forEach(item => {
        const row = document.createElement('div');
        row.className = 'track-row';
        row.innerHTML = `
          <img src="${this.getThumbnailSrc(item)}" class="track-row-thumb" alt="Artist" style="border-radius: 50%; width: 46px; height: 46px; object-fit: cover; border: 1.5px solid var(--accent-cyan);" ${this.getImgFallbackAttr(item.videoId)}>
          <div class="track-row-info">
            <div class="track-row-title">${this.escapeHtml(item.artist || item.title)}</div>
            <div class="track-row-artist" style="color: var(--accent-cyan); font-weight: 700;">Verified Artist • Popular: ${this.escapeHtml(item.title)}</div>
          </div>
          <div class="track-row-actions">
            <button class="btn-track-action" title="Open Artist Profile" style="color: var(--accent-cyan);">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>
            </button>
          </div>
        `;
        row.addEventListener('click', () => {
          this.openArtistDetail(item.artist || item.title, this.getThumbnailSrc(item), items);
        });
        this.searchResultsList.appendChild(row);
      });
      return;
    }

    if (this.currentSearchFilter === 'albums') {
      items.forEach(item => {
        const row = document.createElement('div');
        row.className = 'track-row';
        row.innerHTML = `
          <img src="${this.getThumbnailSrc(item)}" class="track-row-thumb" alt="Album" style="border-radius: 10px; width: 48px; height: 48px; object-fit: cover;" ${this.getImgFallbackAttr(item.videoId)}>
          <div class="track-row-info">
            <div class="track-row-title">${this.escapeHtml(item.album && item.album !== 'Top Hit' && item.album !== 'Single' ? item.album : item.title)}</div>
            <div class="track-row-artist">Album • ${this.escapeHtml(item.artist)}</div>
          </div>
          <div class="track-row-actions">
            <button class="btn-track-action" title="Open Album" style="color: var(--accent-cyan);">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>
            </button>
          </div>
        `;
        row.addEventListener('click', () => {
          this.openAlbumDetail(item, items);
        });
        this.searchResultsList.appendChild(row);
      });
      return;
    }

    // Default 'songs' (Tracks)
    items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'track-row';
      const isLiked = window.api.isLiked(item.videoId);

      row.innerHTML = `
        <img src="${this.getThumbnailSrc(item)}" class="track-row-thumb" alt="Track" ${this.getImgFallbackAttr(item.videoId)}>
        <div class="track-row-info">
          <div class="track-row-title">${this.escapeHtml(item.title)}</div>
          <div class="track-row-artist">${this.escapeHtml(item.artist)} • ${this.escapeHtml(item.album || 'Single')}</div>
        </div>
        <div class="track-row-actions">
          <button class="btn-track-action btn-dl-row" title="Download Offline">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          </button>
          <button class="btn-track-action btn-like-row ${isLiked ? 'liked' : ''}" title="Like">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="${isLiked ? '#ec4899' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </button>
        </div>
      `;

      const btnDl = row.querySelector('.btn-dl-row');
      btnDl.addEventListener('click', (e) => {
        e.stopPropagation();
        btnDl.classList.add('downloading-pulse');
        btnDl.style.transform = 'scale(0.78)';
        setTimeout(() => { btnDl.style.transform = 'scale(1.25)'; }, 140);
        setTimeout(() => { btnDl.style.transform = 'scale(1.0)'; }, 280);
        this.showToast(`Starting download: ${item.title}`);
        if (window.downloader) window.downloader.startDownload(item);
      });

      row.querySelector('.btn-like-row').addEventListener('click', async (e) => {
        e.stopPropagation();
        await this.toggleTrackLike(item);
        const nowLiked = window.api.isLiked(item.videoId);
        const btn = row.querySelector('.btn-like-row');
        btn.classList.toggle('liked', nowLiked);
        btn.querySelector('svg').setAttribute('fill', nowLiked ? '#ec4899' : 'none');
      });

      row.addEventListener('click', () => {
        window.player.playTrack(item, items);
        this.openPlayerSheet();
      });

      this.searchResultsList.appendChild(row);
    });
  }

  // --- Detail Views (Album & Artist) Navigation ---
  openAlbumDetail(albumItem, trackPool = []) {
    if (!this.views['view-album-detail']) return;

    const title = albumItem.album && albumItem.album !== 'Top Hit' && albumItem.album !== 'Single' ? albumItem.album : albumItem.title;
    const artist = albumItem.artist || 'Featured Artist';
    const thumb = this.getThumbnailSrc(albumItem);

    if (this.albumDetailTitle) this.albumDetailTitle.textContent = title;
    if (this.albumDetailArtist) this.albumDetailArtist.textContent = artist;
    if (this.albumDetailCover) this.albumDetailCover.src = thumb;

    const matching = trackPool.filter(t => (t.album && t.album === title) || (t.artist && t.artist.toLowerCase() === artist.toLowerCase()));
    const finalTracks = matching.length > 0 ? matching : [albumItem, ...trackPool.slice(0, 6)];
    this.activeAlbumTracks = finalTracks;

    if (this.albumTracksList) {
      this.albumTracksList.innerHTML = '';
      finalTracks.forEach((track, idx) => {
        const row = document.createElement('div');
        row.className = 'track-row';
        row.innerHTML = `
          <div style="font-size: 12px; font-weight: 700; color: var(--text-muted); width: 22px; text-align: center;">${idx + 1}</div>
          <img src="${this.getThumbnailSrc(track)}" class="track-row-thumb" alt="Track" ${this.getImgFallbackAttr(track.videoId)}>
          <div class="track-row-info">
            <div class="track-row-title">${this.escapeHtml(track.title)}</div>
            <div class="track-row-artist">${this.escapeHtml(track.artist)} • ${this.escapeHtml(track.duration || '3:30')}</div>
          </div>
          <button class="btn-track-action" title="Play">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>
          </button>
        `;
        row.addEventListener('click', () => {
          window.player.playTrack(track, finalTracks);
          this.openPlayerSheet();
        });
        this.albumTracksList.appendChild(row);
      });
    }

    this.switchView('view-album-detail');
  }

  openArtistDetail(artistName, avatarUrl, trackPool = []) {
    if (!this.views['view-artist-detail']) return;

    if (this.artistDetailName) this.artistDetailName.textContent = artistName;
    if (this.artistDetailAvatar) this.artistDetailAvatar.src = avatarUrl || 'assets/default_cover.png';

    const matching = trackPool.filter(t => t.artist && t.artist.toLowerCase().includes(artistName.toLowerCase()));
    const finalTracks = matching.length > 0 ? matching : trackPool.slice(0, 8);
    this.activeArtistTracks = finalTracks;

    if (this.artistTracksList) {
      this.artistTracksList.innerHTML = '';
      finalTracks.forEach((track, idx) => {
        const row = document.createElement('div');
        row.className = 'track-row';
        row.innerHTML = `
          <div style="font-size: 12px; font-weight: 700; color: var(--accent-cyan); width: 22px; text-align: center;">${idx + 1}</div>
          <img src="${this.getThumbnailSrc(track)}" class="track-row-thumb" alt="Track" ${this.getImgFallbackAttr(track.videoId)}>
          <div class="track-row-info">
            <div class="track-row-title">${this.escapeHtml(track.title)}</div>
            <div class="track-row-artist">${this.escapeHtml(track.album || 'Top Hit')} • ${this.escapeHtml(track.duration || '3:30')}</div>
          </div>
          <button class="btn-track-action" title="Play">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"></polygon></svg>
          </button>
        `;
        row.addEventListener('click', () => {
          window.player.playTrack(track, finalTracks);
          this.openPlayerSheet();
        });
        this.artistTracksList.appendChild(row);
      });
    }

    this.switchView('view-artist-detail');
  }

  applyLibraryFilter() {
    const q = (this.librarySearchInput ? this.librarySearchInput.value : '').toLowerCase().trim();
    const filter = this.currentLibFilter || 'all';

    if (this.cardLikes) {
      this.cardLikes.style.display = (filter === 'all' || filter === 'liked') && !q ? 'block' : 'none';
    }

    const cratesHeader = document.getElementById('header-crates-title');
    if (cratesHeader) {
      cratesHeader.style.display = (filter === 'all' || filter === 'playlists') ? 'flex' : 'none';
    }

    if (this.playlistsList) {
      if (filter === 'liked') {
        this.playlistsList.style.display = 'none';
      } else {
        this.playlistsList.style.display = 'flex';
        const items = this.playlistsList.querySelectorAll('.track-row');
        items.forEach(item => {
          const text = item.textContent.toLowerCase();
          item.style.display = (!q || text.includes(q)) ? 'flex' : 'none';
        });
      }
    }
  }

  filterDownloadedTracks(query) {
    if (!this.downloadedTracksList) return;
    const rows = this.downloadedTracksList.querySelectorAll('.track-row');
    rows.forEach(r => {
      const txt = r.textContent.toLowerCase();
      r.style.display = (!query || txt.includes(query)) ? 'flex' : 'none';
    });
  }

  // --- Library & Liked Songs Section ---
  async loadLibraryData() {
    try {
      const likes = await window.api.getLikedTracks();
      this.likedTracks = likes;
      if (this.likesCountLabel) {
        this.likesCountLabel.textContent = `${likes.length} track${likes.length === 1 ? '' : 's'} stored`;
      }
      if (this.profileLikesCount) {
        this.profileLikesCount.textContent = `${likes.length}`;
      }

      const crates = await window.api.getPlaylists();
      this.renderCratesList(crates);
    } catch (e) {}
  }

  async openLikedSongsView() {
    this.activeCrateId = 'liked_songs_virtual';
    this.activeCrateTitle.textContent = 'Liked Songs';
    this.btnDeleteActiveCrate.style.display = 'none';
    this.cardLikes.style.display = 'none';
    this.playlistsList.style.display = 'none';
    this.playlistDetailView.style.display = 'block';

    const likes = await window.api.getLikedTracks();
    this.likedTracks = likes;
    this.activeCrateTracks = likes;
    this.renderPlaylistTracks(likes, 'liked');
  }

  playAllLikedSongs() {
    if (this.likedTracks && this.likedTracks.length > 0) {
      window.player.playTrack(this.likedTracks[0], this.likedTracks);
      this.openPlayerSheet();
    } else {
      this.showToast('No liked songs yet! Like songs by tapping the heart icon.');
    }
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
    this.btnDeleteActiveCrate.style.display = 'block';
    this.cardLikes.style.display = 'none';
    this.playlistsList.style.display = 'none';
    this.playlistDetailView.style.display = 'block';

    const pl = await window.api.getPlaylist(crateId);
    const tracks = pl.tracks || [];
    this.activeCrateTracks = tracks;
    this.renderPlaylistTracks(tracks, crateId);
  }

  renderPlaylistTracks(tracks, contextId) {
    this.playlistTracksList.innerHTML = '';
    if (!tracks || tracks.length === 0) {
      this.playlistTracksList.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-muted);">No tracks in this collection.</div>';
      return;
    }

    tracks.forEach((track, idx) => {
      const row = document.createElement('div');
      row.className = 'track-row';
      row.innerHTML = `
        <div style="font-size: 12px; font-weight: 700; color: var(--text-muted); width: 20px; text-align: center;">${idx + 1}</div>
        <img src="${this.getThumbnailSrc(track)}" class="track-row-thumb" alt="Track" ${this.getImgFallbackAttr(track.videoId)}>
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
        if (contextId === 'liked') {
          await window.api.unlikeTrack(track.videoId);
          this.openLikedSongsView();
        } else {
          await window.api.removeTrackFromPlaylist(contextId, track.videoId);
          this.openCrateDetails(contextId, this.activeCrateTitle.textContent);
        }
      });

      row.addEventListener('click', () => {
        window.player.playTrack(track, tracks);
        this.openPlayerSheet();
      });

      this.playlistTracksList.appendChild(row);
    });
  }

  async toggleTrackLike(track) {
    if (!window.api) return;
    const isNowLiked = await window.api.toggleLike(track);
    this.showToast(isNowLiked ? `Added to Liked Songs` : `Removed from Liked Songs`);
    this.loadLibraryData();
  }

  // --- Offline Downloads Section ---
  async loadDownloadsData() {
    if (!window.downloader) return;
    try {
      const tracks = await window.downloader.getAllDownloadedTracks();
      this.downloadedTracks = tracks;

      if (this.downloadsCountLabel) {
        this.downloadsCountLabel.textContent = `${tracks.length} song${tracks.length === 1 ? '' : 's'} stored offline`;
      }
      if (this.profileCratesCount) {
        this.profileCratesCount.textContent = `${tracks.length}`;
      }

      this.renderDownloadedTracksList(tracks);

      if (typeof window.downloader.getStorageStats === 'function') {
        const stats = await window.downloader.getStorageStats();
        const actualMbEl = document.getElementById('storage-actual-mb');
        const fillEl = document.getElementById('storage-meter-fill');
        const detailsEl = document.getElementById('storage-details-text');
        if (actualMbEl) actualMbEl.textContent = `${stats.actualMB} MB`;
        if (fillEl) fillEl.style.width = `${Math.min(stats.percentage, 100)}%`;
        if (detailsEl) {
          detailsEl.textContent = `${stats.actualMB} MB used by audio tracks • System estimate: ${stats.systemEstimateMB} MB (${stats.percentage}%)`;
        }
      }
    } catch (e) {
      console.warn('[Downloads] Error loading:', e);
    }
  }

  renderDownloadedTracksList(tracks) {
    if (!this.downloadedTracksList) return;
    this.downloadedTracksList.innerHTML = '';

    if (!tracks || tracks.length === 0) {
      this.downloadedTracksList.innerHTML = `
        <div style="padding: 32px 16px; text-align: center; color: var(--text-muted); font-size: 13px;">
          No offline music downloaded yet.<br>
          <span style="font-size: 11px; color: var(--accent-cyan); margin-top: 6px; display: inline-block;">
            Paste any YouTube link above or tap the download button on any song.
          </span>
        </div>
      `;
      return;
    }

    tracks.forEach((track, idx) => {
      const row = document.createElement('div');
      row.className = 'track-row';
      row.innerHTML = `
        <div style="font-size: 12px; font-weight: 700; color: #10b981; width: 20px; text-align: center;">${idx + 1}</div>
        <img src="${this.getThumbnailSrc(track)}" class="track-row-thumb" alt="Track" ${this.getImgFallbackAttr(track.videoId)}>
        <div class="track-row-info">
          <div class="track-row-title">${this.escapeHtml(track.title)}</div>
          <div class="track-row-artist" style="color: #10b981;">⚡ Offline Master • ${this.escapeHtml(track.artist)}</div>
        </div>
        <button class="btn-track-action btn-del-download" title="Delete from Offline" style="color: #ef4444;">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      `;

      row.querySelector('.btn-del-download').addEventListener('click', async (e) => {
        e.stopPropagation();
        await window.downloader.deleteDownloadedTrack(track.videoId);
        this.showToast('Removed from Offline Vault');
        this.loadDownloadsData();
      });

      row.addEventListener('click', () => {
        window.player.playTrack(track, tracks);
        this.openPlayerSheet();
      });

      this.downloadedTracksList.appendChild(row);
    });
  }

  playAllDownloads() {
    if (this.downloadedTracks && this.downloadedTracks.length > 0) {
      window.player.playTrack(this.downloadedTracks[0], this.downloadedTracks);
      this.openPlayerSheet();
    } else {
      this.showToast('No downloaded tracks yet! Paste a link to download.');
    }
  }

  showActiveDownloadCard(task) {
    if (!this.activeDownloadsCard) return;
    this.activeDownloadsCard.style.display = 'block';
    if (this.downloadActiveTitle) this.downloadActiveTitle.textContent = task.track.title || 'Downloading...';
    if (this.downloadSpeedTag) this.downloadSpeedTag.textContent = task.speedText || '1.8 MB/s';
    if (this.downloadProgressBar) this.downloadProgressBar.style.width = `${task.progress || 0}%`;
    if (this.downloadPercentTag) this.downloadPercentTag.textContent = `${task.progress || 0}%`;
  }

  updateActiveDownloadCard(task) {
    if (this.downloadSpeedTag) this.downloadSpeedTag.textContent = task.speedText || '1.8 MB/s';
    if (this.downloadProgressBar) this.downloadProgressBar.style.width = `${task.progress}%`;
    if (this.downloadPercentTag) this.downloadPercentTag.textContent = `${task.progress}%`;
  }

  hideActiveDownloadCard() {
    if (this.activeDownloadsCard) {
      setTimeout(() => {
        this.activeDownloadsCard.style.display = 'none';
      }, 1000);
    }
  }

  // --- Sheet Player Navigation ---
  openPlayerSheet() {
    if (this.playerSheet) {
      this.playerSheet.classList.add('active');
    }
  }

  closePlayerSheet() {
    if (this.playerSheet) {
      this.playerSheet.classList.remove('active');
    }
  }

  onHardwareBack() {
    if (this.playerSheet && this.playerSheet.classList.contains('active')) {
      this.closePlayerSheet();
      return;
    }
    if (this.modalProfile && this.modalProfile.classList.contains('active')) {
      this.modalProfile.classList.remove('active');
      return;
    }
    if (this.modalOnboarding && this.modalOnboarding.classList.contains('active')) {
      this.modalOnboarding.classList.remove('active');
      return;
    }
    if (this.currentView !== 'view-discover') {
      this.switchView('view-discover');
      return;
    }

    const now = Date.now();
    if (now - this._lastBackPress < 2000) {
      navigator.app && navigator.app.exitApp && navigator.app.exitApp();
    } else {
      this._lastBackPress = now;
      this.showToast('Press back again to exit');
    }
  }

  // --- User Profile ---
  openProfileModal() {
    if (!this.modalProfile) return;
    this.modalProfile.classList.add('active');
    this.loadProfile();
  }

  loadProfile() {
    const name = localStorage.getItem('etsuko_user_name') || '';
    if (this.inputProfileName) {
      this.inputProfileName.value = name;
      this.inputProfileName.placeholder = 'Enter your name';
    }
  }

  saveProfile() {
    const name = this.inputProfileName ? this.inputProfileName.value.trim() : '';
    if (name) {
      localStorage.setItem('etsuko_user_name', name);
      if (this.topAvatarInitial) {
        this.topAvatarInitial.textContent = name.charAt(0).toUpperCase();
      }
      this.showToast('Profile saved!');
    } else {
      localStorage.removeItem('etsuko_user_name');
      this.setDefaultAvatar();
      this.showToast('Profile reset to default');
    }
    this.modalProfile.classList.remove('active');
  }

  loadUserProfileOnStartup() {
    const name = localStorage.getItem('etsuko_user_name') || '';
    if (name && name.trim()) {
      if (this.topAvatarInitial) {
        this.topAvatarInitial.textContent = name.trim().charAt(0).toUpperCase();
      }
    } else {
      this.setDefaultAvatar();
    }
  }

  setDefaultAvatar() {
    if (this.topAvatarInitial) {
      this.topAvatarInitial.innerHTML = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      `;
    }
  }

  showToast(message) {
    if (!this.toast) return;
    this.toast.textContent = message;
    this.toast.classList.add('active');
    setTimeout(() => {
      this.toast.classList.remove('active');
    }, 2800);
  }

  escapeHtml(text) {
    if (!text) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  }
}

// Global App Singleton
document.addEventListener('DOMContentLoaded', () => {
  window.app = new EtsukoMobileApp();
});
