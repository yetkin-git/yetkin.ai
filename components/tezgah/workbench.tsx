"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Route } from "next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LinkButton } from "@/components/ui/link-button";
import { Textarea } from "@/components/ui/textarea";
import { buildCitizenRegisterHref } from "@/lib/kernel/auth/redirects";
import {
  TEZGAH_GUEST_QUOTA_MESSAGE,
  TEZGAH_TOOLS,
  tezgahQuotaLine,
  tezgahToolById,
  type TezgahToolId,
} from "@/lib/tezgah/catalog";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

type QuotaBody = {
  remaining: number;
  limit: number;
  guest: boolean;
};

const REGISTER_HREF = buildCitizenRegisterHref("/tezgah") as Route;

function Deliverable({ markdown }: { markdown: string }) {
  return (
    <div className="space-y-1.5 text-sm leading-6 text-[var(--foreground)]">
      {markdown.split("\n").map((line, index) => {
        if (line.startsWith("## ")) {
          return (
            <h3 key={`${index}-${line}`} className="pt-3 text-base font-semibold first:pt-0">
              {line.slice(3)}
            </h3>
          );
        }
        if (line.startsWith("- ")) {
          return (
            <p key={`${index}-${line}`} className="pl-4">
              • {line.slice(2)}
            </p>
          );
        }
        if (/^\d+\.\s/.test(line)) {
          return (
            <p key={`${index}-${line}`} className="pl-4">
              {line}
            </p>
          );
        }
        if (!line.trim()) {
          return <div key={`gap-${index}`} className="h-2" />;
        }
        return <p key={`${index}-${line}`}>{line}</p>;
      })}
    </div>
  );
}

