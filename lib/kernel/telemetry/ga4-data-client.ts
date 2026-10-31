import "server-only";

import { createHash } from "node:crypto";
import type { BetaAnalyticsDataClient } from "@google-analytics/data";
import { isSupabaseUserId } from "@/lib/kernel/auth/ids";
import { isSuperAdminActor, type SuperAdminActor } from "@/lib/kernel/auth/super-admin";
import { FUNNEL_DEFAULT_RANGE, type FunnelRange } from "@/lib/kernel/admin/funnel-constants";
import { addIstanbulDays, resolveFunnelWindow } from "@/lib/kernel/admin/funnel-window";
import {
  GA4_ACTIVE_USERS_METRIC,
  GA4_BREAKDOWN_LIMIT,
  GA4_CACHE_FAILURE_MS,
  GA4_CACHE_SUCCESS_MS,
  GA4_READ_TIMEOUT_MS,
  GA4_CHANNEL_DIMENSION,
  GA4_COUNTRY_DIMENSION,
  GA4_REALTIME_WINDOW_MINUTES,
  GA4_SESSIONS_METRIC,
  type AdminGa4Board,
  type Ga4DimensionName,
  type Ga4DimensionRow,
  type Ga4ReadResult,
  type Ga4RealtimeSnapshot,
  type Ga4TrafficSnapshot,
  type Ga4UnavailableReason,
} from "@/lib/kernel/telemetry/ga4-admin-types";

/**
 * GA4 Data API okuyucusu. Tarayıcı bu modülü çekmez.
 * Kimlik boşsa veya API düşerse `unavailable`. Sıfır, yalnız rapor gerçekten sıfırsa.
 * Servis hesabı dosyası okunmaz ve yazılmaz. Ziyaretçi kimliği seçilmez.
 */

const MAX_SECRET_CHARS = 64_000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PROPERTY_ID_RE = /^\d{4,20}$/;

type ServiceAccountCredentials = {
  client_email: string;
  private_key: string;
};

type Ga4Config = {
  propertyId: string;
  credentials: ServiceAccountCredentials;
};

type RealtimeQuery = NonNullable<Parameters<BetaAnalyticsDataClient["runRealtimeReport"]>[0]>;
type StandardQuery = NonNullable<Parameters<BetaAnalyticsDataClient["runReport"]>[0]>;

type Ga4RawRow = {
  dimensionValues?: Array<{ value?: string | null }> | null;
  metricValues?: Array<{ value?: string | null }> | null;
};

type Ga4RawReport = {
  rows?: Ga4RawRow[] | null;
};

export type Ga4DataPort = {
  runRealtimeReport: (request: RealtimeQuery) => Promise<Ga4RawReport>;
  runReport: (request: StandardQuery) => Promise<Ga4RawReport>;
};

type CacheEntry = { kind: "ok"; expiresAt: number; value: unknown } | { kind: "fail"; expiresAt: number };

type Ga4Memory = {
  cache: Map<string, CacheEntry>;
  inflight: Map<string, Promise<unknown>>;
};

/** Süreç ortamından okunan alanlar. `NODE_ENV` kimlik değildir; `process.env` ataması için ortak alandır. */
export type Ga4Env = {
  NODE_ENV?: string;
  GA4_PROPERTY_ID?: string;
  GOOGLE_SERVICE_ACCOUNT_JSON?: string;
  GOOGLE_SERVICE_ACCOUNT_JSON_BASE64?: string;
  GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL?: string;
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?: string;
};

export type Ga4ReadOptions = {
  env?: Ga4Env;
  now?: Date;
  port?: Ga4DataPort;
  clock?: () => number;
  memory?: Ga4Memory;
  timeoutMs?: number;
};

const defaultMemory: Ga4Memory = {
  cache: new Map(),
  inflight: new Map(),
};

let sdkPort: { fingerprint: string; port: Ga4DataPort } | null = null;

