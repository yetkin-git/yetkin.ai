"use client";

import { useEffect, useRef } from "react";
import { trackPaytrIframeLoaded } from "@/lib/kernel/telemetry/funnel";
import {
  getPaytrIframeUrl,
  isPaytrIframeUrl,
  isPaytrMerchantReturnPathname,
  isPaytrReturnMessage,
  PAYTR_IFRAME_ALLOW,
  PAYTR_IFRAME_RESIZER_SRC,
} from "@/lib/kernel/payments/paytr/iframe-embed";

export type PaytrIframeReturnEvent = {
  pathname: string;
  search: string;
  ok: boolean;
};

type PaytrIFrameResize = (
  options: Record<string, unknown>,
  target: HTMLIFrameElement | string,
) => void;

let resizerPromise: Promise<PaytrIFrameResize> | null = null;

function readPaytrIFrameResize(): PaytrIFrameResize | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  return (window as unknown as { iFrameResize?: PaytrIFrameResize }).iFrameResize;
}

function loadPaytrIframeResizer(): Promise<PaytrIFrameResize> {
  const existing = readPaytrIFrameResize();
  if (existing) {
    return Promise.resolve(existing);
  }
  if (resizerPromise) {
    return resizerPromise;
  }
  resizerPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = PAYTR_IFRAME_RESIZER_SRC;
    script.async = true;
    script.onload = () => {
      const resize = readPaytrIFrameResize();
      if (resize) {
        resolve(resize);
        return;
      }
      reject(new Error("PayTR iframeResizer globali yok."));
    };
    script.onerror = () => {
      resizerPromise = null;
      reject(new Error(`PayTR iframeResizer indirilemedi: ${PAYTR_IFRAME_RESIZER_SRC}`));
    };
    document.head.appendChild(script);
  });
  return resizerPromise;
}

export function PaytrCheckoutIframe({
  src,
  title,
  className = "mt-3 min-h-[24rem] w-full rounded-md border border-[var(--border)]",
  onReturn,
}: {
  src: string;
  title: string;
  className?: string;
  onReturn?: (event: PaytrIframeReturnEvent) => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadedSrcRef = useRef<string | null>(null);
  const returnedRef = useRef(false);
  const onReturnRef = useRef(onReturn);
  const iframeSrc = getPaytrIframeUrl(src);

  useEffect(() => {
    onReturnRef.current = onReturn;
  }, [onReturn]);

  useEffect(() => {
    returnedRef.current = false;
  }, [iframeSrc]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (returnedRef.current) {
        return;
      }
      if (typeof window !== "undefined" && event.origin && event.origin !== window.location.origin) {
        return;
      }
      if (!isPaytrReturnMessage(event.data)) {
        return;
      }
      returnedRef.current = true;
      const search = typeof event.data.search === "string" ? event.data.search : "";
      const outcome = new URLSearchParams(search).get("sonuc");
      const ok = typeof event.data.ok === "boolean" ? event.data.ok : outcome !== "fail";
      onReturnRef.current?.({
        pathname: event.data.pathname,
        search,
        ok,
      });
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    if (!isPaytrIframeUrl(iframeSrc)) {
      console.error(
        "[PayTR] iFrame src reddedildi (https://www.paytr.com/odeme/guvenli/{token} beklenir):",
        iframeSrc,
      );
      return;
    }
    const iframe = iframeRef.current;
    if (!iframe) {
      return;
    }
    let cancelled = false;
    void loadPaytrIframeResizer()
      .then((resize) => {
        if (cancelled || !iframeRef.current) {
          return;
        }
        resize({}, iframe);
      })
      .catch((error) => {
        console.error(
          "[PayTR] iframeResizer yüklenemedi (CSP script-src / ağ). iFrame gri kalabilir.",
          error,
        );
      });
    return () => {
      cancelled = true;
    };
  }, [iframeSrc]);

  if (!isPaytrIframeUrl(iframeSrc)) {
    return null;
  }

  return (
    <iframe
      ref={iframeRef}
      id="paytriframe"
      title={title}
      src={iframeSrc}
      allow={PAYTR_IFRAME_ALLOW}
      data-paytr-iframe=""
      referrerPolicy="strict-origin-when-cross-origin"
      onLoad={() => {
        if (iframeSrc && loadedSrcRef.current !== iframeSrc) {
          loadedSrcRef.current = iframeSrc;
          trackPaytrIframeLoaded();
        }
        if (returnedRef.current) {
          return;
        }
        try {
          const loc = iframeRef.current?.contentWindow?.location;
          const pathname = loc?.pathname ?? "";
          if (pathname && isPaytrMerchantReturnPathname(pathname)) {
            returnedRef.current = true;
            const search = loc?.search ?? "";
            const outcome = new URLSearchParams(search).get("sonuc");
            onReturnRef.current?.({
              pathname,
              search,
              ok: outcome !== "fail",
            });
          }
        } catch {
          /* PayTR çapraz köken (cross-origin) yüklemesinde erişim hatası normaldir. */
        }
      }}
      scrolling="no"
      className={className}
      style={{ width: "100%" }}
    />
  );
}
