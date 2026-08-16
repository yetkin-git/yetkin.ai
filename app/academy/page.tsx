import { CourseList } from "@/components/academy/course-list";
import { loadPublishedCourses } from "@/lib/academy/load";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { Badge } from "@/components/ui/badge";
import { StatGrid } from "@/components/ui/stat-grid";
import { IconBook, IconBadge, IconLock } from "@/components/ui/icons";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { PRICE_LOCK_GRACE_MINUTES } from "@/lib/kernel/pricing/price-lock";

export default async function AcademyPage() {
  const courses = await loadPublishedCourses();
  const live = courses ?? [];
  const copy = SEN_VOICE.academy.catalog;

  return (
    <RoomFrame>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        actions={
          <LinkButton href="/academy/certificates" variant="outline">
            {copy.certificatesCta}
          </LinkButton>
        }
      />
      <StatGrid
        columns={3}
        items={[
          { label: "Yayında", value: live.length, icon: <IconBook /> },
          { label: "Kilit", value: `${PRICE_LOCK_GRACE_MINUTES} dk`, icon: <IconLock /> },
          { label: "Sertifika", value: "sınav ≥70", icon: <IconBadge /> },
        ]}
      />
      {courses === null ? (
        <Badge tone="amber">{copy.unbound}</Badge>
      ) : live.length > 0 ? (
        <Badge tone="emerald">{copy.live(live.length)}</Badge>
      ) : null}
      <CourseList courses={live} />
    </RoomFrame>
  );
}
