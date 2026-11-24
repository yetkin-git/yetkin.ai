import { describe, expect, it } from "vitest";
import { mapGrantCallRow, type GrantCatalogRowInput } from "@/lib/yetkinhibe/grant-catalog-core";
import {
  detectGrantRdSignal,
  matchPublicGrantEligibility,
  publicGrantBrief,
} from "@/lib/yetkinhibe/public-eligibility";
import type { GrantEligibilityCriteria } from "@/lib/yetkinhibe/types";
import { readGrantDossierNarrative, readGrantNarrative } from "@/lib/tezgah/grant/narrative";

const NOW = new Date("2026-11-23T12:00:00.000Z");
const VERIFIED = "2026-11-23T09:00:00.000Z";

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

function catalogRow(
  id: string,
  title: string,
  eligibility: GrantEligibilityCriteria,
  maxSupportMinor: number,
): GrantCatalogRowInput {
  return {
    id,
    sourceKey: "KOSGEB",
    sourceLabel: "KOSGEB",
    title,
    summary: "Katalog özeti yeterince uzun.",
    poolAmountMinor: null,
    minSupportMinor: 0,
    maxSupportMinor,
    supportRatioBps: 6000,
    applicationOpensAt: new Date("2026-11-20T21:00:00.000Z"),
    applicationDeadline: new Date("2027-06-30T20:59:00.000Z"),
    eligibilityJson: eligibility,
    requiredDocuments: [],
    tags: [],
    officialInfoUrl: "https://www.kosgeb.gov.tr/",
    publicationUrl: null,
    sourceVerifiedAt: new Date(VERIFIED),
  };
}

const TUBITAK_1507 = mapGrantCallRow(
  catalogRow(
    "tubitak-1507-2027-1",
    "TÜBİTAK 1507 KOBİ Ar-Ge Başlangıç",
    {
      ...OPEN,
      requiresRdActivity: true,
      audiences: ["yeni_girisimci", "mevcut_kobi"],
      investmentFocus: ["arge"],
    },
    262_500_000,
  ),
  NOW,
);

const RETAIL_TWO_CONSTRAINTS = mapGrantCallRow(
  catalogRow(
    "perakende-2027",
    "Perakende destek",
    {
      ...OPEN,
      nacePrefixes: ["47"],
      audiences: ["mevcut_kobi"],
      investmentFocus: ["makine_techizat"],
      eligibleRegionCodes: ["34"],
      minEmployeeCount: 1,
      maxEmployeeCount: 50,
    },
    250_000_00,
  ),
  NOW,
);

const ISKUR_SINGLE_CONSTRAINT = mapGrantCallRow(
  catalogRow("iskur-engelli-2027", "İŞKUR Engelli İstihdam Teşviki 2027", { ...OPEN, audiences: ["mevcut_kobi"] }, 15_000_000),
  NOW,
);

const CAFE_IDEA = "Mahallede kafe açacağım, müşteri araştırması yapacağım.";

