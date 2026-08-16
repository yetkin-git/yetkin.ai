import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { CurriculumPlayer } from "@/components/academy/curriculum-player";
import { requirePageSession } from "@/lib/kernel/auth/session";
import { loadCourseBySlug, loadCurriculumPlayerForUser } from "@/lib/academy/load";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export default async function AcademyCurriculumPlayerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await requirePageSession();
  const { slug } = await params;
  const board = await loadCourseBySlug(slug);
  if (!board) {
    notFound();
  }
  const player = await loadCurriculumPlayerForUser(session.id, board.course.id);
  const copy = SEN_VOICE.academy.player;

  return (
    <RoomFrame>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={board.course.title}
        description={player ? copy.progress(player.completedCount, player.totalCount) : copy.locked}
        actions={
          <LinkButton href={`/academy/${board.course.slug}`} variant="outline" size="sm">
            {copy.catalogCta}
          </LinkButton>
        }
      />
      {player ? (
        <Card>
          <CurriculumPlayer
            courseId={board.course.id}
            courseSlug={board.course.slug}
            lessons={player.lessons}
            completedCount={player.completedCount}
            totalCount={player.totalCount}
            curriculumComplete={player.curriculumComplete}
          />
        </Card>
      ) : (
        <Card title={copy.locked}>
          <p>{copy.lockedBody}</p>
          <div className="mt-4">
            <LinkButton href={`/academy/${board.course.slug}`} size="sm">
              {copy.catalogCta}
            </LinkButton>
          </div>
        </Card>
      )}
    </RoomFrame>
  );
}
