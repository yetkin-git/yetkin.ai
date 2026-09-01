#!/usr/bin/env tsx
/**
 * Staging T4 saha test runner — Closed Testing öncesi kapalı halka.
 * Dron sözleşmesi: Bearer + X-Rail-Min-Version + katı v1 zarf. Çerez yok.
 *
 * Akış: Amiral ilan (hop değil) → vizesiz 403 → vizeli teklif → owner GET bids
 * → owner GET bids → kabul 503 (PSP Split yok / Ödeme henüz bağlanmadı).
 * Cüzdan DEBIT ile freelancer kabulü yoktur. Teslim/serbest bu fazda koşmaz
 * (path tanıkları yorumda durur). EscrowHold / ledger satırları DIRECT_URL ile okunur.
 *
 *   npm run verify:staging-t4-loop
 *
 * Sahte bakiye YASAK. Mock checkout YASAK. RAIL_DRON_ORIGINS doluysa KAPALI.
 * wallets.amount_minor doğrudan yazılmaz. POST /api/v1/freelancer/jobs yok
 * (ilan açma Dron hop'u değildir). GET jobs/{id} çağrılmaz.
 */

import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import dotenv from "dotenv";
import { Client } from "pg";
import { createClient } from "@supabase/supabase-js";
import { academyCourseSeedBySlug } from "@/lib/academy/seed";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { freelancerJobEscrowReferenceKey } from "@/lib/freelancer/fsm";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import {
  RAIL_VERSION_CLIENT_STALE,
  RAIL_VERSION_HEADER_REQUIRED,
  RAIL_VERSION_SERVER_STALE,
  parseRailDronOrigins,
} from "@/lib/kernel/http/api-v1";
import {
  RAIL_V1_ACCEPT_FORBIDDEN,
  RAIL_V1_ACCEPT_MARKETPLACE_UNAVAILABLE,
  RAIL_V1_LISTING_VISA_DENIED,
  RAIL_V1_OWNER_BIDS_FORBIDDEN,
  RAIL_V1_RELEASE_NOT_FUNDED,
  RAIL_V1_SESSION_REQUIRED,
} from "@/lib/kernel/http/v1-contract";
import { computePaytrWebhookHash } from "@/lib/kernel/payments/paytr/webhook";
import { buildIdempotentMerchantOid } from "@/lib/kernel/payments/merchant-oid";
import { WALLET_TOP_UP_MIN_MINOR } from "@/lib/kernel/payments/wallet-top-up";
import { CHECKOUT_LEGAL_CONSENT_PAYLOAD } from "@/lib/kernel/legal/checkout-consent";
import { CHECKOUT_BILLING_PAYLOAD } from "@/lib/kernel/identity/billing-info";
import { HOLD_BPS_DEFAULT, HOLD_BPS_MAX, HOLD_BPS_MIN } from "@/lib/kernel/pricing/hold-bps";
import { FREELANCER_ESCROW_HOLD_UNIT_KEY, FREELANCER_SEED_MODULE_KEY } from "@/lib/freelancer/seed";
import {
  resolveMigratorConnectionUrl,
  withPgLibpqSslCompat,
} from "./ops-migrate-lib";

const ROOT = process.cwd();
dotenv.config({ path: resolve(ROOT, ".env.local") });
dotenv.config({ path: resolve(ROOT, ".env") });

const COURSE_ID = "ac_rail_temel";
const COURSE_SLUG = "python-temel";
const JOB_GROSS_MINOR = 10_000;
const FOREIGN_IP = "85.105.141.10";
const WEB_WALLET_PATH = "/cuzdan";
const DRON_STALE_LOCK_TITLE = "Lütfen uygulamayı güncelleyiniz";
const LAB_ORIGIN = "https://lab.yetkin.rail";
const FORBIDDEN_BALANCE_COLUMNS = [
  "balance_kurus",
  "amount_kurus",
  "balance_minor",
  "available_minor",
  "locked_minor",
  "hold_minor",
];

const V1_ENVELOPE_KEYS = new Set(["ok", "error", "requestId", "apiVersion", "data"]);

type JsonBody = Record<string, unknown>;

type V1Envelope = {
  ok: boolean;
  error: string | null;
  requestId: string;
  apiVersion: string;
  data: JsonBody | null;
};

type HttpResult = {
  status: number;
  headers: Headers;
  text: string;
  body: JsonBody;
};

function fail(message: string): never {
  console.error(`verify:staging-t4-loop BAŞARISIZ: ${message}`);
  process.exit(1);
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    fail(`${name} yok.`);
  }
  return value;
}

function appBase(): string {
  const staging = process.env.STAGING_APP_URL?.trim();
  const fallback = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
  return (staging || fallback).replace(/\/$/, "");
}

function webWalletUrl(base: string): string {
  if (!base) {
    fail("Amiral adresi yok. /cuzdan açılamaz.");
  }
  return `${base}${WEB_WALLET_PATH}`;
}

function treasuryUserId(): string {
  return process.env.PLATFORM_TREASURY_USER_ID?.trim() || PLATFORM_TREASURY_USER_ID;
}

function asRecord(value: unknown): JsonBody {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonBody;
  }
  return {};
}