describe("Ş4 / B-05 — Ar-Ge sinyali daraltıldı", () => {
  it("'müşteri araştırması' Ar-Ge sayılmaz", () => {
    expect(detectGrantRdSignal("Mahallede kafe açacağım, müşteri araştırması yapacağım.")).toBe(false);
    expect(detectGrantRdSignal("Pazar araştırması yapıp rakip fiyatı toplayacağım.")).toBe(false);
    expect(detectGrantRdSignal("Piyasa araştırması ve talep analizi yapacağım.")).toBe(false);
  });

  it("açık Ar-Ge / prototip / yazılım geliştirme sinyali sayılır", () => {
    expect(detectGrantRdSignal("Sensör için prototip geliştireceğim.")).toBe(true);
    expect(detectGrantRdSignal("Ar-Ge projesiyle yeni algılama yöntemi geliştireceğim.")).toBe(true);
    expect(detectGrantRdSignal("Yazılım geliştirme ve test altyapısı kuracağım.")).toBe(true);
    expect(detectGrantRdSignal("Pazar araştırması yapıp Ar-Ge projesi yürüteceğim.")).toBe(true);
  });

  it("kafe fikri TÜBİTAK 1507'ye düşmez", () => {
    const brief = publicGrantBrief({
      idea: CAFE_IDEA,
      provinceCode: "34",
      naceGroup: "47",
      audience: "mevcut_kobi",
    });
    expect(brief?.investmentFocus).toBe("makine_techizat");
    expect(brief?.rdMaturityLevel).toBe("NONE");

    const result = matchPublicGrantEligibility({
      idea: CAFE_IDEA,
      provinceCode: "34",
      sectorCode: "47",
      audience: "mevcut_kobi",
      calls: [TUBITAK_1507, RETAIL_TWO_CONSTRAINTS],
      now: NOW,
    });
    expect(result.programLabel).toBe("Perakende destek");
    expect(result.programLabel).not.toContain("1507");
  });

  it("çalışan sayısı ve şirket yaşı ziyaretçiden gelir; uydurulmaz", () => {
    const brief = publicGrantBrief({
      idea: CAFE_IDEA,
      provinceCode: "34",
      naceGroup: "47",
      audience: "mevcut_kobi",
      employeeCount: "4",
      companyAgeYears: "2",
    });
    expect(brief?.employeeCount).toBe(4);
    expect(brief?.companyAgeYears).toBe(2);

    // Yazılmazsa açık varsayılan kullanılır (sessizce uydurma değil).
    const fallback = publicGrantBrief({
      idea: CAFE_IDEA,
      provinceCode: "34",
      naceGroup: "47",
      audience: "mevcut_kobi",
    });
    expect(fallback?.employeeCount).toBe(15);
    expect(fallback?.companyAgeYears).toBe(5);
  });
});

describe("Ş4 / B-05 — tek kısıtlı çağrının %100'ü kaldırıldı", () => {
  it("tek kısıtlı çağrı «Geçen Kısıt: 1 / 1» basar, %100 basmaz", () => {
    const result = matchPublicGrantEligibility({
      idea: CAFE_IDEA,
      provinceCode: "34",
      sectorCode: "47",
      audience: "mevcut_kobi",
      calls: [ISKUR_SINGLE_CONSTRAINT],
      now: NOW,
    });
    expect(result.programLabel).toBe("İŞKUR Engelli İstihdam Teşviki 2027");
    expect(result.constraintLabel).toBe("Geçen Kısıt: 1 / 1");
    // Tek kısıt geçmek uygunluk değildir: yüzde basılmaz.
    expect(result.matchScorePct).toBeNull();
    expect(result.constrainedCount).toBe(1);
    expect(result.passedConstrained).toBe(1);
    expect(result.constraintLabels).toContain("İşletme türü");
  });

  it("çok kısıtlı çağrıda «Geçen Kısıt: X / Y» ve kısıt etiketleri gelir", () => {
    const result = matchPublicGrantEligibility({
      idea: CAFE_IDEA,
      provinceCode: "34",
      sectorCode: "47",
      audience: "mevcut_kobi",
      employeeCount: "4",
      companyAgeYears: "2",
      calls: [RETAIL_TWO_CONSTRAINTS],
      now: NOW,
    });
    expect(result.constraintLabel).toMatch(/^Geçen Kısıt: \d+ \/ \d+$/);
    expect(result.constrainedCount).toBeGreaterThanOrEqual(2);
    expect(result.passedConstrained).toBe(result.constrainedCount);
    expect(result.constraintLabels.length).toBe(result.constrainedCount);
    expect(result.matchScorePct).toBe(100);
  });

  it("eşleşme yoksa yüzde ve kısıt etiketi basılmaz", () => {
    const result = matchPublicGrantEligibility({
      idea: CAFE_IDEA,
      provinceCode: "06",
      sectorCode: "47",
      audience: "mevcut_kobi",
      calls: [RETAIL_TWO_CONSTRAINTS],
      now: NOW,
    });
    expect(result.matchScorePct).toBeNull();
    expect(result.constraintLabel).toBeNull();
    expect(result.programLabel).toBe("");
  });
});