function downloadText(filename: string, text: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function TezgahWorkbench() {
  const [toolId, setToolId] = useState<TezgahToolId>("ecommerce");
  const [values, setValues] = useState<Record<string, string>>({});
  const [quota, setQuota] = useState<QuotaBody | null>(null);
  const [markdown, setMarkdown] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const tool = tezgahToolById(toolId);

  useEffect(() => {
    let cancelled = false;
    async function loadQuota() {
      try {
        const response = await fetch("/api/tezgah/quota", withRailApiVersion({ method: "GET" }));
        const body = (await response.json()) as { ok?: boolean; data?: QuotaBody };
        if (!cancelled && body.ok && body.data) {
          setQuota(body.data);
        }
      } catch {
        if (!cancelled) {
          setQuota(null);
        }
      }
    }
    void loadQuota();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!tool) {
    return null;
  }
  const active = tool;

  const fieldsReady = active.fields.every((field) => (values[field.name] ?? "").trim().length >= 2);
  const blocked = quota != null && quota.remaining <= 0;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!fieldsReady || pending || blocked) {
      return;
    }
    setPending(true);
    setError("");
    setCopied(false);
    const payload: Record<string, string> = { tool: active.id };
    for (const field of active.fields) {
      payload[field.name] = (values[field.name] ?? "").trim();
    }
    try {
      const response = await fetch(
        "/api/tezgah/generate",
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        }),
      );
      const body = (await response.json()) as {
        ok?: boolean;
        error?: string;
        data?: { markdown?: string; remaining?: number; limit?: number; guest?: boolean };
      };
      if (!response.ok || body.ok === false || !body.data?.markdown) {
        setMarkdown("");
        setError(typeof body.error === "string" ? body.error : "Çıktı üretilemedi.");
        if (typeof body.data?.remaining === "number" && typeof body.data.limit === "number") {
          setQuota({
            remaining: body.data.remaining,
            limit: body.data.limit,
            guest: body.data.guest === true,
          });
        } else if (response.status === 429 && quota) {
          setQuota({ ...quota, remaining: 0 });
        }
        return;
      }
      setMarkdown(body.data.markdown);
      if (typeof body.data.remaining === "number" && typeof body.data.limit === "number") {
        setQuota({
          remaining: body.data.remaining,
          limit: body.data.limit,
          guest: body.data.guest === true,
        });
      }
    } catch {
      setError("Bağlantı kurulamadı. Yeniden dene.");
    } finally {
      setPending(false);
    }
  }

  async function copyOutput() {
    if (!markdown) {
      return;
    }
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
    } catch {
      setCopied(false);
      setError("Kopyalama bu tarayıcıda açılamadı. Metni seçip kopyala.");
    }
  }

  const showGuestCard =
    error === TEZGAH_GUEST_QUOTA_MESSAGE || (quota?.guest === true && quota.remaining <= 0);

  return (
    <div className="mt-6 space-y-5" data-tezgah-workbench="">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div role="tablist" aria-label="Üretim araçları" className="flex flex-wrap gap-2">
          {TEZGAH_TOOLS.map((item) => {
            const selected = item.id === active.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => {
                  setToolId(item.id);
                  setMarkdown("");
                  setError("");
                }}
                className={
                  selected
                    ? "rounded-xl bg-[var(--safir)] px-3 py-2 text-sm font-semibold text-white"
                    : "rounded-xl bg-[var(--surface-muted)] px-3 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--safir-soft)]"
                }
              >
                {item.label}
              </button>
            );
          })}
        </div>
        <p className="text-sm font-medium text-[var(--safir-deep)]" data-tezgah-quota="">
          {quota ? tezgahQuotaLine(quota.remaining, quota.limit) : "Bugünkü ücretsiz hakkınız yükleniyor"}
        </p>
      </div>

      {showGuestCard ? (
        <Card variant="featured" title={TEZGAH_GUEST_QUOTA_MESSAGE} eyebrow="Kayıt">
          <p className="text-sm leading-6 text-[var(--muted)]">
            Misafir hakkı bugün doldu. Ücretsiz hesap günde 3 üretime açılır ve her gece yenilenir.
          </p>
          <div className="mt-4">
            <LinkButton href={REGISTER_HREF} variant="success">
              Ücretsiz kayıt ol
            </LinkButton>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card title={active.label} eyebrow="Girdi">
          <p className="mb-4 text-sm leading-6 text-[var(--muted)]">{active.blurb}</p>
          <form className="space-y-4" onSubmit={onSubmit}>
            {active.fields.map((field) => (
              <label key={field.name} className="block text-sm font-medium text-[var(--foreground)]">
                {field.label}
                {field.kind === "textarea" ? (
                  <Textarea
                    className="mt-1"
                    name={field.name}
                    value={values[field.name] ?? ""}
                    placeholder={field.placeholder}
                    rows={5}
                    onChange={(event) =>
                      setValues((current) => ({ ...current, [field.name]: event.target.value }))
                    }
                  />
                ) : (
                  <Input
                    name={field.name}
                    value={values[field.name] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(event) =>
                      setValues((current) => ({ ...current, [field.name]: event.target.value }))
                    }
                  />
                )}
              </label>
            ))}
            {error ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
            <Button type="submit" disabled={!fieldsReady || pending || blocked}>
              {pending ? "Üretiliyor" : "Çıktıyı Üret"}
            </Button>
          </form>
        </Card>

        <Card title="Çıktı" eyebrow="Teslim" variant={markdown ? "featured" : "default"}>
          {markdown ? (
            <>
              <Deliverable markdown={markdown} />
              <div className="mt-5 flex flex-wrap gap-2">
                <Button type="button" variant="secondary" onClick={() => void copyOutput()}>
                  {copied ? "Kopyalandı" : "Tek Tıkla Kopyala"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => downloadText(`${active.fileStem}.md`, markdown, "text/markdown")}
                >
                  .md İndir
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => downloadText(`${active.fileStem}.txt`, markdown, "text/plain")}
                >
                  .txt İndir
                </Button>
              </div>
              <div className="mt-5 border-t border-[var(--border)] pt-4">
                <LinkButton href={active.cta.href} variant="success" size="sm">
                  {active.cta.label}
                </LinkButton>
              </div>
            </>
          ) : (
            <p className="text-sm leading-6 text-[var(--muted)]">
              Formu doldurup çıktıyı üret. Metin burada kart olarak durur; kopyalayıp müşterine
              verebilirsin.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