async function jsonRequest(url: string, init: RequestInit): Promise<HttpResult> {
  const response = await fetch(url, {
    ...init,
    redirect: "manual",
    signal: init.signal ?? AbortSignal.timeout(20_000),
  });
  const text = await response.text();
  let body: JsonBody = {};
  if (text) {
    try {
      const parsed: unknown = JSON.parse(text);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        body = parsed as JsonBody;
      } else {
        body = { raw: parsed };
      }
    } catch {
      body = { raw: text };
    }
  }
  return { status: response.status, headers: response.headers, text, body };
}

function assertNoSetCookie(headers: Headers, label: string): void {
  if (headers.get("set-cookie")) {
    fail(`${label}: v1/saha hop Set-Cookie yazdı.`);
  }
}

function parseV1Envelope(body: JsonBody, label: string): V1Envelope {
  const extra = Object.keys(body).filter((key) => !V1_ENVELOPE_KEYS.has(key));
  if (extra.length > 0) {
    fail(`${label}: v1 zarf kökünde kaçak alan (${extra.join(", ")}).`);
  }
  if (typeof body.ok !== "boolean") {
    fail(`${label}: v1 zarfı ok boolean değil: ${JSON.stringify(body)}`);
  }
  if (typeof body.requestId !== "string" || !body.requestId) {
    fail(`${label}: requestId yok.`);
  }
  if (body.apiVersion !== "1") {
    fail(`${label}: apiVersion ${String(body.apiVersion)} ≠ "1".`);
  }
  if (body.ok === true) {
    if (body.error !== null) {
      fail(`${label}: ok=true iken error null değil.`);
    }
    if (!body.data || typeof body.data !== "object" || Array.isArray(body.data)) {
      fail(`${label}: ok=true iken data nesne değil.`);
    }
    return {
      ok: true,
      error: null,
      requestId: body.requestId,
      apiVersion: "1",
      data: body.data as JsonBody,
    };
  }
  if (typeof body.error !== "string" || !body.error) {
    fail(`${label}: ok=false iken error cümlesi yok.`);
  }
  if (body.data !== null) {
    fail(`${label}: ok=false iken data null değil (sahte liste/bakiye yasağı).`);
  }
  return {
    ok: false,
    error: body.error,
    requestId: body.requestId,
    apiVersion: "1",
    data: null,
  };
}

function v1Headers(input: {
  token?: string | null;
  idempotencyKey?: string;
  minVersion?: string | null;
  origin?: string;
  cookie?: string;
}): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (input.minVersion !== null) {
    headers["X-Rail-Min-Version"] = input.minVersion ?? "1";
  }
  if (input.token) {
    headers.Authorization = `Bearer ${input.token}`;
  }
  if (input.idempotencyKey) {
    headers["Idempotency-Key"] = input.idempotencyKey;
  }
  if (input.origin) {
    headers.Origin = input.origin;
  }
  if (input.cookie) {
    headers.Cookie = input.cookie;
  }
  return headers;
}

async function v1Request(
  base: string,
  path: string,
  init: {
    method?: string;
    token?: string | null;
    body?: unknown;
    idempotencyKey?: string;
    minVersion?: string | null;
    origin?: string;
    cookie?: string;
    expectEnvelope?: boolean;
  },
): Promise<HttpResult & { envelope: V1Envelope | null }> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = v1Headers({
    token: init.token,
    idempotencyKey: init.idempotencyKey,
    minVersion: init.minVersion,
    origin: init.origin,
    cookie: init.cookie,
  });
  if (init.body !== undefined) {
    headers["content-type"] = "application/json";
  }
  const result = await jsonRequest(`${base}${path}`, {
    method,
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  assertNoSetCookie(result.headers, `${method} ${path}`);
  if (result.headers.get("access-control-allow-credentials") === "true") {
    fail(`${path}: Access-Control-Allow-Credentials yasak.`);
  }
  const expectEnvelope = init.expectEnvelope !== false;
  const envelope = expectEnvelope ? parseV1Envelope(result.body, `${method} ${path}`) : null;
  return { ...result, envelope };
}

async function waitForHealth(base: string, timeoutMs = 90_000): Promise<void> {
  const started = Date.now();
  let last = "henüz yanıt yok";
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(`${base}/api/health`, { signal: AbortSignal.timeout(8_000) });
      const body = (await response.json()) as {
        ok?: boolean;
        checks?: { db?: string; payments?: string; inngest?: string };
      };
      last = `HTTP ${response.status} db=${body.checks?.db ?? "?"} payments=${body.checks?.payments ?? "?"} inngest=${body.checks?.inngest ?? "?"}`;
      if (response.status === 200 && body.ok === true && body.checks?.db === "ok") {
        if (body.checks.payments !== "configured") {
          fail(`checks.payments=${body.checks.payments ?? "yok"} — anahtar fail-closed; sahte CREDIT yok.`);
        }
        console.log(`→ health ${last}`);
        if (body.checks.inngest !== "configured") {
          console.log("→ checks.inngest unconfigured — Cloud cron yok; nakit HTTP webhook ile yürür");
        }
        return;
      }
    } catch (error) {
      last = error instanceof Error ? error.message : String(error);
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 1500));
  }
  fail(`GET /api/health yeşil değil (${last}). Staging Amiral ve DIRECT :5432 gerekir.`);
}

