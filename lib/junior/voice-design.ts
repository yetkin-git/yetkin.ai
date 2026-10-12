/**
 * Junior çocuk anlatıcı — Gemini Voice Design (doğal dil ile ses tasarımı).
 * Kalıcı kimlik Voices API `prompted.input` alanına gider (`voicePrompt`).
 * `systemInstruction` aynı metnin takma adıdır. TTS generateContent bu kanalı
 * 400 INVALID_ARGUMENT ile reddeder; istek gövdesine basılmaz.
 * Voices API güvenlik duvarı `voicePrompt` yolunu kestiği için kaset fırını
 * bu kimliği senteze basmaz. Varsayılan anlatıcı `JUNIOR_CATALOG_NARRATOR_VOICE`.
 * Dinleme anında dış çağrı yoktur. Oynatıcı fırınlanmış MP3 okur.
 * Model kimliği `academyBakeVoiceModelId()` — bu dosya dizeyi ikinci kez yazmaz.
 */

import { createHash } from "node:crypto";
import { ACADEMY_TTS_BREATH_PAUSE_TAG, injectAcademyTtsBreathPauses } from "@/lib/academy/tts-breath-chunks";
import { academyBakeVoiceModelId, assertAcademySealedMediaModel } from "@/lib/kernel/ai/model-roles";
import { wrapPcmAsWav } from "@/lib/kernel/ai/pcm-wav";

/**
 * CEO / SUPER_ADMIN ses tasarım cümlesi.
 * Yaş 10–12. Bebek tınısı bu cümlenin ardından gelen akran kilidiyle kesilir.
 */
export const JUNIOR_CHILD_VOICE_PROMPT =
  "A cheerful, friendly, and energetic 10-to-12-year-old child's voice speaking Turkish clearly, naturally, and with articulate pronunciation. Enthusiastic tone suitable for educational storytelling." as const;

/**
 * 5–8. sınıf akran tonu. Bebek, toddler ve ciyak çizgi film sesi istenmez.
 * Voice Design kalıcı kimliğine girer; turn stiline taşınmaz.
 */
export const JUNIOR_CHILD_VOICE_PEER_GUARD =
  "Not a baby, toddler, or squeaky cartoon voice. Speak as a 10-to-12-year-old classmate to grades 5-8: warm peer tone, clear articulate Turkish, natural energy, never infantile." as const;

export const JUNIOR_VOICE_DESIGN_PROMPT =
  `${JUNIOR_CHILD_VOICE_PROMPT} ${JUNIOR_CHILD_VOICE_PEER_GUARD}` as const;

/** Tur stili kısadır. Yaş ve tını Voice Design'da kalır. */
export const JUNIOR_CHILD_VOICE_TURN_STYLE =
  "cheerful, clear, energetic classmate storytelling" as const;

export const JUNIOR_VOICE_DESIGN_DISPLAY_NAME = "Yetkin Junior Akran" as const;

/**
 * Kaset fırınının varsayılan anlatıcısı. Google hazır katalog sesi.
 * Çağrı kimliği `academyBakeVoiceModelId()` — bu dosya model dizesini ikinci kez yazmaz.
 * Puck çocuk kulağında iri, ağır ve tok kalır; yetişkin EC-102 ağzıdır.
 * Charon tok ve resmidir. Kore kadın katalog numunesidir; matematik ve fenden kalktı.
 * Orpheus hazır katalogda yoktur. Genç, dinamik ve enerjik erkek yuvası Fenrir'dir.
 * Sadachbia numunesi kapanmıştır. Matematik ve fen katalog standardı Fenrir'dir.
 * Türkçe Aoede, sosyal Achird ve seçmeli Enceladus bu ağızda durmaz.
 * İngilizce Kore'de kalır. Matematik ve fen aynı katalog kimliğini taşır.
 * `voicePrompt` bu sabitin yerine geçmez ve senteze gitmez.
 * Matematik ve fen satırları `lib/junior/voice.ts` içinde aynı kimliği taşır.
 */
export const JUNIOR_CATALOG_NARRATOR_VOICE = "Fenrir" as const;

