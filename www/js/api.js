// Etsuko Mobile Neural API Engine
// Pure YouTube Music Catalog & Local Persistent Library

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
  }
];

const CURATED_MOOD_STATIONS = {
  trending: DEFAULT_TRENDING_TRACKS,
  phonk: [
    {
      videoId: "w-sQRS-zTZg",
      title: "Murder In My Mind",
      artist: "KORDHELL",
      album: "Phonk Killer",
      duration: "2:25",
      thumbnail: "https://i.ytimg.com/vi/w-sQRS-zTZg/hqdefault.jpg"
    },
    {
      videoId: "1-xGerv5FOk",
      title: "Close Eyes",
      artist: "DVRST",
      album: "Close Eyes",
      duration: "2:12",
      thumbnail: "https://i.ytimg.com/vi/1-xGerv5FOk/hqdefault.jpg"
    },
    {
      videoId: "mK9nE0mQoas",
      title: "Flare",
      artist: "Hensonn",
      album: "Flare Phonk",
      duration: "2:31",
      thumbnail: "https://i.ytimg.com/vi/mK9nE0mQoas/hqdefault.jpg"
    },
    {
      videoId: "M1fA8q-rP6o",
      title: "North Memphis",
      artist: "Pharmacist",
      album: "North Memphis",
      duration: "2:22",
      thumbnail: "https://i.ytimg.com/vi/M1fA8q-rP6o/hqdefault.jpg"
    },
    {
      videoId: "49H5e3Bf97M",
      title: "COWBELL WARRIOR!",
      artist: "SXMPRA",
      album: "COWBELL WARRIOR",
      duration: "1:48",
      thumbnail: "https://i.ytimg.com/vi/49H5e3Bf97M/hqdefault.jpg"
    },
    {
      videoId: "dZ8Zg2pA5-c",
      title: "Why Not",
      artist: "Ghostface Playa",
      album: "Why Not",
      duration: "2:46",
      thumbnail: "https://i.ytimg.com/vi/dZ8Zg2pA5-c/hqdefault.jpg"
    }
  ],
  lofi: [
    {
      videoId: "iXp2ekn8l2k",
      title: "Snowman",
      artist: "Lofi Fruit Music",
      album: "Chill Study Beats",
      duration: "2:40",
      thumbnail: "https://i.ytimg.com/vi/iXp2ekn8l2k/hqdefault.jpg"
    },
    {
      videoId: "_tV5LEBDs7w",
      title: "Kingdom in Blue",
      artist: "Kupla",
      album: "Kingdom in Blue",
      duration: "2:20",
      thumbnail: "https://i.ytimg.com/vi/_tV5LEBDs7w/hqdefault.jpg"
    },
    {
      videoId: "5qxPqZ3N20M",
      title: "im closing my eyes",
      artist: "potsu",
      album: "closing eyes",
      duration: "2:07",
      thumbnail: "https://i.ytimg.com/vi/5qxPqZ3N20M/hqdefault.jpg"
    },
    {
      videoId: "hUfK4_36l88",
      title: "controlla",
      artist: "Idealism",
      album: "rainy nights",
      duration: "2:15",
      thumbnail: "https://i.ytimg.com/vi/hUfK4_36l88/hqdefault.jpg"
    },
    {
      videoId: "v0T3z4g3B4M",
      title: "Losing Interest",
      artist: "Shiloh Dynasty",
      album: "Losing Interest",
      duration: "2:10",
      thumbnail: "https://i.ytimg.com/vi/v0T3z4g3B4M/hqdefault.jpg"
    }
  ],
  synth: [
    {
      videoId: "MV_3Dpw-BRY",
      title: "Nightcall",
      artist: "Kavinsky",
      album: "OutRun",
      duration: "4:19",
      thumbnail: "https://i.ytimg.com/vi/MV_3Dpw-BRY/hqdefault.jpg"
    },
    {
      videoId: "8GW6sLrK40k",
      title: "Resonance",
      artist: "HOME",
      album: "Odyssey",
      duration: "3:32",
      thumbnail: "https://i.ytimg.com/vi/8GW6sLrK40k/hqdefault.jpg"
    },
    {
      videoId: "oTN6ceOVdyE",
      title: "Future Club",
      artist: "Perturbator",
      album: "Dangerous Days",
      duration: "4:51",
      thumbnail: "https://i.ytimg.com/vi/oTN6ceOVdyE/hqdefault.jpg"
    },
    {
      videoId: "qFfybn_W8Ak",
      title: "Roller Mobster",
      artist: "Carpenter Brut",
      album: "Trilogy",
      duration: "3:34",
      thumbnail: "https://i.ytimg.com/vi/qFfybn_W8Ak/hqdefault.jpg"
    },
    {
      videoId: "rDBbaGCCIhk",
      title: "Sunset",
      artist: "The Midnight",
      album: "Endless Summer",
      duration: "5:26",
      thumbnail: "https://i.ytimg.com/vi/rDBbaGCCIhk/hqdefault.jpg"
    }
  ],
  gaming: [
    {
      videoId: "QHRuTYtSbJQ",
      title: "BFG 9000",
      artist: "Mick Gordon",
      album: "DOOM OST",
      duration: "5:02",
      thumbnail: "https://i.ytimg.com/vi/QHRuTYtSbJQ/hqdefault.jpg"
    },
    {
      videoId: "9ayYeLLT8qs",
      title: "Spoiler",
      artist: "Hyper",
      album: "Lies",
      duration: "4:30",
      thumbnail: "https://i.ytimg.com/vi/9ayYeLLT8qs/hqdefault.jpg"
    },
    {
      videoId: "wN27j9q4D7g",
      title: "Into the Void",
      artist: "Celldweller",
      album: "End of an Empire",
      duration: "4:31",
      thumbnail: "https://i.ytimg.com/vi/wN27j9q4D7g/hqdefault.jpg"
    }
  ],
  rock: [
    {
      videoId: "eVTXPUF4Oz4",
      title: "In the End",
      artist: "Linkin Park",
      album: "Hybrid Theory",
      duration: "3:36",
      thumbnail: "https://i.ytimg.com/vi/eVTXPUF4Oz4/hqdefault.jpg"
    },
    {
      videoId: "QJJYpsA5tv8",
      title: "Can You Feel My Heart",
      artist: "Bring Me The Horizon",
      album: "Sempiternal",
      duration: "3:47",
      thumbnail: "https://i.ytimg.com/vi/QJJYpsA5tv8/hqdefault.jpg"
    },
    {
      videoId: "hTWKbfoikeg",
      title: "Smells Like Teen Spirit",
      artist: "Nirvana",
      album: "Nevermind",
      duration: "5:01",
      thumbnail: "https://i.ytimg.com/vi/hTWKbfoikeg/hqdefault.jpg"
    },
    {
      videoId: "bpOSxM0rNPM",
      title: "Do I Wanna Know?",
      artist: "Arctic Monkeys",
      album: "AM",
      duration: "4:32",
      thumbnail: "https://i.ytimg.com/vi/bpOSxM0rNPM/hqdefault.jpg"
    }
  ]
};

