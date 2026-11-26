package com.wolfie.english;
import android.content.Context;
import android.content.SharedPreferences;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebView;
import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import static org.junit.Assert.*;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

@RunWith(AndroidJUnit4.class)
public class DeviceQualificationTest {
 private Context context;
 private SharedPreferences prefs;
 @Before public void setup(){
  context=InstrumentationRegistry.getInstrumentation().getTargetContext();
  prefs=context.getSharedPreferences("wolfie_english",Context.MODE_PRIVATE);
  assertTrue(prefs.edit().clear().commit());
 }
 @Test public void actualAndroidVaultMigratesAndRecovers(){
  String old="{\"items\":{\"word-a\":{\"stage\":2,\"due\":1795780800000}},\"finished\":{},\"study\":{},\"settings\":{\"theme\":\"dark\"}}";
  assertTrue(prefs.edit().putString("progress_v1",old).commit());
  ProgressVault vault=new ProgressVault(context);
  assertEquals(old,vault.load());assertEquals("legacy",vault.status());
  String next="{\"schemaVersion\":2,\"items\":{},\"study\":{\"course-001\":{\"answers\":{\"essay\":\"Русский текст\"}}}}";
  assertTrue(vault.save(next,false));assertEquals(next,new ProgressVault(context).load());
  assertTrue(prefs.edit().putString("progress_v2","v2:bad").commit());
  ProgressVault recovery=new ProgressVault(context);
  assertEquals(old,recovery.load());assertEquals("recovered-previous",recovery.status());
  assertTrue(recovery.save(next,false));assertEquals(next,new ProgressVault(context).load());
  assertTrue(prefs.edit().putString("progress_v2","broken").putString("progress_v2_previous","broken").putString("progress_v1","broken").commit());
  ProgressVault corrupt=new ProgressVault(context);
  assertNull(corrupt.load());assertFalse(corrupt.save("{}",false));
  assertEquals("broken",prefs.getString("progress_v2",null));
  assertTrue(corrupt.save(next,true));assertEquals(next,new ProgressVault(context).load());
 }
 private static WebView web(View view){
  if(view instanceof WebView)return (WebView)view;
  if(view instanceof ViewGroup){ViewGroup group=(ViewGroup)view;for(int i=0;i<group.getChildCount();i++){WebView found=web(group.getChildAt(i));if(found!=null)return found;}}
  return null;
 }
 private static String js(ActivityScenario<MainActivity> scenario,String script)throws Exception{
  AtomicReference<String> result=new AtomicReference<>();
  CountDownLatch latch=new CountDownLatch(1);
  scenario.onActivity(a->{WebView w=web(a.findViewById(android.R.id.content));assertNotNull(w);w.evaluateJavascript(script,v->{result.set(v);latch.countDown();});});
  assertTrue("WebView JS callback",latch.await(10,TimeUnit.SECONDS));return result.get();
 }
 private static void waitTrue(ActivityScenario<MainActivity> scenario,String expression)throws Exception{
  for(int i=0;i<40;i++){if("true".equals(js(scenario,"Boolean("+expression+")")))return;Thread.sleep(250);}
  fail("Condition did not become true: "+expression);
 }
 @Test public void actualWebViewLoadsOfflineAndRestoresDiagnosticDraft()throws Exception{
  try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(MainActivity.class)){
   waitTrue(scenario,"document.querySelector('#open-diagnostic') && window.WOLFIE_ROADMAP.build().length===300");
   scenario.onActivity(a->{WebView w=web(a.findViewById(android.R.id.content));assertNotNull(w);assertFalse(w.getSettings().getAllowFileAccess());assertFalse(w.getSettings().getAllowContentAccess());});
   js(scenario,"document.querySelector('#open-diagnostic').click();document.querySelector('[data-diag-level=\"A2\"]').click();true");
   waitTrue(scenario,"document.querySelector('#diag-next')");
   js(scenario,"document.querySelector('[name=\"diag-choice\"]').click();document.querySelector('#diag-next').click();true");
   waitTrue(scenario,"document.querySelector('.diagnostic-shell').textContent.includes('2/8')");
   js(scenario,"document.querySelector('#theme-toggle').click();true");
   waitTrue(scenario,"document.documentElement.dataset.theme==='dark'");
  }
  try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(MainActivity.class)){
   waitTrue(scenario,"document.querySelector('#open-diagnostic') && document.documentElement.dataset.theme==='dark'");
   js(scenario,"document.querySelector('#open-diagnostic').click();document.querySelector('#diag-resume').click();true");
   waitTrue(scenario,"document.querySelector('.diagnostic-shell').textContent.includes('2/8')");
   js(scenario,"document.querySelector('#diag-back').click();document.querySelector('[data-course=\"0\"]').click();document.querySelector('#begin-course').click();true");
   waitTrue(scenario,"document.querySelectorAll('[data-study]').length===8 && document.querySelector('[data-study=\"exam\"]').disabled");
  }
 }
}
