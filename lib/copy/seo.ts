import type { Metadata } from "next";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { LEGAL_PAGE_TITLE } from "@/lib/copy/legal-launch";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { AUTH_SEN } from "@/lib/copy/sen-voice/auth";
import { PUBLIC_SEN } from "@/lib/copy/sen-voice/public";

/** Google / OG mutlak URL kökü — sitemap ile aynı canlı domain. */
export const CANONICAL_SITE_ORIGIN = "https://yetkin.ai" as const;

/** JSON-LD ve OG için kanonik mutlak URL. Bağıl yol `https://yetkin.ai` köküne bağlanır. */
export function canonicalUrl(path: string): string {
  if (path.startsWith("https://") || path.startsWith("http://")) {
    return path;
  }
  return new URL(path, `${CANONICAL_SITE_ORIGIN}/`).href;
}

/** Çocuk segment title'ına eklenen kök şablon. Markayı title string'ine ikinci kez yazma. */
export const TITLE_TEMPLATE = `%s · ${YETKIN_BRAND}` as const;

export const OG_LOCALE = "tr_TR" as const;

export const AUTH_ROBOTS = { index: false, follow: true } as const;

/** Twitter `summary_large_image` plakası — `app/opengraph-image.tsx` üretir. */
export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;
export const DEFAULT_OG_IMAGE = "/opengraph-image" as const;
export const DEFAULT_OG_IMAGE_ALT = `${PUBLIC_SEN.home.title} · ${YETKIN_BRAND}` as const;

/**
 * Aşama 1 SEO — kamuya açık ana sayfaların özgün title / description kopyası.
 * H1 sen-voice ile aynı olmak zorunda değildir; meta tekil ve zengin kalır.
 */
export const PAGE_SEO = {
  home: {
    title: PUBLIC_SEN.home.title,
    description:
      "Yapay zeka eğitimi ve online kurs vitrini yeni müfredat üretim bandındadır. Prompt eğitimi mühürlenince yayımlanır. Testi geç; yapay zeka sertifikan mühürlenir, kariyer vizesi Kariyer sayfana işlenir. PayTR iFrame + 3D Secure.",
    path: "/",
    image: DEFAULT_OG_IMAGE,
  },
  career: {
    title: "Kariyer vizesi ve uzmanlık belgesi",
    description:
      "Kariyer vizesi: Akademi sınavından türeyen yapay zeka sertifikası Pasaport Vize Damgasına dönüşür. Teklif Kapısı işveren ağına görünürlük, mühürlü özgeçmiş bağlantısı ve proje kanıtını açar. Sahte rozet eklenmez.",
    path: "/career",
    image: DEFAULT_OG_IMAGE,
  },
  publicTalent: {
    title: "Kariyer vizesi — liyakat mühürlü özgeçmiş kartı",
    description:
      "Kamuya açık kariyer vizesi kartı: mühürler, yapay zeka sertifikası doğrulama bağı ve proje kanıtı. Oturum istenmez; vatandaş kimliği gösterilmez.",
    path: "/vize",
    image: DEFAULT_OG_IMAGE,
  },
  // PayTR B2C (E7): 410 dönen /freelancer odasının SEO girdisi yoktur.
  academy: {
    title: ACADEMY_SEN.catalog.title,
    description:
      "Yapay zeka eğitimi ve online kurslar: amiral kurs yayındadır. Prompt eğitimi ve kardeş müfredat Çok Yakında / Hazırlanıyor rozetiyle durur. Dersi bitir, testi 70+ ile geç, yapay zeka sertifikan ve kariyer vizesi Kariyer sayfana işlensin. Akademi yalnız mühürlü müfredatı satar.",
    path: "/academy",
    image: DEFAULT_OG_IMAGE,
  },
  academyVerify: {
    title: "Sertifika doğrula",
    description:
      "Akademi sertifikasının SHA-256 sicil bütünlük kaydını doğrula. Oturum istenmez; vatandaş kimliği gösterilmez. Müfredat özeti sicile bağlıdır. Uydurma geçerli damga basılmaz.",
    path: "/academy/dogrula",
    image: DEFAULT_OG_IMAGE,
  },
  contact: {
    title: "İletişim",
    description: `${YETKIN_BRAND} iletişim ve destek kanalı.`,
    path: "/iletisim",
  },
  about: {
    title: "Hakkımızda",
    description: `${YETKIN_BRAND} — Yapınet Gayrimenkul ve E-Ticaret Limited Şirketi bünyesinde dijital eğitim, sınav ve sertifikasyon (B2C).`,
    path: "/hakkimizda",
  },
  legal: {
    title: LEGAL_PAGE_TITLE,
    description:
      "KVKK aydınlatma, çerez politikası, mesafeli satış, ön bilgilendirme, iade koşulları ve platform kullanım şartları.",
    path: "/legal",
  },
  login: {
    title: AUTH_SEN.login.title,
    description: AUTH_SEN.login.description,
    path: "/login",
  },
  register: {
    title: AUTH_SEN.register.title,
    description: AUTH_SEN.register.description,
    path: "/register",
  },
} as const;

type PageSeoInput = {
  title: string;
  description: string;
  path: string;
  robots?: Metadata["robots"];
  /** Bağıl kamu yolu — `metadataBase` ile mutlak `og:image` olur. */
  image?: string;
  /** Virgülle birleşen `<meta name="keywords">` — yalnız amiral antrede dolar. */
  keywords?: readonly string[];
};

export const PRODUCT_ROOM_PATHS = ["/academy", "/career"] as const;

