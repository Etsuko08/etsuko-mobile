// Etsuko Mobile Neural API Engine
// Supports zero-configuration standalone mobile streaming & optional LAN desktop sync

const DEFAULT_TRENDING_TRACKS = [
  {
    videoId: "J7p4bzqLvCw",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    duration: "3:22",
    thumbnail: "https://yt3.googleusercontent.com/R_cjQK3wwLPEzri1jerx-79zgzGocoKvwGU3NMONaTsaMM0Idd641pfB8r5jgfpn6I8JAoFtf9RBIcI=w544-h544-l90-rj"
  },
  {
    videoId: "3_g2un5M350",
    title: "Starboy (feat. Daft Punk)",
    artist: "The Weeknd",
    album: "Starboy",
    duration: "3:51",
    thumbnail: "https://yt3.googleusercontent.com/dcxXIIlest09vnvKznWM9VWQXu1EL7lKxBzXGzwgmVjmMNBm1dEWT_0qn1xrEZYyKF_qRE1TLq8P_JY_mQ=w544-h544-l90-rj"
  },
  {
    videoId: "xIQpLlYC8xA",
    title: "Houdini",
    artist: "Eminem",
    album: "The Death of Slim Shady",
    duration: "3:48",
    thumbnail: "https://yt3.googleusercontent.com/Xx3dX1EJDirqwpfQL05uAgmKGYpzTcFDXjjHqjNpIhgY5MWTJRLSlOjaYVtup2Ku6gBYEqXoxw5aGKC3=w544-h544-l90-rj"
  },
  {
    videoId: "kIft-LUHHVA",
    title: "Espresso",
    artist: "Sabrina Carpenter",
    album: "Short n' Sweet",
    duration: "2:56",
    thumbnail: "https://yt3.googleusercontent.com/bTWlZSenrOAYgH4r6NAzyDraWQR_wLl3OuRexJ_8h3NZUVHEilRSzUmKNa9YMOFSVcF0YtOuzKdXrt2UHg=w544-h544-l90-rj"
  },
  {
    videoId: "WKZO-CWeOVA",
    title: "BIRDS OF A FEATHER",
    artist: "Billie Eilish",
    album: "HIT ME HARD AND SOFT",
    duration: "3:31",
    thumbnail: "https://yt3.googleusercontent.com/mXJjWX4E6Gpr03CUYl18PdVXlczmoL2Tm-LEBGafIr_8smlHnl8AHniJu0_7Y80e-aeloJxcryQQx0ZJ=w544-h544-l90-rj"
  },
  {
    videoId: "phLb_SoPBlA",
    title: "Not Like Us",
    artist: "Kendrick Lamar",
    album: "Not Like Us",
    duration: "4:35",
    thumbnail: "https://yt3.googleusercontent.com/8qk3C_zpd2FXHVN8BpMBFL6h9J5BlKlbcKOlvDMvIgBWBsAblDoTjU98RGbFH9DxtnN1X5zRzc9sSvWr=w544-h544-l90-rj"
  },
  {
    videoId: "4EQkYVtE-28",
    title: "Circles",
    artist: "Post Malone",
    album: "Hollywood's Bleeding",
    duration: "3:36",
    thumbnail: "https://yt3.googleusercontent.com/YoQ-A-GOpgeE8tgdF3Rcf5z9V8NIIKjLH6_7X3QphIQUwVHioLu7Ik2wQzU0oCkyNm1TeLDLDYvomJ8=w544-h544-l90-rj"
  },
  {
    videoId: "OsfAnsMY21M",
    title: "Levitating",
    artist: "Dua Lipa",
    album: "Future Nostalgia",
    duration: "3:24",
    thumbnail: "https://yt3.googleusercontent.com/UpJ_IhBqyhQV9b2UGcDxxWDm14kRQ2eY1o9S96AGsbE7Ol8isbpbPA0Yefvg8S8ZGAX9L1g4xaj21zVJ=w544-h544-l90-rj"
  },
  {
    videoId: "DlFXDl_ROAM",
    title: "Die With A Smile",
    artist: "Lady Gaga, Bruno Mars",
    album: "Die With A Smile",
    duration: "4:12",
    thumbnail: "https://yt3.googleusercontent.com/RFK4wHeGqwI3DndbARbRJB21IC0TcmqnrlyjxYK7T-nC8wlIVbfxNaCIFKNvSpchDKmYyVLe1RN36w=w544-h544-l90-rj"
  },
  {
    videoId: "2nR1zrNzgcY",
    title: "FE!N (feat. Playboi Carti)",
    artist: "Travis Scott",
    album: "UTOPIA",
    duration: "3:12",
    thumbnail: "https://yt3.googleusercontent.com/eBvJuWpjg0Mx8DBa5WIhCzEopXyMnxkjWSU895BDGjTpNeqrliLrv3zGqNNuCUoXL1EkEAr5VQ3cx2pW=w544-h544-l90-rj"
  },
  {
    videoId: "aHmg0jsmNhg",
    title: "vampire",
    artist: "Olivia Rodrigo",
    album: "GUTS",
    duration: "3:40",
    thumbnail: "https://yt3.googleusercontent.com/F32A1XBuQEkcOnYin-1BURG2MK_q12Ebovqwe8im8KXf8BHJ_jXW_7NnK73K6QOH-1D6QZKrrZGbNrlS=w544-h544-l90-rj"
  },
  {
    videoId: "aC9HkZW2hZk",
    title: "Cruel Summer",
    artist: "Taylor Swift",
    album: "Lover",
    duration: "2:59",
    thumbnail: "https://yt3.googleusercontent.com/OhxDTHQOQzSrcdgH9hzqzp1v22GYDE-QKnkryvCeq4ddx-3K3_c8oDXN0E6NvHlMn1q4XV59aHr0oL4f=w544-h544-l90-rj"
  },
  {
    videoId: "AdEKgwUqPKI",
    title: "Kill Bill",
    artist: "SZA",
    album: "SOS",
    duration: "2:34",
    thumbnail: "https://yt3.googleusercontent.com/tw5VGXEsehs9OpwnpbubqGp_3Pq9so7QShdyJSlCpXeI2mLRvqRqLNbA7EC4zcNWrFE0_lj9HxpZ23v6=w544-h544-l90-rj"
  },
  {
    videoId: "FrsOnNxIrg8",
    title: "God's Plan",
    artist: "Drake",
    album: "Scorpion",
    duration: "3:19",
    thumbnail: "https://yt3.googleusercontent.com/9Oe4acEXgmAlCKgcgI6JlSXi2Tj30u6anzvfGBrunGO-fLhBTgzy-ei1ugPJpZDD5ArKFod9H4RTA5g0=w544-h544-l90-rj"
  },
  {
    videoId: "BSTsnWoslP4",
    title: "Bohemian Rhapsody",
    artist: "Queen",
    album: "A Night at the Opera",
    duration: "5:55",
    thumbnail: "https://yt3.googleusercontent.com/nLn1gxvYiZqzXOY9HyUXVXbFtmR5nhY8sDpbvBT1aw-Ejjsz__Nz90sZoc4nZgff2sf8WjowuVRVBlBTww=w544-h544-l90-rj"
  },
  {
    videoId: "2NiyrtYegso",
    title: "Wake Me Up",
    artist: "Avicii",
    album: "True",
    duration: "4:08",
    thumbnail: "https://yt3.googleusercontent.com/XincHWEjkXhpbavoQEHWRbTcVdvHsujjr7OAw-73KUCILFgjLdevPW8vkoaRMibnwkTtGWkEDyKbuNeK=w544-h544-l90-rj"
  }
];

