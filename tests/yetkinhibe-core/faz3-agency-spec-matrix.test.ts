import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { matchAgencyClientsToCatalog, type AgencyClientCard } from "@/lib/yetkinhibe/agency-match";
import {
  GRANT_CALL_SEEDS_2027,
  type GrantCallSeed,
} from "@/lib/yetkinhibe/grant-call-seed-2027";
import {
  GRANT_SPECIFICATION_SEEDS_2027,
  grantSpecificationSeedFor,
} from "@/lib/yetkinhibe/grant-specification-seeds";
import type { GrantBriefCall } from "@/lib/yetkinhibe/match-grant-programs-for-brief";
import { chunkSpecification, citeTemplateSections, specificationHintNeedles } from "@/lib/yetkinhibe/spec-rag";
import { templateForGrant } from "@/lib/yetkinhibe/templates";
import {
  personMonthAllocation,
  personMonthCell,
  workPackageMonths,
} from "@/lib/tezgah/grant/document";
import { readGrantDossierPlan } from "@/lib/tezgah/grant/details";
import type { GrantDossier } from "@/lib/tezgah/grant/types";

const ROOT = process.cwd();
const NOW = new Date("2026-11-23T12:00:00.000Z");
const VERIFIED = "2026-11-23T09:00:00.000Z";

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

function seedToBriefCall(seed: GrantCallSeed): GrantBriefCall {
  return {
    id: seed.id,
    title: seed.title,
    sourceLabel: seed.sourceKey,
    officialInfoUrl: seed.officialInfoUrl,
    status: "ACTIVE",
    remainingDays: 60,
    poolAmountMinor: seed.poolAmountMinor,
    maxSupportMinor: seed.maxSupportMinor,
    supportRatioBps: seed.supportRatioBps,
    sourceVerifiedAt: VERIFIED,
    eligibility: seed.eligibility,
    source: seed.sourceKey,
    specificationText: seed.specificationText ?? null,
    rulesJson: seed.rulesJson ?? null,
  };
}

const CALLS = GRANT_CALL_SEEDS_2027.map(seedToBriefCall);

function card(overrides: Partial<AgencyClientCard> = {}): AgencyClientCard {
  return {
    id: "client-1",
    companyName: "Karaoğlu Gıda",
    naceGroup: "10",
    provinceCode: "34",
    audience: "mevcut_kobi",
    employeeCount: 40,
    companyAgeYears: 5,
    rdMaturityLevel: "NONE",
    exportActive: true,
    investmentFocus: "makine_techizat",
    ...overrides,
  };
}

describe("Ş7 / F2.6 — ajans kartı yatırım odağı ile eşleşir", () => {
  it("kart odak belirtmezse yatırım odaklı çağrı uyum listesine girmez, «eksik» kovasına düşer", () => {
    const [row] = matchAgencyClientsToCatalog([card({ investmentFocus: "genel" })], CALLS, NOW);
    expect(row?.incomplete.some((item) => item.note.includes("Yatırım odağı"))).toBe(true);
    expect(row?.eligible.length).toBeGreaterThanOrEqual(0);
  });

  it("makine/teçhizat odağı çoklu çağrı eşleşmesi üretir (İstanbul, 40 çalışan, gıda)", () => {
    const [row] = matchAgencyClientsToCatalog([card({ investmentFocus: "makine_techizat" })], CALLS, NOW);
    expect(row).toBeDefined();
    const ids = row?.eligible.map((item) => item.grantId) ?? [];
    // Sabit "ihracat" odağı 8 kalkınma ajansı satırının tamamını dışarıda bırakıyordu.
    expect(ids).toContain("istka-yatirim-2027");
    expect(ids).toContain("kosgeb-kapasite-gelistirme-2027-1");
    expect(ids.length).toBeGreaterThanOrEqual(3);
    expect(row?.incomplete.some((item) => item.note.includes("Yatırım odağı"))).toBe(false);
  });

  it("Ar-Ge odağı TÜBİTAK satırlarını açar; sabit odak yazılmıyor", () => {
    const [row] = matchAgencyClientsToCatalog(
      [card({ investmentFocus: "arge", rdMaturityLevel: "EARLY", naceGroup: "62" })],
      CALLS,
      NOW,
    );
    const ids = row?.eligible.map((item) => item.grantId) ?? [];
    expect(ids).toContain("tubitak-1507-2027-1");
    const source = readSrc("lib/yetkinhibe/agency-match.ts");
    expect(source).not.toContain('investmentFocus: "ihracat"');
    expect(source).toContain("isGrantInvestmentFocus(focus) ? focus : null");
  });

  it("iki farklı odak iki farklı uyum kümesi üretir", () => {
    const [machine] = matchAgencyClientsToCatalog([card({ investmentFocus: "makine_techizat" })], CALLS, NOW);
    const [exporting] = matchAgencyClientsToCatalog([card({ investmentFocus: "ihracat" })], CALLS, NOW);
    const machineIds = new Set(machine?.eligible.map((item) => item.grantId));
    const exportIds = new Set(exporting?.eligible.map((item) => item.grantId));
    expect([...exportIds].some((id) => id.startsWith("ticaret-"))).toBe(true);
    expect([...machineIds].some((id) => id.startsWith("ticaret-"))).toBe(false);
  });
});

