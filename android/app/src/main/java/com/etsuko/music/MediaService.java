package com.etsuko.music;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.media.MediaMetadata;
import android.media.session.MediaSession;
import android.media.session.PlaybackState;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;

import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class MediaService extends Service {
    public static final String CHANNEL_ID = "etsuko_playback_channel";
    public static final int NOTIFICATION_ID = 1001;

    public static final String ACTION_UPDATE = "com.etsuko.music.ACTION_UPDATE";
    public static final String ACTION_STOP = "com.etsuko.music.ACTION_STOP";
    public static final String ACTION_PREV = "com.etsuko.music.ACTION_PREV";
    public static final String ACTION_PLAY_PAUSE = "com.etsuko.music.ACTION_PLAY_PAUSE";
    public static final String ACTION_NEXT = "com.etsuko.music.ACTION_NEXT";

    private NotificationManager notificationManager;
    private MediaSession mediaSession;
    private PowerManager.WakeLock wakeLock;

    private boolean isPlaying = false;
    private String currentTitle = "Etsuko Music";
    private String currentArtist = "Playing";
    private String currentAlbum = "Etsuko Neural Audio";
    private String currentThumbUrl = "";
    private Bitmap currentCover = null;
    private long currentPosMs = 0;
    private long currentDurMs = 0;

    @Override
    public void onCreate() {
        super.onCreate();
        initWakeLock();
        initNotificationChannel();
        initMediaSession();
    }

    private void initWakeLock() {
        try {
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (pm != null) {
                wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "Etsuko::MediaServiceWakeLock");
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
                dispatchAction(ACTION_PLAY_PAUSE);
            }

            @Override
            public void onPause() {
                dispatchAction(ACTION_PLAY_PAUSE);
            }

            @Override
            public void onSkipToNext() {
                dispatchAction(ACTION_NEXT);
            }

            @Override
            public void onSkipToPrevious() {
                dispatchAction(ACTION_PREV);
            }

            @Override
            public void onSeekTo(long pos) {
                if (MainActivity.getInstance() != null) {
                    MainActivity.getInstance().evaluateJs("window.player && window.player.seekToMs(" + pos + ");");
                }
            }
        });
        mediaSession.setActive(true);
    }

    private void dispatchAction(String action) {
        if (MainActivity.getInstance() == null) return;
        switch (action) {
            case ACTION_PLAY_PAUSE:
                MainActivity.getInstance().evaluateJs("window.player && window.player.togglePlay();");
                break;
            case ACTION_NEXT:
                MainActivity.getInstance().evaluateJs("window.player && window.player.next();");
                break;
            case ACTION_PREV:
                MainActivity.getInstance().evaluateJs("window.player && window.player.prev();");
                break;
        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && intent.getAction() != null) {
            String action = intent.getAction();
            if (ACTION_STOP.equals(action)) {
                stopPlaybackService();
                return START_NOT_STICKY;
            } else if (ACTION_PREV.equals(action) || ACTION_PLAY_PAUSE.equals(action) || ACTION_NEXT.equals(action)) {
                dispatchAction(action);
            } else if (ACTION_UPDATE.equals(action)) {
                String title = intent.getStringExtra("title");
                String artist = intent.getStringExtra("artist");
                String album = intent.getStringExtra("album");
                String thumbUrl = intent.getStringExtra("thumbUrl");
                boolean playing = intent.getBooleanExtra("isPlaying", false);
                long pos = intent.getLongExtra("posMs", 0);
                long dur = intent.getLongExtra("durMs", 0);

                updatePlayback(title, artist, album, thumbUrl, playing, pos, dur);
            }
        }
        return START_STICKY;
    }

    private void updatePlayback(String title, String artist, String album, String thumbUrl, boolean playing, long posMs, long durMs) {
        this.currentTitle = (title != null && !title.isEmpty()) ? title : "Etsuko Music";
        this.currentArtist = (artist != null && !artist.isEmpty()) ? artist : "Playing";
        this.currentAlbum = (album != null && !album.isEmpty()) ? album : "Etsuko Neural Audio";
        this.isPlaying = playing;
        this.currentPosMs = posMs;
        this.currentDurMs = durMs;

        if (playing) {
            if (wakeLock != null && !wakeLock.isHeld()) {
                wakeLock.acquire();
            }
        } else {
            if (wakeLock != null && wakeLock.isHeld()) {
                wakeLock.release();
            }
        }

        // Update MediaSession state
        int state = playing ? PlaybackState.STATE_PLAYING : PlaybackState.STATE_PAUSED;
        long actions = PlaybackState.ACTION_PLAY | PlaybackState.ACTION_PAUSE |
                PlaybackState.ACTION_PLAY_PAUSE | PlaybackState.ACTION_SKIP_TO_NEXT |
                PlaybackState.ACTION_SKIP_TO_PREVIOUS | PlaybackState.ACTION_SEEK_TO;

        if (mediaSession != null) {
            mediaSession.setPlaybackState(new PlaybackState.Builder()
                    .setActions(actions)
                    .setState(state, posMs >= 0 ? posMs : 0, 1.0f)
                    .build());
        }

        // If thumbnail changed, fetch in background thread
        if (thumbUrl != null && !thumbUrl.equals(this.currentThumbUrl)) {
            this.currentThumbUrl = thumbUrl;
            new Thread(() -> {
                Bitmap bmp = null;
                if (thumbUrl.startsWith("http")) {
                    try {
                        URL url = new URL(thumbUrl);
                        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                        conn.setDoInput(true);
                        conn.setConnectTimeout(4000);
                        conn.setReadTimeout(4000);
                        conn.connect();
                        InputStream is = conn.getInputStream();
                        bmp = BitmapFactory.decodeStream(is);
                    } catch (Exception ignored) {}
                }
                if (bmp == null) {
                    bmp = BitmapFactory.decodeResource(getResources(), R.mipmap.ic_launcher);
                }
                this.currentCover = getSquareCropBitmap(bmp);
                postForegroundNotification();
            }).start();
        } else {
            if (this.currentCover == null) {
                this.currentCover = getSquareCropBitmap(BitmapFactory.decodeResource(getResources(), R.mipmap.ic_launcher));
            }
            postForegroundNotification();
        }
    }

    private Bitmap getSquareCropBitmap(Bitmap src) {
        if (src == null) return null;
        int width = src.getWidth();
        int height = src.getHeight();
        if (width == height) return src;
        int newDim = Math.min(width, height);
        int cropX = (width - newDim) / 2;
        int cropY = (height - newDim) / 2;
        try {
            return Bitmap.createBitmap(src, cropX, cropY, newDim, newDim);
        } catch (Exception e) {
            return src;
        }
    }

    private void postForegroundNotification() {
        int flag = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flag |= PendingIntent.FLAG_IMMUTABLE;
        }

        Intent openIntent = new Intent(this, MainActivity.class);
        openIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pOpen = PendingIntent.getActivity(this, 0, openIntent, flag);

        Intent prevIntent = new Intent(this, MediaService.class);
        prevIntent.setAction(ACTION_PREV);
        PendingIntent pPrev = PendingIntent.getService(this, 1, prevIntent, flag);

        Intent playIntent = new Intent(this, MediaService.class);
        playIntent.setAction(ACTION_PLAY_PAUSE);
        PendingIntent pPlay = PendingIntent.getService(this, 2, playIntent, flag);

        Intent nextIntent = new Intent(this, MediaService.class);
        nextIntent.setAction(ACTION_NEXT);
        PendingIntent pNext = PendingIntent.getService(this, 3, nextIntent, flag);

        int playPauseIcon = isPlaying ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play;
        String playPauseTitle = isPlaying ? "Pause" : "Play";

        if (mediaSession != null) {
            try {
                MediaMetadata.Builder metaBuilder = new MediaMetadata.Builder()
                        .putString(MediaMetadata.METADATA_KEY_TITLE, currentTitle)
                        .putString(MediaMetadata.METADATA_KEY_ARTIST, currentArtist)
                        .putString(MediaMetadata.METADATA_KEY_ALBUM, currentAlbum);
                if (currentDurMs > 0) {
                    metaBuilder.putLong(MediaMetadata.METADATA_KEY_DURATION, currentDurMs);
                }
                if (currentCover != null) {
                    metaBuilder.putBitmap(MediaMetadata.METADATA_KEY_ALBUM_ART, currentCover);
                    metaBuilder.putBitmap(MediaMetadata.METADATA_KEY_ART, currentCover);
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
                .setLargeIcon(currentCover)
                .setContentTitle(currentTitle)
                .setContentText(currentArtist)
                .setSubText(currentAlbum)
                .setContentIntent(pOpen)
                .setOngoing(isPlaying)
                .setVisibility(Notification.VISIBILITY_PUBLIC)
                .addAction(android.R.drawable.ic_media_previous, "Previous", pPrev)
                .addAction(playPauseIcon, playPauseTitle, pPlay)
                .addAction(android.R.drawable.ic_media_next, "Next", pNext)
                .setStyle(mediaStyle)
                .build();

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
            } else {
                startForeground(NOTIFICATION_ID, notification);
            }
        } catch (Exception e) {
            e.printStackTrace();
            if (notificationManager != null) {
                notificationManager.notify(NOTIFICATION_ID, notification);
            }
        }
    }

    private void stopPlaybackService() {
        this.isPlaying = false;
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            stopForeground(STOP_FOREGROUND_REMOVE);
        } else {
            stopForeground(true);
        }
        if (notificationManager != null) {
            notificationManager.cancel(NOTIFICATION_ID);
        }
        if (mediaSession != null) {
            mediaSession.setActive(false);
        }
        stopSelf();
    }

    @Override
    public void onDestroy() {
        stopPlaybackService();
        if (mediaSession != null) {
            mediaSession.release();
        }
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
