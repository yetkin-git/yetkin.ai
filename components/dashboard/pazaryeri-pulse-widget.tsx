"use client";

import { formatMinor } from "@/lib/kernel/money/format";
import { YETKINILAN_BRAND, YETKINILAN_PATH } from "@/lib/kernel/yetkinilan";
import { PulseCard } from "@/components/ui/pulse-card";
import { IconStore } from "@/components/ui/icons";
import { useDashboardPulse } from "@/components/dashboard/dashboard-pulse-provider";

export function PazaryeriPulseWidget() {
  const { pazaryeri: pulse } = useDashboardPulse();

  return (
    <PulseCard
      title={`${YETKINILAN_BRAND} özeti`}
      live={pulse.live}
      liveHint="Canlı · ilan nabzı"
      href={YETKINILAN_PATH}
      hrefLabel={`${YETKINILAN_BRAND} odasına git`}
      stats={[
        { label: "Tezgâh", value: pulse.listedProducts, icon: <IconStore /> },
        { label: "Satış", value: pulse.ordersSold },
        { label: "Alış", value: pulse.ordersBought },
        { label: "Teslim bekleyen", value: pulse.pendingDelivery },
      ]}
    >
      {pulse.lastSales.length === 0
        ? "Son satış yok"
        : pulse.lastSales
            .map((sale) => `${sale.title} · ${formatMinor(sale.amountMinor, sale.currencyCode)}`)
            .join(" · ")}
    </PulseCard>
  );
}
