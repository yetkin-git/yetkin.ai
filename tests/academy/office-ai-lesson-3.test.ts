import { describe, expect, it } from "vitest";
import { loadAcademyCinemaCueSlides } from "@/lib/academy/cinema-cue-catalog";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { officeAiMasteryModule } from "@/lib/academy/curricula/office_ai";
import { academyExcelFocusZoomActive } from "@/lib/academy/excel-focus-zoom";
import { academyExcelMouseState } from "@/lib/academy/excel-mouse-pointer";
import { academyVisualCompareStage } from "@/lib/academy/excel-workspace";
import {
  ACADEMY_OFFICE_AI_3_COMPARE_AFTER_LABEL,
  ACADEMY_OFFICE_AI_3_COMPARE_BEFORE_LABEL,
  ACADEMY_OFFICE_AI_3_POCKET_STEPS,
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
import {
  academyPunchcardLabel,
  hasAcademyLessonCues,
  loadAcademyLessonCues,
} from "@/lib/academy/lesson-cues";
import { academyCitizenPlayerLayer } from "@/lib/academy/citizen-player-layer";
import { hasAcademyLessonVisualStage, loadAcademyLessonVisualStage } from "@/lib/academy/lesson-visual-stage";
import { loadAcademyLessonExam } from "@/lib/academy/lesson-exams";
import { ACADEMY_OFFICE_AI_1_VEO_ASSET_KEY } from "@/lib/academy/lesson-veo";
import { isAcademyLessonAudioSealed } from "@/lib/academy/pilot-sku";
import { dronAcademyPunchcardsForLesson } from "../../apps/rail-is/src/ui/academy-punchcards";
import {
  isAcademySpokenScriptLessonKey,
  loadAcademySpokenScriptMarkdownParagraphs,
  loadAcademySpokenScriptProse,
} from "@/lib/academy/spoken-scripts";

const SLUG = "01_office_ai";
const KEY = "01_office_ai-3";
const PUNCHCARDS = [
  "GİRİŞ KÖPRÜSÜ",
  "HOŞ GELDİN",
  "ŞABLON KAOSU",
  "SLAYT İSTE",
  "HİYERARŞİ",
  "FARK ORTADA",
  "CEBİNE KOY",
  "SIRA SENDE",
] as const;

describe("01_office_ai bölüm 3 — Sunum Fabrikası Altın Şablon", () => {
  it("makale Gözde girişi, slayt fabrikası ve L4 köprüsü taşır", () => {
    const lessons = curriculumForCourseSlug(SLUG);
    expect(lessons).toHaveLength(9);
    expect(officeAiMasteryModule.voiceConfig.voice).toBe("Callirrhoe");
    const lesson = lessons.find((row) => row.key === KEY)!;
    expect(lesson.key).toBe(KEY);
    expect(lesson.order).toBe(4);
    expect(lesson.title).toMatch(/Sunum Fabrikası/u);
  });

  it("Beat 3 split-screen sol düz metin yığını, sağ görsel hiyerarşili slayt; spoiler kapalı", () => {
    const slides = loadAcademyCinemaCueSlides(KEY);
    expect(slides).toHaveLength(8);
    expect(slides.every((slide) => slide.layout === "pptx")).toBe(true);
    expect(slides.map((slide) => slide.section)).toEqual([...PUNCHCARDS]);
    expect(slides[0]?.visualMode).toBe("veo");
    expect(loadAcademyLessonVisualStage(KEY)?.cards[0]?.src).toBe(ACADEMY_OFFICE_AI_1_VEO_ASSET_KEY);
    expect(slides[3]?.copilot?.hideReply).toBe(true);
    expect(slides[3]?.visualMode).toBe("live");
    expect(slides[4]?.visualMode).toBe("split");
    expect(slides[5]?.visualMode).toBe("split");
    expect(slides[5]?.compare?.beforeCueIndex).toBe(3);
    expect(slides[5]?.compare?.beforeLabel).toBe(ACADEMY_OFFICE_AI_3_COMPARE_BEFORE_LABEL);
    expect(slides[5]?.compare?.afterLabel).toBe(ACADEMY_OFFICE_AI_3_COMPARE_AFTER_LABEL);
    expect(JSON.stringify(slides[5]?.table)).toContain("54.650 TL");
    expect(JSON.stringify(slides[5]?.table)).toContain("Kaya Gıda A.Ş.");
    expect(JSON.stringify(slides[5]?.table)).toContain("%15");
    expect(slides[5]?.table?.note).toMatch(/Yıldız Tekstil/u);
    expect(ACADEMY_OFFICE_AI_3_POCKET_STEPS).toEqual([
      "Slayt başına tek fikir",
      "Görsel yönlendirmeyi yaz",
      "Taslağı aktar",
    ]);
  });

  it("giriş nefesi 2.0 sn, outro 0.70 zirve, zoom ve sanal fare cue-04’te açılır", () => {
    expect(ACADEMY_INTRO_GENERIC_SEC).toBe(2);
    expect(academyLessonIntroIsActive(KEY, 0)).toBe(true);
    expect(academyLessonIntroIsActive(KEY, 1.9)).toBe(true);
    expect(academyLessonSpeechHasStarted(KEY, 2)).toBe(true);
    expect(academyBedOutroTailSec(KEY)).toBeGreaterThan(0);
    expect(academyOutroSummaryLabels(KEY)).toEqual(["Tek fikir / slayt", "Görsel yönlendir", "Taslağı aktar"]);
    expect(loadAcademyCinemaCueSlides(KEY)[0]?.visualMode).toBe("veo");
    const pieces = loadAcademySealedAudioTimings(KEY)?.pieces ?? [];
    expect(pieces[0]?.start).toBe(2);
    expect(academyBedDuckGain(0.5, pieces)).toBe(ACADEMY_BED_BREATH_GAIN);
    const lastEnd = pieces.at(-1)?.end ?? 0;
    expect(lastEnd).toBe(527);
    expect(academyBedDuckGain(lastEnd, pieces)).toBe(ACADEMY_BED_OUTRO_PEAK_GAIN);
    expect(academyBedDuckGain(lastEnd + 1.5, pieces)).toBe(ACADEMY_BED_OUTRO_PEAK_GAIN);
    expect(academyBedDuckGain(lastEnd + 4.5, pieces)).toBe(0);
  });
});

describe("01_office_ai bölüm 3 — senaryo ve mühür kapısı", () => {
  it("konuşma metni oturunca punchcardlar ve L4 köprüsü sırayla parlar", () => {
    if (!isAcademySpokenScriptLessonKey(KEY) || !hasAcademyLessonCues(KEY)) {
      expect(hasAcademyLessonVisualStage(KEY)).toBe(false);
      return;
    }
    expect(hasAcademyLessonVisualStage(KEY)).toBe(true);
    const spoken = loadAcademySpokenScriptMarkdownParagraphs(KEY);
    expect(spoken).toHaveLength(14);
    const prose = loadAcademySpokenScriptProse(KEY);
    expect(prose).toMatch(/Selamlar, ben Gözde/u);
    expect(prose).toMatch(/yönetici özeti|yönetim özeti/iu);
    expect(prose).toMatch(/şablon/iu);
    expect(prose).toMatch(/slayt tasla/iu);
    expect(prose).toMatch(/E-Posta Akışı/u);
    expect(prose).not.toMatch(/kirli/iu);
    const cues = loadAcademyLessonCues(KEY);
    expect(cues.map((cue) => academyPunchcardLabel(cue.text))).toEqual([...PUNCHCARDS]);
    const compare = academyVisualCompareStage(KEY, "cue-06");
    expect(compare?.beforeLabel).toBe("ÖNCE (DÜZ METİN YIĞINI)");
    expect(compare?.afterLabel).toBe("SONRA (GÖRSEL HİYERARŞİLİ SLAYT - AI)");
    const cue04 = cues.find((cue) => cue.id === "cue-04");
    expect(cue04).toBeTruthy();
    expect(cue04!.start).toBe(197.12);
    expect(academyExcelFocusZoomActive(KEY, cue04!.start)).toBe(true);
    expect(academyExcelMouseState(KEY, cue04!.start + 0.05)?.visible).toBe(true);
    expect(academyExcelMouseState(KEY, 330)?.visible).toBe(true);
    expect(academyExcelMouseState(KEY, 330)?.cell).toBeTruthy();
    expect(cues[0]!.start).toBe(ACADEMY_INTRO_GENERIC_SEC);
    expect(cues.at(-1)?.end).toBe(527);
  });

  it("ses mührü karaoke katmanını açar; mini sınav baraj 70 durur", () => {
    expect(isAcademyLessonAudioSealed(SLUG, KEY)).toBe(true);
    expect(academyCitizenPlayerLayer(SLUG, KEY).kind).toBe("article+karaoke");
    const exam = loadAcademyLessonExam(KEY);
    expect(exam?.passScore).toBe(70);
    expect(exam?.questions.map((row) => row.id)).toEqual(["q_off_l3_1", "q_off_l3_2", "q_off_l3_3"]);
    const punchcards = dronAcademyPunchcardsForLesson(KEY);
    expect(punchcards.map((card) => card.label)).toContain("ŞABLON KAOSU");
    expect(punchcards.at(-1)?.end).toBe(527);
  });
});
