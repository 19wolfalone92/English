package com.wolfie.english;
import android.content.Context;
import android.graphics.Bitmap;
import android.os.ParcelFileDescriptor;
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
   Context testContext=InstrumentationRegistry.getInstrumentation().getContext();
   File dir=testContext.getExternalFilesDir(null);
   assertNotNull(dir);assertTrue(dir.exists()||dir.mkdirs());
   try(FileOutputStream out=new FileOutputStream(new File(dir,"wolfie-dom-ready.txt"))){out.write(dom.getBytes(StandardCharsets.UTF_8));out.flush();}
   InstrumentationRegistry.getInstrumentation().waitForIdleSync();
   Thread.sleep(1000);
   Bitmap image=InstrumentationRegistry.getInstrumentation().getUiAutomation().takeScreenshot();
   assertNotNull("Native screenshot must exist",image);
   try(FileOutputStream out=new FileOutputStream(new File(dir,"wolfie-native.png"))){assertTrue(image.compress(Bitmap.CompressFormat.PNG,100,out));out.flush();}
   image.recycle();
   String nativeDir=dir.getAbsolutePath();
   String copyCommand="cp "+nativeDir+"/wolfie-native.png /sdcard/wolfie-native.png && cp "+nativeDir+"/wolfie-dom-ready.txt /sdcard/wolfie-dom-ready.txt";
   try(ParcelFileDescriptor pfd=InstrumentationRegistry.getInstrumentation().getUiAutomation().executeShellCommand(copyCommand+" && echo WOLFIE_COPY_OK"); java.io.InputStream in=new ParcelFileDescriptor.AutoCloseInputStream(pfd)){
    java.io.ByteArrayOutputStream result=new java.io.ByteArrayOutputStream();
    byte[] buffer=new byte[4096]; int n; while((n=in.read(buffer))!=-1)result.write(buffer,0,n);
    assertTrue("Screenshot export failed",result.toString("UTF-8").contains("WOLFIE_COPY_OK"));
   }
  }
 }
}
