import "server-only";

import { commerceLicenseActive } from "@/lib/commerce/subscription";
import { createPrismaCommerceSubscriptionStore } from "@/lib/commerce/subscription-prisma";
import type { CommerceOutgoingLicense } from "@/lib/commerce/sync-license";
import { logEvent } from "@/lib/kernel/observability/log";

/** Lisans okunamadığında kapı **kapanır**: gelir kapısı fail-closed'dır. */
export const liveStoreLicense: CommerceOutgoingLicense = {
  async allowsOutgoing(storeId, now) {
    try {
      const row = await createPrismaCommerceSubscriptionStore().findByStoreId(storeId);
      return commerceLicenseActive(row, now);
    } catch (error) {
      logEvent({
        level: "warn",
        event: "commerce.license.read",
        reason: "subscription_unreadable",
        errorName: error instanceof Error ? error.name : "Error",
      });
      return false;
    }
  },
};
