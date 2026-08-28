import { RoomFrame } from "@/components/ui/page-header";

function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-[var(--border)] ${className}`} />;
}

export function StudioRoomSkeleton({ variant = "workbench" }: { variant?: "workbench" }) {
  void variant;
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
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(16rem,0.9fr)] lg:items-start">
        <Pulse className="h-72 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
        <div className="space-y-4">
          <Pulse className="h-40 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
          <Pulse className="h-28 rounded-[var(--radius-card)]" />
          <Pulse className="h-28 rounded-[var(--radius-card)]" />
        </div>
      </div>
    </RoomFrame>
  );
}
