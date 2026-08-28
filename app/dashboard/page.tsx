import { FreelancerPulseWidget } from "@/components/dashboard/freelancer-pulse-widget";
import { AcademyPulseWidget } from "@/components/dashboard/academy-pulse-widget";
import { CareerPulseWidget } from "@/components/dashboard/career-pulse-widget";
import { NextBestActionCard } from "@/components/dashboard/next-best-action-card";
import { DashboardPulseProvider } from "@/components/dashboard/dashboard-pulse-provider";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { emptyDashboardPulse, loadDashboardPulse } from "@/app/api/dashboard/pulse/load";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { getSession } from "@/lib/kernel/auth/session";
import { loadIdentityBoard } from "@/lib/kernel/identity/load";

export default async function DashboardPage() {
  const copy = SEN_VOICE.dashboard;
  const session = await getSession();
  const [board, pulse] = session
    ? await Promise.all([
        loadIdentityBoard(session.id),
        loadDashboardPulse(session.id).catch(() => emptyDashboardPulse()),
      ])
    : [null, emptyDashboardPulse()];
  const title = copy.welcomeTitle({
    signedIn: Boolean(session),
    displayName: board?.user?.displayName,
  });

  return (
    <DashboardPulseProvider initialPulse={pulse}>
      <RoomFrame>
        <div className="space-y-3">
          <PageHeader compact eyebrow={copy.eyebrow} title={title} />
          <NextBestActionCard />
        </div>
        <div className="grid min-w-0 items-stretch gap-4 lg:grid-cols-3">
          <AcademyPulseWidget />
          <CareerPulseWidget />
          <FreelancerPulseWidget />
        </div>
      </RoomFrame>
    </DashboardPulseProvider>
  );
}
