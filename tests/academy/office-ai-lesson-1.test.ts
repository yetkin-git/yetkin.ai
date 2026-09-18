import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { academyCitizenPlayerLayer } from "@/lib/academy/citizen-player-layer";
import { loadAcademyCinemaCueSlides } from "@/lib/academy/cinema-cue-catalog";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { officeAiMasteryModule } from "@/lib/academy/curricula/office_ai";
import {
  academyActivePunchcard,
  academyPunchcardLabel,
  hasAcademyLessonCues,
  loadAcademyLessonCues,
} from "@/lib/academy/lesson-cues";
import { hasAcademyLessonVisualStage, loadAcademyLessonVisualStage, academyVisualVeoPunchHasEnded } from "@/lib/academy/lesson-visual-stage";
import { loadAcademySealedAudioTimings } from "@/lib/academy/lesson-audio-timings";
import {
  ACADEMY_OFFICE_AI_01_FRAME_PUBLIC_PATH,
  ACADEMY_OFFICE_AI_1_TRANSFER_LABELS,
  academyVisualCompareStage,
  academyVisualWaiterKind,
  academyVisualWaiterSlide,
} from "@/lib/academy/excel-workspace";
import {
  ACADEMY_GOLDEN_COMPARE_AFTER_LABEL,
  ACADEMY_GOLDEN_COMPARE_BEFORE_LABEL,
  ACADEMY_GOLDEN_WAITER_RATIO,
} from "@/lib/academy/lesson-beat-visual";
import { academyLearningOutcomesForSlug } from "@/lib/academy/learning-outcomes";
import { isAcademyLessonAudioSealed } from "@/lib/academy/pilot-sku";
import {
  isAcademySpokenScriptLessonKey,
  loadAcademySpokenScriptMarkdownParagraphs,
  loadAcademySpokenScriptProse,
} from "@/lib/academy/spoken-scripts";

const ROOT = process.cwd();
const SLUG = "01_office_ai";
const KEY = "01_office_ai-1";
const PUNCHCARDS = [
  "GİRİŞ KÖPRÜSÜ",
  "HOŞ GELDİN",
  "DÜZENSİZ TABLO",
  "A1 HÜCRESİ",
  "TEMİZLE ŞİMDİ",
  "FARK ORTADA",
  "CEBİNE KOY",
  "SIRA SENDE",
] as const;

