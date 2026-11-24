import { requireSession } from "@/lib/kernel/auth/session";
import { jsonFail, jsonFromUnknown } from "@/lib/kernel/http/json";
import { resolveRequestId } from "@/lib/kernel/http/request-id";
import { getPrisma } from "@/lib/kernel/db";
import {
  applyHttpRateLimit,
  HTTP_RATE_LIMITS,
  rateLimitedJsonResponse,
} from "@/lib/kernel/security/http-rate-limit";
import { grantReportBlocks } from "@/lib/tezgah/grant/document";
import { buildGrantDossierDocx, buildGrantReportDocx } from "@/lib/tezgah/grant/docx";
import type { GrantProjectReport } from "@/lib/tezgah/grant/types";
import { buildPlainPdf } from "@/lib/yetkinhibe/plain-pdf";

/**
 * Kayıtlı hibe dosyasını indirir. Yazma yoktur.
 * Oturum sahibinin dosyası değilse 404 döner.
 */
export const auth = "session" as const;

type ExportFormat = "docx" | "pdf" | "md";

function readFormat(value: string | null): ExportFormat | null {
  if (value === "docx" || value === "pdf" || value === "md") {
    return value;
  }
  return null;
}

function isReport(value: unknown): value is GrantProjectReport {
  if (!value || typeof value !== "object") {
    return false;
  }
  const row = value as Partial<GrantProjectReport>;
  return row.tool === "grant" && typeof row.businessName === "string" && Array.isArray(row.eligible);
}

function fileResponse(bytes: Uint8Array, mime: string, filename: string, requestId: string): Response {
  return new Response(Buffer.from(bytes), {
    status: 200,
    headers: {
      "content-type": mime,
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
      "x-request-id": requestId,
    },
  });
}

async function exportDossier(request: Request, id: string, format: ExportFormat | null): Promise<Response> {
  const requestId = resolveRequestId(request);
  try {
    if (!/^[A-Za-z0-9_-]{8,80}$/.test(id)) {
      return jsonFail("Dosya bulunamadı.", 404, requestId, request);
    }
    if (!format) {
      return jsonFail("İndirme biçimi docx, pdf veya md olmalı.", 400, requestId, request);
    }
    const user = await requireSession(request);
    const limited = await applyHttpRateLimit(request, HTTP_RATE_LIMITS.yetkinhibeExportUser, user.id);
    if (!limited.allowed) {
      return rateLimitedJsonResponse(limited, request);
    }
    const row = await getPrisma().hibeDossier.findFirst({
      where: { id, userId: user.id },
    });
    if (!row) {
      return jsonFail("Dosya bulunamadı.", 404, requestId, request);
    }
    if (format === "md") {
      return fileResponse(new TextEncoder().encode(row.markdown), "text/markdown; charset=utf-8", "hibe-proje-dosyasi.md", requestId);
    }
    const report = isReport(row.reportJson) ? row.reportJson : null;
    if (format === "docx") {
      const bytes = report ? buildGrantReportDocx(report) : buildGrantDossierDocx(row.markdown);
      return fileResponse(
        bytes,
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "hibe-proje-dosyasi.docx",
        requestId,
      );
    }
    const blocks = report
      ? grantReportBlocks(report)
      : row.markdown.split(/\r?\n/).filter((line) => line.trim().length > 0).map((text) => ({ kind: "p" as const, text }));
    return fileResponse(buildPlainPdf(blocks), "application/pdf", "hibe-proje-dosyasi.pdf", requestId);
  } catch (error) {
    return jsonFromUnknown(error, 400, requestId, request);
  }
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const format = readFormat(new URL(request.url).searchParams.get("format"));
  return exportDossier(request, id, format);
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body: unknown = await request.json().catch(() => null);
  const format = readFormat(
    body && typeof body === "object" && "format" in body && typeof body.format === "string" ? body.format : null,
  );
  return exportDossier(request, id, format);
}
