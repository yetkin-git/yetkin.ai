import type { InputHTMLAttributes } from "react";
import { cn } from "@/components/ui/cn";

export const INPUT_SURFACE_CLASS =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--safir)] focus:ring-4 focus:ring-[var(--safir-soft)]";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("mt-1", INPUT_SURFACE_CLASS, className)} {...props} />;
}
