import Link from "next/link";
import { Card } from "@/components/ui/card";
import { GeneratePanel } from "@/components/studio/generate-panel";
import { ImageGeneratePanel } from "@/components/studio/image-generate-panel";
import { DraftHistory } from "@/components/studio/draft-history";
import { StudioWorkbench } from "@/components/studio/studio-workbench";
import { TokenBalanceCard } from "@/components/studio/token-balance";
import { MediaDraftCards } from "@/components/studio/media-draft-cards";
import { LlmDebitSteps } from "@/components/studio/llm-debit-steps";
import { StudioDebitProvider } from "@/components/studio/studio-debit-context";
import { loadStudioBoard, loadStudioCitizenDesk } from "@/lib/studio/load";
import { getCitizenAuth, getSession } from "@/lib/kernel/auth/session";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { StatGrid } from "@/components/ui/stat-grid";
import { AuthNeeded } from "@/components/ui/auth-needed";
import { Badge } from "@/components/ui/badge";
import { IconSpark, IconBolt, IconCoin } from "@/components/ui/icons";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { EMPTY_WALLET_STRIP } from "@/lib/dashboard/wallet-strip";

export default async function StudioPage() {
  const auth = await getCitizenAuth();
  const session = auth ?? (await getSession());
  const [board, desk] = session
    ? await Promise.all([loadStudioBoard(session.id, auth?.accessToken), loadStudioCitizenDesk(session.id)])
    : [null, null];
  const drafts = board?.drafts.length ?? 0;
  const generations = board?.generations.length ?? 0;
  const copy = SEN_VOICE.studio.catalog;
  const stats = SEN_VOICE.studio.stats;

  return (
    <RoomFrame>
      <PageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
      <StatGrid
        columns={3}
        items={[
          { label: stats.draftLabel, value: drafts, icon: <IconSpark /> },
          { label: stats.generationLabel, value: generations, icon: <IconBolt /> },
          {
            label: stats.debitLabel,
            value: stats.debitValue,
            hint: stats.debitHint,
            icon: <IconCoin />,
          },
        ]}
      />
      <LlmDebitSteps />
      {!session ? (
        <AuthNeeded message={copy.auth} />
      ) : (
        <StudioDebitProvider
          initialStrip={desk?.strip ?? EMPTY_WALLET_STRIP}
          textFloorMinor={desk?.textFloorMinor ?? null}
          imageFloorMinor={desk?.imageFloorMinor ?? null}
        >
          {board === null ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(16rem,0.9fr)] lg:items-start">
              <Card variant="featured" className="lg:col-span-1" title={copy.textBench}>
                <Badge tone="amber">{copy.unbound}</Badge>
                <p className="mt-3">{copy.unboundBody}</p>
                <div className="mt-4">
                  <GeneratePanel />
                </div>
                <div className="mt-6">
                  <p className="mb-2 text-sm font-semibold">{copy.imageBenchLabel}</p>
                  <ImageGeneratePanel />
                </div>
              </Card>
              <div className="space-y-4">
                <TokenBalanceCard />
                <MediaDraftCards />
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(16rem,0.9fr)] lg:items-start">
                <Card variant="featured" className="relative overflow-hidden" title={copy.canvasBench}>
                  <p className="mb-4 text-xs text-[var(--muted)]">{copy.canvasHint}</p>
                  <StudioWorkbench />
                </Card>
                <Card variant="featured" className="relative overflow-hidden" title={copy.imageBench}>
                  <p className="mb-4 text-xs text-[var(--muted)]">{copy.imageHint}</p>
                  <ImageGeneratePanel />
                </Card>
                <div className="space-y-4 lg:sticky lg:top-24">
                  <TokenBalanceCard />
                  <MediaDraftCards />
                </div>
              </div>
              <DraftHistory drafts={board.drafts} generations={board.generations} assets={board.assets} />
            </>
          )}
        </StudioDebitProvider>
      )}
      <p className="text-xs text-[var(--muted)]">
        {copy.walletLead}{" "}
        <Link href="/cuzdan" className="font-semibold text-[var(--safir-deep)] hover:underline">
          {copy.walletCta}
        </Link>
        .
      </p>
    </RoomFrame>
  );
}
