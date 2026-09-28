package com.etsuko.music;

import android.content.Context;
import android.util.AttributeSet;
import android.view.View;
import com.getcapacitor.CapacitorWebView;

public class BackgroundAudioWebView extends CapacitorWebView {

    public BackgroundAudioWebView(Context context, AttributeSet attrs) {
        super(context, attrs);
    }

    @Override
    protected void onWindowVisibilityChanged(int visibility) {
        // Intercept Android OS GONE/INVISIBLE and force View.VISIBLE
        // This ensures Chromium never halts video/audio streams or timers in background!
        super.onWindowVisibilityChanged(View.VISIBLE);
    }

    @Override
    public void dispatchWindowVisibilityChanged(int visibility) {
        super.dispatchWindowVisibilityChanged(View.VISIBLE);
    }

    @Override
    protected void onVisibilityChanged(View changedView, int visibility) {
        super.onVisibilityChanged(changedView, View.VISIBLE);
    }

    @Override
    public void pauseTimers() {
        // Prevent Capacitor / Cordova from freezing JavaScript timers when backgrounded
    }

    @Override
    public void onPause() {
        // Prevent Chromium from freezing HTML5 media decoders
    }
}
