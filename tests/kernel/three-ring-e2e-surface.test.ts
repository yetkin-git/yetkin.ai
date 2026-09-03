import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { academyCurriculumSealForSlug } from "@/lib/academy/curriculum";
import { verifyAcademyCertificateHash } from "@/lib/academy/exam";
import { LISTING_ACCESS_VISA_DENIED } from "@/lib/career/visa-gate";
import { ACADEMY_STAMP_SURFACE_PATH } from "@/lib/kernel/passport/types";
import { academyCourseSeedBySlug } from "@/lib/academy/seed";
import {
  D3_CITIZEN_ID,
  D3_CLIENT_ID,
  D3_PLATFORM_ID,
  D3_START_MINOR,
  runThreeRingJourney,
} from "../helpers/three-ring-journey";
import { runCashLoopJourney, CASH_LOOP_CLIENT_ID } from "../helpers/cash-loop-journey";
import {
  PRISMA_RING_MIGRATIONS,
  assertPrismaRingMigrationsPresent,
} from "../../scripts/ops-migrate-lib";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("D3 üç halka — tek vatandaş nakit/vize e2e", () => {
  it("öğrenme → kanıt → kazanç aynı kimlikte kapanır; vizesiz teklif 403", async () => {
    const seed = academyCourseSeedBySlug("python-temel");
    expect(seed).toBeTruthy();
    const journey = await runThreeRingJourney();

    expect(journey.citizenId).toBe(D3_CITIZEN_ID);
    expect(journey.academy.purchase.status).toBe("SETTLED");
    expect(journey.academy.purchase.userId).toBe(D3_CITIZEN_ID);
    expect(journey.academy.certificate.score).toBeGreaterThanOrEqual(70);
    expect(journey.academy.certificate.certificateHash).toMatch(/^[a-f0-9]{64}$/);
    expect(journey.academy.certificate.curriculumSeal).toBe(academyCurriculumSealForSlug("python-temel"));
    expect(journey.academy.publicVerify.status).toBe("found");
    expect(journey.academy.publicVerify.sealStatus).toBe("valid");
    expect(
      verifyAcademyCertificateHash({
        userId: D3_CITIZEN_ID,
        courseId: journey.academy.certificate.courseId,
        attemptId: journey.academy.certificate.attemptId!,
        score: journey.academy.certificate.score!,
        issuedAt: journey.academy.certificate.issuedAt,
        curriculumSeal: journey.academy.curriculumSeal,
        certificateHash: journey.academy.certificate.certificateHash!,
      }),
    ).toBe(true);
    expect(journey.balances.citizenAfterAcademy).toBe(D3_START_MINOR - seed!.seedAmountMinor);

    expect(journey.proof.academyVisa.stamp.userId).toBe(D3_CITIZEN_ID);
    expect(journey.proof.academyVisa.stamp.sourceKind).toBe("ACADEMY_CERTIFICATE");
    expect(journey.proof.academyVisa.stamp.certificateHash).toBe(
      journey.academy.certificate.certificateHash,
    );
    expect(journey.proof.passportHref).toBe(
      `${ACADEMY_STAMP_SURFACE_PATH}/dogrula/${journey.academy.certificate.certificateHash}`,
    );
    expect(journey.proof.careerHref).toBe(journey.proof.passportHref);

    expect(journey.gate.visalessStatus).toBe(403);
    expect(journey.gate.visalessBody).toBe(LISTING_ACCESS_VISA_DENIED);

    expect(journey.freelancer.bid.bidderId).toBe(D3_CITIZEN_ID);
    expect(journey.freelancer.holdAfterAccept?.status).toBe("PENDING");
    expect(journey.freelancer.payoutFrozen).toBe(false);
    expect(journey.freelancer.released?.status).toBe("RELEASED");

    expect(journey.kurumsal.offer.bidderId).toBe(D3_CITIZEN_ID);
    expect(journey.kurumsal.offer.status).toBe("SUBMITTED");
    expect(journey.kurumsal.posting.escrowHoldId).toBeTruthy();

    expect(journey.balances.citizenAfterRelease).toBe(D3_START_MINOR - seed!.seedAmountMinor);
    expect(journey.balances.clientAfterRelease).toBe(D3_START_MINOR);
    expect(journey.balances.platformAfterRelease).toBe(seed!.seedAmountMinor);
    expect(D3_CLIENT_ID).not.toBe(D3_CITIZEN_ID);
    expect(D3_PLATFORM_ID).toBe("00000000-0000-4000-8000-000000000001");

    const entries = journey.ledger.capture().entries.map(([, row]) => row);
    const academyDebit = entries.find(
      (row) => row.userId === D3_CITIZEN_ID && row.purpose === "academy-purchase",
    );
    const escrowDebit = entries.find(
      (row) => row.purpose === "escrow-hold" && row.userId === D3_CLIENT_ID,
    );
    const releaseCredit = entries.find(
      (row) => row.userId === D3_CITIZEN_ID && row.purpose === "escrow-release-net",
    );
    expect(academyDebit?.direction).toBe("DEBIT");
    expect(academyDebit?.amountMinor).toBe(seed!.seedAmountMinor);
    expect(academyDebit?.label).toBe("Akademi kurs satın alma");
    expect(escrowDebit).toBeUndefined();
    expect(releaseCredit).toBeUndefined();
    expect(entries.some((row) => row.purpose === "wallet-top-up")).toBe(false);
  });

  it("CREDIT cüzdan yükleme laboratuvar clearing ile basar (token CREDIT yazmaz)", async () => {
    const cash = await runCashLoopJourney();
    expect(cash.cleared.applied).toBe(true);
    expect(cash.cleared.status).toBe("CLEARED");
    const entries = cash.ports.ledger.capture().entries.map(([, row]) => row);
    const topUp = entries.find((row) => row.purpose === "wallet-top-up");
    expect(topUp?.direction).toBe("CREDIT");
    expect(topUp?.userId).toBe(CASH_LOOP_CLIENT_ID);
    expect(topUp?.label).toBe("Cüzdan yükleme");
    expect(topUp?.idempotencyKey).toBe(`wallet-top-up:${cash.merchantOid}`);
    const escrowDebit = entries.find((row) => row.purpose === "escrow-hold");
    const releaseCredit = entries.find((row) => row.purpose === "escrow-release-net");
    expect(escrowDebit).toBeUndefined();
    expect(releaseCredit).toBeUndefined();
    expect(cash.payoutFrozen).toBe(false);
  });
});

