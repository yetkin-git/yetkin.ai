/**
 * Aşama 3 SEO — schema.org JSON-LD grafikleri.
 * Kanonik kök `CANONICAL_SITE_ORIGIN`. Uydurma sosyal profil yazılmaz.
 */

import { academyCatalogPriceMinorForSlug } from "@/lib/academy/catalog-pricing";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { LEGAL_ENTITY, LEGAL_PAGE_TITLE, LEGAL_WHATSAPP_HREF } from "@/lib/copy/legal-launch";
import { CANONICAL_SITE_ORIGIN, PAGE_SEO, canonicalUrl } from "@/lib/copy/seo";

export const ORGANIZATION_ID = `${CANONICAL_SITE_ORIGIN}/#organization` as const;
export const WEBSITE_ID = `${CANONICAL_SITE_ORIGIN}/#website` as const;

/** Kamu marka mührü — `public/icon.svg` sabit yol. */
export const ORGANIZATION_LOGO_PATH = "/icon.svg" as const;

/**
 * Resmi kamu profilleri. Instagram / LinkedIn / X uydurulmaz;
 * sicilde duran kanal `LEGAL_WHATSAPP_HREF`.
 */
export const ORGANIZATION_SAME_AS = [LEGAL_WHATSAPP_HREF] as const;

export type JsonLdObject = {
  "@type": string;
  "@id"?: string;
  [key: string]: unknown;
};

export type JsonLdDocument = {
  "@context": "https://schema.org";
  "@graph": JsonLdObject[];
};

export type JsonLdBreadcrumb = {
  name: string;
  path: string;
};

export function jsonLdDocument(nodes: readonly JsonLdObject[]): JsonLdDocument {
  return {
    "@context": "https://schema.org",
    "@graph": [...nodes],
  };
}

/** `</script>` kırılmasını önler — Next.js JSON-LD tarifi. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    // Cloudflare Email Obfuscation `user@host` tarar, `/cdn-cgi/email-decode` basar.
    // JSON `\u0040` geçerlidir; tarayıcı/Google `@` okur, kenar script eklemez.
    .replace(
      /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
      (_, user: string, domain: string) => `${user}\\u0040${domain}`,
    );
}

export function organizationJsonLd(): JsonLdObject {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: YETKIN_BRAND,
    legalName: LEGAL_ENTITY.tradeName,
    alternateName: LEGAL_ENTITY.brandName,
    url: CANONICAL_SITE_ORIGIN,
    additionalType: "https://schema.org/EducationalOrganization",
    logo: {
      "@type": "ImageObject",
      url: canonicalUrl(ORGANIZATION_LOGO_PATH),
    },
    email: LEGAL_ENTITY.supportEmail,
    sameAs: [...ORGANIZATION_SAME_AS],
    address: {
      "@type": "PostalAddress",
      streetAddress: LEGAL_ENTITY.address,
      addressCountry: "TR",
    },
  };
}

export function websiteJsonLd(): JsonLdObject {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: YETKIN_BRAND,
    url: `${CANONICAL_SITE_ORIGIN}/`,
    inLanguage: "tr-TR",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

export function siteGraphJsonLd(): JsonLdDocument {
  return jsonLdDocument([organizationJsonLd(), websiteJsonLd()]);
}

/**
 * SEO Tedavi (P0) — 01_office_ai `teaches` yetkinlik listesi.
 * Antre öğrenim çıktıları (`ACADEMY_LEARNING_OUTCOMES`) ile aynı kapsamı taşır; uydurma yetkinlik yok.
 */
export const OFFICE_AI_COURSE_TEACHES = [
  "Excel veri temizliği",
  "KVKK maskeleme",
  "Yönetim özeti",
  "Sunum hazırlama",
  "Hata avı ve sayı kilitleme",
  "E-posta ritüeli",
  "Gmail aksiyon listesi",
  "Word dilekçe ve rapor",
  "Haftalık verimlilik rutini",
] as const;

