import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { buttonClassName, type ButtonSize, type ButtonVariant } from "@/components/ui/button";

type LinkButtonProps = Omit<ComponentProps<typeof Link>, "className"> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

export function LinkButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: LinkButtonProps) {
  return (
    <Link className={buttonClassName(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}
