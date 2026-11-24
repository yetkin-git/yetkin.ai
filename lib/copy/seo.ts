import type { Metadata } from "next";
import { YETKIN_BRAND } from "@/lib/copy/brand";
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

/** Junior ders sayfası soneki. Gövde `{Ders Başlığı} - 6. Sınıf {Branş}` kalır. */
export const JUNIOR_SEO_BRAND = `${YETKIN_BRAND} Junior` as const;
export const JUNIOR_TITLE_TEMPLATE = `%s | ${JUNIOR_SEO_BRAND}` as const;

/**
 * 6. sınıf ders başlığı.
 * Çıktı: `{Ders Başlığı} - 6. Sınıf {Branş} | yetkin.ai Junior`
 */
export function juniorLessonSeoTitle(lessonTitle: string, subject: string): string {
  return `${lessonTitle.trim()} - 6. Sınıf ${subject.trim()} | ${JUNIOR_SEO_BRAND}`;
}

export const JUNIOR_SEO_KEYWORDS = [
  "6. sınıf online ders",
  "6. sınıf matematik",
  "6. sınıf fen bilimleri",
  "6. sınıf türkçe",
  "6. sınıf ingilizce",
  "6. sınıf sosyal bilgiler",
  "yetkin.ai junior",
] as const;

export const OG_LOCALE = "tr_TR" as const;

export const AUTH_ROBOTS = { index: false, follow: true } as const;

/** Twitter `summary_large_image` plakası — `app/opengraph-image.tsx` üretir. */
export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;
export const DEFAULT_OG_IMAGE = "/opengraph-image" as const;
export const DEFAULT_OG_IMAGE_ALT = `${PUBLIC_SEN.home.title} · ${YETKIN_BRAND}` as const;

/**
 * `next/og` üretim rotası (`/opengraph-image`, `/academy/dogrula/[hash]/opengraph-image`).
 * Boyutu ölçülen dosya değil, `ImageResponse` sözleşmesidir: her zaman 1200×630 PNG.
 * Kart paylaşımında `og:image:width/height` bu rotalarda güvenle yazılır; statik JPG/WebP
 * kapaklarda ölçü uydurulmaz (dosya boyutu değişebilir).
 */
export function isGeneratedOgImagePath(path: string): boolean {
  return path === DEFAULT_OG_IMAGE || /\/opengraph-image\/?$/u.test(path);
}

/**
 * Kamu kopyasının editöryal alt sınırı. Site haritası bunu taban alır;
 * canlı `lastmod` `readSitemapLastModified` içindedir (istek saati değil).
 *
 * `new Date()` ile her istekte tazelenen `lastmod` Google'a «her URL her saniye
 * değişiyor» der ve alan tamamen yok sayılır. Bu sabit, içerik dosyası
 * değişim günü daha yeniyse aşılır; daha eski bir dosya saati bunu geri çekmez.
 *
 * ISO 8601, UTC. Saat yazılmaz; gün hassasiyeti yeterlidir.
 */
export const SITE_CONTENT_REVISED_AT = new Date("2026-10-27T00:00:00.000Z");

/**
 * Aşama 1 SEO — kamuya açık ana sayfaların özgün title / description kopyası.
 * H1 sen-voice ile aynı olmak zorunda değildir; meta tekil ve zengin kalır.
 */
