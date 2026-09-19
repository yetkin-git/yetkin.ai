import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ACADEMY_OFFICE_AI_1_HOWTO_STEPS,
  ACADEMY_OFFICE_AI_2_HOWTO_STEPS,
  ACADEMY_OFFICE_AI_3_HOWTO_STEPS,
  ACADEMY_OFFICE_AI_4_HOWTO_STEPS,
  ACADEMY_OFFICE_AI_5_HOWTO_STEPS,
  ACADEMY_OFFICE_AI_6_HOWTO_STEPS,
  ACADEMY_OFFICE_AI_G1_HOWTO_STEPS,
  ACADEMY_OFFICE_AI_W1_HOWTO_STEPS,
  academyHowtoActiveIndex,
  academyHowtoActiveIndexAtTime,
  academyHowtoBandVisible,
  academyHowtoSteps,
} from "@/lib/academy/lesson-beat-visual";
import {
  ACADEMY_PROMPT_CHARS_PER_SEC,
  academyCinemaCueId,
  academyOfficeChromeFromFileName,
  academyPromptCueStart,
  academyPromptTypedText,
} from "@/lib/academy/prompt-console";
import { loadAcademyCinemaCueSlides } from "@/lib/academy/cinema-cue-catalog";
import { ACADEMY_ERROR_HUNT_COPILOT_PROMPT } from "@/lib/academy/error-hunt-workspace";
import { ACADEMY_WEEKLY_ROUTINE_COPILOT_PROMPT } from "@/lib/academy/weekly-routine-workspace";
import { ACADEMY_GMAIL_GEMINI_PROMPT } from "@/lib/academy/gmail-workspace";
import { loadAcademyLessonPlaybackCues } from "@/lib/academy/lesson-cues";
import { ACADEMY_OUTLOOK_COPILOT_PROMPT } from "@/lib/academy/outlook-workspace";
import { ACADEMY_WORD_UPLOAD_PROMPT } from "@/lib/academy/word-workspace";
import { ACADEMY_KVKK_COPILOT_PROMPT } from "@/lib/academy/kvkk-workspace";
import { curriculumLessonKeysForSlug } from "@/lib/academy/curricula/lesson-index";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("Nasıl Yapılır? — Prompt Terminali ve adım bandı", () => {
  it("seste komut verilirken istem harf harf açılır; reduced-motion tam metni basar", () => {
    const prompt = ACADEMY_OUTLOOK_COPILOT_PROMPT;
    expect(academyCinemaCueId(4)).toBe("cue-04");
    expect(academyPromptCueStart("01_office_ai-4", 4)).toBe(168.36);
    expect(ACADEMY_PROMPT_CHARS_PER_SEC).toBe(22);
    expect(loadAcademyCinemaCueSlides("01_office_ai-4")[3]?.copilot?.prompt).toBe(prompt);
    const waiting = academyPromptTypedText({ prompt, currentTime: 200, cueStart: 201.2 });
    expect(waiting.visible).toBe("");
    expect(waiting.started).toBe(false);
    const mid = academyPromptTypedText({ prompt, currentTime: 201.2 + 0.5, cueStart: 201.2 });
    expect(mid.visible).toBe(prompt.slice(0, 11));
    expect(mid.done).toBe(false);
    const full = academyPromptTypedText({
      prompt,
      currentTime: 201.2,
      cueStart: 201.2,
      reducedMotion: true,
    });
    expect(full.visible).toBe(prompt);
    expect(full.done).toBe(true);
    expect(academyOfficeChromeFromFileName("Yonetici_Ozeti.docx")).toBe("word");
    expect(academyOfficeChromeFromFileName("Tahsilat_Mart_2026.xlsx")).toBe("excel");
  });

  it("Outlook 1-2-3 bandı seç → önceliklendir → taslak yanıt üretir", () => {
    expect(academyHowtoSteps("01_office_ai-4")).toEqual([...ACADEMY_OFFICE_AI_4_HOWTO_STEPS]);
    expect(ACADEMY_OFFICE_AI_4_HOWTO_STEPS.map((step) => `Adım ${step.n}: ${step.label}`)).toEqual([
      "Adım 1: E-Postaları Seç",
      "Adım 2: Copilot Paneli",
      "Adım 3: Taslak Yanıt Üret",
    ]);
    expect(academyHowtoBandVisible("GİRİŞ KÖPRÜSÜ")).toBe(false);
    expect(academyHowtoBandVisible("CEBİNE KOY")).toBe(false);
    expect(academyHowtoActiveIndex("01_office_ai-4", "INBOX KAOSU")).toBe(0);
    expect(academyHowtoActiveIndex("01_office_ai-4", "TASLAK YAZ")).toBe(1);
    expect(academyHowtoActiveIndex("01_office_ai-4", "FARK ORTADA")).toBe(2);
    expect(academyHowtoActiveIndex("01_office_ai-4", "CEBİNE KOY")).toBe(-1);
    expect(academyHowtoSteps("01_office_ai-1")).toEqual([...ACADEMY_OFFICE_AI_1_HOWTO_STEPS]);
    expect(ACADEMY_OFFICE_AI_1_HOWTO_STEPS.map((step) => `Adım ${step.n}: ${step.label}`)).toEqual([
      "Adım 1: Copilot Şeridi",
      "Adım 2: Ataş — Maske 2. Ders",
      "Adım 3: A1'e Sütun Adı Koy",
    ]);
    expect(academyHowtoSteps("01_office_ai-2")).toEqual([...ACADEMY_OFFICE_AI_2_HOWTO_STEPS]);
    expect(academyHowtoSteps("01_office_ai-3")).toEqual([...ACADEMY_OFFICE_AI_3_HOWTO_STEPS]);
  });

  it("Excel hata avı 1-2-3 bandı yükle → çapraz sorgu → sapan hücreyi onaylar", () => {
    const prompt = ACADEMY_ERROR_HUNT_COPILOT_PROMPT;
    expect(prompt).toBe(
      "Tablodaki satır toplamları ile genel toplam arasında çelişki olup olmadığını incele. Uyumsuz her satırı kırmızı ile işaretle ve nedenini yaz.",
    );
    expect(loadAcademyCinemaCueSlides("01_office_ai-5")[3]?.copilot?.prompt).toBe(prompt);
    expect(loadAcademyCinemaCueSlides("01_office_ai-5")[3]?.copilot?.hideReply).toBe(true);
    expect(loadAcademyCinemaCueSlides("01_office_ai-5")[4]?.visualMode).toBe("split");
    expect(loadAcademyCinemaCueSlides("01_office_ai-5")[4]?.copilot?.prompt).toBe(prompt);
    expect(loadAcademyCinemaCueSlides("01_office_ai-5")[5]?.copilot?.prompt).toBe(prompt);
    expect(academyHowtoSteps("01_office_ai-5")).toEqual([...ACADEMY_OFFICE_AI_5_HOWTO_STEPS]);
    expect(ACADEMY_OFFICE_AI_5_HOWTO_STEPS.map((step) => `Adım ${step.n}: ${step.label}`)).toEqual([
      "Adım 1: Veriyi Yükle",
      "Adım 2: Çapraz Sorgu İstemini Yaz",
      "Adım 3: Sapan Hücreyi Onayla",
    ]);
    expect(academyHowtoActiveIndex("01_office_ai-5", "AŞIRI GÜVEN")).toBe(0);
    expect(academyHowtoActiveIndex("01_office_ai-5", "HATA AVI")).toBe(1);
    expect(academyHowtoActiveIndex("01_office_ai-5", "FARK ORTADA")).toBe(2);
    expect(academyHowtoActiveIndex("01_office_ai-5", "CEBİNE KOY")).toBe(-1);
    const huntCues = loadAcademyLessonPlaybackCues("01_office_ai-5");
    const huntCue = huntCues.find((cue) => cue.id === "cue-04");
    const detectiveCue = huntCues.find((cue) => cue.id === "cue-05");
    expect(huntCue).toBeTruthy();
    expect(detectiveCue).toBeTruthy();
    expect(academyHowtoActiveIndexAtTime("01_office_ai-5", huntCue!.start + 0.2, huntCues)).toBe(1);
    expect(academyHowtoActiveIndexAtTime("01_office_ai-5", detectiveCue!.start + 0.2, huntCues)).toBe(2);
  });

  it("Haftalık Sistem 1-2-3 bandı takvime yaz → üç bloğu kur → e-postayı kapat", () => {
    const prompt = ACADEMY_WEEKLY_ROUTINE_COPILOT_PROMPT;
    expect(loadAcademyCinemaCueSlides("01_office_ai-6")[3]?.copilot?.prompt).toBe(prompt);
    expect(loadAcademyCinemaCueSlides("01_office_ai-6")[3]?.copilot?.hideReply).toBe(true);
    expect(loadAcademyCinemaCueSlides("01_office_ai-6")[4]?.visualMode).toBe("split");
    expect(academyHowtoSteps("01_office_ai-6")).toEqual([...ACADEMY_OFFICE_AI_6_HOWTO_STEPS]);
    expect(ACADEMY_OFFICE_AI_6_HOWTO_STEPS.map((step) => `Adım ${step.n}: ${step.label}`)).toEqual([
      "Adım 1: Takvime Yaz",
      "Adım 2: Üç Bloğu Kur",
      "Adım 3: E-postayı Kapat",
    ]);
    expect(academyHowtoActiveIndex("01_office_ai-6", "DAĞINIK HAFTA")).toBe(0);
    expect(academyHowtoActiveIndex("01_office_ai-6", "OTUZ DAKİKA")).toBe(1);
    expect(academyHowtoActiveIndex("01_office_ai-6", "FARK ORTADA")).toBe(2);
    expect(academyHowtoActiveIndex("01_office_ai-6", "CEBİNE KOY")).toBe(-1);
  });

  it("Gmail Gemini ve Word ataş dersleri prompt terminali ve 1-2-3 bandını taşır", () => {
    expect(loadAcademyCinemaCueSlides("01_office_ai-g1")[3]?.copilot?.prompt).toBe(ACADEMY_GMAIL_GEMINI_PROMPT);
    expect(loadAcademyCinemaCueSlides("01_office_ai-g1")[4]?.copilot?.prompt).toBe(ACADEMY_GMAIL_GEMINI_PROMPT);
    expect(loadAcademyCinemaCueSlides("01_office_ai-g1")[5]?.copilot?.prompt).toBe(ACADEMY_GMAIL_GEMINI_PROMPT);
    expect(loadAcademyCinemaCueSlides("01_office_ai-g1")[3]?.copilot?.hideReply).toBe(true);
    expect(academyHowtoSteps("01_office_ai-g1")).toEqual([...ACADEMY_OFFICE_AI_G1_HOWTO_STEPS]);
    expect(ACADEMY_OFFICE_AI_G1_HOWTO_STEPS.map((step) => `Adım ${step.n}: ${step.label}`)).toEqual([
      "Adım 1: Paneli Aç",
      "Adım 2: Aksiyon İste",
      "Adım 3: Onayla, Gönderme",
    ]);
    expect(academyHowtoActiveIndex("01_office_ai-g1", "TAŞIMA SU")).toBe(0);
    expect(academyHowtoActiveIndex("01_office_ai-g1", "GEMİNİ AÇ")).toBe(1);
    expect(academyHowtoActiveIndex("01_office_ai-g1", "FARK ORTADA")).toBe(2);
    expect(loadAcademyCinemaCueSlides("01_office_ai-w1")[3]?.copilot?.prompt).toBe(ACADEMY_WORD_UPLOAD_PROMPT);
    expect(loadAcademyCinemaCueSlides("01_office_ai-w1")[4]?.copilot?.prompt).toBe(ACADEMY_WORD_UPLOAD_PROMPT);
    expect(loadAcademyCinemaCueSlides("01_office_ai-w1")[5]?.copilot?.prompt).toBe(ACADEMY_WORD_UPLOAD_PROMPT);
    expect(academyHowtoSteps("01_office_ai-w1")).toEqual([...ACADEMY_OFFICE_AI_W1_HOWTO_STEPS]);
    expect(academyHowtoActiveIndex("01_office_ai-w1", "PARÇA PARÇA")).toBe(0);
    expect(academyHowtoActiveIndex("01_office_ai-w1", "ATAŞ YÜKLE")).toBe(1);
    expect(academyHowtoActiveIndex("01_office_ai-w1", "YERİNDE ANALİZ")).toBe(2);
  });

  it("Excel Word PowerPoint Outlook yüzeyleri Prompt Terminali ve adım bandını taşır", () => {
    const excel = readSrc("components/academy/lesson-excel-workspace.tsx");
    const pptx = readSrc("components/academy/lesson-pptx-workspace.tsx");
    const outlook = readSrc("components/academy/lesson-outlook-workspace.tsx");
    const gmail = readSrc("components/academy/lesson-gmail-workspace.tsx");
    const wordWs = readSrc("components/academy/lesson-word-workspace.tsx");
    const desk = readSrc("components/academy/lesson-ai-desk.tsx");
    const eye = readSrc("components/academy/lesson-visual-stage.tsx");
    const css = readSrc("app/globals.css");
    expect(excel).toContain("LessonAiDesk");
    expect(excel).toContain('data-academy-office-app={officeChrome}');
    expect(excel).toContain("Word");
    expect(pptx).toContain("LessonAiDesk");
    expect(outlook).toContain("LessonAiDesk");
    expect(gmail).toContain("LessonAiDesk");
    expect(gmail).toContain('host="gmail"');
    expect(gmail).toContain("academyGmailStageKind");
    expect(wordWs).toContain("LessonAiDesk");
    expect(wordWs).toContain('host="word"');
    expect(wordWs).toContain("academyWordStageKind");
    expect(desk).toContain("LessonPromptConsole");
    expect(desk).toContain("academyAiDeskTabsForHost");
    expect(desk).toContain("data-academy-ctrl-c");
    expect(outlook).toContain('data-academy-fix={compact ? "162719" : undefined}');
    expect(outlook).toContain("academy-outlook-canvas--compact");
    expect(eye).toContain("LessonHowtoSteps");
    expect(eye).toContain("academyHowtoActiveIndex");
    expect(eye).toContain("academyPlaybackCueAtTime");
    expect(eye).not.toContain("LessonPromptConsole");
    expect(eye).toContain("data-academy-compare-prompt");
    expect(eye).toContain("data-academy-eye-canvas");
    expect(eye).toContain("data-academy-prompt-dock");
    expect(eye).toContain("data-academy-paste-guide");
    expect(eye).toContain("LessonGmailWorkspace");
    expect(eye).toContain("LessonWordWorkspace");
    const player = readSrc("components/academy/curriculum-player.tsx");
    expect(player).toContain("LessonPromptConsole");
    expect(player).toContain('data-academy-prompt-host="below-transport"');
    expect(css).toContain(".academy-prompt-console");
    expect(css).toContain(".custom-scrollbar");
    expect(css).toContain("overflow-y: auto");
    expect(css).toContain("position: sticky");
    expect(css).toContain("max-height: min(46vh, 18.5rem)");
    expect(css).not.toMatch(/\.academy-player-compare-prompt\s*\{[^}]*max-height:\s*7\.2rem/u);
    expect(css).toContain(".academy-howto-band");
    expect(css).toContain(".academy-ai-desk");
    expect(css).toContain(".academy-paste-guide");
    expect(css).toContain(".academy-player-compare-prompt");
    expect(css).toContain(".academy-office-copilot-btn");
    expect(css).toContain(".academy-chatgpt-window");
    expect(css).toContain(".academy-ai-desk-honesty");
    expect(css).toContain("overflow-wrap: break-word");
    expect(css).not.toMatch(/\.academy-outlook-[^{]*\{[^}]*overflow-wrap:\s*anywhere/u);
    expect(css).toContain(".academy-outlook-canvas--compact");
    expect(css).toContain(".academy-player-compare[data-academy-waiter-stage=\"outlook\"]");
    expect(css).toContain(".academy-player-compare[data-academy-waiter-stage=\"gmail\"]");
    expect(css).toContain(".academy-player-compare[data-academy-waiter-stage=\"word\"]");
    expect(css).toContain("min-width: 16rem");
    const consoleSrc = readSrc("components/academy/lesson-prompt-console.tsx");
    expect(consoleSrc).toContain("custom-scrollbar");
    expect(consoleSrc).toContain("Tamamını gör");
    expect(consoleSrc).toContain("data-academy-prompt-viewport");
    expect(consoleSrc).toContain("academy-prompt-console-copy");
    expect(consoleSrc).toContain("Hazır istem");
  });

  it("dokuz ofis dersinin istemi Prompt Terminalinde kırpılmaz; 6. ders Cuma metni tam okunur", () => {
    const keys = curriculumLessonKeysForSlug("01_office_ai");
    expect(keys).toHaveLength(9);
    const prompts = keys.map((key) => {
      const slides = loadAcademyCinemaCueSlides(key);
      const withPrompt = slides.find((slide) => (slide.copilot?.prompt ?? "").trim().length > 0);
      return { key, prompt: withPrompt?.copilot?.prompt ?? "" };
    });
    for (const row of prompts) {
      expect(row.prompt.length, row.key).toBeGreaterThan(24);
    }
    expect(prompts.find((row) => row.key === "01_office_ai-6")?.prompt).toBe(
      ACADEMY_WEEKLY_ROUTINE_COPILOT_PROMPT,
    );
    expect(ACADEMY_WEEKLY_ROUTINE_COPILOT_PROMPT).toContain("Cuma otuz dakikalık ofis rutinini üç bloğa böl");
    expect(prompts.find((row) => row.key === "01_office_ai-g1")?.prompt).toBe(ACADEMY_GMAIL_GEMINI_PROMPT);
    expect(prompts.find((row) => row.key === "01_office_ai-w1")?.prompt).toBe(ACADEMY_WORD_UPLOAD_PROMPT);
    expect(prompts.find((row) => row.key === "01_office_ai-k1")?.prompt).toBe(ACADEMY_KVKK_COPILOT_PROMPT);
    expect(prompts.find((row) => row.key === "01_office_ai-5")?.prompt).toBe(ACADEMY_ERROR_HUNT_COPILOT_PROMPT);
    expect(Math.max(...prompts.map((row) => row.prompt.length))).toBeGreaterThan(240);
    expect(ACADEMY_WEEKLY_ROUTINE_COPILOT_PROMPT.length).toBeGreaterThan(240);
  });
});
