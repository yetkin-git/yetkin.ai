/**
 * Stüdyo konuşma metni — compact makaleden ayrı seslendirme SSOT.
 * Ekran cue JSON (F2, F5, Alt+F11, +90, Office 365, Word, PowerPoint, Copilot, Gamma, Teams,
 * SEO, Trendyol, Buybox, Amazon, Bundle, H1, Meta, ChatGPT, Sentiment Analysis, Closed-Loop,
 * Midjourney, Flux, Runway, Kling, CapCut, ElevenLabs, HeyGen, DALL-E, Canva,
 * TikTok, Instagram, Reels, CTR, Voiceflow, Botpress, OpenAI, Make.com,
 * Webhook, Guardrails, Fallback, RAG, LLM, CaaS, SLA,
 * chatgpt.com, claude.ai, perplexity.ai, Few-Shot, Chain-of-Thought, SWOT, Pre-Mortem, Vision);
 * skip-preventer bağlaçlı akışa çevirir; TTS fonetik haritayı okur.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanAcademySpokenTextForTts, collapseAcademyLessonProse } from "@/lib/academy/lesson-body";
import { loadAcademyLessonCues } from "@/lib/academy/lesson-cues";
import { applyAcademyCueDisplayPhonetics } from "@/lib/academy/spoken-scripts/phonetics";
import { expandAcademyTtsSkipPreventer } from "@/lib/academy/spoken-scripts/skip-preventer";

export {
  applyAcademyCueDisplayPhonetics,
  applyAcademySpokenPhoneticsToDisplay,
} from "@/lib/academy/spoken-scripts/phonetics";
export { expandAcademyTtsSkipPreventer } from "@/lib/academy/spoken-scripts/skip-preventer";

function spokenParagraphFromDisplayOrScript(part: string): string {
  return cleanAcademySpokenTextForTts(
    collapseAcademyLessonProse(applyAcademyCueDisplayPhonetics(expandAcademyTtsSkipPreventer(part))),
  );
}

export const ACADEMY_SPOKEN_SCRIPT_LESSON_KEYS = [
  "01_office_ai-1",
  "01_office_ai-2",
  "01_office_ai-3",
  "01_office_ai-4",
  "01_office_ai-5",
  "01_office_ai-6",
  "02_ecommerce_ai-1",
  "02_ecommerce_ai-2",
  "02_ecommerce_ai-3",
  "02_ecommerce_ai-4",
  "02_ecommerce_ai-5",
  "02_ecommerce_ai-6",
  "03_social_media_ai-1",
  "03_social_media_ai-2",
  "03_social_media_ai-3",
  "03_social_media_ai-4",
  "03_social_media_ai-5",
  "03_social_media_ai-6",
  "04_chatbot_nocode-1",
  "04_chatbot_nocode-2",
  "04_chatbot_nocode-3",
  "04_chatbot_nocode-4",
  "04_chatbot_nocode-5",
  "04_chatbot_nocode-6",
  "05_prompt_practice-1",
  "05_prompt_practice-2",
  "05_prompt_practice-3",
  "05_prompt_practice-4",
  "05_prompt_practice-5",
  "05_prompt_practice-6",
] as const;

export type AcademySpokenScriptLessonKey = (typeof ACADEMY_SPOKEN_SCRIPT_LESSON_KEYS)[number];

export function isAcademySpokenScriptLessonKey(lessonKey: string): lessonKey is AcademySpokenScriptLessonKey {
  return (ACADEMY_SPOKEN_SCRIPT_LESSON_KEYS as readonly string[]).includes(lessonKey.trim());
}

export function academySpokenScriptRelativePath(lessonKey: string): string {
  return `lib/academy/spoken-scripts/${lessonKey.trim()}.md`;
}

export function academySpokenScriptDiskPath(lessonKey: string, root = process.cwd()): string {
  return join(root, academySpokenScriptRelativePath(lessonKey));
}

function stripSpokenScriptMarkup(raw: string): string {
  return raw
    .replace(/<!--[\s\S]*?-->/gu, " ")
    .replace(/^#{1,6}\s+/gmu, "")
    .replace(/\*\*([^*]+)\*\*/gu, "$1")
    .replace(/\*([^*]+)\*/gu, "$1")
    .replace(/`([^`]+)`/gu, "$1")
    .replace(/\s+/gu, " ")
    .trim();
}

function stripSpokenScriptMarkupPreserveParagraphs(raw: string): string {
  return raw
    .replace(/<!--[\s\S]*?-->/gu, "\n\n")
    .replace(/^#{1,6}\s+/gmu, "")
    .replace(/\*\*([^*]+)\*\*/gu, "$1")
    .replace(/\*([^*]+)\*/gu, "$1")
    .replace(/`([^`]+)`/gu, "$1")
    .replace(/[^\S\n]+/gu, " ")
    .replace(/ *\n */gu, "\n")
    .replace(/\n{3,}/gu, "\n\n")
    .trim();
}

export function loadAcademySpokenScriptMarkdownParagraphs(
  lessonKey: string,
  root = process.cwd(),
): readonly string[] {
  const path = academySpokenScriptDiskPath(lessonKey, root);
  if (!existsSync(path)) {
    return [];
  }
  return stripSpokenScriptMarkupPreserveParagraphs(readFileSync(path, "utf8"))
    .split(/\n\n+/u)
    .map((part) => spokenParagraphFromDisplayOrScript(part))
    .filter((part) => part.length > 0);
}

/** Cue paragrafları — ekran metni fonetik haritadan geçerek TTS ile hizalanır. */
export function loadAcademyCueParagraphsAsSpoken(lessonKey: string): readonly string[] {
  return loadAcademyLessonCues(lessonKey)
    .flatMap((cue) => cue.paragraphs ?? [])
    .map((part) => spokenParagraphFromDisplayOrScript(part))
    .filter((part) => part.length > 0);
}

export function loadAcademySpokenScriptParagraphs(
  lessonKey: string,
  root = process.cwd(),
): readonly string[] {
  const fromMd = loadAcademySpokenScriptMarkdownParagraphs(lessonKey, root);
  if (fromMd.length > 0) {
    return fromMd;
  }
  return loadAcademyCueParagraphsAsSpoken(lessonKey);
}

export function loadAcademySpokenScriptProse(
  lessonKey: string,
  root = process.cwd(),
): string {
  const paragraphs = loadAcademySpokenScriptParagraphs(lessonKey, root);
  if (paragraphs.length > 0) {
    return collapseAcademyLessonProse(paragraphs.join(" "));
  }
  const path = academySpokenScriptDiskPath(lessonKey, root);
  if (!existsSync(path)) {
    return "";
  }
  return cleanAcademySpokenTextForTts(stripSpokenScriptMarkup(readFileSync(path, "utf8")));
}

export function academySpokenScriptWordCount(prose: string): number {
  const trimmed = prose.replace(/\s+/gu, " ").trim();
  if (!trimmed) {
    return 0;
  }
  return trimmed.split(" ").filter((part) => part.length > 0).length;
}
