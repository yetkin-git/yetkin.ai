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
  SAAS_PLATFORMS,
  SAAS_WIDGETS,
  STUDIO_GALLERY_COUNTS,
  STUDIO_SCENES,
} from "@/lib/tezgah/pro/options";
import { REKLAM_AIMS, REKLAM_FILE_STEM } from "@/lib/tezgah/reklam/copy";

const YES_NO = [
  { value: "evet", label: "Evet" },
  { value: "hayir", label: "Hayır" },
] as const;

export const TEZGAH_PATH = "/tezgah" as const;

/**
 * Misafir günlük tavanı (Faz 3 / S-01).
 *
 * Misafir kovası `guest:<ip>` anahtarıdır: aynı çıkış IP'sini (kafe, CGNAT, kurumsal
 * NAT) yüzlerce kişi paylaşabilir. Aylık havuza geçmek bu kovayı tek kişiye 30 kredi
 * verirdi; bu yüzden misafir hattı **günlük** kalır ve İstanbul gece yarısında döner.
 * Üyelik hattı aylık kredi havuzudur (`TEZGAH_FREE_MONTHLY_CREDITS`).
 */
export const TEZGAH_GUEST_DAILY_LIMIT = 3;

/**
 * Üye ücretsiz kredi havuzu (Faz 3 / S-01) — aylık 30 kredi.
 *
 * Eskiden günde 3 hak vardı. Günlük tavan kullanım **yoğunluğunu** cezalandırıyordu:
 * pazartesi 20 teklif yazmak isteyen serbest çalışan cuma boş oturuyordu. Aylık havuz
 * aynı toplamı esnek dağıtır. Dönem anahtarı `YYYY-MM`'dir (`tezgahQuotaPeriodKey`).
 */
export const TEZGAH_FREE_MONTHLY_CREDITS = 30;

/**
 * Tezgâh Pro aylık kredi havuzu — 500 kredi (Faz 3 / S-01).
 *
 * Önce Pro hattı ücretsiz tavanı (3) döndürüyordu: aylık 590 TL ödeyen kullanıcı
 * ürünün kendi ekranında "3 / 3 ücretsiz hak" görüyordu (B-02). Tedavi günlük 100
 * ile bu algıyı düzeltti; Faz 3 aynı faydayı **aylık kredi** diline çevirir
 * (500 ÷ 30 ≈ 16.6× ücretsiz havuz). Rakam tek yerde durur: fiyat tablosu, kota
 * rozeti, panel kartı ve `llms.txt` bu sabitten okur.
 */
export const TEZGAH_PRO_MONTHLY_CREDITS = 500;

/**
 * Aylık devir oranı (Faz 3 / S-01). Kullanılmayan kredinin yarısı sonraki aya taşınır.
 * Devir tek aylıktır (zincirleme birikmez) ve taban havuzun yarısıyla sınırlıdır.
 */
export const TEZGAH_ROLLOVER_BPS = 5_000;

/** Devir tavanı — taban havuzun yarısı. `%50` devir + `%50` tavan aynı sayıdır. */
export const TEZGAH_ROLLOVER_CAP_BPS = 5_000;

/** Web Site Analizi ömür boyu ücretsiz tavanı. Günlük yenilenmez. */
export const TEZGAH_TETKIK_LIFETIME_LIMIT = 1;

/** Tetkik sayaç satırı tarih anahtarı — İstanbul gününe bağlı değildir. */
export const TEZGAH_TETKIK_DATE_KEY = "lifetime" as const;

export const TEZGAH_POOL_KEYS = ["tetkik", "lite", "free_template"] as const;

export type TezgahPoolKey = (typeof TEZGAH_POOL_KEYS)[number];

/** Kota düşmeyen istemci Pro Studio araçları. */
export type TezgahLocalPool = "local";

export type TezgahToolPool = TezgahPoolKey | TezgahLocalPool;

export const TEZGAH_GUEST_QUOTA_MESSAGE =
  "Bugünkü 3 ücretsiz hakkın doldu. Yarın (İstanbul gece yarısı) yenilenir.";

export const TEZGAH_MEMBER_QUOTA_MESSAGE =
  "Bu ayki ücretsiz kredin doldu. Yeni krediler ayın 1'inde (İstanbul saatiyle) tanımlanır; kalan kredinin yarısı o gün devreder.";

