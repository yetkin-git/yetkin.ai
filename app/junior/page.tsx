import { JuniorRoom } from "@/components/junior/junior-room";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { buildCitizenLoginHref } from "@/lib/kernel/auth/redirects";
import { getSession } from "@/lib/kernel/auth/session";
import {
  juniorElectivePicks,
  juniorPersonalizedShelves,
  juniorShelvesForGrade,
  stampJuniorPlanAccess,
} from "@/lib/junior/catalog";
import { JUNIOR_PILOT_GRADE, JUNIOR_PILOT_SHELF_LINE } from "@/lib/junior/limits";
import { loadJuniorHome } from "@/lib/junior/load";
import { juniorSchoolWeek } from "@/lib/junior/week";

export const dynamic = "force-dynamic";

export default async function JuniorHomePage({
  searchParams,
}: {
  searchParams: Promise<{ paket?: string }>;
}) {
  const session = await getSession();
  const query = await searchParams;
  const home = session ? await loadJuniorHome(session.id) : null;
  const listed = home?.courses ?? juniorPersonalizedShelves(null);
  const planActive = home?.plan.status === "ACTIVE";
  const roomGrade = home?.selected?.grade ?? JUNIOR_PILOT_GRADE;
  const selectedElectives = home?.selected?.selectedElectives ?? [];
  const electiveCourses = stampJuniorPlanAccess(
    juniorShelvesForGrade(roomGrade, null).filter((course) => course.track === "elective"),
    { active: planActive, selectedElectives },
  );

  return (
    <RoomFrame className="space-y-4">
      <PageHeader
        tight
        eyebrow="Junior"
        title="Dersler"
        description="Matematik, Fen Bilimleri, Türkçe ve Ana İngilizce. Her dersin ilk konusu ücretsizdir."
      />
      <p className="text-sm leading-6 text-[var(--muted)]">{JUNIOR_PILOT_SHELF_LINE}</p>
      {query.paket === "acik" ? (
        <p className="text-sm leading-6">Yıllık paket açıldı. Kilitli çekirdek dersler hazır.</p>
      ) : null}
      {home?.notice ? <p className="text-sm text-[var(--rose)]">{home.notice}</p> : null}
      <JuniorRoom
        courses={listed}
        electiveCourses={electiveCourses}
        schoolWeek={juniorSchoolWeek()}
        loginHref={buildCitizenLoginHref("/junior")}
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
      />
    </RoomFrame>
  );
}
