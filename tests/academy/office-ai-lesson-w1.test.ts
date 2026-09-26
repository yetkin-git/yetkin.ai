import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadAcademyCinemaCueSlides } from "@/lib/academy/cinema-cue-catalog";
import { OFFICE_AI_PLANNED_LESSONS, officeAiPlannedLessonByKey } from "@/lib/academy/curricula/office_ai";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { academyVisualCompareStage } from "@/lib/academy/excel-workspace";
import {
  ACADEMY_OFFICE_AI_W1_COMPARE_AFTER_LABEL,
  ACADEMY_OFFICE_AI_W1_COMPARE_BEFORE_LABEL,
  ACADEMY_OFFICE_AI_W1_POCKET_STEPS,
} from "@/lib/academy/lesson-beat-visual";
import {
  ACADEMY_WORD_UPLOAD_PROMPT,
  ACADEMY_WORD_FILE_LABEL,
  ACADEMY_WORD_FILE_NAME,
  ACADEMY_WORD_SAMPLE_LOCK,
  academyWordStageKind,
} from "@/lib/academy/word-workspace";
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
const KEY = "01_office_ai-w1";
const PUNCHCARDS = [
  "GİRİŞ KÖPRÜSÜ",
  "HOŞ GELDİN",
  "PARÇA PARÇA",
  "ATAŞ YÜKLE",
  "TEK DOSYAYLA ANALİZ",
  "FARK ORTADA",
  "CEBİNE KOY",
  "SIRA SENDE",
] as const;

