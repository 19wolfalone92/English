package com.wolfie.english;

import org.junit.Test;
import static org.junit.Assert.*;
import java.nio.charset.StandardCharsets;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Arrays;

public class ProgressCodecTest {
 @Test public void multilingualAndNullByteRoundTrip() throws Exception {
  String text="{\"essay\":\"Русский текст / English / \uD83D\uDC3A \\u0000\"}";
  byte[] bytes=text.getBytes(StandardCharsets.UTF_8);
  assertEquals(text,ProgressCodec.decode(ProgressCodec.encode(text),ProgressCodec.sha256(bytes)));
 }
 @Test public void legacyWithoutDigest() throws Exception {
  assertEquals("{\"items\":{}}",ProgressCodec.decode(ProgressCodec.encode("{\"items\":{}}"),null));
 }
 @Test public void knownDigest() {
  assertEquals("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",ProgressCodec.sha256("abc".getBytes(StandardCharsets.UTF_8)));
 }
 @Test(expected=IOException.class) public void rejectsWrongDigest() throws Exception {
  ProgressCodec.decode(ProgressCodec.encode("first"),ProgressCodec.sha256("second".getBytes(StandardCharsets.UTF_8)));
 }
 @Test(expected=IOException.class) public void rejectsTruncatedGzip() throws Exception {
  byte[] b=ProgressCodec.encode("sample");ProgressCodec.decode(Arrays.copyOf(b,b.length-4),null);
 }
 @Test(expected=IOException.class) public void rejectsOversizeStream() throws Exception {
  ProgressCodec.readBounded(new ByteArrayInputStream(new byte[101]),100);
 }
 @Test(expected=IOException.class) public void rejectsOversizeInput() throws Exception {
  char[] chars=new char[ProgressCodec.LIMIT+1];Arrays.fill(chars,'x');ProgressCodec.encode(new String(chars));
 }
}
