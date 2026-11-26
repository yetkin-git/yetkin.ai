import type { Metadata, Route } from "next";
import { ActionPlanPanel } from "@/components/career/action-plan-panel";
import { YetkinCvStation } from "@/components/career/yetkincv-station";
import { CareerCvEditor } from "@/components/career/career-cv-editor";
import { CareerPrivacyPanel } from "@/components/career/career-privacy-panel";
import { CareerJobMatchPanel } from "@/components/career/job-match-panel";
import { SwotRoadmapCard } from "@/components/career/swot-roadmap-card";
import { CareerDeskBoard } from "@/components/career/desk-board";
import { AiCareerStudio } from "@/components/career/ai-career-studio";
import { MeritSealBand } from "@/components/career/merit-seal-band";
import { PublicCareerPanel } from "@/components/career/public-career-panel";
import { SealShareGuideButtons, SealShareGuides } from "@/components/career/seal-share-guides";
import { ApplicationStatusCards } from "@/components/career/application-status-cards";
import { InterviewInvitePanel } from "@/components/career/interview-invite-panel";
import { CareerContextualBridges } from "@/components/kernel/contextual-bridge-presets";
import { parseBridgeKaynak, type BridgeKaynak } from "@/lib/kernel/contextual-bridge-params";
import { loadCareerCv } from "@/lib/career/cv-store";
import { listTezgahPortfolioForUser } from "@/lib/career/tezgah-portfolio";
import { loadCandidateApplicationStatuses } from "@/lib/career/application-status";
import { listInterviewInvitesForTalent } from "@/lib/career/interview-invite";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import {
  careerStampPublicHref,
  careerStampVerifyHref,
} from "@/lib/career/stamp-surface";
import {
  assembleCareerActionLive,
  EMPTY_CAREER_ACTION_LIVE,
  type CareerActionStoreSignal,
} from "@/lib/career/action-plan";
import { loadCareerEvidence } from "@/lib/career/evidence";
import { loadCareerJobMatchBoard } from "@/lib/career/job-match-load";
import { UNREAD_CAREER_JOB_MATCH_BOARD, type CareerJobMatchBoard } from "@/lib/career/job-matcher";
import { loadLatestYetkinCvCard } from "@/lib/career/yetkincv-store";
import { buildCareerRoadmap } from "@/lib/career/roadmap";
import { buildCareerSwot, type CareerEvidence } from "@/lib/career/swot";
import { loadCareerDeskTasks } from "@/lib/career/desk-load";
import { loadCareerBoard } from "@/lib/career/load";
import type { LiveCareerBoard } from "@/lib/career/live";
import { loadAcademyActionPulse } from "@/lib/academy/load";
import { listCommerceStores } from "@/lib/commerce/service";
import { liveCommerceDeps } from "@/lib/commerce/live";
import { getSession, requirePageSession } from "@/lib/kernel/auth/session";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { PAGE_SEO, pageMetadata } from "@/lib/copy/seo";
import { isFreelancerPublicSurfaceLocked } from "@/lib/kernel/compliance/circuit-breakers";
import {
  FREELANCER_STAMP_SURFACE_PATH,
  PASSPORT_SURFACE_PATH,
} from "@/lib/kernel/passport/types";
import { JsonLd } from "@/components/seo/json-ld";
import { LandingFaq } from "@/components/seo/landing-faq";
import { faqPageJsonLd, jsonLdDocument } from "@/lib/copy/json-ld";
import { CAREER_LANDING_FAQ } from "@/lib/copy/sem-keywords";

export const metadata: Metadata = pageMetadata(PAGE_SEO.career);

