import "server-only";

import { cache } from "react";
import { EMPTY_WALLET_STRIP, type WalletStripSnapshot } from "@/lib/dashboard/wallet-strip";
import {
  ensurePrismaQueryEngine,
  kernelBackgroundReadTimeoutMs,
  withDbReadTimeout,
} from "@/lib/kernel/db";
import { readSettlementWallet } from "@/lib/kernel/ledger/wallet-read";

/** Serverless fail-soft; uzun süreç `kernelBackgroundReadTimeoutMs` ile 8s. */
const WALLET_STRIP_READ_TIMEOUT_MS = 2_000;

/**
 * Settlement cüzdan şeridi — salt SELECT. INSERT yok.
 * React `cache`: aynı RSC istekte kabuk çipi ve pulse BFF tek okumayı paylaşır.
 */
export const readWalletStripSnapshot = cache(async (userId: string): Promise<WalletStripSnapshot> => {
  try {
    return await withDbReadTimeout(
      (async () => {
        const engineReady = await ensurePrismaQueryEngine();
        if (!engineReady) {
          return EMPTY_WALLET_STRIP;
        }
        const wallet = await readSettlementWallet(userId);
        if (!wallet) {
          return EMPTY_WALLET_STRIP;
        }
        return {
          live: true,
          amountMinor: wallet.amountMinor,
          currencyCode: wallet.currencyCode,
        };
      })(),
      kernelBackgroundReadTimeoutMs(WALLET_STRIP_READ_TIMEOUT_MS),
      "wallet.strip",
    );
  } catch {
    return EMPTY_WALLET_STRIP;
  }
});
