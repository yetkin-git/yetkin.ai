import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadAcademyCinemaCueSlides } from "@/lib/academy/cinema-cue-catalog";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { officeAiMasteryModule } from "@/lib/academy/curricula/office_ai";
import { academyExcelFocusZoomActive } from "@/lib/academy/excel-focus-zoom";
import { academyVisualCompareStage } from "@/lib/academy/excel-workspace";
import {
  ACADEMY_OFFICE_AI_6_COMPARE_AFTER_LABEL,
  ACADEMY_OFFICE_AI_6_COMPARE_BEFORE_LABEL,
  ACADEMY_OFFICE_AI_6_HOWTO_STEPS,
  ACADEMY_OFFICE_AI_6_POCKET_STEPS,
} from "@/lib/academy/lesson-beat-visual";
import {
  ACADEMY_BED_OUTRO_PEAK_GAIN,
  academyBedDuckGain,
} from "@/lib/academy/lesson-bed-duck";
import { loadAcademySealedAudioTimings } from "@/lib/academy/lesson-audio-timings";
import {
  ACADEMY_INTRO_GENERIC_SEC,
  academyLessonIntroIsActive,
  academyLessonSpeechHasStarted,
  academyOutroSummaryLabels,
} from "@/lib/academy/lesson-intro";
import {
  ACADEMY_WELCOME_PUNCHCARD_MAX_SEC,
  academyPunchcardLabel,
  hasAcademyLessonCues,
  loadAcademyLessonCues,
} from "@/lib/academy/lesson-cues";
import { academyCitizenPlayerLayer } from "@/lib/academy/citizen-player-layer";
import { hasAcademyLessonVisualStage, loadAcademyLessonVisualStage } from "@/lib/academy/lesson-visual-stage";
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
  ACADEMY_WEEKLY_ROUTINE_COPILOT_PROMPT,
  ACADEMY_WEEKLY_ROUTINE_EXAM_GATE_SEAL,
  academyWeeklyRoutineExamGateSealVisible,
} from "@/lib/academy/weekly-routine-workspace";
import {
  DRON_WELCOME_PUNCHCARD_MAX_SEC,
  dronAcademyPunchcardsForLesson,
  dronLessonDeliveryLabel,
} from "../../apps/rail-is/src/ui/academy-punchcards";
import {
  isAcademySpokenScriptLessonKey,
  loadAcademySpokenScriptMarkdownParagraphs,
  loadAcademySpokenScriptProse,
} from "@/lib/academy/spoken-scripts";

const SLUG = "01_office_ai";
const KEY = "01_office_ai-6";
const PUNCHCARDS = [
  "GİRİŞ KÖPRÜSÜ",
  "HOŞ GELDİN",
  "DAĞINIK HAFTA",
  "OTUZ DAKİKA",
  "ÜÇ BLOK",
  "FARK ORTADA",
  "CEBİNE KOY",
  "SIRA SENDE",
] as const;

