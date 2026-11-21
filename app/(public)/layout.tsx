import type { ReactNode } from "react";
import { LegalSiteFooter } from "@/components/legal/legal-site-footer";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Sabit LegalSiteFooter içeriğin üzerine binmesin diye yeterli alt boşluk. */}
      <div className="pb-32">{children}</div>
      <LegalSiteFooter />
    </>
  );
}
