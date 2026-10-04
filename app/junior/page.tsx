import { LinkButton } from "@/components/ui/link-button";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { ProfileSwitcher } from "@/components/junior/profile-switcher";
import { requirePageSession } from "@/lib/kernel/auth/session";
import { loadJuniorHome } from "@/lib/junior/load";

export const dynamic = "force-dynamic";

export default async function JuniorHomePage() {
  const session = await requirePageSession();
  const home = await loadJuniorHome(session.id);

  return (
    <RoomFrame className="space-y-6">
      <PageHeader
        eyebrow="Junior odası"
        title="6. Sınıf"
        description="Matematik, Fen Bilimleri ve Türkçe. Her dersin ilk konusu ücretsizdir. Oyun puanı cüzdana yazılmaz."
      />
      {home.notice ? <p className="text-sm text-[var(--rose)]">{home.notice}</p> : null}
      <ProfileSwitcher profiles={home.profiles} xp={home.xp} ready={home.ready} />
      {home.courses.map((course) => (
        <section key={course.slug} className="grid gap-3">
          <h2 className="text-lg font-semibold">{course.title}</h2>
          {course.lessons.map((lesson) => (
            <article
              key={lesson.key}
              className="flex flex-col gap-3 rounded-[1.4rem] border border-[var(--border)] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="font-semibold">{lesson.title}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">{lesson.teaser}</p>
              </div>
              {lesson.access === "free" ? (
                <LinkButton href={`/junior/ders/${lesson.key}`} size="sm">
                  Ücretsiz başla
                </LinkButton>
              ) : (
                <LinkButton href={`/junior/ders/${lesson.key}`} variant="outline" size="sm">
                  Sırada
                </LinkButton>
              )}
            </article>
          ))}
        </section>
      ))}
    </RoomFrame>
  );
}
