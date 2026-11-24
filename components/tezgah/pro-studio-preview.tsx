"use client";

import { useState } from "react";
import type { Route } from "next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import type { ProStudioPack } from "@/lib/tezgah/pro/build";
import {
  studioPhotoPazaryeriHandoffHref,
  studioPhotoReklamHandoffHref,
} from "@/lib/tezgah/pro/studio-photo-bridges";
import type { StudioSceneId } from "@/lib/tezgah/pro/options";
import {
  STUDIO_PHOTO_GUIDE_FILENAME,
  STUDIO_PHOTO_IMAGE_FILENAME,
  STUDIO_PHOTO_ZIP_FILENAME,
} from "@/lib/tezgah/pro/studio-photo";
import {
  SAAS_BUILDER_ECOMMERCE_HREF,
  saasBuilderDukkanHandoffHref,
} from "@/lib/tezgah/pro/saas-builder-bridges";
import {
  SAAS_HTML_FILENAME,
  SAAS_INSTALL_GUIDE_HEADING,
  SAAS_REACT_FILENAME,
  SAAS_WIDGET_JS_FILENAME,
  SAAS_ZIP_FILENAME,
} from "@/lib/tezgah/pro/saas-builder";
import {
  TECHNICAL_DRAWING_DXF_FILENAME,
  TECHNICAL_DRAWING_PDF_FILENAME,
  TECHNICAL_DRAWING_ZIP_FILENAME,
} from "@/lib/tezgah/pro/technical-drawing";
import {
  technicalDrawingPazaryeriHandoffHref,
  technicalDrawingSaasHandoffHref,
} from "@/lib/tezgah/pro/technical-drawing-bridges";
import { parseTechnicalDrawingArchive } from "@/lib/tezgah/pro/technical-drawing-export";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

type SaasCodeTab = "html" | "js" | "react";

export type StudioPhotoDelivery = {
  tool: "studio-photo";
  summary: string;
  markdown: string;
  guideMarkdown: string;
  standardLabel: string;
  scene: StudioSceneId;
  sceneLabel: string;
  productName: string;
  features: string;
  dataUrl: string;
  imageBase64: string;
  mimeType: string;
  zipBase64: string;
  filename: string;
  imageFilename: string;
  zipFilename: string;
  guideFilename: string;
  targetWidthPx: number;
  targetHeightPx: number;
  producedWidthPx: number | null;
  producedHeightPx: number | null;
};