/** Sitemap statik kamu yolları — robots allow listesi ile aynı SSOT. */
export const SITEMAP_STATIC_PATHS = [
  "/",
  ...PRODUCT_ROOM_PATHS,
  PAGE_SEO.academyVerify.path,
  PAGE_SEO.publicTalent.path,
] as const;

/** Oturum / sığınak / kilitli oda — sitemap’te yok; crawl edilmez. */
export const ROBOTS_DISALLOW_PATHS = [
  "/dashboard",
  "/freelancer",
  "/admin",
  "/login",
  "/register",
  "/cuzdan",
  "/kasa",
  "/profil",
  "/pasaport",
  "/api/",
  // SEO Tedavi (P1) — satın alma duvarı arkası oynatıcı; auth duvarı + sayfa noindex ile üç katmanlı kilit.
  "/academy/*/oyna",
  "/academy/*/cikis-paketi",
] as const;

/**
 * SEO Tedavi (P0) — 01_office_ai amiral meta override.
 * `course.title` SSOT'u (sicil/sertifika başlığı) değişmez; yalnız SEO dalı bu metinleri basar.
 * Title 52 kr + `TITLE_TEMPLATE` (12 kr) = 64 kr final; SERP kesintisiz.
 *
 * PAKET-19 — vatandaş lisanı anahtar kümesi meta description / keywords / H1'e işlenir.
 * Compact makale gövdesi duvar arkasındadır; antre özeti + ders teaser'ı indekslenir.
 */
export const OFFICE_AI_SEO = {
  slug: "01_office_ai",
  path: "/academy/01_office_ai",
  title: "Excel Yapay Zekâ Eğitimi: Ofiste ChatGPT + Sertifika",
  description:
    "Office AI eğitimi: iş hayatında yapay zekâ. Excel Gemini kullanımı, Word ataş ile belge analizi ve Cuma 30 rutini. 9 ders, 70+ baraj, mühürlü sertifika.",
  /** Gövde H1 — kullanıcı dili; title (arama dili) ile ayrışır. */
  h1: "İş Hayatında Yapay Zekâ: Excel'den E-Postaya 9 Ders",
  keywords: [
    "İş Hayatında Yapay Zekâ",
    "Excel Gemini Kullanımı",
    "Word Ataş İle Belge Analizi",
    "Cuma 30 Rutini",
    "Office AI Eğitimi",
    "Excel yapay zeka eğitimi",
    "ofiste ChatGPT",
    "Word yapay zeka",
  ],
} as const;

/** Kamuya açık antre ders özetleri — tam compact makale duvar arkasındadır. */
export const OFFICE_AI_LESSON_TEASERS: Readonly<Record<string, string>> = {
  "01_office_ai-1":
    "Excel Gemini kullanımı: A1 hijyeniyle dağınık tabloyu düzenli tabloya çevirirsin.",
  "01_office_ai-k1":
    "KVKK: ham müşteri listesi yüklenmez; maske refleksini kilitlersin.",
  "01_office_ai-2":
    "Temiz tablodan üç maddelik yönetim özeti ve karar cümlesi çıkarırsın.",
  "01_office_ai-3":
    "Metinden slayta: Copilot veya PowerPoint sunusu ataş ile sunum hazırlarsın.",
  "01_office_ai-5":
    "Yapay zekâ yanılınca TOPLA ve kaynak evrakla sayıyı kilitlersin.",
  "01_office_ai-4":
    "Gelen kutuyu etiket–taslak–onay–arşiv ritüeliyle sıfırlarsın.",
  "01_office_ai-g1":
    "Gmail + Gemini ile yerinde aksiyon listesi çıkarırsın.",
  "01_office_ai-w1":
    "Word ataş ile belge analizi: sözleşme, dilekçe ve raporu ayrı istemle çözersin.",
  "01_office_ai-6":
    "Cuma 30 rutini: 10 Excel + 10 slayt + 10 kutu, takvimde durur.",
};

/** robots.txt Allow — yayın amiral antresi (prefix `/academy` yedeğine ek kesin yol). */
export const ROBOTS_ALLOW_COURSE_PATHS = [OFFICE_AI_SEO.path] as const;

export type SitemapChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

/**
 * Aşama 2 sitemap önceliği: ana sayfa/akademi 1.0, kurs 0.8, yasal/iletişim/hakkımızda 0.5.
 * Kariyer 0.9.
 */
export function sitemapRoutePolicy(path: string): {
  changeFrequency: SitemapChangeFrequency;
  priority: number;
} {
  if (path === "/" || path === "/academy") {
    return { changeFrequency: "weekly", priority: 1 };
  }
  if (path === "/career") {
    return { changeFrequency: "weekly", priority: 0.9 };
  }
  if (path.startsWith("/academy/") && !path.startsWith("/academy/dogrula")) {
    return { changeFrequency: "weekly", priority: 0.8 };
  }
  if (path.startsWith("/legal") || path === "/iletisim" || path === "/hakkimizda") {
    return { changeFrequency: "monthly", priority: 0.5 };
  }
  return { changeFrequency: "weekly", priority: 0.7 };
}

/** Kamuya açık sayfa metadata'sı: canonical + Open Graph (tr_TR) + Twitter Card. */
export function pageMetadata({
  title,
  description,
  path,
  robots,
  image,
  keywords,
}: PageSeoInput): Metadata {
  const images = image ? [{ url: image, alt: title }] : undefined;
  return {
    title,
    description,
    ...(keywords && keywords.length > 0 ? { keywords: [...keywords] } : {}),
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      locale: OG_LOCALE,
      url: path,
      siteName: YETKIN_BRAND,
      title,
      description,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
    ...(robots ? { robots } : {}),
  };
}
