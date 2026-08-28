import { RoomFrame } from "@/components/ui/page-header";

function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-[var(--border)] ${className}`} />;
}

export function PazaryeriRoomSkeleton({
  variant = "catalog",
}: {
  variant?: "catalog" | "product" | "form" | "orders";
}) {
  if (variant === "product") {
    return (
      <RoomFrame className="max-w-3xl" aria-hidden>
        <div className="space-y-3">
          <Pulse className="h-3 w-28 rounded-full bg-[var(--safir-soft)]" />
          <Pulse className="h-8 w-64" />
          <Pulse className="h-4 w-full max-w-xl" />
        </div>
        <Pulse className="h-36 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
        <div className="grid gap-3">
          <Pulse className="h-20 rounded-2xl" />
          <Pulse className="h-20 rounded-2xl" />
          <Pulse className="h-20 rounded-2xl" />
        </div>
        <Pulse className="h-40 rounded-[var(--radius-card)]" />
      </RoomFrame>
    );
  }

  if (variant === "form") {
    return (
      <RoomFrame aria-hidden>
        <div className="space-y-3">
          <Pulse className="h-3 w-24 rounded-full bg-[var(--safir-soft)]" />
          <Pulse className="h-8 w-48" />
          <Pulse className="h-4 w-full max-w-lg" />
        </div>
        <Pulse className="h-72 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
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
      </RoomFrame>
    );
  }

  if (variant === "orders") {
    return (
      <RoomFrame aria-hidden>
        <div className="space-y-3">
          <Pulse className="h-3 w-24 rounded-full bg-[var(--safir-soft)]" />
          <Pulse className="h-8 w-40" />
          <Pulse className="h-4 w-full max-w-lg" />
        </div>
        <div className="space-y-3">
          <Pulse className="h-28 rounded-[var(--radius-card)]" />
          <Pulse className="h-28 rounded-[var(--radius-card)]" />
          <Pulse className="h-28 rounded-[var(--radius-card)]" />
        </div>
      </RoomFrame>
    );
  }

  return (
    <RoomFrame aria-hidden>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-3">
          <Pulse className="h-3 w-24 rounded-full bg-[var(--safir-soft)]" />
          <Pulse className="h-8 w-56" />
          <Pulse className="h-4 w-full max-w-xl" />
        </div>
        <Pulse className="h-10 w-32 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Pulse className="h-[5.5rem] rounded-2xl border border-[var(--border)] bg-[var(--surface)]" />
        <Pulse className="h-[5.5rem] rounded-2xl border border-[var(--border)] bg-[var(--surface)]" />
        <Pulse className="h-[5.5rem] rounded-2xl border border-[var(--border)] bg-[var(--surface)]" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Pulse className="h-64 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
        <Pulse className="h-64 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
      </div>
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
    </RoomFrame>
  );
}
