package com.wolfie.english;
import android.content.Context;
import android.graphics.Bitmap;
import android.webkit.WebView;
import android.view.View;
import android.view.ViewGroup;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import static org.junit.Assert.*;
import java.io.File;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;

@RunWith(AndroidJUnit4.class)
public class HomeScreenshotQualificationTest {
 private static WebView web(View view){
  if(view instanceof WebView)return (WebView)view;
  if(view instanceof ViewGroup){ViewGroup group=(ViewGroup)view;for(int i=0;i<group.getChildCount();i++){WebView found=web(group.getChildAt(i));if(found!=null)return found;}}
  return null;
 }
 // Home's blue lesson hero is absent in the loading placeholder. Sample native
 // pixels, not DOM/canvas screenshots; no scaling or synthesized evidence.
 private static double heroRatio(Bitmap image){
  int matches=0,total=0;
  for(int y=0;y<image.getHeight();y+=8)for(int x=0;x<image.getWidth();x+=8){
   int color=image.getPixel(x,y),r=(color>>16)&255,g=(color>>8)&255,b=color&255;
   total++;if(b>r+55&&b>g+25&&b>130&&r<140)matches++;
  }
  return (double)matches/total;
 }
 @Before public void setup(){
  Context context=InstrumentationRegistry.getInstrumentation().getTargetContext();
  assertTrue(context.getSharedPreferences("wolfie_english",Context.MODE_PRIVATE).edit().clear().commit());
 }
 @Test public void actualHomeScreenshotWaitsForDomAfterProcessRestart()throws Exception{
  try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(MainActivity.class)){
   DeviceQualificationTest.waitTrue(scenario,"document.readyState==='complete' && document.querySelector('#home-course-progress') && document.querySelector('#home-course-progress').textContent.trim()==='0/300' && document.querySelectorAll('[data-course]').length>0 && document.querySelector('.hero h1').textContent.includes('Первый вечер в разговорном клубе') && !document.body.innerText.includes('Подбираем твою следующую тренировку')");
   String dom=DeviceQualificationTest.js(scenario,"document.body.innerText");
   Context targetContext=InstrumentationRegistry.getInstrumentation().getTargetContext();
   File dir=targetContext.getFilesDir();
   assertNotNull(dir);assertTrue(dir.exists()||dir.mkdirs());
   try(FileOutputStream out=new FileOutputStream(new File(dir,"wolfie-dom-ready.txt"))){out.write(dom.getBytes(StandardCharsets.UTF_8));out.flush();}
   CountDownLatch visual=new CountDownLatch(1);
   scenario.onActivity(a->{WebView w=web(a.findViewById(android.R.id.content));assertNotNull(w);
    w.postVisualStateCallback(1,new WebView.VisualStateCallback(){@Override public void onComplete(long requestId){visual.countDown();}});
    w.invalidate();
   });
   assertTrue("WebView visual-state callback timed out",visual.await(20,TimeUnit.SECONDS));
   Bitmap image=null;double ratio=0;
   for(int i=0;i<40;i++){
    InstrumentationRegistry.getInstrumentation().waitForIdleSync();
    Bitmap candidate=InstrumentationRegistry.getInstrumentation().getUiAutomation().takeScreenshot();
    if(candidate!=null){
     ratio=heroRatio(candidate);
     if(candidate.getWidth()>=480&&candidate.getHeight()>=800&&ratio>=.08){image=candidate;break;}
     candidate.recycle();
    }
    Thread.sleep(500);
   }
   assertNotNull("Rendered native lesson hero absent after visual-state callback; last ratio="+ratio,image);
   try(FileOutputStream out=new FileOutputStream(new File(dir,"wolfie-native-render.txt"))){out.write(("blue_hero_ratio="+ratio+"\n").getBytes(StandardCharsets.UTF_8));}
   try(FileOutputStream out=new FileOutputStream(new File(dir,"wolfie-native.png"))){assertTrue(image.compress(Bitmap.CompressFormat.PNG,100,out));out.flush();}
   image.recycle();
   assertTrue("Native PNG missing",new File(dir,"wolfie-native.png").length()>30000);
   assertTrue("DOM evidence missing",new File(dir,"wolfie-dom-ready.txt").length()>0);
  }
 }
}
