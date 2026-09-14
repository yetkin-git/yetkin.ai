/**
 * Tur 3 sinema slayt kataloğu — cue kartı içerik SSOT.
 * Bake `scripts/render-academy-cinema-cues.ts` JPG yazar; izlemede generate yok.
 * Taze ingest öncesi slayt gövdesi boştur; 30 ders anahtarı iskelet durur.
 * 01_office_ai-1 Altın Şablon: Beat 3 `visualMode: "split"` Önce/Sonra karşılaştırması.
 * 01_office_ai-2: Beat 3 sol ÖNCE (10 SAYFALIK DÖKÜM), sağ SONRA (3 MADDELİK YÖNETİM ÖZETİ - AI).
 * Command boyunca temiz özet paneli kapalı (Spoiler Yasağı).
 * Pekiştirme: cue-01 GİRİŞ KÖPRÜSÜ, cue-07 CEBİNE KOY.
 */

import {
  ACADEMY_GOLDEN_COMPARE_AFTER_LABEL,
  ACADEMY_GOLDEN_COMPARE_BEFORE_LABEL,
  ACADEMY_OFFICE_AI_2_COMPARE_AFTER_LABEL,
  ACADEMY_OFFICE_AI_2_COMPARE_BEFORE_LABEL,
  type AcademyGoldenBeatId,
  type AcademyGoldenVisualMode,
} from "@/lib/academy/lesson-beat-visual";

export const ACADEMY_CINEMA_CUE_SLIDE_LESSON_KEYS = [
  "01_office_ai-1",
  "01_office_ai-2",
  "01_office_ai-3",
  "01_office_ai-4",
  "01_office_ai-5",
  "01_office_ai-6",
  "02_ecommerce_ai-1",
  "02_ecommerce_ai-2",
  "02_ecommerce_ai-3",
  "02_ecommerce_ai-4",
  "02_ecommerce_ai-5",
  "02_ecommerce_ai-6",
  "03_social_media_ai-1",
  "03_social_media_ai-2",
  "03_social_media_ai-3",
  "03_social_media_ai-4",
  "03_social_media_ai-5",
  "03_social_media_ai-6",
  "04_chatbot_nocode-1",
  "04_chatbot_nocode-2",
  "04_chatbot_nocode-3",
  "04_chatbot_nocode-4",
  "04_chatbot_nocode-5",
  "04_chatbot_nocode-6",
  "05_prompt_practice-1",
  "05_prompt_practice-2",
  "05_prompt_practice-3",
  "05_prompt_practice-4",
  "05_prompt_practice-5",
  "05_prompt_practice-6",
] as const;

export type AcademyCinemaCueSlideLessonKey = (typeof ACADEMY_CINEMA_CUE_SLIDE_LESSON_KEYS)[number];

export type AcademyCinemaCueLayout =
  | "problem"
  | "chat"
  | "excel"
  | "email"
  | "word"
  | "pptx"
  | "outlook"
  | "listing"
  | "shield"
  | "flow"
  | "whatsapp"
  | "reels"
  | "prompt"
  | "keys";

export type AcademyCinemaThemeId = "office" | "commerce" | "social" | "bot" | "prompt";

export type AcademyCinemaBeatId = AcademyGoldenBeatId;
export type AcademyCinemaVisualMode = AcademyGoldenVisualMode;

export type AcademyCinemaCompareSpec = {
  beforeCueIndex: number;
  beforeLabel: string;
  afterLabel: string;
};

export type AcademyCinemaCueSlide = {
  lessonKey: AcademyCinemaCueSlideLessonKey;
  cueIndex: number;
  theme: AcademyCinemaThemeId;
  courseLabel: string;
  lessonTitle: string;
  instructor: string;
  section: string;
  headline: string;
  subhead: string;
  bullets: readonly string[];
  tools: readonly string[];
  layout: AcademyCinemaCueLayout;
  beat?: AcademyCinemaBeatId;
  visualMode?: AcademyCinemaVisualMode;
  compare?: AcademyCinemaCompareSpec;
  stats?: readonly { label: string; value: string }[];
  table?: { headers: readonly string[]; rows: readonly (readonly string[])[]; note?: string };
  chat?: { role: string; prompt: string; replyTitle: string; replyLines: readonly string[] };
  messages?: readonly { from: "bot" | "user"; text: string }[];
  nodes?: readonly { title: string; sub: string }[];
  keys?: readonly { n: string; title: string; body: string }[];
  warning?: string;
  fieldTask?: string;
  highlightCell?: string;
  mergedTop?: boolean;
  zoomA1?: boolean;
  formulaBar?: string;
  fileName?: string;
  sheetName?: string;
  copilot?: { prompt: string; replyLines: readonly string[]; hideReply?: boolean };
};

