import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  EXPECTED_PRISMA_MIGRATIONS,
  EXPECTED_SQL,
  assertHostedApplyTargetUrl,
  hostedApplyForbidsLabStub,
  inspectHostedApplyDiskPlan,
  isHostedSupabaseDirectUrl,
  isLabLoopbackUrl,
} from "../../scripts/ops-migrate-lib";
import { cashIntegrityEqual } from "../../scripts/ops-pg-backup-restore-lib";
import { parseAnomalyListCliArgs } from "../../scripts/ops-list-payment-anomalies-lib";
import { parseRevokeCliArgs } from "../../scripts/ops-revoke-academy-certificate-lib";
import { isPaytrSandboxEnabled } from "@/lib/kernel/payments/paytr/checkout";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { RAIL_IS_COPY } from "../../apps/rail-is/src/ui/copy";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("saha pilotu — hosted apply disk planı", () => {
  it("27 Prisma + sekiz SQL birebir; ops:migrate lab stub basmaz", () => {
    expect(EXPECTED_PRISMA_MIGRATIONS).toHaveLength(27);
    expect(EXPECTED_SQL).toHaveLength(8);
    const plan = inspectHostedApplyDiskPlan(ROOT);
    expect(plan.issues).toEqual([]);
    expect(plan.prismaFolders).toEqual([...EXPECTED_PRISMA_MIGRATIONS]);
    expect(plan.sqlFiles).toEqual([...EXPECTED_SQL]);
    expect(
      hostedApplyForbidsLabStub(
        readSrc("scripts/ops-migrate.ts"),
        readSrc("scripts/ops-lab-postgres.ts"),
      ),
    ).toEqual([]);
    expect(readSrc("scripts/ops-hosted-apply-preflight.ts")).toContain("assertHostedApplyTargetUrl");
    expect(readSrc("scripts/ops-hosted-apply-preflight.ts")).not.toContain("ensureLabAuthSchema");
    expect(readSrc("scripts/ops-hosted-apply-preflight.ts")).not.toContain("resetLabPublicSchema");
  });

  it("hosted Direct URL lab loopback'u reddeder; pooler yasak", () => {
    expect(isHostedSupabaseDirectUrl("postgresql://postgres:x@db.abcdefgh.supabase.co:5432/postgres")).toBe(
      true,
    );
    expect(isLabLoopbackUrl("postgresql://postgres:postgres@127.0.0.1:5432/yetkin_rail_lab")).toBe(true);
    expect(
      isHostedSupabaseDirectUrl("postgresql://postgres:postgres@127.0.0.1:5432/yetkin_rail_lab"),
    ).toBe(false);
    expect(() =>
      assertHostedApplyTargetUrl("postgresql://postgres:postgres@127.0.0.1:5432/yetkin_rail_lab"),
    ).toThrow(/lab loopback/);
    expect(() =>
      assertHostedApplyTargetUrl(
        "postgresql://postgres:x@aws-0-eu-central-1.pooler.supabase.com:6543/postgres",
      ),
    ).toThrow(/havuz/);
  });
});