function downloadText(filename: string, text: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function downloadBytes(filename: string, bytes: Uint8Array, mime: string) {
  const copy = new Uint8Array(bytes);
  const blob = new Blob([copy.buffer], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function downloadZip(filename: string, bytes: Uint8Array) {
  downloadBytes(filename, bytes, "application/zip");
}

function downloadBase64(filename: string, base64: string, mime: string) {
  const binary = atob(base64.replace(/\s+/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  downloadBytes(filename, bytes, mime);
}

function svgDocument(svg: string): string {
  return `<!DOCTYPE html><html><body style="margin:0">${svg}</body></html>`;
}

function StudioPhotoCard({
  delivery,
  deskTaskId,
  signedIn,
}: {
  delivery: StudioPhotoDelivery;
  deskTaskId: string;
  signedIn: boolean;
}) {
  const [copied, setCopied] = useState("");
  const [deliverNote, setDeliverNote] = useState("");
  const [pending, setPending] = useState(false);
  const produced =
    delivery.producedWidthPx != null && delivery.producedHeightPx != null
      ? `Üretilen görsel: ${delivery.producedWidthPx}×${delivery.producedHeightPx} px`
      : "Üretilen görsel: piksel ölçümü okunamadı (hedef oran talep edildi).";

  const pazaryeriHref = studioPhotoPazaryeriHandoffHref({
    productName: delivery.productName,
    scene: delivery.scene,
    features: delivery.features,
  });
  const reklamHref = studioPhotoReklamHandoffHref({
    productName: delivery.productName,
    sceneLabel: delivery.sceneLabel,
    features: delivery.features,
  });

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
              tool: "studio-photo",
              filename: delivery.imageFilename || STUDIO_PHOTO_IMAGE_FILENAME,
              summary: delivery.summary,
              body: delivery.markdown,
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
    <div data-pro-studio="studio-photo" data-studio-photo-preview="">
      <Card title={delivery.summary} eyebrow="Teslim">
        <p className="text-sm text-[var(--foreground)]" data-studio-standard="">
          {delivery.standardLabel}
        </p>
        <p className="mt-1 text-sm text-[var(--muted)]" data-studio-produced="">
          {produced}
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element -- data URL stüdyo önizlemesi */}
        <img
          src={delivery.dataUrl}
          alt={delivery.productName}
          className="mt-3 max-h-[28rem] w-full rounded-xl border border-[var(--border)] bg-white object-contain"
          data-studio-image=""
        />
        <div className="mt-4 flex flex-wrap gap-2 print:hidden">
          <Button
            type="button"
            variant="outline"
            data-studio-download-png=""
            onClick={() =>
              downloadBase64(
                delivery.imageFilename || STUDIO_PHOTO_IMAGE_FILENAME,
                delivery.imageBase64,
                delivery.mimeType || "image/png",
              )
            }
          >
            Görseli İndir (.png)
          </Button>
          <Button
            type="button"
            variant="outline"
            data-studio-download-zip=""
            onClick={() =>
              downloadBase64(
                delivery.zipFilename || STUDIO_PHOTO_ZIP_FILENAME,
                delivery.zipBase64,
                "application/zip",
              )
            }
          >
            Stüdyo Paketi İndir (.zip — ürün görseli + SEO alt metni + galeri kılavuzu)
          </Button>
          <Button
            type="button"
            variant="outline"
            data-studio-download-guide=""
            onClick={() =>
              downloadText(
                delivery.guideFilename || STUDIO_PHOTO_GUIDE_FILENAME,
                delivery.guideMarkdown,
                "text/markdown",
              )
            }
          >
            Kılavuzu İndir (.md)
          </Button>
          <Button type="button" variant="secondary" onClick={() => void copy("Çıktı", delivery.markdown)}>
            {copied === "Çıktı" ? "Kopyalandı" : "Tek Tıkla Kopyala"}
          </Button>
          {signedIn && deskTaskId ? (
            <Button type="button" data-pro-deliver="" disabled={pending} onClick={() => void deliver()}>
              {pending ? "Yazılıyor" : "Teslimat Olarak Ekle"}
            </Button>
          ) : null}
        </div>
        <div className="mt-4 flex flex-wrap gap-2 print:hidden">
          <LinkButton href={pazaryeriHref as Route} variant="outline" data-studio-pazaryeri-handoff="">
            Pazaryeri Kataloğuna Ekle (pazaryeri)
          </LinkButton>
          <LinkButton href={reklamHref as Route} variant="outline" data-studio-reklam-handoff="">
            Bu Görselle Reklam Paketi Oluştur (reklam)
          </LinkButton>
        </div>
        {deliverNote ? <p className="mt-3 text-sm text-[var(--foreground)]">{deliverNote}</p> : null}
      </Card>
    </div>
  );
}

export function ProStudioPreview({
  pack,
  studio,
  deskTaskId,
  signedIn,
}: {
  pack?: ProStudioPack | null;
  studio?: StudioPhotoDelivery | null;
  deskTaskId: string;
  signedIn: boolean;
}) {
  const [copied, setCopied] = useState("");
  const [deliverNote, setDeliverNote] = useState("");
  const [pending, setPending] = useState(false);
  const [saasTab, setSaasTab] = useState<SaasCodeTab>("html");

  if (studio) {
    return <StudioPhotoCard delivery={studio} deskTaskId={deskTaskId} signedIn={signedIn} />;
  }
  if (!pack) {
    return null;
  }
  const activePack = pack;
  const drawingArchive =
    activePack.tool === "technical-drawing" ? parseTechnicalDrawingArchive(activePack.body) : null;
  const isSaas = activePack.tool === "saas-builder";

  const copyText =
    activePack.tool === "technical-drawing"
      ? (activePack.svg ?? "")
      : isSaas
        ? saasTab === "js"
          ? (activePack.widgetJs ?? "")
          : saasTab === "react"
            ? (activePack.react ?? "")
            : (activePack.html ?? "")
        : activePack.markdown;

  const saasCodeLabel =
    saasTab === "js" ? "widget.js" : saasTab === "react" ? "App.jsx" : "index.html";

  const drawingSaasHref =
    drawingArchive != null
      ? technicalDrawingSaasHandoffHref({
          productName: drawingArchive.productName,
          widthMm: drawingArchive.widthMm,
          heightMm: drawingArchive.heightMm,
          depthMm: drawingArchive.depthMm,
        })
      : null;
  const pazaryeriHref =
    drawingArchive != null
      ? technicalDrawingPazaryeriHandoffHref({
          productName: drawingArchive.productName,
          widthMm: drawingArchive.widthMm,
          heightMm: drawingArchive.heightMm,
          depthMm: drawingArchive.depthMm,
          material: drawingArchive.material,
        })
      : null;
  const dukkanHref = isSaas
    ? saasBuilderDukkanHandoffHref({
        title: activePack.saasTitle || activePack.summary,
        feature: activePack.saasFeature || activePack.summary,
        detail: activePack.saasDetail,
      })
    : null;

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
              tool: activePack.tool,
              filename: activePack.filename,
              summary: activePack.summary,
              body: activePack.body,
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
    <div data-pro-studio={activePack.tool}>
      <Card title={activePack.summary} eyebrow="Teslim">
        {activePack.svg ? (
          <iframe
            title="Ölçü şeması önizleme"
            sandbox=""
            srcDoc={svgDocument(activePack.svg)}
            className="h-[28rem] w-full rounded-xl border border-[var(--border)] bg-white"
            data-pro-svg=""
          />
        ) : null}
        {activePack.installGuide ? (
          <section className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4" data-pro-install-guide="">
            <h3 className="text-sm font-semibold tracking-tight text-[var(--foreground)]">{SAAS_INSTALL_GUIDE_HEADING}</h3>
            <pre className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--foreground)]">{activePack.installGuide}</pre>
          </section>
        ) : null}
        {activePack.html ? (
          <iframe
            title="Bileşen önizleme"
            sandbox="allow-scripts"
            srcDoc={activePack.html}
            className="mt-3 h-96 w-full rounded-xl border border-[var(--border)] bg-white"
            data-pro-html=""
          />
        ) : null}
        {isSaas ? (
          <section className="mt-3 rounded-xl border border-[var(--border)] p-3" data-saas-code-tabs="">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant={saasTab === "html" ? "primary" : "outline"}
                data-saas-tab-html=""
                onClick={() => setSaasTab("html")}
              >
                HTML (index.html)
              </Button>
              <Button
                type="button"
                size="sm"
                variant={saasTab === "js" ? "primary" : "outline"}
                data-saas-tab-js=""
                onClick={() => setSaasTab("js")}
              >
                Gömülebilir JS (widget.js)
              </Button>
              <Button
                type="button"
                size="sm"
                variant={saasTab === "react" ? "primary" : "outline"}
                data-saas-tab-react=""
                onClick={() => setSaasTab("react")}
              >
                React (App.jsx)
              </Button>
            </div>
            <pre
              className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-[var(--surface-muted)] p-3 text-xs leading-5 text-[var(--foreground)]"
              data-saas-code-panel=""
            >
              {copyText}
            </pre>
          </section>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2 print:hidden">
          <Button type="button" variant="secondary" onClick={() => void copy("Çıktı", copyText)}>
            {copied === "Çıktı" ? "Kopyalandı" : isSaas ? `${saasCodeLabel} kopyala` : "Tek Tıkla Kopyala"}
          </Button>
          {isSaas && activePack.html ? (
            <Button
              type="button"
              variant="outline"
              data-saas-download-html=""
              onClick={() => downloadText(SAAS_HTML_FILENAME, activePack.html ?? "", "text/html;charset=utf-8")}
            >
              .html İndir
            </Button>
          ) : null}
          {isSaas && activePack.widgetJs ? (
            <Button
              type="button"
              variant="outline"
              data-saas-download-js=""
              onClick={() =>
                downloadText(SAAS_WIDGET_JS_FILENAME, activePack.widgetJs ?? "", "text/javascript;charset=utf-8")
              }
            >
              .js İndir
            </Button>
          ) : null}
          {isSaas && activePack.react ? (
            <Button
              type="button"
              variant="outline"
              data-saas-download-jsx=""
              onClick={() =>
                downloadText(SAAS_REACT_FILENAME, activePack.react ?? "", "text/jsx;charset=utf-8")
              }
            >
              .jsx İndir
            </Button>
          ) : null}
          {activePack.react && !isSaas ? (
            <Button type="button" variant="outline" onClick={() => void copy("React", activePack.react ?? "")}>
              {copied === "React" ? "Kopyalandı" : "React kodunu kopyala"}
            </Button>
          ) : null}
          {activePack.svg ? (
            <Button
              type="button"
              variant="outline"
              data-drawing-download-svg=""
              onClick={() => downloadText(activePack.filename, activePack.svg ?? "", "image/svg+xml")}
            >
              .svg İndir
            </Button>
          ) : null}
          {activePack.dxf ? (
            <Button
              type="button"
              variant="outline"
              data-drawing-download-dxf=""
              onClick={() => downloadText(TECHNICAL_DRAWING_DXF_FILENAME, activePack.dxf ?? "", "application/dxf")}
            >
              .dxf İndir
            </Button>
          ) : null}
          {activePack.pdf ? (
            <Button
              type="button"
              variant="outline"
              data-drawing-download-pdf=""
              onClick={() => downloadBytes(TECHNICAL_DRAWING_PDF_FILENAME, activePack.pdf ?? new Uint8Array(), "application/pdf")}
            >
              .pdf İndir
            </Button>
          ) : null}
          {activePack.zip ? (
            <Button
              type="button"
              variant="outline"
              data-drawing-download-zip={activePack.tool === "technical-drawing" ? "" : undefined}
              data-saas-download-zip={isSaas ? "" : undefined}
              onClick={() =>
                downloadZip(
                  activePack.zipFilename ||
                    activePack.filename ||
                    (isSaas ? SAAS_ZIP_FILENAME : TECHNICAL_DRAWING_ZIP_FILENAME),
                  activePack.zip ?? new Uint8Array(),
                )
              }
            >
              {activePack.tool === "technical-drawing"
                ? "Üretim Paketi (.zip)"
                : isSaas
                  ? "mini-saas.zip (5 dosya)"
                  : ".zip İndir"}
            </Button>
          ) : null}
          {signedIn && deskTaskId ? (
            <Button type="button" data-pro-deliver="" disabled={pending} onClick={() => void deliver()}>
              {pending ? "Yazılıyor" : "Teslimat Olarak Ekle"}
            </Button>
          ) : null}
        </div>
        {drawingSaasHref && pazaryeriHref ? (
          <div className="mt-4 flex flex-wrap gap-2 print:hidden" data-drawing-bridges="">
            <LinkButton href={drawingSaasHref as Route} variant="outline" data-drawing-saas-handoff="">
              Kargo &amp; Desi Hesaplayıcı Oluştur (saas-builder)
            </LinkButton>
            <LinkButton href={pazaryeriHref as Route} variant="outline" data-drawing-pazaryeri-handoff="">
              Pazaryeri Kataloğuna Ekle (pazaryeri)
            </LinkButton>
          </div>
        ) : null}
        {dukkanHref ? (
          <div className="mt-4 flex flex-wrap gap-2 print:hidden" data-saas-bridges="">
            <LinkButton href={dukkanHref as Route} variant="outline" data-saas-dukkan-handoff="">
              Dijital Dükkan Vitrinine Geç (dukkan)
            </LinkButton>
            <LinkButton
              href={SAAS_BUILDER_ECOMMERCE_HREF as Route}
              variant="outline"
              data-saas-ecommerce=""
            >
              E-Ticaret Mağaza Kokpitini Aç
            </LinkButton>
          </div>
        ) : null}
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
