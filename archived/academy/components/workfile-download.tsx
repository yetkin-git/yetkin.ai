"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { IconClose } from "@/components/ui/icons";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { OFF101_STARTER_PACK_NAME, officeAiStarterPackZip } from "@/lib/academy/workfile-pack";
import type { Route } from "next";

function downloadStarterPack() {
  const bytes = officeAiStarterPackZip();
  const payload = new Uint8Array(bytes.byteLength);
  payload.set(bytes);
  const blob = new Blob([payload], { type: "application/zip" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = OFF101_STARTER_PACK_NAME;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
}

/**
 * Ücretsiz ilk dersin yanında indirme.
 * Oturum yoksa kayıt penceresi açılır; dosya oturumsuz inmez.
 */
export function WorkfileDownload({
  signedIn,
  loginHref,
  registerHref,
}: {
  signedIn: boolean;
  loginHref: string;
  registerHref: string;
}) {
  const copy = ACADEMY_SEN.course;
  const titleId = useId();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <div data-academy-workfile="">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full sm:w-auto"
        data-academy-workfile-download=""
        onClick={() => {
          if (!signedIn) {
            setOpen(true);
            return;
          }
          downloadStarterPack();
        }}
      >
        {copy.workfileCta}
      </Button>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy.workfileHint}</p>
      {open ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4"
          role="presentation"
          data-academy-lead-capture=""
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="grid w-full max-w-md gap-4 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 id={titleId} className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
                {copy.workfileGateTitle}
              </h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={copy.workfileGateDismiss}
                onClick={() => setOpen(false)}
              >
                <IconClose className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm leading-6 text-[var(--muted)]">{copy.workfileGateBody}</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <LinkButton href={registerHref as Route} className="w-full sm:flex-1">
                {copy.workfileRegisterCta}
              </LinkButton>
              <LinkButton href={loginHref as Route} variant="outline" className="w-full sm:flex-1">
                {copy.workfileLoginCta}
              </LinkButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
