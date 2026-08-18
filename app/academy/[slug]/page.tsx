import { notFound } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { PurchaseButton } from "@/components/academy/purchase-button";
import { ExamPanel } from "@/components/academy/exam-panel";
import { CertificateSeal } from "@/components/academy/certificate-seal";
import { SettlementSteps } from "@/components/academy/settlement-steps";
import { loadCourseBySlug, loadExamGateForUserCourse, loadPurchaseForUserCourse, publishedLessonCount } from "@/lib/academy/load";
import { formatMinor } from "@/lib/kernel/money/format";
import { getSession } from "@/lib/kernel/auth/session";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { PRICE_LOCK_GRACE_MINUTES } from "@/lib/kernel/pricing/price-lock";

export default async function AcademyCoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const board = await loadCourseBySlug(slug);
  if (!board) {
    notFound();
  }
  const session = await getSession();
  const owned = session
    ? await loadPurchaseForUserCourse(session.id, board.course.id)
    : null;
  const examGate =
    session && owned ? await loadExamGateForUserCourse(session.id, board.course.id) : null;
  const copy = SEN_VOICE.academy.course;
  const certificateHash = examGate?.certificate
    ? (examGate.certificate.certificateHash ?? examGate.certificate.serialKey)
    : null;

  return (
    <RoomFrame>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={board.course.title}
        description={board.course.summary}
        actions={
          <LinkButton href="/academy" variant="outline" size="sm">
            {copy.catalogCta}
          </LinkButton>
        }
      />
      <Card>
        <p className="font-medium text-[var(--foreground)]">
          {board.course.priceMinor
            ? formatMinor(board.course.priceMinor, board.course.currencyCode)
            : copy.noPrice}
        </p>
      </Card>
      {owned ? (
        examGate?.certificate ? (
          <Card title={copy.certificateEyebrow}>
            <p>{copy.certificateBody}</p>
            <div className="mt-4">
              <CertificateSeal
                hash={certificateHash ?? examGate.certificate.serialKey}
                score={examGate.certificate.score}
                issuedAt={examGate.certificate.issuedAt}
                verifyHref={certificateHash ? `/academy/dogrula/${certificateHash}` : undefined}
              />
            </div>
          </Card>
        ) : examGate ? (
          <Card title={copy.examEyebrow}>
            <p>{copy.ownedExam(examGate.passScore)}</p>
            <div className="mt-4">
              <ExamPanel
                courseId={board.course.id}
                examTitle={examGate.examTitle}
                passScore={examGate.passScore}
                questions={examGate.questions}
              />
            </div>
          </Card>
        ) : (
          <Card title={SEN_VOICE.academy.player.eyebrow}>
            <p>{copy.ownedNoExam}</p>
            <p className="mt-2 text-xs text-[var(--muted)]">
              {SEN_VOICE.academy.player.lessonCount(publishedLessonCount(board.course.slug))}
            </p>
            <div className="mt-4">
              <LinkButton href={`/academy/${board.course.slug}/oyna`} size="sm">
                {SEN_VOICE.academy.player.openCta}
              </LinkButton>
            </div>
          </Card>
        )
      ) : board.course.purchasable ? (
        <Card title={copy.purchaseEyebrow}>
          <p>{copy.purchaseBody(PRICE_LOCK_GRACE_MINUTES)}</p>
          {session ? (
            <div className="mt-4">
              <PurchaseButton
                courseId={board.course.id}
                lockMinutes={PRICE_LOCK_GRACE_MINUTES}
                priceMinor={board.course.priceMinor}
                currencyCode={board.course.currencyCode}
                playHref={`/academy/${board.course.slug}/oyna`}
              />
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <SettlementSteps lockMinutes={PRICE_LOCK_GRACE_MINUTES} />
              <p>
                {copy.loginLead}{" "}
                <Link href="/login" className="text-[var(--safir)] hover:underline">
                  {copy.loginCta}
                </Link>
                .
              </p>
            </div>
          )}
        </Card>
      ) : (
        <Card>{copy.notPurchasable}</Card>
      )}
    </RoomFrame>
  );
}