export type CourseSyllabusLessonInput = {
  name: string;
  durationMin?: number | null;
};

/**
 * SEO Tedavi (P0) — 01_office_ai müfredat başlıkları (`lesson-index.ts` sırası).
 * Arayan `lessons` verirse o kullanılır (dinamik SSOT); bu liste yalnız yedek düşer.
 * Sıra/başlık kayması `tests/copy/seo-surface.test.ts` ile kilitlidir.
 */
export const OFFICE_AI_SYLLABUS_LESSONS: readonly CourseSyllabusLessonInput[] = [
  { name: "Tablonu Konuştur: Düzensiz Excel → Düzenli Tablo" },
  { name: "KVKK, Şirket Sırları ve Maskeleme: Ne Yüklenmez?" },
  { name: "Rapor Otomasyonu: Tablodan Yönetim Özetine" },
  { name: "Metinden Slayta: Sunum Hazırlama" },
  { name: "İstisnalar & Hata Avı: AI Yanılınca" },
  { name: "E-Posta Akışı: Gelen Kutusu Sıfırlama" },
  { name: "Gmail + Gemini ile Gelen Kutusu ve Aksiyon Listesi" },
  { name: "Word ve Uzun Doküman Analizi: Sözleşme, Dilekçe, Rapor" },
  { name: "Haftalık Sistem: 30 Dakikalık Rutin" },
] as const;

/** Kuruş → schema.org `Offer.price` (ana para birimi). 89000 → "890". */
function minorToOfferPrice(minor: number): string | null {
  if (!Number.isInteger(minor) || minor <= 0) {
    return null;
  }
  if (minor % 100 === 0) {
    return String(minor / 100);
  }
  return (minor / 100).toFixed(2);
}

function minutesToIso8601Duration(totalMin: number): string | null {
  if (!Number.isFinite(totalMin) || totalMin <= 0) {
    return null;
  }
  const rounded = Math.round(totalMin);
  const hours = Math.floor(rounded / 60);
  const minutes = rounded % 60;
  if (hours > 0 && minutes > 0) {
    return `PT${hours}H${minutes}M`;
  }
  if (hours > 0) {
    return `PT${hours}H`;
  }
  return `PT${minutes}M`;
}

const SYLLABUS_MODULE_SIZE = 4;

