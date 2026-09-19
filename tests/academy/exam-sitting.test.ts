import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import { lockAcademyCoursePrice, purchaseAcademyCourse } from "@/lib/academy/engine";
import {
  academyExamGateProofLessonKey,
  loadAcademyExam,
} from "@/lib/academy/exam-engine";
import { completeAcademyCurriculum } from "@/lib/academy/curriculum-engine";
import { academyCourseSeedBySlug } from "@/lib/academy/seed";
import { ServiceUnavailableError } from "@/lib/kernel/http/errors";
import {
  ACADEMY_EXAM_SITTING_MAC_FALLBACK,
  ACADEMY_EXAM_SITTING_SECRET_MISSING,
  drawAcademyExamQuestions,
  openAcademyExamSitting,
  resetAcademyExamSittingConsumptionsForTests,
  resolveAcademyExamSittingMacKey,
  sealAcademyExamSitting,
  shuffleAcademyExamChoices,
} from "@/lib/academy/exam-sitting";
import { OFFICE_AI_EXAM_QUESTIONS } from "@/lib/academy/exam-pools";
import {
  academyCanonicalProofSubmission,
  evaluateAcademyProofSubmission,
} from "@/lib/academy/proof-of-work";
import { createMemoryLedgerStore } from "../helpers/memory-money";
import { createMemoryAcademyStore, memoryPublishedSku } from "../helpers/memory-academy";
import {
  createMemoryCheckoutPriceLockStore,
  createMemoryPriceCatalogStore,
} from "../helpers/memory-pricing";

const BUYER = "exam-sitting-buyer";
const PLATFORM = PLATFORM_TREASURY_USER_ID;

