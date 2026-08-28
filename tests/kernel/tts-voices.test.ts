import { describe, expect, it } from "vitest";
import { ACADEMY_TTS_VOICES } from "@/lib/academy/instructors";
import {
  canonicalizeGeminiTtsLanguageCode,
  canonicalizeGeminiTtsVoiceName,
  GEMINI_TTS_PREBUILT_VOICES,
  isGeminiTtsLanguageConfigError,
  isGeminiTtsPrebuiltVoice,
  isGeminiTtsTextAttemptError,
  isGeminiTtsVoiceConfigError,
  sealGeminiTtsAudioOnlyInstruction,
  summarizeGeminiTtsError,
  VoiceBindingUnavailableError,
  VOICE_BINDING_UNAVAILABLE,
} from "@/lib/kernel/ai/tts-voices";

describe("Gemini TTS ses kanonu", () => {
  it("akademi cast sesleri API PascalCase listesinde durur; bilinmeyen binding kapanır", () => {
    expect(GEMINI_TTS_PREBUILT_VOICES).toHaveLength(30);
    for (const voice of ACADEMY_TTS_VOICES) {
      expect(isGeminiTtsPrebuiltVoice(voice)).toBe(true);
      expect(canonicalizeGeminiTtsVoiceName(voice)).toBe(voice);
    }
    expect(canonicalizeGeminiTtsVoiceName("kore")).toBe("Kore");
    expect(canonicalizeGeminiTtsVoiceName("  zephyr ")).toBe("Zephyr");
    expect(canonicalizeGeminiTtsVoiceName("puck")).toBe("Puck");
    expect(canonicalizeGeminiTtsVoiceName("FENRIR")).toBe("Fenrir");
    expect(canonicalizeGeminiTtsVoiceName("aoede")).toBe("Aoede");
    expect(() => canonicalizeGeminiTtsVoiceName("Maya")).toThrow(VoiceBindingUnavailableError);
    expect(() => canonicalizeGeminiTtsVoiceName("")).toThrow(VOICE_BINDING_UNAVAILABLE);
  });

  it("Türkçe dil kodunu tr-TR kanonuna çeker", () => {
    expect(canonicalizeGeminiTtsLanguageCode("tr-TR")).toBe("tr-TR");
    expect(canonicalizeGeminiTtsLanguageCode("tr")).toBe("tr-TR");
    expect(canonicalizeGeminiTtsLanguageCode("TR_tr")).toBe("tr-TR");
    expect(canonicalizeGeminiTtsLanguageCode("")).toBeUndefined();
    expect(canonicalizeGeminiTtsLanguageCode("en-US")).toBe("en-US");
  });

  it("ses/dil yapılandırma hatasını ayırır; anahtarı log özetinden düşürür", () => {
    expect(isGeminiTtsVoiceConfigError(new Error("INVALID_ARGUMENT: unknown voiceName 'Maya'"))).toBe(
      true,
    );
    expect(isGeminiTtsLanguageConfigError(new Error("unsupported language_code tr"))).toBe(true);
    expect(isGeminiTtsVoiceConfigError(new Error("429 RESOURCE_EXHAUSTED"))).toBe(false);
    expect(
      isGeminiTtsTextAttemptError(
        new Error(
          '{"error":{"code":400,"message":"Model tried to generate text, but it should only be used for TTS.","status":"INVALID_ARGUMENT"}}',
        ),
      ),
    ).toBe(true);
    expect(sealGeminiTtsAudioOnlyInstruction("Stil oku")).toContain("OUTPUT AUDIO ONLY");
    expect(sealGeminiTtsAudioOnlyInstruction("Stil oku")).toContain("Stil oku");
    const summarized = summarizeGeminiTtsError(new Error("status key=AIzaSySecretTokenHere boom"));
    expect(summarized).not.toContain("AIza");
    expect(summarized).toContain("key=*");
  });
});
