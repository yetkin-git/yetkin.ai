import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { loadAcademyCinemaCueSlides } from "@/lib/academy/cinema-cue-catalog";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { officeAiMasteryModule } from "@/lib/academy/curricula/office_ai";
import {
  ACADEMY_ERROR_HUNT_COPILOT_PROMPT,
  ACADEMY_ERROR_HUNT_HALLUCINATED_TABLE,
  ACADEMY_ERROR_HUNT_SAMPLE_LOCK,
  ACADEMY_ERROR_HUNT_VERIFIED_TABLE,
} from "@/lib/academy/error-hunt-workspace";
import { academyExcelFocusZoomActive } from "@/lib/academy/excel-focus-zoom";
import { academyExcelMouseState } from "@/lib/academy/excel-mouse-pointer";
import { academyVisualCompareStage } from "@/lib/academy/excel-workspace";
import {
  ACADEMY_OFFICE_AI_5_COMPARE_AFTER_LABEL,
  ACADEMY_OFFICE_AI_5_COMPARE_BEFORE_LABEL,
  ACADEMY_OFFICE_AI_5_COPILOT_PROMPT,
  ACADEMY_OFFICE_AI_5_HOWTO_STEPS,
  ACADEMY_OFFICE_AI_5_POCKET_STEPS,
  academyHowtoActiveIndex,
  academyHowtoActiveIndexAtTime,
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
  ACADEMY_WELCOME_PUNCHCARD_CEILING_SEC,
  ACADEMY_WELCOME_PUNCHCARD_MAX_SEC,
  academyActivePunchcard,
  academyPlaybackCueAtTime,
  academyPunchcardLabel,
  academyPunchcardVisualEnd,
  hasAcademyLessonCues,
  loadAcademyLessonCues,
  loadAcademyLessonPlaybackCues,
} from "@/lib/academy/lesson-cues";
import { academyCitizenPlayerLayer } from "@/lib/academy/citizen-player-layer";
import { hasAcademyLessonVisualStage, loadAcademyLessonVisualStage, academyVisualStageActiveCard } from "@/lib/academy/lesson-visual-stage";
import { loadAcademyLessonExam } from "@/lib/academy/lesson-exams";
import { ACADEMY_OFFICE_AI_1_VEO_ASSET_KEY } from "@/lib/academy/lesson-veo";
import { isAcademyLessonAudioSealed } from "@/lib/academy/pilot-sku";
import {
  academyKaraokeNormalizeLine,
  academyKaraokeReconstructLine,
  academyKaraokeWords,
  loadAcademyKaraokeStrip,
} from "@/lib/academy/lesson-teleprompter-flow";
import {
  DRON_WELCOME_PUNCHCARD_MAX_SEC,
  dronAcademyPunchcardsForLesson,
} from "../../apps/rail-is/src/ui/academy-punchcards";
import {
  isAcademySpokenScriptLessonKey,
  loadAcademySpokenScriptMarkdownParagraphs,
  loadAcademySpokenScriptProse,
} from "@/lib/academy/spoken-scripts";

const ROOT = process.cwd();
const SLUG = "01_office_ai";
const KEY = "01_office_ai-5";
const PUNCHCARDS = [
  "GİRİŞ KÖPRÜSÜ",
  "HOŞ GELDİN",
  "AŞIRI GÜVEN",
  "HATA AVI",
  "AI DEDEKTİF",
  "FARK ORTADA",
  "CEBİNE KOY",
  "SIRA SENDE",
] as const;

