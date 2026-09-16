import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ACADEMY_BAKED_MICRO_VIDEO_KEYS, isAcademyMicroVideoBaked } from "@/lib/academy/baked-micro-videos";
import { academyBedDuckGain, ACADEMY_BED_BREATH_GAIN, ACADEMY_BED_SPEECH_GAIN, ACADEMY_BED_OUTRO_PEAK_GAIN, ACADEMY_BED_OUTRO_TAIL_SEC } from "@/lib/academy/lesson-bed-duck";
import { loadAcademySealedAudioTimings } from "@/lib/academy/lesson-audio-timings";
import { academyActivePunchcard, loadAcademyLessonCues, loadAcademyLessonPlaybackCues } from "@/lib/academy/lesson-cues";
import {
  ACADEMY_INTRO_GENERIC_SEC,
  academyLessonIntroIsActive,
  academyLessonOutroIsActive,
  academyLessonSpeechHasStarted,
} from "@/lib/academy/lesson-intro";
import { academyMicroVideoPublicSources } from "@/lib/academy/lesson-media";
import { loadAcademyLessonVisualStage, academyVisualVeoPunchHasEnded } from "@/lib/academy/lesson-visual-stage";
import { ACADEMY_OFFICE_AI_1_VEO_ASSET_KEY } from "@/lib/academy/lesson-veo";

const ROOT = process.cwd();
const KEY = "01_office_ai-1";

describe("01_office_ai-1 altın model — giriş nefesi ve Veo Warm-up", () => {
  it("konuşma 2.0 saniyede başlar; 0–2 sn punchcard ve TTS yok", () => {
    expect(ACADEMY_INTRO_GENERIC_SEC).toBe(2);
    expect(academyLessonIntroIsActive(KEY, 0)).toBe(true);
    expect(academyLessonIntroIsActive(KEY, 1.9)).toBe(true);
    expect(academyLessonIntroIsActive(KEY, 2)).toBe(false);
    expect(academyLessonSpeechHasStarted(KEY, 1.99)).toBe(false);
    expect(academyLessonSpeechHasStarted(KEY, 2)).toBe(true);
    const cues = loadAcademyLessonPlaybackCues(KEY);
    expect(cues[0]?.start).toBe(2);
    expect(academyActivePunchcard(cues, 0)).toBeNull();
    expect(academyActivePunchcard(cues, 1.5)).toBeNull();
    expect(academyActivePunchcard(cues, 2)?.label).toBe("GİRİŞ KÖPRÜSÜ");
    const pieces = loadAcademySealedAudioTimings(KEY)?.pieces ?? [];
    expect(pieces[0]?.start).toBe(2);
    expect(academyBedDuckGain(0.5, pieces)).toBe(ACADEMY_BED_BREATH_GAIN);
    expect(academyBedDuckGain(2, pieces)).toBe(ACADEMY_BED_BREATH_GAIN);
    expect(academyBedDuckGain(8, pieces)).toBe(ACADEMY_BED_SPEECH_GAIN);
    const lastEnd = pieces.at(-1)?.end ?? 0;
    expect(lastEnd).toBeGreaterThan(500);
    expect(academyBedDuckGain(lastEnd - 0.05, pieces)).toBeGreaterThan(ACADEMY_BED_SPEECH_GAIN);
    expect(academyBedDuckGain(lastEnd, pieces)).toBe(ACADEMY_BED_OUTRO_PEAK_GAIN);
    expect(academyBedDuckGain(lastEnd + 1.5, pieces)).toBe(ACADEMY_BED_OUTRO_PEAK_GAIN);
    expect(academyBedDuckGain(lastEnd + ACADEMY_BED_OUTRO_TAIL_SEC, pieces)).toBe(0);
    expect(academyLessonOutroIsActive(KEY, lastEnd, lastEnd)).toBe(true);
    expect(academyLessonOutroIsActive(KEY, lastEnd + ACADEMY_BED_OUTRO_TAIL_SEC, lastEnd)).toBe(false);
  });

  it("Warm-up cue-01 Veo 8 sn katmanını basar; senaryo çoklu AI eko-sistemini taşır", () => {
    const stage = loadAcademyLessonVisualStage(KEY);
    expect(stage?.cards[0]?.kind).toBe("veo");
    expect(stage?.cards[0]?.src).toBe(ACADEMY_OFFICE_AI_1_VEO_ASSET_KEY);
    expect(stage?.cards[0]?.durationSec).toBe(8);
    expect(isAcademyMicroVideoBaked(ACADEMY_OFFICE_AI_1_VEO_ASSET_KEY)).toBe(true);
    expect(ACADEMY_BAKED_MICRO_VIDEO_KEYS).toContain(ACADEMY_OFFICE_AI_1_VEO_ASSET_KEY);
    const mp4 = join(ROOT, "public", academyMicroVideoPublicSources(ACADEMY_OFFICE_AI_1_VEO_ASSET_KEY).mp4.slice(1));
    expect(existsSync(mp4), mp4).toBe(true);
    const spoken = loadAcademyLessonCues(KEY)
      .flatMap((cue) => cue.paragraphs ?? [])
      .join(" ");
    expect(spoken).toMatch(/ChatGPT/u);
    expect(spoken).toMatch(/Claude/u);
    expect(spoken).toMatch(/Gemini/u);
    expect(spoken).toMatch(/API/u);
    expect(spoken).not.toMatch(/kopyala-yapıştır/u);
    expect(spoken).not.toMatch(/taşıma su/iu);
    expect(spoken).toMatch(/ataş simgesinden/u);
    expect(spoken).not.toMatch(/gemini\.google\.com/u);
    expect(spoken).not.toMatch(/Favoriler veya Uygulamalar/u);
    expect(spoken).not.toMatch(/Gmail'de Gemini yerleşik eklentisini/u);
    expect(spoken).toMatch(/Üç Kapı/u);
    expect(spoken).toMatch(/Copilot lisansın varsa/u);
    const veo = stage?.cards[0];
    expect(veo).toBeTruthy();
    expect(academyVisualVeoPunchHasEnded(veo!, veo!.startSec + 7.99)).toBe(false);
    expect(academyVisualVeoPunchHasEnded(veo!, veo!.startSec + 8)).toBe(true);
  });
});
