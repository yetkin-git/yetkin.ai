import { readFileSync } from "node:fs";
import { join } from "node:path";
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
import {
  ACADEMY_EXCEL_DENSE_DUMP_MIN_COLS,
  ACADEMY_EXCEL_DENSE_DUMP_MIN_ROWS,
  ACADEMY_OFFICE_AI_2_CLEAN_TABLE,
  ACADEMY_OFFICE_AI_2_DENSE_DUMP_TABLE,
  academyExcelIsDenseDumpTable,
  academyExcelOfficeAi2SeedTutarSum,
  academyVisualCompareStage,
} from "@/lib/academy/excel-workspace";
import {
  ACADEMY_OFFICE_AI_2_COMPARE_AFTER_LABEL,
  ACADEMY_OFFICE_AI_2_COMPARE_BEFORE_LABEL,
  ACADEMY_OFFICE_AI_2_COPILOT_PROMPT,
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
  academyKaraokeNormalizeLine,
  academyKaraokeReconstructLine,
  academyKaraokeWords,
  loadAcademyKaraokeStrip,
} from "@/lib/academy/lesson-teleprompter-flow";
import {
  isAcademySpokenScriptLessonKey,
  loadAcademySpokenScriptMarkdownParagraphs,
  loadAcademySpokenScriptProse,
} from "@/lib/academy/spoken-scripts";

