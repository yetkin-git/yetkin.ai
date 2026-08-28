import { RoomFrame } from "@/components/ui/page-header";

function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-[var(--border)] ${className}`} />;
}

export function DevlabsRoomSkeleton({
  variant = "catalog",
}: {
  variant?: "catalog" | "board";
}) {
  if (variant === "board") {
    return (
      <RoomFrame aria-hidden>
        <div className="space-y-3">
          <Pulse className="h-3 w-36 rounded-full bg-[var(--safir-soft)]" />
          <Pulse className="h-8 w-64" />
          <Pulse className="h-4 w-full max-w-xl" />
        </div>
        <div className="space-y-3">
          <Pulse className="h-20 rounded-2xl" />
          <Pulse className="h-20 rounded-2xl" />
          <Pulse className="h-20 rounded-2xl" />
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          <Pulse className="h-16 rounded-2xl" />
          <Pulse className="h-16 rounded-2xl" />
          <Pulse className="h-16 rounded-2xl" />
          <Pulse className="h-16 rounded-2xl" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Pulse className="h-56 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
          <Pulse className="h-56 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
        </div>
        <Pulse className="h-64 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
      </RoomFrame>
    );
  }

  return (
    <RoomFrame aria-hidden>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-3">
          <Pulse className="h-3 w-28 rounded-full bg-[var(--safir-soft)]" />
          <Pulse className="h-8 w-56" />
          <Pulse className="h-4 w-full max-w-xl" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Pulse className="h-[5.5rem] rounded-2xl border border-[var(--border)] bg-[var(--surface)]" />
        <Pulse className="h-[5.5rem] rounded-2xl border border-[var(--border)] bg-[var(--surface)]" />
        <Pulse className="h-[5.5rem] rounded-2xl border border-[var(--border)] bg-[var(--surface)]" />
      </div>
      <div className="space-y-3">
        <Pulse className="h-20 rounded-2xl" />
        <Pulse className="h-20 rounded-2xl" />
        <Pulse className="h-20 rounded-2xl" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Pulse className="h-16 rounded-2xl" />
        <Pulse className="h-16 rounded-2xl" />
        <Pulse className="h-16 rounded-2xl" />
        <Pulse className="h-16 rounded-2xl" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Pulse className="h-44 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
        <Pulse className="h-44 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
        <Pulse className="h-44 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <Pulse className="h-64 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] lg:col-span-2" />
        <Pulse className="h-64 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] lg:col-span-3" />
      </div>
    </RoomFrame>
  );
}
