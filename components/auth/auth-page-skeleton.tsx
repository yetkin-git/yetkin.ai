import { SEN_VOICE } from "@/lib/copy/sen-voice";

function SkeletonLine({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-[var(--border)] ${className ?? ""}`} aria-hidden />;
}

/** Auth sayfalarıyla boyut-izomorf iskelet — giriş/kayıt CLS koruması. */
export function AuthPageSkeleton() {
  return (
    <main
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-4 py-3 sm:px-6"
      aria-hidden
    >
      <div className="w-full">
        <div className="flex items-center gap-3">
          <SkeletonLine className="h-8 w-8 rounded-[8px]" />
          <div>
            <SkeletonLine className="h-5 w-24 rounded-full bg-[var(--safir-soft)]" />
            <SkeletonLine className="mt-1 h-7 w-28" />
          </div>
        </div>
        <SkeletonLine className="mt-1 h-4 w-64" />
        <div className="mt-3 space-y-2 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)]">
          <SkeletonLine className="h-14 w-full" />
          <SkeletonLine className="h-14 w-full" />
          <SkeletonLine className="h-10 w-full rounded-xl" />
        </div>
        <span className="sr-only">{SEN_VOICE.auth.skeletonAria}</span>
        <SkeletonLine className="mt-3 h-10 w-full rounded-xl" />
      </div>
    </main>
  );
}
