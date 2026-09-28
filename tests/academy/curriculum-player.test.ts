import { afterEach, describe, expect, it, vi } from "vitest";
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
  afterEach(() => {
    vi.unstubAllEnvs();
  });

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
    expect(lessons).toHaveLength(8);
    const player = await loadAcademyCurriculumPlayer(ports, {
      courseId: course.id,
      userId: BUYER_OFFICE,
    });
    expect(player.lessons).toHaveLength(8);
    expect(player.lessons[0]?.key).toBe("01_office_ai-1");
    expect(player.lessons.every((lesson) => lesson.open)).toBe(true);
  });

  it("üretimde Super Admin satın alma satırı yazmadan tüm dersleri açar", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CANONICAL_SUPER_ADMIN_EMAIL", "yapinet360@gmail.com");
    vi.stubEnv("SUPER_ADMIN_USER_ID", "admin-1");
    const course = memoryCourse({
      id: "ac_01_office_ai",
      slug: "01_office_ai",
      title: "Ofiste Yapay Zekâ",
      catalogUnitKey: "course:01_office_ai",
    });
    const academy = createMemoryAcademyStore();
    await academy.insertCourse(course);
    await expect(
      loadAcademyCurriculumPlayer(
        { academy },
        { courseId: course.id, userId: "citizen-1", email: "vatandas@yetkin.rail" },
      ),
    ).rejects.toBeInstanceOf(ForbiddenError);
    await expect(
      loadAcademyCurriculumPlayer(
        { academy },
        { courseId: course.id, userId: "admin-1", email: "yapinet360@gmail.com" },
      ),
    ).rejects.toBeInstanceOf(ForbiddenError);
    const player = await loadAcademyCurriculumPlayer(
      { academy },
      {
        courseId: course.id,
        userId: "admin-1",
        email: "yapinet360@gmail.com",
        emailConfirmedAt: "2026-01-01T00:00:00.000Z",
      },
    );
    expect(player.lessons).toHaveLength(8);
    expect(player.lessons.every((lesson) => lesson.open)).toBe(true);
    expect(await academy.listPurchasesForUser("admin-1")).toHaveLength(0);
  });

  it("OFF-201 ticari kayıt ve Super Admin ders 2–6 dahil kataloğu açar", async () => {
    const buyer = "curriculum-off201-buyer";
    const course = memoryCourse({
      id: "ac_01_office_ai_ileri",
      slug: "01_office_ai_ileri",
      title: "İleri Ofis Yapay Zekâ",
      catalogUnitKey: "course:01_office_ai_ileri",
    });
    const ledger = createMemoryLedgerStore([
      { userId: buyer, amountMinor: 200_000 },
      { userId: PLATFORM, amountMinor: 0 },
    ]);
    const ports = {
      ledger,
      catalog: createMemoryPriceCatalogStore([
        { moduleKey: ACADEMY_MODULE_KEY, unitKey: course.catalogUnitKey, amountMinor: 129_000 },
      ]),
      locks: createMemoryCheckoutPriceLockStore(),
      academy: createMemoryAcademyStore(),
    };
    await ports.academy.insertCourse(course);
    await ports.academy.insertExam(memoryExam(course.id));
    const locked = await lockAcademyCoursePrice(ports, { courseId: course.id, userId: buyer });
    await purchaseAcademyCourse(ports, {
      courseId: course.id,
      userId: buyer,
      lockId: locked.lock.id,
      platformUserId: PLATFORM,
    });
    const enrolled = await loadAcademyCurriculumPlayer(ports, {
      courseId: course.id,
      userId: buyer,
    });
    expect(enrolled.lessons.map((lesson) => lesson.key)).toEqual([
      "01_office_ai_ileri-1",
      "01_office_ai_ileri-2",
      "01_office_ai_ileri-3",
      "01_office_ai_ileri-4",
      "01_office_ai_ileri-5",
      "01_office_ai_ileri-6",
    ]);
    expect(enrolled.lessons.every((lesson) => lesson.open)).toBe(true);

    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("CANONICAL_SUPER_ADMIN_EMAIL", "yapinet360@gmail.com");
    vi.stubEnv("SUPER_ADMIN_USER_ID", "admin-1");
    const admin = await loadAcademyCurriculumPlayer(
      { academy: ports.academy },
      {
        courseId: course.id,
        userId: "admin-1",
        email: "yapinet360@gmail.com",
        emailConfirmedAt: "2026-01-01T00:00:00.000Z",
      },
    );
    expect(admin.lessons.slice(1).every((lesson) => lesson.open)).toBe(true);
  });
});
