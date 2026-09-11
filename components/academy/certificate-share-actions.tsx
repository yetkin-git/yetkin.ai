"use client";

import { useMemo, useState } from "react";
import { copyTextToClipboard } from "@/components/auth/copy-text";
import { buttonClassName } from "@/components/ui/button";
import { IconCheck, IconCopy, IconLinkedIn, IconX } from "@/components/ui/icons";
import {
  academyCertificateShareText,
  academyPublicVerifyUrl,
  linkedInShareUrl,
  xShareUrl,
} from "@/lib/academy/certificate-share";
import { isAcademyVerifyHash } from "@/lib/academy/lesson-note-paths";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";

export function CertificateShareActions({
  hash,
  courseTitle,
  showLead = false,
}: {
  hash: string;
  courseTitle?: string;
  showLead?: boolean;
}) {
  const copy = ACADEMY_SEN.certificates;
  const [notice, setNotice] = useState<string | null>(null);
  const verifyUrl = useMemo(() => academyPublicVerifyUrl(hash), [hash]);
  const text = useMemo(() => academyCertificateShareText(courseTitle), [courseTitle]);
  const linkedInHref = useMemo(() => linkedInShareUrl(verifyUrl), [verifyUrl]);
  const twitterHref = useMemo(() => xShareUrl(verifyUrl, text), [verifyUrl, text]);

  if (!isAcademyVerifyHash(hash)) {
    return null;
  }

  async function onCopy() {
    const ok = await copyTextToClipboard(verifyUrl);
    setNotice(ok ? copy.shareCopied : copy.shareCopyFail);
    window.setTimeout(() => setNotice(null), 1800);
  }

  return (
    <div className="space-y-2">
      {showLead ? <p className="text-xs text-[var(--muted)]">{copy.shareLead}</p> : null}
      <div className="flex flex-wrap gap-2">
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
          href={twitterHref}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClassName("outline", "sm")}
        >
          <IconX />
          {copy.shareX}
        </a>
        <button
          type="button"
          onClick={() => void onCopy()}
          className={buttonClassName("ghost", "sm")}
        >
          {notice === copy.shareCopied ? <IconCheck /> : <IconCopy />}
          {notice ?? copy.shareCopy}
        </button>
      </div>
    </div>
  );
}
