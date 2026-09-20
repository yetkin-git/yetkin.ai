import { describe, expect, it } from "vitest";
import {
  academyHowtoActiveIndex,
  academyHowtoSteps,
  academyPocketChecklistSteps,
  ACADEMY_OFFICE_AI_0_HOWTO_STEPS,
  ACADEMY_OFFICE_AI_0_POCKET_STEPS,
} from "@/lib/academy/lesson-beat-visual";
import {
  academyCourseSealedDurationSec,
  academyLessonBedPlaybackSrc,
} from "@/lib/academy/lesson-audio";
import { loadAcademySealedAudioTimings } from "@/lib/academy/lesson-audio-timings";
import {
  academyPunchcardLabel,
  loadAcademyLessonCues,
  loadAcademyLessonPlaybackCues,
} from "@/lib/academy/lesson-cues";
import { academyBedOutroTailSec, ACADEMY_BED_OUTRO_TAIL_SEC } from "@/lib/academy/lesson-bed-duck";
import { academyAiDeskPinnedForLesson } from "@/lib/academy/ai-desk";
import { ACADEMY_CINEMA_CUE_SLIDE_LESSON_KEYS } from "@/lib/academy/cinema-cue-catalog";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { OFFICE_AI_PREP_STRIP } from "@/lib/academy/curricula/office_ai/prep";
import {
  academyLessonIntroOffsetSec,
  academyOutroSummaryLabels,
  ACADEMY_OFFICE_AI_0_OUTRO_SUMMARY_LABELS,
} from "@/lib/academy/lesson-intro";
import { loadAcademyLessonVisualStage } from "@/lib/academy/lesson-visual-stage";
import {
  academyLessonWarmupVeoAssetKey,
  academyLessonWarmupVeoCueId,
  ACADEMY_OFFICE_AI_1_VEO_ASSET_KEY,
} from "@/lib/academy/lesson-veo";
import { loadAcademyTeleprompterFlow } from "@/lib/academy/lesson-teleprompter-flow";
import { academyMediaReleaseJobForPrepStrip } from "@/lib/academy/media-release-seal";
import {
  ACADEMY_MEDIA_SEALED_AUDIO,
  academyMediaSealedWavCount,
} from "@/lib/academy/pilot-sku";
import {
  academyPrepStripAudioDurationSec,
  academyPrepStripAudioPlaybackSrc,
  academyPrepStripPlayerLayer,
  ACADEMY_PREP_STRIP_AUDIO_SEALED,
  isAcademyPrepStripAudioSealed,
} from "@/lib/academy/prep-strip";
import {
  ACADEMY_ARTICLE_SPOKEN_FORBIDDEN,
  academyProseJaccard,
} from "@/lib/academy/article-spoken-diff";
import {
  ACADEMY_SPOKEN_SCRIPT_LESSON_KEYS,
  isAcademySpokenScriptLessonKey,
  loadAcademyCueParagraphsAsSpoken,
  loadAcademySpokenScriptMarkdownParagraphs,
  loadAcademySpokenScriptRawMarkdown,
} from "@/lib/academy/spoken-scripts";

const SLUG = "01_office_ai";
const KEY = "01_office_ai-0";
const PUNCHCARDS = [
  "TANIŞMA",
  "HESAP AÇ",
  "ÜCRET FARKI",
  "SOHBET EKRANI",
  "İLK İSTEM",
  "HANGİ DİL",
  "CEBİNE KOY",
  "SIRA SENDE",
] as const;

