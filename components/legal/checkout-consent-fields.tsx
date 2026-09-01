"use client";

import Link from "next/link";
import { LEGAL_CHECKOUT_CONSENT_COPY } from "@/lib/copy/legal-launch";

export function CheckoutConsentFields({
  distanceAccepted,
  digitalAccepted,
  onDistanceChange,
  onDigitalChange,
  showWalletHint = false,
}: {
  distanceAccepted: boolean;
  digitalAccepted: boolean;
  onDistanceChange: (value: boolean) => void;
  onDigitalChange: (value: boolean) => void;
  showWalletHint?: boolean;
}) {
  const copy = LEGAL_CHECKOUT_CONSENT_COPY;
  return (
    <fieldset className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/40 p-3">
      <legend className="sr-only">Yasal rıza</legend>
      <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-[var(--foreground)]">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--safir)]"
          checked={distanceAccepted}
          onChange={(event) => onDistanceChange(event.target.checked)}
        />
        <span>
          <Link href={copy.distanceHref} className="font-semibold text-[var(--safir-deep)] hover:underline">
            Mesafeli Satış Sözleşmesi
          </Link>
          {" ve "}
          <Link href={copy.preInfoHref} className="font-semibold text-[var(--safir-deep)] hover:underline">
            Ön Bilgilendirme Formu
          </Link>
          nu okudum, kabul ediyorum.
        </span>
      </label>
      <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-[var(--foreground)]">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--safir)]"
          checked={digitalAccepted}
          onChange={(event) => onDigitalChange(event.target.checked)}
        />
        <span>
          <Link href={copy.digitalHref} className="font-semibold text-[var(--safir-deep)] hover:underline">
            Dijital içeriğin anında ifa edileceğini
          </Link>{" "}
          kabul ediyorum.
        </span>
      </label>
      {showWalletHint ? <p className="text-[11px] leading-relaxed text-[var(--muted)]">{copy.walletHint}</p> : null}
    </fieldset>
  );
}
