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
      'view-downloads': document.getElementById('view-downloads')
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
    this.btnPlayAllCrate = document.getElementById('btn-play-all-crate');
    this.btnDeleteActiveCrate = document.getElementById('btn-delete-active-crate');

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
        }, 320);
      });
    }

    if (this.btnSearchClear) {
      this.btnSearchClear.addEventListener('click', () => {
        this.searchInput.value = '';
        this.btnSearchClear.style.display = 'none';
        this.searchResultsList.innerHTML = '';
        this.searchInput.focus();
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
      this.renderHorizontalRow(this.popularAlbumsRow, feed.popularAlbums);
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

  renderHorizontalRow(container, tracks) {
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
          <span class="spotify-card-tag">${track.tag || 'Track'}</span>
          <div class="spotify-card-title">${this.escapeHtml(track.title)}</div>
          <div class="spotify-card-artist">${this.escapeHtml(track.artist)}</div>
        </div>
      `;

      card.addEventListener('click', () => {
        window.player.playTrack(track, tracks);
        this.openPlayerSheet();
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

  // --- Search Engine (Instant & Pure UI) ---
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

    // Clean loading skeleton (Zero mention of YouTube)
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
