import { KurumsalRoadmapCards } from "@/components/kurumsal/roadmap-cards";
import { KurumsalScreeningCockpit } from "@/components/kurumsal/screening-cockpit";
import type { KurumsalOfferQuote } from "@/lib/sales/kurumsal-offers";
import type { KurumsalSkillCatalog, OwnerJobView } from "@/lib/sales/kurumsal-screening";
import type { BridgeKaynak } from "@/lib/kernel/contextual-bridge-params";

export function KurumsalOpsDeck({
  jobs,
  skills,
  boardUnavailable,
  signedIn,
  loginHref,
  screeningPrice,
  offerHref,
  initialTitle = "",
  bridgeCameFrom = null,
}: {
  jobs: OwnerJobView[];
  skills: KurumsalSkillCatalog;
  boardUnavailable: boolean;
  signedIn: boolean;
  loginHref: string;
  screeningPrice: KurumsalOfferQuote;
  offerHref: string;
  initialTitle?: string;
  bridgeCameFrom?: BridgeKaynak | null;
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
        bridgeCameFrom={bridgeCameFrom}
      />
      <KurumsalRoadmapCards offerHref={offerHref} />
    </div>
  );
}
