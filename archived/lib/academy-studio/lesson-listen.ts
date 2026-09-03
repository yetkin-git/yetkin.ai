/**
 * Dersi Dinle — vatandaş yüzü sözleşmesi (istemci güvenli).
 *
 * Ses üretimi `archived/lib/academy-studio/lesson-listen-engine.ts` içindedir; GEMINI_API_KEY
 * tarayıcıya sızmaz. Stüdyo hoparlörü Gemini TTS / Supabase mühürlü WAV'dır.
 * Kota / 429 / AbortError'da stüdyo WAV yoksa istemci hoparlörü
 * Web Speech API (SpeechSynthesis) ile duyulur; sessiz sahte saat yok.
 */

import { academySpokenModuleCode } from "@/lib/academy/catalog-filter";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import type { AiLiveModelRoleKey } from "@/lib/kernel/ai/model-roles";
import {
  ACADEMY_ANNOUNCER,
  ACADEMY_MODERATOR,
  isAcademyInstructorStudioReplyProse,
  type AcademyInstructor,
  type AcademyTtsVoice,
} from "@/lib/academy/instructors";
import { collectAcademyModeratorSpeechSpans } from "@/archived/lib/academy-studio/studio-cast";
import { cleanAcademySpokenTextForTts, spokenAcademyLessonBody } from "@/lib/academy/lesson-body";

export const ACADEMY_LESSON_LISTEN_ROLE = "VOICE_TTS" satisfies AiLiveModelRoleKey;

/**
 * Faz 1 sönümleme — vatandaş yüzünde ses üretimi kapalı.
 * generateSpeech / listen 410; oynatıcı metin + video.
 * Motor dosyaları yerinde; yeni TTS byte yazılmaz.
 */
export const ACADEMY_LESSON_LISTEN_ENABLED = false;

export const ACADEMY_LESSON_LISTEN_LANGUAGE = "tr-TR";
/** Beş dakikalık sakin kopya + kod çiti + quiz gövdesi sığsın. */
export const ACADEMY_LESSON_LISTEN_MAX_CHARS = 16_000;
/** Gemini TTS parça tavanı — 3–5 sn yanıt; uzun dersler WAV birleştirmesi ile okunur. */
export const ACADEMY_LESSON_LISTEN_CHUNK_CHARS = 900;
/** ConnectTimeoutError / UND_ERR_CONNECT_TIMEOUT — 500 ms; 2 dk kilit yok. */
export const ACADEMY_LISTEN_CONNECT_TIMEOUT_MS = 500;
/** Parça TTS gümrük tavanı (ms). Bağlantı yoksa Pürüzsüz Okuma Modu. */
export const ACADEMY_LESSON_LISTEN_SPEECH_TIMEOUT_MS = ACADEMY_LISTEN_CONNECT_TIMEOUT_MS;
/** Paralel-sıralı havuz — tam paralel kota patlatmaz. */
export const ACADEMY_LESSON_LISTEN_CHUNK_CONCURRENCY = 3;
/** ConnectTimeoutError yeniden denenmez — Okuma Modu dürüstçe açılır. */
export const ACADEMY_LESSON_LISTEN_CHUNK_TIMEOUT_RETRIES = 0;
/** generateSpeech iç deneme — bağlantı zaman aşımında tek shot. */
export const ACADEMY_LESSON_LISTEN_GATEWAY_MAX_ATTEMPTS = 1;
/** generateSpeech hız kovası — parça + retry sığar. */
export const ACADEMY_LESSON_LISTEN_RATE_LIMIT = 24;
/** Listen API (App Router) süre tavanı saniye. */
export const ACADEMY_LESSON_LISTEN_ROUTE_MAX_DURATION_SEC = 180;
/** İstemci ilk bayt bekçisi — 500 ms yanıt yoksa Pürüzsüz Okuma Modu. */
export const ACADEMY_LESSON_LISTEN_PREPARING_TIMEOUT_MS = ACADEMY_LISTEN_CONNECT_TIMEOUT_MS;
/** TTS fallback sessizlik süresi (ms). */
export const ACADEMY_LISTEN_FALLBACK_SILENCE_MS = 700;
/** Şablon — stil yönergesi; `instruction` kanalına gider, ses metnine asla eklenmez. */
/** Harf harf kısaltma okuma yasağı — generateSpeech `instruction` mührü ile aynı. */
export const ACADEMY_TTS_NO_LETTER_SPELLING_RULE =
  "Kullanıcıya ders anlatırken kesinlikle sadece harf kısaltması (örneğin 'le-le-me' veya 'el-el-em') söyleme. Her zaman terimin tam Türkçe anlamını oku.";

