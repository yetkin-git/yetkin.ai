/**
 * Ana sayfa "hibe hazırlığı" bölümünün durum çözücüsü. Saf fonksiyon: G/Ç yok.
 *
 * V1 yalnız iki oda da kapalıyken görünür. "Hazırlanıyor" metni açık bir odayla
 * çelişir; oda açılırsa bölüm gizlenir (bilinmeyen durum da gizlenir).
 * V2 ve V3 kendi kopyasını ve fiyat kaynağını (PriceCatalogEntry) bu çözücüye
 * ayrı bir durum olarak ekleyerek gelir.
 */

export type HomeOfferState = "preview" | "hidden";

export type HomeOfferRoomFlags = {
  /** `DronBayrakları.isKapali("yetkinhibe")`: hibe odası kapalı mı. */
  readonly yetkinhibeKapali: boolean;
  /** `DronBayrakları.isKapali("freelancer")`: uzman odası kapalı mı. */
  readonly freelancerKapali: boolean;
};

export function resolveHomeOfferState(flags: HomeOfferRoomFlags): HomeOfferState {
  return flags.yetkinhibeKapali && flags.freelancerKapali ? "preview" : "hidden";
}
