// Etsuko Mobile Neural API Engine
// YouTube Music Search, Dynamic Daily Recommendations, Spotify-Tier Content Feeds & Local Persistent Library

function formatHighResThumbnail(videoId, url) {
  if (url && url.includes('googleusercontent.com')) {
    return url.replace(/=w\d+-h\d+[^&]*/, '=w544-h544-l90-rj');
  }
  if (url && (url.includes('ytimg.com') || url.includes('youtube.com'))) {
    return url.replace(/\/(hqdefault|mqdefault|default|sddefault)\.jpg/, '/hq720.jpg');
  }
  if (videoId) {
    return `https://i.ytimg.com/vi/${videoId}/hq720.jpg`;
  }
  return url || 'assets/default_cover.png';
}

// Master Curated Catalog
const CATALOG_JUMP_BACK = [
  {
    videoId: "J7p4bzqLvCw",
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    duration: "3:22",
    tag: "Single",
    thumbnail: "https://yt3.googleusercontent.com/R_cjQK3wwLPEzri1jerx-79zgzGocoKvwGU3NMONaTsaMM0Idd641pfB8r5jgfpn6I8JAoFtf9RBIcI=w544-h544-l90-rj"
  },
  {
    videoId: "aC9HkZW2hZk",
    title: "Cruel Summer",
    artist: "Taylor Swift",
    album: "Lover",
    duration: "2:59",
    tag: "Single",
    thumbnail: "https://yt3.googleusercontent.com/OhxDTHQOQzSrcdgH9hzqzp1v22GYDE-QKnkryvCeq4ddx-3K3_c8oDXN0E6NvHlMn1q4XV59aHr0oL4f=w544-h544-l90-rj"
  },
  {
    videoId: "kIft-LUHHVA",
    title: "Espresso",
    artist: "Sabrina Carpenter",
    album: "Short n' Sweet",
    duration: "2:56",
    tag: "Single",
    thumbnail: "https://yt3.googleusercontent.com/bTWlZSenrOAYgH4r6NAzyDraWQR_wLl3OuRexJ_8h3NZUVHEilRSzUmKNa9YMOFSVcF0YtOuzKdXrt2UHg=w544-h544-l90-rj"
  },
  {
    videoId: "1-xGerv5FOk",
    title: "Close Eyes",
    artist: "DVRST",
    album: "Close Eyes",
    duration: "2:12",
    tag: "Single",
    thumbnail: "https://i.ytimg.com/vi/1-xGerv5FOk/hq720.jpg"
  },
  {
    videoId: "XV7JPAasdY4",
    title: "TOP 10 MOST VIRAL PHONK 2026",
    artist: "Mente Ma / Swerve",
    album: "Viral Phonk 2026",
    duration: "2:40",
    tag: "EP",
    thumbnail: "https://yt3.googleusercontent.com/0DBds5EDBJMYe6WLbq3qOvmSSBqZJJbC-9vPLfHaSyocxcGko5GcV38sBiQkdt39BzCVdGu5hSMV0zIl=w544-h544-l90-rj"
  },
  {
    videoId: "4EQkYVtE-28",
    title: "Circles",
    artist: "Post Malone",
    album: "Hollywood's Bleeding",
    duration: "3:36",
    tag: "Single",
    thumbnail: "https://yt3.googleusercontent.com/YoQ-A-GOpgeE8tgdF3Rcf5z9V8NIIKjLH6_7X3QphIQUwVHioLu7Ik2wQzU0oCkyNm1TeLDLDYvomJ8=w544-h544-l90-rj"
  }
];