export function clearGa4DataCache(): void {
  defaultMemory.cache.clear();
  defaultMemory.inflight.clear();
  sdkPort = null;
}

export function createGa4ReadMemory(): Ga4Memory {
  return { cache: new Map(), inflight: new Map() };
}

function memoryOf(options: Ga4ReadOptions): Ga4Memory {
  return options.memory ?? defaultMemory;
}

function clockOf(options: Ga4ReadOptions): () => number {
  return options.clock ?? Date.now;
}

function timeoutMsOf(options: Ga4ReadOptions): number {
  const value = options.timeoutMs;
  if (typeof value === "number" && Number.isFinite(value) && value >= 1) {
    return value;
  }
  return GA4_READ_TIMEOUT_MS;
}

function withTimeout<T>(work: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("ga4-timeout"));
    }, ms);
    work.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error instanceof Error ? error : new Error("ga4-read"));
      },
    );
  });
}

function envOf(options: Ga4ReadOptions): Ga4Env {
  return options.env ?? process.env;
}

function readText(env: Ga4Env, key: keyof Ga4Env): string {
  const value = env[key];
  if (typeof value !== "string") {
    return "";
  }
  const trimmed = value.trim();
  if (trimmed.length > MAX_SECRET_CHARS) {
    return "";
  }
  return trimmed;
}

function readPropertyId(raw: string): string | null {
  const stripped = raw.startsWith("properties/") ? raw.slice("properties/".length).trim() : raw;
  if (!PROPERTY_ID_RE.test(stripped)) {
    return null;
  }
  return stripped;
}

function decodeUtf8Base64(value: string): string | null {
  const compact = value.replace(/\s+/g, "");
  if (compact.length < 16 || compact.length > MAX_SECRET_CHARS || compact.length % 4 === 1) {
    return null;
  }
  if (!/^[A-Za-z0-9+/_-]+={0,2}$/.test(compact)) {
    return null;
  }
  const normalized = compact.replace(/-/g, "+").replace(/_/g, "/");
  const pad = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  const decoded = Buffer.from(normalized + pad, "base64").toString("utf8");
  if (!decoded || decoded.includes("\uFFFD")) {
    return null;
  }
  return decoded;
}

function normalizePrivateKey(raw: string): string | null {
  if (raw.length > MAX_SECRET_CHARS) {
    return null;
  }
  let key = raw.trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1).trim();
  }
  key = key.replace(/\\n/g, "\n");
  if (!key.includes("BEGIN PRIVATE KEY") && !key.includes("BEGIN RSA PRIVATE KEY")) {
    const decoded = decodeUtf8Base64(key);
    if (!decoded) {
      return null;
    }
    key = decoded.replace(/\\n/g, "\n").trim();
  }
  const begin =
    key.includes("BEGIN PRIVATE KEY") || key.includes("BEGIN RSA PRIVATE KEY");
  const end = key.includes("END PRIVATE KEY") || key.includes("END RSA PRIVATE KEY");
  if (!begin || !end) {
    return null;
  }
  return key;
}

function normalizeAccount(email: string, privateKey: string): ServiceAccountCredentials | null {
  const clientEmail = email.trim();
  if (!EMAIL_RE.test(clientEmail) || clientEmail.length > 320) {
    return null;
  }
  const key = normalizePrivateKey(privateKey);
  if (!key) {
    return null;
  }
  return { client_email: clientEmail, private_key: key };
}

function parseCredentials(text: string): ServiceAccountCredentials | null {
  if (!text || text.length > MAX_SECRET_CHARS) {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return null;
    }
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }
  const record = parsed as Record<string, unknown>;
  if (typeof record.client_email !== "string" || typeof record.private_key !== "string") {
    return null;
  }
  return normalizeAccount(record.client_email, record.private_key);
}

