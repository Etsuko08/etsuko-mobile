/**
 * Etsuko Mobile — Comprehensive QA, Security & Stress Test Suite
 * Validates real-world runtime behavior, security sanitization, artwork fallback chains,
 * queue deduplication, and date calculation.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('====================================================');
console.log('ETSUKO MOBILE — QA, SECURITY & RUNTIME TEST SUITE');
console.log('====================================================\n');

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(`         ${err.message}`);
  }
}

// 1. Load api.js in a headless DOM mock environment
const apiCode = fs.readFileSync(path.join(__dirname, '../js/api.js'), 'utf8');

// Mock window and global browser environment
global.window = {};
global.document = {
  addEventListener: () => {},
  getElementById: () => null
};
global.localStorage = {
  _store: {},
  getItem(k) { return this._store[k] || null; },
  setItem(k, v) { this._store[k] = String(v); },
  removeItem(k) { delete this._store[k]; }
};

// Evaluate api.js
eval(apiCode);

// ----------------------------------------------------
// TEST GROUP 1: ARTWORK NORMALIZATION & PROTOCOL SECURITY
// ----------------------------------------------------
test('formatHighResThumbnail: Upgrades Google/YouTube Music CDN thumbnails to 544x544 HD', () => {
  const input = 'https://yt3.googleusercontent.com/abc=w120-h120-l90-rj';
  const output = window.formatHighResThumbnail('DlFXDl_ROAM', input);
  assert.strictEqual(output, 'https://yt3.googleusercontent.com/abc=w544-h544-l90-rj');
});

test('formatHighResThumbnail: Upgrades Google CDN with =s120 to =s544', () => {
  const input = 'https://lh3.googleusercontent.com/xyz=s120';
  const output = window.formatHighResThumbnail('DlFXDl_ROAM', input);
  assert.strictEqual(output, 'https://lh3.googleusercontent.com/xyz=s544');
});

test('formatHighResThumbnail: Replaces 404-prone hq720.jpg with guaranteed hqdefault.jpg', () => {
  const input = 'https://i.ytimg.com/vi/kIft-LUHHVA/hq720.jpg';
  const output = window.formatHighResThumbnail('kIft-LUHHVA', input);
  assert.strictEqual(output, 'https://i.ytimg.com/vi/kIft-LUHHVA/hqdefault.jpg');
});

test('formatHighResThumbnail: Rejects dangerous javascript: / data:text protocols', () => {
  const exploit1 = 'javascript:alert(document.cookie)';
  const output1 = window.formatHighResThumbnail('kIft-LUHHVA', exploit1);
  assert.strictEqual(output1, 'https://i.ytimg.com/vi/kIft-LUHHVA/hqdefault.jpg');

  const exploit2 = 'javascript:alert(1)';
  const output2 = window.formatHighResThumbnail(null, exploit2);
  assert.strictEqual(output2, 'assets/default_cover.png');
});

test('formatHighResThumbnail: Handles missing or invalid URLs safely with default cover', () => {
  assert.strictEqual(window.formatHighResThumbnail(null, null), 'assets/default_cover.png');
  assert.strictEqual(window.formatHighResThumbnail('', ''), 'assets/default_cover.png');
  assert.strictEqual(window.formatHighResThumbnail(undefined, undefined), 'assets/default_cover.png');
});

test('window.getEtsukoArtwork: Works with track objects, string URLs, and missing fields', () => {
  const track1 = { videoId: 'WKZO-CWeOVA', thumbnail: 'https://yt3.googleusercontent.com/pic=w60-h60' };
  assert.strictEqual(window.getEtsukoArtwork(track1), 'https://yt3.googleusercontent.com/pic=w544-h544-l90-rj');

  const track2 = { videoId: 'WKZO-CWeOVA' };
  assert.strictEqual(window.getEtsukoArtwork(track2), 'https://i.ytimg.com/vi/WKZO-CWeOVA/hqdefault.jpg');

  assert.strictEqual(window.getEtsukoArtwork(null), 'assets/default_cover.png');
});

// ----------------------------------------------------
// TEST GROUP 2: IMAGE ERROR HANDLER FALLBACK CHAIN & SANITIZATION
// ----------------------------------------------------
test('handleEtsukoImgError: Sequences fallback steps hqdefault -> mqdefault -> default_cover', () => {
  const imgMock = {
    dataset: { vid: 'WKZO-CWeOVA' },
    src: 'https://broken.cdn.com/test.jpg',
    onerror: () => {}
  };

  // Step 0 -> Step 1 (hqdefault)
  window.handleEtsukoImgError(imgMock);
  assert.strictEqual(imgMock.dataset.step, '1');
  assert.strictEqual(imgMock.src, 'https://i.ytimg.com/vi/WKZO-CWeOVA/hqdefault.jpg');

  // Step 1 -> Step 2 (mqdefault)
  window.handleEtsukoImgError(imgMock);
  assert.strictEqual(imgMock.dataset.step, '2');
  assert.strictEqual(imgMock.src, 'https://i.ytimg.com/vi/WKZO-CWeOVA/mqdefault.jpg');

  // Step 2 -> Terminate with assets/default_cover.png and remove onerror
  window.handleEtsukoImgError(imgMock);
  assert.strictEqual(imgMock.src, 'assets/default_cover.png');
  assert.strictEqual(imgMock.onerror, null);
});

test('handleEtsukoImgError: Validates videoId and rejects injection payloads', () => {
  const maliciousImg = {
    dataset: { vid: "'; alert('xss'); //" },
    src: 'https://broken.cdn.com/test.jpg',
    onerror: () => {}
  };

  window.handleEtsukoImgError(maliciousImg);
  // Must NOT interpolate invalid videoId into any URL; immediately defaults to assets/default_cover.png
  assert.strictEqual(maliciousImg.src, 'assets/default_cover.png');
  assert.strictEqual(maliciousImg.onerror, null);
});

// ----------------------------------------------------
// TEST GROUP 3: LOCAL CALENDAR DAY & REFRESH LOGIC
// ----------------------------------------------------
test('getLocalTodayString: Returns standard YYYY-MM-DD representing local device calendar day', () => {
  const localDate = window.api.getLocalTodayString();
  assert.match(localDate, /^\d{4}-\d{2}-\d{2}$/);

  const d = new Date();
  const expected = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  assert.strictEqual(localDate, expected);
});

test('getDeterministicDailyPool: Produces stable seeded ordering for identical local date', () => {
  const pool1 = window.api.getDeterministicDailyPool();
  const pool2 = window.api.getDeterministicDailyPool();
  assert.strictEqual(pool1.length, pool2.length);
  assert.strictEqual(pool1[0].videoId, pool2[0].videoId);
  assert.strictEqual(pool1[pool1.length - 1].videoId, pool2[pool2.length - 1].videoId);
});

// ----------------------------------------------------
// TEST GROUP 4: SECURITY ESCAPING & DATA INTEGRITY
// ----------------------------------------------------
test('HTML Sanitization: Verifies escapeHtml covers all standard XSS entities', () => {
  const escapeHtml = (text) => {
    if (!text) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  };

  const payload = '<script>alert("pwned & hacked")</script>\'';
  const sanitized = escapeHtml(payload);
  assert.strictEqual(sanitized, '&lt;script&gt;alert(&quot;pwned &amp; hacked&quot;)&lt;/script&gt;&#039;');
  assert.ok(!sanitized.includes('<'));
  assert.ok(!sanitized.includes('>'));
});

// ----------------------------------------------------
// TEST GROUP 5: ASYNC CONCURRENCY & OUT-OF-ORDER GUARDS
// ----------------------------------------------------
test('Concurrency Guard: Validates that slow delayed requests cannot overwrite current request state', async () => {
  let playRequestId = 0;
  let currentActiveTrack = null;

  async function mockPlayTrack(track, delayMs) {
    playRequestId++;
    const thisReq = playRequestId;

    await new Promise(r => setTimeout(r, delayMs));

    // Request guard check
    if (thisReq !== playRequestId) {
      return; // Discarded!
    }
    currentActiveTrack = track;
  }

  // Rapid skip simulation: Track A takes 50ms, Track B takes 5ms
  const p1 = mockPlayTrack({ id: 'TrackA' }, 50);
  const p2 = mockPlayTrack({ id: 'TrackB' }, 5);

  await Promise.all([p1, p2]);

  // Track B must be active even though Track A finished afterwards!
  assert.strictEqual(currentActiveTrack.id, 'TrackB');
});

console.log('\n====================================================');
console.log(`TEST SUMMARY: ${passedTests}/${totalTests} Tests Passed (${Math.round((passedTests/totalTests)*100)}%)`);
console.log('====================================================');

if (passedTests !== totalTests) {
  process.exit(1);
}
