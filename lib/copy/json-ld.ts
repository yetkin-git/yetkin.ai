/**
 * Aşama 3 SEO — schema.org JSON-LD grafikleri.
 * Kanonik kök `CANONICAL_SITE_ORIGIN`. Uydurma sosyal profil yazılmaz.
 */

import { YETKIN_BRAND } from "@/lib/copy/brand";
import { LEGAL_ENTITY, LEGAL_PAGE_TITLE, LEGAL_WHATSAPP_HREF } from "@/lib/copy/legal-launch";
import { CANONICAL_SITE_ORIGIN, PAGE_SEO, canonicalUrl } from "@/lib/copy/seo";

export const ORGANIZATION_ID = `${CANONICAL_SITE_ORIGIN}/#organization` as const;
export const WEBSITE_ID = `${CANONICAL_SITE_ORIGIN}/#website` as const;

/** Kamu marka mührü — `public/icon.svg` sabit yol. */
export const ORGANIZATION_LOGO_PATH = "/icon.svg" as const;

/** Akademi katalog araması — Google sitelinks arama kutusu hedefi. */
export const SITE_SEARCH_URL_TEMPLATE =
  `${CANONICAL_SITE_ORIGIN}/academy?q={search_term_string}` as const;

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
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function organizationJsonLd(): JsonLdObject {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: YETKIN_BRAND,
    legalName: LEGAL_ENTITY.tradeName,
    alternateName: LEGAL_ENTITY.brandName,
    url: CANONICAL_SITE_ORIGIN,
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
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: SITE_SEARCH_URL_TEMPLATE,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function siteGraphJsonLd(): JsonLdDocument {
  return jsonLdDocument([organizationJsonLd(), websiteJsonLd()]);
}

export function courseJsonLd(input: {
  slug: string;
  title: string;
  description: string;
  imagePath: string;
  datePublished: Date | string;
}): JsonLdObject {
  const url = canonicalUrl(`/academy/${input.slug}`);
  const datePublished =
    input.datePublished instanceof Date
      ? input.datePublished.toISOString()
      : input.datePublished;
  return {
    "@type": "Course",
    "@id": `${url}#course`,
    name: input.title,
    description: input.description,
    url,
    image: canonicalUrl(input.imagePath),
    datePublished,
    inLanguage: "tr",
    provider: {
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
      name: YETKIN_BRAND,
      url: CANONICAL_SITE_ORIGIN,
    },
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
