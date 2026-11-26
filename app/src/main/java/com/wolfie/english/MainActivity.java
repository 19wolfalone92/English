package com.wolfie.english;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.content.ActivityNotFoundException;
import android.speech.RecognizerIntent;
import org.json.JSONObject;
import java.util.ArrayList;
import android.content.Context;
import android.graphics.Color;
import android.view.View;
import android.view.WindowInsets;
import android.speech.tts.TextToSpeech;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.util.Base64;
import java.io.ByteArrayOutputStream;
import java.io.ByteArrayInputStream;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

/** Offline activity: bundled HTML only, Android SharedPreferences for durable progress and native TTS. */
public final class MainActivity extends Activity {
    private WebView webView;
    private TextToSpeech tts;
    private volatile boolean ttsInitialized;
    private static final int SPEECH_REQUEST = 1042;
    private static final String LOCAL_URL = "file:///android_asset/index.html";

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        if (android.os.Build.VERSION.SDK_INT >= 30) {
            getWindow().setDecorFitsSystemWindows(false);
            getWindow().setStatusBarColor(Color.TRANSPARENT);
            getWindow().setNavigationBarColor(Color.TRANSPARENT);
            if (android.os.Build.VERSION.SDK_INT >= 29) {
                getWindow().setStatusBarContrastEnforced(false);
                getWindow().setNavigationBarContrastEnforced(false);
            }
        } else {
            getWindow().setStatusBarColor(Color.rgb(245, 248, 255));
            getWindow().setNavigationBarColor(Color.rgb(245, 248, 255));
        }
        setSystemBarIconMode(false);
        tts = new TextToSpeech(this, code -> {
            ttsInitialized = code == TextToSpeech.SUCCESS && tts != null;
            if (ttsInitialized) configureTts(Locale.US);
        });
        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(245, 248, 255));
        if (android.os.Build.VERSION.SDK_INT >= 30) {
            webView.setOnApplyWindowInsetsListener((view, insets) -> {
                android.graphics.Insets bars = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                android.graphics.Insets ime = insets.getInsets(WindowInsets.Type.ime());
                view.setPadding(bars.left, bars.top, bars.right, Math.max(bars.bottom, ime.bottom));
                return insets;
            });
        }
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

    private static Locale speechLocale(String languageTag) {
        Locale locale = Locale.forLanguageTag(languageTag == null ? "en-US" : languageTag);
        return "en".equals(locale.getLanguage()) ? locale : Locale.US;
    }

    private boolean configureTts(Locale locale) {
        if (!ttsInitialized || tts == null) return false;
        int available = tts.isLanguageAvailable(locale);
        if (available < TextToSpeech.LANG_AVAILABLE) return false;
        return tts.setLanguage(locale) >= TextToSpeech.LANG_AVAILABLE;
    }

    private void setSystemBarIconMode(boolean dark) {
        int flags = getWindow().getDecorView().getSystemUiVisibility();
        if (dark) {
            flags &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
            if (android.os.Build.VERSION.SDK_INT >= 26) flags &= ~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
        } else {
            flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
            if (android.os.Build.VERSION.SDK_INT >= 26) flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
        }
        getWindow().getDecorView().setSystemUiVisibility(flags);
    }

    private final class Bridge {
        private final Context context;
        Bridge(Context context) { this.context = context; }
        @JavascriptInterface public String loadProgress() {
            String data = context.getSharedPreferences("wolfie_english", Context.MODE_PRIVATE)
                .getString("progress_v1", "{}");
            if (!data.startsWith("gz:")) return data;
            try {
                byte[] zip = Base64.decode(data.substring(3), Base64.NO_WRAP);
                GZIPInputStream input = new GZIPInputStream(new ByteArrayInputStream(zip));
                ByteArrayOutputStream output = new ByteArrayOutputStream();
                byte[] buffer = new byte[4096]; int count;
                while ((count = input.read(buffer)) != -1) {
                    if (output.size() + count > 5000000) return "{}";
                    output.write(buffer, 0, count);
                }
                input.close();
                return new String(output.toByteArray(), StandardCharsets.UTF_8);
            } catch (Exception error) {
                android.util.Log.e("WolfieEnglish", "Could not decode saved progress", error);
                return "{}";
            }
        }
        @JavascriptInterface public void saveProgress(String data) {
            if (data == null || data.length() > 5000000) return;
            try {
                ByteArrayOutputStream output = new ByteArrayOutputStream();
                GZIPOutputStream gzip = new GZIPOutputStream(output);
                gzip.write(data.getBytes(StandardCharsets.UTF_8));
                gzip.close();
                String encoded = "gz:" + Base64.encodeToString(output.toByteArray(), Base64.NO_WRAP);
                context.getSharedPreferences("wolfie_english", Context.MODE_PRIVATE)
                    .edit().putString("progress_v1", encoded).apply();
            } catch (Exception error) {
                android.util.Log.e("WolfieEnglish", "Could not save progress", error);
            }
        }
        @JavascriptInterface public void setDarkMode(boolean dark) {
            runOnUiThread(() -> {
                setSystemBarIconMode(dark);
                int background = dark ? Color.rgb(12, 21, 37) : Color.rgb(245, 248, 255);
                webView.setBackgroundColor(background);
                if (android.os.Build.VERSION.SDK_INT < 30) {
                    getWindow().setStatusBarColor(background);
                    getWindow().setNavigationBarColor(background);
                }
            });
        }
        @JavascriptInterface public void speak(String text) { speakLocalized(text, "en-US"); }
        @JavascriptInterface public void speakLocalized(String text, String languageTag) {
            if (text == null || text.length() > 250 || !ttsInitialized || tts == null) return;
            Locale locale = speechLocale(languageTag);
            runOnUiThread(() -> {
                if (configureTts(locale)) tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "wolfie-speech");
            });
        }
        @JavascriptInterface public boolean isSpeechAvailable() { return isSpeechAvailableFor("en-US"); }
        @JavascriptInterface public boolean isSpeechAvailableFor(String languageTag) {
            if (!ttsInitialized || tts == null) return false;
            Locale locale = speechLocale(languageTag);
            int available = tts.isLanguageAvailable(locale);
            if (available < TextToSpeech.LANG_AVAILABLE) return false;
            return tts.setLanguage(locale) >= TextToSpeech.LANG_AVAILABLE;
        }
        @JavascriptInterface public void recognizeSpeech() { recognizeSpeechFor("en-US"); }
        @JavascriptInterface public void recognizeSpeechFor(String languageTag) {
            Locale locale = speechLocale(languageTag);
            runOnUiThread(() -> {
                Intent voice = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                voice.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                voice.putExtra(RecognizerIntent.EXTRA_LANGUAGE, locale.toLanguageTag());
                voice.putExtra(RecognizerIntent.EXTRA_PROMPT, "Say your English answer");
                try { startActivityForResult(voice, SPEECH_REQUEST); }
                catch (ActivityNotFoundException error) { speechToWeb(""); }
            });
        }
    }

    private void speechToWeb(String text) {
        if (webView != null) webView.evaluateJavascript("if(window.WOLFIE_SPEECH_CALLBACK){window.WOLFIE_SPEECH_CALLBACK("+JSONObject.quote(text)+");}", null);
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode != SPEECH_REQUEST) return;
        String answer = "";
        if (resultCode == RESULT_OK && data != null) {
            ArrayList<String> phrases = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
            if (phrases != null && !phrases.isEmpty()) answer = phrases.get(0);
        }
        speechToWeb(answer);
    }

    @Override protected void onDestroy() {
        if (webView != null) { webView.removeJavascriptInterface("WolfieAndroid"); webView.destroy(); }
        if (tts != null) { tts.stop(); tts.shutdown(); }
        super.onDestroy();
    }
}
