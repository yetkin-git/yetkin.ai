/**
 * Dron v1 sözleşme — tipler OpenAPI'den üretilir (`src/generated/v1.ts`).
 * Parser'lar fail-closed runtime'dır; kernel import edilmez.
 * Kaynak: lib/kernel/http/openapi-v1.json + .system_docs/DRON_CLIENT_SPEC.md
 */

import {
  RAIL_V1_API_VERSION,
  type ClientJobBidView,
  type ClientJobBidsView,
  type FreelancerContractView,
  type RailV1AcceptData,
  type RailV1AcceptRequest,
  type RailV1Bid,
  type RailV1BidData,
  type RailV1BidRequest,
  type RailV1Contract,
  type RailV1ContractsData,
  type RailV1DeliveryData,
  type RailV1DeliveryMessage,
  type RailV1DeliveryRequest,
  type RailV1Envelope,
  type RailV1FailBody,
  type RailV1Job,
  type RailV1JobsData,
  type RailV1OkBody,
  type RailV1ReleaseData,
  type RailV1SessionData,
  type RailV1SessionUser,
  type RailV1VisaStamp,
  type RailV1WalletStrip,
  type RailV1WalletStripData,
} from "../generated/v1";

export {
  RAIL_V1_API_VERSION,
  type ClientJobBidView,
  type ClientJobBidsView,
  type FreelancerContractView,
  type RailV1AcceptData,
  type RailV1AcceptRequest,
  type RailV1Bid,
  type RailV1BidData,
  type RailV1BidRequest,
  type RailV1Contract,
  type RailV1ContractsData,
  type RailV1DeliveryData,
  type RailV1DeliveryMessage,
  type RailV1DeliveryRequest,
  type RailV1Envelope,
  type RailV1FailBody,
  type RailV1Job,
  type RailV1JobsData,
  type RailV1OkBody,
  type RailV1ReleaseData,
  type RailV1SessionData,
  type RailV1SessionUser,
  type RailV1VisaStamp,
  type RailV1WalletStrip,
  type RailV1WalletStripData,
};

export type RailV1FreelancerContractView = import("../generated/v1").FreelancerContractView;
export type RailV1ContractStatus = import("../generated/v1").FreelancerContractView["status"];

export const RAIL_MIN_VERSION_HEADER = "X-Rail-Min-Version";
export const RAIL_REQUEST_ID_HEADER = "x-request-id";
export const IDEMPOTENCY_KEY_HEADER = "Idempotency-Key";
export const AUTHORIZATION_HEADER = "Authorization";

export const RAIL_V1_ENVELOPE_KEYS = [
  "ok",
  "error",
  "requestId",
  "apiVersion",
  "data",
] as const;

export const RAIL_V1_SESSION_REQUIRED = "Oturum gerekli.";
export const RAIL_V1_IDEMPOTENCY_REQUIRED = "Idempotency-Key başlığı zorunludur.";
export const RAIL_V1_IDEMPOTENCY_UUID = "Idempotency-Key UUID olmalıdır.";
export const RAIL_V1_VERSION_HEADER_REQUIRED = "Sürüm başlığı gerekli.";
export const RAIL_V1_CLIENT_STALE =
  "Bu uygulama güncel değil. yetkin.ai uygulamasını mağazadan güncelle.";
export const RAIL_V1_SERVER_STALE = "Bu sunucu henüz o sözleşmeyi konuşmuyor.";
export const RAIL_V1_PARSE_FAIL =
  "v1 zarfı okunamadı. Sahte liste veya bakiye üretilmez.";
export const RAIL_V1_ACCEPT_INSUFFICIENT_BALANCE = "Yetersiz bakiye. Teklif kabul edilemez.";
export const RAIL_V1_ACCEPT_MARKETPLACE_UNAVAILABLE = "Ödeme henüz bağlanmadı";
export const RAIL_V1_OWNER_BIDS_FORBIDDEN = "Yalnız ilan sahibi teklifleri görebilir.";

export const RAIL_V1_BID_AMOUNT_MIN_MINOR = 25_000;
export const RAIL_V1_BID_AMOUNT_MAX_MINOR = 5_000_000;
export const RAIL_V1_BID_COVER_NOTE_MIN = 4;
export const RAIL_V1_BID_COVER_NOTE_MAX = 2000;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isRailV1Uuid(value: string): boolean {
  return UUID_RE.test(value.trim());
}

