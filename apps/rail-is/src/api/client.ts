import {
  AUTHORIZATION_HEADER,
  IDEMPOTENCY_KEY_HEADER,
  RAIL_MIN_VERSION_HEADER,
  RAIL_REQUEST_ID_HEADER,
  RAIL_V1_IDEMPOTENCY_UUID,
  RAIL_V1_PARSE_FAIL,
  createRailV1Uuid,
  isRailV1Uuid,
  parseRailV1BidData,
  parseRailV1ClientJobBidsView,
  parseRailV1ContractsData,
  parseRailV1DeliveryData,
  parseRailV1Envelope,
  parseRailV1JobsData,
  parseRailV1AcceptData,
  parseRailV1ReleaseData,
  parseRailV1SessionData,
  parseRailV1WalletStripData,
  type RailV1AcceptData,
  type RailV1AcceptRequest,
  type ClientJobBidsView,
  type RailV1BidData,
  type RailV1BidRequest,
  type RailV1ContractsData,
  type RailV1DeliveryData,
  type RailV1DeliveryRequest,
  type RailV1Envelope,
  type RailV1JobsData,
  type RailV1OkBody,
  type RailV1ReleaseData,
  type RailV1SessionData,
  type RailV1WalletStripData,
} from "../contract/v1";
import { RailV1HttpError, RailV1ProtocolError } from "./errors";
import {
  assertRailIsDay0Path,
  clientJobBidsPath,
  freelancerAcceptPath,
  freelancerBidPath,
  freelancerDeliveryPath,
  freelancerReleasePath,
} from "./hops";

const WRITE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export type V1AccessTokenProvider = () => Promise<string | null> | string | null;

export type V1HttpClientOptions = {
  baseUrl: string;
  getAccessToken: V1AccessTokenProvider;
  /** 401 zarfında bir kez; yeni access token ile aynı istek (aynı Idempotency-Key) tekrarlanır. */
  refreshAccessToken?: V1AccessTokenProvider;
  minVersion?: number;
  fetch?: typeof fetch;
  createIdempotencyKey?: () => string;
};

export type V1RequestInput = {
  path: string;
  method?: string;
  body?: unknown;
  /** Yazmada verilmezse UUID v4 üretilir. Retry aynı değeri basmalıdır. */
  idempotencyKey?: string;
  requestId?: string;
};

export type V1HttpClient = {
  request<T extends Record<string, unknown>>(input: V1RequestInput): Promise<RailV1OkBody<T>>;
  get<T extends Record<string, unknown>>(path: string): Promise<RailV1OkBody<T>>;
  post<T extends Record<string, unknown>>(
    path: string,
    body: unknown,
    options?: { idempotencyKey?: string },
  ): Promise<RailV1OkBody<T>>;
  getSession(): Promise<RailV1OkBody<RailV1SessionData>>;
  listOpenJobs(): Promise<RailV1OkBody<RailV1JobsData>>;
  listContracts(): Promise<RailV1OkBody<RailV1ContractsData>>;
  submitBid(
    jobId: string,
    body: RailV1BidRequest,
    options?: { idempotencyKey?: string },
  ): Promise<RailV1OkBody<RailV1BidData>>;
  listOwnerJobBids(jobId: string): Promise<RailV1OkBody<ClientJobBidsView>>;
  postAccept(
    jobId: string,
    body: RailV1AcceptRequest,
    options?: { idempotencyKey?: string },
  ): Promise<RailV1OkBody<RailV1AcceptData>>;
  postDelivery(
    contractId: string,
    body: RailV1DeliveryRequest,
    options?: { idempotencyKey?: string },
  ): Promise<RailV1OkBody<RailV1DeliveryData>>;
  postRelease(
    contractId: string,
    options?: { idempotencyKey?: string },
  ): Promise<RailV1OkBody<RailV1ReleaseData>>;
  getWalletStrip(): Promise<RailV1OkBody<RailV1WalletStripData>>;
};

function stripCookieHeaders(headers: Headers): void {
  headers.delete("Cookie");
  headers.delete("cookie");
  headers.delete("Set-Cookie");
  headers.delete("set-cookie");
}

function normalizeBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, "");
  if (!trimmed) {
    throw new Error("EXPO_PUBLIC_RAIL_API_BASE boş. Sahte liste üretilmez.");
  }
  return trimmed;
}

function isWriteMethod(method: string): boolean {
  return WRITE_METHODS.has(method);
}

function withParsedData<T extends Record<string, unknown>>(
  envelope: RailV1OkBody<T>,
  parse: (data: unknown) => T,
): RailV1OkBody<T> {
  try {
    return { ...envelope, data: parse(envelope.data) };
  } catch {
    throw new RailV1ProtocolError(RAIL_V1_PARSE_FAIL);
  }
}

async function readEnvelope<T extends Record<string, unknown>>(
  response: Response,
): Promise<RailV1Envelope<T>> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new RailV1ProtocolError(RAIL_V1_PARSE_FAIL, response.status);
  }
  let raw: unknown;
  try {
    raw = await response.json();
  } catch {
    throw new RailV1ProtocolError(RAIL_V1_PARSE_FAIL, response.status);
  }
  try {
    return parseRailV1Envelope<T>(raw);
  } catch {
    throw new RailV1ProtocolError(RAIL_V1_PARSE_FAIL, response.status);
  }
}

/**
 * Amiral `/api/v1` ile konuşan tip güvenli istemci.
 * Çerez göndermez ve kabul etmez. Kernel import etmez.
 */
