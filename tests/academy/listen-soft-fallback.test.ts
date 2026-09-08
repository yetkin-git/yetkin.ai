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
import { loadAcademyLessonListenAudio } from "@/archived/lib/academy-studio/lesson-listen-engine";
import {
  academyListenSoftFallbackResponse,
  resetSharedAcademyListenAudioCacheForTests,
} from "@/archived/lib/academy-studio/listen-route";
import { setAcademyListenDurableCacheForTests } from "@/archived/lib/academy-studio/listen-audio-store";
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
import { createMemoryLedgerStore } from "../helpers/memory-money";
import { createMemoryAcademyStore, memoryCourse, memoryExam } from "../helpers/memory-academy";
import {
  createMemoryCheckoutPriceLockStore,
  createMemoryPriceCatalogStore,
} from "../helpers/memory-pricing";

const BUYER = "listen-soft-fallback-buyer";
const PLATFORM = PLATFORM_TREASURY_USER_ID;

describe("akademi soft fallback dinleme — boş müfredat", () => {
  afterEach(() => {
    resetSharedAcademyListenAudioCacheForTests();
    setAcademyListenDurableCacheForTests(null);
    resetSpeechGatewayCooldownForTests();
  });

  it("soft speech fail ve scene süresi yardımcıları durur", () => {
    expect(isAcademyListenSoftSpeechFail("gemini-quota")).toBe(true);
    expect(isAcademyListenSoftSpeechFail("ok")).toBe(false);
    expect(ACADEMY_LISTEN_FALLBACK_KIND_LOCAL).toBe("local-voice");
    expect(ACADEMY_LISTEN_FALLBACK_HEADER).toBeTruthy();
    expect(academyListenSceneDurationMs("bir iki üç")).toBeGreaterThanOrEqual(
      ACADEMY_LISTEN_MIN_SCENE_MS,
    );
    expect(ACADEMY_LISTEN_MIN_MS_PER_WORD).toBe(420);
    expect(encodeAcademyListenStreamEnd()).toBeInstanceOf(Uint8Array);
  });

  it("sentetik script süresi ve kart indeksi hesaplanır", () => {
    const body = Array.from({ length: 30 }, (_, i) => `Cümle ${i + 1}.`).join(" ");
    const script = buildAcademyLessonListenScript({
      lessonKey: "sample-course-1",
      title: "Örnek Ders",
      body,
      courseSlug: "sample-course",
      blocks: composeAcademyLessonBlocks({
        body,
        diagrams: [],
        microVideos: [],
      }),
    });
    expect(academyListenScriptDurationSec(script)).toBeGreaterThan(0);
    expect(activeAcademyListenScriptCardIndexAtElapsed(script.cues, 0)).toBe(0);
    expect(
      academyListenFrozenElapsedSec({
        phase: "paused",
        currentTime: 12,
        previousFrozen: 5,
        previousPhase: "paused",
      }),
    ).toBe(5);
    expect(
      academyListenFrozenElapsedSec({
        phase: "playing",
        currentTime: 12,
        previousFrozen: 5,
        previousPhase: "paused",
      }),
    ).toBe(12);
    const soft = academyListenSoftFallbackResponse({
      speakers: "instructor",
      textDurationSec: academyListenScriptDurationSec(script),
    });
    expect(soft.headers.get(ACADEMY_LISTEN_FALLBACK_HEADER)).toBeTruthy();
  });

  it("satın alma sonrası boş müfredatta dinleme yüklemesi fail-closed kapanır", async () => {
    const course = memoryCourse();
    const ports = {
      ledger: createMemoryLedgerStore([
        { userId: BUYER, amountMinor: 100_000 },
        { userId: PLATFORM, amountMinor: 0 },
      ]),
      catalog: createMemoryPriceCatalogStore([
        { moduleKey: ACADEMY_MODULE_KEY, unitKey: course.catalogUnitKey, amountMinor: 25_000 },
      ]),
      locks: createMemoryCheckoutPriceLockStore(),
      academy: createMemoryAcademyStore(),
    };
    await ports.academy.insertCourse(course);
    await ports.academy.insertExam(memoryExam(course.id));
    const locked = await lockAcademyCoursePrice(ports, { courseId: course.id, userId: BUYER });
    await purchaseAcademyCourse(ports, {
      courseId: course.id,
      userId: BUYER,
      lockId: locked.lock.id,
      platformUserId: PLATFORM,
    });
    expect(curriculumForCourseSlug(course.slug)).toEqual([]);
    await expect(
      loadAcademyLessonListenAudio(ports, {
        courseId: course.id,
        userId: BUYER,
        lessonKey: "sample-course-1",
      }),
    ).rejects.toThrow();
  });
});
