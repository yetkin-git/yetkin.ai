import type { ReklamBudgetSplit, ReklamVariantId } from "@/lib/tezgah/reklam/copy";

export type ReklamVariantPack = {
  id: ReklamVariantId;
  angle: string;
  heading: string;
  googleHeadlines: [string, string, string];
  googleDescriptions: [string, string];
  metaHeadline: string;
  metaPrimary: string;
  keywords: string[];
  negatives: string[];
  frame: string;
  overlay: string;
  hidden: string;
};

export type ReklamPackage = {
  businessName: string;
  place: string;
  sectorLabel: string;
  aimCta: string;
  interests: string;
  offer: string;
  budget: ReklamBudgetSplit;
  variants: [ReklamVariantPack, ReklamVariantPack, ReklamVariantPack];
  disclaimer: string;
};
