/**
 * Yapılandırılmış günlük — tek satır JSON.
 * Anahtar beyaz listesi: e-posta, token, Base64, SQL mesajı yazılmaz.
 */

export type StructuredLogLevel = "info" | "warn" | "error";

export type StructuredLogInput = {
  level: StructuredLogLevel;
  event: string;
  requestId?: string;
  userId?: string;
  merchantOid?: string;
  orderId?: string;
  generationId?: string;
  holdId?: string;
  amountMinor?: number;
  action?: string;
  reason?: string;
  purpose?: string;
  applied?: boolean;
  route?: string;
  status?: number;
  db?: string;
  durationMs?: number;
  errorName?: string;
  consentVersion?: string;
};

const SAFE_KEYS = [
  "requestId",
  "userId",
  "merchantOid",
  "orderId",
  "generationId",
  "holdId",
  "amountMinor",
  "action",
  "reason",
  "purpose",
  "applied",
  "route",
  "status",
  "db",
  "durationMs",
  "errorName",
  "consentVersion",
] as const;

export function buildStructuredLogLine(
  entry: StructuredLogInput,
  now: Date = new Date(),
): string {
  const payload: Record<string, unknown> = {
    ts: now.toISOString(),
    level: entry.level,
    event: entry.event,
  };
  for (const key of SAFE_KEYS) {
    const value = entry[key];
    if (value !== undefined) {
      payload[key] = value;
    }
  }
  return JSON.stringify(payload);
}

export function logEvent(entry: StructuredLogInput): void {
  const line = buildStructuredLogLine(entry);
  if (entry.level === "error") {
    console.error(line);
    return;
  }
  if (entry.level === "warn") {
    queueMicrotask(() => {
      console.warn(line);
    });
    return;
  }
  console.log(line);
}
