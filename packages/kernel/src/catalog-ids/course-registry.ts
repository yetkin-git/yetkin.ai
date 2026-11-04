/**
 * Tek kurs kayıt defteri.
 * Saf veri: dosya sistemi, Prisma ve akademi motoru yok.
 * Akademi odası ve mobil istemci bu kartı okur. İçerik, canlı fiyat ve mühür kapısı burada durmaz.
 *
 * 13 kanon yetişkin kart (`01_` … `13_`) ve kanon dışı OFF-201 (`01_office_ai_ileri`).
 * `06_`–`13_` vitrin sırası yoktur; ders yolu boştur. Kabuk «hazırlanıyor» halidir.
 * Junior bu deftere girmez. Kendi odası `lib/junior` içindedir. `audience: "junior"` kartı yasaktır.
 * Young bu deftere girmez. Şema `lib/kernel/catalog-ids/school-segments.ts` içindedir.
 */

export type CourseRegistryLayer = 1 | 2 | 3;

export type CourseAudience = "adult" | "junior";

export type CourseWarmupBinding = {
  readonly assetKey: string;
  readonly lessonKeys: readonly string[];
};

export type CourseRegistrySeo = {
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly keywords: readonly string[];
};

export type CourseSeedRanks = {
  readonly globalRank: number;
  readonly localRank: number;
};

export type CourseRegistryCard = {
  readonly slug: string;
  readonly code: string;
  readonly title: string;
  readonly level: string;
  readonly layer: CourseRegistryLayer;
  readonly audience: CourseAudience;
  readonly canon: boolean;
  readonly priceSeedMinor: number;
  readonly voice: string;
  readonly lessonKeys: readonly string[];
  readonly warmup: readonly CourseWarmupBinding[];
  readonly coverPath: string | null;
  readonly summary: string;
  readonly seo: CourseRegistrySeo | null;
  readonly vitrineOrder: number | null;
  readonly nativeListed: boolean;
  readonly passportListed: boolean;
  readonly seedRanks: CourseSeedRanks | null;
};

