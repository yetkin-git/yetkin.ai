import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { IconBolt, IconHash, IconLock, IconPlug } from "@/components/ui/icons";
import { DEVLABS_SEN } from "@/lib/copy/sen-voice/devlabs";

const INTEGRATION_ICONS = [IconPlug, IconLock, IconHash, IconBolt] as const;

export function IntegrationStrip() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {DEVLABS_SEN.vitrine.integrations.map((item, index) => {
        const Icon = INTEGRATION_ICONS[index] ?? IconPlug;
        return (
          <Card key={item.label} variant="glass" className="p-4" bodyClassName="text-[var(--foreground)]">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--safir-soft)] text-[var(--safir-deep)]">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold tracking-tight">{item.label}</p>
                <p className="text-xs text-[var(--muted)]">{item.hint}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export function SandboxPreviewCards() {
  const copy = DEVLABS_SEN.vitrine;
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card variant="featured" eyebrow={copy.sandboxEyebrow} title={copy.sandboxTitle} bodyClassName="text-[var(--foreground)]">
        <Badge tone="emerald">Canlı tür</Badge>
        <p className="mt-3 text-sm text-[var(--muted)]">{copy.sandboxBody}</p>
        <div className="mt-4 overflow-hidden rounded-md border border-emerald-500/20 bg-[#010409] font-mono">
          <div className="flex items-center gap-2 border-b border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white/40">
            <span className="room-led h-1.5 w-1.5 rounded-full bg-emerald-400" />
            tezgah
          </div>
          <pre className="px-3 py-3 text-[11px] leading-5 text-emerald-300">{copy.sandboxPreview}</pre>
        </div>
      </Card>
      <Card variant="glass" eyebrow={copy.vaultEyebrow} title={copy.vaultTitle} bodyClassName="text-[var(--foreground)]">
        <Badge tone="gold">Vitrin</Badge>
        <p className="mt-3 text-sm text-[var(--muted)]">{copy.vaultBody}</p>
        <div className="mt-4 rounded-md border border-dashed border-sky-400/30 bg-[#010409] p-3 font-mono text-[11px] text-sky-300">
          {copy.vaultPreview}
        </div>
      </Card>
      <Card variant="glass" eyebrow={copy.lineEyebrow} title={copy.lineTitle} bodyClassName="text-[var(--foreground)]">
        <Badge tone="safir">Kasa</Badge>
        <p className="mt-3 text-sm text-[var(--muted)]">{copy.lineBody}</p>
        <div className="mt-4 rounded-md border border-dashed border-sky-400/30 bg-[#010409] p-3 font-mono text-[11px] text-sky-300">
          {copy.linePreview}
        </div>
      </Card>
    </div>
  );
}
