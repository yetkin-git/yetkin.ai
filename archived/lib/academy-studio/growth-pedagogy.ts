export type AcademyGrowthPedagogy = {
  warmup: string;
  challenge: string;
};

/** Büyüme SKU — mevcut ısınma metinlerine takma ad (orta/ileri halka). */
export const ACADEMY_GROWTH_PEDAGOGY_ALIAS: Record<string, string> = {
  "python-temel-9": "python-orta-5",
  "python-temel-10": "python-orta-1",
  "python-temel-11": "python-orta-4",
  "python-temel-12": "python-orta-8",
  "fullstack-temel-7": "fullstack-orta-1",
  "fullstack-temel-8": "fullstack-orta-3",
  "fullstack-temel-9": "fullstack-orta-7",
  "fullstack-temel-10": "fullstack-ileri-1",
  "fullstack-temel-11": "fullstack-ileri-3",
  "fullstack-temel-12": "fullstack-ileri-10",
  "ai-temel-7": "python-bi-1",
  "ai-temel-8": "python-orta-6",
  "ai-temel-9": "python-orta-7",
  "ai-temel-10": "ai-orta-1",
  "ai-temel-11": "ai-orta-7",
  "ai-temel-12": "ai-orta-8",
  "ux-temel-8": "ux-orta-1",
  "ux-temel-9": "ux-orta-4",
  "ux-temel-10": "ux-orta-6",
  "ux-temel-11": "ux-orta-7",
  "ux-temel-12": "ux-ileri-1",
};

/** Yalnız takma adsız yeni anahtarlar — liste / sözlük. */
export const ACADEMY_GROWTH_PEDAGOGY: Record<string, AcademyGrowthPedagogy> = {
  "python-temel-7": {
    warmup:
      "Pazar tezgâhında sebzeler sırayla durur; «üçüncü» deyince hangi raf olduğu karışır. Bu derste listeleri konuşuyoruz — indeks sıfırdan başlar, son eleman -1’dir.",
    challenge: "İsteğe bağlı: sepet[-1] ile son elemanı okuyan iki satır yaz.",
  },
  "python-temel-8": {
    warmup:
      "Dolap rafında kavanozun üstünde etiket vardır; sıra numarasıyla recel aramazsın. Bu derste sözlükleri konuşuyoruz — yok anahtarda çökmek yerine .get ile sor.",
    challenge: "İsteğe bağlı: stok.get(\"armut\", 0) satırını ve KeyError gerekçesini yaz.",
  },
};