const ROOT = process.cwd();
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
    expect(lesson.body).toMatch(/metinden slayta/iu);
    expect(lesson.body).toMatch(/Kişi adı, IBAN veya müşteri sırrı varsa önce maskele/u);
    expect(lesson.body).toMatch(/4\. ders|dördüncü ders|metinden slayta/iu);
    expect(lesson.body).toMatch(/Peki neden üç maddelik yönetim özeti/u);
    expect(lesson.body).toMatch(/uydurma yüzde/iu);
    expect(lesson.body).toMatch(/kaynak hücre/iu);
    expect(lesson.body).not.toMatch(/kirli/iu);
    expect(lesson.body).not.toMatch(/İşte büyü/u);
    expect(lesson.body).not.toMatch(/sonsuz/iu);
    expect(lesson.body).not.toMatch(/vazgeçilmez bir ekip/iu);
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
    expect(prose).toMatch(/metinden slayta/iu);
    expect(prose).toMatch(/Peki neden üç maddelik yönetim özeti isteriz/u);
    expect(prose).toMatch(/Peki yapay zekâ uydurmasın diye sayıları nasıl kilitleriz/u);
    expect(prose).toMatch(/Şimdi mantığı oturtalım/u);
    expect(prose).toMatch(/Neden\?/u);
    expect(prose).not.toMatch(/kirli/iu);
    expect(prose).not.toMatch(/İşte büyü/u);
    expect(prose).not.toMatch(/sonsuz/iu);
    expect(prose).not.toMatch(/vazgeçilmez bir ekip/iu);
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
    expect(slides[3]?.copilot?.prompt).toBe(ACADEMY_OFFICE_AI_2_COPILOT_PROMPT);
    expect(slides[3]?.copilot?.prompt).toMatch(/Uydurma yüzde ekleme/u);
    expect(slides[3]?.copilot?.prompt).not.toMatch(/henüz açma|Beat 3|spoiler/iu);
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
    expect(lastEnd).toBe(553.84);
    expect(academyBedDuckGain(lastEnd, pieces)).toBe(ACADEMY_BED_OUTRO_PEAK_GAIN);
  });

  it("ses mührü karaoke katmanını açar; mini sınav baraj 70 durur", () => {
    expect(isAcademyLessonAudioSealed(SLUG, KEY)).toBe(true);
    expect(academyCitizenPlayerLayer(SLUG, KEY).kind).toBe("article+karaoke");
    const exam = loadAcademyLessonExam(KEY);
    expect(exam?.passScore).toBe(70);
    expect(exam?.questions.map((row) => row.id)).toEqual(["q_off_l2_1", "q_off_l2_2", "q_off_l2_3"]);
  });

  it("Sebep → Eylem → Sonuç ve sayı kilidi durur", () => {
    const prose = loadAcademySpokenScriptProse(KEY);
    expect(prose).toMatch(/Peki neden üç maddelik yönetim özeti isteriz de on sayfalık dökümü yazdırmayız\?/u);
    expect(prose).toMatch(/yöneticinin yirmi dakikası vardır/u);
    expect(prose).toMatch(/Peki yapay zekâ uydurmasın diye sayıları nasıl kilitleriz\?/u);
    expect(prose).toMatch(/Sayıyı tahmin ettirmezsin; hücreden aldırırsın/u);
    expect(prose).toMatch(/Uydurma yüzde ekleme/u);
    expect(prose).toMatch(/her sayı kaynak hücreyle kilitlenmiştir/u);
    expect(prose).not.toMatch(/Bu örnek ezber slogan değil/u);
    expect(prose).not.toMatch(/fırsata dönüştürebilirsin/u);
    expect(prose).not.toMatch(/Sunum Fabrikası/u);
    expect(prose).not.toMatch(/Fark sihir değil/u);
  });

  it("özet rapor paneli KPI sayılarını tahsilat ızgarasından kilitler; 16:9 ezilmez", () => {
    const slides = loadAcademyCinemaCueSlides(KEY);
    const source = slides[0]?.table;
    expect(source?.headers.slice(0, 5)).toEqual(["Tarih", "Cari", "Fatura", "Tutar", "Durum"]);
    expect(source?.headers.length).toBeGreaterThanOrEqual(ACADEMY_EXCEL_DENSE_DUMP_MIN_COLS);
    expect(source?.rows.length).toBeGreaterThanOrEqual(ACADEMY_EXCEL_DENSE_DUMP_MIN_ROWS);
    expect(academyExcelIsDenseDumpTable(source)).toBe(true);
    expect(source).toEqual(ACADEMY_OFFICE_AI_2_DENSE_DUMP_TABLE);
    expect(slides[1]?.table).toEqual(ACADEMY_OFFICE_AI_2_DENSE_DUMP_TABLE);
    expect(slides[2]?.table).toEqual(ACADEMY_OFFICE_AI_2_DENSE_DUMP_TABLE);
    expect(slides[3]?.table).toEqual(ACADEMY_OFFICE_AI_2_CLEAN_TABLE);
    expect(academyExcelOfficeAi2SeedTutarSum()).toBe(54650);
    expect(ACADEMY_OFFICE_AI_2_DENSE_DUMP_TABLE.headers).toContain("Bölge");
    expect(ACADEMY_OFFICE_AI_2_DENSE_DUMP_TABLE.headers).toContain("Risk");
    expect(ACADEMY_OFFICE_AI_2_DENSE_DUMP_TABLE.headers.length).toBeGreaterThanOrEqual(12);
    const after = slides[4]?.table;
    expect(after?.headers).toEqual(["Madde", "Kaynak sayı", "Not"]);
    expect(after?.rows[0]).toEqual(["Toplam", "54.650", "Mart tahsilat; trend Kaya önde"]);
    expect(after?.rows[1]?.[1]).toBe("8.200");
    expect(after?.rows[2]?.[1]).toBe("9.100");
    expect(after?.rows[3]?.[2]).toMatch(/Demir/u);
    expect(slides[5]?.table?.headers).toEqual(["Madde", "Kaynak sayı", "Not"]);
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
    expect(css).toMatch(
      /\.academy-player-compare-pane \.academy-pptx-kpi\s*\{[^}]*min-height:\s*3\.7rem/s,
    );
    expect(css).toMatch(
      /\.academy-excel-desk--dense \.academy-excel-grid-wrap\s*\{[^}]*overflow:\s*auto/s,
    );
    const excel = readFileSync(join(ROOT, "components/academy/lesson-excel-workspace.tsx"), "utf8");
    expect(excel).toContain("academy-excel-desk--dense");
    expect(excel).toContain("academyExcelIsDenseDumpTable");
    expect(excel).toContain("denseDump");
    const player = readFileSync(join(ROOT, "components/academy/curriculum-player.tsx"), "utf8");
    const eye = readFileSync(join(ROOT, "components/academy/lesson-visual-stage.tsx"), "utf8");
    expect(player).toContain('data-academy-prompt-host="below-transport"');
    expect(eye).not.toContain("LessonPromptConsole");
    expect(eye).toContain("data-academy-prompt-dock");
  });

  it("karaoke harf düşürmez; aktif kelime layout shift ve descender kesmez", () => {
    const timings = loadAcademySealedAudioTimings(KEY);
    expect(timings?.durationSec).toBe(553.84);
    expect(timings?.cacheV).toBe(553840);
    const cues = loadAcademyLessonCues(KEY);
    expect(cues.at(-1)?.end).toBe(553.84);
    for (const cue of cues) {
      const pieces = timings!.pieces.filter((piece) => piece.cueId === cue.id);
      expect(pieces[0]?.start, cue.id).toBe(cue.start);
      expect(pieces.at(-1)?.end, cue.id).toBe(cue.end);
    }
    const strip = loadAcademyKaraokeStrip(KEY);
    expect(strip.at(-1)?.end).toBe(553.84);
    expect(strip.some((line) => /üç maddelik yönetim özeti/u.test(line.text))).toBe(true);
    expect(strip.some((line) => /uydurma yüzde/iu.test(line.text))).toBe(true);
    expect(strip.some((line) => /hücreden aldırırsın/u.test(line.text))).toBe(true);
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
