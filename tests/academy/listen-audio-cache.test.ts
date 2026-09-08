import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/archived/lib/academy-studio/lesson-listen", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/archived/lib/academy-studio/lesson-listen")>();
  return { ...actual, ACADEMY_LESSON_LISTEN_ENABLED: true };
});

import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import { lockAcademyCoursePrice, purchaseAcademyCourse } from "@/lib/academy/engine";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { prepareAcademyLessonListen } from "@/archived/lib/academy-studio/lesson-listen-engine";
import {
  academyListenPublicUrl,
  academyListenStorageObjectPath,
  ACADEMY_LISTEN_DEMO_OBJECT_PATH,
  ACADEMY_LISTEN_STORAGE_BUCKET,
  setAcademyListenDurableCacheForTests,
} from "@/archived/lib/academy-studio/listen-audio-store";
import { resetSharedAcademyListenAudioCacheForTests } from "@/archived/lib/academy-studio/listen-route";
import { resetSpeechGatewayCooldownForTests } from "@/lib/kernel/ai/llm-gateway";
import { createMemoryLedgerStore } from "../helpers/memory-money";
import { createMemoryAcademyStore, memoryCourse, memoryExam } from "../helpers/memory-academy";
import {
  createMemoryCheckoutPriceLockStore,
  createMemoryPriceCatalogStore,
} from "../helpers/memory-pricing";

const BUYER = "listen-cache-buyer";
const PLATFORM = PLATFORM_TREASURY_USER_ID;

describe("akademi dinleme Supabase cache-first — boş müfredat", () => {
  afterEach(() => {
    resetSharedAcademyListenAudioCacheForTests();
    setAcademyListenDurableCacheForTests(null);
    resetSpeechGatewayCooldownForTests();
  });

  it("Storage path ve public URL lesson-audios CDN biçimindedir", () => {
    const path = academyListenStorageObjectPath(
      "sample-course",
      "sample-course-1",
      "sample-course:sample-course-1:abc123def",
    );
    expect(path).toBe("lessons/sample-course/sample-course-1/abc123def.wav");
    expect(ACADEMY_LISTEN_STORAGE_BUCKET).toBe("lesson-audios");
    expect(ACADEMY_LISTEN_DEMO_OBJECT_PATH).toBe("demo/fallback.wav");
    expect(academyListenPublicUrl(path, "https://abc.supabase.co")).toBe(
      "https://abc.supabase.co/storage/v1/object/public/lesson-audios/lessons/sample-course/sample-course-1/abc123def.wav",
    );
  });

  it("satın alma sonrası boş müfredatta dinleme hazırlığı fail-closed kapanır", async () => {
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
      prepareAcademyLessonListen(ports, {
        courseId: course.id,
        userId: BUYER,
        lessonKey: "sample-course-1",
      }),
    ).rejects.toThrow();
  });
});
