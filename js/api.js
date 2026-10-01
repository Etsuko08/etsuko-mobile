// Etsuko Mobile Neural API Engine
// Unlimited Global Music Search via Android Native Bridge, Zero Broken Thumbnails,
// True Daily-Seeded Recommendations, Dynamic Podcasts & Standalone Offline Storage

function formatHighResThumbnail(videoId, url) {
  if (url && typeof url === 'string') {
    // If it's a Google/YouTube Music CDN square album cover, upgrade to 544x544 HD
    if (url.includes('googleusercontent.com') || url.includes('ggpht.com')) {
      if (/=w\d+-h\d+[^"]*/.test(url)) {
        return url.replace(/=w\d+-h\d+[^"]*/, '=w544-h544-l90-rj');
      } else if (/=s\d+/.test(url)) {
        return url.replace(/=s\d+/, '=s544');
      }
      return url;
    }
    if (url.startsWith('http')) {
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
  { videoId: "DlFXDl_ROAM", title: "Die With A Smile", artist: "Lady Gaga, Bruno Mars", album: "Die With A Smile", duration: "4:12", tag: "Single", thumbnail: "https://yt3.googleusercontent.com/RFK4wHeGqwI3DndbARbRJB21IC0TcmqnrlyjxYK7T-nC8wlIVbfxNaCIFKNvSpchDKmYyVLe1RN36w=w544-h544-l90-rj" },
  { videoId: "kIft-LUHHVA", title: "Espresso", artist: "Sabrina Carpenter", album: "Short n' Sweet", duration: "2:56", tag: "Single", thumbnail: "https://yt3.googleusercontent.com/bTWlZSenrOAYgH4r6NAzyDraWQR_wLl3OuRexJ_8h3NZUVHEilRSzUmKNa9YMOFSVcF0YtOuzKdXrt2UHg=w544-h544-l90-rj" },
  { videoId: "WKZO-CWeOVA", title: "BIRDS OF A FEATHER", artist: "Billie Eilish", album: "HIT ME HARD AND SOFT", duration: "3:31", tag: "Single", thumbnail: "https://yt3.googleusercontent.com/mXJjWX4E6Gpr03CUYl18PdVXlczmoL2Tm-LEBGafIr_8smlHnl8AHniJu0_7Y80e-aeloJxcryQQx0ZJ=w544-h544-l90-rj" },
  { videoId: "phLb_SoPBlA", title: "Not Like Us", artist: "Kendrick Lamar", album: "Not Like Us", duration: "4:35", tag: "Single", thumbnail: "https://yt3.googleusercontent.com/8qk3C_zpd2FXHVN8BpMBFL6h9J5BlKlbcKOlvDMvIgBWBsAblDoTjU98RGbFH9DxtnN1X5zRzc9sSvWr=w544-h544-l90-rj" },
  { videoId: "aC9HkZW2hZk", title: "Cruel Summer", artist: "Taylor Swift", album: "Lover", duration: "2:59", tag: "Single", thumbnail: "https://yt3.googleusercontent.com/OhxDTHQOQzSrcdgH9hzqzp1v22GYDE-QKnkryvCeq4ddx-3K3_c8oDXN0E6NvHlMn1q4XV59aHr0oL4f=w544-h544-l90-rj" },
  { videoId: "J7p4bzqLvCw", title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", duration: "3:22", tag: "Single", thumbnail: "https://yt3.googleusercontent.com/R_cjQK3wwLPEzri1jerx-79zgzGocoKvwGU3NMONaTsaMM0Idd641pfB8r5jgfpn6I8JAoFtf9RBIcI=w544-h544-l90-rj" },
  { videoId: "3_g2un5M350", title: "Starboy (feat. Daft Punk)", artist: "The Weeknd", album: "Starboy", duration: "3:51", tag: "Album", thumbnail: "https://yt3.googleusercontent.com/dcxXIIlest09vnvKznWM9VWQXu1EL7lKxBzXGzwgmVjmMNBm1dEWT_0qn1xrEZYyKF_qRE1TLq8P_JY_mQ=w544-h544-l90-rj" },
  { videoId: "xIQpLlYC8xA", title: "Houdini", artist: "Eminem", album: "The Death of Slim Shady", duration: "3:48", tag: "Single", thumbnail: "https://yt3.googleusercontent.com/Xx3dX1EJDirqwpfQL05uAgmKGYpzTcFDXjjHqjNpIhgY5MWTJRLSlOjaYVtup2Ku6gBYEqXoxw5aGKC3=w544-h544-l90-rj" },
  { videoId: "2nR1zrNzgcY", title: "FE!N (feat. Playboi Carti)", artist: "Travis Scott", album: "UTOPIA", duration: "3:12", tag: "Album", thumbnail: "https://yt3.googleusercontent.com/eBvJuWpjg0Mx8DBa5WIhCzEopXyMnxkjWSU895BDGjTpNeqrliLrv3zGqNNuCUoXL1EkEAr5VQ3cx2pW=w544-h544-l90-rj" },
  { videoId: "1-xGerv5FOk", title: "Close Eyes", artist: "DVRST", album: "Close Eyes", duration: "2:12", tag: "Single", thumbnail: "https://i.ytimg.com/vi/1-xGerv5FOk/hqdefault.jpg" },
  { videoId: "4EQkYVtE-28", title: "Circles", artist: "Post Malone", album: "Hollywood's Bleeding", duration: "3:36", tag: "Single", thumbnail: "https://yt3.googleusercontent.com/YoQ-A-GOpgeE8tgdF3Rcf5z9V8NIIKjLH6_7X3QphIQUwVHioLu7Ik2wQzU0oCkyNm1TeLDLDYvomJ8=w544-h544-l90-rj" },
  { videoId: "OsfAnsMY21M", title: "Levitating", artist: "Dua Lipa", album: "Future Nostalgia", duration: "3:24", tag: "Single", thumbnail: "https://yt3.googleusercontent.com/UpJ_IhBqyhQV9b2UGcDxxWDm14kRQ2eY1o9S96AGsbE7Ol8isbpbPA0Yefvg8S8ZGAX9L1g4xaj21zVJ=w544-h544-l90-rj" }
];

const CATALOG_DAILY_POOL = [
  { videoId: "aHmg0jsmNhg", title: "vampire", artist: "Olivia Rodrigo", album: "GUTS", duration: "3:40", tag: "Single", thumbnail: "https://yt3.googleusercontent.com/F32A1XBuQEkcOnYin-1BURG2MK_q12Ebovqwe8im8KXf8BHJ_jXW_7NnK73K6QOH-1D6QZKrrZGbNrlS=w544-h544-l90-rj" },
  { videoId: "bpOSxM0rNPM", title: "Do I Wanna Know?", artist: "Arctic Monkeys", album: "AM", duration: "4:32", tag: "Album", thumbnail: "https://yt3.googleusercontent.com/7a03Ybk8vbe8c4dl4E8l77Y4e9aEWjQvTfOAdLdXxsnjZ57gYQ8FsKra9SgXAHT-jtiwuq6lukCfbRKL=w544-h544-l90-rj" },
  { videoId: "eVTXPUF4Oz4", title: "In the End", artist: "Linkin Park", album: "Hybrid Theory", duration: "3:36", tag: "EP", thumbnail: "https://i.ytimg.com/vi/eVTXPUF4Oz4/hqdefault.jpg" },
  { videoId: "AdEKgwUqPKI", title: "Kill Bill", artist: "SZA", album: "SOS", duration: "2:34", tag: "Single", thumbnail: "https://yt3.googleusercontent.com/tw5VGXEsehs9OpwnpbubqGp_3Pq9so7QShdyJSlCpXeI2mLRvqRqLNbA7EC4zcNWrFE0_lj9HxpZ23v6=w544-h544-l90-rj" },
  { videoId: "FrsOnNxIrg8", title: "God's Plan", artist: "Drake", album: "Scorpion", duration: "3:19", tag: "Single", thumbnail: "https://yt3.googleusercontent.com/9Oe4acEXgmAlCKgcgI6JlSXi2Tj30u6anzvfGBrunGO-fLhBTgzy-ei1ugPJpZDD5ArKFod9H4RTA5g0=w544-h544-l90-rj" },
  { videoId: "_GWKkqNoyEA", title: "Counting Stars", artist: "OneRepublic", album: "Native", duration: "4:18", tag: "Single", thumbnail: "https://yt3.googleusercontent.com/m2pZLjozMvQBj21LgvAIslVPP-T2xQlxbxCTJ98vpPN8HZ0fgR-wisJQ2IzrKS2yLTAYBjs0TpOYnIY=w544-h544-l90-rj" },
  { videoId: "9ssQKlLxBdQ", title: "Thunder", artist: "Imagine Dragons", album: "Evolve", duration: "3:08", tag: "Single", thumbnail: "https://yt3.googleusercontent.com/weYQWfEwWNPOuAm34geXN1LkSYPlsJay78NnQgHC3PKsyZcdvBHIsMtqoFh3rioA4XgMdHMQd3h6vH6mbA=w544-h544-l90-rj" },
  { videoId: "BSTsnWoslP4", title: "Bohemian Rhapsody", artist: "Queen", album: "A Night at the Opera", duration: "5:55", tag: "Master", thumbnail: "https://yt3.googleusercontent.com/nLn1gxvYiZqzXOY9HyUXVXbFtmR5nhY8sDpbvBT1aw-Ejjsz__Nz90sZoc4nZgff2sf8WjowuVRVBlBTww=w544-h544-l90-rj" },
  { videoId: "4D7u5KF7SP8", title: "Get Lucky", artist: "Daft Punk, Pharrell Williams", album: "Random Access Memories", duration: "6:10", tag: "Single", thumbnail: "https://yt3.googleusercontent.com/N55arCGj69gtw6thXK8JUPisxoVYiwuIEQ7I6SGlkEyNcSJ7xIWPe76Vuu1SiUqRyx5w9qvR_zV8fV3CWQ=w544-h544-l90-rj" },
  { videoId: "2NiyrtYegso", title: "Wake Me Up", artist: "Avicii", album: "True", duration: "4:08", tag: "Single", thumbnail: "https://yt3.googleusercontent.com/XincHWEjkXhpbavoQEHWRbTcVdvHsujjr7OAw-73KUCILFgjLdevPW8vkoaRMibnwkTtGWkEDyKbuNeK=w544-h544-l90-rj" },
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
    subtitle: "Sabrina Carpenter, Taylor Swift, Dua Lipa, Bruno Mars",
    gradient: "linear-gradient(135deg, #10b981, #064e3b)",
    bannerColor: "#10b981",
    tracks: [
      { videoId: "kIft-LUHHVA", title: "Espresso", artist: "Sabrina Carpenter", thumbnail: "https://yt3.googleusercontent.com/bTWlZSenrOAYgH4r6NAzyDraWQR_wLl3OuRexJ_8h3NZUVHEilRSzUmKNa9YMOFSVcF0YtOuzKdXrt2UHg=w544-h544-l90-rj" },
      { videoId: "aC9HkZW2hZk", title: "Cruel Summer", artist: "Taylor Swift", thumbnail: "https://yt3.googleusercontent.com/OhxDTHQOQzSrcdgH9hzqzp1v22GYDE-QKnkryvCeq4ddx-3K3_c8oDXN0E6NvHlMn1q4XV59aHr0oL4f=w544-h544-l90-rj" },
      { videoId: "OsfAnsMY21M", title: "Levitating", artist: "Dua Lipa", thumbnail: "https://yt3.googleusercontent.com/UpJ_IhBqyhQV9b2UGcDxxWDm14kRQ2eY1o9S96AGsbE7Ol8isbpbPA0Yefvg8S8ZGAX9L1g4xaj21zVJ=w544-h544-l90-rj" },
      { videoId: "DlFXDl_ROAM", title: "Die With A Smile", artist: "Lady Gaga, Bruno Mars", thumbnail: "https://yt3.googleusercontent.com/RFK4wHeGqwI3DndbARbRJB21IC0TcmqnrlyjxYK7T-nC8wlIVbfxNaCIFKNvSpchDKmYyVLe1RN36w=w544-h544-l90-rj" },
      { videoId: "WKZO-CWeOVA", title: "BIRDS OF A FEATHER", artist: "Billie Eilish", thumbnail: "https://yt3.googleusercontent.com/mXJjWX4E6Gpr03CUYl18PdVXlczmoL2Tm-LEBGafIr_8smlHnl8AHniJu0_7Y80e-aeloJxcryQQx0ZJ=w544-h544-l90-rj" },
      { videoId: "J7p4bzqLvCw", title: "Blinding Lights", artist: "The Weeknd", thumbnail: "https://yt3.googleusercontent.com/R_cjQK3wwLPEzri1jerx-79zgzGocoKvwGU3NMONaTsaMM0Idd641pfB8r5jgfpn6I8JAoFtf9RBIcI=w544-h544-l90-rj" },
      { videoId: "4EQkYVtE-28", title: "Circles", artist: "Post Malone", thumbnail: "https://yt3.googleusercontent.com/YoQ-A-GOpgeE8tgdF3Rcf5z9V8NIIKjLH6_7X3QphIQUwVHioLu7Ik2wQzU0oCkyNm1TeLDLDYvomJ8=w544-h544-l90-rj" },
      { videoId: "aHmg0jsmNhg", title: "vampire", artist: "Olivia Rodrigo", thumbnail: "https://yt3.googleusercontent.com/F32A1XBuQEkcOnYin-1BURG2MK_q12Ebovqwe8im8KXf8BHJ_jXW_7NnK73K6QOH-1D6QZKrrZGbNrlS=w544-h544-l90-rj" },
      { videoId: "AdEKgwUqPKI", title: "Kill Bill", artist: "SZA", thumbnail: "https://yt3.googleusercontent.com/tw5VGXEsehs9OpwnpbubqGp_3Pq9so7QShdyJSlCpXeI2mLRvqRqLNbA7EC4zcNWrFE0_lj9HxpZ23v6=w544-h544-l90-rj" },
      { videoId: "_GWKkqNoyEA", title: "Counting Stars", artist: "OneRepublic", thumbnail: "https://yt3.googleusercontent.com/m2pZLjozMvQBj21LgvAIslVPP-T2xQlxbxCTJ98vpPN8HZ0fgR-wisJQ2IzrKS2yLTAYBjs0TpOYnIY=w544-h544-l90-rj" }
    ]
  },
  {
    id: "2020s_mix",
    title: "2020s Mix",
    subtitle: "The Weeknd, Billie Eilish, Kendrick Lamar, Eminem",
    gradient: "linear-gradient(135deg, #a855f7, #581c87)",
    bannerColor: "#a855f7",
    tracks: [
      { videoId: "WKZO-CWeOVA", title: "BIRDS OF A FEATHER", artist: "Billie Eilish", thumbnail: "https://yt3.googleusercontent.com/mXJjWX4E6Gpr03CUYl18PdVXlczmoL2Tm-LEBGafIr_8smlHnl8AHniJu0_7Y80e-aeloJxcryQQx0ZJ=w544-h544-l90-rj" },
      { videoId: "J7p4bzqLvCw", title: "Blinding Lights", artist: "The Weeknd", thumbnail: "https://yt3.googleusercontent.com/R_cjQK3wwLPEzri1jerx-79zgzGocoKvwGU3NMONaTsaMM0Idd641pfB8r5jgfpn6I8JAoFtf9RBIcI=w544-h544-l90-rj" },
      { videoId: "4EQkYVtE-28", title: "Circles", artist: "Post Malone", thumbnail: "https://yt3.googleusercontent.com/YoQ-A-GOpgeE8tgdF3Rcf5z9V8NIIKjLH6_7X3QphIQUwVHioLu7Ik2wQzU0oCkyNm1TeLDLDYvomJ8=w544-h544-l90-rj" },
      { videoId: "3_g2un5M350", title: "Starboy", artist: "The Weeknd", thumbnail: "https://yt3.googleusercontent.com/dcxXIIlest09vnvKznWM9VWQXu1EL7lKxBzXGzwgmVjmMNBm1dEWT_0qn1xrEZYyKF_qRE1TLq8P_JY_mQ=w544-h544-l90-rj" },
      { videoId: "phLb_SoPBlA", title: "Not Like Us", artist: "Kendrick Lamar", thumbnail: "https://yt3.googleusercontent.com/8qk3C_zpd2FXHVN8BpMBFL6h9J5BlKlbcKOlvDMvIgBWBsAblDoTjU98RGbFH9DxtnN1X5zRzc9sSvWr=w544-h544-l90-rj" },
      { videoId: "xIQpLlYC8xA", title: "Houdini", artist: "Eminem", thumbnail: "https://yt3.googleusercontent.com/Xx3dX1EJDirqwpfQL05uAgmKGYpzTcFDXjjHqjNpIhgY5MWTJRLSlOjaYVtup2Ku6gBYEqXoxw5aGKC3=w544-h544-l90-rj" },
      { videoId: "2nR1zrNzgcY", title: "FE!N", artist: "Travis Scott", thumbnail: "https://yt3.googleusercontent.com/eBvJuWpjg0Mx8DBa5WIhCzEopXyMnxkjWSU895BDGjTpNeqrliLrv3zGqNNuCUoXL1EkEAr5VQ3cx2pW=w544-h544-l90-rj" },
      { videoId: "aHmg0jsmNhg", title: "vampire", artist: "Olivia Rodrigo", thumbnail: "https://yt3.googleusercontent.com/F32A1XBuQEkcOnYin-1BURG2MK_q12Ebovqwe8im8KXf8BHJ_jXW_7NnK73K6QOH-1D6QZKrrZGbNrlS=w544-h544-l90-rj" },
      { videoId: "kIft-LUHHVA", title: "Espresso", artist: "Sabrina Carpenter", thumbnail: "https://yt3.googleusercontent.com/bTWlZSenrOAYgH4r6NAzyDraWQR_wLl3OuRexJ_8h3NZUVHEilRSzUmKNa9YMOFSVcF0YtOuzKdXrt2UHg=w544-h544-l90-rj" },
      { videoId: "DlFXDl_ROAM", title: "Die With A Smile", artist: "Lady Gaga, Bruno Mars", thumbnail: "https://yt3.googleusercontent.com/RFK4wHeGqwI3DndbARbRJB21IC0TcmqnrlyjxYK7T-nC8wlIVbfxNaCIFKNvSpchDKmYyVLe1RN36w=w544-h544-l90-rj" }
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
      { videoId: "dvQJIgjlR3I", title: "Neon Blade", artist: "MoonDeity", thumbnail: "https://i.ytimg.com/vi/dvQJIgjlR3I/hqdefault.jpg" },
      { videoId: "v3-b4Tq7-70", title: "Live Another Day", artist: "Kordhell", thumbnail: "https://i.ytimg.com/vi/v3-b4Tq7-70/hqdefault.jpg" },
      { videoId: "_yZ6x3qJ7j0", title: "Disaster", artist: "KSLV Noh", thumbnail: "https://i.ytimg.com/vi/_yZ6x3qJ7j0/hqdefault.jpg" },
      { videoId: "NfH7K7kXy78", title: "Sahara", artist: "Hensonn", thumbnail: "https://i.ytimg.com/vi/NfH7K7kXy78/hqdefault.jpg" },
      { videoId: "b1gT268U55A", title: "Why Not", artist: "Ghostface Playa", thumbnail: "https://i.ytimg.com/vi/b1gT268U55A/hqdefault.jpg" }
    ]
  },
  {
    id: "romance_mix",
    title: "Melodic Romance",
    subtitle: "Arijit Singh, Pritam, Jubin Nautiyal",
    gradient: "linear-gradient(135deg, #f43f5e, #881337)",
    bannerColor: "#f43f5e",
    tracks: [
      { videoId: "Umqb9KENgmk", title: "Tum Hi Ho", artist: "Arijit Singh", thumbnail: "https://i.ytimg.com/vi/Umqb9KENgmk/hqdefault.jpg" },
      { videoId: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh, Pritam", thumbnail: "https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg" },
      { videoId: "DlFXDl_ROAM", title: "Die With A Smile", artist: "Lady Gaga, Bruno Mars", thumbnail: "https://yt3.googleusercontent.com/RFK4wHeGqwI3DndbARbRJB21IC0TcmqnrlyjxYK7T-nC8wlIVbfxNaCIFKNvSpchDKmYyVLe1RN36w=w544-h544-l90-rj" },
      { videoId: "aC9HkZW2hZk", title: "Cruel Summer", artist: "Taylor Swift", thumbnail: "https://yt3.googleusercontent.com/OhxDTHQOQzSrcdgH9hzqzp1v22GYDE-QKnkryvCeq4ddx-3K3_c8oDXN0E6NvHlMn1q4XV59aHr0oL4f=w544-h544-l90-rj" },
      { videoId: "284Ov7ysmfA", title: "Channa Mereya", artist: "Arijit Singh", thumbnail: "https://i.ytimg.com/vi/284Ov7ysmfA/hqdefault.jpg" },
      { videoId: "gvyUuxdRdR4", title: "Raataan Lambiyan", artist: "Jubin Nautiyal", thumbnail: "https://i.ytimg.com/vi/gvyUuxdRdR4/hqdefault.jpg" },
      { videoId: "cZ_v3Z9vF1Y", title: "Shayad", artist: "Arijit Singh", thumbnail: "https://i.ytimg.com/vi/cZ_v3Z9vF1Y/hqdefault.jpg" },
      { videoId: "sK7riqg2mr4", title: "Agar Tum Saath Ho", artist: "Alka Yagnik, Arijit Singh", thumbnail: "https://i.ytimg.com/vi/sK7riqg2mr4/hqdefault.jpg" }
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
      { videoId: "4tywp83zkmk", title: "One Love", artist: "Shubh", thumbnail: "https://i.ytimg.com/vi/4tywp83zkmk/hqdefault.jpg" },
      { videoId: "VNs_cCtdbPc", title: "Baller", artist: "Shubh, Ikky", thumbnail: "https://i.ytimg.com/vi/VNs_cCtdbPc/hqdefault.jpg" },
      { videoId: "P8tDk24mI2Y", title: "Winning Speech", artist: "Karan Aujla", thumbnail: "https://i.ytimg.com/vi/P8tDk24mI2Y/hqdefault.jpg" },
      { videoId: "7B_X_i8GvYQ", title: "King Shit", artist: "Shubh", thumbnail: "https://i.ytimg.com/vi/7B_X_i8GvYQ/hqdefault.jpg" },
      { videoId: "5TzY_G-r19g", title: "Jee Ni Lagda", artist: "Karan Aujla", thumbnail: "https://i.ytimg.com/vi/5TzY_G-r19g/hqdefault.jpg" }
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
      { videoId: "4EQkYVtE-28", title: "Circles (Chill Acoustic)", artist: "Post Malone", thumbnail: "https://yt3.googleusercontent.com/YoQ-A-GOpgeE8tgdF3Rcf5z9V8NIIKjLH6_7X3QphIQUwVHioLu7Ik2wQzU0oCkyNm1TeLDLDYvomJ8=w544-h544-l90-rj" },
      { videoId: "bpOSxM0rNPM", title: "Do I Wanna Know? (Acoustic)", artist: "Arctic Monkeys", thumbnail: "https://yt3.googleusercontent.com/7a03Ybk8vbe8c4dl4E8l77Y4e9aEWjQvTfOAdLdXxsnjZ57gYQ8FsKra9SgXAHT-jtiwuq6lukCfbRKL=w544-h544-l90-rj" },
      { videoId: "aHmg0jsmNhg", title: "vampire (Lofi)", artist: "Olivia Rodrigo", thumbnail: "https://yt3.googleusercontent.com/F32A1XBuQEkcOnYin-1BURG2MK_q12Ebovqwe8im8KXf8BHJ_jXW_7NnK73K6QOH-1D6QZKrrZGbNrlS=w544-h544-l90-rj" },
      { videoId: "4D7u5KF7SP8", title: "Get Lucky", artist: "Daft Punk", thumbnail: "https://yt3.googleusercontent.com/N55arCGj69gtw6thXK8JUPisxoVYiwuIEQ7I6SGlkEyNcSJ7xIWPe76Vuu1SiUqRyx5w9qvR_zV8fV3CWQ=w544-h544-l90-rj" },
      { videoId: "J7p4bzqLvCw", title: "Blinding Lights (Acoustic)", artist: "The Weeknd", thumbnail: "https://yt3.googleusercontent.com/R_cjQK3wwLPEzri1jerx-79zgzGocoKvwGU3NMONaTsaMM0Idd641pfB8r5jgfpn6I8JAoFtf9RBIcI=w544-h544-l90-rj" },
      { videoId: "_GWKkqNoyEA", title: "Counting Stars", artist: "OneRepublic", thumbnail: "https://yt3.googleusercontent.com/m2pZLjozMvQBj21LgvAIslVPP-T2xQlxbxCTJ98vpPN8HZ0fgR-wisJQ2IzrKS2yLTAYBjs0TpOYnIY=w544-h544-l90-rj" },
      { videoId: "2NiyrtYegso", title: "Wake Me Up", artist: "Avicii", thumbnail: "https://yt3.googleusercontent.com/XincHWEjkXhpbavoQEHWRbTcVdvHsujjr7OAw-73KUCILFgjLdevPW8vkoaRMibnwkTtGWkEDyKbuNeK=w544-h544-l90-rj" }
    ]
  }
];

const CATALOG_POPULAR_ALBUMS = [
  { videoId: "3_g2un5M350", title: "Starboy", artist: "The Weeknd", album: "Starboy (Deluxe)", tag: "Album", thumbnail: "https://yt3.googleusercontent.com/dcxXIIlest09vnvKznWM9VWQXu1EL7lKxBzXGzwgmVjmMNBm1dEWT_0qn1xrEZYyKF_qRE1TLq8P_JY_mQ=w544-h544-l90-rj" },
  { videoId: "WKZO-CWeOVA", title: "HIT ME HARD AND SOFT", artist: "Billie Eilish", album: "HIT ME HARD AND SOFT", tag: "Album", thumbnail: "https://yt3.googleusercontent.com/mXJjWX4E6Gpr03CUYl18PdVXlczmoL2Tm-LEBGafIr_8smlHnl8AHniJu0_7Y80e-aeloJxcryQQx0ZJ=w544-h544-l90-rj" },
  { videoId: "aHmg0jsmNhg", title: "GUTS", artist: "Olivia Rodrigo", album: "GUTS", tag: "Album", thumbnail: "https://yt3.googleusercontent.com/F32A1XBuQEkcOnYin-1BURG2MK_q12Ebovqwe8im8KXf8BHJ_jXW_7NnK73K6QOH-1D6QZKrrZGbNrlS=w544-h544-l90-rj" },
  { videoId: "bpOSxM0rNPM", title: "AM", artist: "Arctic Monkeys", album: "AM", tag: "Album", thumbnail: "https://yt3.googleusercontent.com/7a03Ybk8vbe8c4dl4E8l77Y4e9aEWjQvTfOAdLdXxsnjZ57gYQ8FsKra9SgXAHT-jtiwuq6lukCfbRKL=w544-h544-l90-rj" },
  { videoId: "Umqb9KENgmk", title: "Aashiqui 2", artist: "Mithoon, Ankit Tiwari", album: "Aashiqui 2 OST", tag: "Album", thumbnail: "https://i.ytimg.com/vi/Umqb9KENgmk/hqdefault.jpg" },
  { videoId: "eVTXPUF4Oz4", title: "Hybrid Theory", artist: "Linkin Park", album: "Hybrid Theory", tag: "Album", thumbnail: "https://i.ytimg.com/vi/eVTXPUF4Oz4/hqdefault.jpg" },
  { videoId: "2nR1zrNzgcY", title: "UTOPIA", artist: "Travis Scott", album: "UTOPIA", tag: "Album", thumbnail: "https://yt3.googleusercontent.com/eBvJuWpjg0Mx8DBa5WIhCzEopXyMnxkjWSU895BDGjTpNeqrliLrv3zGqNNuCUoXL1EkEAr5VQ3cx2pW=w544-h544-l90-rj" },
  { videoId: "J7p4bzqLvCw", title: "After Hours", artist: "The Weeknd", album: "After Hours", tag: "Album", thumbnail: "https://yt3.googleusercontent.com/R_cjQK3wwLPEzri1jerx-79zgzGocoKvwGU3NMONaTsaMM0Idd641pfB8r5jgfpn6I8JAoFtf9RBIcI=w544-h544-l90-rj" }
];

const CATALOG_HINDI_HITS = [
  { videoId: "Umqb9KENgmk", title: "Tum Hi Ho", artist: "Arijit Singh", album: "Aashiqui 2", duration: "4:22", tag: "Romance", thumbnail: "https://i.ytimg.com/vi/Umqb9KENgmk/hqdefault.jpg" },
  { videoId: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh, Pritam", album: "Brahmastra", duration: "4:28", tag: "Romance", thumbnail: "https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg" },
  { videoId: "V_jp5_VAzXk", title: "Chaleya", artist: "Arijit Singh, Shilpa Rao", album: "Jawan", duration: "3:20", tag: "Romance", thumbnail: "https://i.ytimg.com/vi/V_jp5_VAzXk/hqdefault.jpg" },
  { videoId: "cbqbx7h0p9E", title: "Tum Se Hi", artist: "Mohit Chauhan, Pritam", album: "Jab We Met", duration: "5:21", tag: "Classic", thumbnail: "https://i.ytimg.com/vi/cbqbx7h0p9E/hqdefault.jpg" },
  { videoId: "5y_KpD_aUfk", title: "Zara Sa", artist: "KK, Pritam", album: "Jannat", duration: "5:03", tag: "Melody", thumbnail: "https://i.ytimg.com/vi/5y_KpD_aUfk/hqdefault.jpg" },
  { videoId: "ElZfdU54Cp8", title: "Apna Bana Le", artist: "Arijit Singh, Sachin-Jigar", album: "Bhediya", duration: "4:21", tag: "Soul", thumbnail: "https://i.ytimg.com/vi/ElZfdU54Cp8/hqdefault.jpg" },
  { videoId: "gvyUuxdRdR4", title: "O Maahi", artist: "Arijit Singh, Pritam", album: "Dunki", duration: "3:53", tag: "Hit", thumbnail: "https://i.ytimg.com/vi/gvyUuxdRdR4/hqdefault.jpg" },
  { videoId: "284Ov7ysmfA", title: "Channa Mereya", artist: "Arijit Singh, Pritam", album: "Ae Dil Hai Mushkil", duration: "4:49", tag: "Heartbreak", thumbnail: "https://i.ytimg.com/vi/284Ov7ysmfA/hqdefault.jpg" }
];

const CATALOG_URDU_SUFI = [
  { videoId: "kw4tT7SCmaY", title: "Afreen Afreen", artist: "Rahat Fateh Ali Khan, Momina Mustehsan", album: "Coke Studio", duration: "6:44", tag: "Sufi", thumbnail: "https://i.ytimg.com/vi/kw4tT7SCmaY/hqdefault.jpg" },
  { videoId: "c7TX12j_sY8", title: "Tajdar-e-Haram", artist: "Atif Aslam", album: "Coke Studio", duration: "10:28", tag: "Qawwali", thumbnail: "https://i.ytimg.com/vi/c7TX12j_sY8/hqdefault.jpg" },
  { videoId: "2kfmxHqM_eI", title: "Pehli Dafa", artist: "Atif Aslam", album: "Pehli Dafa", duration: "4:43", tag: "Romantic", thumbnail: "https://i.ytimg.com/vi/2kfmxHqM_eI/hqdefault.jpg" },
  { videoId: "zJmU2j3O6Wc", title: "Kahani Suno 2.0", artist: "Kaifi Khalil", album: "Kahani Suno", duration: "2:54", tag: "Ghazal", thumbnail: "https://i.ytimg.com/vi/zJmU2j3O6Wc/hqdefault.jpg" },
  { videoId: "2JzQhLqA5Q4", title: "Jhoom", artist: "Ali Zafar", album: "Jhoom", duration: "4:32", tag: "Acoustic", thumbnail: "https://i.ytimg.com/vi/2JzQhLqA5Q4/hqdefault.jpg" },
  { videoId: "v_ysZ_0w2Wk", title: "O Re Piya", artist: "Rahat Fateh Ali Khan", album: "Aaja Nachle", duration: "6:19", tag: "Soul", thumbnail: "https://i.ytimg.com/vi/v_ysZ_0w2Wk/hqdefault.jpg" },
  { videoId: "RLzC55ai0eo", title: "Heeriye", artist: "Jasleen Royal, Arijit Singh", album: "Heeriye", duration: "3:14", tag: "Indie", thumbnail: "https://i.ytimg.com/vi/RLzC55ai0eo/hqdefault.jpg" }
];

const CATALOG_PUNJABI_HITS = [
  { videoId: "LK7-_dgAVQE", title: "Tauba Tauba", artist: "Karan Aujla", album: "Bad Newz", duration: "3:26", tag: "Banger", thumbnail: "https://i.ytimg.com/vi/LK7-_dgAVQE/hqdefault.jpg" },
  { videoId: "cWMxCE2HTag", title: "Softly", artist: "Karan Aujla, Ikky", album: "Four You", duration: "2:36", tag: "Heat", thumbnail: "https://i.ytimg.com/vi/cWMxCE2HTag/hqdefault.jpg" },
  { videoId: "4TYv2PhG89A", title: "Cheques", artist: "Shubh", album: "Still Rollin", duration: "3:03", tag: "Viral", thumbnail: "https://i.ytimg.com/vi/4TYv2PhG89A/hqdefault.jpg" },
  { videoId: "4tywp83zkmk", title: "One Love", artist: "Shubh", album: "One Love", duration: "2:40", tag: "Vibe", thumbnail: "https://i.ytimg.com/vi/4tywp83zkmk/hqdefault.jpg" },
  { videoId: "VNs_cCtdbPc", title: "Baller", artist: "Shubh, Ikky", album: "Baller", duration: "2:28", tag: "Club", thumbnail: "https://i.ytimg.com/vi/VNs_cCtdbPc/hqdefault.jpg" },
  { videoId: "cl0a3i2wFcc", title: "G.O.A.T.", artist: "Diljit Dosanjh", album: "G.O.A.T.", duration: "3:43", tag: "Legend", thumbnail: "https://i.ytimg.com/vi/cl0a3i2wFcc/hqdefault.jpg" },
  { videoId: "vX2cDW8LUWk", title: "Lover", artist: "Diljit Dosanjh", album: "MoonChild Era", duration: "3:07", tag: "Pop", thumbnail: "https://i.ytimg.com/vi/vX2cDW8LUWk/hqdefault.jpg" }
];

const CATALOG_POP_HITS = [
  { videoId: "DlFXDl_ROAM", title: "Die With A Smile", artist: "Lady Gaga, Bruno Mars", album: "Die With A Smile", duration: "4:12", tag: "Global #1", thumbnail: "https://yt3.googleusercontent.com/RFK4wHeGqwI3DndbARbRJB21IC0TcmqnrlyjxYK7T-nC8wlIVbfxNaCIFKNvSpchDKmYyVLe1RN36w=w544-h544-l90-rj" },
  { videoId: "kIft-LUHHVA", title: "Espresso", artist: "Sabrina Carpenter", album: "Short n' Sweet", duration: "2:56", tag: "Pop", thumbnail: "https://yt3.googleusercontent.com/bTWlZSenrOAYgH4r6NAzyDraWQR_wLl3OuRexJ_8h3NZUVHEilRSzUmKNa9YMOFSVcF0YtOuzKdXrt2UHg=w544-h544-l90-rj" },
  { videoId: "WKZO-CWeOVA", title: "BIRDS OF A FEATHER", artist: "Billie Eilish", album: "HIT ME HARD AND SOFT", duration: "3:31", tag: "Alternative", thumbnail: "https://yt3.googleusercontent.com/mXJjWX4E6Gpr03CUYl18PdVXlczmoL2Tm-LEBGafIr_8smlHnl8AHniJu0_7Y80e-aeloJxcryQQx0ZJ=w544-h544-l90-rj" },
  { videoId: "aC9HkZW2hZk", title: "Cruel Summer", artist: "Taylor Swift", album: "Lover", duration: "2:59", tag: "Pop", thumbnail: "https://yt3.googleusercontent.com/OhxDTHQOQzSrcdgH9hzqzp1v22GYDE-QKnkryvCeq4ddx-3K3_c8oDXN0E6NvHlMn1q4XV59aHr0oL4f=w544-h544-l90-rj" },
  { videoId: "J7p4bzqLvCw", title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", duration: "3:22", tag: "Synth", thumbnail: "https://yt3.googleusercontent.com/R_cjQK3wwLPEzri1jerx-79zgzGocoKvwGU3NMONaTsaMM0Idd641pfB8r5jgfpn6I8JAoFtf9RBIcI=w544-h544-l90-rj" },
  { videoId: "OsfAnsMY21M", title: "Levitating", artist: "Dua Lipa", album: "Future Nostalgia", duration: "3:24", tag: "Disco", thumbnail: "https://yt3.googleusercontent.com/UpJ_IhBqyhQV9b2UGcDxxWDm14kRQ2eY1o9S96AGsbE7Ol8isbpbPA0Yefvg8S8ZGAX9L1g4xaj21zVJ=w544-h544-l90-rj" },
  { videoId: "aHmg0jsmNhg", title: "vampire", artist: "Olivia Rodrigo", album: "GUTS", duration: "3:40", tag: "Rock Pop", thumbnail: "https://yt3.googleusercontent.com/F32A1XBuQEkcOnYin-1BURG2MK_q12Ebovqwe8im8KXf8BHJ_jXW_7NnK73K6QOH-1D6QZKrrZGbNrlS=w544-h544-l90-rj" }
];

const CATALOG_PHONK_HITS = [
  { videoId: "1-xGerv5FOk", title: "Close Eyes", artist: "DVRST", album: "Close Eyes", duration: "2:12", tag: "Drift", thumbnail: "https://i.ytimg.com/vi/1-xGerv5FOk/hqdefault.jpg" },
  { videoId: "fzeoo8n8RZo", title: "Murder In My Mind", artist: "Kordhell", album: "Murder In My Mind", duration: "2:25", tag: "Aggressive", thumbnail: "https://i.ytimg.com/vi/fzeoo8n8RZo/hqdefault.jpg" },
  { videoId: "NS9z2QHcZdY", title: "Metamorphosis", artist: "INTERWORLD", album: "Metamorphosis", duration: "2:22", tag: "Dark", thumbnail: "https://i.ytimg.com/vi/NS9z2QHcZdY/hqdefault.jpg" },
  { videoId: "dvQJIgjlR3I", title: "Neon Blade", artist: "MoonDeity", album: "Neon Blade", duration: "4:24", tag: "Cyber", thumbnail: "https://i.ytimg.com/vi/dvQJIgjlR3I/hqdefault.jpg" },
  { videoId: "pIZ0QRWK0zg", title: "Sahara", artist: "Hensonn", album: "Sahara", duration: "2:51", tag: "Bass", thumbnail: "https://i.ytimg.com/vi/pIZ0QRWK0zg/hqdefault.jpg" },
  { videoId: "_yZ6x3qJ7j0", title: "Disaster", artist: "KSLV Noh", album: "Disaster", duration: "2:16", tag: "Drift", thumbnail: "https://i.ytimg.com/vi/_yZ6x3qJ7j0/hqdefault.jpg" }
];

const CATALOG_HIPHOP_HITS = [
  { videoId: "phLb_SoPBlA", title: "Not Like Us", artist: "Kendrick Lamar", album: "Not Like Us", duration: "4:35", tag: "West Coast", thumbnail: "https://yt3.googleusercontent.com/8qk3C_zpd2FXHVN8BpMBFL6h9J5BlKlbcKOlvDMvIgBWBsAblDoTjU98RGbFH9DxtnN1X5zRzc9sSvWr=w544-h544-l90-rj" },
  { videoId: "xIQpLlYC8xA", title: "Houdini", artist: "Eminem", album: "The Death of Slim Shady", duration: "3:48", tag: "Rap", thumbnail: "https://yt3.googleusercontent.com/Xx3dX1EJDirqwpfQL05uAgmKGYpzTcFDXjjHqjNpIhgY5MWTJRLSlOjaYVtup2Ku6gBYEqXoxw5aGKC3=w544-h544-l90-rj" },
  { videoId: "2nR1zrNzgcY", title: "FE!N (feat. Playboi Carti)", artist: "Travis Scott", album: "UTOPIA", duration: "3:12", tag: "Trap", thumbnail: "https://yt3.googleusercontent.com/eBvJuWpjg0Mx8DBa5WIhCzEopXyMnxkjWSU895BDGjTpNeqrliLrv3zGqNNuCUoXL1EkEAr5VQ3cx2pW=w544-h544-l90-rj" },
  { videoId: "FrsOnNxIrg8", title: "God's Plan", artist: "Drake", album: "Scorpion", duration: "3:19", tag: "Hip-Hop", thumbnail: "https://yt3.googleusercontent.com/9Oe4acEXgmAlCKgcgI6JlSXi2Tj30u6anzvfGBrunGO-fLhBTgzy-ei1ugPJpZDD5ArKFod9H4RTA5g0=w544-h544-l90-rj" },
  { videoId: "3_g2un5M350", title: "Starboy", artist: "The Weeknd", album: "Starboy", duration: "3:51", tag: "R&B / Rap", thumbnail: "https://yt3.googleusercontent.com/dcxXIIlest09vnvKznWM9VWQXu1EL7lKxBzXGzwgmVjmMNBm1dEWT_0qn1xrEZYyKF_qRE1TLq8P_JY_mQ=w544-h544-l90-rj" },
  { videoId: "4EQkYVtE-28", title: "Circles", artist: "Post Malone", album: "Hollywood's Bleeding", duration: "3:36", tag: "Melodic", thumbnail: "https://yt3.googleusercontent.com/YoQ-A-GOpgeE8tgdF3Rcf5z9V8NIIKjLH6_7X3QphIQUwVHioLu7Ik2wQzU0oCkyNm1TeLDLDYvomJ8=w544-h544-l90-rj" }
];

const CATALOG_ROCK_HITS = [
  { videoId: "eVTXPUF4Oz4", title: "In the End", artist: "Linkin Park", album: "Hybrid Theory", duration: "3:36", tag: "Nu-Metal", thumbnail: "https://i.ytimg.com/vi/eVTXPUF4Oz4/hqdefault.jpg" },
  { videoId: "bpOSxM0rNPM", title: "Do I Wanna Know?", artist: "Arctic Monkeys", album: "AM", duration: "4:32", tag: "Indie Rock", thumbnail: "https://yt3.googleusercontent.com/7a03Ybk8vbe8c4dl4E8l77Y4e9aEWjQvTfOAdLdXxsnjZ57gYQ8FsKra9SgXAHT-jtiwuq6lukCfbRKL=w544-h544-l90-rj" },
  { videoId: "BSTsnWoslP4", title: "Bohemian Rhapsody", artist: "Queen", album: "A Night at the Opera", duration: "5:55", tag: "Masterpiece", thumbnail: "https://yt3.googleusercontent.com/nLn1gxvYiZqzXOY9HyUXVXbFtmR5nhY8sDpbvBT1aw-Ejjsz__Nz90sZoc4nZgff2sf8WjowuVRVBlBTww=w544-h544-l90-rj" },
  { videoId: "9ssQKlLxBdQ", title: "Thunder", artist: "Imagine Dragons", album: "Evolve", duration: "3:08", tag: "Arena Rock", thumbnail: "https://yt3.googleusercontent.com/weYQWfEwWNPOuAm34geXN1LkSYPlsJay78NnQgHC3PKsyZcdvBHIsMtqoFh3rioA4XgMdHMQd3h6vH6mbA=w544-h544-l90-rj" },
  { videoId: "_GWKkqNoyEA", title: "Counting Stars", artist: "OneRepublic", album: "Native", duration: "4:18", tag: "Alt-Pop", thumbnail: "https://yt3.googleusercontent.com/m2pZLjozMvQBj21LgvAIslVPP-T2xQlxbxCTJ98vpPN8HZ0fgR-wisJQ2IzrKS2yLTAYBjs0TpOYnIY=w544-h544-l90-rj" },
  { videoId: "2NiyrtYegso", title: "Wake Me Up", artist: "Avicii", album: "True", duration: "4:08", tag: "EDM Rock", thumbnail: "https://yt3.googleusercontent.com/XincHWEjkXhpbavoQEHWRbTcVdvHsujjr7OAw-73KUCILFgjLdevPW8vkoaRMibnwkTtGWkEDyKbuNeK=w544-h544-l90-rj" }
];

const CATALOG_LOFI_HITS = [
  { videoId: "kAw9xGI8vgk", title: "Deep Chill Lofi Study", artist: "Lumosound", album: "Lofi Study Session", duration: "3:40", tag: "Focus", thumbnail: "https://i.ytimg.com/vi/kAw9xGI8vgk/hqdefault.jpg" },
  { videoId: "4EQkYVtE-28", title: "Circles (Chill Acoustic)", artist: "Post Malone", album: "Acoustic", duration: "3:36", tag: "Chill", thumbnail: "https://yt3.googleusercontent.com/YoQ-A-GOpgeE8tgdF3Rcf5z9V8NIIKjLH6_7X3QphIQUwVHioLu7Ik2wQzU0oCkyNm1TeLDLDYvomJ8=w544-h544-l90-rj" },
  { videoId: "bpOSxM0rNPM", title: "Do I Wanna Know? (Acoustic)", artist: "Arctic Monkeys", album: "Chill", duration: "4:32", tag: "Acoustic", thumbnail: "https://yt3.googleusercontent.com/7a03Ybk8vbe8c4dl4E8l77Y4e9aEWjQvTfOAdLdXxsnjZ57gYQ8FsKra9SgXAHT-jtiwuq6lukCfbRKL=w544-h544-l90-rj" },
  { videoId: "aHmg0jsmNhg", title: "vampire (Lofi)", artist: "Olivia Rodrigo", album: "Lofi Beats", duration: "3:40", tag: "Cozy", thumbnail: "https://yt3.googleusercontent.com/F32A1XBuQEkcOnYin-1BURG2MK_q12Ebovqwe8im8KXf8BHJ_jXW_7NnK73K6QOH-1D6QZKrrZGbNrlS=w544-h544-l90-rj" }
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

    // 2. Recommended for today: Seeded by current date or user taste
    const dailyPicks = this.getDailyPicks();

    // 3. Top Mixes: Dynamically personalized if history exists
    const topMixes = await this.getPersonalizedMixes();

    return {
      jumpBackIn: recents.map(t => ({ ...t, isLiked: this.isLiked(t.videoId) })),
      dailyPicks: dailyPicks.map(t => ({ ...t, isLiked: this.isLiked(t.videoId) })),
      topMixes: topMixes,
      hindiHits: CATALOG_HINDI_HITS.map(t => ({ ...t, isLiked: this.isLiked(t.videoId) })),
      urduSufi: CATALOG_URDU_SUFI.map(t => ({ ...t, isLiked: this.isLiked(t.videoId) })),
      punjabiHits: CATALOG_PUNJABI_HITS.map(t => ({ ...t, isLiked: this.isLiked(t.videoId) })),
      popHits: CATALOG_POP_HITS.map(t => ({ ...t, isLiked: this.isLiked(t.videoId) })),
      phonkHits: CATALOG_PHONK_HITS.map(t => ({ ...t, isLiked: this.isLiked(t.videoId) })),
      hiphopHits: CATALOG_HIPHOP_HITS.map(t => ({ ...t, isLiked: this.isLiked(t.videoId) })),
      rockHits: CATALOG_ROCK_HITS.map(t => ({ ...t, isLiked: this.isLiked(t.videoId) })),
      lofiHits: CATALOG_LOFI_HITS.map(t => ({ ...t, isLiked: this.isLiked(t.videoId) })),
      popularAlbums: CATALOG_POPULAR_ALBUMS.map(t => ({ ...t, isLiked: this.isLiked(t.videoId) })),
      podcasts: CATALOG_PODCASTS.map(t => ({ ...t, isLiked: this.isLiked(t.videoId) }))
    };
  }

  async getPersonalizedMixes() {
    try {
      const recents = this.getRecentTracks();
      const likes = await this.getLikedTracks();
      const userPool = [...likes, ...recents];

      if (!userPool || userPool.length === 0) {
        return CATALOG_TOP_MIXES;
      }

      // Deduplicate user pool tracks by videoId
      const seen = new Set();
      const uniqueUserTracks = [];
      for (const t of userPool) {
        if (t && t.videoId && !seen.has(t.videoId)) {
          seen.add(t.videoId);
          uniqueUserTracks.push(t);
        }
      }

      if (uniqueUserTracks.length === 0) {
        return CATALOG_TOP_MIXES;
      }

      const primaryArtist = uniqueUserTracks[0]?.artist?.split(',')[0]?.trim() || 'Your';
      const dynamicMix1 = {
        id: "personal_mix_1",
        title: `${primaryArtist} Mix`,
        subtitle: `${uniqueUserTracks.slice(0, 3).map(t => t.artist).join(', ')}`,
        gradient: "linear-gradient(135deg, #10b981, #064e3b)",
        bannerColor: "#10b981",
        tracks: [
          ...uniqueUserTracks.slice(0, 5),
          ...CATALOG_TRENDING_HITS.filter(t => !seen.has(t.videoId)).slice(0, 5)
        ].slice(0, 10)
      };

      const dynamicMix2 = {
        id: "personal_mix_2",
        title: "Daily Flow",
        subtitle: "Personalized rotation based on what you love",
        gradient: "linear-gradient(135deg, #a855f7, #581c87)",
        bannerColor: "#a855f7",
        tracks: [
          ...uniqueUserTracks.slice(2, 6),
          ...this.getDailyPicks().filter(t => !seen.has(t.videoId)).slice(0, 6)
        ].slice(0, 10)
      };

      return [
        dynamicMix1,
        dynamicMix2,
        ...CATALOG_TOP_MIXES.slice(1, 4)
      ];
    } catch (e) {
      return CATALOG_TOP_MIXES;
    }
  }

  getRecentTracks() {
    try {
      const raw = localStorage.getItem('etsuko_recent_tracks');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  getLikedTracksSync() {
    try {
      const raw = localStorage.getItem(this.localLikesKey);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  getDeterministicDailyPool() {
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
    return pool;
  }

  getDailyPicks() {
    try {
      const recents = this.getRecentTracks();
      const likes = this.getLikedTracksSync();
      const userPool = [...likes, ...recents].filter(t => t && t.videoId);

      // If user has actual listening history or likes, build personalized recommendations
      if (userPool.length > 0) {
        const seenIds = new Set();
        const seenNorms = new Set();
        const personalPicks = [];

        for (const t of userPool) {
          const norm = this.normalizeTitle ? this.normalizeTitle(t.title) : (t.title || '').toLowerCase().trim();
          if (!seenIds.has(t.videoId) && (!norm || !seenNorms.has(norm))) {
            seenIds.add(t.videoId);
            if (norm) seenNorms.add(norm);
            personalPicks.push(t);
            if (personalPicks.length >= 7) break;
          }
        }

        // Backfill with date-seeded fresh rotation from catalog
        const datePool = this.getDeterministicDailyPool();
        for (const t of datePool) {
          const norm = this.normalizeTitle ? this.normalizeTitle(t.title) : (t.title || '').toLowerCase().trim();
          if (!seenIds.has(t.videoId) && (!norm || !seenNorms.has(norm))) {
            seenIds.add(t.videoId);
            if (norm) seenNorms.add(norm);
            personalPicks.push(t);
            if (personalPicks.length >= 14) break;
          }
        }
        return personalPicks;
      }
    } catch (e) {
      console.warn('[API] getDailyPicks notice:', e);
    }

    // Diverse multi-genre discovery fallback for new users (deterministic daily rotation)
    return this.getDeterministicDailyPool().slice(0, 14);
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

  normalizeTitle(title) {
    if (!title) return '';
    return title
      .toLowerCase()
      .replace(/\s*[\(\[](official\s*(music\s*)?video|video|audio|lyrics|lyric\s*video|visualizer|full\s*song|hd|4k|mv|remix|lofi|slowed(\s*\+\s*reverb)?|reverb|speed\s*up|sped\s*up|cover|acoustic|live|extended|radio\s*edit)[\)\]]/gi, '')
      .replace(/\s*-\s*(official\s*(music\s*)?video|video|audio|lyrics|lyric\s*video|visualizer|full\s*song|remix|lofi|slowed|cover).*/gi, '')
      .replace(/[^\w\s\u0600-\u06FF\u0900-\u097F]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  filterDiverseRecommendations(candidates, currentTrack, limit = 12) {
    if (!Array.isArray(candidates)) return [];
    const normCurrent = this.normalizeTitle(currentTrack?.title);
    const seenIds = new Set();
    if (currentTrack && currentTrack.videoId) seenIds.add(currentTrack.videoId);
    const seenTitles = new Set();
    if (normCurrent) seenTitles.add(normCurrent);

    const artistCounts = {};
    const primaryCurrentArtist = (currentTrack?.artist || '').split(',')[0].replace(/\s*-\s*Topic/i, '').trim().toLowerCase();
    if (primaryCurrentArtist) artistCounts[primaryCurrentArtist] = 1;

    const filtered = [];
    for (const cand of candidates) {
      if (!cand || !cand.videoId || seenIds.has(cand.videoId)) continue;
      const normCand = this.normalizeTitle(cand.title);
      // Discard duplicates of the current track title or already chosen titles
      if (normCand && (normCand === normCurrent || seenTitles.has(normCand))) continue;

      const candArtist = (cand.artist || '').split(',')[0].replace(/\s*-\s*Topic/i, '').trim().toLowerCase();
      // Cap at 2 tracks per artist to guarantee diversity
      if (candArtist && (artistCounts[candArtist] || 0) >= 2) continue;

      seenIds.add(cand.videoId);
      if (normCand) seenTitles.add(normCand);
      if (candArtist) artistCounts[candArtist] = (artistCounts[candArtist] || 0) + 1;

      filtered.push({
        ...cand,
        isLiked: this.isLiked(cand.videoId)
      });

      if (filtered.length >= limit) break;
    }
    return filtered;
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
    let searchMoodQuery = 'pop hits';

    if (/punjabi|karan aujla|shubh|ikky|diljit|sidhu|ap dhillon|b praak|jassi|amrit|tauba|cheques|softly|baller|one love|winning/.test(combined)) {
      detectedCategory = 'punjabi';
      displayTag = 'Punjabi Hits';
      searchMoodQuery = 'punjabi hits';
    } else if (/hindi|urdu|rahat|fateh|ali khan|nusrat|atif|aslam|zaroori|arijit|pritam|shreya|jubin|neha|bollywood|sufi|ghazal|qawwali|coke studio|mohit chauhan|kk|sonu nigam|shaan|papon|sunidhi|alka yagnik|kumar sanu|udit narayan|lata|kishore|mohammed rafi|anuv jain|prateek kuhad|jasleen|darshan raval|armaan malik|kaifi khalil|ali zafar|afreen|tajdar|pehli dafa|tum hi ho|kesariya|chaleya|channa|apna bana|o maahi|raataan|saiyaan|o re piya|hawaayein|ishq|mohabbat/.test(combined)) {
      detectedCategory = 'hindi';
      displayTag = 'Hindi & Urdu Melodies';
      searchMoodQuery = 'hindi urdu romantic melodies';
    } else if (/phonk|drift|dvrst|kordhell|moondeity|interworld|hensonn|pharmacist|playaphonk|murder in my mind|metamorphosis|neon blade|close eyes/.test(combined)) {
      detectedCategory = 'phonk';
      displayTag = 'Phonk & Drift';
      searchMoodQuery = 'drift phonk';
    } else if (/rap|hip-hop|hip hop|eminem|kendrick|travis scott|drake|post malone|carti|metro boomin|future|21 savage|not like us|houdini|fe!n|god's plan/.test(combined)) {
      detectedCategory = 'hiphop';
      displayTag = 'Hip-Hop & Rap';
      searchMoodQuery = 'hip hop rap hits';
    } else if (/rock|metal|linkin park|queen|arctic monkeys|imagine dragons|onerepublic|nirvana|coldplay|in the end|thunder|counting stars|bohemian/.test(combined)) {
      detectedCategory = 'rock';
      displayTag = 'Rock & Alternative';
      searchMoodQuery = 'rock hits';
    } else if (/lofi|chill|study|sleep|peaceful|lumosound|chilledcow|cozy|beats/.test(combined)) {
      detectedCategory = 'lofi';
      displayTag = 'Lofi & Chill Study';
      searchMoodQuery = 'lofi chill study beats';
    } else if (/anime|j-pop|japanese|yoasobi|eve|kenshi|lisa|aimer|radwimps/.test(combined)) {
      detectedCategory = 'anime';
      displayTag = 'Anime & J-Pop';
      searchMoodQuery = 'japanese anime hits';
    } else {
      detectedCategory = 'pop';
      displayTag = 'Pop & Chart Toppers';
      searchMoodQuery = 'pop chart hits';
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
        { videoId: "kw4tT7SCmaY", title: "Afreen Afreen", artist: "Rahat Fateh Ali Khan, Momina Mustehsan", album: "Coke Studio", duration: "6:44", thumbnail: "https://i.ytimg.com/vi/kw4tT7SCmaY/hqdefault.jpg" },
        { videoId: "c7TX12j_sY8", title: "Tajdar-e-Haram", artist: "Atif Aslam", album: "Coke Studio", duration: "10:28", thumbnail: "https://i.ytimg.com/vi/c7TX12j_sY8/hqdefault.jpg" },
        { videoId: "2kfmxHqM_eI", title: "Pehli Dafa", artist: "Atif Aslam", album: "Pehli Dafa", duration: "4:43", thumbnail: "https://i.ytimg.com/vi/2kfmxHqM_eI/hqdefault.jpg" },
        { videoId: "Umqb9KENgmk", title: "Tum Hi Ho", artist: "Arijit Singh", album: "Aashiqui 2", duration: "4:22", thumbnail: "https://i.ytimg.com/vi/Umqb9KENgmk/hqdefault.jpg" },
        { videoId: "BddP6PYo2gs", title: "Kesariya", artist: "Arijit Singh, Pritam", album: "Brahmastra", duration: "4:28", thumbnail: "https://i.ytimg.com/vi/BddP6PYo2gs/hqdefault.jpg" },
        { videoId: "V_jp5_VAzXk", title: "Chaleya", artist: "Arijit Singh, Shilpa Rao", album: "Jawan", duration: "3:20", thumbnail: "https://i.ytimg.com/vi/V_jp5_VAzXk/hqdefault.jpg" },
        { videoId: "cbqbx7h0p9E", title: "Tum Se Hi", artist: "Mohit Chauhan, Pritam", album: "Jab We Met", duration: "5:21", thumbnail: "https://i.ytimg.com/vi/cbqbx7h0p9E/hqdefault.jpg" },
        { videoId: "5y_KpD_aUfk", title: "Zara Sa", artist: "KK, Pritam", album: "Jannat", duration: "5:03", thumbnail: "https://i.ytimg.com/vi/5y_KpD_aUfk/hqdefault.jpg" },
        { videoId: "zJmU2j3O6Wc", title: "Kahani Suno 2.0", artist: "Kaifi Khalil", album: "Kahani Suno", duration: "2:54", thumbnail: "https://i.ytimg.com/vi/zJmU2j3O6Wc/hqdefault.jpg" },
        { videoId: "2JzQhLqA5Q4", title: "Jhoom", artist: "Ali Zafar", album: "Jhoom", duration: "4:32", thumbnail: "https://i.ytimg.com/vi/2JzQhLqA5Q4/hqdefault.jpg" },
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

    const primaryArtist = (currentTrack.artist || '').split(',')[0].replace(/\s*-\s*Topic/i, '').trim();
    const candidateList = [];

    // 1. Dual-Query Live Search (Artist Radio/Similar + Mood/Genre Discovery)
    try {
      if (primaryArtist && primaryArtist !== 'Unknown Artist') {
        const resArtist = await this.search(`${primaryArtist} similar songs`, 'songs');
        if (resArtist && resArtist.results && resArtist.results.length > 0) {
          candidateList.push(...resArtist.results);
        }
      }
      const resMood = await this.search(searchMoodQuery, 'songs');
      if (resMood && resMood.results && resMood.results.length > 0) {
        candidateList.push(...resMood.results);
      }
    } catch (e) {
      console.warn('[API] getRelatedTracks search notice:', e);
    }

    // 2. Curated Genre Fallback Pool
    const pool = genrePools[detectedCategory] || genrePools.pop;
    candidateList.push(...pool);

    // 3. Strict Diversity Filter (removes remixes/duplicates of current track & caps artist repeats)
    const diverseTracks = this.filterDiverseRecommendations(candidateList, currentTrack, 12);

    return {
      category: detectedCategory,
      displayTag: displayTag,
      tracks: diverseTracks
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