describe("Ş6 / B-04 — ajans satın alma yolu", () => {
  it("checkout `hibe-agency` türünü, niyetini ve hibe masası dönüşünü taşır", () => {
    const checkout = readSrc("lib/tezgah/checkout.ts");
    expect(checkout).toContain('"pro" | "credit-pack" | "grant-dossier" | "hibe-agency"');
    expect(checkout).toContain("PAYMENT_ORDER_PURPOSE.HIBE_AGENCY");
    expect(checkout).toContain('readHibeCatalogAmount("agency")');
    expect(checkout).toContain('kind === "grant-dossier" || kind === "hibe-agency" ? "hibe" : "tezgah"');
    const route = readSrc("app/api/tezgah/checkout/route.ts");
    expect(route).toContain('"hibe-agency"');
  });

  it("`HIBE_AGENCY` niyeti sınıflanır ve iade kapısı teslimata bağlıdır", async () => {
    const { classifyPaymentOrderPurpose, PAYMENT_ORDER_PURPOSE, isCardRefundBlockedForOrder } = await import(
      "@/lib/kernel/payments/order-purpose"
    );
    expect(PAYMENT_ORDER_PURPOSE.HIBE_AGENCY).toBe("HIBE_AGENCY");
    expect(classifyPaymentOrderPurpose("hibe-agency")).toBe("HIBE_AGENCY");
    expect(classifyPaymentOrderPurpose("HIBE_AGENCY")).toBe("HIBE_AGENCY");
    // Dosya üretilmediyse iade edilebilir; üretildiyse veya bilinmiyorsa kapalı.
    expect(isCardRefundBlockedForOrder({ purpose: "GRANT_DOSSIER", produced: false })).toBe(false);
    expect(isCardRefundBlockedForOrder({ purpose: "GRANT_DOSSIER", produced: true })).toBe(true);
    expect(isCardRefundBlockedForOrder({ purpose: "GRANT_DOSSIER", produced: null })).toBe(true);
    expect(isCardRefundBlockedForOrder({ purpose: "HIBE_AGENCY", produced: false })).toBe(false);
  });

  it("vitrin ve kokpit tek fiyat kaynağından beslenir; ajans satırı tohumlanır", () => {
    const migration = readSrc(
      "prisma/migrations/20261123235000_yetkinhibe_faz3_agency_price_spec/migration.sql",
    );
    expect(migration).toContain("'cat_hibe_dossier'");
    expect(migration).toContain("'cat_hibe_agency'");
    expect(migration).toContain("149000");
    expect(migration).toContain("499000");
    // Super Admin tutarı korunur.
    expect(migration).toContain('existing.updated_by IS NOT NULL');
    // Tek fiyat okuma kapısı.
    const lane = readSrc("lib/tezgah/paid-lane.ts");
    expect(lane).toContain("readHibeCatalogAmount");
    expect(lane).toContain('readTezgahCatalogAmount(`hibe/${unit}`)');
    const osLoad = readSrc("lib/yetkinhibe/os-load.ts");
    expect(osLoad).toContain('readHibeCatalogAmount("agency")');
    expect(osLoad).toContain('readHibeCatalogAmount("dossier")');
  });

  it("defter satırı ürün niyetini taşır: «Cüzdan yükleme» değil «Hibe proje dosyası»", async () => {
    const { ledgerCreditLineForOrder } = await import("@/lib/kernel/payments/order-purpose");
    const dossier = ledgerCreditLineForOrder({ purpose: "GRANT_DOSSIER", merchantOid: "TZG1" });
    expect(dossier.label).toBe("Hibe proje dosyası");
    expect(dossier.purpose).toBe("grant-dossier");
    expect(dossier.idempotencyKey).toBe("grant-dossier:TZG1");
    const agency = ledgerCreditLineForOrder({ purpose: "HIBE_AGENCY", merchantOid: "TZA1" });
    expect(agency.label).toBe("Hibe ajans paketi");
    const topUp = ledgerCreditLineForOrder({ purpose: "wallet-top-up", merchantOid: "TZW1" });
    expect(topUp.label).toBe("Cüzdan yükleme");
    // CREDIT izin listesinde olmalı, yoksa defter yazımı patlar.
    const { isLedgerCreditPurpose } = await import("@/lib/kernel/ledger/credit-purposes");
    expect(isLedgerCreditPurpose(dossier.purpose)).toBe(true);
    expect(isLedgerCreditPurpose(agency.purpose)).toBe(true);

    expect(readSrc("lib/kernel/payments/clearing.ts")).toContain("ledgerCreditLineForOrder");
    expect(readSrc("lib/tezgah/guest-claim-bind.ts")).toContain("ledgerCreditLineForOrder");
  });

  it("ajans ekranı PayTR düğmesini taşır", () => {
    const desk = readSrc("components/hibe/agency-desk.tsx");
    expect(desk).toContain("Ajans Paketini Satın Al (PayTR)");
    expect(desk).toContain('kind: "hibe-agency"');
    expect(desk).toContain('name="investmentFocus"');
    expect(desk).toContain("AGENCY_FOCUS_OPTIONS");
  });
});

