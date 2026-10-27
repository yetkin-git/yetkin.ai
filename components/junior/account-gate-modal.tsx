"use client";

import { useEffect, useId, useRef } from "react";
import { Button } from "@/components/ui/button";
import { IconClose } from "@/components/ui/icons";
import { LinkButton } from "@/components/ui/link-button";

export type JuniorAccountGate = "ready" | "account" | "profile";

/**
 * Anlatış ve quiz, oturum ve çocuk profili olmadan sunucuya gitmez.
 * Düğme görünür kalır; basınca bu pencere üyeliğe veya profile gider.
 */
export function JuniorAccountGateModal({
  open,
  gate,
  onClose,
  loginHref,
  registerHref,
  profileHref,
}: {
  open: boolean;
  gate: Exclude<JuniorAccountGate, "ready">;
  onClose: () => void;
  loginHref: string;
  registerHref: string;
  profileHref: string;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const needsAccount = gate === "account";

  useEffect(() => {
    if (!open) {
      return;
    }
    panelRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4"
      role="presentation"
      data-junior-account-gate={gate}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="grid w-full max-w-md gap-4 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
            {needsAccount ? "Anlatış ve test için üyelik gerekir" : "Çocuk profili olmadan puan yazılmaz"}
          </h2>
          <Button type="button" variant="ghost" size="sm" aria-label="Kapat" onClick={onClose}>
            <IconClose className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm leading-6 text-[var(--muted)]">
          {needsAccount
            ? "Dersi dinlemeye devam edebilirsin. Anlatışın ve quiz puanın karnene yazılması için veli hesabı ve ardından bir çocuk profili gerekir. Kayıt, oturum olmadan sunucuya gitmez."
            : "Hesabın açık. Anlatış ve quiz, aktif bir çocuk profiline yazılır. Profili oluşturup bu derse dönünce puan karnede durur."}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          {needsAccount ? (
            <>
              <LinkButton href={registerHref} className="w-full sm:flex-1">
                Hızlı üyelik
              </LinkButton>
              <LinkButton href={loginHref} variant="outline" className="w-full sm:flex-1">
                Giriş yap
              </LinkButton>
            </>
          ) : (
            <LinkButton href={profileHref} className="w-full">
              Çocuk profili oluştur
            </LinkButton>
          )}
        </div>
      </div>
    </div>
  );
}
