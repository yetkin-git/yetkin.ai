/**
 * AI Tezgâh vitrini. İstemci ve sunucu aynı sözlüğü okur.
 * Kota sayısı ve dönüşüm köprüsü burada durur; cüzdan burada yoktur.
 */

import { DUKKAN_SECTORS, DUKKAN_TONES } from "@/lib/tezgah/dukkan/copy";

export const TEZGAH_PATH = "/tezgah" as const;

export const TEZGAH_GUEST_DAILY_LIMIT = 1;
export const TEZGAH_MEMBER_DAILY_LIMIT = 3;

export const TEZGAH_GUEST_QUOTA_MESSAGE =
  "Günde 3 ücretsiz üretim hakkı için ücretsiz kayıt ol";

export const TEZGAH_MEMBER_QUOTA_MESSAGE =
  "Bugünkü ücretsiz hakkınız doldu. Yarın (İstanbul gece yarısı) yenilenir.";

export const TEZGAH_FAIL_MESSAGE =
  "Üretim tamamlanamadı. Hakkınız duruyor; biraz sonra yeniden deneyin.";

export const TEZGAH_TOOL_IDS = ["ecommerce", "proposal", "grant", "tetkik", "dukkan"] as const;

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
    label: "KOSGEB / Hibe Ön Notu",
    blurb: "Sektör ve projeden destek başlığı, özet ve başvuru öncesi kontrol listesi.",
    fileStem: "hibe-notu",
    fields: [
      {
        name: "sector",
        label: "Sektör",
        placeholder: "Gıda üretimi",
        kind: "text",
      },
      {
        name: "businessStatus",
        label: "İşletme durumu",
        placeholder: "Yeni kurulan KOBİ, 4 çalışan, ihracat yok",
        kind: "text",
      },
      {
        name: "project",
        label: "Proje",
        placeholder: "Soğuk zincir deposu ve kendi e-ticaret kanalı",
        kind: "textarea",
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
] as const;

export function tezgahToolById(id: string): TezgahTool | null {
  return TEZGAH_TOOLS.find((tool) => tool.id === id) ?? null;
}

export function tezgahQuotaLine(remaining: number, limit: number): string {
  return `Bugünkü ücretsiz hakkınız: ${remaining} / ${limit}`;
}