type OverlayDraft = Omit<
  AcademyCinemaCueSlide,
  "lessonKey" | "theme" | "courseLabel" | "lessonTitle" | "instructor"
>;

type LessonDraft = {
  title: string;
  theme: AcademyCinemaThemeId;
  courseLabel: string;
  instructor: string;
  cues: readonly OverlayDraft[];
};

const EMPTY_CUES: readonly OverlayDraft[] = [];

const OFFICE = {
  theme: "office" as const,
  courseLabel: "Ofis AI · Excel Word PPT Outlook",
  instructor: "Gözde",
};
const COMMERCE = {
  theme: "commerce" as const,
  courseLabel: "E-Ticaret AI · Trendyol HB Amazon",
  instructor: "Aylin",
};
const SOCIAL = {
  theme: "social" as const,
  courseLabel: "Sosyal Medya AI · Reels Fabrikası",
  instructor: "Deniz",
};
const BOT = {
  theme: "bot" as const,
  courseLabel: "Kodsuz Chatbot · Voiceflow Botpress",
  instructor: "Kaan",
};
const PROMPT = {
  theme: "prompt" as const,
  courseLabel: "Prompt Atölyesi · ChatGPT Claude Perplexity",
  instructor: "Gözde",
};

/** 01_office_ai-1 Command beat — dağınık ızgara; temiz tablo yalnız Beat 3 sağ panelde. */
const OFFICE_AI_1_MESSY_TABLE = {
  headers: ["Tarih", "Cari", "Fatura", "Tutar", "Durum", "Not"],
  rows: [
    ["12.03.2026", "Kaya Gıda A.Ş.", "FT-1042", "12 450", "Ödendi", ""],
    ["", "", "", "", "", ""],
    ["12/03/26", "Demir Lojistik", "ft 1043", "8.200 TL", "Bekler", "mail?"],
    ["Mart-12", "Pınar Market", "1044", "3400", "ödendi", "vade?"],
    ["13.03.2026", "Yıldız Tekstil", "", "  9 100 ", "Açık", ""],
    ["", "", "", "", "", ""],
    ["14/3/2026", "Kaya Gıda A.Ş.", "FT-1047", "21500", "ÖDENDİ", "çift mi"],
  ],
  note: "A1:F1 birleşik afiş — tablo değil.",
} as const;

