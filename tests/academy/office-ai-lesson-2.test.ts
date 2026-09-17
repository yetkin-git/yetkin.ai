import { describe, expect, it } from "vitest";
import { academyCitizenPlayerLayer } from "@/lib/academy/citizen-player-layer";
import { loadAcademyCinemaCueSlides } from "@/lib/academy/cinema-cue-catalog";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { officeAiMasteryModule } from "@/lib/academy/curricula/office_ai";
import { academyExcelFocusZoomActive } from "@/lib/academy/excel-focus-zoom";
import { academyExcelMouseState } from "@/lib/academy/excel-mouse-pointer";
import {
  academyActivePunchcard,
  academyPunchcardLabel,
  hasAcademyLessonCues,
  loadAcademyLessonCues,
  loadAcademyLessonPlaybackCues,
} from "@/lib/academy/lesson-cues";
import { hasAcademyLessonVisualStage, loadAcademyLessonVisualStage } from "@/lib/academy/lesson-visual-stage";
import { academyVisualCompareStage } from "@/lib/academy/excel-workspace";
import {
  ACADEMY_OFFICE_AI_2_COMPARE_AFTER_LABEL,
  ACADEMY_OFFICE_AI_2_COMPARE_BEFORE_LABEL,
  ACADEMY_OFFICE_AI_2_POCKET_STEPS,
} from "@/lib/academy/lesson-beat-visual";
import {
  ACADEMY_BED_BREATH_GAIN,
  ACADEMY_BED_OUTRO_PEAK_GAIN,
  academyBedDuckGain,
  academyBedOutroTailSec,
} from "@/lib/academy/lesson-bed-duck";
import { loadAcademySealedAudioTimings } from "@/lib/academy/lesson-audio-timings";
import {
  ACADEMY_INTRO_GENERIC_SEC,
  academyLessonIntroIsActive,
  academyLessonSpeechHasStarted,
  academyOutroSummaryLabels,
} from "@/lib/academy/lesson-intro";
import { ACADEMY_OFFICE_AI_1_VEO_ASSET_KEY } from "@/lib/academy/lesson-veo";
import { loadAcademyLessonExam } from "@/lib/academy/lesson-exams";
import { isAcademyLessonAudioSealed } from "@/lib/academy/pilot-sku";
import {
  isAcademySpokenScriptLessonKey,
  loadAcademySpokenScriptMarkdownParagraphs,
  loadAcademySpokenScriptProse,
} from "@/lib/academy/spoken-scripts";

const SLUG = "01_office_ai";
const KEY = "01_office_ai-2";
const PUNCHCARDS = [
  "GİRİŞ KÖPRÜSÜ",
  "HOŞ GELDİN",
  "UZUN RAPOR",
  "ÖZET İSTE",
  "KARAR NOTU",
  "FARK ORTADA",
  "CEBİNE KOY",
  "SIRA SENDE",
] as const;

