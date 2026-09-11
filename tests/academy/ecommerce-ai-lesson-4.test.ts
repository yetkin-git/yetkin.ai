import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { academyCinemaActiveCue } from "@/lib/academy/lesson-cinema";
import {
  academyLessonCueSpokenDuration,
  hasAcademyLessonCues,
  loadAcademyLessonCues,
  loadAcademyLessonPlaybackCues,
} from "@/lib/academy/lesson-cues";
import {
  academyVisualStageCardsMatchCues,
  academyVisualStageCinemaKind,
  hasAcademyLessonVisualStage,
  loadAcademyLessonVisualStage,
} from "@/lib/academy/lesson-visual-stage";
import { academyCitizenPlayerLayer } from "@/lib/academy/citizen-player-layer";
import { loadAcademySealedAudioTimings } from "@/lib/academy/lesson-audio-timings";
import { loadAcademyTeleprompterFlow } from "@/lib/academy/lesson-teleprompter-flow";
import {
  ACADEMY_MEDIA_PRODUCTION_QUEUE,
  isAcademyLessonAudioInProduction,
  isAcademyLessonAudioSealed,
} from "@/lib/academy/pilot-sku";
import { academyLessonAudioReleaseDiskPath } from "@/lib/academy/media-release-seal";
import { collapseAcademyLessonProse } from "@/lib/academy/lesson-body";
import {
  academySpokenScriptWordCount,
  isAcademySpokenScriptLessonKey,
  loadAcademySpokenScriptMarkdownParagraphs,
  loadAcademySpokenScriptParagraphs,
  loadAcademySpokenScriptProse,
} from "@/lib/academy/spoken-scripts";
import {
  ACADEMY_TTS_LESSON_BREATH_BLOCK_MAX,
  ACADEMY_TTS_LESSON_REQUEST_MIN,
  splitAcademyTtsBreathChunks,
} from "@/lib/academy/tts-breath-chunks";

