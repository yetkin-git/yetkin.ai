/**
 * E-ticaret mağazasından hibe profili ön doldurma.
 * Çalışan sayısı ve yaş uydurulmaz. NACE yalnız kategori metni eşleşirse yazılır.
 */

const CATEGORY_NACE: readonly { pattern: RegExp; nace: string }[] = [
  { pattern: /tar[ıi]m/i, nace: "01" },
  { pattern: /g[ıi]da|yiyecek|i[cç]ecek/i, nace: "10" },
  { pattern: /tekstil|giyim|ayakkab/i, nace: "13" },
  { pattern: /plastik|kau[cç]uk|kimya/i, nace: "22" },
  { pattern: /metal/i, nace: "25" },
  { pattern: /makine|makina/i, nace: "28" },
  { pattern: /in[sş]aat/i, nace: "41" },
  { pattern: /toptan/i, nace: "46" },
  { pattern: /perakende|market|ma[gğ]aza|e-?ticaret/i, nace: "47" },
  { pattern: /ta[sş][ıi]ma|kargo|depolama|lojistik/i, nace: "49" },
  { pattern: /otel|konaklama|turizm/i, nace: "55" },
  { pattern: /restoran|kafe|cafe/i, nace: "56" },
  { pattern: /yaz[ıi]l[ıi]m|software|dijital|saas|bili[sş]im/i, nace: "62" },
  { pattern: /dan[ıi][sş]man|m[uü]hendislik/i, nace: "70" },
  { pattern: /ar-ge|arge|laboratuvar/i, nace: "72" },
  { pattern: /sa[gğ]l[ıi]k|medikal|hastane|klinik/i, nace: "86" },
];

export type StoreHibePrefill = {
  ad: string;
  isletme: "" | "esnaf" | "kobi";
  nace: string;
  yatirim: "ihracat";
  scaleLabel: string;
};

function naceFromCategories(categories: readonly string[]): string {
  const counts = new Map<string, number>();
  for (const category of categories) {
    const text = category.trim();
    if (!text) {
      continue;
    }
    const rule = CATEGORY_NACE.find((row) => row.pattern.test(text));
    if (!rule) {
      continue;
    }
    counts.set(rule.nace, (counts.get(rule.nace) ?? 0) + 1);
  }
  let best = "";
  let bestCount = 0;
  for (const [nace, count] of counts) {
    if (count > bestCount) {
      best = nace;
      bestCount = count;
    }
  }
  return best;
}

export function prefillFromStore(input: {
  storeName: string;
  categories: readonly string[];
}): StoreHibePrefill {
  const ad = input.storeName.trim().slice(0, 80);
  const filled = input.categories.map((row) => row.trim()).filter((row) => row.length > 0);
  if (filled.length === 0) {
    return {
      ad: ad.length >= 2 ? ad : "Mağaza",
      isletme: "",
      nace: "",
      yatirim: "ihracat",
      scaleLabel: "Bu mağazada ürün kartı yok. Ölçek ve sektör uydurulmadı.",
    };
  }
  const wide = filled.length >= 25;
  return {
    ad: ad.length >= 2 ? ad : "Mağaza",
    isletme: wide ? "kobi" : "esnaf",
    nace: naceFromCategories(filled),
    yatirim: "ihracat",
    scaleLabel: wide ? "Geniş ürün kataloğu." : "Küçük ürün kataloğu.",
  };
}
