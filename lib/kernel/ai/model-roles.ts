/**
 * Kanonik AI roller — yetenek sınıfı, ürün adı değil. Tavan: 8 (anayasa).
 * 7 canlı + 1 mühürlü-ölü (VIDEO_GEN). VOICE_TTS akademi ders dinletme factory'sidir
 * (`generateSpeech`); invokeLlm complete yolu değildir.
 * Eski gemini alias patlaması (tarimAgronomist, juniorPracticeAudio…) doğmaz.
 */

import { ForbiddenError } from "@/lib/kernel/http/errors";

export const AI_LIVE_MODEL_ROLE_KEYS = [
  "EXECUTIVE_BRAIN",
  "DEEP_RESEARCH",
  "FAST_STREAM",
  "LITE_STREAM",
  "IMAGE_GEN",
  "VOICE_TTS",
  "OPEN_LOCAL",
] as const;

export const AI_SEALED_DEAD_ROLE_KEYS = ["VIDEO_GEN"] as const;

export const AI_MODEL_ROLE_KEYS = [
  "EXECUTIVE_BRAIN",
  "DEEP_RESEARCH",
  "FAST_STREAM",
  "LITE_STREAM",
  "IMAGE_GEN",
  "VIDEO_GEN",
  "VOICE_TTS",
  "OPEN_LOCAL",
] as const;

export type AiLiveModelRoleKey = (typeof AI_LIVE_MODEL_ROLE_KEYS)[number];
export type AiSealedDeadRoleKey = (typeof AI_SEALED_DEAD_ROLE_KEYS)[number];
export type AiModelRoleKey = (typeof AI_MODEL_ROLE_KEYS)[number];

export const AI_SEALED_DEAD_FACTORY_ERROR =
  "Video ve ses üretimi kesilmiştir. Bu yuva mühürlüdür; fabrika yoktur.";

export class AiGatewayForbiddenError extends ForbiddenError {
  constructor(message = AI_SEALED_DEAD_FACTORY_ERROR) {
    super(message);
    this.name = "AiGatewayForbiddenError";
  }
}

/**
 * Fırın ve gümrük medya kimliği. İkinci sicil yoktur.
 * Yetkili kılavuz `.system_docs/AKADEMI_URETIM_ANAYASASI.md` (eğitim hazırlama prosedürü).
 * Bu sabitler 1.1 Kilitli Model Haritasının kod karşılığıdır.
 * Bilgi kesim tarihi bu kimlikleri silmez ve `gemini-2.5` dahil eski sürüme düşürmez.
 * Harita değişince kod haritaya çekilir. Ters yön ve fallback yoktur.
 * Canlı sohbet `FAST_STREAM` okur. Senaryo `TEXT_GEN` okur.
 * Canlı `VIDEO_GEN` mühürlü-ölüdür. Isınma klibi yerel `-warmup.mp4` dosyasıdır.
 */
export const ACADEMY_SEALED_MEDIA_MODEL = {
  TEXT_GEN: "gemini-3.8-flash", // Metin Üretimi
  VOICE_TTS: "gemini-3.8-flash-tts", // Ses Mührü
  IMAGE_GEN: "gemini-3.1-flash-image", // Görsel (Nano Banana 2)
  MUSIC_GEN: "lyria-3.5", // Fon Müziği
} as const;

export type AcademySealedMediaModelKey = keyof typeof ACADEMY_SEALED_MEDIA_MODEL;

export const AI_MODEL_ROLE_DEFAULTS: Record<AiLiveModelRoleKey, string> = {
  EXECUTIVE_BRAIN: "gemini-3.1-pro-preview",
  DEEP_RESEARCH: "gemini-3.1-pro-preview",
  FAST_STREAM: "gemini-3.8-live",
  LITE_STREAM: "gemini-3.5-flash-lite",
  IMAGE_GEN: ACADEMY_SEALED_MEDIA_MODEL.IMAGE_GEN,
  VOICE_TTS: ACADEMY_SEALED_MEDIA_MODEL.VOICE_TTS,
  OPEN_LOCAL: "gemma-3-27b-it",
};

/** Fırın ve gümrük sesi aynı kimliği okur. */
export function academyBakeVoiceModelId(): typeof ACADEMY_SEALED_MEDIA_MODEL.VOICE_TTS {
  return ACADEMY_SEALED_MEDIA_MODEL.VOICE_TTS;
}