export const JUNIOR_VOICE_DESIGN = {
  voicePrompt: JUNIOR_VOICE_DESIGN_PROMPT,
  /**
   * Aynı metin. Gemini TTS `systemInstruction` kanalına konmaz.
   * Kalıcı kimlik `juniorVoiceDesignCreateBody().voice.prompted.input` içindedir.
   */
  systemInstruction: JUNIOR_VOICE_DESIGN_PROMPT,
  displayName: JUNIOR_VOICE_DESIGN_DISPLAY_NAME,
  languageCode: "tr-TR",
  gender: "neutral",
  persona: "10-12 classmate narrator",
  context: "Educational storytelling",
  pitch: "medium",
  turnStyle: JUNIOR_CHILD_VOICE_TURN_STYLE,
} as const;

const VOICES_URL = "https://generativelanguage.googleapis.com/v1beta/voices";
const INTERACTIONS_URL = "https://generativelanguage.googleapis.com/v1beta/interactions";

export function juniorVoiceDesignPromptHash(): string {
  return createHash("sha256").update(JUNIOR_VOICE_DESIGN.voicePrompt, "utf8").digest("hex");
}

export function isGeminiDesignedVoiceId(value: string | null | undefined): value is string {
  return typeof value === "string" && /^voice_[A-Za-z0-9_-]+$/u.test(value.trim());
}

/**
 * Voices API gövdesi. `systemInstruction` anahtarı yoktur.
 * Model mühür kimliğinden okunur.
 */
export function juniorVoiceDesignCreateBody(): {
  store: true;
  voice: {
    model: string;
    type: "prompted";
    display_name: typeof JUNIOR_VOICE_DESIGN_DISPLAY_NAME;
    language_code: "tr-TR";
    gender: "neutral";
    persona: string;
    context: string;
    pitch: "medium";
    prompted: { input: typeof JUNIOR_VOICE_DESIGN_PROMPT };
  };
} {
  const model = academyBakeVoiceModelId();
  assertAcademySealedMediaModel("VOICE_TTS", model);
  return {
    store: true,
    voice: {
      model,
      type: "prompted",
      display_name: JUNIOR_VOICE_DESIGN.displayName,
      language_code: JUNIOR_VOICE_DESIGN.languageCode,
      gender: JUNIOR_VOICE_DESIGN.gender,
      persona: JUNIOR_VOICE_DESIGN.persona,
      context: JUNIOR_VOICE_DESIGN.context,
      pitch: JUNIOR_VOICE_DESIGN.pitch,
      prompted: { input: JUNIOR_VOICE_DESIGN.voicePrompt },
    },
  };
}

export type JuniorVoiceDesignReceipt = {
  v: 1;
  model: string;
  voiceId: string;
  promptHash: string;
  displayName: typeof JUNIOR_VOICE_DESIGN_DISPLAY_NAME;
};

/** Kayıtlı `voice_` kimliği, mühür ve komut özeti uyuşursa döner. */
export function juniorDesignedVoiceIdFromReceipt(raw: unknown): string | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const row = raw as Partial<JuniorVoiceDesignReceipt>;
  if (row.v !== 1 || row.displayName !== JUNIOR_VOICE_DESIGN_DISPLAY_NAME) {
    return null;
  }
  if (row.model !== academyBakeVoiceModelId() || row.promptHash !== juniorVoiceDesignPromptHash()) {
    return null;
  }
  const voiceId = row.voiceId?.trim() ?? "";
  return isGeminiDesignedVoiceId(voiceId) ? voiceId : null;
}

/**
 * Konuşulan metin ders transkriptidir. Yönetmen paragrafı eklenmez.
 * Nefes etiketi `[pause]` Gemini 3.8'de yüksek sesle okunmasın diye `<break>` olur.
 */
export function juniorVoiceDesignTranscript(listenText: string): string {
  const paused = injectAcademyTtsBreathPauses(listenText.trim());
  return paused.split(ACADEMY_TTS_BREATH_PAUSE_TAG).join("<break>");
}

