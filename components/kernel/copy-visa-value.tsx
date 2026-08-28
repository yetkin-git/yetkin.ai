"use client";

import { useState } from "react";
import { copyTextToClipboard } from "@/components/auth/copy-text";
import { Button } from "@/components/ui/button";
import { IconCheck, IconCopy } from "@/components/ui/icons";
import { CAREER_SEN } from "@/lib/copy/sen-voice/career";

/** Tek tıkla vize anahtarı / SHA-256 kopyalama ritüeli. */
export function CopyVisaValue({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  const [notice, setNotice] = useState<string | null>(null);

  async function onCopy() {
    const ok = await copyTextToClipboard(value);
    setNotice(ok ? CAREER_SEN.copied : CAREER_SEN.copyFail);
    window.setTimeout(() => setNotice(null), 1800);
  }

  return (
    <div className="mt-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
        {label}
      </p>
      <div className="mt-1 flex flex-wrap items-start gap-2">
        <p className="min-w-0 flex-1 break-all font-mono text-[11px] leading-5 text-[var(--muted)]">
          {value}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCopy}
          aria-label={`${label} — kopyala`}
          className="shrink-0"
        >
          {notice === CAREER_SEN.copied ? <IconCheck /> : <IconCopy />}
          {notice ?? "Kopyala"}
        </Button>
      </div>
    </div>
  );
}
