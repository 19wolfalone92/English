package com.wolfie.english;

import android.content.Context;
import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import org.junit.Test;
import org.junit.runner.RunWith;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import static org.junit.Assert.*;

/** Runs only on an isolated CI emulator, never on a user's installation. */
@RunWith(AndroidJUnit4.class)
public class UpgradeQualificationTest {
 private static final String SEED="{\"schemaVersion\":2,\"items\":{\"mission-v2-002-w-1\":{\"stage\":2,\"due\":1795780800000}},\"finished\":{\"course-001\":{\"done\":true,\"best\":8}},\"xp\":37,\"attempts\":10,\"correct\":8,\"days\":{},\"study\":{},\"settings\":{\"theme\":\"dark\"},\"contextLessons\":{\"mission-v2-002\":{\"version\":1,\"tab\":\"writing\",\"answers\":{},\"drafts\":{\"w0\":\"My breakfast draft — проверка\"},\"checks\":{}}},\"studio\":{\"saved\":{},\"corrections\":{},\"charts\":{},\"draft\":\"My personal note\",\"versions\":[]}}";
 private Context ctx(){return InstrumentationRegistry.getInstrumentation().getTargetContext();}
 private int version()throws Exception{return ctx().getPackageManager().getPackageInfo(ctx().getPackageName(),0).versionCode;}
 private static WebView web(View v){if(v instanceof WebView)return (WebView)v;if(v instanceof ViewGroup){ViewGroup g=(ViewGroup)v;for(int i=0;i<g.getChildCount();i++){WebView w=web(g.getChildAt(i));if(w!=null)return w;}}return null;}
 private static String js(ActivityScenario<MainActivity> s,String code)throws Exception{AtomicReference<String> r=new AtomicReference<>();CountDownLatch l=new CountDownLatch(1);s.onActivity(a->{WebView w=web(a.findViewById(android.R.id.content));assertNotNull(w);w.evaluateJavascript(code,v->{r.set(v);l.countDown();});});assertTrue(l.await(10,TimeUnit.SECONDS));return r.get();}
 private void verifyUi()throws Exception{
  try(ActivityScenario<MainActivity> s=ActivityScenario.launch(MainActivity.class)){
   boolean ready=false;for(int i=0;i<40;i++){if("true".equals(js(s,"Boolean(document.querySelector('#home-course-progress')?.textContent==='1/300' && document.documentElement.dataset.theme==='dark' && document.querySelector('#xp')?.textContent.includes('37'))"))){ready=true;break;}Thread.sleep(250);}
   assertTrue("Restored progress is displayed in the actual WebView",ready);
   assertEquals("true",js(s,"Boolean(JSON.parse(WolfieAndroid.loadProgress()).contextLessons['mission-v2-002'].drafts.w0==='My breakfast draft — проверка')"));
  }
 }
 @Test public void seedOld()throws Exception{assertEquals(22,version());ProgressVault v=new ProgressVault(ctx());assertTrue(v.save(SEED,false));assertEquals(SEED,v.load());verifyUi();}
 private void verifyFields(String raw)throws Exception{
  org.json.JSONObject expected=new org.json.JSONObject(SEED),actual=new org.json.JSONObject(raw);
  java.util.Iterator<String> keys=expected.keys();while(keys.hasNext()){String k=keys.next();assertEquals("Preserved field "+k,expected.get(k).toString(),actual.get(k).toString());}
 }
 @Test public void verifyNew()throws Exception{assertEquals(23,version());verifyFields(new ProgressVault(ctx()).load());verifyUi();verifyFields(new ProgressVault(ctx()).load());}
}