describe("saha pilotu — iptal CLI ve yedek sapması", () => {
  it("revoke CLI hash+gerekçe ister; HTTP admin yok", () => {
    expect("error" in parseRevokeCliArgs([])).toBe(true);
    const short = parseRevokeCliArgs(["--hash", "abc"]);
    expect("error" in short && short.error.includes("Hash")).toBe(true);
    const missingReason = parseRevokeCliArgs(["--hash", "deadbeefdeadbeef"]);
    expect("error" in missingReason && missingReason.error.includes("--reason")).toBe(true);
    expect(parseRevokeCliArgs(["--hash", "deadbeefdeadbeef", "--reason", "sahte belge gerekçesi"])).toEqual({
      hash: "deadbeefdeadbeef",
      reason: "sahte belge gerekçesi",
    });
    expect(readSrc("scripts/ops-revoke-academy-certificate.ts")).toContain("runOperatorCertificateRevoke");
    expect(readSrc("scripts/ops-revoke-academy-certificate-lib.ts")).toContain("revokeAcademyCertificate");
    expect(readSrc("lib/academy/certificate-lifecycle.ts")).toContain("HTTP yüzeyi bu fazda yok");
    expect(readSrc("scripts/ops-list-payment-anomalies.ts")).toContain("listPaymentAnomalies");
    expect(parseAnomalyListCliArgs(["--limit", "20"]).limit).toBe(20);
  });

  it("nakit anlık görüntü sapmasını yakalar", () => {
    const left = {
      ledgerCount: 2,
      ledgerIdempotencyKeys: ["a", "b"],
      idempotencyCount: 1,
      idempotencySlots: ["u\t/r\tk"],
      anomalyCount: 1,
      anomalyRequestIds: ["req-1"],
      walletCount: 1,
      walletSumMinor: 100,
    };
    expect(cashIntegrityEqual(left, { ...left })).toEqual([]);
    expect(
      cashIntegrityEqual(left, { ...left, ledgerCount: 3, ledgerIdempotencyKeys: ["a", "b", "c"] }),
    ).not.toEqual([]);
    expect(cashIntegrityEqual(left, { ...left, anomalyRequestIds: ["req-2"] })).toContain(
      "payment_anomalies.request_id sapması",
    );
  });
});

describe("saha pilotu — PayTR sandbox ve usta kopyası", () => {
  it("PAYTR_SANDBOX=1 test_mode; mock bakiyeye düşmez", () => {
    expect(isPaytrSandboxEnabled({ PAYTR_SANDBOX: "1" })).toBe(true);
    expect(isPaytrSandboxEnabled({ PAYTR_SANDBOX: "" })).toBe(false);
    expect(readSrc("components/kernel/wallet-top-up-form.tsx")).toContain("sandboxHint");
    expect(readSrc("components/kernel/wallet-top-up-form.tsx")).toContain("sandboxMode");
    expect(readSrc("app/(kernel)/cuzdan/page.tsx")).toContain("isPaytrSandboxEnabled");
    expect(readSrc("app/api/(kernel)/wallet/top-up/route.ts")).toContain("sandboxMode");
    expect(readSrc("lib/kernel/payments/paytr/webhook-settle.ts")).toContain("recordPaymentAnomaly");
    expect(readSrc(".env.example")).toContain('PAYTR_SANDBOX="1"');
    expect(readSrc(".env.example")).toContain("ops:list-payment-anomalies");
  });

  it("kazandın / bakiyen arttı yok; freeze metni usta yüzeyinde durur", () => {
    const surfaces = [
      readSrc("lib/copy/sen-voice/freelancer.ts"),
      readSrc("lib/copy/sen-voice/ux.ts"),
      readSrc("lib/copy/sen-voice/dashboard.ts"),
      readSrc("lib/copy/sen-voice/notice.ts"),
      readSrc("apps/rail-is/src/ui/copy.ts"),
      readSrc("components/freelancer/contract-actions.tsx"),
      readSrc("components/freelancer/delivery-hero-card.tsx"),
    ].join("\n");
    expect(surfaces.toLocaleLowerCase("tr")).not.toContain("kazandın");
    expect(surfaces.toLocaleLowerCase("tr")).not.toContain("bakiyen arttı");
    expect(surfaces).not.toContain("Aktarılıyor");
    expect(readSrc("lib/copy/sen-voice/ux.ts")).not.toContain("İşi onayla ve");
    expect(SEN_VOICE.freelancer.actions.freezeBanner).toContain("cüzdanına yazılmaz");
    expect(SEN_VOICE.ux.bridge.released.body).toContain("yazılmaz");
    expect(SEN_VOICE.ux.delivery.releaseFrozen("₺10,00")).toContain("henüz yazılmaz");
    expect(RAIL_IS_COPY.release.hint).toContain("cüzdanına yazılmaz");
    expect(readSrc("components/freelancer/escrow-hold-steps.tsx")).toContain("freezeBanner");
  });
});
