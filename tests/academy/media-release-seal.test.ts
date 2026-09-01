import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CURRICULUM_DRAFTS_BY_SLUG } from "@/lib/academy/curricula";
import {
  ACADEMY_DIALOGUE_SKU_SLUGS,
  ACADEMY_GROWTH_SKU_SLUGS,
  ACADEMY_MEDIA_SEALED_AUDIO,
  ACADEMY_MEDIA_SEALED_SKU_SLUGS,
  academyCourseHasSealedAudio,
  academyMediaSealedWavCount,
  isAcademyLessonAudioSealed,
} from "@/lib/academy/pilot-sku";
import { academyLessonAudioPublicPath } from "@/lib/academy/lesson-audio";
import {
  academyCastForDialogueSpeaker,
  ACADEMY_INSTRUCTOR_SPEECH_RATE,
  academyModeratorSpeechRateForSlug,
} from "@/lib/academy/instructors";
import {
  ACADEMY_MEDIA_RELEASE_BUCKET,
  academyLessonAudioDiskPath,
  academyLessonAudioObjectPath,
  academyMediaReleaseCacheKey,
  academyMediaReleaseJobForLesson,
  collectAcademyLessonDialogueTurns,
  splitAcademySpeechChunks,
} from "@/lib/academy/media-release-seal";
import { getDefaultModelId } from "@/lib/kernel/ai/model-roles";

const AUDIO_ROOT = join(process.cwd(), "public", "media", "academy", "audio");

function listDiskWavRelPaths(): string[] {
  const found: string[] = [];
  for (const slug of readdirSync(AUDIO_ROOT)) {
    const dir = join(AUDIO_ROOT, slug);
    if (!statSync(dir).isDirectory()) {
      continue;
    }
    for (const file of readdirSync(dir)) {
      if (file.endsWith(".wav")) {
        found.push(`${slug}/${file}`);
      }
    }
  }
  return found.sort();
}

