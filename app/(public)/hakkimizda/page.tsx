import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { LegalEntityColophon, LegalHonestyCard, LegalSupportEmailLine } from "@/components/legal/legal-section-articles";
import {
  LEGAL_ABOUT_LEAD,
  LEGAL_ABOUT_STORY,
  LEGAL_ABOUT_TITLE,
  LEGAL_ACTIVITY_SCOPE_BODY,
  LEGAL_ENTITY,
  LEGAL_ENTITY_VKN,
  LEGAL_UPDATED_LABEL,
} from "@/lib/copy/legal-launch";
import { PAGE_SEO, pageMetadata } from "@/lib/copy/seo";

export const metadata: Metadata = pageMetadata(PAGE_SEO.about);

export default function AboutPage() {
  return (
    <main className="relative mx-auto max-w-3xl px-6 pb-20 pt-16">
      <div className="relative space-y-6">
        <Badge tone="safir">{LEGAL_ABOUT_TITLE}</Badge>
        <h1 className="text-3xl font-semibold tracking-tight">{LEGAL_ABOUT_TITLE}</h1>
        <p className="text-xs text-[var(--muted)]">{LEGAL_UPDATED_LABEL}</p>
        <LegalHonestyCard />
        <Card title="Kurumsal kimlik">
          <p className="text-base leading-relaxed text-slate-700">{LEGAL_ABOUT_LEAD}</p>
        </Card>
        <Card title="Faaliyet konusu">
          <p className="text-base leading-relaxed text-slate-700">{LEGAL_ACTIVITY_SCOPE_BODY}</p>
        </Card>
        <Card title="Akademi odaklı hikâye">
          <div className="space-y-3 text-base leading-relaxed text-slate-700">
            {LEGAL_ABOUT_STORY.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Card>
        <Card title="Resmi künye">
          <dl className="space-y-3">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Ticari unvan
              </dt>
              <dd>{LEGAL_ENTITY.tradeName}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Vergi Dairesi / VKN
              </dt>
              <dd>{LEGAL_ENTITY_VKN}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                MERSİS No
              </dt>
              <dd>{LEGAL_ENTITY.mersis}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Adres</dt>
              <dd>{LEGAL_ENTITY.address}</dd>
            </div>
          </dl>
        </Card>
        <LegalSupportEmailLine />
        <div className="flex flex-wrap gap-3">
          <LinkButton href="/iletisim" variant="outline" size="sm">
            İletişim
          </LinkButton>
          <LinkButton href="/legal" variant="outline" size="sm">
            Yasal metinler
          </LinkButton>
          <LinkButton href="/" variant="outline" size="sm">
            Ana sayfa
          </LinkButton>
        </div>
        <LegalEntityColophon />
      </div>
    </main>
  );
}