describe("01_office_ai-w1 — Word doğrudan dosya yükleme reji", () => {
  it("haritada main / doc-upload-gemini durur; canlı sınav 9 derstir", () => {
    const planned = officeAiPlannedLessonByKey(KEY);
    expect(planned?.lane).toBe("main");
    expect(planned?.method).toBe("doc-upload-gemini");
    expect(planned?.status).toBe("sealed");
    expect(officeAiPlannedLessonByKey(KEY)?.key).toBe(KEY);
    expect(OFFICE_AI_PLANNED_LESSONS.some((lesson) => lesson.key === KEY)).toBe(true);
    const live = curriculumForCourseSlug("01_office_ai");
    expect(live).toHaveLength(8);
    expect(live[6]?.key).toBe(KEY);
    expect(live[6]?.order).toBe(7);
    expect(hasAcademyLessonCues(KEY)).toBe(true);
    expect(hasAcademyLessonVisualStage(KEY)).toBe(true);
    expect(isAcademySpokenScriptLessonKey(KEY)).toBe(true);
  });

  it("Beat 3 split-screen sol parça parça kopya, sağ doğrudan yükleme; prompt terminali kilitli", () => {
    const slides = loadAcademyCinemaCueSlides(KEY);
    expect(slides).toHaveLength(8);
    expect(slides.every((slide) => slide.layout === "word")).toBe(true);
    expect(slides.map((slide) => slide.section)).toEqual([...PUNCHCARDS]);
    expect(slides[0]?.visualMode).toBe("veo");
    expect(slides[3]?.copilot?.hideReply).toBe(true);
    expect(slides[3]?.copilot?.prompt).toBe(ACADEMY_WORD_UPLOAD_PROMPT);
    expect(slides[3]?.fileName).toBe(ACADEMY_WORD_FILE_NAME);
    expect(slides[3]?.nodes?.[0]).toEqual({ title: "Ataş", sub: ACADEMY_WORD_FILE_LABEL });
    expect(JSON.stringify(slides.map((slide) => slide.nodes))).not.toMatch(/\.docx/iu);
    expect(ACADEMY_WORD_FILE_LABEL).toBe("Sözleşme Belgesi (Word)");
    expect(ACADEMY_WORD_FILE_LABEL).not.toMatch(/\.docx/iu);
    expect(slides[4]?.visualMode).toBe("split");
    expect(slides[5]?.visualMode).toBe("split");
    expect(slides[5]?.compare?.beforeCueIndex).toBe(3);
    expect(slides[5]?.compare?.beforeLabel).toBe(ACADEMY_OFFICE_AI_W1_COMPARE_BEFORE_LABEL);
    expect(slides[5]?.compare?.afterLabel).toBe(ACADEMY_OFFICE_AI_W1_COMPARE_AFTER_LABEL);
    expect(ACADEMY_OFFICE_AI_W1_COMPARE_BEFORE_LABEL).toBe("TEK TEK KOPYALAMA");
    expect(ACADEMY_OFFICE_AI_W1_COMPARE_AFTER_LABEL).toBe("TEK DOSYAYLA ANALİZ");
    expect(JSON.stringify(slides[5]?.table)).toContain("CEZAİ ŞART");
    expect(JSON.stringify(slides[5]?.table)).toContain("DİLEKÇE HİTAP");
    expect(JSON.stringify(slides[5]?.table)).toContain("RAPOR MADDESİ");
    expect(slides[3]?.table?.note).toBe(ACADEMY_WORD_SAMPLE_LOCK);
    expect(slides[5]?.table?.note).toBe(ACADEMY_WORD_SAMPLE_LOCK);
    expect(academyWordStageKind({ section: "PARÇA PARÇA" })).toBe("copy");
    expect(academyWordStageKind({ section: "ATAŞ YÜKLE", hideReply: true })).toBe("attach");
    expect(academyWordStageKind({ section: "TEK DOSYAYLA ANALİZ" })).toBe("analysis");
    expect(academyWordStageKind({ pane: "before", section: "FARK ORTADA" })).toBe("copy");
    expect(academyWordStageKind({ pane: "after", section: "FARK ORTADA" })).toBe("analysis");
    expect(academyWordStageKind({ section: "FARK ORTADA" })).toBe("analysis");
    expect(ACADEMY_OFFICE_AI_W1_POCKET_STEPS).toEqual([
      "Dosyayı yükle",
      "Üç işi ayrı iste",
      "İmzayı kendin at",
    ]);
    const compare = academyVisualCompareStage(KEY, "cue-06");
    expect(compare?.beforeLabel).toBe(ACADEMY_OFFICE_AI_W1_COMPARE_BEFORE_LABEL);
    expect(compare?.afterLabel).toBe(ACADEMY_OFFICE_AI_W1_COMPARE_AFTER_LABEL);
    expect(compare?.after.copilot?.prompt).toBe(ACADEMY_WORD_UPLOAD_PROMPT);
    expect(compare?.after.nodes?.map((node) => node.title)).toEqual([
      "CEZAİ ŞART",
      "DİLEKÇE HİTAP",
      "RAPOR MADDESİ",
    ]);
  });

  it("konuşma metni SEN dili, ataş yükleme ve prompt terminalini taşır", () => {
    const spoken = readFileSync(join(ROOT, "lib/academy/spoken-scripts/01_office_ai-w1.md"), "utf8");
    expect(spoken).toContain("Selamlar, ben Gözde");
    expect(spoken).toContain("ataş");
    expect(spoken).toMatch(/Yüklediğim sözleşme dosyasını \(Word belgesi\)/u);
    expect(spoken).toMatch(/parça parça/iu);
    expect(spoken).toContain("dosyayı doğrudan yüklersin");
    expect(spoken).toContain(
      "Onaylı araç ve maske tamamsa Word Copilot varsa şeritten okutursun. Yoksa Word belgesini şirketin onayladığı sohbete yüklersin.",
    );
    expect(spoken).not.toMatch(/ataşla(?:rsın)?/iu);
    expect(spoken).toContain("belirli bir paragraf");
    expect(spoken).not.toMatch(/spesifik/iu);
    expect(spoken).toContain("yazıyorsun");
    expect(spoken).not.toMatch(/yazıyoruz/u);
    expect(spoken).toContain("Dosya adını pratikte kendi dosyanla değiştir.");
    expect(spoken).not.toMatch(/Dosya adı pratikte yanar/u);
    expect(spoken).not.toMatch(/\bkomut/u);
    expect(spoken).toContain(
      "Onaylı sohbet aracı varsa aynı dosyayı oraya yüklersin (ChatGPT, Claude, Gemini, Grok, Kimi, Muse Spark vb.); yöntem değişmez.",
    );
    expect(spoken).not.toMatch(/taşıma sudur/iu);
    expect(spoken).not.toMatch(/öğretilmez/u);
    expect(spoken).not.toMatch(/AI masası/u);
    expect(spoken).not.toMatch(/Sekiz ders bitti/u);
    expect(spoken).toMatch(/Sınav, 8\. ders bitince açılır/u);
    expect(spoken).toMatch(/Kişi adı, IBAN veya ticari sır varsa önce maskele/u);
    expect(spoken).not.toMatch(/\b(?:xlsx|docx|pptx)\b/iu);
    const cinemaHtml = readFileSync(join(ROOT, "scripts/render-academy-cinema-html.ts"), "utf8");
    expect(cinemaHtml).toContain('case "word"');
    expect(cinemaHtml).toContain("ACADEMY_OFFICE_AI_W1_COMPARE_BEFORE_LABEL");
    expect(cinemaHtml).toContain("ACADEMY_OFFICE_AI_W1_COMPARE_AFTER_LABEL");
  });

  it("Sebep → Eylem → Sonuç: riskli madde ve öğretmen sen, belge siz kilitlenir", () => {
    const prose = loadAcademySpokenScriptProse(KEY);
    const body = curriculumForCourseSlug("01_office_ai").find((row) => row.key === KEY)?.body ?? "";
    expect(prose).toMatch(/Peki neden uzun sözleşmeyi yapay zekâya satır satır okutmak yerine riskli maddeleri aratırız\?/u);
    expect(prose).toMatch(/satır satır okutunca yığın çıkar/u);
    expect(prose).toMatch(/Peki Vörd dosyasını parça parça kopyalamak neden doğru bir yöntem değildir\?/u);
    expect(prose).toMatch(/belgenin bütünlüğü bozulur/u);
    expect(prose).not.toMatch(/Üç kaybı ayrı ayrı gör/u);
    expect(prose).not.toMatch(/imza riski kaybolur/u);
    expect(prose).not.toMatch(/ceza oranı kaçar/u);
    expect(prose).toMatch(/Peki neden otuz sayfayı satır satır okutmak yerine bu üç maddeyi aratırız\?/u);
    expect(prose).toMatch(/Peki neden bu atlanmış kapıdır/u);
    expect(prose).toMatch(/öğretmen SEN, belge SIZ çift sicili/u);
    expect(prose).toMatch(/kulağına SEN derim/u);
    expect(prose).toMatch(/Peki neden fark bu kadar belirgin\?/u);
    expect(prose).toContain(
      "Çıkarılan özeti raporunda kullanırsın; son kontrolü ve kararı sen verirsin.",
    );
    expect(prose).not.toMatch(/Karar notu insanındır/u);
    expect(prose).not.toMatch(/Rapor da imza istemez/u);
    expect(prose).not.toMatch(/vaadi üç iştir/u);
    expect(prose).not.toMatch(/kahraman gibi/u);
    expect(prose).not.toMatch(/kahramanlığı bitirir/u);
    expect(prose).not.toMatch(/hamal gibi/u);
    expect(prose).not.toMatch(/Fark sihir değil/u);
    expect(prose).not.toMatch(/iki kader üretir/u);
    expect(prose).not.toMatch(/Baraj yetmiştir/u);
    const liveLesson = curriculumForCourseSlug("01_office_ai").find((row) => row.key === KEY);
    expect(body).toMatch(/Peki neden uzun sözleşmeyi yapay zekâya satır satır okutmak yerine riskli maddeleri aratırız/u);
    expect(body).toMatch(/Öğretmen SEN, belge SIZ/u);
    expect(body).toMatch(/Peki resmî belge yazılırken neden öğretmen SEN, belge SIZ/u);
    expect(liveLesson?.title).toMatch(/Word ve Uzun Belge İncelemesi/u);
    expect(body).not.toMatch(/\bkomut/u);
    expect(body).not.toMatch(/doküman/iu);
    expect(body).not.toMatch(/spesifik/iu);
    expect(body).not.toMatch(/vaadi üç iştir/u);
    expect(body).not.toMatch(/kahraman/u);
  });

  it("16:9 Word tuvali ezilmez; ataş penceresi ve riskli madde kartları dolgundur", () => {
    const css = readFileSync(join(ROOT, "app/globals.css"), "utf8");
    expect(css).toMatch(
      /\.academy-player-karaoke \.academy-player-widescreen[\s\S]*?aspect-ratio:\s*16\s*\/\s*9/s,
    );
    expect(css).toMatch(/\.academy-player-waiter \.academy-outlook-win\s*\{[^}]*height:\s*100%/s);
    expect(css).toMatch(
      /\.academy-word-desk \.academy-outlook-canvas--compact[\s\S]*?background:\s*#122033/s,
    );
    expect(css).not.toMatch(
      /\.academy-word-desk \.academy-outlook-canvas[\s\S]{0,220}background:\s*#000(?:000)?/s,
    );
    expect(css).toMatch(/\.academy-outlook-group--acil\s*\{[^}]*#3f1a22/s);
    expect(css).toMatch(/\.academy-outlook-group--bekle\s*\{[^}]*#3d3010/s);
    expect(css).toMatch(/\.academy-outlook-group--arsiv\s*\{[^}]*#12382f/s);
    const word = readFileSync(join(ROOT, "components/academy/lesson-word-workspace.tsx"), "utf8");
    expect(word).toContain("LessonAiDesk");
    expect(word).toContain("LessonOfficeCopilotRibbon");
    expect(word).toContain('host="word"');
    expect(word).toContain("ACADEMY_WORD_COPY_FRAGMENTS.map");
    expect(word).toContain("ACADEMY_WORD_CLAUSE_CARDS.map");
    expect(word).toContain("ACADEMY_WORD_FILE_LABEL");
    expect(word).toContain("ACADEMY_WORD_SAMPLE_LOCK");
    expect(word).toContain("Tek Tek Kopyalama");
    expect(word).not.toContain("ZAHMETLİ YOL");
    expect(word).toContain("academyCitizenOfficeFileLabel");
    expect(word).toContain("Ataş · {fileLabel}");
    expect(word).toContain("Maddeler · Liste kapalı");
    expect(word).not.toContain("Spoiler yok");
    expect(word).not.toMatch(/Ataş · \{slide\.fileName/u);
    const player = readFileSync(join(ROOT, "components/academy/curriculum-player.tsx"), "utf8");
    expect(player).toContain('data-academy-prompt-host="below-transport"');
  });

  it("karaoke harf düşürmez; aktif kelime layout shift ve descender kesmez", () => {
    const timings = loadAcademySealedAudioTimings(KEY);
    expect(timings).not.toBeNull();
    expect(timings!.durationSec).toBe(583.36);
    expect(timings!.cacheV).toBe(583360);
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
    expect(stripText).toMatch(/Peki neden uzun sözleşmeyi yapay zekâya satır satır okutmak yerine riskli maddeleri aratırız/u);
    expect(stripText).toMatch(/öğretmen SEN, belge SIZ çift sicili/u);
    expect(stripText).toMatch(/satır satır okutunca yığın çıkar/u);
    expect(stripText).not.toMatch(/kahraman gibi/u);
    expect(stripText).not.toMatch(/Baraj yetmiştir/u);
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

  it("Word sinema kartları çerçeve içinde padding ile durur; sol kenar taşmaz", () => {
    const wordWs = readFileSync(join(ROOT, "components/academy/lesson-word-workspace.tsx"), "utf8");
    const css = readFileSync(join(ROOT, "app/globals.css"), "utf8");
    expect(wordWs).toContain("academy-outlook-canvas--compact");
    expect(wordWs).toContain("academy-outlook-body--word");
    expect(wordWs).toContain("academy-word-clause-stack");
    expect(wordWs).toContain("applyAcademyOfficeWinFit");
    expect(wordWs).toContain("data-academy-office-win-fit");
    expect(wordWs).toContain("48% 42%");
    expect(css).toContain(".academy-word-desk .academy-outlook-body--copilot");
    expect(css).toContain("grid-template-columns: minmax(0, 1fr)");
    expect(css).toContain(".academy-word-clause-stack");
    expect(css).toContain("padding: 0.75rem 1.5rem");
    expect(css).toContain("padding: 0.28rem 0.5rem");
    expect(css).not.toMatch(/\.academy-word-desk[^{]*\{[^}]*text-overflow:\s*ellipsis/u);
  });
});