export function courseJsonLd(input: {
  slug: string;
  title: string;
  description: string;
  imagePath: string;
  datePublished: Date | string;
  /** Verilmezse tohum fiyat haritasından (`ACADEMY_CATALOG_PRICE_MINOR`) çözülür. */
  priceMinor?: number | null;
  priceCurrency?: string | null;
  /** Verilmezse 01_office_ai için `OFFICE_AI_COURSE_TEACHES` düşer. */
  teaches?: readonly string[] | null;
  /** Verilmezse 01_office_ai için `OFFICE_AI_SYLLABUS_LESSONS` düşer. */
  lessons?: readonly CourseSyllabusLessonInput[] | null;
}): JsonLdObject {
  const url = canonicalUrl(`/academy/${input.slug}`);
  const datePublished =
    input.datePublished instanceof Date
      ? input.datePublished.toISOString()
      : input.datePublished;
  const priceMinor = input.priceMinor ?? academyCatalogPriceMinorForSlug(input.slug);
  const price = priceMinor == null ? null : minorToOfferPrice(priceMinor);
  const priceCurrency = input.priceCurrency?.trim() || "TRY";
  const teaches =
    input.teaches ??
    (input.slug === "01_office_ai" ? [...OFFICE_AI_COURSE_TEACHES] : undefined);
  const lessons =
    input.lessons ??
    (input.slug === "01_office_ai" ? OFFICE_AI_SYLLABUS_LESSONS : undefined);
  const totalMin =
    lessons?.reduce(
      (sum, lesson) =>
        sum + (typeof lesson.durationMin === "number" && lesson.durationMin > 0 ? lesson.durationMin : 0),
      0,
    ) ?? 0;
  const timeRequired = totalMin > 0 ? minutesToIso8601Duration(totalMin) : null;
  const syllabusSections =
    lessons && lessons.length > 0
      ? Array.from(
          { length: Math.ceil(lessons.length / SYLLABUS_MODULE_SIZE) },
          (_, moduleIndex) => {
            const group = lessons.slice(
              moduleIndex * SYLLABUS_MODULE_SIZE,
              moduleIndex * SYLLABUS_MODULE_SIZE + SYLLABUS_MODULE_SIZE,
            );
            return {
              "@type": "Syllabus",
              name: `Modül ${moduleIndex + 1}`,
              hasPart: group.map((lesson, groupIndex) => {
                const position = moduleIndex * SYLLABUS_MODULE_SIZE + groupIndex + 1;
                const lessonDuration =
                  typeof lesson.durationMin === "number" && lesson.durationMin > 0
                    ? minutesToIso8601Duration(lesson.durationMin)
                    : null;
                return {
                  "@type": "CreativeWork",
                  position,
                  name: lesson.name,
                  ...(lessonDuration ? { timeRequired: lessonDuration } : {}),
                };
              }),
            };
          },
        )
      : undefined;
  return {
    "@type": "Course",
    "@id": `${url}#course`,
    name: input.title,
    description: input.description,
    url,
    image: canonicalUrl(input.imagePath),
    datePublished,
    inLanguage: "tr",
    ...(teaches && teaches.length > 0 ? { teaches: [...teaches] } : {}),
    ...(timeRequired ? { timeRequired } : {}),
    ...(lessons && lessons.length > 0
      ? {
          hasPart: lessons.map((lesson, index) => ({
            "@type": "CreativeWork",
            position: index + 1,
            name: lesson.name,
          })),
        }
      : {}),
    ...(syllabusSections ? { syllabusSections } : {}),
    educationalCredentialAwarded: {
      "@type": "EducationalOccupationalCredential",
      name:
        input.slug === "01_office_ai"
          ? "yetkin.ai Ofis Yapay Zekâ Sertifikası"
          : `${YETKIN_BRAND} ${input.title} Sertifikası`,
      credentialCategory: "certificate",
      recognizedBy: { "@id": ORGANIZATION_ID },
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Online",
      inLanguage: "tr",
      ...(price
        ? {
            offers: {
              "@type": "Offer",
              price,
              priceCurrency,
              availability: "https://schema.org/InStock",
              url,
            },
          }
        : {}),
    },
    provider: {
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
      name: YETKIN_BRAND,
      url: CANONICAL_SITE_ORIGIN,
    },
  };
}

export function faqPageJsonLd(faqs: readonly { question: string; answer: string }[]): JsonLdObject {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function itemListJsonLd(input: {
  name: string;
  path: string;
  items: readonly { name: string; path: string }[];
}): JsonLdObject {
  return {
    "@type": "ItemList",
    name: input.name,
    url: canonicalUrl(input.path),
    numberOfItems: input.items.length,
    itemListElement: input.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: canonicalUrl(item.path),
    })),
  };
}

export function breadcrumbListJsonLd(crumbs: readonly JsonLdBreadcrumb[]): JsonLdObject {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: canonicalUrl(crumb.path),
    })),
  };
}

export function academyCourseBreadcrumbs(input: {
  slug: string;
  title: string;
}): JsonLdBreadcrumb[] {
  return [
    { name: YETKIN_BRAND, path: "/" },
    { name: PAGE_SEO.academy.title, path: PAGE_SEO.academy.path },
    { name: input.title, path: `/academy/${input.slug}` },
  ];
}

export function legalSectionBreadcrumbs(input: {
  slug: string;
  title: string;
}): JsonLdBreadcrumb[] {
  return [
    { name: YETKIN_BRAND, path: "/" },
    { name: LEGAL_PAGE_TITLE, path: PAGE_SEO.legal.path },
    { name: input.title, path: `/legal/${input.slug}` },
  ];
}
