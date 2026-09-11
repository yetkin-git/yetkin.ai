import { Suspense } from "react";
import { LinkButton } from "@/components/ui/link-button";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { getSession } from "@/lib/kernel/auth/session";

/**
 * Ana sayfa hesap nav’ı — `getSession` HTML kabuğunu (LCP AVIF) bloklamasın.
 * Misafir fallback SpeedVitals/Lighthouse oturumsuz koşusuyla aynı CTA’yı basar.
 */
export function HomeAccountNav() {
  return (
    <Suspense fallback={<HomeAccountNavLinks session={null} />}>
      <HomeAccountNavResolved />
    </Suspense>
  );
}

async function HomeAccountNavResolved() {
  const session = await getSession();
  return <HomeAccountNavLinks session={Boolean(session)} />;
}

function HomeAccountNavLinks({ session }: { session: boolean | null }) {
  const copy = SEN_VOICE.public.home;
  return (
    <nav aria-label="Hesap" className="ml-auto flex flex-wrap items-center gap-2">
      {session ? (
        <LinkButton href="/dashboard" size="sm">
          {copy.cockpitCta}
        </LinkButton>
      ) : (
        <>
          <LinkButton href="/login" variant="outline" size="sm">
            {copy.loginCta}
          </LinkButton>
          <LinkButton href="/register" size="sm">
            {copy.registerCta}
          </LinkButton>
        </>
      )}
    </nav>
  );
}