describe("01_office_ai bölüm 1 — insani ses ve çok katmanlı reji", () => {
  it("makale Gözde girişi, A1 hücresi ve insani veda taşır", () => {
    const lessons = curriculumForCourseSlug(SLUG);
    expect(lessons).toHaveLength(9);
    expect(officeAiMasteryModule.sections).toHaveLength(9);
    expect(officeAiMasteryModule.voiceConfig.voice).toBe("Callirrhoe");
    const lesson = lessons.find((row) => row.key === KEY)!;
    expect(lesson.key).toBe(KEY);
    expect(lesson.order).toBe(1);
    expect(lesson.title).toContain("Düzensiz Excel");
    expect(lesson.body).toMatch(/Selamlar, ben Gözde/u);
    expect(lesson.body).toMatch(/A1 hücresi/u);
    expect(lesson.body).toMatch(/Hazırsan 2\. derste buluşalım/u);
    expect(lesson.body).toMatch(/KVKK ve maskeleme/u);
    expect(lesson.body).toMatch(/tabloyu temizleme refleksi artık cebinde/u);
    expect(lesson.body).not.toMatch(/görüşmek üzere/u);
    expect(academyLearningOutcomesForSlug(SLUG).join(" ")).toMatch(/A1 hücresi/u);
  });

  it("konuşma metni 15 paragraf, Callirrhoe cue punchcardları sırayla parlar", () => {
    expect(isAcademySpokenScriptLessonKey(KEY)).toBe(true);
    expect(hasAcademyLessonCues(KEY)).toBe(true);
    const spoken = loadAcademySpokenScriptMarkdownParagraphs(KEY);
    expect(spoken).toHaveLength(15);
    const prose = loadAcademySpokenScriptProse(KEY);
    const cues = loadAcademyLessonCues(KEY);
    expect(prose).toMatch(/Selamlar, ben Gözde/u);
    expect(cues.flatMap((cue) => cue.paragraphs ?? []).join(" ")).toMatch(/ChatGPT/u);
    expect(cues.flatMap((cue) => cue.paragraphs ?? []).join(" ")).toMatch(/Claude/u);
    expect(cues.flatMap((cue) => cue.paragraphs ?? []).join(" ")).toMatch(/Gemini/u);
    expect(prose).not.toMatch(/kopyala-yapıştır/u);
    expect(prose).not.toMatch(/taşıma su/iu);
    expect(prose).toMatch(/ataş simgesinden/u);
    expect(prose).toMatch(/Üç Kapı/u);
    expect(prose).toMatch(/birinci kapı/u);
    expect(prose).not.toMatch(/gemini\.google\.com/u);
    expect(prose).not.toMatch(/Favoriler veya Uygulamalar/u);
    expect(prose).not.toMatch(/Gmail'de Cemini yerleşik eklentisini/u);
    expect(prose).toMatch(/Kopilot lisansın varsa/u);
    expect(cues.flatMap((cue) => cue.paragraphs ?? []).join(" ")).toMatch(/Copilot lisansın varsa/u);
    expect(cues.flatMap((cue) => cue.paragraphs ?? []).join(" ")).toMatch(/ataş simgesinden/u);
    expect(prose).toMatch(/Hazırsan 2\. derste buluşalım/u);
    expect(prose).toMatch(/tabloyu temizleme refleksi artık cebinde/u);
    expect(prose).toMatch(/Kavekaka/u);
    expect(prose).toMatch(/maskeleme/u);
    expect(prose).not.toMatch(/grafik raporuna/u);
    expect(prose).not.toMatch(/görüşmek üzere/u);
    expect(prose).not.toMatch(/kirli/iu);
    expect(prose).not.toMatch(/Uygulama Programlama Arayüzü/u);
    expect(prose).not.toMatch(/Özet Tablo \(Pivot\) tablo/u);
    expect(prose).not.toMatch(/süper gücün/u);
    expect(prose).not.toMatch(/sihirli başlangıç/u);
    expect(prose).not.toMatch(/Kör bir fizik yasası/u);
    expect(prose).not.toMatch(/enerjini topla/u);
    expect(prose).not.toMatch(/hafızana kazı/u);
    expect(prose).toMatch(/Şimdi mantığı oturtalım/u);
    expect(prose).toMatch(/Peki neden/u);
    expect(prose).toMatch(/Neden\?/u);
    expect(prose).toMatch(/ö zel API/u);
    expect(cues.flatMap((cue) => cue.paragraphs ?? []).join(" ")).toMatch(/özel API/u);
    expect(prose).toMatch(/özet tabloya/u);
    expect(cues.map((cue) => academyPunchcardLabel(cue.text))).toEqual([...PUNCHCARDS]);
    expect(cues.map((cue) => cue.paragraphs?.length ?? 0)).toEqual([1, 2, 2, 2, 3, 2, 1, 2]);
    expect(academyActivePunchcard(cues, 0)).toBeNull();
    expect(academyActivePunchcard(cues, 2)?.label).toBe("GİRİŞ KÖPRÜSÜ");
    const last = cues[cues.length - 1]!;
    expect(academyActivePunchcard(cues, last.start + 0.1)?.label).toBe("SIRA SENDE");
    const pocket = cues.find((cue) => academyPunchcardLabel(cue.text) === "CEBİNE KOY");
    expect(pocket?.paragraphs?.join(" ")).toMatch(/1\./u);
  });

  it("göz katmanı 8 Excel slaytı basar; A1 hücresi odaklı tam-boy ızgara", () => {
    expect(hasAcademyLessonVisualStage(KEY)).toBe(true);
    const stage = loadAcademyLessonVisualStage(KEY);
    expect(stage?.cards).toHaveLength(8);
    expect(stage?.posterSrc).toBe(ACADEMY_OFFICE_AI_01_FRAME_PUBLIC_PATH);
    expect(stage?.cards.map((card) => card.src)).toEqual([
      "01_office_ai-1-warmup",
      "/academy/cinema/01_office_ai-1-cue-2.jpg",
      "/academy/cinema/01_office_ai-1-cue-3.jpg",
      "/academy/cinema/01_office_ai-1-cue-4.jpg",
      "/academy/cinema/01_office_ai-1-cue-5.jpg",
      "/academy/cinema/01_office_ai-1-cue-6.jpg",
      "/academy/cinema/01_office_ai-1-cue-7.jpg",
      "/academy/cinema/01_office_ai-1-cue-8.jpg",
    ]);
    expect(stage?.cards[0]?.kind).toBe("veo");
    const slides = loadAcademyCinemaCueSlides(KEY);
    expect(slides).toHaveLength(8);
    expect(slides.every((slide) => slide.layout === "excel")).toBe(true);
    expect(slides.every((slide) => slide.highlightCell === "A1")).toBe(true);
    expect(slides.map((slide) => slide.section)).toEqual([...PUNCHCARDS]);
    expect(slides[0]?.visualMode).toBe("veo");
    expect(slides[0]?.table?.headers[0]).toBe("Tarih");
    expect(slides[2]?.mergedTop).toBe(true);
    expect(slides[2]?.headline).toBe("DÜZENSİZ TABLO");
    expect(slides[3]?.zoomA1).toBe(true);
    expect(slides[3]?.mergedTop).toBe(true);
    expect(slides[3]?.formulaBar).toBe("Mart 2026 Tahsilat Dökümü");
    expect(slides[4]?.mergedTop).toBe(true);
    expect(JSON.stringify(slides[3]?.table)).toContain("Mart-12");
    expect(JSON.stringify(slides[4]?.table)).toContain("8.200 TL");
    expect(JSON.stringify(slides[3]?.table)).not.toContain("12.450,00");
    expect(JSON.stringify(slides[4]?.table)).not.toContain("12.450,00");
    expect(slides[4]?.section).toBe("TEMİZLE ŞİMDİ");
    expect(slides[4]?.bullets).toEqual([...ACADEMY_OFFICE_AI_1_TRANSFER_LABELS]);
    expect(slides[4]?.copilot?.replyLines.slice(0, 3)).toEqual([
      "1. Copilot şeridi.",
      "2. Ataş yükle.",
      "3. Maskeli kısa özet.",
    ]);
    expect(slides[5]?.visualMode).toBe("split");
    expect(slides[5]?.compare?.beforeCueIndex).toBe(3);
    expect(slides[5]?.compare?.beforeLabel).toBe(ACADEMY_GOLDEN_COMPARE_BEFORE_LABEL);
    expect(slides[5]?.compare?.afterLabel).toBe(ACADEMY_GOLDEN_COMPARE_AFTER_LABEL);
    expect(JSON.stringify(slides[5]?.table)).toContain("12.450,00");
    expect(slides[6]?.section).toBe("CEBİNE KOY");
    expect(slides[7]?.beat).toBe("task");
    expect(slides[7]?.visualMode).toBe("live");
    expect(slides[7]?.table?.rows[0]?.[0]).toBe("12.03.2026");
    expect(existsSync(join(ROOT, "public", ACADEMY_OFFICE_AI_01_FRAME_PUBLIC_PATH.slice(1)))).toBe(
      true,
    );
    for (const card of stage?.cards ?? []) {
      if (card.kind === "veo") {
        expect(existsSync(join(ROOT, "public/media/academy/micro/01_office_ai-1-warmup.mp4"))).toBe(
          true,
        );
        expect(academyVisualWaiterKind(KEY, card.cueId)).toBe("cinema");
        continue;
      }
      expect(existsSync(join(ROOT, "public", card.src.slice(1))), card.src).toBe(true);
      expect(academyVisualWaiterKind(KEY, card.cueId)).toBe("excel");
      expect(academyVisualWaiterSlide(KEY, card.cueId)?.highlightCell).toBe("A1");
    }
  });

  it("ses mührü karaoke katmanını açar; punchcard sahnesi durur", () => {
    expect(isAcademyLessonAudioSealed(SLUG, KEY)).toBe(true);
    const layer = academyCitizenPlayerLayer(SLUG, KEY);
    expect(layer.kind).toBe("article+karaoke");
    const player = readFileSync(join(ROOT, "components/academy/curriculum-player.tsx"), "utf8");
    const eye = readFileSync(join(ROOT, "components/academy/lesson-visual-stage.tsx"), "utf8");
    expect(player).toContain("karaokeCues={karaoke.cues}");
    expect(player).toContain("captions={false}");
    expect(eye).toContain("<LessonKaraokeStrip");
  });

  it("vatandaş sahnesi canlı A1 tablosunu basar; rozet sağ üstte metne binmez", () => {
    const eye = readFileSync(join(ROOT, "components/academy/lesson-visual-stage.tsx"), "utf8");
    const excel = readFileSync(join(ROOT, "components/academy/lesson-excel-workspace.tsx"), "utf8");
    const css = readFileSync(join(ROOT, "app/globals.css"), "utf8");
    expect(eye).toContain("LessonExcelWorkspace");
    expect(eye).toContain("academyVisualCompareStage");
    expect(eye).toContain("academyCompareDockPrompt");
    expect(eye).toContain("data-academy-eye-canvas");
    expect(eye).toContain('data-academy-compare="split"');
    expect(eye).toContain(`data-academy-waiter-ratio={String(ACADEMY_GOLDEN_WAITER_RATIO)}`);
    expect(eye).toContain("data-academy-punchcard-dock");
    expect(eye).toContain("LessonHowtoSteps");
    expect(eye).not.toContain("academy-player-punchcard-scrim");
    expect(eye).toContain("data-academy-intro");
    expect(eye).toContain("data-academy-outro");
    expect(eye).toContain("data-academy-veo");
    expect(eye).toContain("academy-player-intro");
    expect(excel).toContain('data-academy-excel-live=""');
    expect(excel).toContain("data-academy-ai-desk");
    expect(excel).toContain("LessonAiDesk");
    expect(excel).toContain("LessonOfficeCopilotRibbon");
    expect(excel).toContain("data-academy-office-app");
    expect(excel).toContain("ACADEMY_OFFICE_AI_1_TRANSFER_LABELS");
    expect(excel).toContain("data-academy-highlight-cell");
    expect(excel).toContain("data-academy-excel-pane");
    expect(excel).toContain("academy-excel-desk--focus-zoom");
    expect(excel).toContain("data-academy-excel-focus-zoom");
    expect(excel).toContain("academyExcelMouseState");
    expect(excel).toContain("data-academy-excel-mouse-layer");
    expect(excel).toContain("data-academy-excel-active-cell");
    expect(excel).toContain("academyExcelSelection");
    expect(excel).toContain("academy-excel-selection-box");
    expect(excel).toContain("data-academy-excel-merge");
    expect(css).toContain("academy-excel-active-cell-border");
    expect(css).toContain('.academy-excel-desk[data-academy-excel-selection="merge"] .academy-excel-mouse-select');
    expect(eye).toContain("academyExcelFocusZoomActive");
    expect(eye).toContain("academyVisualVeoPunchHasEnded");
    expect(eye).toContain("includeVeoTable");
    expect(eye).toContain('lang="tr"');
    expect(css).toContain("transform: scale(var(--academy-excel-focus-scale, 1))");
    expect(css).toContain("--academy-excel-focus-scale: 1.2");
    expect(css).toContain("transform-origin: var(--academy-excel-focus-origin, 12% 22%)");
    expect(css).toContain("academy-player-waiter");
    expect(css).toContain("academy-player-compare");
    expect(css).toContain("academy-player-compare-pane--before");
    expect(css).toContain("academy-player-compare-pane--after");
    expect(css).toContain("academy-player-punchcard-dock");
    expect(css).toContain("academy-player-intro--outro");
    expect(css).toContain("academy-player-outro-summary");
    expect(css).toContain("academy-outro-peak");
    expect(css).toContain("academy-excel-mouse-layer");
    expect(css).toContain("academy-excel-transfer-tags");
    expect(css).toMatch(/\.academy-player-punchcard-dock\s*\{[^}]*right:\s*0\.7rem/s);
    expect(ACADEMY_GOLDEN_WAITER_RATIO).toBe(80);
  });

  it("FARK ORTADA anında Önce/Sonra split-screen basar; Beat 4 düzenli tabloya döner", () => {
    const cues = loadAcademyLessonCues(KEY);
    const fark = cues.find((cue) => academyPunchcardLabel(cue.text) === "FARK ORTADA");
    expect(fark).toBeTruthy();
    expect(academyActivePunchcard(cues, fark!.start)?.label).toBe("FARK ORTADA");
    const compare = academyVisualCompareStage(KEY, "cue-06");
    expect(compare).not.toBeNull();
    expect(compare?.beforeLabel).toBe(ACADEMY_GOLDEN_COMPARE_BEFORE_LABEL);
    expect(compare?.afterLabel).toBe(ACADEMY_GOLDEN_COMPARE_AFTER_LABEL);
    expect(compare?.before.mergedTop).toBe(true);
    expect(compare?.after.highlightCell).toBe("A1");
    expect(compare?.beat).toBe("comparison");
    expect(academyVisualCompareStage(KEY, "cue-01")).toBeNull();
    expect(academyVisualCompareStage(KEY, "cue-05")).toBeNull();
    expect(academyVisualCompareStage(KEY, "cue-07")).toBeNull();
    expect(academyVisualCompareStage(KEY, "cue-08")).toBeNull();
    const slides = loadAcademyCinemaCueSlides(KEY);
    expect(slides[0]?.beat).toBe("warmup");
    expect(slides[3]?.beat).toBe("command");
    expect(JSON.stringify(slides.map((slide) => `${slide.headline} ${slide.section}`))).not.toMatch(/kirli/iu);
  });

  it("Command spoiler yok; Veo 8.00’de canlı masaya keser; TTS jargon ve DÜZENSİZ kilitli", () => {
    const slides = loadAcademyCinemaCueSlides(KEY);
    expect(slides[3]?.beat).toBe("command");
    expect(slides[4]?.beat).toBe("command");
    expect(slides[3]?.mergedTop).toBe(true);
    expect(slides[4]?.mergedTop).toBe(true);
    expect(slides[5]?.visualMode).toBe("split");
    expect(JSON.stringify(slides[5]?.table?.rows)).toContain("12.450,00");
    expect(PUNCHCARDS[2]).toBe("DÜZENSİZ TABLO");
    expect(PUNCHCARDS[2]).toMatch(/İ/u);

    const stage = loadAcademyLessonVisualStage(KEY);
    const veo = stage?.cards[0];
    expect(veo?.kind).toBe("veo");
    expect(veo?.durationSec).toBe(8);
    expect(academyVisualVeoPunchHasEnded(veo!, veo!.startSec + 7.99)).toBe(false);
    expect(academyVisualVeoPunchHasEnded(veo!, veo!.startSec + 8)).toBe(true);
    expect(academyVisualWaiterSlide(KEY, "cue-01")).toBeNull();
    expect(academyVisualWaiterSlide(KEY, "cue-01", { includeVeoTable: true })?.fileName).toBe("Kitap1.xlsx");

    const spoken = loadAcademySealedAudioTimings(KEY)?.pieces.map((piece) => piece.text).join(" ") ?? "";
    expect(spoken).not.toMatch(/Uygulama Programlama Arayüzü/u);
    expect(spoken).not.toMatch(/Özet Tablo \(Pivot\) tablo/u);
    expect(spoken).toMatch(/ö zel API/u);
    expect(spoken).toMatch(/özet tabloya/u);
  });
});
