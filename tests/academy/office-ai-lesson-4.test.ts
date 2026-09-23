import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { loadAcademyCinemaCueSlides } from "@/lib/academy/cinema-cue-catalog";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { academyExcelFocusZoomActive } from "@/lib/academy/excel-focus-zoom";
import { academyExcelMouseState } from "@/lib/academy/excel-mouse-pointer";
import { academyVisualCompareStage } from "@/lib/academy/excel-workspace";
import {
  ACADEMY_OFFICE_AI_4_COMPARE_AFTER_LABEL,
  ACADEMY_OFFICE_AI_4_COMPARE_BEFORE_LABEL,
  ACADEMY_OFFICE_AI_4_POCKET_STEPS,
} from "@/lib/academy/lesson-beat-visual";
import { ACADEMY_OUTLOOK_COPILOT_PROMPT } from "@/lib/academy/outlook-workspace";
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
const KEY = "01_office_ai-4";
const PUNCHCARDS = [
  "GİRİŞ KÖPRÜSÜ",
  "HOŞ GELDİN",
  "KUTU KAOSU",
  "TASLAK YAZ",
  "SIFIR KUTU",
  "FARK ORTADA",
  "CEBİNE KOY",
  "SIRA SENDE",
] as const;
/** fırın öncesi — mühürlü cue JSON hâlâ INBOX KAOSU okur. */
const SEALED_PUNCHCARDS = [
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
  it("ritüel kaseti sınav yolunda yoktur; aynı iş 6. dersin ilk iki dakikasındadır", () => {
    const lessons = curriculumForCourseSlug(SLUG);
    expect(lessons).toHaveLength(8);
    expect(lessons.some((row) => row.key === KEY)).toBe(false);
    const lesson = lessons.find((row) => row.key === "01_office_ai-g1")!;
    expect(lesson.order).toBe(6);
    expect(lesson.title).toMatch(/E-Posta Akışı/u);
    expect(lesson.body).toMatch(/Peki neden gelen kutusu şişer/u);
    expect(lesson.body).toMatch(/Peki e-posta triyajı nedir/u);
    expect(lesson.body).toMatch(/ilk iki dakika/u);
    expect(lesson.body).toMatch(/Peki yapay zekâya neden taslak yanıt yazdırılır/u);
    expect(lesson.body).toMatch(/Peki taslak insan onayı verilmeden neden gönderilmez/u);
    expect(lesson.body).not.toMatch(/KUTU KAOSU/u);
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
      "Gelen kutumdaki okunmamış iletileri tara. Bugün ödeme veya imza bekleyenleri Acil, bu hafta cevap bekleyenleri Aksiyon, dekont ve bültenleri Arşivlik diye etiketle. Aksiyon için taslak yanıt notu yaz. Hiçbir iletiyi gönderme, hiçbirini silme.",
    );
    expect(slides[3]?.visualMode).toBe("live");
    expect(slides[4]?.visualMode).toBe("split");
    expect(slides[5]?.visualMode).toBe("split");
    expect(slides[5]?.compare?.beforeCueIndex).toBe(3);
    expect(slides[5]?.compare?.beforeLabel).toBe(ACADEMY_OFFICE_AI_4_COMPARE_BEFORE_LABEL);
    expect(slides[5]?.compare?.afterLabel).toBe(ACADEMY_OFFICE_AI_4_COMPARE_AFTER_LABEL);
    expect(JSON.stringify(slides[5]?.table)).toContain("Acil");
    expect(JSON.stringify(slides[5]?.table)).toContain("Kaya Gıda");
    expect(JSON.stringify(slides[5]?.table)).toContain("Arşivlik");
    expect(slides[5]?.nodes?.map((node) => node.title)).toEqual([
      "ACİL AKSİYON",
      "AKSİYON / BEKLEYEN",
      "ARŞİVLİK",
    ]);
    expect(slides[3]?.table?.note).toMatch(/Örnek iletiler/u);
    expect(ACADEMY_OFFICE_AI_4_POCKET_STEPS).toEqual([
      "Önem sırası etiketle",
      "Taslak yanıt iste",
      "Arşive al",
    ]);
  });

  it("05:55 anında sağ panel 3 grup kartı basar; 142 mail listesi yok", () => {
    const cues = loadAcademyLessonCues(KEY);
    const atFiveFiftyFive = cues.find((cue) => cue.start <= 355 && cue.end > 355);
    expect(atFiveFiftyFive?.id).toBe("cue-06");
    const compare = academyVisualCompareStage(KEY, atFiveFiftyFive!.id);
    expect(compare?.beforeLabel).toBe(ACADEMY_OFFICE_AI_4_COMPARE_BEFORE_LABEL);
    expect(compare?.afterLabel).toBe(ACADEMY_OFFICE_AI_4_COMPARE_AFTER_LABEL);
    expect(compare?.after.nodes?.map((node) => node.title)).toEqual([
      "ACİL AKSİYON",
      "AKSİYON / BEKLEYEN",
      "ARŞİVLİK",
    ]);
    expect(JSON.stringify(compare?.after.table)).toContain("140 bülten ve davet");
    expect(JSON.stringify(compare?.after.table)).not.toContain("Üç toplantı daveti");
  });

  it("giriş nefesi 2.0 sn, outro 0.70 zirve, zoom ve sanal fare cue-04’te açılır", () => {
    expect(ACADEMY_INTRO_GENERIC_SEC).toBe(2);
    expect(academyLessonIntroIsActive(KEY, 0)).toBe(true);
    expect(academyLessonIntroIsActive(KEY, 1.9)).toBe(true);
    expect(academyLessonSpeechHasStarted(KEY, 2)).toBe(true);
    expect(academyBedOutroTailSec(KEY)).toBeGreaterThan(0);
    expect(academyOutroSummaryLabels(KEY)).toEqual(["Önem sırası etiketle", "Taslak yanıt iste", "Arşive al"]);
    expect(loadAcademyCinemaCueSlides(KEY)[0]?.visualMode).toBe("veo");
    const pieces = loadAcademySealedAudioTimings(KEY)?.pieces ?? [];
    if (pieces.length === 0) {
      expect(isAcademyLessonAudioSealed(SLUG, KEY)).toBe(false);
      return;
    }
    expect(pieces[0]?.start).toBe(2);
    expect(academyBedDuckGain(0.5, pieces)).toBe(ACADEMY_BED_BREATH_GAIN);
    const lastEnd = pieces.at(-1)?.end ?? 0;
    expect(lastEnd).toBe(493.8);
    expect(academyBedDuckGain(lastEnd, pieces)).toBe(ACADEMY_BED_OUTRO_PEAK_GAIN);
    expect(academyBedDuckGain(lastEnd + 1.5, pieces)).toBe(ACADEMY_BED_OUTRO_PEAK_GAIN);
    expect(academyBedDuckGain(lastEnd + 4.5, pieces)).toBe(0);
  });
});

