/**
 * Aşama 3 SEO — schema.org JSON-LD grafikleri.
 * Kanonik kök `CANONICAL_SITE_ORIGIN`. Uydurma sosyal profil yazılmaz.
 *
 * SEO Tedavi (P0): kurs şeması halkası (`courseJsonLd`,
 * `educationalOccupationalProgramJsonLd`, `academyCourseBreadcrumbs`,
 * `academyCourseTeachesForSlug`, `academyOccupationalCategory`, `OFFICE_AI_*_COURSE_TEACHES`)
 * KALDIRILDI. Bu 450+ satırın hiçbir üretim ithalatçısı yoktu: `/academy/[slug]`
 * sayfası arşivde ve `/academy` kenarda 410. Kalan canlı şema: Organization,
 * WebSite, FAQPage, ItemList, BreadcrumbList, Article ve Junior Course.
 */

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
 * Junior kamu dersi. Akademi sertifikası yazılmaz.
 * Ücretsiz ilk konu `price: 0` teklifi taşır. Yıllık paket tutarı burada uydurulmaz.
 */
export function juniorOnlineCourseJsonLd(input: {
  name: string;
  description: string;
  path: string;
  subject?: string;
  imagePath?: string | null;
  isAccessibleForFree: boolean;
}): JsonLdObject {
  const url = canonicalUrl(input.path);
  return {
    "@type": "Course",
    "@id": `${url}#course`,
    name: input.name,
    description: input.description,
    url,
    inLanguage: "tr",
    educationalLevel: "6. Sınıf",
    isAccessibleForFree: input.isAccessibleForFree,
    ...(input.subject ? { about: input.subject } : {}),
    ...(input.imagePath ? { image: canonicalUrl(input.imagePath) } : {}),
    provider: {
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
      name: YETKIN_BRAND,
      url: CANONICAL_SITE_ORIGIN,
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Online",
      inLanguage: "tr",
      ...(input.isAccessibleForFree
        ? {
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "TRY",
              availability: "https://schema.org/InStock",
              category: "Free",
              url,
            },
          }
        : {}),
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

/** Kamuya açık rehber. Konsol ve yönlendirme yolları bu grafa girmez. */
export function guideArticleJsonLd(input: {
  headline: string;
  description: string;
  path: string;
}): JsonLdObject {
  return {
    "@type": "Article",
    "@id": `${canonicalUrl(input.path)}#article`,
    headline: input.headline,
    description: input.description,
    inLanguage: "tr-TR",
    mainEntityOfPage: canonicalUrl(input.path),
    url: canonicalUrl(input.path),
    datePublished: "2026-11-04",
    dateModified: "2026-11-04",
    author: { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
    isAccessibleForFree: true,
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
