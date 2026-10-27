"use client";

import { useEffect, type ReactNode } from "react";
import { ACADEMY_CHECKOUT_HASH } from "@/lib/academy/storefront-cta";

/**
 * `#satin-al` ile gelen misafir ve oturum, kasa kartına kayar.
 * Giriş dönüşü tam sayfa açılışıdır; çapa ilk boyamadan sonra da tutulur.
 */
export function AcademyCheckoutAnchor({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.location.hash !== `#${ACADEMY_CHECKOUT_HASH}`) {
      return;
    }
    const node = document.getElementById(ACADEMY_CHECKOUT_HASH);
    if (!node) {
      return;
    }
    const focusCheckout = () => {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
      const target =
        node.querySelector<HTMLElement>("[data-academy-checkout-cta]") ??
        node.querySelector<HTMLElement>("button, input, textarea, select");
      target?.focus({ preventScroll: true });
    };
    const frame = window.requestAnimationFrame(focusCheckout);
    const later = window.setTimeout(focusCheckout, 350);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(later);
    };
  }, []);

  return (
    <div className="scroll-mt-24" id={ACADEMY_CHECKOUT_HASH}>
      {children}
    </div>
  );
}
