import "server-only";

import { academyLessonByKey } from "@/lib/academy/curriculum";
import { academyInstructorBySlug } from "@/lib/academy/instructors";
import {
  loadAcademyCurriculumPlayer,
  type AcademyCurriculumPorts,
} from "@/lib/academy/curriculum-engine";
import {
  ACADEMY_LESSON_LISTEN_CHUNK_CONCURRENCY,
  ACADEMY_LESSON_LISTEN_CHUNK_TIMEOUT_RETRIES,
  ACADEMY_LESSON_LISTEN_ENABLED,
  ACADEMY_LESSON_LISTEN_LANGUAGE,
  ACADEMY_LESSON_LISTEN_MAX_CHARS,
  ACADEMY_LESSON_LISTEN_RATE_LIMIT,
  ACADEMY_LESSON_LISTEN_ROLE,
  ACADEMY_LESSON_LISTEN_SPEECH_TIMEOUT_MS,
  ACADEMY_LESSON_LISTEN_GATEWAY_MAX_ATTEMPTS,
  academyLessonListenSpeechSlices,
  encodeAcademyListenStreamEnd,
  encodeAcademyListenWavFrame,
  isAcademyListenHardSpeechFail,
  isAcademyListenSoftSpeechFail,
  isAcademyListenQuotaReason,
  isAcademyListenStudioAudio,
  academyListenSoftFallbackAudio,
  type AcademyLessonListenAudio,
  type AcademyLessonListenSpeechSlice,
} from "@/archived/lib/academy-studio/lesson-listen";
import {
  academyListenAudioCacheKey,
  academyListenCitizenMessage,
  clearAcademyListenInflight,
  getAcademyListenInflight,
  getSharedAcademyListenAudioCache,
  logAcademyListenFailure,
  setAcademyListenInflight,
  type AcademyListenCachedAudio,
  type AcademyListenCacheSource,
} from "@/archived/lib/academy-studio/listen-route";
import {
  getAcademyListenDurableCache,
  type AcademyListenDurableHit,
} from "@/archived/lib/academy-studio/listen-audio-store";
import { isAcademyCitizenTextClean } from "@/archived/lib/academy-studio/moderation";
import {
  ACADEMY_STUDIO_BEATS,
  academyStudioBeatSpeechSlices,
  consumeAcademyLiveAskRight,
  restoreAcademyLiveAskRight,
  type AcademyLiveAskSection,
  type AcademyStudioBeat,
} from "@/archived/lib/academy-studio/studio-live";
import { concatPcmWavBuffers } from "@/lib/kernel/ai/pcm-wav";
import {
  generateSpeech,
  isSpeechQuotaCooldownActive,
  type InvokeLlmDeps,
} from "@/lib/kernel/ai/llm-gateway";
import { isSpeechGatewayFail } from "@/lib/kernel/ai/types";
import { BadRequestError, ForbiddenError, GoneError, ServiceUnavailableError } from "@/lib/kernel/http/errors";
import { logEvent } from "@/lib/kernel/observability/log";
import { spokenAcademyLessonBody } from "@/lib/academy/lesson-body";

export type AcademyListenPorts = AcademyCurriculumPorts;

export type PrepareAcademyLessonListenCommand = {
  courseId: string;
  userId: string;
  email?: string | null;
  lessonKey: string;
  beat?: AcademyStudioBeat | null;
  sectionKey?: AcademyLiveAskSection | null;
  question?: string | null;
  accessToken?: string | null;
};

export type PreparedAcademyLessonListen = {
  cacheKey: string;
  slices: AcademyLessonListenSpeechSlice[];
  lessonKey: string;
  courseSlug: string;
  skipCache: boolean;
};

function cachedFromDurableHit(hit: AcademyListenDurableHit): AcademyListenCachedAudio {
  return {
    mimeType: "audio/wav",
    audioBytes: new Uint8Array(0),
    parts: [],
    model: hit.model,
    usedFallback: false,
    publicUrl: hit.publicUrl,
  };
}

