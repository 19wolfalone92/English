package com.wolfie.english;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Base64;
import org.json.JSONObject;
import java.nio.charset.StandardCharsets;
import java.io.IOException;

/** Confirmed preference transactions, previous verified generation and non-destructive v1 migration. */
final class ProgressVault {
    private static final String CURRENT="progress_v2", PREVIOUS="progress_v2_previous", LEGACY="progress_v1";
    private final SharedPreferences prefs;
    private String status="empty";
    ProgressVault(Context context) { prefs=context.getSharedPreferences("wolfie_english",Context.MODE_PRIVATE); }
    synchronized String status() { return status; }
    private static String validJson(String value) throws Exception {
        if (value.getBytes(StandardCharsets.UTF_8).length>ProgressCodec.LIMIT) throw new IOException("Progress exceeds limit");
        new JSONObject(value); return value;
    }
    private static String decode(String encoded) throws Exception {
        if(encoded==null)return null;
        if(encoded.startsWith("v2:")){
            String[] parts=encoded.split(":",3);
            if(parts.length!=3||!parts[1].matches("[0-9a-f]{64}"))throw new IOException("Invalid progress envelope");
            if(parts[2].length()>7_000_000)throw new IOException("Compressed progress exceeds limit");
            return validJson(ProgressCodec.decode(Base64.decode(parts[2],Base64.NO_WRAP),parts[1]));
        }
        if(encoded.startsWith("gz:")){
            if(encoded.length()>7_000_000)throw new IOException("Legacy progress exceeds limit");
            return validJson(ProgressCodec.decode(Base64.decode(encoded.substring(3),Base64.NO_WRAP),null));
        }
        return validJson(encoded);
    }
    private static String tryDecode(String encoded) {
        try{return decode(encoded);}catch(Exception e){return null;}
    }
    private static String pack(String raw)throws Exception{
        return "v2:"+ProgressCodec.sha256(raw.getBytes(StandardCharsets.UTF_8))+":"+Base64.encodeToString(ProgressCodec.encode(raw),Base64.NO_WRAP);
    }
    synchronized String load(){
        String current=prefs.getString(CURRENT,null),previous=prefs.getString(PREVIOUS,null),legacy=prefs.getString(LEGACY,null);
        String raw=tryDecode(current);if(raw!=null){status="verified";return raw;}
        raw=tryDecode(previous);if(raw!=null){status="recovered-previous";return raw;}
        raw=tryDecode(legacy);if(raw!=null){status=current==null?"legacy":"recovered-legacy";return raw;}
        if(current==null&&previous==null&&legacy==null){status="empty";return "{}";}
        status="corrupt";return null;
    }
    synchronized boolean save(String raw,boolean explicitRestore){
        try{
            validJson(raw);
            String current=prefs.getString(CURRENT,null),previous=prefs.getString(PREVIOUS,null),legacy=prefs.getString(LEGACY,null);
            String old=tryDecode(current),prior=tryDecode(previous),v1=tryDecode(legacy);
            if(!explicitRestore&&old==null&&prior==null&&v1==null&&(current!=null||previous!=null||legacy!=null)){status="corrupt";return false;}
            boolean retry="write-failed".equals(status);
            if(raw.equals(old)&&!retry){status="verified";return true;}
            String envelope=pack(raw);
            SharedPreferences.Editor edit=prefs.edit().putString(CURRENT,envelope);
            if(old!=null&&!retry)edit.putString(PREVIOUS,pack(old));
            else if(prior==null&&v1!=null)edit.putString(PREVIOUS,pack(v1));
            if(!edit.commit()){status="write-failed";return false;}
            if(!raw.equals(tryDecode(prefs.getString(CURRENT,null)))){status="write-failed";return false;}
            status="verified";return true;
        }catch(Exception e){status="write-failed";return false;}
    }
}