describe("Zero-Cost Streaming mediaReleaseSeal", () => {
  it("vitrin 20 SKU; DialogueTurn 18; WAV mührü diskteki 16 dosya ile birebir", () => {
    expect(ACADEMY_GROWTH_SKU_SLUGS).toHaveLength(20);
    expect(ACADEMY_DIALOGUE_SKU_SLUGS).toHaveLength(18);
    expect(ACADEMY_MEDIA_SEALED_SKU_SLUGS).toHaveLength(3);
    expect(ACADEMY_MEDIA_SEALED_SKU_SLUGS).toEqual([
      "ai-agent-temel",
      "ai-agent-orta",
      "ai-agent-ileri",
    ]);
    expect(academyMediaSealedWavCount()).toBe(16);
    expect(ACADEMY_GROWTH_SKU_SLUGS).toContain("ai-temel");
    expect(ACADEMY_GROWTH_SKU_SLUGS).toContain("ux-temel");
    expect(ACADEMY_MEDIA_SEALED_SKU_SLUGS).not.toContain("python-temel");
    expect(ACADEMY_DIALOGUE_SKU_SLUGS).not.toContain("ai-temel");
    expect(ACADEMY_DIALOGUE_SKU_SLUGS).not.toContain("ux-temel");

    const expectedWav = Object.entries(ACADEMY_MEDIA_SEALED_AUDIO).flatMap(([slug, keys]) =>
      keys.map((key) => `${slug}/${key}.wav`),
    );
    expect(listDiskWavRelPaths()).toEqual(expectedWav.sort());
    expect(isAcademyLessonAudioSealed("ai-agent-ileri", "ai-agent-ileri-4")).toBe(true);
    expect(isAcademyLessonAudioSealed("ai-agent-ileri", "ai-agent-ileri-5")).toBe(false);
    expect(isAcademyLessonAudioSealed("python-temel", "python-temel-1")).toBe(false);
    expect(ACADEMY_GROWTH_SKU_SLUGS.filter(academyCourseHasSealedAudio)).toEqual([
      "ai-agent-temel",
      "ai-agent-orta",
      "ai-agent-ileri",
    ]);
    expect(academyCourseHasSealedAudio("python-temel")).toBe(false);
    expect(academyCourseHasSealedAudio("ai-temel")).toBe(false);
    expect(academyCourseHasSealedAudio("ux-temel")).toBe(false);
    expect(readFileSync(join(process.cwd(), "components/academy/course-card.tsx"), "utf8")).toContain(
      "academyCourseHasSealedAudio",
    );
    expect(readFileSync(join(process.cwd(), "lib/copy/sen-voice/academy.ts"), "utf8")).toContain(
      "Seslendirmeli İçerik",
    );

    const model = getDefaultModelId("VOICE_TTS");
    let dialogueLessons = 0;
    for (const slug of ACADEMY_DIALOGUE_SKU_SLUGS) {
      const drafts = CURRICULUM_DRAFTS_BY_SLUG[slug];
      expect(drafts?.length, slug).toBeGreaterThan(0);
      for (const lesson of drafts ?? []) {
        dialogueLessons += 1;
        const turns = collectAcademyLessonDialogueTurns(lesson);
        expect(turns.length, `${slug}/${lesson.key}`).toBeGreaterThan(0);
      }
    }
    expect(dialogueLessons).toBe(18 * 6);

    let sealedJobs = 0;
    for (const slug of ACADEMY_MEDIA_SEALED_SKU_SLUGS) {
      const drafts = CURRICULUM_DRAFTS_BY_SLUG[slug];
      for (const lesson of drafts ?? []) {
        if (!isAcademyLessonAudioSealed(slug, lesson.key)) {
          continue;
        }
        sealedJobs += 1;
        const job = academyMediaReleaseJobForLesson(slug, lesson, model);
        expect(job.turns.length).toBeGreaterThan(0);
        expect(job.publicPath).toBe(academyLessonAudioPublicPath(slug, lesson.key));
        expect(job.objectPath).toBe(academyLessonAudioObjectPath(slug, lesson.key));
        expect(job.cacheKey).toBe(academyMediaReleaseCacheKey(slug, lesson.key));
        expect(job.mediaReleaseSeal).toMatch(/^[a-f0-9]{64}$/u);
        expect(academyLessonAudioDiskPath(slug, lesson.key)).toBe(
          join(process.cwd(), "public", "media", "academy", "audio", slug, `${lesson.key}.wav`),
        );
      }
    }
    expect(sealedJobs).toBe(16);

    for (const slug of ["ai-temel", "ux-temel"] as const) {
      const drafts = CURRICULUM_DRAFTS_BY_SLUG[slug];
      expect(drafts?.length, slug).toBe(12);
      for (const lesson of drafts ?? []) {
        expect(collectAcademyLessonDialogueTurns(lesson), `${slug}/${lesson.key}`).toEqual([]);
      }
    }
  });

  it("Maya/Ece/Gözde %95, Koray/Can/Tarık seviye temposu", () => {
    expect(academyCastForDialogueSpeaker("python-temel", "maya").speechRate).toBe(
      ACADEMY_INSTRUCTOR_SPEECH_RATE,
    );
    expect(academyCastForDialogueSpeaker("python-temel", "maya").voice).toBe("Kore");
    expect(academyCastForDialogueSpeaker("python-temel", "koray").speechRate).toBe(1);
    expect(academyCastForDialogueSpeaker("python-temel", "koray").voice).toBe("Charon");
    expect(academyCastForDialogueSpeaker("ai-agent-orta", "koray").speechRate).toBe(
      academyModeratorSpeechRateForSlug("ai-agent-orta"),
    );
    expect(academyCastForDialogueSpeaker("security-temel", "ece").voice).toBe("Leda");
    expect(academyCastForDialogueSpeaker("security-temel", "can").voice).toBe("Enceladus");
    expect(academyCastForDialogueSpeaker("excel-masterclass", "gozde").voice).toBe("Callirrhoe");
    expect(academyCastForDialogueSpeaker("excel-masterclass", "tarik").voice).toBe("Iapetus");
    expect(ACADEMY_MEDIA_RELEASE_BUCKET).toBe("public");
  });

  it("uzun turu 900 karakter dilimlerine böler", () => {
    const chunks = splitAcademySpeechChunks("Bir. ".repeat(400), 40);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((chunk) => chunk.length <= 40)).toBe(true);
  });
});