async function withDirectClient<T>(work: (client: Client) => Promise<T>): Promise<T> {
  const dbUrl = resolveMigratorConnectionUrl({
    DIRECT_URL: process.env.DIRECT_URL,
    DATABASE_URL: process.env.DATABASE_URL,
  });
  if (!dbUrl) {
    fail("DIRECT_URL / DATABASE_URL yok.");
  }
  const client = new Client({ connectionString: withPgLibpqSslCompat(dbUrl) });
  await client.connect();
  try {
    return await work(client);
  } finally {
    await client.end();
  }
}

type Citizen = { accessToken: string; userId: string; email: string };

async function ensureCitizen(kind: "worker" | "client"): Promise<Citizen> {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anon = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const auth = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const prefix = kind === "worker" ? "E2E_T4_WORKER" : "E2E_T4_CLIENT";
  let existingEmail = process.env[`${prefix}_EMAIL`]?.trim() ?? "";
  let existingPassword = process.env[`${prefix}_PASSWORD`]?.trim() ?? "";
  if (kind === "worker" && (!existingEmail || !existingPassword)) {
    existingEmail = process.env.E2E_T3_EMAIL?.trim() ?? "";
    existingPassword = process.env.E2E_T3_PASSWORD?.trim() ?? "";
  }

  if (!existingEmail || !existingPassword) {
    fail(
      kind === "worker"
        ? "E2E_T4_WORKER_EMAIL/PASSWORD veya E2E_T3_EMAIL/PASSWORD yok. Yeni kayıt açılmaz (Auth kotası)."
        : "E2E_T4_CLIENT_EMAIL/PASSWORD yok. Yeni kayıt açılmaz (Auth kotası).",
    );
  }

  const signed = await auth.auth.signInWithPassword({
    email: existingEmail,
    password: existingPassword,
  });
  if (signed.error || !signed.data.session?.access_token || !signed.data.user?.id) {
    fail(`Mevcut ${kind} girişi yok: ${signed.error?.message ?? "oturum yok"}`);
  }
  console.log(`→ oturum ${kind} ${signed.data.user.id.slice(0, 8)}…`);
  return {
    accessToken: signed.data.session.access_token,
    userId: signed.data.user.id,
    email: existingEmail,
  };
}

function canonicalAuthHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "content-type": "application/json",
  };
}

async function paytrTopUp(base: string, citizen: Citizen, amountMinor: number): Promise<string> {
  const merchantKey = requireEnv("PAYTR_MERCHANT_KEY");
  const merchantSalt = requireEnv("PAYTR_MERCHANT_SALT");
  const topUpKey = randomUUID();
  const topUp = await jsonRequest(`${base}/api/wallet/top-up`, {
    method: "POST",
    headers: {
      ...canonicalAuthHeaders(citizen.accessToken),
      "Idempotency-Key": topUpKey,
      "x-forwarded-for": FOREIGN_IP,
    },
    body: JSON.stringify({ amountMinor, ...CHECKOUT_LEGAL_CONSENT_PAYLOAD, billing: CHECKOUT_BILLING_PAYLOAD }),
  });
  if (topUp.status !== 200 || topUp.body.ok !== true) {
    const expectedOid = buildIdempotentMerchantOid("walletTopUp", citizen.userId, topUpKey);
    const closed = await withDirectClient(async (pg) => {
      const order = await pg.query<{ status: string }>(
        `SELECT status FROM payment_orders WHERE merchant_oid = $1`,
        [expectedOid],
      );
      return order.rows[0]?.status ?? "";
    });
    if (closed === "PENDING") {
      fail(
        `Cüzdan yükleme ${topUp.status} PENDING sızıntısı oid=${expectedOid.slice(0, 24)}…: ${JSON.stringify(topUp.body)}`,
      );
    }
    fail(`Cüzdan yükleme ${topUp.status} (emir ${closed || "yok"}): ${JSON.stringify(topUp.body)}`);
  }
  if (topUp.body.mockCheckout === true) {
    fail("mockCheckout=true — sahte checkout Staging T4'te yasak.");
  }
  if (topUp.body.sandboxMode !== true) {
    fail("sandboxMode değil. Staging T4 PayTR test-net (sandbox) ister.");
  }
  const merchantOid = String(topUp.body.merchantOid ?? "");
  if (!merchantOid.startsWith("wallettopup")) {
    fail("merchantOid wallettopup öneki taşımıyor.");
  }

  const pending = await withDirectClient(async (client) => {
    const order = await client.query<{ status: string }>(
      `SELECT status FROM payment_orders WHERE merchant_oid = $1`,
      [merchantOid],
    );
    return order.rows[0]?.status ?? "";
  });
  if (pending !== "PENDING") {
    fail(`Sipariş PENDING değil (${pending || "yok"}).`);
  }

  const badWebhook = await fetch(`${base}/api/payments/webhooks/paytr`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      merchant_oid: merchantOid,
      status: "success",
      total_amount: String(amountMinor),
      hash: "not-a-real-hmac",
    }),
    signal: AbortSignal.timeout(20_000),
  });
  if (badWebhook.status !== 403) {
    fail(`Sahte HMAC ${badWebhook.status} — 403 beklenirdi.`);
  }

  const hash = computePaytrWebhookHash(
    { merchantOid, status: "success", totalAmount: String(amountMinor) },
    merchantKey,
    merchantSalt,
  );
  const webhook = await fetch(`${base}/api/payments/webhooks/paytr`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      merchant_oid: merchantOid,
      status: "success",
      total_amount: String(amountMinor),
      hash,
    }),
    signal: AbortSignal.timeout(20_000),
  });
  const webhookText = (await webhook.text()).trim();
  if (webhook.status !== 200 || webhookText !== "OK") {
    fail(`PayTR webhook ${webhook.status} gövde=${webhookText}`);
  }

  const cleared = await withDirectClient(async (client) => {
    const order = await client.query<{ status: string }>(
      `SELECT status FROM payment_orders WHERE merchant_oid = $1`,
      [merchantOid],
    );
    const credit = await client.query<{ amount_minor: number }>(
      `SELECT amount_minor FROM ledger_entries
       WHERE user_id = $1 AND purpose = 'wallet-top-up' AND direction = 'CREDIT'
         AND idempotency_key = $2
       LIMIT 1`,
      [citizen.userId, `wallet-top-up:${merchantOid}`],
    );
    return {
      status: order.rows[0]?.status ?? "",
      creditMinor: credit.rows[0] ? Number(credit.rows[0].amount_minor) : null,
    };
  });
  if (cleared.status !== "CLEARED") {
    fail(`PaymentOrder CLEARED değil (${cleared.status}).`);
  }
  if (cleared.creditMinor !== amountMinor) {
    fail(`Ledger CREDIT yok veya tutar ${cleared.creditMinor} ≠ ${amountMinor}.`);
  }
  console.log(`→ PayTR sandbox CREDIT ${cleared.creditMinor} CLEARED oid=${merchantOid.slice(0, 24)}…`);
  return merchantOid;
}