const ROOT = process.cwd();
const LESSON_KEY = "02_ecommerce_ai-4";
const POSTER = join(ROOT, "public/academy/cinema/02_ecommerce_ai-1-eye.jpg");

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("02_ecommerce_ai-4 mühürlü ses", () => {
  it("spoken script ve dört sahne cue F.1.1 akışına kilitlenir; karaoke açıktır", () => {
    expect(isAcademySpokenScriptLessonKey(LESSON_KEY)).toBe(true);
    expect(hasAcademyLessonCues(LESSON_KEY)).toBe(true);
    expect(isAcademyLessonAudioSealed("02_ecommerce_ai", LESSON_KEY)).toBe(true);
    expect(isAcademyLessonAudioInProduction("02_ecommerce_ai", LESSON_KEY)).toBe(false);
    expect(ACADEMY_MEDIA_PRODUCTION_QUEUE["02_ecommerce_ai"]).toBeUndefined();
    const layer = academyCitizenPlayerLayer("02_ecommerce_ai", LESSON_KEY);
    expect(layer.kind).toBe("article+karaoke");
    if (layer.kind === "article+karaoke") {
      expect(layer.audioSrc).toContain("/media/academy/audio/02_ecommerce_ai/02_ecommerce_ai-4.mp3");
      expect(layer.durationSec).toBeGreaterThanOrEqual(540);
      expect(layer.cues).toEqual(loadAcademyTeleprompterFlow(LESSON_KEY));
    }

    const prose = loadAcademySpokenScriptProse(LESSON_KEY);
    const words = academySpokenScriptWordCount(prose);
    expect(prose).not.toMatch(/```/u);
    expect(words).toBeGreaterThanOrEqual(900);
    expect(words).toBeLessThanOrEqual(1600);
    expect(prose).toMatch(/mağazanın kaderini belirleyen o acımasız fiyat arenasını/u);
    expect(prose).toMatch(/Ben Aylin/u);
    expect(prose).toMatch(/Kendi taban fiyatını rakamıyla görmeden beşinci bölüme geçme/u);
    expect(prose).toMatch(/Sentıment Analisiz/u);
    expect(prose).toMatch(/Klouzd lup/u);
    expect(prose).toMatch(/Çetcipiti/u);
    expect(prose).toMatch(/Trend yol/u);
    expect(prose).toMatch(/Hepsi burada/u);
    expect(prose).toMatch(/Ama zon/u);
    expect(prose).toMatch(/Baybaks/u);
    expect(prose).toMatch(/Bantıl/u);
    expect(prose).toMatch(/Klod/u);
    expect(prose).toMatch(/Cemini/u);
    expect(prose).not.toMatch(/\bSentiment Analysis\b/u);
    expect(prose).not.toMatch(/\bClosed-Loop\b/u);
    expect(prose).not.toMatch(/\bChatGPT\b/u);
    expect(prose).not.toMatch(/\bTrendyol\b/u);
    expect(prose).not.toMatch(/\bHepsiburada\b/u);
    expect(prose).not.toMatch(/\bAmazon\b/u);
    expect(prose).not.toMatch(/\bBuybox\b/u);
    expect(prose).not.toMatch(/\bBundle\b/u);
    expect(prose).not.toMatch(/\bClaude\b/u);
    expect(prose).not.toMatch(/\bGemini\b/u);

    const paragraphs = loadAcademySpokenScriptParagraphs(LESSON_KEY);
    expect(paragraphs).toEqual(loadAcademySpokenScriptMarkdownParagraphs(LESSON_KEY));
    expect(paragraphs.length).toBe(12);
    const breathChunks = paragraphs.flatMap((paragraph) => splitAcademyTtsBreathChunks(paragraph));
    expect(breathChunks.length).toBeGreaterThanOrEqual(ACADEMY_TTS_LESSON_REQUEST_MIN);
    expect(breathChunks.length).toBeLessThanOrEqual(ACADEMY_TTS_LESSON_BREATH_BLOCK_MAX);

    const cues = loadAcademyLessonCues(LESSON_KEY);
    expect(cues).toHaveLength(4);
    expect(cues.map((cue) => cue.id)).toEqual(["cue-01", "cue-02", "cue-03", "cue-04"]);
    expect(cues[0]).toMatchObject({
      start: 0,
      end: 90,
      section: "Isınma & İş Problemi",
    });
    expect(cues[1]).toMatchObject({ start: 90, end: 300, section: "Temel Yöntem" });
    expect(cues[2]).toMatchObject({ start: 300, end: 510, section: "İstisna & Kritik Durum" });
    expect(cues[3]).toMatchObject({ start: 510, end: 600, section: "Özet & Saha Görevi" });
    expect(academyLessonCueSpokenDuration(cues)).toBe(600);

    const cueScript = cues.flatMap((cue) => cue.paragraphs ?? []).join(" ");
    expect(cueScript).toMatch(/\bSentiment Analysis\b/u);
    expect(cueScript).toMatch(/\bClosed-Loop\b/u);
    expect(cueScript).toMatch(/\bChatGPT\b/u);
    expect(cueScript).toMatch(/\bTrendyol\b/u);
    expect(cueScript).toMatch(/\bHepsiburada\b/u);
    expect(cueScript).toMatch(/\bAmazon\b/u);
    expect(cueScript).toMatch(/\bBuybox\b/u);
    expect(cueScript).toMatch(/\bBundle\b/u);
    expect(cueScript).toMatch(/\bClaude\b/u);
    expect(cueScript).toMatch(/\bGemini\b/u);
    expect(cueScript).not.toMatch(/Sentıment Analisiz/u);
    expect(cueScript).not.toMatch(/Klouzd lup/u);
    expect(cueScript).not.toMatch(/Çetcipiti/u);
    expect(cueScript).not.toMatch(/Trend yol/u);
    expect(cueScript).not.toMatch(/Hepsi burada/u);
    expect(cueScript).not.toMatch(/Ama zon/u);
    expect(cueScript).not.toMatch(/Baybaks/u);
    expect(cueScript).not.toMatch(/Bantıl/u);
    expect(cues[0]?.text).toMatch(/\bBuybox\b/u);
    expect(cues[3]?.text).toMatch(/\bBundle\b/u);

    const fromCues = collapseAcademyLessonProse(cues.flatMap((cue) => cue.paragraphs ?? []).join(" "));
    const fromMd = collapseAcademyLessonProse(
      readSrc("lib/academy/spoken-scripts/02_ecommerce_ai-4.md")
        .replace(/<!--[\s\S]*?-->/gu, " ")
        .replace(/\s+/gu, " ")
        .trim(),
    );
    expect(fromCues).toBe(fromMd);

    const at = (currentTime: number) =>
      academyCinemaActiveCue({
        cues,
        currentTime,
        audioDuration: 600,
        spokenDuration: 600,
        audioLeadInSec: 0,
        clock: "media",
      })?.id;
    expect(at(0)).toBe("cue-01");
    expect(at(89.9)).toBe("cue-01");
    expect(at(90)).toBe("cue-02");
    expect(at(300)).toBe("cue-03");
    expect(at(510)).toBe("cue-04");
    expect(at(599.9)).toBe("cue-04");

    const section = readSrc("lib/academy/curricula/ecommerce_ai/section_4.ts");
    expect(section).not.toContain("cue-01");
    expect(readSrc("scripts/generate-academy-lesson-audio.ts")).toContain("02_ecommerce_ai-4");
  });

  it("göz katmanı dört rakip / Buybox paneli kartını cue başlangıcına bağlar", () => {
    expect(hasAcademyLessonVisualStage(LESSON_KEY)).toBe(true);
    expect(academyVisualStageCardsMatchCues(LESSON_KEY)).toBe(true);
    const stage = loadAcademyLessonVisualStage(LESSON_KEY);
    expect(stage).not.toBeNull();
    expect(stage?.posterSrc).toBe("/academy/cinema/02_ecommerce_ai-1-eye.jpg");
    expect(stage?.cards).toHaveLength(4);
    expect(stage?.cards[0]?.cueId).toBe("cue-01");
    expect(stage?.cards[0]?.startSec).toBe(0);
    expect(stage?.cards[0]?.durationSec).toBe(8);
    expect(stage?.cards[0]?.kind).toBe("nano");
    expect(stage?.cards.map((card) => card.cueId)).toEqual(["cue-01", "cue-02", "cue-03", "cue-04"]);
    const playback = loadAcademyLessonPlaybackCues(LESSON_KEY);
    expect(stage?.cards.map((card) => card.startSec)).toEqual(playback.map((cue) => cue.start));
    expect(academyVisualStageCinemaKind(stage!)).toBe("canvas");
    expect(existsSync(POSTER)).toBe(true);
    expect(readFileSync(POSTER).subarray(0, 3)).toEqual(Buffer.from([0xff, 0xd8, 0xff]));
  });

  it("diskteki mühürlü WAV timings ile karaoke katmanını açar", () => {
    const timings = loadAcademySealedAudioTimings(LESSON_KEY);
    expect(timings).not.toBeNull();
    expect(timings!.durationSec).toBeGreaterThan(540);
    expect(timings!.pieces.length).toBe(12);
    const diskPath = academyLessonAudioReleaseDiskPath("02_ecommerce_ai", LESSON_KEY, ROOT);
    expect(existsSync(diskPath)).toBe(true);
    expect(readFileSync(diskPath).subarray(0, 3).toString()).toBe("ID3");
    const layer = academyCitizenPlayerLayer("02_ecommerce_ai", LESSON_KEY);
    expect(layer.kind).toBe("article+karaoke");
    if (layer.kind !== "article+karaoke") {
      return;
    }
    expect(layer.durationSec).toBe(Math.round(timings!.durationSec));
    expect(layer.cues.length).toBeGreaterThan(timings!.pieces.length);
  });
});