function readCredentials(env: Ga4Env): ServiceAccountCredentials | null {
  const json = readText(env, "GOOGLE_SERVICE_ACCOUNT_JSON");
  if (json) {
    return parseCredentials(json);
  }
  const encoded = readText(env, "GOOGLE_SERVICE_ACCOUNT_JSON_BASE64");
  if (encoded) {
    const decoded = decodeUtf8Base64(encoded);
    if (!decoded) {
      return null;
    }
    return parseCredentials(decoded.trim());
  }
  const email = readText(env, "GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL");
  const privateKey = readText(env, "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY");
  if (!email && !privateKey) {
    return null;
  }
  return normalizeAccount(email, privateKey);
}

function readGa4Config(env: Ga4Env): Ga4Config | null {
  const propertyId = readPropertyId(readText(env, "GA4_PROPERTY_ID"));
  if (!propertyId) {
    return null;
  }
  const credentials = readCredentials(env);
  if (!credentials) {
    return null;
  }
  return { propertyId, credentials };
}

function reportDates(range: FunnelRange, now: Date): { startDate: string; endDate: string } {
  const window = resolveFunnelWindow(range, now);
  return {
    startDate: window.fromYmd,
    endDate: addIstanbulDays(window.toYmdExclusive, -1),
  };
}

function realtimeQuery(propertyId: string): RealtimeQuery {
  return {
    property: `properties/${propertyId}`,
    metrics: [{ name: GA4_ACTIVE_USERS_METRIC }],
    minuteRanges: [{ startMinutesAgo: GA4_REALTIME_WINDOW_MINUTES - 1, endMinutesAgo: 0 }],
    returnPropertyQuota: false,
  };
}

function standardQuery(
  propertyId: string,
  dimension: Ga4DimensionName,
  dates: { startDate: string; endDate: string },
): StandardQuery {
  if (dimension !== GA4_CHANNEL_DIMENSION && dimension !== GA4_COUNTRY_DIMENSION) {
    throw new Error("ga4 dimension rejected");
  }
  return {
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: dates.startDate, endDate: dates.endDate }],
    dimensions: [{ name: dimension }],
    metrics: [{ name: GA4_SESSIONS_METRIC }],
    orderBys: [{ metric: { metricName: GA4_SESSIONS_METRIC }, desc: true }],
    limit: GA4_BREAKDOWN_LIMIT,
    keepEmptyRows: false,
    returnPropertyQuota: false,
  };
}

function parseCount(raw: string | null | undefined): number | null {
  if (typeof raw !== "string" || !/^\d+$/.test(raw.trim())) {
    return null;
  }
  const value = Number(raw.trim());
  if (!Number.isSafeInteger(value)) {
    return null;
  }
  return value;
}

function rowsOf(report: Ga4RawReport): Ga4RawRow[] | null {
  if (report.rows == null) {
    return [];
  }
  if (!Array.isArray(report.rows)) {
    return null;
  }
  return report.rows;
}

function parseActiveUsers(report: Ga4RawReport): number | null {
  const rows = rowsOf(report);
  if (rows == null) {
    return null;
  }
  if (rows.length === 0) {
    return 0;
  }
  let total = 0;
  for (const row of rows) {
    const value = parseCount(row.metricValues?.[0]?.value);
    if (value == null) {
      return null;
    }
    total += value;
  }
  if (!Number.isSafeInteger(total)) {
    return null;
  }
  return total;
}

function parseDimensionRows(report: Ga4RawReport): Ga4DimensionRow[] | null {
  const rows = rowsOf(report);
  if (rows == null) {
    return null;
  }
  const totals = new Map<string, number>();
  for (const row of rows) {
    const label = row.dimensionValues?.[0]?.value?.trim() ?? "";
    const sessions = parseCount(row.metricValues?.[0]?.value);
    if (!label || sessions == null) {
      return null;
    }
    const next = (totals.get(label) ?? 0) + sessions;
    if (!Number.isSafeInteger(next)) {
      return null;
    }
    totals.set(label, next);
  }
  return [...totals.entries()]
    .map(([label, sessions]) => ({ label, sessions }))
    .sort((left, right) => right.sessions - left.sessions || left.label.localeCompare(right.label, "en"))
    .slice(0, GA4_BREAKDOWN_LIMIT);
}

