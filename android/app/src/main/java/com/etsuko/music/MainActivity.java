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

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

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

    public void updateNotification(String title, String artist, String album, String thumbUrl, boolean isPlaying) {
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

        // Update MediaSession state
        int state = isPlaying ? PlaybackState.STATE_PLAYING : PlaybackState.STATE_PAUSED;
        long actions = PlaybackState.ACTION_PLAY | PlaybackState.ACTION_PAUSE |
                PlaybackState.ACTION_SKIP_TO_NEXT | PlaybackState.ACTION_SKIP_TO_PREVIOUS;

        mediaSession.setPlaybackState(new PlaybackState.Builder()
                .setActions(actions)
                .setState(state, PlaybackState.PLAYBACK_POSITION_UNKNOWN, 1.0f)
                .build());

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
            runOnUiThread(() -> buildAndPostNotification(title, artist, album, finalCover, isPlaying));
        }).start();
    }

    private void buildAndPostNotification(String title, String artist, String album, Bitmap cover, boolean isPlaying) {
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

        // Update MediaSession metadata for Android 11+ quick settings and lockscreen media player
        if (mediaSession != null) {
            try {
                MediaMetadata.Builder metaBuilder = new MediaMetadata.Builder()
                        .putString(MediaMetadata.METADATA_KEY_TITLE, title != null && !title.isEmpty() ? title : "Etsuko Music")
                        .putString(MediaMetadata.METADATA_KEY_ARTIST, artist != null && !artist.isEmpty() ? artist : "Playing")
                        .putString(MediaMetadata.METADATA_KEY_ALBUM, album != null && !album.isEmpty() ? album : "Etsuko Neural Audio");
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
                .setSmallIcon(R.mipmap.ic_launcher)
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
        if (isMediaPlaying && bridge != null && bridge.getWebView() != null) {
            bridge.getWebView().resumeTimers();
        }
    }

    @Override
    public void onStop() {
        super.onStop();
        if (isMediaPlaying && bridge != null && bridge.getWebView() != null) {
            bridge.getWebView().resumeTimers();
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
            runOnUiThread(() -> updateNotification(title, artist, album, thumbUrl, isPlaying));
        }

        @JavascriptInterface
        public void stopPlayback() {
            runOnUiThread(() -> cancelNotification());
        }
    }
}
