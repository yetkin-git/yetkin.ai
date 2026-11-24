import type { PazaryeriId } from "@/lib/tezgah/pazaryeri/copy";

export type PazaryeriTaxonomyPaths = {
  trendyol: string;
  hepsiburada: string;
  amazon: string;
};

type TaxonomyEntry = {
  keys: readonly string[];
  paths: PazaryeriTaxonomyPaths;
};

/**
 * Deterministik kategori sözlüğü. Anahtarlar katlanmış Türkçe metin üzerinde
 * skorlanır; en yüksek skorlu yol seçilir. Eşleşme yoksa boş döner.
 */
const TAXONOMY: readonly TaxonomyEntry[] = [
  {
    keys: ["anne", "bebek", "battaniye", "tulum", "emzirme", "biberon"],
    paths: {
      trendyol: "Anne & Bebek > Bebek Tekstili",
      hepsiburada: "Anne Bebek > Bebek Giyim & Tekstil",
      amazon: "Bebek > Bebek Giyim",
    },
  },
  {
    keys: ["kadin", "elbise", "bluz", "etek", "abiye"],
    paths: {
      trendyol: "Kadın > Giyim",
      hepsiburada: "Moda > Kadın Giyim",
      amazon: "Moda > Kadın",
    },
  },
  {
    keys: ["erkek", "gomlek", "pantolon", "takimelbise"],
    paths: {
      trendyol: "Erkek > Giyim",
      hepsiburada: "Moda > Erkek Giyim",
      amazon: "Moda > Erkek",
    },
  },
  {
    keys: ["ayakkabi", "sneaker", "bot", "terlik", "sandalet"],
    paths: {
      trendyol: "Ayakkabı & Çanta > Ayakkabı",
      hepsiburada: "Ayakkabı / Çanta > Ayakkabı",
      amazon: "Moda > Ayakkabı",
    },
  },
  {
    keys: ["canta", "sirt", "cuzdan", "valiz"],
    paths: {
      trendyol: "Ayakkabı & Çanta > Çanta",
      hepsiburada: "Ayakkabı / Çanta > Çanta",
      amazon: "Moda > Çantalar",
    },
  },
  {
    keys: ["mutfak", "tencere", "tava", "tabak", "kupa", "bardak"],
    paths: {
      trendyol: "Ev & Yaşam > Mutfak Gereçleri",
      hepsiburada: "Ev, Yaşam > Mutfak Gereçleri",
      amazon: "Mutfak > Sofra & Servis",
    },
  },
  {
    keys: ["ev", "dekor", "halı", "perde", "aydınlatma", "mobilya"],
    paths: {
      trendyol: "Ev & Yaşam > Ev Dekorasyon",
      hepsiburada: "Ev, Yaşam > Ev Dekorasyon",
      amazon: "Ev & Yaşam > Dekorasyon",
    },
  },
  {
    keys: ["elektronik", "telefon", "kulaklik", "sarj", "tablet", "bilgisayar"],
    paths: {
      trendyol: "Elektronik > Cep Telefonu & Aksesuar",
      hepsiburada: "Elektronik > Telefon",
      amazon: "Elektronik > Cep Telefonları ve Aksesuarları",
    },
  },
  {
    keys: ["kozmetik", "cilt", "makyaj", "parfum", "sacbakim"],
    paths: {
      trendyol: "Kozmetik > Cilt Bakımı",
      hepsiburada: "Kozmetik & Kişisel Bakım > Cilt Bakımı",
      amazon: "Güzellik > Cilt Bakımı",
    },
  },
  {
    keys: ["gida", "gıda", "bakliyat", "atistirmalik", "icecek", "çay", "kahve"],
    paths: {
      trendyol: "Süpermarket > Gıda",
      hepsiburada: "Süpermarket > Gıda",
      amazon: "Gıda & İçecek",
    },
  },
  {
    keys: ["spor", "fitness", "yoga", "kamp", "outdoor"],
    paths: {
      trendyol: "Spor & Outdoor > Spor Giyim",
      hepsiburada: "Sporlar & Outdoor > Spor Giyim",
      amazon: "Spor ve Outdoor",
    },
  },
  {
    keys: ["oyuncak", "puzzle", "lego", "egiticioyuncak"],
    paths: {
      trendyol: "Oyuncak & Hobi > Oyuncak",
      hepsiburada: "Oyuncak > Eğitici Oyuncak",
      amazon: "Oyuncaklar ve Oyunlar",
    },
  },
  {
    keys: ["pet", "kedi", "kopek", "mama", "akvaryum"],
    paths: {
      trendyol: "Pet Shop > Kedi",
      hepsiburada: "Evcil Hayvan Ürünleri",
      amazon: "Evcil Hayvan Malzemeleri",
    },
  },
  {
    keys: ["kitap", "kırtasiye", "defter", "kalem"],
    paths: {
      trendyol: "Kitap & Kırtasiye",
      hepsiburada: "Kitap, Müzik, Film, Oyun > Kitap",
      amazon: "Kitap",
    },
  },
  {
    keys: ["otomotiv", "araba", "lastik", "yag", "aksesuar"],
    paths: {
      trendyol: "Otomotiv > Araç Aksesuarları",
      hepsiburada: "Otomobil > Araç İç Aksesuar",
      amazon: "Otomotiv",
    },
  },
];

function foldTaxonomyText(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ı", "i")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreEntry(haystack: string, keys: readonly string[]): number {
  let score = 0;
  for (const key of keys) {
    if (haystack.includes(key)) {
      score += key.length >= 5 ? 3 : 2;
    }
  }
  return score;
}

/** Kategori + ürün adından pazaryeri ana kategori yolunu eşler. */
export function matchPazaryeriTaxonomy(input: {
  market: PazaryeriId;
  category: string;
  productName?: string;
}): { path: string; matched: boolean; score: number } {
  const haystack = foldTaxonomyText(`${input.category} ${input.productName ?? ""}`);
  if (!haystack) {
    return { path: "", matched: false, score: 0 };
  }
  let best: TaxonomyEntry | null = null;
  let bestScore = 0;
  for (const entry of TAXONOMY) {
    const score = scoreEntry(haystack, entry.keys);
    if (score > bestScore) {
      best = entry;
      bestScore = score;
    }
  }
  if (!best || bestScore < 2) {
    return { path: "", matched: false, score: bestScore };
  }
  return { path: best.paths[input.market], matched: true, score: bestScore };
}