export function createRailV1Uuid(): string {
  return crypto.randomUUID();
}

export type RailV1EnvelopeKey = (typeof RAIL_V1_ENVELOPE_KEYS)[number];

export const RAIL_V1_CONTRACT_STATUSES = ["FUNDED", "RELEASED", "REFUNDED", "DISPUTED"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function listForeignKeys(body: Record<string, unknown>): string[] {
  return Object.keys(body).filter(
    (key) => !(RAIL_V1_ENVELOPE_KEYS as readonly string[]).includes(key),
  );
}

export function isRailV1Envelope(body: unknown): body is RailV1Envelope {
  if (!isRecord(body)) {
    return false;
  }
  if (listForeignKeys(body).length > 0) {
    return false;
  }
  for (const key of RAIL_V1_ENVELOPE_KEYS) {
    if (!(key in body)) {
      return false;
    }
  }
  if (body.apiVersion !== RAIL_V1_API_VERSION) {
    return false;
  }
  if (typeof body.requestId !== "string" || body.requestId.length === 0) {
    return false;
  }
  if (body.ok === true) {
    return body.error === null && isRecord(body.data);
  }
  if (body.ok === false) {
    return typeof body.error === "string" && body.error.length > 0 && body.data === null;
  }
  return false;
}

export function parseRailV1Envelope<T extends Record<string, unknown> = Record<string, unknown>>(
  body: unknown,
): RailV1Envelope<T> {
  if (!isRailV1Envelope(body)) {
    throw new Error(RAIL_V1_PARSE_FAIL);
  }
  return body as RailV1Envelope<T>;
}

const JOB_STATUSES = new Set(["OPEN", "AWARDED", "CANCELLED"]);
const BID_STATUSES = new Set(["SUBMITTED", "ACCEPTED", "REJECTED"]);
const CONTRACT_STATUSES = new Set<string>(RAIL_V1_CONTRACT_STATUSES);
const CURRENCY_CODES = new Set(["TRY", "USD", "EUR"]);
const CONTRACT_PII_KEYS = [
  "body",
  "artifactUrl",
  "reportJson",
  "walletId",
  "referenceKey",
  "accessToken",
] as const;

const DELIVERY_PII_KEYS = [
  "body",
  "artifactUrl",
  "reportJson",
  "userId",
  "walletId",
  "accessToken",
] as const;

const VISA_SOURCE_KINDS = new Set(["ACADEMY_CERTIFICATE", "FREELANCER_RELEASE"]);
const RELEASE_CONTRACT_FORBIDDEN = [...CONTRACT_PII_KEYS, "deliveredAt"] as const;
const RELEASE_VISA_FORBIDDEN = ["accessToken", "walletId", "reportJson"] as const;
const OWNER_BID_KEYS = ["bidId", "amountMinor", "coverNote", "createdAt"] as const;
const OWNER_BID_FORBIDDEN = [
  "id",
  "jobId",
  "bidderId",
  "freelancerId",
  "email",
  "name",
  "status",
  "updatedAt",
  "currencyCode",
  "userId",
  "walletId",
  "accessToken",
] as const;
const ACCEPT_DATA_FORBIDDEN = ["visaStamp", "deliveredAt"] as const;

function requireNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${RAIL_V1_PARSE_FAIL} (${field})`);
  }
  return value;
}

function requireIntegerMinor(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || !Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${RAIL_V1_PARSE_FAIL} (${field})`);
  }
  return value;
}

function requireCurrency(value: unknown): "TRY" | "USD" | "EUR" {
  if (typeof value !== "string" || !CURRENCY_CODES.has(value)) {
    throw new Error(`${RAIL_V1_PARSE_FAIL} (currencyCode)`);
  }
  return value as "TRY" | "USD" | "EUR";
}

export function parseRailV1SessionData(data: unknown): RailV1SessionData {
  if (!isRecord(data) || !isRecord(data.user)) {
    throw new Error(RAIL_V1_PARSE_FAIL);
  }
  return {
    user: {
      id: requireNonEmptyString(data.user.id, "user.id"),
      email: requireNonEmptyString(data.user.email, "user.email"),
    },
  };
}