export const COURSE_REGISTRY = [
  {
    slug: "01_office_ai",
    code: "OFF-101",
    title: "İş Hayatında ve Ofiste Yapay Zekâ",
    level: "Temel",
    layer: 1,
    audience: "adult",
    canon: true,
    priceSeedMinor: 89_000,
    voice: "Callirrhoe",
    lessonKeys: [
      "01_office_ai-1",
      "01_office_ai-k1",
      "01_office_ai-2",
      "01_office_ai-3",
      "01_office_ai-5",
      "01_office_ai-g1",
      "01_office_ai-w1",
      "01_office_ai-6",
    ],
    warmup: [
      {
        assetKey: "01_office_ai-1-warmup",
        /** Ders 3 (PowerPoint) bu kasette yok. Eski 0 ve 4 anahtarları sınav yolunda değildir. */
        lessonKeys: [
          "01_office_ai-0",
          "01_office_ai-1",
          "01_office_ai-2",
          "01_office_ai-4",
          "01_office_ai-5",
          "01_office_ai-6",
          "01_office_ai-g1",
          "01_office_ai-w1",
          "01_office_ai-k1",
        ],
      },
    ],
    coverPath: "/academy/cinema/01_office_ai-1-eye.webp",
    summary:
      "Excel, Word, PowerPoint ve e-postada yapay zekâ: yönetim özetine dönüştürme. Sertifika: 8 ders + 10 soru / 70. Sunucuda dosya kontrolü yok.",
    seo: {
      title: "İş Hayatında Yapay Zekâ: Excel ve E-Posta | yetkin.ai",
      description:
        "İş hayatında yapay zekâ ve Copilot kullanımı: Excel formülleri, yönetim özeti, Gmail Gemini ve KVKK e-postası. 8 derste pratik beceri ve sertifika.",
      h1: "İş Hayatında Yapay Zekâ: Excel'den E-Postaya 8 Ders",
      keywords: [
        "iş hayatında yapay zeka",
        "excel yapay zeka",
        "office copilot eğitimi",
        "yapay zeka sertifikası",
        "prompt mühendisliği office",
      ],
    },
    vitrineOrder: 1,
    nativeListed: true,
    passportListed: true,
    seedRanks: { globalRank: 1, localRank: 1 },
  },
  {
    slug: "01_office_ai_ileri",
    code: "OFF-201",
    title: "İleri Ofis Yapay Zekâ",
    level: "İleri",
    layer: 1,
    audience: "adult",
    canon: false,
    priceSeedMinor: 129_000,
    voice: "Kore",
    lessonKeys: [
      "01_office_ai_ileri-1",
      "01_office_ai_ileri-2",
      "01_office_ai_ileri-3",
      "01_office_ai_ileri-4",
      "01_office_ai_ileri-5",
      "01_office_ai_ileri-6",
    ],
    warmup: [
      {
        assetKey: "01_office_ai_ileri-warmup",
        lessonKeys: [
          "01_office_ai_ileri-1",
          "01_office_ai_ileri-2",
          "01_office_ai_ileri-3",
          "01_office_ai_ileri-4",
          "01_office_ai_ileri-5",
          "01_office_ai_ileri-6",
        ],
      },
    ],
    coverPath: "/academy/covers/01_office_ai_ileri.jpg",
    summary:
      "İleri ofis işi: dört parçalı istem, toplantı notu, formül, uzun belge, e-posta taslağı ve üç dosyada sayı denetimi.",
    seo: {
      title: "İleri Ofis Yapay Zekâ: Toplantı ve Denetim | yetkin.ai",
      description:
        "İleri düzey yapay zekâ uygulamaları: Dört parçalı istem, toplantı notu analizi, uzun belge özetleme ve 3 dosyada sayı denetimi. İleri seviye ofis uzmanlığı.",
      h1: "İleri Ofis Yapay Zekâ: Toplantı Notundan Sayı Denetimine",
      keywords: [
        "ileri ofis yapay zeka",
        "toplantı notu yapay zeka",
        "veri denetimi yapay zeka",
        "ileri seviye prompt",
      ],
    },
    vitrineOrder: 6,
    nativeListed: true,
    passportListed: false,
    seedRanks: null,
  },
  {
    slug: "02_ecommerce_ai",
    code: "EC-102",
    title: "E-Ticaret ve Pazaryeri Yapay Zekâ Asistanlığı",
    level: "Temel",
    layer: 1,
    audience: "adult",
    canon: true,
    priceSeedMinor: 99_000,
    voice: "Puck",
    lessonKeys: [
      "02_ecommerce_ai-1",
      "02_ecommerce_ai-2",
      "02_ecommerce_ai-3",
      "02_ecommerce_ai-4",
      "02_ecommerce_ai-5",
      "02_ecommerce_ai-6",
    ],
    warmup: [
      {
        assetKey: "02_ecommerce_ai-listing-warmup",
        lessonKeys: ["02_ecommerce_ai-1", "02_ecommerce_ai-2"],
      },
      {
        assetKey: "02_ecommerce_ai-ops-warmup",
        lessonKeys: [
          "02_ecommerce_ai-3",
          "02_ecommerce_ai-4",
          "02_ecommerce_ai-5",
          "02_ecommerce_ai-6",
        ],
      },
    ],
    coverPath: "/academy/cinema/02_ecommerce_ai-1-cue-1.jpg",
    summary:
      "Trendyol, Hepsiburada, Amazon ve Shopify vitrini: ürün yazısı, fotoğraf, yorum, fiyat ve mağaza mesajı.",
    seo: {
      title: "E-Ticaret Yapay Zekâ: Trendyol ve Shopify | yetkin.ai",
      description:
        "Trendyol, Hepsiburada, Amazon ve Shopify için ürün açıklaması, görsel, iade analizi ve mağaza mesajı. 6 derste e-ticaret yapay zekâ.",
      h1: "E-Ticaret ve Pazaryeri Yapay Zekâ Asistanlığı",
      keywords: [
        "e-ticaret yapay zeka",
        "pazaryeri yapay zeka asistanı",
        "trendyol ürün açıklaması yapay zeka",
        "hepsiburada yapay zeka",
        "e-ticaret seo prompt",
      ],
    },
    vitrineOrder: 2,
    nativeListed: true,
    passportListed: true,
    seedRanks: { globalRank: 2, localRank: 1 },
  },
  {
    slug: "03_social_media_ai",
    code: "SM-103",
    title: "Yapay Zekâ ile Sosyal Medya İçeriği",
    level: "Temel",
    layer: 1,
    audience: "adult",
    canon: true,
    priceSeedMinor: 89_000,
    voice: "Aoede",
    lessonKeys: [
      "03_social_media_ai-1",
      "03_social_media_ai-2",
      "03_social_media_ai-3",
      "03_social_media_ai-4",
      "03_social_media_ai-5",
      "03_social_media_ai-6",
    ],
    warmup: [
      {
        assetKey: "03_social_media_ai-warmup",
        lessonKeys: [
          "03_social_media_ai-1",
          "03_social_media_ai-2",
          "03_social_media_ai-3",
          "03_social_media_ai-4",
          "03_social_media_ai-5",
          "03_social_media_ai-6",
        ],
      },
    ],
    coverPath: "/academy/cinema/03_social_media_ai-1-cue-1.jpg",
    summary:
      "Sosyal medya görseli ve kısa video: künye, istem, tek stil ve yayından önce kontrol.",
    seo: {
      title: "Sosyal Medya Yapay Zekâ: Görsel ve Video | yetkin.ai",
      description:
        "Sosyal medya görseli ve kısa video: künye, tek stil, üç saniyelik kanca, altyazı ve yayından önce kontrol. 6 derste içerik üretimi ve sertifika.",
      h1: "Yapay Zekâ ile Sosyal Medya: Künyeden Kısa Videoya",
      keywords: [
        "sosyal medya yapay zeka",
        "kısa video yapay zeka",
        "instagram içerik eğitimi",
        "yapay zeka görsel üretimi",
      ],
    },
    vitrineOrder: 3,
    nativeListed: true,
    passportListed: true,
    seedRanks: { globalRank: 3, localRank: 1 },
  },
  {
    slug: "04_chatbot_nocode",
    code: "BOT-104",
    title: "Kodsuz WhatsApp ve Web Chatbot Kurulumu",
    level: "Masterclass",
    layer: 1,
    audience: "adult",
    canon: true,
    priceSeedMinor: 129_000,
    voice: "Achird",
    lessonKeys: [
      "04_chatbot_nocode-1",
      "04_chatbot_nocode-2",
      "04_chatbot_nocode-3",
      "04_chatbot_nocode-4",
      "04_chatbot_nocode-5",
      "04_chatbot_nocode-6",
    ],
    warmup: [
      {
        assetKey: "04_chatbot_nocode-warmup",
        lessonKeys: [
          "04_chatbot_nocode-1",
          "04_chatbot_nocode-2",
          "04_chatbot_nocode-3",
          "04_chatbot_nocode-4",
          "04_chatbot_nocode-5",
          "04_chatbot_nocode-6",
        ],
      },
    ],
    coverPath: "/academy/cinema/04_chatbot_nocode-1-cue-1.jpg",
    summary:
      "Voiceflow ve Botpress ile kodsuz müşteri asistanı: WhatsApp, web sohbet, randevu ve teslim seti.",
    seo: {
      title: "Kodsuz WhatsApp ve Web Chatbot Eğitimi | yetkin.ai",
      description:
        "Voiceflow ve Botpress ile kodsuz WhatsApp ve web chatbot: karşılama, randevu, yanlış anlama ve teslim listesi. 6 derste sertifika.",
      h1: "Kodsuz WhatsApp ve Web Chatbot: Karşılamadan Teslime",
      keywords: [
        "whatsapp chatbot",
        "kodsuz chatbot kurulumu",
        "müşteri hizmetleri chatbot",
        "web chatbot eğitimi",
      ],
    },
    vitrineOrder: 5,
    nativeListed: true,
    passportListed: true,
    seedRanks: { globalRank: 4, localRank: 1 },
  },
  {
    slug: "05_prompt_practice",
    code: "PR-105",
    title: "Yapay Zekâ Prompt Mühendisliği",
    level: "Masterclass",
    layer: 1,
    audience: "adult",
    canon: true,
    priceSeedMinor: 129_000,
    voice: "Fenrir",
    lessonKeys: [
      "05_prompt_practice-1",
      "05_prompt_practice-2",
      "05_prompt_practice-3",
      "05_prompt_practice-4",
      "05_prompt_practice-5",
      "05_prompt_practice-6",
    ],
    warmup: [
      {
        assetKey: "05_prompt_practice-warmup",
        lessonKeys: [
          "05_prompt_practice-1",
          "05_prompt_practice-2",
          "05_prompt_practice-3",
          "05_prompt_practice-4",
          "05_prompt_practice-5",
          "05_prompt_practice-6",
        ],
      },
    ],
    coverPath: "/academy/cinema/05_prompt_practice-1-cue-1.jpg",
    summary:
      "Yapay Zekâya Doğru Talimat Verme Sanatı. Rol, bağlam, biçim ve günlük istem seti.",
    seo: {
      title: "Yapay Zekâ Prompt Eğitimi: Doğru Talimat | yetkin.ai",
      description:
        "Yapay zekâya doğru talimat: rol, bağlam, biçim, kaynak sınırı, tablo ve günlük istem seti. 6 derste prompt pratiği ve sertifika.",
      h1: "Yapay Zekâya Doğru Talimat Verme: Altı Ders",
      keywords: [
        "prompt mühendisliği",
        "yapay zeka prompt eğitimi",
        "doğru talimat verme",
        "istem yazma pratiği",
      ],
    },
    vitrineOrder: 4,
    nativeListed: true,
    passportListed: true,
    seedRanks: { globalRank: 5, localRank: 1 },
  },
  {
    slug: "06_n8n_automation",
    code: "N8N-201",
    title: "Kurumsal İş Akışı Otomasyonu",
    level: "Orta",
    layer: 2,
    audience: "adult",
    canon: true,
    priceSeedMinor: 390_000,
    voice: "Zephyr",
    lessonKeys: [],
    warmup: [],
    coverPath: null,
    summary:
      "Self-hosted n8n, Make ve yapay zekâ entegrasyonu. Hazırlanıyor; satın alma tek başına belge üretmez.",
    seo: null,
    vitrineOrder: null,
    nativeListed: false,
    passportListed: false,
    seedRanks: { globalRank: 6, localRank: 2 },
  },
  {
    slug: "07_langgraph_agents",
    code: "LG-202",
    title: "Otonom Yapay Zekâ Ajanları",
    level: "Orta",
    layer: 2,
    audience: "adult",
    canon: true,
    priceSeedMinor: 590_000,
    voice: "Fenrir",
    lessonKeys: [],
    warmup: [],
    coverPath: null,
    summary:
      "LangGraph, CrewAI ve tool-calling ile ajan mimarisi. Hazırlanıyor; satın alma tek başına belge üretmez.",
    seo: null,
    vitrineOrder: null,
    nativeListed: false,
    passportListed: false,
    seedRanks: { globalRank: 7, localRank: 2 },
  },
  {
    slug: "08_production_rag",
    code: "RAG-203",
    title: "Kurumsal Arama ve Production RAG",
    level: "Orta",
    layer: 2,
    audience: "adult",
    canon: true,
    priceSeedMinor: 690_000,
    voice: "Erinome",
    lessonKeys: [],
    warmup: [],
    coverPath: null,
    summary:
      "Vektör veritabanı, GraphRAG ve hibrit arama. Hazırlanıyor; satın alma tek başına belge üretmez.",
    seo: null,
    vitrineOrder: null,
    nativeListed: false,
    passportListed: false,
    seedRanks: { globalRank: 8, localRank: 2 },
  },
  {
    slug: "09_nextjs_ai",
    code: "NX-204",
    title: "AI-Native Fullstack Web Geliştirme",
    level: "Orta",
    layer: 2,
    audience: "adult",
    canon: true,
    priceSeedMinor: 490_000,
    voice: "Puck",
    lessonKeys: [],
    warmup: [],
    coverPath: null,
    summary:
      "Next.js, Vercel AI SDK ve reaktif arayüz. Hazırlanıyor; satın alma tek başına belge üretmez.",
    seo: null,
    vitrineOrder: null,
    nativeListed: false,
    passportListed: false,
    seedRanks: { globalRank: 9, localRank: 2 },
  },
  {
    slug: "10_data_analytics_ai",
    code: "DA-205",
    title: "Veri Analitiği ve İş Zekâsı",
    level: "Orta",
    layer: 2,
    audience: "adult",
    canon: true,
    priceSeedMinor: 349_000,
    voice: "Aoede",
    lessonKeys: [],
    warmup: [],
    coverPath: null,
    summary:
      "Power BI, Python ve SQL ile iş zekâsı. Hazırlanıyor; satın alma tek başına belge üretmez.",
    seo: null,
    vitrineOrder: null,
    nativeListed: false,
    passportListed: false,
    seedRanks: { globalRank: 10, localRank: 2 },
  },
  {
    slug: "11_llm_redteam",
    code: "RT-301",
    title: "Yapay Zekâ Güvenliği ve Red Teaming",
    level: "İleri",
    layer: 3,
    audience: "adult",
    canon: true,
    priceSeedMinor: 1_500_000,
    voice: "Fenrir",
    lessonKeys: [],
    warmup: [],
    coverPath: null,
    summary:
      "LLM red teaming ve guardrails mimarisi. Hazırlanıyor; satın alma tek başına belge üretmez.",
    seo: null,
    vitrineOrder: null,
    nativeListed: false,
    passportListed: false,
    seedRanks: { globalRank: 11, localRank: 3 },
  },
  {
    slug: "12_onprem_finetune",
    code: "FT-302",
    title: "Yerel Model Dağıtımı ve İnce Ayar",
    level: "İleri",
    layer: 3,
    audience: "adult",
    canon: true,
    priceSeedMinor: 1_900_000,
    voice: "Puck",
    lessonKeys: [],
    warmup: [],
    coverPath: null,
    summary:
      "LoRA, QLoRA ve vLLM ile yerel model ince ayarı. Hazırlanıyor; satın alma tek başına belge üretmez.",
    seo: null,
    vitrineOrder: null,
    nativeListed: false,
    passportListed: false,
    seedRanks: { globalRank: 12, localRank: 3 },
  },
  {
    slug: "13_ai_governance",
    code: "GV-303",
    title: "Kurumsal AI Yönetişimi ve Uyum",
    level: "İleri",
    layer: 3,
    audience: "adult",
    canon: true,
    priceSeedMinor: 1_500_000,
    voice: "Leda",
    lessonKeys: [],
    warmup: [],
    coverPath: null,
    summary:
      "AB Yapay Zekâ Yasası ve KVKK uyumu. Hazırlanıyor; satın alma tek başına belge üretmez.",
    seo: null,
    vitrineOrder: null,
    nativeListed: false,
    passportListed: false,
    seedRanks: { globalRank: 13, localRank: 3 },
  },
] as const satisfies readonly CourseRegistryCard[];

