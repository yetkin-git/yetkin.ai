import { describe, expect, it } from "vitest";
import { buildDocxDocument } from "@/lib/yetkinhibe/docx-document";
import { formatLegislationNote, UNSOURCED_FIGURE_LINE } from "@/lib/yetkinhibe/legislation-trace";
import { buildPlainPdf } from "@/lib/yetkinhibe/plain-pdf";
import { citeTemplateSections, chunkSpecification } from "@/lib/yetkinhibe/spec-rag";
import { templateForGrant } from "@/lib/yetkinhibe/templates";
import { readGrantDossierPlan } from "@/lib/tezgah/grant/details";
import { rankGrantProgramFits } from "@/lib/yetkinhibe/program-fit";
import type { GrantBriefCall } from "@/lib/yetkinhibe/match-grant-programs-for-brief";
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

const BRIEF = {
  provinceCode: "34",
  audience: "mevcut_kobi" as const,
  naceGroup: "10",
  investmentFocus: "makine_techizat" as const,
  employeeCount: 4,
  companyAgeYears: 2,
  rdMaturityLevel: "NONE" as const,
  exportActive: false,
  hasPatentOrUtilityModel: false,
};

describe("Faz 2 kurum şablonu ve mevzuat izi", () => {
  it("KOSGEB ile TÜBİTAK 1501 dosyası yapısal olarak ayrılır", () => {
    const kosgeb = templateForGrant({ grantId: "kosgeb-is-gelistirme-2027-1", source: "KOSGEB" });
    const sanayi = templateForGrant({ grantId: "tubitak-1501-2027-1", source: "TUBITAK" });
    const kobi = templateForGrant({ grantId: "tubitak-1507-2027-1", source: "TUBITAK", title: "1507 KOBİ" });
    expect(kosgeb.id).toBe("kosgeb-is-plani");
    expect(kosgeb.sections.map((section) => section.title)).toContain("SWOT");
    expect(sanayi.id).toBe("tubitak-prodis-1501");
    expect(sanayi.sections.map((section) => section.title)).toContain("Sanayi Kuruluşu Ar-Ge Altyapısı");
    expect(kobi.id).toBe("tubitak-prodis-1507");
    expect(kobi.sections.map((section) => section.title)).toContain("KOBİ Ar-Ge Kapasitesi");
    expect(sanayi.sections.map((section) => section.title).join("|")).not.toBe(
      kobi.sections.map((section) => section.title).join("|"),
    );
    expect(templateForGrant({ grantId: "ticaret-ihracat-2027" }).id).toBe("ticaret-ihracat");
    expect(templateForGrant({ grantId: "istka-yatirim-2027", source: "KALKINMA_AJANSI" }).id).toBe("kays-kalkinma");
    expect(templateForGrant({ grantId: "tkdk-ipard-iii-101-2027" }).id).toBe("tkdk-ipard");
  });

  it("ayrıntı planı seçilen çağrı kimliğinin şablonunu taşır", () => {
    const plan = readGrantDossierPlan({
      targetGrantId: "kosgeb-is-gelistirme-2026-3",
      durationMonths: 12,
      totalBudgetLira: "100",
      personnelLira: "40",
      equipmentLira: "40",
      serviceLira: "20",
      teamHeadcount: "3",
      teamExpertise: "Soğuk zincir operasyonu ve kanal yazılımı",
      outputGoal: "Depo kendi satış kanalına bağlanır ve bölgesel dağıtım başlar.",
    });
    expect(plan.ok).toBe(true);
    if (!plan.ok) {
      return;
    }
    expect(plan.plan.templateId).toBe("kosgeb-is-plani");
    expect(plan.plan.sectionTitles).toContain("Rekabet Üstünlüğü");
  });

  it("şartname maddesine atıf yapar, eşleşmeyeni susar", () => {
    const text = "Sayfa 4\nMadde 3.1 Özgün değer\nProje mevcut çözümden ayrılır.\nMadde 4 İş paketi\nAdam ay matrisi zorunludur.";
    const chunks = chunkSpecification(text);
    expect(chunks.map((chunk) => chunk.article)).toEqual(["3.1", "4"]);
    expect(chunks[0]?.page).toBe("4");
    const template = templateForGrant({ grantId: "tubitak-1501-2027-1" });
    const cited = citeTemplateSections(template.sections, text);
    const hit = cited.find((section) => section.article === "3.1");
    expect(hit?.body).toContain("Madde 3.1");
    expect(hit?.body).toContain("sayfa 4");
    const silent = citeTemplateSections([{ id: "yok", title: "Konu dışı başlık" }], text);
    expect(silent[0]?.body).toBe("Şartname maddesi yok. Bu başlıkta cümle üretilmedi.");
  });

  it("kaynaksız katalog tutarını dipnota basmaz", () => {
    const note = formatLegislationNote([
      {
        title: "Açık çağrı",
        sourceLabel: "KOSGEB",
        officialInfoUrl: "http://ornek.test",
        sourceVerifiedAt: null,
        dataVersion: null,
      },
    ]);
    expect(note).toContain("Kaynaksız sayı basılmadı");
    expect(note).not.toContain("%");
    expect(UNSOURCED_FIGURE_LINE).not.toMatch(/₺|%/u);
    const traced = formatLegislationNote([
      {
        title: "Doğrulanmış",
        sourceLabel: "KOSGEB",
        officialInfoUrl: "https://www.kosgeb.gov.tr/",
        sourceVerifiedAt: "2026-11-15T09:00:00.000Z",
        dataVersion: 3,
        madde: "3.1",
      },
    ]);
    expect(traced).toContain("kaynak: https://www.kosgeb.gov.tr/");
    expect(traced).toContain("dogrulamaTarihi: 2026-11-15T09:00:00.000Z");
    expect(traced).toContain("dataVersion: 3");
    expect(traced).toContain("madde: 3.1");
    expect(traced).toContain("Bu oran katalog satırı 2026-11-15 tarihli doğrulamadır.");
  });

  it("kısıtlı yüzde ile kısıtsız sayıyı ayırır", () => {
    const call: GrantBriefCall = {
      id: "genel",
      title: "Kısıtsız çağrı",
      sourceLabel: "KOSGEB",
      officialInfoUrl: "https://www.kosgeb.gov.tr/",
      status: "ACTIVE",
      remainingDays: 20,
      poolAmountMinor: null,
      maxSupportMinor: 100,
      supportRatioBps: 5000,
      sourceVerifiedAt: "2026-11-15T09:00:00.000Z",
      eligibility: OPEN,
    };
    const [row] = rankGrantProgramFits(BRIEF, [call], new Date("2026-11-23T12:00:00.000Z"));
    expect(row?.fitPct).toBeNull();
    expect(row?.constrainedCount).toBe(0);
    expect(row?.unconstrainedCount).toBeGreaterThan(0);
    const constrained: GrantBriefCall = {
      ...call,
      id: "arge",
      eligibility: { ...OPEN, requiresRdActivity: true },
    };
    const [fit] = rankGrantProgramFits(
      { ...BRIEF, rdMaturityLevel: "EARLY" },
      [constrained],
      new Date("2026-11-23T12:00:00.000Z"),
    );
    expect(fit?.fitPct).toBe(100);
    expect(fit?.passedConstrained).toBe(fit?.constrainedCount);
    expect(fit?.unconstrainedCount).toBeGreaterThan(0);
  });

  it("DOCX tablo ve başlık stili, PDF indirilebilir gövde üretir", () => {
    const docx = buildDocxDocument([
      { kind: "h1", text: "Kapak özeti" },
      { kind: "h2", text: "Bütçe Kalemleri" },
      { kind: "table", headers: ["Kalem", "Tutar"], rows: [["Personel", "başvuru tahmini"]] },
    ]);
    const xml = new TextDecoder().decode(docx);
    expect(docx[0]).toBe(0x50);
    expect(xml).toContain("Heading1");
    expect(xml).toContain("<w:tbl>");
    expect(xml).toContain("<w:tr>");
    expect(xml).toContain("<w:tc>");
    const pdf = buildPlainPdf([{ kind: "p", text: "Şartname maddesi" }]);
    expect(new TextDecoder().decode(pdf.slice(0, 8))).toBe("%PDF-1.4");
  });
});