describe("01_office_ai bölüm 5 — İstisnalar & Hata Avı Altın Şablon", () => {
  it("sol Kör Süreç satır toplamları 20.650+17.300+21.500=59.450; sağ Dedektif 50.450", () => {
    const parseTr = (value: string) => Number(value.replaceAll(".", ""));
    const rowTotalSum = (rows: readonly (readonly string[])[]) =>
      rows.slice(0, -1).reduce((sum, row) => sum + parseTr(row[3]!), 0);
    const left = ACADEMY_ERROR_HUNT_HALLUCINATED_TABLE.rows;
    const right = ACADEMY_ERROR_HUNT_VERIFIED_TABLE.rows;
    expect(parseTr(left[0]![3]!)).toBe(20650);
    expect(parseTr(left[1]![3]!)).toBe(17300);
    expect(parseTr(left[2]![3]!)).toBe(21500);
    expect(rowTotalSum(left)).toBe(59450);
    expect(parseTr(left[3]![3]!)).toBe(59450);
    expect(parseTr(left[2]![1]!) + parseTr(left[2]![2]!)).toBe(12500);
    expect(parseTr(right[2]![3]!)).toBe(12500);
    expect(rowTotalSum(right)).toBe(50450);
    expect(parseTr(right[3]![3]!)).toBe(50450);
  });

  it("makale Gözde girişi, halüsinasyon avı ve L6 köprüsü taşır", () => {
    const lessons = curriculumForCourseSlug(SLUG);
    expect(lessons).toHaveLength(9);
    expect(officeAiMasteryModule.voiceConfig.voice).toBe("Callirrhoe");
    const lesson = lessons.find((row) => row.key === KEY)!;
    expect(lesson.key).toBe(KEY);
    expect(lesson.order).toBe(5);
    expect(lesson.title).toMatch(/İstisnalar|Hata Avı/u);
    expect(lesson.body).toMatch(/özete gözü kapalı/u);
    expect(lesson.body).toMatch(/Peki yapay zekâ neden uydurur/u);
    expect(lesson.body).toMatch(/Peki tablodaki mantık hatasını veya yanlış toplamı gözünle nasıl avlarsın/u);
    expect(lesson.body).toMatch(/İkinci satır Demir Lojistik 17\.300/u);
    expect(lesson.body).not.toMatch(/Üçüncü satır Demir Lojistik/u);
    expect(lesson.body).not.toMatch(/\bkomut/iu);
    expect(lesson.body).not.toMatch(/direktif/iu);
    expect(lesson.body).not.toMatch(/söyleyeceğiz/u);
    expect(lesson.body).toMatch(/yakalayacaksın/u);
    expect(lesson.body).toMatch(/dedektife çevirirsin/u);
    expect(lesson.body).toMatch(/sınav kapısı en sonda açılır/u);
    expect(lesson.body).not.toMatch(/sınav köprüsü/iu);
    expect(lesson.body).toMatch(/Kişi adı, IBAN veya şirket sırrı varsa önce maskele/u);
    expect(lesson.body).toMatch(/Peki yapay zekâ çıktısı kontrol edilmeden masaya neden koyulmaz/u);
    expect(lesson.body).not.toMatch(/tüm detaylarıyla/u);
    expect(lesson.body).not.toMatch(/parlayan bir fener/u);
    expect(lesson.body).not.toMatch(/doğrulama kalkanı/u);
    expect(lesson.body).not.toMatch(/sarsılmaz bir saygınlık/u);
    expect(lesson.body).not.toMatch(/sıfır hata standardı/u);
    expect(officeAiMasteryModule.sections.find((section) => section.lessonKey === KEY)?.pedagogicalObjective).toMatch(
      /çapraz kontrol/u,
    );
  });

  it("Beat 3 split-screen sol hata gömülü, sağ AI dedektifi; spoiler kapalı", () => {
    const slides = loadAcademyCinemaCueSlides(KEY);
    expect(slides).toHaveLength(8);
    expect(slides.every((slide) => slide.layout === "excel")).toBe(true);
    expect(slides.map((slide) => slide.section)).toEqual([...PUNCHCARDS]);
    expect(slides[0]?.visualMode).toBe("veo");
    expect(loadAcademyLessonVisualStage(KEY)?.cards[0]?.src).toBe(ACADEMY_OFFICE_AI_1_VEO_ASSET_KEY);
    expect(slides[3]?.copilot?.hideReply).toBe(true);
    expect(slides[3]?.copilot?.prompt).toBe(ACADEMY_OFFICE_AI_5_COPILOT_PROMPT);
    expect(slides[3]?.copilot?.prompt).toBe(ACADEMY_ERROR_HUNT_COPILOT_PROMPT);
    expect(ACADEMY_ERROR_HUNT_COPILOT_PROMPT).toBe(ACADEMY_OFFICE_AI_5_COPILOT_PROMPT);
    expect(slides[3]?.copilot?.prompt).toMatch(/Toplamı TOPLA formülüyle doğrula/u);
    expect(slides[3]?.visualMode).toBe("live");
    expect(slides[3]?.errorCells).toEqual(["D4", "D5"]);
    expect(JSON.stringify(slides[3]?.table)).toContain("21.500");
    expect(JSON.stringify(slides[3]?.table)).toContain("59.450");
    expect(JSON.stringify(slides[3]?.table)).not.toContain("50.450");
    expect(slides[4]?.visualMode).toBe("split");
    expect(slides[4]?.copilot?.prompt).toBe(ACADEMY_ERROR_HUNT_COPILOT_PROMPT);
    expect(slides[5]?.visualMode).toBe("split");
    expect(slides[5]?.copilot?.prompt).toBe(ACADEMY_ERROR_HUNT_COPILOT_PROMPT);
    expect(slides[5]?.compare?.beforeCueIndex).toBe(3);
    expect(slides[5]?.compare?.beforeLabel).toBe(ACADEMY_OFFICE_AI_5_COMPARE_BEFORE_LABEL);
    expect(slides[5]?.compare?.afterLabel).toBe(ACADEMY_OFFICE_AI_5_COMPARE_AFTER_LABEL);
    expect(JSON.stringify(slides[5]?.table)).toContain("12.500");
    expect(JSON.stringify(slides[5]?.table)).toContain("50.450");
    expect(slides[3]?.table?.note).toMatch(/Örnek sayılar; kendi tablondaki sayıyı koy/u);
    expect(slides[3]?.table?.note).not.toMatch(/Spoiler/u);
    expect(ACADEMY_ERROR_HUNT_SAMPLE_LOCK).toBe("Örnek sayılar; kendi tablondaki sayıyı koy.");
    expect(ACADEMY_OFFICE_AI_5_POCKET_STEPS).toEqual([
      "Toplamı formülle doğrula",
      "Mantık hatası sor",
      "İnsan gözü kilitle",
    ]);
  });

  it("giriş nefesi 2.0 sn, outro 0.70 zirve, zoom ve sanal fare cue-04’te kırmızı hücreye iner", () => {
    expect(ACADEMY_INTRO_GENERIC_SEC).toBe(2);
    expect(academyLessonIntroIsActive(KEY, 0)).toBe(true);
    expect(academyLessonIntroIsActive(KEY, 1.9)).toBe(true);
    expect(academyLessonSpeechHasStarted(KEY, 2)).toBe(true);
    expect(academyBedOutroTailSec(KEY)).toBeGreaterThan(0);
    expect(academyOutroSummaryLabels(KEY)).toEqual([
      "Toplamı formülle doğrula",
      "Mantık hatası sor",
      "İnsan gözü kilitle",
    ]);
    expect(loadAcademyCinemaCueSlides(KEY)[0]?.visualMode).toBe("veo");
    const pieces = loadAcademySealedAudioTimings(KEY)?.pieces ?? [];
    if (pieces.length === 0) {
      expect(isAcademyLessonAudioSealed(SLUG, KEY)).toBe(false);
      return;
    }
    expect(pieces[0]?.start).toBe(2);
    expect(pieces[1]?.end).toBe(74.44);
    expect((pieces[1]?.end ?? 0) - (pieces[1]?.start ?? 0)).toBeGreaterThan(20);
    expect((pieces[1]?.end ?? 0) - (pieces[1]?.start ?? 0)).toBeLessThan(50);
    expect(academyBedDuckGain(0.5, pieces)).toBe(ACADEMY_BED_BREATH_GAIN);
    const lastEnd = pieces.at(-1)?.end ?? 0;
    expect(lastEnd).toBe(564.08);
    expect(academyBedDuckGain(lastEnd, pieces)).toBe(ACADEMY_BED_OUTRO_PEAK_GAIN);
    expect(academyBedDuckGain(lastEnd + 1.5, pieces)).toBe(ACADEMY_BED_OUTRO_PEAK_GAIN);
    expect(academyBedDuckGain(lastEnd + 4.5, pieces)).toBe(0);
  });
});

