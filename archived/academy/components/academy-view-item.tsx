"use client";

import { useEffect } from "react";
import { trackViewItem } from "@/lib/kernel/telemetry/funnel";

/** Kurs detayı açılınca `view_item`. Kimlik yoksa iz bırakmaz. */
export function AcademyViewItem({
  itemId,
  itemName,
  valueMinor = null,
  currency = null,
}: {
  itemId: string;
  itemName: string;
  valueMinor?: number | null;
  currency?: string | null;
}) {
  useEffect(() => {
    trackViewItem({ itemId, itemName, valueMinor, currency });
  }, [currency, itemId, itemName, valueMinor]);
  return null;
}