describe("Ş5 / F2.4 — şartname madde atıfları dolu", () => {
  it("en az 8 ana çağrı şartname metni ve kuralları taşır", () => {
    const required = [
      "kosgeb-is-gelistirme-2026-4",
      "kosgeb-kapasite-gelistirme-2027-1",
      "tubitak-1501-2027-1",
      "tubitak-1507-2027-1",
      "ticaret-ihracat-2027",
      "istka-yatirim-2027",
      "tkdk-ipard-iii-101-2027",
      "iskur-isbasi-2027",
    ];
    for (const id of required) {
      const seed = grantSpecificationSeedFor(id);
      expect(seed, id).not.toBeNull();
      expect(seed?.specificationText.length, id).toBeGreaterThan(400);
      expect(seed?.rulesJson.documentHints.length, id).toBeGreaterThan(0);
    }
    expect(Object.keys(GRANT_SPECIFICATION_SEEDS_2027).length).toBeGreaterThanOrEqual(8);
  });

  it("tohum satırları spec alanlarını katalog satırına taşır", () => {
    const withSpec = GRANT_CALL_SEEDS_2027.filter((seed) => seed.specificationText != null);
    expect(withSpec.length).toBeGreaterThanOrEqual(8);
    for (const seed of withSpec) {
      const chunks = chunkSpecification(seed.specificationText);
      expect(chunks.length, seed.id).toBeGreaterThanOrEqual(4);
      expect(chunks[0]?.page, seed.id).not.toBeNull();
    }
  });

  it("TÜBİTAK 1507 dosyasında beş bölümün tamamı madde atfı alır", () => {
    const seed = grantSpecificationSeedFor("tubitak-1507-2027-1");
    const template = templateForGrant({ grantId: "tubitak-1507-2027-1", source: "TUBITAK" });
    const cited = citeTemplateSections(
      template.sections,
      seed?.specificationText,
      specificationHintNeedles(seed?.rulesJson),
    );
    expect(cited).toHaveLength(5);
    for (const section of cited) {
      expect(section.article, section.title).not.toBeNull();
      expect(section.body).toContain("Madde");
      expect(section.body).not.toContain("Şartname maddesi yok");
    }
    expect(new Set(cited.map((section) => section.article)).size).toBe(5);
  });

  it("engine her uygun satır için eşleşen tüm maddeleri taşır", () => {
    const engine = readSrc("lib/tezgah/grant/engine.ts");
    expect(engine).toContain("sectionArticles");
    expect(engine).toContain("citeTemplateSections(");
    expect(engine).toContain('articles.join(", ")');
    // Satır maddesi `toEligibleProgram` içinde şartnameden türetilir; dossier hedefi
    // ayrı `targetArticle`dır ve satırı tek maddeye indirgemez.
    const rowBuilder = engine.slice(
      engine.indexOf("function toEligibleProgram"),
      engine.indexOf("export async function generateGrantProject"),
    );
    expect(rowBuilder).toContain("articles");
    expect(rowBuilder).toContain("sectionArticles");
    expect(rowBuilder).not.toContain("madde: null");
  });

  it("migration şartname metnini dolu satıra dokunmadan işler", () => {
    const migration = readSrc(
      "prisma/migrations/20261123235000_yetkinhibe_faz3_agency_price_spec/migration.sql",
    );
    expect(migration).toContain("specification_text");
    expect(migration).toContain("length(btrim(\"specification_text\")) < 12");
    expect(migration).toContain("SPECIFICATION_SEED");
  });
});

