import type { HTMLAttributes } from "react";
import { RoomFrame } from "@/components/ui/page-header";

function Pulse({ className, ...rest }: { className: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-[var(--border)] motion-reduce:animate-none ${className}`}
      {...rest}
    />
  );
}

export function AcademyRoomSkeleton({
  variant = "catalog",
}: {
  variant?: "catalog" | "course" | "play" | "seal" | "verify";
}) {
  if (variant === "play") {
    return (
      <RoomFrame cinema className="flex flex-col px-1 pt-1 pb-8 sm:px-2" aria-hidden>
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start lg:gap-6">
          <div className="flex min-h-0 flex-col gap-3 lg:col-start-1">
            <Pulse className="h-7 w-56 rounded-lg" />
            <Pulse className="aspect-video w-full rounded-[1.15rem]" />
            <Pulse className="h-64 w-full rounded-2xl" />
            <Pulse className="h-11 w-full rounded-[0.9rem]" />
          </div>
          <div className="hidden min-h-0 space-y-1.5 overflow-hidden lg:block">
            <Pulse className="h-11 rounded-[0.9rem]" />
            <Pulse className="h-11 rounded-[0.9rem]" />
            <Pulse className="h-11 rounded-[0.9rem]" />
            <Pulse className="h-11 rounded-[0.9rem]" />
          </div>
        </div>
      </RoomFrame>
    );
  }

  if (variant === "course") {
    return (
      <RoomFrame className="space-y-5" aria-hidden>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl space-y-3">
            <Pulse className="h-3 w-32 rounded-full bg-[var(--safir-soft)]" />
            <Pulse className="h-8 w-72" />
            <Pulse className="h-4 w-full max-w-xl" />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Pulse className="h-6 w-20 rounded-md" />
            <Pulse className="h-6 w-16 rounded-full" />
            <Pulse className="h-8 w-24 rounded-xl" />
          </div>
        </div>
        <Pulse className="min-h-48 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
        <Pulse className="min-h-40 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
      </RoomFrame>
    );
  }

  if (variant === "verify") {
    return (
      <RoomFrame aria-hidden>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-3">
            <Pulse className="h-3 w-32 rounded-full bg-[var(--safir-soft)]" />
            <Pulse className="h-8 w-56" />
            <Pulse className="h-4 w-full max-w-lg" />
          </div>
          <Pulse className="h-8 w-24 rounded-xl" />
        </div>
        <Pulse className="min-h-64 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
      </RoomFrame>
    );
  }

  if (variant === "seal") {
    return (
      <RoomFrame aria-hidden>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl space-y-3">
            <Pulse className="h-3 w-32 rounded-full bg-[var(--safir-soft)]" />
            <Pulse className="h-8 w-48" />
            <Pulse className="h-4 w-full max-w-lg" />
          </div>
          <Pulse className="h-8 w-24 rounded-xl" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Pulse className="h-40 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
          <Pulse className="h-40 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
        </div>
      </RoomFrame>
    );
  }

  return (
    <RoomFrame className="space-y-3 pb-8" aria-hidden>
      <div className="flex flex-col gap-3">
        <div className="relative z-10 flex flex-col gap-3">
          <div
            className="flex flex-wrap items-center justify-between gap-2"
            data-academy-skeleton-header=""
          >
            <div className="space-y-2">
              <Pulse className="h-3 w-28 rounded-full bg-[var(--safir-soft)]" />
              <Pulse className="h-7 w-48" />
            </div>
            <Pulse className="h-10 w-28 rounded-xl" />
          </div>
        </div>
        <ul className="grid gap-4 md:grid-cols-3" data-academy-skeleton-grid="">
          <li className="md:col-span-2">
            <Pulse className="h-48 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
          </li>
          <li>
            <Pulse className="h-48 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
          </li>
          <li>
            <Pulse className="h-40 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
          </li>
          <li>
            <Pulse className="h-40 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
          </li>
          <li>
            <Pulse className="h-40 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
          </li>
        </ul>
      </div>
    </RoomFrame>
  );
}
