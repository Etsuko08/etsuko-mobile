package com.etsuko.music;

import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;

import androidx.activity.OnBackPressedCallback;

import com.getcapacitor.BridgeActivity;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MainActivity extends BridgeActivity {
    private static MainActivity instance;
    private PowerManager.WakeLock wakeLock;

    public static MainActivity getInstance() {
        return instance;
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        instance = this;

        initWakeLock();
        checkNotificationPermission();

        if (bridge != null && bridge.getWebView() != null) {
            WebSettings settings = bridge.getWebView().getSettings();
            settings.setJavaScriptEnabled(true);
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setMediaPlaybackRequiresUserGesture(false);
            settings.setJavaScriptCanOpenWindowsAutomatically(true);
            settings.setAllowFileAccess(true);
            settings.setAllowContentAccess(true);

            String customUa = "Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36";
            settings.setUserAgentString(customUa);

            CookieManager.getInstance().setAcceptThirdPartyCookies(bridge.getWebView(), true);

            // Native Media Bridge for JavaScript
            bridge.getWebView().addJavascriptInterface(new AndroidMediaBridge(), "AndroidMedia");
        }

        // Modern gesture navigation & back button handler
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                evaluateJs("window.handleHardwareBack && window.handleHardwareBack();");
            }
        });
    }

    public void evaluateJs(String script) {
        runOnUiThread(() -> {
            if (bridge != null && bridge.getWebView() != null) {
                try {
                    bridge.getWebView().onResume();
                    bridge.getWebView().resumeTimers();
                } catch (Exception ignored) {}
                bridge.getWebView().evaluateJavascript(script, null);
            }
        });
    }

    private void checkNotificationPermission() {
        if (Build.VERSION.SDK_INT >= 33) {
            if (checkSelfPermission("android.permission.POST_NOTIFICATIONS") != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                requestPermissions(new String[]{"android.permission.POST_NOTIFICATIONS"}, 1001);
            }
        }
    }

    private void initWakeLock() {
        try {
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (pm != null) {
                wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "Etsuko::MainActivityWakeLock");
                wakeLock.setReferenceCounted(false);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void sendMediaUpdateToService(String title, String artist, String album, String thumbUrl, boolean isPlaying, long posMs, long durMs) {
        if (isPlaying) {
            if (wakeLock != null && !wakeLock.isHeld()) {
                wakeLock.acquire();
            }
        } else {
            if (wakeLock != null && wakeLock.isHeld()) {
                wakeLock.release();
            }
        }

        Intent intent = new Intent(this, MediaService.class);
        intent.setAction(MediaService.ACTION_UPDATE);
        intent.putExtra("title", title);
        intent.putExtra("artist", artist);
        intent.putExtra("album", album);
        intent.putExtra("thumbUrl", thumbUrl);
        intent.putExtra("isPlaying", isPlaying);
        intent.putExtra("posMs", posMs);
        intent.putExtra("durMs", durMs);

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(intent);
            } else {
                startService(intent);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void stopMediaService() {
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
        }
        Intent intent = new Intent(this, MediaService.class);
        intent.setAction(MediaService.ACTION_STOP);
        try {
            startService(intent);
        } catch (Exception ignored) {}
    }

    @Override
    public void onPause() {
        super.onPause();
        if (bridge != null && bridge.getWebView() != null) {
            try {
                bridge.getWebView().onResume();
                bridge.getWebView().resumeTimers();
            } catch (Exception ignored) {}
        }
    }

    @Override
    public void onStop() {
        super.onStop();
        if (bridge != null && bridge.getWebView() != null) {
            try {
                bridge.getWebView().onResume();
                bridge.getWebView().resumeTimers();
            } catch (Exception ignored) {}
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (bridge != null && bridge.getWebView() != null) {
            try {
                bridge.getWebView().onResume();
                bridge.getWebView().resumeTimers();
            } catch (Exception ignored) {}
        }
    }

    @Override
    public void onDestroy() {
        if (instance == this) {
            instance = null;
        }
        stopMediaService();
        super.onDestroy();
    }

    @Override
    public void onBackPressed() {
        evaluateJs("window.handleHardwareBack && window.handleHardwareBack();");
    }

    // JavaScript Bridge exposed as `window.AndroidMedia`
    public class AndroidMediaBridge {
        @JavascriptInterface
        public void updatePlaybackState(String title, String artist, String album, String thumbUrl, boolean isPlaying) {
            runOnUiThread(() -> sendMediaUpdateToService(title, artist, album, thumbUrl, isPlaying, 0, 0));
        }

        @JavascriptInterface
        public void updatePlaybackState(String title, String artist, String album, String thumbUrl, boolean isPlaying, double positionSec, double durationSec) {
            long posMs = (long) (positionSec * 1000);
            long durMs = (long) (durationSec * 1000);
            runOnUiThread(() -> sendMediaUpdateToService(title, artist, album, thumbUrl, isPlaying, posMs, durMs));
        }

        @JavascriptInterface
        public void updateProgress(double positionSec, double durationSec, boolean isPlaying) {
            long posMs = (long) (positionSec * 1000);
            long durMs = (long) (durationSec * 1000);
            // Lightweight progress sync to Foreground Service
            Intent intent = new Intent(MainActivity.this, MediaService.class);
            intent.setAction(MediaService.ACTION_UPDATE);
            intent.putExtra("isPlaying", isPlaying);
            intent.putExtra("posMs", posMs);
            intent.putExtra("durMs", durMs);
            try {
                startService(intent);
            } catch (Exception ignored) {}
        }

        @JavascriptInterface
        public void stopPlayback() {
            runOnUiThread(() -> stopMediaService());
        }

        @JavascriptInterface
        public void nativeSearchAsync(final String query, final String filter, final String callbackId) {
            new Thread(() -> {
                String responseJson = "{\"results\":[]}";
                try {
                    URL url = new URL("https://music.youtube.com/youtubei/v1/search");
                    HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                    conn.setRequestMethod("POST");
                    conn.setRequestProperty("Content-Type", "application/json");
                    conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:88.0) Gecko/20100101 Firefox/88.0");
                    conn.setRequestProperty("origin", "https://music.youtube.com");
                    conn.setDoOutput(true);
                    conn.setConnectTimeout(8000);
                    conn.setReadTimeout(12000);

                    String params = "EgWKAQIIAWoQEAMQBBAJEAoQBRAREBAQFQ%3D%3D";
                    if ("albums".equalsIgnoreCase(filter)) {
                        params = "EgWKAQIBAWoQEAMQBBAJEAoQBRAREBAQFQ%3D%3D";
                    } else if ("artists".equalsIgnoreCase(filter)) {
                        params = "EgWKAQIgAWoQEAMQBBAJEAoQBRAREBAQFQ%3D%3D";
                    }

                    String bodyStr = "{\"context\":{\"client\":{\"clientName\":\"WEB_REMIX\",\"clientVersion\":\"1.20260928.01.00\",\"hl\":\"en\"},\"user\":{}},\"query\":" + JSONObject.quote(query) + ",\"params\":\"" + params + "\"}";
                    byte[] bytes = bodyStr.getBytes(StandardCharsets.UTF_8);
                    conn.getOutputStream().write(bytes);

                    int code = conn.getResponseCode();
                    InputStream is = (code >= 200 && code < 300) ? conn.getInputStream() : conn.getErrorStream();
                    BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
                    StringBuilder sb = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        sb.append(line);
                    }
                    reader.close();
                    responseJson = sb.toString();
                } catch (Exception e) {
                    e.printStackTrace();
                }

                final String finalJson = responseJson;
                runOnUiThread(() -> {
                    String safeId = callbackId.replaceAll("[^a-zA-Z0-9_]", "");
                    evaluateJs("window['__native_search_" + safeId + "'] && window['__native_search_" + safeId + "'](" + JSONObject.quote(finalJson) + ");");
                });
            }).start();
        }

        @JavascriptInterface
        public void nativeRadioAsync(final String videoId, final String callbackId) {
            new Thread(() -> {
                String responseJson = "{\"contents\":{}}";
                try {
                    URL url = new URL("https://music.youtube.com/youtubei/v1/next");
                    HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                    conn.setRequestMethod("POST");
                    conn.setRequestProperty("Content-Type", "application/json");
                    conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
                    conn.setRequestProperty("origin", "https://music.youtube.com");
                    conn.setDoOutput(true);
                    conn.setConnectTimeout(8000);
                    conn.setReadTimeout(12000);

                    String bodyStr = "{\"context\":{\"client\":{\"clientName\":\"WEB_REMIX\",\"clientVersion\":\"1.20260928.01.00\",\"hl\":\"en\"}},\"playlistId\":\"RDAMVM" + videoId + "\",\"videoId\":\"" + videoId + "\",\"enablePersistentPlaylistPanel\":true,\"isAudioOnly\":true}";
                    byte[] bytes = bodyStr.getBytes(StandardCharsets.UTF_8);
                    conn.getOutputStream().write(bytes);

                    int code = conn.getResponseCode();
                    InputStream is = (code >= 200 && code < 300) ? conn.getInputStream() : conn.getErrorStream();
                    BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
                    StringBuilder sb = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        sb.append(line);
                    }
                    reader.close();
                    responseJson = sb.toString();
                } catch (Exception e) {
                    e.printStackTrace();
                }

                final String finalJson = responseJson;
                runOnUiThread(() -> {
                    String safeId = callbackId.replaceAll("[^a-zA-Z0-9_]", "");
                    evaluateJs("window['__native_radio_" + safeId + "'] && window['__native_radio_" + safeId + "'](" + JSONObject.quote(finalJson) + ");");
                });
            }).start();
        }

        @JavascriptInterface
        public void nativeResolveAudioStreamAsync(final String videoId, final String callbackId) {
            new Thread(() -> {
                String resultJson = "{\"success\":false}";
                try {
                    // 1. Fetch watch page to extract visitor data & sts
                    String visitor = "";
                    int sts = 20725;
                    try {
                        URL watchUrl = new URL("https://www.youtube.com/watch?v=" + videoId);
                        HttpURLConnection wConn = (HttpURLConnection) watchUrl.openConnection();
                        wConn.setRequestMethod("GET");
                        wConn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
                        wConn.setConnectTimeout(6000);
                        wConn.setReadTimeout(8000);

                        BufferedReader wReader = new BufferedReader(new InputStreamReader(wConn.getInputStream(), StandardCharsets.UTF_8));
                        StringBuilder wSb = new StringBuilder();
                        String wLine;
                        while ((wLine = wReader.readLine()) != null) {
                            wSb.append(wLine);
                        }
                        wReader.close();
                        String html = wSb.toString();

                        Matcher vMatcher = Pattern.compile("\"VISITOR_DATA\":\"([^\"]+)\"").matcher(html);
                        if (vMatcher.find()) visitor = vMatcher.group(1);

                        Matcher sMatcher = Pattern.compile("\"signatureTimestamp\":(\\d+)").matcher(html);
                        if (sMatcher.find()) sts = Integer.parseInt(sMatcher.group(1));
                    } catch (Exception ignored) {}

                    // 2. Call player API with VISIONOS client
                    URL pUrl = new URL("https://www.youtube.com/youtubei/v1/player?prettyPrint=false");
                    HttpURLConnection pConn = (HttpURLConnection) pUrl.openConnection();
                    pConn.setRequestMethod("POST");
                    pConn.setRequestProperty("Content-Type", "application/json");
                    pConn.setRequestProperty("X-YouTube-Client-Name", "101");
                    pConn.setRequestProperty("X-YouTube-Client-Version", "1.02");
                    pConn.setRequestProperty("Origin", "https://www.youtube.com");
                    pConn.setRequestProperty("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 15_7_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15");
                    if (!visitor.isEmpty()) {
                        pConn.setRequestProperty("X-Goog-Visitor-Id", visitor);
                    }
                    pConn.setDoOutput(true);
                    pConn.setConnectTimeout(8000);
                    pConn.setReadTimeout(12000);

                    JSONObject client = new JSONObject();
                    client.put("clientName", "VISIONOS");
                    client.put("clientVersion", "1.02");
                    client.put("deviceMake", "Apple");
                    client.put("deviceModel", "RealityDevice17,1");
                    client.put("userAgent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 15_7_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15");
                    client.put("osName", "visionOS");
                    client.put("osVersion", "26.5.23O471");
                    client.put("hl", "en");
                    client.put("timeZone", "UTC");
                    client.put("utcOffsetMinutes", 0);

                    JSONObject context = new JSONObject();
                    context.put("client", client);

                    JSONObject contentPlayback = new JSONObject();
                    contentPlayback.put("html5Preference", "HTML5_PREF_WANTS");
                    contentPlayback.put("signatureTimestamp", sts);

                    JSONObject playbackContext = new JSONObject();
                    playbackContext.put("contentPlaybackContext", contentPlayback);

                    JSONObject pPayload = new JSONObject();
                    pPayload.put("context", context);
                    pPayload.put("videoId", videoId);
                    pPayload.put("playbackContext", playbackContext);
                    pPayload.put("contentCheckOk", true);
                    pPayload.put("racyCheckOk", true);

                    byte[] pBytes = pPayload.toString().getBytes(StandardCharsets.UTF_8);
                    pConn.getOutputStream().write(pBytes);

                    int pCode = pConn.getResponseCode();
                    InputStream pIs = (pCode >= 200 && pCode < 300) ? pConn.getInputStream() : pConn.getErrorStream();
                    BufferedReader pReader = new BufferedReader(new InputStreamReader(pIs, StandardCharsets.UTF_8));
                    StringBuilder pSb = new StringBuilder();
                    String pLine;
                    while ((pLine = pReader.readLine()) != null) {
                        pSb.append(pLine);
                    }
                    pReader.close();

                    JSONObject resObj = new JSONObject(pSb.toString());
                    JSONObject streamingData = resObj.optJSONObject("streamingData");
                    if (streamingData != null) {
                        JSONArray adaptiveFormats = streamingData.optJSONArray("adaptiveFormats");
                        if (adaptiveFormats != null) {
                            String chosenUrl = null;
                            String chosenMime = "audio/mp4";
                            long chosenLength = 0;

                            for (int i = 0; i < adaptiveFormats.length(); i++) {
                                JSONObject f = adaptiveFormats.getJSONObject(i);
                                String mime = f.optString("mimeType", "");
                                String u = f.optString("url", "");
                                if (!u.isEmpty() && mime.startsWith("audio/")) {
                                    if (mime.contains("audio/mp4")) {
                                        chosenUrl = u;
                                        chosenMime = mime;
                                        chosenLength = f.optLong("contentLength", 0);
                                        break;
                                    } else if (chosenUrl == null) {
                                        chosenUrl = u;
                                        chosenMime = mime;
                                        chosenLength = f.optLong("contentLength", 0);
                                    }
                                }
                            }

                            if (chosenUrl != null) {
                                JSONObject okRes = new JSONObject();
                                okRes.put("success", true);
                                okRes.put("url", chosenUrl);
                                okRes.put("mimeType", chosenMime);
                                okRes.put("contentLength", chosenLength);
                                resultJson = okRes.toString();
                            }
                        }
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }

                final String finalJson = resultJson;
                runOnUiThread(() -> {
                    String safeId = callbackId.replaceAll("[^a-zA-Z0-9_]", "");
                    evaluateJs("window['__native_stream_" + safeId + "'] && window['__native_stream_" + safeId + "'](" + JSONObject.quote(finalJson) + ");");
                });
            }).start();
        }

        @JavascriptInterface
        public void nativeDownloadAudioAsync(final String videoId, final String streamUrl, final String callbackId) {
            new Thread(() -> {
                boolean success = false;
                long totalBytesDownloaded = 0;
                File targetFile = new File(getFilesDir(), "audio_" + videoId + ".m4a");

                try {
                    URL dUrl = new URL(streamUrl);
                    HttpURLConnection dConn = (HttpURLConnection) dUrl.openConnection();
                    dConn.setRequestMethod("GET");
                    dConn.setRequestProperty("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 15_7_3) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15");
                    dConn.setConnectTimeout(10000);
                    dConn.setReadTimeout(30000);

                    int respCode = dConn.getResponseCode();
                    if (respCode >= 200 && respCode < 300) {
                        long contentLength = dConn.getContentLengthLong();
                        if (contentLength <= 0) contentLength = 3500000;

                        InputStream in = dConn.getInputStream();
                        OutputStream out = new FileOutputStream(targetFile);
                        byte[] buffer = new byte[64 * 1024];
                        int bytesRead;
                        long lastReportTime = 0;

                        while ((bytesRead = in.read(buffer)) != -1) {
                            out.write(buffer, 0, bytesRead);
                            totalBytesDownloaded += bytesRead;

                            long now = System.currentTimeMillis();
                            if (now - lastReportTime > 300) {
                                lastReportTime = now;
                                int pct = (int) Math.min(99, (totalBytesDownloaded * 100) / contentLength);
                                runOnUiThread(() -> {
                                    evaluateJs("window.__native_dl_progress && window.__native_dl_progress('" + videoId + "', " + pct + ");");
                                });
                            }
                        }
                        out.flush();
                        out.close();
                        in.close();

                        if (targetFile.exists() && targetFile.length() > 50000) {
                            success = true;
                        }
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    if (targetFile.exists()) targetFile.delete();
                }

                final boolean finalSuccess = success;
                final long finalSize = targetFile.length();
                final String finalPath = targetFile.getAbsolutePath();

                runOnUiThread(() -> {
                    String safeId = callbackId.replaceAll("[^a-zA-Z0-9_]", "");
                    JSONObject res = new JSONObject();
                    try {
                        res.put("success", finalSuccess);
                        res.put("filePath", finalPath);
                        res.put("fileUrl", "file://" + finalPath);
                        res.put("size", finalSize);
                    } catch (Exception ignored) {}
                    evaluateJs("window['__native_dl_done_" + safeId + "'] && window['__native_dl_done_" + safeId + "'](" + JSONObject.quote(res.toString()) + ");");
                });
            }).start();
        }

        @JavascriptInterface
        public boolean nativeCheckAudioFile(String videoId) {
            File f = new File(getFilesDir(), "audio_" + videoId + ".m4a");
            return f.exists() && f.length() > 50000;
        }

        @JavascriptInterface
        public boolean nativeDeleteAudioFile(String videoId) {
            File f = new File(getFilesDir(), "audio_" + videoId + ".m4a");
            if (f.exists()) {
                return f.delete();
            }
            return false;
        }
    }
}

