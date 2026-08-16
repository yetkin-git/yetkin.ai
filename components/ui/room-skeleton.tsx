import { RoomFrame } from "@/components/ui/page-header";

export function SkeletonPulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-[var(--border)] ${className}`} />;
}

export type RoomSkeletonVariant =
  | "hub"
  | "youth"
  | "metrics"
  | "prize"
  | "cockpit"
  | "sanctuary"
  | "form"
  | "shield"
  | "detail"
  | "public"
  | "legal";

/**
 * Oda kabuğuyla izomorf iskelet. Müze 151 loading.tsx kopyası değil;
 * mevcut RoomFrame / max-w-3xl / auth kartı geometrisine oturur.
 */
export function RoomSkeleton({
  variant,
}: {
  variant: RoomSkeletonVariant;
}) {
  if (variant === "public") {
    return (
      <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-10 px-6 py-16" aria-hidden>
        <div className="relative grid items-center gap-10 lg:grid-cols-2">
          <div className="space-y-4">
            <SkeletonPulse className="h-12 w-12 rounded-[8px]" />
            <SkeletonPulse className="h-5 w-24 rounded-full bg-[var(--safir-soft)]" />
            <SkeletonPulse className="h-12 w-72" />
            <SkeletonPulse className="h-4 w-full max-w-xl" />
            <div className="flex gap-3">
              <SkeletonPulse className="h-11 w-40 rounded-xl" />
              <SkeletonPulse className="h-11 w-24 rounded-xl" />
            </div>
          </div>
          <SkeletonPulse className="h-56 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <li key={index}>
              <SkeletonPulse className="h-24 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
            </li>
          ))}
        </ul>
      </main>
    );
  }

  if (variant === "legal") {
    return (
      <main className="relative mx-auto max-w-3xl px-6 py-16" aria-hidden>
        <div className="relative space-y-6">
          <SkeletonPulse className="h-5 w-20 rounded-full bg-[var(--safir-soft)]" />
          <SkeletonPulse className="h-9 w-56" />
          <SkeletonPulse className="h-36 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
          <SkeletonPulse className="h-48 rounded-[var(--radius-card)]" />
        </div>
      </main>
    );
  }

  if (variant === "detail") {
    return (
      <div className="mx-auto max-w-3xl space-y-6" aria-hidden>
        <SkeletonPulse className="h-3 w-40 rounded-full bg-[var(--safir-soft)]" />
        <SkeletonPulse className="h-8 w-64" />
        <SkeletonPulse className="h-40 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
        <SkeletonPulse className="h-28 rounded-[var(--radius-card)]" />
      </div>
    );
  }

  if (variant === "form") {
    return (
      <RoomFrame className="max-w-2xl" aria-hidden>
        <HeaderPulses action />
        <SkeletonPulse className="h-72 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
      </RoomFrame>
    );
  }

  if (variant === "shield") {
    return (
      <RoomFrame aria-hidden>
        <HeaderPulses action />
        <SkeletonPulse className="h-20 rounded-2xl border border-[var(--border)] bg-[var(--safir-soft)]" />
        <SkeletonPulse className="h-56 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
      </RoomFrame>
    );
  }

  if (variant === "cockpit") {
    return (
      <RoomFrame aria-hidden>
        <HeaderPulses />
        <SkeletonPulse className="h-20 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
        <div className="flex flex-wrap gap-2.5">
          {Array.from({ length: 8 }, (_, index) => (
            <SkeletonPulse key={index} className="h-9 w-24 rounded-full" />
          ))}
        </div>
        <SkeletonPulse className="h-36 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <SkeletonPulse
              key={index}
              className="h-32 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]"
            />
          ))}
        </div>
      </RoomFrame>
    );
  }

  if (variant === "prize") {
    return (
      <RoomFrame aria-hidden>
        <HeaderPulses action />
        <SkeletonPulse className="h-40 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
        <StatPulses />
        <div className="grid gap-4 md:grid-cols-2">
          <SkeletonPulse className="h-44 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
          <SkeletonPulse className="h-44 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
        </div>
      </RoomFrame>
    );
  }

  if (variant === "metrics") {
    return (
      <RoomFrame aria-hidden>
        <HeaderPulses action />
        <SkeletonPulse className="h-36 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
        <SkeletonPulse className="h-48 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
        <div className="grid gap-4 md:grid-cols-2">
          <SkeletonPulse className="h-36 rounded-[var(--radius-card)]" />
          <SkeletonPulse className="h-36 rounded-[var(--radius-card)]" />
        </div>
      </RoomFrame>
    );
  }

  if (variant === "youth") {
    return (
      <RoomFrame aria-hidden>
        <HeaderPulses action />
        <div className="grid gap-3 sm:grid-cols-3">
          <SkeletonPulse className="h-16 rounded-2xl" />
          <SkeletonPulse className="h-16 rounded-2xl" />
          <SkeletonPulse className="h-16 rounded-2xl" />
        </div>
        <SkeletonPulse className="h-48 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
        <div className="grid gap-4 md:grid-cols-2">
          <SkeletonPulse className="h-36 rounded-[var(--radius-card)]" />
          <SkeletonPulse className="h-36 rounded-[var(--radius-card)]" />
        </div>
      </RoomFrame>
    );
  }

  if (variant === "sanctuary") {
    return (
      <RoomFrame aria-hidden>
        <HeaderPulses />
        <StatPulses />
        <SkeletonPulse className="h-64 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)]" />
        <SkeletonPulse className="h-28 rounded-[var(--radius-card)]" />
      </RoomFrame>
    );
  }

  return (
    <RoomFrame aria-hidden>
      <HeaderPulses />
      <StatPulses />
      <div className="space-y-3">
        <SkeletonPulse className="h-20 rounded-2xl" />
        <SkeletonPulse className="h-20 rounded-2xl" />
        <SkeletonPulse className="h-20 rounded-2xl" />
      </div>
      <SkeletonPulse className="h-24 rounded-[var(--radius-card)]" />
    </RoomFrame>
  );
}

function HeaderPulses({ action = false }: { action?: boolean }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl space-y-3">
        <SkeletonPulse className="h-3 w-28 rounded-full bg-[var(--safir-soft)]" />
        <SkeletonPulse className="h-8 w-56" />
        <SkeletonPulse className="h-4 w-full max-w-xl" />
      </div>
      {action ? <SkeletonPulse className="h-10 w-32 rounded-xl" /> : null}
    </div>
  );
}

function StatPulses() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <SkeletonPulse className="h-[5.5rem] rounded-2xl border border-[var(--border)] bg-[var(--surface)]" />
      <SkeletonPulse className="h-[5.5rem] rounded-2xl border border-[var(--border)] bg-[var(--surface)]" />
      <SkeletonPulse className="h-[5.5rem] rounded-2xl border border-[var(--border)] bg-[var(--surface)]" />
    </div>
  );
}
