/**
 * Tetkik raporunun arşiv zarfı (Y3 uyumu).
 *
 * Önceki durum: `POST /api/tezgah/tetkik/generate` arşive yalnız üç satır
 * yazıyordu (`url` / `Skor: N` / anlatım). Skor maddeleri, kategori kartı,
 * bulgular, metin önerileri ve teknik SEO kayboluyordu; "Son Üretimlerim"
 * çekmecesinden açılan kayıt **rapor değil özet**ti ve PDF yeniden üretilemiyordu.
 *
 * Bu zarf raporun tamamını taşır. Arşivden okuyan istemci `tetkik-v1` mührünü
 * görürse raporu yeniden basabilir, PDF üretebilir ve yazdırabilir.
 *
 * Zarf `outputContent` (Text) içinde JSON olarak durur. LLM metni ve ölçüm
 * değerleri sunucuda zaten mühürlenmişti; burada yalnız taşınır, yeniden
 * hesaplanmaz.
 */

import type { TetkikReport } from "@/lib/tezgah/tetkik/types";

export const TETKIK_ARCHIVE_KIND = "tetkik-v1" as const;

export type TetkikArchive = {
  kind: typeof TETKIK_ARCHIVE_KIND;
  report: TetkikReport;
};

export function encodeTetkikArchive(report: TetkikReport): string {
  const archive: TetkikArchive = { kind: TETKIK_ARCHIVE_KIND, report };
  return JSON.stringify(archive);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Zarfı çözer. Bozuk/eski (düz metin) kayıtlar `null` döner; istemci o zaman
 * düz metin olarak basar. Sessiz uydurma yoktur.
 */
export function parseTetkikArchive(raw: string): TetkikArchive | null {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("{")) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (!isRecord(parsed) || parsed.kind !== TETKIK_ARCHIVE_KIND || !isRecord(parsed.report)) {
      return null;
    }
    const report = parsed.report;
    // Asgari sözleşme: skor, adres, maddeler ve aksiyon olmadan rapor basılamaz.
    if (
      typeof report.score !== "number" ||
      typeof report.url !== "string" ||
      typeof report.disclaimer !== "string" ||
      !Array.isArray(report.checks) ||
      !isRecord(report.action)
    ) {
      return null;
    }
    return { kind: TETKIK_ARCHIVE_KIND, report: report as unknown as TetkikReport };
  } catch {
    return null;
  }
}
