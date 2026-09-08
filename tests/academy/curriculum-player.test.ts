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
import { ACADEMY_LESSON_LISTEN_ENABLED } from "@/lib/academy/lesson-listen";
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

  it("satın alma sonrası boş müfredatta ders tamamlanamaz", async () => {
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
    expect(curriculumForCourseSlug(ctx.course.slug)).toEqual([]);
    await expect(
      completeAcademyLesson(ctx.ports, {
        courseId: ctx.course.id,
        userId: BUYER,
        lessonKey: "sample-course-1",
      }),
    ).rejects.toThrow();
  });

  it("Faz 1: dinle bayrağı kapalı", () => {
    expect(ACADEMY_LESSON_LISTEN_ENABLED).toBe(false);
  });

  it("01_office_ai compact makale etkileşimli proof olmadan kapanır", async () => {
    const BUYER_OFFICE = "curriculum-office-buyer";
    const course = memoryCourse({
      id: "ac_01_office_ai",
      slug: "01_office_ai",
      title: "Ofiste Yapay Zekâ",
      catalogUnitKey: "course:01_office_ai",
    });
    const ledger = createMemoryLedgerStore([
      { userId: BUYER_OFFICE, amountMinor: 200_000 },
      { userId: PLATFORM, amountMinor: 0 },
    ]);
    const ports = {
      ledger,
      catalog: createMemoryPriceCatalogStore([
        { moduleKey: ACADEMY_MODULE_KEY, unitKey: course.catalogUnitKey, amountMinor: 89_000 },
      ]),
      locks: createMemoryCheckoutPriceLockStore(),
      academy: createMemoryAcademyStore(),
    };
    await ports.academy.insertCourse(course);
    await ports.academy.insertExam(memoryExam(course.id));
    const locked = await lockAcademyCoursePrice(ports, { courseId: course.id, userId: BUYER_OFFICE });
    await purchaseAcademyCourse(ports, {
      courseId: course.id,
      userId: BUYER_OFFICE,
      lockId: locked.lock.id,
      platformUserId: PLATFORM,
    });
    const lessons = curriculumForCourseSlug("01_office_ai");
    expect(lessons).toHaveLength(6);
    await expect(
      completeAcademyLesson(ports, {
        courseId: course.id,
        userId: BUYER_OFFICE,
        lessonKey: lessons[0]!.key,
        proof: { kind: "param-lock", slots: {} },
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    for (const lesson of lessons) {
      const done = await completeAcademyLesson(ports, {
        courseId: course.id,
        userId: BUYER_OFFICE,
        lessonKey: lesson.key,
      });
      expect(done.applied).toBe(true);
    }
    const player = await loadAcademyCurriculumPlayer(ports, {
      courseId: course.id,
      userId: BUYER_OFFICE,
    });
    expect(player.curriculumComplete).toBe(true);
    expect(player.workTasksComplete).toBe(true);
  });
});
