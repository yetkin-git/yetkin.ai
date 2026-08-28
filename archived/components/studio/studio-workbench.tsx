"use client";

import { useState } from "react";
import { STUDIO_PROMPT_MAX_CHARS } from "@/lib/studio/schemas";
import { Badge } from "@/components/ui/badge";
import { GeneratePanel } from "@/components/studio/generate-panel";
import { cn } from "@/components/ui/cn";
import { STUDIO_SEN } from "@/archived/lib/copy/sen-voice/studio";

const TEMPLATES = [
  {
    id: "brief",
    label: "İş brifi",
    prompt:
      "Yetkin.ai freelancer ilanı için 120 kelimelik mühürlü iş brifi yaz. Emanet, teslim ve Türk Lirası disiplinini koru.",
  },
  {
    id: "copy",
    label: "Satış metni",
    prompt:
      "Yetkinİlan dijital ürün kartı için dürüst vitrin metni yaz. Sahte canlı GTM vaadi yok.",
  },
  {
    id: "lesson",
    label: "Ders özeti",
    prompt:
      "Akademi dersi için 5 maddelik özet: hesap güvenliği, tek cüzdan, tek üretim kapısı.",
  },
  {
    id: "tender",
    label: "İhale çağrısı",
    prompt:
      "Arena ihale duyurusu yaz. Ödül havuzu emanette güvende; turlar sırayla kapanır.",
  },
] as const;

export function StudioWorkbench({ draftId }: { draftId?: string }) {
  const [prompt, setPrompt] = useState("");
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="grid gap-5 lg:grid-cols-[10.5rem_minmax(0,1fr)]">
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          {STUDIO_SEN.workbench.palette}
        </p>
        <div className="flex flex-wrap gap-2 lg:flex-col">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => {
                setActive(template.id);
                setPrompt(template.prompt);
              }}
              className={cn(
                "rounded-[1.2rem_0.35rem_1.2rem_0.35rem] border px-3 py-2 text-left text-xs font-semibold transition",
                active === template.id
                  ? "border-[var(--safir)] bg-[var(--safir-soft)] text-[var(--safir-deep)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--safir)]",
              )}
            >
              {template.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-[var(--foreground)]">{STUDIO_SEN.workbench.promptLabel}</p>
          <Badge tone="violet">{STUDIO_SEN.workbench.sealedBadge}</Badge>
        </div>
        <GeneratePanel
          draftId={draftId}
          prompt={prompt}
          onPromptChange={setPrompt}
          maxChars={STUDIO_PROMPT_MAX_CHARS}
        />
      </div>
    </div>
  );
}
