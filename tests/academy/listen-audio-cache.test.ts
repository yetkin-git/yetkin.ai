import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/archived/lib/academy-studio/lesson-listen", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/archived/lib/academy-studio/lesson-listen")>();
  return { ...actual, ACADEMY_LESSON_LISTEN_ENABLED: true };
});

import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import { lockAcademyCoursePrice, purchaseAcademyCourse } from "@/lib/academy/engine";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import {
  loadAcademyLessonListenAudio,
  prepareAcademyLessonListen,
} from "@/archived/lib/academy-studio/lesson-listen-engine";
import {
  academyListenPublicUrl,
  academyListenStorageObjectPath,
  ACADEMY_LISTEN_DEMO_OBJECT_PATH,
  ACADEMY_LISTEN_STORAGE_BUCKET,
  createMemoryAcademyListenDurableCache,
  setAcademyListenDurableCacheForTests,
} from "@/archived/lib/academy-studio/listen-audio-store";
import { resetSharedAcademyListenAudioCacheForTests } from "@/archived/lib/academy-studio/listen-route";
import { createSilentPcmWav } from "@/lib/kernel/ai/pcm-wav";
import { generateSpeech, resetSpeechGatewayCooldownForTests } from "@/lib/kernel/ai/llm-gateway";
import { createMemoryBudgetShieldPort } from "@/lib/kernel/ai/budget-shield";
import type { LlmProviderAdapter } from "@/lib/kernel/ai/types";
import { createMemoryLedgerStore } from "../helpers/memory-money";
import { createMemoryAcademyStore, memoryCourse, memoryExam } from "../helpers/memory-academy";
import {
  createMemoryCheckoutPriceLockStore,
  createMemoryPriceCatalogStore,
} from "../helpers/memory-pricing";

const BUYER = "listen-cache-buyer";
const PLATFORM = PLATFORM_TREASURY_USER_ID;

function world() {
  const course = memoryCourse({
    slug: "python-temel",
    catalogUnitKey: "course:python-temel",
    title: "Python ile Programlama ve Problem Çözme",
  });
  const ledger = createMemoryLedgerStore([
    { userId: BUYER, amountMinor: 100_000 },
    { userId: PLATFORM, amountMinor: 0 },
  ]);
  return {
    course,
    ports: {
      ledger,
      catalog: createMemoryPriceCatalogStore([
        { moduleKey: ACADEMY_MODULE_KEY, unitKey: course.catalogUnitKey, amountMinor: 25_000 },
      ]),
      locks: createMemoryCheckoutPriceLockStore(),
      academy: createMemoryAcademyStore(),
    },
  };
}

async function settledPlayer() {
  const ctx = world();
  await ctx.ports.academy.insertCourse(ctx.course);
  await ctx.ports.academy.insertExam(memoryExam(ctx.course.id));
  const locked = await lockAcademyCoursePrice(ctx.ports, { courseId: ctx.course.id, userId: BUYER });
  await purchaseAcademyCourse(ctx.ports, {
    courseId: ctx.course.id,
    userId: BUYER,
    lockId: locked.lock.id,
    platformUserId: PLATFORM,
  });
  const lessonKey = curriculumForCourseSlug(ctx.course.slug)[0]!.key;
  return { ...ctx, lessonKey };
}

function countingSpeech(onCall: () => void): LlmProviderAdapter {
  return {
    id: "gemini",
    async complete() {
      return {
        text: "mühür",
        usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
      };
    },
    async generateSpeech() {
      onCall();
      return {
        mimeType: "audio/wav",
        dataBase64: createSilentPcmWav(80).toString("base64"),
        usage: { promptTokens: 4, completionTokens: 1, totalTokens: 5 },
      };
    },
  };
}

