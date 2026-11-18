import type { Metadata } from "next";
import { PublicTalentBoard } from "@/components/career/public-talent-board";
import { YetkinCvCard } from "@/components/career/yetkincv-card";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { LegalBackToHome } from "@/components/legal/legal-back-to-home";
import { loadPublicTalentCard } from "@/lib/career/public-talent-load";
import { loadPublicYetkinCvByHash } from "@/lib/career/yetkincv-store";
import { recordPublicTalentCardHit } from "@/lib/career/public-talent-hit";
import { parsePublicTalentId, publicTalentPath } from "@/lib/career/public-talent";
import { loadPublicAcademyVerifyByHash, type AcademyPublicVerifyResolution } from "@/lib/academy/load";
import { Badge } from "@/components/ui/badge";
import { PAGE_SEO, pageMetadata } from "@/lib/copy/seo";
import { CAREER_SEN } from "@/lib/copy/sen-voice/career";
import { parseSha256Hex } from "@/lib/kernel/crypto/sha256";

function academySealFace(resolution: Extract<AcademyPublicVerifyResolution, { status: "found" }>): {
  title: string;
  hash: string;
  badge: string;
  tone: "emerald" | "amber" | "rose";
} {
  if (resolution.kind === "certificate") {
    const status = resolution.view.sealStatus;
    const tone = status === "valid" ? "emerald" : status === "mismatch" || status === "revoked" ? "rose" : "amber";
    const badge =
      status === "valid" ? "Mühür geçerli" : status === "revoked" ? "İptal" : status === "mismatch" ? "Uyuşmuyor" : "Eksik";
    return { title: resolution.view.courseTitle, hash: resolution.view.certificateHash, badge, tone };
  }
  if (resolution.kind === "proof") {
    return {
      title: resolution.view.courseTitle,
      hash: resolution.view.proofOfWorkHash,
      badge: "Uygulama kaydı",
      tone: "emerald",
    };
  }
  return {
    title: resolution.view.pathwayTitle,
    hash: resolution.view.masteryHash,
    badge: "Uzmanlık mührü",
    tone: "emerald",
  };
}

function AcademySealOnVize({
  resolution,
}: {
  resolution: Extract<AcademyPublicVerifyResolution, { status: "found" }>;
}) {
  const seal = academySealFace(resolution);
  return (
    <main className="relative mx-auto max-w-3xl px-6 pb-20 pt-16">
      <div className="relative space-y-6">
        <LegalBackToHome />
        <Badge tone={seal.tone}>{seal.badge}</Badge>
        <h1 className="text-3xl font-semibold tracking-tight">{seal.title}</h1>
        <Card>
          <p className="break-all font-mono text-xs leading-5">{seal.hash}</p>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Kayıt sunucudadır. Oturum istenmez. Kimlik gösterilmez.
          </p>
        </Card>
        <LinkButton href="/career" variant="outline" size="sm">
          Kariyer kartı
        </LinkButton>
      </div>
    </main>
  );
}

const PUBLIC_META_DESCRIPTION = CAREER_SEN.publicPage.description;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (parseSha256Hex(id)) {
    const seal = await loadPublicYetkinCvByHash(id).catch(() => null);
    if (seal) {
      return pageMetadata({
        title: `YetkinCV ${seal.score}/100`,
        description: PUBLIC_META_DESCRIPTION,
        path: seal.verifyPath,
        image: PAGE_SEO.publicTalent.image,
      });
    }
    const academy = await loadPublicAcademyVerifyByHash(id).catch(() => null);
    if (academy?.status === "found") {
      return pageMetadata({
        title: academySealFace(academy).title,
        description: PUBLIC_META_DESCRIPTION,
        path: `/vize/${id}`,
        image: PAGE_SEO.publicTalent.image,
      });
    }
  }
  const parsed = parsePublicTalentId(id);
  const resolution = parsed ? await loadPublicTalentCard(parsed) : { status: "invalid-format" as const };
  if (resolution?.status === "found") {
    return pageMetadata({
      title: `${resolution.card.featured.title} · ${CAREER_SEN.publicPage.title}`,
      description: PUBLIC_META_DESCRIPTION,
      path: publicTalentPath(resolution.card.featured.id),
      image: `${publicTalentPath(resolution.card.featured.id)}/opengraph-image`,
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
  if (parseSha256Hex(id)) {
    const seal = await loadPublicYetkinCvByHash(id).catch(() => null);
    if (seal) {
      return (
        <main className="relative mx-auto max-w-3xl px-6 pb-20 pt-16">
          <div className="relative space-y-6">
            <LegalBackToHome />
            <YetkinCvCard card={seal} />
            <p className="text-sm leading-6 text-[var(--muted)]">{copy.privacy}</p>
          </div>
        </main>
      );
    }
    const academy = await loadPublicAcademyVerifyByHash(id).catch(() => null);
    if (academy?.status === "found") {
      return <AcademySealOnVize resolution={academy} />;
    }
  }
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
              <LinkButton href="/vize" variant="outline" size="sm">
                {CAREER_SEN.footnoteVerifyCta}
              </LinkButton>
              <LinkButton href="/career" variant="outline" size="sm">
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
          <LinkButton href="/career" variant="outline" size="sm">
            {copy.academyCta}
          </LinkButton>
        </div>
      </div>
    </main>
  );
}
