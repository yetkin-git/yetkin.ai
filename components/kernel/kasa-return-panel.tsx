"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { ACADEMY_FLAGSHIP_SKU_SLUG } from "@/lib/academy/pilot-sku";
import { CUZDAN_SEN } from "@/lib/copy/sen-voice/cuzdan";
import { buttonClassName } from "@/components/ui/button";

const KASA_RETURN_REDIRECT_MS = 3_000;
const KASA_RETURN_COURSE_HREF = `/academy/${ACADEMY_FLAGSHIP_SKU_SLUG}` as Route;
const KASA_RETURN_ACADEMY_HREF = "/academy" as Route;

export function KasaReturnPanel({ ok }: { ok: boolean }) {
  const router = useRouter();
  const href = ok ? KASA_RETURN_COURSE_HREF : KASA_RETURN_ACADEMY_HREF;

  useEffect(() => {
    if (!ok) {
      return;
    }
    const timer = window.setTimeout(() => {
      router.push(href);
    }, KASA_RETURN_REDIRECT_MS);
    return () => window.clearTimeout(timer);
  }, [href, ok, router]);

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
