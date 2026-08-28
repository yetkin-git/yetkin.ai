import { describe, expect, it, beforeEach } from "vitest";
import { submitAcademyReview } from "@/archived/lib/academy-studio/reviews-engine";
import { getAcademyReview, resetAcademyReviewsForTests } from "@/archived/lib/academy-studio/reviews";
import {
  getAcademyLessonContentVersion,
  listPendingAcademyCurriculumRevisions,
  resetAcademyCurriculumRevisionsForTests,
} from "@/archived/lib/academy-studio/curriculum-revisions";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import type { LlmProviderAdapter } from "@/lib/kernel/ai/types";
import { lockAcademyCoursePrice, purchaseAcademyCourse } from "@/lib/academy/engine";
import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { BadRequestError, ForbiddenError } from "@/lib/kernel/http/errors";
import { createMemoryBudgetShieldPort } from "@/lib/kernel/ai/budget-shield";
import { createMemoryLedgerStore } from "../helpers/memory-money";
import { createMemoryAcademyStore, memoryCourse, memoryExam } from "../helpers/memory-academy";
import {
  createMemoryCheckoutPriceLockStore,
  createMemoryPriceCatalogStore,
} from "../helpers/memory-pricing";

const BUYER = "review-buyer";
const PLATFORM = PLATFORM_TREASURY_USER_ID;

function world() {
  const course = memoryCourse();
  return {
    course,
    ports: {
      ledger: createMemoryLedgerStore([
        { userId: BUYER, amountMinor: 100_000 },
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

describe("akademi mühürlü değerlendirme", () => {
  beforeEach(() => {
    resetAcademyReviewsForTests();
    resetAcademyCurriculumRevisionsForTests();
  });

  it("SETTLED olmadan yorum yazılmaz", async () => {
    const ctx = world();
    await ctx.ports.academy.insertCourse(ctx.course);
    await expect(
      submitAcademyReview(ctx.ports, {
        userId: BUYER,
        courseId: ctx.course.id,
        lessonKey: "python-temel-1",
        stars: 5,
        comment: "net",
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("yorum kaydında AI yoksa mühürlü Koray yanıtı basılır", async () => {
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
    const result = await submitAcademyReview(
      ctx.ports,
      {
        userId: BUYER,
        courseId: ctx.course.id,
        lessonKey: "python-temel-1",
        stars: 5,
        comment: "Anlatım saha gibi durdu.",
      },
      { budgetPort: createMemoryBudgetShieldPort() },
    );
    expect(result.applied).toBe(true);
    expect(result.review.stars).toBe(5);
    expect(result.review.moderatorReply.length).toBeGreaterThan(10);
    const again = await submitAcademyReview(ctx.ports, {
      userId: BUYER,
      courseId: ctx.course.id,
      lessonKey: "python-temel-1",
      stars: 1,
      comment: "tekrar",
    });
    expect(again.applied).toBe(false);
    expect(again.review.id).toBe(result.review.id);
  });

  it("kural ihlali yorumu kaydetmez; nezaket uyarısı döner, temiz deneme mühürlenir", async () => {
    const ctx = world();
    await ctx.ports.academy.insertCourse(ctx.course);
    await ctx.ports.academy.insertExam(memoryExam(ctx.course.id));
    const locked = await lockAcademyCoursePrice(ctx.ports, { courseId: ctx.course.id, userId: BUYER });
    const bought = await purchaseAcademyCourse(ctx.ports, {
      courseId: ctx.course.id,
      userId: BUYER,
      lockId: locked.lock.id,
      platformUserId: PLATFORM,
    });
    await expect(
      submitAcademyReview(
        ctx.ports,
        {
          userId: BUYER,
          courseId: ctx.course.id,
          lessonKey: "python-temel-1",
          stars: 1,
          comment: "amk berbat",
        },
        { budgetPort: createMemoryBudgetShieldPort() },
      ),
    ).rejects.toBeInstanceOf(BadRequestError);
    expect(getAcademyReview(bought.purchase.id, "python-temel-1")).toBeNull();
    const result = await submitAcademyReview(
      ctx.ports,
      {
        userId: BUYER,
        courseId: ctx.course.id,
        lessonKey: "python-temel-1",
        stars: 4,
        comment: "Anlatım saha gibi durdu.",
      },
      { budgetPort: createMemoryBudgetShieldPort() },
    );
    expect(result.applied).toBe(true);
    expect(result.review.comment).toBe("Anlatım saha gibi durdu.");
  });

  it("üç kanal: A düzeltir, B üst seviyeye yönlendirir, C kuyruğa düşer", async () => {
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
    const deps = { budgetPort: createMemoryBudgetShieldPort() };

    const misconception = await submitAcademyReview(
      ctx.ports,
      {
        userId: BUYER,
        courseId: ctx.course.id,
        lessonKey: "python-temel-1",
        stars: 3,
        comment: "Satın alma belge basıyor sanıyordum, baraj 50 değil mi?",
      },
      deps,
    );
    expect(misconception.review.decision).toBe("KULLANICI_YANILGISI");
    expect(misconception.review.moderatorReply).toContain("70");
    expect(listPendingAcademyCurriculumRevisions()).toHaveLength(0);

    const outOfScope = await submitAcademyReview(
      ctx.ports,
      {
        userId: BUYER,
        courseId: ctx.course.id,
        lessonKey: "python-temel-2",
        stars: 4,
        comment: "Neden Kubernetes bu Temel derste yok, anlatılmalıydı.",
      },
      deps,
    );
    expect(outOfScope.review.decision).toBe("KAPSAM_DISI");
    expect(outOfScope.review.moderatorReply).toContain(ACADEMY_SEN.review.outOfScope);

    const revision = await submitAcademyReview(
      ctx.ports,
      {
        userId: BUYER,
        courseId: ctx.course.id,
        lessonKey: "python-temel-3",
        stars: 1,
        comment: "Parametre tablosu eksik, şema da çelişiyor.",
      },
      deps,
    );
    expect(revision.review.decision).toBe("REVİZYON_TALEBİ");
    expect(revision.review.moderatorReply).toBe(ACADEMY_SEN.review.revisionQueued);
    expect(listPendingAcademyCurriculumRevisions()).toHaveLength(1);
    expect(listPendingAcademyCurriculumRevisions()[0]?.lessonKey).toBe("python-temel-3");
    expect(getAcademyLessonContentVersion("python-temel-3")).toBe("v1.0");
  });

  it("LLM C kararı mühürlü süzgeci ezer ve kuyruğa yazar", async () => {
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
    const gemini: LlmProviderAdapter = {
      id: "gemini",
      async complete() {
        return {
          text: '{"category":"C","correction":""}',
          usage: { promptTokens: 8, completionTokens: 6, totalTokens: 14 },
        };
      },
    };
    const result = await submitAcademyReview(
      ctx.ports,
      {
        userId: BUYER,
        courseId: ctx.course.id,
        lessonKey: "python-temel-1",
        stars: 5,
        comment: "Anlatım saha gibi durdu.",
      },
      { budgetPort: createMemoryBudgetShieldPort(), providers: { gemini } },
    );
    expect(result.review.decision).toBe("REVİZYON_TALEBİ");
    expect(result.review.moderatorReply).toBe(ACADEMY_SEN.review.revisionQueued);
    expect(listPendingAcademyCurriculumRevisions()).toHaveLength(1);
  });
});
