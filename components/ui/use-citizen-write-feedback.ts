"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { useActionBridge } from "@/components/ui/action-bridge";
import {
  citizenHttpToastKind,
  railCitizenHttpError,
  UX_SEN,
} from "@/lib/copy/sen-voice/ux";
import { isInsufficientBalanceError } from "@/lib/kernel/money/insufficient-balance";
import { buildCitizenLoginHref } from "@/lib/kernel/auth/redirects";

/**
 * 401 / Origin 403 toast; yetersiz bakiye modal'a bırakılır.
 * 503 dürüst vatandaş cümlesine düşer (oda kartı / satır içi); sahte yeşil yok.
 * API zarfı değişmez — yalnız vatandaş cümlesi.
 */
export function useCitizenWriteFeedback() {
  const { push } = useActionBridge();
  const pathname = usePathname();

  return useCallback(
    (status: number, message?: string | null, fallback?: string) => {
      const mapped = railCitizenHttpError(status, message);
      const text = mapped === UX_SEN.http.generic && fallback ? fallback : mapped;
      if (isInsufficientBalanceError(message) || isInsufficientBalanceError(text)) {
        return text;
      }
      const kind = citizenHttpToastKind(status, message);
      if (kind === "session") {
        push({
          title: UX_SEN.http.sessionTitle,
          body: UX_SEN.http.sessionBody,
          href: buildCitizenLoginHref(pathname) as Route,
          cta: UX_SEN.http.loginCta,
          tone: "amber",
        });
      } else if (kind === "origin") {
        push({
          title: UX_SEN.http.originTitle,
          body: UX_SEN.http.originBody,
          tone: "amber",
        });
      }
      return text;
    },
    [pathname, push],
  );
}
