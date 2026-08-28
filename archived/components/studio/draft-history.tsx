import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatMinor } from "@/lib/kernel/money/format";
import { STUDIO_SEN } from "@/lib/copy/sen-voice/studio";
import { studioAssetPreviewSrc } from "@/lib/studio/storage";
import type {
  StudioDigitalAssetRecord,
  StudioDraftRecord,
  StudioGenerationRecord,
} from "@/lib/studio/types";

export function DraftHistory({
  drafts,
  generations,
  assets = [],
}: {
  drafts: StudioDraftRecord[];
  generations: StudioGenerationRecord[];
  assets?: StudioDigitalAssetRecord[];
}) {
  const assetsByGeneration = new Map(assets.map((asset) => [asset.generationId, asset]));
  if (drafts.length === 0 && generations.length === 0) {
    return (
      <Card variant="glass" title={STUDIO_SEN.drafts.historyTitle}>
        {STUDIO_SEN.drafts.empty}
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {generations.length > 0 ? (
        <Card variant="glass" title={STUDIO_SEN.drafts.generationsTitle} bodyClassName="text-[var(--foreground)]">
          <ul className="space-y-4">
            {generations.map((generation) => {
              const asset = assetsByGeneration.get(generation.id);
              return (
              <li key={generation.id} className="border-b border-[var(--border)] pb-3 last:border-b-0 last:pb-0">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <Badge tone={generation.status === "SUCCEEDED" ? "emerald" : "rose"}>
                    {generation.status === "SUCCEEDED"
                      ? STUDIO_SEN.drafts.succeeded
                      : STUDIO_SEN.drafts.failed}
                  </Badge>
                  <span className="text-xs text-[var(--muted)]">
                    {formatMinor(generation.debitMinor, generation.currencyCode)} · {generation.totalTokens}{" "}
                    jeton
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--muted)]">{generation.prompt}</p>
                {generation.outputText ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--foreground)]">
                    {generation.outputText}
                  </p>
                ) : null}
                {asset ? (
                  <figure className="mt-2 space-y-1">
                    {(() => {
                      const src = studioAssetPreviewSrc(asset);
                      return src ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt={generation.prompt}
                            src={src}
                            className="max-h-48 rounded-lg border border-[var(--border)] object-contain"
                          />
                          <figcaption className="font-mono text-[11px] text-[var(--muted)]">
                            SHA256 {asset.contentHash.slice(0, 16)}…
                          </figcaption>
                        </>
                      ) : (
                        <figcaption className="font-mono text-[11px] text-[var(--muted)]">
                          SHA256 {asset.contentHash.slice(0, 16)}…
                        </figcaption>
                      );
                    })()}
                  </figure>
                ) : null}
              </li>
              );
            })}
          </ul>
        </Card>
      ) : null}
      {drafts.length > 0 ? (
        <Card variant="glass" title={STUDIO_SEN.drafts.draftsTitle} bodyClassName="text-[var(--foreground)]">
          <ul className="space-y-3">
            {drafts.map((draft) => (
              <li key={draft.id} className="rounded-xl border border-[var(--border)] p-3">
                <p className="font-medium text-[var(--foreground)]">{draft.title}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{draft.prompt}</p>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}