export function parseRailV1Job(value: unknown): RailV1Job {
  if (!isRecord(value)) {
    throw new Error(RAIL_V1_PARSE_FAIL);
  }
  const status = requireNonEmptyString(value.status, "status");
  if (!JOB_STATUSES.has(status)) {
    throw new Error(`${RAIL_V1_PARSE_FAIL} (status)`);
  }
  return {
    id: requireNonEmptyString(value.id, "id"),
    clientId: requireNonEmptyString(value.clientId, "clientId"),
    title: requireNonEmptyString(value.title, "title"),
    brief: requireNonEmptyString(value.brief, "brief"),
    budgetMinor: requireIntegerMinor(value.budgetMinor, "budgetMinor"),
    currencyCode: requireCurrency(value.currencyCode),
    status: status as RailV1Job["status"],
    createdAt: requireNonEmptyString(value.createdAt, "createdAt"),
    updatedAt: requireNonEmptyString(value.updatedAt, "updatedAt"),
  };
}

export function parseRailV1JobsData(data: unknown): RailV1JobsData {
  if (!isRecord(data) || !Array.isArray(data.jobs)) {
    throw new Error(RAIL_V1_PARSE_FAIL);
  }
  return { jobs: data.jobs.map(parseRailV1Job) };
}

export function parseRailV1Bid(value: unknown): RailV1Bid {
  if (!isRecord(value)) {
    throw new Error(RAIL_V1_PARSE_FAIL);
  }
  const status = requireNonEmptyString(value.status, "status");
  if (!BID_STATUSES.has(status)) {
    throw new Error(`${RAIL_V1_PARSE_FAIL} (status)`);
  }
  return {
    id: requireNonEmptyString(value.id, "id"),
    jobId: requireNonEmptyString(value.jobId, "jobId"),
    bidderId: requireNonEmptyString(value.bidderId, "bidderId"),
    amountMinor: requireIntegerMinor(value.amountMinor, "amountMinor"),
    currencyCode: requireCurrency(value.currencyCode),
    coverNote: requireNonEmptyString(value.coverNote, "coverNote"),
    status: status as RailV1Bid["status"],
    createdAt: requireNonEmptyString(value.createdAt, "createdAt"),
    updatedAt: requireNonEmptyString(value.updatedAt, "updatedAt"),
  };
}

export function parseRailV1BidData(data: unknown): RailV1BidData {
  if (!isRecord(data)) {
    throw new Error(RAIL_V1_PARSE_FAIL);
  }
  return { bid: parseRailV1Bid(data.bid) };
}

export function parseRailV1ClientJobBid(value: unknown): ClientJobBidView {
  if (!isRecord(value)) {
    throw new Error(RAIL_V1_PARSE_FAIL);
  }
  for (const key of OWNER_BID_FORBIDDEN) {
    if (key in value) {
      throw new Error(`${RAIL_V1_PARSE_FAIL} (${key})`);
    }
  }
  for (const key of Object.keys(value)) {
    if (!(OWNER_BID_KEYS as readonly string[]).includes(key)) {
      throw new Error(`${RAIL_V1_PARSE_FAIL} (${key})`);
    }
  }
  return {
    bidId: requireNonEmptyString(value.bidId, "bidId"),
    amountMinor: requireIntegerMinor(value.amountMinor, "amountMinor"),
    coverNote: requireNonEmptyString(value.coverNote, "coverNote"),
    createdAt: requireNonEmptyString(value.createdAt, "createdAt"),
  };
}

export function parseRailV1ClientJobBidsView(data: unknown): ClientJobBidsView {
  if (!isRecord(data) || !Array.isArray(data.bids)) {
    throw new Error(RAIL_V1_PARSE_FAIL);
  }
  for (const key of Object.keys(data)) {
    if (key !== "bids") {
      throw new Error(`${RAIL_V1_PARSE_FAIL} (${key})`);
    }
  }
  return { bids: data.bids.map(parseRailV1ClientJobBid) };
}

export function parseRailV1WalletStrip(value: unknown): RailV1WalletStrip {
  if (!isRecord(value) || typeof value.live !== "boolean") {
    throw new Error(RAIL_V1_PARSE_FAIL);
  }
  return {
    live: value.live,
    amountMinor: requireIntegerMinor(value.amountMinor, "amountMinor"),
    currencyCode: requireCurrency(value.currencyCode),
  };
}

