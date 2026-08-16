"use client";

import type { InputHTMLAttributes } from "react";
import { useState } from "react";
import { INPUT_SURFACE_CLASS } from "@/components/ui/input";
import { IconEye, IconEyeOff } from "@/components/ui/icons";
import { cn } from "@/components/ui/cn";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  revealed?: boolean;
  onRevealedChange?: (revealed: boolean) => void;
};

export function PasswordInput({
  className = "",
  revealed: revealedProp,
  onRevealedChange,
  ...props
}: PasswordInputProps) {
  const [uncontrolled, setUncontrolled] = useState(false);
  const revealed = revealedProp ?? uncontrolled;

  function setRevealed(next: boolean) {
    onRevealedChange?.(next);
    if (revealedProp === undefined) {
      setUncontrolled(next);
    }
  }

  return (
    <div className="relative mt-1">
      <input
        className={cn(INPUT_SURFACE_CLASS, "pr-11", className)}
        {...props}
        type={revealed ? "text" : "password"}
      />
      <button
        type="button"
        onClick={() => setRevealed(!revealed)}
        aria-label={revealed ? "Şifreyi gizle" : "Şifreyi göster"}
        aria-pressed={revealed}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-[var(--muted)] transition hover:text-[var(--foreground)]"
      >
        {revealed ? <IconEyeOff /> : <IconEye />}
      </button>
    </div>
  );
}
