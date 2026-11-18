"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ProStudioPack } from "@/lib/tezgah/pro/build";
import { SAAS_INSTALL_GUIDE_HEADING } from "@/lib/tezgah/pro/saas-builder";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

function downloadText(filename: string, text: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function downloadZip(filename: string, bytes: Uint8Array) {
  const blob = new Blob([Uint8Array.from(bytes)], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function svgDocument(svg: string): string {
  return `<!DOCTYPE html><html><body style="margin:0">${svg}</body></html>`;
}

export function ProStudioPreview({
  pack,
  deskTaskId,
  signedIn,
}: {
  pack: ProStudioPack;
  deskTaskId: string;
  signedIn: boolean;
}) {
  const [copied, setCopied] = useState("");
  const [deliverNote, setDeliverNote] = useState("");
  const [pending, setPending] = useState(false);
  const copyText = pack.tool === "technical-drawing" ? (pack.svg ?? "") : pack.tool === "saas-builder" ? (pack.html ?? "") : pack.markdown;

  async function copy(label: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
    } catch {
      setCopied("");
      setDeliverNote("Kopyalama bu tarayıcıda açılamadı. Metni seçip kopyala.");
    }
  }

  async function deliver() {
    if (!deskTaskId || pending) {
      return;
    }
    setPending(true);
    setDeliverNote("");
    try {
      const response = await fetch(
        "/api/career/desk",
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            taskId: deskTaskId,
            delivery: {
              tool: pack.tool,
              filename: pack.filename,
              summary: pack.summary,
              body: pack.body,
            },
          }),
        }),
      );
      const body = (await response.json()) as { ok?: boolean; error?: string; data?: { replayed?: boolean } };
      if (!response.ok || body.ok === false) {
        setDeliverNote(typeof body.error === "string" ? body.error : "Teslimat yazılamadı.");
        return;
      }
      setDeliverNote(body.data?.replayed ? "Teslimat çalışma odasında duruyor." : "Teslimat çalışma odasına yazıldı.");
    } catch {
      setDeliverNote("Bağlantı kurulamadı.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div data-pro-studio={pack.tool}>
    <Card title={pack.summary} eyebrow="Teslim">
      {pack.svg ? (
        <iframe
          title="Ölçü şeması önizleme"
          sandbox=""
          srcDoc={svgDocument(pack.svg)}
          className="h-80 w-full rounded-xl border border-[var(--border)] bg-white"
          data-pro-svg=""
        />
      ) : null}
      {pack.installGuide ? (
        <section className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4" data-pro-install-guide="">
          <h3 className="text-sm font-semibold tracking-tight text-[var(--foreground)]">{SAAS_INSTALL_GUIDE_HEADING}</h3>
          <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--foreground)]">{pack.installGuide}</pre>
        </section>
      ) : null}
      {pack.html ? (
        <iframe
          title="Bileşen önizleme"
          sandbox="allow-scripts"
          srcDoc={pack.html}
          className="mt-3 h-96 w-full rounded-xl border border-[var(--border)] bg-white"
          data-pro-html=""
        />
      ) : null}
      {pack.tool === "studio-photo" ? (
        <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--foreground)]">{pack.markdown}</pre>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2 print:hidden">
        <Button type="button" variant="secondary" onClick={() => void copy("Çıktı", copyText)}>
          {copied === "Çıktı" ? "Kopyalandı" : "Tek Tıkla Kopyala"}
        </Button>
        {pack.react ? (
          <Button type="button" variant="outline" onClick={() => void copy("React", pack.react ?? "")}>
            {copied === "React" ? "Kopyalandı" : "React kodunu kopyala"}
          </Button>
        ) : null}
        {pack.tool === "studio-photo" ? (
          <Button type="button" variant="outline" onClick={() => downloadText(pack.filename, pack.markdown, "text/markdown")}>
            .md İndir
          </Button>
        ) : null}
        {pack.svg ? (
          <Button type="button" variant="outline" onClick={() => downloadText(pack.filename, pack.svg ?? "", "image/svg+xml")}>
            .svg İndir
          </Button>
        ) : null}
        {pack.zip ? (
          <Button type="button" variant="outline" onClick={() => downloadZip(pack.filename, pack.zip ?? new Uint8Array())}>
            .zip İndir
          </Button>
        ) : null}
        {signedIn && deskTaskId ? (
          <Button type="button" data-pro-deliver="" disabled={pending} onClick={() => void deliver()}>
            {pending ? "Yazılıyor" : "Teslimat Olarak Ekle"}
          </Button>
        ) : null}
      </div>
      {deliverNote ? <p className="mt-3 text-sm text-[var(--foreground)]">{deliverNote}</p> : null}
      {signedIn && deskTaskId ? null : (
        <p className="mt-3 text-sm text-[var(--muted)]">
          {signedIn
            ? "Çalışma odasındaki görev kısayolundan açınca teslimat o göreve yazılır."
            : deskTaskId
              ? "Teslimat için oturum aç."
              : "Teslimat, oturum açıkken çalışma odası kısayolundan bu göreve yazılır."}
        </p>
      )}
    </Card>
    </div>
  );
}