export const ACADEMY_LESSON_LISTEN_TTS_INSTRUCTION =
  `Aşağıdaki SESLENDİRİLECEK METİN bloğunu, kamerasının karşısında çayını yudumlarken doğaçlama konuşan, üç noktalarda (...) doğal nefes molası veren samimi bir uzman ({instructorName}) gibi oku. Türkçe konuş. Tempo günlük konuşmadan yüzde altı daha yavaş olsun — eğretilik yok; tane tane ama canlı mentör hızı. «Buraya dikkat», «işin düğümlendiği», «kırılma anı», «saha tecrübesiyle», «bir kez daha» gibi can alıcı geçişlerde ritmi bilinçli yavaşlat; «Başka bir deyişle», «günlük hayattan», «şöyle de özetleyebiliriz» cümlelerini kıdemli mentör duruşunda, aynı fikri Türk kültürüne ve gündelik yaşama ait yerel benzetmeyle (kültürel analoji) oturtuyormuş gibi oku; «Evet, yani», «Doğru dedin», «Aynen öyle», «Tam olarak bu işte», «Çok doğru bir noktaya değindin» onaylarını abartısız sohbet ritminde oku — «Harika!», «Süper!» coşkusu yok; soğuk ansiklopedi, sokak ağzı veya tıkır tıkır liste tonu yok. Yönerge cümlelerini ve sistem notlarını sesli okuma; yalnız metni oku, metne cümle ekleme. İngilizce terimi oku, eğik çizgiyi «veya» de, ardından parantezdeki Türkçe karşılığı daha yavaş ve net tekrarla. ${ACADEMY_TTS_NO_LETTER_SPELLING_RULE}`;

/** İlk ses karesi hedefi — önbellek ısısı ve parça akışı. */
export const ACADEMY_LESSON_LISTEN_FIRST_AUDIO_TARGET_MS = 3_000;
/** İlk TTS dilimi — daha kısa parça = daha hızlı ilk ses. */
export const ACADEMY_LESSON_LISTEN_FIRST_CHUNK_CHARS = 420;
/** Eğitmen istemci oynatma hızı — %6 yavaşlatma (0.94). */
export const ACADEMY_LESSON_LISTEN_PLAYBACK_RATE = 0.94;
/** İnsan okuma tabanı — sahne saati kelime başı bu milisaniyenin altına inmez. */
export const ACADEMY_LISTEN_MIN_MS_PER_WORD = 420;
/** Çok kısa sahne flaşını keser (metin / fallback saati). */
export const ACADEMY_LISTEN_MIN_SCENE_MS = 1_800;
/** Moderatör — varsayılan insan konuşma temposu (%0 yavaşlatma). */
export const ACADEMY_MODERATOR_PLAYBACK_RATE = 1;
/** Anons — sabit kurumsal sistem anons temposu. */
export const ACADEMY_ANNOUNCER_PLAYBACK_RATE = 0.96;

/** HTTP: sunucu bellek / Supabase önbelleği isabeti. */
export const ACADEMY_LISTEN_CACHE_HEADER = "X-Academy-Listen-Cache";

/** HTTP: isabet kaynağı — memory | supabase | miss. */
export const ACADEMY_LISTEN_CACHE_SOURCE_HEADER = "X-Academy-Listen-Cache-Source";

/** HTTP: Supabase Storage public URL — istemci CDN'den çalar. */
export const ACADEMY_LISTEN_AUDIO_URL_HEADER = "X-Academy-Listen-Audio-Url";

/** HTTP: WAV parça çerçeveleme. */
export const ACADEMY_LISTEN_FRAMING_HEADER = "X-Academy-Listen-Framing";

/** HTTP: her WAV karesinin konuşmacısı (virgülle; dilim sırasıyla). */
export const ACADEMY_LISTEN_SPEAKERS_HEADER = "X-Academy-Listen-Speakers";

/** HTTP: TTS başarısız; stüdyo WAV yok. İstemci Okuma Modu (metin saati). */
export const ACADEMY_LISTEN_FALLBACK_HEADER = "X-Academy-Listen-Fallback";
/** Kota başlığı — stüdyo WAV yok; istemci okuma moduna geçer. */
export const ACADEMY_LISTEN_FALLBACK_KIND_LOCAL = "local-voice";
/** Eski sessiz tampon işareti — stüdyo hoparlöre düşmez. */
export const ACADEMY_LISTEN_FALLBACK_KIND_SILENT = "silent";

/** HTTP: (kelime × 420 ms / 1000) / playbackRate okuma süresi (saniye). Fallback UI saati. */
export const ACADEMY_LISTEN_TEXT_DURATION_HEADER = "X-Academy-Listen-Text-Duration";

