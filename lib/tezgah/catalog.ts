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
import {
  SAAS_WIDGETS,
  STUDIO_BACKGROUNDS,
  STUDIO_GALLERY_COUNTS,
  STUDIO_MARKETS,
  STUDIO_OVERLAYS,
} from "@/lib/tezgah/pro/options";
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
  "studio-photo",
  "technical-drawing",
  "saas-builder",
] as const;

export type TezgahToolId = (typeof TEZGAH_TOOL_IDS)[number];

export const PRO_STUDIO_TOOL_IDS = ["studio-photo", "technical-drawing", "saas-builder"] as const;

export type ProStudioToolId = (typeof PRO_STUDIO_TOOL_IDS)[number];

export function isProStudioTool(id: string): id is ProStudioToolId {
  return (PRO_STUDIO_TOOL_IDS as readonly string[]).includes(id);
}

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

export const ECOMMERCE_CATEGORY_CHIPS = [
  "Anne & Bebek",
  "Ev & Yaşam",
  "Giyim",
  "Elektronik",
  "Kozmetik",
  "Gıda",
  "Aksesuar",
] as const;

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
        label: "Kategori (Ana kategori veya ürün türü)",
        placeholder: "Örn: Anne ve bebek (veya boş bırakın, ürün adından çıkarılır)",
        kind: "text",
        optional: true,
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
    blurb: "Ana sayfanın ilk HTML’inden 100 puanlık dijital sağlık skoru ve yazdırılabilir rapor.",
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
  {
    id: "studio-photo",
    label: "Görsel & Ürün Stüdyosu",
    blurb: "Düzenleme talimatı, pazaryeri fon ve çözünürlük denetimi, galeri sırası ve alt metin.",
    fileStem: "gorsel-studyo",
    fields: [
      {
        name: "productName",
        label: "Ürün adı",
        placeholder: "Pamuklu bebek battaniyesi",
        kind: "text",
      },
      {
        name: "features",
        label: "Temel özellikler",
        placeholder: "100×100 cm, yıkanabilir, ekru",
        kind: "textarea",
      },
      {
        name: "market",
        label: "Pazaryeri",
        placeholder: "Pazaryeri seç",
        kind: "select",
        options: STUDIO_MARKETS,
      },
      {
        name: "widthPx",
        label: "Genişlik (px)",
        placeholder: "1200",
        kind: "text",
      },
      {
        name: "heightPx",
        label: "Yükseklik (px)",
        placeholder: "1800",
        kind: "text",
      },
      {
        name: "background",
        label: "Ana kare fonu",
        placeholder: "Fon seç",
        kind: "select",
        options: STUDIO_BACKGROUNDS,
      },
      {
        name: "overlay",
        label: "Ana karede yazı veya logo",
        placeholder: "Seç",
        kind: "select",
        options: STUDIO_OVERLAYS,
      },
      {
        name: "galleryCount",
        label: "Galeri adedi",
        placeholder: "Adet seç",
        kind: "select",
        options: STUDIO_GALLERY_COUNTS,
      },
    ],
    cta: null,
  },
  {
    id: "technical-drawing",
    label: "Teknik Çizim & Ölçü Şeması",
    blurb: "Milimetre ölçülerinden SVG ölçü şeması ve montaj listesi. Önizlenir, .svg iner.",
    fileStem: "olcu-semasi",
    fields: [
      {
        name: "productName",
        label: "Ürün adı",
        placeholder: "Meşe raf",
        kind: "text",
      },
      {
        name: "widthMm",
        label: "Genişlik (mm)",
        placeholder: "120",
        kind: "text",
      },
      {
        name: "heightMm",
        label: "Yükseklik (mm)",
        placeholder: "80",
        kind: "text",
      },
      {
        name: "depthMm",
        label: "Derinlik (mm)",
        placeholder: "40",
        kind: "text",
      },
      {
        name: "material",
        label: "Malzeme (isteğe bağlı)",
        placeholder: "Kayın kontraplak",
        kind: "text",
        optional: true,
      },
      {
        name: "steps",
        label: "Montaj adımları (isteğe bağlı)",
        placeholder: "Ayağı yuvaya oturt\nVidayı sık",
        kind: "textarea",
        optional: true,
      },
    ],
    cta: null,
  },
  {
    id: "saas-builder",
    label: "Mini SaaS & Kod Üretici",
    blurb: "Kargo hesabı, sipariş formu, sayaç veya JSON betiği. Canlı önizleme, kopya ve zip.",
    fileStem: "mini-saas",
    fields: [
      {
        name: "widget",
        label: "Bileşen",
        placeholder: "Bileşen seç",
        kind: "select",
        options: SAAS_WIDGETS,
      },
      {
        name: "title",
        label: "Başlık",
        placeholder: "Kargo desi hesabı",
        kind: "text",
      },
      {
        name: "detail",
        label: "Açıklama veya bitiş / adres",
        placeholder: "Sayaç için 2026-12-31, API için https://ornek.com/stok.json",
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

/** Çalışma odası görev kimliği. Kısa veya yabancı değer düşer. */
export function readDeskTaskId(raw: string | null | undefined): string {
  const task = (raw ?? "").trim();
  return /^[A-Za-z0-9_-]{8,80}$/.test(task) ? task : "";
}

/** Sekme adresi. Geçerli görev kimliği varsa teslimat köprüsü eklenir. */
export function tezgahDeskHref(id: TezgahToolId, deskTaskId: string): string {
  const href = tezgahToolHref(id);
  const task = readDeskTaskId(deskTaskId);
  if (!task) {
    return href;
  }
  return `${href}&desk=${encodeURIComponent(task)}`;
}

/**
 * Google dönüş yolu. Auth `next` sorguyu düşürür; çapa allowlist’te kalır.
 * Örnek: `/tezgah#tetkik`.
 */
export function tezgahToolAnchorPath(id: TezgahToolId): string {
  return `${TEZGAH_PATH}#${id}`;
}

/** Boş veya yabancı değer `null`. Sekme o zaman `ecommerce` kalır. `hibe` hibe dosyasıdır. */
export function parseTezgahToolParam(raw: string | null | undefined): TezgahToolId | null {
  const value = (raw ?? "").trim();
  if (!value) {
    return null;
  }
  if (value === "hibe") {
    return "grant";
  }
  for (const id of TEZGAH_TOOL_IDS) {
    if (id === value) {
      return id;
    }
  }
  return null;
}

export function readTezgahPrefill(
  toolId: TezgahToolId,
  params: { get(name: string): string | null },
): Record<string, string> {
  const tool = tezgahToolById(toolId);
  if (!tool) {
    return {};
  }
  const next: Record<string, string> = {};
  for (const field of tool.fields) {
    const raw = params.get(field.name);
    if (raw == null) {
      continue;
    }
    const value = raw.trim().slice(0, 2000);
    if (!value) {
      continue;
    }
    if (field.kind === "select") {
      if ((field.options ?? []).some((option) => option.value === value)) {
        next[field.name] = value;
      }
      continue;
    }
    if (value.length >= 1) {
      next[field.name] = value;
    }
  }
  return next;
}

export function tezgahQuotaLine(remaining: number, limit: number): string {
  return `Bugünkü ücretsiz hakkınız: ${remaining} / ${limit}`;
}