export function parseRailV1WalletStripData(data: unknown): RailV1WalletStripData {
  if (!isRecord(data)) {
    throw new Error(RAIL_V1_PARSE_FAIL);
  }
  return { strip: parseRailV1WalletStrip(data.strip) };
}

function requireNullableString(value: unknown, field: string): string | null {
  if (value === null) {
    return null;
  }
  return requireNonEmptyString(value, field);
}

function requireNullableDateTime(value: unknown, field: string): string | null {
  return requireNullableString(value, field);
}

function requireHoldBps(value: unknown): number {
  const holdBps = requireIntegerMinor(value, "holdBps");
  if (holdBps > 10_000) {
    throw new Error(`${RAIL_V1_PARSE_FAIL} (holdBps)`);
  }
  return holdBps;
}

export function parseFreelancerContractView(value: unknown): FreelancerContractView {
  if (!isRecord(value)) {
    throw new Error(RAIL_V1_PARSE_FAIL);
  }
  for (const key of CONTRACT_PII_KEYS) {
    if (key in value) {
      throw new Error(`${RAIL_V1_PARSE_FAIL} (${key})`);
    }
  }
  const status = requireNonEmptyString(value.status, "status");
  if (!CONTRACT_STATUSES.has(status)) {
    throw new Error(`${RAIL_V1_PARSE_FAIL} (status)`);
  }
  if (!("deliveredAt" in value)) {
    throw new Error(`${RAIL_V1_PARSE_FAIL} (deliveredAt)`);
  }
  return {
    id: requireNonEmptyString(value.id, "id"),
    jobId: requireNonEmptyString(value.jobId, "jobId"),
    bidId: requireNonEmptyString(value.bidId, "bidId"),
    clientId: requireNonEmptyString(value.clientId, "clientId"),
    freelancerId: requireNonEmptyString(value.freelancerId, "freelancerId"),
    escrowHoldId: requireNonEmptyString(value.escrowHoldId, "escrowHoldId"),
    status: status as RailV1ContractStatus,
    currencyCode: requireCurrency(value.currencyCode),
    grossMinor: requireIntegerMinor(value.grossMinor, "grossMinor"),
    holdMinor: requireIntegerMinor(value.holdMinor, "holdMinor"),
    netMinor: requireIntegerMinor(value.netMinor, "netMinor"),
    holdBps: requireHoldBps(value.holdBps),
    fundedAt: requireNonEmptyString(value.fundedAt, "fundedAt"),
    releasedAt: requireNullableDateTime(value.releasedAt, "releasedAt"),
    refundedAt: requireNullableDateTime(value.refundedAt, "refundedAt"),
    createdAt: requireNonEmptyString(value.createdAt, "createdAt"),
    updatedAt: requireNonEmptyString(value.updatedAt, "updatedAt"),
    deliveredAt: requireNullableDateTime(value.deliveredAt, "deliveredAt"),
  };
}

export function parseRailV1ContractsData(data: unknown): RailV1ContractsData {
  if (!isRecord(data) || !Array.isArray(data.contracts)) {
    throw new Error(RAIL_V1_PARSE_FAIL);
  }
  return { contracts: data.contracts.map(parseFreelancerContractView) };
}

export function parseRailV1DeliveryMessage(value: unknown): RailV1DeliveryMessage {
  if (!isRecord(value)) {
    throw new Error(RAIL_V1_PARSE_FAIL);
  }
  for (const key of DELIVERY_PII_KEYS) {
    if (key in value) {
      throw new Error(`${RAIL_V1_PARSE_FAIL} (${key})`);
    }
  }
  const kind = requireNonEmptyString(value.kind, "kind");
  if (kind !== "DELIVERY") {
    throw new Error(`${RAIL_V1_PARSE_FAIL} (kind)`);
  }
  return {
    id: requireNonEmptyString(value.id, "id"),
    contractId: requireNonEmptyString(value.contractId, "contractId"),
    kind: "DELIVERY",
    createdAt: requireNonEmptyString(value.createdAt, "createdAt"),
  };
}