/**
 * Tanımlı model çağrılamazsa işlem durur. Alt model seçilmez.
 */
export function assertAcademySealedMediaModel(
  layer: AcademySealedMediaModelKey,
  modelId: string,
): void {
  const expected = ACADEMY_SEALED_MEDIA_MODEL[layer];
  const actual = normalizeGoogleModelId(modelId);
  if (actual !== expected) {
    throw new Error(
      `Medya mühürü fail-closed. ${layer} yalnız ${expected} okur. Gelen kimlik ${actual || "boş"}. Alt model ve simülasyon yok.`,
    );
  }
}

export const AI_MODEL_ROLE_META: Record<
  AiModelRoleKey,
  { displayName: string; description: string }
> = {
  EXECUTIVE_BRAIN: {
    displayName: "Yönetici Beyin",
    description: "Stratejik karar ve derin analiz",
  },
  DEEP_RESEARCH: {
    displayName: "Derin Araştırma",
    description: "Çok adımlı araştırma ve veri sentezi",
  },
  FAST_STREAM: {
    displayName: "Hızlı Akış",
    description: "Günlük üretim ve otonom arayüz",
  },
  LITE_STREAM: {
    displayName: "Hafif Akış",
    description: "Ultra hızlı iskelet ve kısa tepki",
  },
  IMAGE_GEN: {
    displayName: "Görsel Üretim",
    description: "Görsel üretim (gümrük factory)",
  },
  VIDEO_GEN: {
    displayName: "Video Üretim (mühürlü)",
    description: "Kesilmiş ölü yuva. Factory yok; çağrı fail-closed.",
  },
  VOICE_TTS: {
    displayName: "Ses",
    description: "Metinden ses (generateSpeech gümrük factory)",
  },
  OPEN_LOCAL: {
    displayName: "Yerel Güç",
    description: "Açık kaynak / egemen yuva",
  },
};

const AI_MODEL_ROLE_KEY_SET = new Set<string>(AI_MODEL_ROLE_KEYS);
const AI_LIVE_MODEL_ROLE_KEY_SET = new Set<string>(AI_LIVE_MODEL_ROLE_KEYS);
const AI_SEALED_DEAD_ROLE_KEY_SET = new Set<string>(AI_SEALED_DEAD_ROLE_KEYS);

export function isAiModelRoleKey(value: string): value is AiModelRoleKey {
  return AI_MODEL_ROLE_KEY_SET.has(value);
}

export function isLiveAiModelRoleKey(value: string): value is AiLiveModelRoleKey {
  return AI_LIVE_MODEL_ROLE_KEY_SET.has(value);
}

export function isSealedDeadAiModelRole(value: string): value is AiSealedDeadRoleKey {
  return AI_SEALED_DEAD_ROLE_KEY_SET.has(value);
}

export function canonicalizeAiModelRole(roleKey: string): AiModelRoleKey | null {
  const trimmed = roleKey.trim();
  return isAiModelRoleKey(trimmed) ? trimmed : null;
}

export function assertLiveAiModelRole(
  roleKey: string,
): asserts roleKey is AiLiveModelRoleKey {
  if (isSealedDeadAiModelRole(roleKey)) {
    throw new AiGatewayForbiddenError();
  }
}

export function getDefaultModelId(roleKey: AiModelRoleKey): string {
  assertLiveAiModelRole(roleKey);
  return AI_MODEL_ROLE_DEFAULTS[roleKey];
}

export function normalizeGoogleModelId(raw: string): string {
  return raw.trim().replace(/^models\//, "");
}

export function isGeminiModelUnavailableError(error: unknown): boolean {
  if (error == null) {
    return false;
  }
  const status =
    typeof error === "object" && "status" in error
      ? Number((error as { status?: unknown }).status)
      : Number.NaN;
  if (status === 404) {
    return true;
  }
  const code =
    typeof error === "object" && "code" in error
      ? Number((error as { code?: unknown }).code)
      : Number.NaN;
  if (code === 404) {
    return true;
  }
  const message = error instanceof Error ? error.message : String(error);
  return /\b404\b|NOT_FOUND|not found|does not exist|model .+ not found/i.test(message);
}

