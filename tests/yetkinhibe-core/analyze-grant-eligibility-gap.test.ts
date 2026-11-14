import { describe, expect, it } from "vitest";

import {
  buildGrantEligibilityGap,
  type GrantGapBridges,
} from "@/lib/yetkinhibe/analyze-grant-eligibility-gap";
import {
  buildPreviewGapItemsFromCriteria,
  computePreviewReadinessPct,
} from "@/lib/yetkinhibe/build-preview-gap-from-criteria";
import { YETKINHIBE_COPY } from "@/lib/yetkinhibe/copy";
import type { GrantEligibilityCriteria, GrantMatchCriterionResult } from "@/lib/yetkinhibe/types";

import { makeGrantCall, OPEN_CRITERIA } from "./fixtures";

const BRIDGES: GrantGapBridges = {
  freelancer: { module: "freelancer", href: "/freelancer", ctaLabel: "Danışman bağla" },
  studioAuto: { module: "studio-auto", href: "/studio-auto", ctaLabel: "Çizim üret" },
  academy: { module: "academy", href: "/academy", ctaLabel: "Eğitim tamamla" },
};

const ALL_REQUIREMENTS: GrantEligibilityCriteria = {
  ...OPEN_CRITERIA,
  requiresRdActivity: true,
  requiresExportActivity: true,
  requiresPatentOrUtilityModel: true,
};

describe("buildGrantEligibilityGap — eksik analizi (saf)", () => {
  it("gereksinimi olmayan çağrıda yalnız dört temel kalem üretilir", () => {
    const gap = buildGrantEligibilityGap({
      companyId: "c",
      grant: makeGrantCall({ eligibility: OPEN_CRITERIA }),
    });

    expect(gap.gaps.map((item) => item.criterionKey)).toEqual([
      "technicalDrawings",
      "consultancySupport",
      "relevantTraining",
      "budgetPlan",
    ]);
  });

  it("gereksinimler varsa ilgili kalemler sabit sırayla eklenir", () => {
    const gap = buildGrantEligibilityGap({
      companyId: "c",
      grant: makeGrantCall({ eligibility: ALL_REQUIREMENTS }),
    });

    expect(gap.gaps.map((item) => item.criterionKey)).toEqual([
      "requiresRdActivity",
      "technicalDrawings",
      "consultancySupport",
      "relevantTraining",
      "budgetPlan",
      "requiresExportActivity",
      "requiresPatentOrUtilityModel",
    ]);
  });

  it("eksik Ar-Ge kalemi freelancer köprüsüne bağlanır", () => {
    const gap = buildGrantEligibilityGap({
      companyId: "c",
      grant: makeGrantCall({ eligibility: { ...OPEN_CRITERIA, requiresRdActivity: true } }),
      profile: { rdMaturityLevel: "NONE" },
      bridges: BRIDGES,
    });

    const rd = gap.gaps.find((item) => item.criterionKey === "requiresRdActivity");
    expect(rd).toMatchObject({
      status: "MISSING",
      detail: YETKINHIBE_COPY.gap.rdActivityMissing,
      bridgeModule: "freelancer",
      bridgeHref: "/freelancer",
      bridgeCtaLabel: "Danışman bağla",
    });
  });

  it("karşılanan kalem köprü taşımaz ve olumlu metin kullanır", () => {
    const gap = buildGrantEligibilityGap({
      companyId: "c",
      grant: makeGrantCall(),
      readiness: { hasTechnicalDrawings: true },
      bridges: BRIDGES,
    });

    const drawings = gap.gaps.find((item) => item.criterionKey === "technicalDrawings");
    expect(drawings).toMatchObject({
      status: "OK",
      detail: YETKINHIBE_COPY.gap.technicalDrawingsOk,
      bridgeModule: null,
      bridgeHref: null,
      bridgeCtaLabel: null,
    });
  });

  it("köprü verilmezse eksik kalem CTA'sız kalır", () => {
    const gap = buildGrantEligibilityGap({
      companyId: "c",
      grant: makeGrantCall({ eligibility: { ...OPEN_CRITERIA, requiresRdActivity: true } }),
      profile: { rdMaturityLevel: "NONE" },
    });

    const rd = gap.gaps.find((item) => item.criterionKey === "requiresRdActivity");
    expect(rd).toMatchObject({
      status: "MISSING",
      bridgeModule: null,
      bridgeHref: null,
      bridgeCtaLabel: null,
    });
  });

  it("hazırlık yüzdesi karşılanan kalem sayısına göre hesaplanır", () => {
    const gap = buildGrantEligibilityGap({
      companyId: "c",
      grant: makeGrantCall({ eligibility: ALL_REQUIREMENTS }),
      profile: { rdMaturityLevel: "EARLY", exportActive: true, hasPatentOrUtilityModel: true },
      readiness: {
        hasTechnicalDrawings: true,
        hasBudgetPlan: true,
        hasConsultancySupport: false,
        hasCompletedRelevantTraining: false,
      },
    });

    expect(gap.gaps.filter((item) => item.status === "OK")).toHaveLength(5);
    expect(gap.overallReadinessPct).toBe(71);
  });

  it("tüm kalemler karşılanırsa yüzde 100 olur", () => {
    const gap = buildGrantEligibilityGap({
      companyId: "c",
      grant: makeGrantCall(),
      readiness: {
        hasTechnicalDrawings: true,
        hasConsultancySupport: true,
        hasCompletedRelevantTraining: true,
        hasBudgetPlan: true,
      },
    });

    expect(gap.overallReadinessPct).toBe(100);
  });

  it("verilen zamanı üretim zamanı olarak kullanır ve kimlikleri taşır", () => {
    const gap = buildGrantEligibilityGap({
      companyId: "sirket-1",
      grant: makeGrantCall({ id: "cagri-7", title: "Çağrı Yedi" }),
      now: new Date("2026-11-09T10:00:00.000Z"),
    });

    expect(gap).toMatchObject({
      companyId: "sirket-1",
      grantId: "cagri-7",
      grantTitle: "Çağrı Yedi",
      generatedAt: "2026-11-09T10:00:00.000Z",
    });
  });
});

describe("önizleme eksik kartı — build-preview-gap-from-criteria", () => {
  const criteria: GrantMatchCriterionResult[] = [
    { key: "sector", label: "Sektör uyumu", satisfied: true, weightPct: 15 },
    { key: "requiresExportActivity", label: "İhracat faaliyeti", satisfied: false, weightPct: 20 },
  ];

  it("karşılanan kriteri OK, karşılanmayanı MISSING olarak eşler", () => {
    const [ok, missing] = buildPreviewGapItemsFromCriteria(criteria);

    expect(ok).toEqual({
      criterionKey: "sector",
      label: "Sektör uyumu",
      status: "OK",
      detail: "Sektör uyumu şartını karşılıyorsun.",
      bridgeModule: null,
      bridgeHref: null,
      bridgeCtaLabel: null,
    });
    expect(missing?.status).toBe("MISSING");
    expect(missing?.detail).toBe(
      "İhracat faaliyeti şartın henüz karşılanmıyor — profilini veya hazırlık dosyanı güncelleyerek kapatabilirsin.",
    );
  });

  it("hazırlık yüzdesi OK oranını yuvarlar; boş listede 0 döner", () => {
    const items = buildPreviewGapItemsFromCriteria([
      ...criteria,
      { key: "companyAge", label: "Şirket yaşı", satisfied: true, weightPct: 10 },
    ]);

    expect(computePreviewReadinessPct(items)).toBe(67);
    expect(computePreviewReadinessPct([])).toBe(0);
  });
});
