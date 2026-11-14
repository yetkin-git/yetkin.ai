/**
 * Pazaryeri katalog mühürü. Başlık tavanı bizim sınırımızdır;
 * pazaryerinin o anki resmi limiti diye yazılmaz.
 * Barkod, fiyat ve stok sütunları durur, hücreleri boş kalır.
 */

export const PAZARYERI_FILENAME = "pazaryeri-katalog.csv" as const;

export const PAZARYERI_MAX_PRODUCTS = 8;
export const PAZARYERI_MAX_NAME = 80;
export const PAZARYERI_MAX_BLOCK = 500;
export const PAZARYERI_MAX_INPUT = 4_000;

export const PAZARYERI_MARKETS = [
  { id: "trendyol", label: "Trendyol", titleCap: 100 },
  { id: "hepsiburada", label: "Hepsiburada", titleCap: 150 },
  { id: "amazon", label: "Amazon", titleCap: 200 },
] as const;

export type PazaryeriId = (typeof PAZARYERI_MARKETS)[number]["id"];

export const PAZARYERI_LEAD = ["Pazaryeri", "Urun Adi", "Aciklama", "Kategori"] as const;
export const PAZARYERI_TAIL = ["Barkod", "Fiyat", "Stok"] as const;
export const PAZARYERI_DIGER = "Diger";

export function pazaryeriMarket(id: PazaryeriId): (typeof PAZARYERI_MARKETS)[number] {
  const market = PAZARYERI_MARKETS.find((item) => item.id === id);
  if (!market) {
    throw new Error("Pazaryeri yok.");
  }
  return market;
}
