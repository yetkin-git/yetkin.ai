import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/app-shell";

export const metadata: Metadata = {
  title: "Yetkin Junior",
  robots: { index: false, follow: false },
};

export default function JuniorLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
