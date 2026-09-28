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

/** Canlı TTS çağrı kimliği. Stüdyo ürün adı bunun yerine geçmez. */
export const VOICE_TTS_MODEL_ID = "gemini-3.1-flash-tts-preview" as const;

export const AI_MODEL_ROLE_DEFAULTS: Record<AiLiveModelRoleKey, string> = {
  EXECUTIVE_BRAIN: "gemini-3.1-pro-preview",
  DEEP_RESEARCH: "gemini-3.1-pro-preview",
  FAST_STREAM: "gemini-3.6-flash",
  LITE_STREAM: "gemini-3.5-flash-lite",
  IMAGE_GEN: "imagen-4.0-generate-001",
  VOICE_TTS: VOICE_TTS_MODEL_ID,
  OPEN_LOCAL: "gemma-3-27b-it",
};

/**
 * Akademi fırın sicili. Canlı 8 rol tavanını şişirmez.
 * Vatandaş izlemesi bu kimlikleri çağırmaz.
 * Canlı sohbet `FAST_STREAM` okur. Uzun ufuklu senaryo `LONG_HORIZON_TEXT` okur.
 * Canlı görsel gümrüğü `IMAGE_GEN` (Imagen) okur. Fırın karesi `IMAGE_NANO_BANANA_2` okur.
 * Canlı `VIDEO_GEN` mühürlü-ölüdür. Otomatik Veo API iptaldir. Isınma klibi yerel `-warmup.mp4` reuse.
 */
export const ACADEMY_BAKE_MODELS = {
  LONG_HORIZON_TEXT: "gemini-3.8-flash",
  /**
   * Fırın ses çağrısı. `academyBakeVoiceModelId()` bu sabiti okur.
   * Canlı gümrük `VOICE_TTS` ayrı kalır.
   */
  VOICE_TTS_STUDIO_PRODUCT: "gemini-3.8-flash-tts",
  IMAGE_NANO_BANANA_2: "gemini-3.1-flash-image",
  MUSIC_LYRIA: "lyria-3.5",
  VIDEO_VEO_LITE: "veo-3.1-lite-generate-preview",
  VIDEO_VEO_PREMIUM_FORBIDDEN: "veo-3.1-generate-preview",
} as const;

/** Fırın sesi stüdyo ürün kimliğini okur. Canlı gümrük `getDefaultModelId("VOICE_TTS")` ayrıdır. */
export function academyBakeVoiceModelId(): typeof ACADEMY_BAKE_MODELS.VOICE_TTS_STUDIO_PRODUCT {
  return ACADEMY_BAKE_MODELS.VOICE_TTS_STUDIO_PRODUCT;
}

/**
 * Kota, 404 veya limit, Gemini 2.5 Flash TTS'e düşmez.
 * Kota yoksa işlem durur. Fırın açılınca yalnız `academyBakeVoiceModelId()` kullanılır.
 */
export const VOICE_TTS_FALLBACK_TO_2_5 = false as const;

/** Yasak alt model. Üretim yolu bu kimliği seçmez. */
export const VOICE_TTS_FORBIDDEN_MODEL_ID = "gemini-2.5-flash-preview-tts" as const;

/** @deprecated Seçilmez. `VOICE_TTS_FALLBACK_TO_2_5` kapalıdır. */
export const VOICE_TTS_FALLBACK_MODEL_ID = VOICE_TTS_FORBIDDEN_MODEL_ID;

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

export function selectFallbackModelId(input: {
  assignedModelId: string;
  previousStableModelId: string;
  defaultModelId: string;
}): string | null {
  const assigned = input.assignedModelId.trim();
  const previous = input.previousStableModelId.trim();
  const fallbackDefault = input.defaultModelId.trim();
  if (previous && previous !== assigned) {
    return previous;
  }
  if (fallbackDefault && fallbackDefault !== assigned) {
    return fallbackDefault;
  }
  return null;
}
