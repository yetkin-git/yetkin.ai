import type { Metadata } from "next";
import { PublicTalentBoard } from "@/components/career/public-talent-board";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { LegalBackToHome } from "@/components/legal/legal-back-to-home";
import { loadPublicTalentCard } from "@/lib/career/public-talent-load";
import { recordPublicTalentCardHit } from "@/lib/career/public-talent-hit";
import { parsePublicTalentId, publicTalentPath } from "@/lib/career/public-talent";
import { PAGE_SEO, pageMetadata } from "@/lib/copy/seo";
import { CAREER_SEN } from "@/lib/copy/sen-voice/career";

const PUBLIC_META_DESCRIPTION = CAREER_SEN.publicPage.description;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const parsed = parsePublicTalentId(id);
  const resolution = parsed ? await loadPublicTalentCard(parsed) : { status: "invalid-format" as const };
  if (resolution?.status === "found") {
    return pageMetadata({
      title: `${resolution.card.featured.title} · ${CAREER_SEN.publicPage.title}`,
      description: PUBLIC_META_DESCRIPTION,
      path: publicTalentPath(resolution.card.featured.id),
      image: PAGE_SEO.publicTalent.image,
    });
  }
  return pageMetadata({
    title: CAREER_SEN.publicPage.title,
    description: PUBLIC_META_DESCRIPTION,
    path: parsed ? publicTalentPath(parsed) : PAGE_SEO.publicTalent.path,
    image: PAGE_SEO.publicTalent.image,
  });
}

export default async function PublicTalentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const copy = CAREER_SEN.publicPage;
  const resolution = await loadPublicTalentCard(id);

  if (resolution == null) {
    return (
      <main className="relative mx-auto max-w-3xl px-6 pb-20 pt-16">
        <div className="relative space-y-6">
          <LegalBackToHome />
          <h1 className="text-3xl font-semibold tracking-tight">{copy.title}</h1>
          <Card>
            <p>{CAREER_SEN.loadSoft}</p>
          </Card>
        </div>
      </main>
    );
  }

  if (resolution.status === "invalid-format") {
    return (
      <main className="relative mx-auto max-w-3xl px-6 pb-20 pt-16">
        <div className="relative space-y-6">
          <LegalBackToHome />
          <h1 className="text-3xl font-semibold tracking-tight">{copy.title}</h1>
          <Card>
            <p>{copy.invalidFormat}</p>
            <div className="mt-4">
              <LinkButton href="/vize" variant="outline" size="sm">
                {copy.homeCta}
              </LinkButton>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  if (resolution.status === "missing") {
    return (
      <main className="relative mx-auto max-w-3xl px-6 pb-20 pt-16">
        <div className="relative space-y-6">
          <LegalBackToHome />
          <h1 className="text-3xl font-semibold tracking-tight">{copy.missing}</h1>
          <Card>
            <p className="break-all font-mono text-xs">{id}</p>
            <p className="mt-3">{copy.missingBody}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <LinkButton href="/academy/dogrula" variant="outline" size="sm">
                {CAREER_SEN.footnoteVerifyCta}
              </LinkButton>
              <LinkButton href="/academy" variant="outline" size="sm">
                {copy.academyCta}
              </LinkButton>
            </div>
          </Card>
        </div>
      </main>
    );
  }

  await recordPublicTalentCardHit();

  return (
    <main className="relative mx-auto max-w-3xl px-6 pb-20 pt-16">
      <div className="relative space-y-6">
        <LegalBackToHome />
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--safir-deep)]">
          {copy.eyebrow}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{copy.title}</h1>
        <p className="text-base leading-7 text-slate-600">{copy.description}</p>
        <PublicTalentBoard card={resolution.card} />
        <div className="flex flex-wrap gap-2">
          <LinkButton href="/academy" variant="outline" size="sm">
            {copy.academyCta}
          </LinkButton>
        </div>
      </div>
    </main>
  );
}
