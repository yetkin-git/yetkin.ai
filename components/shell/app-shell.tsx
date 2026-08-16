import type { ReactNode } from "react";
import { ShellChrome } from "@/components/shell/shell-chrome";
import { getSession } from "@/lib/kernel/auth/session";
import { isSuperAdminUser } from "@/lib/kernel/auth/super-admin";

export async function AppShell({ children }: { children: ReactNode }) {
  const session = await getSession();
  const showAdmin = session ? isSuperAdminUser(session.id) : false;

  return (
    <div className="min-h-screen">
      <ShellChrome showAdmin={showAdmin} userEmail={session?.email ?? null}>
        <main className="relative px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </ShellChrome>
    </div>
  );
}
