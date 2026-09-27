// Etsuko Mobile Neural API Engine
// Pure YouTube Music Catalog, Direct Audio Stream Resolver & Local Persistent Library

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
      videoId: "1-xGerv5FOk",
      title: "Close Eyes",
      artist: "DVRST",
      album: "Close Eyes",
      duration: "2:12",
      thumbnail: "https://i.ytimg.com/vi/1-xGerv5FOk/hq720.jpg"
    },
    {
      videoId: "Ct0VuYnOVoA",
      title: "Phonk Drift",
      artist: "VØJ & Lastfragment",
      album: "Phonk Drift",
      duration: "2:35",
      thumbnail: "https://yt3.googleusercontent.com/_ISr3vLZVPP2tBFSfQFrw1cSI4jDaOS7-sSmZwMksdSZadvcF8yCTy50HnB-fI0IcH9jl4SBz9uA-ho=w544-h544-l90-rj"
    },
    {
      videoId: "sOHVMObuR3Q",
      title: "Aggressive Phonk Supernova",
      artist: "NOMINAL",
      album: "Rave Drift",
      duration: "2:45",
      thumbnail: "https://yt3.googleusercontent.com/y9oGVaSvE0nU6d_6YysWNhIqav0m3H55cBV166OkTGvUs3X1JXgV7Vq2K8bwmqvHgIFDNTrHEAd60p0=w544-h544-l90-rj"
    },
    {
      videoId: "XV7JPAasdY4",
      title: "Demon Drift",
      artist: "glexks & $werve",
      album: "Demon Drift",
      duration: "2:18",
      thumbnail: "https://yt3.googleusercontent.com/0DBds5EDBJMYe6WLbq3qOvmSSBqZJJbC-9vPLfHaSyocxcGko5GcV38sBiQkdt39BzCVdGu5hSMV0zIl=w544-h544-l90-rj"
    },
    {
      videoId: "Z8INzXR0J_8",
      title: "Keraunos",
      artist: "PlayaPhonk",
      album: "Keraunos",
      duration: "2:26",
      thumbnail: "https://yt3.googleusercontent.com/io8ZF55p1O25OypVwAo7TJIfom01UsDKljwP6G_cQ0qt3V0gCfzE6p0Ld5VA2QP8pXEx53xWIMC0o6BwHQ=w544-h544-l90-rj"
    }
  ],
  lofi: [
    {
      videoId: "kAw9xGI8vgk",
      title: "Deep Chill Lofi Study",
      artist: "Lumosound",
      album: "Lofi Study Session",
      duration: "3:40",
      thumbnail: "https://yt3.googleusercontent.com/Bx7K_CPa195NNoHTdC18w3oip9PPnt7TMChxTrWk3ZpDEqaQqqUyK-TWM1lmJrIjAL8ILp5-n9FrTc2Y=w544-h544-l90-rj"
    },
    {
      videoId: "1N8hOpMqvYs",
      title: "Lofi Rain Beats",
      artist: "Zyra Music",
      album: "Rain Relax",
      duration: "3:15",
      thumbnail: "https://yt3.googleusercontent.com/vXfnFWskeAHfnuLRZKmWu-KKisRGP0yGWI2CUl2eaR9kZrocb-qeyOW9TFG5Z0lpN_MDQLq8A_dATGqT=w544-h544-l90-rj"
    },
    {
      videoId: "CLeZyIID9Bo",
      title: "Chill Lofi Mix",
      artist: "Settle Beats",
      album: "Lo-Fi Hip Hop",
      duration: "3:20",
      thumbnail: "https://i.ytimg.com/vi/CLeZyIID9Bo/hq720.jpg"
    },
    {
      videoId: "7lZMSNFPsPY",
      title: "Chill Study Beats",
      artist: "EvergreeN LoFi",
      album: "Night Lo-Fi",
      duration: "2:55",
      thumbnail: "https://i.ytimg.com/vi/7lZMSNFPsPY/hq720.jpg"
    }
  ],
  synth: [
    {
      videoId: "MV_3Dpw-BRY",
      title: "Nightcall",
      artist: "Kavinsky",
      album: "OutRun",
      duration: "4:19",
      thumbnail: "https://i.ytimg.com/vi/MV_3Dpw-BRY/hq720.jpg"
    },
    {
      videoId: "8GW6sLrK40k",
      title: "Resonance",
      artist: "HOME",
      album: "Odyssey",
      duration: "3:32",
      thumbnail: "https://i.ytimg.com/vi/8GW6sLrK40k/hq720.jpg"
    },
    {
      videoId: "1wBNgz8ciZQ",
      title: "Synthwave Cyberpunk",
      artist: "MrSuicideSheep",
      album: "Volume Three",
      duration: "3:50",
      thumbnail: "https://i.ytimg.com/vi/1wBNgz8ciZQ/hq720.jpg"
    },
    {
      videoId: "qHJ7WkkV0AY",
      title: "Cyberpunk Cadence",
      artist: "Virzy Guns",
      album: "Cyberpunk Synth",
      duration: "3:10",
      thumbnail: "https://yt3.googleusercontent.com/FYPd5KQFDvHzf73YQDvIQa5Bx9-bAYSR9kFuTPk-o0OgYYne8Yy3qNfWhIj7gYMhZ6QJ0O8JJpO5v1A=w544-h544-l90-rj"
    }
  ],
  gaming: [
    {
      videoId: "QHRuTYtSbJQ",
      title: "BFG 9000",
      artist: "Mick Gordon",
      album: "DOOM OST",
      duration: "5:02",
      thumbnail: "https://i.ytimg.com/vi/QHRuTYtSbJQ/hq720.jpg"
    },
    {
      videoId: "2kqzTUrC5B4",
      title: "Aggressive Fight Epic Hip Hop",
      artist: "RTTWLR",
      album: "Fight Motivation",
      duration: "3:30",
      thumbnail: "https://yt3.googleusercontent.com/kIHXQCTM5QauC58mf8JOolps0v6VuQNvTkSdn0Cmi19BlT5wZcifzPw5cc-MuMyMekjEUclP6onnqdf8=w544-h544-l90-rj"
    },
    {
      videoId: "nOmx4ePpuRM",
      title: "Epic Gaming Music",
      artist: "Brainwave Music",
      album: "Intense Focus",
      duration: "4:15",
      thumbnail: "https://i.ytimg.com/vi/nOmx4ePpuRM/hq720.jpg"
    },
    {
      videoId: "PP2Uvesx4ls",
      title: "Cool Gaming EDM",
      artist: "Freeme Music",
      album: "Best of EDM",
      duration: "3:45",
      thumbnail: "https://i.ytimg.com/vi/PP2Uvesx4ls/hq720.jpg"
    }
  ],
  rock: [
    {
      videoId: "eVTXPUF4Oz4",
      title: "In the End",
      artist: "Linkin Park",
      album: "Hybrid Theory",
      duration: "3:36",
      thumbnail: "https://i.ytimg.com/vi/eVTXPUF4Oz4/hq720.jpg"
    },
    {
      videoId: "QJJYpsA5tv8",
      title: "Can You Feel My Heart",
      artist: "Bring Me The Horizon",
      album: "Sempiternal",
      duration: "3:47",
      thumbnail: "https://i.ytimg.com/vi/QJJYpsA5tv8/hq720.jpg"
    },
    {
      videoId: "hTWKbfoikeg",
      title: "Smells Like Teen Spirit",
      artist: "Nirvana",
      album: "Nevermind",
      duration: "5:01",
      thumbnail: "https://i.ytimg.com/vi/hTWKbfoikeg/hq720.jpg"
    },
    {
      videoId: "bpOSxM0rNPM",
      title: "Do I Wanna Know?",
      artist: "Arctic Monkeys",
      album: "AM",
      duration: "4:32",
      thumbnail: "https://i.ytimg.com/vi/bpOSxM0rNPM/hq720.jpg"
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

function isSpamMix(title) {
  const t = (title || '').toLowerCase();
  return t.includes('1 hour') || t.includes('2 hour') || t.includes('3 hour') ||
         t.includes('10 hour') || t.includes('non stop') || t.includes('non-stop') ||
         t.includes('compilation') || t.includes('playlist mix') || t.includes('full album mix');
}

class EtsukoAPI {
  constructor() {
    this.streamCache = new Map();
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
      thumbnail: formatHighResThumbnail(t.videoId, t.thumbnail),
      isLiked: this.isLiked(t.videoId)
    }));
  }

  // --- Pure YouTube Music Search Engine ---
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
      console.warn('[Search] InnerTube notice:', err.message);
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

  // --- Pure Audio Stream Resolver (VisionOS Neural Audio Extractor) ---
  async resolveAudioStream(videoId) {
    if (!videoId) return null;

    // 1. Check local offline storage first (Zero internet required)
    if (typeof window !== 'undefined' && window.downloader) {
      try {
        const offline = await window.downloader.getOfflineTrack(videoId);
        if (offline && offline.streamUrl) {
          console.log('[API] Playing from offline storage:', videoId);
          return offline.streamUrl;
        }
      } catch (err) {}
    }

    // 2. Check in-memory stream cache
    const cached = this.streamCache.get(videoId);
    if (cached && Date.now() < cached.expires) {
      return cached.url;
    }

    // 3. VisionOS High-Definition Audio Stream Extractor
    const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 15_7_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15';
    const visitorId = 'CgtZeFE2NTBEbTlFZyjq6OXVBjIKCgJJThIEGgAgTWLfAgrcAjIyLllUPXRGSnlfVm0ySUhaWDQyS3NuVkFkWDVnc1IxQWZfdGFISEZvNExRLWZsam05OVllWnhYMEE0Rk5tYnY1TlBFQ3pMa3ZVcFlQUkdxUWRtRi1JVHZZaG94SE9mOXJHRWVVM29rWngteVdUaEppY3NaLWNMZUMyUy1FeUxJcnpNU19XaHFuQTI3WVlRdGdPZ0lKblgzWmNtcFp3MjUwZ1JlUHV1UnZ4TWVWSExVT3ZrREI3RkFLd1FnaWZjbGZ1M2JZaHZoTFR0UHF5Q0swUm9jV3E2aG1HMms4S1ROOUVvN1lkeHpJRWFrQmcxdklzWEQ5VVo0Q184WGVGVHhhdVlsVFA5LUZsczdveHl4eXJoNko1T1gtckJ0ZTQzN3BYTUc2dEthWHRaOFpBSEhTQjF6VXh1S3JqaWQ5d2JqcE4xUzRzUGV1WVhTamlHRGdNUGxUYUxhbFozdw%3D%3D';

    const payload = {
      context: {
        client: {
          clientName: 'VISIONOS',
          clientVersion: '1.02',
          deviceMake: 'Apple',
          deviceModel: 'RealityDevice17,1',
          userAgent: ua,
          osName: 'visionOS',
          osVersion: '26.5.23O471',
          hl: 'en',
          timeZone: 'UTC',
          utcOffsetMinutes: 0
        }
      },
      videoId: videoId,
      playbackContext: {
        contentPlaybackContext: {
          html5Preference: 'HTML5_PREF_WANTS',
          signatureTimestamp: 20717
        }
      },
      contentCheckOk: true,
      racyCheckOk: true
    };

    try {
      const res = await fetch('https://www.youtube.com/youtubei/v1/player', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': ua,
          'Origin': 'https://www.youtube.com',
          'X-YouTube-Client-Name': '101',
          'X-YouTube-Client-Version': '1.02',
          'X-Goog-Visitor-Id': visitorId
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        const formats = data.streamingData?.adaptiveFormats || [];
        const audios = formats.filter(f => f.mimeType && f.mimeType.startsWith('audio/'));
        // Sort descending by bitrate to select the highest fidelity audio stream
        audios.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
        const best = audios.find(a => a.url);
        if (best && best.url) {
          this.streamCache.set(videoId, { url: best.url, expires: Date.now() + 10800000 });
          return best.url;
        }
        if (data.streamingData?.hlsManifestUrl) {
          this.streamCache.set(videoId, { url: data.streamingData.hlsManifestUrl, expires: Date.now() + 10800000 });
          return data.streamingData.hlsManifestUrl;
        }
      }
    } catch (err) {
      console.warn('[API] Audio resolution error:', err);
    }

    return null;
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