/** Tek parça sessiz fallback WAV tavanı — gerçek TTS dilimi bunun üstündedir. */
export const ACADEMY_LISTEN_FALLBACK_AUDIO_MAX_SEC = 1.6;

/** Birleşik WAV, metin süresinin bu oranının altındaysa fallback saati. */
export const ACADEMY_LISTEN_FALLBACK_DURATION_RATIO = 0.4;

export const ACADEMY_LISTEN_FRAMING_WAV_U32BE = "wav-u32be";

/** Stüdyo sunucusu — stil yönergesi; `instruction` kanalına gider. */
export const ACADEMY_MODERATOR_TTS_INSTRUCTION =
  `Aşağıdaki SESLENDİRİLECEK METİN bloğunu, ${YETKIN_BRAND} Akademi stüdyosunda canlı yayını yöneten, ara soru soran, konuyu «Benim anladığım kadarıyla» diye özetleyip teyit alan samimi bir sunucu ({moderatorName}) gibi oku. Türkçe konuş. Tempo günlük konuşma hızında olsun; yavaşlatma. Yönerge cümlelerini sesli okuma; yalnız metni oku, metne cümle ekleme. Üç noktalarda (...) doğal nefes molası ver. ${ACADEMY_TTS_NO_LETTER_SPELLING_RULE}`;

/** Katman 1 — kurumsal sistem anonsu / AI jeneriği; insan sıcaklığı yok. */
export const ACADEMY_ANNOUNCER_TTS_INSTRUCTION =
  `Aşağıdaki SESLENDİRİLECEK METİN bloğunu kurumsal bir sistem anonsu ve AI jeneriği gibi oku: net, ölçülü, robotik-kurumsal stüdyo kapısı sesi; insan sıcaklığı, sohbet tonu veya mentör samimiyeti yok. Türkçe konuş. Tempo sabit kurumsal sistem anons hızında olsun. Yönerge cümlelerini sesli okuma; yalnız metni oku, metne cümle ekleme. ${ACADEMY_TTS_NO_LETTER_SPELLING_RULE}`;

export function academyAnnouncerTtsInstruction(): string {
  return ACADEMY_ANNOUNCER_TTS_INSTRUCTION;
}

export function academyLessonListenTtsInstruction(instructorName: string): string {
  const name = instructorName.trim();
  if (!name) {
    throw new Error("Eğitmen ismi yok.");
  }
  return ACADEMY_LESSON_LISTEN_TTS_INSTRUCTION.replaceAll("{instructorName}", name);
}

export function academyModeratorTtsInstruction(moderatorName: string): string {
  const name = moderatorName.trim();
  if (!name) {
    throw new Error("Moderatör ismi yok.");
  }
  return ACADEMY_MODERATOR_TTS_INSTRUCTION.replaceAll("{moderatorName}", name);
}

export type AcademyLessonListenRequest = {
  courseId: string;
  lessonKey: string;
  locale: "tr-TR";
};

export type AcademyLessonListenAudio = {
  mimeType: "audio/wav";
  audioBytes: Uint8Array;
  model: string;
};

export function academyLessonListenPath(courseId: string): string {
  return `/api/academy/courses/${encodeURIComponent(courseId)}/listen`;
}

export function splitSpokenTextForTts(
  text: string,
  maxChars = ACADEMY_LESSON_LISTEN_CHUNK_CHARS,
): string[] {
  const trimmed = text.replace(/\s+/gu, " ").trim();
  if (!trimmed) {
    return [];
  }
  if (trimmed.length <= maxChars) {
    return [trimmed];
  }
  const units = trimmed
    .split(/(?<=(?:\.{3}|…|[.!?]))\s+/u)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  const chunks: string[] = [];
  let buffer = "";
  function flush(): void {
    if (buffer) {
      chunks.push(buffer);
      buffer = "";
    }
  }
  for (const unit of units) {
    if (unit.length > maxChars) {
      flush();
      for (const slice of splitLongSpokenPiece(unit, maxChars)) {
        chunks.push(slice);
      }
      continue;
    }
    if (!buffer) {
      buffer = unit;
      continue;
    }
    const next = `${buffer} ${unit}`;
    if (next.length <= maxChars) {
      buffer = next;
      continue;
    }
    flush();
    buffer = unit;
  }
  flush();
  return chunks;
}

const CONJUNCTION_NEEDLES = [" ve ", " ama ", " fakat ", " çünkü ", " yani ", " ile ", " ya da "] as const;

function lastMatchEnd(window: string, pattern: RegExp): number {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  const re = new RegExp(pattern.source, flags);
  let last = -1;
  let match = re.exec(window);
  while (match) {
    last = match.index + match[0].length;
    match = re.exec(window);
  }
  return last;
}

