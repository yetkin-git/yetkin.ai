import { describe, expect, it } from "vitest";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import { lockAcademyCoursePrice, purchaseAcademyCourse } from "@/lib/academy/engine";
import {
  completeAcademyLesson,
  loadAcademyCurriculumPlayer,
} from "@/lib/academy/curriculum-engine";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { ForbiddenError } from "@/lib/kernel/http/errors";
import { createMemoryLedgerStore } from "../helpers/memory-money";
import { createMemoryAcademyStore, memoryCourse, memoryExam } from "../helpers/memory-academy";
import {
  createMemoryCheckoutPriceLockStore,
  createMemoryPriceCatalogStore,
} from "../helpers/memory-pricing";

const BUYER = "curriculum-buyer";
const PLATFORM = PLATFORM_TREASURY_USER_ID;

function world() {
  const course = memoryCourse();
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

describe("akademi müfredat oynatıcısı", () => {
  it("SETTLED olmadan ders gövdesi açılmaz", async () => {
    const ctx = world();
    await ctx.ports.academy.insertCourse(ctx.course);
    await expect(
      loadAcademyCurriculumPlayer(ctx.ports, { courseId: ctx.course.id, userId: BUYER }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("satın alma sonrası sırayla tamamlar; atlanan ders kapanır", async () => {
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
    const lessons = curriculumForCourseSlug(ctx.course.slug);
    expect(lessons.length).toBeGreaterThanOrEqual(3);
    await expect(
      completeAcademyLesson(ctx.ports, {
        courseId: ctx.course.id,
        userId: BUYER,
        lessonKey: lessons[2]!.key,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);

    const first = await completeAcademyLesson(ctx.ports, {
      courseId: ctx.course.id,
      userId: BUYER,
      lessonKey: lessons[0]!.key,
    });
    expect(first.applied).toBe(true);
    expect(first.player.lessons[0]?.body.length).toBeGreaterThan(20);
    const replay = await completeAcademyLesson(ctx.ports, {
      courseId: ctx.course.id,
      userId: BUYER,
      lessonKey: lessons[0]!.key,
    });
    expect(replay.applied).toBe(false);
  });
});