describe("01_office_ai bölüm 4 — senaryo ve mühür kapısı", () => {
  it("konuşma metni oturunca punchcardlar ve L5 köprüsü sırayla parlar", () => {
    expect(isAcademySpokenScriptLessonKey(KEY)).toBe(false);
    expect(hasAcademyLessonCues(KEY)).toBe(true);
    expect(hasAcademyLessonVisualStage(KEY)).toBe(true);
    const spoken = loadAcademySpokenScriptMarkdownParagraphs(KEY);
    expect(spoken).toHaveLength(14);
    const prose = loadAcademySpokenScriptProse(KEY);
    expect(prose).toMatch(/Selamlar, ben Gözde/u);
    expect(prose).toMatch(/Hata Avı/u);
    expect(prose).toMatch(/okunmamış/iu);
    expect(prose).toMatch(/taslak yanıt/iu);
    expect(prose).toMatch(/Panel ayrı derstedir/u);
    expect(prose).toMatch(/bir sonraki derste/u);
    expect(prose).not.toMatch(/ücretsiz Çetcipiti/u);
    expect(prose).not.toMatch(/ekranına yapıştır/u);
    expect(prose).toMatch(/Gmail/u);
    expect(prose).not.toMatch(/kirli/iu);
    const cues = loadAcademyLessonCues(KEY);
    expect(cues.map((cue) => academyPunchcardLabel(cue.text))).toEqual([...SEALED_PUNCHCARDS]);
    const compare = academyVisualCompareStage(KEY, "cue-06");
    expect(compare?.beforeLabel).toBe("ÖNCE (142 OKUNMAMIŞ İLETİ)");
    expect(compare?.afterLabel).toBe("SONRA (SIFIR KUTU - AI)");
    expect(compare?.after.nodes?.map((node) => node.title)).toEqual([
      "ACİL AKSİYON",
      "AKSİYON / BEKLEYEN",
      "ARŞİVLİK",
    ]);
    expect(JSON.stringify(compare?.after.table)).not.toMatch(/Haftalık Bülten/u);
    const cue04 = cues.find((cue) => cue.id === "cue-04");
    expect(cue04).toBeTruthy();
    expect(cue04!.start).toBe(208.64);
    expect(academyExcelFocusZoomActive(KEY, cue04!.start)).toBe(true);
    expect(academyExcelMouseState(KEY, cue04!.start + 0.05)?.visible).toBe(true);
    expect(cues[0]!.start).toBe(ACADEMY_INTRO_GENERIC_SEC);
    expect(cues.at(-1)?.end).toBe(493.8);
  });

  it("ses mührü karaoke katmanını açar; mini sınav baraj 70 durur", () => {
    const exam = loadAcademyLessonExam(KEY);
    expect(exam?.passScore).toBe(70);
    expect(exam?.questions.map((row) => row.id)).toEqual(["q_off_l4_1", "q_off_l4_2", "q_off_l4_3"]);
    const punchcards = dronAcademyPunchcardsForLesson(KEY);
    expect(punchcards.map((card) => card.label)).toContain("INBOX KAOSU"); // fırın öncesi
    expect(punchcards.at(-1)?.end).toBe(493.8);
    expect(isAcademyLessonAudioSealed(SLUG, KEY)).toBe(false);
    expect(academyCitizenPlayerLayer(SLUG, KEY).kind).toBe("article");
  });

  it("Sebep → Eylem → Sonuç ve gelen kutu kilidi durur", () => {
    const prose = loadAcademySpokenScriptProse(KEY);
    expect(prose).toMatch(/Peki neden gelen kutusu şişer\?/u);
    expect(prose).toMatch(/her yeni satır aynı yığında durur/u);
    expect(prose).toMatch(/Peki e-posta triyajı nedir\?/u);
    expect(prose).toMatch(/açmadan önce acil, aksiyon veya arşivlik/u);
    expect(prose).toMatch(/Önce e-posta etiketlenir, sonra yanıt taslağı hazırlanır/u);
    expect(prose).toMatch(/Taslak mesaj onaylanmadan gönderilmez/u);
    expect(prose).not.toMatch(/taslak yalandır/u);
    expect(prose).toMatch(/Peki yapay zekâya neden taslak yanıt yazdırılır\?/u);
    expect(prose).toMatch(/Peki taslak insan onayı verilmeden neden gönderilmez\?/u);
    expect(prose).toMatch(/Model nezaket üretir, taahhüt üretemez/u);
    expect(prose).not.toMatch(/üç altın kural/u);
    expect(prose).not.toMatch(/arkana yaslan/u);
    expect(prose).not.toMatch(/akıllı bir asistan hayal/u);
    expect(prose).not.toMatch(/güvenlik ve yönlendirme görevlisi/u);
    expect(prose).not.toMatch(/kontrol hissi tavan yapar/u);
    expect(prose).not.toMatch(/muazzam dönüşüm/u);
  });

  it("16:9 Outlook tuvali ezilmez; gelen kutu, Copilot şeridi ve sıfır kutu kartları dolgundur", () => {
    const slides = loadAcademyCinemaCueSlides(KEY);
    expect(slides[3]?.copilot?.prompt).toBe(ACADEMY_OUTLOOK_COPILOT_PROMPT);
    expect(slides[3]?.copilot?.hideReply).toBe(true);
    expect(slides[4]?.visualMode).toBe("split");
    expect(slides[5]?.compare?.beforeLabel).toBe(ACADEMY_OFFICE_AI_4_COMPARE_BEFORE_LABEL);
    expect(slides[5]?.compare?.afterLabel).toBe(ACADEMY_OFFICE_AI_4_COMPARE_AFTER_LABEL);
    const css = readFileSync(join(ROOT, "app/globals.css"), "utf8");
    expect(css).toMatch(
      /\.academy-player-karaoke \.academy-player-widescreen[\s\S]*?aspect-ratio:\s*16\s*\/\s*9/s,
    );
    expect(css).toMatch(/\.academy-player-waiter \.academy-outlook-win\s*\{[^}]*height:\s*100%/s);
    expect(css).toMatch(
      /\.academy-outlook-desk > \.academy-office-win-fit[\s\S]*?height:\s*100%/s,
    );
    expect(css).toMatch(/\.academy-outlook-row\s*\{[^}]*background:\s*#163250/s);
    expect(css).toMatch(/\.academy-outlook-list-head\s*\{[^}]*color:\s*#7dd3fc/s);
    expect(css).toMatch(/\.academy-outlook-group--acil\s*\{[^}]*#3f1a22/s);
    expect(css).toMatch(/\.academy-outlook-group--bekle\s*\{[^}]*#3d3010/s);
    expect(css).toMatch(/\.academy-outlook-group--arsiv\s*\{[^}]*#12382f/s);
    expect(css).not.toMatch(/\.academy-outlook-canvas\s*\{[^}]*background:\s*#000(?:000)?/s);
    const outlook = readFileSync(join(ROOT, "components/academy/lesson-outlook-workspace.tsx"), "utf8");
    expect(outlook).toContain("LessonAiDesk");
    expect(outlook).toContain("LessonOfficeCopilotRibbon");
    expect(outlook).toContain("ACADEMY_OUTLOOK_RESET_GROUPS");
    expect(outlook).toContain("Gelen Kutusu · {unread} okunmamış");
    const player = readFileSync(join(ROOT, "components/academy/curriculum-player.tsx"), "utf8");
    const eye = readFileSync(join(ROOT, "components/academy/lesson-visual-stage.tsx"), "utf8");
    expect(player).toContain('data-academy-prompt-host="below-transport"');
    expect(eye).not.toContain("LessonPromptConsole");
    expect(eye).toContain("data-academy-prompt-dock");
  });

  it("karaoke harf düşürmez; aktif kelime layout shift ve descender kesmez", () => {
    const timings = loadAcademySealedAudioTimings(KEY);
    expect(timings?.durationSec).toBe(493.8);
    expect(timings?.cacheV).toBe(493800);
    const cues = loadAcademyLessonCues(KEY);
    expect(cues.at(-1)?.end).toBe(493.8);
    for (const cue of cues) {
      const pieces = timings!.pieces.filter((piece) => piece.cueId === cue.id);
      expect(pieces[0]?.start, cue.id).toBe(cue.start);
      expect(pieces.at(-1)?.end, cue.id).toBe(cue.end);
    }
    const strip = loadAcademyKaraokeStrip(KEY);
    expect(strip.at(-1)?.end).toBe(493.8);
    const stripText = strip.map((line) => line.text).join(" ");
    expect(stripText).toMatch(/Peki neden gelen kutusu şişer/u);
    expect(stripText).toMatch(/Peki e-posta triyajı nedir/u);
    expect(stripText).toMatch(/Önce e-posta etiketlenir/u);
    expect(stripText).not.toMatch(/taslak yalandır/u);
    expect(stripText).toMatch(/taslak yanıt yazdırılır/u);
    expect(stripText).toMatch(/insan onayı verilmeden neden gönderilmez/u);
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
