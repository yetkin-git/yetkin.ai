import { YETKINHIBE_COPY } from "@/lib/yetkinhibe/copy";
import type {
  CompanyGrantProfile,
  EcosystemBridgeModule,
  GrantCall,
  GrantEligibilityGap,
  GrantEligibilityGapItem,
  GrantReadinessSignals,
} from "@/lib/yetkinhibe/types";

/**
 * Yön 2 (Proaktif/Dönüşüm) — hedeflenen hibe çağrısı için şirketin eksik analizini çıkarır.
 * Bu modül saf hesaptır: veri okumaz, yetki denetlemez.
 *
 * Sınır: şirket üyeliği (P0 IDOR kapısı), çağrının katalogdan çözülmesi ve ekosistem
 * köprülerinin üretilmesi bu fonksiyonun dışındadır. Rota katmanı (F3b) bunları önce yapar
 * ve sonuçları girdi olarak verir. Üyelik doğrulanmadan bu fonksiyonun çıktısı kullanılmaz.
 */

export type GrantGapBridge = {
  module: EcosystemBridgeModule;
  href: string;
  ctaLabel: string;
};

/** Ekosistem köprüleri dışarıdan verilir. F6 öncesinde verilmez; eksik kalemler CTA göstermez. */
export type GrantGapBridges = {
  freelancer?: GrantGapBridge | null;
  studioAuto?: GrantGapBridge | null;
  academy?: GrantGapBridge | null;
};

export type GrantEligibilityGapPureInput = {
  companyId: string;
  grant: Pick<GrantCall, "id" | "title" | "eligibility">;
  profile?: Partial<CompanyGrantProfile>;
  readiness?: Partial<GrantReadinessSignals>;
  bridges?: GrantGapBridges;
  now?: Date;
};

function buildGapItem(input: {
  criterionKey: string;
  label: string;
  satisfied: boolean;
  detailOk: string;
  detailMissing: string;
  bridge?: GrantGapBridge | null;
}): GrantEligibilityGapItem {
  const bridge = input.satisfied ? null : (input.bridge ?? null);
  return {
    criterionKey: input.criterionKey,
    label: input.label,
    status: input.satisfied ? "OK" : "MISSING",
    detail: input.satisfied ? input.detailOk : input.detailMissing,
    bridgeModule: bridge?.module ?? null,
    bridgeHref: bridge?.href ?? null,
    bridgeCtaLabel: bridge?.ctaLabel ?? null,
  };
}

export function buildGrantEligibilityGap(input: GrantEligibilityGapPureInput): GrantEligibilityGap {
  const { grant, bridges = {} } = input;
  const readiness = input.readiness ?? {};
  const profile = input.profile ?? {};
  const freelancerBridge = bridges.freelancer ?? null;
  const studioAutoBridge = bridges.studioAuto ?? null;
  const academyBridge = bridges.academy ?? null;
  const copy = YETKINHIBE_COPY.gap;

  const gaps: GrantEligibilityGapItem[] = [];

  if (grant.eligibility.requiresRdActivity) {
    gaps.push(
      buildGapItem({
        criterionKey: "requiresRdActivity",
        label: "Ar-Ge yenilikçi yön tanımı",
        satisfied: (profile.rdMaturityLevel ?? "NONE") !== "NONE",
        detailOk: copy.rdActivityOk,
        detailMissing: copy.rdActivityMissing,
        bridge: freelancerBridge,
      }),
    );
  }

  gaps.push(
    buildGapItem({
      criterionKey: "technicalDrawings",
      label: "Teknik çizim / prototip dokümantasyonu",
      satisfied: readiness.hasTechnicalDrawings === true,
      detailOk: copy.technicalDrawingsOk,
      detailMissing: copy.technicalDrawingsMissing,
      bridge: studioAutoBridge,
    }),
  );

  gaps.push(
    buildGapItem({
      criterionKey: "consultancySupport",
      label: "Danışmanlık / mevzuat desteği",
      satisfied: readiness.hasConsultancySupport === true,
      detailOk: copy.consultancyOk,
      detailMissing: copy.consultancyMissing,
      bridge: freelancerBridge,
    }),
  );

  gaps.push(
    buildGapItem({
      criterionKey: "relevantTraining",
      label: "Hibe başvuru eğitimi / sertifikasyon",
      satisfied: readiness.hasCompletedRelevantTraining === true,
      detailOk: copy.trainingOk,
      detailMissing: copy.trainingMissing,
      bridge: academyBridge,
    }),
  );

  gaps.push(
    buildGapItem({
      criterionKey: "budgetPlan",
      label: "Bütçe / zaman çizelgesi taslağı",
      satisfied: readiness.hasBudgetPlan === true,
      detailOk: copy.budgetPlanOk,
      detailMissing: copy.budgetPlanMissing,
    }),
  );

  if (grant.eligibility.requiresExportActivity) {
    gaps.push(
      buildGapItem({
        criterionKey: "requiresExportActivity",
        label: "İhracat faaliyet kanıtı",
        satisfied: profile.exportActive === true,
        detailOk: copy.exportOk,
        detailMissing: copy.exportMissing,
        bridge: freelancerBridge,
      }),
    );
  }

  if (grant.eligibility.requiresPatentOrUtilityModel) {
    gaps.push(
      buildGapItem({
        criterionKey: "requiresPatentOrUtilityModel",
        label: "Patent / faydalı model tescili",
        satisfied: profile.hasPatentOrUtilityModel === true,
        detailOk: copy.patentOk,
        detailMissing: copy.patentMissing,
        bridge: freelancerBridge,
      }),
    );
  }

  const satisfiedCount = gaps.filter((g) => g.status === "OK").length;
  const overallReadinessPct =
    gaps.length === 0 ? 0 : Math.round((satisfiedCount / gaps.length) * 100);

  return {
    companyId: input.companyId,
    grantId: grant.id,
    grantTitle: grant.title,
    overallReadinessPct,
    gaps,
    generatedAt: (input.now ?? new Date()).toISOString(),
  };
}
