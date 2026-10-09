import type { Metadata } from "next";
import { JuniorRoom } from "@/components/junior/junior-room";
import { JsonLd } from "@/components/seo/json-ld";
import { LandingFaq } from "@/components/seo/landing-faq";
import { RoomFrame } from "@/components/ui/page-header";
import { PAGE_SEO, pageMetadata } from "@/lib/copy/seo";
import { JUNIOR_LANDING_FAQ, juniorLandingJsonLd } from "@/lib/junior/seo";
import { buildCitizenLoginHref } from "@/lib/kernel/auth/redirects";
import { getSession } from "@/lib/kernel/auth/session";
import { isJuniorAuditActor } from "@/lib/kernel/security/junior-gate";
import { carryJuniorLessonStatus } from "@/lib/junior/chain";
import {
  juniorElectivePicks,
  juniorPersonalizedShelves,
  juniorShelvesForGrade,
  stampJuniorPlanAccess,
} from "@/lib/junior/catalog";
import { JUNIOR_ELECTIVE_SLUGS, JUNIOR_PILOT_GRADE } from "@/lib/junior/limits";
import { loadJuniorHome } from "@/lib/junior/load";
import { readJuniorYearlyPrice } from "@/lib/junior/price";

export const dynamic = "force-dynamic";

export const metadata: Metadata = pageMetadata({
  title: PAGE_SEO.junior.title,
  description: PAGE_SEO.junior.description,
  path: PAGE_SEO.junior.path,
  image: PAGE_SEO.junior.image,
  keywords: PAGE_SEO.junior.keywords,
});

export default async function JuniorHomePage({
  searchParams,
}: {
  searchParams: Promise<{ paket?: string }>;
}) {
  const session = await getSession();
  const query = await searchParams;
  const actor = session
    ? { id: session.id, email: session.email, emailConfirmedAt: session.emailConfirmedAt ?? null }
    : null;
  const audit = isJuniorAuditActor(actor);
  const home = session ? await loadJuniorHome(session.id) : null;
  const planActive = home?.plan.status === "ACTIVE";
  const roomGrade = home?.selected?.grade ?? JUNIOR_PILOT_GRADE;
  const selectedElectives = home?.selected?.selectedElectives ?? [];
  const shelfPlan = audit
    ? { active: true, selectedElectives: [...JUNIOR_ELECTIVE_SLUGS] }
    : { active: planActive, selectedElectives };
  const stamped = home?.courses ?? [];
  const listedBase = audit
    ? stampJuniorPlanAccess(juniorShelvesForGrade(roomGrade, null), shelfPlan)
    : (home?.courses ?? juniorPersonalizedShelves(null));
  const listed = carryJuniorLessonStatus(listedBase, stamped);
  const electiveCourses = carryJuniorLessonStatus(
    stampJuniorPlanAccess(
      juniorShelvesForGrade(roomGrade, null).filter((course) => course.track === "elective"),
      shelfPlan,
    ),
    stamped,
  );
  const priceLabel = await readJuniorYearlyPrice()
    .then((price) => price?.label ?? null)
    .catch(() => null);

  return (
    <RoomFrame className="space-y-2">
      <JsonLd data={juniorLandingJsonLd()} />
      <JuniorRoom
        courses={listed}
        electiveCourses={electiveCourses}
        loginHref={buildCitizenLoginHref("/junior")}
        planOpened={query.paket === "acik"}
        notice={home?.notice ?? null}
        checkoutHref={session ? "/junior/checkout" : buildCitizenLoginHref("/junior/checkout")}
        planActive={planActive}
        profiles={home?.profiles ?? null}
        xp={home?.xp ?? null}
        ready={home?.ready ?? false}
        gradeSwitchRights={
          home?.selected
            ? Math.min(home.selected.gradeSwitchRights, home.plan.gradeSwitchRights)
            : 0
        }
        selectedElectives={selectedElectives}
        weeklyReport={home?.weeklyReport ?? null}
        picks={juniorElectivePicks()}
        priceLabel={priceLabel}
        audit={audit}
      />
      <LandingFaq heading="Sık sorulanlar" items={JUNIOR_LANDING_FAQ} />
    </RoomFrame>
  );
}
