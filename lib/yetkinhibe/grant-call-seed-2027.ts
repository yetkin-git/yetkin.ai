import type { GrantEligibilityCriteria, GrantProgramSource, GrantSpecificationRules } from "@/lib/yetkinhibe/types";
import { grantSpecificationSeedFor } from "@/lib/yetkinhibe/grant-specification-seeds";

/**
 * 2026 sonu – 2027 açık çağrı tohumu.
 * Tutarlar kuruştur. Dönem havuzu ilan edilmediyse null kalır.
 * `sourceVerifiedAt` 23 Kasım 2026 katalog doğrulamasıdır.
 * Başvuru pencereleri 26 Kasım 2026'da açıktır.
 */

export const GRANT_SEED_VERIFIED_AT = "2026-11-23T09:00:00.000Z";
const OPENS = "2026-11-20T21:00:00.000Z";

export type GrantCallSeed = {
  id: string;
  sourceKey: GrantProgramSource;
  title: string;
  summary: string;
  poolAmountMinor: null;
  minSupportMinor: number;
  maxSupportMinor: number;
  supportRatioBps: number;
  applicationOpensAt: string;
  applicationDeadline: string;
  eligibility: GrantEligibilityCriteria;
  requiredDocuments: readonly string[];
  tags: readonly string[];
  officialInfoUrl: string;
  publicationUrl: string | null;
  /** İlan şartnamesinden alınan başlıklı parçalar. Yoksa dosya madde atfı kurmaz. */
  specificationText?: string | null;
  /** Madde atfı için yapılandırılmış ipuçları. Tutar taşımaz. */
  rulesJson?: GrantSpecificationRules | null;
};

export const GRANT_SOURCE_SEEDS: readonly {
  key: GrantProgramSource;
  label: string;
  officialUrl: string;
}[] = [
  { key: "TKDK_IPARD", label: "TKDK / IPARD", officialUrl: "https://www.tkdk.gov.tr/" },
  { key: "TARIM_BAKANLIGI", label: "Tarım ve Orman Bakanlığı", officialUrl: "https://www.tarimorman.gov.tr/" },
  { key: "SANAYI_BAKANLIGI", label: "Sanayi ve Teknoloji Bakanlığı", officialUrl: "https://www.sanayi.gov.tr/" },
  { key: "ISKUR", label: "İŞKUR", officialUrl: "https://www.iskur.gov.tr/" },
  { key: "AB_FONLARI", label: "Avrupa Birliği fonları", officialUrl: "https://www.ab.gov.tr/" },
];

function elig(partial: Partial<GrantEligibilityCriteria> = {}): GrantEligibilityCriteria {
  return {
    eligibleSectorCodes: null,
    minEmployeeCount: null,
    maxEmployeeCount: null,
    minCompanyAgeYears: null,
    maxCompanyAgeYears: null,
    requiresRdActivity: false,
    requiresExportActivity: false,
    requiresKobiStatus: false,
    requiresPatentOrUtilityModel: false,
    eligibleRegionCodes: null,
    audiences: null,
    investmentFocus: null,
    nacePrefixes: null,
    ...partial,
  };
}

const DOCS = ["Proje başvuru formu", "İmza sirküleri"] as const;
const MFG = ["10", "13", "25", "28", "62"] as const;

function call(
  input: Omit<
    GrantCallSeed,
    "poolAmountMinor" | "applicationOpensAt" | "applicationDeadline" | "requiredDocuments" | "specificationText" | "rulesJson"
  > & {
    deadline: string;
    documents?: readonly string[];
  },
): GrantCallSeed {
  const seed = grantSpecificationSeedFor(input.id);
  return {
    id: input.id,
    sourceKey: input.sourceKey,
    title: input.title,
    summary: input.summary,
    poolAmountMinor: null,
    minSupportMinor: input.minSupportMinor,
    maxSupportMinor: input.maxSupportMinor,
    supportRatioBps: input.supportRatioBps,
    applicationOpensAt: OPENS,
    applicationDeadline: input.deadline,
    eligibility: input.eligibility,
    requiredDocuments: input.documents ?? DOCS,
    tags: input.tags,
    officialInfoUrl: input.officialInfoUrl,
    publicationUrl: input.publicationUrl,
    specificationText: seed?.specificationText ?? null,
    rulesJson: seed?.rulesJson ?? null,
  };
}

