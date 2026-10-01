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
      "Yapay zekâ odaklı çevrim içi eğitimler, sertifikasyon programları ve kariyer atölyeleri sunan beceri tabanlı dijital eğitim platformu. Ofiste ChatGPT, Excel Copilot ve E-Ticaret Yapay Zekâ Asistanlığı eğitimleriyle yetkinliğini kanıtla, kariyerini mühürle.",
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
      "Yapay zeka eğitimi ve online kurslar: Ofiste Yapay Zekâ, İleri Ofis ve E-Ticaret yayındadır. Sosyal medya, chatbot ve istem pratiği Çok Yakında / Hazırlanıyor rozetiyle durur. Dersi bitir, testi 70+ ile geç, yapay zeka sertifikan ve kariyer vizesi Kariyer sayfana işlensin. Akademi yalnız üç satış şartı tamam olan eğitimi satar.",
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

/**
 * Sitemap ve robots Allow — yalnız oturumsuz 200 dönen kamu yolları.
 * `/career` ürün odasıdır ama kenar oturumsuz isteği 307 ile `/login`’e alır;
 * site haritasında durursa Search Console «Yönlendirmeli sayfa» yazar.
 * Kamuya açık vize yüzeyi `/vize`’dir.
 */
export const SITEMAP_STATIC_PATHS = [
  "/",
  "/academy",
  PAGE_SEO.academyVerify.path,
  PAGE_SEO.publicTalent.path,
] as const;

/**
 * Kenar tek hop (`AUTH_PATH_ALIASES`): `/kariyer` oturumsuzda doğrudan girişe,
 * oturumda `/career` odasına iner. Ara 308 kalkmıştır; ikinci hop yoktur.
 * Bot bu kaynakları tararsa yine yönlendirme görür; crawl edilmez.
 * Tek hop ile 200 kamu sayfasına inen alias’lar (`/ogren`, `/verify`, `/p`, yasal kısa adlar) listede yoktur: Google 301’i görüp kanoniğe birleştirir.
 */
export const ROBOTS_DISALLOW_AUTH_REDIRECTS = [
  "/career",
  "/kariyer",
  "/profile",
  "/passport",
  "/giris",
  "/kayit",
  "/academy/certificates",
  "/auth/",
  "/sifremi-unuttum",
  "/sifre-yenile",
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
  ...ROBOTS_DISALLOW_AUTH_REDIRECTS,
] as const;

/** Google önek kuralı: kural yolun kendisini ve altını kapatır. `*` tek segmenttir. */
export function isRobotsDisallowedPath(pathname: string): boolean {
  const path =
    pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  return ROBOTS_DISALLOW_PATHS.some((rule) => {
    if (rule.includes("*")) {
      const body = rule
        .split("*")
        .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
        .join("[^/]+");
      return new RegExp(`^${body}(?:/|$)`).test(path);
    }
    if (rule.endsWith("/")) {
      return path === rule.slice(0, -1) || path.startsWith(rule);
    }
    return path === rule || path.startsWith(`${rule}/`);
  });
}

/**
 * Canlı yayın SEO — üç amiral antre.
 * `course.title` sicil/sertifika başlığıdır; yalnız bu dal arama title / description / keywords basar.
 * Title dizesi `| yetkin.ai` ile biter. `pageMetadata` bunu mutlak başlık yapar;
 * kök `TITLE_TEMPLATE` markayı ikinci kez eklemez.
 * Description 180 karakter tavanındadır. Mühür cümlesi (izleme + baraj, sunucu dosya kontrolü yok)
 * katalog, SSS ve rehberde durur; snippet bu arama niyeti metnidir.
 */
export const OFFICE_AI_SEO = {
  slug: "01_office_ai",
  path: "/academy/01_office_ai",
  title: "İş Hayatında Yapay Zekâ Eğitimi: Excel, Word, PowerPoint & E-Posta | yetkin.ai",
  description:
    "İş hayatında yapay zekâ ve Copilot kullanımı: Excel formülleri, yönetim özeti, Gmail Gemini ve KVKK uyumlu e-posta akışları. 8 derste pratik beceri ve sertifika.",
  /** Gövde H1 — kullanıcı dili; title (arama dili) ile ayrışır. */
  h1: "İş Hayatında Yapay Zekâ: Excel'den E-Postaya 8 Ders",
  keywords: [
    "iş hayatında yapay zeka",
    "excel yapay zeka",
    "office copilot eğitimi",
    "yapay zeka sertifikası",
    "prompt mühendisliği office",
  ],
} as const;

/**
 * OFF-201 (`01_office_ai_ileri`) kamu meta override.
 * Sicil başlığı durur; title / description / H1 / keywords bu daldadır.
 */
