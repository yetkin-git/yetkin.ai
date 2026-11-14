/**
 * AI Tezgâh vitrini. İstemci ve sunucu aynı sözlüğü okur.
 * Kota sayısı ve dönüşüm köprüsü burada durur; cüzdan burada yoktur.
 */

import {
  GRANT_AUDIENCES,
  GRANT_INVESTMENT_FOCI,
  GRANT_NACE_GROUPS,
  GRANT_PROVINCES,
  GRANT_RD_LEVELS,
} from "@/lib/yetkinhibe/grant-brief-axes";
import { DUKKAN_SECTORS, DUKKAN_TONES } from "@/lib/tezgah/dukkan/copy";
import { PAZARYERI_MARKETS } from "@/lib/tezgah/pazaryeri/copy";
import { REKLAM_AIMS, REKLAM_FILE_STEM } from "@/lib/tezgah/reklam/copy";

const YES_NO = [
  { value: "evet", label: "Evet" },
  { value: "hayir", label: "Hayır" },
] as const;

export const TEZGAH_PATH = "/tezgah" as const;

export const TEZGAH_GUEST_DAILY_LIMIT = 1;
export const TEZGAH_MEMBER_DAILY_LIMIT = 3;

export const TEZGAH_GUEST_QUOTA_MESSAGE =
  "Günde 3 ücretsiz üretim hakkı için ücretsiz kayıt ol";

export const TEZGAH_MEMBER_QUOTA_MESSAGE =
  "Bugünkü ücretsiz hakkınız doldu. Yarın (İstanbul gece yarısı) yenilenir.";

export const TEZGAH_FAIL_MESSAGE =
  "Üretim tamamlanamadı. Hakkınız duruyor; biraz sonra yeniden deneyin.";

export const TEZGAH_TOOL_IDS = [
  "ecommerce",
  "proposal",
  "grant",
  "tetkik",
  "dukkan",
  "reklam",
  "pazaryeri",
] as const;

export type TezgahToolId = (typeof TEZGAH_TOOL_IDS)[number];

export type TezgahFieldKind = "text" | "textarea" | "select";

export type TezgahField = {
  name: string;
  label: string;
  placeholder: string;
  kind: TezgahFieldKind;
  optional?: boolean;
  options?: readonly { value: string; label: string }[];
};

export type TezgahTool = {
  id: TezgahToolId;
  label: string;
  blurb: string;
  fileStem: string;
  fields: readonly TezgahField[];
  cta: { href: "/academy/02_ecommerce_ai" | "/academy/01_office_ai/seviye" | "/academy"; label: string } | null;
};

