"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { getJuniorLessonBlueprint } from "@/lib/junior/lesson-engine";

export function ActivityBadgeModal({
  open,
  lessonKey,
  onClose,
}: {
  open: boolean;
  lessonKey: string;
  onClose: () => void;
}) {
  const cheerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    cheerRef.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const blueprint = getJuniorLessonBlueprint(lessonKey);
  const badgeTitle = blueprint.badge.modalTitle;
  const badgeSubtitle = blueprint.badge.modalSubtitle;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-violet-950/45 p-4 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="junior-activity-cheer"
        data-junior-activity-cheer=""
        data-junior-badge-modal=""
        className="relative w-full max-w-md overflow-hidden rounded-[2rem] border-4 border-amber-300 bg-gradient-to-b from-amber-50 via-white to-fuchsia-50 px-6 py-7 text-center shadow-[0_24px_60px_rgba(109,40,217,0.35)]"
      >
        {/* Parlayan Rozet Madalyonu */}
        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full border-4 border-amber-400 bg-gradient-to-br from-amber-200 via-yellow-300 to-amber-500 shadow-[0_0_32px_rgba(251,191,36,0.75)]">
          <span className="text-5xl" aria-hidden="true">
            {blueprint.badge.icon}
          </span>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-amber-900">
          ✨ Yeni Rozet Kazanıldı ✨
        </span>

        <p id="junior-activity-cheer" className="mt-3 text-2xl font-extrabold text-fuchsia-700 sm:text-3xl">
          Harikasın! Tam Puan 🎉
        </p>

        <p className="mt-1.5 text-base font-extrabold text-slate-900">{badgeTitle}</p>
        <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-600">{badgeSubtitle}</p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-extrabold">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">✓ 1. Eşleştir</span>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">✓ 2. Boşluk Doldur</span>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-800">
            ✓ {blueprint.badge.thirdStepLabel}
          </span>
        </div>

        <button
          ref={cheerRef}
          type="button"
          className="mt-6 inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-600 via-violet-600 to-sky-500 px-8 text-base font-extrabold text-white shadow-lg transition hover:scale-105"
          onClick={onClose}
        >
          Devam
        </button>
      </div>
    </div>
  );
}

export function ActivityModal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) {
      return;
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-xs sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      data-junior-activity-modal=""
    >
      <div className="flex max-h-[90dvh] w-full max-w-4xl flex-col overflow-hidden rounded-[2rem] border-2 border-fuchsia-300 bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-fuchsia-100 bg-gradient-to-r from-fuchsia-50 via-white to-sky-50 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">
              🎮
            </span>
            <h2 className="text-base font-extrabold text-slate-900 sm:text-lg">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-junior-activity-modal-close=""
            className="inline-flex h-9 cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-white px-4 text-xs font-extrabold text-slate-700 hover:bg-slate-100"
          >
            ✕ Kapat
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