describe("01_office_ai bölüm 5 — senaryo ve mühür kapısı", () => {
  it("konuşma metni oturunca punchcardlar ve L6 köprüsü sırayla parlar", () => {
    if (!isAcademySpokenScriptLessonKey(KEY) || !hasAcademyLessonCues(KEY)) {
      expect(hasAcademyLessonVisualStage(KEY)).toBe(false);
      return;
    }
    expect(hasAcademyLessonVisualStage(KEY)).toBe(true);
    const spoken = loadAcademySpokenScriptMarkdownParagraphs(KEY);
    expect(spoken).toHaveLength(14);
    const prose = loadAcademySpokenScriptProse(KEY);
    expect(prose).toMatch(/Selamlar, ben Gözde/u);
    expect(prose).toMatch(/e-posta/iu);
    expect(prose).toMatch(/halüsinasyon/iu);
    expect(prose).toMatch(/kırmızı/iu);
    expect(prose).toMatch(/satır toplamları ile genel toplam/u);
    expect(prose).toMatch(/Haftalık Sistem/u);
    expect(prose).toMatch(/30 Dakika/u);
    expect(prose).toMatch(/59\.450/u);
    expect(prose).toMatch(/İkinci satır Demir Lojistik 17\.300/u);
    expect(prose).not.toMatch(/Üçüncü satır Demir Lojistik/u);
    expect(prose).not.toMatch(/\bkomut/iu);
    expect(prose).not.toMatch(/direktif/iu);
    expect(prose).toMatch(/açık istem/u);
    expect(prose).toMatch(/Hata dedektifi|dedektife çevirirsin/u);
    expect(prose).toMatch(/sınav kapısı en sonda açılır/u);
    expect(prose).not.toMatch(/sınav köprüsü/iu);
    expect(prose).toMatch(/Kişi adı, IBAN veya şirket sırrı varsa önce maskele/u);
    expect(prose).toMatch(/Peki yapay zekâ neden uydurur\?/u);
    expect(prose).toMatch(/dil modeli matematiksel bir işlemci değildir/u);
    expect(prose).toMatch(/Peki tablodaki mantık hatasını veya yanlış toplamı gözünle nasıl avlarsın\?/u);
    expect(prose).toMatch(/Peki yapay zekâ çıktısı kontrol edilmeden masaya neden koyulmaz\?/u);
    expect(prose).toMatch(/Şimdi mantığı oturtalım/u);
    expect(prose).toMatch(/Neden\?/u);
    expect(prose).not.toMatch(/54\.650/u);
    expect(prose).not.toMatch(/kirli/iu);
    expect(prose).not.toMatch(/tüm detaylarıyla/u);
    expect(prose).not.toMatch(/parlayan bir fener/u);
    expect(prose).not.toMatch(/doğrulama kalkanı/u);
    expect(prose).not.toMatch(/sarsılmaz bir saygınlık/u);
    expect(prose).not.toMatch(/sıfır hata standardı/u);
    const cues = loadAcademyLessonCues(KEY);
    expect(cues.map((cue) => academyPunchcardLabel(cue.text))).toEqual([...PUNCHCARDS]);
    expect(cues.map((cue) => cue.paragraphs?.length ?? 0)).toEqual([1, 2, 2, 2, 2, 2, 1, 2]);
    expect(cues[0]!.paragraphs?.join(" ")).toMatch(/Hâlâ e-postaya geçmiyoruz/u);
    expect(cues[0]!.paragraphs?.join(" ")).toMatch(/Bu dersin sonunda uydurma sayıyı kaynak hücreyle kilitlemeyi/u);
    expect(cues.map((cue) => cue.paragraphs?.join(" ") ?? "").join(" ")).toMatch(/İşte buna uydurma \(teknik adıyla halüsinasyon\) diyoruz/u);
    expect(cues.at(-1)?.paragraphs?.join(" ")).toMatch(/Baraj 70/u);
    const compare = academyVisualCompareStage(KEY, "cue-06");
    expect(compare?.beforeLabel).toBe("KÖR SÜREÇ (UYDURMA VERİ)");
    expect(compare?.afterLabel).toBe("DEDEKTİF SÜREÇ (KONTROLLÜ VERİ)");
    expect(JSON.stringify(compare?.before.table)).toContain("21.500");
    expect(JSON.stringify(compare?.before.table)).toContain("59.450");
    expect(JSON.stringify(compare?.before.table)).not.toContain("50.450");
    expect(JSON.stringify(compare?.after.table)).toContain("50.450");
    expect(JSON.stringify(compare?.after.table)).toContain("12.500");
    expect(JSON.stringify(compare?.after.table?.rows)).not.toContain("21.500");
    const cue04 = cues.find((cue) => cue.id === "cue-04");
    expect(cue04).toBeTruthy();
    expect(cue04!.start).toBeGreaterThanOrEqual(2);
    expect(academyExcelFocusZoomActive(KEY, cue04!.start)).toBe(true);
    expect(academyExcelMouseState(KEY, cue04!.start + 0.05)?.visible).toBe(true);
    expect(cues[0]!.start).toBe(ACADEMY_INTRO_GENERIC_SEC);
    expect(cues.at(-1)?.end).toBe(564.08);
    const layer = academyCitizenPlayerLayer(SLUG, KEY);
    expect(layer.kind).toBe("article+karaoke");
    const strip = loadAcademyKaraokeStrip(KEY);
    expect(strip[0]?.start).toBe(2);
    expect(strip.find((line) => line.cueId === "cue-02")?.text).toMatch(/^Selamlar, ben Gözde/u);
    expect(strip.find((line) => line.cueId === "cue-02")?.start).toBe(39.2);
    expect(strip.find((line) => line.cueId === "cue-04")?.start).toBe(183.32);
    expect(strip.some((line) => line.text.includes("59.450"))).toBe(true);
    expect(strip.some((line) => line.text.includes("54.650"))).toBe(false);
    expect(strip.at(-1)?.end).toBe(564.08);
  });

  it("HOŞ GELDİN rozeti 18 sn auto-hide; adım bantları ve Beat 3 split saatle yürür", () => {
    expect(ACADEMY_WELCOME_PUNCHCARD_MAX_SEC).toBe(18);
    expect(ACADEMY_WELCOME_PUNCHCARD_MAX_SEC).toBeGreaterThanOrEqual(15);
    expect(ACADEMY_WELCOME_PUNCHCARD_MAX_SEC).toBeLessThanOrEqual(ACADEMY_WELCOME_PUNCHCARD_CEILING_SEC);
    const cues = loadAcademyLessonPlaybackCues(KEY);
    const welcome = cues.find((cue) => cue.id === "cue-02");
    expect(welcome).toBeTruthy();
    expect(welcome!.end - welcome!.start).toBeGreaterThan(ACADEMY_WELCOME_PUNCHCARD_CEILING_SEC);
    expect(academyPunchcardVisualEnd(welcome!)).toBe(welcome!.start + ACADEMY_WELCOME_PUNCHCARD_MAX_SEC);
    expect(academyActivePunchcard(cues, welcome!.start + 0.05)?.label).toBe("HOŞ GELDİN");
    expect(academyActivePunchcard(cues, welcome!.start + ACADEMY_WELCOME_PUNCHCARD_MAX_SEC)).toBeNull();
    expect(academyActivePunchcard(cues, welcome!.start + 30)).toBeNull();
    const hunt = cues.find((cue) => cue.id === "cue-04");
    const detective = cues.find((cue) => cue.id === "cue-05");
    expect(hunt).toBeTruthy();
    expect(detective).toBeTruthy();
    expect(academyPlaybackCueAtTime(cues, welcome!.start + 1)?.section).toBe("HOŞ GELDİN");
    expect(academyHowtoActiveIndex(KEY, academyPlaybackCueAtTime(cues, welcome!.start + 1)?.section)).toBe(0);
    expect(academyHowtoActiveIndex(KEY, academyPlaybackCueAtTime(cues, hunt!.start + 0.2)?.section)).toBe(1);
    expect(academyHowtoActiveIndex(KEY, academyPlaybackCueAtTime(cues, detective!.start + 0.2)?.section)).toBe(2);
    expect(academyPlaybackCueAtTime(cues, welcome!.end + 0.1)?.section).toBe("HOŞ GELDİN");
    expect(academyPlaybackCueAtTime(cues, 111.4)?.section).toBe("AŞIRI GÜVEN");
    expect(academyHowtoActiveIndexAtTime(KEY, welcome!.start + 1, cues)).toBe(0);
    expect(academyHowtoActiveIndexAtTime(KEY, hunt!.start + 0.2, cues)).toBe(1);
    expect(academyHowtoActiveIndexAtTime(KEY, detective!.start + 0.2, cues)).toBe(2);
    expect(academyHowtoActiveIndexAtTime(KEY, detective!.start + 0.2, cues)).not.toBe(0);
    const stage = loadAcademyLessonVisualStage(KEY);
    expect(stage).toBeTruthy();
    expect(academyVisualStageActiveCard(stage!, welcome!.end + 0.1)?.cueId).toBe("cue-02");
    expect(academyVisualStageActiveCard(stage!, detective!.start + 0.2)?.cueId).toBe("cue-05");
    expect(ACADEMY_OFFICE_AI_5_HOWTO_STEPS.map((step) => `Adım ${step.n}: ${step.label}`)).toEqual([
      "Adım 1: Veriyi Yükle",
      "Adım 2: Çapraz Kontrol İstemini Yaz",
      "Adım 3: Sapan Hücreyi Kilitle",
    ]);
    const beat3 = academyVisualCompareStage(KEY, academyPlaybackCueAtTime(cues, detective!.start + 0.2)?.id ?? "");
    expect(beat3?.beforeLabel).toBe(ACADEMY_OFFICE_AI_5_COMPARE_BEFORE_LABEL);
    expect(beat3?.afterLabel).toBe(ACADEMY_OFFICE_AI_5_COMPARE_AFTER_LABEL);
    expect(beat3?.after.copilot?.prompt).toBe(ACADEMY_ERROR_HUNT_COPILOT_PROMPT);
    const excel = readFileSync(join(process.cwd(), "components/academy/lesson-excel-workspace.tsx"), "utf8");
    expect(excel).toContain("showAiDesk");
    expect(excel).toContain("pane !== \"before\"");
    const eye = readFileSync(join(process.cwd(), "components/academy/lesson-visual-stage.tsx"), "utf8");
    expect(eye).toContain("academyHowtoActiveIndexAtTime");
    expect(eye).not.toContain("LessonPromptConsole");
    expect(eye).toContain("data-academy-compare-prompt");
    expect(eye).toContain("data-academy-clock-cue");
    const player = readFileSync(join(process.cwd(), "components/academy/curriculum-player.tsx"), "utf8");
    expect(player).toContain("LessonPromptConsole");
    expect(player).toContain('data-academy-prompt-host="below-transport"');
    const media = readFileSync(join(process.cwd(), "components/academy/lesson-media-player.tsx"), "utf8");
    expect(media).toContain('addEventListener("timeupdate"');
    expect(media).toContain("pushSpokenClock");
    const punchcards = dronAcademyPunchcardsForLesson(KEY);
    expect(DRON_WELCOME_PUNCHCARD_MAX_SEC).toBe(18);
    expect(punchcards.find((card) => card.label === "HOŞ GELDİN")?.end).toBe(57.2);
  });

  it("mini sınav baraj 70 durur; Dron punchcard Hata Avı taşır", () => {
    const exam = loadAcademyLessonExam(KEY);
    expect(exam?.passScore).toBe(70);
    expect(exam?.questions.map((row) => row.id)).toEqual(["q_off_l5_1", "q_off_l5_2", "q_off_l5_3"]);
    expect(exam?.questions[0]?.prompt).toContain("50.450");
    expect(exam?.questions[0]?.prompt).toContain("59.450");
    expect(exam?.questions[0]?.prompt).toMatch(/kilitlersin/u);
    expect(exam?.questions[0]?.prompt).not.toMatch(/bölge satır/iu);
    expect(exam?.questions.map((row) => `${row.prompt} ${row.choices.join(" ")}`).join("\n")).not.toMatch(
      /e-tablo|rastgelelik|mutabakat|yapay zeka\b/u,
    );
    expect(exam?.questions[0]?.prompt).not.toContain("54.650");
    expect(exam?.questions[0]?.prompt).not.toContain("48.200");
    const punchcards = dronAcademyPunchcardsForLesson(KEY);
    expect(punchcards.map((card) => card.label)).toEqual(
      expect.arrayContaining(["HATA AVI", "AI DEDEKTİF"]),
    );
    expect(punchcards.at(-1)?.end).toBe(564.08);
    expect(isAcademyLessonAudioSealed(SLUG, KEY)).toBe(true);
    expect(academyCitizenPlayerLayer(SLUG, KEY).kind).toBe("article+karaoke");
  });

  it("Sebep → Eylem → Sonuç ve hata avı kilidi durur", () => {
    const prose = loadAcademySpokenScriptProse(KEY);
    expect(prose).toMatch(/Peki yapay zekâ neden uydurur\?/u);
    expect(prose).toMatch(/kelime olasılığını tahmin eder/u);
    expect(prose).toMatch(/Peki tablodaki mantık hatasını veya yanlış toplamı gözünle nasıl avlarsın\?/u);
    expect(prose).toMatch(/satır toplamı o iki hücreyi vermiyorsa sapma oradadır/u);
    expect(prose).toMatch(/Peki yapay zekâ çıktısı kontrol edilmeden masaya neden koyulmaz\?/u);
    expect(prose).toMatch(/uydurma satır genel toplamı şişirir/u);
    expect(prose).not.toMatch(/Bu örnek ezber slogan değil/u);
    expect(prose).not.toMatch(/saniyeler içinde tespit/u);
  });

  it("16:9 hata avı tuvali ezilmez; kırmızı hücre, uyarı rozeti ve denetim paneli durur", () => {
    const slides = loadAcademyCinemaCueSlides(KEY);
    expect(slides[3]?.errorCells).toEqual(["D4", "D5"]);
    expect(slides[3]?.copilot?.prompt).toBe(ACADEMY_ERROR_HUNT_COPILOT_PROMPT);
    expect(slides[4]?.visualMode).toBe("split");
    expect(slides[4]?.compare?.beforeLabel).toBe(ACADEMY_OFFICE_AI_5_COMPARE_BEFORE_LABEL);
    expect(slides[4]?.compare?.afterLabel).toBe(ACADEMY_OFFICE_AI_5_COMPARE_AFTER_LABEL);
    const css = readFileSync(join(ROOT, "app/globals.css"), "utf8");
    expect(css).toMatch(
      /\.academy-player-karaoke \.academy-player-widescreen[\s\S]*?aspect-ratio:\s*16\s*\/\s*9/s,
    );
    expect(css).toMatch(
      /\.academy-player-compare-pane \.academy-excel-desk\s*\{[^}]*height:\s*100%/s,
    );
    expect(css).toMatch(
      /\.academy-player-compare-pane \.academy-excel-win\s*\{[^}]*height:\s*100%/s,
    );
    expect(css).toMatch(/\.academy-excel-cell--error\s*\{[^}]*#fce4ec/s);
    expect(css).toMatch(/\.academy-excel-cell--error\s*\{[^}]*#d32f2f/s);
    const excel = readFileSync(join(ROOT, "components/academy/lesson-excel-workspace.tsx"), "utf8");
    expect(excel).toContain("data-academy-excel-error");
    expect(excel).toContain("showAiDesk");
    expect(excel).toContain("LessonAiDesk");
    const player = readFileSync(join(ROOT, "components/academy/curriculum-player.tsx"), "utf8");
    const eye = readFileSync(join(ROOT, "components/academy/lesson-visual-stage.tsx"), "utf8");
    expect(player).toContain('data-academy-prompt-host="below-transport"');
    expect(eye).not.toContain("LessonPromptConsole");
    expect(eye).toContain("data-academy-prompt-dock");
  });

  it("karaoke harf düşürmez; aktif kelime layout shift ve descender kesmez", () => {
    const timings = loadAcademySealedAudioTimings(KEY);
    expect(timings?.durationSec).toBe(564.08);
    expect(timings?.cacheV).toBe(564080);
    const cues = loadAcademyLessonCues(KEY);
    expect(cues.at(-1)?.end).toBe(564.08);
    for (const cue of cues) {
      const pieces = timings!.pieces.filter((piece) => piece.cueId === cue.id);
      expect(pieces[0]?.start, cue.id).toBe(cue.start);
      expect(pieces.at(-1)?.end, cue.id).toBe(cue.end);
    }
    const strip = loadAcademyKaraokeStrip(KEY);
    expect(strip.at(-1)?.end).toBe(564.08);
    const stripText = strip.map((line) => line.text).join(" ");
    expect(stripText).toMatch(/Peki yapay zekâ neden uydurur/u);
    expect(stripText).toMatch(/İkinci satır Demir Lojistik 17\.300/u);
    expect(stripText).toMatch(/İşte buna uydurma \(teknik adıyla halüsinasyon\) diyoruz/u);
    expect(stripText).toMatch(/sınav kapısı en sonda açılır/u);
    expect(stripText).toMatch(/mantık hatasını veya yanlış toplamı gözünle nasıl avlarsın/u);
    expect(stripText).toMatch(/kontrol edilmeden masaya neden koyulmaz/u);
    expect(strip.some((line) => line.text.includes("59.450"))).toBe(true);
    expect(strip.some((line) => line.text.includes("54.650"))).toBe(false);
    for (const line of strip) {
      const words = academyKaraokeWords(line);
      expect(academyKaraokeReconstructLine(words)).toBe(academyKaraokeNormalizeLine(line.text));
      expect(words.every((word) => word.text.length > 0)).toBe(true);
    }
    const css = readFileSync(join(ROOT, "app/globals.css"), "utf8");
    expect(css).toMatch(
      /\.academy-player-karaoke-word\s*\{[^}]*overflow:\s*visible/s,
    );
    expect(css).toMatch(
      /\.academy-player-karaoke-word\s*\{[^}]*padding-block:\s*0\.08em 0\.22em/s,
    );
    expect(css).toMatch(
      /\.academy-player-karaoke-word\s*\{[^}]*font-weight:\s*inherit/s,
    );
    expect(css).toMatch(
      /\.academy-player-karaoke-word\[data-state="active"\]\s*\{[^}]*font-weight:\s*inherit/s,
    );
    expect(css).toMatch(
      /\.academy-player-karaoke-line\s*\{[^}]*line-height:\s*1\.5/s,
    );
  });
});