export const TEZGAH_MEMBER_PAID_MESSAGE =
  "Aylık ücretsiz kredin doldu. Tezgâh Pro aboneliğiyle veya tekil üretim kredisiyle kesintisiz devam et.";

export const TEZGAH_CATALOG_CLOSED_MESSAGE =
  "Ücretli üretim katalogda açık değil. Ücretsiz kredin ayın 1'inde (İstanbul saatiyle) yenilenir.";

/**
 * B-02 / S-01: Pro hattı tükendiğinde ücretsiz hat mesajı basılmaz.
 * Kullanıcı aylık ödeme yapıyor; "ücretsiz kredi doldu" cümlesi yanlış bilgi olur.
 */
export const TEZGAH_PRO_QUOTA_MESSAGE =
  "Aylık Pro kredin doldu. Yeni kredi ayın 1'inde (İstanbul saatiyle) tanımlanır; acele işin varsa tekil üretim kredisi kullanabilirsin.";

export const TEZGAH_TETKIK_GUEST_QUOTA_MESSAGE =
  "Ücretsiz web site analizi hakkın kullanıldı. Giriş yapıp Pro abonelik veya kredi ile yeni analiz al.";

export const TEZGAH_TETKIK_MEMBER_QUOTA_MESSAGE =
  "Ücretsiz web site analizi hakkın (ömür boyu 1) kullanıldı.";

export const TEZGAH_TETKIK_DOMAIN_CLAIMED_MESSAGE =
  "Bu web sitesi için ücretsiz analiz hakkı daha önce kullanıldı. Yeni veya tekrar analiz için Pro pakete geç veya kredi kullan.";

export const TEZGAH_CREDIT_PACK_SIZE = 10;

export const TEZGAH_FAIL_MESSAGE =
  "Üretim tamamlanamadı. Hakkınız duruyor; biraz sonra yeniden deneyin.";

export const TEZGAH_UNLIMITED_QUOTA_LINE = "Ücretsiz kullanım (Kota düşmez)" as const;

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

export const TEZGAH_TOOL_POOL: Record<TezgahToolId, TezgahToolPool> = {
  tetkik: "tetkik",
  proposal: "lite",
  reklam: "lite",
  pazaryeri: "lite",
  grant: "lite",
  ecommerce: "lite",
  dukkan: "free_template",
  "studio-photo": "lite",
  "technical-drawing": "local",
  "saas-builder": "local",
};

export function tezgahPoolForTool(toolId: TezgahToolId): TezgahToolPool {
  return TEZGAH_TOOL_POOL[toolId];
}

export function isTezgahQuotaExemptPool(pool: TezgahToolPool): boolean {
  return pool === "free_template" || pool === "local";
}

export function isTezgahPoolKey(value: string): value is TezgahPoolKey {
  return (TEZGAH_POOL_KEYS as readonly string[]).includes(value);
}

/** `/tezgah` sekme şeridi. Ürün kartı ve hibe dosyası kendi işletim sistemindedir. */
export const TEZGAH_DESK_TOOL_IDS = [
  "proposal",
  "tetkik",
  "dukkan",
  "reklam",
  "pazaryeri",
  "studio-photo",
  "technical-drawing",
  "saas-builder",
] as const satisfies readonly TezgahToolId[];

export type TezgahDeskToolId = (typeof TEZGAH_DESK_TOOL_IDS)[number];

export const TEZGAH_DESK_DEFAULT: TezgahDeskToolId = "proposal";

export function isTezgahDeskTool(id: string): id is TezgahDeskToolId {
  return (TEZGAH_DESK_TOOL_IDS as readonly string[]).includes(id);
}

