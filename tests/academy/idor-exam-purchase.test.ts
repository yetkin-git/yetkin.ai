import { afterEach, describe, expect, it, vi } from "vitest";
import { GET as getExam, POST as postExam } from "@/app/api/academy/courses/[id]/exam/route";
import { GET as getCertificates } from "@/app/api/academy/certificates/route";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import { lockAcademyCoursePrice, purchaseAcademyCourse } from "@/lib/academy/engine";
import { loadAcademyExam, submitAcademyExam } from "@/lib/academy/exam-engine";
import { completeAcademyCurriculum } from "@/lib/academy/curriculum-engine";
import * as sessionApi from "@/lib/kernel/auth/session";
import * as academyRuntime from "@/lib/academy/runtime";
import { createMemoryLedgerStore } from "../helpers/memory-money";
import { createMemoryAcademyStore, memoryCourse, memoryExam } from "../helpers/memory-academy";
import {
  createMemoryCheckoutPriceLockStore,
  createMemoryPriceCatalogStore,
} from "../helpers/memory-pricing";
import { assertWireContains, assertWireOmits } from "../helpers/idor-leak";

const BUYER = "academy-idor-buyer";
const STRANGER = "academy-idor-stranger";
const PLATFORM = PLATFORM_TREASURY_USER_ID;
const COURSE_PRICE = 25_000;
const PASSING = [
  { questionId: "q1", choiceIndex: 1 },
  { questionId: "q2", choiceIndex: 1 },
  { questionId: "q3", choiceIndex: 1 },
  { questionId: "q4", choiceIndex: 1 },
];

function world() {
  const course = memoryCourse({ id: "course-idor-1", slug: "python-temel" });
  const exam = memoryExam(course.id);
  const ledger = createMemoryLedgerStore([
    { userId: BUYER, amountMinor: 100_000 },
    { userId: STRANGER, amountMinor: 100_000 },
    { userId: PLATFORM, amountMinor: 0 },
  ]);
  const catalog = createMemoryPriceCatalogStore([
    { moduleKey: ACADEMY_MODULE_KEY, unitKey: course.catalogUnitKey, amountMinor: COURSE_PRICE },
  ]);
  const academy = createMemoryAcademyStore();
  return {
    course,
    exam,
    ports: {
      ledger,
      catalog,
      locks: createMemoryCheckoutPriceLockStore(),
      academy,
    },
  };
}

async function settleBuyer(ctx: ReturnType<typeof world>) {
  await ctx.ports.academy.insertCourse(ctx.course);
  await ctx.ports.academy.insertExam(ctx.exam);
  const locked = await lockAcademyCoursePrice(ctx.ports, {
    courseId: ctx.course.id,
    userId: BUYER,
  });
  const purchased = await purchaseAcademyCourse(ctx.ports, {
    courseId: ctx.course.id,
    userId: BUYER,
    lockId: locked.lock.id,
    platformUserId: PLATFORM,
  });
  await completeAcademyCurriculum(ctx.ports, { courseId: ctx.course.id, userId: BUYER });
  return purchased;
}

