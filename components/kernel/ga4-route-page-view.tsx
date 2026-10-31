"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/kernel/telemetry/funnel";

/**
 * App Router istemci geçişi. `useSearchParams` kökte `Suspense` ister.
 * Kimlik yoksa `trackPageView` iz bırakmaz; bu düğüm yalnız etiket açıkken basılır.
 */
export function Ga4RoutePageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useEffect(() => {
    if (!pathname) {
      return;
    }
    trackPageView(pathname, search);
  }, [pathname, search]);

  return null;
}
