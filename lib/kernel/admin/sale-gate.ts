/**
 * Akademi satış kapısı — **saf karar** (kernel, dikey oda import etmez).
 *
 * Anayasa B3: kart "Satın Al" demek için üçü birden gerekir —
 * veritabanında yayın, aktif fiyat satırı ve sınav yolundaki her derste
 * konuşma metni + mühürlü ses. Biri eksikse kart satın al demez.
 *
 * Bu dosya yalnız **kararı** taşır (saf fonksiyon, veri girişi dışarıdan).
 * Mühür katmanlarını diskten okuyan birleştirme `lib/academy/sale-gate-board.ts`
 * içindedir; B1 gereği kernel `lib/academy/*` import etmez.
 *
 * `sale-gate.ts` (eski ev) bu modülü yeniden dışa aktarır: tek kural, tek ev.
 */

export const ACADEMY_SALE_GATE_GAPS = ["Yayın", "Fiyat", "Ses ve metin"] as const;

export type AcademySaleGateGap = (typeof ACADEMY_SALE_GATE_GAPS)[number];

/** Kademeli yayın kademesi — `academyCourseSaleTier` ile aynı adlar. */
export type AcademySaleGateTierLabel = "closed" | "showcase" | "sale";

export function academySaleGateGaps(input: {
  published: boolean;
  activePrice: boolean;
  mediaSealed: boolean;
}): AcademySaleGateGap[] {
  const gaps: AcademySaleGateGap[] = [];
  if (!input.published) {
    gaps.push("Yayın");
  }
  if (!input.activePrice) {
    gaps.push("Fiyat");
  }
  if (!input.mediaSealed) {
    gaps.push("Ses ve metin");
  }
  return gaps;
}