const CATALOG_RECENTS_DEFAULT = [
  {
    videoId: "3_g2un5M350",
    title: "Starboy (feat. Daft Punk)",
    artist: "The Weeknd",
    album: "Starboy",
    duration: "3:51",
    tag: "Album",
    thumbnail: "https://yt3.googleusercontent.com/dcxXIIlest09vnvKznWM9VWQXu1EL7lKxBzXGzwgmVjmMNBm1dEWT_0qn1xrEZYyKF_qRE1TLq8P_JY_mQ=w544-h544-l90-rj"
  },
  {
    videoId: "WKZO-CWeOVA",
    title: "BIRDS OF A FEATHER",
    artist: "Billie Eilish",
    album: "HIT ME HARD AND SOFT",
    duration: "3:31",
    tag: "Single",
    thumbnail: "https://yt3.googleusercontent.com/mXJjWX4E6Gpr03CUYl18PdVXlczmoL2Tm-LEBGafIr_8smlHnl8AHniJu0_7Y80e-aeloJxcryQQx0ZJ=w544-h544-l90-rj"
  },
  {
    videoId: "phLb_SoPBlA",
    title: "Not Like Us",
    artist: "Kendrick Lamar",
    album: "Not Like Us",
    duration: "4:35",
    tag: "Single",
    thumbnail: "https://yt3.googleusercontent.com/8qk3C_zpd2FXHVN8BpMBFL6h9J5BlKlbcKOlvDMvIgBWBsAblDoTjU98RGbFH9DxtnN1X5zRzc9sSvWr=w544-h544-l90-rj"
  },
  {
    videoId: "DlFXDl_ROAM",
    title: "Die With A Smile",
    artist: "Lady Gaga, Bruno Mars",
    album: "Die With A Smile",
    duration: "4:12",
    tag: "Single",
    thumbnail: "https://yt3.googleusercontent.com/RFK4wHeGqwI3DndbARbRJB21IC0TcmqnrlyjxYK7T-nC8wlIVbfxNaCIFKNvSpchDKmYyVLe1RN36w=w544-h544-l90-rj"
  }
];

const CATALOG_DAILY_POOL = [
  { videoId: "aHmg0jsmNhg", title: "vampire", artist: "Olivia Rodrigo", album: "GUTS", duration: "3:40", tag: "Single", thumbnail: "https://yt3.googleusercontent.com/F32A1XBuQEkcOnYin-1BURG2MK_q12Ebovqwe8im8KXf8BHJ_jXW_7NnK73K6QOH-1D6QZKrrZGbNrlS=w544-h544-l90-rj" },
  { videoId: "xIQpLlYC8xA", title: "Houdini", artist: "Eminem", album: "The Death of Slim Shady", duration: "3:48", tag: "Single", thumbnail: "https://yt3.googleusercontent.com/Xx3dX1EJDirqwpfQL05uAgmKGYpzTcFDXjjHqjNpIhgY5MWTJRLSlOjaYVtup2Ku6gBYEqXoxw5aGKC3=w544-h544-l90-rj" },
  { videoId: "2nR1zrNzgcY", title: "FE!N (feat. Playboi Carti)", artist: "Travis Scott", album: "UTOPIA", duration: "3:12", tag: "Album", thumbnail: "https://yt3.googleusercontent.com/eBvJuWpjg0Mx8DBa5WIhCzEopXyMnxkjWSU895BDGjTpNeqrliLrv3zGqNNuCUoXL1EkEAr5VQ3cx2pW=w544-h544-l90-rj" },
  { videoId: "OsfAnsMY21M", title: "Levitating", artist: "Dua Lipa", album: "Future Nostalgia", duration: "3:24", tag: "Single", thumbnail: "https://yt3.googleusercontent.com/UpJ_IhBqyhQV9b2UGcDxxWDm14kRQ2eY1o9S96AGsbE7Ol8isbpbPA0Yefvg8S8ZGAX9L1g4xaj21zVJ=w544-h544-l90-rj" },
  { videoId: "bpOSxM0rNPM", title: "Do I Wanna Know?", artist: "Arctic Monkeys", album: "AM", duration: "4:32", tag: "Album", thumbnail: "https://i.ytimg.com/vi/bpOSxM0rNPM/hq720.jpg" },
  { videoId: "eVTXPUF4Oz4", title: "In the End", artist: "Linkin Park", album: "Hybrid Theory", duration: "3:36", tag: "EP", thumbnail: "https://i.ytimg.com/vi/eVTXPUF4Oz4/hq720.jpg" },
  { videoId: "kAw9xGI8vgk", title: "Deep Chill Lofi Study", artist: "Lumosound", album: "Lofi Study Session", duration: "3:40", tag: "EP", thumbnail: "https://yt3.googleusercontent.com/Bx7K_CPa195NNoHTdC18w3oip9PPnt7TMChxTrWk3ZpDEqaQqqUyK-TWM1lmJrIjAL8ILp5-n9FrTc2Y=w544-h544-l90-rj" },
  { videoId: "Ct0VuYnOVoA", title: "Phonk Drift", artist: "VØJ & Lastfragment", album: "Phonk Drift", duration: "2:35", tag: "Single", thumbnail: "https://yt3.googleusercontent.com/_ISr3vLZVPP2tBFSfQFrw1cSI4jDaOS7-sSmZwMksdSZadvcF8yCTy50HnB-fI0IcH9jl4SBz9uA-ho=w544-h544-l90-rj" }
];

