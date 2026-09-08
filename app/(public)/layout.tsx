import type { ReactNode } from "react";
import { LegalSiteFooter } from "@/components/legal/legal-site-footer";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="pb-36">{children}</div>
      <LegalSiteFooter />
    </>
  );
}
