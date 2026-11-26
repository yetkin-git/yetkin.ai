import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { isKurumsalJobOpen, isKurumsalJobSlug } from "@/lib/sales/kurumsal-screening";

/**
 * `/ilan/[slug]` varlık kapısı — gerçek HTTP 404 (F1.4 / Y-05).
 *
 * **Neden burada.** Next 16'da sayfa gövdesi kök `app/loading.tsx` Suspense
 * sınırının altında akar; `notFound()` çağrılsa bile durum kodu **200** kalır
 * (ölçüldü: `GET /ilan/uydurma-slayt` → 200 + `noindex`). Yani sayfadaki
 * `notFound()` yalnız gövdeyi değiştirir, sözleşmeyi değiştirmez. Durum kodunu
 * ancak akış başlamadan `proxy` kesebilir.
 *
 * **Neden biçim kapısı yetmez.** `missingPublicSurfacePath` yalnız *adres biçimini*
 * doğrular; biçimi geçerli ama kapalı/süresi dolmuş/var olmayan ilan oraya takılmaz.
 * İlan varlığı kamuya açık bir bilgidir (dizin sayfası zaten listeler), bu yüzden
 * varlık sorgusu gizlilik sızdırmaz.
 *
 * **Fail-open.** Veritabanı okunamazsa `"unknown"` döner ve istek sayfaya düşer;
 * sayfa dürüst "okunamadı" gövdesini basar. Canlı bir ilanı yanlışlıkla 404'e
 * düşürüp arama motorundan silmek, geçici bir DB arızasından daha pahalıdır.
 */

/** `/ilan/<slug>` — tek segment, sondaki eğik çizgi hoş görülür. */
export const KURUMSAL_JOB_EDGE_PATH_RE = /^\/ilan\/([^/]+)\/?$/;

export type KurumsalJobEdgeVerdict = "pass" | "missing" | "unknown";

export function kurumsalJobSlugFromPath(pathname: string): string | null {
  const match = KURUMSAL_JOB_EDGE_PATH_RE.exec(pathname);
  if (!match) {
    return null;
  }
  const raw = match[1] ?? "";
  if (!raw) {
    return null;
  }
  try {
    return decodeURIComponent(raw);
  } catch {
    return "";
  }
}

export async function resolveKurumsalJobEdgeVerdict(
  slug: string,
  now: Date = new Date(),
): Promise<KurumsalJobEdgeVerdict> {
  // Biçim geçersizse adres hiç var olmamıştır: DB'ye gitmeden 404.
  if (!isKurumsalJobSlug(slug)) {
    return "missing";
  }
  try {
    const job = await getPrisma().kurumsalJobPosting.findUnique({
      where: { slug },
      select: { isActive: true, deadlineAt: true },
    });
    if (!job) {
      return "missing";
    }
    return isKurumsalJobOpen(job, now) ? "pass" : "missing";
  } catch {
    return "unknown";
  }
}
