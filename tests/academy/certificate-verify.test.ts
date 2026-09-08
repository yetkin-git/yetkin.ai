import { describe, expect, it, afterEach } from "vitest";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import { lockAcademyCoursePrice, purchaseAcademyCourse } from "@/lib/academy/engine";
import {
  resolvePublicAcademyCertificate,
  toPublicAcademyCertificateWire,
} from "@/lib/academy/certificate-verify";
import { revokeAcademyCertificate } from "@/lib/academy/certificate-lifecycle";
import {
  ACADEMY_CERTIFICATE_PAYLOAD_VERSION,
  computeAcademyCertificateHash,
  computeAcademyCurriculumSeal,
  parseAcademyCertificateHash,
} from "@/lib/academy/exam";
import { resetAcademyExamSittingConsumptionsForTests } from "@/lib/academy/exam-sitting";
import { createMemoryLedgerStore } from "../helpers/memory-money";
import { createMemoryAcademyStore, memoryCourse, memoryExam } from "../helpers/memory-academy";
import {
  createMemoryCheckoutPriceLockStore,
  createMemoryPriceCatalogStore,
} from "../helpers/memory-pricing";
import { railV1PublicAcademyCertificateDataSchema } from "@/lib/kernel/http/v1-contract";

const BUYER = "exam-buyer";
const PLATFORM = PLATFORM_TREASURY_USER_ID;
const COURSE_PRICE = 25_000;
const MISSING_HASH = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const FIXTURE_SEAL = computeAcademyCurriculumSeal(["lesson-a", "lesson-b"]);

