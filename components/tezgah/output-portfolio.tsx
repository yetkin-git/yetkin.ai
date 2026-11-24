"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import { useIdempotencyKey } from "@/components/kernel/use-idempotency-key";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { readCitizenEnvelope } from "@/lib/kernel/http/citizen-json";
import {
  TEZGAH_SEAL_LABEL,
  tezgahSealPath,
  tezgahToolById,
  type TezgahToolId,
} from "@/lib/tezgah/catalog";
import { PAZARYERI_FILENAME } from "@/lib/tezgah/pazaryeri/copy";
import { buildPazaryeriDocxFromCsv, buildPazaryeriPdfFromCsv } from "@/lib/tezgah/pazaryeri/document";
import { buildProposalDocx, buildProposalPdf } from "@/lib/tezgah/proposal/document";
import {
  REKLAM_GOOGLE_CSV_FILENAME,
  REKLAM_META_CSV_FILENAME,
} from "@/lib/tezgah/reklam/copy";
import { buildGoogleAdsCsv, buildMetaAdsCsv } from "@/lib/tezgah/reklam/csv";
import { buildReklamDocx, buildReklamPdf } from "@/lib/tezgah/reklam/document";
import { parseSealedReklamMarkdown } from "@/lib/tezgah/reklam/guard";
import { parseTetkikArchive } from "@/lib/tezgah/tetkik/archive";
import { buildTetkikPdf, tetkikPdfFileName, tetkikReportPlainText } from "@/lib/tezgah/tetkik/document";
import {
  base64ToBytes,
  buildStudioPhotoZip,
  buildStudioPhoto,
  parseStudioPhotoArchive,
  STUDIO_PHOTO_IMAGE_FILENAME,
  STUDIO_PHOTO_ZIP_FILENAME,
} from "@/lib/tezgah/pro/studio-photo";
import {
  archiveToSaasZip,
  parseSaasBuilderArchive,
  SAAS_HTML_FILENAME,
  SAAS_REACT_FILENAME,
  SAAS_ZIP_FILENAME,
} from "@/lib/tezgah/pro/saas-builder";
import {
  TECHNICAL_DRAWING_DXF_FILENAME,
  TECHNICAL_DRAWING_FILENAME,
  TECHNICAL_DRAWING_PDF_FILENAME,
} from "@/lib/tezgah/pro/technical-drawing";
import {
  archiveToTechnicalDrawingPack,
  buildTechnicalDrawingPdf,
  parseTechnicalDrawingArchive,
  readTechnicalDrawingSvg,
} from "@/lib/tezgah/pro/technical-drawing-export";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

export type TezgahHistoryItem = {
  id: string;
  toolKey: string;
  title: string;
  createdAt: string;
};

type TezgahHistoryPage = {
  outputs?: TezgahHistoryItem[];
  nextCursor?: string | null;
};

type TezgahArchiveRecord = {
  id: string;
  toolKey: string;
  title: string;
  inputSummary: string;
  outputContent: string;
  createdAt: string;
};

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
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

function downloadText(filename: string, text: string, mime: string) {
  downloadBytes(filename, new TextEncoder().encode(text), mime);
}

function fileStemFor(toolKey: string, title: string): string {
  const tool = tezgahToolById(toolKey);
  const raw = (tool?.fileStem || title || "tezgah-cikti").trim().toLocaleLowerCase("tr-TR");
  return raw.replace(/[^a-z0-9ğüşıöç_-]+/gi, "-").replace(/^-|-$/g, "") || "tezgah-cikti";
}

export function PortfolioAddButton({
  outputId,
  label = "Kamu Portföyüme Ekle",
}: {
  outputId: string;
  label?: string;
}) {
  const idempotency = useIdempotencyKey();
  const [pending, setPending] = useState(false);
  const [note, setNote] = useState("");

  async function add() {
    if (pending) {
      return;
    }
    setPending(true);
    setNote("");
    try {
      const response = await fetch(
        "/api/career/portfolio",
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json", ...idempotency.headers() },
          body: JSON.stringify({ tezgahOutputId: outputId }),
        }),
      );
      const envelope = await readCitizenEnvelope(response);
      if (!envelope.ok) {
        setNote(envelope.error ?? "Portföye eklenemedi.");
        idempotency.rotate();
        return;
      }
      setNote("Kamu portföyüne eklendi. Mühür kartında görünür.");
    } catch {
      setNote("Portföye eklenemedi.");
      idempotency.rotate();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-1">
      <Button type="button" size="sm" variant="secondary" disabled={pending} onClick={() => void add()}>
        {pending ? "Ekleniyor…" : label}
      </Button>
      {note ? <p className="text-xs text-[var(--muted)]">{note}</p> : null}
    </div>
  );
}