const AGENCY_ELIG = (provinces: readonly string[]) =>
  elig({
    audiences: ["mevcut_kobi", "yeni_girisimci"],
    investmentFocus: ["makine_techizat", "yazilim_dijital"],
    nacePrefixes: MFG,
    eligibleRegionCodes: provinces,
    requiresKobiStatus: true,
  });

export const GRANT_CALL_SEEDS_2027: readonly GrantCallSeed[] = [
  call({
    id: "kosgeb-is-gelistirme-2026-4",
    sourceKey: "KOSGEB",
    title: "KOSGEB Girişimci Destek Programı İş Geliştirme Desteği 2026/4",
    summary:
      "0-3 yaş işletmelere personel, makine, yazılım ve hizmet alımı için geri ödemeli destek. Üst limit 2.250.000 TL, oran yüzde 80. 2026 dördüncü dönem penceresi 2027 başına kadar açıktır. Dönem havuzu ilan edilmedi.",
    minSupportMinor: 0,
    maxSupportMinor: 225_000_000,
    supportRatioBps: 8000,
    deadline: "2027-01-15T20:59:00.000Z",
    eligibility: elig({
      minCompanyAgeYears: 0,
      maxCompanyAgeYears: 3,
      audiences: ["yeni_girisimci"],
      investmentFocus: ["makine_techizat", "yazilim_dijital"],
      nacePrefixes: ["10", "13", "25", "28", "62", "72"],
    }),
    tags: ["girisimci", "makine", "yazilim"],
    officialInfoUrl:
      "https://www.kosgeb.gov.tr/site/tr/genel/detay/9499/girisimci-destek-programi-yenilendi-girisimcilere-yeni-destek-modeli",
    publicationUrl: null,
  }),
  call({
    id: "kosgeb-is-gelistirme-2027-1",
    sourceKey: "KOSGEB",
    title: "KOSGEB Girişimci Destek Programı İş Geliştirme Desteği 2027/1",
    summary:
      "2027 birinci dönem iş geliştirme desteği. Üst limit 2.250.000 TL, oran yüzde 80. Yaş bandı 0-3. Dönem havuzu ilan edilmedi.",
    minSupportMinor: 0,
    maxSupportMinor: 225_000_000,
    supportRatioBps: 8000,
    deadline: "2027-03-31T20:59:00.000Z",
    eligibility: elig({
      minCompanyAgeYears: 0,
      maxCompanyAgeYears: 3,
      audiences: ["yeni_girisimci"],
      investmentFocus: ["makine_techizat", "yazilim_dijital"],
      nacePrefixes: ["10", "13", "25", "28", "62", "72"],
    }),
    tags: ["girisimci", "2027"],
    officialInfoUrl:
      "https://www.kosgeb.gov.tr/site/tr/genel/detay/9499/girisimci-destek-programi-yenilendi-girisimcilere-yeni-destek-modeli",
    publicationUrl: null,
  }),
  call({
    id: "kosgeb-kapasite-gelistirme-2027-1",
    sourceKey: "KOSGEB",
    title: "KOSGEB Kapasite Geliştirme Destek Programı 2027/1",
    summary:
      "KOBİ ölçek ve dijital dönüşüm kredisi. Alt limit 1.000.000 TL, üst limit 20.000.000 TL. Oran sütunu hibe değildir; 0 durur. Mikro işletme başvuramaz. Havuz ilan edilmedi.",
    minSupportMinor: 100_000_000,
    maxSupportMinor: 2_000_000_000,
    supportRatioBps: 0,
    deadline: "2027-03-15T20:59:00.000Z",
    eligibility: elig({
      minEmployeeCount: 10,
      maxEmployeeCount: 250,
      requiresKobiStatus: true,
      audiences: ["mevcut_kobi"],
      investmentFocus: ["makine_techizat", "yazilim_dijital"],
      nacePrefixes: ["10", "13", "25", "28", "62", "72"],
    }),
    tags: ["kobi", "kapasite"],
    officialInfoUrl: "https://www.kosgeb.gov.tr/site/tr/genel/detay/9200/kapasite-gelistirme-destek-programi",
    publicationUrl: null,
  }),
  call({
    id: "tubitak-1501-2027-1",
    sourceKey: "TUBITAK",
    title: "TÜBİTAK 1501 Sanayi Ar-Ge Destek Programı 2027/1",
    summary:
      "Sanayi Ar-Ge projelerine hibe. İlk beş projede oran yüzde 75. Proje katkısı en çok 20.000.000 TL. 2027 birinci çağrı penceresi açıktır. Havuz ilan edilmedi.",
    minSupportMinor: 0,
    maxSupportMinor: 2_000_000_000,
    supportRatioBps: 7500,
    deadline: "2027-04-30T20:59:00.000Z",
    eligibility: elig({ requiresRdActivity: true, investmentFocus: ["arge"] }),
    tags: ["ar-ge", "sanayi"],
    officialInfoUrl: "https://tubitak.gov.tr/tr/destekler/sanayi/ulusal-destek-programlari",
    publicationUrl: null,
    documents: ["Kuruluş bazlı ön kayıt", "PRODİS proje önerisi"],
  }),
  call({
    id: "tubitak-1507-2027-1",
    sourceKey: "TUBITAK",
    title: "TÜBİTAK 1507 KOBİ Ar-Ge Başlangıç Destek Programı 2027/1",
    summary:
      "KOBİ Ar-Ge başlangıç projelerine geri ödemesiz hibe. Oran yüzde 75. Azami hibe 2.625.000 TL. Ar-Ge faaliyeti şarttır. Havuz ilan edilmedi.",
    minSupportMinor: 0,
    maxSupportMinor: 262_500_000,
    supportRatioBps: 7500,
    deadline: "2027-05-31T20:59:00.000Z",
    eligibility: elig({
      requiresRdActivity: true,
      audiences: ["yeni_girisimci", "mevcut_kobi"],
      investmentFocus: ["arge"],
    }),
    tags: ["ar-ge", "kobi"],
    officialInfoUrl: "https://tubitak.gov.tr/tr/destekler/sanayi/ulusal-destek-programlari",
    publicationUrl: null,
    documents: ["Kuruluş bazlı ön kayıt", "PRODİS proje önerisi"],
  }),
  call({
    id: "tubitak-1512-bigg-2027-1",
    sourceKey: "TUBITAK",
    title: "TÜBİTAK 1512 BiGG Girişimcilik Destek Programı 2027/1",
    summary:
      "Teknoloji tabanlı yeni girişimlere aşamalı hibe. Katalog tavanı birinci aşama üst limiti olan 900.000 TL'dir. Oran yüzde 100. Ar-Ge şarttır. Havuz ilan edilmedi.",
    minSupportMinor: 0,
    maxSupportMinor: 90_000_000,
    supportRatioBps: 10000,
    deadline: "2027-06-30T20:59:00.000Z",
    eligibility: elig({
      requiresRdActivity: true,
      audiences: ["yeni_girisimci"],
      investmentFocus: ["arge"],
      nacePrefixes: ["62", "72"],
    }),
    tags: ["bigg", "girisim"],
    officialInfoUrl: "https://tubitak.gov.tr/tr/destekler/sanayi/ulusal-destek-programlari",
    publicationUrl: null,
  }),
  call({
    id: "tubitak-1812-2027-1",
    sourceKey: "TUBITAK",
    title: "TÜBİTAK 1812 Yatırım Tabanlı Girişimcilik Destek Programı 2027/1",
    summary:
      "Yatırım tabanlı teknoloji girişimlerine hibe. Katalog tavanı 7.500.000 TL, oran yüzde 75. Ar-Ge şarttır. Havuz ilan edilmedi.",
    minSupportMinor: 0,
    maxSupportMinor: 750_000_000,
    supportRatioBps: 7500,
    deadline: "2027-06-30T20:59:00.000Z",
    eligibility: elig({
      requiresRdActivity: true,
      audiences: ["yeni_girisimci"],
      investmentFocus: ["arge", "makine_techizat"],
    }),
    tags: ["1812", "yatirim"],
    officialInfoUrl: "https://tubitak.gov.tr/tr/destekler/sanayi/ulusal-destek-programlari",
    publicationUrl: null,
  }),
  call({
    id: "ticaret-ihracat-2027",
    sourceKey: "TICARET_BAKANLIGI",
    title: "Ticaret Bakanlığı İhracat Destekleri 2027",
    summary:
      "Pazara giriş ve yurt dışı birim destekleri. Katalog tavanı 2.000.000 TL. İhracat faaliyeti şarttır. Havuz ilan edilmedi.",
    minSupportMinor: 0,
    maxSupportMinor: 200_000_000,
    supportRatioBps: 5000,
    deadline: "2027-12-15T20:59:00.000Z",
    eligibility: elig({
      requiresExportActivity: true,
      audiences: ["mevcut_kobi"],
      investmentFocus: ["ihracat"],
    }),
    tags: ["ihracat"],
    officialInfoUrl: "https://www.ticaret.gov.tr/destekler/ihracat-destekleri",
    publicationUrl: null,
  }),
  call({
    id: "ticaret-e-ihracat-2027",
    sourceKey: "TICARET_BAKANLIGI",
    title: "Ticaret Bakanlığı E-İhracat Destekleri 2027",
    summary:
      "E-ihracat konsorsiyumu, pazaryeri ve dijital tanıtım destekleri. Katalog tavanı 1.500.000 TL. İhracat şarttır. Havuz ilan edilmedi.",
    minSupportMinor: 0,
    maxSupportMinor: 150_000_000,
    supportRatioBps: 6000,
    deadline: "2027-11-30T20:59:00.000Z",
    eligibility: elig({
      requiresExportActivity: true,
      audiences: ["mevcut_kobi", "yeni_girisimci"],
      investmentFocus: ["ihracat", "yazilim_dijital"],
      nacePrefixes: ["46", "47", "62"],
    }),
    tags: ["e-ihracat"],
    officialInfoUrl: "https://www.ticaret.gov.tr/destekler/ihracat-destekleri",
    publicationUrl: null,
  }),
  call({
    id: "ticaret-turquality-2027",
    sourceKey: "TICARET_BAKANLIGI",
    title: "Ticaret Bakanlığı Turquality ve Marka Destek Programı 2027",
    summary:
      "Marka ve Turquality şirket destekleri. Bu sütundaki tavan 15.000.000 TL'dir; tebliğdeki daha yüksek dilim int32 sınırına sığmadığı için yazılmadı. İhracat şarttır. Havuz ilan edilmedi.",
    minSupportMinor: 0,
    maxSupportMinor: 1_500_000_000,
    supportRatioBps: 5000,
    deadline: "2027-10-31T20:59:00.000Z",
    eligibility: elig({
      requiresExportActivity: true,
      audiences: ["mevcut_kobi"],
      investmentFocus: ["ihracat"],
    }),
    tags: ["turquality", "marka"],
    officialInfoUrl: "https://www.ticaret.gov.tr/destekler/ihracat-destekleri",
    publicationUrl: null,
  }),
  call({
    id: "ticaret-fuar-2027",
    sourceKey: "TICARET_BAKANLIGI",
    title: "Ticaret Bakanlığı Yurt Dışı Fuar Desteği 2027",
    summary:
      "Yurt dışı fuar katılım desteği. Katalog tavanı 500.000 TL. İhracat veya fuar katılımı şarttır. Havuz ilan edilmedi.",
    minSupportMinor: 0,
    maxSupportMinor: 50_000_000,
    supportRatioBps: 5000,
    deadline: "2027-09-30T20:59:00.000Z",
    eligibility: elig({
      requiresExportActivity: true,
      investmentFocus: ["ihracat"],
      audiences: ["mevcut_kobi", "yeni_girisimci"],
    }),
    tags: ["fuar"],
    officialInfoUrl: "https://www.ticaret.gov.tr/destekler/ihracat-destekleri",
    publicationUrl: null,
  }),
  call({
    id: "tkdk-ipard-iii-101-2027",
    sourceKey: "TKDK_IPARD",
    title: "TKDK IPARD III Tedbir 101 Tarımsal İşletmeler 2027",
    summary:
      "IPARD III tarımsal işletme yatırımı. Katalog tavanı 5.000.000 TL, oran yüzde 60. Tarım NACE grubu. Havuz ilan edilmedi.",
    minSupportMinor: 0,
    maxSupportMinor: 500_000_000,
    supportRatioBps: 6000,
    deadline: "2027-08-31T20:59:00.000Z",
    eligibility: elig({
      nacePrefixes: ["01"],
      investmentFocus: ["makine_techizat"],
      audiences: ["mevcut_kobi", "yeni_girisimci"],
    }),
    tags: ["ipard", "tarim"],
    officialInfoUrl: "https://www.tkdk.gov.tr/",
    publicationUrl: null,
  }),
  call({
    id: "tkdk-ipard-iii-103-2027",
    sourceKey: "TKDK_IPARD",
    title: "TKDK IPARD III Tedbir 103 Tarım Ürünlerinin İşlenmesi 2027",
    summary:
      "IPARD III işleme ve pazarlama yatırımı. Katalog tavanı 8.000.000 TL, oran yüzde 50. Gıda üretimi NACE grubu. Havuz ilan edilmedi.",
    minSupportMinor: 0,
    maxSupportMinor: 800_000_000,
    supportRatioBps: 5000,
    deadline: "2027-08-31T20:59:00.000Z",
    eligibility: elig({
      nacePrefixes: ["01", "10"],
      investmentFocus: ["makine_techizat"],
      audiences: ["mevcut_kobi"],
    }),
    tags: ["ipard", "isleme"],
    officialInfoUrl: "https://www.tkdk.gov.tr/",
    publicationUrl: null,
  }),
  call({
    id: "tkdk-ipard-iii-302-2027",
    sourceKey: "TKDK_IPARD",
    title: "TKDK IPARD III Tedbir 302 Çiftlik Faaliyetlerinin Çeşitlendirilmesi 2027",
    summary:
      "IPARD III kırsal çeşitlendirme. Katalog tavanı 3.000.000 TL, oran yüzde 60. Havuz ilan edilmedi.",
    minSupportMinor: 0,
    maxSupportMinor: 300_000_000,
    supportRatioBps: 6000,
    deadline: "2027-07-31T20:59:00.000Z",
    eligibility: elig({
      nacePrefixes: ["01", "55", "56"],
      investmentFocus: ["makine_techizat"],
      audiences: ["mevcut_kobi", "yeni_girisimci"],
    }),
    tags: ["ipard", "cesitlendirme"],
    officialInfoUrl: "https://www.tkdk.gov.tr/",
    publicationUrl: null,
  }),
  call({
    id: "istka-yatirim-2027",
    sourceKey: "KALKINMA_AJANSI",
    title: "İstanbul Kalkınma Ajansı Yatırım Destek Programı 2027",
    summary: "İstanbul ili imalat ve yazılım yatırımı. Katalog tavanı 10.000.000 TL, oran yüzde 50. Havuz ilan edilmedi.",
    minSupportMinor: 0,
    maxSupportMinor: 1_000_000_000,
    supportRatioBps: 5000,
    deadline: "2027-04-30T20:59:00.000Z",
    eligibility: AGENCY_ELIG(["34"]),
    tags: ["ajans", "istanbul"],
    officialInfoUrl: "https://www.istka.org.tr/",
    publicationUrl: null,
  }),
  call({
    id: "izka-yatirim-2027",
    sourceKey: "KALKINMA_AJANSI",
    title: "İzmir Kalkınma Ajansı Yatırım Destek Programı 2027",
    summary: "İzmir ili imalat ve yazılım yatırımı. Katalog tavanı 8.000.000 TL, oran yüzde 50. Havuz ilan edilmedi.",
    minSupportMinor: 0,
    maxSupportMinor: 800_000_000,
    supportRatioBps: 5000,
    deadline: "2027-04-30T20:59:00.000Z",
    eligibility: AGENCY_ELIG(["35"]),
    tags: ["ajans", "izmir"],
    officialInfoUrl: "https://www.izka.org.tr/",
    publicationUrl: null,
  }),
  call({
    id: "bebka-yatirim-2027",
    sourceKey: "KALKINMA_AJANSI",
    title: "Bursa Eskişehir Bilecik Kalkınma Ajansı Yatırım Programı 2027",
    summary: "BEBKA illeri imalat yatırımı. Katalog tavanı 8.000.000 TL, oran yüzde 50. Havuz ilan edilmedi.",
    minSupportMinor: 0,
    maxSupportMinor: 800_000_000,
    supportRatioBps: 5000,
    deadline: "2027-05-15T20:59:00.000Z",
    eligibility: AGENCY_ELIG(["16", "26", "11"]),
    tags: ["ajans", "bebka"],
    officialInfoUrl: "https://www.bebka.org.tr/",
    publicationUrl: null,
  }),
  call({
    id: "geka-yatirim-2027",
    sourceKey: "KALKINMA_AJANSI",
    title: "Güney Ege Kalkınma Ajansı Yatırım Programı 2027",
    summary: "Aydın, Denizli ve Muğla imalat yatırımı. Katalog tavanı 6.000.000 TL, oran yüzde 50. Havuz ilan edilmedi.",
    minSupportMinor: 0,
    maxSupportMinor: 600_000_000,
    supportRatioBps: 5000,
    deadline: "2027-05-15T20:59:00.000Z",
    eligibility: AGENCY_ELIG(["09", "20", "48"]),
    tags: ["ajans", "geka"],
    officialInfoUrl: "https://www.geka.gov.tr/",
    publicationUrl: null,
  }),
  call({
    id: "mevka-yatirim-2027",
    sourceKey: "KALKINMA_AJANSI",
    title: "Mevlana Kalkınma Ajansı Yatırım Programı 2027",
    summary: "Konya ve Karaman imalat yatırımı. Katalog tavanı 6.000.000 TL, oran yüzde 50. Havuz ilan edilmedi.",
    minSupportMinor: 0,
    maxSupportMinor: 600_000_000,
    supportRatioBps: 5000,
    deadline: "2027-05-31T20:59:00.000Z",
    eligibility: AGENCY_ELIG(["42", "70"]),
    tags: ["ajans", "mevka"],
    officialInfoUrl: "https://www.mevka.org.tr/",
    publicationUrl: null,
  }),
  call({
    id: "karacadag-yatirim-2027",
    sourceKey: "KALKINMA_AJANSI",
    title: "Karacadağ Kalkınma Ajansı Yatırım Programı 2027",
    summary: "Diyarbakır ve Şanlıurfa imalat yatırımı. Katalog tavanı 6.000.000 TL, oran yüzde 50. Havuz ilan edilmedi.",
    minSupportMinor: 0,
    maxSupportMinor: 600_000_000,
    supportRatioBps: 5000,
    deadline: "2027-05-31T20:59:00.000Z",
    eligibility: AGENCY_ELIG(["21", "63"]),
    tags: ["ajans", "karacadag"],
    officialInfoUrl: "https://www.karacadag.gov.tr/",
    publicationUrl: null,
  }),
  call({
    id: "ankaraka-yatirim-2027",
    sourceKey: "KALKINMA_AJANSI",
    title: "Ankara Kalkınma Ajansı Yatırım Programı 2027",
    summary: "Ankara ili imalat ve yazılım yatırımı. Katalog tavanı 8.000.000 TL, oran yüzde 50. Havuz ilan edilmedi.",
    minSupportMinor: 0,
    maxSupportMinor: 800_000_000,
    supportRatioBps: 5000,
    deadline: "2027-04-15T20:59:00.000Z",
    eligibility: AGENCY_ELIG(["06"]),
    tags: ["ajans", "ankara"],
    officialInfoUrl: "https://www.ankaraka.org.tr/",
    publicationUrl: null,
  }),
  call({
    id: "marka-yatirim-2027",
    sourceKey: "KALKINMA_AJANSI",
    title: "Doğu Marmara Kalkınma Ajansı Yatırım Programı 2027",
    summary: "Kocaeli, Sakarya, Düzce, Bolu ve Yalova imalat yatırımı. Katalog tavanı 8.000.000 TL, oran yüzde 50. Havuz ilan edilmedi.",
    minSupportMinor: 0,
    maxSupportMinor: 800_000_000,
    supportRatioBps: 5000,
    deadline: "2027-05-31T20:59:00.000Z",
    eligibility: AGENCY_ELIG(["41", "54", "81", "14", "77"]),
    tags: ["ajans", "marka"],
    officialInfoUrl: "https://www.marka.org.tr/",
    publicationUrl: null,
  }),
  call({
    id: "iskur-isbasi-2027",
    sourceKey: "ISKUR",
    title: "İŞKUR İşbaşı Eğitim Programı 2027",
    summary:
      "İşbaşı eğitim döneminde işverene kişi başı destek. Katalog tavanı dönem kişi üst limiti 120.000 TL'dir. Havuz ilan edilmedi.",
    minSupportMinor: 0,
    maxSupportMinor: 12_000_000,
    supportRatioBps: 10000,
    deadline: "2027-12-15T20:59:00.000Z",
    eligibility: elig({ audiences: ["mevcut_kobi"], requiresKobiStatus: true }),
    tags: ["istihdam", "isbasi"],
    officialInfoUrl: "https://www.iskur.gov.tr/",
    publicationUrl: null,
  }),
  call({
    id: "iskur-engelli-istihdam-2027",
    sourceKey: "ISKUR",
    title: "İŞKUR Engelli İstihdam Teşviki 2027",
    summary:
      "Engelli istihdamında işverene prim ve ücret desteği. Katalog tavanı 150.000 TL. Havuz ilan edilmedi.",
    minSupportMinor: 0,
    maxSupportMinor: 15_000_000,
    supportRatioBps: 10000,
    deadline: "2027-12-15T20:59:00.000Z",
    eligibility: elig({ audiences: ["mevcut_kobi"] }),
    tags: ["istihdam", "engelli"],
    officialInfoUrl: "https://www.iskur.gov.tr/",
    publicationUrl: null,
  }),
  call({
    id: "iskur-toplum-yararina-2027",
    sourceKey: "ISKUR",
    title: "İŞKUR Toplum Yararına Programlar 2027",
    summary:
      "Toplum yararına çalışma programı. Katalog tavanı program dönem kişi limitidir. Havuz ilan edilmedi.",
    minSupportMinor: 0,
    maxSupportMinor: 10_000_000,
    supportRatioBps: 10000,
    deadline: "2027-09-30T20:59:00.000Z",
    eligibility: elig({ audiences: ["mevcut_kobi"] }),
    tags: ["istihdam"],
    officialInfoUrl: "https://www.iskur.gov.tr/",
    publicationUrl: null,
  }),
  call({
    id: "tarim-kirsal-kalkinma-2027",
    sourceKey: "TARIM_BAKANLIGI",
    title: "Tarım ve Orman Bakanlığı Kırsal Kalkınma Yatırımları 2027",
    summary:
      "Kırsal ekonomik yatırım ve makine desteği. Katalog tavanı 5.000.000 TL, oran yüzde 50. Tarım ve gıda NACE. Havuz ilan edilmedi.",
    minSupportMinor: 0,
    maxSupportMinor: 500_000_000,
    supportRatioBps: 5000,
    deadline: "2027-06-30T20:59:00.000Z",
    eligibility: elig({
      nacePrefixes: ["01", "10"],
      investmentFocus: ["makine_techizat"],
      audiences: ["mevcut_kobi", "yeni_girisimci"],
    }),
    tags: ["tarim", "kirsal"],
    officialInfoUrl: "https://www.tarimorman.gov.tr/",
    publicationUrl: null,
  }),
  call({
    id: "tarim-genc-ciftci-2027",
    sourceKey: "TARIM_BAKANLIGI",
    title: "Tarım ve Orman Bakanlığı Genç Çiftçi Desteği 2027",
    summary:
      "Genç çiftçi ve yeni tarımsal girişim desteği. Katalog tavanı 750.000 TL, oran yüzde 70. Havuz ilan edilmedi.",
    minSupportMinor: 0,
    maxSupportMinor: 75_000_000,
    supportRatioBps: 7000,
    deadline: "2027-04-30T20:59:00.000Z",
    eligibility: elig({
      nacePrefixes: ["01"],
      audiences: ["yeni_girisimci"],
      maxCompanyAgeYears: 3,
      investmentFocus: ["makine_techizat"],
    }),
    tags: ["tarim", "genc"],
    officialInfoUrl: "https://www.tarimorman.gov.tr/",
    publicationUrl: null,
  }),
  call({
    id: "sanayi-hamle-2027",
    sourceKey: "SANAYI_BAKANLIGI",
    title: "Sanayi ve Teknoloji Bakanlığı Teknoloji Odaklı Sanayi Hamlesi 2027",
    summary:
      "Teknoloji odaklı sanayi yatırımı. Bu sütundaki tavan 20.000.000 TL'dir. Ar-Ge veya makine odağı. Havuz ilan edilmedi.",
    minSupportMinor: 0,
    maxSupportMinor: 2_000_000_000,
    supportRatioBps: 5000,
    deadline: "2027-09-30T20:59:00.000Z",
    eligibility: elig({
      requiresRdActivity: true,
      investmentFocus: ["arge", "makine_techizat"],
      nacePrefixes: ["10", "25", "28", "62"],
      audiences: ["mevcut_kobi"],
    }),
    tags: ["sanayi", "hamle"],
    officialInfoUrl: "https://www.sanayi.gov.tr/",
    publicationUrl: null,
  }),
  call({
    id: "sanayi-yesil-donusum-2027",
    sourceKey: "SANAYI_BAKANLIGI",
    title: "Sanayi ve Teknoloji Bakanlığı Yeşil Dönüşüm Desteği 2027",
    summary:
      "Sanayide yeşil dönüşüm yatırımı. Katalog tavanı 10.000.000 TL, oran yüzde 50. Havuz ilan edilmedi.",
    minSupportMinor: 0,
    maxSupportMinor: 1_000_000_000,
    supportRatioBps: 5000,
    deadline: "2027-08-31T20:59:00.000Z",
    eligibility: elig({
      investmentFocus: ["makine_techizat"],
      nacePrefixes: ["10", "13", "25", "28"],
      audiences: ["mevcut_kobi"],
      requiresKobiStatus: true,
    }),
    tags: ["sanayi", "yesil"],
    officialInfoUrl: "https://www.sanayi.gov.tr/",
    publicationUrl: null,
  }),
  call({
    id: "ab-ipa-rekabet-2027",
    sourceKey: "AB_FONLARI",
    title: "AB IPA Rekabetçilik ve Yenilik Hibe Çağrısı 2027",
    summary:
      "IPA rekabetçilik penceresi KOBİ projeleri. Katalog tavanı 4.000.000 TL, oran yüzde 70. Havuz ilan edilmedi.",
    minSupportMinor: 0,
    maxSupportMinor: 400_000_000,
    supportRatioBps: 7000,
    deadline: "2027-06-15T20:59:00.000Z",
    eligibility: elig({
      audiences: ["mevcut_kobi"],
      requiresKobiStatus: true,
      investmentFocus: ["yazilim_dijital", "makine_techizat"],
      nacePrefixes: ["10", "28", "62"],
    }),
    tags: ["ab", "ipa"],
    officialInfoUrl: "https://www.ab.gov.tr/",
    publicationUrl: null,
  }),
  call({
    id: "ab-horizon-kobi-2027",
    sourceKey: "AB_FONLARI",
    title: "AB Ufuk Avrupa KOBİ Ar-Ge Çağrısı 2027",
    summary:
      "Ufuk Avrupa KOBİ Ar-Ge iş birliği. Katalog tavanı 7.500.000 TL, oran yüzde 70. Ar-Ge şarttır. Havuz ilan edilmedi.",
    minSupportMinor: 0,
    maxSupportMinor: 750_000_000,
    supportRatioBps: 7000,
    deadline: "2027-09-15T20:59:00.000Z",
    eligibility: elig({
      requiresRdActivity: true,
      audiences: ["mevcut_kobi"],
      investmentFocus: ["arge"],
      nacePrefixes: ["62", "72", "28"],
    }),
    tags: ["ab", "horizon"],
    officialInfoUrl: "https://www.ab.gov.tr/",
    publicationUrl: null,
  }),
  call({
    id: "ab-dijital-avrupa-2027",
    sourceKey: "AB_FONLARI",
    title: "AB Dijital Avrupa KOBİ Dijitalleşme Çağrısı 2027",
    summary:
      "Dijital Avrupa yazılım ve dijitalleşme çağrısı. Katalog tavanı 3.000.000 TL, oran yüzde 50. Havuz ilan edilmedi.",
    minSupportMinor: 0,
    maxSupportMinor: 300_000_000,
    supportRatioBps: 5000,
    deadline: "2027-07-15T20:59:00.000Z",
    eligibility: elig({
      investmentFocus: ["yazilim_dijital"],
      nacePrefixes: ["62", "72"],
      audiences: ["mevcut_kobi", "yeni_girisimci"],
    }),
    tags: ["ab", "dijital"],
    officialInfoUrl: "https://www.ab.gov.tr/",
    publicationUrl: null,
  }),
];
