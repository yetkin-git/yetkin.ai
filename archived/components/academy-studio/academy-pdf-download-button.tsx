"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";
import {
  academyCurriculumPdfPath,
  academyLessonPdfPath,
} from "@/lib/academy/lesson-note-paths";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

async function readPdfFailMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as { error?: unknown; ok?: unknown };
    if (typeof body.error === "string" && body.error.trim().length > 0) {
      return body.error.trim();
    }
  } catch {
    // binary / boş gövde — genel fail-closed
  }
  return fallback;
}

export function AcademyPdfDownloadButton({
  courseId,
  lessonKey,
  label,
  ready = true,
  lockedHint,
}: {
  courseId: string;
  lessonKey?: string | null;
  label?: string;
  /** Vatandaş: ders/müfredat tamam olmadan basım kapalı. Super Admin lab API'de açılır. */
  ready?: boolean;
  lockedHint?: string;
}) {
  const copy = ACADEMY_SEN.proof;
  const player = ACADEMY_SEN.player;
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const text = label ?? (lessonKey ? player.pdfCta : player.curriculumPdfCta);
  const locked =
    lockedHint ??
    (lessonKey ? player.pdfLessonLocked : player.pdfCurriculumLocked);

  async function onDownload() {
    if (!ready) {
      setError(locked);
      return;
    }
    setPending(true);
    setError(null);
    try {
      const path = lessonKey
        ? academyLessonPdfPath(courseId, lessonKey)
        : academyCurriculumPdfPath(courseId);
      const response = await fetch(path, withRailApiVersion());
      if (!response.ok) {
        setError(await readPdfFailMessage(response, copy.pdfFail));
        setPending(false);
        return;
      }
      const blob = await response.blob();
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const header = response.headers.get("content-disposition");
      const match = header?.match(/filename="([^"]+)"/u);
      anchor.href = href;
      anchor.download = match?.[1] ?? "ders-notu.pdf";
      anchor.click();
      URL.revokeObjectURL(href);
    } catch {
      setError(UX_SEN.http.network);
    } finally {
      setPending(false);
    }
  }

  return (
    <span className="inline-flex flex-col gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-11"
        disabled={pending || !ready}
        title={!ready ? locked : undefined}
        onClick={() => void onDownload()}
      >
        {pending ? player.completing : text}
      </Button>
      {error ? (
        <span aria-live="assertive" className="text-xs text-[var(--rose)]">
          {error}
        </span>
      ) : null}
    </span>
  );
}