const LESSONS: Record<AcademyCinemaCueSlideLessonKey, LessonDraft> = {
  "01_office_ai-1": {
    ...OFFICE,
    title: "Tablonu Konuştur: Düzensiz Excel → Düzenli Tablo",
    cues: [
      {
        cueIndex: 1,
        beat: "warmup",
        visualMode: "veo",
        section: "GİRİŞ KÖPRÜSÜ",
        headline: "GİRİŞ KÖPRÜSÜ",
        subhead: "Lyria jenerik, sonra ofis veri akışı. Yapay zekâyı masana çağırma refleksini hatırla.",
        bullets: ["Refleksi hatırla", "Çoklu AI kapısı", "Önce A1 hücresi"],
        tools: ["ChatGPT", "Claude", "Gemini"],
        layout: "excel",
        highlightCell: "A1",
        fileName: "Kitap1.xlsx",
        sheetName: "Sayfa1",
        formulaBar: "Tarih",
        table: {
          headers: ["Tarih", "Cari", "Fatura", "Tutar", "Durum", "Not"],
          rows: [
            ["", "", "", "", "", ""],
            ["", "", "", "", "", ""],
            ["", "", "", "", "", ""],
            ["", "", "", "", "", ""],
            ["", "", "", "", "", ""],
          ],
        },
      },
      {
        cueIndex: 2,
        beat: "warmup",
        visualMode: "live",
        section: "HOŞ GELDİN",
        headline: "HOŞ GELDİN",
        subhead: "Gözde masada. Excel kitabı açık, A1 hücresi seçili.",
        bullets: ["Selamlar, ben Gözde", "ChatGPT Claude Gemini", "Önce A1 hücresi"],
        tools: ["ChatGPT", "Claude", "Gemini"],
        layout: "excel",
        highlightCell: "A1",
        fileName: "Kitap1.xlsx",
        sheetName: "Sayfa1",
        formulaBar: "Tarih",
        copilot: {
          prompt:
            "Bu ham dökümü hangi kapıya verirsin? Önce A1 eşiğini kur, sonra kapıyı seç.",
          replyLines: [
            "ChatGPT: hızlı taslak → yapıştır-çalıştır.",
            "Claude: uzun dökümü dikkatle okur.",
            "Gemini: adımları net sıralar.",
            "API: şirket formatını kilitler.",
          ],
        },
        table: {
          headers: ["Tarih", "Cari", "Fatura", "Tutar", "Durum", "Not"],
          rows: [
            ["", "", "", "", "", ""],
            ["", "", "", "", "", ""],
            ["", "", "", "", "", ""],
            ["", "", "", "", "", ""],
            ["", "", "", "", "", ""],
          ],
        },
      },
      {
        cueIndex: 3,
        beat: "warmup",
        visualMode: "live",
        section: "DÜZENSİZ TABLO",
        headline: "DÜZENSİZ TABLO",
        subhead: "Birleşik afiş A1:F1, boş satır, üç dilli tarih. Ham veri / dağınık yapı.",
        bullets: ["Birleşik başlık", "Boş satır", "Tür karmaşası"],
        tools: ["Excel", "Tahsilat"],
        layout: "excel",
        highlightCell: "A1",
        mergedTop: true,
        fileName: "Tahsilat_Mart_2026.xlsx",
        sheetName: "Döküm",
        formulaBar: "Mart 2026 Tahsilat Dökümü",
        table: OFFICE_AI_1_MESSY_TABLE,
      },
      {
        cueIndex: 4,
        beat: "command",
        visualMode: "live",
        section: "A1 HÜCRESİ",
        headline: "A1 HÜCRESİ",
        subhead: "Dağınık ızgara durur. A1 zoom: birleşik afiş hâlâ masada.",
        bullets: ["İsim kutusu A1", "Formül çubuğu", "Yeşil çerçeve"],
        tools: ["Excel", "A1"],
        layout: "excel",
        highlightCell: "A1",
        zoomA1: true,
        mergedTop: true,
        fileName: "Tahsilat_Mart_2026.xlsx",
        sheetName: "Döküm",
        formulaBar: "Mart 2026 Tahsilat Dökümü",
        table: OFFICE_AI_1_MESSY_TABLE,
      },
      {
        cueIndex: 5,
        beat: "command",
        visualMode: "live",
        section: "TEMİZLE ŞİMDİ",
        headline: "TEMİZLE ŞİMDİ",
        subhead: "Dağınık ızgara + üç yol. Temiz tablo henüz yok.",
        bullets: ["Kopyala-yapıştır", "Ataş yükle", "Copilot okur"],
        tools: ["ChatGPT", "Claude", "Gemini"],
        layout: "excel",
        highlightCell: "A1",
        mergedTop: true,
        fileName: "Tahsilat_Mart_2026.xlsx",
        sheetName: "Döküm",
        formulaBar: "Mart 2026 Tahsilat Dökümü",
        copilot: {
          prompt:
            "Bu düzensiz ızgarayı düzenle. A1 hücresine sütun adı koy. Birleşikleri çöz. Boş satırları sil. Veriyi kopyala-yapıştır, ataş veya Copilot ile ver.",
          replyLines: [
            "1. Kopyala-yapıştır.",
            "2. Ataş yükle.",
            "3. Copilot okur.",
            "4. A1 hücresine Tarih yaz.",
            "5. Birleşik A1:F1 çöz, boş satırı sil.",
            "6. Orijinali koru, Temiz kopyada çalış.",
          ],
        },
        table: OFFICE_AI_1_MESSY_TABLE,
      },
      {
        cueIndex: 6,
        beat: "comparison",
        visualMode: "split",
        compare: {
          beforeCueIndex: 3,
          beforeLabel: ACADEMY_GOLDEN_COMPARE_BEFORE_LABEL,
          afterLabel: ACADEMY_GOLDEN_COMPARE_AFTER_LABEL,
        },
        section: "FARK ORTADA",
        headline: "FARK ORTADA",
        subhead: "Sol ham veri, sağ AI çıktısı. A1 hücresi ışıldar.",
        bullets: ["Önce dağınık yapı", "Sonra düzenli tablo", "A1 ışıldar"],
        tools: ["Excel", "Filtre"],
        layout: "excel",
        highlightCell: "A1",
        fileName: "Tahsilat_Mart_2026.xlsx",
        sheetName: "Temiz",
        formulaBar: "Tarih",
        table: {
          headers: ["Tarih", "Cari", "Fatura", "Tutar", "Durum"],
          rows: [
            ["12.03.2026", "Kaya Gıda A.Ş.", "FT-1042", "12.450,00", "Ödendi"],
            ["13.03.2026", "Demir Lojistik", "FT-1043", "8.200,00", "Bekler"],
            ["13.03.2026", "Pınar Market", "FT-1044", "3.400,00", "Ödendi"],
            ["14.03.2026", "Yıldız Tekstil", "FT-1045", "9.100,00", "Açık"],
            ["14.03.2026", "Kaya Gıda A.Ş.", "FT-1047", "21.500,00", "Ödendi"],
            ["Toplam", "", "", "54.650,00", ""],
          ],
          note: "Aynı dosya, farklı eşik.",
        },
      },
      {
        cueIndex: 7,
        beat: "task",
        visualMode: "live",
        section: "CEBİNE KOY",
        headline: "CEBİNE KOY",
        subhead: "Üç adımı cebine koy: A1, birleşikler, yalın istem.",
        bullets: ["A1 sütun adı", "Birleşik ve boş satır", "Yalın dille söyle"],
        tools: ["Excel", "A1"],
        layout: "excel",
        highlightCell: "A1",
        zoomA1: true,
        fileName: "Tahsilat_Mart_2026.xlsx",
        sheetName: "Temiz",
        formulaBar: "Tarih",
        table: {
          headers: ["Tarih", "Cari", "Fatura", "Tutar", "Durum"],
          rows: [
            ["12.03.2026", "Kaya Gıda A.Ş.", "FT-1042", "12.450,00", "Ödendi"],
            ["13.03.2026", "Demir Lojistik", "FT-1043", "8.200,00", "Bekler"],
            ["13.03.2026", "Pınar Market", "FT-1044", "3.400,00", "Ödendi"],
            ["14.03.2026", "Yıldız Tekstil", "FT-1045", "9.100,00", "Açık"],
            ["14.03.2026", "Kaya Gıda A.Ş.", "FT-1047", "21.500,00", "Ödendi"],
            ["Toplam", "", "", "54.650,00", ""],
          ],
          note: "Üç adım: A1, birleşik, yalın istem.",
        },
      },
      {
        cueIndex: 8,
        beat: "task",
        visualMode: "live",
        section: "SIRA SENDE",
        headline: "SIRA SENDE",
        subhead: "Düzenli nihai tablo. A1 hücresini önce ve sonra sakla.",
        bullets: ["50 satır seç", "A1 görüntüsü", "Yan yana koy"],
        tools: ["Excel", "A1"],
        layout: "excel",
        highlightCell: "A1",
        zoomA1: true,
        fileName: "Tahsilat_Mart_2026.xlsx",
        sheetName: "Temiz",
        formulaBar: "Tarih",
        table: {
          headers: ["Tarih", "Cari", "Fatura", "Tutar", "Durum"],
          rows: [
            ["12.03.2026", "Kaya Gıda A.Ş.", "FT-1042", "12.450,00", "Ödendi"],
            ["13.03.2026", "Demir Lojistik", "FT-1043", "8.200,00", "Bekler"],
            ["13.03.2026", "Pınar Market", "FT-1044", "3.400,00", "Ödendi"],
            ["14.03.2026", "Yıldız Tekstil", "FT-1045", "9.100,00", "Açık"],
            ["14.03.2026", "Kaya Gıda A.Ş.", "FT-1047", "21.500,00", "Ödendi"],
            ["Toplam", "", "", "54.650,00", ""],
          ],
          note: "A1 hücresine kendi sütun adını yaz.",
        },
      },
    ],
  },
  "01_office_ai-2": {
    ...OFFICE,
    title: "Rapor Otomasyonu: Tablodan Yönetim Özetine",
    cues: [
      {
        cueIndex: 1,
        beat: "warmup",
        visualMode: "veo",
        section: "GİRİŞ KÖPRÜSÜ",
        headline: "GİRİŞ KÖPRÜSÜ",
        subhead: "A1 ve temiz tablo refleksi cebinde. Toplantı öncesi özet stresi başlıyor.",
        bullets: ["A1 sütun adı", "Temiz tablo", "Toplantı stresi"],
        tools: ["Excel", "A1"],
        layout: "excel",
        highlightCell: "A1",
        fileName: "Tahsilat_Mart_2026.xlsx",
        sheetName: "Temiz",
        formulaBar: "Tarih",
        table: {
          headers: ["Tarih", "Cari", "Fatura", "Tutar", "Durum"],
          rows: [
            ["12.03.2026", "Kaya Gıda A.Ş.", "FT-1042", "12.450,00", "Ödendi"],
            ["13.03.2026", "Demir Lojistik", "FT-1043", "8.200,00", "Bekler"],
            ["13.03.2026", "Pınar Market", "FT-1044", "3.400,00", "Ödendi"],
            ["14.03.2026", "Yıldız Tekstil", "FT-1045", "9.100,00", "Açık"],
            ["14.03.2026", "Kaya Gıda A.Ş.", "FT-1047", "21.500,00", "Ödendi"],
          ],
        },
      },
      {
        cueIndex: 2,
        beat: "warmup",
        visualMode: "live",
        section: "HOŞ GELDİN",
        headline: "HOŞ GELDİN",
        subhead: "Gözde masada. Temiz tablo açık; bugün yönetim özeti ve karar notu.",
        bullets: ["Selamlar, ben Gözde", "Tablo hazır", "Rapor otomasyonu"],
        tools: ["Excel", "Word"],
        layout: "excel",
        highlightCell: "A1",
        fileName: "Tahsilat_Mart_2026.xlsx",
        sheetName: "Temiz",
        formulaBar: "Tarih",
        table: {
          headers: ["Tarih", "Cari", "Fatura", "Tutar", "Durum"],
          rows: [
            ["12.03.2026", "Kaya Gıda A.Ş.", "FT-1042", "12.450,00", "Ödendi"],
            ["13.03.2026", "Demir Lojistik", "FT-1043", "8.200,00", "Bekler"],
            ["13.03.2026", "Pınar Market", "FT-1044", "3.400,00", "Ödendi"],
            ["14.03.2026", "Yıldız Tekstil", "FT-1045", "9.100,00", "Açık"],
            ["14.03.2026", "Kaya Gıda A.Ş.", "FT-1047", "21.500,00", "Ödendi"],
          ],
        },
      },
      {
        cueIndex: 3,
        beat: "warmup",
        visualMode: "live",
        section: "UZUN RAPOR",
        headline: "UZUN RAPOR",
        subhead: "Yönetim toplantısı beş dakika sonra. On sayfalık döküm kimseyi ikna etmez.",
        bullets: ["On sayfa döküm", "Karar yok", "Toplantı stresi"],
        tools: ["Word", "Excel"],
        layout: "excel",
        highlightCell: "A1",
        fileName: "Haftalik_Durum_Raporu.docx",
        sheetName: "Döküm",
        formulaBar: "Sayfa",
        table: {
          headers: ["Sayfa", "Döküm"],
          rows: [
            ["1", "Giriş ve yöntem notları uzar, karar cümlesi yoktur..."],
            ["2", "Kaya Gıda faturalarının tek tek anlatısı sürer..."],
            ["3", "Demir Lojistik bekleyen bakiye dipnotlarla şişer..."],
            ["4–7", "Pınar, Yıldız ve yan cariler paragraf paragraf..."],
            ["8–10", "Sonuç yok; yönetici on sayfada kaybolur."],
          ],
          note: "On sayfalık döküm — özet paneli henüz kapalı.",
        },
      },
      {
        cueIndex: 4,
        beat: "command",
        visualMode: "live",
        section: "ÖZET İSTE",
        headline: "ÖZET İSTE",
        subhead: "Temiz tablodan ilk yönetim özetini iste. Temiz özet paneli henüz açılmaz.",
        bullets: ["Tabloyu ver", "Üç madde iste", "Özet kapalı"],
        tools: ["Excel", "Copilot"],
        layout: "excel",
        highlightCell: "D1",
        fileName: "Tahsilat_Mart_2026.xlsx",
        sheetName: "Temiz",
        formulaBar: "Tutar",
        copilot: {
          hideReply: true,
          prompt:
            "Bu temiz tablodan toplamı ve trendi söyle. Tam üç maddelik yönetici özeti yaz. Temiz özet panelini henüz açma.",
          replyLines: [],
        },
        table: {
          headers: ["Tarih", "Cari", "Fatura", "Tutar", "Durum"],
          rows: [
            ["12.03.2026", "Kaya Gıda A.Ş.", "FT-1042", "12.450,00", "Ödendi"],
            ["13.03.2026", "Demir Lojistik", "FT-1043", "8.200,00", "Bekler"],
            ["13.03.2026", "Pınar Market", "FT-1044", "3.400,00", "Ödendi"],
            ["14.03.2026", "Yıldız Tekstil", "FT-1045", "9.100,00", "Açık"],
            ["14.03.2026", "Kaya Gıda A.Ş.", "FT-1047", "21.500,00", "Ödendi"],
          ],
          note: "Spoiler yasağı: temiz özet Beat 3’e kadar kapalı.",
        },
      },
      {
        cueIndex: 5,
        beat: "comparison",
        visualMode: "split",
        compare: {
          beforeCueIndex: 3,
          beforeLabel: ACADEMY_OFFICE_AI_2_COMPARE_BEFORE_LABEL,
          afterLabel: ACADEMY_OFFICE_AI_2_COMPARE_AFTER_LABEL,
        },
        section: "KARAR NOTU",
        headline: "KARAR NOTU",
        subhead: "Beat 3 açılır: sol on sayfalık döküm, sağ üç madde ve eylem cümlesi.",
        bullets: ["On sayfa döküm", "Üç madde", "Eylem cümlesi"],
        tools: ["Excel", "Word"],
        layout: "excel",
        highlightCell: "A1",
        fileName: "Yonetici_Ozeti.docx",
        sheetName: "Ozet",
        formulaBar: "Başlık",
        table: {
          headers: ["Başlık", "Sayı", "Not"],
          rows: [
            ["Toplam", "54.650", "Mart tahsilat; trend Kaya önde"],
            ["Risk", "8.200", "Demir Lojistik bekler"],
            ["Açık", "9.100", "Yıldız Tekstil vade"],
            ["Karar", "—", "Bugün Demir'i ara"],
          ],
          note: "Temiz özet paneli Beat 3’te ilk kez açılır.",
        },
      },
      {
        cueIndex: 6,
        beat: "comparison",
        visualMode: "split",
        compare: {
          beforeCueIndex: 3,
          beforeLabel: ACADEMY_OFFICE_AI_2_COMPARE_BEFORE_LABEL,
          afterLabel: ACADEMY_OFFICE_AI_2_COMPARE_AFTER_LABEL,
        },
        section: "FARK ORTADA",
        headline: "FARK ORTADA",
        subhead: "Sol on sayfalık döküm. Sağ üç maddelik yönetim özeti — AI.",
        bullets: ["Önce on sayfa", "Sonra üç madde", "Karar görünür"],
        tools: ["Word", "Excel"],
        layout: "excel",
        highlightCell: "A1",
        fileName: "Yonetici_Ozeti.docx",
        sheetName: "Ozet",
        formulaBar: "Başlık",
        table: {
          headers: ["Başlık", "Sayı", "Not"],
          rows: [
            ["Toplam", "54.650", "Mart tahsilat; trend Kaya önde"],
            ["Risk", "8.200", "Demir Lojistik bekler"],
            ["Açık", "9.100", "Yıldız Tekstil vade"],
            ["Karar", "—", "Bugün Demir'i ara"],
          ],
          note: "Temiz özet paneli ilk kez burada açılır.",
        },
      },
      {
        cueIndex: 7,
        beat: "task",
        visualMode: "live",
        section: "CEBİNE KOY",
        headline: "CEBİNE KOY",
        subhead: "Üç adım: toplam ve trend, anomali, eylem cümlesi.",
        bullets: ["Toplam ve trend", "Anomali ve risk", "Eylem cümlesi"],
        tools: ["Excel", "Word"],
        layout: "excel",
        highlightCell: "A1",
        fileName: "Yonetici_Ozeti.docx",
        sheetName: "Ozet",
        formulaBar: "Başlık",
        table: {
          headers: ["Başlık", "Sayı", "Not"],
          rows: [
            ["Toplam", "54.650", "Mart tahsilat; trend Kaya önde"],
            ["Risk", "8.200", "Demir Lojistik bekler"],
            ["Açık", "9.100", "Yıldız Tekstil vade"],
            ["Karar", "—", "Bugün Demir'i ara"],
          ],
          note: "Cebine koy: toplam, risk, eylem.",
        },
      },
      {
        cueIndex: 8,
        beat: "task",
        visualMode: "live",
        section: "SIRA SENDE",
        headline: "SIRA SENDE",
        subhead: "Kendi tablondan yönetim özeti ve karar notu çıkar. Sonra slayta geçeceğiz.",
        bullets: ["Kendi tablonu seç", "Özet ve karar", "L3 slayt köprüsü"],
        tools: ["Excel", "Word"],
        layout: "excel",
        highlightCell: "A1",
        fileName: "Yonetici_Ozeti.docx",
        sheetName: "Ozet",
        formulaBar: "Başlık",
        table: {
          headers: ["Başlık", "Sayı", "Not"],
          rows: [
            ["Toplam", "54.650", "Mart tahsilat; trend Kaya önde"],
            ["Risk", "8.200", "Demir Lojistik bekler"],
            ["Açık", "9.100", "Yıldız Tekstil vade"],
            ["Karar", "—", "Bugün Demir'i ara"],
          ],
          note: "Saha görevi: kendi tablon, kendi özetin. Sonraki ders: Sunum Fabrikası.",
        },
      },
    ],
  },
  "01_office_ai-3": { ...OFFICE, title: "Sunum Fabrikası: Metinden Slayta", cues: EMPTY_CUES },
  "01_office_ai-4": { ...OFFICE, title: "E-Posta Akışı: Gelen Kutusu Sıfırlama", cues: EMPTY_CUES },
  "01_office_ai-5": { ...OFFICE, title: "İstisnalar & Hata Avı: AI Yanılınca", cues: EMPTY_CUES },
  "01_office_ai-6": {
    ...OFFICE,
    title: "Haftalık Sistem: 30 Dakikalık Rutin + Sınav Köprüsü",
    cues: EMPTY_CUES,
  },
  "02_ecommerce_ai-1": { ...COMMERCE, title: "Mağaza Röntgeni: Nerede Kan Kaybediyorsun", cues: EMPTY_CUES },
  "02_ecommerce_ai-2": { ...COMMERCE, title: "Liste Hızlandırma: Başlık + Açıklama Sistemi", cues: EMPTY_CUES },
  "02_ecommerce_ai-3": { ...COMMERCE, title: "Yorum & Soru Madeni: İade Düşürme", cues: EMPTY_CUES },
  "02_ecommerce_ai-4": { ...COMMERCE, title: "Rakip & Fiyat Radarı: Kör Uçma", cues: EMPTY_CUES },
  "02_ecommerce_ai-5": { ...COMMERCE, title: "Kampanya & Reklam Metni: Tıklatan Dil", cues: EMPTY_CUES },
  "02_ecommerce_ai-6": { ...COMMERCE, title: "Haftalık Operasyon Rutini + Sınav Köprüsü", cues: EMPTY_CUES },
  "03_social_media_ai-1": { ...SOCIAL, title: "İçerik Stoku: 1 Fikirden 10 Parça", cues: EMPTY_CUES },
  "03_social_media_ai-2": { ...SOCIAL, title: "Görsel Hattı: Ürün Çekimi + Afiş", cues: EMPTY_CUES },
  "03_social_media_ai-3": { ...SOCIAL, title: "Video Hattı: Reels Kurgu Sistemi", cues: EMPTY_CUES },
  "03_social_media_ai-4": { ...SOCIAL, title: "Metin Hattı: Açıklama + Hashtag + CTA", cues: EMPTY_CUES },
  "03_social_media_ai-5": { ...SOCIAL, title: "Kalite Kapısı: AI Kokusu Temizliği", cues: EMPTY_CUES },
  "03_social_media_ai-6": { ...SOCIAL, title: "Yayın Rutini: Haftada 3 + Sınav Köprüsü", cues: EMPTY_CUES },
  "04_chatbot_nocode-1": { ...BOT, title: "KOBİ Acısı: Kaçan Mesaj, Kaçan Randevu", cues: EMPTY_CUES },
  "04_chatbot_nocode-2": { ...BOT, title: "İlk Bot: Karşılama + SSS + Randevu", cues: EMPTY_CUES },
  "04_chatbot_nocode-3": { ...BOT, title: "WhatsApp Bağlantısı: Canlıya Alma", cues: EMPTY_CUES },
  "04_chatbot_nocode-4": { ...BOT, title: "Bozulunca: Yanlış Anlama + Öfke Senaryosu", cues: EMPTY_CUES },
  "04_chatbot_nocode-5": {
    ...BOT,
    title: "Teslim Seti: Keşif + Teklif + Kurulum Checklist",
    cues: EMPTY_CUES,
  },
  "04_chatbot_nocode-6": {
    ...BOT,
    title: "İlk Müşteri Oyunu: Pilot Kapatma + Sınav Köprüsü",
    cues: EMPTY_CUES,
  },
  "05_prompt_practice-1": { ...PROMPT, title: "Neden Saçmalıyor: 5 Kötü İstem", cues: EMPTY_CUES },
  "05_prompt_practice-2": { ...PROMPT, title: "İyi İstem Reçetesi: Rol + Bağlam + Format", cues: EMPTY_CUES },
  "05_prompt_practice-3": { ...PROMPT, title: "Araştırma & Özet: Kaynakla Çalış", cues: EMPTY_CUES },
  "05_prompt_practice-4": { ...PROMPT, title: "Yazı & Çeviri: Ton Ayarı", cues: EMPTY_CUES },
  "05_prompt_practice-5": { ...PROMPT, title: "Tablo & Plan: Günlük Hayat Kısayolları", cues: EMPTY_CUES },
  "05_prompt_practice-6": { ...PROMPT, title: "10 Promptluk Cep Seti + Sınav Köprüsü", cues: EMPTY_CUES },
};

