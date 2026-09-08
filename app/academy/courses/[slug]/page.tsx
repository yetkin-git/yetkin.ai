import { permanentRedirect } from "next/navigation";
import { isAcademyGrowthSkuSlug } from "@/lib/academy/pilot-sku";
import { isAcademyRetiredStorefrontSlug } from "@/lib/academy/retired-storefront";

/**
 * Eski alias — kanonik antre `/academy/[slug]`.
 * HTTP 301 `next.config.ts` redirects'tedir; bu sayfa belge isteği kaçarsa
 * App Router kalıcı yönlendirmesiyle duplicate içerik basmaz.
 * Yayından kalkan slug kataloga gider; eski antreye ikinci hop yok.
 */
export default async function AcademyCoursesAliasPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (isAcademyRetiredStorefrontSlug(slug) || !isAcademyGrowthSkuSlug(slug)) {
    permanentRedirect("/academy");
  }
  permanentRedirect(`/academy/${slug}`);
}
