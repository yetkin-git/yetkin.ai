import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  GRANT_PREP_SCORE_DISCLAIMER,
  GRANT_PREP_WINDOW_TITLE,
  buildGrantPrepMasterPlan,
  grantPrepDocxFilename,
  grantPrepMasterPlanDocx,
  grantPrepScoreLine,
  renderGrantPrepMasterPlan,
  type GrantPrepMasterPlanInput,
} from "@/lib/yetkinhibe/master-plan";
import {
  rankGrantProgramFits,
  type GrantProgramFit,
} from "@/lib/yetkinhibe/program-fit";
import type { GrantBriefCall, GrantProgramBrief } from "@/lib/yetkinhibe/match-grant-programs-for-brief";
import type { GrantEligibilityCriteria } from "@/lib/yetkinhibe/types";

const OPEN: GrantEligibilityCriteria = {
  eligibleSectorCodes: null,
  minEmployeeCount: null,
  maxEmployeeCount: null,
  minCompanyAgeYears: null,
  maxCompanyAgeYears: null,
  requiresRdActivity: false,
  requiresExportActivity: false,
  requiresKobiStatus: false,
  requiresPatentOrUtilityModel: false,
};

const BRIEF: GrantProgramBrief = {
  provinceCode: "34",
  audience: "mevcut_kobi",
  naceGroup: "28",
  investmentFocus: "makine_techizat",
  employeeCount: 12,
  companyAgeYears: 4,
  rdMaturityLevel: "NONE",
  exportActive: false,
  hasPatentOrUtilityModel: false,
};

function plan(overrides: Partial<GrantPrepMasterPlanInput> = {}) {
  return buildGrantPrepMasterPlan({
    brief: BRIEF,
    grantId: "kosgeb-makine",
    title: "Makine Destek",
    sourceLabel: "KOSGEB",
    businessName: "Örnek Sanayi",
    eligibility: OPEN,
    requiredDocuments: [],
    ...overrides,
  });
}

function call(eligibility: GrantEligibilityCriteria): GrantBriefCall {
  return {
    id: "kosgeb-makine",
    title: "Makine Destek",
    sourceLabel: "KOSGEB",
    officialInfoUrl: "https://www.kosgeb.gov.tr/",
    status: "ACTIVE",
    remainingDays: 40,
    poolAmountMinor: null,
    maxSupportMinor: 100,
    supportRatioBps: 5000,
    sourceVerifiedAt: "2026-11-01T00:00:00.000Z",
    eligibility,
  };
}

function fitOf(eligibility: GrantEligibilityCriteria): GrantProgramFit {
  const row = rankGrantProgramFits(BRIEF, [call(eligibility)])[0];
  if (!row) {
    throw new Error("uyum satırı yok");
  }
  return row;
}