const DEFAULT_CATEGORIES = [
  { id: "pop", name: "Pop Hits", query: "Pop Hits", color: "#a855f7", colorEnd: "#581c87", image: "assets/genres/pop.jpg", sub: "Global Chart Toppers" },
  { id: "hiphop", name: "Hip-Hop & Rap", query: "Hip Hop Hits", color: "#d97706", colorEnd: "#78350f", image: "assets/genres/hiphop.jpg", sub: "Beats, Bars & Traps" },
  { id: "lofi", name: "Lo-Fi Beats", query: "Lo-Fi Chill Beats", color: "#0ea5e9", colorEnd: "#0c4a6e", image: "assets/genres/lofi.jpg", sub: "Deep Chill & Study" },
  { id: "rock", name: "Rock Classics", query: "Rock Classics", color: "#ef4444", colorEnd: "#7f1d1d", image: "assets/genres/rock.jpg", sub: "Riffs & Heavy Anthems" },
  { id: "electronic", name: "EDM & Dance", query: "EDM Dance Hits", color: "#06b6d4", colorEnd: "#164e63", image: "assets/genres/edm.jpg", sub: "Club Drops & Synths" },
  { id: "anime", name: "Anime & J-Pop", query: "Anime Openings", color: "#f43f5e", colorEnd: "#881337", image: "assets/genres/anime.jpg", sub: "OSTs & J-Rock Energy" },
  { id: "gaming", name: "Gaming Soundtrack", query: "Gaming Soundtrack", color: "#8b5cf6", colorEnd: "#3b0764", image: "assets/genres/gaming.jpg", sub: "Cyberpunk & Epic Scores" },
  { id: "rnb", name: "R&B / Soul", query: "R&B Soul", color: "#f97316", colorEnd: "#7c2d12", image: "assets/genres/rnb.jpg", sub: "Smooth Night Grooves" }
];

