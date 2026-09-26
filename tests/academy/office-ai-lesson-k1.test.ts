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
  ACADEMY_OFFICE_AI_K1_COPILOT_PROMPT,
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
  ACADEMY_KVKK_DELETE_BUTTON_SUMMARY,
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
    expect(lessons).toHaveLength(8);
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
    expect(lesson.body).toMatch(/Ham ad, telefon, IBAN, kimlik, maaş sohbete yüklenmez/u);
    expect(lesson.body).toMatch(/Ayrıntı şirketinin kuralıdır/u);
    expect(lesson.body).toMatch(/Bu ders hukuki danışmanlık değildir/u);
    expect(lesson.body).not.toMatch(/VERBİS/u);
    expect(lesson.body).toMatch(/Aynı kural Copilot şeridinde de, Gemini ataşında da durur/u);
    expect(lesson.body).toMatch(/hangi satırın sohbete gitmeyeceğini tek başına ayıracaksın/u);
    expect(lesson.body).toContain(ACADEMY_KVKK_DELETE_BUTTON_SUMMARY);
    expect(lesson.body).toMatch(
      /ChatGPT, Gemini, Grok ve benzeri ister ücretsiz ister ücretli tüm açık sohbet ekranlarına müşteri listesi, IBAN, T\.C\. kimlik numarası gibi ham verileri yükleyemezsin/u,
    );
    expect(lesson.body).toMatch(
      /Aboneliğin ücretli \(Plus\/Pro\/Team\) olsa bile açık sohbete ham kişisel veri ve şirket sırrı atılamaz/u,
    );
    expect(lesson.body).not.toMatch(/açık, ücretsiz yapay zekâ ekran/u);
    expect(lesson.body).toMatch(/A1 kuralıyla/u);
    expect(lesson.body).toMatch(/müşteri programı \(CRM\)/iu);
    expect(lesson.body).toMatch(/açık katalog bilgisi/iu);
    expect(lesson.body).toMatch(/Telefonu kaldır, MASKELİ_TELEFON yaz/u);
    expect(lesson.body).not.toMatch(/A1 eşiği/u);
    expect(lesson.body).not.toMatch(/hijyen/iu);
    expect(lesson.body).not.toMatch(/Telefonu kırp/u);
    expect(lesson.body).not.toMatch(/Soruyu bırak/u);
    expect(lesson.body).not.toMatch(/tüketici modeli/u);
    expect(lesson.body).not.toMatch(/kamu cümlesi|kamu kataloğu/u);
    expect(lesson.body).not.toMatch(/0555 111 22 33/u);
    expect(lesson.body).not.toMatch(/kişisel veriyi yasal kılmaz/u);
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
    expect(prose).toMatch(/MASKELİ İban/u);
    expect(prose).not.toMatch(/IBAN/u);
    expect(prose).not.toMatch(/ahlaki omurga|Cuma paniği|bekçi olursun|Kanıt iddiadan/u);
    expect(prose).not.toMatch(/\b(?:xlsx|docx|pptx)\b/iu);
    expect(prose).toMatch(/maskeli/iu);
    expect(prose).toMatch(/yerleşik paneldir/u);
    expect(prose).toMatch(/hangi satırın sohbete gitmeyeceğini tek başına ayıracaksın/u);
    expect(prose).toMatch(/ister ücretsiz ister ücretli tüm açık sohbet ekranlarına/u);
    expect(prose).toMatch(/T\.C\. kimlik numarası gibi ham verileri yükleyemezsin/u);
    expect(prose).not.toMatch(/açık, ücretsiz yapay zekâ ekran/u);
    expect(prose).toMatch(/A1 kuralıyla/u);
    expect(prose).toMatch(/Telefonu kaldır/u);
    expect(prose).not.toMatch(/kapalı sistemidir/u);
    expect(prose).not.toMatch(/A1 eşiği/u);
    expect(prose).not.toMatch(/hijyen/iu);
    expect(prose).not.toMatch(/Telefonu kırp/u);
    expect(prose).not.toMatch(/Soruyu bırak/u);
    expect(prose).not.toMatch(/0555 111 22 33/u);
    expect(prose).not.toMatch(/tüketici modeli/u);
    expect(prose).not.toMatch(/## Mini sınav/u);
    const cues = loadAcademyLessonCues(KEY);
    const cueBlob = cues.flatMap((cue) => cue.paragraphs ?? []).join(" ");
    expect(cueBlob).toMatch(/KVKK/u);
    expect(cueBlob).toMatch(/ister ücretsiz ister ücretli tüm açık sohbet ekranlarına/u);
    expect(cueBlob).not.toMatch(/açık, ücretsiz yapay zekâ ekran/u);
    expect(cueBlob).not.toMatch(/Kavekaka/u);
    expect(cueBlob).toMatch(/Müşteri A/u);
    expect(cueBlob).toMatch(/MASKELİ_IBAN/u);
    expect(cueBlob).not.toMatch(/0555 111 22 33/u);
    expect(cues.map((cue) => academyPunchcardLabel(cue.text))).toEqual([...PUNCHCARDS]);
    const compare = academyVisualCompareStage(KEY, "cue-06");
    expect(compare?.beforeLabel).toBe(ACADEMY_OFFICE_AI_K1_COMPARE_BEFORE_LABEL);
    expect(compare?.afterLabel).toBe(ACADEMY_OFFICE_AI_K1_COMPARE_AFTER_LABEL);
  });

  it("sinema 8 slayt, mini sınav 70, istem kilitli", () => {
    const slides = loadAcademyCinemaCueSlides(KEY);
    expect(slides).toHaveLength(8);
    expect(slides[0]?.subhead).toMatch(/ister ücretsiz ister ücretli/u);
    expect(slides[0]?.subhead).not.toMatch(/açık, ücretsiz/u);
    expect(slides.every((slide) => slide.layout === "excel")).toBe(true);
    expect(slides[3]?.copilot?.prompt).toBe(ACADEMY_OFFICE_AI_K1_COPILOT_PROMPT);
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
    expect(prose).toMatch(/bin kişilik müşteri listesinin tamamını ham yüklemene gerek yok/u);
    expect(prose).toMatch(/Aynı özeti sahte satırdan alamazsın/u);
    expect(prose).toMatch(/üç tane örnek, sahte satır/u);
    expect(prose).toMatch(/fazla gerçek satır modeli daha zeki yapmaz/u);
    expect(prose).toMatch(/Silmek yetmez, çünkü silinen satır mantığı da götürür/u);
    expect(prose).toMatch(/Değiştirmelisin, çünkü takma değer hem korur hem öğretir/u);
    expect(prose).not.toMatch(/Bu örnek ezber slogan değil/u);
  });

  it("maske ızgarası Ad-Soyad, IBAN, Telefon örneklerini yüksek kontrastla basar", () => {
    expect(ACADEMY_KVKK_FLAG_CELLS).toEqual(["A2", "B2", "C2"]);
    expect(ACADEMY_KVKK_RAW_TABLE.headers).toEqual(["Ad", "Telefon", "IBAN", "Ürün"]);
    expect(ACADEMY_KVKK_RAW_TABLE.rows[0]).toEqual(["Ayşe Kaya", "0532…", "TR12…7890", "Un 25kg"]);
    expect(ACADEMY_KVKK_MASKED_TABLE.headers).toEqual(["Kod", "Telefon", "IBAN", "Ürün"]);
    expect(ACADEMY_KVKK_MASKED_TABLE.rows).toHaveLength(3);
    expect(ACADEMY_KVKK_MASKED_TABLE.rows[0]).toEqual([
      "Müşteri A",
      "Tel1",
      "IBAN1",
      "Un 25kg",
    ]);
    expect(ACADEMY_KVKK_MASKED_TABLE.rows[1]).toEqual([
      "Müşteri B",
      "Tel2",
      "IBAN2",
      "Yağ 18L",
    ]);
    expect(ACADEMY_KVKK_MASKED_TABLE.rows[2]).toEqual([
      "Müşteri C",
      "Tel3",
      "IBAN3",
      "Şeker",
    ]);
    expect(academyExcelIsMaskToken("Müşteri A")).toBe(true);
    expect(academyExcelIsMaskToken("Tel1")).toBe(true);
    expect(academyExcelIsMaskToken("IBAN2")).toBe(true);
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

  it("702 sn kaset ile karaoke cue saatleri birebir; harf düşmez", () => {
    const timings = loadAcademySealedAudioTimings(KEY);
    expect(timings?.durationSec).toBe(702);
    expect(timings?.pieces.at(-1)?.end).toBe(702);
    const cues = loadAcademyLessonCues(KEY);
    expect(cues.at(-1)?.end).toBe(702);
    for (const cue of cues) {
      const pieces = timings!.pieces.filter((piece) => piece.cueId === cue.id);
      expect(pieces[0]?.start, cue.id).toBe(cue.start);
      expect(pieces.at(-1)?.end, cue.id).toBe(cue.end);
    }
    const strip = loadAcademyKaraokeStrip(KEY);
    expect(strip.at(-1)?.end).toBe(702);
    const stripBlob = strip.map((line) => line.text).join(" ");
    expect(stripBlob).toMatch(/KVKK/u);
    expect(stripBlob).not.toMatch(/Kavekaka/u);
    expect(timings!.pieces.map((piece) => piece.text).join(" ")).toMatch(/Kavekaka/u);
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
