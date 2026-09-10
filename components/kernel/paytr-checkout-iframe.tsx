"use client";

import { useEffect, useRef } from "react";
import {
  getPaytrIframeUrl,
  isPaytrIframeUrl,
  PAYTR_IFRAME_ALLOW,
  PAYTR_IFRAME_RESIZER_SRC,
} from "@/lib/kernel/payments/paytr/iframe-embed";

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
}: {
  src: string;
  title: string;
  className?: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const iframeSrc = getPaytrIframeUrl(src);

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
      scrolling="no"
      className={className}
      style={{ width: "100%" }}
    />
  );
}
