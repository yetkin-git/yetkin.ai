import { ProofList } from "@/components/career/proof-list";
import type { CareerPortfolioItemRecord, CareerVisaStampRecord } from "@/lib/career/types";

/** Geriye dönük ad — kanıt kartı `ProofList`. */
export function VisaList({
  stamps,
  items = [],
  showcase = false,
}: {
  stamps: CareerVisaStampRecord[];
  items?: CareerPortfolioItemRecord[];
  showcase?: boolean;
}) {
  return <ProofList stamps={stamps} items={items} showcase={showcase} />;
}
