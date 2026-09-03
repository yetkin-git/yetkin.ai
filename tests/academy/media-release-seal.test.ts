import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CURRICULUM_DRAFTS_BY_SLUG } from "@/lib/academy/curricula";
import { AI_AGENT_ORTA_AUDIO_HOLD } from "@/lib/academy/curricula/ai-agent-orta";
import {
  ACADEMY_DIALOGUE_SKU_SLUGS,
  ACADEMY_GROWTH_SKU_SLUGS,
  ACADEMY_MEDIA_SEALED_AUDIO,
  ACADEMY_MEDIA_SEALED_SKU_SLUGS,
  academyCourseHasSealedAudio,
  academyMediaSealedWavCount,
  isAcademyLessonAudioSealed,
} from "@/lib/academy/pilot-sku";
import {
  academyLessonAudioPlaybackSrc,
  academyLessonAudioPublicPath,
  ACADEMY_SEALED_AUDIO_CACHE_V,
  ACADEMY_SEALED_AUDIO_DURATION_SEC,
} from "@/lib/academy/lesson-audio";
import { academyLessonDurationMin } from "@/lib/academy/lesson-meta";
import { pcmWavDurationSec } from "@/lib/kernel/ai/pcm-wav";
import { academyCastForDialogueSpeaker, ACADEMY_INSTRUCTOR_SPEECH_RATE } from "@/lib/academy/instructors";
import {
  academyLessonAudioDiskPath,
  academyLessonAudioObjectPath,
  academyMediaReleaseCacheKey,
  academyMediaReleaseJobForLesson,
  collectAcademyLessonDialogueTurns,
  spokenAcademyDialogueTurnText,
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
  it("vitrin 20 SKU; DialogueTurn 18; WAV mührü diskteki 13 dosya ile birebir", () => {
    expect(ACADEMY_GROWTH_SKU_SLUGS).toHaveLength(20);
    expect(ACADEMY_DIALOGUE_SKU_SLUGS).toHaveLength(18);
    expect(ACADEMY_MEDIA_SEALED_SKU_SLUGS).toHaveLength(3);
    expect(ACADEMY_MEDIA_SEALED_SKU_SLUGS).toEqual([
      "ai-agent-temel",
      "ai-agent-orta",
      "ai-agent-ileri",
    ]);
    expect(academyMediaSealedWavCount()).toBe(13);
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
    expect(isAcademyLessonAudioSealed("ai-agent-orta", "ai-agent-orta-4")).toBe(false);
    expect(isAcademyLessonAudioSealed("ai-agent-orta", "ai-agent-orta-5")).toBe(false);
    expect(isAcademyLessonAudioSealed("ai-agent-orta", "ai-agent-orta-6")).toBe(false);
    for (const [key, hold] of Object.entries(AI_AGENT_ORTA_AUDIO_HOLD)) {
      expect(hold.audioUrl).toBeNull();
      expect(hold.duration).toBeNull();
      expect(hold.mediaReleaseSeal).toBeNull();
      expect(isAcademyLessonAudioSealed("ai-agent-orta", key)).toBe(false);
      expect(key in ACADEMY_SEALED_AUDIO_DURATION_SEC).toBe(false);
      expect(ACADEMY_SEALED_AUDIO_CACHE_V[key as keyof typeof ACADEMY_SEALED_AUDIO_CACHE_V]).toBeUndefined();
    }
    expect(isAcademyLessonAudioSealed("python-temel", "python-temel-1")).toBe(false);
    expect(ACADEMY_GROWTH_SKU_SLUGS.filter(academyCourseHasSealedAudio)).toEqual([
      "ai-agent-temel",
      "ai-agent-orta",
      "ai-agent-ileri",
    ]);
    expect(academyCourseHasSealedAudio("python-temel")).toBe(false);
    expect(academyCourseHasSealedAudio("ai-temel")).toBe(false);
    expect(academyCourseHasSealedAudio("ux-temel")).toBe(false);
    const pedagoji = readFileSync(join(process.cwd(), ".system_docs", "PEDAGOJI.md"), "utf8");
    const manifesto = readFileSync(join(process.cwd(), ".system_docs", "MANIFESTO.md"), "utf8");
    expect(pedagoji).toContain("13 WAV");
    expect(pedagoji).not.toContain("16 WAV");
    expect(manifesto).toContain("13 WAV");
    expect(manifesto).not.toContain("16 WAV");
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
    expect(sealedJobs).toBe(13);

    for (const slug of ["ai-temel", "ux-temel"] as const) {
      const drafts = CURRICULUM_DRAFTS_BY_SLUG[slug];
      expect(drafts?.length, slug).toBe(12);
      for (const lesson of drafts ?? []) {
        expect(collectAcademyLessonDialogueTurns(lesson), `${slug}/${lesson.key}`).toEqual([]);
      }
    }
  });

  it("Eğitmen Master Voice Erinome %93; moderatör ders sesine girmez", () => {
    expect(academyCastForDialogueSpeaker("python-temel", "maya").speechRate).toBe(
      ACADEMY_INSTRUCTOR_SPEECH_RATE,
    );
    expect(academyCastForDialogueSpeaker("python-temel", "maya").voice).toBe("Erinome");
    expect(academyCastForDialogueSpeaker("python-temel", "koray").speechRate).toBe(0.93);
    expect(academyCastForDialogueSpeaker("python-temel", "koray").voice).toBe("Erinome");
    expect(academyCastForDialogueSpeaker("ai-agent-orta", "koray").speechRate).toBe(
      ACADEMY_INSTRUCTOR_SPEECH_RATE,
    );
    expect(academyCastForDialogueSpeaker("ai-agent-orta", "koray").voice).toBe("Erinome");
    expect(academyCastForDialogueSpeaker("security-temel", "ece").voice).toBe("Erinome");
    expect(academyCastForDialogueSpeaker("security-temel", "can").voice).toBe("Erinome");
    expect(academyCastForDialogueSpeaker("excel-masterclass", "gozde").voice).toBe("Erinome");
    expect(academyCastForDialogueSpeaker("excel-masterclass", "tarik").voice).toBe("Erinome");
    const bakeScript = readFileSync(join(process.cwd(), "scripts/generate-academy-lesson-audio.ts"), "utf8");
    expect(bakeScript).not.toContain("speakingRate");
    expect(bakeScript).not.toContain("ACADEMY_TTS_SPEAKING_RATE");
    expect(bakeScript).not.toContain("tempoStretchPcmWav");
    expect(bakeScript).not.toContain("omitSpeakingRate");
    expect(bakeScript).toContain("boostPcmWavGain");
    expect(bakeScript).toContain("resamplePcmWav");
    expect(readFileSync(join(process.cwd(), "scripts/generate-academy-lesson-audio.ts"), "utf8")).not.toContain(
      "splitAcademySpeechChunks(turn.spokenText)",
    );
    expect(readFileSync(join(process.cwd(), "scripts/generate-academy-lesson-audio.ts"), "utf8")).not.toContain(
      "concatPcmWavBuffersSeamless",
    );
    expect(readFileSync(join(process.cwd(), "scripts/generate-academy-lesson-audio.ts"), "utf8")).toContain(
      "concatPcmWavBuffers",
    );
    expect(bakeScript).toContain("if (!keyFilter && !isAcademyLessonAudioSealed");
    const drafts = CURRICULUM_DRAFTS_BY_SLUG["ai-agent-temel"];
    const first = drafts?.find((lesson) => lesson.key === "ai-agent-temel-1");
    expect(first).toBeDefined();
    const job = academyMediaReleaseJobForLesson(
      "ai-agent-temel",
      first!,
      getDefaultModelId("VOICE_TTS"),
    );
    expect(job.turns[0]?.spokenText).toContain("Merhaba, ben Maya");
    expect(job.turns[0]?.spokenText).toContain("Yapay Zeka Sistemleri Uzmanıyım");
    for (const turn of job.turns) {
      expect(turn.spokenText).toBe(spokenAcademyDialogueTurnText(turn.text));
    }
  });

  it("uzun turu dilimlere böler", () => {
    const chunks = splitAcademySpeechChunks("Bir. ".repeat(400), 40);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((chunk) => chunk.length <= 40)).toBe(true);
  });

  it("mühürlü WAV süresi oynatma listesi tablosuyla senkron", () => {
    expect(Object.keys(ACADEMY_SEALED_AUDIO_DURATION_SEC)).toHaveLength(13);
    for (const slug of ACADEMY_MEDIA_SEALED_SKU_SLUGS) {
      for (const key of ACADEMY_MEDIA_SEALED_AUDIO[slug]) {
        const wav = readFileSync(join(AUDIO_ROOT, slug, `${key}.wav`));
        const sec = pcmWavDurationSec(wav);
        const stamped = ACADEMY_SEALED_AUDIO_DURATION_SEC[key as keyof typeof ACADEMY_SEALED_AUDIO_DURATION_SEC];
        expect(stamped, key).toBe(Math.round(sec));
        expect(academyLessonDurationMin({ key, courseSlug: slug }), key).toBe(
          Math.max(1, Math.round(sec / 60)),
        );
        if (key === "ai-agent-temel-2") {
          expect(wav.readUInt32LE(24), key).toBe(48_000);
          expect(wav.readUInt16LE(20), key).toBe(1);
          expect(wav.byteLength).toBe(27_821_804);
          expect(academyLessonAudioPublicPath(slug, key)).toBe(
            `/media/academy/audio/${slug}/${key}.wav`,
          );
          expect(academyLessonAudioPlaybackSrc(slug, key)).toBe(
            `/media/academy/audio/${slug}/${key}.wav?v=${ACADEMY_SEALED_AUDIO_CACHE_V["ai-agent-temel-2"]}`,
          );
          expect(readFileSync(join(process.cwd(), "scripts/generate-academy-lesson-audio.ts"), "utf8")).toContain(
            '"prompt-muhendisligi-ve-yapisandirilmis-cikti": "ai-agent-temel-2"',
          );
        }
        if (key === "ai-agent-temel-3") {
          expect(wav.readUInt32LE(24), key).toBe(48_000);
          expect(wav.readUInt16LE(20), key).toBe(1);
          expect(wav.byteLength).toBe(17_273_324);
          expect(academyLessonAudioPublicPath(slug, key)).toBe(
            `/media/academy/audio/${slug}/${key}.wav`,
          );
          expect(academyLessonAudioPlaybackSrc(slug, key)).toBe(
            `/media/academy/audio/${slug}/${key}.wav?v=${ACADEMY_SEALED_AUDIO_CACHE_V["ai-agent-temel-3"]}`,
          );
          expect(readFileSync(join(process.cwd(), "scripts/generate-academy-lesson-audio.ts"), "utf8")).toContain(
            '"arac-kullanimi-tool-calling-mantigi": "ai-agent-temel-3"',
          );
        }
        if (key === "ai-agent-temel-4") {
          expect(wav.readUInt32LE(24), key).toBe(48_000);
          expect(wav.readUInt16LE(20), key).toBe(1);
          expect(wav.byteLength).toBe(15_491_564);
          expect(academyLessonAudioPublicPath(slug, key)).toBe(
            `/media/academy/audio/${slug}/${key}.wav`,
          );
          expect(academyLessonAudioPlaybackSrc(slug, key)).toBe(
            `/media/academy/audio/${slug}/${key}.wav?v=${ACADEMY_SEALED_AUDIO_CACHE_V["ai-agent-temel-4"]}`,
          );
          expect(readFileSync(join(process.cwd(), "scripts/generate-academy-lesson-audio.ts"), "utf8")).toContain(
            '"hafiza-mimarisi-context-window-vector-storage": "ai-agent-temel-4"',
          );
        }
        if (key === "ai-agent-temel-5") {
          expect(wav.readUInt32LE(24), key).toBe(48_000);
          expect(wav.readUInt16LE(20), key).toBe(1);
          expect(wav.byteLength).toBe(14_827_244);
          expect(academyLessonAudioPublicPath(slug, key)).toBe(
            `/media/academy/audio/${slug}/${key}.wav`,
          );
          expect(academyLessonAudioPlaybackSrc(slug, key)).toBe(
            `/media/academy/audio/${slug}/${key}.wav?v=${ACADEMY_SEALED_AUDIO_CACHE_V["ai-agent-temel-5"]}`,
          );
          expect(readFileSync(join(process.cwd(), "scripts/generate-academy-lesson-audio.ts"), "utf8")).toContain(
            '"karar-verme-donguleri-react-deseni": "ai-agent-temel-5"',
          );
        }
        if (key === "ai-agent-temel-6") {
          expect(wav.readUInt32LE(24), key).toBe(48_000);
          expect(wav.readUInt16LE(20), key).toBe(1);
          expect(wav.byteLength).toBe(16_186_604);
          expect(academyLessonAudioPublicPath(slug, key)).toBe(
            `/media/academy/audio/${slug}/${key}.wav`,
          );
          expect(academyLessonAudioPlaybackSrc(slug, key)).toBe(
            `/media/academy/audio/${slug}/${key}.wav?v=${ACADEMY_SEALED_AUDIO_CACHE_V["ai-agent-temel-6"]}`,
          );
          expect(readFileSync(join(process.cwd(), "scripts/generate-academy-lesson-audio.ts"), "utf8")).toContain(
            '"mini-proje-hava-durumu-ve-not-alma-araclarini-kullanan-basit-bir-python-ai-agent": "ai-agent-temel-6"',
          );
        }
      }
    }
  });
});
