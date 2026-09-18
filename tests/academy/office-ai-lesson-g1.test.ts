import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadAcademyCinemaCueSlides } from "@/lib/academy/cinema-cue-catalog";
import { OFFICE_AI_PLANNED_LESSONS, officeAiPlannedLessonByKey } from "@/lib/academy/curricula/office_ai";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { academyVisualCompareStage } from "@/lib/academy/excel-workspace";
import {
  ACADEMY_OFFICE_AI_G1_COMPARE_AFTER_LABEL,
  ACADEMY_OFFICE_AI_G1_COMPARE_BEFORE_LABEL,
  ACADEMY_OFFICE_AI_G1_POCKET_STEPS,
} from "@/lib/academy/lesson-beat-visual";
import { ACADEMY_GMAIL_GEMINI_PROMPT, academyGmailStageKind } from "@/lib/academy/gmail-workspace";
import { loadAcademySealedAudioTimings } from "@/lib/academy/lesson-audio-timings";
import { hasAcademyLessonCues, loadAcademyLessonCues } from "@/lib/academy/lesson-cues";
import { hasAcademyLessonVisualStage } from "@/lib/academy/lesson-visual-stage";
import {
  academyKaraokeNormalizeLine,
  academyKaraokeReconstructLine,
  academyKaraokeWords,
  loadAcademyKaraokeStrip,
} from "@/lib/academy/lesson-teleprompter-flow";
import {
  isAcademySpokenScriptLessonKey,
  loadAcademySpokenScriptProse,
} from "@/lib/academy/spoken-scripts";

const ROOT = process.cwd();
const KEY = "01_office_ai-g1";
const PUNCHCARDS = [
  "GİRİŞ KÖPRÜSÜ",
  "HOŞ GELDİN",
  "TAŞIMA SU",
  "GEMİNİ AÇ",
  "YERLEŞİK YOL",
  "FARK ORTADA",
  "CEBİNE KOY",
  "SIRA SENDE",
] as const;

