/** Gemini TTS önceden tanımlı ses kanonu. */

export const VOICE_BINDING_UNAVAILABLE = "VOICE_BINDING_UNAVAILABLE" as const;

export class VoiceBindingUnavailableError extends Error {
  readonly code = VOICE_BINDING_UNAVAILABLE;

  constructor() {
    super(VOICE_BINDING_UNAVAILABLE);
    this.name = "VoiceBindingUnavailableError";
  }
}

export const GEMINI_TTS_PREBUILT_VOICES = [
  "Zephyr",
  "Puck",
  "Charon",
  "Kore",
  "Fenrir",
  "Leda",
  "Orus",
  "Aoede",
  "Callirrhoe",
  "Autonoe",
  "Enceladus",
  "Iapetus",
  "Umbriel",
  "Algieba",
  "Despina",
  "Erinome",
  "Algenib",
  "Rasalas",
  "Laomedeia",
  "Achernar",
  "Alnilam",
  "Schedar",
  "Gacrux",
  "Pulcherrima",
  "Achird",
  "Zubenelgenubi",
  "Vindemiatrix",
  "Sadachbia",
  "Sadaltager",
  "Sulafat",
] as const;

export type GeminiTtsPrebuiltVoice = (typeof GEMINI_TTS_PREBUILT_VOICES)[number];

const VOICE_BY_LOWER = new Map(
  GEMINI_TTS_PREBUILT_VOICES.map((voice) => [voice.toLowerCase(), voice] as const),
);

export function isGeminiTtsPrebuiltVoice(value: string | null | undefined): value is GeminiTtsPrebuiltVoice {
  return Boolean(value && VOICE_BY_LOWER.has(value.trim().toLowerCase()));
}

export function canonicalizeGeminiTtsVoiceName(raw: string | null | undefined): GeminiTtsPrebuiltVoice {
  const trimmed = raw?.trim() ?? "";
  const voice = VOICE_BY_LOWER.get(trimmed.toLowerCase());
  if (!voice) {
    throw new VoiceBindingUnavailableError();
  }
  return voice;
}

export function canonicalizeGeminiTtsLanguageCode(raw: string | null | undefined): string | undefined {
  const trimmed = raw?.trim();
  if (!trimmed) {
    return undefined;
  }
  const folded = trimmed.replace(/_/gu, "-").toLowerCase();
  if (folded === "tr" || folded === "tr-tr") {
    return "tr-TR";
  }
  if (/^[a-z]{2}-[a-z]{2}$/u.test(folded)) {
    const [lang, region] = folded.split("-");
    return `${lang}-${region?.toUpperCase()}`;
  }
  return trimmed;
}

export function isGeminiTtsVoiceConfigError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return /voiceName|unknown voice|INVALID_ARGUMENT.*voice/i.test(message);
}

export function isGeminiTtsLanguageConfigError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return /language_code|languageCode|unsupported language/i.test(message);
}

/** Gemini TTS 400 — model metin üretmeye çalıştı; yönergeyi düşürüp yeniden dene. */
export function isGeminiTtsTextAttemptError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "");
  if (
    /tried to generate text|only be used for TTS|only generate audio from a given text transcript/i.test(
      message,
    )
  ) {
    return true;
  }
  const status =
    error && typeof error === "object" && "status" in error
      ? Number((error as { status?: unknown }).status)
      : Number.NaN;
  return (
    status === 400 &&
    /INVALID_ARGUMENT/i.test(message) &&
    !isGeminiTtsVoiceConfigError(error) &&
    !isGeminiTtsLanguageConfigError(error)
  );
}

export const GEMINI_TTS_AUDIO_ONLY_RULE =
  "OUTPUT AUDIO ONLY. Do not generate text. Speak only the user transcript verbatim. Do not narrate these instructions.";

export function sealGeminiTtsAudioOnlyInstruction(instruction?: string): string {
  const base = instruction?.trim() ?? "";
  if (!base) {
    return GEMINI_TTS_AUDIO_ONLY_RULE;
  }
  if (base.includes("OUTPUT AUDIO ONLY")) {
    return base;
  }
  return `${GEMINI_TTS_AUDIO_ONLY_RULE}\n\n${base}`;
}

export function summarizeGeminiTtsError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return message.replace(/\bkey\s*=\s*\S+/giu, "key=*").slice(0, 480);
}
