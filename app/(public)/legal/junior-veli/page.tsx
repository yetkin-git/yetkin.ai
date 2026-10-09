import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LegalBackToHome } from "@/components/legal/legal-back-to-home";
import {
  JUNIOR_GUARDIAN_NOTICE_TITLE,
  JUNIOR_GUARDIAN_NOTICE_VERSION,
  juniorGuardianNoticeParagraphs,
} from "@/lib/copy/junior-guardian-notice";
import { pageMetadata } from "@/lib/copy/seo";

export const metadata: Metadata = pageMetadata({
  title: JUNIOR_GUARDIAN_NOTICE_TITLE,
  description: "Yetkin Junior çocuk profili için veli aydınlatması. Ödeme sözleşmesinden ayrıdır.",
  path: "/legal/junior-veli",
});

export default function JuniorGuardianNoticePage() {
  const paragraphs = juniorGuardianNoticeParagraphs();
  return (
    <main className="relative mx-auto max-w-3xl px-6 pb-20 pt-16">
      <div className="space-y-6">
        <LegalBackToHome />
        <div className="space-y-3">
          <Badge tone="safir">Hukuk</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">{JUNIOR_GUARDIAN_NOTICE_TITLE}</h1>
          <p className="text-sm text-[var(--muted)]">Yürürlük sürümü: {JUNIOR_GUARDIAN_NOTICE_VERSION}</p>
        </div>
        <Card className="space-y-4 p-6 text-sm leading-7">
          {paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </Card>
      </div>
    </main>
  );
}
