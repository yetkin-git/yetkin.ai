import "server-only";

import { z } from "zod";
import { getDefaultModelId } from "@/lib/kernel/ai/model-roles";
import type { LlmInlineMedia } from "@/lib/kernel/ai/types";
import { juniorPersonaLine } from "@/lib/junior/persona";

/** Yeni rol açılmaz. Kimlik canlı sohbet rolünden okunur. */
export const JUNIOR_TELL_ROLE = "FAST_STREAM" as const;

export function juniorTellModelId(): string {
  return getDefaultModelId(JUNIOR_TELL_ROLE);
}

const tellJsonSchema = z.object({
  onTopic: z.boolean(),
  praised: z.string(),
  missing: z.string(),
  advice: z.string(),
  score: z.number(),
});

export type JuniorTellReading = {
  onTopic: boolean;
  praised: string;
  missing: string;
  advice: string;
  score: number;
};

export function juniorTellSystemPrompt(input: {
  title: string;
  outcomes: readonly string[];
  birthYear: number;
  now?: Date;
  /** «Hazırım, Sana Anlatayım!» yönlendirme kontrol soruları. */
  tellGuides?: readonly string[];
}): string {
  const outcomes = input.outcomes.map((line) => `- ${line}`).join("\n");
  const guides =
    input.tellGuides && input.tellGuides.length > 0
      ? ["Kontrol soruları (öğrenci bunlara değinmiş olmalı):", ...input.tellGuides.map((line) => `- ${line}`)]
      : [];
  return [
    juniorPersonaLine(input.birthYear, input.now),
    "Öğrenci dersi kendi sözüyle anlattı. Sohbet etme. Sertifika verme. Puanı para sayma.",
    "Yalnız bu dersin kazanımlarına bak.",
    "Kontrol soruları varsa anlatışın bunlara değinip değinmediğine bak.",
    "Konu dışındaysa onTopic false olsun ve score 0 olsun.",
    "Emin değilsen score 0 olsun ve advice cümlesi Emin değilim ile başlasın.",
    "Yanıt yalnız JSON olsun.",
    '{"onTopic":true,"praised":"...","missing":"...","advice":"...","score":0}',
    "praised: doğru söylediği, en fazla iki kısa cümle.",
    "missing: eksik kalan nokta. Eksik yoksa Eksik kalan nokta yok yaz.",
    "advice: bir sonraki küçük adım.",
    "score: 0 ile 100 arasında tam sayı.",
    `Ders: ${input.title}`,
    "Kazanımlar:",
    outcomes,
    ...guides,
  ].join("\n");
}

export function juniorTellUserText(input: { mode: "speak" | "write"; text?: string }): string {
  if (input.mode === "write") {
    return `Çocuk yazarak anlattı:\n${input.text?.trim() ?? ""}`;
  }
  return "Çocuk sesle anlattı. Ses ekte. Yalnız bu dersin kazanımlarına bak.";
}

export function juniorInlineAudio(input: {
  mimeType: string;
  dataBase64: string;
}): LlmInlineMedia {
  return { mimeType: input.mimeType, dataBase64: input.dataBase64 };
}

/** Dizgi bellekte hemen boşalır. Eski dizgi çöp toplayıcıya kalır; diske yazılmaz. */
export function wipeAudioCarrier(carrier: { dataBase64?: string; audioBase64?: string } | null | undefined): void {
  if (!carrier) {
    return;
  }
  if (typeof carrier.dataBase64 === "string") {
    carrier.dataBase64 = "";
  }
  if (typeof carrier.audioBase64 === "string") {
    carrier.audioBase64 = "";
  }
}

export function parseJuniorTellJson(raw: string): JuniorTellReading | null {
  const trimmed = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end <= start) {
    return null;
  }
  let value: unknown;
  try {
    value = JSON.parse(trimmed.slice(start, end + 1));
  } catch {
    return null;
  }
  const parsed = tellJsonSchema.safeParse(value);
  if (!parsed.success) {
    return null;
  }
  const score = Math.round(parsed.data.score);
  if (!Number.isFinite(score)) {
    return null;
  }
  const onTopic = parsed.data.onTopic;
  return {
    onTopic,
    praised: clip(parsed.data.praised, onTopic ? "Harika anlattın." : "Bu söz dersin dışında kaldı."),
    missing: clip(parsed.data.missing, "Eksik kalan nokta yok."),
    advice: clip(parsed.data.advice, "Emin değilim. Dersi bir kez daha kendi cümlenle anlat."),
    score: onTopic ? clampScore(score) : 0,
  };
}

export function unsureJuniorTell(): JuniorTellReading {
  return {
    onTopic: false,
    praised: "Emin değilim.",
    missing: "Anlatış bu dersin kazanımına oturmadı.",
    advice: "Emin değilim. Dersi bir kez daha, kısa cümleyle anlat.",
    score: 0,
  };
}

function clip(value: string, fallback: string): string {
  const text = value.trim().replace(/\s+/g, " ");
  if (!text) {
    return fallback;
  }
  return text.slice(0, 280);
}

function clampScore(score: number): number {
  if (score < 0) {
    return 0;
  }
  if (score > 100) {
    return 100;
  }
  return score;
}
