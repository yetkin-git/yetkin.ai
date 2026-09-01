import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/app-shell";
import { PAGE_SEO, pageMetadata } from "@/lib/copy/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.academy);

export default function AcademyLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
