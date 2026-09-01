import { RoomFrame } from "@/components/ui/page-header";

function Pulse({ className }: { className: string }) {
  return (
    <div className={`animate-pulse rounded-2xl bg-[var(--border)] motion-reduce:animate-none ${className}`} />
  );
}

export function FreelancerRoomSkeleton({
  variant = "catalog",
}: {
  variant?: "catalog" | "job" | "contract" | "form";
}) {
  if (variant === "job") {
    return (
      <RoomFrame aria-hidden>
        <div className="space-y-3">
          <Pulse className="h-3 w-28 rounded-full bg-[var(--safir-soft)]" />
          <Pulse className="h-8 w-64" />
          <Pulse className="h-4 w-full max-w-xl" />
        </div>
        <Pulse className="h-28 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
        <div className="grid gap-3">
          <Pulse className="h-20 rounded-2xl" />
          <Pulse className="h-20 rounded-2xl" />
          <Pulse className="h-20 rounded-2xl" />
        </div>
        <Pulse className="h-40 rounded-[var(--radius-card)]" />
      </RoomFrame>
    );
  }

  if (variant === "contract") {
    return (
      <RoomFrame aria-hidden>
        <div className="space-y-3">
          <Pulse className="h-3 w-32 rounded-full bg-[var(--safir-soft)]" />
          <Pulse className="h-8 w-56" />
          <Pulse className="h-4 w-full max-w-lg" />
        </div>
        <Pulse className="h-48 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
        <Pulse className="h-36 rounded-[var(--radius-card)]" />
        <Pulse className="h-48 rounded-[var(--radius-card)]" />
      </RoomFrame>
    );
  }

  if (variant === "form") {
    return (
      <RoomFrame className="max-w-2xl" aria-hidden>
        <div className="space-y-3">
          <Pulse className="h-3 w-24 rounded-full bg-[var(--safir-soft)]" />
          <Pulse className="h-8 w-48" />
          <Pulse className="h-4 w-full max-w-lg" />
        </div>
        <Pulse className="h-72 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
      </RoomFrame>
    );
  }

  return (
    <RoomFrame className="space-y-2.5" aria-hidden>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl space-y-1">
          <Pulse className="h-7 w-40" />
          <Pulse className="h-4 w-full max-w-md" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Pulse className="h-5 w-24 rounded-full" />
          <Pulse className="h-8 w-28 rounded-xl" />
        </div>
      </div>
      <Pulse className="h-12 rounded-2xl border border-[var(--border)] bg-[var(--surface)]" />
      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <li>
          <Pulse className="h-44 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
        </li>
        <li>
          <Pulse className="h-44 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
        </li>
        <li>
          <Pulse className="h-44 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
        </li>
      </ul>
      <Pulse className="h-14 rounded-2xl border border-[var(--border)] bg-[var(--surface)]" />
      <div className="flex gap-3 overflow-hidden pt-2">
        <Pulse className="h-36 w-72 shrink-0 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
        <Pulse className="h-36 w-72 shrink-0 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
        <Pulse className="h-36 w-72 shrink-0 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
      </div>
    </RoomFrame>
  );
}