async function persistGeneratedLessonAudio(
  prepared: PreparedAcademyLessonListen,
  cached: AcademyListenCachedAudio,
  accessToken?: string | null,
): Promise<AcademyListenCachedAudio> {
  if (
    prepared.skipCache ||
    cached.usedFallback ||
    !isAcademyListenStudioAudio(cached) ||
    cached.audioBytes.byteLength === 0
  ) {
    return cached;
  }
  try {
    const durable = await getAcademyListenDurableCache().persist({
      cacheKey: prepared.cacheKey,
      courseSlug: prepared.courseSlug,
      lessonKey: prepared.lessonKey,
      audioBytes: cached.audioBytes,
      mimeType: "audio/wav",
      model: cached.model,
      accessToken,
    });
    if (!durable) {
      return cached;
    }
    return { ...cached, publicUrl: durable.publicUrl };
  } catch (error) {
    console.error("TTS GENERATION ERROR:", error);
    logEvent({
      level: "warn",
      event: "academy.listen.cache",
      reason: "persist-threw-return-bytes",
      errorName: error instanceof Error ? error.name : "unknown",
      route: "academy.lesson.listen",
    });
    return cached;
  }
}

async function lookupDurableLessonAudio(
  cacheKey: string,
): Promise<AcademyListenCachedAudio | null> {
  const hit = await getAcademyListenDurableCache().lookup(cacheKey);
  if (!hit || !isAcademyListenStudioAudio(hit)) {
    return null;
  }
  return cachedFromDurableHit(hit);
}

function isStudioBeat(value: string | null | undefined): value is AcademyStudioBeat {
  return Boolean(value && (ACADEMY_STUDIO_BEATS as readonly string[]).includes(value));
}

async function mapPool<T, R>(
  items: readonly T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.max(1, Math.min(concurrency, items.length || 1)) }, async () => {
    while (next < items.length) {
      const index = next;
      next += 1;
      const item = items[index];
      if (item === undefined) {
        continue;
      }
      results[index] = await mapper(item, index);
    }
  });
  await Promise.all(workers);
  return results;
}

type AcademyListenSpeakSession = {
  skipGemini: boolean;
  loggedUpstream: boolean;
};

function createAcademyListenSpeakSession(): AcademyListenSpeakSession {
  return {
    skipGemini: isSpeechQuotaCooldownActive(),
    loggedUpstream: false,
  };
}

export function isAcademyListenSpeechFallbackActive(): boolean {
  return isSpeechQuotaCooldownActive();
}

type SpeakLessonChunkResult =
  | { ok: true; wav: Buffer }
  | { ok: false; reason: string };

function rejectStudioSpeechUnavailable(reason: string): never {
  throw new ServiceUnavailableError(academyListenCitizenMessage(reason));
}

function noteSoftSpeechFallback(session: AcademyListenSpeakSession, reason: string): void {
  session.skipGemini = true;
  if (reason === "gemini-quota") {
    return;
  }
  if (session.loggedUpstream) {
    return;
  }
  session.loggedUpstream = true;
  logEvent({
    level: "warn",
    event: "academy.listen.fallback_audio",
    reason,
    route: "academy.lesson.listen",
  });
}

function settleSpeakFailure(session: AcademyListenSpeakSession, reason: string): SpeakLessonChunkResult {
  noteSoftSpeechFallback(session, reason);
  if (isAcademyListenHardSpeechFail(reason)) {
    rejectStudioSpeechUnavailable(reason);
  }
  return { ok: false, reason };
}

async function speakLessonChunkWithTimeoutRetry(
  slice: AcademyLessonListenSpeechSlice,
  userId: string,
  deps: InvokeLlmDeps | undefined,
  session: AcademyListenSpeakSession,
): Promise<SpeakLessonChunkResult> {
  if (session.skipGemini || isSpeechQuotaCooldownActive()) {
    session.skipGemini = true;
    return { ok: false, reason: "gemini-quota" };
  }
  let lastFail = "gemini-upstream";
  const attempts = 1 + ACADEMY_LESSON_LISTEN_CHUNK_TIMEOUT_RETRIES;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    let outcome: Awaited<ReturnType<typeof generateSpeech>>;
    try {
      outcome = await generateSpeech(
        {
          provider: "gemini",
          role: ACADEMY_LESSON_LISTEN_ROLE,
          text: slice.text,
          instruction: slice.instruction,
          voiceName: slice.voiceName,
          languageCode: ACADEMY_LESSON_LISTEN_LANGUAGE,
          timeoutMs: ACADEMY_LESSON_LISTEN_SPEECH_TIMEOUT_MS,
          maxAttempts: ACADEMY_LESSON_LISTEN_GATEWAY_MAX_ATTEMPTS,
          rateLimit: {
            identifier: `academy-listen:${userId}`,
            scope: "academy.listen",
            limit: ACADEMY_LESSON_LISTEN_RATE_LIMIT,
          },
          billing: { userId, source: "academy" },
        },
        deps,
      );
    } catch (error) {
      console.error("TTS GENERATION ERROR:", error);
      lastFail = "gemini-upstream";
      return settleSpeakFailure(session, lastFail);
    }
    if (!outcome) {
      lastFail = "provider-error";
      break;
    }
    if (isSpeechGatewayFail(outcome)) {
      lastFail = outcome.reason;
      if (isAcademyListenQuotaReason(outcome.reason)) {
        return settleSpeakFailure(session, outcome.reason);
      }
      if (outcome.reason === "gemini-timeout" && attempt < attempts) {
        continue;
      }
      if (isAcademyListenSoftSpeechFail(outcome.reason) || isAcademyListenHardSpeechFail(outcome.reason)) {
        return settleSpeakFailure(session, outcome.reason);
      }
      break;
    }
    return { ok: true, wav: Buffer.from(outcome.dataBase64, "base64") };
  }
  return settleSpeakFailure(session, lastFail);
}

