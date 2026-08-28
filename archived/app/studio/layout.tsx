import type { ReactNode } from "react";
import AppShellLayout from "@/components/shell/app-shell-layout";
import { requirePageSession } from "@/lib/kernel/auth/session";

export default async function StudioLayout({ children }: { children: ReactNode }) {
  await requirePageSession();
  return <AppShellLayout>{children}</AppShellLayout>;
}
