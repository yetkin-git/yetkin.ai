/**
 * Akademi ders sesi — Supabase cache-first.
 * Okuma: Prisma `academy_audio_cache` → Storage public URL (Gemini yok).
 * Yazma: miss sonrası Storage `lesson-audios` + Prisma locator.
 * Kota / 50x: `demo/fallback.wav`; canlı API'ye retry yok.
 */

import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getPrisma, prismaErrorLabel } from "@/lib/kernel/db";
import { logEvent } from "@/lib/kernel/observability/log";

export const ACADEMY_LISTEN_STORAGE_BUCKET = "lesson-audios" as const;
export const ACADEMY_LISTEN_DEMO_OBJECT_PATH = "demo/fallback.wav" as const;
export const ACADEMY_LISTEN_DEMO_CACHE_KEY = "demo:fallback" as const;
export const ACADEMY_LISTEN_AUDIO_MAX_BYTES = 20 * 1024 * 1024;

export type AcademyListenDurableHit = {
  cacheKey: string;
  publicUrl: string;
  mimeType: "audio/wav";
  objectPath: string;
  model: string;
};

export type AcademyListenDurablePersistInput = {
  cacheKey: string;
  courseSlug: string;
  lessonKey: string;
  audioBytes: Uint8Array;
  mimeType: "audio/wav";
  model: string;
  accessToken?: string | null;
};

export type AcademyListenDurableCachePort = {
  lookup(cacheKey: string): Promise<AcademyListenDurableHit | null>;
  persist(input: AcademyListenDurablePersistInput): Promise<AcademyListenDurableHit | null>;
  lookupDemo(): Promise<AcademyListenDurableHit | null>;
  persistDemo(input: {
    audioBytes: Uint8Array;
    accessToken?: string | null;
  }): Promise<AcademyListenDurableHit | null>;
};

export function academyListenStorageObjectPath(
  courseSlug: string,
  lessonKey: string,
  cacheKey: string,
): string {
  const digest = cacheKey.split(":").at(-1)?.replace(/[^a-f0-9]/giu, "").slice(0, 32) || "clip";
  return `lessons/${courseSlug}/${lessonKey}/${digest}.wav`;
}

export function academyListenPublicUrl(objectPath: string, supabaseUrl?: string | null): string | null {
  const base = (supabaseUrl ?? process.env.NEXT_PUBLIC_SUPABASE_URL)?.trim().replace(/\/$/u, "");
  if (!base) {
    return null;
  }
  return `${base}/storage/v1/object/public/${ACADEMY_LISTEN_STORAGE_BUCKET}/${objectPath}`;
}

function isUniqueViolation(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: unknown }).code === "P2002",
  );
}

function supabaseEnv(): { url: string; anon: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) {
    return null;
  }
  return { url, anon };
}

function createStorageClient(accessToken?: string | null) {
  const env = supabaseEnv();
  if (!env) {
    return null;
  }
  return createClient(env.url, env.anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    ...(accessToken
      ? { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
      : {}),
  });
}

function rowToHit(row: {
  cacheKey: string;
  publicUrl: string;
  mimeType: string;
  objectPath: string;
  model: string;
}): AcademyListenDurableHit | null {
  if (row.mimeType !== "audio/wav" || !row.publicUrl.trim()) {
    return null;
  }
  return {
    cacheKey: row.cacheKey,
    publicUrl: row.publicUrl,
    mimeType: "audio/wav",
    objectPath: row.objectPath,
    model: row.model,
  };
}

async function lookupRow(cacheKey: string): Promise<AcademyListenDurableHit | null> {
  try {
    const row = await getPrisma().academyAudioCache.findUnique({
      where: { cacheKey },
    });
    return row ? rowToHit(row) : null;
  } catch (error) {
    logEvent({
      level: "warn",
      event: "academy.listen.cache",
      reason: `lookup-failed:${prismaErrorLabel(error)}`.slice(0, 480),
      route: "academy.lesson.listen",
    });
    return null;
  }
}

async function upsertRow(input: {
  cacheKey: string;
  courseSlug: string;
  lessonKey: string;
  objectPath: string;
  publicUrl: string;
  mimeType: "audio/wav";
  byteSize: number;
  model: string;
}): Promise<AcademyListenDurableHit | null> {
  const prisma = getPrisma();
  const data = {
    courseSlug: input.courseSlug,
    lessonKey: input.lessonKey,
    bucket: ACADEMY_LISTEN_STORAGE_BUCKET,
    objectPath: input.objectPath,
    publicUrl: input.publicUrl,
    mimeType: input.mimeType,
    byteSize: input.byteSize,
    model: input.model,
  };
  try {
    const row = await prisma.academyAudioCache.upsert({
      where: { cacheKey: input.cacheKey },
      create: { cacheKey: input.cacheKey, ...data },
      update: data,
    });
    return rowToHit(row);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return lookupRow(input.cacheKey);
    }
    logEvent({
      level: "warn",
      event: "academy.listen.cache",
      reason: `persist-row-failed:${prismaErrorLabel(error)}`.slice(0, 480),
      route: "academy.lesson.listen",
    });
    return null;
  }
}