function httpError(status: number, body: string): Error {
  return Object.assign(new Error(body.slice(0, 800)), { status });
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function audioBytesFromUnknown(value: unknown): Buffer | null {
  const row = asRecord(value);
  if (!row) {
    return null;
  }
  const data = row.data ?? row.bytes;
  if (typeof data !== "string" || data.length === 0) {
    return null;
  }
  const bytes = Buffer.from(data, "base64");
  if (bytes.length < 32) {
    return null;
  }
  if (bytes.length >= 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF") {
    return bytes;
  }
  return wrapPcmAsWav(bytes);
}

function wavFromInteraction(payload: unknown): Buffer | null {
  const row = asRecord(payload);
  if (!row) {
    return null;
  }
  const direct = audioBytesFromUnknown(row.output_audio ?? row.outputAudio);
  if (direct) {
    return direct;
  }
  const steps = Array.isArray(row.steps) ? row.steps : [];
  for (let index = steps.length - 1; index >= 0; index -= 1) {
    const step = asRecord(steps[index]);
    if (!step || (step.type && step.type !== "model_output")) {
      continue;
    }
    const content = Array.isArray(step.content) ? step.content : [];
    for (let blockIndex = content.length - 1; blockIndex >= 0; blockIndex -= 1) {
      const block = asRecord(content[blockIndex]);
      if (!block) {
        continue;
      }
      if (block.type === "audio" || block.mime_type || block.mimeType) {
        const audio = audioBytesFromUnknown(block);
        if (audio) {
          return audio;
        }
      }
    }
  }
  return null;
}

export type JuniorDesignedVoice = {
  voiceId: string;
  previewWav: Buffer | null;
};

/** Kalıcı çocuk sesi. `store: true` zorunlu; kimlik `voice_` ile döner. */
export async function createJuniorDesignedVoice(input: {
  apiKey: string;
  timeoutMs: number;
}): Promise<JuniorDesignedVoice> {
  const response = await fetch(VOICES_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-goog-api-key": input.apiKey,
    },
    body: JSON.stringify(juniorVoiceDesignCreateBody()),
    signal: AbortSignal.timeout(input.timeoutMs),
  });
  const raw = await response.text();
  if (!response.ok) {
    throw httpError(response.status, raw);
  }
  const payload = asRecord(JSON.parse(raw) as unknown);
  const voiceId = typeof payload?.id === "string" ? payload.id.trim() : "";
  if (!isGeminiDesignedVoiceId(voiceId)) {
    throw new Error("Junior ses tasarımı voice_ kimliği dönmedi.");
  }
  const previewWav = audioBytesFromUnknown(payload?.sample_audio ?? payload?.sampleAudio);
  return { voiceId, previewWav };
}

/**
 * Tasarlanmış sesle birebir transkript.
 * Stil yalnız kısa tur notudur. Persona Voice Design kaydındadır.
 */
export async function synthesizeJuniorDesignedSpeech(input: {
  apiKey: string;
  model: string;
  voiceId: string;
  transcript: string;
  timeoutMs: number;
}): Promise<Buffer> {
  assertAcademySealedMediaModel("VOICE_TTS", input.model);
  if (input.model !== academyBakeVoiceModelId()) {
    throw new Error("Junior ses modeli mühür kimliğinden koptu.");
  }
  if (!isGeminiDesignedVoiceId(input.voiceId)) {
    throw new Error("Junior ses tasarımı voice_ kimliği bekler.");
  }
  const response = await fetch(INTERACTIONS_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-goog-api-key": input.apiKey,
    },
    body: JSON.stringify({
      model: input.model,
      input: [
        {
          type: "user_input",
          content: [
            {
              type: "text",
              text: input.transcript,
              annotations: [{ type: "speech_metadata", style: JUNIOR_VOICE_DESIGN.turnStyle }],
            },
          ],
        },
      ],
      response_format: { type: "audio" },
      generation_config: {
        speech_config: [{ voice: input.voiceId }],
      },
    }),
    signal: AbortSignal.timeout(input.timeoutMs),
  });
  const raw = await response.text();
  if (!response.ok) {
    throw httpError(response.status, raw);
  }
  const wav = wavFromInteraction(JSON.parse(raw) as unknown);
  if (!wav || wav.length < 2_048) {
    throw new Error("Junior ses tasarımı boş ses döndü.");
  }
  return wav;
}
