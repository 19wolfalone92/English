package com.wolfie.english;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.content.ActivityNotFoundException;
import android.speech.RecognizerIntent;
import org.json.JSONObject;
import java.util.ArrayList;
import android.graphics.Color;
import android.view.View;
import android.view.WindowInsets;
import android.speech.tts.TextToSpeech;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.IOException;
import android.net.Uri;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

/** Offline activity: bundled HTML, verified progress transactions and native TTS. */
public final class MainActivity extends Activity {
    private WebView webView;
    private ProgressVault progress;
    private String pendingBackup;
    private static final int EXPORT_REQUEST=1043, IMPORT_REQUEST=1044;
    private TextToSpeech tts;
    private volatile boolean ttsInitialized;
    private static final int SPEECH_REQUEST = 1042;
    private static final String LOCAL_URL = "file:///android_asset/index.html";

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        progress=new ProgressVault(getApplicationContext());
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
        webView.getSettings().setAllowFileAccess(false);
        webView.getSettings().setAllowContentAccess(false);
        webView.getSettings().setAllowFileAccessFromFileURLs(false);
        webView.getSettings().setAllowUniversalAccessFromFileURLs(false);
        webView.addJavascriptInterface(new Bridge(), "WolfieAndroid");
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
        @JavascriptInterface public String loadProgress() { return progress.load(); }
        @JavascriptInterface public String progressStatus() { return progress.status(); }
        @JavascriptInterface public void saveProgress(String data) { progress.save(data,false); }
        @JavascriptInterface public boolean saveProgressVerified(String data) { return progress.save(data,false); }
        @JavascriptInterface public boolean restoreProgress(String data) { return progress.save(data,true); }
        @JavascriptInterface public String progressHash(String data) {
            if(data==null)return "";
            byte[] raw=data.getBytes(StandardCharsets.UTF_8);
            return raw.length<=ProgressCodec.LIMIT?ProgressCodec.sha256(raw):"";
        }
        @JavascriptInterface public void exportProgress(String data) {
            if(data==null||data.getBytes(StandardCharsets.UTF_8).length>10_000_000){runOnUiThread(()->backupStatus("Backup too large"));return;}
            runOnUiThread(()->{
                pendingBackup=data;
                Intent intent=new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE)
                    .setType("application/json").putExtra(Intent.EXTRA_TITLE,"wolfie-progress.json");
                try{startActivityForResult(intent,EXPORT_REQUEST);}
                catch(ActivityNotFoundException e){pendingBackup=null;backupStatus("Document picker unavailable");}
            });
        }
        @JavascriptInterface public void importProgress() {
            runOnUiThread(()->{
                Intent intent=new Intent(Intent.ACTION_OPEN_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("*/*");
                try{startActivityForResult(intent,IMPORT_REQUEST);}
                catch(ActivityNotFoundException e){backupStatus("Document picker unavailable");}
            });
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
                voice.putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE,true);
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
        if (requestCode == EXPORT_REQUEST || requestCode == IMPORT_REQUEST) {
            if(resultCode!=RESULT_OK||data==null||data.getData()==null){pendingBackup=null;backupStatus("Cancelled");return;}
            Uri uri=data.getData();
            String snapshot=pendingBackup; pendingBackup=null;
            new Thread(()->{
                if(requestCode==EXPORT_REQUEST){
                    if(snapshot==null){runOnUiThread(()->backupStatus("Export interrupted; try again"));return;}
                    try(OutputStream output=getContentResolver().openOutputStream(uri,"wt")){
                        if(output==null)throw new IOException("No output");
                        output.write(snapshot.getBytes(StandardCharsets.UTF_8));output.flush();
                    }catch(Exception e){runOnUiThread(()->backupStatus("Export failed"));return;}
                    runOnUiThread(()->backupStatus("Export saved"));
                }else{
                    try(InputStream input=getContentResolver().openInputStream(uri)){
                        if(input==null)throw new IOException("No input");
                        byte[] bytes=ProgressCodec.readBounded(input,10_000_000);
                        String backup=new String(bytes,StandardCharsets.UTF_8);
                        if(!java.util.Arrays.equals(bytes,backup.getBytes(StandardCharsets.UTF_8)))throw new IOException("Invalid UTF-8");
                        runOnUiThread(()->backupToWeb(backup));
                    }catch(Exception e){runOnUiThread(()->backupStatus("Import failed or file too large"));}
                }
            },"wolfie-backup").start();
            return;
        }
        if (requestCode != SPEECH_REQUEST) return;
        String answer = "";
        if (resultCode == RESULT_OK && data != null) {
            ArrayList<String> phrases = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
            if (phrases != null && !phrases.isEmpty()) answer = phrases.get(0);
        }
        speechToWeb(answer);
    }

    private void backupStatus(String message) {
        if(webView!=null&&!isDestroyed())webView.evaluateJavascript("if(window.WOLFIE_BACKUP_STATUS){window.WOLFIE_BACKUP_STATUS("+JSONObject.quote(message)+");}",null);
    }
    private void backupToWeb(String data) {
        if(webView!=null&&!isDestroyed())webView.evaluateJavascript("if(window.WOLFIE_BACKUP_IMPORT){window.WOLFIE_BACKUP_IMPORT("+JSONObject.quote(data)+");}",null);
    }
    @Override protected void onDestroy() {
        if (webView != null) { webView.removeJavascriptInterface("WolfieAndroid"); webView.destroy(); webView=null; }
        if (tts != null) { tts.stop(); tts.shutdown(); }
        super.onDestroy();
    }
}
