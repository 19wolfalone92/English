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
 static String js(ActivityScenario<MainActivity> scenario,String script)throws Exception{
  AtomicReference<String> result=new AtomicReference<>();
  CountDownLatch latch=new CountDownLatch(1);
  scenario.onActivity(a->{WebView w=web(a.findViewById(android.R.id.content));assertNotNull(w);w.evaluateJavascript(script,v->{result.set(v);latch.countDown();});});
  assertTrue("WebView JS callback",latch.await(10,TimeUnit.SECONDS));return result.get();
 }
 static void waitTrue(ActivityScenario<MainActivity> scenario,String expression)throws Exception{
  for(int i=0;i<40;i++){if("true".equals(js(scenario,"Boolean("+expression+")")))return;Thread.sleep(250);}
  fail("Condition did not become true: "+expression);
 }
 @Test public void actualContextLessonLoadsOfflineAudioAndPersistsDraft()throws Exception{
  try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(MainActivity.class)){
   waitTrue(scenario,"document.querySelector('#home-course-progress') && window.WOLFIE_CONTEXT.packs.length===111");
   assertEquals("\"0/300\"",js(scenario,"document.querySelector('#home-course-progress').textContent"));
   js(scenario,"document.querySelector('[data-course=\"1\"]').click();document.querySelector('#begin-course').click();true");
   waitTrue(scenario,"document.querySelector('#study-context')");
   js(scenario,"document.querySelector('#study-context').click();document.querySelector('[data-ctx-tab=\"audio\"]').click();true");
   waitTrue(scenario,"(()=>{const a=document.querySelector('#ctx-audio');return !!a && a.readyState>=1 && Number.isFinite(a.duration) && a.duration>5 && a.currentSrc.startsWith('file:///android_asset/context_audio/');})()");
   js(scenario,"document.querySelector('[data-ctx-tab=\"writing\"]').click();const t=document.querySelector('#ctx-writing');t.value='Native offline draft — проверка';t.dispatchEvent(new Event('input',{bubbles:true}));true");
   waitTrue(scenario,"JSON.parse(WolfieAndroid.loadProgress()).contextLessons['mission-v2-002'].drafts.w0==='Native offline draft — проверка'");
  }
  try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(MainActivity.class)){
   waitTrue(scenario,"document.querySelector('#home-course-progress')");
   js(scenario,"document.querySelector('[data-course=\"1\"]').click();document.querySelector('#begin-course').click();true");
   waitTrue(scenario,"document.querySelector('#study-context')");
   js(scenario,"document.querySelector('#study-context').click();true");
   waitTrue(scenario,"document.querySelector('#ctx-writing') && document.querySelector('#ctx-writing').value==='Native offline draft — проверка'");
   assertEquals("\"0/300\"",js(scenario,"document.querySelector('#ctx-exit').click();document.querySelector('#study-exit').click();document.querySelector('#home-course-progress').textContent"));
  }
 }
 @Test public void actualMonthOneAndOfflineTeacher()throws Exception{
  try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(MainActivity.class)){
   waitTrue(scenario,"document.querySelector('#open-teacher') && window.WOLFIE_CONTEXT.packs.filter(p=>p.day<=30).length===30");
   js(scenario,"document.querySelector('#open-teacher').click();const t=document.querySelector('#teacher-input');t.value='She don'+String.fromCharCode(39)+'t drive to work.';t.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('#teacher-check').click();true");
   waitTrue(scenario,"document.querySelector('.teacher-correction')?.textContent==='She doesn'+String.fromCharCode(39)+'t drive to work.'");
   js(scenario,"document.querySelectorAll('[data-teacher-choice]')[1].click();true");
   waitTrue(scenario,"JSON.parse(WolfieAndroid.loadProgress()).studio.teacher.rules['third-negative'].practice==='correct'");
  }
  try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(MainActivity.class)){
   waitTrue(scenario,"document.querySelector('#open-teacher')");
   js(scenario,"document.querySelector('#open-teacher').click();true");
   waitTrue(scenario,"document.querySelector('#teacher-history').textContent.includes('Контрольный пример: верно')");
  }
 }
 @Test public void actualNeuralDialogueAndFallback()throws Exception{
  try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(MainActivity.class)){
   waitTrue(scenario,"document.querySelector('#home-course-progress') && window.WOLFIE_NEURAL_DIALOGUES.length===21");
   js(scenario,"document.querySelector('[data-course=\\\"0\\\"]').click();document.querySelector('#begin-course').click();document.querySelector('#study-context').click();document.querySelector('[data-ctx-tab=\\\"audio\\\"]').click();true");
   waitTrue(scenario,"(()=>{const a=document.querySelector('#ctx-audio');return a && a.readyState>=1 && a.duration>=30 && a.currentSrc.includes('/neural_dialogue/');})()");
   js(scenario,"const v=document.querySelector('#ctx-voice');v.value='espeak';v.dispatchEvent(new Event('change',{bubbles:true}));true");
   waitTrue(scenario,"(()=>{const a=document.querySelector('#ctx-audio');return a && a.readyState>=1 && a.duration>=30 && a.currentSrc.includes('/context_audio/');})()");
   waitTrue(scenario,"JSON.parse(WolfieAndroid.loadProgress()).contextLessons['mission-v2-001'].dialogueVoice==='espeak'");
  }
 }
 @Test public void actualOfflineNeuralNarrationLoadsInNativeWebView()throws Exception{
  try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(MainActivity.class)){
   waitTrue(scenario,"document.querySelector('#open-studio') && window.WOLFIE_NEURAL_AUDIO.length===6");
   js(scenario,"document.querySelector('#open-studio').click();const s=document.querySelector('#studio-search');s.value='A picnic with a backup plan';s.dispatchEvent(new Event('input',{bubbles:true}));true");
   waitTrue(scenario,"document.querySelector('[data-reading=\\\"mission-v2-009\\\"]')");
   js(scenario,"document.querySelector('[data-reading=\\\"mission-v2-009\\\"]').click();const v=document.querySelector('#studio-reading-voice');v.value='neural_audio/mission-v2-009-en-gb.mp3';v.dispatchEvent(new Event('change',{bubbles:true}));true");
   waitTrue(scenario,"(()=>{const a=document.querySelector('#studio-reading-audio');return a && a.readyState>=1 && Number.isFinite(a.duration) && a.duration>30 && a.currentSrc.endsWith('mission-v2-009-en-gb.mp3');})()");
  }
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
