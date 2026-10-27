import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  juniorAudioCdnIssue,
  juniorAudioFileIssue,
  juniorAudioManifestEntry,
  juniorAudioManifestIssues,
  juniorPilotOpenerByteWarning,
  juniorPilotOpenerDeployIssue,
  type JuniorAudioManifest,
} from "@/lib/junior/audio-manifest";
import { JUNIOR_FREE_LESSON_KEY, JUNIOR_FREE_PILOT_CDN_OPENERS } from "@/lib/junior/limits";
import { juniorLessonMediaIsPublicPreview } from "@/lib/junior/media-visibility";
import { JUNIOR_AUDIO_MANIFEST } from "@/lib/junior/audio-manifest.generated";
import { juniorBakedAudioSealed } from "@/lib/junior/production-seal";
import { JUNIOR_ELECTIVE_TTS_MODEL_ID } from "@/lib/junior/elective-tts";
import { JUNIOR_BAKED_AUDIO_KEYS } from "@/lib/junior/voice";

const VALID_SHA = "a".repeat(64);
const KEYS = JUNIOR_BAKED_AUDIO_KEYS as readonly string[];

describe("Junior ses manifesti (T-04)", () => {
  it("commit edilmiş manifest fırınlanmış anahtar listesiyle birebir eşleşir", () => {
    expect(Object.keys(JUNIOR_AUDIO_MANIFEST)).toHaveLength(KEYS.length);
    expect(juniorAudioManifestIssues(KEYS, JUNIOR_AUDIO_MANIFEST)).toEqual([]);
  });

  it("her kayıt 64 karakterlik SHA-256 ve pozitif bayt sayısı taşır", () => {
    for (const key of KEYS) {
      const entry = juniorAudioManifestEntry(key, JUNIOR_AUDIO_MANIFEST);
      expect(entry, key).not.toBeNull();
      expect(entry?.sha256).toMatch(/^[0-9a-f]{64}$/u);
      expect(entry?.bytes ?? 0).toBeGreaterThan(0);
    }
  });

  it("eksik, bozuk ve listede olmayan fazla kayıt build'i durdurur", () => {
    const missing = juniorAudioManifestIssues(["jr_06_x-1"], {});
    expect(missing).toEqual(["manifestte eksik veya bozuk kayıt: jr_06_x-1"]);

    const lite = JUNIOR_ELECTIVE_TTS_MODEL_ID;
    const electiveOk: JuniorAudioManifest = {
      "jr_06_alm-1": { sha256: VALID_SHA, bytes: 3, model: lite },
    };
    expect(juniorAudioManifestEntry("jr_06_alm-1", electiveOk)?.model).toBe(lite);
    const electiveBare: JuniorAudioManifest = { "jr_06_alm-1": { sha256: VALID_SHA, bytes: 3 } };
    expect(juniorAudioManifestEntry("jr_06_alm-1", electiveBare)).toBeNull();
    const electiveCoreModel: JuniorAudioManifest = {
      "jr_06_alm-1": { sha256: VALID_SHA, bytes: 3, model: "gemini-3.8-flash-tts" },
    };
    expect(juniorAudioManifestEntry("jr_06_alm-1", electiveCoreModel)).toBeNull();

    const broken: JuniorAudioManifest = { "jr_06_x-1": { sha256: "xyz", bytes: 3 } };
    expect(juniorAudioManifestIssues(["jr_06_x-1"], broken)).toEqual([
      "manifestte eksik veya bozuk kayıt: jr_06_x-1",
    ]);

    const extra: JuniorAudioManifest = {
      "jr_06_x-1": { sha256: VALID_SHA, bytes: 3 },
      "jr_06_y-1": { sha256: VALID_SHA, bytes: 3 },
    };
    expect(juniorAudioManifestIssues(["jr_06_x-1"], extra)).toEqual([
      "manifestte fazla kayıt (anahtar listesinde yok): jr_06_y-1",
    ]);
  });

  it("prototip anahtarları kayıt sayılmaz (fail-closed)", () => {
    expect(juniorAudioManifestEntry("constructor", {})).toBeNull();
    expect(juniorAudioManifestEntry("__proto__", {})).toBeNull();
    expect(juniorAudioManifestEntry("toString", {})).toBeNull();
  });

  it("dosya denetimi bayt ve SHA-256'yı birlikte ister", () => {
    const entry = { sha256: VALID_SHA, bytes: 3 };
    expect(juniorAudioFileIssue("jr_06_x-1", entry, null)).toContain("yok veya boş");
    expect(juniorAudioFileIssue("jr_06_x-1", entry, { bytes: 4, sha256: VALID_SHA })).toContain("bayt uyuşmuyor");
    expect(juniorAudioFileIssue("jr_06_x-1", entry, { bytes: 3, sha256: "b".repeat(64) })).toContain("SHA-256");
    expect(juniorAudioFileIssue("jr_06_x-1", entry, { bytes: 3, sha256: VALID_SHA })).toBeNull();
  });

  it("CDN yanıtı 200 ve content-length manifest baytıyla aynı olmalı", () => {
    const entry = { sha256: VALID_SHA, bytes: 3 };
    expect(juniorAudioCdnIssue("jr_06_x-1", entry, { status: 404, contentLength: "3" })).toContain("CDN yanıtı 404");
    expect(juniorAudioCdnIssue("jr_06_x-1", entry, { status: 200, contentLength: null })).toContain("CDN boyutu");
    expect(juniorAudioCdnIssue("jr_06_x-1", entry, { status: 200, contentLength: "9" })).toContain("CDN boyutu");
    expect(juniorAudioCdnIssue("jr_06_x-1", entry, { status: 200, contentLength: "3" })).toBeNull();
  });

  it("ücretsiz pilot açılışları dağıtım kapısında 200 ister; matematik baytı mühürlüdür", () => {
    expect([...JUNIOR_FREE_PILOT_CDN_OPENERS]).toEqual([
      "jr_06_mat-1",
      "jr_06_fen-1",
      "jr_06_turkce-1",
      "jr_06_sosyal-1",
    ]);
    const entry = { sha256: VALID_SHA, bytes: 11_994_285 };
    for (const key of JUNIOR_FREE_PILOT_CDN_OPENERS) {
      expect(juniorLessonMediaIsPublicPreview(key), key).toBe(true);
      expect(juniorPilotOpenerDeployIssue(key, entry, { status: 404, contentLength: null })).toContain("404");
    }
    expect(
      juniorPilotOpenerDeployIssue(JUNIOR_FREE_LESSON_KEY, entry, { status: 200, contentLength: "1" }),
    ).toContain("CDN boyutu");
    expect(
      juniorPilotOpenerDeployIssue(JUNIOR_FREE_LESSON_KEY, entry, {
        status: 200,
        contentLength: "11994285",
      }),
    ).toBeNull();
    expect(
      juniorPilotOpenerDeployIssue("jr_06_fen-1", entry, { status: 200, contentLength: "1" }),
    ).toBeNull();
    expect(juniorPilotOpenerByteWarning("jr_06_fen-1", entry, { status: 200, contentLength: "1" })).toContain(
      "CDN boyutu",
    );
    expect(
      juniorPilotOpenerByteWarning(JUNIOR_FREE_LESSON_KEY, entry, { status: 200, contentLength: "1" }),
    ).toBeNull();
  });

  it("fırınlanmış ses kapısı: manifest kaydı yoksa ses ağacı olmasa bile kapalı kalır", () => {
    const noTree = { filePresent: () => true, treePresent: () => false };
    expect(juniorBakedAudioSealed("jr_06_mat-1", noTree, {})).toBe(false);
    expect(juniorBakedAudioSealed("jr_06_mat-1", noTree)).toBe(true);
    expect(juniorBakedAudioSealed("jr_06_mat-1", { filePresent: () => false, treePresent: () => true })).toBe(false);
    expect(juniorBakedAudioSealed("jr_06_mat-99", noTree)).toBe(false);
    expect(juniorBakedAudioSealed("jr_06_ing-99", noTree)).toBe(false);
  });

  it("ses klasörü duruyorsa her MP3 manifestteki bayt ve SHA-256 ile eşleşir", () => {
    const audioDir = join(process.cwd(), "public", "media", "junior", "audio");
    const present = existsSync(audioDir);
    if (!present) {
      // Paket veya CDN ortamında dosya denetimi atlanır; kanıt manifesttir (bkz. verify-junior-audio-manifest --check).
      expect(juniorAudioManifestIssues(KEYS, JUNIOR_AUDIO_MANIFEST)).toEqual([]);
      return;
    }
    for (const key of KEYS) {
      const entry = JUNIOR_AUDIO_MANIFEST[key];
      expect(entry, key).toBeDefined();
      if (!entry) {
        continue;
      }
      const bytes = readFileSync(join(audioDir, `${key}.mp3`));
      const actual = { bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") };
      expect(juniorAudioFileIssue(key, entry, actual), key).toBeNull();
    }
    // 105 MP3 okunup özetlenir; varsayılan 5 sn sınırı yetmez.
  }, 120_000);

  it("paket betikleri tanımlı ve verify:prebuild manifest kapısını çağırır", () => {
    const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts["generate:junior-audio-manifest"]).toContain("--write");
    expect(pkg.scripts["verify:junior-audio-manifest"]).toContain("--check");
    expect(pkg.scripts["verify:junior-audio-cdn"]).toContain("--cdn-openers");
    expect(pkg.scripts["verify:junior-audio-cdn-full"]).toContain("--cdn");
    expect(pkg.scripts["verify:prebuild"]).toContain("npm run verify:junior-audio-manifest");
    expect(pkg.scripts.build).toContain("npm run verify:junior-audio-cdn");
    const ci = readFileSync(join(process.cwd(), ".github/workflows/ci.yml"), "utf8");
    expect(ci).toContain("npm run verify:junior-audio-cdn");
    expect(ci).toContain("https://cdn.yetkin.ai");
    const gate = readFileSync(join(process.cwd(), "scripts/verify-junior-audio-manifest.ts"), "utf8");
    expect(gate).toContain("checkManifestCovers");
    expect(gate).toContain("JUNIOR_COVER_MANIFEST");
    expect(gate).not.toContain("covers/${JUNIOR_FREE_LESSON_KEY}.jpg");
  });
});
