import type { ReactNode } from "react";
import { AppShellUserHub } from "@/components/shell/app-shell-user-hub";
import { AppShellSwitch } from "@/components/shell/app-shell-switch";
import { getSession } from "@/lib/kernel/auth/session";
import { isSuperAdminActor } from "@/lib/kernel/auth/super-admin";

export async function AppShell({ children }: { children: ReactNode }) {
  const session = await getSession();
  const showAdmin = session ? isSuperAdminActor(session) : false;
  return (
    <AppShellSwitch showAdmin={showAdmin} userCluster={<AppShellUserHub />}>
      {children}
    </AppShellSwitch>
  );
}
