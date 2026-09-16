import { describe, expect, it } from "vitest";
import { loadAcademyCinemaCueSlides } from "@/lib/academy/cinema-cue-catalog";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { officeAiMasteryModule } from "@/lib/academy/curricula/office_ai";
import { academyExcelFocusZoomActive } from "@/lib/academy/excel-focus-zoom";
import { academyExcelMouseState } from "@/lib/academy/excel-mouse-pointer";
import { academyVisualCompareStage } from "@/lib/academy/excel-workspace";
import {
  ACADEMY_OFFICE_AI_4_COMPARE_AFTER_LABEL,
  ACADEMY_OFFICE_AI_4_COMPARE_BEFORE_LABEL,
  ACADEMY_OFFICE_AI_4_POCKET_STEPS,
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
const KEY = "01_office_ai-4";
const PUNCHCARDS = [
  "GİRİŞ KÖPRÜSÜ",
  "HOŞ GELDİN",
  "INBOX KAOSU",
  "TASLAK YAZ",
  "SIFIR KUTU",
  "FARK ORTADA",
  "CEBİNE KOY",
  "SIRA SENDE",
] as const;

describe("01_office_ai bölüm 4 — E-Posta Akışı Altın Şablon", () => {
  it("makale Gözde girişi, gelen kutusu ve L5 köprüsü taşır", () => {
    const lessons = curriculumForCourseSlug(SLUG);
    expect(lessons).toHaveLength(9);
    expect(officeAiMasteryModule.voiceConfig.voice).toBe("Callirrhoe");
    const lesson = lessons.find((row) => row.key === KEY)!;
    expect(lesson.key).toBe(KEY);
    expect(lesson.order).toBe(6);
    expect(lesson.title).toMatch(/E-Posta Akışı|Gelen Kutusu/u);
  });

  it("Beat 3 split-screen sol 142 okunmamış, sağ sıfırlanmış kutu; spoiler kapalı", () => {
    const slides = loadAcademyCinemaCueSlides(KEY);
    expect(slides).toHaveLength(8);
    expect(slides.every((slide) => slide.layout === "outlook")).toBe(true);
    expect(slides.map((slide) => slide.section)).toEqual([...PUNCHCARDS]);
    expect(slides[0]?.visualMode).toBe("veo");
    expect(loadAcademyLessonVisualStage(KEY)?.cards[0]?.src).toBe(ACADEMY_OFFICE_AI_1_VEO_ASSET_KEY);
    expect(slides[3]?.copilot?.hideReply).toBe(true);
    expect(slides[3]?.copilot?.prompt).toBe(
      "Gelen kutumdaki okunmamış mailleri tara. Sadece bugün ödeme/onay bekleyenleri ACIL etiketiyle bana getir, bültenleri arşive kaldır.",
    );
    expect(slides[3]?.visualMode).toBe("live");
    expect(slides[4]?.visualMode).toBe("split");
    expect(slides[5]?.visualMode).toBe("split");
    expect(slides[5]?.compare?.beforeCueIndex).toBe(3);
    expect(slides[5]?.compare?.beforeLabel).toBe(ACADEMY_OFFICE_AI_4_COMPARE_BEFORE_LABEL);
    expect(slides[5]?.compare?.afterLabel).toBe(ACADEMY_OFFICE_AI_4_COMPARE_AFTER_LABEL);
    expect(JSON.stringify(slides[5]?.table)).toContain("Acil");
    expect(JSON.stringify(slides[5]?.table)).toContain("Kaya Gıda");
    expect(JSON.stringify(slides[5]?.table)).toContain("Arşiv");
    expect(slides[5]?.nodes?.map((node) => node.title)).toEqual([
      "ACİL AKSİYON",
      "TAKİPTE / BEKLEYEN",
      "OTOMATİK ARŞİVLENDİ",
    ]);
    expect(slides[3]?.table?.note).toMatch(/Spoiler/u);
    expect(ACADEMY_OFFICE_AI_4_POCKET_STEPS).toEqual([
      "Önem sırası etiketle",
      "Taslak yanıtı yazdır",
      "Arşive kaldır",
    ]);
  });

  it("05:30 anında sağ panel 3 grup kartı basar; 142 mail listesi yok", () => {
    const cues = loadAcademyLessonCues(KEY);
    const atFiveThirty = cues.find((cue) => cue.start <= 330 && cue.end > 330);
    expect(atFiveThirty?.id).toBe("cue-05");
    const compare = academyVisualCompareStage(KEY, atFiveThirty!.id);
    expect(compare?.beforeLabel).toBe(ACADEMY_OFFICE_AI_4_COMPARE_BEFORE_LABEL);
    expect(compare?.afterLabel).toBe(ACADEMY_OFFICE_AI_4_COMPARE_AFTER_LABEL);
    expect(compare?.after.nodes?.map((node) => node.title)).toEqual([
      "ACİL AKSİYON",
      "TAKİPTE / BEKLEYEN",
      "OTOMATİK ARŞİVLENDİ",
    ]);
    expect(JSON.stringify(compare?.after.table)).toContain("140 Okunmamış Bülten");
    expect(JSON.stringify(compare?.after.table)).not.toContain("Üç toplantı daveti");
  });

  it("giriş nefesi 2.0 sn, outro 0.70 zirve, zoom ve sanal fare cue-04’te açılır", () => {
    expect(ACADEMY_INTRO_GENERIC_SEC).toBe(2);
    expect(academyLessonIntroIsActive(KEY, 0)).toBe(true);
    expect(academyLessonIntroIsActive(KEY, 1.9)).toBe(true);
    expect(academyLessonSpeechHasStarted(KEY, 2)).toBe(true);
    expect(academyBedOutroTailSec(KEY)).toBeGreaterThan(0);
    expect(academyOutroSummaryLabels(KEY)).toEqual(["Önemle etiketle", "Taslak yazdır", "Arşive kaldır"]);
    expect(loadAcademyCinemaCueSlides(KEY)[0]?.visualMode).toBe("veo");
    const pieces = loadAcademySealedAudioTimings(KEY)?.pieces ?? [];
    if (pieces.length === 0) {
      expect(isAcademyLessonAudioSealed(SLUG, KEY)).toBe(false);
      return;
    }
    expect(pieces[0]?.start).toBe(2);
    expect(academyBedDuckGain(0.5, pieces)).toBe(ACADEMY_BED_BREATH_GAIN);
    const lastEnd = pieces.at(-1)?.end ?? 0;
    expect(lastEnd).toBe(544.52);
    expect(academyBedDuckGain(lastEnd, pieces)).toBe(ACADEMY_BED_OUTRO_PEAK_GAIN);
    expect(academyBedDuckGain(lastEnd + 1.5, pieces)).toBe(ACADEMY_BED_OUTRO_PEAK_GAIN);
    expect(academyBedDuckGain(lastEnd + 4.5, pieces)).toBe(0);
  });
});

describe("01_office_ai bölüm 4 — senaryo ve mühür kapısı", () => {
  it("konuşma metni oturunca punchcardlar ve L5 köprüsü sırayla parlar", () => {
    if (!isAcademySpokenScriptLessonKey(KEY) || !hasAcademyLessonCues(KEY)) {
      expect(hasAcademyLessonVisualStage(KEY)).toBe(false);
      return;
    }
    expect(hasAcademyLessonVisualStage(KEY)).toBe(true);
    const spoken = loadAcademySpokenScriptMarkdownParagraphs(KEY);
    expect(spoken).toHaveLength(14);
    const prose = loadAcademySpokenScriptProse(KEY);
    expect(prose).toMatch(/Selamlar, ben Gözde/u);
    expect(prose).toMatch(/Sunum Fabrikası/u);
    expect(prose).toMatch(/okunmamış/iu);
    expect(prose).toMatch(/taslak yanıt/iu);
    expect(prose).toMatch(/Microsoft Kopilot lisansın varsa/u);
    expect(prose).toMatch(/Cemini eklentisini aç/u);
    expect(prose).toMatch(/yerleşik panele/u);
    expect(prose).not.toMatch(/ücretsiz Çetcipiti/u);
    expect(prose).not.toMatch(/ekranına yapıştır/u);
    expect(prose).toMatch(/İstisnalar/u);
    expect(prose).not.toMatch(/kirli/iu);
    const cues = loadAcademyLessonCues(KEY);
    expect(cues.map((cue) => academyPunchcardLabel(cue.text))).toEqual([...PUNCHCARDS]);
    const compare = academyVisualCompareStage(KEY, "cue-06");
    expect(compare?.beforeLabel).toBe("ÖNCE (142 OKUNMAMIŞ MAİL)");
    expect(compare?.afterLabel).toBe("SONRA (SIFIRLANMIŞ KUTU - AI)");
    expect(compare?.after.nodes?.map((node) => node.title)).toEqual([
      "ACİL AKSİYON",
      "TAKİPTE / BEKLEYEN",
      "OTOMATİK ARŞİVLENDİ",
    ]);
    expect(JSON.stringify(compare?.after.table)).not.toMatch(/Haftalık Bülten/u);
    const cue04 = cues.find((cue) => cue.id === "cue-04");
    expect(cue04).toBeTruthy();
    expect(cue04!.start).toBe(194.52);
    expect(academyExcelFocusZoomActive(KEY, cue04!.start)).toBe(true);
    expect(academyExcelMouseState(KEY, cue04!.start + 0.05)?.visible).toBe(true);
    expect(cues[0]!.start).toBe(ACADEMY_INTRO_GENERIC_SEC);
    expect(cues.at(-1)?.end).toBe(544.52);
  });

  it("ses mührü karaoke katmanını açar; mini sınav baraj 70 durur", () => {
    const exam = loadAcademyLessonExam(KEY);
    expect(exam?.passScore).toBe(70);
    expect(exam?.questions.map((row) => row.id)).toEqual(["q_off_l4_1", "q_off_l4_2", "q_off_l4_3"]);
    const punchcards = dronAcademyPunchcardsForLesson(KEY);
    expect(punchcards.map((card) => card.label)).toContain("INBOX KAOSU");
    expect(punchcards.at(-1)?.end).toBe(544.52);
    expect(isAcademyLessonAudioSealed(SLUG, KEY)).toBe(true);
    expect(academyCitizenPlayerLayer(SLUG, KEY).kind).toBe("article+karaoke");
  });
});
