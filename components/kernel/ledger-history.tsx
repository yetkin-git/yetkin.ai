import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  WALLET_LEDGER_TAKE,
  ledgerDirectionLabel,
  ledgerSignedMinor,
} from "@/lib/kernel/ledger/display";
import type { WalletLedgerRow } from "@/lib/kernel/ledger/types";
import { formatMinor } from "@/lib/kernel/money/format";

export function LedgerHistory({
  entries,
  hasMore,
}: {
  entries: WalletLedgerRow[];
  hasMore: boolean;
}) {
  return (
    <Card
      title="Hareket geçmişi"
      eyebrow="Silinemez defter"
      bodyClassName="text-[var(--foreground)]"
    >
      <p className="mb-4 text-sm text-[var(--muted)]">
        Satırlar silinemez defter kayıtlarıdır. Banka çekimi bu listede yoktur.
      </p>
      {entries.length === 0 ? (
        <p className="rounded-[var(--radius-card)] border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-6 text-sm text-[var(--muted)]">
          Henüz defter satırı yok. Kart yüklemesi onaylanınca giriş burada görünür. Uydurma
          hareket basılmaz.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
          <table className="w-full min-w-[36rem] text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                <th className="px-4 py-3">Tarih</th>
                <th className="px-4 py-3">Açıklama</th>
                <th className="px-4 py-3">Yön</th>
                <th className="px-4 py-3 text-right">Tutar</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const signed = ledgerSignedMinor(entry.direction, entry.amountMinor);
                const isDebit = signed < 0;
                return (
                  <tr key={entry.id} className="border-b border-[var(--border)] last:border-b-0">
                    <td className="whitespace-nowrap px-4 py-3 text-[var(--muted)]">
                      {entry.createdAt.toLocaleString("tr-TR")}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--foreground)]">{entry.label}</p>
                      <p className="font-mono text-[11px] text-[var(--muted)]">{entry.purpose}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={isDebit ? "rose" : "emerald"}>
                        {ledgerDirectionLabel(entry.direction)}
                      </Badge>
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-semibold tabular-nums ${
                        isDebit ? "text-[var(--rose)]" : "text-[var(--emerald)]"
                      }`}
                    >
                      {isDebit ? "−" : "+"}
                      {formatMinor(entry.amountMinor, entry.currencyCode)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {hasMore ? (
        <p className="mt-3 text-xs text-[var(--muted)]">
          Yalnız son {WALLET_LEDGER_TAKE} hareket gösteriliyor. Daha eski satırlar defterde durur;
          bu yüzey henüz sayfalamaz.
        </p>
      ) : null}
    </Card>
  );
}
