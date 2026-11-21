"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import type { AcademyContinueBoard } from "@/lib/academy/continue-board";
import {
  dismissAcademyContinue,
  getAcademyContinueDismissClientSnapshot,
  getAcademyContinueDismissServerSnapshot,
  isAcademyContinueDismissed,
  subscribeAcademyContinueDismiss,
} from "@/lib/academy/continue-dismiss";
import { IconClose } from "@/components/ui/icons";
import type { Route } from "next";

function isResumeStrip(board: AcademyContinueBoard): boolean {
  return board.phase === "exam" || board.completedCount > 0;
}

/** Katalog / kurs — kaldığı derse veya sınav kapısına tek satır şerit (`board.href`). */
export function AcademyContinuePanel({ board }: { board: AcademyContinueBoard }) {
  const dismissedSlugs = useSyncExternalStore(
    subscribeAcademyContinueDismiss,
    getAcademyContinueDismissClientSnapshot,
    getAcademyContinueDismissServerSnapshot,
  );

  if (!isResumeStrip(board)) {
    return null;
  }
  if (isAcademyContinueDismissed(board.courseSlug, dismissedSlugs)) {
    return null;
  }

  const copy = ACADEMY_SEN.player;
  const exam = board.phase === "exam";
  const cta = exam ? copy.continueExamCta : copy.continueStripCta;
  const lead = exam
    ? copy.continueExamLead(board.courseTitle)
    : copy.continueLead(board.completedCount, board.totalCount, board.courseTitle);
  const hint = exam
    ? copy.continueExamHint
    : `${board.completedCount}/${board.totalCount}`;

  return (
    <div
      data-academy-continue-panel=""
      data-academy-command-line=""
      className="flex min-h-9 items-center gap-1 rounded-lg border border-[var(--safir)]/25 bg-[var(--safir-soft)]/50 py-2 pl-3 pr-1 text-[var(--foreground)] transition-[border-color] hover:border-[var(--safir)]/45"
    >
      <Link
        href={board.href as Route}
        aria-label={`${copy.continueEyebrow}. ${lead}. ${cta}`}
        className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-md py-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--safir-soft)] focus-visible:ring-offset-2"
      >
        <span className="min-w-0 truncate text-sm leading-none">
          <span className="font-semibold text-[var(--safir-deep)]">{copy.continueEyebrow}</span>
          <span className="text-[var(--muted)]"> · </span>
          <span className="font-medium">{board.courseTitle}</span>
          <span className="text-[var(--muted)]"> · {hint}</span>
        </span>
        <span className="shrink-0 text-sm font-semibold leading-none text-[var(--safir-deep)]">
          {cta}
        </span>
      </Link>
      <button
        type="button"
        aria-label={copy.continueDismiss}
        data-academy-continue-dismiss=""
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--safir-soft)]"
        onClick={() => dismissAcademyContinue(board.courseSlug)}
      >
        <IconClose className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
