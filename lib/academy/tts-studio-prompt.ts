/**
 * Gemini 3.1 Flash TTS akustik mührü.
 * Direktif `#### TRANSCRIPT` çizgisinin üstünde kalır; konuşulan metne karışmaz.
 * systemInstruction kanalı 400 döner; stil kullanıcı içeriğinin yönetmen katmanındadır.
 */

export const ACADEMY_TTS_STUDIO_ACOUSTIC_DIRECTIVE =
  "studio-grade natural voice, close-mic, clean acoustic environment, no reverb, crisp presence";

/** Tempo DSP katsayısı değildir. Model doğal nefesiyle sakin konuşur. */
export const ACADEMY_TTS_PACE_NOTE = "Pace: calm, natural, clear accent.";

export function academyTtsStudioFingerprintMaterial(): string {
  return `${ACADEMY_TTS_STUDIO_ACOUSTIC_DIRECTIVE}\n${ACADEMY_TTS_PACE_NOTE}`;
}

/**
 * Callirrhoe dışı berrak kadın probe. OFF-101 mührü Callirrhoe kalır; fırın bu sabiti okumaz.
 * Gemini generateContent TTS `audioConfig`, `encoding` ve `sampleRateHertz` kabul etmez.
 * Doğal istek yalnız `speechConfig` ve çıplak transkripttir; yönetmen katmanı yoktur.
 */
export const ACADEMY_TTS_CLEAR_FEMALE_PROBE = {
  voiceName: "Erinome",
  speakerName: "Maya",
  languageCode: "tr-TR",
  speechConfig: {
    languageCode: "tr-TR",
    voiceConfig: {
      prebuiltVoiceConfig: {
        voiceName: "Erinome",
      },
    },
  },
  contentsMode: "transcript-only",
  acousticNote: "Yönetmen katmanı yok. Transkript tek başına gider. Reverb, oda ve yankı istemi yok.",
} as const;

/** Konuşulan transkripti stüdyo yönetmen katmanının altına kilitler. */
export function buildAcademyTtsStudioContents(transcript: string): string {
  const spoken = transcript.trim();
  return [
    "# AUDIO PROFILE: Yetkin stüdyo",
    ACADEMY_TTS_STUDIO_ACOUSTIC_DIRECTIVE,
    "",
    "## THE SCENE: Dry close-mic booth",
    "Clean acoustic environment. No reverb. Close-mic. Crisp presence.",
    "",
    "### DIRECTOR'S NOTES",
    `Style: ${ACADEMY_TTS_STUDIO_ACOUSTIC_DIRECTIVE}`,
    ACADEMY_TTS_PACE_NOTE,
    "Speak only the transcript verbatim. Do not read the profile, the scene, or these notes.",
    "",
    "#### TRANSCRIPT",
    spoken,
  ].join("\n");
}