function lastConjunctionEnd(window: string): number {
  const lower = window.toLocaleLowerCase("tr-TR");
  let best = -1;
  for (const needle of CONJUNCTION_NEEDLES) {
    const index = lower.lastIndexOf(needle);
    if (index >= 0) {
      best = Math.max(best, index + needle.length);
    }
  }
  return best;
}

function findSpokenBreak(window: string): number {
  if (!window) {
    return 0;
  }
  const min = Math.max(1, Math.floor(window.length * 0.4));
  const candidates = [
    lastMatchEnd(window, /(?:\.{3}|…)/u),
    lastMatchEnd(window, /[.!?](?=\s|$)/u),
    lastMatchEnd(window, /[;:,](?=\s)/u),
    lastConjunctionEnd(window),
    window.lastIndexOf(" ") + 1,
  ];
  for (const cut of candidates) {
    if (cut >= min && cut < window.length) {
      return cut;
    }
  }
  for (const cut of candidates) {
    if (cut > 0 && cut < window.length) {
      return cut;
    }
  }
  return window.length;
}

function splitLongSpokenPiece(piece: string, maxChars: number): string[] {
  const slices: string[] = [];
  let rest = piece.trim();
  while (rest.length > maxChars) {
    const window = rest.slice(0, maxChars);
    let cut = findSpokenBreak(window);
    if (cut <= 0 || cut > maxChars) {
      cut = maxChars;
    }
    slices.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) {
    slices.push(rest);
  }
  return slices.filter((slice) => slice.length > 0);
}

/**
 * SSOT: ekran transcript’inden temiz konuşma metni üretir.
 * Stil yönergesi buraya EKLENMEZ — `instruction` kanalı ayrıdır (NO META IN AUDIO).
 */
export function wrapAcademyLessonTtsPrompt(lessonSlice: string, _instructorName?: string): string {
  return cleanAcademySpokenTextForTts(lessonSlice);
}

export function wrapAcademyModeratorTtsPrompt(lessonSlice: string, _moderatorName?: string): string {
  return cleanAcademySpokenTextForTts(lessonSlice);
}

export function wrapAcademyAnnouncerTtsPrompt(lessonSlice: string): string {
  return cleanAcademySpokenTextForTts(lessonSlice);
}

/** Katman 1 — mekanik anons: bölüm kodu (okunuş) + ders başlığı. */
export function academyAnnouncerLessonCue(lessonTitle: string, courseSlug?: string): string {
  const title = lessonTitle.trim() || "Ders";
  const spoken = courseSlug?.trim() ? academySpokenModuleCode(courseSlug.trim()) : null;
  if (spoken) {
    return `Yetkin Akademi. Bölüm ${spoken}. ${title}. Başlıyoruz.`;
  }
  return `Yetkin Akademi. ${title}. Başlıyoruz.`;
}

/** Dilim: saf konuşma + ayrı stil yönergesi (systemInstruction). */
export function academyLessonListenSpeechSlice(input: {
  speaker: AcademyStudioSpeechSpeaker;
  voiceName: AcademyTtsVoice;
  text: string;
  instruction: string;
}): AcademyLessonListenSpeechSlice {
  const text = cleanAcademySpokenTextForTts(input.text);
  return {
    speaker: input.speaker,
    voiceName: input.voiceName,
    text,
    /** Eski alan adı — `text` ile birebir aynı SSOT (yönerge yok). */
    prompt: text,
    instruction: input.instruction.trim(),
  };
}

export function academyListenClientCacheKey(courseId: string, lessonKey: string): string {
  return `${courseId}:${lessonKey}`;
}

export type AcademyListenClientCacheEntry = {
  wav: Uint8Array;
  textDurationSec: number;
  fallback: boolean;
  audioUrl?: string;
};

const CLIENT_LISTEN_CACHE = new Map<string, AcademyListenClientCacheEntry>();

export function getAcademyListenClientCachedAudio(
  courseId: string,
  lessonKey: string,
): AcademyListenClientCacheEntry | null {
  return CLIENT_LISTEN_CACHE.get(academyListenClientCacheKey(courseId, lessonKey)) ?? null;
}

export function setAcademyListenClientCachedAudio(
  courseId: string,
  lessonKey: string,
  wav: Uint8Array,
  meta?: { textDurationSec?: number; fallback?: boolean; audioUrl?: string },
): void {
  CLIENT_LISTEN_CACHE.set(academyListenClientCacheKey(courseId, lessonKey), {
    wav,
    textDurationSec: meta?.textDurationSec && meta.textDurationSec > 0 ? meta.textDurationSec : 0,
    fallback: Boolean(meta?.fallback),
    audioUrl: meta?.audioUrl?.trim() || undefined,
  });
}

