"use client";

import { useMemo, useState } from "react";
import { copyTextToClipboard } from "@/components/auth/copy-text";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconCheck, IconCopy, IconLinkedIn } from "@/components/ui/icons";
import { LinkButton } from "@/components/ui/link-button";
import { absoluteAppUrl, linkedInAddCertificationUrl } from "@/lib/career/badge-share";
import { CAREER_SEN } from "@/lib/copy/sen-voice/career";

export type SealShareGuideModel = {
  talentHref: string;
  verifyHref: string | null;
  courseTitle: string;
  issuedAt: Date | string;
  certId: string;
};

function issuedDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function CopyRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const [notice, setNotice] = useState<string | null>(null);
  const copy = CAREER_SEN.badge;

  async function onCopy() {
    const ok = await copyTextToClipboard(value);
    setNotice(ok ? copy.copied : copy.copyFail);
    window.setTimeout(() => setNotice(null), 1800);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="outline" size="sm" onClick={() => void onCopy()}>
        {notice === copy.copied ? <IconCheck /> : <IconCopy />}
        {notice ?? label}
      </Button>
      <p className="min-w-0 flex-1 break-all font-mono text-[11px] text-[var(--muted)]">{value}</p>
    </div>
  );
}

export function SealShareGuides({ model }: { model: SealShareGuideModel | null }) {
  const copy = CAREER_SEN.badge;
  const talentUrl = useMemo(
    () => (model ? absoluteAppUrl(model.talentHref) : null),
    [model],
  );
  const verifyUrl = useMemo(
    () => (model?.verifyHref ? absoluteAppUrl(model.verifyHref) : null),
    [model],
  );
  const linkedInHref = useMemo(() => {
    if (!model || !talentUrl) {
      return null;
    }
    const certUrl = verifyUrl ?? talentUrl;
    const issuedAt = issuedDate(model.issuedAt);
    if (Number.isNaN(issuedAt.getTime())) {
      return null;
    }
    return linkedInAddCertificationUrl({
      name: model.courseTitle,
      certUrl,
      certId: model.certId,
      issuedAt,
    });
  }, [model, talentUrl, verifyUrl]);

  if (!model || !talentUrl) {
    return (
      <Card variant="default" title={copy.cvTitle} className="shadow-sm">
        <p>{copy.locked}</p>
        <div className="mt-4">
          <LinkButton href="/academy" variant="outline" size="sm">
            {copy.lockedCta}
          </LinkButton>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card eyebrow={copy.cvEyebrow} title={copy.cvTitle} className="shadow-sm">
        <p>{copy.cvLead}</p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[var(--foreground)]">
          <li>{copy.cvStep1}</li>
          <li>{copy.cvStep2}</li>
          <li>{copy.cvStep3}</li>
        </ol>
        <div className="mt-4 space-y-2">
          <CopyRow label={copy.copyTalent} value={talentUrl} />
          {verifyUrl ? <CopyRow label={copy.copyVerify} value={verifyUrl} /> : null}
        </div>
      </Card>
      <Card eyebrow={copy.linkedInEyebrow} title={copy.linkedInTitle} className="shadow-sm">
        <p>{copy.linkedInLead}</p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[var(--foreground)]">
          <li>{copy.linkedInStep1}</li>
          <li>{copy.linkedInStep2}</li>
          <li>{copy.linkedInStep3}</li>
        </ol>
        <div className="mt-4">
          {linkedInHref ? (
            <a
              href={linkedInHref}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClassName("primary", "sm")}
            >
              <IconLinkedIn />
              {copy.linkedInOpen}
            </a>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

export function SealShareGuideButtons({ model }: { model: SealShareGuideModel | null }) {
  const copy = CAREER_SEN.badge;
  if (!model) {
    return (
      <LinkButton href="/academy" variant="outline" size="sm">
        {copy.lockedCta}
      </LinkButton>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      <a href="#career-seal-guides" className={buttonClassName("secondary", "sm")}>
        {copy.cvCta}
      </a>
      <a href="#career-seal-guides" className={buttonClassName("outline", "sm")}>
        <IconLinkedIn />
        {copy.linkedInCta}
      </a>
    </div>
  );
}