describe("01_office_ai bölüm 6 — Haftalık Sistem Altın Şablon", () => {
  it("makale Gözde girişi, Cuma 30 ve Gmail köprüsü taşır", () => {
    const lessons = curriculumForCourseSlug(SLUG);
    expect(lessons).toHaveLength(9);
    const lesson = lessons.find((row) => row.key === KEY)!;
    expect(lesson.key).toBe(KEY);
    expect(lesson.order).toBe(9);
    expect(lesson.title).toMatch(/Haftalık Sistem/u);
    expect(lesson.title).not.toMatch(/Sınav Köprüsü/u);
    expect(lesson.body).toMatch(/30 dakika/iu);
    expect(lesson.body).not.toMatch(/ses kaseti değildir/iu);
    expect(officeAiMasteryModule.sections.find((section) => section.lessonKey === KEY)?.pedagogicalObjective).toMatch(
      /30 dakikalık/u,
    );
  });

  it("Beat 3 split-screen sol dağınık hafta, sağ Cuma otuz; spoiler kapalı", () => {
    const slides = loadAcademyCinemaCueSlides(KEY);
    expect(slides).toHaveLength(8);
    expect(slides.every((slide) => slide.layout === "excel")).toBe(true);
    expect(slides.map((slide) => slide.section)).toEqual([...PUNCHCARDS]);
    expect(slides[0]?.visualMode).toBe("veo");
    expect(loadAcademyLessonVisualStage(KEY)?.cards[0]?.src).toBe(ACADEMY_OFFICE_AI_1_VEO_ASSET_KEY);
    expect(slides[3]?.copilot?.hideReply).toBe(true);
    expect(slides[3]?.copilot?.prompt).toBe(ACADEMY_WEEKLY_ROUTINE_COPILOT_PROMPT);
    expect(slides[3]?.visualMode).toBe("live");
    expect(JSON.stringify(slides[3]?.table)).toContain("Yapıştırma");
    expect(JSON.stringify(slides[3]?.table)).not.toContain("Tablo yerinde");
    expect(slides[4]?.visualMode).toBe("split");
    expect(slides[5]?.compare?.beforeCueIndex).toBe(3);
    expect(slides[5]?.compare?.beforeLabel).toBe(ACADEMY_OFFICE_AI_6_COMPARE_BEFORE_LABEL);
    expect(slides[5]?.compare?.afterLabel).toBe(ACADEMY_OFFICE_AI_6_COMPARE_AFTER_LABEL);
    expect(JSON.stringify(slides[5]?.table)).toContain("10 dk");
    expect(JSON.stringify(slides[5]?.table)).toContain("Excel temizlik");
    expect(JSON.stringify(slides[5]?.table)).toContain("Slayt özet");
    expect(JSON.stringify(slides[5]?.table)).toContain("E-posta sıfırlama");
    expect(JSON.stringify(slides[5]?.table)).not.toContain("Gmail paneli");
    expect(slides[7]?.bullets).toContain(ACADEMY_WEEKLY_ROUTINE_EXAM_GATE_SEAL);
    expect(ACADEMY_OFFICE_AI_6_POCKET_STEPS).toEqual([
      "Cuma 30'u takvime yaz",
      "10 Excel + 10 slayt + 10 kutu",
      "Maskeli kısa son çare",
    ]);
  });

  it("giriş nefesi 2.0 sn, outro 0.70 zirve, zoom cue-04’te takvime iner", () => {
    expect(ACADEMY_INTRO_GENERIC_SEC).toBe(2);
    expect(academyLessonIntroIsActive(KEY, 0)).toBe(true);
    expect(academyLessonSpeechHasStarted(KEY, 2)).toBe(true);
    expect(academyOutroSummaryLabels(KEY)).toEqual([
      "Takvime yaz",
      "10+10+10 blok",
      "Maskeli kısa özet",
    ]);
    const timings = loadAcademySealedAudioTimings(KEY);
    const pieces = timings?.pieces ?? [];
    expect(pieces[0]?.start).toBe(2);
    const lastEnd = pieces.at(-1)?.end ?? 0;
    expect(lastEnd).toBe(timings?.durationSec);
    expect(lastEnd).toBeGreaterThanOrEqual(420);
    expect(lastEnd).toBeLessThanOrEqual(720);
    expect(academyBedDuckGain(lastEnd, pieces)).toBe(ACADEMY_BED_OUTRO_PEAK_GAIN);
  });
});