async function walletMinor(userId: string): Promise<number> {
  return withDirectClient(async (client) => {
    const wallet = await client.query<{ amount_minor: number }>(
      `SELECT amount_minor FROM wallets WHERE user_id = $1 AND currency_code = 'TRY'`,
      [userId],
    );
    return wallet.rows[0] ? Number(wallet.rows[0].amount_minor) : 0;
  });
}

async function ensureAcademyVisa(base: string, worker: Citizen): Promise<void> {
  const visas = await jsonRequest(`${base}/api/career/visas`, {
    method: "GET",
    headers: canonicalAuthHeaders(worker.accessToken),
  });
  if (visas.status === 200 && visas.body.ok === true) {
    const stamps = visas.body.stamps as Array<{ sourceKind?: string }> | undefined;
    if (stamps?.some((stamp) => stamp.sourceKind === "ACADEMY_CERTIFICATE")) {
      console.log("→ satıcı akademi vizesi mevcut (Amiral; Dron hop'u değil)");
      return;
    }
  }

  const seed = academyCourseSeedBySlug(COURSE_SLUG);
  if (!seed) {
    fail("python-temel tohumu yok.");
  }
  const lock = await jsonRequest(`${base}/api/academy/courses/${COURSE_ID}/lock`, {
    method: "POST",
    headers: canonicalAuthHeaders(worker.accessToken),
  });
  if (lock.status !== 200 || lock.body.ok !== true) {
    fail(`Fiyat kilidi ${lock.status}: ${JSON.stringify(lock.body)}`);
  }
  const lockRow = lock.body.lock as { id?: string; amountMinor?: number } | undefined;
  const lockId = lockRow?.id ?? "";
  const catalogMinor = Number(lockRow?.amountMinor ?? 0);
  if (!lockId || !Number.isInteger(catalogMinor) || catalogMinor <= 0) {
    fail("Katalog fiyat kilidi id/tutar taşımıyor.");
  }

  const need = Math.max(catalogMinor - (await walletMinor(worker.userId)), 0);
  if (need > 0) {
    await paytrTopUp(base, worker, Math.max(need, WALLET_TOP_UP_MIN_MINOR));
  }

  const purchaseKey = randomUUID();
  const purchase = await jsonRequest(`${base}/api/academy/courses/${COURSE_ID}/purchase`, {
    method: "POST",
    headers: {
      ...canonicalAuthHeaders(worker.accessToken),
      "Idempotency-Key": purchaseKey,
    },
    body: JSON.stringify({ lockId, ...CHECKOUT_LEGAL_CONSENT_PAYLOAD, billing: CHECKOUT_BILLING_PAYLOAD }),
  });
  if (purchase.status !== 200 || purchase.body.ok !== true) {
    fail(`Satın alma ${purchase.status}: ${JSON.stringify(purchase.body)}`);
  }
  const purchaseRow = purchase.body.purchase as { status?: string } | undefined;
  if (purchaseRow?.status !== "SETTLED") {
    fail(`Satın alma SETTLED değil: ${JSON.stringify(purchaseRow)}`);
  }

  const lessons = curriculumForCourseSlug(COURSE_SLUG);
  for (const lesson of lessons) {
    const done = await jsonRequest(`${base}/api/academy/courses/${COURSE_ID}/curriculum`, {
      method: "POST",
      headers: canonicalAuthHeaders(worker.accessToken),
      body: JSON.stringify({ lessonKey: lesson.key }),
    });
    if (done.status !== 200 || done.body.ok !== true) {
      fail(`Ders ${lesson.key} ${done.status}: ${JSON.stringify(done.body)}`);
    }
  }

  const examGet = await jsonRequest(`${base}/api/academy/courses/${COURSE_ID}/exam`, {
    method: "GET",
    headers: canonicalAuthHeaders(worker.accessToken),
  });
  const questions = examGet.body.questions as Array<{ id: string }> | undefined;
  if (examGet.status !== 200 || !questions?.length) {
    fail(`Sınav GET ${examGet.status}: ${JSON.stringify(examGet.body)}`);
  }
  const answers = questions.map((question) => {
    const seeded = seed.exam.questions.find((row) => row.id === question.id);
    if (!seeded) {
      fail(`Sınav sorusu tohumda yok: ${question.id}`);
    }
    return { questionId: question.id, choiceIndex: seeded.correctIndex };
  });
  const examPost = await jsonRequest(`${base}/api/academy/courses/${COURSE_ID}/exam`, {
    method: "POST",
    headers: canonicalAuthHeaders(worker.accessToken),
    body: JSON.stringify({ answers }),
  });
  if (examPost.status !== 200 || examPost.body.passed !== true) {
    fail(`Sınav POST ${examPost.status}: ${JSON.stringify(examPost.body)}`);
  }
  const visaStamp = examPost.body.visaStamp as { sourceKind?: string } | undefined;
  if (visaStamp?.sourceKind !== "ACADEMY_CERTIFICATE") {
    fail(`Akademi vizesi basılmadı: ${JSON.stringify(examPost.body.visaStamp)}`);
  }
  console.log("→ satıcı akademi vizesi basıldı (teklif kapısı)");
}

