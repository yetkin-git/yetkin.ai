/**
 * Kanonik AI roller — yetenek sınıfı, ürün adı değil. Tavan: 8 (anayasa).
 * Eski gemini alias patlaması (tarimAgronomist, juniorPracticeAudio…) doğmaz.
 */

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

export type AiModelRoleKey = (typeof AI_MODEL_ROLE_KEYS)[number];

export const AI_MODEL_ROLE_DEFAULTS: Record<AiModelRoleKey, string> = {
  EXECUTIVE_BRAIN: "gemini-2.5-pro",
  DEEP_RESEARCH: "gemini-2.5-pro",
  FAST_STREAM: "gemini-2.5-flash",
  LITE_STREAM: "gemini-2.5-flash-lite",
  IMAGE_GEN: "imagen-4.0-generate-001",
  VIDEO_GEN: "veo-3.0-generate-001",
  VOICE_TTS: "gemini-2.5-flash-preview-tts",
  OPEN_LOCAL: "gemma-3-27b-it",
};

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
    displayName: "Video Üretim",
    description: "Video üretim (gümrük factory)",
  },
  VOICE_TTS: {
    displayName: "Ses",
    description: "Ses sentezi",
  },
  OPEN_LOCAL: {
    displayName: "Yerel Güç",
    description: "Açık kaynak / egemen yuva",
  },
};

const AI_MODEL_ROLE_KEY_SET = new Set<string>(AI_MODEL_ROLE_KEYS);

export function isAiModelRoleKey(value: string): value is AiModelRoleKey {
  return AI_MODEL_ROLE_KEY_SET.has(value);
}

export function canonicalizeAiModelRole(roleKey: string): AiModelRoleKey | null {
  const trimmed = roleKey.trim();
  return isAiModelRoleKey(trimmed) ? trimmed : null;
}

export function getDefaultModelId(roleKey: AiModelRoleKey): string {
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
