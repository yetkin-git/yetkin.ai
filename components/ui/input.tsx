import type { InputHTMLAttributes } from "react";
import { cn } from "@/components/ui/cn";

export const INPUT_SURFACE_CLASS =
  "w-full rounded-xl border border-slate-200 bg-[var(--surface)] px-3 py-2.5 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--safir)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--safir)_20%,transparent)]";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("mt-1", INPUT_SURFACE_CLASS, className)} {...props} />;
}