class EtsukoAPI {
  constructor() {
    this.baseUrl = this.determineBaseUrl();
    this.localLikesKey = 'etsuko_library_likes_v1';
    this.localCratesKey = 'etsuko_library_crates_v1';
    this.initLocalStorage();
  }

  determineBaseUrl() {
    if (window.location.protocol.startsWith('http') && !window.location.origin.includes('localhost:')) {
      return window.location.origin;
    }
    const saved = localStorage.getItem('etsuko_custom_server');
    return saved ? saved.trim().replace(/\/+$/, '') : '';
  }

  setServerUrl(url) {
    let clean = url.trim().replace(/\/+$/, '');
    if (clean && !clean.startsWith('http')) clean = 'http://' + clean;
    this.baseUrl = clean;
    if (clean) {
      localStorage.setItem('etsuko_custom_server', clean);
    } else {
      localStorage.removeItem('etsuko_custom_server');
    }
  }

  initLocalStorage() {
    if (!localStorage.getItem(this.localLikesKey)) {
      localStorage.setItem(this.localLikesKey, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.localCratesKey)) {
      localStorage.setItem(this.localCratesKey, JSON.stringify([
        {
          id: 'favorites',
          title: 'Cyberpunk Drive',
          description: 'High octane neon night rhythm',
          tracks: []
        }
      ]));
    }
  }

  // Unified HTTP Request: uses Native CapacitorHttp on Android/iOS when available to bypass CORS
  async unifiedFetch(url, options = {}) {
    const isNative = window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();
    const capHttp = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.CapacitorHttp;

    if (isNative && capHttp) {
      try {
        const res = await capHttp.request({
          url: url,
          method: options.method || 'GET',
          headers: options.headers || {},
          data: options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined
        });
        return res.data;
      } catch (err) {
        console.warn('[API] CapacitorHttp error, falling back to standard fetch:', err);
      }
    }

    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  }

