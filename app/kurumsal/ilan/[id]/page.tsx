import { notFound } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { AwardPostingForm } from "@/components/kurumsal/award-posting-form";
import { CorporateOfferForm } from "@/components/kurumsal/offer-form";
import { PostingActions } from "@/components/kurumsal/posting-actions";
import { loadJobPostingBoard } from "@/lib/kurumsal/load";
import { loadHasAcademyCareerVisa } from "@/lib/career/load";
import { formatMinor } from "@/lib/kernel/money/format";
import { getSession } from "@/lib/kernel/auth/session";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import {
  kurumsalOfferStatusLabel,
  kurumsalPostingStatusLabel,
  kurumsalWorkbenchLabel,
} from "@/lib/copy/status-labels";

export default async function CorporateJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const board = await loadJobPostingBoard(id);
  if (!board) {
    notFound();
  }
  const session = await getSession();
  const isOwner = session?.id === board.posting.userId;
  const copy = SEN_VOICE.kurumsal;
  const visibleOffers = isOwner
    ? board.offers
    : board.offers.filter((offer) => offer.bidderId === session?.id);
  const hasAcademyVisa =
    session && !isOwner && board.posting.status === "SEALED"
      ? await loadHasAcademyCareerVisa(session.id)
      : true;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
        Kurumsal ilan · {kurumsalPostingStatusLabel(board.posting.status)} ·{" "}
        {kurumsalWorkbenchLabel(board.posting.workbenchKind)}
      </p>
      <h1 className="text-2xl font-semibold">{board.posting.title}</h1>
      <Card>
        <p>{board.posting.brief}</p>
        <p className="mt-3 font-medium text-[var(--foreground)]">
          Bütçe: {formatMinor(board.posting.budgetMinor, board.posting.currencyCode)} · platform payı %
          {board.posting.holdBps / 100}
        </p>
        {board.company ? <p className="mt-2">Şirket: {board.company.legalName}</p> : null}
        {board.posting.awardedUserId ? (
          <p className="mt-2">Çalışan: {board.posting.awardedUserId}</p>
        ) : null}
      </Card>
      {visibleOffers.length > 0 || isOwner ? (
        <Card title={copy.offer.listTitle}>
          {visibleOffers.length === 0 ? (
            <p>{copy.offer.empty}</p>
          ) : (
            <ul className="space-y-3">
              {visibleOffers.map((offer) => (
                <li key={offer.id} className="rounded-md border border-[var(--border)] p-3">
                  <p className="font-medium text-[var(--foreground)]">
                    {kurumsalOfferStatusLabel(offer.status)}
                    {isOwner ? ` · ${offer.bidderId}` : ""}
                  </p>
                  <p>{offer.coverNote}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ) : null}
      {isOwner && board.posting.status === "SEALED" ? (
        <Card title="İşi ver">
          <AwardPostingForm postingId={board.posting.id} workbenchKind={board.posting.workbenchKind} />
        </Card>
      ) : null}
      {!isOwner && board.posting.status === "SEALED" ? (
        <Card title={copy.offer.title}>
          {session ? (
            hasAcademyVisa ? (
              <CorporateOfferForm postingId={board.posting.id} />
            ) : (
              <p>
                {copy.offer.visaGate}{" "}
                <Link href="/career" className="text-[var(--safir)] hover:underline">
                  {copy.offer.visaCta}
                </Link>
                .
              </p>
            )
          ) : (
            <p>
              {copy.loginLead}{" "}
              <Link href="/login" className="font-semibold text-[var(--safir-deep)] hover:underline">
                {copy.loginCta}
              </Link>{" "}
              {copy.loginTail}
            </p>
          )}
        </Card>
      ) : null}
      {isOwner ? (
        <Card title="Emanet">
          <PostingActions
            postingId={board.posting.id}
            canRelease={board.posting.status === "AWARDED"}
            canRefund={board.posting.status === "SEALED" || board.posting.status === "AWARDED"}
          />
        </Card>
      ) : null}
    </div>
  );
}