/** Tarayıcı-içi uzman tezgâhlar. `studio-photo` sunucu `generateImage` hattındadır. */
export const PRO_STUDIO_TOOL_IDS = ["technical-drawing", "saas-builder"] as const;

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
  cta: { href: "/panel/e-ticaret" | "/tezgah" | "/panel/hibe"; label: string } | null;
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
        placeholder: "Kategoriyi yaz (veya boş bırak)...",
        kind: "text",
        optional: true,
      },
      {
        name: "features",
        label: "Temel özellikler",
        placeholder: "Ürünün temel özelliklerini buraya yaz...",
        kind: "textarea",
      },
    ],
    cta: {
      href: "/panel/e-ticaret",
      label: "E-Ticaret işletim sistemini aç",
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
        placeholder: "Talebi buraya yaz...",
        kind: "textarea",
      },
      {
        name: "expertise",
        label: "Senin uzmanlığın",
        placeholder: "Uzmanlığını yaz...",
        kind: "text",
      },
      {
        name: "deliveryMode",
        label: "Teslimat Modu",
        placeholder: "Mod seç...",
        kind: "select",
        options: [
          { value: "standard", label: "Hizmet & Proje Teklifi (Standart)" },
          { value: "b2b", label: "Sözleşme Eki & Teknik Şartname (B2B)" },
          { value: "summary", label: "Hızlı Fiyat / Kapsam Özeti (Tek Sayfa)" },
        ],
      },
    ],
    cta: null,
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
        placeholder: "İşletme adını yaz...",
        kind: "text",
      },
      {
        name: "freelancerName",
        label: "Yetkili / girişimci adı",
        placeholder: "Adını yaz...",
        kind: "text",
      },
      {
        name: "provinceCode",
        label: "İl",
        placeholder: "İl seç...",
        kind: "select",
        options: GRANT_PROVINCES.map((row) => ({ value: row.code, label: row.name })),
      },
      {
        name: "audience",
        label: "İşletme türü",
        placeholder: "Tür seç...",
        kind: "select",
        options: GRANT_AUDIENCES.map((row) => ({ value: row.id, label: row.label })),
      },
      {
        name: "naceGroup",
        label: "NACE grubu",
        placeholder: "Sektör seç...",
        kind: "select",
        options: GRANT_NACE_GROUPS.map((row) => ({ value: row.id, label: row.label })),
      },
      {
        name: "investmentFocus",
        label: "Yatırım odağı",
        placeholder: "Odak seç...",
        kind: "select",
        options: GRANT_INVESTMENT_FOCI.map((row) => ({ value: row.id, label: row.label })),
      },
      {
        name: "employeeCount",
        label: "Çalışan sayısı",
        placeholder: "Çalışan sayısını yaz...",
        kind: "text",
      },
      {
        name: "companyAgeYears",
        label: "Şirket yaşı (yıl)",
        placeholder: "Şirket yaşını yaz...",
        kind: "text",
      },
      {
        name: "rdMaturityLevel",
        label: "Ar-Ge olgunluğu",
        placeholder: "Düzey seç...",
        kind: "select",
        options: GRANT_RD_LEVELS.map((row) => ({ value: row.id, label: row.label })),
      },
      {
        name: "exportActive",
        label: "İhracat",
        placeholder: "Seç...",
        kind: "select",
        options: YES_NO,
      },
      {
        name: "patent",
        label: "Patent veya faydalı model",
        placeholder: "Seç...",
        kind: "select",
        options: YES_NO,
      },
      {
        name: "project",
        label: "Proje",
        placeholder: "İş fikrini buraya yaz...",
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
      href: "/panel/hibe",
      label: "YetkinHibe proje dosyasını aç",
    },
  },
  {
    id: "tetkik",
    label: "Web Site Analizi",
    blurb:
      "Sitenizin SEO uyumunu, ikna gücünü ve satışa dönüşüm performansını derinlemesine analiz eder; eksiklerinizi hazır çözümlerle sunar.",
    fileStem: "site-tetkik",
    fields: [
      {
        name: "url",
        label: "Site adresi",
        placeholder: "https://ornek-dukkan.com",
        kind: "text",
      },
    ],
    cta: null,
  },
  {
    id: "dukkan",
    label: "Sektörel Dijital Dükkan",
    blurb: "12 sektöre göre tek sayfalık vitrin. Paket kartı ve SSS isteğe bağlı; html ve zip iner.",
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
        name: "packages",
        label: "Vitrin paketleri (isteğe bağlı)",
        placeholder: "Sabah Paketi | Poğaça + çay | 120 TL\nÖğle Menü | Çorba + ana yemek | 280 TL",
        kind: "textarea",
        optional: true,
      },
      {
        name: "hours",
        label: "Çalışma saatleri (isteğe bağlı)",
        placeholder: "Hafta içi 08:00–20:00",
        kind: "text",
        optional: true,
      },
      {
        name: "faq",
        label: "Kısa SSS (isteğe bağlı)",
        placeholder: "Teslimat var mı? | Aynı gün mahalle içi.\nPark yeri? | Cadde üzerinde.",
        kind: "textarea",
        optional: true,
      },
      {
        name: "tone",
        label: "Ton",
        placeholder: "Ton seç",
        kind: "select",
        options: DUKKAN_TONES.map((tone) => ({ value: tone.id, label: tone.label })),
      },
    ],
    cta: { href: "/panel/e-ticaret", label: "E-Ticaret Mağazası Aç" },
  },
  {
    id: "reklam",
    label: "Otonom Reklam Paketi",
    blurb:
      "Üç A/B varyantı, Google/Meta CSV, bütçe dağılımı. Karakter sınırı ve sahte metrik kalkanı kodda mühürlenir.",
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
      {
        name: "budgetTl",
        label: "Aylık bütçe (TL, isteğe bağlı)",
        placeholder: "1000",
        kind: "text",
        optional: true,
      },
    ],
    cta: null,
  },
  {
    id: "pazaryeri",
    label: "Pazaryeri Katalog Fabrikası",
    blurb:
      "En çok 25 ürün. Blokları boş satırla ayır; isteğe bağlı `Ad | Marka | Fiyat | Stok`. CSV, Word ve PDF iner.",
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
        placeholder:
          "Pamuklu battaniye | SoftHome | 1499 | 25\nKategori: Anne ve bebek\nRenk: Ekru",
        kind: "textarea",
      },
    ],
    cta: null,
  },
  {
    id: "studio-photo",
    label: "Görsel & Ürün Stüdyosu",
    blurb: "Pazaryeri standardına gerçek ürün görseli, SEO alt metni ve stüdyo paketi (.png / .zip).",
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
        name: "scene",
        label: "Hedef Pazaryeri Standardı",
        placeholder: "Sahne seç",
        kind: "select",
        options: STUDIO_SCENES.map((scene) => ({ value: scene.value, label: scene.label })),
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
    blurb:
      "Ön/yan/üst ortografik SVG, DXF, teknik föy PDF ve üretim zip. Ölçek, tolerans, desi.",
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
        label: "Malzeme & kalınlık (isteğe bağlı)",
        placeholder: "Kayın kontraplak 18 mm",
        kind: "text",
        optional: true,
      },
      {
        name: "tolerance",
        label: "Genel tolerans (isteğe bağlı)",
        placeholder: "±0.5 mm",
        kind: "text",
        optional: true,
      },
      {
        name: "steps",
        label: "Montaj / işlem adımları (isteğe bağlı)",
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
    blurb:
      "8 iş aracı: kargo, marj, fiyat, sipariş, randevu, sayaç, SSS, JSON kartı. Özellik metni kodu yönlendirir; canlı önizleme ve zip.",
    fileStem: "mini-saas",
    fields: [
      {
        name: "platform",
        label: "Altyapı",
        placeholder: "Kurulum hedefi seç",
        kind: "select",
        options: SAAS_PLATFORMS,
      },
      {
        name: "feature",
        label: "İstediğin özellik / bileşen",
        placeholder: "Örn. kargo desi, kâr marjı, randevu formu, SSS asistanı…",
        kind: "textarea",
      },
      {
        name: "widget",
        label: "Bileşen",
        placeholder: "Bileşen seç (boş bırakırsan özellikten seçilir)",
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

/** Boş veya yabancı değer `null`. `hibe` hibe dosyası kimliğidir. */
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

/** Eski tezgâh sekmeleri. Ürün kartı e-ticaret havuzuna, hibe dosyası proje sekmesine gider. */
export function tezgahRelocatedOsHref(
  raw: string | null | undefined,
): "/panel/hibe?sekme=proje" | "/panel/e-ticaret?sekme=havuz" | null {
  const parsed = parseTezgahToolParam(raw);
  if (parsed === "grant") {
    return "/panel/hibe?sekme=proje";
  }
  if (parsed === "ecommerce") {
    return "/panel/e-ticaret?sekme=havuz";
  }
  return null;
}

/** Sekme şeridindeki araç. Taşınmış veya boş sorgu teklif yazıcıda kalır. */
export function resolveTezgahDeskTool(raw: string | null | undefined): TezgahDeskToolId {
  const parsed = parseTezgahToolParam(raw);
  if (parsed && isTezgahDeskTool(parsed)) {
    return parsed;
  }
  return TEZGAH_DESK_DEFAULT;
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

/**
 * Faz 3 / S-01 — kredi dili.
 *
 * Misafir hattı günlük kalır (`"Bugünkü ücretsiz hakkın: 2 / 3"`), üye hattı aylık
 * kredi havuzudur (`"Kalan kredi: 27 / 30"`). İki dil ayrı basılır: misafire
 * "aylık kredi" demek yanlış olur (kovası IP'dir, sözleşmesi günlüktür).
 */
export function tezgahQuotaLine(remaining: number, limit: number): string {
  return `Kalan kredi: ${remaining} / ${limit}`;
}

/**
 * B-02 / S-01: Pro hattı satırı. Ücretsiz sayaç dili burada basılmaz;
 * kullanıcı aylık ödeme yapıyor. Rakam `TEZGAH_PRO_MONTHLY_CREDITS`'ten gelir.
 */
export function tezgahProQuotaLine(remaining: number, limit: number): string {
  return `Pro — aylık ${limit} kredi · kalan ${remaining}`;
}

/** Misafir hattı satırı. Günlük tavan gerçekten günlüktür; aylık denmez. */
export function tezgahGuestQuotaLine(remaining: number, limit: number): string {
  return `Bugünkü ücretsiz hakkın: ${remaining} / ${limit}`;
}

/**
 * Aktif sekmenin rozet metni. Kota dışı araçlarda sayaç gösterilmez.
 * `guest` verilmezse üye/dolaşım satırı basılır (eski çağrılar için güvenli varsayılan).
 */
export function tezgahPoolQuotaLine(
  pool: TezgahToolPool,
  remaining: number,
  limit: number,
  guest = false,
): string {
  if (isTezgahQuotaExemptPool(pool)) {
    return TEZGAH_UNLIMITED_QUOTA_LINE;
  }
  if (pool === "tetkik") {
    if (remaining <= 0) {
      return "0 / 1 — Pro veya Kredi gerekli";
    }
    return `Kalan ücretsiz analiz hakkın: ${remaining} / ${limit}`;
  }
  return guest ? tezgahGuestQuotaLine(remaining, limit) : tezgahQuotaLine(remaining, limit);
}

/**
 * Havuz satırı + hat bilgisi. `lane` verildiğinde Pro hattı kendi dilini basar;
 * `lane` yoksa (eski çağrılar) üye kredi satırı korunur.
 */
export function tezgahPoolQuotaLineForLane(
  pool: TezgahToolPool,
  remaining: number,
  limit: number,
  lane?: string,
  guest = false,
): string {
  if (lane === "pro" && !isTezgahQuotaExemptPool(pool)) {
    if (pool === "tetkik") {
      return `Pro — ömür boyu analiz hakkı · kalan ${remaining}`;
    }
    return tezgahProQuotaLine(remaining, limit);
  }
  return tezgahPoolQuotaLine(pool, remaining, limit, guest);
}

export function tezgahToolQuotaLine(
  toolId: TezgahToolId,
  remaining: number,
  limit: number,
  guest = false,
): string {
  return tezgahPoolQuotaLine(tezgahPoolForTool(toolId), remaining, limit, guest);
}

/** Araç satırı + hat. Pro hattı ücretsiz sayaç dilini basmaz (B-02). */
export function tezgahToolQuotaLineForLane(
  toolId: TezgahToolId,
  remaining: number,
  limit: number,
  lane?: string,
  guest = false,
): string {
  return tezgahPoolQuotaLineForLane(tezgahPoolForTool(toolId), remaining, limit, lane, guest);
}

export const TEZGAH_SEAL_LABEL = "Bu Yetkinliği YetkinCV ile Mühürle →" as const;

const TEZGAH_SEAL_HREF = "/career#yetkincv" as const;

const TEZGAH_SEAL_PATHS: Record<TezgahToolId, typeof TEZGAH_SEAL_HREF> = {
  ecommerce: TEZGAH_SEAL_HREF,
  proposal: TEZGAH_SEAL_HREF,
  grant: TEZGAH_SEAL_HREF,
  tetkik: TEZGAH_SEAL_HREF,
  dukkan: TEZGAH_SEAL_HREF,
  reklam: TEZGAH_SEAL_HREF,
  pazaryeri: TEZGAH_SEAL_HREF,
  "studio-photo": TEZGAH_SEAL_HREF,
  "technical-drawing": TEZGAH_SEAL_HREF,
  "saas-builder": TEZGAH_SEAL_HREF,
};

/** Çıktının YetkinCV mühür masası. Akademi sınav yolu kapalıdır. */
export function tezgahSealPath(tool: TezgahToolId): string {
  return TEZGAH_SEAL_PATHS[tool];
}