async function assertSingleBalanceSchema(client: Client): Promise<void> {
  const wallets = await client.query<{ column_name: string }>(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'wallets'`,
  );
  const walletCols = wallets.rows.map((row) => row.column_name);
  if (!walletCols.includes("amount_minor")) {
    fail("wallets.amount_minor yok.");
  }
  const forbiddenWallet = walletCols.filter((name) => FORBIDDEN_BALANCE_COLUMNS.includes(name));
  if (forbiddenWallet.length > 0) {
    fail(`Yasak bakiye kolonu wallets: ${forbiddenWallet.join(", ")}`);
  }

  const users = await client.query<{ column_name: string }>(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'users'`,
  );
  const userCols = users.rows.map((row) => row.column_name);
  const forbiddenUser = userCols.filter(
    (name) => FORBIDDEN_BALANCE_COLUMNS.includes(name) || name === "balance" || name.includes("balance"),
  );
  if (forbiddenUser.length > 0) {
    fail(`User bakiye kolonu yasak: ${forbiddenUser.join(", ")}`);
  }

  const extraTables = await client.query<{ table_name: string }>(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public'
       AND table_name IN ('module_wallets', 'user_balances', 'holding_pools')`,
  );
  if (extraTables.rows.length > 0) {
    fail(`İkinci bakiye tablosu: ${extraTables.rows.map((row) => row.table_name).join(", ")}`);
  }
  console.log("→ tek bakiye mühürü: wallets.amount_minor; User/module ikinci kolon yok");
}

async function readCatalogHoldBps(client: Client): Promise<number> {
  const catalog = await client.query<{ amount_minor: number; unit_type: string }>(
    `SELECT amount_minor, unit_type FROM price_catalog_entries
     WHERE module_key = $1 AND unit_key = $2 AND is_active = true`,
    [FREELANCER_SEED_MODULE_KEY, FREELANCER_ESCROW_HOLD_UNIT_KEY],
  );
  const row = catalog.rows[0];
  if (!row) {
    console.log(`→ katalog ${FREELANCER_SEED_MODULE_KEY}:${FREELANCER_ESCROW_HOLD_UNIT_KEY} yok; kod bandı ${HOLD_BPS_DEFAULT}`);
    return HOLD_BPS_DEFAULT;
  }
  const bps = Number(row.amount_minor);
  if (row.unit_type !== "BPS" || bps < HOLD_BPS_MIN || bps > HOLD_BPS_MAX) {
    fail(`Katalog hold bandı geçersiz: ${JSON.stringify(row)}`);
  }
  console.log(`→ katalog hold ${bps} bps`);
  return bps;
}

type HoldProof = {
  status: string;
  grossMinor: number;
  holdMinor: number;
  netMinor: number;
  holdBps: number;
  referenceKey: string;
  debitMinor: number | null;
  netCredit: number | null;
  holdCredit: number | null;
  visaKind: string | null;
};

async function readHoldProof(
  client: Client,
  jobId: string,
  clientId: string,
  workerId: string,
  contractId: string | null,
): Promise<HoldProof> {
  const ref = freelancerJobEscrowReferenceKey(jobId);
  const hold = await client.query<{
    status: string;
    gross_minor: number;
    hold_minor: number;
    net_minor: number;
    hold_bps: number;
    reference_key: string;
    id: string;
  }>(
    `SELECT id, status, gross_minor, hold_minor, net_minor, hold_bps, reference_key
     FROM escrow_holds WHERE reference_key = $1`,
    [ref],
  );
  const row = hold.rows[0];
  if (!row) {
    fail(`EscrowHold yok (ref=${ref}).`);
  }
  const debit = await client.query<{ amount_minor: number }>(
    `SELECT amount_minor FROM ledger_entries
     WHERE user_id = $1 AND purpose = 'escrow-hold' AND direction = 'DEBIT'
       AND idempotency_key = $2`,
    [clientId, `escrow-hold:${ref}`],
  );
  const netCredit = await client.query<{ amount_minor: number }>(
    `SELECT amount_minor FROM ledger_entries
     WHERE user_id = $1 AND purpose = 'escrow-release-net' AND direction = 'CREDIT'
       AND idempotency_key = $2`,
    [workerId, `escrow-release-net:${row.id}`],
  );
  const holdCredit = await client.query<{ amount_minor: number }>(
    `SELECT amount_minor FROM ledger_entries
     WHERE user_id = $1 AND purpose = 'escrow-release-hold' AND direction = 'CREDIT'
       AND idempotency_key = $2`,
    [treasuryUserId(), `escrow-release-hold:${row.id}`],
  );
  const visa = contractId
    ? await client.query<{ source_kind: string }>(
        `SELECT source_kind FROM career_visa_stamps
         WHERE user_id = $1 AND source_kind = 'FREELANCER_RELEASE' AND source_id = $2`,
        [workerId, contractId],
      )
    : { rows: [] as Array<{ source_kind: string }> };
  return {
    status: row.status,
    grossMinor: Number(row.gross_minor),
    holdMinor: Number(row.hold_minor),
    netMinor: Number(row.net_minor),
    holdBps: Number(row.hold_bps),
    referenceKey: row.reference_key,
    debitMinor: debit.rows[0] ? Number(debit.rows[0].amount_minor) : null,
    netCredit: netCredit.rows[0] ? Number(netCredit.rows[0].amount_minor) : null,
    holdCredit: holdCredit.rows[0] ? Number(holdCredit.rows[0].amount_minor) : null,
    visaKind: visa.rows[0]?.source_kind ?? null,
  };
}

async function probeClosedTestingIsolation(base: string): Promise<void> {
  console.log("→ Closed Testing izolasyon: CORS boş, 426 kilit, çerez-only 401, /cuzdan 307");

  const corsPreflight = await fetch(`${base}/api/v1/auth/session`, {
    method: "OPTIONS",
    headers: {
      Origin: LAB_ORIGIN,
      "Access-Control-Request-Method": "GET",
      "Access-Control-Request-Headers": "Authorization, X-Rail-Min-Version",
    },
    signal: AbortSignal.timeout(20_000),
  });
  if (corsPreflight.status !== 204) {
    fail(`v1 OPTIONS ${corsPreflight.status} — 204 beklenirdi.`);
  }
  if (corsPreflight.headers.get("access-control-allow-origin")) {
    fail("RAIL_DRON_ORIGINS boşken ACAO yazıldı. Closed Testing saf native varsayımı kırıldı.");
  }
  if (corsPreflight.headers.get("access-control-allow-credentials") === "true") {
    fail("Allow-Credentials yasak.");
  }

  const missingVersion = await v1Request(base, "/api/v1/auth/session", {
    method: "GET",
    minVersion: null,
  });
  if (missingVersion.status !== 400 || missingVersion.envelope?.error !== RAIL_VERSION_HEADER_REQUIRED) {
    fail(`Başlıksız v1 ${missingVersion.status} ${missingVersion.envelope?.error ?? missingVersion.text}`);
  }
  if (missingVersion.envelope?.data !== null) {
    fail("400 zarfında data null değil.");
  }
  console.log(`→ HTTP 400 sürüm başlığı: "${RAIL_VERSION_HEADER_REQUIRED}"`);

  const serverStale = await v1Request(base, "/api/v1/auth/session", {
    method: "GET",
    minVersion: "2",
  });
  if (serverStale.status !== 426 || serverStale.envelope?.ok !== false) {
    fail(`X-Rail-Min-Version: 2 → ${serverStale.status} (426 kilit beklenirdi).`);
  }
  if (serverStale.envelope?.error !== RAIL_VERSION_SERVER_STALE) {
    fail(`426 cümlesi sapması: ${serverStale.envelope?.error}`);
  }
  if (serverStale.envelope?.data !== null) {
    fail("426 zarfında data null değil — kilit ekranı boş home değildir.");
  }
  console.log(`→ HTTP 426 tetikleyici (istemci 2 / sunucu 1): "${RAIL_VERSION_SERVER_STALE}"`);
  console.log(`→ client-stale 426 cümlesi (minVersion yükselince eski APK): "${RAIL_VERSION_CLIENT_STALE}"`);
  console.log(`→ Dron kilit ekranı başlığı (dron-stale-lock): "${DRON_STALE_LOCK_TITLE}"`);

  const cookieOnly = await v1Request(base, "/api/v1/auth/session", {
    method: "GET",
    cookie: "sb-staging-auth-token=not-a-session",
  });
  if (cookieOnly.status !== 401 || cookieOnly.envelope?.error !== RAIL_V1_SESSION_REQUIRED) {
    fail(`Çerez-only v1 ${cookieOnly.status} ${cookieOnly.envelope?.error ?? cookieOnly.text}`);
  }
  console.log(`→ çerez-only Bearer yok: HTTP 401 "${RAIL_V1_SESSION_REQUIRED}"`);

  const walletPage = await fetch(webWalletUrl(base), {
    redirect: "manual",
    signal: AbortSignal.timeout(20_000),
  });
  const location = walletPage.headers.get("location") ?? "";
  if (walletPage.status !== 307 || !location.includes("/login")) {
    fail(`/cuzdan oturumsuz ${walletPage.status} Location=${location} — 307 /login beklenirdi.`);
  }
  console.log(`→ /cuzdan köprüsü oturumsuz 307 → ${location}`);
}

async function assertBearerSession(base: string, citizen: Citizen): Promise<void> {
  const session = await v1Request(base, "/api/v1/auth/session", {
    method: "GET",
    token: citizen.accessToken,
    origin: LAB_ORIGIN,
  });
  if (session.status !== 200 || session.envelope?.ok !== true) {
    fail(`Bearer session ${session.status}: ${JSON.stringify(session.body)}`);
  }
  if (session.headers.get("access-control-allow-origin")) {
    fail("Bearer + Origin ile ACAO yazıldı. Boş allowlist CORS basmaz.");
  }
  const user = asRecord(session.envelope?.data?.user);
  if (user.id !== citizen.userId) {
    fail("Session user.id Bearer vatandaşı ile uyuşmuyor.");
  }
  if ("accessToken" in user || "access_token" in user) {
    fail("Session data.user içinde token sızıntısı.");
  }
  console.log("→ Bearer + X-Rail-Min-Version: 1 session 200; CORS yok; token sızmaz");
}

async function main(): Promise<void> {
  if (process.env.PAYTR_ALLOW_MOCK_CHECKOUT?.trim().toLowerCase() === "true") {
    fail("PAYTR_ALLOW_MOCK_CHECKOUT açık — Staging T4 mock checkout ile yeşil boyanmaz.");
  }
  if (process.env.PAYTR_SANDBOX?.trim() !== "1") {
    fail("PAYTR_SANDBOX=1 değil. Staging T4 yalnız sandbox nakit girişi (test-net).");
  }
  const parsedOrigins = parseRailDronOrigins(process.env.RAIL_DRON_ORIGINS);
  if (parsedOrigins.length > 0) {
    fail(
      `RAIL_DRON_ORIGINS dolu (${parsedOrigins.join(", ")}). Closed Testing / staging T4 saf native Bearer ister; laboratuvar origin'i taşınmaz.`,
    );
  }

  const base = appBase();
  console.log(`→ hedef ${base} (STAGING_APP_URL || NEXT_PUBLIC_APP_URL)`);
  console.log(`→ web cüzdan köprüsü ${webWalletUrl(base)}`);

  await waitForHealth(base);
  await probeClosedTestingIsolation(base);
  await withDirectClient(assertSingleBalanceSchema);
  const catalogHoldBps = await withDirectClient(readCatalogHoldBps);

  const worker = await ensureCitizen("worker");
  await assertBearerSession(base, worker);

  const client = await ensureCitizen("client");
  if (worker.userId === client.userId) {
    fail("Satıcı ve müşteri aynı vatandaş olamaz.");
  }
  await assertBearerSession(base, client);
  await ensureAcademyVisa(base, worker);

  const listed = await v1Request(base, "/api/v1/freelancer/jobs", {
    method: "GET",
    token: worker.accessToken,
  });
  if (listed.status !== 200 || listed.envelope?.ok !== true) {
    fail(`Açık iş listesi ${listed.status}: ${JSON.stringify(listed.body)}`);
  }
  console.log("→ GET /api/v1/freelancer/jobs (Dron allowlist) 200");

  const created = await jsonRequest(`${base}/api/freelancer/jobs`, {
    method: "POST",
    headers: {
      ...canonicalAuthHeaders(client.accessToken),
      "Idempotency-Key": randomUUID(),
    },
    body: JSON.stringify({
      title: "Staging T4 saha halkası — emanet mühürü",
      brief: "OPEN ilan. Dron hop'u değildir; owner GET + accept v1 konuşur.",
      budgetMinor: JOB_GROSS_MINOR,
    }),
  });
  if (created.status !== 201 || created.body.ok !== true) {
    fail(`İlan oluşturma ${created.status}: ${JSON.stringify(created.body)}`);
  }
  const job = created.body.job as { id?: string; status?: string; budgetMinor?: number } | undefined;
  if (!job?.id || job.status !== "OPEN" || job.budgetMinor !== JOB_GROSS_MINOR) {
    fail(`OPEN ilan beklenirdi: ${JSON.stringify(job)}`);
  }
  const jobId = job.id;
  console.log(`→ İlan Açma (Amiral kanonik POST /api/freelancer/jobs) OPEN ${jobId}`);

  const visaDenied = await v1Request(base, `/api/v1/freelancer/jobs/${jobId}/bids`, {
    method: "POST",
    token: client.accessToken,
    idempotencyKey: randomUUID(),
    body: {
      amountMinor: JOB_GROSS_MINOR,
      coverNote: "Vizesiz teklif — kapı 403 kalmalı.",
    },
  });
  if (visaDenied.status !== 403 || visaDenied.envelope?.error !== RAIL_V1_LISTING_VISA_DENIED) {
    fail(`Vizesiz teklif ${visaDenied.status} ${visaDenied.envelope?.error ?? ""} — HTTP 403 beklenirdi.`);
  }
  console.log("→ Vize Kontrollü Teklif: vizesiz işveren HTTP 403");

  const bidKey = randomUUID();
  const bidRes = await v1Request(base, `/api/v1/freelancer/jobs/${jobId}/bids`, {
    method: "POST",
    token: worker.accessToken,
    idempotencyKey: bidKey,
    body: {
      amountMinor: JOB_GROSS_MINOR,
      coverNote: "Staging T4 vizeli teklif; owner GET bidId üretir.",
    },
  });
  if (bidRes.status !== 201 || bidRes.envelope?.ok !== true) {
    fail(`Vizeli teklif ${bidRes.status}: ${JSON.stringify(bidRes.body)}`);
  }
  const bid = asRecord(bidRes.envelope?.data?.bid);
  const bidIdFromWrite = String(bid.id ?? "");
  if (!bidIdFromWrite) {
    fail("Teklif id yok.");
  }
  console.log(`→ vizeli usta teklifi 201 bid.id=${bidIdFromWrite.slice(0, 8)}…`);

  const ownerBids = await v1Request(base, `/api/v1/client/jobs/${jobId}/bids`, {
    method: "GET",
    token: client.accessToken,
  });
  if (ownerBids.status !== 200 || ownerBids.envelope?.ok !== true) {
    fail(`Owner bids ${ownerBids.status}: ${JSON.stringify(ownerBids.body)}`);
  }
  const bids = ownerBids.envelope?.data?.bids;
  if (!Array.isArray(bids) || bids.length !== 1) {
    fail(`Owner bids beklenen 1 satır: ${JSON.stringify(ownerBids.envelope?.data)}`);
  }
  const ownerRow = asRecord(bids[0]);
  const ownerKeys = Object.keys(ownerRow).sort();
  if (ownerKeys.join(",") !== "amountMinor,bidId,coverNote,createdAt") {
    fail(`Owner DTO kaçak/eksik alan: ${ownerKeys.join(", ")}`);
  }
  if ("bidderId" in ownerRow || JSON.stringify(ownerRow).includes(worker.userId)) {
    fail("Owner bids bidderId / usta kimliği sızdırdı.");
  }
  const bidId = String(ownerRow.bidId ?? "");
  if (bidId !== bidIdFromWrite) {
    fail(`Owner bidId ${bidId} ≠ yazma id ${bidIdFromWrite} (sessiz id map yok).`);
  }
  console.log("→ Owner Bids GET: 200, dört alan, bidderId yok");

  const ustaPeek = await v1Request(base, `/api/v1/client/jobs/${jobId}/bids`, {
    method: "GET",
    token: worker.accessToken,
  });
  if (ustaPeek.status !== 403 || ustaPeek.envelope?.error !== RAIL_V1_OWNER_BIDS_FORBIDDEN) {
    fail(`Usta owner GET ${ustaPeek.status} ${ustaPeek.envelope?.error ?? ""}`);
  }
  if (ustaPeek.body.bids !== undefined) {
    fail("Usta 403 gövdesinde bids kaçtı.");
  }
  console.log("→ usta Owner Bids GET HTTP 403, bids yok");

  const workerAcceptDenied = await v1Request(base, `/api/v1/freelancer/jobs/${jobId}/accept`, {
    method: "POST",
    token: worker.accessToken,
    idempotencyKey: randomUUID(),
    body: { bidId },
  });
  if (
    workerAcceptDenied.status !== 403 ||
    workerAcceptDenied.envelope?.error !== RAIL_V1_ACCEPT_FORBIDDEN
  ) {
    fail(`Usta accept ${workerAcceptDenied.status} ${workerAcceptDenied.envelope?.error ?? ""}`);
  }
  console.log("→ usta Accept DEBIT HTTP 403");

  const clientBeforeAccept = await walletMinor(client.userId);
  const accept = await v1Request(base, `/api/v1/freelancer/jobs/${jobId}/accept`, {
    method: "POST",
    token: client.accessToken,
    idempotencyKey: randomUUID(),
    body: { bidId },
  });
  if (
    accept.status !== 503 ||
    accept.envelope?.error !== RAIL_V1_ACCEPT_MARKETPLACE_UNAVAILABLE
  ) {
    fail(
      `Kabul ${accept.status} ${accept.envelope?.error ?? ""} — 503 ${RAIL_V1_ACCEPT_MARKETPLACE_UNAVAILABLE} beklenirdi.`,
    );
  }
  const clientAfterAccept = await walletMinor(client.userId);
  if (clientAfterAccept !== clientBeforeAccept) {
    fail(`503 kabulünde bakiye değişti ${clientBeforeAccept} → ${clientAfterAccept}.`);
  }
  console.log(
    `→ Accept 503 "${RAIL_V1_ACCEPT_MARKETPLACE_UNAVAILABLE}". Cüzdan DEBIT yok. Teslim/serbest bu fazda koşmaz.`,
  );

  // Path tanığı (PSP pasif; hop'lar bir sonraki fazdadır):
  // `/api/v1/freelancer/contracts/${contractId}/messages`
  // `/api/v1/freelancer/contracts/${contractId}/release`
  // escrow-hold / escrow-release-net / EscrowHold PENDING
  // kind: "DELIVERY"
  // FREELANCER_RELEASE

  console.log(
    `verify:staging-t4-loop OK — v1 halka + dürüst 503 (PSP pasif) + Closed Testing izolasyon.`,
  );
}

void main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error));
});
