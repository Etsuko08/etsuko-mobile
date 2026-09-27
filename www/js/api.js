// Etsuko Mobile API Client
class EtsukoAPI {
  constructor() {
    this.baseUrl = this.determineBaseUrl();
  }

  determineBaseUrl() {
    if (window.location.protocol.startsWith('http')) {
      return window.location.origin;
    }
    const saved = localStorage.getItem('etsuko_custom_server');
    return saved || 'http://127.0.0.1:52331';
  }

  setServerUrl(url) {
    let clean = url.trim().replace(/\/+$/, '');
    if (!clean.startsWith('http')) clean = 'http://' + clean;
    this.baseUrl = clean;
    localStorage.setItem('etsuko_custom_server', clean);
  }

  async fetchJson(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn(`[API] Error fetching ${endpoint}:`, e);
      throw e;
    }
  }

  async getHomeFeed() {
    return await this.fetchJson('/api/home');
  }

  async search(query, filter = 'songs', signal = null) {
    const params = new URLSearchParams({ q: query, filter: filter });
    return await this.fetchJson(`/api/search?${params.toString()}`, { signal });
  }

  async getAlbum(browseId) {
    return await this.fetchJson(`/api/album/${encodeURIComponent(browseId)}`);
  }

  async getArtist(browseId) {
    return await this.fetchJson(`/api/artist/${encodeURIComponent(browseId)}`);
  }

  async getLyrics(title, artist, videoId = '') {
    const params = new URLSearchParams({ title, artist, video_id: videoId });
    return await this.fetchJson(`/api/lyrics?${params.toString()}`);
  }

  async getLikedTracks() {
    const data = await this.fetchJson('/api/library/likes');
    return data.tracks || [];
  }

  async likeTrack(track) {
    return await this.fetchJson('/api/library/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(track)
    });
  }

  async unlikeTrack(videoId) {
    return await this.fetchJson('/api/library/unlike', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoId })
    });
  }

  async getPlaylists() {
    const data = await this.fetchJson('/api/library/playlists');
    return data.playlists || [];
  }

  async createPlaylist(name, description = '') {
    return await this.fetchJson('/api/library/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description })
    });
  }

  async getPlaylist(id) {
    return await this.fetchJson(`/api/library/playlist/${encodeURIComponent(id)}`);
  }

  async addTrackToPlaylist(id, track) {
    return await this.fetchJson(`/api/library/playlist/${encodeURIComponent(id)}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(track)
    });
  }

  async removeTrackFromPlaylist(id, videoId) {
    return await this.fetchJson(`/api/library/playlist/${encodeURIComponent(id)}/track/${encodeURIComponent(videoId)}`, {
      method: 'DELETE'
    });
  }

  async deletePlaylist(id) {
    return await this.fetchJson(`/api/library/playlist/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  }

  async getProfile() {
    const data = await this.fetchJson('/api/profile');
    return data.profile || { name: 'Cyber Voyager', bio: 'Mobile neural listener', avatar: 'assets/default_user.png' };
  }

  async updateProfile(name, bio, avatar) {
    return await this.fetchJson('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, bio, avatar })
    });
  }

  getStreamUrl(videoId) {
    return `${this.baseUrl}/api/proxy_stream/${encodeURIComponent(videoId)}`;
  }
}

window.api = new EtsukoAPI();