  // --- Home Feed ---
  async getHomeFeed() {
    // 1. If custom server is explicitly configured, attempt to pull from desktop server
    if (this.baseUrl) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        const res = await fetch(`${this.baseUrl}/api/home`, { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data && data.trending && data.trending.length > 0) {
            return {
              trending: data.trending.map(t => ({ ...t, isLiked: this.isLiked(t.videoId) })),
              categories: data.categories || DEFAULT_CATEGORIES
            };
          }
        }
      } catch (err) {
        console.warn('[API] Custom server unreachable, using standalone feed:', err.message);
      }
    }

    // 2. Return instant curated baseline feed
    const baselineTrending = DEFAULT_TRENDING_TRACKS.map(t => ({
      ...t,
      isLiked: this.isLiked(t.videoId)
    }));

    return {
      trending: baselineTrending,
      categories: DEFAULT_CATEGORIES
    };
  }

  // --- Global Music Search Engine ---
  async search(query, filter = 'songs', signal = null) {
    if (!query || !query.trim()) return { results: [] };
    const q = query.trim();

    // 1. If custom server is configured, try it first
    if (this.baseUrl) {
      try {
        const params = new URLSearchParams({ q: q, filter: filter });
        const res = await fetch(`${this.baseUrl}/api/search?${params.toString()}`, { signal });
        if (res.ok) {
          const data = await res.json();
          if (data && data.results && data.results.length > 0) {
            return {
              results: data.results.map(r => ({
                ...r,
                isLiked: this.isLiked(r.videoId)
              }))
            };
          }
        }
      } catch (e) {
        if (e.name === 'AbortError') throw e;
        console.warn('[API] Custom server search failed, engaging standalone search engine.');
      }
    }

    // 2. Standalone Cloud Search: JioSaavn 320kbps + Piped/YouTube Music
    const combinedResults = [];
    const seenIds = new Set();

    // A. Query JioSaavn (Direct 320kbps lossless streams)
    try {
      const saavnUrl = `https://jiosaavn-api-2.vercel.app/search/songs?query=${encodeURIComponent(q)}&limit=20`;
      const saavnData = await this.unifiedFetch(saavnUrl, { signal });
      const items = saavnData?.results || (Array.isArray(saavnData) ? saavnData : []);

      items.forEach(item => {
        const id = item.id || `saavn_${Math.random()}`;
        if (!seenIds.has(id)) {
          seenIds.add(id);
          const durSec = parseInt(item.duration, 10) || 210;
          const mins = Math.floor(durSec / 60);
          const secs = durSec % 60;
          const durStr = `${mins}:${String(secs).padStart(2, '0')}`;

          const streamUrl = (item.downloadUrl && (
            item.downloadUrl.find(d => d.quality === '320kbps')?.link ||
            item.downloadUrl.find(d => d.quality === '160kbps')?.link ||
            item.downloadUrl[item.downloadUrl.length - 1]?.link
          )) || item.url || '';

          const thumb = (item.image && (
            item.image[2]?.link || item.image[1]?.link || item.image[0]?.link
          )) || 'assets/default_cover.png';

          combinedResults.push({
            videoId: id,
            title: item.name || item.title || 'Unknown Title',
            artist: item.primaryArtists || item.artist || item.artists || 'Unknown Artist',
            album: item.album?.name || item.album || 'Lossless Master',
            duration: durStr,
            thumbnail: thumb,
            streamUrl: streamUrl,
            source: 'saavn',
            isLiked: this.isLiked(id)
          });
        }
      });
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      console.warn('[API] JioSaavn search error:', err.message);
    }

    // B. Query Piped / YouTube Music search for complete international coverage
    try {
      const pipedUrl = `https://api.piped.private.coffee/search?q=${encodeURIComponent(q)}&filter=music_songs`;
      const pipedData = await this.unifiedFetch(pipedUrl, { signal });
      const items = pipedData?.items || [];

      items.forEach(item => {
        const vid = item.url ? item.url.replace('/watch?v=', '') : null;
        if (vid && !seenIds.has(vid)) {
          seenIds.add(vid);
          const durSec = parseInt(item.duration, 10) || 200;
          const mins = Math.floor(durSec / 60);
          const secs = durSec % 60;

          combinedResults.push({
            videoId: vid,
            title: item.title || 'Unknown Track',
            artist: item.uploaderName || 'YouTube Artist',
            album: 'YouTube Music Master',
            duration: `${mins}:${String(secs).padStart(2, '0')}`,
            thumbnail: item.thumbnail || `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
            source: 'youtube',
            isLiked: this.isLiked(vid)
          });
        }
      });
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      console.warn('[API] Piped search error:', err.message);
    }

    return { results: combinedResults };
  }

  // --- Audio Stream Resolver ---
  getStreamUrl(videoId) {
    if (this.baseUrl) {
      return `${this.baseUrl}/api/proxy_stream/${videoId}`;
    }
    return '';
  }

  // --- Lyrics Engine (LRCLIB synced lyrics) ---
  async getLyrics(title, artist, videoId = '') {
    if (this.baseUrl) {
      try {
        const params = new URLSearchParams({ title, artist, video_id: videoId });
        const res = await fetch(`${this.baseUrl}/api/lyrics?${params.toString()}`);
        if (res.ok) return await res.json();
      } catch (e) {}
    }

    // Standalone direct LRCLIB
    try {
      const cleanTitle = title.replace(/\([^)]*\)|\[[^\]]*\]/g, '').trim();
      const cleanArtist = artist.split(/[,&feat•]/i)[0].trim();
      const lrcUrl = `https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(cleanArtist)}`;
      const data = await this.unifiedFetch(lrcUrl);

      if (data && (data.syncedLyrics || data.plainLyrics)) {
        return {
          syncedLyrics: data.syncedLyrics || '',
          plainLyrics: data.plainLyrics || '',
          source: 'LRCLIB'
        };
      }
    } catch (e) {
      console.warn('[API] Lyrics fetch error:', e.message);
    }

    return {
      syncedLyrics: '',
      plainLyrics: 'No synchronized neural lyrics available for this transmission.',
      source: 'offline'
    };
  }

  // --- Persistent Library (Likes & Crates) ---
  isLiked(videoId) {
    try {
      const raw = localStorage.getItem(this.localLikesKey);
      const likes = raw ? JSON.parse(raw) : [];
      return likes.some(t => t.videoId === videoId);
    } catch (e) {
      return false;
    }
  }

  async getLikedTracks() {
    try {
      const raw = localStorage.getItem(this.localLikesKey);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  async toggleLike(track) {
    const raw = localStorage.getItem(this.localLikesKey);
    let likes = raw ? JSON.parse(raw) : [];
    const existsIndex = likes.findIndex(t => t.videoId === track.videoId);
    let nowLiked = false;

    if (existsIndex >= 0) {
      likes.splice(existsIndex, 1);
      nowLiked = false;
    } else {
      likes.unshift({ ...track, isLiked: true });
      nowLiked = true;
    }

    localStorage.setItem(this.localLikesKey, JSON.stringify(likes));

    // Async sync to custom server if available
    if (this.baseUrl) {
      fetch(`${this.baseUrl}/api/library/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_id: track.videoId, track: track })
      }).catch(() => {});
    }

    return nowLiked;
  }

  async getPlaylists() {
    try {
      const raw = localStorage.getItem(this.localCratesKey);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  async createPlaylist(name, description = '') {
    const crates = await this.getPlaylists();
    const newCrate = {
      id: `crate_${Date.now()}`,
      title: name,
      description: description,
      tracks: []
    };
    crates.unshift(newCrate);
    localStorage.setItem(this.localCratesKey, JSON.stringify(crates));
    return newCrate;
  }

  async deletePlaylist(id) {
    let crates = await this.getPlaylists();
    crates = crates.filter(c => c.id !== id);
    localStorage.setItem(this.localCratesKey, JSON.stringify(crates));
    return true;
  }

  async addTrackToPlaylist(crateId, track) {
    const crates = await this.getPlaylists();
    const target = crates.find(c => c.id === crateId);
    if (!target) throw new Error('Playlist not found');
    if (!target.tracks.some(t => t.videoId === track.videoId)) {
      target.tracks.unshift(track);
      localStorage.setItem(this.localCratesKey, JSON.stringify(crates));
    }
    return true;
  }
}

// Global API Singleton
window.api = new EtsukoAPI();