function asSlide(
  lessonKey: AcademyCinemaCueSlideLessonKey,
  draft: LessonDraft,
  cue: OverlayDraft,
): AcademyCinemaCueSlide {
  return {
    lessonKey,
    theme: draft.theme,
    courseLabel: draft.courseLabel,
    lessonTitle: draft.title,
    instructor: draft.instructor,
    ...cue,
  };
}

export function academyCinemaCueIndexFromId(cueId: string): number | null {
  const match = /^cue-0*([0-9]+)$/iu.exec(cueId.trim());
  if (!match) {
    return null;
  }
  const index = Number(match[1]);
  return Number.isInteger(index) && index > 0 ? index : null;
}

export function academyCinemaSlideForCue(
  lessonKey: string,
  cueId: string,
): AcademyCinemaCueSlide | null {
  const cueIndex = academyCinemaCueIndexFromId(cueId);
  if (cueIndex == null) {
    return null;
  }
  return loadAcademyCinemaCueSlides(lessonKey).find((slide) => slide.cueIndex === cueIndex) ?? null;
}

export function loadAcademyCinemaCueSlides(lessonKey: string): readonly AcademyCinemaCueSlide[] {
  const key = lessonKey.trim() as AcademyCinemaCueSlideLessonKey;
  const draft = LESSONS[key];
  if (!draft) {
    return [];
  }
  return draft.cues.map((cue) => asSlide(key, draft, cue));
}

export function listAcademyCinemaCueSlides(): readonly AcademyCinemaCueSlide[] {
  return ACADEMY_CINEMA_CUE_SLIDE_LESSON_KEYS.flatMap((lessonKey) => loadAcademyCinemaCueSlides(lessonKey));
}

export function academyCinemaCueSlideFileName(slide: Pick<AcademyCinemaCueSlide, "lessonKey" | "cueIndex">): string {
  return `${slide.lessonKey}-cue-${slide.cueIndex}.jpg`;
}

export function academyCinemaCueSlidePublicPathFromSlide(
  slide: Pick<AcademyCinemaCueSlide, "lessonKey" | "cueIndex">,
): string {
  return `/academy/cinema/${academyCinemaCueSlideFileName(slide)}`;
}
