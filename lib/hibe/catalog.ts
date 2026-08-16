import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import type { GrantProgramRecord } from "@/lib/hibe/types";

const SEED_AT = new Date("2026-08-14T00:00:00.000Z");

function seedProgram(
  partial: Omit<GrantProgramRecord, "currencyCode" | "isPublished" | "createdAt" | "updatedAt" | "jurisdiction"> & {
    jurisdiction?: string;
  },
): GrantProgramRecord {
  return {
    currencyCode: SETTLEMENT_CURRENCY,
    isPublished: true,
    createdAt: SEED_AT,
    updatedAt: SEED_AT,
    jurisdiction: "TR",
    ...partial,
  };
}

/** TR v1 içerik paketi — derleme; canlı devlet API değildir. */
export const SEED_GRANT_PROGRAMS: readonly GrantProgramRecord[] = [
  seedProgram({
    id: "gp_kosgeb_girisimcilik",
    slug: "kosgeb-girisimcilik",
    title: "KOSGEB Girişimcilik Destek Programı",
    summary:
      "Yeni kurulmuş KOBİ’ler için kuruluş ve ilk işletme giderlerine yönelik devlet desteği derlemesi.",
    agency: "KOSGEB",
    applicantKind: "CORPORATE",
    sectorTags: ["girisim", "kobi", "imalat"],
    requiresTaxId: true,
    applicationGuide:
      "1) KOSGEB e-devlet kaydı ve işletme sicili. 2) İş planı ve gider kalemleri. 3) Başvuru resmi KOSGEB kanalından yapılır; bu ekran rehberdir, canlı devlet API değildir.",
    maxAwardMinor: toAmountMinor(50_000_000),
  }),
  seedProgram({
    id: "gp_kosgeb_arge",
    slug: "kosgeb-arge-inovasyon",
    title: "KOSGEB AR-GE ve İnovasyon Destek Programı",
    summary: "KOBİ Ar-Ge ve inovasyon projelerine yönelik personel, makine ve danışmanlık kalemleri derlemesi.",
    agency: "KOSGEB",
    applicantKind: "CORPORATE",
    sectorTags: ["arge", "inovasyon", "yazilim"],
    requiresTaxId: true,
    applicationGuide:
      "1) Vergi levhası ve KOBİ beyannamesi. 2) Proje teknik özeti. 3) Resmi başvuru KOSGEB portalındadır; Yetkin Rail gönderim yapmaz.",
    maxAwardMinor: toAmountMinor(80_000_000),
  }),
  seedProgram({
    id: "gp_tubitak_1507",
    slug: "tubitak-1507",
    title: "TÜBİTAK 1507 KOBİ Ar-Ge Başlangıç Destek Programı",
    summary: "KOBİ ölçeğinde ilk Ar-Ge projeleri için TÜBİTAK 1507 derlemesi.",
    agency: "TUBITAK",
    applicantKind: "CORPORATE",
    sectorTags: ["arge", "kobi", "teknoloji"],
    requiresTaxId: true,
    applicationGuide:
      "1) PRODİS kaydı. 2) Proje öneri formu ve bütçe. 3) Başvuru TÜBİTAK kanallarındadır; bu katalog eşleştirme rehberidir.",
    maxAwardMinor: toAmountMinor(120_000_000),
  }),
  seedProgram({
    id: "gp_tubitak_1512",
    slug: "tubitak-1512-bigg",
    title: "TÜBİTAK 1512 BİGG Girişimcilik Desteği",
    summary: "Teknoloji tabanlı iş fikri olan birey ve şirketler için BİGG aşama derlemesi.",
    agency: "TUBITAK",
    applicantKind: "BOTH",
    sectorTags: ["girisim", "teknoloji", "yazilim"],
    requiresTaxId: false,
    applicationGuide:
      "1) İş fikri özeti ve kurucu özgeçmiş. 2) Uygulayıcı kuruluş çağrısı. 3) Resmi başvuru BİGG uygulayıcısınadır; Yetkin Rail devlet API’si değildir.",
    maxAwardMinor: toAmountMinor(20_000_000),
  }),
  seedProgram({
    id: "gp_tubitak_1501",
    slug: "tubitak-1501",
    title: "TÜBİTAK 1501 Sanayi Ar-Ge Destek Programı",
    summary: "Sanayi kuruluşlarının Ar-Ge projelerine yönelik 1501 derlemesi.",
    agency: "TUBITAK",
    applicantKind: "CORPORATE",
    sectorTags: ["arge", "sanayi"],
    requiresTaxId: true,
    applicationGuide:
      "1) Kuruluş Ar-Ge kapasitesi. 2) Teknik iş paketleri. 3) Başvuru TÜBİTAK PRODİS üzerindendir.",
    maxAwardMinor: toAmountMinor(250_000_000),
  }),
  seedProgram({
    id: "gp_kosgeb_ihracat",
    slug: "kosgeb-yurt-disi-pazar",
    title: "KOSGEB Yurt Dışı Pazar Destek Programı",
    summary: "KOBİ ihracat ve yurt dışı pazarlama faaliyetlerine yönelik derleme.",
    agency: "KOSGEB",
    applicantKind: "CORPORATE",
    sectorTags: ["ihracat", "pazarlama", "kobi"],
    requiresTaxId: true,
    applicationGuide:
      "1) İhracat geçmişi veya hedef pazar özeti. 2) Faaliyet bütçesi. 3) Resmi başvuru KOSGEB’dedir.",
    maxAwardMinor: toAmountMinor(40_000_000),
  }),
];
