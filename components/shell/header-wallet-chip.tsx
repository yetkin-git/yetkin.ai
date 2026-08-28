import Link from "next/link";
import { formatMinor } from "@/lib/kernel/money/format";
import { WALLET_SURFACE_PATH } from "@/lib/kernel/identity/types";
import { type WalletStripSnapshot } from "@/lib/dashboard/wallet-strip";
import { IconWallet } from "@/components/ui/icons";
import { cn } from "@/components/ui/cn";

/** Tutar yuvası — "—" → ₺x,xx değişiminde genişlik zıplamasın. */
const AMOUNT_SLOT = "inline-flex h-4 min-w-[4.75rem] items-center tabular-nums tracking-tight";

export function HeaderWalletChip({
  embedded = false,
  strip,
  pending = false,
}: {
  embedded?: boolean;
  strip: WalletStripSnapshot;
  pending?: boolean;
}) {
  const amount = strip.live ? formatMinor(strip.amountMinor, strip.currencyCode) : "—";
  const live = strip.live && !pending;
  const label = pending
    ? "Cüzdan bakiyesi yükleniyor"
    : live
      ? `Cüzdan bakiyesi ${amount}`
      : "Cüzdan henüz yüklenemedi";

  return (
    <Link
      href={WALLET_SURFACE_PATH}
      aria-label={label}
      aria-busy={pending || undefined}
      className={cn(
        "inline-flex h-10 items-center gap-2 px-3 text-sm font-semibold transition",
        embedded
          ? "rounded-none text-[var(--safir-deep)] hover:bg-[var(--safir-soft)]"
          : "rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm hover:border-[var(--safir)]",
      )}
    >
      <span className="relative inline-flex">
        <IconWallet className="h-4 w-4 text-[var(--safir-deep)]" />
        <span
          className={cn(
            "absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full ring-2 ring-[var(--surface)]",
            live ? "bg-[var(--emerald)]" : "bg-[var(--muted)]",
          )}
          aria-hidden
        />
      </span>
      <span className={AMOUNT_SLOT}>
        {pending ? (
          <span
            className="inline-block h-3.5 w-[4.25rem] animate-pulse rounded bg-[var(--border)] motion-reduce:animate-none"
            aria-hidden
          />
        ) : (
          amount
        )}
      </span>
    </Link>
  );
}
