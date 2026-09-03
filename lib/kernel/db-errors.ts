/**
 * Prisma / pg havuz hataları — SQL metni ve sır yazılmaz.
 * `server-only` yok: HTTP zarfı bu etiketleri 503'e çevirir.
 */

export const DATABASE_BUSY_ERROR =
  "Veritabanı geçici olarak meşgul. Lütfen birkaç saniye sonra tekrar deneyin.";

function walkCodes(error: unknown, depth = 0): string[] {
  if (depth > 4 || !error || typeof error !== "object") {
    return [];
  }
  const record = error as Record<string, unknown>;
  const codes: string[] = [];
  if (typeof record.code === "string" && record.code.length > 0 && record.code.length <= 24) {
    codes.push(record.code);
  }
  if (record.cause !== undefined) {
    codes.push(...walkCodes(record.cause, depth + 1));
  }
  if (record.meta !== undefined) {
    codes.push(...walkCodes(record.meta, depth + 1));
  }
  return codes;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "";
}

/** P2024 / pg havuz kuyruğu — yeniden denemek kilidi derinleştirir. */
export function isPrismaPoolBusyError(error: unknown): boolean {
  const codes = walkCodes(error);
  if (codes.includes("P2024")) {
    return true;
  }
  const message = errorMessage(error);
  return (
    /\bP2024\b/.test(message) ||
    /Timed out fetching a new connection/i.test(message) ||
    /timeout exceeded when trying to connect/i.test(message) ||
    /connection pool timeout/i.test(message)
  );
}

/**
 * Kopuk soket / sunucu kapattı — bir kez taze havuz ile denenebilir.
 * Havuz tükenmesi (P2024) buraya girmez.
 */
export function isPrismaTransientConnectionError(error: unknown): boolean {
  if (isPrismaPoolBusyError(error)) {
    return false;
  }
  const codes = walkCodes(error);
  if (codes.some((code) => /^(P1017|P1001|P1008|ECONNRESET|ECONNREFUSED|ETIMEDOUT|57P01|08P01)$/.test(code))) {
    return true;
  }
  const message = errorMessage(error);
  return (
    /\b(ECONNRESET|ECONNREFUSED|ETIMEDOUT|EPIPE|ENOTFOUND|P1017|P1001|P1008)\b/.test(message) ||
    /connection terminated/i.test(message) ||
    /Client has encountered a connection error/i.test(message) ||
    /Connection terminated unexpectedly/i.test(message) ||
    /Server has closed the connection/i.test(message) ||
    /Can't reach database server/i.test(message)
  );
}

/**
 * P2002 / PG 23505 — unique. Aynı satırı yeniden yazmak 500 değildir; mevcut satır okunur.
 */
export function isPrismaUniqueViolation(error: unknown): boolean {
  const codes = walkCodes(error);
  if (codes.includes("P2002") || codes.includes("23505")) {
    return true;
  }
  const name = error instanceof Error ? error.name : "";
  if (name === "UniqueConstraintViolation" || name.includes("UniqueConstraint")) {
    return true;
  }
  const message = errorMessage(error);
  return (
    /\bP2002\b/.test(message) ||
    /\b23505\b/.test(message) ||
    /Unique constraint failed/i.test(message) ||
    /duplicate key value violates unique constraint/i.test(message)
  );
}

/**
 * P2003 / PG 23503 — yabancı anahtar. Idempotency `user_id` yoksa 500 değildir.
 */
export function isPrismaForeignKeyViolation(error: unknown): boolean {
  const codes = walkCodes(error);
  if (codes.includes("P2003") || codes.includes("23503")) {
    return true;
  }
  const name = error instanceof Error ? error.name : "";
  if (name === "ForeignKeyConstraintViolation" || name.includes("ForeignKeyConstraint")) {
    return true;
  }
  const message = errorMessage(error);
  return (
    /\bP2003\b/.test(message) ||
    /\b23503\b/.test(message) ||
    /Foreign key constraint/i.test(message) ||
    /ForeignKeyConstraintViolation/i.test(message)
  );
}

export function isPrismaUnavailableError(error: unknown): boolean {
  return isPrismaPoolBusyError(error) || isPrismaTransientConnectionError(error);
}

/** PrismaClientKnownRequestError / Validation / Initialization — ham 500 değil. */
export function isPrismaClientError(error: unknown): boolean {
  return error instanceof Error && error.name.startsWith("PrismaClient");
}