export async function prepareAcademyLessonListen(
  ports: AcademyListenPorts,
  command: PrepareAcademyLessonListenCommand,
): Promise<PreparedAcademyLessonListen> {
  if (!ACADEMY_LESSON_LISTEN_ENABLED) {
    throw new GoneError("Dersi dinle kapalı.");
  }
  const player = await loadAcademyCurriculumPlayer(ports, {
    courseId: command.courseId,
    userId: command.userId,
    email: command.email,
  });
  const lesson = player.lessons.find((row) => row.key === command.lessonKey);
  if (!lesson || !lesson.open) {
    throw new ForbiddenError("Ders dinletisi satın alma ve sıra kilidi ister.");
  }
  const seeded = academyLessonByKey(player.courseSlug, command.lessonKey);
  if (!seeded) {
    throw new ForbiddenError("Ders müfredatta yok.");
  }
  const instructor = academyInstructorBySlug(player.courseSlug);
  const spoken = spokenAcademyLessonBody(lesson.body);
  if (!spoken.trim()) {
    throw new BadRequestError(academyListenCitizenMessage("empty-spoken-text"));
  }
  if (spoken.length > ACADEMY_LESSON_LISTEN_MAX_CHARS) {
    throw new BadRequestError("Ders metni dinleme tavanını aşıyor.");
  }

  const beat = isStudioBeat(command.beat) ? command.beat : null;
  const sectionKey = command.sectionKey ?? "mantik";
  if (beat === "live-ask") {
    const question = command.question?.replace(/\s+/gu, " ").trim() ?? "";
    if (question && !isAcademyCitizenTextClean(question)) {
      restoreAcademyLiveAskRight(command.userId, player.courseId, command.lessonKey, sectionKey);
      logEvent({
        level: "warn",
        event: "academy.moderation.rejected",
        action: "question",
        reason: "policy-violation",
        route: "academy.lesson.listen",
        userId: command.userId,
      });
      throw new BadRequestError("policy-violation");
    }
    const first = consumeAcademyLiveAskRight(
      command.userId,
      player.courseId,
      command.lessonKey,
      sectionKey,
    );
    if (!first) {
      const slices = academyStudioBeatSpeechSlices({
        beat: "live-exhausted",
        instructor,
        body: lesson.body,
        section: sectionKey,
      });
      return {
        cacheKey: academyListenAudioCacheKey(player.courseSlug, command.lessonKey, `studio:${beat}`),
        slices,
        lessonKey: command.lessonKey,
        courseSlug: player.courseSlug,
        skipCache: true,
      };
    }
  }

  if (beat) {
    const slices = academyStudioBeatSpeechSlices({
      beat,
      instructor,
      body: lesson.body,
      section: sectionKey,
      question: command.question ?? undefined,
    });
    return {
      cacheKey: academyListenAudioCacheKey(player.courseSlug, command.lessonKey, `studio:${beat}:${sectionKey}`),
      slices,
      lessonKey: command.lessonKey,
      courseSlug: player.courseSlug,
      skipCache: true,
    };
  }

  const slices = academyLessonListenSpeechSlices(
    lesson.title,
    lesson.body,
    instructor,
    player.courseSlug,
  );
  const fingerprint = `${player.courseSlug}:${command.lessonKey}:${lesson.contentVersion}:${slices.length}`;
  return {
    cacheKey: academyListenAudioCacheKey(player.courseSlug, command.lessonKey, fingerprint),
    slices,
    lessonKey: command.lessonKey,
    courseSlug: player.courseSlug,
    skipCache: false,
  };
}