describe("hibe hazırlık master planı", () => {
  it("kriter uyumu analiz skorunun aynısıdır", () => {
    const eligibility: GrantEligibilityCriteria = {
      ...OPEN,
      requiresRdActivity: true,
      investmentFocus: ["yazilim_dijital"],
      eligibleRegionCodes: ["06"],
    };
    const row = plan({ eligibility });
    expect(row.currentScore).toBe(fitOf(eligibility).fitPct);
    expect(row.currentScore).toBe(73);
    expect(row.targetScore).toBe(91);
    expect(row.closable.map((gap) => gap.points)).toEqual([9, 9]);
    expect(row.closable.reduce((sum, gap) => sum + gap.points, 0)).toBe(row.targetScore - row.currentScore);
    expect(row.closable.map((gap) => gap.label)).toEqual([
      "Ar-Ge / Yazılım Personel İstihdam Planı",
      "Proforma Teklif ve Bütçe Kırılımı (Yazılım / dijitalleşme)",
    ]);
    expect(row.blockers.map((item) => item.key)).toEqual(["region"]);
    expect(row.targetScore).toBeLessThanOrEqual(100);
  });

  it("makine odağına izin veren çağrıda bütçe kırılımı o adla durur", () => {
    const row = plan({
      eligibility: { ...OPEN, investmentFocus: ["makine_techizat", "arge"] },
      brief: { ...BRIEF, investmentFocus: "ihracat" },
    });
    expect(row.closable.map((gap) => gap.label)).toEqual([
      "Proforma Teklif & Makine-Teçhizat Bütçe Kırılımı",
    ]);
    expect(row.scoreLine).toBe(grantPrepScoreLine(row));
    expect(row.scoreLine).toBe(
      `Mevcut Kriter Uyumu: %${row.currentScore} → Eksik 1 adımı tamamlarsan %${row.targetScore} uyuma ulaşırsın.`,
    );
  });

  it("katalog belgesi puan eklemez ve adı kontrol listesinde kalır", () => {
    const row = plan({
      requiredDocuments: ["Kapasite Raporu / Sanayi Sicil Belgesi", "  ", "Kapasite Raporu / Sanayi Sicil Belgesi"],
    });
    expect(row.currentScore).toBe(100);
    expect(row.targetScore).toBe(100);
    expect(row.closable).toEqual([]);
    expect(row.documents).toEqual(["Kapasite Raporu / Sanayi Sicil Belgesi"]);
    const text = renderGrantPrepMasterPlan(row);
    expect(text).toContain("«Kapasite Raporu / Sanayi Sicil Belgesi» belgesini katalogdaki adıyla hazırla.");
    expect(text).toContain(GRANT_PREP_SCORE_DISCLAIMER);
    expect(text).not.toContain("(+");
  });

  it("süre yoksa son tarih basmaz ve hazırlık penceresi der", () => {
    const row = plan({ applicationDeadline: "yarın", remainingDays: 12.5, status: "ACTIVE" });
    expect(row.window.kind).toBe("prep");
    expect(row.window.title).toBe(GRANT_PREP_WINDOW_TITLE);
    const text = renderGrantPrepMasterPlan(row);
    expect(text).toContain(GRANT_PREP_WINDOW_TITLE);
    expect(text).not.toMatch(/\d{2}\.\d{2}\.\d{4}/);
    expect(text).not.toContain("Kalan gün");
  });

  it("açık katalog penceresinde tarihi ve kalan günü katalog kaydından okur", () => {
    const row = plan({
      applicationDeadline: "2026-06-15T12:00:00.000Z",
      remainingDays: 12,
      status: "CLOSING_SOON",
    });
    expect(row.window.kind).toBe("catalog");
    expect(row.window.detail).toContain("Katalog son tarihi 15.06.2026.");
    expect(row.window.detail).toContain("Kalan gün: 12.");
    expect(row.window.title).not.toBe(GRANT_PREP_WINDOW_TITLE);
  });

  it("kapalı pencerede katalog tarihini bırakır, yeni son tarih üretmez", () => {
    const row = plan({
      applicationDeadline: "2026-06-15T12:00:00.000Z",
      remainingDays: 0,
      status: "CLOSED",
    });
    expect(row.window.title).toBe(GRANT_PREP_WINDOW_TITLE);
    expect(row.window.detail).toContain("Katalog son tarihi 15.06.2026.");
    expect(row.window.detail).not.toContain("Kalan gün");
    expect(renderGrantPrepMasterPlan(row)).toContain("Bu planda yeni bir son tarih yok.");
  });

  it("eligibility yoksa analiz yüzdesini korur", () => {
    const row = plan({ eligibility: null, fitPct: 77 });
    expect(row.currentScore).toBe(77);
    expect(row.targetScore).toBe(77);
    expect(row.closable).toEqual([]);
    expect(row.blockers).toEqual([]);
  });

  it("üç aşama firma görevini ve YetkinHibe çıktısını birlikte yazar", () => {
    const text = renderGrantPrepMasterPlan(
      plan({ eligibility: { ...OPEN, requiresRdActivity: true } }),
    );
    expect(text).toContain("1. Ay: Evrak & Altyapı");
    expect(text).toContain("2. Ay: Teknik & Finansal Kurgu");
    expect(text).toContain("3. Ay: Başvuru Dosyası & Sunum");
    expect(text).toContain("Firma: Ar-Ge / Yazılım Personel İstihdam Planı (+9 puan)");
    expect(text).toContain("YetkinHibe: Tam proje dosyası taslağını Proje Dosyası sekmesinde üretir.");
    expect(text).toContain("Firma: Örnek Sanayi");
  });

  it("DOCX sıkıştırmasız pakettir ve plan metnini taşır", () => {
    const row = plan();
    const bytes = grantPrepMasterPlanDocx(row);
    expect(bytes[0]).toBe(0x50);
    expect(bytes[1]).toBe(0x4b);
    expect(new TextDecoder().decode(bytes)).toContain("Hibe Hazırlık Master Planı");
    expect(grantPrepDocxFilename("KOSGEB 1507")).toBe("hibe-hazirlik-plani-kosgeb-1507.docx");
    expect(grantPrepDocxFilename("!!!")).toBe("hibe-hazirlik-plani.docx");
  });
});

describe("hibe hazırlık yüzeyi", () => {
  const root = process.cwd();

  it("analiz kartı master plan aksiyonunu ve kurumsal kokpit bağlantısını taşır", () => {
    const card = readFileSync(join(root, "components/hibe/prep-plan-card.tsx"), "utf8");
    const cockpit = readFileSync(join(root, "components/hibe/os-cockpit.tsx"), "utf8");
    const desk = readFileSync(join(root, "components/hibe/project-desk.tsx"), "utf8");
    const kurumsal = readFileSync(join(root, "components/kurumsal/roadmap-cards.tsx"), "utf8");
    expect(card).toContain("90 Günlük Master Plan Hazırla");
    expect(card).toContain("Tam Proje Dosyasını Üret →");
    expect(card).toContain("DOCX indir");
    expect(card).toContain("{plan.disclaimer}");
    expect(cockpit).toContain("HibePrepPlanCard");
    expect(cockpit).toContain('hesap: "1"');
    expect(desk).toContain("Master plan notu");
    expect(kurumsal).toContain("Şirketine Özel Hibe & Destek Fırsatı");
    expect(kurumsal).toContain('href="/hibe?sekme=analiz"');
    expect(kurumsal).toContain("kriter karşılama puanıdır");
  });
});
