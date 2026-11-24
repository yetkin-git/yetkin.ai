"use client";

/**
 * Fiyatlandırma sayfası huni ölçümü (4.4).
 *
 * `pricing_view`: sayfa görüntülendi (bir kez, görünür olduğunda).
 * `checkout_start`: vitrin kartındaki satın alma CTA'sına tıklandı.
 *
 * Neden ayrı istemci bileşeni: fiyat sayfası RSC'dir ve katalog tutarı sunucuda
 * okunur. Tutar buraya **prop** olarak gelir; istemci fiyat hesaplamaz. Ölçüm
 * çağrısı akışı kesmez (`emitSemConversion` hata yutup devam eder).
 *
 * Kart CTA'ları `data-pricing-cta` taşır; tıklama tek dinleyiciyle yakalanır —
 * her karta ayrı `"use client"` sarmalayıcı eklemek fiyat sayfasını istemciye
 * taşımak olurdu ve katalog okumasını tarayıcıya indirirdi.
 */

import { useEffect } from "react";
import { emitSemConversion } from "@/lib/kernel/sem/conversion";

export type PricingTrackerItem = {
  id: string;
  title: string;
  amountMinor: number | null;
};

export function PricingCheckoutTracker({ items }: { items: readonly PricingTrackerItem[] }) {
  useEffect(() => {
    emitSemConversion("pricingView", { itemCount: items.length });

    function onClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const anchor = target.closest("[data-pricing-cta]");
      if (!(anchor instanceof HTMLElement)) {
        return;
      }
      const itemId = anchor.getAttribute("data-pricing-cta") ?? "unknown";
      const item = items.find((row) => row.id === itemId);
      emitSemConversion("checkoutStart", {
        itemId,
        itemName: item?.title ?? "",
        valueMinor: item?.amountMinor ?? 0,
        currency: "TRY",
      });
    }

    // Pasif dinleyici: kaydırma/tıklama gecikmesi doğmaz.
    document.addEventListener("click", onClick, { passive: true });
    return () => {
      document.removeEventListener("click", onClick);
    };
  }, [items]);

  return null;
}