export const OFFICE_AI_ILERI_SEO = {
  slug: "01_office_ai_ileri",
  path: "/academy/01_office_ai_ileri",
  title: "İleri Ofis Yapay Zekâ Eğitimi: Toplantı Notundan Sayı Denetimine | yetkin.ai",
  description:
    "İleri düzey yapay zekâ uygulamaları: Dört parçalı istem, toplantı notu analizi, uzun belge özetleme ve 3 dosyada sayı denetimi. İleri seviye ofis uzmanlığı.",
  h1: "İleri Ofis Yapay Zekâ: Toplantı Notundan Sayı Denetimine",
  keywords: [
    "ileri ofis yapay zeka",
    "toplantı notu yapay zeka",
    "veri denetimi yapay zeka",
    "ileri seviye prompt",
  ],
} as const;

/**
 * EC-102 (`02_ecommerce_ai`) kamu meta override.
 * Sicil başlığı müfredat adıdır; arama title / description / keywords bu daldadır.
 */
export const ECOMMERCE_AI_SEO = {
  slug: "02_ecommerce_ai",
  path: "/academy/02_ecommerce_ai",
  title:
    "E-Ticaret ve Pazaryeri Yapay Zekâ Eğitimi: Trendyol, Hepsiburada, Amazon & Shopify | yetkin.ai",
  description:
    "Trendyol, Hepsiburada, Amazon, Shopify ve PttAVM için SEO uyumlu ürün açıklaması, görsel temizleme, iade analizi ve mağaza puanı asistanı. 6 derste e-ticaret yapay zekâ uzmanlığı.",
  h1: "E-Ticaret ve Pazaryeri Yapay Zekâ Asistanlığı (Trendyol, Hepsiburada, Amazon & Shopify)",
  keywords: [
    "e-ticaret yapay zeka",
    "pazaryeri yapay zeka asistanı",
    "trendyol ürün açıklaması yapay zeka",
    "hepsiburada yapay zeka",
    "e-ticaret seo prompt",
  ],
} as const;

export type AcademyCourseSeo = {
  slug: string;
  path: string;
  title: string;
  description: string;
  h1: string;
  keywords: readonly string[];
};

/** Yayın antre meta override. Sicil başlığını ezmez. */
export function academyCourseSeoOverride(slug: string): AcademyCourseSeo | null {
  if (slug === OFFICE_AI_SEO.slug) {
    return OFFICE_AI_SEO;
  }
  if (slug === OFFICE_AI_ILERI_SEO.slug) {
    return OFFICE_AI_ILERI_SEO;
  }
  if (slug === ECOMMERCE_AI_SEO.slug) {
    return ECOMMERCE_AI_SEO;
  }
  return null;
}

/** Kamuya açık antre ders özetleri — tam compact makale duvar arkasındadır. */
export const OFFICE_AI_LESSON_TEASERS: Readonly<Record<string, string>> = {
  "01_office_ai-1":
    "Excel'de temiz veri: Excel Copilot ve Ataş Yöntemi ve A1 Düzeni ve Temiz Veri ile dağınık tabloyu düzenli tabloya çevirirsin.",
  "01_office_ai-k1":
    "KVKK maskeleme: ham müşteri listesi yüklenmez; maske refleksini kilitlersin.",
  "01_office_ai-2":
    "Yönetim özetine dönüştürme: temiz tablodan üç madde ve bir karar cümlesi çıkarırsın.",
  "01_office_ai-3":
    "Metinden slayta: Copilot veya PowerPoint sunusu ataş ile sunum hazırlarsın.",
  "01_office_ai-5":
    "Yapay zekâ yanılınca TOPLA ve kaynak evrakla sayıyı kilitlersin.",
  "01_office_ai-g1":
    "Gmail'de yerleşik Gemini ve Outlook: etiket, taslak, onay, arşiv, sonra yerinde aksiyon listesi.",
  "01_office_ai-w1":
    "Word belgesi inceleme: Word ataş ile belge analizi; sözleşme, dilekçe ve raporu ayrı istemle çözersin.",
  "01_office_ai-6":
    "Haftalık Cuma rutini: on dakika Excel, on dakika slayt, on dakika kutu; takvime yazılır.",
};

/** robots.txt Allow — mühürlü yayın antreleri (prefix `/academy` yedeğine ek kesin yol). */
export const ECOMMERCE_AI_PUBLIC_PATH = ECOMMERCE_AI_SEO.path;

export const ROBOTS_ALLOW_COURSE_PATHS = [
  OFFICE_AI_SEO.path,
  OFFICE_AI_ILERI_SEO.path,
  ECOMMERCE_AI_SEO.path,
] as const;

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
  const absolute = canonicalUrl(path);
  const images = image ? [{ url: image, alt: title }] : undefined;
  const brandedSuffix = ` | ${YETKIN_BRAND}`;
  const resolvedTitle: Metadata["title"] = title.endsWith(brandedSuffix)
    ? { absolute: title }
    : title;
  return {
    title: resolvedTitle,
    description,
    ...(keywords && keywords.length > 0 ? { keywords: [...keywords] } : {}),
    alternates: { canonical: absolute },
    openGraph: {
      type: "website",
      locale: OG_LOCALE,
      url: absolute,
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
