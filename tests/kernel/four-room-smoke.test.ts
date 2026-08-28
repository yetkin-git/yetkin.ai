import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AUTH_CALLBACK_PATH,
  supabaseDashboardRedirectUrls,
} from "@/lib/kernel/auth/redirects";
import { PASSWORD_RECOVERY_PATH } from "@/lib/kernel/auth/password";
import { shouldFailClosedInngestServe } from "@/lib/kernel/jobs/inngest-guard";
import { assertPaytrProductionSafety } from "@/lib/kernel/payments/paytr/checkout";
import { academyCurriculumSealForSlug } from "@/lib/academy/curriculum";
import { verifyAcademyCertificateHash } from "@/lib/academy/exam";
import { isVitrineRoomFrozen } from "@/lib/kernel/compliance/circuit-breakers";
import { FROZEN_DISK_ROOMS, VERTICAL_ROOMS } from "@/lib/kernel/rooms.ssot";
import {
  E2E_ACADEMY_BUYER_ID,
  E2E_ACADEMY_PLATFORM_ID,
  E2E_ACADEMY_START_MINOR,
  runAcademyCashJourney,
} from "../helpers/academy-cash-journey";
import {
  E2E_CASH_CLIENT_ID,
  E2E_CASH_CLIENT_START_MINOR,
  E2E_CASH_FREELANCER_ID,
  E2E_CASH_GROSS_MINOR,
  E2E_CASH_PLATFORM_ID,
  runFreelancerCashJourney,
} from "../helpers/freelancer-cash-journey";
import { runPazaryeriDualCashJourney } from "../helpers/pazaryeri-cash-journey";
import { runStudioCashJourney } from "../helpers/studio-cash-journey";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Adım 10 — insan ops sözleşmesi (kod mühürü)", () => {
  it("Redirect URLs sicili /auth/callback ve /sifre-yenile taşır; açık yön yok", () => {
    expect(AUTH_CALLBACK_PATH).toBe("/auth/callback");
    expect(PASSWORD_RECOVERY_PATH).toBe("/sifre-yenile");
    expect(supabaseDashboardRedirectUrls("https://rail.example/")).toEqual([
      "https://rail.example/auth/callback",
      "https://rail.example/sifre-yenile",
    ]);
  });

  it("ops:migrate Prisma CHECK ve http_idempotency_records post-apply mühürler", () => {
    const lib = readSrc("scripts/ops-migrate-lib.ts");
    expect(lib).toContain("assertFrozenRoomTablesDropped");
    expect(lib).toContain("assertStudioDataBase64Check");
    expect(lib).toContain("assertHttpIdempotencyRecords");
    expect(lib).toContain("assertLedgerImmutability");
    expect(lib).toContain("assertPaidCommandReservations");
    expect(lib).toContain("assertAcademyLessonCompletions");
    expect(lib).toContain("assertCurriculumSealColumns");
    expect(lib).toContain("assertCertificateRevocationColumns");
    expect(lib).toContain("assertCorporateJobOffers");
    expect(lib).toContain("assertEscrowHoldChecks");
    expect(lib).toContain("studio_digital_assets_data_base64_max_chars");
    expect(lib).toContain("http_idempotency_records");
    expect(lib).toContain("paid_command_reservations");
    expect(lib).toContain("ledger_entries_append_only");
    expect(lib).toContain("runPostApplySeals");
  });

  it("INNGEST_SIGNING_KEY veya INNGEST_EVENT_KEY üretimde boşsa serve fail-closed; INNGEST_DEV açmaz", () => {
    expect(
      shouldFailClosedInngestServe({ NODE_ENV: "production", INNGEST_SIGNING_KEY: "" }),
    ).toBe(true);
    expect(
      shouldFailClosedInngestServe({
        NODE_ENV: "production",
        INNGEST_SIGNING_KEY: "",
        INNGEST_DEV: "1",
      }),
    ).toBe(true);
    expect(
      shouldFailClosedInngestServe({
        NODE_ENV: "production",
        INNGEST_SIGNING_KEY: "signkey-prod-test",
      }),
    ).toBe(true);
    expect(
      shouldFailClosedInngestServe({
        NODE_ENV: "production",
        INNGEST_SIGNING_KEY: "signkey-prod-test",
        INNGEST_EVENT_KEY: "eventkey-prod-test",
      }),
    ).toBe(false);
  });

  it("PayTR üretimde sandbox ve mock checkout fail-closed", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("PAYTR_ALLOW_MOCK_CHECKOUT", "true");
    vi.stubEnv("PAYTR_SANDBOX", "");
    expect(() => assertPaytrProductionSafety("smoke")).toThrow(
      /PAYTR_ALLOW_MOCK_CHECKOUT üretimde yasak/,
    );
    vi.stubEnv("PAYTR_ALLOW_MOCK_CHECKOUT", "");
    vi.stubEnv("PAYTR_SANDBOX", "1");
    expect(() => assertPaytrProductionSafety("smoke")).toThrow(/PAYTR_SANDBOX üretimde yasak/);
    vi.stubEnv("PAYTR_SANDBOX", "");
    expect(() => assertPaytrProductionSafety("smoke")).not.toThrow();
    errorSpy.mockRestore();
  });
});

