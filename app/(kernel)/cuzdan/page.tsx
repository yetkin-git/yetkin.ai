import { WalletTopUpForm } from "@/components/kernel/wallet-top-up-form";
import { LedgerHistory } from "@/components/kernel/ledger-history";
import { AuthNeeded } from "@/components/ui/auth-needed";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { IconCoin, IconLock, IconWallet } from "@/components/ui/icons";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { StatGrid } from "@/components/ui/stat-grid";
import { getSession } from "@/lib/kernel/auth/session";
import { WALLET_LEDGER_TAKE } from "@/lib/kernel/ledger/display";
import { loadWalletBoard } from "@/lib/kernel/ledger/load";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { formatMinor } from "@/lib/kernel/money/format";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export default async function WalletPage() {
  const session = await getSession();
  const board = session ? await loadWalletBoard(session.id) : null;
  const copy = SEN_VOICE.cuzdan;
  const liveBalance =
    board == null
      ? null
      : formatMinor(board.wallet?.amountMinor ?? 0, board.wallet?.currencyCode ?? SETTLEMENT_CURRENCY);

  return (
    <RoomFrame>
      <PageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
      <StatGrid
        columns={3}
        items={[
          {
            label: copy.balanceLabel,
            value: liveBalance ?? copy.balanceGuestValue,
            hint: liveBalance ? copy.balanceHintLive : copy.balanceHintGuest,
            icon: <IconWallet />,
          },
          {
            label: copy.historyLabel,
            value: board ? String(board.entries.length) : copy.historyGuestValue,
            hint: board?.hasMore ? copy.historyHintLive(WALLET_LEDGER_TAKE) : copy.historyHintGuest,
            icon: <IconLock />,
          },
          {
            label: copy.currencyLabel,
            value: copy.currencyValue,
            hint: copy.currencyHint,
            icon: <IconCoin />,
          },
        ]}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="featured" title={copy.topUpTitle}>
          <WalletTopUpForm />
        </Card>
        <Card variant="ink" title={copy.closedLoopTitle} bodyClassName="text-white/70">
          {copy.closedLoopBody}
        </Card>
      </div>
      {!session ? (
        <AuthNeeded message={copy.auth} />
      ) : board === null ? (
        <div className="space-y-3">
          <Badge tone="amber">{copy.unboundBadge}</Badge>
          <p className="text-sm text-[var(--muted)]">{copy.unboundBody}</p>
          <LedgerHistory entries={[]} hasMore={false} />
        </div>
      ) : (
        <LedgerHistory entries={board.entries} hasMore={board.hasMore} />
      )}
    </RoomFrame>
  );
}