describe("01_office_ai-g1 — Gmail + Gemini ana akış reji", () => {
  it("haritada main / gmail-gemini durur; canlı sınav 9 derstir", () => {
    const planned = officeAiPlannedLessonByKey(KEY);
    expect(planned?.lane).toBe("main");
    expect(planned?.method).toBe("gmail-gemini");
    expect(planned?.status).toBe("sealed");
    expect(officeAiPlannedLessonByKey(KEY)?.key).toBe(KEY);
    expect(OFFICE_AI_PLANNED_LESSONS.some((lesson) => lesson.key === KEY)).toBe(true);
    const live = curriculumForCourseSlug("01_office_ai");
    expect(live).toHaveLength(9);
    expect(live[6]?.key).toBe(KEY);
    expect(live[6]?.order).toBe(7);
    expect(hasAcademyLessonCues(KEY)).toBe(true);
    expect(hasAcademyLessonVisualStage(KEY)).toBe(true);
    expect(isAcademySpokenScriptLessonKey(KEY)).toBe(true);
  });

  it("Beat 3 split-screen sol taşıma su, sağ yerleşik Gemini; prompt terminali kilitli", () => {
    const slides = loadAcademyCinemaCueSlides(KEY);
    expect(slides).toHaveLength(8);
    expect(slides.every((slide) => slide.layout === "gmail")).toBe(true);
    expect(slides.map((slide) => slide.section)).toEqual([...PUNCHCARDS]);
    expect(slides[0]?.visualMode).toBe("veo");
    expect(slides[3]?.copilot?.hideReply).toBe(true);
    expect(slides[3]?.copilot?.prompt).toBe(ACADEMY_GMAIL_GEMINI_PROMPT);
    expect(slides[3]?.visualMode).toBe("live");
    expect(slides[4]?.visualMode).toBe("split");
    expect(slides[5]?.visualMode).toBe("split");
    expect(slides[5]?.compare?.beforeCueIndex).toBe(3);
    expect(slides[5]?.compare?.beforeLabel).toBe(ACADEMY_OFFICE_AI_G1_COMPARE_BEFORE_LABEL);
    expect(slides[5]?.compare?.afterLabel).toBe(ACADEMY_OFFICE_AI_G1_COMPARE_AFTER_LABEL);
    expect(JSON.stringify(slides[5]?.table)).toContain("Gönderen");
    expect(JSON.stringify(slides[5]?.table)).toContain("Arşivlik");
    expect(slides[3]?.table?.note).toMatch(/Spoiler/u);
    expect(academyGmailStageKind({ section: "TAŞIMA SU" })).toBe("disconnected");
    expect(academyGmailStageKind({ section: "GEMİNİ AÇ", hideReply: true })).toBe("inbox");
    expect(academyGmailStageKind({ pane: "before", section: "FARK ORTADA" })).toBe("disconnected");
    expect(academyGmailStageKind({ pane: "after", section: "FARK ORTADA" })).toBe("native");
    expect(academyGmailStageKind({ section: "FARK ORTADA" })).toBe("native");
    expect(ACADEMY_OFFICE_AI_G1_POCKET_STEPS).toEqual([
      "Yerleşik paneli aç",
      "Aksiyon tablosu iste",
      "Onaylamadan gönderme",
    ]);
    const compare = academyVisualCompareStage(KEY, "cue-06");
    expect(compare?.beforeLabel).toBe(ACADEMY_OFFICE_AI_G1_COMPARE_BEFORE_LABEL);
    expect(compare?.afterLabel).toBe(ACADEMY_OFFICE_AI_G1_COMPARE_AFTER_LABEL);
    expect(compare?.after.copilot?.prompt).toBe(ACADEMY_GMAIL_GEMINI_PROMPT);
    expect(compare?.after.nodes?.map((node) => node.title)).toEqual([
      "ÖDEME / ONAY",
      "ACİL AKSİYON",
      "ARŞİVLİK",
    ]);
  });

  it("konuşma metni SEN dili, atlanmış kapı ve prompt terminalini taşır", () => {
    const spoken = readFileSync(join(ROOT, "lib/academy/spoken-scripts/01_office_ai-g1.md"), "utf8");
    expect(spoken).toContain("Selamlar, ben Gözde");
    expect(spoken).toContain("taşıma su");
    expect(spoken).toContain("atlanmış kapı");
    expect(spoken).not.toMatch(/taşıma su yasak/iu);
    expect(spoken).not.toMatch(/Dördüncü derste Outlook/u);
    expect(spoken).not.toMatch(/Sekiz ders bitmeden/u);
    expect(spoken).toMatch(/6\. derste Outlook/u);
    expect(spoken).toContain(ACADEMY_GMAIL_GEMINI_PROMPT);
    expect(spoken).toMatch(/kopyala-yapıştır/iu);
    expect(spoken).not.toMatch(/AI masası/u);
    const cinemaHtml = readFileSync(join(ROOT, "scripts/render-academy-cinema-html.ts"), "utf8");
    expect(cinemaHtml).toContain('case "gmail"');
    expect(cinemaHtml).toContain("GELEN KUTUSUNDAN KOPUK / TAŞIMA SU YÖNTEMİ");
    expect(cinemaHtml).toContain("GELEN KUTUSU İÇİ / YERLEŞİK GEMİNİ ENTEGRASYONU");
    const gmailWs = readFileSync(join(ROOT, "components/academy/lesson-gmail-workspace.tsx"), "utf8");
    expect(gmailWs).toContain("applyAcademyOfficeWinFit");
    expect(gmailWs).toContain("data-academy-office-win-fit");
    expect(gmailWs).toContain("TAŞIMA SU");
    expect(gmailWs).toContain("ACADEMY_GMAIL_MAILS.map");
  });

  it("Sebep → Eylem → Sonuç: yerleşik panel ve kim-ne-ne zaman kilitlenir", () => {
    const prose = loadAcademySpokenScriptProse(KEY);
    const body = curriculumForCourseSlug("01_office_ai").find((row) => row.key === KEY)?.body ?? "";
    expect(prose).toMatch(/Peki neden hâlâ maili Çetcipiti’ye kopyalıyoruz\?/u);
    expect(prose).toMatch(/kopyalanan gövde kutudan kopar/u);
    expect(prose).toMatch(/Peki neden kopyala-yapıştır varsayılan yol değildir\?/u);
    expect(prose).toMatch(/Peki aksiyon listesinde kim, ne, ne zaman neden kilitlenir\?/u);
    expect(prose).toMatch(/gönderen yoksa tahsilat kime bağlanır/u);
    expect(prose).toMatch(/Peki neden Çetcipiti penceresi değil de bu yerleşik panel\?/u);
    expect(prose).toMatch(/Peki neden bu atlanmış kapıdır/u);
    expect(prose).toMatch(/Peki neden fark bu kadar belirgin\?/u);
    expect(prose).not.toMatch(/kahramanlıktır/u);
    expect(prose).not.toMatch(/Tablo istemek yöneticiliktir/u);
    expect(prose).not.toMatch(/vaadi nettir/u);
    expect(prose).not.toMatch(/hamal değilsin/u);
    expect(prose).not.toMatch(/iki ayrı kader/u);
    expect(prose).not.toMatch(/üç eşleşmeyi ezberle/u);
    expect(prose).not.toMatch(/Baraj yetmiştir/u);
    expect(prose).not.toMatch(/doygun ayağı/u);
    expect(body).toMatch(/Peki neden hâlâ maili ChatGPT/u);
    expect(body).toMatch(/Peki aksiyon listesinde kim, ne, ne zaman neden kilitlenir/u);
    expect(body).not.toMatch(/kahramanlıktır/u);
    expect(body).not.toMatch(/vaadi nettir/u);
  });

  it("16:9 Gmail tuvali ezilmez; gelen kutu, Gemini paneli ve aksiyon kartları dolgundur", () => {
    const css = readFileSync(join(ROOT, "app/globals.css"), "utf8");
    expect(css).toMatch(
      /\.academy-player-karaoke \.academy-player-widescreen[\s\S]*?aspect-ratio:\s*16\s*\/\s*9/s,
    );
    expect(css).toMatch(/\.academy-player-waiter \.academy-outlook-win\s*\{[^}]*height:\s*100%/s);
    expect(css).toMatch(
      /\.academy-gmail-desk \.academy-outlook-canvas--compact[\s\S]*?background:\s*#122033/s,
    );
    expect(css).not.toMatch(
      /\.academy-gmail-desk \.academy-outlook-canvas[\s\S]{0,180}background:\s*#000(?:000)?/s,
    );
    expect(css).not.toMatch(/\.academy-outlook-canvas\s*\{[^}]*background:\s*#000(?:000)?/s);
    expect(css).toMatch(/\.academy-gmail-copilot\s*\{[^}]*background:\s*#152536/s);
    expect(css).toMatch(/\.academy-outlook-row\s*\{[^}]*background:\s*#163250/s);
    expect(css).toMatch(/\.academy-outlook-list-head\s*\{[^}]*color:\s*#7dd3fc/s);
    expect(css).toMatch(/\.academy-outlook-group--acil\s*\{[^}]*#3f1a22/s);
    expect(css).toMatch(/\.academy-outlook-group--bekle\s*\{[^}]*#3d3010/s);
    expect(css).toMatch(/\.academy-outlook-group--arsiv\s*\{[^}]*#12382f/s);
    const gmail = readFileSync(join(ROOT, "components/academy/lesson-gmail-workspace.tsx"), "utf8");
    expect(gmail).toContain("LessonAiDesk");
    expect(gmail).toContain("LessonOfficeCopilotRibbon");
    expect(gmail).toContain('host="gmail"');
    expect(gmail).toContain("ACADEMY_GMAIL_ACTION_GROUPS.map");
    const player = readFileSync(join(ROOT, "components/academy/curriculum-player.tsx"), "utf8");
    expect(player).toContain('data-academy-prompt-host="below-transport"');
  });

  it("karaoke harf düşürmez; aktif kelime layout shift ve descender kesmez", () => {
    const timings = loadAcademySealedAudioTimings(KEY);
    expect(timings).not.toBeNull();
    expect(timings!.durationSec).toBe(567.2);
    expect(timings!.cacheV).toBe(567200);
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
    expect(stripText).toMatch(/Peki neden hâlâ maili ChatGPT/u);
    expect(stripText).toMatch(/kim, ne, ne zaman neden kilitlenir/u);
    expect(stripText).toMatch(/yerleşik panel/u);
    expect(stripText).not.toMatch(/kahramanlıktır/u);
    for (const line of strip) {
      const words = academyKaraokeWords(line);
      expect(academyKaraokeReconstructLine(words)).toBe(academyKaraokeNormalizeLine(line.text));
      expect(words.every((word) => word.text.length > 0)).toBe(true);
    }
    const css = readFileSync(join(ROOT, "app/globals.css"), "utf8");
    expect(css).toMatch(/\.academy-player-karaoke-word\s*\{[^}]*overflow:\s*visible/s);
    expect(css).toMatch(/\.academy-player-karaoke-word\s*\{[^}]*padding-block:\s*0\.08em 0\.22em/s);
    expect(css).toMatch(/\.academy-player-karaoke-word\s*\{[^}]*font-weight:\s*inherit/s);
    expect(css).toMatch(
      /\.academy-player-karaoke-word\[data-state="active"\]\s*\{[^}]*font-weight:\s*inherit/s,
    );
    expect(css).toMatch(/\.academy-player-karaoke-line\s*\{[^}]*line-height:\s*1\.5/s);
  });
});