describe("Ders 0 fırın hazırlığı — konuşma metni + cue + timings", () => {
  it("stüdyo konuşma metni 8 paragraf, şerit kazanımı ve 1. ders köprüsü taşır", () => {
    const raw = loadAcademySpokenScriptRawMarkdown(KEY);
    expect(raw.length).toBeGreaterThan(200);
    expect(raw).toMatch(/Selamlar, ben Gözde/u);
    expect(raw).toMatch(/Bu şeridin sonunda .+ tek başına yapacaksın/u);
    expect(raw).toMatch(/Hazırsan 1\. derse geç: Tablonu Konuştur/u);
    expect(raw).not.toMatch(/Sınav, 9\. ders bitince açılır/u);
    expect(raw).not.toMatch(/Sınav şimdi açıldı/u);
    expect(raw).not.toMatch(/Baraj 70 puandır/u);
    expect(raw).not.toMatch(/##\s/u);
    for (const pattern of ACADEMY_ARTICLE_SPOKEN_FORBIDDEN) {
      expect(raw, String(pattern)).not.toMatch(pattern);
    }
    expect(raw).not.toMatch(/\b(?:xlsx|docx|pptx)\b/iu);
    const paras = loadAcademySpokenScriptMarkdownParagraphs(KEY);
    expect(paras).toHaveLength(8);
  });

  it("makale (prep.ts) ile konuşma metni aynı şeridi anlatır", () => {
    const spoken = loadAcademySpokenScriptRawMarkdown(KEY);
    const jaccard = academyProseJaccard(OFFICE_AI_PREP_STRIP.contentMarkdown, spoken);
    expect(jaccard).toBeGreaterThan(0.9);
    expect(OFFICE_AI_PREP_STRIP.contentMarkdown).toMatch(/Ham Excel tablosu/u);
  });

  it("cue 8 kart, punchcard sırası ve fırın öncesi duvar saati kilitlidir", () => {
    const cues = loadAcademyLessonCues(KEY);
    expect(cues).toHaveLength(8);
    expect(cues.map((cue) => academyPunchcardLabel(cue.text))).toEqual([...PUNCHCARDS]);
    expect(cues.map((cue) => cue.paragraphs?.length ?? 0)).toEqual([1, 1, 1, 1, 1, 1, 1, 1]);
    expect(cues[0]?.start).toBe(2);
    // Ekran metni ham terimi korur; fonetik yalnız TTS katmanındadır.
    const blob = cues.flatMap((cue) => cue.paragraphs ?? []).join(" ");
    expect(blob).toMatch(/ChatGPT/u);
    expect(blob).toMatch(/KVKK/u);
    expect(blob).toMatch(/A1 hücresi/u);
    expect(loadAcademyLessonPlaybackCues(KEY)).toHaveLength(8);
  });

  it("timings TAHMİNİ plandır: 8 parça, fonetikli TTS metni, mühürsüz cacheV", () => {
    const timings = loadAcademySealedAudioTimings(KEY);
    expect(timings).not.toBeNull();
    expect(timings?.lessonKey).toBe(KEY);
    expect(timings?.pauseSec).toBe(0.4);
    expect(timings?.durationSec).toBe(205.317);
    expect(timings?.cacheV).toBe(1);
    expect(timings?.pieces).toHaveLength(8);
    expect(timings?.pieces[0]?.start).toBe(2);
    expect(timings?.pieces.at(-1)?.end).toBe(205.317);
    expect(timings?.pieces.map((piece) => piece.cueId)).toEqual([
      "cue-01",
      "cue-02",
      "cue-03",
      "cue-04",
      "cue-05",
      "cue-06",
      "cue-07",
      "cue-08",
    ]);
    const p1 = timings?.pieces[1]?.text ?? "";
    expect(p1).toMatch(/Çetcipiti/u);
    expect(p1).toMatch(/Cemini/u);
    expect(p1).toMatch(/Klod/u);
    expect(p1).not.toMatch(/ChatGPT/u);
    expect(timings?.pieces[5]?.text).toMatch(/Kavekaka/u);
    expect(timings?.pieces[5]?.text).not.toMatch(/KVKK/u);
  });

  it("konuşma metni cue paragraflarıyla birebir hizalıdır (bake kapısı)", () => {
    const fromMd = loadAcademySpokenScriptMarkdownParagraphs(KEY);
    const fromCues = loadAcademyCueParagraphsAsSpoken(KEY);
    expect(fromMd).toHaveLength(8);
    expect(fromCues).toEqual(fromMd);
    expect(loadAcademyTeleprompterFlow(KEY)).toHaveLength(8);
  });
});

describe("Ders 0 oynatıcı altyapısı — ses kapalı, sahne hazır", () => {
  it("ses mührü kapalıdır; katman makale, adres ve süre planlıdır", () => {
    expect(ACADEMY_PREP_STRIP_AUDIO_SEALED["01_office_ai"]).toBe(false);
    expect(isAcademyPrepStripAudioSealed(SLUG)).toBe(false);
    expect(academyPrepStripPlayerLayer(SLUG)).toEqual({ kind: "article" });
    expect(academyPrepStripAudioPlaybackSrc(SLUG)).toBe(
      "/media/academy/audio/01_office_ai/01_office_ai-0.mp3?v=1",
    );
    expect(academyPrepStripAudioDurationSec(SLUG)).toBe(205);
    expect(academyPrepStripPlayerLayer("02_ecommerce_ai")).toEqual({ kind: "article" });
  });

  it("jenerik, outro, veo reuse ve dip müzik reuse kilitlidir", () => {
    expect(academyLessonIntroOffsetSec(KEY)).toBe(2);
    expect(academyOutroSummaryLabels(KEY)).toEqual([...ACADEMY_OFFICE_AI_0_OUTRO_SUMMARY_LABELS]);
    expect(academyLessonWarmupVeoAssetKey(KEY)).toBe(ACADEMY_OFFICE_AI_1_VEO_ASSET_KEY);
    expect(academyLessonWarmupVeoCueId(KEY)).toBe("cue-01");
    expect(academyBedOutroTailSec(KEY)).toBe(ACADEMY_BED_OUTRO_TAIL_SEC);
    expect(academyLessonBedPlaybackSrc(SLUG, "01_office_ai-1")).toContain("01_office_ai-1.bed.mp3");
  });

  it("nasıl-yapılır bandı ve cep kartı şerit bölümlerini izler", () => {
    expect(academyHowtoSteps(KEY)).toEqual([...ACADEMY_OFFICE_AI_0_HOWTO_STEPS]);
    expect(ACADEMY_OFFICE_AI_0_HOWTO_STEPS.map((step) => step.label)).toEqual([
      "Hesabı Aç",
      "Kutuyu Tanı",
      "İlk İstemi Yaz",
    ]);
    expect(academyHowtoActiveIndex(KEY, "TANIŞMA")).toBe(0);
    expect(academyHowtoActiveIndex(KEY, "SOHBET EKRANI")).toBe(1);
    expect(academyHowtoActiveIndex(KEY, "İLK İSTEM")).toBe(2);
    expect(academyHowtoActiveIndex(KEY, "CEBİNE KOY")).toBe(-1);
    expect(academyPocketChecklistSteps(KEY, "CEBİNE KOY")).toEqual([
      ...ACADEMY_OFFICE_AI_0_POCKET_STEPS,
    ]);
    expect(academyPocketChecklistSteps(KEY, "SIRA SENDE")).toBeNull();
    expect(academyAiDeskPinnedForLesson(KEY)).toBe("chatgpt");
  });

  it("göz sahnesi 8 kart kurar; ilk kart veo warmup reuse", () => {
    const stage = loadAcademyLessonVisualStage(KEY);
    expect(stage).not.toBeNull();
    expect(stage?.cards).toHaveLength(8);
    expect(stage?.cards[0]?.kind).toBe("veo");
    expect(stage?.cards[0]?.cueId).toBe("cue-01");
    expect(stage?.cards[0]?.src).toBe(ACADEMY_OFFICE_AI_1_VEO_ASSET_KEY);
    expect(stage?.cards[0]?.durationSec).toBe(8);
  });
});

describe("Ders 0 fırın işi + 101 dokunulmazlığı", () => {
  it("hazırlık fırın işi müfredat taslağı olmadan 8 tur kurar", () => {
    const job = academyMediaReleaseJobForPrepStrip(
      SLUG,
      KEY,
      OFFICE_AI_PREP_STRIP.title,
      "gemini-tts-test",
    );
    expect(job.lessonKey).toBe(KEY);
    expect(job.turns).toHaveLength(8);
    expect(job.turns[0]?.voice).toBe("Callirrhoe");
    expect(job.mediaReleaseSeal).toMatch(/^[0-9a-f]{64}$/u);
    expect(job.objectPath).toBe("academy/audio/01_office_ai/01_office_ai-0.wav");
    expect(job.publicPath).toContain("/media/academy/audio/01_office_ai/01_office_ai-0.mp3");
  });

  it("101 mührü değişmez: 9 ders, 9 kaset, 9 konuşma metni, 33 sinema anahtarı", () => {
    expect(Object.values(ACADEMY_MEDIA_SEALED_AUDIO).flat()).toHaveLength(9);
    expect(academyMediaSealedWavCount()).toBe(9);
    expect(ACADEMY_SPOKEN_SCRIPT_LESSON_KEYS).toHaveLength(9);
    expect(isAcademySpokenScriptLessonKey(KEY)).toBe(false);
    expect(curriculumForCourseSlug(SLUG)).toHaveLength(9);
    expect(ACADEMY_CINEMA_CUE_SLIDE_LESSON_KEYS).toHaveLength(33);
    const total = academyCourseSealedDurationSec(SLUG);
    expect(Math.abs(total - 5019.311)).toBeLessThanOrEqual(0.01);
  });
});