export function createV1HttpClient(options: V1HttpClientOptions): V1HttpClient {
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const minVersion = String(options.minVersion ?? 1);
  const fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);
  const mintKey = options.createIdempotencyKey ?? createRailV1Uuid;

  async function request<T extends Record<string, unknown>>(
    input: V1RequestInput,
    retried = false,
    accessTokenOverride?: string,
  ): Promise<RailV1OkBody<T>> {
    const method = (input.method ?? "GET").toUpperCase();
    const path = assertRailIsDay0Path(input.path, method);
    const headers = new Headers();
    headers.set("Accept", "application/json");
    headers.set(RAIL_MIN_VERSION_HEADER, minVersion);
    stripCookieHeaders(headers);

    const accessToken = accessTokenOverride ?? (await options.getAccessToken());
    if (accessToken && accessToken.trim()) {
      headers.set(AUTHORIZATION_HEADER, `Bearer ${accessToken.trim()}`);
    }

    let idempotencyKey: string | undefined;
    if (isWriteMethod(method)) {
      idempotencyKey = input.idempotencyKey?.trim() || mintKey();
      if (!isRailV1Uuid(idempotencyKey)) {
        throw new RailV1ProtocolError(RAIL_V1_IDEMPOTENCY_UUID);
      }
      headers.set(IDEMPOTENCY_KEY_HEADER, idempotencyKey);
    }

    if (input.requestId && isRailV1Uuid(input.requestId)) {
      headers.set(RAIL_REQUEST_ID_HEADER, input.requestId);
    }

    if (input.body !== undefined) {
      headers.set("Content-Type", "application/json");
    }

    stripCookieHeaders(headers);
    if (headers.has("Cookie") || headers.has("cookie")) {
      throw new RailV1ProtocolError("v1 istemci Cookie başlığı taşımaz.");
    }

    const init: RequestInit = {
      method,
      headers,
      body: input.body === undefined ? undefined : JSON.stringify(input.body),
      credentials: "omit",
      cache: "no-store",
      redirect: "manual",
    };

    const response = await fetchImpl(`${baseUrl}${path}`, init);
    const envelope = await readEnvelope<T>(response);

    if (
      envelope.ok === false &&
      response.status === 401 &&
      !retried &&
      options.refreshAccessToken
    ) {
      const refreshed = await options.refreshAccessToken();
      if (refreshed && refreshed.trim()) {
        return request<T>(
          {
            ...input,
            idempotencyKey,
          },
          true,
          refreshed.trim(),
        );
      }
    }

    if (envelope.ok === false) {
      throw new RailV1HttpError(response.status, envelope);
    }
    return envelope;
  }

  return {
    request,
    get(path) {
      return request({ path, method: "GET" });
    },
    post(path, body, postOptions) {
      return request({
        path,
        method: "POST",
        body,
        idempotencyKey: postOptions?.idempotencyKey,
      });
    },
    async getSession() {
      const envelope = await request<RailV1SessionData>({
        path: "/api/v1/auth/session",
        method: "GET",
      });
      return withParsedData(envelope, parseRailV1SessionData);
    },
    async listOpenJobs() {
      const envelope = await request<RailV1JobsData>({
        path: "/api/v1/freelancer/jobs",
        method: "GET",
      });
      return withParsedData(envelope, parseRailV1JobsData);
    },
    async listContracts() {
      const envelope = await request<RailV1ContractsData>({
        path: "/api/v1/freelancer/contracts",
        method: "GET",
      });
      return withParsedData(envelope, parseRailV1ContractsData);
    },
    async submitBid(jobId, body, postOptions) {
      const envelope = await request<RailV1BidData>({
        path: freelancerBidPath(jobId),
        method: "POST",
        body,
        idempotencyKey: postOptions?.idempotencyKey,
      });
      return withParsedData(envelope, parseRailV1BidData);
    },
    async listOwnerJobBids(jobId) {
      const envelope = await request<ClientJobBidsView>({
        path: clientJobBidsPath(jobId),
        method: "GET",
      });
      return withParsedData(envelope, parseRailV1ClientJobBidsView);
    },
    async postAccept(jobId, body, postOptions) {
      const envelope = await request<RailV1AcceptData>({
        path: freelancerAcceptPath(jobId),
        method: "POST",
        body,
        idempotencyKey: postOptions?.idempotencyKey,
      });
      return withParsedData(envelope, parseRailV1AcceptData);
    },
    async postDelivery(contractId, body, postOptions) {
      const envelope = await request<RailV1DeliveryData>({
        path: freelancerDeliveryPath(contractId),
        method: "POST",
        body,
        idempotencyKey: postOptions?.idempotencyKey,
      });
      return withParsedData(envelope, parseRailV1DeliveryData);
    },
    async postRelease(contractId, postOptions) {
      const envelope = await request<RailV1ReleaseData>({
        path: freelancerReleasePath(contractId),
        method: "POST",
        body: {},
        idempotencyKey: postOptions?.idempotencyKey,
      });
      return withParsedData(envelope, parseRailV1ReleaseData);
    },
    async getWalletStrip() {
      const envelope = await request<RailV1WalletStripData>({
        path: "/api/v1/dashboard/wallet-strip",
        method: "GET",
      });
      return withParsedData(envelope, parseRailV1WalletStripData);
    },
  };
}

export const v1HttpClient = {
  create: createV1HttpClient,
};
