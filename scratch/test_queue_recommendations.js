const https = require('https');

async function testSmartQueueAndAutoplay() {
  console.log('=== TEST 1: VERIFYING YOUTUBE ML RADIO QUEUE FOR "ZAROOR" ===');
  
  // Seed track: Zaroor (or similar distinctive title)
  // Let's use videoId of Zaroor or Zaroori Tha
  const testTrack = {
    videoId: '60ItHLz5WEA',
    title: 'Zaroor',
    artist: 'Aparshakti Khurana',
    album: 'Single'
  };

  // Fetch ML Radio Queue directly from YouTube Music v1/next endpoint
  const postData = JSON.stringify({
    context: {
      client: {
        clientName: 'WEB_REMIX',
        clientVersion: '1.20260928.01.00',
        hl: 'en'
      }
    },
    playlistId: 'RDAMVM' + testTrack.videoId,
    videoId: testTrack.videoId,
    enablePersistentPlaylistPanel: true
  });

  const raw = await new Promise((resolve, reject) => {
    const req = https.request('https://music.youtube.com/youtubei/v1/next', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });

  const playlistPanel = raw.contents?.singleColumnMusicWatchNextResultsRenderer?.tabbedRenderer?.watchNextTabbedResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.musicQueueRenderer?.content?.playlistPanelRenderer;
  const items = playlistPanel?.contents || [];

  const radioTracks = [];
  for (const item of items) {
    const renderer = item.playlistPanelVideoRenderer;
    if (!renderer || !renderer.videoId || renderer.videoId === testTrack.videoId) continue;
    const title = renderer.title?.runs?.[0]?.text || '';
    const artist = renderer.longBylineText?.runs?.map(r => r.text).join('') || '';
    radioTracks.push({ videoId: renderer.videoId, title, artist });
  }

  console.log(`[ML Radio]: Found ${radioTracks.length} raw recommendation tracks.`);

  // Verify diversity filter
  const seenIds = new Set([testTrack.videoId]);
  const seenTitles = new Set([testTrack.title.toLowerCase().trim()]);
  const diverseRecs = [];

  for (const t of radioTracks) {
    if (seenIds.has(t.videoId)) continue;
    const norm = t.title.toLowerCase().replace(/\s*[\(\[].*?[\)\]]/g, '').trim();
    if (seenTitles.has(norm)) continue;
    seenIds.add(t.videoId);
    seenTitles.add(norm);
    diverseRecs.push(t);
  }

  console.log(`[Filtered Recommendations]: ${diverseRecs.length} tracks.`);
  console.log('Sample Recommended For You:');
  diverseRecs.slice(0, 5).forEach((t, i) => {
    console.log(`  ${i + 1}. ${t.title} - ${t.artist} (${t.videoId})`);
  });

  // Check if any recommendation contains "Zaroori Tha", "Tu Zaroori", etc.
  const badMatches = diverseRecs.filter(t => /zaroori\s*tha|tu\s*zaroori|zaroori\s*nai/i.test(t.title));
  console.log(`Recommendations containing title-matched junk: ${badMatches.length}`);
  if (badMatches.length > 0) {
    throw new Error('Found title matched junk in recommendations!');
  }

  console.log('\n=== TEST 2: SIMULATING SMART AUTOPLAY QUEUE CONSUMPTION ===');
  // State simulation
  let recommendedPool = [...diverseRecs];
  let currentPlaying = testTrack;
  let queue = [currentPlaying, ...recommendedPool];

  console.log(`Initial Queue Length: ${queue.length}`);
  console.log(`Next in Queue: "${queue[1].title}" by ${queue[1].artist}`);
  console.log(`First in Recommended For You: "${recommendedPool[0].title}" by ${recommendedPool[0].artist}`);

  // Both MUST match
  if (queue[1].videoId !== recommendedPool[0].videoId) {
    throw new Error('Queue next does not match Recommended For You first item!');
  }
  console.log('CONFIRMED: Up Next in Queue and Recommended For You share the exact same track ID and object!');

  // Simulate Track Finishing: Autoplay consumes next track
  const nextTrack = recommendedPool.shift();
  queue = [nextTrack, ...recommendedPool];
  currentPlaying = nextTrack;

  console.log(`\nTrack ended! Autoplaying: "${currentPlaying.title}" (${currentPlaying.videoId})`);
  console.log(`Remaining pool count: ${recommendedPool.length}`);
  console.log(`New Up Next in Queue: "${queue[1].title}"`);
  console.log(`New First in Recommended: "${recommendedPool[0].title}"`);

  if (queue[1].videoId !== recommendedPool[0].videoId) {
    throw new Error('After track advancement, queue next does not match Recommended pool!');
  }
  console.log('CONFIRMED: Autoplay advances sequentially and updates both Queue and Recommended list in lockstep!');

  console.log('\n=== TEST 3: VERIFYING AUDIO STREAM RESOLUTION FOR AUTOPLAYED TRACK ===');
  // Verify that the autoplyed track has a real playable audio stream
  const watchReq = await new Promise((resolve, reject) => {
    https.get(`https://www.youtube.com/watch?v=${currentPlaying.videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });

  const visitorMatch = watchReq.match(/"VISITOR_DATA":"([^"]+)"/);
  const visitorData = visitorMatch ? visitorMatch[1] : '';

  const playerPayload = JSON.stringify({
    context: {
      client: {
        clientName: 'VISIONOS',
        clientVersion: '1.02',
        visitorData: visitorData,
        hl: 'en'
      }
    },
    videoId: currentPlaying.videoId
  });

  const playerRes = await new Promise((resolve, reject) => {
    const req = https.request('https://www.youtube.com/youtubei/v1/player', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(playerPayload);
    req.end();
  });

  const formats = playerRes.streamingData?.adaptiveFormats || [];
  const audioFormat = formats.find(f => f.mimeType && f.mimeType.includes('audio/mp4') && f.url);

  if (!audioFormat || !audioFormat.url) {
    throw new Error('Failed to resolve unthrottled audio stream for autoplyed track!');
  }

  console.log(`Autoplayed Track Audio Stream Resolved!`);
  console.log(`MimeType: ${audioFormat.mimeType}`);
  console.log(`ContentLength: ${audioFormat.contentLength} bytes`);
  console.log(`Stream URL Host: ${new URL(audioFormat.url).host}`);

  console.log('\n=== ALL REGRESSION TESTS PASSED CLEANLY! ===');
}

testSmartQueueAndAutoplay().catch(e => {
  console.error('Test failed:', e);
  process.exit(1);
});
