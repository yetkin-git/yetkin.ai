import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  isKurumsalMutationPath,
  matchEdgeRateLimit,
  HTTP_RATE_LIMITS,
} from "@/lib/kernel/security/http-rate-limit";
import { normalizeKurumsalLeadCity, KURUMSAL_LEAD_PROVINCES } from "@/lib/sales/kurumsal-lead-city";
import {
  isKurumsalScreeningOrderPurpose,
  KURUMSAL_JOBS_PER_LICENSE,
  KURUMSAL_SCREENING_ORDER_PURPOSE,
} from "@/lib/sales/kurumsal-screening-purpose";
import {
  isKurumsalTaxNumber,
  isSyntheticTaxNumberPattern,
  isValidTurkishTckn,
  isValidTurkishVkn,
  parseKurumsalJobDraft,
  kurumsalJobVertical,
} from "@/lib/sales/kurumsal-screening";
import { yetkinCvSkillCatalog } from "@/lib/career/yetkincv";
import { PUBLIC_PREORDER_LABEL } from "@/lib/pricing/showcase-price";
import {
  parseKurumsalOfferPatchBody,
  parseKurumsalOfferStatusFilter,
} from "@/lib/kernel/admin/kurumsal-offer-parse";

function src(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("Kurumsal Faz 2 tedavisi (F2.1–F2.11, D-01–D-03)", () => {
  it("F2.1 / D-01 — purpose kesin eşleşir; contains yok; kota 3 ilan/paket", () => {
    expect(KURUMSAL_JOBS_PER_LICENSE).toBe(3);
    expect(isKurumsalScreeningOrderPurpose(KURUMSAL_SCREENING_ORDER_PURPOSE)).toBe(true);
    expect(isKurumsalScreeningOrderPurpose("kurumsal-license:job-screening-pack")).toBe(true);
    expect(isKurumsalScreeningOrderPurpose("other-job-screening-pack-leak")).toBe(false);
    expect(isKurumsalScreeningOrderPurpose("academy-license:job-screening-pack")).toBe(false);
    const entitlement = src("lib/sales/kurumsal-screening-entitlement.ts");
    expect(entitlement).not.toContain("contains:");
    expect(entitlement).toContain("quota-exhausted");
    expect(entitlement).toContain("KURUMSAL_JOBS_PER_LICENSE");
    const load = src("lib/sales/kurumsal-screening-load.ts");
    expect(load).toContain("quota-exhausted");
    expect(load).toContain("İlan kotası doldu");
  });

  it("F2.3 / Y-07 — VKN/TCKN checksum; sahte dizi reddi; taxNumber zorunlu", () => {
    expect(isSyntheticTaxNumberPattern("1234567890")).toBe(true);
    expect(isKurumsalTaxNumber("1234567890")).toBe(false);
    expect(isKurumsalTaxNumber("0000000000")).toBe(false);
    expect(isValidTurkishVkn("1111111114")).toBe(true);
    expect(isKurumsalTaxNumber("1111111114")).toBe(true);
    expect(isValidTurkishTckn("10000000146")).toBe(true);
    expect(isKurumsalTaxNumber("10000000146")).toBe(true);
    expect(isKurumsalTaxNumber("12345678901")).toBe(false);

    const skills = yetkinCvSkillCatalog("ecommerce") ?? [];
    const now = new Date("2026-11-26T12:00:00+03:00");
    const missingTax = parseKurumsalJobDraft(
      {
        companyName: "Ada Ltd",
        title: "Depo sorumlusu",
        vertical: "ECOMMERCE",
        description: "Depo sayımı, iade ve kanal stoğu aynı kaynaktan yürür. Ölçülmeyen vaat yazılmaz.",
        criteriaWeights: [
          { key: skills[0]?.key, weight: 50 },
          { key: skills[1]?.key, weight: 30 },
          { key: skills[2]?.key, weight: 20 },
        ],
        minScore: 75,
        shortlistLimit: 5,
      },
      (vertical) => {
        const row = kurumsalJobVertical(vertical);
        return row ? yetkinCvSkillCatalog(row.yetkinCvVerticalId) : null;
      },
      now,
    );
    expect(missingTax.ok).toBe(false);
    if (!missingTax.ok) {
      expect(missingTax.error).toMatch(/zorunlu/i);
    }
    const fakeTax = parseKurumsalJobDraft(
      {
        companyName: "Ada Ltd",
        title: "Depo sorumlusu",
        vertical: "ECOMMERCE",
        description: "Depo sayımı, iade ve kanal stoğu aynı kaynaktan yürür. Ölçülmeyen vaat yazılmaz.",
        taxNumber: "1234567890",
        criteriaWeights: [
          { key: skills[0]?.key, weight: 50 },
          { key: skills[1]?.key, weight: 30 },
          { key: skills[2]?.key, weight: 20 },
        ],
        minScore: 75,
        shortlistLimit: 5,
      },
      (vertical) => {
        const row = kurumsalJobVertical(vertical);
        return row ? yetkinCvSkillCatalog(row.yetkinCvVerticalId) : null;
      },
      now,
    );
    expect(fakeTax.ok).toBe(false);
  });

  it("F2.2 / Y-03 — doğrulama mirası + admin ops formu + peer updateMany", () => {
    const load = src("lib/sales/kurumsal-screening-load.ts");
    expect(load).toContain("priorVerified");
    expect(load).toContain("verifiedEmployerAt: priorVerified");
    const route = src("app/api/(kernel)/admin/ops/employer-verify/route.ts");
    expect(route).toContain("updateMany");
    expect(route).toContain("ownerUserId: job.ownerUserId");
    expect(route).toContain("taxNumber: job.taxNumber");
    const ops = src("components/kernel/admin-ops-actions.tsx");
    expect(ops).toContain("ADMIN_OPS_EMPLOYER_VERIFY_PATH");
    expect(ops).toContain("employerVerify");
  });

  it("F2.4 / F2.5 / D-02 / D-03 — lead mükerrer, honeypot, 81 il, quotedAmount, admin PATCH", () => {
    expect(KURUMSAL_LEAD_PROVINCES).toHaveLength(81);
    expect(normalizeKurumsalLeadCity("istanbul")).toBe("İstanbul");
    expect(normalizeKurumsalLeadCity("Ankara")).toBe("Ankara");
    expect(normalizeKurumsalLeadCity("Atlantis")).toBeNull();

    const lead = src("app/api/lead/route.ts");
    expect(lead).toContain("duplicate: true");
    expect(lead).toContain("honeypotFilled");
    expect(lead).toContain("normalizeKurumsalLeadCity");
    expect(lead).toContain("snapshotKurumsalOfferQuotedAmountMinor");
    expect(lead).toContain("DUPLICATE_WINDOW_MS");

    const schema = src("prisma/schema/b2b.prisma");
    expect(schema).toContain("KurumsalOfferRequestStatus");
    expect(schema).toContain("quotedAmountMinor");
    expect(schema).toContain("adminNote");
    expect(schema).toContain("handledAt");

    const migration = src(
      "prisma/migrations/20261126010000_kurumsal_faz2_lead_quota/migration.sql",
    );
    expect(migration).toContain("KurumsalOfferRequestStatus");
    expect(migration).toContain("quoted_amount_minor");
    expect(migration).toContain("ENABLE ROW LEVEL SECURITY");
    expect(migration).toContain("FORCE ROW LEVEL SECURITY");
    expect(migration).toContain("rls_deny_unscoped");

    expect(parseKurumsalOfferStatusFilter("won")).toBe("WON");
    expect(parseKurumsalOfferStatusFilter("ALL")).toBe("ALL");
    expect(parseKurumsalOfferPatchBody({ status: "CONTACTED", adminNote: "Arandı" })).toEqual({
      status: "CONTACTED",
      adminNote: "Arandı",
    });
    const rejectedNew = parseKurumsalOfferPatchBody({ status: "NEW" });
    expect("error" in rejectedNew).toBe(true);

    const patchRoute = src("app/api/(kernel)/admin/b2b/[id]/route.ts");
    expect(patchRoute).toContain("patchKurumsalOfferRequest");
    const adminPage = src("app/(kernel)/admin/b2b/page.tsx");
    expect(adminPage).toContain("AdminKurumsalOffers");
    expect(adminPage).not.toMatch(/take:\s*50/);
  });

  it("F2.6 / F2.7 / F2.8 / F2.11 — kokpit take, emailConfirmedAt, kenar rate-limit, persistBands", () => {
    const load = src("lib/sales/kurumsal-screening-load.ts");
    expect(load).toContain("KURUMSAL_COCKPIT_JOB_TAKE");
    expect(load).toContain("KURUMSAL_COCKPIT_APPLICANT_TAKE");
    expect(load).toContain("KURUMSAL_EMAIL_CONFIRM_REQUIRED");
    expect(load).toContain("Başvurmadan önce e-posta adresini doğrula.");
    expect(load).toContain("previewCvSummary");
    expect(load).toContain("isConfirmedAccountEmail");
    expect(load).toContain("updateMany");

    const apply = src("app/api/ilan/[slug]/basvuru/route.ts");
    expect(apply).toContain("emailConfirmedAt: user.emailConfirmedAt");
    expect(apply).toContain("HTTP_RATE_LIMITS.kurumsalApplyUser");
    expect(apply).toContain("user.id");

    const ilan = src("app/api/kurumsal/ilanlar/route.ts");
    expect(ilan).toContain("HTTP_RATE_LIMITS.kurumsalIlanUser");
    expect(ilan).toContain("user.id");

    expect(isKurumsalMutationPath("/api/lead")).toBe(true);
    expect(isKurumsalMutationPath("/api/kurumsal/ilanlar")).toBe(true);
    expect(isKurumsalMutationPath("/api/ilan/foo/basvuru")).toBe(true);
    expect(isKurumsalMutationPath("/api/wallet/top-up")).toBe(false);
    expect(matchEdgeRateLimit("/api/lead", "POST")?.keyPrefix).toBe(HTTP_RATE_LIMITS.leadIp.keyPrefix);
    expect(matchEdgeRateLimit("/api/kurumsal/ilanlar", "POST")?.keyPrefix).toBe(
      HTTP_RATE_LIMITS.kurumsalMutationIp.keyPrefix,
    );
    expect(matchEdgeRateLimit("/api/ilan/x/basvuru", "POST")?.keyPrefix).toBe(
      HTTP_RATE_LIMITS.kurumsalMutationIp.keyPrefix,
    );
    expect(matchEdgeRateLimit("/api/kurumsal/ilanlar", "GET")).toBeNull();
  });

  it("F2.10 / O-05 — vitrin İK odaklı; Özel Teklif Al; ajans kartı yok", () => {
    expect(PUBLIC_PREORDER_LABEL).toBe("Özel Teklif Al");
    const page = src("app/(public)/kurumsal/page.tsx");
    expect(page).toContain("Kurumsal İK & Yetenek Seçme");
    expect(page).toContain("jobScreening");
    expect(page).not.toContain("E-ticaret ajans paketi");
    expect(page).not.toContain("10 mağaza koltuğu");
    expect(page).not.toContain("Kurumsal Tanımlama");
  });
});
