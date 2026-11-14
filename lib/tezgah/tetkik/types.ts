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
  narrative: string;
};

export type ParsedHomepage = {
  title: string;
  metaDescription: string;
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
