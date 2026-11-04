import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  maskIdentityText,
  maskUserId,
  parseLicenseGapRefundBody,
  parseOpsGrantBody,
  parseOpsRevokeBody,
  projectAdminOpsBoard,
  selectLicenseGap,
  OPS_FREE_AMOUNT_ERROR,
} from "@/lib/kernel/admin/ops-desk";
import type { LicenseGap } from "@/lib/kernel/payments/license-gap";

const USER = "11111111-1111-4111-8111-111111111111";

function read(path: string): string {
  return readFileSync(path, "utf8");
}

describe("operasyon masası", () => {
  it("kimliği maskeler ve e-posta aramasını reddeder", () => {
    expect(maskUserId(USER)).toBe("1111…1111");
    expect(maskIdentityText(`kisi ${USER} a@b.com`)).toBe("kisi 1111…1111 •••@•••");
    expect("error" in parseOpsGrantBody({ email: "a@b.com", slug: "01_office_ai", reason: "laboratuvar bağışı" })).toBe(
      true,
    );
  });

  it("serbest tutarı reddeder; sapma dışı sipariş seçilmez", () => {
    expect(parseLicenseGapRefundBody({ merchantOid: "oid-1", amountMinor: 100, reason: "sapma iadesi gerekçe" })).toEqual({
      error: OPS_FREE_AMOUNT_ERROR,
    });
    expect(parseLicenseGapRefundBody({ merchantOid: "oid-1", reason: "sapma iadesi gerekçe" })).toEqual({
      merchantOid: "oid-1",
      reason: "sapma iadesi gerekçe",
    });
    const gap: LicenseGap = {
      merchantOid: "oid-1",
      orderId: "order-1",
      userId: USER,
      purpose: "academy-license:01_office_ai",
      amountMinor: 89000,
      product: "academy",
      reason: "missing_purchase",
    };
    expect(selectLicenseGap([gap], "oid-2")).toBeNull();
    expect(selectLicenseGap([gap], "oid-1")?.amountMinor).toBe(89000);
  });

  it("iptal gövdesi 64 hex ve gerekçe ister", () => {
    expect("error" in parseOpsRevokeBody({ hash: "abc", reason: "kısa" })).toBe(true);
    const hash = "a".repeat(64);
    expect(parseOpsRevokeBody({ hash, reason: "sahte belge gerekçesi" })).toEqual({
      hash,
      reason: "sahte belge gerekçesi",
    });
  });

  it("olay masası kullanıcı kimliğini yüzeye çıkarmaz", () => {
    const view = projectAdminOpsBoard({
      now: new Date("2026-11-04T12:00:00.000Z"),
      snapshot: {
        orders: [
          {
            id: "order-1",
            userId: USER,
            merchantOid: "oid-1",
            purpose: "academy-license:01_office_ai",
            amountMinor: 1000,
          },
        ],
        academySeats: [],
        juniorSeats: [],
        refundedMerchantOids: [],
      },
      readout: {
        anomalies: [
          {
            kind: "license_gap",
            merchantOid: "oid-1",
            expectedMinor: 1000,
            reportedMinor: 0,
            detail: `user ${USER}`,
            createdAt: new Date("2026-11-04T10:00:00.000Z"),
          },
        ],
        licenseGapAnomalyCount: 1,
        pending: [
          {
            merchantOid: "pend-1",
            purpose: "wallet-top-up",
            amountMinor: 500,
            currencyCode: "TRY",
            createdAt: new Date("2026-11-04T08:00:00.000Z"),
            userId: USER,
          },
        ],
        pendingTotal: 1,
        ghostCount: 2,
        ghostGrossMinor: 2500,
        audits: [
          {
            action: "license_grant",
            target: `${USER}:course`,
            detail: "01_office_ai",
            actorUserId: USER,
            createdAt: new Date("2026-11-04T09:00:00.000Z"),
          },
        ],
      },
    });
    expect(view.gapCount).toBe(1);
    expect(JSON.stringify(view)).not.toContain(USER);
    expect(view.ghosts.count).toBe(2);
    expect(view.pending.rows[0]?.userMasked).toBe("1111…1111");
  });

  it("konsol fail-closed ve okuma denetim yazmaz", () => {
    const page = read("app/(kernel)/admin/ops/page.tsx");
    expect(page).toContain("resolveSuperAdminAccess");
    expect(page).toContain("Forbidden");
    expect(page).toContain("index: false");
    expect(page).not.toContain("writeSuperAdminAudit");
    const load = read("lib/kernel/admin/ops-load.ts");
    expect(load).not.toContain("@/lib/academy");
    expect(load).not.toContain("@/lib/junior");
    expect(load).not.toContain("writeSuperAdminAudit");
    for (const route of [
      "app/api/(kernel)/admin/ops/grant/route.ts",
      "app/api/(kernel)/admin/ops/certificate-revoke/route.ts",
    ]) {
      const source = read(route);
      expect(source).toContain('export const auth = "admin"');
      expect(source).toContain("requireSuperAdmin");
      expect(source).toContain("writeSuperAdminAudit");
    }
    const refundRoute = read("app/api/(kernel)/admin/ops/license-gap-refund/route.ts");
    expect(refundRoute).toContain('export const auth = "admin"');
    expect(refundRoute).toContain("requireSuperAdmin");
    expect(refundRoute).toContain("refundLicenseGapExact");
    expect(read("lib/kernel/payments/license-gap-refund.ts")).toContain('action: "manual_refund"');
    expect(read("app/(public)/rehber/page.tsx")).toContain("guideArticleJsonLd");
    expect(read("app/(public)/rehber/page.tsx")).toContain("faqPageJsonLd");
    expect(read("app/robots.ts")).toContain("ROBOTS_DISALLOW_PATHS");
    expect(read("app/sitemap.ts")).toContain("isRobotsDisallowedPath");
  });
});
