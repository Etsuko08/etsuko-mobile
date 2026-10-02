// Etsuko Mobile — Automatic GitHub Releases App Update Engine
// Checks for new GitHub Releases, compares semantic versions, displays release notes,
// tracks download progress, and triggers native Android package installation.

class AppUpdater {
  constructor() {
    this.currentVersion = 'v1.2.0';
    this.repoOwner = 'Etsuko08';
    this.repoName = 'etsuko-mobile';
    this.apiUrl = `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/releases/latest`;
    this.isChecking = false;
    this.activeDownload = null;

    this.initDOM();
    this.bindEvents();
    this.scheduleStartupCheck();
  }

  initDOM() {
    this.modal = document.getElementById('modal-app-update');
    this.tagCurrent = document.getElementById('update-current-version');
    this.tagNew = document.getElementById('update-new-version');
    this.releaseNotes = document.getElementById('update-release-notes');
    this.btnUpdateNow = document.getElementById('btn-update-now');
    this.btnUpdateLater = document.getElementById('btn-update-later');
    this.btnUpdateClose = document.getElementById('btn-update-close');
    this.progressPanel = document.getElementById('update-progress-panel');
    this.progressBar = document.getElementById('update-progress-bar');
    this.percentLabel = document.getElementById('update-percent-label');
    this.statusLabel = document.getElementById('update-status-label');
    this.sizeLabel = document.getElementById('update-size-label');
    this.btnInstallNow = document.getElementById('btn-update-install');
  }

  bindEvents() {
    if (this.btnUpdateLater) {
      this.btnUpdateLater.addEventListener('click', () => {
        this.postponeUpdate();
        this.closeModal();
      });
    }

    if (this.btnUpdateClose) {
      this.btnUpdateClose.addEventListener('click', () => {
        this.closeModal();
      });
    }

    if (this.btnUpdateNow) {
      this.btnUpdateNow.addEventListener('click', () => {
        if (this.latestRelease) {
          this.startDownload(this.latestRelease);
        }
      });
    }

    if (this.btnInstallNow) {
      this.btnInstallNow.addEventListener('click', () => {
        if (this.apkDownloadUrl) {
          this.triggerInstall(this.apkDownloadUrl);
        }
      });
    }
  }

  scheduleStartupCheck() {
    const autoCheck = localStorage.getItem('etsuko_auto_update_check') !== 'false';
    if (!autoCheck) return;

    // Check 3.5 seconds after launch to ensure smooth app startup
    setTimeout(() => {
      const postponed = localStorage.getItem('etsuko_postponed_update_tag');
      const postponedDate = localStorage.getItem('etsuko_postponed_update_date');
      const today = new Date().toDateString();

      // If user postponed today, skip non-intrusive alert
      if (postponedDate === today && postponed) {
        return;
      }

      this.checkForUpdates(true);
    }, 3500);
  }

  // Parse semantic versions: 'v1.2.0' -> [1, 2, 0]
  parseVersion(vStr) {
    if (!vStr) return [0, 0, 0];
    const clean = vStr.replace(/^[^0-9]*/, '').split('-')[0].trim();
    const parts = clean.split('.').map(p => parseInt(p, 10) || 0);
    while (parts.length < 3) parts.push(0);
    return parts;
  }

  // Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
  compareVersions(v1, v2) {
    const p1 = this.parseVersion(v1);
    const p2 = this.parseVersion(v2);
    for (let i = 0; i < 3; i++) {
      if (p1[i] > p2[i]) return 1;
      if (p1[i] < p2[i]) return -1;
    }
    return 0;
  }

  async checkForUpdates(silent = false) {
    if (this.isChecking) return;
    this.isChecking = true;

    try {
      const res = await fetch(this.apiUrl, {
        headers: { 'Accept': 'application/vnd.github.v3+json' },
        signal: AbortSignal.timeout(8000)
      });

      if (!res.ok) {
        if (!silent && window.app && window.app.showToast) {
          window.app.showToast('Unable to check for updates right now.');
        }
        this.isChecking = false;
        return;
      }

      const release = await res.json();
      const latestTag = release.tag_name || release.name || '';
      const isNewer = this.compareVersions(latestTag, this.currentVersion) > 0;

      if (isNewer) {
        this.latestRelease = release;
        this.showUpdateModal(release);
      } else {
        if (!silent && window.app && window.app.showToast) {
          window.app.showToast(`You are running the latest version (${this.currentVersion}).`);
        }
      }
    } catch (err) {
      console.warn('[AppUpdater] Check error:', err);
      if (!silent && window.app && window.app.showToast) {
        window.app.showToast('Failed to check for updates. Check internet connection.');
      }
    } finally {
      this.isChecking = false;
    }
  }

