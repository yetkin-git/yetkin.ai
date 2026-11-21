"use client";

import { Suspense, useEffect, useState } from "react";
import Script from "next/script";
import { Ga4RoutePageView } from "@/components/kernel/ga4-route-page-view";
import {
  COOKIE_CONSENT_COOKIE,
  COOKIE_CONSENT_EVENT,
  COOKIE_CONSENT_STORAGE_KEY,
  parseCookieConsent,
  readStoredCookieConsent,
  type CookieConsentChoice,
} from "@/lib/kernel/telemetry/cookie-consent";

function readClientCookieConsent(): CookieConsentChoice | null {
  const stored = readStoredCookieConsent();
  if (stored) {
    return stored;
  }
  if (typeof document === "undefined") {
    return null;
  }
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_CONSENT_COOKIE}=([^;]*)`));
  const fromCookie = parseCookieConsent(match?.[1] ? decodeURIComponent(match[1]) : null);
  if (fromCookie) {
    try {
      window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, fromCookie);
    } catch {
      /* depolama kapalıysa çerez yeter */
    }
  }
  return fromCookie;
}

/**
 * GA4 etiketini yalnız analitik rızasından sonra basar.
 * İlk açılışta `initialAllowed` false ise script DOM'a girmez.
 */
export function Ga4ConsentScripts({
  measurementId,
  nonce,
  config,
  initialAllowed,
}: {
  measurementId: string;
  nonce?: string;
  config: string;
  initialAllowed: boolean;
}) {
  const [allowed, setAllowed] = useState(initialAllowed);

  useEffect(() => {
    const sync = () => {
      setAllowed(readClientCookieConsent() === "analytics");
    };
    sync();
    window.addEventListener(COOKIE_CONSENT_EVENT, sync);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, sync);
  }, []);

  if (!allowed) {
    return null;
  }

  return (
    <>
      <Script id="yetkin-ga4-config" strategy="afterInteractive" nonce={nonce}>
        {config}
      </Script>
      <Script
        id="yetkin-ga4-src"
        strategy="afterInteractive"
        nonce={nonce}
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`}
      />
      <Suspense fallback={null}>
        <Ga4RoutePageView />
      </Suspense>
    </>
  );
}

export type { CookieConsentChoice };