describe("akademi sınav/satın alma IDOR", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("yabancı SETTLED satın almayı ve sınav oturumunu açamaz; satın alma userId ile kilitlidir", async () => {
    const ctx = world();
    const purchased = await settleBuyer(ctx);
    expect(purchased.purchase.userId).toBe(BUYER);

    const ownerView = await loadAcademyExam(ctx.ports, ctx.course.id, BUYER);
    expect(ownerView).not.toBeNull();
    expect(ownerView?.purchaseId).toBe(purchased.purchase.id);
    assertWireContains(ownerView, [purchased.purchase.id]);

    const strangerView = await loadAcademyExam(ctx.ports, ctx.course.id, STRANGER);
    expect(strangerView).toBeNull();
    assertWireOmits(strangerView, [purchased.purchase.id, ownerView!.sessionToken]);

    await expect(
      submitAcademyExam(ctx.ports, {
        courseId: ctx.course.id,
        userId: STRANGER,
        answers: PASSING,
        sessionToken: "missing-sitting",
      }),
    ).rejects.toThrow(/satın alma/);

    const strangerPurchase = await ctx.ports.academy.getPurchaseByUserAndCourse(
      STRANGER,
      ctx.course.id,
    );
    expect(strangerPurchase).toBeNull();
  });

  it("GET/POST exam ve sertifika listesi oturum aktörüne kilitli; yabancı purchaseId/sessionToken sızdırmaz", async () => {
    const ctx = world();
    const purchased = await settleBuyer(ctx);

    vi.spyOn(academyRuntime, "createPrismaAcademyPorts").mockReturnValue(ctx.ports as never);
    const requireSession = vi.spyOn(sessionApi, "requireSession");

    requireSession.mockResolvedValueOnce({
      id: BUYER,
      email: "buyer@yetkin.rail",
    } as never);
    const ownerExam = await getExam(new Request("http://localhost/api/academy/courses/x/exam"), {
      params: Promise.resolve({ id: ctx.course.id }),
    });
    expect(ownerExam.status).toBe(200);
    const ownerBody = (await ownerExam.json()) as {
      data?: { purchaseId?: string; sessionToken?: string };
      purchaseId?: string;
      sessionToken?: string;
    };
    const ownerPurchaseId = ownerBody.data?.purchaseId ?? ownerBody.purchaseId;
    const ownerSessionToken = ownerBody.data?.sessionToken ?? ownerBody.sessionToken;
    expect(ownerPurchaseId).toBe(purchased.purchase.id);
    expect(ownerSessionToken).toBeTruthy();
    assertWireContains(ownerBody, [purchased.purchase.id]);

    requireSession.mockResolvedValueOnce({
      id: STRANGER,
      email: "stranger@yetkin.rail",
    } as never);
    const strangerExam = await getExam(new Request("http://localhost/api/academy/courses/x/exam"), {
      params: Promise.resolve({ id: ctx.course.id }),
    });
    expect(strangerExam.status).toBe(403);
    const strangerBody = await strangerExam.json();
    assertWireOmits(strangerBody, [purchased.purchase.id, String(ownerSessionToken)]);

    requireSession.mockResolvedValueOnce({
      id: STRANGER,
      email: "stranger@yetkin.rail",
    } as never);
    const strangerPost = await postExam(
      new Request("http://localhost/api/academy/courses/x/exam", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          answers: PASSING,
          sessionToken: ownerSessionToken,
        }),
      }),
      { params: Promise.resolve({ id: ctx.course.id }) },
    );
    expect(strangerPost.status).toBeGreaterThanOrEqual(400);
    const strangerPostBody = await strangerPost.json();
    assertWireOmits(strangerPostBody, [purchased.purchase.id, String(ownerSessionToken)]);

    const certHash =
      "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd";
    const issuedAt = new Date("2026-08-14T12:00:00.000Z");
    await ctx.ports.academy.insertCertificate({
      id: "cert-idor-buyer",
      userId: BUYER,
      courseId: ctx.course.id,
      purchaseId: purchased.purchase.id,
      attemptId: "attempt-idor-1",
      title: ctx.course.title,
      serialKey: certHash,
      certificateHash: certHash,
      curriculumSeal: "seal-idor",
      score: 100,
      issuedAt,
      revokedAt: null,
      revokeReason: null,
      createdAt: issuedAt,
    });

    requireSession.mockResolvedValueOnce({
      id: BUYER,
      email: "buyer@yetkin.rail",
    } as never);
    const ownerCerts = await getCertificates(new Request("http://localhost/api/academy/certificates"));
    expect(ownerCerts.status).toBe(200);
    assertWireContains(await ownerCerts.json(), [certHash]);

    requireSession.mockResolvedValueOnce({
      id: STRANGER,
      email: "stranger@yetkin.rail",
    } as never);
    const strangerCerts = await getCertificates(
      new Request("http://localhost/api/academy/certificates"),
    );
    expect(strangerCerts.status).toBe(200);
    assertWireOmits(await strangerCerts.json(), [certHash, purchased.purchase.id]);
  });
});