function asciiEquals(bytes: Uint8Array, offset: number, expected: string): boolean {
  if (offset + expected.length > bytes.byteLength) {
    return false;
  }
  for (let index = 0; index < expected.length; index += 1) {
    if (bytes[offset + index] !== expected.charCodeAt(index)) {
      return false;
    }
  }
  return true;
}

function isWavBytes(bytes: Uint8Array): boolean {
  return bytes.byteLength >= 12 && asciiEquals(bytes, 0, "RIFF") && asciiEquals(bytes, 8, "WAVE");
}

function extractPcmFromWavBytes(wav: Uint8Array): Uint8Array {
  if (!isWavBytes(wav) || wav.byteLength < 44) {
    return wav;
  }
  const view = new DataView(wav.buffer, wav.byteOffset, wav.byteLength);
  const dataSize = view.getUint32(40, true);
  return wav.subarray(44, 44 + Math.max(0, dataSize));
}

function wrapPcmAsWavBytes(
  pcm: Uint8Array,
  sampleRate: number,
  channels = 1,
  bitDepth = 16,
): Uint8Array {
  if (isWavBytes(pcm)) {
    return pcm;
  }
  const blockAlign = channels * (bitDepth / 8);
  const byteRate = sampleRate * blockAlign;
  const header = new Uint8Array(44);
  const view = new DataView(header.buffer);
  header.set([0x52, 0x49, 0x46, 0x46], 0);
  view.setUint32(4, 36 + pcm.byteLength, true);
  header.set([0x57, 0x41, 0x56, 0x45], 8);
  header.set([0x66, 0x6d, 0x74, 0x20], 12);
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  header.set([0x64, 0x61, 0x74, 0x61], 36);
  view.setUint32(40, pcm.byteLength, true);
  const out = new Uint8Array(44 + pcm.byteLength);
  out.set(header, 0);
  out.set(pcm, 44);
  return out;
}

/** İstemci bellek birleştirmesi — Node `Buffer` yok. Disk yok. */
export function concatPcmWavBytes(parts: readonly Uint8Array[]): Uint8Array {
  if (parts.length === 0) {
    throw new Error("Boş ses yanıtı.");
  }
  if (parts.length === 1) {
    return wrapPcmAsWavBytes(parts[0]!, 24_000);
  }
  const pcms: Uint8Array[] = [];
  let sampleRate = 24_000;
  for (const part of parts) {
    const wav = wrapPcmAsWavBytes(part, sampleRate);
    if (pcms.length === 0 && isWavBytes(wav)) {
      sampleRate = new DataView(wav.buffer, wav.byteOffset, wav.byteLength).getUint32(24, true);
    }
    pcms.push(extractPcmFromWavBytes(wav));
  }
  const pcmLen = pcms.reduce((sum, pcm) => sum + pcm.byteLength, 0);
  const merged = new Uint8Array(pcmLen);
  let offset = 0;
  for (const pcm of pcms) {
    merged.set(pcm, offset);
    offset += pcm.byteLength;
  }
  return wrapPcmAsWavBytes(merged, sampleRate);
}

export function encodeAcademyListenWavFrame(wav: Uint8Array): Uint8Array {
  const frame = new Uint8Array(4 + wav.byteLength);
  new DataView(frame.buffer).setUint32(0, wav.byteLength, false);
  frame.set(wav, 4);
  return frame;
}

export function encodeAcademyListenStreamEnd(): Uint8Array {
  return new Uint8Array(4);
}

