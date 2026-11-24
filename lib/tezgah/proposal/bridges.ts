import type { Route } from "next";

/** YetkinCV mühür yüzeyi — teklif kanıtı buraya taşınır. */
export const PROPOSAL_YETKINCV_HREF = "/career#yetkincv" as const;

/** Hibe analizi ekranı; `ad` alanına kısa proje fikri ön-dolgusu. */
export function proposalHibeAnalysisHref(input: {
  expertise: string;
  jobPost: string;
}): Route {
  const title = (input.expertise.trim() || "Proje teklifi").slice(0, 80);
  const idea = input.jobPost.trim().slice(0, 120);
  const params = new URLSearchParams({
    sekme: "analiz",
    ad: idea ? `${title} — ${idea}`.slice(0, 80) : title,
  });
  return `/panel/hibe?${params.toString()}` as Route;
}
