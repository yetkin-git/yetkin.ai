import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/components/ui/cn";

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--safir)] focus:ring-4 focus:ring-[var(--safir-soft)]",
        className,
      )}
      {...props}
    />
  );
}
