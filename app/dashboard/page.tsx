import { WalletBalanceStrip } from "@/components/dashboard/wallet-balance-strip";
import { FreelancerPulseWidget } from "@/components/dashboard/freelancer-pulse-widget";
import { AcademyPulseWidget } from "@/components/dashboard/academy-pulse-widget";
import { CareerPulseWidget } from "@/components/dashboard/career-pulse-widget";
import { StudioPulseWidget } from "@/components/dashboard/studio-pulse-widget";
import { KurumsalPulseWidget } from "@/components/dashboard/kurumsal-pulse-widget";
import { ArenaPulseWidget } from "@/components/dashboard/arena-pulse-widget";
import { DevlabsPulseWidget } from "@/components/dashboard/devlabs-pulse-widget";
import { PazaryeriPulseWidget } from "@/components/dashboard/pazaryeri-pulse-widget";
import { HibePulseWidget } from "@/components/dashboard/hibe-pulse-widget";
import { JuniorPulseWidget } from "@/components/dashboard/junior-pulse-widget";
import { SocialPulseWidget } from "@/components/dashboard/social-pulse-widget";
import { ModuleRibbon } from "@/components/dashboard/module-ribbon";
import { DashboardPulseProvider } from "@/components/dashboard/dashboard-pulse-provider";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export default function DashboardPage() {
  const copy = SEN_VOICE.dashboard;
  return (
    <DashboardPulseProvider>
      <RoomFrame>
        <PageHeader
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
        />
        <Card variant="featured">{copy.featured}</Card>
        <ModuleRibbon />
        <WalletBalanceStrip />
        <div className="grid gap-4 lg:grid-cols-2">
          <FreelancerPulseWidget />
          <AcademyPulseWidget />
          <CareerPulseWidget />
          <StudioPulseWidget />
          <KurumsalPulseWidget />
          <ArenaPulseWidget />
          <DevlabsPulseWidget />
          <PazaryeriPulseWidget />
          <HibePulseWidget />
          <JuniorPulseWidget />
          <SocialPulseWidget />
        </div>
      </RoomFrame>
    </DashboardPulseProvider>
  );
}
