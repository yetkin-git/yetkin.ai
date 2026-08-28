import type { ReactNode } from "react";
import { AppShellUserHub } from "@/components/shell/app-shell-user-hub";
import { AppShellSwitch } from "@/components/shell/app-shell-switch";

export function AppShell({ children }: { children: ReactNode }) {
  return <AppShellSwitch userCluster={<AppShellUserHub />}>{children}</AppShellSwitch>;
}