describe("Adım 10 — dört oda nakit/üretim smoke", () => {
  it("Akademi: fiyat kilidi → anında settlement → müfredat → sınav ≥70 → SHA256 mühür", async () => {
    const journey = await runAcademyCashJourney();
    expect(journey.firstApplied).toBe(true);
    expect(journey.replayApplied).toBe(false);
    expect(journey.purchase.status).toBe("SETTLED");
    expect(journey.buyerBalanceAfter).toBe(E2E_ACADEMY_START_MINOR - journey.seedAmountMinor);
    expect(journey.platformBalanceAfter).toBe(journey.seedAmountMinor);
    expect(journey.certificate?.score).toBeGreaterThanOrEqual(70);
    expect(journey.certificate?.attemptId).toBeTruthy();
    expect(journey.certificate?.curriculumSeal).toBe(academyCurriculumSealForSlug("python-temel"));
    expect(
      verifyAcademyCertificateHash({
        userId: E2E_ACADEMY_BUYER_ID,
        courseId: journey.certificate!.courseId,
        attemptId: journey.certificate!.attemptId!,
        score: journey.certificate!.score!,
        issuedAt: journey.certificate!.issuedAt,
        curriculumSeal: academyCurriculumSealForSlug("python-temel")!,
        certificateHash: journey.certificate!.certificateHash!,
      }),
    ).toBe(true);
    expect(journey.ledger.snapshot(E2E_ACADEMY_PLATFORM_ID).amountMinor).toBe(
      journey.seedAmountMinor,
    );
  });

  it("Freelancer: ilan → kabul/hold (PENDING); release iç hakediş kilidine takılır", async () => {
    const journey = await runFreelancerCashJourney();
    expect(journey.job.status).toBe("OPEN");
    expect(journey.contract.status).toBe("FUNDED");
    expect(journey.holdAfterAccept?.status).toBe("PENDING");
    expect(journey.payoutFrozen).toBe(false);
    expect(journey.released.status).toBe("RELEASED");
    expect(journey.holdAfterRelease?.status).toBe("RELEASED");
    expect(journey.holdMinor + journey.netMinor).toBe(E2E_CASH_GROSS_MINOR);
    expect(journey.ports.ledger.snapshot(E2E_CASH_CLIENT_ID).amountMinor).toBe(
      E2E_CASH_CLIENT_START_MINOR,
    );
    expect(journey.ports.ledger.snapshot(E2E_CASH_FREELANCER_ID).amountMinor).toBe(0);
    expect(journey.ports.ledger.snapshot(E2E_CASH_PLATFORM_ID).amountMinor).toBe(0);
  });

  it("Yetkinİlan donmuş: sicil dışı; teslim split portu yoksa 503", async () => {
    expect(VERTICAL_ROOMS.map((room) => room.id as string)).not.toContain("pazaryeri");
    expect(FROZEN_DISK_ROOMS).toContain("pazaryeri");
    expect(isVitrineRoomFrozen("pazaryeri")).toBe(true);
    await expect(runPazaryeriDualCashJourney()).rejects.toThrow(/Ödeme henüz bağlanmadı/);
  });

  it("Studio donmuş: sicil dışı; müze CREDIT amacı yok", async () => {
    expect(VERTICAL_ROOMS.map((room) => room.id as string)).not.toContain("studio");
    expect(FROZEN_DISK_ROOMS).toContain("studio");
    expect(isVitrineRoomFrozen("studio")).toBe(true);
    await expect(runStudioCashJourney()).rejects.toThrow(
      /Ledger CREDIT amacı izin listesinde değil/,
    );
  });
});