async function remember<T>(
  memory: Ga4Memory,
  key: string,
  clock: () => number,
  load: () => Promise<T | null>,
): Promise<T | null> {
  const now = clock();
  const hit = memory.cache.get(key);
  if (hit && hit.expiresAt > now) {
    return hit.kind === "ok" ? (hit.value as T) : null;
  }
  const pending = memory.inflight.get(key);
  if (pending) {
    return pending as Promise<T | null>;
  }
  const promise = (async () => {
    try {
      const value = await load();
      const at = clock();
      if (value == null) {
        memory.cache.set(key, { kind: "fail", expiresAt: at + GA4_CACHE_FAILURE_MS });
        return null;
      }
      memory.cache.set(key, { kind: "ok", expiresAt: at + GA4_CACHE_SUCCESS_MS, value });
      return value;
    } finally {
      memory.inflight.delete(key);
    }
  })();
  memory.inflight.set(key, promise);
  return promise;
}

function fingerprint(config: Ga4Config): string {
  return createHash("sha256")
    .update(config.propertyId)
    .update("\0")
    .update(config.credentials.client_email)
    .update("\0")
    .update(config.credentials.private_key)
    .digest("hex");
}

async function createSdkPort(credentials: ServiceAccountCredentials): Promise<Ga4DataPort> {
  const { BetaAnalyticsDataClient } = await import("@google-analytics/data");
  const client = new BetaAnalyticsDataClient({
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
    fallback: true,
  });
  return {
    async runRealtimeReport(request) {
      const [response] = await client.runRealtimeReport(request);
      return plainReport(response);
    },
    async runReport(request) {
      const [response] = await client.runReport(request);
      return plainReport(response);
    },
  };
}

function plainReport(
  response:
    | {
        rows?: Array<{
          dimensionValues?: Array<{ value?: string | null }> | null;
          metricValues?: Array<{ value?: string | null }> | null;
        }> | null;
      }
    | null
    | undefined,
): Ga4RawReport {
  if (response?.rows == null) {
    return { rows: [] };
  }
  return {
    rows: response.rows.map((row) => ({
      dimensionValues: row.dimensionValues?.map((cell) => ({ value: cell.value ?? null })) ?? [],
      metricValues: row.metricValues?.map((cell) => ({ value: cell.value ?? null })) ?? [],
    })),
  };
}

async function resolvePort(config: Ga4Config, injected: Ga4DataPort | undefined): Promise<Ga4DataPort | null> {
  if (injected) {
    return injected;
  }
  try {
    const id = fingerprint(config);
    if (sdkPort?.fingerprint === id) {
      return sdkPort.port;
    }
    const port = await createSdkPort(config.credentials);
    sdkPort = { fingerprint: id, port };
    return port;
  } catch {
    return null;
  }
}

function cacheKey(config: Ga4Config, suffix: string): string {
  return `${config.propertyId}:${config.credentials.client_email}:${suffix}`;
}

function unavailable(reason: Ga4UnavailableReason): Ga4ReadResult<never> {
  return { access: "unavailable", reason };
}

async function loadDimension(
  config: Ga4Config,
  dimension: Ga4DimensionName,
  dates: { startDate: string; endDate: string },
  options: Ga4ReadOptions,
): Promise<Ga4DimensionRow[] | null> {
  const port = await resolvePort(config, options.port);
  if (!port) {
    return null;
  }
  try {
    const report = await withTimeout(
      port.runReport(standardQuery(config.propertyId, dimension, dates)),
      timeoutMsOf(options),
    );
    return parseDimensionRows(report);
  } catch {
    return null;
  }
}

