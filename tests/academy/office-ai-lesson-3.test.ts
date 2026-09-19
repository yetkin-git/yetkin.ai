import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { academyAiDeskPinnedForLesson } from "@/lib/academy/ai-desk";
import { academyCitizenPlayerLayer } from "@/lib/academy/citizen-player-layer";
import { loadAcademyCinemaCueSlides } from "@/lib/academy/cinema-cue-catalog";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { officeAiMasteryModule } from "@/lib/academy/curricula/office_ai";
import {
  ACADEMY_OFFICE_AI_3_FOCUS_ZOOM_MAX_WINDOWS,
  academyExcelFocusZoomActive,
  academyExcelFocusZoomTarget,
  loadAcademyExcelFocusZoomWindows,
} from "@/lib/academy/excel-focus-zoom";
import { academyExcelMouseState } from "@/lib/academy/excel-mouse-pointer";
import { academyVisualCompareStage } from "@/lib/academy/excel-workspace";
import {
  ACADEMY_OFFICE_AI_3_COMPARE_AFTER_LABEL,
  ACADEMY_OFFICE_AI_3_COMPARE_BEFORE_LABEL,
  ACADEMY_OFFICE_AI_3_COPILOT_PROMPT,
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
  academyActivePunchcard,
  academyPunchcardLabel,
  hasAcademyLessonCues,
  loadAcademyLessonCues,
  loadAcademyLessonPlaybackCues,
} from "@/lib/academy/lesson-cues";
import {
  academyCinemaCueSlidePublicPath,
  hasAcademyLessonVisualStage,
  loadAcademyLessonVisualStage,
} from "@/lib/academy/lesson-visual-stage";
import { loadAcademyLessonExam } from "@/lib/academy/lesson-exams";
import { academyLessonWarmupVeoAssetKey } from "@/lib/academy/lesson-veo";
import {
  academyOfficeAabbInsidePane,
  academyOfficeContainCamera,
  academyOfficeIsWidescreenRatio,
  academyOfficeWinFitScale,
} from "@/lib/academy/office-win-fit";
import { isAcademyLessonAudioSealed } from "@/lib/academy/pilot-sku";
import {
  academyKaraokeNormalizeLine,
  academyKaraokeReconstructLine,
  academyKaraokeWords,
  loadAcademyKaraokeStrip,
} from "@/lib/academy/lesson-teleprompter-flow";
import { dronAcademyPunchcardsForLesson } from "../../apps/rail-is/src/ui/academy-punchcards";
import {
  isAcademySpokenScriptLessonKey,
  loadAcademySpokenScriptMarkdownParagraphs,
  loadAcademySpokenScriptProse,
} from "@/lib/academy/spoken-scripts";

const ROOT = process.cwd();
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

