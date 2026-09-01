import type { LabelHTMLAttributes } from "react";
import { cn } from "@/components/ui/cn";

export function Label({ className = "", ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("block text-sm font-medium text-[var(--foreground)]", className)}
      {...props}
    />
  );
}
