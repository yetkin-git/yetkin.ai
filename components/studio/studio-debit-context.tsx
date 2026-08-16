"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import type { CurrencyCode } from "@/lib/kernel/money/currency";
import { EMPTY_WALLET_STRIP, type WalletStripSnapshot } from "@/lib/dashboard/wallet-strip";

export type StudioDebitSettlement = {
  debitMinor: number;
  remainingMinor: number;
  currencyCode: CurrencyCode;
};

type StudioDebitContextValue = {
  strip: WalletStripSnapshot;
  textFloorMinor: number | null;
  imageFloorMinor: number | null;
  lastSettlement: StudioDebitSettlement | null;
  reportSettlement: (settlement: StudioDebitSettlement) => void;
};

const StudioDebitContext = createContext<StudioDebitContextValue | null>(null);

export function StudioDebitProvider({
  children,
  initialStrip,
  textFloorMinor,
  imageFloorMinor,
}: {
  children: ReactNode;
  initialStrip?: WalletStripSnapshot;
  textFloorMinor?: number | null;
  imageFloorMinor?: number | null;
}) {
  const [strip, setStrip] = useState<WalletStripSnapshot>(initialStrip ?? EMPTY_WALLET_STRIP);
  const [lastSettlement, setLastSettlement] = useState<StudioDebitSettlement | null>(null);

  const reportSettlement = useCallback((settlement: StudioDebitSettlement) => {
    setLastSettlement(settlement);
    setStrip({
      live: true,
      amountMinor: toAmountMinor(settlement.remainingMinor),
      currencyCode: settlement.currencyCode,
    });
  }, []);

  const value = useMemo(
    () => ({
      strip,
      textFloorMinor: textFloorMinor ?? null,
      imageFloorMinor: imageFloorMinor ?? null,
      lastSettlement,
      reportSettlement,
    }),
    [strip, textFloorMinor, imageFloorMinor, lastSettlement, reportSettlement],
  );

  return <StudioDebitContext.Provider value={value}>{children}</StudioDebitContext.Provider>;
}

export function useStudioDebit(): StudioDebitContextValue {
  const ctx = useContext(StudioDebitContext);
  if (!ctx) {
    throw new Error("StudioDebitProvider gerekli.");
  }
  return ctx;
}
