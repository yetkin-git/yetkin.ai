import type { Route } from "next";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

/** Oturumsuz Anasayfa. Kişisel nabız, kimlik ve cüzdan burada yok. */
export function PublicHomePanel() {
  const copy = SEN_VOICE.dashboard.publicPanel;

  return (
    <RoomFrame data-public-view="home">
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.lead}
        actions={
          <div className="flex flex-wrap gap-2">
            <LinkButton href="/login" size="sm">
              {copy.loginCta}
            </LinkButton>
            <LinkButton href="/register" variant="outline" size="sm">
              {copy.registerCta}
            </LinkButton>
          </div>
        }
      />
      <section aria-labelledby="public-home-features">
        <h2
          id="public-home-features"
          className="mb-3 text-lg font-semibold tracking-tight text-[var(--foreground)]"
        >
          {copy.featuresTitle}
        </h2>
        <div className="grid min-w-0 items-stretch gap-4 lg:grid-cols-3">
          {copy.features.map((feature) => (
            <Card
              key={feature.href}
              title={feature.title}
              variant="featured"
              className="flex h-full flex-col"
              bodyClassName="flex flex-1 flex-col"
            >
              <p className="text-[var(--foreground)]">{feature.body}</p>
              <div className="mt-4">
                <LinkButton href={feature.href as Route} variant="outline" size="sm">
                  {feature.cta}
                </LinkButton>
              </div>
            </Card>
          ))}
        </div>
      </section>
      <Card title={copy.summaryTitle}>
        <ul className="list-disc space-y-2 pl-5 text-[var(--foreground)]">
          {copy.summary.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </Card>
    </RoomFrame>
  );
}
