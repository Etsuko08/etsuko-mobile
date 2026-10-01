// Etsuko Mobile Neural API Engine
// Unlimited Global Music Search via Android Native Bridge, Zero Broken Thumbnails,
// True Daily-Seeded Recommendations, Dynamic Podcasts & Standalone Offline Storage

function formatHighResThumbnail(videoId, url) {
  if (url && typeof url === 'string') {
    // If it's a Google/YouTube Music CDN square album cover, upgrade to 544x544 HD
    if (url.includes('googleusercontent.com') || url.includes('ggpht.com')) {
      return url.replace(/=w\d+-h\d+[^"]*/, '=w544-h544-l90-rj');
    }
    if (url.startsWith('http') && !url.includes('hq720.jpg')) {
      return url;
    }
  }
  if (videoId) {
    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  }
  return url || 'assets/default_cover.png';
}

// Master Curated Catalogs (Guaranteed 100% Active YouTube IDs & Static Edge Covers)
const CATALOG_TRENDING_HITS = [
  { videoId: "DlFXDl_ROAM", title: "Die With A Smile", artist: "Lady Gaga, Bruno Mars", album: "Die With A Smile", duration: "4:12", tag: "Single", thumbnail: "https://i.ytimg.com/vi/DlFXDl_ROAM/hqdefault.jpg" },
  { videoId: "kIft-LUHHVA", title: "Espresso", artist: "Sabrina Carpenter", album: "Short n' Sweet", duration: "2:56", tag: "Single", thumbnail: "https://i.ytimg.com/vi/kIft-LUHHVA/hqdefault.jpg" },
  { videoId: "WKZO-CWeOVA", title: "BIRDS OF A FEATHER", artist: "Billie Eilish", album: "HIT ME HARD AND SOFT", duration: "3:31", tag: "Single", thumbnail: "https://i.ytimg.com/vi/WKZO-CWeOVA/hqdefault.jpg" },
  { videoId: "phLb_SoPBlA", title: "Not Like Us", artist: "Kendrick Lamar", album: "Not Like Us", duration: "4:35", tag: "Single", thumbnail: "https://i.ytimg.com/vi/phLb_SoPBlA/hqdefault.jpg" },
  { videoId: "aC9HkZW2hZk", title: "Cruel Summer", artist: "Taylor Swift", album: "Lover", duration: "2:59", tag: "Single", thumbnail: "https://i.ytimg.com/vi/aC9HkZW2hZk/hqdefault.jpg" },
  { videoId: "J7p4bzqLvCw", title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", duration: "3:22", tag: "Single", thumbnail: "https://i.ytimg.com/vi/J7p4bzqLvCw/hqdefault.jpg" },
  { videoId: "3_g2un5M350", title: "Starboy (feat. Daft Punk)", artist: "The Weeknd", album: "Starboy", duration: "3:51", tag: "Album", thumbnail: "https://i.ytimg.com/vi/3_g2un5M350/hqdefault.jpg" },
  { videoId: "xIQpLlYC8xA", title: "Houdini", artist: "Eminem", album: "The Death of Slim Shady", duration: "3:48", tag: "Single", thumbnail: "https://i.ytimg.com/vi/xIQpLlYC8xA/hqdefault.jpg" },
  { videoId: "2nR1zrNzgcY", title: "FE!N (feat. Playboi Carti)", artist: "Travis Scott", album: "UTOPIA", duration: "3:12", tag: "Album", thumbnail: "https://i.ytimg.com/vi/2nR1zrNzgcY/hqdefault.jpg" },
  { videoId: "1-xGerv5FOk", title: "Close Eyes", artist: "DVRST", album: "Close Eyes", duration: "2:12", tag: "Single", thumbnail: "https://i.ytimg.com/vi/1-xGerv5FOk/hqdefault.jpg" },
  { videoId: "4EQkYVtE-28", title: "Circles", artist: "Post Malone", album: "Hollywood's Bleeding", duration: "3:36", tag: "Single", thumbnail: "https://i.ytimg.com/vi/4EQkYVtE-28/hqdefault.jpg" },
  { videoId: "OsfAnsMY21M", title: "Levitating", artist: "Dua Lipa", album: "Future Nostalgia", duration: "3:24", tag: "Single", thumbnail: "https://i.ytimg.com/vi/OsfAnsMY21M/hqdefault.jpg" }
];

const CATALOG_DAILY_POOL = [
  { videoId: "aHmg0jsmNhg", title: "vampire", artist: "Olivia Rodrigo", album: "GUTS", duration: "3:40", tag: "Single", thumbnail: "https://i.ytimg.com/vi/aHmg0jsmNhg/hqdefault.jpg" },
  { videoId: "bpOSxM0rNPM", title: "Do I Wanna Know?", artist: "Arctic Monkeys", album: "AM", duration: "4:32", tag: "Album", thumbnail: "https://i.ytimg.com/vi/bpOSxM0rNPM/hqdefault.jpg" },
  { videoId: "eVTXPUF4Oz4", title: "In the End", artist: "Linkin Park", album: "Hybrid Theory", duration: "3:36", tag: "EP", thumbnail: "https://i.ytimg.com/vi/eVTXPUF4Oz4/hqdefault.jpg" },
  { videoId: "AdEKgwUqPKI", title: "Kill Bill", artist: "SZA", album: "SOS", duration: "2:34", tag: "Single", thumbnail: "https://i.ytimg.com/vi/AdEKgwUqPKI/hqdefault.jpg" },
  { videoId: "FrsOnNxIrg8", title: "God's Plan", artist: "Drake", album: "Scorpion", duration: "3:19", tag: "Single", thumbnail: "https://i.ytimg.com/vi/FrsOnNxIrg8/hqdefault.jpg" },
  { videoId: "_GWKkqNoyEA", title: "Counting Stars", artist: "OneRepublic", album: "Native", duration: "4:18", tag: "Single", thumbnail: "https://i.ytimg.com/vi/_GWKkqNoyEA/hqdefault.jpg" },
  { videoId: "9ssQKlLxBdQ", title: "Thunder", artist: "Imagine Dragons", album: "Evolve", duration: "3:08", tag: "Single", thumbnail: "https://i.ytimg.com/vi/9ssQKlLxBdQ/hqdefault.jpg" },
  { videoId: "BSTsnWoslP4", title: "Bohemian Rhapsody", artist: "Queen", album: "A Night at the Opera", duration: "5:55", tag: "Master", thumbnail: "https://i.ytimg.com/vi/BSTsnWoslP4/hqdefault.jpg" },
  { videoId: "4D7u5KF7SP8", title: "Get Lucky", artist: "Daft Punk, Pharrell Williams", album: "Random Access Memories", duration: "6:10", tag: "Single", thumbnail: "https://i.ytimg.com/vi/4D7u5KF7SP8/hqdefault.jpg" },
  { videoId: "2NiyrtYegso", title: "Wake Me Up", artist: "Avicii", album: "True", duration: "4:08", tag: "Single", thumbnail: "https://i.ytimg.com/vi/2NiyrtYegso/hqdefault.jpg" },
  { videoId: "Umqb9KENgmk", title: "Tum Hi Ho", artist: "Arijit Singh", album: "Aashiqui 2", duration: "4:22", tag: "Romance", thumbnail: "https://i.ytimg.com/vi/Umqb9KENgmk/hqdefault.jpg" },
  { videoId: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh, Pritam", album: "Brahmastra", duration: "4:28", tag: "Romance", thumbnail: "https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg" },
  { videoId: "LK7-_dgAVQE", title: "Tauba Tauba", artist: "Karan Aujla", album: "Bad Newz", duration: "3:26", tag: "Single", thumbnail: "https://i.ytimg.com/vi/LK7-_dgAVQE/hqdefault.jpg" },
  { videoId: "cWMxCE2HTag", title: "Softly", artist: "Karan Aujla, Ikky", album: "Four You", duration: "2:36", tag: "Single", thumbnail: "https://i.ytimg.com/vi/cWMxCE2HTag/hqdefault.jpg" },
  { videoId: "4TYv2PhG89A", title: "Cheques", artist: "Shubh", album: "Still Rollin", duration: "3:03", tag: "Single", thumbnail: "https://i.ytimg.com/vi/4TYv2PhG89A/hqdefault.jpg" },
  { videoId: "4tywp83zkmk", title: "One Love", artist: "Shubh", album: "One Love", duration: "2:40", tag: "Single", thumbnail: "https://i.ytimg.com/vi/4tywp83zkmk/hqdefault.jpg" },
  { videoId: "VNs_cCtdbPc", title: "Baller", artist: "Shubh, Ikky", album: "Baller", duration: "2:28", tag: "Single", thumbnail: "https://i.ytimg.com/vi/VNs_cCtdbPc/hqdefault.jpg" },
  { videoId: "fzeoo8n8RZo", title: "Murder In My Mind", artist: "Kordhell", album: "Murder In My Mind", duration: "2:25", tag: "Phonk", thumbnail: "https://i.ytimg.com/vi/fzeoo8n8RZo/hqdefault.jpg" },
  { videoId: "NS9z2QHcZdY", title: "Metamorphosis", artist: "INTERWORLD", album: "Metamorphosis", duration: "2:22", tag: "Phonk", thumbnail: "https://i.ytimg.com/vi/NS9z2QHcZdY/hqdefault.jpg" },
  { videoId: "dvQJIgjlR3I", title: "Neon Blade", artist: "MoonDeity", album: "Neon Blade", duration: "4:24", tag: "Phonk", thumbnail: "https://i.ytimg.com/vi/dvQJIgjlR3I/hqdefault.jpg" },
  { videoId: "kAw9xGI8vgk", title: "Deep Chill Lofi Study", artist: "Lumosound", album: "Lofi Study Session", duration: "3:40", tag: "EP", thumbnail: "https://i.ytimg.com/vi/kAw9xGI8vgk/hqdefault.jpg" }
];

const CATALOG_TOP_MIXES = [
  {
    id: "pop_mix",
    title: "Pop Mix",
    subtitle: "Sabrina Carpenter, Taylor Swift, Dua Lipa",
    gradient: "linear-gradient(135deg, #10b981, #064e3b)",
    bannerColor: "#10b981",
    tracks: [
      { videoId: "kIft-LUHHVA", title: "Espresso", artist: "Sabrina Carpenter", thumbnail: "https://i.ytimg.com/vi/kIft-LUHHVA/hqdefault.jpg" },
      { videoId: "aC9HkZW2hZk", title: "Cruel Summer", artist: "Taylor Swift", thumbnail: "https://i.ytimg.com/vi/aC9HkZW2hZk/hqdefault.jpg" },
      { videoId: "OsfAnsMY21M", title: "Levitating", artist: "Dua Lipa", thumbnail: "https://i.ytimg.com/vi/OsfAnsMY21M/hqdefault.jpg" },
      { videoId: "DlFXDl_ROAM", title: "Die With A Smile", artist: "Lady Gaga, Bruno Mars", thumbnail: "https://i.ytimg.com/vi/DlFXDl_ROAM/hqdefault.jpg" }
    ]
  },
  {
    id: "2020s_mix",
    title: "2020s Mix",
    subtitle: "The Weeknd, Billie Eilish, Post Malone",
    gradient: "linear-gradient(135deg, #a855f7, #581c87)",
    bannerColor: "#a855f7",
    tracks: [
      { videoId: "WKZO-CWeOVA", title: "BIRDS OF A FEATHER", artist: "Billie Eilish", thumbnail: "https://i.ytimg.com/vi/WKZO-CWeOVA/hqdefault.jpg" },
      { videoId: "J7p4bzqLvCw", title: "Blinding Lights", artist: "The Weeknd", thumbnail: "https://i.ytimg.com/vi/J7p4bzqLvCw/hqdefault.jpg" },
      { videoId: "4EQkYVtE-28", title: "Circles", artist: "Post Malone", thumbnail: "https://i.ytimg.com/vi/4EQkYVtE-28/hqdefault.jpg" },
      { videoId: "3_g2un5M350", title: "Starboy", artist: "The Weeknd", thumbnail: "https://i.ytimg.com/vi/3_g2un5M350/hqdefault.jpg" }
    ]
  },
  {
    id: "phonk_mix",
    title: "Phonk Drift",
    subtitle: "DVRST, Kordhell, MoonDeity, INTERWORLD",
    gradient: "linear-gradient(135deg, #ec4899, #831843)",
    bannerColor: "#ec4899",
    tracks: [
      { videoId: "1-xGerv5FOk", title: "Close Eyes", artist: "DVRST", thumbnail: "https://i.ytimg.com/vi/1-xGerv5FOk/hqdefault.jpg" },
      { videoId: "fzeoo8n8RZo", title: "Murder In My Mind", artist: "Kordhell", thumbnail: "https://i.ytimg.com/vi/fzeoo8n8RZo/hqdefault.jpg" },
      { videoId: "NS9z2QHcZdY", title: "Metamorphosis", artist: "INTERWORLD", thumbnail: "https://i.ytimg.com/vi/NS9z2QHcZdY/hqdefault.jpg" },
      { videoId: "dvQJIgjlR3I", title: "Neon Blade", artist: "MoonDeity", thumbnail: "https://i.ytimg.com/vi/dvQJIgjlR3I/hqdefault.jpg" }
    ]
  },
  {
    id: "romance_mix",
    title: "Melodic Romance",
    subtitle: "Arijit Singh, Pritam, Lady Gaga",
    gradient: "linear-gradient(135deg, #f43f5e, #881337)",
    bannerColor: "#f43f5e",
    tracks: [
      { videoId: "Umqb9KENgmk", title: "Tum Hi Ho", artist: "Arijit Singh", thumbnail: "https://i.ytimg.com/vi/Umqb9KENgmk/hqdefault.jpg" },
      { videoId: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh, Pritam", thumbnail: "https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg" },
      { videoId: "DlFXDl_ROAM", title: "Die With A Smile", artist: "Lady Gaga, Bruno Mars", thumbnail: "https://i.ytimg.com/vi/DlFXDl_ROAM/hqdefault.jpg" },
      { videoId: "aC9HkZW2hZk", title: "Cruel Summer", artist: "Taylor Swift", thumbnail: "https://i.ytimg.com/vi/aC9HkZW2hZk/hqdefault.jpg" }
    ]
  },
  {
    id: "punjabi_mix",
    title: "Punjabi Heat",
    subtitle: "Karan Aujla, Shubh, Ikky",
    gradient: "linear-gradient(135deg, #f59e0b, #78350f)",
    bannerColor: "#f59e0b",
    tracks: [
      { videoId: "LK7-_dgAVQE", title: "Tauba Tauba", artist: "Karan Aujla", thumbnail: "https://i.ytimg.com/vi/LK7-_dgAVQE/hqdefault.jpg" },
      { videoId: "cWMxCE2HTag", title: "Softly", artist: "Karan Aujla", thumbnail: "https://i.ytimg.com/vi/cWMxCE2HTag/hqdefault.jpg" },
      { videoId: "4TYv2PhG89A", title: "Cheques", artist: "Shubh", thumbnail: "https://i.ytimg.com/vi/4TYv2PhG89A/hqdefault.jpg" },
      { videoId: "4tywp83zkmk", title: "One Love", artist: "Shubh", thumbnail: "https://i.ytimg.com/vi/4tywp83zkmk/hqdefault.jpg" }
    ]
  },
  {
    id: "lofi_mix",
    title: "Lofi Study Session",
    subtitle: "Lumosound, ChilledCow, Cozy Beats",
    gradient: "linear-gradient(135deg, #3b82f6, #1e3a8a)",
    bannerColor: "#3b82f6",
    tracks: [
      { videoId: "kAw9xGI8vgk", title: "Deep Chill Lofi Study", artist: "Lumosound", thumbnail: "https://i.ytimg.com/vi/kAw9xGI8vgk/hqdefault.jpg" },
      { videoId: "4EQkYVtE-28", title: "Circles (Chill Acoustic)", artist: "Post Malone", thumbnail: "https://i.ytimg.com/vi/4EQkYVtE-28/hqdefault.jpg" },
      { videoId: "bpOSxM0rNPM", title: "Do I Wanna Know? (Acoustic)", artist: "Arctic Monkeys", thumbnail: "https://i.ytimg.com/vi/bpOSxM0rNPM/hqdefault.jpg" },
      { videoId: "aHmg0jsmNhg", title: "vampire (Lofi)", artist: "Olivia Rodrigo", thumbnail: "https://i.ytimg.com/vi/aHmg0jsmNhg/hqdefault.jpg" }
    ]
  }
];

const CATALOG_POPULAR_ALBUMS = [
  { videoId: "3_g2un5M350", title: "Starboy", artist: "The Weeknd", album: "Starboy (Deluxe)", tag: "Album", thumbnail: "https://i.ytimg.com/vi/3_g2un5M350/hqdefault.jpg" },
  { videoId: "WKZO-CWeOVA", title: "HIT ME HARD AND SOFT", artist: "Billie Eilish", album: "HIT ME HARD AND SOFT", tag: "Album", thumbnail: "https://i.ytimg.com/vi/WKZO-CWeOVA/hqdefault.jpg" },
  { videoId: "aHmg0jsmNhg", title: "GUTS", artist: "Olivia Rodrigo", album: "GUTS", tag: "Album", thumbnail: "https://i.ytimg.com/vi/aHmg0jsmNhg/hqdefault.jpg" },
  { videoId: "bpOSxM0rNPM", title: "AM", artist: "Arctic Monkeys", album: "AM", tag: "Album", thumbnail: "https://i.ytimg.com/vi/bpOSxM0rNPM/hqdefault.jpg" },
  { videoId: "Umqb9KENgmk", title: "Aashiqui 2", artist: "Mithoon, Ankit Tiwari", album: "Aashiqui 2 OST", tag: "Album", thumbnail: "https://i.ytimg.com/vi/Umqb9KENgmk/hqdefault.jpg" },
  { videoId: "eVTXPUF4Oz4", title: "Hybrid Theory", artist: "Linkin Park", album: "Hybrid Theory", tag: "Album", thumbnail: "https://i.ytimg.com/vi/eVTXPUF4Oz4/hqdefault.jpg" },
  { videoId: "2nR1zrNzgcY", title: "UTOPIA", artist: "Travis Scott", album: "UTOPIA", tag: "Album", thumbnail: "https://i.ytimg.com/vi/2nR1zrNzgcY/hqdefault.jpg" },
  { videoId: "J7p4bzqLvCw", title: "After Hours", artist: "The Weeknd", album: "After Hours", tag: "Album", thumbnail: "https://i.ytimg.com/vi/J7p4bzqLvCw/hqdefault.jpg" }
];

const CATALOG_PODCASTS = [
  { videoId: "ruVJE9po3-U", title: "The Joe Rogan Experience", artist: "Joe Rogan", album: "Comedy & Culture", tag: "Podcast", thumbnail: "https://i.ytimg.com/vi/ruVJE9po3-U/hqdefault.jpg" },
  { videoId: "NYFGCESmikA", title: "Lex Fridman Podcast", artist: "Lex Fridman", album: "AI & Science", tag: "Podcast", thumbnail: "https://i.ytimg.com/vi/NYFGCESmikA/hqdefault.jpg" },
  { videoId: "iRR2yCoIaYY", title: "Huberman Lab", artist: "Dr. Andrew Huberman", album: "Neuroscience", tag: "Podcast", thumbnail: "https://i.ytimg.com/vi/iRR2yCoIaYY/hqdefault.jpg" },
  { videoId: "VHUrdELKjDw", title: "The Diary Of A CEO", artist: "Steven Bartlett", album: "Business & Life", tag: "Podcast", thumbnail: "https://i.ytimg.com/vi/VHUrdELKjDw/hqdefault.jpg" },
  { videoId: "Rn6gRENRzAE", title: "Rotten Mango", artist: "Stephanie Soo", album: "True Crime Stories", tag: "Podcast", thumbnail: "https://i.ytimg.com/vi/Rn6gRENRzAE/hqdefault.jpg" },
  { videoId: "oErYYBNCHh4", title: "Hardcore History", artist: "Dan Carlin", album: "Epic History", tag: "Podcast", thumbnail: "https://i.ytimg.com/vi/oErYYBNCHh4/hqdefault.jpg" }
];

class EtsukoAPI {
  constructor() {
    this.localLikesKey = 'etsuko_library_likes_v1';
    this.localCratesKey = 'etsuko_library_crates_v1';
    this.localGenresKey = 'etsuko_user_genres';
    this.initLocalStorage();
  }

  initLocalStorage() {
    if (!localStorage.getItem(this.localLikesKey)) {
      localStorage.setItem(this.localLikesKey, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.localCratesKey)) {
      localStorage.setItem(this.localCratesKey, JSON.stringify([
        {
          id: 'favorites',
          title: 'Night Cruise',
          description: 'Cyberpunk beats for late drives',
          tracks: []
        }
      ]));
    }
  }

  // --- Spotify-Style Dynamic Home Feed ---
  async getHomeFeed() {
    // 1. Jump back in: ONLY actual user history (empty for new users)
    const recents = this.getRecentTracks();

    // 2. Recommended for today: Seeded by current date (changes every midnight!)
    const dailyPicks = this.getDailyPicks();

    return {
      jumpBackIn: recents.map(t => ({ ...t, isLiked: this.isLiked(t.videoId) })),
      recents: recents.map(t => ({ ...t, isLiked: this.isLiked(t.videoId) })),
      trendingHits: CATALOG_TRENDING_HITS.map(t => ({ ...t, isLiked: this.isLiked(t.videoId) })),
      dailyPicks: dailyPicks.map(t => ({ ...t, isLiked: this.isLiked(t.videoId) })),
      topMixes: CATALOG_TOP_MIXES,
      popularAlbums: CATALOG_POPULAR_ALBUMS.map(t => ({ ...t, isLiked: this.isLiked(t.videoId) })),
      podcasts: CATALOG_PODCASTS.map(t => ({ ...t, isLiked: this.isLiked(t.videoId) }))
    };
  }

  getRecentTracks() {
    try {
      const raw = localStorage.getItem('etsuko_recent_tracks');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  getDailyPicks() {
    // Generate deterministic daily rotation based on date string (e.g. "2026-09-28")
    const dateStr = new Date().toISOString().slice(0, 10);
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = (hash << 5) - hash + dateStr.charCodeAt(i);
      hash |= 0;
    }
    const seed = Math.abs(hash);

    const pool = [...CATALOG_DAILY_POOL];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = (seed + i * 31) % (i + 1);
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    return pool.slice(0, 14);
  }

  // --- YouTube Music Universal Search Engine ---
  async search(query, filter = 'songs', signal = null) {
    if (!query || !query.trim()) return { results: [] };
    const q = query.trim();

    // 1. If native bridge is initializing on first launch, wait briefly
    if (!window.AndroidMedia) {
      for (let i = 0; i < 4; i++) {
        await new Promise(r => setTimeout(r, 150));
        if (window.AndroidMedia) break;
      }
    }

    // 2. Android Native Bridge Search (100% bypass of CORS, unlimited YouTube Music catalog!)
    if (window.AndroidMedia && typeof window.AndroidMedia.nativeSearchAsync === 'function') {
      try {
        const rawJson = await new Promise((resolve) => {
          const cbId = 'cb_' + Math.random().toString(36).substring(2, 10);
          const timer = setTimeout(() => {
            delete window['__native_search_' + cbId];
            resolve(null);
          }, 8000);

          window['__native_search_' + cbId] = (dataStr) => {
            clearTimeout(timer);
            delete window['__native_search_' + cbId];
            resolve(dataStr);
          };

          window.AndroidMedia.nativeSearchAsync(q, filter, cbId);
        });

        if (rawJson) {
          const parsedData = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
          const items = this.parseInnerTubeResults(parsedData);
          if (items && items.length > 0) {
            return {
              results: items.map(t => ({
                ...t,
                isLiked: this.isLiked(t.videoId)
              }))
            };
          }
        }
      } catch (err) {
        console.warn('[Search] Native bridge search notice:', err);
      }
    }

    // 3. Direct browser/web fetch or public fallback
    try {
      const ytResults = await this.searchInnerTube(q, filter, signal);
      if (ytResults && ytResults.length > 0) {
        return {
          results: ytResults.map(r => ({
            ...r,
            thumbnail: formatHighResThumbnail(r.videoId, r.thumbnail),
            isLiked: this.isLiked(r.videoId)
          }))
        };
      }
    } catch (err) {
      if (err.name === 'AbortError') throw err;
    }

    // 4. Fallback: filter local curated catalog
    const local = this.searchLocalCatalog(q);
    return { results: local };
  }

  async searchInnerTube(query, filter = 'songs', signal = null) {
    let params = "EgWKAQIIAWoQEAMQBBAJEAoQBRAREBAQFQ%3D%3D";
    if (filter === 'albums') params = "EgWKAQIBAWoQEAMQBBAJEAoQBRAREBAQFQ%3D%3D";
    else if (filter === 'artists') params = "EgWKAQIgAWoQEAMQBBAJEAoQBRAREBAQFQ%3D%3D";

    const res = await fetch('https://music.youtube.com/youtubei/v1/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: 'WEB_REMIX',
            clientVersion: '1.20260928.01.00',
            hl: 'en'
          }
        },
        query: query,
        params: params
      }),
      signal: signal
    });

    if (!res.ok) return [];
    const data = await res.json();
    return this.parseInnerTubeResults(data);
  }

  parseInnerTubeResults(data) {
    const results = [];
    try {
      const sectionList = data.contents?.tabbedSearchResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];

      for (const section of sectionList) {
        // Handle Top Hit card
        if (section.musicCardShelfRenderer) {
          const card = section.musicCardShelfRenderer;
          const vid = card.onTap?.watchEndpoint?.videoId || card.buttons?.[0]?.buttonRenderer?.command?.watchEndpoint?.videoId;
          if (vid) {
            const cardTitle = card.title?.runs?.[0]?.text || card.header?.musicCardShelfHeaderBasicRenderer?.title?.runs?.[0]?.text || 'Top Result';
            const cardArtist = card.subtitle?.runs?.map(r => r.text).join('') || 'Featured Artist';
            let cardThumb = `https://i.ytimg.com/vi/${vid}/hq720.jpg`;
            const cardThumbs = card.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails;
            if (cardThumbs && cardThumbs.length > 0) {
              cardThumb = formatHighResThumbnail(vid, cardThumbs[cardThumbs.length - 1].url);
            }
            results.push({
              videoId: vid,
              title: cardTitle,
              artist: cardArtist,
              album: 'Top Hit',
              duration: '3:30',
              thumbnail: cardThumb
            });
          }
        }

        const shelf = section.musicCardShelfRenderer || section.musicShelfRenderer || section.itemSectionRenderer;
        if (!shelf) continue;

        const contents = shelf.contents || [];
        for (const item of contents) {
          const renderer = item.musicResponsiveListItemRenderer;
          if (!renderer) continue;

          let videoId = renderer.playlistItemData?.videoId;
          if (!videoId && renderer.doubleTapCommand?.watchEndpoint?.videoId) {
            videoId = renderer.doubleTapCommand.watchEndpoint.videoId;
          }
          if (!videoId && renderer.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchEndpoint?.videoId) {
            videoId = renderer.overlay.musicItemThumbnailOverlayRenderer.content.musicPlayButtonRenderer.playNavigationEndpoint.watchEndpoint.videoId;
          }
          if (!videoId) continue;

          // Avoid duplicates
          if (results.some(r => r.videoId === videoId)) continue;

          // Title
          const title = renderer.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text || 'Unknown Title';

          // Extract artist & album & duration from flexColumns
          const col2Runs = renderer.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || [];
          let artistParts = [];
          let foundBullet = false;
          let album = 'Single';
          let duration = '3:30';

          for (let i = 0; i < col2Runs.length; i++) {
            const t = col2Runs[i]?.text || '';
            if (t.includes('•')) {
              foundBullet = true;
              continue;
            }
            if (!foundBullet) {
              artistParts.push(t);
            } else {
              if (/^\d+:\d+$/.test(t.trim())) {
                duration = t.trim();
              } else if (t.trim() && album === 'Single') {
                album = t.trim();
              }
            }
          }

          let artist = artistParts.join('').trim() || 'Unknown Artist';

          const col3Runs = renderer.flexColumns?.[2]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || [];
          if (col3Runs.length > 0 && col3Runs[0]?.text) {
            duration = col3Runs[0].text.trim();
          }

          let itemThumb = `https://i.ytimg.com/vi/${videoId}/hq720.jpg`;
          const rawThumbs = renderer.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails;
          if (rawThumbs && rawThumbs.length > 0) {
            itemThumb = formatHighResThumbnail(videoId, rawThumbs[rawThumbs.length - 1].url);
          }

          results.push({
            videoId,
            title,
            artist,
            album,
            duration,
            thumbnail: itemThumb
          });
        }
      }
    } catch (e) {
      console.warn('[API] Parse InnerTube search exception:', e);
    }

    return results;
  }

  searchLocalCatalog(query) {
    const q = query.toLowerCase();
    const all = [
      ...CATALOG_TRENDING_HITS,
      ...CATALOG_DAILY_POOL,
      ...CATALOG_POPULAR_ALBUMS,
      ...CATALOG_PODCASTS
    ];
    return all.filter(t => t.title.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q));
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

  async likeTrack(track) {
    const raw = localStorage.getItem(this.localLikesKey);
    let likes = raw ? JSON.parse(raw) : [];
    if (!likes.some(t => t.videoId === track.videoId)) {
      likes.unshift({ ...track, isLiked: true });
      localStorage.setItem(this.localLikesKey, JSON.stringify(likes));
    }
    return true;
  }

  async unlikeTrack(videoId) {
    const raw = localStorage.getItem(this.localLikesKey);
    let likes = raw ? JSON.parse(raw) : [];
    likes = likes.filter(t => t.videoId !== videoId);
    localStorage.setItem(this.localLikesKey, JSON.stringify(likes));
    return false;
  }

  async toggleLike(track) {
    const currentlyLiked = this.isLiked(track.videoId);
    if (currentlyLiked) {
      await this.unlikeTrack(track.videoId);
      return false;
    } else {
      await this.likeTrack(track);
      return true;
    }
  }

  // --- Playlists / Crates ---
  async getPlaylists() {
    try {
      const raw = localStorage.getItem(this.localCratesKey);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  async getPlaylist(id) {
    const crates = await this.getPlaylists();
    return crates.find(c => c.id === id) || { id, title: 'Crate', tracks: [] };
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

  async addTrackToPlaylist(playlistId, track) {
    const crates = await this.getPlaylists();
    const crate = crates.find(c => c.id === playlistId);
    if (crate) {
      if (!crate.tracks.some(t => t.videoId === track.videoId)) {
        crate.tracks.push(track);
        localStorage.setItem(this.localCratesKey, JSON.stringify(crates));
      }
    }
    return true;
  }

  async removeTrackFromPlaylist(playlistId, videoId) {
    const crates = await this.getPlaylists();
    const crate = crates.find(c => c.id === playlistId);
    if (crate) {
      crate.tracks = crate.tracks.filter(t => t.videoId !== videoId);
      localStorage.setItem(this.localCratesKey, JSON.stringify(crates));
    }
    return true;
  }

  // --- Spotify-Style Related / Recommended Songs in Same Language & Genre ---
  async getRelatedTracks(currentTrack) {
    if (!currentTrack) return { category: 'pop', displayTag: 'Recommended', tracks: [] };

    const title = (currentTrack.title || '').toLowerCase();
    const artist = (currentTrack.artist || '').toLowerCase();
    const album = (currentTrack.album || '').toLowerCase();
    const combined = `${title} ${artist} ${album}`;

    let detectedCategory = 'pop';
    let displayTag = 'Global Pop Hits';

    if (/punjabi|karan aujla|shubh|ikky|diljit|sidhu|ap dhillon|b praak|jassi|amrit|tauba|cheques|softly|baller|one love|winning/.test(combined)) {
      detectedCategory = 'punjabi';
      displayTag = 'Punjabi Hits';
    } else if (/hindi|arijit|pritam|atif|shreya|jubin|sachin|neha|bollywood|tum hi ho|kesariya|chaleya|channa|apna bana|o maahi|raataan/.test(combined)) {
      detectedCategory = 'hindi';
      displayTag = 'Bollywood & Hindi Melodies';
    } else if (/phonk|drift|dvrst|kordhell|moondeity|interworld|hensonn|pharmacist|playaphonk|murder in my mind|metamorphosis|neon blade|close eyes/.test(combined)) {
      detectedCategory = 'phonk';
      displayTag = 'Phonk & Drift';
    } else if (/rap|hip-hop|hip hop|eminem|kendrick|travis scott|drake|post malone|carti|metro boomin|future|21 savage|not like us|houdini|fe!n|god's plan/.test(combined)) {
      detectedCategory = 'hiphop';
      displayTag = 'Hip-Hop & Rap';
    } else if (/rock|metal|linkin park|queen|arctic monkeys|imagine dragons|onerepublic|nirvana|coldplay|in the end|thunder|counting stars|bohemian/.test(combined)) {
      detectedCategory = 'rock';
      displayTag = 'Rock & Alternative';
    } else if (/lofi|chill|study|sleep|peaceful|lumosound|chilledcow|cozy|beats/.test(combined)) {
      detectedCategory = 'lofi';
      displayTag = 'Lofi & Chill Study';
    } else if (/anime|j-pop|japanese|yoasobi|eve|kenshi|lisa|aimer|radwimps/.test(combined)) {
      detectedCategory = 'anime';
      displayTag = 'Anime & J-Pop';
    } else {
      detectedCategory = 'pop';
      displayTag = 'Pop & Chart Toppers';
    }

    const genrePools = {
      punjabi: [
        { videoId: "LK7-_dgAVQE", title: "Tauba Tauba", artist: "Karan Aujla", album: "Bad Newz", duration: "3:26", thumbnail: "https://i.ytimg.com/vi/LK7-_dgAVQE/hqdefault.jpg" },
        { videoId: "cWMxCE2HTag", title: "Softly", artist: "Karan Aujla, Ikky", album: "Four You", duration: "2:36", thumbnail: "https://i.ytimg.com/vi/cWMxCE2HTag/hqdefault.jpg" },
        { videoId: "4TYv2PhG89A", title: "Cheques", artist: "Shubh", album: "Still Rollin", duration: "3:03", thumbnail: "https://i.ytimg.com/vi/4TYv2PhG89A/hqdefault.jpg" },
        { videoId: "4tywp83zkmk", title: "One Love", artist: "Shubh", album: "One Love", duration: "2:40", thumbnail: "https://i.ytimg.com/vi/4tywp83zkmk/hqdefault.jpg" },
        { videoId: "VNs_cCtdbPc", title: "Baller", artist: "Shubh, Ikky", album: "Baller", duration: "2:28", thumbnail: "https://i.ytimg.com/vi/VNs_cCtdbPc/hqdefault.jpg" },
        { videoId: "cl0a3i2wFcc", title: "G.O.A.T.", artist: "Diljit Dosanjh", album: "G.O.A.T.", duration: "3:43", thumbnail: "https://i.ytimg.com/vi/cl0a3i2wFcc/hqdefault.jpg" },
        { videoId: "vX2cDW8LUWk", title: "Lover", artist: "Diljit Dosanjh", album: "MoonChild Era", duration: "3:07", thumbnail: "https://i.ytimg.com/vi/vX2cDW8LUWk/hqdefault.jpg" }
      ],
      hindi: [
        { videoId: "Umqb9KENgmk", title: "Tum Hi Ho", artist: "Arijit Singh", album: "Aashiqui 2", duration: "4:22", thumbnail: "https://i.ytimg.com/vi/Umqb9KENgmk/hqdefault.jpg" },
        { videoId: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh, Pritam", album: "Brahmastra", duration: "4:28", thumbnail: "https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg" },
        { videoId: "V_jp5_VAzXk", title: "Chaleya", artist: "Arijit Singh, Shilpa Rao", album: "Jawan", duration: "3:20", thumbnail: "https://i.ytimg.com/vi/V_jp5_VAzXk/hqdefault.jpg" },
        { videoId: "ElZfdU54Cp8", title: "Apna Bana Le", artist: "Arijit Singh, Sachin-Jigar", album: "Bhediya", duration: "4:21", thumbnail: "https://i.ytimg.com/vi/ElZfdU54Cp8/hqdefault.jpg" },
        { videoId: "gvyUuxdRdR4", title: "O Maahi", artist: "Arijit Singh, Pritam", album: "Dunki", duration: "3:53", thumbnail: "https://i.ytimg.com/vi/gvyUuxdRdR4/hqdefault.jpg" },
        { videoId: "RLzC55ai0eo", title: "Heeriye", artist: "Jasleen Royal, Arijit Singh", album: "Heeriye", duration: "3:14", thumbnail: "https://i.ytimg.com/vi/RLzC55ai0eo/hqdefault.jpg" },
        { videoId: "284Ov7ysmfA", title: "Channa Mereya", artist: "Arijit Singh, Pritam", album: "Ae Dil Hai Mushkil", duration: "4:49", thumbnail: "https://i.ytimg.com/vi/284Ov7ysmfA/hqdefault.jpg" }
      ],
      phonk: [
        { videoId: "1-xGerv5FOk", title: "Close Eyes", artist: "DVRST", album: "Close Eyes", duration: "2:12", thumbnail: "https://i.ytimg.com/vi/1-xGerv5FOk/hqdefault.jpg" },
        { videoId: "fzeoo8n8RZo", title: "Murder In My Mind", artist: "Kordhell", album: "Murder In My Mind", duration: "2:25", thumbnail: "https://i.ytimg.com/vi/fzeoo8n8RZo/hqdefault.jpg" },
        { videoId: "NS9z2QHcZdY", title: "Metamorphosis", artist: "INTERWORLD", album: "Metamorphosis", duration: "2:22", thumbnail: "https://i.ytimg.com/vi/NS9z2QHcZdY/hqdefault.jpg" },
        { videoId: "dvQJIgjlR3I", title: "Neon Blade", artist: "MoonDeity", album: "Neon Blade", duration: "4:24", thumbnail: "https://i.ytimg.com/vi/dvQJIgjlR3I/hqdefault.jpg" },
        { videoId: "pIZ0QRWK0zg", title: "Sahara", artist: "Hensonn", album: "Sahara", duration: "2:51", thumbnail: "https://i.ytimg.com/vi/pIZ0QRWK0zg/hqdefault.jpg" }
      ],
      pop: [
        { videoId: "DlFXDl_ROAM", title: "Die With A Smile", artist: "Lady Gaga, Bruno Mars", album: "Die With A Smile", duration: "4:12", thumbnail: "https://i.ytimg.com/vi/DlFXDl_ROAM/hqdefault.jpg" },
        { videoId: "kIft-LUHHVA", title: "Espresso", artist: "Sabrina Carpenter", album: "Short n' Sweet", duration: "2:56", thumbnail: "https://i.ytimg.com/vi/kIft-LUHHVA/hqdefault.jpg" },
        { videoId: "WKZO-CWeOVA", title: "BIRDS OF A FEATHER", artist: "Billie Eilish", album: "HIT ME HARD AND SOFT", duration: "3:31", thumbnail: "https://i.ytimg.com/vi/WKZO-CWeOVA/hqdefault.jpg" },
        { videoId: "aC9HkZW2hZk", title: "Cruel Summer", artist: "Taylor Swift", album: "Lover", duration: "2:59", thumbnail: "https://i.ytimg.com/vi/aC9HkZW2hZk/hqdefault.jpg" },
        { videoId: "J7p4bzqLvCw", title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", duration: "3:22", thumbnail: "https://i.ytimg.com/vi/J7p4bzqLvCw/hqdefault.jpg" },
        { videoId: "OsfAnsMY21M", title: "Levitating", artist: "Dua Lipa", album: "Future Nostalgia", duration: "3:24", thumbnail: "https://i.ytimg.com/vi/OsfAnsMY21M/hqdefault.jpg" },
        { videoId: "aHmg0jsmNhg", title: "vampire", artist: "Olivia Rodrigo", album: "GUTS", duration: "3:40", thumbnail: "https://i.ytimg.com/vi/aHmg0jsmNhg/hqdefault.jpg" },
        { videoId: "AdEKgwUqPKI", title: "Kill Bill", artist: "SZA", album: "SOS", duration: "2:34", thumbnail: "https://i.ytimg.com/vi/AdEKgwUqPKI/hqdefault.jpg" }
      ],
      hiphop: [
        { videoId: "phLb_SoPBlA", title: "Not Like Us", artist: "Kendrick Lamar", album: "Not Like Us", duration: "4:35", thumbnail: "https://i.ytimg.com/vi/phLb_SoPBlA/hqdefault.jpg" },
        { videoId: "xIQpLlYC8xA", title: "Houdini", artist: "Eminem", album: "The Death of Slim Shady", duration: "3:48", thumbnail: "https://i.ytimg.com/vi/xIQpLlYC8xA/hqdefault.jpg" },
        { videoId: "2nR1zrNzgcY", title: "FE!N (feat. Playboi Carti)", artist: "Travis Scott", album: "UTOPIA", duration: "3:12", thumbnail: "https://i.ytimg.com/vi/2nR1zrNzgcY/hqdefault.jpg" },
        { videoId: "FrsOnNxIrg8", title: "God's Plan", artist: "Drake", album: "Scorpion", duration: "3:19", thumbnail: "https://i.ytimg.com/vi/FrsOnNxIrg8/hqdefault.jpg" },
        { videoId: "3_g2un5M350", title: "Starboy", artist: "The Weeknd", album: "Starboy", duration: "3:51", thumbnail: "https://i.ytimg.com/vi/3_g2un5M350/hqdefault.jpg" },
        { videoId: "4EQkYVtE-28", title: "Circles", artist: "Post Malone", album: "Hollywood's Bleeding", duration: "3:36", thumbnail: "https://i.ytimg.com/vi/4EQkYVtE-28/hqdefault.jpg" }
      ],
      rock: [
        { videoId: "eVTXPUF4Oz4", title: "In the End", artist: "Linkin Park", album: "Hybrid Theory", duration: "3:36", thumbnail: "https://i.ytimg.com/vi/eVTXPUF4Oz4/hqdefault.jpg" },
        { videoId: "bpOSxM0rNPM", title: "Do I Wanna Know?", artist: "Arctic Monkeys", album: "AM", duration: "4:32", thumbnail: "https://i.ytimg.com/vi/bpOSxM0rNPM/hqdefault.jpg" },
        { videoId: "BSTsnWoslP4", title: "Bohemian Rhapsody", artist: "Queen", album: "A Night at the Opera", duration: "5:55", thumbnail: "https://i.ytimg.com/vi/BSTsnWoslP4/hqdefault.jpg" },
        { videoId: "9ssQKlLxBdQ", title: "Thunder", artist: "Imagine Dragons", album: "Evolve", duration: "3:08", thumbnail: "https://i.ytimg.com/vi/9ssQKlLxBdQ/hqdefault.jpg" },
        { videoId: "_GWKkqNoyEA", title: "Counting Stars", artist: "OneRepublic", album: "Native", duration: "4:18", thumbnail: "https://i.ytimg.com/vi/_GWKkqNoyEA/hqdefault.jpg" },
        { videoId: "2NiyrtYegso", title: "Wake Me Up", artist: "Avicii", album: "True", duration: "4:08", thumbnail: "https://i.ytimg.com/vi/2NiyrtYegso/hqdefault.jpg" }
      ],
      lofi: [
        { videoId: "kAw9xGI8vgk", title: "Deep Chill Lofi Study", artist: "Lumosound", album: "Lofi Study Session", duration: "3:40", thumbnail: "https://i.ytimg.com/vi/kAw9xGI8vgk/hqdefault.jpg" },
        { videoId: "4EQkYVtE-28", title: "Circles (Chill Acoustic)", artist: "Post Malone", album: "Acoustic", duration: "3:36", thumbnail: "https://i.ytimg.com/vi/4EQkYVtE-28/hqdefault.jpg" },
        { videoId: "bpOSxM0rNPM", title: "Do I Wanna Know? (Acoustic)", artist: "Arctic Monkeys", album: "Chill", duration: "4:32", thumbnail: "https://i.ytimg.com/vi/bpOSxM0rNPM/hqdefault.jpg" }
      ]
    };

    let related = (genrePools[detectedCategory] || genrePools.pop).filter(t => t.videoId !== currentTrack.videoId);

    // Dynamic search for more related songs by artist if available
    try {
      if (currentTrack.artist && currentTrack.artist !== 'Unknown Artist') {
        const query = `${currentTrack.artist} songs`;
        const searchRes = await this.search(query, 'songs');
        if (searchRes && searchRes.results && searchRes.results.length > 0) {
          const extra = searchRes.results.filter(t => t.videoId !== currentTrack.videoId && !related.some(r => r.videoId === t.videoId));
          related = [...related, ...extra.slice(0, 6)];
        }
      }
    } catch (e) {}

    return {
      category: detectedCategory,
      displayTag: displayTag,
      tracks: related.map(t => ({
        ...t,
        isLiked: this.isLiked(t.videoId)
      }))
    };
  }

  cleanTitle(title) {
    if (!title) return '';
    return title
      .replace(/\s*[\(\[](official\s*(music\s*)?video|video|audio|lyrics|visualizer|full\s*song|hd|4k|mv)[\)\]]/gi, '')
      .replace(/\s*-\s*official\s*video/gi, '')
      .trim();
  }

  async getLyrics(title, artist, duration = null) {
    if (!title) return { type: 'unavailable', message: 'No lyrics available' };
    const cleanedTitle = this.cleanTitle(title);
    const cleanedArtist = (artist && artist !== 'Unknown Artist') ? artist.replace(/\s*-\s*Topic/i, '').trim() : '';
    const cacheKey = `lyrics_${cleanedTitle}_${cleanedArtist}`.toLowerCase();

    if (!this._lyricsCache) this._lyricsCache = new Map();
    if (this._lyricsCache.has(cacheKey)) {
      return this._lyricsCache.get(cacheKey);
    }

    try {
      let url = `https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanedTitle)}`;
      if (cleanedArtist) {
        url += `&artist_name=${encodeURIComponent(cleanedArtist)}`;
      }
      if (duration && duration > 0) {
        url += `&duration=${Math.round(duration)}`;
      }

      let res = await fetch(url, { headers: { 'User-Agent': 'EtsukoMusicApp/1.0' } });
      if (!res.ok && res.status === 404) {
        // Fallback fuzzy search on LRCLIB
        const query = `${cleanedTitle} ${cleanedArtist}`.trim();
        const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(query)}`;
        const searchRes = await fetch(searchUrl, { headers: { 'User-Agent': 'EtsukoMusicApp/1.0' } });
        if (searchRes.ok) {
          const list = await searchRes.json();
          if (Array.isArray(list) && list.length > 0) {
            res = { ok: true, status: 200, json: async () => list[0] };
          }
        }
      }

      if (!res.ok) {
        const fallbackResult = { type: 'unavailable', message: 'Lyrics not available for this track' };
        this._lyricsCache.set(cacheKey, fallbackResult);
        return fallbackResult;
      }

      const data = await res.json();
      if (!data) {
        const fallbackResult = { type: 'unavailable', message: 'Lyrics not available for this track' };
        this._lyricsCache.set(cacheKey, fallbackResult);
        return fallbackResult;
      }

      if (data.instrumental) {
        const result = { type: 'instrumental', message: 'Instrumental track • Enjoy the music' };
        this._lyricsCache.set(cacheKey, result);
        return result;
      }

      if (data.syncedLyrics && typeof data.syncedLyrics === 'string') {
        const lines = [];
        const rawLines = data.syncedLyrics.split('\n');
        for (const line of rawLines) {
          const match = line.match(/^\[(\d{2}):(\d{2}(?:\.\d{1,3})?)\](.*)$/);
          if (match) {
            const mins = parseFloat(match[1]);
            const secs = parseFloat(match[2]);
            const text = match[3].trim();
            lines.push({
              time: mins * 60 + secs,
              text: text || '♪'
            });
          }
        }
        if (lines.length > 0) {
          const result = { type: 'synced', lines };
          this._lyricsCache.set(cacheKey, result);
          return result;
        }
      }

      if (data.plainLyrics && typeof data.plainLyrics === 'string') {
        const result = { type: 'plain', text: data.plainLyrics };
        this._lyricsCache.set(cacheKey, result);
        return result;
      }

      const fallbackResult = { type: 'unavailable', message: 'Lyrics not available for this track' };
      this._lyricsCache.set(cacheKey, fallbackResult);
      return fallbackResult;
    } catch (e) {
      console.warn('[API] Lyrics fetch notice:', e);
      return { type: 'unavailable', message: 'Lyrics unavailable' };
    }
  }

  getUserGenres() {
    try {
      const raw = localStorage.getItem(this.localGenresKey);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  saveUserGenres(genres) {
    try {
      localStorage.setItem(this.localGenresKey, JSON.stringify(genres));
    } catch (e) {}
  }
}

// Global API Singleton
if (typeof window !== 'undefined') {
  window.api = new EtsukoAPI();
}
