import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadAcademyCinemaCueSlides } from "@/lib/academy/cinema-cue-catalog";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { officeAiMasteryModule, officeAiPlannedLessonByKey } from "@/lib/academy/curricula/office_ai";
import { academyExcelIsMaskToken, academyVisualCompareStage } from "@/lib/academy/excel-workspace";
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
import { loadAcademySealedAudioTimings } from "@/lib/academy/lesson-audio-timings";
import {
  academyKaraokeNormalizeLine,
  academyKaraokeReconstructLine,
  academyKaraokeWords,
  loadAcademyKaraokeStrip,
} from "@/lib/academy/lesson-teleprompter-flow";
import {
  ACADEMY_KVKK_COPILOT_PROMPT,
  ACADEMY_KVKK_FLAG_CELLS,
  ACADEMY_KVKK_MASKED_TABLE,
  ACADEMY_KVKK_RAW_TABLE,
} from "@/lib/academy/kvkk-workspace";
import {
  isAcademySpokenScriptLessonKey,
  loadAcademySpokenScriptMarkdownParagraphs,
  loadAcademySpokenScriptProse,
} from "@/lib/academy/spoken-scripts";

const ROOT = process.cwd();
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
    expect(lesson.body).toMatch(/Müşteri A/u);
    expect(lesson.body).toMatch(/MASKELİ_IBAN/u);
    expect(lesson.body).toMatch(/yerleşik panel/iu);
    expect(lesson.body).not.toMatch(/1\. Kapı şirketin kendi kapalı sistemi/u);
    expect(lesson.body).not.toMatch(/ahlaki omurga|Cuma paniği|bekçi olursun|Kanıt iddiadan/u);
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
    expect(prose).toMatch(/Kavekaka/u);
    expect(prose).toMatch(/Müşteri A/u);
    expect(prose).toMatch(/MASKELİ IBAN/u);
    expect(prose).not.toMatch(/ahlaki omurga|Cuma paniği|bekçi olursun|Kanıt iddiadan/u);
    expect(prose).toMatch(/maskeli/iu);
    expect(prose).toMatch(/yerleşik paneldir/u);
    expect(prose).not.toMatch(/kapalı sistemidir/u);
    expect(prose).not.toMatch(/## Mini sınav/u);
    const cues = loadAcademyLessonCues(KEY);
    expect(cues.flatMap((cue) => cue.paragraphs ?? []).join(" ")).toMatch(/KVKK/u);
    expect(cues.flatMap((cue) => cue.paragraphs ?? []).join(" ")).toMatch(/Müşteri A/u);
    expect(cues.flatMap((cue) => cue.paragraphs ?? []).join(" ")).toMatch(/MASKELİ_IBAN/u);
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
    expect(slides[4]?.subhead).toMatch(/yerleşik panel/iu);
    expect(slides[4]?.subhead).not.toMatch(/kapalı sistem/iu);
    expect(ACADEMY_OFFICE_AI_K1_POCKET_STEPS).toEqual([
      "Ham veri yükleme",
      "Maskeleyip sor",
      "3. Kapı kısa özet",
    ]);
    const exam = loadAcademyLessonExam(KEY);
    expect(exam?.passScore).toBe(70);
    expect(exam?.questions.map((row) => row.id)).toEqual(["q_off_lk1_1", "q_off_lk1_2", "q_off_lk1_3"]);
  });

  it("Sebep → Eylem → Sonuç ve üç satır nedenselliği durur", () => {
    const prose = loadAcademySpokenScriptProse(KEY);
    expect(prose).toMatch(/Neden\?/u);
    expect(prose).toMatch(/Peki neden üç satır yeter de otuz satırlık müşteri dökümü yetmez\?/u);
    expect(prose).toMatch(/bin kişilik müşteri listesinin tamamını yüklemene gerek yok/u);
    expect(prose).toMatch(/üç tane örnek, sahte satır/u);
    expect(prose).toMatch(/fazla gerçek satır modeli daha zeki yapmaz/u);
    expect(prose).toMatch(/Silmek yetmez, çünkü silinen satır mantığı da götürür/u);
    expect(prose).toMatch(/Değiştirmek zorunludur, çünkü takma değer hem korur hem öğretir/u);
    expect(prose).not.toMatch(/Bu örnek ezber slogan değil/u);
  });

  it("maske ızgarası Ad-Soyad, IBAN, Telefon örneklerini yüksek kontrastla basar", () => {
    expect(ACADEMY_KVKK_FLAG_CELLS).toEqual(["A2", "B2", "C2"]);
    expect(ACADEMY_KVKK_RAW_TABLE.headers).toEqual(["Ad", "Telefon", "IBAN", "Ürün"]);
    expect(ACADEMY_KVKK_RAW_TABLE.rows[0]).toEqual(["Ayşe Kaya", "0532…", "TR12…7890", "Un 25kg"]);
    expect(ACADEMY_KVKK_MASKED_TABLE.rows).toHaveLength(4);
    expect(ACADEMY_KVKK_MASKED_TABLE.rows[0]?.[0]).toBe("Müşteri A");
    expect(ACADEMY_KVKK_MASKED_TABLE.rows.at(-1)).toEqual([
      "Not",
      "MASKELİ_IBAN",
      "MASKELİ_TELEFON",
      "3 satır",
    ]);
    expect(academyExcelIsMaskToken("Müşteri A")).toBe(true);
    expect(academyExcelIsMaskToken("MASKELİ_IBAN")).toBe(true);
    expect(academyExcelIsMaskToken("MASKELİ_TELEFON")).toBe(true);
    expect(academyExcelIsMaskToken("Ayşe Kaya")).toBe(false);
    const css = readFileSync(join(ROOT, "app/globals.css"), "utf8");
    expect(css).toMatch(/\.academy-excel-cell--error\s*\{[^}]*#fce4ec/s);
    expect(css).toMatch(/\.academy-excel-cell--mask\s*\{[^}]*#d4f7ea/s);
    expect(css).toMatch(
      /\.academy-player-compare-pane \.academy-excel-desk\s*\{[^}]*height:\s*100%/s,
    );
    const slides = loadAcademyCinemaCueSlides(KEY);
    expect(slides[2]?.errorCells).toEqual(["A2", "B2", "C2"]);
    expect(slides[5]?.table?.rows[0]?.[0]).toBe("Müşteri A");
    expect(slides[5]?.subhead).toMatch(/MASKELİ_IBAN/u);
  });

  it("677.56 sn kaset ile karaoke cue saatleri birebir; harf düşmez", () => {
    const timings = loadAcademySealedAudioTimings(KEY);
    expect(timings?.durationSec).toBe(677.56);
    expect(timings?.pieces.at(-1)?.end).toBe(677.56);
    const cues = loadAcademyLessonCues(KEY);
    expect(cues.at(-1)?.end).toBe(677.56);
    for (const cue of cues) {
      const pieces = timings!.pieces.filter((piece) => piece.cueId === cue.id);
      expect(pieces[0]?.start, cue.id).toBe(cue.start);
      expect(pieces.at(-1)?.end, cue.id).toBe(cue.end);
    }
    const strip = loadAcademyKaraokeStrip(KEY);
    expect(strip.at(-1)?.end).toBe(677.56);
    expect(strip.some((line) => line.cueId === "cue-04" && /üç satır yeter/u.test(line.text))).toBe(
      true,
    );
    for (const line of strip) {
      const words = academyKaraokeWords(line);
      expect(academyKaraokeReconstructLine(words)).toBe(academyKaraokeNormalizeLine(line.text));
      expect(words.every((word) => word.text.length > 0)).toBe(true);
      expect(words.some((word) => word.text.endsWith("…") && word.text.length < 2)).toBe(false);
    }
  });
});
