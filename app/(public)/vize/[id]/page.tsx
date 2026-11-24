import type { Metadata } from "next";
import { PublicTalentBoard } from "@/components/career/public-talent-board";
import { TalentContactForm } from "@/components/career/talent-contact-form";
import { YetkinCvCard } from "@/components/career/yetkincv-card";
import { YetkinCvSummaryCard } from "@/components/career/yetkincv-summary-card";
import { YetkinCvPublicationCta } from "@/components/career/yetkincv-publication-cta";
import { ProofShareBar } from "@/components/career/proof-share-bar";
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
import { getSession } from "@/lib/kernel/auth/session";
import {
  readYetkinCvPublicationAmount,
} from "@/lib/career/yetkincv-publication";
import { loadContactOptInForSealHash } from "@/lib/career/cv-store";
import { JsonLd } from "@/components/seo/json-ld";
import { buildCredentialJsonLd, jsonLdDocument } from "@/lib/copy/json-ld";
import { verifyCareerSealHmac } from "@/lib/career/seal-hmac";

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
        {/* Viral büyüme döngüsü (Faz 2 / P4): mühür kartı tek tıkla paylaşılır. */}
        <ProofShareBar path={`/vize/${seal.hash}`} title={seal.title} />
        <LinkButton href="/career" variant="outline" size="sm">
          Kariyer kartı
        </LinkButton>
      </div>
    </main>
  );
}

const PUBLIC_META_DESCRIPTION = CAREER_SEN.publicPage.description;

/**
 * Bulunamayan kart `noindex, follow` döner.
 * SEO Tedavi (P1): soft-404 riski. Kart yoksa sayfa 200 akar (varlık sızdırılmaz)
 * ama `index` bırakılırsa Google "bulunamadı" gövdesini indeksleyebilir.
 * `follow` korunur: sayfadaki `/career` ve `/vize` bağları taranır.
 */
const MISSING_CARD_ROBOTS = { index: false, follow: true } as const;

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
        // K4: ücretsiz (yayınlanmamış) mühür sayfaları indeks dışı.
        ...(seal.published ? {} : { robots: MISSING_CARD_ROBOTS }),
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
    robots: MISSING_CARD_ROBOTS,
  });
}

export default async function PublicTalentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const copy = CAREER_SEN.publicPage;
  // Yayın CTA'sı oturum sahibini doğrudan kariyer masasına gönderir; misafir kayda gider.
  const signedInViewer = (await getSession().catch(() => null)) != null;
  if (parseSha256Hex(id)) {
    const seal = await loadPublicYetkinCvByHash(id).catch(() => null);
    if (seal) {
      // Faz 3 / §4.3 — yayın CTA'sı için katalog tutarı. Satır yoksa `null` (fiyat basılmaz).
      const publicationAmount = seal.published ? null : await readYetkinCvPublicationAmount();
      const hmac = verifyCareerSealHmac(
        {
          certificateHash: seal.certificateHash,
          userId: seal.userId,
          sittingId: seal.sittingId,
          roleKey: seal.roleKey,
          verticalKey: seal.verticalKey,
          score: seal.score,
          issuedAt: seal.issuedAt,
        },
        seal.hmacSignature,
      );
      return (
        <main className="relative mx-auto max-w-3xl px-6 pb-20 pt-16">
          <JsonLd
            data={jsonLdDocument([
              buildCredentialJsonLd({
                name: `YetkinCV ${seal.score}/100`,
                description: `${seal.roleLabel} · ${seal.verticalLabel}`,
                path: seal.verifyPath,
                issuedAt: seal.issuedAt,
                score: seal.score,
              }),
            ])}
          />
          <div className="relative space-y-6">
            <LegalBackToHome />
            {/* Faz 3 / §4.3 — ücretli **yayın** ayrımı.
                Puan, SWOT ve 30/60/90 planı her zaman ücretsizdir. `sealedPublication`
                yalnız kamuya açık kartı ve uzman dizini görünürlüğünü açar.
                Ücretsiz mühürde özet kart basılır; tam kart + paylaşım rozeti ödenince açılır. */}
            {seal.published ? (
              <>
                <YetkinCvCard card={seal} />
                <Card>
                  <p className="text-sm font-medium" data-seal-hmac={hmac.valid ? "valid" : hmac.present ? "invalid" : "legacy"}>
                    {hmac.valid
                      ? "HMAC imzası geçerli."
                      : hmac.present
                        ? "HMAC imzası uyuşmuyor."
                        : "Bu mühür Faz 2 öncesi imzasız kayıttır. Sicil hash'i geçerlidir."}
                  </p>
                  <p className="mt-2 break-all font-mono text-xs text-[var(--muted)]">
                    Doğrulama ucu: /api/career/verify/{seal.certificateHash}
                  </p>
                </Card>
                {/* Viral büyüme döngüsü (Faz 2 / P4): YetkinCV puan kartı paylaşılır.
                    `verifyPath` kanonik `/vize/<sha256>` yoludur (yetkinCvVerifyPath). */}
                <ProofShareBar path={seal.verifyPath} title={`YetkinCV ${seal.score}/100`} />
                {signedInViewer && (await loadContactOptInForSealHash(seal.certificateHash)) ? (
                  <TalentContactForm sealHash={seal.certificateHash} />
                ) : null}
                <p className="text-sm leading-6 text-[var(--muted)]">{copy.privacy}</p>
              </>
            ) : (
              <>
                <YetkinCvSummaryCard card={seal} />
                <YetkinCvPublicationCta
                  certificateHash={seal.certificateHash}
                  amountMinor={publicationAmount}
                  signedIn={signedInViewer}
                  published={seal.published}
                />
              </>
            )}
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