function world() {
  const course = memoryCourse();
  const exam = memoryExam(course.id);
  const ledger = createMemoryLedgerStore([
    { userId: BUYER, amountMinor: 100_000 },
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

async function insertSealedCertificate(
  ctx: ReturnType<typeof world>,
  now = new Date("2026-08-14T12:00:00.000Z"),
) {
  await ctx.ports.academy.insertCourse(ctx.course);
  await ctx.ports.academy.insertExam(ctx.exam);
  const locked = await lockAcademyCoursePrice(ctx.ports, { courseId: ctx.course.id, userId: BUYER });
  await purchaseAcademyCourse(ctx.ports, {
    courseId: ctx.course.id,
    userId: BUYER,
    lockId: locked.lock.id,
    platformUserId: PLATFORM,
  });
  const attemptId = "attempt-sealed-1";
  const certificateHash = computeAcademyCertificateHash({
    userId: BUYER,
    courseId: ctx.course.id,
    attemptId,
    score: 100,
    issuedAt: now,
    curriculumSeal: FIXTURE_SEAL,
  });
  const certificate = await ctx.ports.academy.insertCertificate({
    id: "cert-sealed-1",
    userId: BUYER,
    courseId: ctx.course.id,
    purchaseId: "purchase-sealed-1",
    attemptId,
    title: ctx.course.title,
    serialKey: certificateHash,
    certificateHash,
    curriculumSeal: FIXTURE_SEAL,
    score: 100,
    issuedAt: now,
    revokedAt: null,
    revokeReason: null,
    createdAt: now,
  });
  return { certificate, attemptId, certificateHash };
}

describe("akademi SHA256 sertifika doğrulama", () => {
  afterEach(() => {
    resetAcademyExamSittingConsumptionsForTests();
  });

  it("geçerli hash mühür tutar; vatandaş kimliği sızmaz", async () => {
    const ctx = world();
    const now = new Date("2026-08-14T12:00:00.000Z");
    const { certificateHash, attemptId } = await insertSealedCertificate(ctx, now);
    expect(certificateHash).toMatch(/^[a-f0-9]{64}$/);
    expect(parseAcademyCertificateHash(` ${certificateHash.toUpperCase()} `)).toBe(certificateHash);

    const resolution = await resolvePublicAcademyCertificate(ctx.ports.academy, certificateHash);
    expect(resolution.status).toBe("found");
    if (resolution.status !== "found") {
      return;
    }
    expect(resolution.view.sealStatus).toBe("valid");
    expect(resolution.view.algorithm).toBe("SHA256");
    expect(resolution.view.integrityKind).toBe("sha256-content-digest");
    expect(resolution.view.revokedAt).toBeNull();
    expect(resolution.view.payloadVersion).toBe(ACADEMY_CERTIFICATE_PAYLOAD_VERSION);
    expect(resolution.view.courseSlug).toBe("sample-course");
    expect(resolution.view.score).toBe(100);
    expect(resolution.view.curriculumSeal).toBe(FIXTURE_SEAL);
    expect(resolution.view.hashedFields).toContain("müfredat özeti");
    const serialized = JSON.stringify(resolution.view);
    expect(serialized).not.toContain(BUYER);
    expect(serialized).not.toContain(attemptId);
    expect(serialized).not.toContain("userId");
  });

  it("biçimsiz hash ve sicilde olmayan hash dürüst kapanır", async () => {
    const academy = createMemoryAcademyStore();
    expect(await resolvePublicAcademyCertificate(academy, "not-a-hash")).toEqual({
      status: "invalid-format",
    });
    expect(await resolvePublicAcademyCertificate(academy, MISSING_HASH)).toEqual({ status: "missing" });
  });

  it("saklanan hash yeniden hesapla örtüşmezse mismatch basar", async () => {
    const ctx = world();
    await ctx.ports.academy.insertCourse(ctx.course);
    const now = new Date("2026-08-14T12:00:00.000Z");
    const realHash = computeAcademyCertificateHash({
      userId: BUYER,
      courseId: ctx.course.id,
      attemptId: "attempt-1",
      score: 100,
      issuedAt: now,
      curriculumSeal: FIXTURE_SEAL,
    });
    await ctx.ports.academy.insertCertificate({
      id: "cert-tamper",
      userId: BUYER,
      courseId: ctx.course.id,
      purchaseId: "purchase-1",
      attemptId: "attempt-1",
      title: ctx.course.title,
      serialKey: MISSING_HASH,
      certificateHash: MISSING_HASH,
      curriculumSeal: FIXTURE_SEAL,
      score: 100,
      issuedAt: now,
      revokedAt: null,
      revokeReason: null,
      createdAt: now,
    });
    expect(realHash).not.toBe(MISSING_HASH);
    const resolution = await resolvePublicAcademyCertificate(ctx.ports.academy, MISSING_HASH);
    expect(resolution).toMatchObject({ status: "found", view: { sealStatus: "mismatch" } });
  });

  it("denemesiz kayıt incomplete döner", async () => {
    const ctx = world();
    await ctx.ports.academy.insertCourse(ctx.course);
    const now = new Date("2026-08-14T12:00:00.000Z");
    await ctx.ports.academy.insertCertificate({
      id: "cert-incomplete",
      userId: BUYER,
      courseId: ctx.course.id,
      purchaseId: "purchase-2",
      attemptId: null,
      title: ctx.course.title,
      serialKey: MISSING_HASH,
      certificateHash: MISSING_HASH,
      curriculumSeal: null,
      score: 100,
      issuedAt: now,
      revokedAt: null,
      revokeReason: null,
      createdAt: now,
    });
    const resolution = await resolvePublicAcademyCertificate(ctx.ports.academy, MISSING_HASH);
    expect(resolution).toMatchObject({ status: "found", view: { sealStatus: "incomplete" } });
  });

  it("iptal sicili hash'i değiştirmez; kamu görünümü revoked basar; ikinci iptal no-op", async () => {
    const ctx = world();
    const now = new Date("2026-08-14T12:00:00.000Z");
    const { certificateHash } = await insertSealedCertificate(ctx, now);

    const revokedAt = new Date("2026-08-20T00:00:00.000Z");
    const first = await revokeAcademyCertificate(ctx.ports.academy, {
      hash: certificateHash,
      reason: "Müfredat geri çekildi.",
      now: revokedAt,
    });
    expect(first.applied).toBe(true);
    expect(first.certificate.certificateHash).toBe(certificateHash);
    expect(first.certificate.revokedAt?.toISOString()).toBe(revokedAt.toISOString());

    const second = await revokeAcademyCertificate(ctx.ports.academy, {
      hash: certificateHash,
      reason: "Müfredat geri çekildi.",
      now: new Date("2026-08-21T00:00:00.000Z"),
    });
    expect(second.applied).toBe(false);
    expect(second.certificate.revokedAt?.toISOString()).toBe(revokedAt.toISOString());

    const resolution = await resolvePublicAcademyCertificate(ctx.ports.academy, certificateHash);
    expect(resolution).toMatchObject({
      status: "found",
      view: {
        sealStatus: "revoked",
        integrityKind: "sha256-content-digest",
        certificateHash,
      },
    });
    if (resolution.status === "found") {
      expect(resolution.view.revokedAt?.toISOString()).toBe(revokedAt.toISOString());
      const parsed = railV1PublicAcademyCertificateDataSchema.safeParse(
        toPublicAcademyCertificateWire(resolution.view),
      );
      expect(parsed.success).toBe(true);
      expect(parsed.data?.sealStatus).toBe("revoked");
    }
  });

  it("hash uyuşmazlığı iptal kaydından önce gelir", async () => {
    const ctx = world();
    await ctx.ports.academy.insertCourse(ctx.course);
    const now = new Date("2026-08-14T12:00:00.000Z");
    await ctx.ports.academy.insertCertificate({
      id: "cert-revoked-mismatch",
      userId: BUYER,
      courseId: ctx.course.id,
      purchaseId: "purchase-revoked",
      attemptId: "attempt-revoked",
      title: ctx.course.title,
      serialKey: MISSING_HASH,
      certificateHash: MISSING_HASH,
      curriculumSeal: FIXTURE_SEAL,
      score: 100,
      issuedAt: now,
      revokedAt: new Date("2026-08-20T00:00:00.000Z"),
      revokeReason: "Sahte kayıt.",
      createdAt: now,
    });
    const resolution = await resolvePublicAcademyCertificate(ctx.ports.academy, MISSING_HASH);
    expect(resolution).toMatchObject({ status: "found", view: { sealStatus: "mismatch" } });
  });
});
