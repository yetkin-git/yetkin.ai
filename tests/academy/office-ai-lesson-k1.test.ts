import { describe, expect, it } from "vitest";
import { loadAcademyCinemaCueSlides } from "@/lib/academy/cinema-cue-catalog";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { officeAiMasteryModule, officeAiPlannedLessonByKey } from "@/lib/academy/curricula/office_ai";
import { academyVisualCompareStage } from "@/lib/academy/excel-workspace";
import {
  ACADEMY_OFFICE_AI_K1_COMPARE_AFTER_LABEL,
  ACADEMY_OFFICE_AI_K1_COMPARE_BEFORE_LABEL,
  ACADEMY_OFFICE_AI_K1_POCKET_STEPS,
} from "@/lib/academy/lesson-beat-visual";
import { academyCitizenPlayerLayer } from "@/lib/academy/citizen-player-layer";
import { academyPunchcardLabel, hasAcademyLessonCues, loadAcademyLessonCues } from "@/lib/academy/lesson-cues";
import { loadAcademyLessonExam } from "@/lib/academy/lesson-exams";
import { hasAcademyLessonVisualStage } from "@/lib/academy/lesson-visual-stage";
import { isAcademyLessonAudioSealed } from "@/lib/academy/pilot-sku";
import { ACADEMY_KVKK_COPILOT_PROMPT } from "@/lib/academy/kvkk-workspace";
import {
  isAcademySpokenScriptLessonKey,
  loadAcademySpokenScriptMarkdownParagraphs,
  loadAcademySpokenScriptProse,
} from "@/lib/academy/spoken-scripts";

const SLUG = "01_office_ai";
const KEY = "01_office_ai-k1";
const PUNCHCARDS = [
  "GİRİŞ KÖPRÜSÜ",
  "HOŞ GELDİN",
  "YASAK LİSTE",
  "MASKELE",
  "ÜÇÜNCÜ KAPI",
  "FARK ORTADA",
  "CEBİNE KOY",
  "SIRA SENDE",
] as const;

describe("01_office_ai-k1 — KVKK / maskeleme kaset altyapısı", () => {
  it("2. ders sınav yolunda durur; kaset mühürlüdür", () => {
    const lessons = curriculumForCourseSlug(SLUG);
    expect(lessons).toHaveLength(9);
    expect(lessons[1]?.key).toBe(KEY);
    expect(lessons[1]?.order).toBe(2);
    expect(officeAiMasteryModule.sections[1]?.lessonKey).toBe(KEY);
    expect(officeAiPlannedLessonByKey(KEY)?.status).toBe("sealed");
    expect(officeAiPlannedLessonByKey(KEY)?.lane).toBe("main");
    expect(isAcademyLessonAudioSealed(SLUG, KEY)).toBe(true);
    expect(academyCitizenPlayerLayer(SLUG, KEY).kind).toBe("article+karaoke");
  });

  it("compact makale Mini sınav basmaz; yasak liste ve 3. Kapı durur", () => {
    const lesson = curriculumForCourseSlug(SLUG)[1]!;
    expect(lesson.title).toMatch(/KVKK/u);
    expect(lesson.body).toMatch(/Selamlar, ben Gözde/u);
    expect(lesson.body).toMatch(/YASAK LİSTE/u);
    expect(lesson.body).toMatch(/maskeli kısa özet/iu);
    expect(lesson.body).not.toMatch(/## Mini sınav/u);
    expect(lesson.body).not.toMatch(/^- \*\*.+\*\*$/mu);
  });

  it("konuşma metni 14 paragraf, punchcardlar sırayla parlar", () => {
    expect(isAcademySpokenScriptLessonKey(KEY)).toBe(true);
    expect(hasAcademyLessonCues(KEY)).toBe(true);
    expect(hasAcademyLessonVisualStage(KEY)).toBe(true);
    const spoken = loadAcademySpokenScriptMarkdownParagraphs(KEY);
    expect(spoken).toHaveLength(14);
    const prose = loadAcademySpokenScriptProse(KEY);
    expect(prose).toMatch(/Selamlar, ben Gözde/u);
    expect(prose).toMatch(/KVKK/u);
    expect(prose).toMatch(/maskeli/iu);
    expect(prose).not.toMatch(/## Mini sınav/u);
    const cues = loadAcademyLessonCues(KEY);
    expect(cues.map((cue) => academyPunchcardLabel(cue.text))).toEqual([...PUNCHCARDS]);
    const compare = academyVisualCompareStage(KEY, "cue-06");
    expect(compare?.beforeLabel).toBe(ACADEMY_OFFICE_AI_K1_COMPARE_BEFORE_LABEL);
    expect(compare?.afterLabel).toBe(ACADEMY_OFFICE_AI_K1_COMPARE_AFTER_LABEL);
  });

  it("sinema 8 slayt, mini sınav 70, istem kilitli", () => {
    const slides = loadAcademyCinemaCueSlides(KEY);
    expect(slides).toHaveLength(8);
    expect(slides.every((slide) => slide.layout === "excel")).toBe(true);
    expect(slides[3]?.copilot?.prompt).toBe(ACADEMY_KVKK_COPILOT_PROMPT);
    expect(slides[3]?.copilot?.hideReply).toBe(true);
    expect(ACADEMY_OFFICE_AI_K1_POCKET_STEPS).toEqual([
      "Ham veri yükleme",
      "Maskeleyip sor",
      "3. Kapı kısa özet",
    ]);
    const exam = loadAcademyLessonExam(KEY);
    expect(exam?.passScore).toBe(70);
    expect(exam?.questions.map((row) => row.id)).toEqual(["q_off_lk1_1", "q_off_lk1_2", "q_off_lk1_3"]);
  });
});
