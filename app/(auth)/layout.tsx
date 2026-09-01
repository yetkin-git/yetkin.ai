import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LegalSiteFooter } from "@/components/legal/legal-site-footer";
import { AUTH_ROBOTS } from "@/lib/copy/seo";

export const metadata: Metadata = {
  robots: AUTH_ROBOTS,
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      {children}
      <LegalSiteFooter />
    </div>
  );
}
