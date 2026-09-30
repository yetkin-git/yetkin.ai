/**
 * Ders sesi yuvası. Model adı burada yazılmaz; fırın mührü `academyBakeVoiceModelId()` okur.
 * `enabled: false` iken API çağrısı yoktur. Onay sonrası `generateSpeech` gümrük kapısı bağlanır.
 */

import { academyBakeVoiceModelId } from "@/lib/kernel/ai/model-roles";

const ACADEMY_BAKE_VOICE_MODEL_ID = academyBakeVoiceModelId();

export const ACADEMY_GEMINI_TTS_SLOT = {
  id: ACADEMY_BAKE_VOICE_MODEL_ID,
  provider: "gemini",
  model: ACADEMY_BAKE_VOICE_MODEL_ID,
  enabled: false,
} as const;

export type AcademyLessonTtsProvider = "mock-file" | "web-speech" | "gemini-3.1";

export type AcademyGeminiTtsRequest = {
  text: string;
  voiceName?: string;
  languageCode: "tr-TR";
  speakingRate?: number;
};

export type AcademyGeminiTtsResult = {
  mimeType: "audio/mpeg" | "audio/wav";
  bytes: Uint8Array;
};

export type AcademyLessonTtsSlot = {
  provider: AcademyLessonTtsProvider;
  gemini: typeof ACADEMY_GEMINI_TTS_SLOT;
};

export const ACADEMY_LESSON_TTS_SLOT: AcademyLessonTtsSlot = {
  provider: "mock-file",
  gemini: ACADEMY_GEMINI_TTS_SLOT,
};

/**
 * Fırın ses mührü — kasıtlı no-op. Ürün onayı ve `enabled: true` olmadan çağrı yoktur.
 * Kapalı yuva sahte ses basmaz.
 */
export function requestAcademyGeminiTts(_input: AcademyGeminiTtsRequest): AcademyGeminiTtsResult | null {
  if (!ACADEMY_GEMINI_TTS_SLOT.enabled) {
    return null;
  }
  return null;
}
