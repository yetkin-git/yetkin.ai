"use client";

import { useId, useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { academyQrSvg } from "@/lib/academy/qr-matrix";
import {
  academyProofHashPreview,
  academyVerifyPath,
  academyVerifyUrl,
} from "@/lib/academy/lesson-note-paths";

export type ProofOfWorkCardModel = {
  holderName?: string | null;
  lessonTitle: string;
  courseTitle: string;
  instructorName: string;
  proofOfWorkHash: string;
  completedAt?: Date | string | null;
  kind?: "lesson" | "curriculum";
};

function completedLabel(value: Date | string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleString("tr-TR");
}

function cardSvgMarkup(model: ProofOfWorkCardModel, verifyUrl: string, qr: string, boundToPerson: boolean): string {
  const copy = ACADEMY_SEN.proof;
  const holder = boundToPerson ? model.holderName?.trim() || copy.anonymousHolder : copy.taskSubjectBody;
  const holderLabel = boundToPerson ? copy.studentLabel : copy.taskSubjectLabel;
  const when = completedLabel(model.completedAt) ?? "—";
  const kind = model.kind === "curriculum" ? copy.curriculumKind : copy.lessonKind;
  const escape = (text: string) =>
    text
      .replace(/&/gu, "&amp;")
      .replace(/</gu, "&lt;")
      .replace(/>/gu, "&gt;")
      .replace(/"/gu, "&quot;");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="640" viewBox="0 0 1080 640">
  <rect width="1080" height="640" fill="#f8fafc"/>
  <rect x="24" y="24" width="1032" height="592" rx="24" fill="#ffffff" stroke="#1a8cff" stroke-width="2"/>
  <text x="56" y="80" font-family="Segoe UI, Arial, sans-serif" font-size="18" fill="#1a8cff" font-weight="700">${escape(copy.eyebrow.toUpperCase())}</text>
  <text x="56" y="118" font-family="Segoe UI, Arial, sans-serif" font-size="28" fill="#0f172a" font-weight="700">${escape(copy.cardTitle)}</text>
  <text x="56" y="150" font-family="Segoe UI, Arial, sans-serif" font-size="14" fill="#64748b">${escape(kind)}</text>
  <text x="56" y="210" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#64748b">${escape(holderLabel)}</text>
  <text x="56" y="236" font-family="Segoe UI, Arial, sans-serif" font-size="22" fill="#0f172a" font-weight="600">${escape(holder)}</text>
  <text x="56" y="286" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#64748b">${escape(copy.lessonLabel)}</text>
  <text x="56" y="312" font-family="Segoe UI, Arial, sans-serif" font-size="18" fill="#0f172a">${escape(model.lessonTitle)}</text>
  <text x="56" y="356" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#64748b">${escape(copy.courseLabel)} · ${escape(copy.instructorLabel)}</text>
  <text x="56" y="382" font-family="Segoe UI, Arial, sans-serif" font-size="16" fill="#0f172a">${escape(model.courseTitle)} · Eğitmen ${escape(model.instructorName)}</text>
  <text x="56" y="430" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#64748b">${escape(copy.hashLabel)}</text>
  <text x="56" y="456" font-family="ui-monospace, Consolas, monospace" font-size="14" fill="#0f172a">${escape(academyProofHashPreview(model.proofOfWorkHash))}</text>
  <text x="56" y="500" font-family="Segoe UI, Arial, sans-serif" font-size="13" fill="#64748b">${escape(copy.completedLabel)}</text>
  <text x="56" y="526" font-family="Segoe UI, Arial, sans-serif" font-size="16" fill="#0f172a">${escape(when)}</text>
  <text x="56" y="580" font-family="ui-monospace, Consolas, monospace" font-size="11" fill="#64748b">${escape(verifyUrl)}</text>
  <g transform="translate(820, 160)">${qr.replace(/^<svg[^>]*>/u, "").replace(/<\/svg>$/u, "")}</g>
</svg>`;
}

export function ProofOfWorkCard({
  model,
  showDownload = true,
  showHolder = false,
}: {
  model: ProofOfWorkCardModel;
  showDownload?: boolean;
  showHolder?: boolean;
}) {
  const copy = ACADEMY_SEN.proof;
  const verifyHref = academyVerifyPath(model.proofOfWorkHash);
  const verifyUrl = academyVerifyUrl(model.proofOfWorkHash);
  const qr = academyQrSvg(verifyUrl, { cell: 3, margin: 1, dark: "#0f172a", light: "#ffffff" });
  const [error, setError] = useState<string | null>(null);
  const titleId = useId();
  const when = completedLabel(model.completedAt);
  const holder = model.holderName?.trim() || copy.anonymousHolder;

  async function downloadPng() {
    setError(null);
    if (!qr) {
      setError(copy.pngFail);
      return;
    }
    const svg = cardSvgMarkup(model, verifyUrl, qr, showHolder);
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    try {
      const image = new Image();
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("svg"));
        image.src = url;
      });
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 640;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("canvas");
      }
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0);
      const png = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!png) {
        throw new Error("png");
      }
      const href = URL.createObjectURL(png);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = `is-kaniti-${model.proofOfWorkHash.slice(0, 12)}.png`;
      anchor.click();
      URL.revokeObjectURL(href);
    } catch {
      setError(copy.pngFail);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  return (
    <div
      className="space-y-3 rounded-2xl border border-[var(--safir)] bg-[var(--surface)] p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--safir-deep)]">
            {copy.eyebrow}
          </p>
          <p id={titleId} className="mt-1 text-base font-semibold text-[var(--foreground)]">
            {copy.cardTitle}
          </p>
        </div>
        <Badge tone="gold">
          {model.kind === "curriculum" ? copy.curriculumKind : copy.lessonKind}
        </Badge>
      </div>
      <dl className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_7rem]">
        <div className="space-y-3">
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              {showHolder ? copy.studentLabel : copy.taskSubjectLabel}
            </dt>
            <dd className="text-sm text-[var(--foreground)]">
              {showHolder ? holder : copy.taskSubjectBody}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              {copy.lessonLabel}
            </dt>
            <dd className="text-sm text-[var(--foreground)]">{model.lessonTitle}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              {copy.instructorLabel}
            </dt>
            <dd className="text-sm text-[var(--foreground)]">Eğitmen {model.instructorName}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              {copy.hashLabel}
            </dt>
            <dd className="break-all font-mono text-xs text-[var(--foreground)]">
              {academyProofHashPreview(model.proofOfWorkHash)}
            </dd>
          </div>
          {when ? (
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                {copy.completedLabel}
              </dt>
              <dd className="text-sm text-[var(--foreground)]">{when}</dd>
            </div>
          ) : null}
        </div>
        <div className="justify-self-end">
          {qr ? (
            <div
              className="h-28 w-28 overflow-hidden rounded-lg border border-[var(--border)] bg-white p-1"
              // Mühürlü QR — kullanıcı girdisi değil.
              dangerouslySetInnerHTML={{ __html: qr }}
            />
          ) : null}
        </div>
      </dl>
      <div className="flex flex-wrap items-center gap-2">
        <LinkButton href={verifyHref} variant="outline" size="sm">
          {ACADEMY_SEN.certificates.verifyCta}
        </LinkButton>
        {showDownload ? (
          <Button type="button" variant="outline" size="sm" onClick={() => void downloadPng()}>
            {copy.pngCta}
          </Button>
        ) : null}
      </div>
      {error ? (
        <p aria-live="assertive" className="text-sm text-[var(--rose)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ProofOfWorkCardModal({
  open,
  model,
  onClose,
  extra,
}: {
  open: boolean;
  model: ProofOfWorkCardModel | null;
  onClose: () => void;
  extra?: ReactNode;
}) {
  const copy = ACADEMY_SEN.proof;
  if (!open || !model) {
    return null;
  }
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-[color-mix(in_srgb,var(--surface-ink)_45%,transparent)] p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={copy.cardTitle}
        className="max-h-[90vh] w-full max-w-lg space-y-3 overflow-y-auto rounded-2xl border border-[var(--safir-soft)] bg-[var(--surface)] p-5"
      >
        <ProofOfWorkCard model={model} showHolder={false} />
        {extra}
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          {copy.close}
        </Button>
      </div>
    </div>
  );
}
