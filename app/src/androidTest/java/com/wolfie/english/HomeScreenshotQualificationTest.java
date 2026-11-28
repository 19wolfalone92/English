package com.wolfie.english;
import android.content.Context;
import android.graphics.Bitmap;
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
   InstrumentationRegistry.getInstrumentation().waitForIdleSync();
   Thread.sleep(1000);
   Bitmap image=InstrumentationRegistry.getInstrumentation().getUiAutomation().takeScreenshot();
   assertNotNull("Native screenshot must exist",image);
   try(FileOutputStream out=new FileOutputStream(new File(dir,"wolfie-native.png"))){assertTrue(image.compress(Bitmap.CompressFormat.PNG,100,out));out.flush();}
   image.recycle();
   assertTrue("Native PNG missing",new File(dir,"wolfie-native.png").length()>30000);
   assertTrue("DOM evidence missing",new File(dir,"wolfie-dom-ready.txt").length()>0);
  }
 }
}
