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

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

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
    }
}
