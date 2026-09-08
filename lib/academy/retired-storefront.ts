/**
 * Yayından kalkan Akademi URL'leri — vitrin 5 compact SKU; eski slug kataloga 301.
 * Lisans / mühür satırı silinmez; yeni satış ve vitrin kapanır.
 *
 * next.config bu modülü import eder: sunucu-only / Prisma / `@/` yok.
 */

import { ACADEMY_CANON_SKU_SLUGS } from "../kernel/catalog-ids/course-slugs";

/** Vitrin beşlisi — `ACADEMY_GROWTH_SKU_SLUGS` ile testte kilitlenir; next.config yaprak kalsın. */
const ACADEMY_VITRINE_SLUGS = [
  "01_office_ai",
  "02_ecommerce_ai",
  "03_social_media_ai",
  "04_chatbot_nocode",
  "05_prompt_practice",
] as const;

/** Katalog biriminden (`course:python-temel`) türetilen eski vitrin slug'ları. */
const ACADEMY_LEGACY_UNIT_SLUGS = [
  "rail-temel",
  "rayli-sinyal-emniyet",
  "yz-icerik-gorsel-uretim",
  "ileri-prompt-muhendisligi",
  "bim-iso-19650",
  "siber-guvenlik-kvkk-iso-27001",
  "python-veri-analizi-is-zekasi",
  "kurumsal-esg-surdurulebilirlik",
  "agile-scrum-masterlik",
  "bulut-mimarisi-devops",
  "ui-ux-design-systems",
  "fintek-acik-bankacilik",
  "ai-orta",
  "ai-ileri",
  "devops-temel",
  "devops-orta",
  "devops-ileri",
  "flutter-temel",
  "flutter-orta",
  "flutter-ileri",
  "ds-temel",
  "ds-orta",
  "ds-ileri",
  "sec-temel",
  "sec-orta",
  "sec-ileri",
  "db-temel",
  "db-orta",
  "db-ileri",
  "arch-temel",
  "arch-orta",
  "arch-ileri",
  "pm-temel",
  "pm-orta",
  "pm-ileri",
  "ux-orta",
  "ux-ileri",
  "w3-temel",
  "w3-orta",
  "w3-ileri",
  "ex-temel",
  "ex-orta",
  "ex-ileri",
  "mkt-temel",
  "mkt-orta",
  "mkt-ileri",
  "mnt-temel",
  "mnt-orta",
  "mnt-ileri",
  "pd-temel",
  "pd-orta",
  "pd-ileri",
  "cld-temel",
  "cld-orta",
  "cld-ileri",
  "eng-temel",
  "eng-orta",
  "eng-ileri",
  "qa-temel",
  "qa-orta",
  "qa-ileri",
  "jav-temel",
  "jav-orta",
  "jav-ileri",
  "rn-temel",
  "rn-orta",
  "rn-ileri",
  "gam-temel",
  "gam-orta",
  "gam-ileri",
  "mlo-temel",
  "sys-temel",
  "canva-temel",
  "pra-temel",
  "linkedin-temel",
  "cad-temel",
  "security-temel",
  "security-orta",
  "security-ileri",
  "ai-agent-temel",
  "ai-agent-orta",
  "ai-agent-ileri",
  "python-temel",
  "python-orta",
  "python-ileri",
  "fullstack-temel",
  "fullstack-orta",
  "fullstack-ileri",
  "ai-temel",
  "ux-temel",
  "excel-masterclass",
  "google-ads-masterclass",
  "meta-ads-masterclass",
  "eticaret-masterclass",
  "canva-masterclass",
  "linkedin-masterclass",
  "production-rag-graphrag",
] as const;

/** Canlı vitrinde görülen ek alias — birim anahtarıyla birebir değil. */
const ACADEMY_RETIRED_ALIAS_SLUGS = ["siber-guvenlik"] as const;

const UNPUBLISHED_CANON_SLUGS = ACADEMY_CANON_SKU_SLUGS.filter(
  (slug) => !(ACADEMY_VITRINE_SLUGS as readonly string[]).includes(slug),
);

export const ACADEMY_RETIRED_STOREFRONT_SLUGS: readonly string[] = [
  ...new Set<string>([
    ...ACADEMY_LEGACY_UNIT_SLUGS,
    ...ACADEMY_RETIRED_ALIAS_SLUGS,
    ...UNPUBLISHED_CANON_SLUGS,
  ]),
];

/** BFF 410 — tarayıcı 301 ile kataloga gider; API satış yüzeyi Gone basar. */
export const ACADEMY_RETIRED_COURSE_GONE_MESSAGE =
  "Bu eğitim yayından kalktı. Güncel katalog /academy adresindedir.";

export function isAcademyRetiredStorefrontSlug(slug: string): boolean {
  return ACADEMY_RETIRED_STOREFRONT_SLUGS.includes(slug);
}

export type AcademyRetiredRedirect = {
  source: string;
  destination: "/academy";
  statusCode: 301;
};

/** Eski antre + oynatıcı + `/academy/courses/` alias — 301 katalog. 410 API katmanındadır. */
export function academyRetiredStorefrontRedirects(): AcademyRetiredRedirect[] {
  return ACADEMY_RETIRED_STOREFRONT_SLUGS.flatMap((slug) => [
    { source: `/academy/${slug}`, destination: "/academy", statusCode: 301 },
    { source: `/academy/${slug}/oyna`, destination: "/academy", statusCode: 301 },
    { source: `/academy/courses/${slug}`, destination: "/academy", statusCode: 301 },
  ]);
}

/** Tohum birim listesi ile 301 haritası sapmasın diye test okur. */
export const ACADEMY_LEGACY_UNIT_SLUGS_FOR_TEST = ACADEMY_LEGACY_UNIT_SLUGS;
export const ACADEMY_VITRINE_SLUGS_FOR_TEST = ACADEMY_VITRINE_SLUGS;