describe("sınav oturumu MAC ve iş kanıtı kapısı", () => {
  afterEach(() => {
    resetAcademyExamSittingConsumptionsForTests();
  });

  it("MAC sunucu sırrına bağlanır; sürüm dizesi anahtar değildir", () => {
    const src = readFileSync(join(process.cwd(), "lib/academy/exam-sitting.ts"), "utf8");
    expect(src).toContain("ACADEMY_EXAM_SITTING_SECRET");
    expect(src).toContain("yetkin-rail.academy.exam-sitting.mac.v1");
    expect(src).toContain("yetkin-rail.academy.exam-sitting.mac.derive.v1");
    expect(src).toContain("SUPABASE_JWT_SECRET");
    expect(src).toContain("Sınav oturumu henüz bağlanmadı.");
    expect(src).toContain("ServiceUnavailableError");
    expect(src).toContain("resolveAcademyExamSittingMacKey");
    expect(src).toContain("academyExamSittingMayConsume");
    expect(src).toContain("serializeAcademyExamSittingItems");
    expect(src).not.toContain('createHmac("sha256", ACADEMY_EXAM_SITTING_VERSION)');
  });

  it("dedicated secret ≥16 kullanılır; kısa secret JWT derive fallback alır", () => {
    expect(
      resolveAcademyExamSittingMacKey({
        NODE_ENV: "production",
        ACADEMY_EXAM_SITTING_SECRET: "dedicated-secret-16",
        SUPABASE_JWT_SECRET: "jwt-secret-at-least16",
      }),
    ).toBe("dedicated-secret-16");
    const derived = resolveAcademyExamSittingMacKey({
      NODE_ENV: "production",
      ACADEMY_EXAM_SITTING_SECRET: "",
      SUPABASE_JWT_SECRET: "jwt-secret-at-least16",
    });
    expect(derived).toHaveLength(64);
    expect(derived).not.toBe("jwt-secret-at-least16");
    expect(derived).not.toBe(ACADEMY_EXAM_SITTING_MAC_FALLBACK);
  });

  it("üretimde dedicated ve JWT yokken 503; lab / Vitest yedek basar", () => {
    expect(() =>
      resolveAcademyExamSittingMacKey({
        NODE_ENV: "production",
        ACADEMY_EXAM_SITTING_SECRET: "short",
        SUPABASE_JWT_SECRET: "",
      }),
    ).toThrow(ServiceUnavailableError);
    expect(() =>
      resolveAcademyExamSittingMacKey({
        NODE_ENV: "production",
        ACADEMY_EXAM_SITTING_SECRET: "",
        SUPABASE_JWT_SECRET: "",
      }),
    ).toThrow(ACADEMY_EXAM_SITTING_SECRET_MISSING);
    expect(
      resolveAcademyExamSittingMacKey({
        NODE_ENV: "production",
        VITEST: "true",
        ACADEMY_EXAM_SITTING_SECRET: "",
        SUPABASE_JWT_SECRET: "",
      }),
    ).toBe(ACADEMY_EXAM_SITTING_MAC_FALLBACK);
    expect(
      resolveAcademyExamSittingMacKey({
        NODE_ENV: "development",
        ACADEMY_EXAM_SITTING_SECRET: "",
      }),
    ).toBe(ACADEMY_EXAM_SITTING_MAC_FALLBACK);
  });

  it("jeton proofLessonKey taşır; sapmış MAC açılmaz", () => {
    const now = new Date("2026-08-22T12:00:00.000Z");
    const token = sealAcademyExamSitting({
      userId: BUYER,
      courseId: "course-sample",
      examId: "exam-sample",
      startedAt: now,
      expiresAt: new Date(now.getTime() + 30 * 60 * 1000),
      jti: "jti-sample-1",
      items: [{ id: "q1", permutation: [0, 1, 2, 3] }],
      proofLessonKey: "sample-course-1",
    });
    const opened = openAcademyExamSitting(token);
    expect(opened?.proofLessonKey).toBe("sample-course-1");
    expect(opened?.jti).toBe("jti-sample-1");
    expect(openAcademyExamSitting(`${token}x`)).toBeNull();
  });

  it("boş yayın SKU'sunda iş kanıtı kapısı null kalır", () => {
    expect(academyCourseSeedBySlug("sample-course")).toBeUndefined();
    expect(academyExamGateProofLessonKey("sample-course")).toBeNull();
    expect(academyCanonicalProofSubmission("sample-course-1")).toBeNull();
    expect(
      evaluateAcademyProofSubmission("sample-course-1", { kind: "param-lock", slots: {} }).ok,
    ).toBe(false);
  });

  it("süreli oturum müfredat tamamından sonra açılır; atlanan 01_office_ai sınavı 403", async () => {
    const published = memoryPublishedSku();
    const ports = {
      ledger: createMemoryLedgerStore([
        { userId: BUYER, amountMinor: 200_000 },
        { userId: PLATFORM, amountMinor: 0 },
      ]),
      catalog: createMemoryPriceCatalogStore([
        {
          moduleKey: ACADEMY_MODULE_KEY,
          unitKey: published.course.catalogUnitKey,
          amountMinor: published.amountMinor,
        },
      ]),
      locks: createMemoryCheckoutPriceLockStore(),
      academy: createMemoryAcademyStore(),
    };
    await ports.academy.insertCourse(published.course);
    await ports.academy.insertExam(published.exam);
    const locked = await lockAcademyCoursePrice(ports, {
      courseId: published.course.id,
      userId: BUYER,
    });
    await purchaseAcademyCourse(ports, {
      courseId: published.course.id,
      userId: BUYER,
      lockId: locked.lock.id,
      platformUserId: PLATFORM,
    });
    await expect(loadAcademyExam(ports, published.course.id, BUYER)).rejects.toThrow(
      /Sınav kapısı müfredat tamamlanınca açılır/,
    );

    await completeAcademyCurriculum(ports, { courseId: published.course.id, userId: BUYER });
    const view = await loadAcademyExam(ports, published.course.id, BUYER);
    expect(view?.questions.length).toBe(10);
    expect(view?.sessionToken).toBeTruthy();
    expect(view?.exam.passScore).toBe(70);
    const lessonIds = view?.questions.filter((question) => question.id.startsWith("q_off_l")).map((row) => row.id) ?? [];
    expect(lessonIds).toEqual([]);
    const sitting = openAcademyExamSitting(view!.sessionToken);
    expect(sitting?.items.every((item) => !item.id.startsWith("q_off_l"))).toBe(true);
    expect(sitting?.items).toHaveLength(10);
  });

  it("şıklar oturumda karışır; havuzdaki B-ağırlığı vitrine taşınmaz (D1)", () => {
    const bHeavy = OFFICE_AI_EXAM_QUESTIONS.find((question) => question.correctIndex === 1);
    expect(bHeavy).toBeDefined();
    const shuffled = shuffleAcademyExamChoices(bHeavy!, () => 0);
    expect([...shuffled.permutation].sort((a, b) => a - b)).toEqual([0, 1, 2, 3]);
    expect(shuffled.permutation).not.toEqual([0, 1, 2, 3]);
    expect(shuffled.question.choices[shuffled.question.correctIndex]).toBe(
      bHeavy!.choices[bHeavy!.correctIndex],
    );
    const drawn = drawAcademyExamQuestions(OFFICE_AI_EXAM_QUESTIONS, 10, () => 0);
    expect(drawn.questions).toHaveLength(10);
    expect(drawn.items).toHaveLength(10);
    for (const item of drawn.items) {
      expect([...item.permutation].sort((a, b) => a - b)).toEqual([0, 1, 2, 3]);
    }
  });
});
