import type { InputHTMLAttributes } from "react";
import { cn } from "@/components/ui/cn";

/** Placeholder: ince + italik; yazılan metin italik olmaz (label font-medium mirasını keser). */
export const PLACEHOLDER_TYPO_CLASS =
  "not-italic placeholder:font-normal placeholder:italic placeholder:text-slate-400";

export const INPUT_SURFACE_CLASS = cn(
  "w-full rounded-xl border border-slate-200 bg-[var(--surface)] px-3 py-2.5 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--safir)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--safir)_20%,transparent)]",
  PLACEHOLDER_TYPO_CLASS,
);

/** Boş placeholder seçenekliyken select yüzeyi; dolu seçimde koyu düz metin. */
export function selectValueTypoClass(value: string): string {
  return value === ""
    ? "font-normal italic text-slate-400"
    : "not-italic font-medium text-slate-900";
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("mt-1", INPUT_SURFACE_CLASS, className)} {...props} />;
}