async function synthesizePrepared(
  prepared: PreparedAcademyLessonListen,
  userId: string,
  deps?: InvokeLlmDeps,
): Promise<AcademyListenCachedAudio & { usedFallback: boolean }> {
  const session = createAcademyListenSpeakSession();
  const slices = prepared.slices;
  if (slices.length === 0) {
    return {
      mimeType: "audio/wav",
      audioBytes: new Uint8Array(concatPcmWavBuffers([])),
      parts: [],
      model: "gemini-3.1-flash-tts-preview",
      usedFallback: false,
    };
  }
  const firstSlice = slices[0]!;
  const first = await speakLessonChunkWithTimeoutRetry(firstSlice, userId, deps, session);
  if (!first.ok) {
    return academyListenSoftFallbackAudio();
  }
  const rest = slices.slice(1);
  const restParts = await mapPool(rest, ACADEMY_LESSON_LISTEN_CHUNK_CONCURRENCY, async (slice) => {
    void slice.voiceName;
    return speakLessonChunkWithTimeoutRetry(slice, userId, deps, session);
  });
  const restWavs: Buffer[] = [];
  for (const part of restParts) {
    if (!part.ok) {
      return academyListenSoftFallbackAudio();
    }
    restWavs.push(part.wav);
  }
  const parts = [first.wav, ...restWavs];
  const merged = concatPcmWavBuffers(parts);
  return {
    mimeType: "audio/wav",
    audioBytes: new Uint8Array(merged),
    parts: parts.map((part) => new Uint8Array(part)),
    model: "gemini-3.1-flash-tts-preview",
    usedFallback: false,
  };
}

export async function peekAcademyLessonListenHot(
  prepared: PreparedAcademyLessonListen,
): Promise<{ cached: AcademyListenCachedAudio; source: "memory" | "supabase" } | null> {
  if (prepared.skipCache) {
    return null;
  }
  const cache = getSharedAcademyListenAudioCache();
  const memory = cache.get(prepared.cacheKey);
  if (memory && isAcademyListenStudioAudio(memory)) {
    return { cached: memory, source: memory.publicUrl ? "supabase" : "memory" };
  }
  const durable = await lookupDurableLessonAudio(prepared.cacheKey);
  if (durable) {
    cache.set(prepared.cacheKey, durable);
    logEvent({
      level: "info",
      event: "academy.listen.cache",
      reason: "hit-supabase",
      route: "academy.lesson.listen",
    });
    return { cached: durable, source: "supabase" };
  }
  return null;
}

export async function loadAcademyLessonListenAudio(
  ports: AcademyListenPorts,
  command: PrepareAcademyLessonListenCommand,
  deps?: InvokeLlmDeps,
): Promise<{
  cached: AcademyListenCachedAudio;
  cacheHit: boolean;
  cacheSource: AcademyListenCacheSource;
}> {
  const prepared = await prepareAcademyLessonListen(ports, command);
  const cache = getSharedAcademyListenAudioCache();
  if (!prepared.skipCache) {
    const hot = await peekAcademyLessonListenHot(prepared);
    if (hot) {
      return { cached: hot.cached, cacheHit: true, cacheSource: hot.source };
    }
    const inflight = getAcademyListenInflight(prepared.cacheKey);
    if (inflight) {
      return { cached: await inflight, cacheHit: true, cacheSource: "memory" };
    }
  }
  if (!prepared.skipCache && isAcademyListenSpeechFallbackActive()) {
    return { cached: academyListenSoftFallbackAudio(), cacheHit: false, cacheSource: "miss" };
  }
  let resolveInflight: ((value: AcademyListenCachedAudio) => void) | undefined;
  let rejectInflight: ((reason: unknown) => void) | undefined;
  const pending = new Promise<AcademyListenCachedAudio>((resolve, reject) => {
    resolveInflight = resolve;
    rejectInflight = reject;
  });
  pending.catch(() => undefined);
  if (!prepared.skipCache) {
    setAcademyListenInflight(prepared.cacheKey, pending);
  }
  try {
    const synthesized = await synthesizePrepared(prepared, command.userId, deps);
    const cached = await persistGeneratedLessonAudio(
      prepared,
      synthesized,
      command.accessToken,
    );
    if (!prepared.skipCache && isAcademyListenStudioAudio(cached)) {
      cache.set(prepared.cacheKey, cached);
    }
    resolveInflight?.(cached);
    return { cached, cacheHit: false, cacheSource: "miss" };
  } catch (error) {
    console.error("TTS GENERATION ERROR:", error);
    rejectInflight?.(error);
    const reason = error instanceof Error ? error.message : "provider-error";
    logAcademyListenFailure({ reason });
    throw error;
  } finally {
    if (!prepared.skipCache) {
      clearAcademyListenInflight(prepared.cacheKey);
    }
  }
}

