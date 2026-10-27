import "server-only";

import { refundUnlicensedAcademyCredit } from "@/lib/academy/license-insufficient-hold";
import { getPrisma } from "@/lib/kernel/db";
import { bindLedgerStore } from "@/lib/kernel/ledger/prisma-store";
import type { LedgerStore } from "@/lib/kernel/ledger/types";
import type { PaymentOrderSnapshot } from "@/lib/kernel/payments/clearing";
import { getPaytrCheckoutCredentials } from "@/lib/kernel/payments/paytr/checkout";
import { bindWalletCardRefundStore } from "@/lib/kernel/payments/prisma-wallet-card-refund";
import type { WalletCardRefundPorts } from "@/lib/kernel/payments/wallet-card-refund";

/** CLEARED akademi kasasında lisans yazılamazsa bu siparişin tutarını karta iade dener. */
export async function refundUnlicensedAcademyCreditForOrder(
  order: PaymentOrderSnapshot,
): Promise<Awaited<ReturnType<typeof refundUnlicensedAcademyCredit>>> {
  const prisma = getPrisma();
  return prisma.$transaction(
    async (tx) => {
      const ports: WalletCardRefundPorts = {
        refunds: bindWalletCardRefundStore(tx),
        ledger: bindLedgerStore(tx) as LedgerStore,
        paytrConfigured: getPaytrCheckoutCredentials() != null,
      };
      return refundUnlicensedAcademyCredit(ports, order);
    },
    { maxWait: 10_000, timeout: 20_000 },
  );
}