export type CourseRegistryEntry = (typeof COURSE_REGISTRY)[number];

export function courseRegistryBySlug(slug: string): CourseRegistryEntry | undefined {
  return COURSE_REGISTRY.find((row) => row.slug === slug);
}

/** Kurs satır kimliği. `ac_<slug>`. */
export function courseRegistryRowId(slug: string): string {
  return `ac_${slug}`;
}

/** Katalog birimi. `course:<slug>`. */
export function courseRegistryUnitKey(slug: string): string {
  return `course:${slug}`;
}

/** Fiyat satır kimliği. `cat_academy_course_<slug>`. */
export function courseRegistryPriceEntryId(slug: string): string {
  return `cat_academy_course_${slug}`;
}

/** Sınav kimliği. `exam_<slug>`. */
export function courseRegistryExamId(slug: string): string {
  return `exam_${slug}`;
}

function assertCourseRegistry(): void {
  const slugs = COURSE_REGISTRY.map((row) => row.slug);
  if (new Set(slugs).size !== slugs.length) {
    throw new Error("Kurs kayıt defterinde slug tekrarlı.");
  }
  const codes = COURSE_REGISTRY.map((row) => row.code);
  if (new Set(codes).size !== codes.length) {
    throw new Error("Kurs kayıt defterinde kod tekrarlı.");
  }

  const cards: readonly CourseRegistryCard[] = COURSE_REGISTRY;
  const adults = cards.filter((row) => row.audience === "adult");
  const juniors = cards.filter((row) => row.audience === "junior");
  if (adults.length + juniors.length !== COURSE_REGISTRY.length) {
    throw new Error("Kurs kartının kitlesi adult veya junior olmalıdır.");
  }
  if (adults.length !== 14) {
    throw new Error("Yetişkin kart 14 olmalıdır.");
  }

  const canon = adults.filter((row) => row.canon);
  if (canon.length !== 13) {
    throw new Error("Kanon 13 olmalıdır.");
  }
  if (adults.length - canon.length !== 1) {
    throw new Error("Kanon dışı kart yalnız OFF-201 olmalıdır.");
  }
  const orders: number[] = [];
  for (const row of adults) {
    if (row.vitrineOrder !== null) {
      orders.push(row.vitrineOrder);
    }
  }
  const sortedOrders = [...orders].sort((a, b) => a - b);
  if (sortedOrders.join(",") !== "1,2,3,4,5,6" || new Set(orders).size !== orders.length) {
    throw new Error("Vitrin sırası 1’den 6’ya kadar, tekrarsız olmalıdır.");
  }
  if (adults.filter((row) => row.nativeListed).length !== 6) {
    throw new Error("Mobil liste altı vitrin kartıdır.");
  }
  if (adults.filter((row) => row.passportListed).length !== 5) {
    throw new Error("Pasaport kapısı beş koddur.");
  }

  if (juniors.length !== 0) {
    throw new Error("Junior kartı Akademi defterinde durmaz. Kendi odası lib/junior içindedir.");
  }
  if (cards.some((row) => row.slug.startsWith("jr_"))) {
    throw new Error("Junior ders kodu Akademi defterine yazılmaz.");
  }

  const warmupKeys: string[] = [];
  for (const row of COURSE_REGISTRY) {
    for (const binding of row.warmup) {
      for (const lessonKey of binding.lessonKeys) {
        warmupKeys.push(lessonKey);
      }
    }
  }
  if (new Set(warmupKeys).size !== warmupKeys.length) {
    throw new Error("Isınma ders anahtarı iki kasete yazılamaz.");
  }

  for (const row of cards) {
    if (row.title.length > 55) {
      throw new Error(`Kurs başlığı 55 karakteri aşıyor: ${row.slug} (${row.title.length}).`);
    }
    if (row.title.includes("(") || row.title.includes(")")) {
      throw new Error(`Kurs başlığında parantez var: ${row.slug}.`);
    }
    if (row.summary.length > 140) {
      throw new Error(`Kurs özeti 140 karakteri aşıyor: ${row.slug} (${row.summary.length}).`);
    }
    if (row.summary.includes("Altı ders seslidir") || row.summary.includes("Sınav barajı 70")) {
      throw new Error(`Ders ve baraj cümlesi kart özetinde durmaz: ${row.slug}.`);
    }
    if (row.seo) {
      if (row.seo.title.length < 50 || row.seo.title.length > 60) {
        throw new Error(
          `Arama başlığı 50-60 karakter bandında değil: ${row.slug} (${row.seo.title.length}).`,
        );
      }
      if (!row.seo.title.endsWith(" | yetkin.ai")) {
        throw new Error(`Arama başlığı marka soneki taşımıyor: ${row.slug}.`);
      }
      if (row.seo.description.length > 160) {
        throw new Error(`Arama açıklaması 160 karakteri aşıyor: ${row.slug} (${row.seo.description.length}).`);
      }
    }
  }
}

assertCourseRegistry();
