import { KurumsalRoadmapCards } from "@/components/kurumsal/roadmap-cards";
import { KurumsalScreeningCockpit } from "@/components/kurumsal/screening-cockpit";
import type { KurumsalOfferQuote } from "@/lib/sales/kurumsal-offers";
import type { KurumsalSkillCatalog, OwnerJobView } from "@/lib/sales/kurumsal-screening";

export function KurumsalOpsDeck({
  jobs,
  skills,
  boardUnavailable,
  signedIn,
  loginHref,
  screeningPrice,
  offerHref,
  initialTitle = "",
}: {
  jobs: OwnerJobView[];
  skills: KurumsalSkillCatalog;
  boardUnavailable: boolean;
  signedIn: boolean;
  loginHref: string;
  screeningPrice: KurumsalOfferQuote;
  offerHref: string;
  initialTitle?: string;
}) {
  return (
    <div className="grid items-start gap-4 xl:grid-cols-3" data-kurumsal-ops="center">
      <KurumsalScreeningCockpit
        jobs={jobs}
        skills={skills}
        boardUnavailable={boardUnavailable}
        signedIn={signedIn}
        loginHref={loginHref}
        screeningPrice={screeningPrice}
        initialTitle={initialTitle}
      />
      <KurumsalRoadmapCards offerHref={offerHref} />
    </div>
  );
}
