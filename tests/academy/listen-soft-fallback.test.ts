import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/archived/lib/academy-studio/lesson-listen", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/archived/lib/academy-studio/lesson-listen")>();
  return { ...actual, ACADEMY_LESSON_LISTEN_ENABLED: true };
});

import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import { lockAcademyCoursePrice, purchaseAcademyCourse } from "@/lib/academy/engine";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { composeAcademyLessonBlocks } from "@/lib/academy/lesson-media";
import {
  loadAcademyLessonListenAudio,
  streamAcademyLessonListenParts,
} from "@/archived/lib/academy-studio/lesson-listen-engine";
import {
  academyListenSoftFallbackResponse,
  resetSharedAcademyListenAudioCacheForTests,
} from "@/archived/lib/academy-studio/listen-route";
import {
  createMemoryAcademyListenDurableCache,
  setAcademyListenDurableCacheForTests,
} from "@/archived/lib/academy-studio/listen-audio-store";
import {
  ACADEMY_LISTEN_FALLBACK_HEADER,
  ACADEMY_LISTEN_FALLBACK_KIND_LOCAL,
  ACADEMY_LISTEN_MIN_MS_PER_WORD,
  ACADEMY_LISTEN_MIN_SCENE_MS,
  academyListenSceneDurationMs,
  encodeAcademyListenStreamEnd,
  isAcademyListenSoftSpeechFail,
} from "@/archived/lib/academy-studio/lesson-listen";
import {
  academyListenFrozenElapsedSec,
  academyListenScriptDurationSec,
  activeAcademyListenScriptCardIndexAtElapsed,
  buildAcademyLessonListenScript,
} from "@/archived/lib/academy-studio/lesson-listen-script";
import { resetSpeechGatewayCooldownForTests } from "@/lib/kernel/ai/llm-gateway";
import { createMemoryBudgetShieldPort } from "@/lib/kernel/ai/budget-shield";
import type { LlmProviderAdapter } from "@/lib/kernel/ai/types";
import { createMemoryLedgerStore } from "../helpers/memory-money";
import { createMemoryAcademyStore, memoryCourse, memoryExam } from "../helpers/memory-academy";
import {
  createMemoryCheckoutPriceLockStore,
  createMemoryPriceCatalogStore,
} from "../helpers/memory-pricing";

const BUYER = "listen-soft-fallback-buyer";
const PLATFORM = PLATFORM_TREASURY_USER_ID;

