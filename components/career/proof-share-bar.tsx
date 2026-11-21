"use client";

import { useMemo, useState } from "react";
import { copyTextToClipboard } from "@/components/auth/copy-text";
import { buttonClassName } from "@/components/ui/button";
import {
  IconCheck,
  IconCopy,
  IconLinkedIn,
  IconWhatsApp,
} from "@/components/ui/icons";
import {
  absoluteProofCardUrl,
  linkedInProofShareUrl,
  proofShareText,
  whatsAppProofShareUrl,
} from "@/lib/career/proof-share";
import { CAREER_SEN } from "@/lib/copy/sen-voice/career";

/**
 * Kamu kanıt kartı paylaşım çubuğu (`/vize/[id]`).
 *
 * Viral büyüme döngüsü (Faz 2 / P4): kart herkese açık ve doğrulanabilir, ama
 * üzerinde tek tıkla paylaşım aksiyonu yoktu. Her mühür bir organik backlink
 * fırsatıydı; bu çubuk o fırsatı kapıyor.
 *
 * Üç aksiyon: bağlantıyı kopyala (görsel onay geri bildirimi), LinkedIn
 * `share-offsite`, WhatsApp. Hepsi `rel="noopener noreferrer"` ve
 * `target="_blank"` taşır. İstemci tarafında kopyalama, mevcut
 * `copyTextToClipboard` yedeğiyle (execCommand) çalışır.
 *
 * Erişilebilirlik: onay metni `role="status"` ile duyurulur; düğme etiketi
 * onay sırasında değişir, ayrıca kalıcı `aria-live` bölgesi vardır.
 */
export function ProofShareBar({ path, title }: { path: string; title: string }) {
  const copy = CAREER_SEN.publicPage;
  const [notice, setNotice] = useState<string | null>(null);
  const url = useMemo(() => absoluteProofCardUrl(path), [path]);
  const text = useMemo(() => proofShareText(title), [title]);
  const linkedInHref = useMemo(() => linkedInProofShareUrl(url), [url]);
  const whatsAppHref = useMemo(() => whatsAppProofShareUrl(url, text), [url, text]);

  async function onCopy() {
    const ok = await copyTextToClipboard(url);
    setNotice(ok ? copy.shareCopied : copy.shareCopyFail);
    window.setTimeout(() => setNotice(null), 1800);
  }

  return (
    <section
      data-proof-share-bar=""
      aria-label={copy.shareBarTitle}
      className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm print:hidden"
    >
      <p className="text-sm font-semibold text-[var(--foreground)]">{copy.shareBarTitle}</p>
      <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{copy.shareBarLead}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => void onCopy()} className={buttonClassName("ghost", "sm")}>
          {notice === copy.shareCopied ? <IconCheck /> : <IconCopy />}
          {notice ?? copy.shareCopyLink}
        </button>
        <a
          href={linkedInHref}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClassName("outline", "sm")}
        >
          <IconLinkedIn />
          {copy.shareLinkedIn}
        </a>
        <a
          href={whatsAppHref}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClassName("outline", "sm")}
        >
          <IconWhatsApp />
          {copy.shareWhatsApp}
        </a>
      </div>
      <p role="status" aria-live="polite" className="mt-2 min-h-4 text-xs text-[var(--emerald)]">
        {notice === copy.shareCopied ? copy.shareCopied : ""}
      </p>
    </section>
  );
}