describe("D3 operatör yüzeyi", () => {
  it("ops:migrate Direct :5432 üzerinde D2.1–D2.3 Prisma halkasını sırayla mühürler", () => {
    const ops = `${readSrc("scripts/ops-migrate.ts")}\n${readSrc("scripts/ops-migrate-lib.ts")}`;
    const folders = readdirSync(join(ROOT, "prisma", "migrations"), { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && /^\d{14}_/.test(entry.name))
      .map((entry) => entry.name)
      .sort();
    expect(assertPrismaRingMigrationsPresent(folders)).toEqual([]);
    expect(ops).toContain("assertPrismaRingMigrationsPresent");
    expect(ops).toContain("assertAcademyLessonCompletions");
    expect(ops).toContain("assertCurriculumSealColumns");
    expect(ops).toContain("assertCorporateJobOffers");
    expect(ops).toContain("assertDirectPortReachable");
    expect(ops).toContain("DIRECT_POSTGRES_PORT");
    expect(readSrc("prisma/migrations/20260816020000_academy_lesson_completions/migration.sql")).toContain(
      "academy_lesson_completions",
    );
    expect(
      readSrc("prisma/migrations/20260816030000_d2_2_curriculum_seal_certificate_hash/migration.sql"),
    ).toContain("curriculum_seal");
    expect(readSrc("prisma/migrations/20260816040000_d2_3_corporate_job_offers/migration.sql")).toContain(
      "corporate_job_offers",
    );
    const order = PRISMA_RING_MIGRATIONS.map((name) => folders.indexOf(name));
    expect(order[0]).toBeLessThan(order[1]!);
    expect(order[1]).toBeLessThan(order[2]!);
  });

  it("Storage CORS joker yasak; Inngest boş anahtarda GET/POST/PUT 503", () => {
    const storage = readSrc("archived/lib/studio/storage.ts");
    const corsCheck = readSrc("scripts/ops-storage-cors-check.ts");
    const inngestRoute = readSrc("app/api/(kernel)/jobs/inngest/route.ts");
    const guard = readSrc("lib/kernel/jobs/inngest-guard.ts");
    expect(storage).toContain("STUDIO_STORAGE_CORS_WILDCARD_ORIGIN");
    expect(storage).toContain("assertStudioStorageCorsHeaders");
    expect(corsCheck).toContain("assertStudioStorageCorsHeaders");
    expect(corsCheck).toContain("assertStudioStorageCorsRejectsForeignOrigin");
    expect(inngestRoute).toContain('method: "GET" | "POST" | "PUT"');
    expect(inngestRoute).toContain("shouldFailClosedInngestServe");
    expect(inngestRoute).toContain("inngestNotConfiguredResponse");
    expect(guard).toContain("INNGEST_SIGNING_KEY");
    expect(guard).toContain("INNGEST_EVENT_KEY");
  });

  it("üç halka yardımcısı tek vatandaş kimliği ve vize kapısı taşır", () => {
    const helper = readSrc("tests/helpers/three-ring-journey.ts");
    expect(helper).toContain("D3_CITIZEN_ID");
    expect(helper).toContain("python-temel");
    expect(helper).toContain("SETTLED");
    expect(helper).toContain("curriculumSeal");
    expect(helper).toContain("ACADEMY_CERTIFICATE");
    expect(helper).toContain("passportAcademyVerifyHref");
    expect(helper).toContain("assertAcademyCareerVisaForListing");
    expect(helper).toContain("FREELANCER_RELEASE");
    expect(helper).toContain("submitCorporateJobOffer");
    expect(helper).not.toContain("LOCAL_MOCK_AUTH");
  });
});
