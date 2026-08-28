import { SEN_VOICE } from "@/lib/copy/sen-voice";

function SkeletonLine({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-[var(--border)] ${className ?? ""}`} aria-hidden />;
}

/** Auth sayfalarıyla boyut-izomorf iskelet — giriş/kayıt CLS koruması. */
export function AuthPageSkeleton() {
  return (
    <main
      className="relative mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 pb-14 pt-16"
      aria-hidden
    >
      <div className="relative">
        <SkeletonLine className="mb-4 h-10 w-10 rounded-[8px]" />
        <SkeletonLine className="h-5 w-24 rounded-full bg-[var(--safir-soft)]" />
        <SkeletonLine className="mt-3 h-9 w-32" />
        <SkeletonLine className="mt-2 h-4 w-64" />
        <div className="mt-6 space-y-3 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
          <SkeletonLine className="h-16 w-full" />
          <SkeletonLine className="h-16 w-full" />
          <SkeletonLine className="h-10 w-28 rounded-xl" />
        </div>
        <span className="sr-only">{SEN_VOICE.auth.skeletonAria}</span>
        <div className="mt-4 flex gap-3">
          <SkeletonLine className="h-8 w-16 rounded-xl" />
          <SkeletonLine className="h-8 w-20 rounded-xl" />
        </div>
      </div>
    </main>
  );
}