export default async function CareerPage({
  searchParams,
}: {
  searchParams: Promise<{ hedef?: string | string[]; kaynak?: string | string[] }>;
}) {
  const [session, query] = await Promise.all([getSession(), searchParams]);
  if (!session) {
    return <PublicCareerPanel plan={<ActionPlanPanel live={EMPTY_CAREER_ACTION_LIVE} />} />;
  }
  const hedef = Array.isArray(query.hedef) ? query.hedef[0] : query.hedef;
  /**
   * Köprü döngüsü: `/career?kaynak=hibe` ile gelen kullanıcıya "YetkinHibe'ye
   * dön" köprüsü basılmaz. Şerit hedefleri bugün `ilan` + `e-ticaret` olsa da
   * kural tek yerde (`selectBridgeTargets`) durur; preset değişirse koruma
   * kendiliğinden devreye girer.
   */
  const bridgeCameFrom = parseBridgeKaynak(
    Array.isArray(query.kaynak) ? query.kaynak[0] : query.kaynak,
  );
  return <SignedInCareerPage hedef={hedef ?? null} bridgeCameFrom={bridgeCameFrom} />;
}

async function loadCareerActionStores(userId: string): Promise<CareerActionStoreSignal[]> {
  try {
    const listed = await listCommerceStores(liveCommerceDeps().repository(), userId);
    if (!listed.ok) {
      return [];
    }
    const stores: CareerActionStoreSignal[] = [];
    for (const row of listed.data.stores) {
      const status = row.status;
      const slug = row.slug;
      const name = row.name;
      if (
        (status === "DRAFT" || status === "ACTIVE") &&
        typeof slug === "string" &&
        typeof name === "string"
      ) {
        stores.push({ status, slug, name });
      }
    }
    return stores;
  } catch {
    return [];
  }
}

async function loadSignedInActionLive(userId: string, board: LiveCareerBoard | null) {
  const [academy, stores] = await Promise.all([
    loadAcademyActionPulse(userId),
    loadCareerActionStores(userId),
  ]);
  return assembleCareerActionLive({
    academy,
    stamps: (board?.stamps ?? []).map((stamp) => ({
      title: stamp.title,
      publicHref: careerStampPublicHref(stamp),
      courseSlug: stamp.courseSlug,
    })),
    stores,
  });
}

function coachTarget(board: CareerJobMatchBoard, hedef: string | null) {
  if (!hedef || board.state !== "matches") {
    return null;
  }
  const card = board.cards.find((row) => row.kind === "coach" && row.slug === hedef);
  return card?.kind === "coach" ? card : null;
}

function careerPlan(evidence: CareerEvidence | null, board: CareerJobMatchBoard, hedef: string | null) {
  const target = coachTarget(board, hedef);
  const roadmap = target ? target.roadmap : evidence ? buildCareerRoadmap(evidence) : null;
  if (!roadmap) {
    return null;
  }
  const planNote = target
    ? `${target.gapLine} Plan, ${target.companyName} — ${target.title} ilanına göre yazıldı.`
    : null;
  return (
    <SwotRoadmapCard
      swot={evidence ? buildCareerSwot(evidence) : null}
      roadmap={roadmap}
      planNote={planNote}
    />
  );
}

