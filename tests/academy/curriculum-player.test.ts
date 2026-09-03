import { describe, expect, it } from "vitest";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import { lockAcademyCoursePrice, purchaseAcademyCourse } from "@/lib/academy/engine";
import {
  completeAcademyLesson,
  loadAcademyCurriculumPlayer,
} from "@/lib/academy/curriculum-engine";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { academyCanonicalProofSubmission } from "@/lib/academy/proof-of-work";
import { ForbiddenError, GoneError } from "@/lib/kernel/http/errors";
import { prepareAcademyLessonListen } from "@/archived/lib/academy-studio/lesson-listen-engine";
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
      proof: academyCanonicalProofSubmission(lessons[0]!.key) ?? undefined,
    });
    expect(first.applied).toBe(true);
    expect(first.player.lessons[0]?.body.length).toBeGreaterThan(20);
    const replay = await completeAcademyLesson(ctx.ports, {
      courseId: ctx.course.id,
      userId: BUYER,
      lessonKey: lessons[0]!.key,
      proof: academyCanonicalProofSubmission(lessons[0]!.key) ?? undefined,
    });
    expect(replay.applied).toBe(false);
  });

  it("tohum kurs id'si canlı slug satırına bağlanır; mükerrer tamamlama unique 500 değildir", async () => {
    const live = memoryCourse({
      id: "live_ai_agent_temel",
      slug: "ai-agent-temel",
      title: "AI Agent Temel",
      catalogUnitKey: "course:ai-agent-temel",
    });
    const ledger = createMemoryLedgerStore([
      { userId: BUYER, amountMinor: 100_000 },
      { userId: PLATFORM, amountMinor: 0 },
    ]);
    const ports = {
      ledger,
      catalog: createMemoryPriceCatalogStore([
        { moduleKey: ACADEMY_MODULE_KEY, unitKey: live.catalogUnitKey, amountMinor: 25_000 },
      ]),
      locks: createMemoryCheckoutPriceLockStore(),
      academy: createMemoryAcademyStore(),
    };
    await ports.academy.insertCourse(live);
    await ports.academy.insertExam(memoryExam(live.id));
    const locked = await lockAcademyCoursePrice(ports, { courseId: live.id, userId: BUYER });
    await purchaseAcademyCourse(ports, {
      courseId: live.id,
      userId: BUYER,
      lockId: locked.lock.id,
      platformUserId: PLATFORM,
    });
    const lessonKey = curriculumForCourseSlug("ai-agent-temel")[0]!.key;
    const first = await completeAcademyLesson(ports, {
      courseId: "ac_ai_agent_temel",
      userId: BUYER,
      lessonKey,
      proof: academyCanonicalProofSubmission(lessonKey) ?? undefined,
    });
    expect(first.applied).toBe(true);
    expect(first.player.courseId).toBe(live.id);

    const replay = await completeAcademyLesson(ports, {
      courseId: "ac_ai_agent_temel",
      userId: BUYER,
      lessonKey,
      proof: academyCanonicalProofSubmission(lessonKey) ?? undefined,
    });
    expect(replay.applied).toBe(false);
    expect(replay.player.courseId).toBe(live.id);
  });

  it("Faz 1: dinle bayrağı kapalı; prepare GoneError basar", async () => {
    expect(ACADEMY_LESSON_LISTEN_ENABLED).toBe(false);
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
    await expect(
      prepareAcademyLessonListen(ctx.ports, {
        courseId: ctx.course.id,
        userId: BUYER,
        lessonKey,
      }),
    ).rejects.toBeInstanceOf(GoneError);
  });
});
