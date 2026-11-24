import type { TetkikAnalysisCard } from "@/lib/tezgah/tetkik/analysis";
import type { TetkikCheckId } from "@/lib/tezgah/tetkik/rubric";

export type TetkikCheck = {
  id: TetkikCheckId;
  label: string;
  earned: number;
  weight: number;
  passed: boolean;
  detail: string;
  opportunity: string;
};

export type TetkikActionStage = "shop" | "ads" | "ready";

export type TetkikAction = {
  stage: TetkikActionStage;
  title: string;
  body: string;
};

export type TetkikTechSeoStatus = "found" | "missing" | "unchecked";

export type TetkikTechSeoSignal = {
  id: "robotsTxt" | "sitemapXml";
  label: string;
  status: TetkikTechSeoStatus;
  detail: string;
};

/** Modele verilen temiz metin parçası. Ham HTML değildir. */
export type TetkikPageSnippet = {
  title: string;
  metaDescription: string;
  h1: string;
  ctaTexts: string[];
};

export type TetkikReport = {
  tool: "tetkik";
  score: number;
  maxScore: 100;
  disclaimer: string;
  measuredAt: string;
  url: string;
  businessName: string;
  freelancerName: string;
  agencyName: string | null;
  pageTitle: string;
  ttfbMs: number;
  htmlBytes: number;
  checks: TetkikCheck[];
  opportunities: string[];
  action: TetkikAction;
  /** robots.txt / sitemap.xml — ana 100 puana ek teknik SEO sinyali. */
  techSeo?: TetkikTechSeoSignal[];
  /** Taranan sayfadan çıkarılan güvenli metin parçası. */
  pageSnippet?: TetkikPageSnippet;
  /** Eski düz metin kayıtları ve kopyala yolu için özet. */
  narrative: string;
  /** Hydrogen yönetici karnesi; eski kayıtlarda yok olabilir. */
  analysis?: TetkikAnalysisCard | null;
};

export type ParsedHomepage = {
  title: string;
  metaDescription: string;
  /** İlk H1'in görünür metni (yoksa boş). */
  h1Text: string;
  /** Tespit edilen CTA bağlantı/düğme metinleri (kırpılmış, en çok 6). */
  ctaTexts: string[];
  headingLevels: number[];
  viewport: string;
  lang: string;
  whatsapp: boolean;
  phone: boolean;
  email: boolean;
  form: boolean;
  cta: boolean;
  images: { hasAlt: boolean }[];
  canonical: string;
  robots: string;
  openGraph: boolean;
};