export const TEZGAH_TOOLS: readonly TezgahTool[] = [
  {
    id: "ecommerce",
    label: "E-Ticaret Ürün Kartı",
    blurb: "Trendyol ve Hepsiburada uyumlu başlık, madde işaretli açıklama, SEO ve soru yanıtı.",
    fileStem: "urun-karti",
    fields: [
      {
        name: "productName",
        label: "Ürün adı",
        placeholder: "Pamuklu bebek battaniyesi",
        kind: "text",
      },
      {
        name: "category",
        label: "Kategori",
        placeholder: "Anne ve bebek",
        kind: "text",
      },
      {
        name: "features",
        label: "Temel özellikler",
        placeholder: "100×100 cm, yıkanabilir, 0–3 yaş",
        kind: "textarea",
      },
    ],
    cta: {
      href: "/academy/02_ecommerce_ai",
      label: "Bu alanda Doğrulanmış Uzman Rozeti alıp KOBİ ilanlarına teklif ver →",
    },
  },
  {
    id: "proposal",
    label: "Müşteri Teklif Yazıcı",
    blurb: "İş ilanından kapsam, teslimat adımları ve güven veren teklif metni.",
    fileStem: "teklif",
    fields: [
      {
        name: "jobPost",
        label: "Müşteri ilanı veya ihtiyacı",
        placeholder: "Mağaza ürün kartları dağınık; 40 ürünü bu hafta toparlamak istiyoruz.",
        kind: "textarea",
      },
      {
        name: "expertise",
        label: "Senin uzmanlığın",
        placeholder: "Pazaryeri ürün metni ve SEO",
        kind: "text",
      },
    ],
    cta: {
      href: "/academy/01_office_ai/seviye",
      label: "Ücretsiz Yetkinlik Testine Gir, Uzmanlığını Mühürle →",
    },
  },
  {
    id: "grant",
    label: "Hibe Proje Dosyası",
    blurb: "İl, NACE ve yatırım odağına göre katalog eşleşir. Yazdırılabilir proje taslağı çıkar.",
    fileStem: "proje-dosyasi",
    fields: [
      {
        name: "businessName",
        label: "İşletme adı",
        placeholder: "Karaoğlu Soğuk Zincir",
        kind: "text",
      },
      {
        name: "freelancerName",
        label: "Freelancer adı",
        placeholder: "Ayşe Yılmaz",
        kind: "text",
      },
      {
        name: "provinceCode",
        label: "İl",
        placeholder: "İl seç",
        kind: "select",
        options: GRANT_PROVINCES.map((row) => ({ value: row.code, label: `${row.code} ${row.name}` })),
      },
      {
        name: "audience",
        label: "İşletme türü",
        placeholder: "Tür seç",
        kind: "select",
        options: GRANT_AUDIENCES.map((row) => ({ value: row.id, label: row.label })),
      },
      {
        name: "naceGroup",
        label: "NACE grubu",
        placeholder: "Grup seç",
        kind: "select",
        options: GRANT_NACE_GROUPS.map((row) => ({ value: row.id, label: row.label })),
      },
      {
        name: "investmentFocus",
        label: "Yatırım odağı",
        placeholder: "Odak seç",
        kind: "select",
        options: GRANT_INVESTMENT_FOCI.map((row) => ({ value: row.id, label: row.label })),
      },
      {
        name: "employeeCount",
        label: "Çalışan sayısı",
        placeholder: "4",
        kind: "text",
      },
      {
        name: "companyAgeYears",
        label: "Şirket yaşı (yıl)",
        placeholder: "2",
        kind: "text",
      },
      {
        name: "rdMaturityLevel",
        label: "Ar-Ge olgunluğu",
        placeholder: "Düzey seç",
        kind: "select",
        options: GRANT_RD_LEVELS.map((row) => ({ value: row.id, label: row.label })),
      },
      {
        name: "exportActive",
        label: "İhracat",
        placeholder: "Seç",
        kind: "select",
        options: YES_NO,
      },
      {
        name: "patent",
        label: "Patent veya faydalı model",
        placeholder: "Seç",
        kind: "select",
        options: YES_NO,
      },
      {
        name: "project",
        label: "Proje",
        placeholder: "Soğuk zincir deposu ve kendi satış kanalı",
        kind: "textarea",
      },
      {
        name: "scheduleWindows",
        label: "Ay aralığı (isteğe bağlı)",
        placeholder: "hazirlik 1-2\nuygulama 3-6",
        kind: "textarea",
        optional: true,
      },
      {
        name: "investmentAmounts",
        label: "Kalem tutarı, tam lira (isteğe bağlı)",
        placeholder: "PERSONEL 1000\nALET_TECHIZAT 1000",
        kind: "textarea",
        optional: true,
      },
    ],
    cta: {
      href: "/academy",
      label: "Proje & Prompt Uzmanlık Paketini İncele →",
    },
  },
  {
    id: "tetkik",
    label: "Web Sitesi Tetkik",
    blurb: "Ana sayfanın ilk HTML’inden 100 puanlık dijital sağlık skoru ve esnafa okunacak rapor.",
    fileStem: "site-tetkik",
    fields: [
      {
        name: "url",
        label: "Site adresi",
        placeholder: "https://ornek-dukkan.com",
        kind: "text",
      },
      {
        name: "businessName",
        label: "Esnafın işletme adı",
        placeholder: "Karaoğlu Fırın",
        kind: "text",
      },
      {
        name: "freelancerName",
        label: "Freelancer adı",
        placeholder: "Ayşe Yılmaz",
        kind: "text",
      },
      {
        name: "agencyName",
        label: "Ajans adı (isteğe bağlı)",
        placeholder: "Yılmaz Dijital",
        kind: "text",
        optional: true,
      },
    ],
    cta: null,
  },
  {
    id: "dukkan",
    label: "Sektörel Dijital Dükkan",
    blurb: "Sektöre göre tek sayfalık vitrin. Önizle, dijital-dukkan.html olarak indir.",
    fileStem: "dijital-dukkan",
    fields: [
      {
        name: "businessName",
        label: "İşletme adı",
        placeholder: "Karaoğlu Fırın",
        kind: "text",
      },
      {
        name: "sector",
        label: "Sektör",
        placeholder: "Sektör seç",
        kind: "select",
        options: DUKKAN_SECTORS.map((sector) => ({ value: sector.id, label: sector.label })),
      },
      {
        name: "place",
        label: "Şehir / ilçe",
        placeholder: "Kadıköy, İstanbul",
        kind: "text",
      },
      {
        name: "whatsapp",
        label: "WhatsApp",
        placeholder: "0532 000 00 00",
        kind: "text",
      },
      {
        name: "services",
        label: "Hizmetler",
        placeholder: "Taze ekmek\nPoğaça\nSimit",
        kind: "textarea",
      },
      {
        name: "tone",
        label: "Ton",
        placeholder: "Ton seç",
        kind: "select",
        options: DUKKAN_TONES.map((tone) => ({ value: tone.id, label: tone.label })),
      },
    ],
    cta: null,
  },
  {
    id: "reklam",
    label: "Otonom Reklam Paketi",
    blurb: "Üç kanca, Meta ve Google arama metni, görsel brif. Karakter sınırı ve amaç çağrısı kodda mühürlenir.",
    fileStem: REKLAM_FILE_STEM,
    fields: [
      {
        name: "businessName",
        label: "İşletme adı",
        placeholder: "Karaoğlu Fırın",
        kind: "text",
      },
      {
        name: "sector",
        label: "Sektör",
        placeholder: "Sektör seç",
        kind: "select",
        options: DUKKAN_SECTORS.map((sector) => ({ value: sector.id, label: sector.label })),
      },
      {
        name: "place",
        label: "Hedef şehir / bölge",
        placeholder: "Kadıköy, İstanbul",
        kind: "text",
      },
      {
        name: "aim",
        label: "Kampanya amacı",
        placeholder: "Amaç seç",
        kind: "select",
        options: REKLAM_AIMS.map((aim) => ({ value: aim.id, label: aim.label })),
      },
      {
        name: "offer",
        label: "Öne çıkan teklif",
        placeholder: "İkinci poğaça bedava",
        kind: "textarea",
      },
    ],
    cta: null,
  },
  {
    id: "pazaryeri",
    label: "Pazaryeri Katalog Fabrikası",
    blurb: "En çok 8 ürün. Blokları boş satırla ayır. Tablo önizlenir, pazaryeri-katalog.csv iner.",
    fileStem: "pazaryeri-katalog",
    fields: [
      {
        name: "market",
        label: "Pazaryeri",
        placeholder: "Pazaryeri seç",
        kind: "select",
        options: PAZARYERI_MARKETS.map((market) => ({ value: market.id, label: market.label })),
      },
      {
        name: "products",
        label: "Ürün blokları",
        placeholder: "Pamuklu battaniye\nKategori: Anne ve bebek\nRenk: Ekru",
        kind: "textarea",
      },
    ],
    cta: null,
  },
] as const;

export function tezgahToolById(id: string): TezgahTool | null {
  return TEZGAH_TOOLS.find((tool) => tool.id === id) ?? null;
}

/** Vitrin ve sekme adresi. Yalnız katalog kimliği. */
export function tezgahToolHref(id: TezgahToolId): string {
  return `${TEZGAH_PATH}?tool=${id}`;
}

/**
 * Google dönüş yolu. Auth `next` sorguyu düşürür; çapa allowlist’te kalır.
 * Örnek: `/tezgah#tetkik`.
 */
export function tezgahToolAnchorPath(id: TezgahToolId): string {
  return `${TEZGAH_PATH}#${id}`;
}

/** Boş veya yabancı değer `null`. Sekme o zaman `ecommerce` kalır. */
export function parseTezgahToolParam(raw: string | null | undefined): TezgahToolId | null {
  const value = (raw ?? "").trim();
  if (!value) {
    return null;
  }
  for (const id of TEZGAH_TOOL_IDS) {
    if (id === value) {
      return id;
    }
  }
  return null;
}

export function tezgahQuotaLine(remaining: number, limit: number): string {
  return `Bugünkü ücretsiz hakkınız: ${remaining} / ${limit}`;
}
