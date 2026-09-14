import {
  AUTHORIZATION_HEADER,
  IDEMPOTENCY_KEY_HEADER,
  RAIL_MIN_VERSION_HEADER,
  RAIL_REQUEST_ID_HEADER,
  RAIL_V1_IDEMPOTENCY_UUID,
  RAIL_V1_PARSE_FAIL,
  createRailV1Uuid,
  isRailV1Uuid,
  parseRailV1Envelope,
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
  academyCertificatePath,
  academyCourseWritePath,
  assertRailIsDay0Path,
  DRON_FAZ2_FROZEN,
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
  patch<T extends Record<string, unknown>>(
    path: string,
    body: unknown,
    options?: { idempotencyKey?: string },
  ): Promise<RailV1OkBody<T>>;
  getSession(): Promise<RailV1OkBody<RailV1SessionData>>;
  getHealth(): Promise<RailV1OkBody<Record<string, unknown>>>;
  getAcademyPulse(): Promise<RailV1OkBody<Record<string, unknown>>>;
  getCareerPulse(): Promise<RailV1OkBody<Record<string, unknown>>>;
  getCareerVisas(): Promise<RailV1OkBody<Record<string, unknown>>>;
  getCertificate(hash: string): Promise<RailV1OkBody<Record<string, unknown>>>;
  getWalletStrip(): Promise<RailV1OkBody<RailV1WalletStripData>>;
  beginWalletTopUp(
    body: unknown,
    options?: { idempotencyKey?: string },
  ): Promise<RailV1OkBody<Record<string, unknown>>>;
  getAcademyCurriculum(courseId: string): Promise<RailV1OkBody<Record<string, unknown>>>;
  getAcademyExam(courseId: string): Promise<RailV1OkBody<Record<string, unknown>>>;
  lockAcademyCourse(courseId: string, options?: { idempotencyKey?: string }): Promise<RailV1OkBody<Record<string, unknown>>>;
  purchaseAcademyCourse(
    courseId: string,
    body: unknown,
    options?: { idempotencyKey?: string },
  ): Promise<RailV1OkBody<Record<string, unknown>>>;
  completeAcademyLesson(
    courseId: string,
    body: unknown,
    options?: { idempotencyKey?: string },
  ): Promise<RailV1OkBody<Record<string, unknown>>>;
  submitAcademyExam(
    courseId: string,
    body: unknown,
    options?: { idempotencyKey?: string },
  ): Promise<RailV1OkBody<Record<string, unknown>>>;
  syncCareerPortfolio(options?: { idempotencyKey?: string }): Promise<RailV1OkBody<Record<string, unknown>>>;
  patchProfile(
    body: unknown,
    options?: { idempotencyKey?: string },
  ): Promise<RailV1OkBody<Record<string, unknown>>>;
  /** Faz 2 — HTTP atmaz; `DRON_FAZ2_FROZEN`. */
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

function assertFaz2HopFrozen(): never {
  throw new RailV1ProtocolError(DRON_FAZ2_FROZEN);
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
    patch(path, body, patchOptions) {
      return request({
        path,
        method: "PATCH",
        body,
        idempotencyKey: patchOptions?.idempotencyKey,
      });
    },
    async getSession() {
      const envelope = await request<RailV1SessionData>({
        path: "/api/v1/auth/session",
        method: "GET",
      });
      return withParsedData(envelope, parseRailV1SessionData);
    },
    async getHealth() {
      return request<Record<string, unknown>>({
        path: "/api/v1/health",
        method: "GET",
      });
    },
    async getAcademyPulse() {
      return request<Record<string, unknown>>({
        path: "/api/v1/academy/pulse",
        method: "GET",
      });
    },
    async getCareerPulse() {
      return request<Record<string, unknown>>({
        path: "/api/v1/career/pulse",
        method: "GET",
      });
    },
    async getCareerVisas() {
      return request<Record<string, unknown>>({
        path: "/api/v1/career/visas",
        method: "GET",
      });
    },
    async getCertificate(hash) {
      return request<Record<string, unknown>>({
        path: academyCertificatePath(hash),
        method: "GET",
      });
    },
    async getWalletStrip() {
      const envelope = await request<RailV1WalletStripData>({
        path: "/api/v1/dashboard/wallet-strip",
        method: "GET",
      });
      return withParsedData(envelope, parseRailV1WalletStripData);
    },
    async beginWalletTopUp(body, options) {
      return request<Record<string, unknown>>({
        path: "/api/v1/wallet/top-up",
        method: "POST",
        body,
        idempotencyKey: options?.idempotencyKey,
      });
    },
    async getAcademyCurriculum(courseId) {
      return request<Record<string, unknown>>({
        path: academyCourseWritePath(courseId, "curriculum"),
        method: "GET",
      });
    },
    async getAcademyExam(courseId) {
      return request<Record<string, unknown>>({
        path: academyCourseWritePath(courseId, "exam"),
        method: "GET",
      });
    },
    async lockAcademyCourse(courseId, options) {
      return request<Record<string, unknown>>({
        path: academyCourseWritePath(courseId, "lock"),
        method: "POST",
        idempotencyKey: options?.idempotencyKey,
      });
    },
    async purchaseAcademyCourse(courseId, body, options) {
      return request<Record<string, unknown>>({
        path: academyCourseWritePath(courseId, "purchase"),
        method: "POST",
        body,
        idempotencyKey: options?.idempotencyKey,
      });
    },
    async completeAcademyLesson(courseId, body, options) {
      return request<Record<string, unknown>>({
        path: academyCourseWritePath(courseId, "curriculum"),
        method: "POST",
        body,
        idempotencyKey: options?.idempotencyKey,
      });
    },
    async submitAcademyExam(courseId, body, options) {
      return request<Record<string, unknown>>({
        path: academyCourseWritePath(courseId, "exam"),
        method: "POST",
        body,
        idempotencyKey: options?.idempotencyKey,
      });
    },
    async syncCareerPortfolio(options) {
      return request<Record<string, unknown>>({
        path: "/api/v1/career/portfolio",
        method: "POST",
        body: {},
        idempotencyKey: options?.idempotencyKey,
      });
    },
    async patchProfile(body, options) {
      return request<Record<string, unknown>>({
        path: "/api/v1/profile",
        method: "PATCH",
        body,
        idempotencyKey: options?.idempotencyKey,
      });
    },
    async listOpenJobs() {
      return assertFaz2HopFrozen();
    },
    async listContracts() {
      return assertFaz2HopFrozen();
    },
    async submitBid() {
      return assertFaz2HopFrozen();
    },
    async listOwnerJobBids() {
      return assertFaz2HopFrozen();
    },
    async postAccept() {
      return assertFaz2HopFrozen();
    },
    async postDelivery() {
      return assertFaz2HopFrozen();
    },
    async postRelease() {
      return assertFaz2HopFrozen();
    },
  };
}

export const v1HttpClient = {
  create: createV1HttpClient,
};
