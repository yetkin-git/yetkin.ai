import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { IconFilm, IconImage, IconSpark } from "@/components/ui/icons";
import { STUDIO_SEN } from "@/lib/copy/sen-voice/studio";

const DRAFTS = [
  {
    title: STUDIO_SEN.drafts.liveTitle,
    summary: STUDIO_SEN.drafts.liveSummary,
    icon: IconSpark,
    tone: "live" as const,
  },
  {
    title: STUDIO_SEN.drafts.imageTitle,
    summary: STUDIO_SEN.drafts.imageSummary,
    icon: IconImage,
    tone: "vitrine" as const,
  },
  {
    title: STUDIO_SEN.drafts.storyTitle,
    summary: STUDIO_SEN.drafts.storySummary,
    icon: IconFilm,
    tone: "vitrine" as const,
  },
];

export function MediaDraftCards() {
  return (
    <div className="space-y-3">
      {DRAFTS.map((draft) => {
        const Icon = draft.icon;
        return (
          <Card
            key={draft.title}
            variant="glass"
            className="studio-easel p-4"
            bodyClassName="text-[var(--foreground)]"
          >
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--violet-soft)] text-[var(--violet)]">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold tracking-tight">{draft.title}</p>
                  <Badge tone={draft.tone === "live" ? "emerald" : "gold"}>
                    {draft.tone === "live" ? "Canlı" : "Vitrin"}
                  </Badge>
                </div>
                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{draft.summary}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
