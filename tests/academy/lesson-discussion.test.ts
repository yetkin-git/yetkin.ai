import { describe, expect, it, beforeEach } from "vitest";
import { submitAcademyLessonComment } from "@/archived/lib/academy-studio/lesson-discussion-engine";
import {
  listAcademyLessonComments,
  resetAcademyLessonDiscussionForTests,
  toPublicAcademyDiscussionComment,
} from "@/archived/lib/academy-studio/lesson-discussion";
import { lockAcademyCoursePrice, purchaseAcademyCourse } from "@/lib/academy/engine";
import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { ForbiddenError } from "@/lib/kernel/http/errors";
import { createMemoryLedgerStore } from "../helpers/memory-money";
import { createMemoryAcademyStore, memoryCourse, memoryExam } from "../helpers/memory-academy";
import {
  createMemoryCheckoutPriceLockStore,
  createMemoryPriceCatalogStore,
} from "../helpers/memory-pricing";

const BUYER = "discussion-buyer";
const STRANGER = "discussion-stranger";
const PLATFORM = PLATFORM_TREASURY_USER_ID;

function world() {
  const course = memoryCourse();
  return {
    course,
    ports: {
      ledger: createMemoryLedgerStore([
        { userId: BUYER, amountMinor: 100_000 },
        { userId: STRANGER, amountMinor: 100_000 },
        { userId: PLATFORM, amountMinor: 0 },
      ]),
      catalog: createMemoryPriceCatalogStore([
        { moduleKey: ACADEMY_MODULE_KEY, unitKey: course.catalogUnitKey, amountMinor: 25_000 },
      ]),
      locks: createMemoryCheckoutPriceLockStore(),
      academy: createMemoryAcademyStore(),
    },
  };
}

describe("ders tartışması — herkese açık okuma, kayıtlı yazma", () => {
  beforeEach(() => {
    resetAcademyLessonDiscussionForTests();
  });

  it("kayıt olmadan yorum yazılmaz; kayıtlı öğrenci yazar ve herkese açık kart basılır", async () => {
    const ctx = world();
    await ctx.ports.academy.insertCourse(ctx.course);
    await ctx.ports.academy.insertExam(memoryExam(ctx.course.id));
    await expect(
      submitAcademyLessonComment(ctx.ports, {
        userId: BUYER,
        courseId: ctx.course.id,
        lessonKey: "python-temel-1",
        body: "Bu parametre kutusu netleşti.",
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);

    const locked = await lockAcademyCoursePrice(ctx.ports, { courseId: ctx.course.id, userId: BUYER });
    await purchaseAcademyCourse(ctx.ports, {
      courseId: ctx.course.id,
      userId: BUYER,
      lockId: locked.lock.id,
      platformUserId: PLATFORM,
    });
    const written = await submitAcademyLessonComment(ctx.ports, {
      userId: BUYER,
      courseId: ctx.course.id,
      lessonKey: "python-temel-1",
      body: "Bu parametre kutusu netleşti.",
    });
    expect(written.item.body).toBe("Bu parametre kutusu netleşti.");
    expect(written.item.authorLabel).toBe("Katılımcı");
    expect(written.item.kind).toBe("comment");
    const listed = listAcademyLessonComments(ctx.course.id, "python-temel-1");
    expect(listed).toHaveLength(1);
    const publicCard = toPublicAcademyDiscussionComment(listed[0]!);
    expect("userId" in publicCard).toBe(false);
    expect(JSON.stringify(publicCard)).not.toContain(BUYER);
  });
});