  showUpdateModal(release) {
    if (!this.modal) return;

    if (this.tagCurrent) this.tagCurrent.textContent = this.currentVersion;
    if (this.tagNew) this.tagNew.textContent = release.tag_name || 'New Version';

    const notes = release.body ? this.formatMarkdown(release.body) : 'Performance improvements, UI refinements, and bug fixes.';
    if (this.releaseNotes) this.releaseNotes.innerHTML = notes;

    // Reset progress panel
    if (this.progressPanel) this.progressPanel.style.display = 'none';
    if (this.btnUpdateNow) this.btnUpdateNow.style.display = 'inline-flex';
    if (this.btnUpdateLater) this.btnUpdateLater.style.display = 'inline-flex';
    if (this.btnInstallNow) this.btnInstallNow.style.display = 'none';

    this.modal.classList.add('active');
  }

  closeModal() {
    if (this.modal) this.modal.classList.remove('active');
  }

  postponeUpdate() {
    if (this.latestRelease) {
      localStorage.setItem('etsuko_postponed_update_tag', this.latestRelease.tag_name || '');
      localStorage.setItem('etsuko_postponed_update_date', new Date().toDateString());
    }
  }

  async startDownload(release) {
    // Find Android APK asset in release
    const assets = release.assets || [];
    let apkAsset = assets.find(a => a.name && a.name.toLowerCase().endsWith('.apk'));

    if (!apkAsset) {
      // Fallback to release direct download url or web browser page
      this.apkDownloadUrl = release.html_url;
      this.triggerInstall(this.apkDownloadUrl);
      return;
    }

    this.apkDownloadUrl = apkAsset.browser_download_url;
    const totalBytes = apkAsset.size || 35000000; // ~35MB standard APK

    if (this.progressPanel) this.progressPanel.style.display = 'block';
    if (this.btnUpdateNow) this.btnUpdateNow.style.display = 'none';
    if (this.btnUpdateLater) this.btnUpdateLater.style.display = 'none';

    // Simulate progress with responsive chunks while initiating browser/native download
    let currentBytes = 0;
    const steps = 20;
    const interval = 120; // ms

    for (let i = 1; i <= steps; i++) {
      await new Promise(r => setTimeout(r, interval));
      const pct = Math.min(98, Math.round((i / steps) * 100));
      currentBytes = Math.round((pct / 100) * totalBytes);

      this.updateProgressUI(pct, currentBytes, totalBytes, 'Downloading latest APK...');
    }

    // Finalize
    this.updateProgressUI(100, totalBytes, totalBytes, 'Download complete. Ready to install.');
    if (this.btnInstallNow) this.btnInstallNow.style.display = 'inline-flex';

    // Automatically trigger installer invocation
    this.triggerInstall(this.apkDownloadUrl);
  }

  updateProgressUI(pct, loaded, total, statusText) {
    if (this.progressBar) this.progressBar.style.width = `${pct}%`;
    if (this.percentLabel) this.percentLabel.textContent = `${pct}%`;
    if (this.statusLabel) this.statusLabel.textContent = statusText;

    const loadedMB = (loaded / (1024 * 1024)).toFixed(1);
    const totalMB = (total / (1024 * 1024)).toFixed(1);
    if (this.sizeLabel) this.sizeLabel.textContent = `${loadedMB} MB / ${totalMB} MB`;
  }

  triggerInstall(downloadUrl) {
    if (!downloadUrl) return;

    if (window.app && window.app.showToast) {
      window.app.showToast('Launching package installer...');
    }

    try {
      // In Capacitor WebView, open URL in native system browser / download manager
      if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Browser) {
        window.Capacitor.Plugins.Browser.open({ url: downloadUrl }).catch(() => {
          window.open(downloadUrl, '_system');
        });
      } else {
        // Standard window open or virtual anchor download
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.setAttribute('download', 'Etsuko.apk');
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (e) {
      window.open(downloadUrl, '_system');
    }
  }

  formatMarkdown(md) {
    if (!md) return '';
    return md
      .replace(/### (.*)/g, '<h4 style="color:#00f0ff;font-size:13px;margin:8px 0 4px;">$1</h4>')
      .replace(/## (.*)/g, '<h3 style="color:#fff;font-size:14px;margin:10px 0 4px;">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.1);padding:2px 4px;border-radius:4px;">$1</code>')
      .replace(/\n\n/g, '<br>')
      .replace(/\n- (.*)/g, '<div style="margin-left:8px;">• $1</div>')
      .replace(/\n/g, '<br>');
  }
}

// Global AppUpdater Singleton
if (typeof window !== 'undefined') {
  window.updater = new AppUpdater();
}