/** Son 30 dakika `activeUsers`. Kimlik yoksa veya yanıt bozulursa sayı dönmez. */
export async function runRealtimeReport(
  options: Ga4ReadOptions = {},
): Promise<Ga4ReadResult<Ga4RealtimeSnapshot>> {
  const config = readGa4Config(envOf(options));
  if (!config) {
    return unavailable("config");
  }
  const snapshot = await remember(
    memoryOf(options),
    cacheKey(config, "realtime"),
    clockOf(options),
    async () => {
      const port = await resolvePort(config, options.port);
      if (!port) {
        return null;
      }
      try {
        const report = await withTimeout(
          port.runRealtimeReport(realtimeQuery(config.propertyId)),
          timeoutMsOf(options),
        );
        const activeUsers = parseActiveUsers(report);
        if (activeUsers == null) {
          return null;
        }
        return { activeUsers, windowMinutes: GA4_REALTIME_WINDOW_MINUTES } satisfies Ga4RealtimeSnapshot;
      } catch {
        return null;
      }
    },
  );
  if (!snapshot) {
    return unavailable("upstream");
  }
  return { access: "ok", snapshot };
}

/**
 * Kanal ve ülke oturumları. Aralık huni ile aynı İstanbul günüdür (`today`, `7d`, `30d`).
 * İki `runReport` çağrısı bu fonksiyondadır; boyutlar yalnız kanal ve ülkedir.
 */
export async function runReport(
  range: FunnelRange = FUNNEL_DEFAULT_RANGE,
  options: Ga4ReadOptions = {},
): Promise<Ga4ReadResult<Ga4TrafficSnapshot>> {
  const config = readGa4Config(envOf(options));
  if (!config) {
    return unavailable("config");
  }
  const dates = reportDates(range, options.now ?? new Date());
  const memory = memoryOf(options);
  const clock = clockOf(options);
  const [channels, countries] = await Promise.all([
    remember(memory, cacheKey(config, `channel:${dates.startDate}:${dates.endDate}`), clock, () =>
      loadDimension(config, GA4_CHANNEL_DIMENSION, dates, options),
    ),
    remember(memory, cacheKey(config, `country:${dates.startDate}:${dates.endDate}`), clock, () =>
      loadDimension(config, GA4_COUNTRY_DIMENSION, dates, options),
    ),
  ]);
  if (channels == null || countries == null) {
    return unavailable("upstream");
  }
  return {
    access: "ok",
    snapshot: {
      range,
      fromYmd: dates.startDate,
      toYmd: dates.endDate,
      channels,
      countries,
    },
  };
}

/**
 * Süper yönetici değilse API çağrılmaz.
 * Yapılandırma yoksa veya her iki okuma da düşerse pano `unavailable` — sahte sıfır yok.
 */
export async function loadAdminGa4Board(
  actor: SuperAdminActor,
  range: FunnelRange = FUNNEL_DEFAULT_RANGE,
  options: Ga4ReadOptions = {},
): Promise<AdminGa4Board> {
  if (!isSupabaseUserId(actor.id) || !isSuperAdminActor(actor)) {
    return { access: "forbidden" };
  }
  try {
    if (!readGa4Config(envOf(options))) {
      return { access: "unavailable" };
    }
    const now = options.now ?? new Date();
    const dates = reportDates(range, now);
    const [realtime, traffic] = await Promise.all([
      runRealtimeReport(options),
      runReport(range, { ...options, now }),
    ]);
    if (realtime.access !== "ok" && traffic.access !== "ok") {
      return { access: "unavailable" };
    }
    return {
      access: "ok",
      range,
      fromYmd: dates.startDate,
      toYmd: dates.endDate,
      realtime:
        realtime.access === "ok"
          ? { access: "ok", value: realtime.snapshot }
          : { access: "unavailable" },
      traffic:
        traffic.access === "ok"
          ? {
              access: "ok",
              value: { channels: traffic.snapshot.channels, countries: traffic.snapshot.countries },
            }
          : { access: "unavailable" },
    };
  } catch {
    return { access: "unavailable" };
  }
}