export async function* iterateAcademyListenWavFrames(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<Uint8Array> {
  const reader = body.getReader();
  let buf: Uint8Array = new Uint8Array(0);
  function concat(left: Uint8Array, right: Uint8Array): Uint8Array {
    const next: Uint8Array = new Uint8Array(left.byteLength + right.byteLength);
    next.set(left, 0);
    next.set(right, left.byteLength);
    return next;
  }
  async function fill(min: number): Promise<boolean> {
    while (buf.byteLength < min) {
      const { value, done } = await reader.read();
      if (done || !value) {
        return false;
      }
      const chunk = new Uint8Array(value.byteLength);
      chunk.set(value);
      buf = concat(buf, chunk);
    }
    return true;
  }
  try {
    while (true) {
      if (!(await fill(4))) {
        return;
      }
      const length = new DataView(buf.buffer, buf.byteOffset, buf.byteLength).getUint32(0, false);
      buf = buf.subarray(4);
      if (length === 0) {
        return;
      }
      if (!(await fill(length))) {
        return;
      }
      yield buf.slice(0, length);
      buf = buf.subarray(length);
    }
  } finally {
    reader.releaseLock();
  }
}

export type AcademyStudioSpeechSpeaker = "announcer" | "moderator" | "instructor";

export type AcademyStudioSpeechTurn = {
  speaker: AcademyStudioSpeechSpeaker;
  text: string;
};

export type AcademyLessonListenSpeechSlice = {
  speaker: AcademyStudioSpeechSpeaker;
  voiceName: AcademyTtsVoice;
  /** Saf konuşma SSOT — generateSpeech `text`; anayasa/yönerge yok. */
  text: string;
  /**
   * Eski alan — `text` ile aynı temiz SSOT.
   * Yönerge sarmalayıcısı taşımamalı; yüzey testleri için korunur.
   */
  prompt: string;
  /** Stil yönergesi — Gemini systemInstruction; asla seslendirilmez. */
  instruction: string;
};

/** Moderatör el tesliminden sonra eğitmen nezaket açılışı — TTS senaryo kuralı. */
export function academyInstructorCourtesyHandoff(moderatorName: string): string {
  const name = moderatorName.trim() || ACADEMY_MODERATOR.name;
  return `Teşekkürler ${name}, herkese merhaba. Bugün birlikte devam ediyoruz...`;
}

export function academyInstructorTurnHasCourtesy(text: string): boolean {
  const head = text.replace(/\s+/gu, " ").trim().slice(0, 180);
  if (!head) {
    return false;
  }
  if (isAcademyInstructorStudioReplyProse(head)) {
    return true;
  }
  return (
    /^(?:teşekkürler|çok teşekkürler|sağ ol)\b/iu.test(head) ||
    /\bherkese merhaba\b/iu.test(head) ||
    /\bhoş bulduk\b/iu.test(head)
  );
}

/**
 * Moderatör → eğitmen geçişinde kısa teşekkür/selam yoksa enjekte eder.
 * Ders gövdesi atlamasın; insan diyalog nezaketi senaryo jeneratöründe mühürlenir.
 */
export function ensureAcademyInstructorCourtesyTurns(
  turns: readonly AcademyStudioSpeechTurn[],
  moderatorName: string = ACADEMY_MODERATOR.name,
): AcademyStudioSpeechTurn[] {
  const courtesy = academyInstructorCourtesyHandoff(moderatorName);
  const out: AcademyStudioSpeechTurn[] = [];
  for (const turn of turns) {
    const prev = out[out.length - 1];
    if (
      turn.speaker === "instructor" &&
      prev?.speaker === "moderator" &&
      !academyInstructorTurnHasCourtesy(turn.text)
    ) {
      out.push({
        speaker: "instructor",
        text: `${courtesy} ${turn.text}`.replace(/\s+/gu, " ").trim(),
      });
      continue;
    }
    out.push({ speaker: turn.speaker, text: turn.text });
  }
  return out;
}

/** Ders başlığı nezaket cümlesinden sonra gelir; doğrudan içerik atlaması olmaz. */
export function insertAcademyLessonTitleAfterCourtesy(text: string, lessonTitle: string): string {
  const title = lessonTitle.trim();
  const body = text.replace(/\s+/gu, " ").trim();
  if (!title || !body || body.includes(title)) {
    return body;
  }
  const breath = /^(.+?\.\.\.)(?:\s+|$)/u.exec(body);
  if (breath) {
    const rest = body.slice(breath[0].length).trim();
    return rest ? `${breath[1]} ${title}. ${rest}`.replace(/\s+/gu, " ").trim() : `${breath[1]} ${title}.`.trim();
  }
  return `${title}. ${body}`.trim();
}

export function academyListenPlaybackRateForSpeaker(speaker: AcademyStudioSpeechSpeaker): number {
  switch (speaker) {
    case "moderator":
      return ACADEMY_MODERATOR_PLAYBACK_RATE;
    case "announcer":
      return ACADEMY_ANNOUNCER_PLAYBACK_RATE;
    default:
      return ACADEMY_LESSON_LISTEN_PLAYBACK_RATE;
  }
}

export function academyListenWordCount(text: string): number {
  const trimmed = text.replace(/\s+/gu, " ").trim();
  if (!trimmed) {
    return 0;
  }
  return trimmed.split(" ").length;
}

/**
 * Metin okuma süresi SSOT: (kelime × 420 ms / 1000) / playbackRate.
 * `playbackRate` HTMLAudio çarpanıdır (0.94 = %6 yavaşlatma); kelime/saniye değildir.
 */
export function academyListenReadingDurationSec(
  text: string,
  playbackRate: number = ACADEMY_LESSON_LISTEN_PLAYBACK_RATE,
): number {
  const words = academyListenWordCount(text);
  if (words <= 0) {
    return 0;
  }
  const rate = playbackRate > 0 ? playbackRate : ACADEMY_LESSON_LISTEN_PLAYBACK_RATE;
  return (words * ACADEMY_LISTEN_MIN_MS_PER_WORD) / 1000 / rate;
}

/** Sahne (perde) duvar saati — okuma hızı + asgari milisaniye. */
export function academyListenSceneDurationMs(
  text: string,
  playbackRate: number = ACADEMY_LESSON_LISTEN_PLAYBACK_RATE,
): number {
  const words = academyListenWordCount(text);
  if (words <= 0) {
    return 0;
  }
  const readingMs = academyListenReadingDurationSec(text, playbackRate) * 1000;
  return Math.max(readingMs, ACADEMY_LISTEN_MIN_SCENE_MS);
}

export function academyListenSlicesReadingDurationSec(
  slices: readonly { text: string; speaker: AcademyStudioSpeechSpeaker }[],
): number {
  return slices.reduce(
    (sum, slice) =>
      sum + academyListenReadingDurationSec(slice.text, academyListenPlaybackRateForSpeaker(slice.speaker)),
    0,
  );
}

export function formatAcademyListenTextDurationHeader(sec: number): string {
  if (!Number.isFinite(sec) || sec <= 0) {
    return "0";
  }
  return String(Math.round(sec * 10) / 10);
}

export function parseAcademyListenTextDurationHeader(value: string | null | undefined): number {
  if (!value?.trim()) {
    return 0;
  }
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function isAcademyListenShortFallbackPart(audioSec: number): boolean {
  return Number.isFinite(audioSec) && audioSec > 0 && audioSec <= ACADEMY_LISTEN_FALLBACK_AUDIO_MAX_SEC;
}

export function isAcademyListenFallbackFullAudio(audioSec: number, textSec: number): boolean {
  if (!(textSec > 0) || !(audioSec > 0)) {
    return false;
  }
  if (isAcademyListenShortFallbackPart(audioSec)) {
    return true;
  }
  return audioSec < textSec * ACADEMY_LISTEN_FALLBACK_DURATION_RATIO;
}

export function isAcademyListenFallbackHeader(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

/** Bellek / Supabase satırı gerçek Gemini stüdyo sesi mi? Mock ve demo yedekleri değil. */
export function isAcademyListenStudioAudio(cached: {
  usedFallback?: boolean;
  model: string;
}): boolean {
  if (cached.usedFallback) {
    return false;
  }
  const model = cached.model.trim().toLowerCase();
  return model.length > 0 && !model.startsWith("fallback");
}

export function isAcademyListenQuotaReason(reason: string): boolean {
  return (
    reason === "gemini-quota" ||
    reason === "user-quota" ||
    reason === "rate-limit" ||
    reason === "platform-cap"
  );
}

export function isAcademyListenSoftSpeechFail(reason: string): boolean {
  return (
    reason === "gemini-quota" ||
    reason === "gemini-bad-request" ||
    reason === "gemini-upstream" ||
    reason === "gemini-timeout" ||
    reason === "rate-limit" ||
    reason === "user-quota" ||
    reason === "platform-cap"
  );
}

export function isAcademyListenHardSpeechFail(reason: string): boolean {
  return (
    reason === "VOICE_BINDING_UNAVAILABLE" ||
    reason === "missing-or-invalid-api-key" ||
    reason === "gemini-auth-failed" ||
    reason === "empty-text" ||
    reason === "empty-spoken-text"
  );
}

/** Gemini TTS ağ kesisi — `AbortError` / abort sinyali. */
export function isAcademyListenAbortError(error: unknown): boolean {
  if (error && typeof error === "object" && "name" in error && (error as { name: string }).name === "AbortError") {
    return true;
  }
  const message = error instanceof Error ? error.message : String(error);
  return /AbortError|the operation was aborted|signal is aborted/i.test(message);
}

export function academyListenSoftFallbackAudio(): {
  mimeType: "audio/wav";
  audioBytes: Uint8Array;
  parts: readonly Uint8Array[];
  model: string;
  usedFallback: true;
} {
  return {
    mimeType: "audio/wav",
    audioBytes: new Uint8Array(0),
    parts: [],
    model: "fallback-local",
    usedFallback: true,
  };
}

export function parseAcademyListenSpeakersHeader(
  value: string | null | undefined,
): AcademyStudioSpeechSpeaker[] {
  if (!value?.trim()) {
    return [];
  }
  const allowed = new Set<string>(["announcer", "moderator", "instructor"]);
  return value
    .split(",")
    .map((part) => part.trim())
    .filter((part): part is AcademyStudioSpeechSpeaker => allowed.has(part));
}

export function splitAcademyStudioSpeechTurns(spoken: string): AcademyStudioSpeechTurn[] {
  const text = spoken.replace(/\s+/gu, " ").trim();
  if (!text) {
    return [];
  }
  const spans = collectAcademyModeratorSpeechSpans(text);
  if (spans.length === 0) {
    return [{ speaker: "instructor", text }];
  }
  const turns: AcademyStudioSpeechTurn[] = [];
  function push(speaker: AcademyStudioSpeechSpeaker, slice: string): void {
    const trimmed = slice.replace(/\s+/gu, " ").trim();
    if (!trimmed) {
      return;
    }
    const last = turns[turns.length - 1];
    if (last && last.speaker === speaker) {
      last.text = `${last.text} ${trimmed}`;
      return;
    }
    turns.push({ speaker, text: trimmed });
  }
  let cursor = 0;
  for (const span of spans) {
    if (span.start < cursor) {
      continue;
    }
    push("instructor", text.slice(cursor, span.start));
    push("moderator", text.slice(span.start, span.end));
    cursor = span.end;
  }
  push("instructor", text.slice(cursor));
  return turns;
}

/**
 * Gemini TTS’e giden konuşma sırası — anons, nezaket, başlık, gövde.
 * Ekran kartları `buildAcademyLessonListenScript` ile aynı diziyi okur.
 */
export function academyLessonListenPreparedTurns(
  title: string,
  body: string,
  courseSlug?: string,
): AcademyStudioSpeechTurn[] {
  const spokenBody = cleanAcademySpokenTextForTts(spokenAcademyLessonBody(body));
  const turns = ensureAcademyInstructorCourtesyTurns(
    splitAcademyStudioSpeechTurns(spokenBody),
    ACADEMY_MODERATOR.name,
  );
  const lessonTitle = title.trim();
  let titledInstructor = false;
  const prepared = turns.map((turn) => {
    if (turn.speaker !== "instructor" || titledInstructor || !lessonTitle) {
      return turn;
    }
    titledInstructor = true;
    return {
      speaker: turn.speaker,
      text: insertAcademyLessonTitleAfterCourtesy(turn.text, lessonTitle),
    };
  });
  if (!titledInstructor && lessonTitle) {
    prepared.unshift({
      speaker: "instructor",
      text: insertAcademyLessonTitleAfterCourtesy(
        academyInstructorCourtesyHandoff(ACADEMY_MODERATOR.name),
        lessonTitle,
      ),
    });
  }
  prepared.unshift({
    speaker: "announcer",
    text: academyAnnouncerLessonCue(lessonTitle, courseSlug),
  });
  return prepared;
}

export function academyLessonListenSpeechSlices(
  title: string,
  body: string,
  instructor: AcademyInstructor,
  courseSlug?: string,
): AcademyLessonListenSpeechSlice[] {
  const prepared = academyLessonListenPreparedTurns(title, body, courseSlug);
  const slices: AcademyLessonListenSpeechSlice[] = [];
  let isFirstAudioChunk = true;
  for (const turn of prepared) {
    const maxChars = isFirstAudioChunk
      ? ACADEMY_LESSON_LISTEN_FIRST_CHUNK_CHARS
      : ACADEMY_LESSON_LISTEN_CHUNK_CHARS;
    for (const chunk of splitSpokenTextForTts(turn.text, maxChars)) {
      if (turn.speaker === "announcer") {
        slices.push(
          academyLessonListenSpeechSlice({
            speaker: "announcer",
            voiceName: ACADEMY_ANNOUNCER.voice,
            text: wrapAcademyAnnouncerTtsPrompt(chunk),
            instruction: academyAnnouncerTtsInstruction(),
          }),
        );
      } else if (turn.speaker === "moderator") {
        slices.push(
          academyLessonListenSpeechSlice({
            speaker: "moderator",
            voiceName: ACADEMY_MODERATOR.voice,
            text: wrapAcademyModeratorTtsPrompt(chunk, ACADEMY_MODERATOR.name),
            instruction: academyModeratorTtsInstruction(ACADEMY_MODERATOR.name),
          }),
        );
      } else {
        slices.push(
          academyLessonListenSpeechSlice({
            speaker: "instructor",
            voiceName: instructor.voice,
            text: wrapAcademyLessonTtsPrompt(chunk, instructor.name),
            instruction: academyLessonListenTtsInstruction(instructor.name),
          }),
        );
      }
      isFirstAudioChunk = false;
    }
  }
  return slices;
}

/**
 * Ses gümrüğü: görsel perde etiketleri (`Giriş / Problem` vb.) buraya gelmeden
 * `spokenAcademyLessonSegment` köprü cümlesine çevrilir. Odak çizelgesi aynı fonksiyonu kullanır.
 */
export {
  ACADEMY_LESSON_ACT_SPOKEN_BRIDGES,
  spokenAcademyLessonActBridge,
} from "@/archived/lib/academy-studio/mentor-voice";
