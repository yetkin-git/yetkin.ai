import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { SubmissionForm } from "@/components/arena/submission-form";
import { AwardSubmissionButton } from "@/components/arena/award-submission-button";
import { RefundTenderButton } from "@/components/arena/refund-tender-button";
import { loadTenderBoard } from "@/lib/arena/load";
import { formatMinor } from "@/lib/kernel/money/format";
import { getSession } from "@/lib/kernel/auth/session";
import {
  arenaSubmissionStatusLabel,
  arenaTenderRoundLabel,
  arenaTenderStatusLabel,
} from "@/lib/copy/status-labels";

export default async function ArenaTenderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const board = await loadTenderBoard(id);
  if (!board) {
    notFound();
  }
  const session = await getSession();
  const isSponsor = session?.id === board.tender.userId;
  const alreadySubmitted = session
    ? board.submissions.some((row) => row.userId === session.id)
    : false;
  const canSubmit =
    !isSponsor &&
    board.tender.status === "OPEN" &&
    board.tender.round === "SUBMISSION" &&
    !alreadySubmitted;
  const canAward =
    isSponsor && (board.tender.status === "OPEN" || board.tender.status === "EVALUATING");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
        Arena · {arenaTenderStatusLabel(board.tender.status)} · {arenaTenderRoundLabel(board.tender.round)}
      </p>
      <h1 className="text-2xl font-semibold">{board.tender.title}</h1>
      <Card>
        <p>{board.tender.brief}</p>
        <p className="mt-3 font-medium text-[var(--foreground)]">
          Havuz: {formatMinor(board.tender.prizePoolMinor, board.tender.currencyCode)} · net{" "}
          {formatMinor(board.tender.netMinor, board.tender.currencyCode)}
        </p>
        <p className="mt-2 text-xs">
          Teslim kapanış: {board.tender.submissionClosesAt.toLocaleString("tr-TR")} · değerlendirme kapanış:{" "}
          {board.tender.evaluationClosesAt.toLocaleString("tr-TR")}
        </p>
      </Card>
      <Card title="Teslimler">
        {board.submissions.length === 0 ? (
          <p>Henüz teslim yok.</p>
        ) : (
          <ul className="space-y-3">
            {board.submissions.map((submission) => (
              <li key={submission.id} className="rounded-md border border-[var(--border)] p-3">
                <p className="font-medium text-[var(--foreground)]">
                  {arenaSubmissionStatusLabel(submission.status)}
                </p>
                <p>{submission.proposal}</p>
                {canAward && submission.status === "SUBMITTED" ? (
                  <div className="mt-2">
                    <AwardSubmissionButton
                      tenderId={board.tender.id}
                      submissionId={submission.id}
                      netMinor={board.tender.netMinor}
                    />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Card>
      {board.awards.length > 0 ? (
        <Card title="Ödüller">
          <ul className="space-y-2">
            {board.awards.map((award) => (
              <li key={award.id}>
                {formatMinor(award.amountMinor, award.currencyCode)} → {award.userId}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
      {canSubmit ? (
        <Card title="Teslim et">
          <SubmissionForm tenderId={board.tender.id} />
        </Card>
      ) : null}
      {isSponsor && (board.tender.status === "OPEN" || board.tender.status === "EVALUATING") ? (
        <Card title="İade">
          <RefundTenderButton tenderId={board.tender.id} />
        </Card>
      ) : null}
    </div>
  );
}
