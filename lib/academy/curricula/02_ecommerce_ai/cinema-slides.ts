export type EcommerceCinemaCue = {
  cueIndex: number;
  section: string;
  headline: string;
  subhead: string;
  bullets: readonly string[];
  tools: readonly string[];
  layout: "listing";
};

export type EcommerceCinemaLesson = {
  title: string;
  cues: readonly EcommerceCinemaCue[];
};

/** EC-102 slayt iskeleti. Saat lesson-cues JSON'dadır. Konuşma gövdesi burada kısılmaz. */
export const ECOMMERCE_CINEMA_LESSONS: Record<string, EcommerceCinemaLesson> = {
  "02_ecommerce_ai-1": {
    title: "Trendyol, Hepsiburada ve Amazon İçin Yapay Zekâ ile Ürün Açıklaması Yazma",
    cues: [
    {
      cueIndex: 1,
      section: "İnsani giriş ve oryantasyon",
      headline: "İNSANİ GİRİŞ VE ORYANTASYON",
      subhead: "Trendyol, Hepsiburada ve Amazon İçin Yapay Zekâ ile Ürün Açıklaması Yazma",
      bullets: ["İnsani giriş ve oryantasyon"],
      tools: ["Trendyol", "Hepsiburada", "Amazon"],
      layout: "listing" as const,
    },
    {
      cueIndex: 2,
      section: "SEO başlık ve ürün açıklaması",
      headline: "SEO BAŞLIK VE ÜRÜN AÇIKLAMASI",
      subhead: "Trendyol, Hepsiburada ve Amazon İçin Yapay Zekâ ile Ürün Açıklaması Yazma",
      bullets: ["SEO başlık ve ürün açıklaması"],
      tools: ["Trendyol", "Hepsiburada", "Amazon"],
      layout: "listing" as const,
    },
    {
      cueIndex: 3,
      section: "Prompt",
      headline: "PROMPT",
      subhead: "Trendyol, Hepsiburada ve Amazon İçin Yapay Zekâ ile Ürün Açıklaması Yazma",
      bullets: ["Prompt"],
      tools: ["Trendyol", "Hepsiburada", "Amazon"],
      layout: "listing" as const,
    },
    {
      cueIndex: 4,
      section: "Ders sonu özeti",
      headline: "DERS SONU ÖZETİ",
      subhead: "Trendyol, Hepsiburada ve Amazon İçin Yapay Zekâ ile Ürün Açıklaması Yazma",
      bullets: ["Ders sonu özeti"],
      tools: ["Trendyol", "Hepsiburada", "Amazon"],
      layout: "listing" as const,
    },
    {
      cueIndex: 5,
      section: "Gelecek ders ve veda",
      headline: "GELECEK DERS VE VEDA",
      subhead: "Trendyol, Hepsiburada ve Amazon İçin Yapay Zekâ ile Ürün Açıklaması Yazma",
      bullets: ["Gelecek ders ve veda"],
      tools: ["Trendyol", "Hepsiburada", "Amazon"],
      layout: "listing" as const,
    }
    ],
  },
  "02_ecommerce_ai-2": {
    title: "Yapay Zekâ ile Pazaryeri Görsel Standartları ve Arka Plan Temizleme",
    cues: [
    {
      cueIndex: 1,
      section: "İnsani giriş ve hatırlatma",
      headline: "İNSANİ GİRİŞ VE HATIRLATMA",
      subhead: "Yapay Zekâ ile Pazaryeri Görsel Standartları ve Arka Plan Temizleme",
      bullets: ["İnsani giriş ve hatırlatma"],
      tools: ["Trendyol", "Hepsiburada", "Amazon"],
      layout: "listing" as const,
    },
    {
      cueIndex: 2,
      section: "Pazaryeri görsel kuralları",
      headline: "PAZARYERİ GÖRSEL KURALLARI",
      subhead: "Yapay Zekâ ile Pazaryeri Görsel Standartları ve Arka Plan Temizleme",
      bullets: ["Pazaryeri görsel kuralları"],
      tools: ["Trendyol", "Hepsiburada", "Amazon"],
      layout: "listing" as const,
    },
    {
      cueIndex: 3,
      section: "Prompt",
      headline: "PROMPT",
      subhead: "Yapay Zekâ ile Pazaryeri Görsel Standartları ve Arka Plan Temizleme",
      bullets: ["Prompt"],
      tools: ["Trendyol", "Hepsiburada", "Amazon"],
      layout: "listing" as const,
    },
    {
      cueIndex: 4,
      section: "Ders sonu özeti",
      headline: "DERS SONU ÖZETİ",
      subhead: "Yapay Zekâ ile Pazaryeri Görsel Standartları ve Arka Plan Temizleme",
      bullets: ["Ders sonu özeti"],
      tools: ["Trendyol", "Hepsiburada", "Amazon"],
      layout: "listing" as const,
    },
    {
      cueIndex: 5,
      section: "Gelecek ders ve veda",
      headline: "GELECEK DERS VE VEDA",
      subhead: "Yapay Zekâ ile Pazaryeri Görsel Standartları ve Arka Plan Temizleme",
      bullets: ["Gelecek ders ve veda"],
      tools: ["Trendyol", "Hepsiburada", "Amazon"],
      layout: "listing" as const,
    }
    ],
  },
  "02_ecommerce_ai-3": {
    title: "Yapay Zekâ ile Müşteri Yorumu, Şikâyet ve İade Analizi",
    cues: [
    {
      cueIndex: 1,
      section: "İnsani giriş ve hatırlatma",
      headline: "İNSANİ GİRİŞ VE HATIRLATMA",
      subhead: "Yapay Zekâ ile Müşteri Yorumu, Şikâyet ve İade Analizi",
      bullets: ["İnsani giriş ve hatırlatma"],
      tools: ["Trendyol", "Hepsiburada", "Amazon"],
      layout: "listing" as const,
    },
    {
      cueIndex: 2,
      section: "Müşteri yorumları ve iade",
      headline: "MÜŞTERİ YORUMLARI VE İADE",
      subhead: "Yapay Zekâ ile Müşteri Yorumu, Şikâyet ve İade Analizi",
      bullets: ["Müşteri yorumları ve iade"],
      tools: ["Trendyol", "Hepsiburada", "Amazon"],
      layout: "listing" as const,
    },
    {
      cueIndex: 3,
      section: "Prompt",
      headline: "PROMPT",
      subhead: "Yapay Zekâ ile Müşteri Yorumu, Şikâyet ve İade Analizi",
      bullets: ["Prompt"],
      tools: ["Trendyol", "Hepsiburada", "Amazon"],
      layout: "listing" as const,
    },
    {
      cueIndex: 4,
      section: "Ders sonu özeti",
      headline: "DERS SONU ÖZETİ",
      subhead: "Yapay Zekâ ile Müşteri Yorumu, Şikâyet ve İade Analizi",
      bullets: ["Ders sonu özeti"],
      tools: ["Trendyol", "Hepsiburada", "Amazon"],
      layout: "listing" as const,
    },
    {
      cueIndex: 5,
      section: "Gelecek ders ve veda",
      headline: "GELECEK DERS VE VEDA",
      subhead: "Yapay Zekâ ile Müşteri Yorumu, Şikâyet ve İade Analizi",
      bullets: ["Gelecek ders ve veda"],
      tools: ["Trendyol", "Hepsiburada", "Amazon"],
      layout: "listing" as const,
    }
    ],
  },
  "02_ecommerce_ai-4": {
    title: "Yapay Zekâ ile Rakip Analizi, Fiyatlandırma ve Kâr Marjı",
    cues: [
    {
      cueIndex: 1,
      section: "İnsani giriş ve hatırlatma",
      headline: "İNSANİ GİRİŞ VE HATIRLATMA",
      subhead: "Yapay Zekâ ile Rakip Analizi, Fiyatlandırma ve Kâr Marjı",
      bullets: ["İnsani giriş ve hatırlatma"],
      tools: ["Trendyol", "Hepsiburada", "Amazon"],
      layout: "listing" as const,
    },
    {
      cueIndex: 2,
      section: "Rakip analizi ve fiyatlandırma",
      headline: "RAKİP ANALİZİ VE FİYATLANDIRMA",
      subhead: "Yapay Zekâ ile Rakip Analizi, Fiyatlandırma ve Kâr Marjı",
      bullets: ["Rakip analizi ve fiyatlandırma"],
      tools: ["Trendyol", "Hepsiburada", "Amazon"],
      layout: "listing" as const,
    },
    {
      cueIndex: 3,
      section: "Prompt",
      headline: "PROMPT",
      subhead: "Yapay Zekâ ile Rakip Analizi, Fiyatlandırma ve Kâr Marjı",
      bullets: ["Prompt"],
      tools: ["Trendyol", "Hepsiburada", "Amazon"],
      layout: "listing" as const,
    },
    {
      cueIndex: 4,
      section: "Ders sonu özeti",
      headline: "DERS SONU ÖZETİ",
      subhead: "Yapay Zekâ ile Rakip Analizi, Fiyatlandırma ve Kâr Marjı",
      bullets: ["Ders sonu özeti"],
      tools: ["Trendyol", "Hepsiburada", "Amazon"],
      layout: "listing" as const,
    },
    {
      cueIndex: 5,
      section: "Gelecek ders ve veda",
      headline: "GELECEK DERS VE VEDA",
      subhead: "Yapay Zekâ ile Rakip Analizi, Fiyatlandırma ve Kâr Marjı",
      bullets: ["Gelecek ders ve veda"],
      tools: ["Trendyol", "Hepsiburada", "Amazon"],
      layout: "listing" as const,
    }
    ],
  },
  "02_ecommerce_ai-5": {
    title: "Yapay Zekâ ile Toplu Ürün Açıklaması ve Şablon",
    cues: [
    {
      cueIndex: 1,
      section: "İnsani giriş ve hatırlatma",
      headline: "İNSANİ GİRİŞ VE HATIRLATMA",
      subhead: "Yapay Zekâ ile Toplu Ürün Açıklaması ve Şablon",
      bullets: ["İnsani giriş ve hatırlatma"],
      tools: ["Trendyol", "Hepsiburada", "Amazon"],
      layout: "listing" as const,
    },
    {
      cueIndex: 2,
      section: "Toplu ürün açıklaması ve şablon",
      headline: "TOPLU ÜRÜN AÇIKLAMASI VE ŞABLON",
      subhead: "Yapay Zekâ ile Toplu Ürün Açıklaması ve Şablon",
      bullets: ["Toplu ürün açıklaması ve şablon"],
      tools: ["Trendyol", "Hepsiburada", "Amazon"],
      layout: "listing" as const,
    },
    {
      cueIndex: 3,
      section: "Prompt",
      headline: "PROMPT",
      subhead: "Yapay Zekâ ile Toplu Ürün Açıklaması ve Şablon",
      bullets: ["Prompt"],
      tools: ["Trendyol", "Hepsiburada", "Amazon"],
      layout: "listing" as const,
    },
    {
      cueIndex: 4,
      section: "Ders sonu özeti",
      headline: "DERS SONU ÖZETİ",
      subhead: "Yapay Zekâ ile Toplu Ürün Açıklaması ve Şablon",
      bullets: ["Ders sonu özeti"],
      tools: ["Trendyol", "Hepsiburada", "Amazon"],
      layout: "listing" as const,
    },
    {
      cueIndex: 5,
      section: "Gelecek ders ve veda",
      headline: "GELECEK DERS VE VEDA",
      subhead: "Yapay Zekâ ile Toplu Ürün Açıklaması ve Şablon",
      bullets: ["Gelecek ders ve veda"],
      tools: ["Trendyol", "Hepsiburada", "Amazon"],
      layout: "listing" as const,
    }
    ],
  },
  "02_ecommerce_ai-6": {
    title: "Yapay Zekâ ile Mağaza Puanı ve Müşteri Mesajı Asistanı",
    cues: [
    {
      cueIndex: 1,
      section: "İnsani giriş ve hatırlatma",
      headline: "İNSANİ GİRİŞ VE HATIRLATMA",
      subhead: "Yapay Zekâ ile Mağaza Puanı ve Müşteri Mesajı Asistanı",
      bullets: ["İnsani giriş ve hatırlatma"],
      tools: ["Trendyol", "Hepsiburada", "Amazon"],
      layout: "listing" as const,
    },
    {
      cueIndex: 2,
      section: "Mağaza puanı ve müşteri mesajları",
      headline: "MAĞAZA PUANI VE MÜŞTERİ MESAJLARI",
      subhead: "Yapay Zekâ ile Mağaza Puanı ve Müşteri Mesajı Asistanı",
      bullets: ["Mağaza puanı ve müşteri mesajları"],
      tools: ["Trendyol", "Hepsiburada", "Amazon"],
      layout: "listing" as const,
    },
    {
      cueIndex: 3,
      section: "Prompt",
      headline: "PROMPT",
      subhead: "Yapay Zekâ ile Mağaza Puanı ve Müşteri Mesajı Asistanı",
      bullets: ["Prompt"],
      tools: ["Trendyol", "Hepsiburada", "Amazon"],
      layout: "listing" as const,
    },
    {
      cueIndex: 4,
      section: "Ders sonu özeti",
      headline: "DERS SONU ÖZETİ",
      subhead: "Yapay Zekâ ile Mağaza Puanı ve Müşteri Mesajı Asistanı",
      bullets: ["Ders sonu özeti"],
      tools: ["Trendyol", "Hepsiburada", "Amazon"],
      layout: "listing" as const,
    },
    {
      cueIndex: 5,
      section: "Modül kapanışı",
      headline: "MODÜL KAPANIŞI",
      subhead: "Yapay Zekâ ile Mağaza Puanı ve Müşteri Mesajı Asistanı",
      bullets: ["Modül kapanışı"],
      tools: ["Trendyol", "Hepsiburada", "Amazon"],
      layout: "listing" as const,
    },
    {
      cueIndex: 6,
      section: "Tebrik ve veda",
      headline: "TEBRİK VE VEDA",
      subhead: "Yapay Zekâ ile Mağaza Puanı ve Müşteri Mesajı Asistanı",
      bullets: ["Tebrik ve veda"],
      tools: ["Trendyol", "Hepsiburada", "Amazon"],
      layout: "listing" as const,
    }
    ],
  }
};