describe("01_office_ai bölüm 6 — senaryo ve mühür kapısı", () => {
  it("konuşma metni oturunca punchcardlar ve Gmail köprüsü sırayla parlar", () => {
    expect(isAcademySpokenScriptLessonKey(KEY)).toBe(true);
    expect(hasAcademyLessonCues(KEY)).toBe(true);
    expect(hasAcademyLessonVisualStage(KEY)).toBe(true);
    const spoken = loadAcademySpokenScriptMarkdownParagraphs(KEY);
    expect(spoken).toHaveLength(14);
    const prose = loadAcademySpokenScriptProse(KEY);
    expect(prose).toMatch(/Selamlar, ben Gözde/u);
    expect(prose).toMatch(/Haftalık Sistem/u);
    expect(prose).toMatch(/30 Dakika/u);
    expect(prose).toMatch(/kapanış dersi/u);
    expect(prose).toMatch(/sınav kapısı/iu);
    expect(prose).not.toMatch(/Sınav Köprüsü/u);
    expect(prose).not.toMatch(/sınav köprüsü/iu);
    expect(prose).not.toMatch(/Word bloğunda/u);
    expect(prose).not.toMatch(/Excel ve Word dosyasını/u);
    expect(prose).toMatch(/Excel tablosunu ve (?:PowerPoint|Pauer Point) sunusunu ataş/u);
    expect(prose).toMatch(/Slayt bloğunda (?:PowerPoint|Pauer Point) sunusunu ataşla/u);
    expect(prose).toMatch(/Kişi adı, IBAN veya şirket sırrı varsa önce maskele/u);
    expect(prose).toMatch(/kopyala-yapıştır/iu);
    expect(prose).toMatch(/görüşmek üzere/u);
    expect(prose).not.toMatch(/kirli/iu);
    expect(prose).not.toMatch(/sapan hücre/iu);
    expect(prose).not.toMatch(/çapraz sorgu/iu);
    expect(prose).not.toMatch(/kutuyu yerinde/iu);
    expect(prose).not.toMatch(/taşıma su/iu);
    const cues = loadAcademyLessonCues(KEY);
    expect(cues.map((cue) => academyPunchcardLabel(cue.text))).toEqual([...PUNCHCARDS]);
    const compare = academyVisualCompareStage(KEY, "cue-06");
    expect(compare?.beforeLabel).toBe(ACADEMY_OFFICE_AI_6_COMPARE_BEFORE_LABEL);
    expect(compare?.afterLabel).toBe(ACADEMY_OFFICE_AI_6_COMPARE_AFTER_LABEL);
    const cue04 = cues.find((cue) => cue.id === "cue-04");
    expect(cue04).toBeTruthy();
    expect(academyExcelFocusZoomActive(KEY, cue04!.start)).toBe(true);
    expect(cues[0]!.start).toBe(ACADEMY_INTRO_GENERIC_SEC);
    const timings = loadAcademySealedAudioTimings(KEY);
    expect(cues.at(-1)?.end).toBe(timings?.durationSec);
  });

  it("Sebep → Eylem → Sonuç: 10+10+10, sınav kapısı ve Baraj 70 kilitlenir", () => {
    const prose = loadAcademySpokenScriptProse(KEY);
    const body = curriculumForCourseSlug(SLUG).find((row) => row.key === KEY)?.body ?? "";
    expect(prose).toMatch(/Peki neden Cuma otuzu on artı on artı on olarak bölünür\?/u);
    expect(prose).toMatch(/üç ayrı kapıdır/u);
    expect(prose).toMatch(/Peki neden bu ders bitince sınav kapısı açılır\?/u);
    expect(prose).toMatch(/mühürlü vize kartı dokuz alışkanlığın hepsini ister/u);
    expect(prose).toMatch(/Peki neden on dakika Excel, on dakika slayt, on dakika e-posta ayrı durur\?/u);
    expect(prose).toMatch(/temizlik bitmeden özet uydurur/u);
    expect(prose).toMatch(/Peki neden sınav kapısı yalnız bu dersten sonra açılır\?/u);
    expect(prose).toMatch(/Baraj 70 durur/u);
    expect(prose).not.toMatch(/kahraman/u);
    expect(prose).not.toMatch(/Baraj yetmiştir/u);
    expect(prose).not.toMatch(/Geçme notu yetmiştir/u);
    expect(prose).not.toMatch(/Satın alma belge basmaz/u);
    expect(prose).not.toMatch(/Haftalık Sistem kahramanlık değil/u);
    expect(body).toMatch(/Peki neden Cuma otuzu on artı on artı on olarak bölünür/u);
    expect(body).toMatch(/Peki neden bu ders bitince sınav kapısı açılır/u);
    expect(body).toMatch(/Baraj 70/u);
    expect(body).not.toMatch(/kahraman/u);
    expect(body).not.toMatch(/Geçme notu yetmiştir/u);
    expect(body).not.toMatch(/Baraj yetmiştir/u);
  });

  it("HOŞ GELDİN rozeti 18 sn auto-hide; mini sınav ve Dron punchcard durur", () => {
    expect(ACADEMY_WELCOME_PUNCHCARD_MAX_SEC).toBe(18);
    expect(DRON_WELCOME_PUNCHCARD_MAX_SEC).toBe(18);
    const exam = loadAcademyLessonExam(KEY);
    expect(exam?.passScore).toBe(70);
    expect(exam?.questions.map((row) => row.id)).toEqual(["q_off_l6_1", "q_off_l6_2", "q_off_l6_3"]);
    const punchcards = dronAcademyPunchcardsForLesson(KEY);
    expect(punchcards.map((card) => card.label)).toEqual([...PUNCHCARDS]);
    const cues = loadAcademyLessonCues(KEY);
    const welcome = cues.find((cue) => cue.section === "HOŞ GELDİN");
    expect(punchcards.find((card) => card.label === "HOŞ GELDİN")?.end).toBe(
      (welcome?.start ?? 0) + ACADEMY_WELCOME_PUNCHCARD_MAX_SEC,
    );
    const timings = loadAcademySealedAudioTimings(KEY);
    expect(punchcards.at(-1)?.end).toBe(timings?.durationSec);
    expect(isAcademyLessonAudioSealed(SLUG, KEY)).toBe(true);
    expect(academyCitizenPlayerLayer(SLUG, KEY).kind).toBe("article+karaoke");
    expect(dronLessonDeliveryLabel(KEY)).toBe("Sesli anlatım");
    expect(ACADEMY_OFFICE_AI_6_HOWTO_STEPS.map((step) => step.label)).toEqual([
      "Takvime Yaz",
      "Üç Bloğu Kur",
      "E-postayı Kapat",
    ]);
  });

  it("web ve Dron yüzeyi 6. dersi okuma metni yaması olarak basmaz", () => {
    const ROOT = process.cwd();
    const player = readFileSync(join(ROOT, "components/academy/curriculum-player.tsx"), "utf8");
    const copy = readFileSync(join(ROOT, "lib/copy/sen-voice/academy.ts"), "utf8");
    const dronScreen = readFileSync(join(ROOT, "apps/rail-is/src/screens/AcademyPlayerScreen.tsx"), "utf8");
    const dronCopy = readFileSync(join(ROOT, "apps/rail-is/src/ui/copy.ts"), "utf8");
    for (const src of [player, copy, dronScreen, dronCopy]) {
      expect(src).not.toMatch(/Bu ders okuma metnidir/u);
      expect(src).not.toMatch(/Ses kaseti yoktur/u);
    }
    expect(player).not.toContain("data-academy-article-notice");
    expect(dronScreen).not.toContain("articleHint");
    expect(dronLessonDeliveryLabel(KEY)).toBe("Sesli anlatım");
  });

  it("16:9 Cuma tuvali ezilmez; üç blok ve Sınav Kapısı Açıldı mührü durur", () => {
    const ROOT = process.cwd();
    const css = readFileSync(join(ROOT, "app/globals.css"), "utf8");
    expect(css).toMatch(
      /\.academy-player-karaoke \.academy-player-widescreen[\s\S]*?aspect-ratio:\s*16\s*\/\s*9/s,
    );
    expect(css).toMatch(/\.academy-player-waiter > \.academy-excel-desk[\s\S]*?height:\s*100%/s);
    expect(css).toMatch(/\.academy-excel-desk--weekly \.academy-excel-win\s*\{[^}]*height:\s*100%/s);
    expect(css).toMatch(/\.academy-exam-gate-seal\s*\{[^}]*aspect-ratio:\s*1\s*\/\s*1/s);
    expect(css).toMatch(/\.academy-exam-gate-seal-title\s*\{[^}]*padding-block:\s*0\.08em 0\.22em/s);
    expect(css).toMatch(/\.academy-exam-gate-seal-title\s*\{[^}]*overflow:\s*visible/s);
    expect(css).not.toMatch(/\.academy-exam-gate-seal[^{]*\{[^}]*scaleY\(/s);
    const excel = readFileSync(join(ROOT, "components/academy/lesson-excel-workspace.tsx"), "utf8");
    expect(excel).toContain("academy-excel-desk--weekly");
    expect(excel).toContain('data-academy-exam-gate-seal="opened"');
    expect(excel).toContain("ACADEMY_WEEKLY_ROUTINE_EXAM_GATE_SEAL");
    expect(academyWeeklyRoutineExamGateSealVisible(KEY, "SIRA SENDE", "live")).toBe(true);
    expect(academyWeeklyRoutineExamGateSealVisible(KEY, "CEBİNE KOY", "live")).toBe(false);
    expect(academyWeeklyRoutineExamGateSealVisible(KEY, "SIRA SENDE", "before")).toBe(false);
    const player = readFileSync(join(ROOT, "components/academy/curriculum-player.tsx"), "utf8");
    expect(player).toContain('data-academy-prompt-host="below-transport"');
  });

  it("karaoke harf düşürmez; aktif kelime layout shift ve descender kesmez", () => {
    const timings = loadAcademySealedAudioTimings(KEY);
    expect(timings).not.toBeNull();
    expect(timings!.durationSec).toBeGreaterThanOrEqual(420);
    expect(timings!.durationSec).toBeLessThanOrEqual(720);
    const cues = loadAcademyLessonCues(KEY);
    expect(cues.at(-1)?.end).toBe(timings!.durationSec);
    for (const cue of cues) {
      const pieces = timings!.pieces.filter((piece) => piece.cueId === cue.id);
      expect(pieces[0]?.start, cue.id).toBe(cue.start);
      expect(pieces.at(-1)?.end, cue.id).toBe(cue.end);
    }
    const strip = loadAcademyKaraokeStrip(KEY);
    expect(strip.at(-1)?.end).toBe(timings!.durationSec);
    const stripText = strip.map((line) => line.text).join(" ");
    expect(stripText).toMatch(/Peki neden Cuma otuzu on artı on artı on olarak bölünür/u);
    expect(stripText).toMatch(/mühürlü vize kartı/u);
    expect(stripText).toMatch(/Baraj 70 durur/u);
    expect(stripText).not.toMatch(/kahraman/u);
    expect(stripText).not.toMatch(/Baraj yetmiştir/u);
    for (const line of strip) {
      const words = academyKaraokeWords(line);
      expect(academyKaraokeReconstructLine(words)).toBe(academyKaraokeNormalizeLine(line.text));
      expect(words.every((word) => word.text.length > 0)).toBe(true);
    }
    const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");
    expect(css).toMatch(/\.academy-player-karaoke-word\s*\{[^}]*overflow:\s*visible/s);
    expect(css).toMatch(/\.academy-player-karaoke-word\s*\{[^}]*padding-block:\s*0\.08em 0\.22em/s);
    expect(css).toMatch(/\.academy-player-karaoke-word\s*\{[^}]*font-weight:\s*inherit/s);
    expect(css).toMatch(
      /\.academy-player-karaoke-word\[data-state="active"\]\s*\{[^}]*font-weight:\s*inherit/s,
    );
    expect(css).toMatch(/\.academy-player-karaoke-line\s*\{[^}]*line-height:\s*1\.5/s);
  });
});
