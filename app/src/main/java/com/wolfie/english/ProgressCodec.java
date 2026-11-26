package com.wolfie.english;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.zip.GZIPInputStream;
import java.util.zip.GZIPOutputStream;

/** Bounded byte-level codec; independent of Android so JVM regression tests can exercise it. */
final class ProgressCodec {
    static final int LIMIT = 5_000_000;
    private ProgressCodec() {}
    static byte[] readBounded(InputStream input, int limit) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] buffer = new byte[8192];
        int n;
        while ((n = input.read(buffer)) != -1) {
            if (n > limit - out.size()) throw new IOException("Progress exceeds limit");
            out.write(buffer, 0, n);
        }
        return out.toByteArray();
    }
    static String sha256(byte[] input) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(input);
            StringBuilder result = new StringBuilder(64);
            for (byte b : digest) { int n = b & 255; result.append(Character.forDigit(n >>> 4,16)).append(Character.forDigit(n & 15,16)); }
            return result.toString();
        } catch (NoSuchAlgorithmException impossible) { throw new IllegalStateException(impossible); }
    }
    static byte[] encode(String text) throws IOException {
        byte[] raw = text.getBytes(StandardCharsets.UTF_8);
        if (raw.length > LIMIT) throw new IOException("Progress exceeds limit");
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (GZIPOutputStream gzip = new GZIPOutputStream(out)) { gzip.write(raw); }
        return out.toByteArray();
    }
    static String decode(byte[] compressed, String expectedHash) throws IOException {
        if (compressed.length > LIMIT + 100_000) throw new IOException("Compressed progress exceeds limit");
        byte[] raw;
        try (GZIPInputStream input = new GZIPInputStream(new ByteArrayInputStream(compressed))) {
            raw = readBounded(input, LIMIT);
        }
        if (expectedHash != null && !sha256(raw).equals(expectedHash)) throw new IOException("Progress checksum mismatch");
        String text = new String(raw, StandardCharsets.UTF_8);
        if (!java.util.Arrays.equals(raw, text.getBytes(StandardCharsets.UTF_8))) throw new IOException("Invalid UTF-8");
        return text;
    }
}