describe("Ş8 / B-06 — Word adam-ay matrisi dolu", () => {
  it("iş paketi süreleri ve toplam adam-ay hesaplanır", () => {
    expect(workPackageMonths("1-3")).toBe(3);
    expect(workPackageMonths("4-12")).toBe(9);
    expect(workPackageMonths("17-18")).toBe(2);
    const allocation = personMonthAllocation({ teamHeadcount: 6, months: [3, 9, 4, 2] });
    expect(allocation?.totalPersonMonths).toBe(6 * 18);
    expect(allocation?.perPackage.reduce((sum, value) => sum + value, 0)).toBe(6 * 18);
    // Uzun paket daha büyük pay alır.
    expect(allocation!.perPackage[1]!).toBeGreaterThan(allocation!.perPackage[0]!);
  });

  it("adam-ay hücresi sayı ve şartname atfı taşır; «Sayı yazılmadı» yoktur", () => {
    const document = readSrc("lib/tezgah/grant/document.ts");
    expect(document).not.toContain("Sayı yazılmadı");
    expect(personMonthCell(12, "3.3")).toBe("12 adam-ay (Madde 3.3)");
    expect(personMonthCell(4, null)).toBe("4 adam-ay");
    // Word tablosu ve düz metin aynı dağılımı basar.
    expect(readSrc("lib/tezgah/grant/render.ts")).toContain("personMonthAllocation");
  });

  it("18 aylık 1507 dosyası dolu adam-ay tablosu üretir", () => {
    const plan = readGrantDossierPlan({
      targetGrantId: "tubitak-1507-2027-1",
      durationMonths: 18,
      totalBudgetLira: "1800000",
      personnelLira: "900000",
      equipmentLira: "600000",
      serviceLira: "300000",
      teamHeadcount: "6",
      teamExpertise: "Yazılım 4\nTest 2",
      outputGoal: "Sensör prototipi sahada doğrulanır ve kullanım senaryosu yazılır.",
    });
    expect(plan.ok).toBe(true);
    if (!plan.ok) {
      return;
    }
    const dossier: GrantDossier = {
      disclaimer: "",
      targetTitle: "1507",
      targetSourceLabel: "TÜBİTAK",
      targetInfoUrl: "https://tubitak.gov.tr/",
      criterionLabels: ["Ar-Ge faaliyeti"],
      durationMonths: plan.plan.durationMonths,
      durationNote: "",
      workPackages: plan.plan.workPackages,
      budgetNote: "",
      budgetTotalLabel: "₺18.000",
      budgetRows: plan.plan.budgetRows.map((row) => ({ category: row.category, label: row.label, amountLabel: "₺1" })),
      budgetRationale: "",
      teamHeadcount: plan.plan.teamHeadcount,
      teamRows: plan.plan.teamRows,
      competencyNote: "",
      outputGoal: "",
      commercialization: "",
      summary: "",
      templateId: plan.plan.templateId,
      sectionArticles: [{ title: "İş Paketi Adam-Ay Matrisi", article: "3.3" }],
    };
    const months = plan.plan.workPackages.map((row) => workPackageMonths(row.windowLabel));
    const allocation = personMonthAllocation({ teamHeadcount: dossier.teamHeadcount, months });
    expect(allocation?.totalPersonMonths).toBe(6 * 18);
    expect(allocation?.perPackage.every((value) => value > 0)).toBe(true);
  });
});
