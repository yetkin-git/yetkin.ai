"use client";

import { useEffect } from "react";
import { ACADEMY_CHECKOUT_HASH, ACADEMY_HERO_PAYTR_EVENT } from "@/lib/academy/storefront-cta";

/**
 * Oturumlu ziyaretçi `#satin-al` ile gelince PayTR adımını açar.
 * Dinleyici aynı turda bağlanır; çağrı bir sonraki karede gider.
 */
export function AcademyCheckoutAutostart({ enabled }: { enabled: boolean }) {
  useEffect(() => {
    if (!enabled) return;
    if (window.location.hash !== `#${ACADEMY_CHECKOUT_HASH}`) return;
    const frame = window.requestAnimationFrame(() => {
      window.dispatchEvent(new Event(ACADEMY_HERO_PAYTR_EVENT));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [enabled]);
  return null;
}
