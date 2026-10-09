import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { isOffloadedPublicPath } from "@/lib/media/offload";
import { readMediaPublicBaseUrl, resolvePublicMediaUrl } from "@/lib/media/public-url";
import { readR2MediaConfig } from "@/lib/media/r2-config";
import { contentTypeForObjectKey, listR2PublicMedia, objectKeyFromDiskRelative } from "@/lib/media/r2-plan";
import { R2_EMPTY_PAYLOAD_HASH, signR2Request } from "@/lib/media/r2-s3";
import { buildEdgeCsp } from "@/lib/kernel/security/edge-guard";
import { juniorCoverPublicPath, juniorCoverSrc } from "@/lib/junior/covers";
import { juniorBgmSrc, juniorLessonAudioPublicPath, juniorLessonAudioSrc } from "@/lib/junior/voice";
import { juniorWarmupSrc } from "@/lib/junior/warmup";

const ORIGINAL_BASE = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

afterEach(() => {
  if (ORIGINAL_BASE === undefined) {
    delete process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  } else {
    process.env.NEXT_PUBLIC_MEDIA_BASE_URL = ORIGINAL_BASE;
  }
});

describe("kamu medya adresi", () => {
  it("taban yoksa yerel /media yolu kalır", () => {
    delete process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
    expect(readMediaPublicBaseUrl(undefined)).toBeNull();
    expect(resolvePublicMediaUrl("/media/junior/audio/jr_06_mat-1.mp3")).toBe(
      "/media/junior/audio/jr_06_mat-1.mp3",
    );
    expect(juniorLessonAudioSrc("jr_06_mat-1")).toBe(juniorLessonAudioPublicPath("jr_06_mat-1"));
    expect(juniorBgmSrc()).toBe("/media/junior/audio/bgm-light-learning.mp3");
    expect(juniorCoverSrc("jr_06_mat-1")).toBe(juniorCoverPublicPath("jr_06_mat-1"));
    expect(juniorWarmupSrc("jr_06_mat-1")).toBe("/media/junior/warmup/jr_06_mat-warmup.mp4");
  });

  it("https kökü CDN adresini bağlar ve sorguyu korur", () => {
    process.env.NEXT_PUBLIC_MEDIA_BASE_URL = "https://cdn.yetkin.ai/";
    expect(readMediaPublicBaseUrl()).toBe("https://cdn.yetkin.ai");
    expect(resolvePublicMediaUrl("/media/academy/micro/01_office_ai_ileri-warmup.mp4?v=8000")).toBe(
      "https://cdn.yetkin.ai/media/academy/micro/01_office_ai_ileri-warmup.mp4?v=8000",
    );
    expect(juniorLessonAudioSrc("jr_06_fen-2")).toBe(
      "https://cdn.yetkin.ai/media/junior/audio/jr_06_fen-2.mp3",
    );
    expect(juniorCoverSrc("jr_06_mat-1")).toBe("https://cdn.yetkin.ai/media/junior/covers/jr_06_mat-1.jpg");
  });

  it("yol, sorgu veya düz http tabanı reddedilir", () => {
    expect(readMediaPublicBaseUrl("https://cdn.yetkin.ai/media")).toBeNull();
    expect(readMediaPublicBaseUrl("https://user:secret@cdn.yetkin.ai")).toBeNull();
    expect(readMediaPublicBaseUrl("http://cdn.yetkin.ai")).toBeNull();
    expect(readMediaPublicBaseUrl("http://127.0.0.1:9000")).toBe("http://127.0.0.1:9000");
    expect(() => resolvePublicMediaUrl("/academy/covers/a.jpg")).toThrow(/\/media\//u);
    expect(() => resolvePublicMediaUrl("/media/../secret.mp3")).toThrow(/\/media\//u);
  });

  it("CSP yalnız geçerli CDN kökünü ekler", () => {
    const open = buildEdgeCsp("nonce", {
      NODE_ENV: "production",
      NEXT_PUBLIC_MEDIA_BASE_URL: "https://cdn.yetkin.ai",
    });
    expect(open).toContain("img-src 'self' data: blob: https://cdn.yetkin.ai");
    expect(open).toContain("media-src 'self' blob: https://*.supabase.co https://cdn.yetkin.ai");
    const closed = buildEdgeCsp("nonce", {
      NODE_ENV: "production",
      NEXT_PUBLIC_MEDIA_BASE_URL: "https://cdn.yetkin.ai/media",
    });
    expect(closed).toContain("img-src 'self' data: blob:;");
    expect(closed).not.toContain("cdn.yetkin.ai");
  });
});

describe("R2 ayarı ve sayım", () => {
  it("eksik anahtar yazmayı durdurur", () => {
    expect(() => readR2MediaConfig({})).toThrow(/R2_BUCKET_NAME/u);
    expect(() =>
      readR2MediaConfig({
        R2_BUCKET_NAME: "yetkin-media",
        R2_ACCESS_KEY_ID: "key",
        R2_SECRET_ACCESS_KEY: "secret",
        R2_ACCOUNT_ID: "a".repeat(32),
        NEXT_PUBLIC_MEDIA_BASE_URL: "https://cdn.yetkin.ai",
      }),
    ).not.toThrow();
  });

  it("nesne anahtarı public/ önekini düşer", () => {
    expect(objectKeyFromDiskRelative("public/media/junior/covers/jr_06_mat-1.jpg")).toBe(
      "media/junior/covers/jr_06_mat-1.jpg",
    );
    expect(contentTypeForObjectKey("media/junior/audio/a.mp3")).toBe("audio/mpeg");
    expect(contentTypeForObjectKey("media/junior/warmup/a.mp4")).toBe("video/mp4");
    expect(isOffloadedPublicPath("public/media/junior/audio/a.mp3")).toBe(true);
    expect(isOffloadedPublicPath("public/media/academy/micro/a.mp4")).toBe(false);
  });

  it("WAV ve yabancı uzantı listeye girmez", () => {
    const root = mkdtempSync(join(tmpdir(), "r2-plan-"));
    const audio = join(root, "public", "media", "junior", "audio");
    const micro = join(root, "public", "media", "academy", "micro");
    mkdirSync(audio, { recursive: true });
    mkdirSync(micro, { recursive: true });
    writeFileSync(join(audio, "jr_06_mat-1.mp3"), Buffer.from("mp3"));
    writeFileSync(join(audio, "draft.wav"), Buffer.from("wav"));
    writeFileSync(join(micro, "01_office_ai-1-warmup.mp4"), Buffer.from("mp4"));
    writeFileSync(join(micro, "note.txt"), Buffer.from("txt"));
    const items = listR2PublicMedia(root);
    expect(items.map((item) => item.objectKey)).toEqual([
      "media/academy/micro/01_office_ai-1-warmup.mp4",
      "media/junior/audio/jr_06_mat-1.mp3",
    ]);
  });

  it("imza başlığı AWS4 biçimindedir ve sır taşımaz", () => {
    const signed = signR2Request({
      method: "PUT",
      endpoint: "https://aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.r2.cloudflarestorage.com",
      bucket: "yetkin-media",
      objectKey: "media/junior/covers/jr_06_mat-1.jpg",
      accessKeyId: "access-key",
      secretAccessKey: "secret-key",
      payloadHash: R2_EMPTY_PAYLOAD_HASH,
      contentType: "image/jpeg",
      cacheControl: "public, max-age=31536000, immutable",
      now: new Date("2026-10-09T01:02:03.000Z"),
    });
    expect(signed.url).toBe(
      "https://aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.r2.cloudflarestorage.com/yetkin-media/media/junior/covers/jr_06_mat-1.jpg",
    );
    expect(signed.headers.Authorization).toMatch(/^AWS4-HMAC-SHA256 Credential=access-key\/20261009\/auto\/s3\/aws4_request, SignedHeaders=/u);
    expect(signed.headers.Authorization).not.toContain("secret-key");
    expect(signed.headers["x-amz-date"]).toBe("20261009T010203Z");
    expect(signed.headers["Cache-Control"]).toBe("public, max-age=31536000, immutable");
  });
});
