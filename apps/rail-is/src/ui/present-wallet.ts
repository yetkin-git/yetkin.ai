import type { RailV1WalletStrip } from "../contract/v1";
import { classifyV1Failure, type ClassifiedV1Failure } from "./classify";
import { RAIL_IS_COPY } from "./copy";
import { formatMinorLabel } from "./money";

export type WalletStripView =
  | { kind: "idle"; testID: "dron-wallet-idle" }
  | { kind: "loading"; testID: "dron-wallet-loading"; title: string }
  | {
      kind: "live";
      testID: "dron-wallet-live";
      title: string;
      live: true;
      amountMinor: number;
      currencyCode: RailV1WalletStrip["currencyCode"];
      amountLabel: string;
      topUpLabel: string;
      topUpHint: string;
    }
  | {
      kind: "unbound";
      testID: "dron-wallet-unbound";
      title: string;
      live: false;
      message: string;
      amountLabel: null;
      topUpLabel: string;
      topUpHint: string;
    }
  | {
      kind: "error";
      testID: "dron-wallet-error";
      title: string;
      message: string;
      requestId: string | null;
      amountLabel: null;
    };

export function presentWalletLoading(): WalletStripView {
  return {
    kind: "loading",
    testID: RAIL_IS_COPY.wallet.loadingTestID,
    title: "Cüzdan şeridi yükleniyor.",
  };
}

export function presentWalletStrip(strip: RailV1WalletStrip): WalletStripView {
  if (strip.live !== true) {
    return {
      kind: "unbound",
      testID: RAIL_IS_COPY.wallet.unboundTestID,
      title: RAIL_IS_COPY.wallet.unboundTitle,
      live: false,
      message: RAIL_IS_COPY.wallet.unboundBody,
      amountLabel: null,
      topUpLabel: RAIL_IS_COPY.wallet.topUp,
      topUpHint: RAIL_IS_COPY.wallet.topUpHint,
    };
  }
  return {
    kind: "live",
    testID: RAIL_IS_COPY.wallet.liveTestID,
    title: RAIL_IS_COPY.wallet.liveTitle,
    live: true,
    amountMinor: strip.amountMinor,
    currencyCode: strip.currencyCode,
    amountLabel: formatMinorLabel(strip.amountMinor, strip.currencyCode),
    topUpLabel: RAIL_IS_COPY.wallet.topUp,
    topUpHint: RAIL_IS_COPY.wallet.topUpHint,
  };
}

export function presentWalletError(error: unknown): WalletStripView {
  return presentWalletFromFailure(classifyV1Failure(error));
}

export function presentWalletFromFailure(failure: ClassifiedV1Failure): WalletStripView {
  return {
    kind: "error",
    testID: RAIL_IS_COPY.wallet.errorTestID,
    title: RAIL_IS_COPY.wallet.errorTitle,
    message: failure.message,
    requestId: failure.requestId,
    amountLabel: null,
  };
}

export const WEB_WALLET_PATH = "/cuzdan" as const;

export function webWalletUrl(apiBase: string): string {
  const base = apiBase.trim().replace(/\/+$/, "");
  if (!base) {
    throw new Error("Amiral adresi yok. /cuzdan açılamaz.");
  }
  return `${base}${WEB_WALLET_PATH}`;
}