export function parseRailV1DeliveryData(data: unknown): RailV1DeliveryData {
  if (!isRecord(data)) {
    throw new Error(RAIL_V1_PARSE_FAIL);
  }
  return { message: parseRailV1DeliveryMessage(data.message) };
}

function parseRailV1Contract(value: unknown): RailV1Contract {
  if (!isRecord(value)) {
    throw new Error(RAIL_V1_PARSE_FAIL);
  }
  for (const key of RELEASE_CONTRACT_FORBIDDEN) {
    if (key in value) {
      throw new Error(`${RAIL_V1_PARSE_FAIL} (${key})`);
    }
  }
  const status = requireNonEmptyString(value.status, "status");
  if (!CONTRACT_STATUSES.has(status)) {
    throw new Error(`${RAIL_V1_PARSE_FAIL} (status)`);
  }
  return {
    id: requireNonEmptyString(value.id, "id"),
    jobId: requireNonEmptyString(value.jobId, "jobId"),
    bidId: requireNonEmptyString(value.bidId, "bidId"),
    clientId: requireNonEmptyString(value.clientId, "clientId"),
    freelancerId: requireNonEmptyString(value.freelancerId, "freelancerId"),
    escrowHoldId: requireNonEmptyString(value.escrowHoldId, "escrowHoldId"),
    status: status as RailV1ContractStatus,
    currencyCode: requireCurrency(value.currencyCode),
    grossMinor: requireIntegerMinor(value.grossMinor, "grossMinor"),
    holdMinor: requireIntegerMinor(value.holdMinor, "holdMinor"),
    netMinor: requireIntegerMinor(value.netMinor, "netMinor"),
    holdBps: requireHoldBps(value.holdBps),
    fundedAt: requireNonEmptyString(value.fundedAt, "fundedAt"),
    releasedAt: requireNullableDateTime(value.releasedAt, "releasedAt"),
    refundedAt: requireNullableDateTime(value.refundedAt, "refundedAt"),
    createdAt: requireNonEmptyString(value.createdAt, "createdAt"),
    updatedAt: requireNonEmptyString(value.updatedAt, "updatedAt"),
  };
}

function parseRailV1VisaStamp(value: unknown): RailV1VisaStamp {
  if (!isRecord(value)) {
    throw new Error(RAIL_V1_PARSE_FAIL);
  }
  for (const key of RELEASE_VISA_FORBIDDEN) {
    if (key in value) {
      throw new Error(`${RAIL_V1_PARSE_FAIL} (${key})`);
    }
  }
  const sourceKind = requireNonEmptyString(value.sourceKind, "sourceKind");
  if (!VISA_SOURCE_KINDS.has(sourceKind)) {
    throw new Error(`${RAIL_V1_PARSE_FAIL} (sourceKind)`);
  }
  return {
    id: requireNonEmptyString(value.id, "id"),
    userId: requireNonEmptyString(value.userId, "userId"),
    sourceKind: sourceKind as RailV1VisaStamp["sourceKind"],
    sourceId: requireNonEmptyString(value.sourceId, "sourceId"),
    visaKey: requireNonEmptyString(value.visaKey, "visaKey"),
    moduleId: requireNonEmptyString(value.moduleId, "moduleId"),
    title: requireNonEmptyString(value.title, "title"),
    certificateHash: requireNullableString(value.certificateHash, "certificateHash"),
    issuedAt: requireNonEmptyString(value.issuedAt, "issuedAt"),
    createdAt: requireNonEmptyString(value.createdAt, "createdAt"),
  };
}

export function parseRailV1ReleaseData(data: unknown): RailV1ReleaseData {
  if (!isRecord(data)) {
    throw new Error(RAIL_V1_PARSE_FAIL);
  }
  const visaStamp = data.visaStamp === null ? null : parseRailV1VisaStamp(data.visaStamp);
  return {
    contract: parseRailV1Contract(data.contract),
    visaStamp,
  };
}

export function parseRailV1AcceptData(data: unknown): RailV1AcceptData {
  if (!isRecord(data)) {
    throw new Error(RAIL_V1_PARSE_FAIL);
  }
  for (const key of ACCEPT_DATA_FORBIDDEN) {
    if (key in data) {
      throw new Error(`${RAIL_V1_PARSE_FAIL} (${key})`);
    }
  }
  return {
    contract: parseRailV1Contract(data.contract),
  };
}
