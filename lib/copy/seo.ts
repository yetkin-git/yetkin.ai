import type { Metadata } from "next";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { LEGAL_PAGE_TITLE } from "@/lib/copy/legal-launch";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { AUTH_SEN } from "@/lib/copy/sen-voice/auth";
import { PUBLIC_SEN } from "@/lib/copy/sen-voice/public";

/** Google / OG mutlak URL kökü — sitemap ile aynı canlı domain. */
export const CANONICAL_SITE_ORIGIN = "https://yetkin.ai" as const;

/** Çocuk segment title'ına eklenen kök şablon. Markayı title string'ine ikinci kez yazma. */
export const TITLE_TEMPLATE = `%s · ${YETKIN_BRAND}` as const;

export const OG_LOCALE = "tr_TR" as const;

export const AUTH_ROBOTS = { index: false, follow: true } as const;

/**
 * Aşama 1 SEO — kamuya açık ana sayfaların özgün title / description kopyası.
 * H1 sen-voice ile aynı olmak zorunda değildir; meta tekil ve zengin kalır.
 */
export const PAGE_SEO = {
  home: {
    title: PUBLIC_SEN.home.title,
    description:
      "Yapay zekâ destekli akademi, kariyer vizesi ve freelancer iş pazarı. Yetkinliğini geliştir, sınavı geç, uzmanlığını belgele. Mühür sunucuda doğrulanır; sahte kazanç yazılmaz.",
    path: "/",
  },
  career: {
    title: "Kariyer vizesi ve uzmanlık belgesi",
    description:
      "Akademi sınavı ve freelancer tesliminden türeyen kariyer vizen. Mühür pasaporta işlenir; sahte rozet eklenmez. Uzmanlığını belgele, iş kapısını aç.",
    path: "/career",
  },
  freelancer: {
    title: "Freelancer iş pazarı",
    description:
      "Açık iş ilanlarına teklif ver. Teslim onayında bütçe emanete alınır; yetkin.ai iş pazarında sahte kazanç ve uydurma bakiye yazılmaz.",
    path: "/freelancer",
  },
  academy: {
    title: ACADEMY_SEN.catalog.title,
    description:
      "Yapay zekâ destekli kurslar: dersi bitir, testi 70+ ile geç, sertifikan Kariyer sayfana işlensin. Akademi kataloğu canlı müfredat taşır.",
    path: "/academy",
  },
  academyVerify: {
    title: "Sertifika doğrula",
    description:
      "Akademi sertifikasının SHA-256 özetini doğrula. Oturum istenmez; vatandaş kimliği gösterilmez. Uydurma mühür geçerli damga basmaz.",
    path: "/academy/dogrula",
  },
  contact: {
    title: "İletişim",
    description: `${YETKIN_BRAND} iletişim ve destek kanalı.`,
    path: "/iletisim",
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
};

export const PRODUCT_ROOM_PATHS = ["/academy", "/career", "/freelancer"] as const;

export type SitemapChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

/**
 * Aşama 2 sitemap önceliği: ana sayfa/akademi 1.0, kurs 0.8, yasal/iletişim 0.5.
 * Kariyer ve freelancer ürün odaları 0.9.
 */
export function sitemapRoutePolicy(path: string): {
  changeFrequency: SitemapChangeFrequency;
  priority: number;
} {
  if (path === "/" || path === "/academy") {
    return { changeFrequency: "weekly", priority: 1 };
  }
  if (path === "/career" || path === "/freelancer") {
    return { changeFrequency: "weekly", priority: 0.9 };
  }
  if (path.startsWith("/academy/") && !path.startsWith("/academy/dogrula")) {
    return { changeFrequency: "weekly", priority: 0.8 };
  }
  if (path.startsWith("/legal") || path === "/iletisim") {
    return { changeFrequency: "monthly", priority: 0.5 };
  }
  return { changeFrequency: "weekly", priority: 0.7 };
}

/** Kamuya açık sayfa metadata'sı: canonical + Open Graph (tr_TR) + Twitter Card. */
export function pageMetadata({ title, description, path, robots, image }: PageSeoInput): Metadata {
  const images = image ? [{ url: image, alt: title }] : undefined;
  return {
    title,
    description,
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
