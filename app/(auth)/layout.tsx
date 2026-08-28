import type { ReactNode } from "react";
import { LegalSiteFooter } from "@/components/legal/legal-site-footer";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      {children}
      <LegalSiteFooter />
    </div>
  );
}