export const PAGE_SEO = {
  guide: {
    // Makale değil: dört aktif modülün uçtan uca kurulum akışı (Görsel İş Akış Merkezi).
    title: "İş Akışı ve Kurulum Merkezi — adım adım süreç şeması",
    description:
      "E-ticaret, hibe, AI Tezgâh ve YetkinCV kurulumunu adım adım gör: süre, somut girdi → çıktı, kritik ipucu ve doğrudan ilgili ekrana giden buton.",
    path: "/rehber",
    image: DEFAULT_OG_IMAGE,
    keywords: [
      "e-ticaret kurulum rehberi",
      "kosgeb hibe başvuru adımları",
      "yapay zeka iş akışı",
      "yetkincv yetenek rozeti",
    ],
  },
  home: {
    title: PUBLIC_SEN.home.title,
    // SERP kesme sınırı ~155 karakter. Kuyruk cümlesi (KVKK/sınav vaadi) description'da
    // değil gövde H2'lerinde ve SSS'de durur; burada ilk iki niyet dizgisi öne alınır.
    description:
      "KOBİ'ler, e-ticaret satıcıları ve profesyoneller için AI Tezgâh, e-ticaret yönetimi, hibe bulucu ve YetkinCV. Tek hesap, pratik iş araçları.",
    path: "/",
    image: DEFAULT_OG_IMAGE,
  },
  career: {
    title: "Kariyer — YetkinCV, vize ve açık ilanlar",
    description:
      "YetkinCV vaka testi, doğrulanabilir puan, vize damgası ve açık ilanlar. Doğrulama bağı herkese açıktır.",
    path: "/career",
    image: DEFAULT_OG_IMAGE,
  },
  tezgah: {
    title: "AI Tezgâh — ürün kartı, teklif ve proje dosyası",
    description:
      "Misafire günde 3 üretim: ürün kartı, müşteri teklifi ve yazdırılabilir hibe proje dosyası. Çıktıyı kaydetmek için ücretsiz hesap.",
    path: "/tezgah",
    image: DEFAULT_OG_IMAGE,
    keywords: [
      "ai tezgah",
      "trendyol ürün açıklaması",
      "freelancer teklif yazısı",
      "hibe proje dosyası",
    ],
  },
  publicTalent: {
    title: "Kariyer Kartı — YetkinCV Onaylı Yetenek Rozeti",
    description:
      "Kamuya açık Kariyer Kartı: doğrulanabilir yetkinlik puanı, doğrulama bağı ve proje kanıtı. Oturum istenmez; vatandaş kimliği gösterilmez.",
    path: "/vize",
    image: DEFAULT_OG_IMAGE,
  },
  // PayTR B2C (E7): 410 dönen /freelancer odasının SEO girdisi yoktur.
  // SEO Tedavi (P0): kapalı Akademi girdileri (`academy`, `academyAdvanced`,
  // `academyVerify`) KALDIRILDI. `/academy` diskte yok ve kenar 410 basıyor;
  // meta basan sayfa olmadığı için bu girdiler yalnız testte yaşıyordu.
  contact: {
    // SEO-03: başlık 30 → 57 karakter. "İletişim" niyeti korunur, kapsam zenginleşir.
    title: "İletişim — destek, kurumsal başvuru ve KVKK talepleri",
    description:
      "Destek talebine ve kurumsal başvuruya genelde 1 iş günü içinde dönüş yapılır. E-posta, WhatsApp ve hesap içi bildirim aynı kanaldır.",
    path: "/iletisim",
    image: DEFAULT_OG_IMAGE,
  },
  pricing: {
    title: "Fiyatlar — ücretsiz tezgâh ve uzmanlık paketleri",
    description:
      "AI Tezgâh, uygulama rehberleri ve YetkinCV ücretsizdir. AI Tezgâh Pro, e-ticaret lisansı ve kurumsal paketlerin tutarı katalogdan okunur.",
    path: "/fiyatlandirma",
    image: DEFAULT_OG_IMAGE,
  },
  // E-Ticaret kamu vitrini (satış sayfası). Kokpit `/panel/e-ticaret` altındadır ve robots'ta kapalıdır.
  hibe: {
    title: "YetkinHibe — KOBİ hibe uygunluğu ve proje dosyası",
    description:
      "KOSGEB, TÜBİTAK, TKDK ve bakanlık çağrılarını firma profiline göre eşleştir. Ücretsiz uygunluk skoru ve tam proje dosyası. Resmî onay değildir.",
    path: "/hibe",
    image: DEFAULT_OG_IMAGE,
    keywords: [
      "kosgeb hibe başvuru adımları",
      "tübitak kobi desteği",
      "hibe uygunluk",
      "proje dosyası",
    ],
  },
  eTicaret: {
    title: "E-Ticaret — stok, kanal ve kâr beyni",
    description:
      "Trendyol ve Hepsiburada çift yönlü stok/sipariş senkronu, 30 gün 1 TL doğrulamalı deneme, AI müşteri yanıtı. Kargo baremini kıran, indirimde kârını koruyan e-ticaret beyni.",
    path: "/e-ticaret",
    image: DEFAULT_OG_IMAGE,
    keywords: [
      "e-ticaret yönetimi",
      "trendyol stok senkronu",
      "hepsiburada entegrasyon",
      "çok kanallı e-ticaret",
    ],
  },
  kurumsal: {
    title: "Kurumsal İK Eleme — ilan, YetkinCV testi ve kısa liste",
    // SEO-03: 177 → 152 karakter. SERP ~155 sınırına çekildi; anlam korundu.
    description:
      "Şirket ilanı aç, yetkinlik ağırlığını yüzdeyle tanımla, aday vaka testini sunucuda çözsün. Kısa liste ağırlıklı puana göre sıralanır; CV metni kamuya basılmaz.",
    path: "/kurumsal",
    image: DEFAULT_OG_IMAGE,
  },
  uzmanlar: {
    title: "Uzman dizini — doğrulanmış rozet vitrini",
    description:
      "Doğrulanmış rozetli uzmanların kamu vitrini. Para platformdan geçmez. Liste, aynı kırılımda en az beş kişi varken açılır.",
    path: "/uzmanlar",
    image: DEFAULT_OG_IMAGE,
  },
  sozluk: {
    title: "Yapay zekâ ve dijital ticaret sözlüğü",
    description:
      "KOSGEB, tezgâh, YetkinCV ve e-ticaret terimleri. 30 terimin Türkçe tanımı ve AI Tezgâh örnekleri.",
    path: "/sozluk",
    image: DEFAULT_OG_IMAGE,
  },
  tetkik: {
    title: "Web Site Analizi — SEO, ikna ve dönüşüm karnesi",
    description:
      "Site adresini yaz; SEO uyumu, ikna gücü ve satışa dönüşüm performansını analiz edin. Eksikler hazır çözümlerle gelir.",
    path: "/tetkik",
    image: DEFAULT_OG_IMAGE,
  },
  about: {
    title: "Hakkımızda — günlük iş yükünü azaltan AI araçları",
    description:
      "yetkin.ai; KOBİ'ler, e-ticaret satıcıları ve profesyoneller için teklif, pazaryeri, hibe ve aday değerlendirmesini tek çatıda pratikleştirir.",
    path: "/hakkimizda",
    image: DEFAULT_OG_IMAGE,
  },
  legal: {
    // SEO-03: 28 → 58 karakter. H1 (`LEGAL_PAGE_TITLE`) sade kalır; meta başlık
    // kapsamı (KVKK, mesafeli satış, kullanım şartları) zenginleşir.
    title: "Yasal metinler — KVKK, mesafeli satış ve kullanım şartları",
    description:
      "KVKK aydınlatma, çerez politikası, mesafeli satış, ön bilgilendirme, iade koşulları ve platform kullanım şartları.",
    path: "/legal",
    image: DEFAULT_OG_IMAGE,
  },
  junior: {
    title: `6. Sınıf Online Dersler | ${JUNIOR_SEO_BRAND}`,
    description:
      "6. sınıf Matematik, Fen, Türkçe, İngilizce ve Sosyal Bilgiler dersleri. Her kartın ilk konusu ücretsiz; kilitli konular yıllık paketle açılır.",
    path: "/junior",
    // Dikey plaka: `app/junior/opengraph-image.tsx` (1200×630 PNG). Kök plaka yetişkin
    // Akademi vaadini taşır; veliye giden bağlantı Junior başlığıyla açılmalıdır.
    image: "/junior/opengraph-image",
    keywords: JUNIOR_SEO_KEYWORDS,
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

/** `/rehber` SSS. Schema.org FAQ ile aynı dizidir. Konsol yolu burada yoktur. */
export const GUIDE_FAQ = [
  {
    question: "Rehberi okumak için kayıt gerekir mi?",
    answer:
      "Hayır. Rehber herkese açıktır. AI Tezgâh'ta denemek için de kayıt zorunlu değildir; misafir kotası yeter.",
  },
  {
    question: "Rehberi bitirmek belge veya kurs satar mı?",
    answer:
      "Hayır. Rehber uygulama adımlarını anlatır. Aynı işi saniyeler içinde üretmek için AI Tezgâh'ı ücretsiz dene.",
  },
  {
    question: "Bu sayfa ödeme veya yönetici ekranı mıdır?",
    answer:
      "Hayır. Rehber herkese açıktır. Ödeme kasada, operasyon paneli oturum ve yetki kilidinin arkasındadır.",
  },
] as const;

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

/** İndekslenen ürün odaları. Kapalı kayıt (`/academy`, `/freelancer`, `/young`) yazılmaz. */
export const PRODUCT_ROOM_PATHS = ["/career"] as const;

/**
 * Sitemap ve robots Allow — yalnız oturumsuz 200 dönen kamu yolları.
 * Kök `/` marka iniş sayfasıdır ve indekslenir. `/academy` kapalıdır; site haritasında durmaz.
 * `/career` herkese açık kariyer vizesi sayfasıdır; site haritasındadır.
 * `/tezgah` herkese açık AI çalışma tezgâhıdır; site haritasındadır.
 * `/junior` izinli iki hesap dışına kapalıdır; site haritasına yazılmaz.
 * Kamuya açık vize yüzeyi `/vize`’dir.
 */
export const SITEMAP_STATIC_PATHS = [
  // Kök marka iniş sayfası — 308 kilidi kalktı, `robots: index:true`.
  PAGE_SEO.home.path,
  PAGE_SEO.guide.path,
  PAGE_SEO.career.path,
  PAGE_SEO.tezgah.path,
  PAGE_SEO.pricing.path,
  PAGE_SEO.eTicaret.path,
  PAGE_SEO.hibe.path,
  PAGE_SEO.kurumsal.path,
  PAGE_SEO.publicTalent.path,
  PAGE_SEO.uzmanlar.path,
  PAGE_SEO.sozluk.path,
  PAGE_SEO.tetkik.path,
  // SEO Tedavi (Faz 2): `/hakkimizda` ve `/iletisim` önce yalnız yasal footer
  // listesinden (`LEGAL_FOOTER_LINKS`) sızıyordu. Footer'dan bir satır çıkarsa
  // iki kamu sayfası site haritasından sessizce düşerdi. Artık açık kayıt.
  PAGE_SEO.about.path,
  PAGE_SEO.contact.path,
] as const;

/**
 * Kenar tek hop (`AUTH_PATH_ALIASES`): `/kariyer` `/career`, `/genel-bakis` `/dashboard` sayfasına 307 iner.
 * Ara 308 kalkmıştır; ikinci hop yoktur.
 * Bot bu kaynakları tararsa yine yönlendirme görür; crawl edilmez.
 * Tek hop ile 200 kamu sayfasına inen alias’lar (`/ogren`, `/verify`, `/p`, yasal kısa adlar) listede yoktur: Google 301’i görüp kanoniğe birleştirir.
 */
export const ROBOTS_DISALLOW_AUTH_REDIRECTS = [
  "/kariyer",
  "/genel-bakis",
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
  "/junior",
  "/junior/checkout",
  "/young",
  "/login",
  "/register",
  "/cuzdan",
  "/kasa",
  "/profil",
  "/pasaport",
  // E-Ticaret kokpiti oturum duvarının arkasında; kamu vitrini `/e-ticaret` kapalı değildir.
  "/magazam",
  "/panel/e-ticaret",
  "/panel/hibe",
  "/api/",
  // SEO Tedavi (P1) — satın alma duvarı arkası oynatıcı; auth duvarı + sayfa noindex ile üç katmanlı kilit.
  "/academy",
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
 * SEO Tedavi (P0) — kurs SEO override bloğu (`OFFICE_AI_SEO`, `OFFICE_AI_ILERI_SEO`,
 * `ECOMMERCE_AI_SEO`, `SOCIAL_MEDIA_AI_SEO`, `CHATBOT_NOCODE_SEO`,
 * `PROMPT_PRACTICE_SEO`, `academyCourseSeoOverride`, `OFFICE_AI_LESSON_TEASERS`,
 * `ECOMMERCE_AI_PUBLIC_PATH`) KALDIRILDI. Üretim ithalatçısı yoktu: `/academy/[slug]`
 * sayfası arşivde, `courseJsonLd` ise hiçbir yerde basılmıyordu. Kapalı bir halkayı
 * doğrulayan testler de silindi. Canlı Akademi kanıt yüzeyi (`/vize`, `lib/academy/load.ts`)
 * bu sabitleri hiç okumuyordu.
 */

/** robots.txt Allow — Akademi kapalıdır (410). Kurs yolu allow listesi boştur. */
export const ROBOTS_ALLOW_COURSE_PATHS = [] as const;

export type SitemapChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

/**
 * Aşama 2 sitemap önceliği: kök 1.0, ürün odaları 0.9, vitrin 0.8, yasal 0.5.
 *
 * SEO Tedavi (P0): `/academy` ve `/academy/*` yüksek öncelik kuralları KALDIRILDI.
 * Site haritasında `/academy` hiç yok (`SITEMAP_STATIC_PATHS` taşımaz) ve kenar 410
 * basıyor; politikada 0.8 tutmak ölü bir yüzeyi canlı saymaktı.
 *
 * SEO-05: `/fiyatlandirma` 0.7 (default) → **0.9**. Ticari değeri en yüksek sayfa
 * `/tezgah` ve `/career` ile aynı banda alındı; `/uzmanlar` (0.8) ve `/tetkik` (0.8)
 * keşif yüzeyleridir, satış sayfası değildir. `/legal/*` 0.5 → **0.3**: 11 yasal
 * sayfa site haritasını şişiriyor ve arama niyeti taşımıyor.
 */
export function sitemapRoutePolicy(path: string): {
  changeFrequency: SitemapChangeFrequency;
  priority: number;
} {
  if (path === "/") {
    return { changeFrequency: "weekly", priority: 1 };
  }
  if (
    path === "/career" ||
    path === "/junior" ||
    path === PAGE_SEO.tezgah.path ||
    // SEO-05: satış sayfası ürün odalarıyla aynı bantta.
    path === PAGE_SEO.pricing.path ||
    // E-Ticaret vitrini de satış sayfasıdır; aynı bant.
    path === PAGE_SEO.eTicaret.path ||
    path === PAGE_SEO.hibe.path
  ) {
    return { changeFrequency: "weekly", priority: 0.9 };
  }
  if (path === PAGE_SEO.guide.path || path.startsWith("/rehber/")) {
    return { changeFrequency: "monthly", priority: 0.9 };
  }
  if (path === "/uzmanlar" || path === "/sozluk" || path === "/tetkik") {
    return { changeFrequency: "weekly", priority: 0.8 };
  }
  if (path.startsWith("/sozluk/")) {
    return { changeFrequency: "monthly", priority: 0.6 };
  }
  if (path.startsWith("/junior/ders/")) {
    return { changeFrequency: "weekly", priority: 0.7 };
  }
  // SEO-05: yasal metinler keşif değil uyum yüzeyidir. Band 0.5 → 0.3.
  if (path.startsWith("/legal")) {
    return { changeFrequency: "monthly", priority: 0.3 };
  }
  if (path === "/iletisim" || path === "/hakkimizda") {
    return { changeFrequency: "monthly", priority: 0.5 };
  }
  // Kamu vitrinleri (`/magaza/[slug]`) sitemap'e Faz 2'de eklendi; düşük öncelik
  // çünkü içerik sahibi satıcıya bağlı ve sık değişir.
  if (path.startsWith("/magaza/")) {
    return { changeFrequency: "weekly", priority: 0.4 };
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
  const brandedSuffixes = [` | ${JUNIOR_SEO_BRAND}`, ` | ${YETKIN_BRAND}`] as const;
  const resolvedTitle: Metadata["title"] = brandedSuffixes.some((suffix) => title.endsWith(suffix))
    ? { absolute: title }
    : title;
  // `next/og` rotası 1200×630 sabittir; ölçü yalnız orada yazılır. Statik kapağa
  // yanlış genişlik/yükseklik basmak WhatsApp/LinkedIn kartını kırpar.
  const generatedImage = image ? isGeneratedOgImagePath(image) : false;
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
      ...(images
        ? {
            images: [
              {
                url: image!,
                alt: title,
                ...(generatedImage
                  ? { width: OG_IMAGE_SIZE.width, height: OG_IMAGE_SIZE.height }
                  : {}),
              },
            ],
          }
        : {}),
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
