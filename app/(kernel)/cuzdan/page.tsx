import { WalletRefundButton } from "@/components/kernel/wallet-refund-button";
import { WalletTopUpForm } from "@/components/kernel/wallet-top-up-form";
import { CuzdanReturnSignal } from "@/components/kernel/cuzdan-return-signal";
import { LedgerHistory } from "@/components/kernel/ledger-history";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { IconCoin, IconLock, IconWallet } from "@/components/ui/icons";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { StatGrid } from "@/components/ui/stat-grid";
import { requirePageSession } from "@/lib/kernel/auth/session";
import { loadIdentityBoard } from "@/lib/kernel/identity/load";
import { WALLET_LEDGER_TAKE } from "@/lib/kernel/ledger/display";
import { loadWalletBoard } from "@/lib/kernel/ledger/load";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { formatMinor } from "@/lib/kernel/money/format";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { isPaytrMockCheckoutAllowed, isPaytrSandboxEnabled } from "@/lib/kernel/payments/paytr/checkout";
import { deskForPurpose, loadVerifiedPurchase } from "@/lib/kernel/payments/verified-purchase";
import { isPaymentsPortConfigured } from "@/lib/kernel/payments/port";

function firstQuery(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

export default async function WalletPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requirePageSession();
  const query = await searchParams;
  // PayTR tarayıcı dönüşü: `?sonuc=ok&masa=…&merchant_oid=…`.
  // GA4 `purchase` yalnız sunucuda doğrulanmış ödeme emriyle basılır.
  const sonuc = firstQuery(query.sonuc);
  const masa = firstQuery(query.masa);
  const merchantOid = firstQuery(query.merchant_oid);
  const settled =
    sonuc === "ok" || sonuc === "success"
      ? await loadVerifiedPurchase({ userId: session.id, merchantOid })
      : null;
  const purchase = settled
    ? {
        merchantOid: settled.merchantOid,
        // `masa` ürün bağlamıdır; yoksa ödeme emrinin niyetinden türetilir.
        desk: masa ?? deskForPurpose(settled.purpose),
        amountMinor: settled.amountMinor,
        currencyCode: settled.currencyCode,
      }
    : null;
  const [board, identity] = await Promise.all([
    loadWalletBoard(session.id),
    loadIdentityBoard(session.id),
  ]);
  const copy = SEN_VOICE.cuzdan;
  const liveBalance =
    board == null
      ? null
      : formatMinor(board.wallet?.amountMinor ?? 0, board.wallet?.currencyCode ?? SETTLEMENT_CURRENCY);

  return (
    <RoomFrame>
      <PageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
      <CuzdanReturnSignal purchase={purchase} />
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
          <WalletTopUpForm
            enabled
            paymentsReady={isPaymentsPortConfigured() || isPaytrMockCheckoutAllowed()}
            sandbox={isPaytrSandboxEnabled()}
            profileFullName={identity?.user?.displayName ?? null}
          />
        </Card>
        <Card variant="ink" title={copy.refundTitle} bodyClassName="text-white/70">
          <WalletRefundButton balanceMinor={board?.wallet?.amountMinor ?? 0} />
          {board?.wallet && board.wallet.amountMinor > 0 ? null : (
            <p>{copy.refundBody}</p>
          )}
        </Card>
        <Card variant="ink" title={copy.closedLoopTitle} bodyClassName="text-white/70">
          {copy.closedLoopBody}
        </Card>
      </div>
      {board === null ? (
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
