"use client";

import { useEffect } from "react";
import { trackBeginCheckout, trackViewItem } from "@/lib/kernel/telemetry/funnel";
import { JUNIOR_YEARLY_GA_ITEM_ID, JUNIOR_YEARLY_GA_ITEM_NAME } from "@/lib/kernel/telemetry/junior-item";

function juniorItem(valueMinor: number | null, currency: string | null) {
  return {
    itemId: JUNIOR_YEARLY_GA_ITEM_ID,
    itemName: JUNIOR_YEARLY_GA_ITEM_NAME,
    valueMinor,
    currency,
  };
}

/** Junior iniş: yıllık paket `view_item`. Fiyat katalogda yoksa tutar uydurulmaz. */
export function JuniorPackageViewItem({
  valueMinor = null,
  currency = null,
}: {
  valueMinor?: number | null;
  currency?: string | null;
}) {
  useEffect(() => {
    trackViewItem(juniorItem(valueMinor, currency));
  }, [currency, valueMinor]);
  return null;
}

/** Junior kasa adımı. Satış kapalıyken sayfa bu düğümü basmaz. */
export function JuniorCheckoutBeacon({
  valueMinor = null,
  currency = null,
}: {
  valueMinor?: number | null;
  currency?: string | null;
}) {
  useEffect(() => {
    trackBeginCheckout(juniorItem(valueMinor, currency));
  }, [currency, valueMinor]);
  return null;
}