describe("F1.9 — Türkçe halüsinasyon kalkanı", () => {
  function narrative(purpose: string) {
    return JSON.stringify({
      purpose,
      market: "Yakın çevredeki marketler soğuk ürün ister. Talep ölçümü bu taslakta yoktur.",
      risk: "Enerji kesintisi akışı durdurabilir. Yedek plan işletmenin kendi kaynağıyla yazılır.",
    });
  }

  it("'yüzde 75 destek alır' ve 'yüzde 60 destek sağlar' reddedilir", () => {
    expect(readGrantNarrative(narrative("Bu proje yüzde 75 destek alır ve hızlı büyür."))).toBeNull();
    expect(readGrantNarrative(narrative("Fon yüzde 60 destek sağlar ve süreç kısalır."))).toBeNull();
    expect(readGrantNarrative(narrative("Proje yüzde 75 desteklenecek diye planlandı."))).toBeNull();
    // Sayısız yazıyla verilen oran da yakalanır.
    expect(readGrantNarrative(narrative("Program yüzde altmış oranla destek verir."))).toBeNull();
  });

  it("fiziksel kapasite ifadeleri korunur: 'iki yüz metrekare', 'iki bin adet'", () => {
    const kept = readGrantNarrative(
      narrative("Depo iki yüz metrekare olacak ve hattı besleyecek."),
    );
    expect(kept?.purpose).toContain("iki yüz metrekare");

    const keptUnits = readGrantNarrative(
      narrative("Aylık iki bin adet ürün kapasitesi için hat kurulacak."),
    );
    expect(keptUnits?.purpose).toContain("iki bin adet");

    const keptStaff = readGrantNarrative(
      narrative("İki bin kişilik istihdam havuzu bölgesel etki yaratır."),
    );
    expect(keptStaff?.purpose).toContain("bin kişilik");
  });

  it("para bağlamındaki büyüklük hâlâ reddedilir", () => {
    expect(readGrantNarrative(narrative("Destek iki yüz bin lira olarak hesaplandı."))).toBeNull();
    expect(readGrantNarrative(narrative("Bütçe iki milyon liraya ulaşacak biçimde kuruldu."))).toBeNull();
    expect(readGrantNarrative(narrative("Hibe tutarı 150 bin lira olarak yazıldı."))).toBeNull();
  });

  it("tam dosya bölümlerinde de aynı kalkan çalışır", () => {
    const dossier = JSON.stringify({
      purpose: "Depo iki yüz metrekare olacak ve hattı besleyecek.",
      market: "Yakın çevredeki marketler soğuk ürün ister. Talep ölçümü bu taslakta yoktur.",
      risk: "Enerji kesintisi akışı durdurabilir. Yedek plan işletmenin kendi kaynağıyla yazılır.",
      summary: "Seçilen programın geçen koşulları proje özetine bağlanır. Yeni koşul eklenmez.",
      budgetRationale: "Personel üretimi yürütür. Makine hattı kurulur. Yazılım kanalı bağlanır.",
      competencyNote: "Ekip işletmenin kendi uzmanlık cümlesine dayanır. Yeni unvan eklenmez.",
      commercialization: "Çıktı işletmenin yazdığı hedefe göre pazara taşınır. Rakam üretilmez.",
    });
    expect(readGrantDossierNarrative(dossier)?.purpose).toContain("iki yüz metrekare");

    const leaked = JSON.parse(dossier) as Record<string, string>;
    leaked.commercialization = "Çıktı yüzde 75 destek alır diye pazara taşınır.";
    expect(readGrantDossierNarrative(JSON.stringify(leaked))).toBeNull();
  });
});