export async function* streamAcademyLessonListenParts(
  ports: AcademyListenPorts,
  command: PrepareAcademyLessonListenCommand,
  deps?: InvokeLlmDeps,
): AsyncGenerator<Uint8Array> {
  const prepared = await prepareAcademyLessonListen(ports, command);
  const cache = getSharedAcademyListenAudioCache();
  if (!prepared.skipCache) {
    const hot = await peekAcademyLessonListenHot(prepared);
    if (hot?.cached.publicUrl && hot.cached.parts.length === 0) {
      yield encodeAcademyListenStreamEnd();
      return;
    }
    if (hot?.cached.parts.length) {
      for (const part of hot.cached.parts) {
        yield encodeAcademyListenWavFrame(part);
      }
      yield encodeAcademyListenStreamEnd();
      return;
    }
  }
  if (isAcademyListenSpeechFallbackActive()) {
    yield encodeAcademyListenStreamEnd();
    return;
  }
  const parts: Uint8Array[] = [];
  const session = createAcademyListenSpeakSession();
  const slices = prepared.slices;
  if (slices.length === 0) {
    yield encodeAcademyListenStreamEnd();
    return;
  }

  try {
    const inflight = new Map<number, Promise<SpeakLessonChunkResult>>();
    const kick = (index: number) => {
      if (index < 0 || index >= slices.length || inflight.has(index)) {
        return;
      }
      const slice = slices[index]!;
      void slice.voiceName;
      inflight.set(
        index,
        speakLessonChunkWithTimeoutRetry(slice, command.userId, deps, session).catch((error: unknown) => {
          console.error("TTS GENERATION ERROR:", error);
          session.skipGemini = true;
          return { ok: false as const, reason: "gemini-upstream" };
        }),
      );
    };
    kick(0);
    const first = await inflight.get(0)!;
    if (!first.ok) {
      yield encodeAcademyListenStreamEnd();
      return;
    }
    const firstBytes = new Uint8Array(first.wav);
    parts.push(firstBytes);
    yield encodeAcademyListenWavFrame(firstBytes);
    for (let i = 1; i < Math.min(slices.length, ACADEMY_LESSON_LISTEN_CHUNK_CONCURRENCY); i += 1) {
      kick(i);
    }
    for (let index = 1; index < slices.length; index += 1) {
      if (session.skipGemini) {
        break;
      }
      kick(index);
      kick(index + 1);
      kick(index + 2);
      const next = await inflight.get(index)!;
      if (!next.ok) {
        session.skipGemini = true;
        break;
      }
      const bytes = new Uint8Array(next.wav);
      parts.push(bytes);
      yield encodeAcademyListenWavFrame(bytes);
    }
    await Promise.allSettled([...inflight.values()]);
    if (!prepared.skipCache && parts.length > 0 && !session.skipGemini) {
      const merged = concatPcmWavBuffers(parts.map((part) => Buffer.from(part)));
      const synthesized: AcademyListenCachedAudio = {
        mimeType: "audio/wav",
        audioBytes: new Uint8Array(merged),
        parts,
        model: "gemini-3.1-flash-tts-preview",
        usedFallback: false,
      };
      if (isAcademyListenStudioAudio(synthesized)) {
        cache.set(prepared.cacheKey, synthesized);
      }
      yield encodeAcademyListenStreamEnd();
      void persistGeneratedLessonAudio(prepared, synthesized, command.accessToken)
        .then((cached) => {
          if (cached.publicUrl && isAcademyListenStudioAudio(cached)) {
            cache.set(prepared.cacheKey, cached);
          }
        })
        .catch((error) => {
          console.error("TTS GENERATION ERROR:", error);
        });
      return;
    }
    yield encodeAcademyListenStreamEnd();
  } catch (error) {
    console.error("TTS GENERATION ERROR:", error);
    yield encodeAcademyListenStreamEnd();
  }
}

export type { AcademyLessonListenAudio };
