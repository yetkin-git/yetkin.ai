"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatMinor } from "@/lib/kernel/money/format";
import { WALLET_SURFACE_PATH } from "@/lib/kernel/identity/types";
import { EMPTY_WALLET_STRIP, type WalletStripSnapshot } from "@/lib/dashboard/wallet-strip";
import { IconWallet } from "@/components/ui/icons";
import { cn } from "@/components/ui/cn";

export function HeaderWalletChip({ embedded = false }: { embedded?: boolean }) {
  const [strip, setStrip] = useState<WalletStripSnapshot>(EMPTY_WALLET_STRIP);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/dashboard/wallet-strip")
      .then(async (response) => {
        const body = (await response.json()) as { ok: boolean; strip?: WalletStripSnapshot };
        if (!cancelled && body.ok && body.strip) {
          setStrip(body.strip);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStrip(EMPTY_WALLET_STRIP);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const amount = formatMinor(strip.amountMinor, strip.currencyCode);

  return (
    <Link
      href={WALLET_SURFACE_PATH}
      aria-label={`Cüzdan bakiyesi ${amount}`}
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
            strip.live ? "bg-[var(--emerald)]" : "bg-[var(--muted)]",
          )}
          aria-hidden
        />
      </span>
      <span className="tabular-nums tracking-tight">{amount}</span>
    </Link>
  );
}
