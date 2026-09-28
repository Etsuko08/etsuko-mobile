package com.etsuko.music;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.media.MediaMetadata;
import android.media.session.MediaSession;
import android.media.session.PlaybackState;
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
    private static final String CHANNEL_ID = "etsuko_playback_channel";
    private static final int NOTIFICATION_ID = 1001;

    public static final String ACTION_PREV = "com.etsuko.music.ACTION_PREV";
    public static final String ACTION_PLAY_PAUSE = "com.etsuko.music.ACTION_PLAY_PAUSE";
    public static final String ACTION_NEXT = "com.etsuko.music.ACTION_NEXT";

    private NotificationManager notificationManager;
    private MediaSession mediaSession;
    private PowerManager.WakeLock wakeLock;
    private boolean isMediaPlaying = false;
    private BroadcastReceiver mediaButtonReceiver;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        initWakeLock();
        initNotificationChannel();
        initMediaSession();
        registerMediaReceiver();
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
                if (bridge != null && bridge.getWebView() != null) {
                    bridge.getWebView().evaluateJavascript("window.handleHardwareBack && window.handleHardwareBack();", null);
                }
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
                wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "Etsuko::MediaPlaybackWakeLock");
                wakeLock.setReferenceCounted(false);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void initNotificationChannel() {
        notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Etsuko Music Playback",
                    NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Background audio controls and notifications");
            channel.setShowBadge(false);
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);

            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }
    }

    private void initMediaSession() {
        mediaSession = new MediaSession(this, "EtsukoMediaSession");
        mediaSession.setFlags(MediaSession.FLAG_HANDLES_MEDIA_BUTTONS | MediaSession.FLAG_HANDLES_TRANSPORT_CONTROLS);
        mediaSession.setCallback(new MediaSession.Callback() {
            @Override
            public void onPlay() {
                handleAction(ACTION_PLAY_PAUSE);
            }

            @Override
            public void onPause() {
                handleAction(ACTION_PLAY_PAUSE);
            }

            @Override
            public void onSkipToNext() {
                handleAction(ACTION_NEXT);
            }

            @Override
            public void onSkipToPrevious() {
                handleAction(ACTION_PREV);
            }

            @Override
            public void onSeekTo(long pos) {
                runOnUiThread(() -> {
                    if (bridge != null && bridge.getWebView() != null) {
                        bridge.getWebView().evaluateJavascript("window.player && window.player.seekToMs(" + pos + ");", null);
                    }
                });
            }
        });
        mediaSession.setActive(true);
    }

    private void registerMediaReceiver() {
        mediaButtonReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (intent != null && intent.getAction() != null) {
                    handleAction(intent.getAction());
                }
            }
        };

        IntentFilter filter = new IntentFilter();
        filter.addAction(ACTION_PREV);
        filter.addAction(ACTION_PLAY_PAUSE);
        filter.addAction(ACTION_NEXT);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(mediaButtonReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(mediaButtonReceiver, filter);
        }
    }

    private void handleAction(String action) {
        runOnUiThread(() -> {
            if (bridge == null || bridge.getWebView() == null) return;
            try {
                bridge.getWebView().onResume();
                bridge.getWebView().resumeTimers();
            } catch (Exception ignored) {}
            switch (action) {
                case ACTION_PLAY_PAUSE:
                    bridge.getWebView().evaluateJavascript("window.player && window.player.togglePlay();", null);
                    break;
                case ACTION_NEXT:
                    bridge.getWebView().evaluateJavascript("window.player && window.player.next();", null);
                    break;
                case ACTION_PREV:
                    bridge.getWebView().evaluateJavascript("window.player && window.player.prev();", null);
                    break;
            }
        });
    }

    public void updateNotification(String title, String artist, String album, String thumbUrl, boolean isPlaying, long positionMs, long durationMs) {
        this.isMediaPlaying = isPlaying;

        if (isPlaying) {
            if (wakeLock != null && !wakeLock.isHeld()) {
                wakeLock.acquire();
            }
        } else {
            if (wakeLock != null && wakeLock.isHeld()) {
                wakeLock.release();
            }
        }

        // Update MediaSession state with real position & seek support
        int state = isPlaying ? PlaybackState.STATE_PLAYING : PlaybackState.STATE_PAUSED;
        long actions = PlaybackState.ACTION_PLAY | PlaybackState.ACTION_PAUSE |
                PlaybackState.ACTION_PLAY_PAUSE | PlaybackState.ACTION_SKIP_TO_NEXT |
                PlaybackState.ACTION_SKIP_TO_PREVIOUS | PlaybackState.ACTION_SEEK_TO;

        if (mediaSession != null) {
            mediaSession.setPlaybackState(new PlaybackState.Builder()
                    .setActions(actions)
                    .setState(state, positionMs >= 0 ? positionMs : 0, 1.0f)
                    .build());
        }

        // Run background thread for artwork loading
        new Thread(() -> {
            Bitmap coverBitmap = null;
            if (thumbUrl != null && !thumbUrl.isEmpty() && thumbUrl.startsWith("http")) {
                try {
                    URL url = new URL(thumbUrl);
                    HttpURLConnection connection = (HttpURLConnection) url.openConnection();
                    connection.setDoInput(true);
                    connection.setConnectTimeout(4000);
                    connection.setReadTimeout(4000);
                    connection.connect();
                    InputStream input = connection.getInputStream();
                    coverBitmap = BitmapFactory.decodeStream(input);
                } catch (Exception ignored) {}
            }

            if (coverBitmap == null) {
                coverBitmap = BitmapFactory.decodeResource(getResources(), R.mipmap.ic_launcher);
            }

            final Bitmap finalCover = coverBitmap;
            runOnUiThread(() -> buildAndPostNotification(title, artist, album, finalCover, isPlaying, durationMs));
        }).start();
    }

    private void buildAndPostNotification(String title, String artist, String album, Bitmap cover, boolean isPlaying, long durationMs) {
        int flag = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flag |= PendingIntent.FLAG_IMMUTABLE;
        }

        Intent openAppIntent = new Intent(this, MainActivity.class);
        openAppIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent contentIntent = PendingIntent.getActivity(this, 0, openAppIntent, flag);

        Intent prevIntent = new Intent(ACTION_PREV);
        PendingIntent pPrev = PendingIntent.getBroadcast(this, 1, prevIntent, flag);

        Intent playIntent = new Intent(ACTION_PLAY_PAUSE);
        PendingIntent pPlay = PendingIntent.getBroadcast(this, 2, playIntent, flag);

        Intent nextIntent = new Intent(ACTION_NEXT);
        PendingIntent pNext = PendingIntent.getBroadcast(this, 3, nextIntent, flag);

        int playPauseIcon = isPlaying ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play;
        String playPauseTitle = isPlaying ? "Pause" : "Play";

        // Update MediaSession metadata for Android Quick Settings and Lockscreen Spotify-style player
        if (mediaSession != null) {
            try {
                MediaMetadata.Builder metaBuilder = new MediaMetadata.Builder()
                        .putString(MediaMetadata.METADATA_KEY_TITLE, title != null && !title.isEmpty() ? title : "Etsuko Music")
                        .putString(MediaMetadata.METADATA_KEY_ARTIST, artist != null && !artist.isEmpty() ? artist : "Playing")
                        .putString(MediaMetadata.METADATA_KEY_ALBUM, album != null && !album.isEmpty() ? album : "Etsuko Neural Audio");
                if (durationMs > 0) {
                    metaBuilder.putLong(MediaMetadata.METADATA_KEY_DURATION, durationMs);
                }
                if (cover != null) {
                    metaBuilder.putBitmap(MediaMetadata.METADATA_KEY_ALBUM_ART, cover);
                    metaBuilder.putBitmap(MediaMetadata.METADATA_KEY_ART, cover);
                }
                mediaSession.setMetadata(metaBuilder.build());
            } catch (Exception ignored) {}
        }

        Notification.Builder builder;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            builder = new Notification.Builder(this, CHANNEL_ID);
        } else {
            builder = new Notification.Builder(this);
        }

        Notification.MediaStyle mediaStyle = new Notification.MediaStyle();
        if (mediaSession != null) {
            mediaStyle.setMediaSession(mediaSession.getSessionToken());
        }
        mediaStyle.setShowActionsInCompactView(0, 1, 2);

        Notification notification = builder
                .setSmallIcon(R.drawable.ic_stat_music)
                .setLargeIcon(cover)
                .setContentTitle(title != null && !title.isEmpty() ? title : "Etsuko Music")
                .setContentText(artist != null && !artist.isEmpty() ? artist : "Playing")
                .setSubText(album != null && !album.isEmpty() ? album : "Etsuko Neural Audio")
                .setContentIntent(contentIntent)
                .setOngoing(isPlaying)
                .setVisibility(Notification.VISIBILITY_PUBLIC)
                .addAction(android.R.drawable.ic_media_previous, "Previous", pPrev)
                .addAction(playPauseIcon, playPauseTitle, pPlay)
                .addAction(android.R.drawable.ic_media_next, "Next", pNext)
                .setStyle(mediaStyle)
                .build();

        if (notificationManager != null) {
            notificationManager.notify(NOTIFICATION_ID, notification);
        }
    }

    public void cancelNotification() {
        this.isMediaPlaying = false;
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
        }
        if (notificationManager != null) {
            notificationManager.cancel(NOTIFICATION_ID);
        }
        if (mediaSession != null) {
            mediaSession.setActive(false);
        }
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
        if (mediaButtonReceiver != null) {
            try {
                unregisterReceiver(mediaButtonReceiver);
            } catch (Exception ignored) {}
        }
        cancelNotification();
        if (mediaSession != null) {
            mediaSession.release();
        }
        super.onDestroy();
    }

    @Override
    public void onBackPressed() {
        if (bridge != null && bridge.getWebView() != null) {
            bridge.getWebView().evaluateJavascript("window.handleHardwareBack && window.handleHardwareBack();", null);
            return;
        }
        super.onBackPressed();
    }

    // JavaScript Bridge exposed as `window.AndroidMedia`
    public class AndroidMediaBridge {
        @JavascriptInterface
        public void updatePlaybackState(String title, String artist, String album, String thumbUrl, boolean isPlaying) {
            runOnUiThread(() -> updateNotification(title, artist, album, thumbUrl, isPlaying, 0, 0));
        }

        @JavascriptInterface
        public void updatePlaybackState(String title, String artist, String album, String thumbUrl, boolean isPlaying, double positionSec, double durationSec) {
            long posMs = (long) (positionSec * 1000);
            long durMs = (long) (durationSec * 1000);
            runOnUiThread(() -> updateNotification(title, artist, album, thumbUrl, isPlaying, posMs, durMs));
        }

        @JavascriptInterface
        public void updateProgress(double positionSec, double durationSec, boolean isPlaying) {
            if (mediaSession == null) return;
            long posMs = (long) (positionSec * 1000);
            int state = isPlaying ? PlaybackState.STATE_PLAYING : PlaybackState.STATE_PAUSED;
            long actions = PlaybackState.ACTION_PLAY | PlaybackState.ACTION_PAUSE |
                    PlaybackState.ACTION_PLAY_PAUSE | PlaybackState.ACTION_SKIP_TO_NEXT |
                    PlaybackState.ACTION_SKIP_TO_PREVIOUS | PlaybackState.ACTION_SEEK_TO;
            runOnUiThread(() -> {
                try {
                    mediaSession.setPlaybackState(new PlaybackState.Builder()
                            .setActions(actions)
                            .setState(state, posMs >= 0 ? posMs : 0, 1.0f)
                            .build());
                } catch (Exception ignored) {}
            });
        }

        @JavascriptInterface
        public void stopPlayback() {
            runOnUiThread(() -> cancelNotification());
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
                    if (bridge != null && bridge.getWebView() != null) {
                        String safeId = callbackId.replaceAll("[^a-zA-Z0-9_]", "");
                        bridge.getWebView().evaluateJavascript(
                            "window['__native_search_" + safeId + "'] && window['__native_search_" + safeId + "'](" + JSONObject.quote(finalJson) + ");",
                            null
                        );
                    }
                });
            }).start();
        }
    }
}
