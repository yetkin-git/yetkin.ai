import "server-only";

import { fetchPublicHomepage, type FetchPublicHomepageDeps } from "@/lib/tezgah/tetkik/fetch-html";
import { inspectTetkikUrl, TetkikAccessError } from "@/lib/tezgah/tetkik/guard";
import { TETKIK_REJECTED_MESSAGE } from "@/lib/tezgah/tetkik/rubric";
import { scoreHomepageHtml, topOpenTetkikGaps } from "@/lib/tezgah/tetkik/score";

export type B2bTetkikMeasure =
  | {
      ok: true;
      score: number;
      url: string;
      disclaimer: string;
      gaps: { label: string; detail: string }[];
    }
  | { ok: false; error: string };

/**
 * Herkese açık ana sayfayı tetkik çekirdeğinden geçirir.
 * LLM anlatımı ve tezgah kotası burada yoktur. Skor kodda kalır.
 */
export async function measurePublicTetkik(
  url: string,
  deps: FetchPublicHomepageDeps = {},
): Promise<B2bTetkikMeasure> {
  const inspected = inspectTetkikUrl(url);
  if (!inspected.ok) {
    return { ok: false, error: TETKIK_REJECTED_MESSAGE };
  }
  try {
    const page = await fetchPublicHomepage(inspected.url, deps);
    const scored = scoreHomepageHtml(page.html, {
      https: page.finalUrl.startsWith("https:"),
      ttfbMs: page.ttfbMs,
      htmlBytes: page.htmlBytes,
    });
    return {
      ok: true,
      score: scored.score,
      url: page.finalUrl,
      disclaimer: scored.disclaimer,
      gaps: topOpenTetkikGaps(scored.checks, 2).map((gap) => ({
        label: gap.label,
        detail: gap.opportunity || gap.detail || gap.label,
      })),
    };
  } catch (error) {
    if (error instanceof TetkikAccessError && error.kind === "rejected") {
      return { ok: false, error: TETKIK_REJECTED_MESSAGE };
    }
    return { ok: false, error: "Site okunamadı. Skor uydurulmadı." };
  }
}
