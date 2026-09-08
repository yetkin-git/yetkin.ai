/**
 * Ders sesi — ücretsiz/mock katman ile Gemini 3.1 TTS yuvası.
 *
 * Bu aşamada paralı API çağrısı yoktur. `enabled: false` ürün onayına kadar kilitli kalır.
 * Onay sonrası `generateSpeech` gümrük kapısı (`lib/kernel/ai/llm-gateway.ts`) buraya bağlanır.
 */

export const ACADEMY_GEMINI_TTS_SLOT = {
  id: "gemini-3.1-tts",
  provider: "gemini",
  model: "gemini-3.1-tts",
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
 * Gemini 3.1 TTS — kasıtlı no-op. Ürün onayı ve `enabled: true` olmadan çağrı yoktur.
 */
export function requestAcademyGeminiTts(_input: AcademyGeminiTtsRequest): AcademyGeminiTtsResult | null {
  if (!ACADEMY_GEMINI_TTS_SLOT.enabled) {
    return null;
  }
  return null;
}
