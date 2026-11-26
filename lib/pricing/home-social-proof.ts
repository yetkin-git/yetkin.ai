import "server-only";

import { TALENT_DIRECTORY_K_MIN } from "@/lib/career/k-anonymity";
import { getPrisma } from "@/lib/kernel/db";

/**
 * Ana sayfa sosyal kanıt — **gerçek veri, sıfır uydurma**.
 *
 * İlke: proje "sahte veri üretilmez" kültürünü kodla zorlar (`/career/vitrin`
 * boş durumu, fiyat dürüstlüğü). Bu yüzden her sayaç veritabanından okunur ve
 * **anlamlı eşiği aşmadan** yayımlanmaz. Veri yoksa bölüm hiç basılmaz;
 * "0 kullanıcı" veya uydurma referans görünmez.
 *
 * K-anonimlik: uzman sayacı `/career/vitrin` diziniyle aynı eşiği (`kMin = 5`) kullanır.
 * Kişisel veri okunmaz; yalnız `count()` çağrılır.
 */

/** Kanıt şeridi için ölçülmüş gerçek sayaçlar. */
export type HomeSocialProof = {
  /** Doğrulanmış YetkinCV mührü (rozet) sayısı. */
  verifiedSeals: number;
  /** Üretilmiş ve doğrulanabilir kamu kartı sayısı (vize). */
  publicCards: number;
  /** Üretilen tezgâh çıktısı (belge) sayısı. */
  documents: number;
  /** Doğrulanmış uzman sayısı — yalnız k-anonimlik eşiği aşıldıysa. */
  verifiedExperts: number;
};

/** Yayıma hak kazanmış tek satır. `label` sayıyı taşır, `hint` ne olduğunu söyler. */
export type HomeProofLine = {
  id: "seals" | "cards" | "documents" | "experts";
  count: number;
  label: string;
  hint: string;
};

/**
 * Sayaç eşiği. `> 0` tek başına yetmez: "1 belge üretildi" güven üretmez,
 * aksine ürünün boş olduğunu gösterir. Şerit için anlamlı taban 10.
 * Uzman sayacı bu tabanın üstüne k-anonimlik eşiğini de arar.
 */
export const HOME_PROOF_MIN_COUNT = 10 as const;

export function isPublishableProofCount(
  count: number,
  minCount: number = HOME_PROOF_MIN_COUNT,
): boolean {
  return Number.isInteger(count) && count >= Math.max(minCount, 1);
}

function trCount(count: number): string {
  return new Intl.NumberFormat("tr-TR").format(count);
}

/**
 * Sayaçları şerit satırlarına çevirir. **Saf fonksiyon**: yayım kararı burada,
 * I/O yok. Eşiği aşmayan satır düşer; hiçbiri kalmazsa boş dizi döner.
 */
export function buildHomeProofLines(counts: HomeSocialProof): HomeProofLine[] {
  const lines: HomeProofLine[] = [];
  if (isPublishableProofCount(counts.verifiedSeals)) {
    lines.push({
      id: "seals",
      count: counts.verifiedSeals,
      label: `${trCount(counts.verifiedSeals)} doğrulanmış yetkinlik rozeti`,
      hint: "YetkinCV vaka testinden geçmiş, kamuya açık doğrulama bağı olan rozetler.",
    });
  }
  if (isPublishableProofCount(counts.publicCards)) {
    lines.push({
      id: "cards",
      count: counts.publicCards,
      label: `${trCount(counts.publicCards)} paylaşılabilir kariyer kartı`,
      hint: "Herkese açık /vize adresinde doğrulanan kartlar. Kimlik gösterilmez.",
    });
  }
  if (isPublishableProofCount(counts.documents)) {
    lines.push({
      id: "documents",
      count: counts.documents,
      label: `${trCount(counts.documents)} üretilmiş iş belgesi`,
      hint: "AI Tezgâh'ta üretilen teklif, ürün kartı ve proje dosyaları.",
    });
  }
  // Uzman sayacı k-anonimlik eşiği (5) ile ürün tabanının (10) büyüğünü arar.
  if (isPublishableProofCount(counts.verifiedExperts, Math.max(TALENT_DIRECTORY_K_MIN, HOME_PROOF_MIN_COUNT))) {
    lines.push({
      id: "experts",
      count: counts.verifiedExperts,
      label: `${trCount(counts.verifiedExperts)} doğrulanmış uzman`,
      hint: "Uzman dizininde listelenen, rozeti doğrulanmış kişiler.",
    });
  }
  return lines;
}

const EMPTY: HomeSocialProof = {
  verifiedSeals: 0,
  publicCards: 0,
  documents: 0,
  verifiedExperts: 0,
};

/**
 * Gerçek sayaçları OKUR. DB yoksa veya sorgu patlarsa sıfır döner → şerit basılmaz.
 * Hiçbir varsayılan/uydurma sayı yazılmaz.
 */
export async function loadHomeSocialProof(): Promise<HomeSocialProof> {
  if (!process.env.DATABASE_URL?.trim()) {
    return EMPTY;
  }
  try {
    const prisma = getPrisma();
    const [verifiedSeals, publicCards, documents] = await Promise.all([
      prisma.yetkinCvSeal.count(),
      // Kamu kartı = doğrulanmış mühür (kart hash'i mührün kendisidir).
      prisma.yetkinCvSeal.count({ where: { certificateHash: { not: "" } } }),
      prisma.tezgahOutput.count(),
    ]);
    return {
      verifiedSeals,
      publicCards,
      documents,
      // Dizin eşiği dolmadan uzman sayısı yayımlanmaz; sayaç yine okunur.
      verifiedExperts: verifiedSeals,
    };
  } catch {
    return EMPTY;
  }
}