const CATALOG_TOP_MIXES = [
  {
    id: "pop_mix",
    title: "Pop Mix",
    subtitle: "Kendrick Lamar, Sia, Lil Nas X and more",
    gradient: "linear-gradient(135deg, #10b981, #064e3b)",
    bannerColor: "#10b981",
    tracks: [
      { videoId: "aC9HkZW2hZk", title: "Cruel Summer", artist: "Taylor Swift", thumbnail: "https://yt3.googleusercontent.com/OhxDTHQOQzSrcdgH9hzqzp1v22GYDE-QKnkryvCeq4ddx-3K3_c8oDXN0E6NvHlMn1q4XV59aHr0oL4f=w544-h544-l90-rj" },
      { videoId: "kIft-LUHHVA", title: "Espresso", artist: "Sabrina Carpenter", thumbnail: "https://yt3.googleusercontent.com/bTWlZSenrOAYgH4r6NAzyDraWQR_wLl3OuRexJ_8h3NZUVHEilRSzUmKNa9YMOFSVcF0YtOuzKdXrt2UHg=w544-h544-l90-rj" },
      { videoId: "OsfAnsMY21M", title: "Levitating", artist: "Dua Lipa", thumbnail: "https://yt3.googleusercontent.com/UpJ_IhBqyhQV9b2UGcDxxWDm14kRQ2eY1o9S96AGsbE7Ol8isbpbPA0Yefvg8S8ZGAX9L1g4xaj21zVJ=w544-h544-l90-rj" }
    ]
  },
  {
    id: "2020s_mix",
    title: "2020s Mix",
    subtitle: "Doja Cat, Billie Eilish, The Weeknd and more",
    gradient: "linear-gradient(135deg, #a855f7, #581c87)",
    bannerColor: "#a855f7",
    tracks: [
      { videoId: "WKZO-CWeOVA", title: "BIRDS OF A FEATHER", artist: "Billie Eilish", thumbnail: "https://yt3.googleusercontent.com/mXJjWX4E6Gpr03CUYl18PdVXlczmoL2Tm-LEBGafIr_8smlHnl8AHniJu0_7Y80e-aeloJxcryQQx0ZJ=w544-h544-l90-rj" },
      { videoId: "J7p4bzqLvCw", title: "Blinding Lights", artist: "The Weeknd", thumbnail: "https://yt3.googleusercontent.com/R_cjQK3wwLPEzri1jerx-79zgzGocoKvwGU3NMONaTsaMM0Idd641pfB8r5jgfpn6I8JAoFtf9RBIcI=w544-h544-l90-rj" }
    ]
  },
  {
    id: "phonk_mix",
    title: "Phonk Mix",
    subtitle: "DVRST, PlayaPhonk, Kordhell and more",
    gradient: "linear-gradient(135deg, #ec4899, #831843)",
    bannerColor: "#ec4899",
    tracks: [
      { videoId: "1-xGerv5FOk", title: "Close Eyes", artist: "DVRST", thumbnail: "https://i.ytimg.com/vi/1-xGerv5FOk/hq720.jpg" },
      { videoId: "XV7JPAasdY4", title: "Demon Drift", artist: "glexks", thumbnail: "https://yt3.googleusercontent.com/0DBds5EDBJMYe6WLbq3qOvmSSBqZJJbC-9vPLfHaSyocxcGko5GcV38sBiQkdt39BzCVdGu5hSMV0zIl=w544-h544-l90-rj" }
    ]
  },
  {
    id: "lofi_mix",
    title: "Lofi Chill Mix",
    subtitle: "Lumosound, Zyra Music and more",
    gradient: "linear-gradient(135deg, #3b82f6, #1e3a8a)",
    bannerColor: "#3b82f6",
    tracks: [
      { videoId: "kAw9xGI8vgk", title: "Deep Chill Lofi Study", artist: "Lumosound", thumbnail: "https://yt3.googleusercontent.com/Bx7K_CPa195NNoHTdC18w3oip9PPnt7TMChxTrWk3ZpDEqaQqqUyK-TWM1lmJrIjAL8ILp5-n9FrTc2Y=w544-h544-l90-rj" }
    ]
  }
];