const DEFAULT_CATEGORIES = [
  { id: "trending", name: "🔥 Global Hits" },
  { id: "phonk", name: "⚡ Phonk & Drift" },
  { id: "lofi", name: "☕ Lo-Fi Study" },
  { id: "synth", name: "🚗 Late Night Synth" },
  { id: "gaming", name: "🎮 Deep Focus" },
  { id: "rock", name: "🎸 Rock & Metal" }
];

const PIPED_SEARCH_MIRRORS = [
  'https://api.piped.private.coffee',
  'https://pipedapi.ducks.party'
];

function formatHighResThumbnail(videoId, url) {
  if (url && url.includes('googleusercontent.com')) {
    return url.replace(/=w\d+-h\d+[^&]*/, '=w544-h544-l90-rj');
  }
  if (videoId) {
    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  }
  return url || 'assets/default_cover.png';
}

function isSpamMix(title) {
  const t = (title || '').toLowerCase();
  return t.includes('1 hour') || t.includes('2 hour') || t.includes('3 hour') ||
         t.includes('10 hour') || t.includes('non stop') || t.includes('non-stop') ||
         t.includes('compilation') || t.includes('playlist mix') || t.includes('full album mix');
}

class EtsukoAPI {
  constructor() {
    this.baseUrl = '';
    this.localLikesKey = 'etsuko_library_likes_v1';
    this.localCratesKey = 'etsuko_library_crates_v1';
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

  // --- Home Feed & Mood Stations ---
  async getHomeFeed() {
    return {
      trending: this.getMoodTracks('trending'),
      categories: DEFAULT_CATEGORIES
    };
  }

  getMoodTracks(category) {
    const list = CURATED_MOOD_STATIONS[category] || CURATED_MOOD_STATIONS.trending;
    return list.map(t => ({
      ...t,
      isLiked: this.isLiked(t.videoId)
    }));
  }

  // --- Pure YouTube Music Search Engine ---
  async search(query, filter = 'songs', signal = null) {
    if (!query || !query.trim()) return { results: [] };
    const q = query.trim();

    // 1. Direct YouTube Music InnerTube Search (WEB_REMIX client)
    try {
      const ytResults = await this.searchInnerTube(q, signal);
      if (ytResults && ytResults.length > 0) {
        return {
          results: ytResults.map(r => ({
            ...r,
            isLiked: this.isLiked(r.videoId)
          }))
        };
      }
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      console.warn('[Search] InnerTube notice:', err.message);
    }

    // 2. Piped Mirrors Fallback Race
    try {
      const pipedResults = await this.searchPiped(q, signal);
      if (pipedResults && pipedResults.length > 0) {
        return {
          results: pipedResults.map(r => ({
            ...r,
            isLiked: this.isLiked(r.videoId)
          }))
        };
      }
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      console.warn('[Search] Piped fallback notice:', err.message);
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
      signal: signal || AbortSignal.timeout(4500)
    });

    if (!res.ok) throw new Error(`InnerTube HTTP ${res.status}`);
    const data = await res.json();
    const sections = data?.contents?.tabbedSearchResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents || [];

    const results = [];
    const seen = new Set();

    for (const s of sections) {
      // Top result card
      if (s.musicCardShelfRenderer) {
        const c = s.musicCardShelfRenderer;
        const title = c.title?.runs?.[0]?.text;
        const vid = c.title?.runs?.[0]?.navigationEndpoint?.watchEndpoint?.videoId || c.onTap?.watchEndpoint?.videoId;
        const artist = (c.subtitle?.runs || []).map(r => r.text).join('').replace(/^[•\s]+|[•\s]+$/g, '');
        const thumb = c.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.slice(-1)[0]?.url;
        if (vid && title && !seen.has(vid) && !isSpamMix(title)) {
          seen.add(vid);
          results.push({
            videoId: vid,
            title: title,
            artist: artist || 'YouTube Music',
            album: 'Official Release',
            duration: '3:30',
            thumbnail: formatHighResThumbnail(vid, thumb),
            source: 'youtube'
          });
        }
      }

      // Track rows in shelf or section
      const items = s.itemSectionRenderer?.contents || s.musicShelfRenderer?.contents || [];
      for (const item of items) {
        const r = item.musicResponsiveListItemRenderer;
        if (!r) continue;
        const cols = r.flexColumns || [];
        const title = cols[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text;
        const vid = cols[0]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.navigationEndpoint?.watchEndpoint?.videoId
          || r.overlay?.musicItemThumbnailOverlayRenderer?.content?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchEndpoint?.videoId
          || r.playlistItemData?.videoId;
        const artist = (cols[1]?.musicResponsiveListItemFlexColumnRenderer?.text?.runs || []).map(x => x.text).join('').replace(/^[•\s]+|[•\s]+$/g, '');
        const thumb = r.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.slice(-1)[0]?.url;

        if (vid && title && !seen.has(vid) && !isSpamMix(title)) {
          seen.add(vid);
          results.push({
            videoId: vid,
            title: title,
            artist: artist || 'YouTube Artist',
            album: 'YouTube Music Master',
            duration: '3:30',
            thumbnail: formatHighResThumbnail(vid, thumb),
            source: 'youtube'
          });
        }
      }
    }
    return results;
  }

  async searchPiped(query, signal = null) {
    const promises = PIPED_SEARCH_MIRRORS.map(async mirror => {
      const url = `${mirror}/search?q=${encodeURIComponent(query)}&filter=music_songs`;
      const res = await fetch(url, { signal: signal || AbortSignal.timeout(3500) });
      if (!res.ok) throw new Error(`${mirror} status ${res.status}`);
      const data = await res.json();
      if (!data || !data.items || data.items.length === 0) throw new Error('No items');
      return data.items;
    });

    const items = await Promise.any(promises);
    const results = [];
    const seen = new Set();

    items.forEach(item => {
      const vid = item.url ? item.url.replace('/watch?v=', '') : null;
      const title = item.title || 'Unknown Track';
      const durSec = parseInt(item.duration, 10) || 210;

      // Filter out long compilation videos
      if (vid && !seen.has(vid) && durSec <= 540 && !isSpamMix(title)) {
        seen.add(vid);
        const mins = Math.floor(durSec / 60);
        const secs = durSec % 60;

        results.push({
          videoId: vid,
          title: title,
          artist: item.uploaderName || 'YouTube Artist',
          album: 'YouTube Music Master',
          duration: `${mins}:${String(secs).padStart(2, '0')}`,
          thumbnail: formatHighResThumbnail(vid, item.thumbnail),
          source: 'youtube'
        });
      }
    });

    return results;
  }

  // --- Synced Lyrics (LRCLIB) ---
  async getLyrics(title, artist = '') {
    try {
      const cleanTitle = title.replace(/\([^)]*\)|\[[^\]]*\]/g, '').trim();
      const cleanArtist = artist.split(/[,&feat•]/i)[0].trim();
      const lrcUrl = `https://lrclib.net/api/get?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(cleanArtist)}`;
      const res = await fetch(lrcUrl, { signal: AbortSignal.timeout(3500) });
      if (res.ok) {
        const data = await res.json();
        if (data && (data.syncedLyrics || data.plainLyrics)) {
          return {
            syncedLyrics: data.syncedLyrics || '',
            plainLyrics: data.plainLyrics || '',
            source: 'LRCLIB'
          };
        }
      }
    } catch (e) {
      console.warn('[API] Lyrics notice:', e.message);
    }

    return {
      syncedLyrics: '',
      plainLyrics: 'No synchronized neural lyrics available for this track.',
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

  // --- Crates / Playlists ---
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
}

// Global API Singleton
if (typeof window !== 'undefined') {
  window.api = new EtsukoAPI();
}
