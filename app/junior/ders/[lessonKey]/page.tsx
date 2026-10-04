import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListenAndTell } from "@/components/junior/listen-and-tell";
import { PracticeBoard } from "@/components/junior/practice-board";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { requirePageSession } from "@/lib/kernel/auth/session";
import { loadJuniorLessonPage } from "@/lib/junior/load";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function JuniorLessonPage({
  params,
}: {
  params: Promise<{ lessonKey: string }>;
}) {
  const session = await requirePageSession();
  const { lessonKey } = await params;
  const page = await loadJuniorLessonPage(session.id, lessonKey);
  if (page.lesson.access === "missing") {
    notFound();
  }

  return (
    <RoomFrame className="space-y-6">
      <PageHeader
        eyebrow={page.lesson.courseTitle}
        title={page.lesson.title}
        description={
          page.lesson.access === "free"
            ? "Bu konu ücretsizdir. Önce dinle, sonra kendi sözünle anlat."
            : "Bu konu kapalı pilotta henüz açılmadı."
        }
        actions={
          <LinkButton href="/junior" variant="outline" size="sm">
            Ders listesi
          </LinkButton>
        }
      />
      {!page.ready ? (
        <p className="text-sm text-[var(--rose)]">Profil kaydı şu an yazılamıyor.</p>
      ) : null}
      {page.lesson.access === "locked" ? (
        <section className="junior-shield-card rounded-[1.6rem] border border-[var(--border)] p-4">
          <p>{page.lesson.teaser}</p>
          <p className="mt-2 text-sm text-[var(--muted)]">Her dersin ilk konusu ücretsizdir. Diğer konular sırada bekler.</p>
        </section>
      ) : null}
      {page.lesson.access === "free" && page.profileId ? (
        <>
          <ListenAndTell
            profileId={page.profileId}
            lessonKey={lessonKey}
            title={page.lesson.title}
            script={page.lesson.script}
          />
          {page.lesson.practice.length > 0 ? (
            <PracticeBoard profileId={page.profileId} lessonKey={lessonKey} items={page.lesson.practice} />
          ) : null}
        </>
      ) : null}
      {page.lesson.access === "free" && !page.profileId ? (
        <section className="rounded-[1.6rem] border border-[var(--border)] bg-white p-4">
          <p>Önce takma adlı bir çocuk profili seç. Onay kutusu işaretlenmeden ders açılmaz.</p>
          <LinkButton href="/junior" className="mt-3" size="sm">
            Profil seç
          </LinkButton>
        </section>
      ) : null}
    </RoomFrame>
  );
}
