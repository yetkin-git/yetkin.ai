"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { CUZDAN_SEN } from "@/lib/copy/sen-voice/cuzdan";
import { emitPaytrIframeReturnIfEmbedded } from "@/lib/kernel/payments/paytr/iframe-embed";
import { trackPurchase } from "@/lib/kernel/telemetry/funnel";
import { buttonClassName } from "@/components/ui/button";

const KASA_RETURN_REDIRECT_MS = 3_000;

const KASA_RETURN_HREF = {
  tezgah: "/tezgah",
  "e-ticaret": "/e-ticaret",
  hibe: "/hibe",
} as const satisfies Record<string, Route>;

export type KasaReturnDesk = keyof typeof KASA_RETURN_HREF;

/**
 * Ödeme dönüşü çalışma masasına iner.
 * Pro ve kredi → tezgâh. Lisans → e-ticaret. Dosya → hibe.
 * Tanınmayan işaret tezgâha düşer. Akademi adresi üretilmez.
 */
export function kasaReturnDesk(raw: string | null | undefined): KasaReturnDesk {
  const value = raw?.trim().toLowerCase() ?? "";
  if (value === "e-ticaret" || value === "eticaret" || value === "commerce" || value === "lisans") {
    return "e-ticaret";
  }
  if (value === "hibe" || value === "grant" || value === "dosya") {
    return "hibe";
  }
  return "tezgah";
}

export function kasaReturnHref(desk: string | null | undefined): Route {
  return KASA_RETURN_HREF[kasaReturnDesk(desk)];
}

/** Eski çağrı adı. Kurs slug'ı masa seçmez; dönüş çalışma masasına iner. */
export function kasaReturnCourseHref(courseSlug: string | null | undefined): Route {
  return kasaReturnHref(courseSlug);
}

export function KasaReturnPanel({
  ok,
  desk = null,
}: {
  ok: boolean;
  desk?: string | null;
}) {
  const router = useRouter();
  const href = kasaReturnHref(desk);

  useEffect(() => {
    emitPaytrIframeReturnIfEmbedded(ok);
    if (!ok) {
      return;
    }
    trackPurchase({ itemId: kasaReturnDesk(desk) });
    const timer = window.setTimeout(() => {
      router.push(href);
    }, KASA_RETURN_REDIRECT_MS);
    return () => window.clearTimeout(timer);
  }, [desk, href, ok, router]);

  return (
    <div className="mt-6" suppressHydrationWarning>
      {ok ? (
        <div className="flex flex-col items-center gap-4 text-center" suppressHydrationWarning>
          <span
            aria-hidden="true"
            className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--safir)]"
          />
          <p className="text-base text-[var(--foreground)]" suppressHydrationWarning>
            {CUZDAN_SEN.kasaReturnOk}
          </p>
        </div>
      ) : (
        <p className="text-sm text-[var(--foreground)]" suppressHydrationWarning>
          {CUZDAN_SEN.kasaReturnFail}
        </p>
      )}
      <Link
        href={href}
        className={buttonClassName("primary", "lg", "mt-6 w-full")}
        suppressHydrationWarning
      >
        {ok ? CUZDAN_SEN.kasaReturnCta : CUZDAN_SEN.kasaReturnFailCta}
      </Link>
    </div>
  );
}