async function SignedInCareerPage({
  hedef,
  bridgeCameFrom = null,
}: {
  hedef: string | null;
  bridgeCameFrom?: BridgeKaynak | null;
}) {
  const session = await requirePageSession();
  const [board, deskTasks, yetkinCard, matchBoard, careerCv, tezgahProofs, applicationStatuses, interviewInvites] =
    await Promise.all([
      loadCareerBoard(session.id),
      loadCareerDeskTasks(session.id),
      loadLatestYetkinCvCard(session.id).catch(() => null),
      loadCareerJobMatchBoard(session.id).catch(() => UNREAD_CAREER_JOB_MATCH_BOARD),
      loadCareerCv(session.id).catch(() => null),
      listTezgahPortfolioForUser(session.id).catch(() => []),
      loadCandidateApplicationStatuses(session.id).catch(() => []),
      listInterviewInvitesForTalent(session.id).catch(() => []),
    ]);
  const actionLive = await loadSignedInActionLive(session.id, board);
  const evidence = await loadCareerEvidence(session.id).catch(() => null);
  const stamps = board?.stamps ?? [];
  const portfolio = board?.portfolio ?? [];
  const copy = SEN_VOICE.career;
  const verifiedBadges = stamps
    .filter((stamp) => stamp.sourceKind === "ACADEMY_CERTIFICATE")
    .map((stamp) => stamp.title);
  const featured = stamps[0] ?? null;
  const publicTalentHref = featured ? careerStampPublicHref(featured) : null;
  const shareModel =
    featured && publicTalentHref
      ? {
          talentHref: publicTalentHref,
          verifyHref: careerStampVerifyHref(featured),
          courseTitle: featured.title,
          issuedAt: featured.issuedAt.toISOString(),
          certId: featured.certificateHash ?? featured.id,
        }
      : null;

  return (
    <RoomFrame>
      <JsonLd data={jsonLdDocument([faqPageJsonLd(CAREER_LANDING_FAQ)])} />
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        actions={
          <div className="flex flex-wrap gap-2">
            {publicTalentHref ? (
              <LinkButton href={publicTalentHref as Route} variant="primary" size="sm">
                {copy.publicTalentCta}
              </LinkButton>
            ) : null}
            <LinkButton href={PASSPORT_SURFACE_PATH} variant="secondary" size="sm">
              {copy.passportCta}
            </LinkButton>
            <LinkButton href="/tezgah" variant="outline" size="sm">
              {copy.footnoteAcademyCta}
            </LinkButton>
            {isFreelancerPublicSurfaceLocked() ? null : (
              <LinkButton href={FREELANCER_STAMP_SURFACE_PATH} variant="outline" size="sm">
                {copy.freelancerBoardCta}
              </LinkButton>
            )}
          </div>
        }
      />
      {board === null ? (
        <p className="text-sm text-[var(--muted)]">{copy.loadSoft}</p>
      ) : null}
      <YetkinCvStation signedIn initialCard={yetkinCard} />
      <CareerCvEditor initialCv={careerCv} />
      <ApplicationStatusCards cards={applicationStatuses} />
      <InterviewInvitePanel initialInvites={interviewInvites} />
      <MeritSealBand
        stamps={stamps}
        proofCount={portfolio.length}
        publicTalentHref={publicTalentHref}
      />
      <CareerContextualBridges cameFrom={bridgeCameFrom} />
      {tezgahProofs.length > 0 ? (
        <Card title="Portföy Çıktıları (AI Tezgâh Kayıtlı)">
          <ul className="space-y-2">
            {tezgahProofs.map((item) => (
              <li key={item.id} className="space-y-1">
                <p className="text-sm font-medium text-[var(--foreground)]">{item.title}</p>
                {item.body ? <p className="text-sm text-[var(--muted)]">{item.body}</p> : null}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
      <CareerJobMatchPanel board={matchBoard} activeSlug={coachTarget(matchBoard, hedef)?.slug ?? null} />
      {careerPlan(evidence, matchBoard, hedef)}
      <CareerDeskBoard tasks={deskTasks} />
      <AiCareerStudio verifiedBadges={verifiedBadges} />
      <CareerPrivacyPanel />
      <div className="flex flex-wrap gap-2">
        <SealShareGuideButtons model={shareModel} />
      </div>
      <ActionPlanPanel live={actionLive} />
      <section id="career-seal-guides" className="scroll-mt-24">
        <SealShareGuides model={shareModel} />
      </section>
      <Card variant="default" className="shadow-sm">
        <p>{copy.footnote}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <LinkButton href={PASSPORT_SURFACE_PATH} variant="secondary" size="sm">
            {copy.footnotePassportCta}
          </LinkButton>
          <LinkButton href="/vize" variant="outline" size="sm">
            {copy.footnoteVerifyCta}
          </LinkButton>
          <LinkButton href="/tezgah" variant="outline" size="sm">
            {copy.footnoteAcademyCta}
          </LinkButton>
          <LinkButton href="/panel/e-ticaret" variant="outline" size="sm">
            E-ticaret
          </LinkButton>
          <LinkButton href="/panel/hibe" variant="outline" size="sm">
            YetkinHibe
          </LinkButton>
        </div>
      </Card>
      <LandingFaq heading={copy.faqHeading} items={CAREER_LANDING_FAQ} />
    </RoomFrame>
  );
}
