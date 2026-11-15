import { PublicHomePanel } from "@/components/dashboard/public-home-panel";
import { CommandCenter } from "@/components/dashboard/command-center";
import { NextBestActionCard } from "@/components/dashboard/next-best-action-card";
import { DashboardPulseProvider } from "@/components/dashboard/dashboard-pulse-provider";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { emptyDashboardPulse, loadDashboardPulse } from "@/app/api/dashboard/pulse/load";
import { assembleSignedInCommand, readMemberTezgahQuota } from "@/app/dashboard/load-command";
import { loadOwnerStores } from "@/lib/commerce/cockpit-load";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { getSession, requirePageSession } from "@/lib/kernel/auth/session";
import { loadIdentityBoard } from "@/lib/kernel/identity/load";

/** RSC nabız+kimlik; Hobby 10s tavanı bağlar. */
export const maxDuration = 15;

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    return <PublicHomePanel />;
  }
  return <SignedInDashboard />;
}

async function SignedInDashboard() {
  const copy = SEN_VOICE.dashboard;
  const session = await requirePageSession();
  const [board, pulse, stores, quota] = await Promise.all([
    loadIdentityBoard(session.id),
    loadDashboardPulse(session.id).catch(() => emptyDashboardPulse()),
    loadOwnerStores(session.id).catch(() => ({ kind: "down" as const })),
    readMemberTezgahQuota(session.id),
  ]);
  const command = assembleSignedInCommand({ pulse, stores, quota });
  const title = copy.welcomeTitle({
    signedIn: true,
    displayName: board?.user?.displayName,
  });

  return (
    <DashboardPulseProvider initialPulse={command.pulse}>
      <RoomFrame>
        <div className="space-y-3">
          <PageHeader compact eyebrow={copy.eyebrow} title={title} description={copy.welcomeLead} />
          <NextBestActionCard />
        </div>
        <CommandCenter model={command.model} />
      </RoomFrame>
    </DashboardPulseProvider>
  );
}