export function TezgahOutputBridge({
  toolId,
  outputId,
  signedIn,
}: {
  toolId: TezgahToolId;
  outputId: string | null;
  signedIn: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 print:hidden" data-tezgah-output-bridge="">
      {signedIn && outputId ? <PortfolioAddButton outputId={outputId} /> : null}
      <LinkButton href={tezgahSealPath(toolId) as Route} variant="outline" size="sm">
        {TEZGAH_SEAL_LABEL}
      </LinkButton>
    </div>
  );
}

function ArchiveItemActions({ item }: { item: TezgahHistoryItem }) {
  const [pending, setPending] = useState(false);
  const [note, setNote] = useState("");
  const [opened, setOpened] = useState<TezgahArchiveRecord | null>(null);
  const [copied, setCopied] = useState(false);

  async function load(): Promise<TezgahArchiveRecord | null> {
    if (opened) {
      return opened;
    }
    setPending(true);
    setNote("");
    try {
      const response = await fetch(
        `/api/tezgah/outputs/${encodeURIComponent(item.id)}`,
        withRailApiVersion({ method: "GET" }),
      );
      const body = (await response.json()) as {
        ok?: boolean;
        error?: string;
        data?: TezgahArchiveRecord;
      };
      if (!response.ok || body.ok === false || !body.data?.outputContent) {
        setNote(typeof body.error === "string" ? body.error : "Arşiv açılamadı.");
        return null;
      }
      setOpened(body.data);
      return body.data;
    } catch {
      setNote("Arşiv açılamadı.");
      return null;
    } finally {
      setPending(false);
    }
  }

  async function openArchive() {
    const record = await load();
    if (record) {
      setNote("Arşiv açıldı.");
    }
  }

  async function copyArchive() {
    const record = await load();
    if (!record) {
      return;
    }
    try {
      await navigator.clipboard.writeText(record.outputContent);
      setCopied(true);
      setNote("Kopyalandı.");
      window.setTimeout(() => setCopied(false), 2_000);
    } catch {
      setNote("Kopyalanamadı.");
    }
  }

  async function downloadArchive(
    kind:
      | "md"
      | "docx"
      | "pdf"
      | "html"
      | "google-csv"
      | "meta-csv"
      | "pazaryeri-csv"
      | "studio-png"
      | "studio-zip"
      | "drawing-svg"
      | "drawing-dxf"
      | "drawing-pdf"
      | "saas-html"
      | "saas-jsx"
      | "saas-zip",
  ) {
    const record = await load();
    if (!record) {
      return;
    }
    const stem = fileStemFor(record.toolKey, record.title);
    if (kind === "saas-html" || kind === "saas-jsx" || kind === "saas-zip") {
      const archive = parseSaasBuilderArchive(record.outputContent);
      if (!archive) {
        setNote("Mini SaaS arşivi yeniden kurulamadı.");
        return;
      }
      if (kind === "saas-html") {
        downloadText(SAAS_HTML_FILENAME, archive.html, "text/html;charset=utf-8");
        return;
      }
      if (kind === "saas-jsx") {
        downloadText(SAAS_REACT_FILENAME, archive.reactJsx, "text/jsx;charset=utf-8");
        return;
      }
      downloadBytes(SAAS_ZIP_FILENAME, archiveToSaasZip(archive), "application/zip");
      return;
    }
    if (kind === "drawing-svg" || kind === "drawing-dxf" || kind === "drawing-pdf") {
      const archive = parseTechnicalDrawingArchive(record.outputContent);
      const svg = readTechnicalDrawingSvg(record.outputContent);
      if (kind === "drawing-svg") {
        if (!svg) {
          setNote("Ölçü şeması yeniden kurulamadı.");
          return;
        }
        downloadText(TECHNICAL_DRAWING_FILENAME, svg, "image/svg+xml");
        return;
      }
      if (!archive) {
        setNote("Teknik çizim arşivi yeniden kurulamadı.");
        return;
      }
      if (kind === "drawing-dxf") {
        downloadText(TECHNICAL_DRAWING_DXF_FILENAME, archive.dxf, "application/dxf");
        return;
      }
      const pdf = buildTechnicalDrawingPdf(archiveToTechnicalDrawingPack(archive));
      downloadBytes(TECHNICAL_DRAWING_PDF_FILENAME, pdf, "application/pdf");
      return;
    }
    if (kind === "studio-png" || kind === "studio-zip") {
      const archive = parseStudioPhotoArchive(record.outputContent);
      if (!archive) {
        setNote("Stüdyo paketi yeniden kurulamadı.");
        return;
      }
      if (kind === "studio-png") {
        downloadBytes(
          STUDIO_PHOTO_IMAGE_FILENAME,
          base64ToBytes(archive.imageBase64),
          archive.mimeType || "image/png",
        );
        return;
      }
      const pack = buildStudioPhoto(
        {
          productName: archive.productName,
          features: archive.altTexts[0]?.text ?? archive.productName,
          scene: archive.scene,
          galleryCount: Math.max(3, Math.min(8, archive.altTexts.length || 4)),
        },
        archive.producedWidthPx != null && archive.producedHeightPx != null
          ? { widthPx: archive.producedWidthPx, heightPx: archive.producedHeightPx }
          : null,
      );
      if (!pack) {
        setNote("Stüdyo paketi yeniden kurulamadı.");
        return;
      }
      const zip = buildStudioPhotoZip({
        imageBytes: base64ToBytes(archive.imageBase64),
        pack: {
          ...pack,
          markdown: archive.markdown,
          guideMarkdown: archive.guideMarkdown,
          altMarkdown: archive.altMarkdown,
        },
      });
      downloadBytes(STUDIO_PHOTO_ZIP_FILENAME, zip, "application/zip");
      return;
    }
    if (kind === "html") {
      downloadText(`${stem}.html`, record.outputContent, "text/html;charset=utf-8");
      return;
    }
    if (kind === "pazaryeri-csv") {
      downloadText(PAZARYERI_FILENAME, record.outputContent, "text/csv;charset=utf-8");
      return;
    }
    if (kind === "md") {
      const studioArchive = parseStudioPhotoArchive(record.outputContent);
      downloadText(
        `${stem}.md`,
        studioArchive?.markdown ?? record.outputContent,
        "text/markdown",
      );
      return;
    }
    if (kind === "google-csv" || kind === "meta-csv") {
      const pack = parseSealedReklamMarkdown(record.outputContent);
      if (!pack) {
        setNote("Reklam CSV yeniden kurulamadı.");
        return;
      }
      const csv = kind === "google-csv" ? buildGoogleAdsCsv(pack) : buildMetaAdsCsv(pack);
      const name = kind === "google-csv" ? REKLAM_GOOGLE_CSV_FILENAME : REKLAM_META_CSV_FILENAME;
      downloadText(name, csv, "text/csv;charset=utf-8");
      return;
    }
    if (kind === "docx") {
      if (record.toolKey === "reklam") {
        downloadBytes(
          `${stem}.docx`,
          buildReklamDocx(record.outputContent),
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        );
        return;
      }
      if (record.toolKey === "pazaryeri") {
        downloadBytes(
          `${stem}.docx`,
          buildPazaryeriDocxFromCsv(record.outputContent, record.title),
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        );
        return;
      }
      downloadBytes(
        `${stem}.docx`,
        buildProposalDocx(record.outputContent),
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      );
      return;
    }
    if (record.toolKey === "reklam") {
      downloadBytes(`${stem}.pdf`, buildReklamPdf(record.outputContent), "application/pdf");
      return;
    }
    if (record.toolKey === "pazaryeri") {
      downloadBytes(`${stem}.pdf`, buildPazaryeriPdfFromCsv(record.outputContent, record.title), "application/pdf");
      return;
    }
    downloadBytes(`${stem}.pdf`, buildProposalPdf(record.outputContent), "application/pdf");
  }

  const isProposal = item.toolKey === "proposal";
  const isDukkan = item.toolKey === "dukkan";
  const isReklam = item.toolKey === "reklam";
  const isPazaryeri = item.toolKey === "pazaryeri";
  const isStudioPhoto = item.toolKey === "studio-photo";
  const isTechnicalDrawing = item.toolKey === "technical-drawing";
  const isSaasBuilder = item.toolKey === "saas-builder";
  const isTetkik = item.toolKey === "tetkik";
  const openedSvg = opened ? readTechnicalDrawingSvg(opened.outputContent) : null;
  const openedSaas = opened && isSaasBuilder ? parseSaasBuilderArchive(opened.outputContent) : null;
  /**
   * Y3 — tetkik arşivi `tetkik-v1` zarfıdır. Çözülürse rapor yeniden basılır
   * (PDF dahil); eski düz metin kayıtlar `null` döner ve özet olarak gösterilir.
   */
  const openedTetkik = opened && isTetkik ? parseTetkikArchive(opened.outputContent) : null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => void openArchive()}>
          {pending ? "Açılıyor…" : "Aç"}
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => void copyArchive()}>
          {copied ? "Kopyalandı" : "Kopyala"}
        </Button>
        {isDukkan ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => void downloadArchive("html")}
            data-dukkan-archive-html=""
          >
            .html İndir
          </Button>
        ) : isPazaryeri ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => void downloadArchive("pazaryeri-csv")}
            data-pazaryeri-archive-csv=""
          >
            .csv İndir
          </Button>
        ) : isStudioPhoto ? (
          <>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => void downloadArchive("studio-png")}
              data-studio-archive-png=""
            >
              .png İndir
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => void downloadArchive("studio-zip")}
              data-studio-archive-zip=""
            >
              .zip İndir
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => void downloadArchive("md")}
              data-studio-archive-md=""
            >
              .md İndir
            </Button>
          </>
        ) : isTechnicalDrawing ? (
          <>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => void downloadArchive("drawing-svg")}
              data-drawing-archive-svg=""
            >
              .svg İndir
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => void downloadArchive("drawing-dxf")}
              data-drawing-archive-dxf=""
            >
              .dxf İndir
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => void downloadArchive("drawing-pdf")}
              data-drawing-archive-pdf=""
            >
              .pdf İndir
            </Button>
          </>
        ) : isSaasBuilder ? (
          <>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => void downloadArchive("saas-html")}
              data-saas-archive-html=""
            >
              .html İndir
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => void downloadArchive("saas-jsx")}
              data-saas-archive-jsx=""
            >
              .jsx İndir
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => void downloadArchive("saas-zip")}
              data-saas-archive-zip=""
            >
              .zip İndir
            </Button>
          </>
        ) : (
          <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => void downloadArchive("md")}>
            .md İndir
          </Button>
        )}
        {isProposal || isReklam || isPazaryeri ? (
          <>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => void downloadArchive("docx")}
              data-reklam-archive-docx={isReklam ? "" : undefined}
              data-pazaryeri-archive-docx={isPazaryeri ? "" : undefined}
            >
              Word (.docx)
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => void downloadArchive("pdf")}
              data-reklam-archive-pdf={isReklam ? "" : undefined}
              data-pazaryeri-archive-pdf={isPazaryeri ? "" : undefined}
            >
              PDF
            </Button>
          </>
        ) : null}
        {isReklam ? (
          <>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => void downloadArchive("google-csv")}
              data-reklam-archive-google-csv=""
            >
              Google Ads CSV
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => void downloadArchive("meta-csv")}
              data-reklam-archive-meta-csv=""
            >
              Meta Ads CSV
            </Button>
          </>
        ) : null}
      </div>
      <PortfolioAddButton outputId={item.id} />
      {note ? <p className="text-xs text-[var(--muted)]">{note}</p> : null}
      {opened ? (
        openedTetkik ? (
          <div className="space-y-2">
            <p className="text-xs text-[var(--muted)]">
              Skor {openedTetkik.report.score}/{openedTetkik.report.maxScore} ·{" "}
              {openedTetkik.report.url}
            </p>
            <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-[var(--surface-muted)] p-2 text-xs leading-5 text-[var(--foreground)]">
              {tetkikReportPlainText(openedTetkik.report)}
            </pre>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                downloadBytes(
                  tetkikPdfFileName(openedTetkik.report),
                  buildTetkikPdf(openedTetkik.report),
                  "application/pdf",
                )
              }
              data-tetkik-archive-pdf=""
            >
              PDF İndir
            </Button>
          </div>
        ) : openedSvg ? (
          <iframe
            title="Arşiv ölçü şeması"
            sandbox=""
            srcDoc={`<!DOCTYPE html><html><body style="margin:0">${openedSvg}</body></html>`}
            className="h-56 w-full rounded-lg border border-[var(--border)] bg-white"
            data-drawing-archive-preview=""
          />
        ) : openedSaas ? (
          <iframe
            title="Arşiv mini SaaS önizleme"
            sandbox="allow-scripts"
            srcDoc={openedSaas.html}
            className="h-56 w-full rounded-lg border border-[var(--border)] bg-white"
            data-saas-archive-preview=""
          />
        ) : (
          <pre className="max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-[var(--surface-muted)] p-2 text-xs leading-5 text-[var(--foreground)]">
            {parseStudioPhotoArchive(opened.outputContent)?.markdown ?? opened.outputContent}
          </pre>
        )
      ) : null}
    </div>
  );
}

