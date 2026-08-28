import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { YETKIN_BRAND } from "@/lib/copy/brand";

export const metadata: Metadata = {
  title: `Akademi · ${YETKIN_BRAND}`,
};

export default function AcademyLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
