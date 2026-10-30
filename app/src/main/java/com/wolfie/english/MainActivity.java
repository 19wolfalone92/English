package com.wolfie.english;

import android.app.Activity;
import android.os.Bundle;
import android.content.Context;
import android.graphics.Color;
import android.view.View;
import android.speech.tts.TextToSpeech;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.util.Locale;

/** Offline activity: bundled HTML only, Android SharedPreferences for durable progress and native TTS. */
public final class MainActivity extends Activity {
    private WebView webView;
    private TextToSpeech tts;
    private volatile boolean ttsReady;
    private static final String LOCAL_URL = "file:///android_asset/index.html";

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(Color.rgb(245, 248, 255));
        getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
        getWindow().setNavigationBarColor(Color.rgb(245, 248, 255));
        if (android.os.Build.VERSION.SDK_INT >= 26) {
            getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
        }
        tts = new TextToSpeech(this, code -> {
            if (code == TextToSpeech.SUCCESS && tts != null) {
                ttsReady = tts.setLanguage(Locale.US) != TextToSpeech.LANG_MISSING_DATA;
            }
        });
        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(245, 248, 255));
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setAllowFileAccess(true);
        webView.getSettings().setAllowFileAccessFromFileURLs(false);
        webView.getSettings().setAllowUniversalAccessFromFileURLs(false);
        webView.addJavascriptInterface(new Bridge(getApplicationContext()), "WolfieAndroid");
        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return !LOCAL_URL.equals(request.getUrl().toString());
            }
        });
        setContentView(webView);
        webView.loadUrl(LOCAL_URL);
    }

    private final class Bridge {
        private final Context context;
        Bridge(Context context) { this.context = context; }
        @JavascriptInterface public String loadProgress() {
            return context.getSharedPreferences("wolfie_english", Context.MODE_PRIVATE)
                .getString("progress_v1", "{}");
        }
        @JavascriptInterface public void saveProgress(String data) {
            if (data == null || data.length() > 500000) return;
            context.getSharedPreferences("wolfie_english", Context.MODE_PRIVATE)
                .edit().putString("progress_v1", data).apply();
        }
        @JavascriptInterface public void speak(String text) {
            if (text == null || text.length() > 250 || !ttsReady || tts == null) return;
            runOnUiThread(() -> tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "wolfie-speech"));
        }
        @JavascriptInterface public boolean isSpeechAvailable() { return ttsReady; }
    }

    @Override protected void onDestroy() {
        if (webView != null) { webView.removeJavascriptInterface("WolfieAndroid"); webView.destroy(); }
        if (tts != null) { tts.stop(); tts.shutdown(); }
        super.onDestroy();
    }
}
