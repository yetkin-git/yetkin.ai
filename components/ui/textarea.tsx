import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/components/ui/cn";
import { PLACEHOLDER_TYPO_CLASS } from "@/components/ui/input";

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-slate-200 bg-[var(--surface)] px-3 py-2.5 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--safir)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--safir)_20%,transparent)]",
        PLACEHOLDER_TYPO_CLASS,
        className,
      )}
      {...props}
    />
  );
}
