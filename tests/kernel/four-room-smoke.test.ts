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
import {
  E2E_PAZARYERI_BUYER_ID,
  E2E_PAZARYERI_PLATFORM_ID,
  E2E_PAZARYERI_PRICE_MINOR,
  E2E_PAZARYERI_SELLER_ID,
  E2E_PAZARYERI_START_MINOR,
  runPazaryeriDualCashJourney,
} from "../helpers/pazaryeri-cash-journey";
import {
  E2E_STUDIO_IMAGE_FLOOR,
  E2E_STUDIO_START_MINOR,
  E2E_STUDIO_TEXT_FLOOR,
  E2E_STUDIO_USER_ID,
  runStudioCashJourney,
} from "../helpers/studio-cash-journey";

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
    const runbook = readSrc("docs/07_OPS_RUNBOOK.md");
    expect(runbook).toContain("/auth/callback");
    expect(runbook).toContain("/sifre-yenile");
    expect(runbook).toContain("emailRedirectTo");
    expect(runbook).toContain("exchangeCodeForSession");
  });

  it("ops:migrate Prisma CHECK ve http_idempotency_records post-apply mühürler", () => {
    const lib = readSrc("scripts/ops-migrate-lib.ts");
    const runbook = readSrc("docs/07_OPS_RUNBOOK.md");
    expect(lib).toContain("assertStudioDataBase64Check");
    expect(lib).toContain("assertHttpIdempotencyRecords");
    expect(lib).toContain("assertAcademyLessonCompletions");
    expect(lib).toContain("assertCurriculumSealColumns");
    expect(lib).toContain("assertCorporateJobOffers");
    expect(lib).toContain("studio_digital_assets_data_base64_max_chars");
    expect(lib).toContain("http_idempotency_records");
    expect(lib).toContain("runPostApplySeals");
    expect(runbook).toContain("studio_digital_assets_data_base64_max_chars");
    expect(runbook).toContain("http_idempotency_records");
    expect(runbook).toContain("2097152");
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
    expect(journey.certificate?.curriculumSeal).toBe(academyCurriculumSealForSlug("rail-temel"));
    expect(
      verifyAcademyCertificateHash({
        userId: E2E_ACADEMY_BUYER_ID,
        courseId: journey.certificate!.courseId,
        attemptId: journey.certificate!.attemptId!,
        score: journey.certificate!.score!,
        issuedAt: journey.certificate!.issuedAt,
        curriculumSeal: academyCurriculumSealForSlug("rail-temel")!,
        certificateHash: journey.certificate!.certificateHash!,
      }),
    ).toBe(true);
    expect(journey.ledger.snapshot(E2E_ACADEMY_PLATFORM_ID).amountMinor).toBe(
      journey.seedAmountMinor,
    );
  });

  it("Freelancer: ilan → kabul/hold (PENDING) → teslim onayı aktarım (RELEASED)", async () => {
    const journey = await runFreelancerCashJourney();
    expect(journey.job.status).toBe("OPEN");
    expect(journey.contract.status).toBe("FUNDED");
    expect(journey.holdAfterAccept?.status).toBe("PENDING");
    expect(journey.released.status).toBe("RELEASED");
    expect(journey.holdAfterRelease?.status).toBe("RELEASED");
    expect(journey.holdMinor + journey.netMinor).toBe(E2E_CASH_GROSS_MINOR);
    expect(journey.ports.ledger.snapshot(E2E_CASH_CLIENT_ID).amountMinor).toBe(
      E2E_CASH_CLIENT_START_MINOR - E2E_CASH_GROSS_MINOR,
    );
    expect(journey.ports.ledger.snapshot(E2E_CASH_FREELANCER_ID).amountMinor).toBe(9_000);
    expect(journey.ports.ledger.snapshot(E2E_CASH_PLATFORM_ID).amountMinor).toBe(1_000);
  });

  it("Yetkinİlan: dijital SETTLED + hizmet hold → teslim CLEARED", async () => {
    const journey = await runPazaryeriDualCashJourney();
    expect(journey.digital.firstApplied).toBe(true);
    expect(journey.digital.replayApplied).toBe(false);
    expect(journey.digital.order.status).toBe("SETTLED");
    expect(journey.digital.order.escrowHoldId).toBeNull();
    expect(journey.service.orderAfterPurchase.status).toBe("AWAITING_DELIVERY");
    expect(journey.service.holdAfterPurchase?.status).toBe("PENDING");
    expect(journey.service.orderAfterConfirm.status).toBe("DELIVERED");
    expect(journey.service.holdAfterConfirm?.status).toBe("RELEASED");
    expect(journey.buyerBalanceAfter).toBe(E2E_PAZARYERI_START_MINOR - 2 * E2E_PAZARYERI_PRICE_MINOR);
    expect(journey.sellerBalanceAfter).toBe(18_000);
    expect(journey.platformBalanceAfter).toBe(2_000);
    expect(journey.ledger.snapshot(E2E_PAZARYERI_BUYER_ID).amountMinor).toBe(
      journey.buyerBalanceAfter,
    );
    expect(journey.ledger.snapshot(E2E_PAZARYERI_SELLER_ID).amountMinor).toBe(18_000);
    expect(journey.ledger.snapshot(E2E_PAZARYERI_PLATFORM_ID).amountMinor).toBe(2_000);
  });

  it("Studio: üretim LLM Debit + artifact; 413 tavanında debit yok", async () => {
    const journey = await runStudioCashJourney();
    expect(journey.text.generation.status).toBe("SUCCEEDED");
    expect(journey.text.debitMinor).toBe(E2E_STUDIO_TEXT_FLOOR);
    expect(journey.text.remainingMinor).toBe(E2E_STUDIO_START_MINOR - E2E_STUDIO_TEXT_FLOOR);
    expect(journey.text.providerCalls).toBe(1);
    expect(journey.image.generation.status).toBe("SUCCEEDED");
    expect(journey.image.asset.assetType).toBe("IMAGE");
    expect(journey.image.asset.contentHash).toMatch(/^[a-f0-9]{64}$/);
    expect(journey.image.debitMinor).toBe(E2E_STUDIO_IMAGE_FLOOR);
    expect(journey.image.remainingMinor).toBe(
      E2E_STUDIO_START_MINOR - E2E_STUDIO_TEXT_FLOOR - E2E_STUDIO_IMAGE_FLOOR,
    );
    expect(journey.image.providerCalls).toBe(1);
    expect(journey.ceiling.threw).toBe(true);
    expect(journey.ceiling.debitUnchanged).toBe(true);
    expect(journey.ceiling.assetCount).toBe(1);
    expect(journey.ceiling.balanceMinor).toBe(
      E2E_STUDIO_START_MINOR - E2E_STUDIO_TEXT_FLOOR - E2E_STUDIO_IMAGE_FLOOR,
    );
    expect(journey.ledger.snapshot(E2E_STUDIO_USER_ID).amountMinor).toBe(
      journey.ceiling.balanceMinor,
    );
  });
});
