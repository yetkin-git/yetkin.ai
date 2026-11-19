"use client";

import { useState, type SelectHTMLAttributes } from "react";
import { cn } from "@/components/ui/cn";
import { selectValueTypoClass } from "@/components/ui/input";

type EmptyAwareSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "value"> & {
  /** Kontrollü kullanım; verilmezse defaultValue ile başlar. */
  value?: string;
};

/**
 * value === "" iken placeholder tipografisi (ince italik slate-400);
 * geçerli seçimde koyu düz medium.
 */
export function EmptyAwareSelect({
  className,
  defaultValue,
  value: controlledValue,
  onChange,
  children,
  ...props
}: EmptyAwareSelectProps) {
  const controlled = controlledValue !== undefined;
  const [uncontrolled, setUncontrolled] = useState(String(defaultValue ?? ""));
  const value = controlled ? String(controlledValue) : uncontrolled;

  return (
    <select
      {...props}
      value={value}
      className={cn(className, selectValueTypoClass(value))}
      onChange={(event) => {
        if (!controlled) {
          setUncontrolled(event.target.value);
        }
        onChange?.(event);
      }}
    >
      {children}
    </select>
  );
}