export function TezgahHistoryDrawer({
  items,
  nextCursor = null,
}: {
  items: readonly TezgahHistoryItem[];
  nextCursor?: string | null;
}) {
  const [rows, setRows] = useState<readonly TezgahHistoryItem[]>(items);
  const [cursor, setCursor] = useState<string | null>(nextCursor);
  const [pending, setPending] = useState(false);
  const [note, setNote] = useState("");

  // K2 — yeni üretim sonrası ilk sayfa tazelenir; yüklenmiş eski sayfalar
  // kimlikle tekilleştirilerek korunur (arşiv kaybolmaz).
  useEffect(() => {
    setRows((current) => {
      const seen = new Set(items.map((item) => item.id));
      return [...items, ...current.filter((row) => !seen.has(row.id))];
    });
    setCursor(nextCursor);
  }, [items, nextCursor]);

  if (rows.length === 0) {
    return null;
  }

  async function loadMore() {
    if (pending || !cursor) {
      return;
    }
    setPending(true);
    setNote("");
    try {
      const response = await fetch(
        `/api/tezgah/outputs?cursor=${encodeURIComponent(cursor)}`,
        withRailApiVersion({ method: "GET" }),
      );
      const body = (await response.json()) as { ok?: boolean; data?: TezgahHistoryPage };
      if (!response.ok || body.ok === false || !Array.isArray(body.data?.outputs)) {
        setNote("Arşivin devamı açılamadı.");
        return;
      }
      const seen = new Set(rows.map((row) => row.id));
      const fresh = body.data.outputs.filter((row) => !seen.has(row.id));
      setRows((current) => [...current, ...fresh]);
      setCursor(body.data.nextCursor ?? null);
      if (fresh.length === 0 && !body.data.nextCursor) {
        setNote("Arşivin sonuna geldin.");
      }
    } catch {
      setNote("Arşivin devamı açılamadı.");
    } finally {
      setPending(false);
    }
  }

  return (
    <details className="print:hidden" data-tezgah-history="">
      <summary className="cursor-pointer text-sm font-semibold text-[var(--foreground)]">Son Üretimlerim</summary>
      <ul className="mt-3 space-y-3">
        {rows.map((item) => {
          const tool = tezgahToolById(item.toolKey);
          return (
            <li key={item.id} className="rounded-xl border border-[var(--border)] px-3 py-2">
              <p className="text-sm font-medium text-[var(--foreground)]">{item.title}</p>
              <p className="text-xs text-[var(--muted)]">
                {tool?.label ?? item.toolKey} · {formatWhen(item.createdAt)}
              </p>
              <ArchiveItemActions item={item} />
            </li>
          );
        })}
      </ul>
      {cursor ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => void loadMore()}>
            {pending ? "Yükleniyor…" : "Daha eski üretimler"}
          </Button>
          {note ? <p className="text-xs text-[var(--muted)]">{note}</p> : null}
        </div>
      ) : null}
    </details>
  );
}