async function uploadWav(input: {
  objectPath: string;
  audioBytes: Uint8Array;
  accessToken?: string | null;
}): Promise<string | null> {
  if (input.audioBytes.byteLength === 0 || input.audioBytes.byteLength > ACADEMY_LISTEN_AUDIO_MAX_BYTES) {
    return null;
  }
  const client = createStorageClient(input.accessToken);
  if (!client) {
    logEvent({
      level: "warn",
      event: "academy.listen.cache",
      reason: "persist-upload-skipped:no-supabase-env",
      route: "academy.lesson.listen",
    });
    return null;
  }
  try {
    const { error } = await client.storage.from(ACADEMY_LISTEN_STORAGE_BUCKET).upload(
      input.objectPath,
      Buffer.from(input.audioBytes),
      {
        contentType: "audio/wav",
        upsert: true,
        cacheControl: "31536000",
      },
    );
    if (error) {
      console.error("TTS GENERATION ERROR:", error);
      logEvent({
        level: "warn",
        event: "academy.listen.cache",
        reason: `persist-upload-failed:${error.message}`.slice(0, 480),
        errorName: error.name,
        route: "academy.lesson.listen",
      });
      return null;
    }
    return academyListenPublicUrl(input.objectPath);
  } catch (error) {
    console.error("TTS GENERATION ERROR:", error);
    logEvent({
      level: "warn",
      event: "academy.listen.cache",
      reason: "persist-upload-threw",
      errorName: error instanceof Error ? error.name : "unknown",
      route: "academy.lesson.listen",
    });
    return null;
  }
}

export function createPrismaAcademyListenDurableCache(): AcademyListenDurableCachePort {
  return {
    lookup: lookupRow,
    async persist(input) {
      const objectPath = academyListenStorageObjectPath(
        input.courseSlug,
        input.lessonKey,
        input.cacheKey,
      );
      const publicUrl = await uploadWav({
        objectPath,
        audioBytes: input.audioBytes,
        accessToken: input.accessToken,
      });
      if (!publicUrl) {
        return null;
      }
      const hit = await upsertRow({
        cacheKey: input.cacheKey,
        courseSlug: input.courseSlug,
        lessonKey: input.lessonKey,
        objectPath,
        publicUrl,
        mimeType: "audio/wav",
        byteSize: input.audioBytes.byteLength,
        model: input.model,
      });
      if (hit) {
        logEvent({
          level: "info",
          event: "academy.listen.cache",
          reason: "persist",
          route: "academy.lesson.listen",
        });
      }
      return hit;
    },
    lookupDemo() {
      return lookupRow(ACADEMY_LISTEN_DEMO_CACHE_KEY);
    },
    async persistDemo(input) {
      const publicUrl = await uploadWav({
        objectPath: ACADEMY_LISTEN_DEMO_OBJECT_PATH,
        audioBytes: input.audioBytes,
        accessToken: input.accessToken,
      });
      if (!publicUrl) {
        return null;
      }
      return upsertRow({
        cacheKey: ACADEMY_LISTEN_DEMO_CACHE_KEY,
        courseSlug: "_demo",
        lessonKey: "fallback",
        objectPath: ACADEMY_LISTEN_DEMO_OBJECT_PATH,
        publicUrl,
        mimeType: "audio/wav",
        byteSize: input.audioBytes.byteLength,
        model: "fallback-local",
      });
    },
  };
}

export function createMemoryAcademyListenDurableCache(): AcademyListenDurableCachePort {
  const rows = new Map<string, AcademyListenDurableHit>();
  const persist = async (
    input: AcademyListenDurablePersistInput,
  ): Promise<AcademyListenDurableHit | null> => {
    if (input.audioBytes.byteLength === 0) {
      return null;
    }
    const objectPath =
      input.cacheKey === ACADEMY_LISTEN_DEMO_CACHE_KEY
        ? ACADEMY_LISTEN_DEMO_OBJECT_PATH
        : academyListenStorageObjectPath(input.courseSlug, input.lessonKey, input.cacheKey);
    const publicUrl =
      academyListenPublicUrl(objectPath, "https://example.supabase.co") ??
      `https://example.supabase.co/storage/v1/object/public/${ACADEMY_LISTEN_STORAGE_BUCKET}/${objectPath}`;
    const hit: AcademyListenDurableHit = {
      cacheKey: input.cacheKey,
      publicUrl,
      mimeType: "audio/wav",
      objectPath,
      model: input.model,
    };
    rows.set(input.cacheKey, hit);
    return hit;
  };
  return {
    async lookup(cacheKey) {
      return rows.get(cacheKey) ?? null;
    },
    persist,
    async lookupDemo() {
      return rows.get(ACADEMY_LISTEN_DEMO_CACHE_KEY) ?? null;
    },
    persistDemo(input) {
      return persist({
        cacheKey: ACADEMY_LISTEN_DEMO_CACHE_KEY,
        courseSlug: "_demo",
        lessonKey: "fallback",
        audioBytes: input.audioBytes,
        mimeType: "audio/wav",
        model: "fallback-local",
        accessToken: input.accessToken,
      });
    },
  };
}

const sharedPrismaDurable = createPrismaAcademyListenDurableCache();
let durableOverride: AcademyListenDurableCachePort | null = null;

export function getAcademyListenDurableCache(): AcademyListenDurableCachePort {
  return durableOverride ?? sharedPrismaDurable;
}

export function setAcademyListenDurableCacheForTests(
  port: AcademyListenDurableCachePort | null,
): void {
  durableOverride = port;
}