function world() {
  const course = memoryCourse({
    slug: "python-temel",
    catalogUnitKey: "course:python-temel",
    title: "Python ile Sıfırdan Programlama ve Problem Çözme",
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

function quotaSpeech(): LlmProviderAdapter {
  return {
    id: "gemini",
    async complete() {
      return {
        text: "mühür",
        usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
      };
    },
    async generateSpeech() {
      throw Object.assign(new Error("RESOURCE_EXHAUSTED 429 quota"), { status: 429 });
    },
  };
}

function badRequestSpeech(): LlmProviderAdapter {
  return {
    id: "gemini",
    async complete() {
      return {
        text: "mühür",
        usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
      };
    },
    async generateSpeech() {
      throw Object.assign(new Error("INVALID_ARGUMENT systemInstruction not supported"), {
        status: 400,
      });
    },
  };
}

describe("dersi dinle yumuşak TTS düşüşü", () => {
  afterEach(() => {
    resetSharedAcademyListenAudioCacheForTests();
    setAcademyListenDurableCacheForTests(null);
    resetSpeechGatewayCooldownForTests();
  });

  it("400/429/503 reason'ları yumuşak düşüştür", () => {
    expect(isAcademyListenSoftSpeechFail("gemini-quota")).toBe(true);
    expect(isAcademyListenSoftSpeechFail("gemini-bad-request")).toBe(true);
    expect(isAcademyListenSoftSpeechFail("gemini-upstream")).toBe(true);
    expect(ACADEMY_LISTEN_MIN_MS_PER_WORD).toBe(420);
    expect(academyListenSceneDurationMs("bir iki üç")).toBeGreaterThanOrEqual(
      ACADEMY_LISTEN_MIN_SCENE_MS,
    );
  });

  it("429 kotasında load 503 fırlatmaz; usedFallback döner", async () => {
    const ctx = await settledPlayer();
    const durable = createMemoryAcademyListenDurableCache();
    setAcademyListenDurableCacheForTests(durable);
    const result = await loadAcademyLessonListenAudio(
      ctx.ports,
      { courseId: ctx.course.id, userId: BUYER, lessonKey: ctx.lessonKey },
      { providers: { gemini: quotaSpeech() }, budgetPort: createMemoryBudgetShieldPort() },
    );
    expect(result.cached.usedFallback).toBe(true);
    expect(result.cached.audioBytes.byteLength).toBe(0);
  });

  it("429 kotasında load RetryInfo beklemez; milisaniyeler içinde döner", async () => {
    const ctx = await settledPlayer();
    let calls = 0;
    const stickyQuota: LlmProviderAdapter = {
      id: "gemini",
      async complete() {
        return {
          text: "mühür",
          usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
        };
      },
      async generateSpeech() {
        calls += 1;
        if (calls > 1) {
          await new Promise((resolve) => {
            setTimeout(resolve, 37_900);
          });
        }
        throw Object.assign(new Error("RESOURCE_EXHAUSTED 429 Please retry in 37.91s"), {
          status: 429,
        });
      },
    };
    const started = Date.now();
    const result = await loadAcademyLessonListenAudio(
      ctx.ports,
      { courseId: ctx.course.id, userId: BUYER, lessonKey: ctx.lessonKey },
      { providers: { gemini: stickyQuota }, budgetPort: createMemoryBudgetShieldPort() },
    );
    const elapsedMs = Date.now() - started;
    expect(result.cached.usedFallback).toBe(true);
    expect(calls).toBe(1);
    expect(elapsedMs).toBeLessThan(400);
  });

  it("400 INVALID_ARGUMENT load 503 fırlatmaz", async () => {
    const ctx = await settledPlayer();
    const result = await loadAcademyLessonListenAudio(
      ctx.ports,
      { courseId: ctx.course.id, userId: BUYER, lessonKey: ctx.lessonKey },
      { providers: { gemini: badRequestSpeech() }, budgetPort: createMemoryBudgetShieldPort() },
    );
    expect(result.cached.usedFallback).toBe(true);
  });

  it("429 stream unhandledRejection basmaz; uç kare ile kapanır", async () => {
    const ctx = await settledPlayer();
    const rejections: unknown[] = [];
    const onUnhandled = (reason: unknown) => {
      rejections.push(reason);
    };
    process.on("unhandledRejection", onUnhandled);
    try {
      const frames: Uint8Array[] = [];
      for await (const frame of streamAcademyLessonListenParts(
        ctx.ports,
        { courseId: ctx.course.id, userId: BUYER, lessonKey: ctx.lessonKey },
        { providers: { gemini: quotaSpeech() }, budgetPort: createMemoryBudgetShieldPort() },
      )) {
        frames.push(frame);
      }
      expect(rejections).toHaveLength(0);
      expect(frames.length).toBeGreaterThanOrEqual(1);
      const end = encodeAcademyListenStreamEnd();
      const last = frames[frames.length - 1]!;
      expect(last.byteLength).toBe(end.byteLength);
    } finally {
      process.off("unhandledRejection", onUnhandled);
    }
  });

  it("yumuşak düşüş HTTP 200 + fallback başlığı basar; 503 değil", () => {
    const response = academyListenSoftFallbackResponse({
      speakers: "announcer,moderator",
      textDurationSec: 42,
    });
    expect(response.status).toBe(200);
    expect(response.headers.get(ACADEMY_LISTEN_FALLBACK_HEADER)).toBe(ACADEMY_LISTEN_FALLBACK_KIND_LOCAL);
  });
});

describe("ders dinleme sahne saati", () => {
  it("11 sn kısa WAV tüm perdeleri yakmaz; elapsed script saniyesidir", () => {
    const lesson = curriculumForCourseSlug("python-temel")[1]!;
    const script = buildAcademyLessonListenScript({
      lessonKey: lesson.key,
      title: lesson.title,
      body: lesson.body,
      courseSlug: "python-temel",
      blocks: composeAcademyLessonBlocks(lesson),
    });
    const total = academyListenScriptDurationSec(script);
    expect(total).toBeGreaterThan(40);
    const atEleven = activeAcademyListenScriptCardIndexAtElapsed(script.cues, 11);
    const atEnd = activeAcademyListenScriptCardIndexAtElapsed(script.cues, total);
    expect(atEleven).not.toBeNull();
    expect(atEnd).not.toBeNull();
    expect(atEleven).not.toBe(atEnd);
    expect(atEleven).toBeLessThan(atEnd!);
  });

  it("pause ve ended currentTime artışını yemez", () => {
    expect(
      academyListenFrozenElapsedSec({
        phase: "playing",
        currentTime: 8,
        previousFrozen: 3,
        previousPhase: "playing",
      }),
    ).toBe(8);
    expect(
      academyListenFrozenElapsedSec({
        phase: "paused",
        currentTime: 40,
        previousFrozen: 8,
        previousPhase: "paused",
      }),
    ).toBe(8);
    expect(
      academyListenFrozenElapsedSec({
        phase: "ended",
        currentTime: 11,
        previousFrozen: 8,
        previousPhase: "ended",
      }),
    ).toBe(8);
    expect(
      academyListenFrozenElapsedSec({
        phase: "paused",
        currentTime: 8,
        previousFrozen: 3,
        previousPhase: "playing",
      }),
    ).toBe(8);
    expect(
      academyListenFrozenElapsedSec({
        phase: "paused",
        currentTime: 40,
        previousFrozen: 8,
        previousPhase: "paused",
        seekGeneration: 2,
        previousSeekGeneration: 1,
      }),
    ).toBe(40);
    expect(
      academyListenFrozenElapsedSec({
        phase: "paused",
        currentTime: 40,
        previousFrozen: 8,
        previousPhase: "paused",
        seekGeneration: 1,
        previousSeekGeneration: 1,
      }),
    ).toBe(8);
  });
});