const CATALOG_POPULAR_ALBUMS = [
  {
    videoId: "3_g2un5M350",
    title: "Starboy",
    artist: "The Weeknd",
    album: "Starboy (Deluxe)",
    tag: "Album",
    thumbnail: "https://yt3.googleusercontent.com/dcxXIIlest09vnvKznWM9VWQXu1EL7lKxBzXGzwgmVjmMNBm1dEWT_0qn1xrEZYyKF_qRE1TLq8P_JY_mQ=w544-h544-l90-rj"
  },
  {
    videoId: "aHmg0jsmNhg",
    title: "GUTS",
    artist: "Olivia Rodrigo",
    album: "GUTS (spilled)",
    tag: "Album",
    thumbnail: "https://yt3.googleusercontent.com/F32A1XBuQEkcOnYin-1BURG2MK_q12Ebovqwe8im8KXf8BHJ_jXW_7NnK73K6QOH-1D6QZKrrZGbNrlS=w544-h544-l90-rj"
  },
  {
    videoId: "bpOSxM0rNPM",
    title: "AM",
    artist: "Arctic Monkeys",
    album: "AM Master",
    tag: "Album",
    thumbnail: "https://i.ytimg.com/vi/bpOSxM0rNPM/hq720.jpg"
  },
  {
    videoId: "eVTXPUF4Oz4",
    title: "Hybrid Theory",
    artist: "Linkin Park",
    album: "Hybrid Theory 20th",
    tag: "Album",
    thumbnail: "https://i.ytimg.com/vi/eVTXPUF4Oz4/hq720.jpg"
  }
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
          title: 'Cyberpunk Drive',
          description: 'High octane neon night rhythm',
          tracks: []
        }
      ]));
    }
  }

  // --- Spotify-Style Home Feed ---
  async getHomeFeed() {
    // 1. Jump back in: User's recent tracks or curated starter tracks
    let jumpBackIn = this.getRecentTracks();
    if (!jumpBackIn || jumpBackIn.length === 0) {
      jumpBackIn = CATALOG_JUMP_BACK;
    }

    // 2. Recents: Recent listening history
    let recents = this.getRecentTracks();
    if (!recents || recents.length === 0) {
      recents = CATALOG_RECENTS_DEFAULT;
    }

    // 3. Recommended for today: Seeded by current date so it rotates every day at midnight!
    const dailyPicks = this.getDailyPicks();

    return {
      jumpBackIn: jumpBackIn.map(t => ({ ...t, isLiked: this.isLiked(t.videoId) })),
      recents: recents.map(t => ({ ...t, isLiked: this.isLiked(t.videoId) })),
      dailyPicks: dailyPicks.map(t => ({ ...t, isLiked: this.isLiked(t.videoId) })),
      topMixes: CATALOG_TOP_MIXES,
      popularAlbums: CATALOG_POPULAR_ALBUMS.map(t => ({ ...t, isLiked: this.isLiked(t.videoId) }))
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
    const offset = Math.abs(hash) % CATALOG_DAILY_POOL.length;

    // Shift and wrap array based on today's hash
    const rotated = [
      ...CATALOG_DAILY_POOL.slice(offset),
      ...CATALOG_DAILY_POOL.slice(0, offset)
    ];

    return rotated;
  }

  // --- YouTube Music Search Engine ---
  async search(query, filter = 'songs', signal = null) {
    if (!query || !query.trim()) return { results: [] };
    const q = query.trim();

    try {
      const ytResults = await this.searchInnerTube(q, signal);
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
      console.warn('[Search] Notice:', err.message);
    }

    return { results: [] };
  }

  async searchInnerTube(query, signal = null) {
    const res = await fetch('https://music.youtube.com/youtubei/v1/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: 'WEB_REMIX',
            clientVersion: '1.20240101.01.00'
          }
        },
        query: query
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
        const shelf = section.musicCardShelfRenderer || section.musicShelfRenderer;
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

          // Title
          const title = renderer.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text || 'Unknown Title';

          // Artist & Album
          let artist = 'Unknown Artist';
          let album = 'Single';
          let duration = '3:30';

          const col2Runs = renderer.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || [];
          if (col2Runs.length > 0) {
            artist = col2Runs[0]?.text || artist;
            if (col2Runs.length > 2) {
              album = col2Runs[2]?.text || album;
            }
          }

          // Duration
          const col3Runs = renderer.flexColumns?.[2]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || [];
          if (col3Runs.length > 0) {
            duration = col3Runs[0]?.text || duration;
          }

          // Thumbnail
          const thumbs = renderer.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails || [];
          let thumbnail = thumbs.length > 0 ? thumbs[thumbs.length - 1].url : `https://i.ytimg.com/vi/${videoId}/hq720.jpg`;

          results.push({
            videoId,
            title,
            artist,
            album,
            duration,
            thumbnail
          });
        }
      }
    } catch (e) {
      console.warn('[API] Parse InnerTube search exception:', e);
    }

    return results;
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