describe("01_office_ai bölüm 3 — Metinden Slayta Altın Şablon", () => {
  it("makale Gözde girişi, slayt hazırlama ve L5 köprüsü taşır", () => {
    const lessons = curriculumForCourseSlug(SLUG);
    expect(lessons).toHaveLength(9);
    expect(officeAiMasteryModule.voiceConfig.voice).toBe("Callirrhoe");
    const lesson = lessons.find((row) => row.key === KEY)!;
    expect(lesson.key).toBe(KEY);
    expect(lesson.order).toBe(4);
    expect(lesson.title).toMatch(/Metinden Slayta/u);
    expect(lesson.body).toMatch(/Selamlar, ben Gözde/u);
    expect(lesson.body).toMatch(/yönetici özeti|yönetim özeti/iu);
    expect(lesson.body).toMatch(/şablon/iu);
    expect(lesson.body).toMatch(/slayt tasla/iu);
    expect(lesson.body).toMatch(/Peki neden slayta düz metin yığını doldurulmaz/u);
    expect(lesson.body).toMatch(/Peki tek fikir kuralı nedir/u);
    expect(lesson.body).toMatch(/Peki yapay zekâdan slayt taslağı nasıl alınır/u);
    expect(lesson.body).toMatch(/dosyayı PowerPoint sunusu olarak ataşla/u);
    expect(lesson.body).toMatch(/İstisnalar ve Hata Avı/u);
    expect(lesson.body).toMatch(/E-Posta Akışı/u);
    expect(lesson.body).not.toMatch(/kirli/iu);
    expect(lesson.body).not.toMatch(/yazar fırını/iu);
    expect(lesson.body).not.toMatch(/canavar/iu);
    expect(lesson.body).not.toMatch(/hikâye anlatma sanatı/iu);
    expect(lesson.body).not.toMatch(/Sunum Fabrikası/u);
    expect(lesson.body).not.toMatch(/üç altın kural/iu);
  });

  it("konuşma metni 14 paragraf, punchcardlar ve pekiştirme durakları sırayla parlar", () => {
    expect(isAcademySpokenScriptLessonKey(KEY)).toBe(true);
    expect(hasAcademyLessonCues(KEY)).toBe(true);
    const spoken = loadAcademySpokenScriptMarkdownParagraphs(KEY);
    expect(spoken).toHaveLength(14);
    const prose = loadAcademySpokenScriptProse(KEY);
    expect(prose).toMatch(/Selamlar, ben Gözde/u);
    expect(prose).toMatch(/yönetici özeti|yönetim özeti/iu);
    expect(prose).toMatch(/şablon/iu);
    expect(prose).toMatch(/slayt tasla/iu);
    expect(prose).toMatch(/E-Posta Akışı/u);
    expect(prose).toMatch(/Peki neden slayta düz metin yığını doldurulmaz/u);
    expect(prose).toMatch(/Peki tek fikir kuralı nedir/u);
    expect(prose).toMatch(/Peki yapay zekâdan slayt taslağı nasıl alınır/u);
    expect(prose).toMatch(/Şimdi mantığı oturtalım/u);
    expect(prose).toMatch(/Neden\?/u);
    expect(prose).not.toMatch(/kirli/iu);
    expect(prose).not.toMatch(/yazar fırını/iu);
    expect(prose).not.toMatch(/canavar/iu);
    expect(prose).not.toMatch(/hikâye anlatma sanatı/iu);
    expect(prose).not.toMatch(/üç altın kural/iu);
    expect(prose).not.toMatch(/Sunum Fabrikası/u);
    const cues = loadAcademyLessonCues(KEY);
    expect(cues.map((cue) => academyPunchcardLabel(cue.text))).toEqual([...PUNCHCARDS]);
    expect(cues.map((cue) => cue.paragraphs?.length ?? 0)).toEqual([1, 2, 2, 2, 2, 2, 1, 2]);
    expect(academyActivePunchcard(cues, 0)).toBeNull();
    expect(cues[0]!.start).toBe(ACADEMY_INTRO_GENERIC_SEC);
    expect(academyActivePunchcard(cues, 2)?.label).toBe("GİRİŞ KÖPRÜSÜ");
    const pocket = cues.find((cue) => academyPunchcardLabel(cue.text) === "CEBİNE KOY");
    expect(pocket?.paragraphs?.join(" ")).toMatch(/1\./u);
    expect(pocket?.paragraphs?.join(" ")).toMatch(/tek fikir/iu);
    expect(pocket?.paragraphs?.join(" ")).toMatch(/görsel yönlendir/iu);
    expect(pocket?.paragraphs?.join(" ")).toMatch(/Taslağı aktar/u);
    expect(pocket?.end).toBeGreaterThan(pocket!.start + 35);
  });

  it("Beat 3 split-screen sol düz metin yığını, sağ görsel hiyerarşili slayt; spoiler kapalı", () => {
    expect(hasAcademyLessonVisualStage(KEY)).toBe(true);
    expect(loadAcademyLessonVisualStage(KEY)?.cards).toHaveLength(8);
    expect(loadAcademyLessonVisualStage(KEY)?.cards[0]?.kind).toBe("nano");
    expect(loadAcademyLessonVisualStage(KEY)?.cards[0]?.src).toBe(academyCinemaCueSlidePublicPath(KEY, "cue-01"));
    expect(academyLessonWarmupVeoAssetKey(KEY)).toBeNull();
    const slides = loadAcademyCinemaCueSlides(KEY);
    expect(slides).toHaveLength(8);
    expect(slides.every((slide) => slide.layout === "pptx")).toBe(true);
    expect(slides.map((slide) => slide.section)).toEqual([...PUNCHCARDS]);
    expect(slides[0]?.visualMode).toBe("live");
    expect(slides[3]?.copilot?.hideReply).toBe(true);
    expect(slides[3]?.copilot?.prompt).toBe(ACADEMY_OFFICE_AI_3_COPILOT_PROMPT);
    expect(slides[3]?.copilot?.prompt).toMatch(/tek fikir/u);
    expect(slides[3]?.copilot?.prompt).toMatch(/görsel yönlendirme/u);
    expect(slides[3]?.copilot?.prompt).not.toMatch(/henüz açma|Beat 3|spoiler/iu);
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
    const compare = academyVisualCompareStage(KEY, "cue-06");
    expect(compare?.beforeLabel).toBe("ÖNCE (DÜZ METİN YIĞINI)");
    expect(compare?.afterLabel).toBe("SONRA (GÖRSEL HİYERARŞİLİ SLAYT - AI)");
    expect(ACADEMY_OFFICE_AI_3_POCKET_STEPS).toEqual([
      "Slayt başına tek fikir",
      "Görsel yönlendirmeyi yaz",
      "Taslağı aktar",
    ]);
  });

  it("giriş nefesi 2.0 sn, outro 0.70 zirve, zoom nabzı ≤ 2, kör açılış yok", () => {
    expect(ACADEMY_INTRO_GENERIC_SEC).toBe(2);
    expect(academyLessonIntroIsActive(KEY, 0)).toBe(true);
    expect(academyLessonIntroIsActive(KEY, 1.9)).toBe(true);
    expect(academyLessonSpeechHasStarted(KEY, 2)).toBe(true);
    expect(academyBedOutroTailSec(KEY)).toBeGreaterThan(0);
    expect(academyOutroSummaryLabels(KEY)).toEqual(["Tek fikir / slayt", "Görsel yönlendir", "Taslağı aktar"]);
    expect(loadAcademyCinemaCueSlides(KEY)[0]?.visualMode).toBe("live");
    const cues = loadAcademyLessonPlaybackCues(KEY);
    const cue04 = cues.find((cue) => cue.id === "cue-04");
    expect(cue04).toBeTruthy();
    const zoomWindows = loadAcademyExcelFocusZoomWindows(KEY);
    expect(zoomWindows.length).toBeGreaterThan(0);
    expect(zoomWindows.length).toBeLessThanOrEqual(ACADEMY_OFFICE_AI_3_FOCUS_ZOOM_MAX_WINDOWS);
    expect(zoomWindows[0]?.start).toBeGreaterThan(cue04!.start);
    expect(academyExcelFocusZoomActive(KEY, cue04!.start)).toBe(false);
    expect(academyExcelFocusZoomActive(KEY, zoomWindows[0]!.start + 0.05)).toBe(true);
    expect(new Set(zoomWindows.map((window) => window.target)).size).toBe(zoomWindows.length);
    expect(academyExcelMouseState(KEY, cue04!.start + 0.05)?.visible).toBe(true);
    expect(academyExcelMouseState(KEY, cue04!.start + 0.05)?.cell).toBeTruthy();
    const pieces = loadAcademySealedAudioTimings(KEY)?.pieces ?? [];
    expect(pieces[0]?.start).toBe(2);
    expect(academyBedDuckGain(0.5, pieces)).toBe(ACADEMY_BED_BREATH_GAIN);
    const lastEnd = pieces.at(-1)?.end ?? 0;
    expect(lastEnd).toBe(531.913);
    expect(academyBedDuckGain(lastEnd, pieces)).toBe(ACADEMY_BED_OUTRO_PEAK_GAIN);
    expect(academyBedDuckGain(lastEnd + 1.5, pieces)).toBe(ACADEMY_BED_OUTRO_PEAK_GAIN);
    expect(academyBedDuckGain(lastEnd + 4.5, pieces)).toBe(0);
  });

  it("ses mührü karaoke katmanını açar; mini sınav baraj 70 durur", () => {
    expect(isAcademyLessonAudioSealed(SLUG, KEY)).toBe(true);
    expect(academyCitizenPlayerLayer(SLUG, KEY).kind).toBe("article+karaoke");
    const exam = loadAcademyLessonExam(KEY);
    expect(exam?.passScore).toBe(70);
    expect(exam?.questions.map((row) => row.id)).toEqual(["q_off_l3_1", "q_off_l3_2", "q_off_l3_3"]);
    const punchcards = dronAcademyPunchcardsForLesson(KEY);
    expect(punchcards.map((card) => card.label)).toContain("ŞABLON KAOSU");
    expect(punchcards.at(-1)?.end).toBe(531.913);
  });

  it("Sebep → Eylem → Sonuç ve tek fikir kilidi durur", () => {
    const prose = loadAcademySpokenScriptProse(KEY);
    expect(prose).toMatch(/Peki neden slayta düz metin yığını doldurulmaz\?/u);
    expect(prose).toMatch(/dinleyici okumaya başlar, seni dinlemeyi bırakır/u);
    expect(prose).toMatch(/Peki tek fikir kuralı nedir\?/u);
    expect(prose).toMatch(/Her slayt yalnızca bir vurucu mesaj taşır/u);
    expect(prose).toMatch(/Peki yapay zekâdan slayt taslağı nasıl alınır\?/u);
    expect(prose).toMatch(/görsel yönlendirme/iu);
    expect(prose).toMatch(/parantez içinde tarif/u);
    expect(prose).toMatch(/dosyayı Pauer Point sunusu olarak ataşla/u);
    expect(prose).not.toMatch(/\b(?:xlsx|docx|pptx)\b/u);
    expect(prose).not.toMatch(/Bu örnek ezber slogan değil/u);
    expect(prose).not.toMatch(/saniyeler içinde etkileyici/u);
  });

  it("16:9 pptx tuvali ezilmez; Prompt Terminali sahne dışındadır", () => {
    const css = readFileSync(join(ROOT, "app/globals.css"), "utf8");
    expect(css).toMatch(/\.academy-pptx-canvas\s*\{[^}]*aspect-ratio:\s*16 \/ 9/s);
    expect(css).toMatch(/\.academy-pptx-canvas\s*\{[^}]*object-fit:\s*contain/s);
    expect(css).toMatch(/\.academy-pptx-canvas\s*\{[^}]*height:\s*auto/s);
    expect(css).toMatch(/\.academy-pptx-canvas\s*\{[^}]*max-height:\s*100%/s);
    expect(css).toMatch(/\.academy-pptx-canvas-wrap\s*\{[^}]*overflow:\s*hidden/s);
    expect(css).toContain("[data-fit=\"contain\"]");
    expect(css).toMatch(
      /\.academy-player-compare-pane \.academy-pptx-kpi\s*\{[^}]*min-height:\s*3\.7rem/s,
    );
    expect(css).toMatch(/\.academy-pptx-kpi\s*\{[^}]*min-height:\s*4\.35rem/s);
    expect(css).toContain(".academy-paste-guide[data-academy-paste-anchor=\"copilot\"]");
    expect(css).not.toContain("--academy-pptx-focus-origin: 38% 32%");
    const player = readFileSync(join(ROOT, "components/academy/curriculum-player.tsx"), "utf8");
    const eye = readFileSync(join(ROOT, "components/academy/lesson-visual-stage.tsx"), "utf8");
    const pptx = readFileSync(join(ROOT, "components/academy/lesson-pptx-workspace.tsx"), "utf8");
    expect(player).toContain('data-academy-prompt-host="below-transport"');
    expect(eye).not.toContain("LessonPromptConsole");
    expect(eye).toContain("data-academy-prompt-dock");
    expect(eye).toContain('fit={stageTheme === "pptx" ? "contain" : "cover"}');
    expect(pptx).not.toContain("50% 48%");
    expect(academyAiDeskPinnedForLesson(KEY)).toBe("copilot");
  });

  it("jsdom/kamera kilidi: zoom açıkken pencere waiter dışına taşmaz, oran 1.77, nabız ≤ 2", () => {
    const zoomWindows = loadAcademyExcelFocusZoomWindows(KEY);
    expect(zoomWindows.length).toBeLessThanOrEqual(2);
    expect(zoomWindows.length).toBeGreaterThan(0);
    const waiter = { width: 1280, height: 720 };
    const content = { width: 1600, height: 1100 };
    const rest = academyOfficeWinFitScale({
      paneWidth: waiter.width,
      paneHeight: waiter.height,
      contentWidth: content.width,
      contentHeight: content.height,
    });
    for (const window of zoomWindows) {
      const originX = window.target === "copilot" ? content.width * 0.84 : content.width * 0.42;
      const originY = window.target === "copilot" ? content.height * 0.48 : content.height * 0.52;
      const camera = academyOfficeContainCamera({
        paneWidth: waiter.width,
        paneHeight: waiter.height,
        contentWidth: content.width,
        contentHeight: content.height,
        originX,
        originY,
        zoom: 1.2,
      });
      expect(academyOfficeAabbInsidePane(camera.aabb, waiter), window.target).toBe(true);
      expect(camera.scale).toBeLessThanOrEqual(rest + 1e-9);
      const canvasW = Math.min(camera.aabb.width * 0.58, camera.aabb.height * (16 / 9));
      const canvasH = canvasW * (9 / 16);
      expect(academyOfficeIsWidescreenRatio(canvasW, canvasH)).toBe(true);
      expect(canvasW).toBeLessThanOrEqual(waiter.width);
      expect(canvasH).toBeLessThanOrEqual(waiter.height);
      expect(academyExcelFocusZoomTarget(KEY, window.start + 0.1)).toBe(window.target ?? null);
    }
    const splitPane = { width: 620, height: 700 };
    const splitCanvasW = Math.min(splitPane.width, splitPane.height * (16 / 9));
    const splitCanvasH = splitCanvasW * (9 / 16);
    expect(academyOfficeIsWidescreenRatio(splitCanvasW, splitCanvasH)).toBe(true);
    expect(
      academyOfficeAabbInsidePane(
        { left: 0, top: 28, width: splitCanvasW, height: splitCanvasH },
        splitPane,
      ),
    ).toBe(true);
  });

  it("karaoke harf düşürmez; aktif kelime layout shift ve descender kesmez", () => {
    const timings = loadAcademySealedAudioTimings(KEY);
    expect(timings?.durationSec).toBe(531.913);
    expect(timings?.cacheV).toBe(531913);
    const cues = loadAcademyLessonCues(KEY);
    expect(cues.at(-1)?.end).toBe(531.913);
    for (const cue of cues) {
      const pieces = timings!.pieces.filter((piece) => piece.cueId === cue.id);
      expect(pieces[0]?.start, cue.id).toBe(cue.start);
      expect(pieces.at(-1)?.end, cue.id).toBe(cue.end);
    }
    const strip = loadAcademyKaraokeStrip(KEY);
    expect(strip.at(-1)?.end).toBe(531.913);
    const stripText = strip.map((line) => line.text).join(" ");
    expect(stripText).toMatch(/Peki neden slayta düz metin yığını doldurulmaz/u);
    expect(stripText).toMatch(/tek fikir kuralı nedir/u);
    expect(stripText).toMatch(/slayt taslağı nasıl alınır/u);
    expect(stripText).toMatch(/görsel yönlendir/iu);
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
