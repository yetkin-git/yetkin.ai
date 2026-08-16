import { jsonFail, jsonOk } from "@/lib/kernel/http/json";
import { sha256Hex } from "@/lib/kernel/crypto/sha256";

export const HTTP_IDEMPOTENCY_STARTED_TTL_MS = 30_000;
export const HTTP_IDEMPOTENCY_RESPONSE_MAX_CHARS = 16_384;

export type HttpIdempotencyStatus = "started" | "completed";

export type HttpIdempotencyRecord = {
  userId: string;
  route: string;
  key: string;
  requestHash: string;
  status: HttpIdempotencyStatus;
  statusCode: number;
  body: Record<string, unknown>;
  createdAt: Date;
};

export type HttpIdempotencyBeginResult =
  | { kind: "created" }
  | { kind: "replay"; record: HttpIdempotencyRecord }
  | { kind: "in_progress" }
  | { kind: "conflict" };

export type HttpIdempotencyStore = {
  begin(input: {
    userId: string;
    route: string;
    key: string;
    requestHash: string;
    now?: Date;
  }): Promise<HttpIdempotencyBeginResult>;
  complete(input: {
    userId: string;
    route: string;
    key: string;
    statusCode: number;
    body: Record<string, unknown>;
  }): Promise<void>;
  abandon(input: { userId: string; route: string; key: string }): Promise<void>;
};

export function hashIdempotencyPayload(payload: unknown): string {
  return sha256Hex(stableStringify(payload));
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  const entries = Object.entries(value as Record<string, unknown>).sort(([left], [right]) =>
    left.localeCompare(right),
  );
  return `{${entries
    .map(([key, nested]) => `${JSON.stringify(key)}:${stableStringify(nested)}`)
    .join(",")}}`;
}

export function parseStoredIdempotencyBody(raw: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(raw);
  if (parsed == null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {};
  }
  return parsed as Record<string, unknown>;
}

export function serializeIdempotencyBody(body: Record<string, unknown>): string {
  const raw = JSON.stringify(body);
  if (raw.length > HTTP_IDEMPOTENCY_RESPONSE_MAX_CHARS) {
    throw new Error("Idempotency yanıt tavanı aşıldı.");
  }
  return raw;
}

export function isStartedIdempotencyExpired(
  createdAt: Date,
  now: Date = new Date(),
  ttlMs = HTTP_IDEMPOTENCY_STARTED_TTL_MS,
): boolean {
  return now.getTime() - createdAt.getTime() >= ttlMs;
}

export async function settleHttpIdempotency(
  input: {
    store: HttpIdempotencyStore;
    userId: string;
    route: string;
    key: string;
    requestHash: string;
    requestId: string;
    now?: Date;
  },
  execute: () => Promise<{ status: number; body: Record<string, unknown> }>,
) {
  const began = await input.store.begin({
    userId: input.userId,
    route: input.route,
    key: input.key,
    requestHash: input.requestHash,
    now: input.now,
  });
  if (began.kind === "conflict") {
    return jsonFail(
      "Idempotency-Key aynı anahtarla farklı gövde kullanılamaz.",
      409,
      input.requestId,
    );
  }
  if (began.kind === "in_progress") {
    return jsonFail("Aynı Idempotency-Key işleniyor.", 409, input.requestId);
  }
  if (began.kind === "replay") {
    return jsonOk(began.record.body, began.record.statusCode, input.requestId);
  }

  try {
    const result = await execute();
    if (result.status >= 200 && result.status < 300) {
      await input.store.complete({
        userId: input.userId,
        route: input.route,
        key: input.key,
        statusCode: result.status,
        body: result.body,
      });
      return jsonOk(result.body, result.status, input.requestId);
    }
    await input.store.abandon({
      userId: input.userId,
      route: input.route,
      key: input.key,
    });
    const error =
      typeof result.body.error === "string" ? result.body.error : "İşlem başarısız.";
    return jsonFail(error, result.status, input.requestId);
  } catch (error) {
    await input.store.abandon({
      userId: input.userId,
      route: input.route,
      key: input.key,
    });
    throw error;
  }
}