describe("akademi dinleme Supabase cache-first", () => {
  afterEach(() => {
    resetSharedAcademyListenAudioCacheForTests();
    setAcademyListenDurableCacheForTests(null);
    resetSpeechGatewayCooldownForTests();
  });

  it("Storage path ve public URL lesson-audios CDN biçimindedir", () => {
    const path = academyListenStorageObjectPath(
      "python-temel",
      "python-temel-1",
      "python-temel:python-temel-1:abc123def",
    );
    expect(path).toBe("lessons/python-temel/python-temel-1/abc123def.wav");
    expect(ACADEMY_LISTEN_STORAGE_BUCKET).toBe("lesson-audios");
    expect(ACADEMY_LISTEN_DEMO_OBJECT_PATH).toBe("demo/fallback.wav");
    expect(academyListenPublicUrl(path, "https://abc.supabase.co")).toBe(
      "https://abc.supabase.co/storage/v1/object/public/lesson-audios/lessons/python-temel/python-temel-1/abc123def.wav",
    );
  });

  it("Supabase isabette Gemini TTS çağrılmaz; public URL döner", async () => {
    const ctx = await settledPlayer();
    const durable = createMemoryAcademyListenDurableCache();
    setAcademyListenDurableCacheForTests(durable);
    const command = {
      courseId: ctx.course.id,
      userId: BUYER,
      lessonKey: ctx.lessonKey,
    };
    const prepared = await prepareAcademyLessonListen(ctx.ports, command);
    const wav = new Uint8Array(createSilentPcmWav(120));
    const stored = await durable.persist({
      cacheKey: prepared.cacheKey,
      courseSlug: ctx.course.slug,
      lessonKey: ctx.lessonKey,
      audioBytes: wav,
      mimeType: "audio/wav",
      model: "gemini-3.1-flash-tts-preview",
    });
    expect(stored?.publicUrl).toContain("/lesson-audios/");

    let speechCalls = 0;
    const result = await loadAcademyLessonListenAudio(ctx.ports, command, {
      providers: { gemini: countingSpeech(() => { speechCalls += 1; }) },
      budgetPort: createMemoryBudgetShieldPort(),
    });
    expect(result.cacheHit).toBe(true);
    expect(result.cacheSource).toBe("supabase");
    expect(result.cached.publicUrl).toBe(stored?.publicUrl);
    expect(speechCalls).toBe(0);
  });

  it("ilk üretim Storage'a yazılır; ikinci istek Gemini'siz isabet eder", async () => {
    const ctx = await settledPlayer();
    const durable = createMemoryAcademyListenDurableCache();
    setAcademyListenDurableCacheForTests(durable);
    const command = {
      courseId: ctx.course.id,
      userId: BUYER,
      lessonKey: ctx.lessonKey,
    };
    let speechCalls = 0;
    const deps = {
      providers: { gemini: countingSpeech(() => { speechCalls += 1; }) },
      budgetPort: createMemoryBudgetShieldPort(),
    };
    const first = await loadAcademyLessonListenAudio(ctx.ports, command, deps);
    expect(first.cacheHit).toBe(false);
    expect(speechCalls).toBeGreaterThan(0);
    const prepared = await prepareAcademyLessonListen(ctx.ports, command);
    expect(await durable.lookup(prepared.cacheKey)).toBeTruthy();

    resetSharedAcademyListenAudioCacheForTests();
    const beforeSecond = speechCalls;
    const second = await loadAcademyLessonListenAudio(ctx.ports, command, deps);
    expect(second.cacheHit).toBe(true);
    expect(second.cacheSource).toBe("supabase");
    expect(second.cached.publicUrl).toContain("lesson-audios");
    expect(speechCalls).toBe(beforeSecond);
  });

  it("kota düşüşünde Gemini çağrılmaz; yumuşak düşüş (usedFallback) döner, 503 fırlatılmaz", async () => {
    const ctx = await settledPlayer();
    const durable = createMemoryAcademyListenDurableCache();
    setAcademyListenDurableCacheForTests(durable);
    await durable.persistDemo({ audioBytes: new Uint8Array(createSilentPcmWav(80)) });

    const quota: LlmProviderAdapter = {
      id: "gemini",
      async complete() {
        return {
          text: "mühür",
          usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
        };
      },
      async generateSpeech() {
        const error = new Error("RESOURCE_EXHAUSTED 429 quota");
        Object.assign(error, { status: 429 });
        throw error;
      },
    };
    await generateSpeech(
      {
        provider: "gemini",
        role: "VOICE_TTS",
        text: "kota tetik",
        billing: { userId: BUYER, source: "academy" },
      },
      { providers: { gemini: quota }, budgetPort: createMemoryBudgetShieldPort() },
    );

    let speechCalls = 0;
    const result = await loadAcademyLessonListenAudio(
      ctx.ports,
      { courseId: ctx.course.id, userId: BUYER, lessonKey: ctx.lessonKey },
      {
        providers: {
          gemini: countingSpeech(() => {
            speechCalls += 1;
            throw new Error("Gemini çağrılmamalı");
          }),
        },
        budgetPort: createMemoryBudgetShieldPort(),
      },
    );
    expect(speechCalls).toBe(0);
    expect(result.cached.usedFallback).toBe(true);
    expect(result.cached.model.startsWith("fallback")).toBe(true);
  });

  it("kota düşüşünde mühürlü Supabase stüdyo URL döner; Gemini çağrılmaz", async () => {
    const ctx = await settledPlayer();
    const durable = createMemoryAcademyListenDurableCache();
    setAcademyListenDurableCacheForTests(durable);
    const command = {
      courseId: ctx.course.id,
      userId: BUYER,
      lessonKey: ctx.lessonKey,
    };
    const prepared = await prepareAcademyLessonListen(ctx.ports, command);
    const stored = await durable.persist({
      cacheKey: prepared.cacheKey,
      courseSlug: ctx.course.slug,
      lessonKey: ctx.lessonKey,
      audioBytes: new Uint8Array(createSilentPcmWav(120)),
      mimeType: "audio/wav",
      model: "gemini-3.1-flash-tts-preview",
    });

    const quota: LlmProviderAdapter = {
      id: "gemini",
      async complete() {
        return {
          text: "mühür",
          usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
        };
      },
      async generateSpeech() {
        const error = new Error("RESOURCE_EXHAUSTED 429 quota");
        Object.assign(error, { status: 429 });
        throw error;
      },
    };
    await generateSpeech(
      {
        provider: "gemini",
        role: "VOICE_TTS",
        text: "kota tetik",
        billing: { userId: BUYER, source: "academy" },
      },
      { providers: { gemini: quota }, budgetPort: createMemoryBudgetShieldPort() },
    );

    let speechCalls = 0;
    const result = await loadAcademyLessonListenAudio(ctx.ports, command, {
      providers: {
        gemini: countingSpeech(() => {
          speechCalls += 1;
          throw new Error("Gemini çağrılmamalı");
        }),
      },
      budgetPort: createMemoryBudgetShieldPort(),
    });
    expect(speechCalls).toBe(0);
    expect(result.cacheHit).toBe(true);
    expect(result.cacheSource).toBe("supabase");
    expect(result.cached.publicUrl).toBe(stored?.publicUrl);
    expect(result.cached.usedFallback).toBeFalsy();
  });

  it("Storage persist fırlatırsa üretilen WAV yine döner; stüdyo kilitlenmez", async () => {
    const ctx = await settledPlayer();
    setAcademyListenDurableCacheForTests({
      async lookup() {
        return null;
      },
      async persist() {
        throw Object.assign(new Error("new row violates row-level security policy"), {
          name: "StorageApiError",
        });
      },
      async lookupDemo() {
        return null;
      },
      async persistDemo() {
        return null;
      },
    });
    let speechCalls = 0;
    const result = await loadAcademyLessonListenAudio(
      ctx.ports,
      { courseId: ctx.course.id, userId: BUYER, lessonKey: ctx.lessonKey },
      {
        providers: { gemini: countingSpeech(() => { speechCalls += 1; }) },
        budgetPort: createMemoryBudgetShieldPort(),
      },
    );
    expect(speechCalls).toBeGreaterThan(0);
    expect(result.cacheHit).toBe(false);
    expect(result.cached.audioBytes.byteLength).toBeGreaterThan(0);
    expect(result.cached.publicUrl).toBeUndefined();
    expect(result.cached.usedFallback).toBeFalsy();
  });
});