describe("01_office_ai bölüm 2 — rapor otomasyonu Altın Şablon", () => {
  it("makale Gözde girişi, yönetim özeti ve L3 köprüsü taşır", () => {
    const lessons = curriculumForCourseSlug(SLUG);
    expect(lessons).toHaveLength(9);
    expect(officeAiMasteryModule.voiceConfig.voice).toBe("Callirrhoe");
    const lesson = lessons.find((row) => row.key === KEY)!;
    expect(lesson.key).toBe(KEY);
    expect(lesson.order).toBe(3);
    expect(lesson.title).toMatch(/Rapor Otomasyonu/u);
    expect(lesson.body).toMatch(/Selamlar, ben Gözde/u);
    expect(lesson.body).toMatch(/A1 hücresi/u);
    expect(lesson.body).toMatch(/yönetici özeti|yönetim özeti/u);
    expect(lesson.body).toMatch(/Sunum Fabrikası/u);
    expect(lesson.body).toMatch(/4\. ders|dördüncü ders|Sunum Fabrikası/iu);
    expect(lesson.body).not.toMatch(/kirli/iu);
  });

  it("konuşma metni 14 paragraf, punchcardlar ve pekiştirme durakları sırayla parlar", () => {
    expect(isAcademySpokenScriptLessonKey(KEY)).toBe(true);
    expect(hasAcademyLessonCues(KEY)).toBe(true);
    const spoken = loadAcademySpokenScriptMarkdownParagraphs(KEY);
    expect(spoken).toHaveLength(14);
    const prose = loadAcademySpokenScriptProse(KEY);
    expect(prose).toMatch(/Selamlar, ben Gözde/u);
    expect(prose).toMatch(/düzensiz tablo/iu);
    expect(prose).toMatch(/A bir hücresi/u);
    expect(prose).toMatch(/toplantı/iu);
    expect(prose).toMatch(/üç madde/iu);
    expect(prose).toMatch(/Sunum Fabrikası/u);
    expect(prose).not.toMatch(/kirli/iu);
    const cues = loadAcademyLessonCues(KEY);
    expect(cues.map((cue) => academyPunchcardLabel(cue.text))).toEqual([...PUNCHCARDS]);
    expect(cues.map((cue) => cue.paragraphs?.length ?? 0)).toEqual([1, 2, 2, 2, 2, 2, 1, 2]);
    expect(academyActivePunchcard(cues, 0)).toBeNull();
    expect(cues[0]!.start).toBe(ACADEMY_INTRO_GENERIC_SEC);
    expect(academyActivePunchcard(cues, 2)?.label).toBe("GİRİŞ KÖPRÜSÜ");
    expect(cues[0]!.end).toBeGreaterThanOrEqual(38);
    const pocket = cues.find((cue) => academyPunchcardLabel(cue.text) === "CEBİNE KOY");
    expect(pocket?.paragraphs?.join(" ")).toMatch(/1\./u);
    expect(pocket?.paragraphs?.join(" ")).toMatch(/toplam/iu);
    expect(pocket?.paragraphs?.join(" ")).toMatch(/trend/iu);
    expect(pocket?.paragraphs?.join(" ")).toMatch(/anomali|risk/iu);
    expect(pocket?.paragraphs?.join(" ")).toMatch(/eylem/iu);
    expect(pocket?.end).toBeGreaterThan(pocket!.start + 35);
  });

  it("Beat 3 split-screen sol 10 sayfalık döküm, sağ 3 maddelik özet basar; spoiler kapalı", () => {
    expect(hasAcademyLessonVisualStage(KEY)).toBe(true);
    expect(loadAcademyLessonVisualStage(KEY)?.cards).toHaveLength(8);
    expect(loadAcademyLessonVisualStage(KEY)?.cards[0]?.kind).toBe("veo");
    expect(loadAcademyLessonVisualStage(KEY)?.cards[0]?.src).toBe(ACADEMY_OFFICE_AI_1_VEO_ASSET_KEY);
    const slides = loadAcademyCinemaCueSlides(KEY);
    expect(slides).toHaveLength(8);
    expect(slides.map((slide) => slide.section)).toEqual([...PUNCHCARDS]);
    expect(slides[3]?.copilot?.hideReply).toBe(true);
    expect(slides[3]?.visualMode).toBe("live");
    expect(slides[4]?.visualMode).toBe("split");
    expect(slides[5]?.visualMode).toBe("split");
    expect(slides[5]?.compare?.beforeCueIndex).toBe(3);
    expect(slides[5]?.compare?.beforeLabel).toBe(ACADEMY_OFFICE_AI_2_COMPARE_BEFORE_LABEL);
    expect(slides[5]?.compare?.afterLabel).toBe(ACADEMY_OFFICE_AI_2_COMPARE_AFTER_LABEL);
    const compare = academyVisualCompareStage(KEY, "cue-06");
    expect(compare).not.toBeNull();
    expect(compare?.beforeLabel).toBe("ÖNCE (10 SAYFALIK DÖKÜM)");
    expect(compare?.afterLabel).toBe("SONRA (3 MADDELİK YÖNETİM ÖZETİ - AI)");
    expect(compare?.beat).toBe("comparison");
    expect(academyVisualCompareStage(KEY, "cue-01")).toBeNull();
    expect(academyVisualCompareStage(KEY, "cue-05")).not.toBeNull();
    expect(academyVisualCompareStage(KEY, "cue-04")).toBeNull();
    expect(academyVisualCompareStage(KEY, "cue-08")).toBeNull();
    expect(ACADEMY_OFFICE_AI_2_POCKET_STEPS).toEqual([
      "Toplam ve trendi iste",
      "Anomali ve riskleri sor",
      "Eylem cümlesine çevir",
    ]);
  });

  it("giriş nefesi 2.0 sn, outro 0.70 zirve, zoom ve sanal fare cue-04’te açılır", () => {
    expect(ACADEMY_INTRO_GENERIC_SEC).toBe(2);
    expect(academyLessonIntroIsActive(KEY, 0)).toBe(true);
    expect(academyLessonIntroIsActive(KEY, 1.9)).toBe(true);
    expect(academyLessonSpeechHasStarted(KEY, 2)).toBe(true);
    expect(academyBedOutroTailSec(KEY)).toBeGreaterThan(0);
    expect(academyOutroSummaryLabels(KEY)).toEqual(["Toplam ve trend", "Anomali ve risk", "Eylem cümlesi"]);
    const cues = loadAcademyLessonPlaybackCues(KEY);
    const cue04 = cues.find((cue) => cue.id === "cue-04");
    expect(cue04).toBeTruthy();
    expect(academyExcelFocusZoomActive(KEY, cue04!.start)).toBe(true);
    expect(academyExcelMouseState(KEY, cue04!.start + 0.05)?.visible).toBe(true);
    const pieces = loadAcademySealedAudioTimings(KEY)?.pieces ?? [];
    expect(pieces[0]?.start).toBe(2);
    expect(academyBedDuckGain(0.5, pieces)).toBe(ACADEMY_BED_BREATH_GAIN);
    const lastEnd = pieces.at(-1)?.end ?? 0;
    expect(lastEnd).toBe(512.4);
    expect(academyBedDuckGain(lastEnd, pieces)).toBe(ACADEMY_BED_OUTRO_PEAK_GAIN);
  });

  it("ses mührü karaoke katmanını açar; mini sınav baraj 70 durur", () => {
    expect(isAcademyLessonAudioSealed(SLUG, KEY)).toBe(true);
    expect(academyCitizenPlayerLayer(SLUG, KEY).kind).toBe("article+karaoke");
    const exam = loadAcademyLessonExam(KEY);
    expect(exam?.passScore).toBe(70);
    expect(exam?.questions.map((row) => row.id)).toEqual(["q_off_l2_1", "q_off_l2_2", "q_off_l2_3"]);
  });
});
