#!/usr/bin/env tsx
/**
 * T4 canlı kazanç halkası — Freelancer emanet / hakediş. Sahte bakiye YASAK.
 *
 * OPEN ilan → katalog hold bandı → accept (PSP hold veya dürüst 503; Rail DEBIT yok)
 * → teslim → release (split port) → FREELANCER_RELEASE vize.
 * CheckoutPriceLock akademi halkasına aittir; freelancer nakit kilidi EscrowHold'dur
 * (ikinci bakiye kolonu yok). Satıcı teklifi akademi Kariyer vizesi ister.
 *
 *   npm run ops:t4-freelancer-loop
 *
 * wallets.amount_minor doğrudan yazılmaz. Mock checkout açılmaz.
 * Tohum ilanlar (fj_rail_icon_set) hazine sentinel'e aittir; kabul vatandaş
 * ilanı üzerinden koşar. PayTR localhost'a bildirim gönderemez; HMAC gövdesi
 * production webhook handler'a verilir.
 */

import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import dotenv from "dotenv";
import { Client } from "pg";
import { createClient } from "@supabase/supabase-js";
import { academyCourseSeedBySlug } from "@/lib/academy/seed";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { academyCanonicalProofSubmission } from "@/lib/academy/proof-of-work";
import { academyExamAnswersFromPublicQuestions } from "@/lib/academy/exam-sitting";
import { FREELANCER_JOB_SEEDS, FREELANCER_SEED_MODULE_KEY, FREELANCER_ESCROW_HOLD_UNIT_KEY } from "@/lib/freelancer/seed";
import { freelancerJobEscrowReferenceKey } from "@/lib/freelancer/fsm";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { computePaytrWebhookHash } from "@/lib/kernel/payments/paytr/webhook";
import { buildIdempotentMerchantOid } from "@/lib/kernel/payments/merchant-oid";
import { WALLET_TOP_UP_MIN_MINOR } from "@/lib/kernel/payments/wallet-top-up";
import { CHECKOUT_LEGAL_CONSENT_PAYLOAD } from "@/lib/kernel/legal/checkout-consent";
import { CHECKOUT_BILLING_PAYLOAD } from "@/lib/kernel/identity/billing-info";
import { HOLD_BPS_DEFAULT, HOLD_BPS_MAX, HOLD_BPS_MIN } from "@/lib/kernel/pricing/hold-bps";
import {
  resolveMigratorConnectionUrl,
  withPgLibpqSslCompat,
} from "./ops-migrate-lib";
import { flattenRailV1Record } from "./rail-v1-ops-json";

const ROOT = process.cwd();
dotenv.config({ path: resolve(ROOT, ".env.local") });
dotenv.config({ path: resolve(ROOT, ".env") });

const COURSE_ID = "ac_rail_temel";
const COURSE_SLUG = "python-temel";
const SEED_OPEN_JOB_ID = FREELANCER_JOB_SEEDS[0]?.id ?? "fj_rail_icon_set";
const JOB_GROSS_MINOR = 10_000;
const FOREIGN_IP = "85.105.141.10";
const FORBIDDEN_BALANCE_COLUMNS = [
  "balance_kurus",
  "amount_kurus",
  "balance_minor",
  "available_minor",
  "locked_minor",
  "hold_minor",
];

function fail(message: string): never {
  console.error(`ops:t4-freelancer-loop BAŞARISIZ: ${message}`);
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
  return (process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000").replace(/\/$/, "");
}

function treasuryUserId(): string {
  return process.env.PLATFORM_TREASURY_USER_ID?.trim() || PLATFORM_TREASURY_USER_ID;
}

async function waitForHealth(base: string, timeoutMs = 90_000): Promise<void> {
  const started = Date.now();
  let last = "henüz yanıt yok";
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(`${base}/api/health`);
      const body = flattenRailV1Record((await response.json()) as Record<string, unknown>) as {
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
  fail(`GET /api/health yeşil değil (${last}). Direct :5432 ve npm run dev gerekir.`);
}

async function jsonRequest(
  url: string,
  init: RequestInit,
): Promise<{ status: number; body: Record<string, unknown>; text: string }> {
  const response = await fetch(url, init);
  const text = await response.text();
  let body: Record<string, unknown> = {};
  try {
    const parsed: unknown = JSON.parse(text);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      body = flattenRailV1Record(parsed as Record<string, unknown>);
    }
  } catch {
    body = { raw: text };
  }
  return { status: response.status, body, text };
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

function authHeaders(token: string): Record<string, string> {
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
      ...authHeaders(citizen.accessToken),
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
    fail("mockCheckout=true — sahte checkout T4'te yasak.");
  }
  if (topUp.body.sandboxMode !== true) {
    fail("sandboxMode değil. T4 PayTR sandbox ister.");
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
  console.log(`→ Ledger CREDIT ${cleared.creditMinor} CLEARED oid=${merchantOid.slice(0, 24)}…`);
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
    headers: authHeaders(worker.accessToken),
  });
  if (visas.status === 200 && visas.body.ok === true) {
    const stamps = visas.body.stamps as Array<{ sourceKind?: string }> | undefined;
    if (stamps?.some((stamp) => stamp.sourceKind === "ACADEMY_CERTIFICATE")) {
      console.log("→ satıcı akademi vizesi mevcut");
      return;
    }
  }

  const seed = academyCourseSeedBySlug(COURSE_SLUG);
  if (!seed) {
    fail("python-temel tohumu yok.");
  }
  const lock = await jsonRequest(`${base}/api/academy/courses/${COURSE_ID}/lock`, {
    method: "POST",
    headers: authHeaders(worker.accessToken),
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
  console.log(`→ akademi CheckoutPriceLock ${catalogMinor} minor`);

  const need = Math.max(catalogMinor - (await walletMinor(worker.userId)), 0);
  if (need > 0) {
    await paytrTopUp(base, worker, Math.max(need, WALLET_TOP_UP_MIN_MINOR));
  }

  const purchaseKey = randomUUID();
  const purchase = await jsonRequest(`${base}/api/academy/courses/${COURSE_ID}/purchase`, {
    method: "POST",
    headers: {
      ...authHeaders(worker.accessToken),
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
    const proof = academyCanonicalProofSubmission(lesson.key);
    const done = await jsonRequest(`${base}/api/academy/courses/${COURSE_ID}/curriculum`, {
      method: "POST",
      headers: authHeaders(worker.accessToken),
      body: JSON.stringify({ lessonKey: lesson.key, proof }),
    });
    if (done.status !== 200 || done.body.ok !== true) {
      fail(`Ders ${lesson.key} ${done.status}: ${JSON.stringify(done.body)}`);
    }
  }

  const examGet = await jsonRequest(`${base}/api/academy/courses/${COURSE_ID}/exam`, {
    method: "GET",
    headers: authHeaders(worker.accessToken),
  });
  const questions = examGet.body.questions as Array<{ id: string; choices: string[] }> | undefined;
  if (examGet.status !== 200 || !questions?.length) {
    fail(`Sınav GET ${examGet.status}: ${JSON.stringify(examGet.body)}`);
  }
  const sessionToken = examGet.body.sessionToken;
  if (typeof sessionToken !== "string" || sessionToken.length === 0) {
    fail("Sınav oturum mührü yok.");
  }
  let answers;
  try {
    answers = academyExamAnswersFromPublicQuestions(questions, seed.exam.questions);
  } catch (error) {
    fail(error instanceof Error ? error.message : String(error));
  }
  const examPost = await jsonRequest(`${base}/api/academy/courses/${COURSE_ID}/exam`, {
    method: "POST",
    headers: authHeaders(worker.accessToken),
    body: JSON.stringify({ answers, sessionToken }),
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
  console.log(`→ katalog hold ${bps} bps (Super Admin SSOT)`);
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

async function main(): Promise<void> {
  if (process.env.PAYTR_ALLOW_MOCK_CHECKOUT?.trim().toLowerCase() === "true") {
    fail("PAYTR_ALLOW_MOCK_CHECKOUT açık — T4 mock checkout ile yeşil boyanmaz.");
  }
  if (process.env.PAYTR_SANDBOX?.trim() !== "1") {
    fail("PAYTR_SANDBOX=1 değil. T4 yalnız sandbox nakit girişi.");
  }

  const base = appBase();
  await waitForHealth(base);
  await withDirectClient(assertSingleBalanceSchema);
  const catalogHoldBps = await withDirectClient(readCatalogHoldBps);

  const worker = await ensureCitizen("worker");
  const client = await ensureCitizen("client");
  if (worker.userId === client.userId) {
    fail("Satıcı ve müşteri aynı vatandaş olamaz.");
  }

  await ensureAcademyVisa(base, worker);

  const listed = await jsonRequest(`${base}/api/freelancer/jobs`, {
    method: "GET",
    headers: authHeaders(client.accessToken),
  });
  if (listed.status !== 200 || listed.body.ok !== true) {
    fail(`İlan listesi ${listed.status}: ${JSON.stringify(listed.body)}`);
  }
  const jobs = (listed.body.jobs as Array<{ id?: string; status?: string }> | undefined) ?? [];
  const seedOpen = jobs.find((job) => job.id === SEED_OPEN_JOB_ID && job.status === "OPEN");
  if (seedOpen) {
    console.log(`→ tohum OPEN ilan ${SEED_OPEN_JOB_ID} (hazine vitrini; kabul vatandaş ilanında)`);
  } else {
    console.log(`→ tohum ${SEED_OPEN_JOB_ID} listede OPEN değil (vitrin; nakit vatandaş ilanında)`);
  }

  const created = await jsonRequest(`${base}/api/freelancer/jobs`, {
    method: "POST",
    headers: authHeaders(client.accessToken),
    body: JSON.stringify({
      title: "T4 kazanç halkası — emanet mühürü",
      brief: "OPEN ilan. Teklif kabulünde EscrowHold kilitler; teslim sonrası RELEASE hakediş ve vize basar.",
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
  console.log(`→ OPEN ilan ${jobId} budget=${JOB_GROSS_MINOR}`);

  const visaDenied = await jsonRequest(`${base}/api/freelancer/jobs/${SEED_OPEN_JOB_ID}/bids`, {
    method: "POST",
    headers: authHeaders(client.accessToken),
    body: JSON.stringify({
      amountMinor: JOB_GROSS_MINOR,
      coverNote: "Vizesiz teklif — kapı 403 kalmalı.",
    }),
  });
  if (visaDenied.status !== 403) {
    fail(`Vizesiz teklif ${visaDenied.status} — HTTP 403 beklenirdi (kapı gevşetilmez).`);
  }
  console.log("→ vizesiz müşteri teklifi HTTP 403 (Kariyer Vizesi kapısı)");

  const need = Math.max(JOB_GROSS_MINOR - (await walletMinor(client.userId)), 0);
  if (need > 0) {
    await paytrTopUp(base, client, Math.max(need, WALLET_TOP_UP_MIN_MINOR));
  }
  const clientBeforeAccept = await walletMinor(client.userId);

  const bidRes = await jsonRequest(`${base}/api/freelancer/jobs/${jobId}/bids`, {
    method: "POST",
    headers: authHeaders(worker.accessToken),
    body: JSON.stringify({
      amountMinor: JOB_GROSS_MINOR,
      coverNote: "T4 teslim mühürlü; emanet serbestine kadar nakit kilitli.",
    }),
  });
  if (bidRes.status !== 201 || bidRes.body.ok !== true) {
    fail(`Teklif ${bidRes.status}: ${JSON.stringify(bidRes.body)}`);
  }
  const bid = bidRes.body.bid as { id?: string } | undefined;
  if (!bid?.id) {
    fail("Teklif id yok.");
  }
  const bidId = bid.id;

  const acceptKey = randomUUID();
  const accept = await jsonRequest(`${base}/api/freelancer/jobs/${jobId}/accept`, {
    method: "POST",
    headers: {
      ...authHeaders(client.accessToken),
      "Idempotency-Key": acceptKey,
    },
    body: JSON.stringify({ bidId }),
  });
  if (accept.status === 503) {
    console.log(
      "→ Kabul 503: Ödeme henüz bağlanmadı. Sahte DEBIT yok. T4 nakit halkası dürüst kapanır.",
    );
    return;
  }
  if (accept.status !== 200 || accept.body.ok !== true) {
    fail(`Kabul ${accept.status}: ${JSON.stringify(accept.body)}`);
  }
  const contract = accept.body.contract as {
    id?: string;
    status?: string;
    grossMinor?: number;
    holdMinor?: number;
    netMinor?: number;
  } | undefined;
  if (!contract?.id || contract.status !== "FUNDED" || contract.grossMinor !== JOB_GROSS_MINOR) {
    fail(`FUNDED sözleşme beklenirdi: ${JSON.stringify(contract)}`);
  }
  const contractId = contract.id;
  if ((contract.holdMinor ?? 0) + (contract.netMinor ?? 0) !== JOB_GROSS_MINOR) {
    fail("gross ≠ hold + net.");
  }
  if (contract.holdMinor !== Math.floor((JOB_GROSS_MINOR * catalogHoldBps) / 10_000)) {
    fail(`Hold ${contract.holdMinor} katalog ${catalogHoldBps} bps ile uyuşmuyor.`);
  }

  const replay = await jsonRequest(`${base}/api/freelancer/jobs/${jobId}/accept`, {
    method: "POST",
    headers: {
      ...authHeaders(client.accessToken),
      "Idempotency-Key": acceptKey,
    },
    body: JSON.stringify({ bidId }),
  });
  if (replay.status !== 200 || (replay.body.contract as { id?: string } | undefined)?.id !== contractId) {
    fail("Aynı Idempotency-Key ikinci sözleşme üretti.");
  }

  const afterAccept = await withDirectClient((pg) =>
    readHoldProof(pg, jobId, client.userId, worker.userId, contractId),
  );
  if (afterAccept.status !== "PENDING") {
    fail(`EscrowHold PENDING değil (${afterAccept.status}).`);
  }
  if (afterAccept.debitMinor) {
    fail(`üçüncü kişi işinde escrow-hold DEBIT yasak (${afterAccept.debitMinor}).`);
  }
  if (afterAccept.holdBps !== catalogHoldBps) {
    fail(`EscrowHold.holdBps ${afterAccept.holdBps} ≠ katalog ${catalogHoldBps}.`);
  }
  const clientAfterHold = await walletMinor(client.userId);
  if (clientAfterHold !== clientBeforeAccept) {
    fail(`Kilit sonrası bakiye ${clientAfterHold} (beklenen ${clientBeforeAccept}; Rail DEBIT yok).`);
  }
  const workerAfterHold = await walletMinor(worker.userId);
  console.log(
    `→ EscrowHold PENDING ref=${afterAccept.referenceKey} gross=${afterAccept.grossMinor} hold=${afterAccept.holdMinor} net=${afterAccept.netMinor}; müşteri cüzdan ${clientAfterHold}; satıcı hâlâ ${workerAfterHold} (ikinci kolon yok)`,
  );

  const delivery = await jsonRequest(`${base}/api/freelancer/contracts/${contractId}/messages`, {
    method: "POST",
    headers: authHeaders(worker.accessToken),
    body: JSON.stringify({
      kind: "DELIVERY",
      body: "T4 teslim: emanet serbesti ve kariyer vizesi kanıt paketi.",
      artifactUrl: "https://example.test/t4-delivery.zip",
    }),
  });
  if (delivery.status !== 201 || delivery.body.ok !== true) {
    fail(`Teslim ${delivery.status}: ${JSON.stringify(delivery.body)}`);
  }
  console.log("→ teslim DELIVERY mesajı yazıldı");

  const release = await jsonRequest(`${base}/api/freelancer/contracts/${contractId}/release`, {
    method: "POST",
    headers: authHeaders(client.accessToken),
  });
  if (release.status !== 200 || release.body.ok !== true) {
    fail(`Hakediş ${release.status}: ${JSON.stringify(release.body)}`);
  }
  const released = release.body.contract as { status?: string } | undefined;
  if (released?.status !== "RELEASED") {
    fail(`Sözleşme RELEASED değil: ${JSON.stringify(released)}`);
  }
  const visaStamp = release.body.visaStamp as { sourceKind?: string; userId?: string } | undefined;
  if (visaStamp?.sourceKind !== "FREELANCER_RELEASE") {
    fail(`Kariyer vizesi FREELANCER_RELEASE değil: ${JSON.stringify(release.body.visaStamp)}`);
  }
  if (visaStamp.userId && visaStamp.userId !== worker.userId) {
    fail("Vize satıcıya basılmadı.");
  }

  const afterRelease = await withDirectClient((pg) =>
    readHoldProof(pg, jobId, client.userId, worker.userId, contractId),
  );
  if (afterRelease.status !== "RELEASED") {
    fail(`EscrowHold RELEASED değil (${afterRelease.status}).`);
  }
  if (afterRelease.netCredit !== contract.netMinor) {
    fail(`escrow-release-net ${afterRelease.netCredit} ≠ ${contract.netMinor}.`);
  }
  if (afterRelease.holdCredit !== contract.holdMinor) {
    fail(`escrow-release-hold ${afterRelease.holdCredit} ≠ ${contract.holdMinor}.`);
  }
  if (afterRelease.visaKind !== "FREELANCER_RELEASE") {
    fail("career_visa_stamps FREELANCER_RELEASE satırı yok.");
  }
  const workerAfterRelease = await walletMinor(worker.userId);
  if (workerAfterRelease !== workerAfterHold + (contract.netMinor ?? 0)) {
    fail(`Satıcı bakiyesi ${workerAfterRelease} ≠ ${workerAfterHold + (contract.netMinor ?? 0)}.`);
  }
  const clientAfterRelease = await walletMinor(client.userId);
  if (clientAfterRelease !== clientAfterHold) {
    fail("Release müşteri bakiyesini değiştirdi.");
  }

  console.log(
    `→ RELEASED net=${afterRelease.netCredit} satıcıda; hold=${afterRelease.holdCredit} hazinede; vize FREELANCER_RELEASE`,
  );

  await sealUstaFourRing(base, worker, client, catalogHoldBps);
  console.log("ops:t4-freelancer-loop OK — OPEN ilan + EscrowHold + hakediş + kariyer vizesi.");
}

async function sealUstaFourRing(
  base: string,
  usta: Citizen,
  counterparty: Citizen,
  catalogHoldBps: number,
): Promise<void> {
  const purposes = await withDirectClient(async (pg) => {
    const rows = await pg.query<{ purpose: string; direction: string }>(
      `SELECT DISTINCT purpose, direction FROM ledger_entries WHERE user_id = $1`,
      [usta.userId],
    );
    return new Set(rows.rows.map((row) => `${row.direction}:${row.purpose}`));
  });
  const needed = [
    "CREDIT:wallet-top-up",
    "DEBIT:academy-purchase",
  ] as const;
  if (needed.every((key) => purposes.has(key))) {
    console.log(`→ usta dört halka sicilde ${usta.userId.slice(0, 8)}…`);
    return;
  }

  await ensureAcademyVisa(base, counterparty);
  const need = Math.max(JOB_GROSS_MINOR - (await walletMinor(usta.userId)), 0);
  if (need > 0) {
    await paytrTopUp(base, usta, Math.max(need, WALLET_TOP_UP_MIN_MINOR));
  }

  const created = await jsonRequest(`${base}/api/freelancer/jobs`, {
    method: "POST",
    headers: authHeaders(usta.accessToken),
    body: JSON.stringify({
      title: "T4 usta dört halka — emanet DEBIT mühürü",
      brief: "Usta müşteri kolunda hold DEBIT yazar; karşı taraf vizeli teklif verir.",
      budgetMinor: JOB_GROSS_MINOR,
    }),
  });
  if (created.status !== 201 || created.body.ok !== true) {
    fail(`Usta ilanı ${created.status}: ${JSON.stringify(created.body)}`);
  }
  const job = created.body.job as { id?: string } | undefined;
  if (!job?.id) {
    fail("Usta ilan id yok.");
  }
  const jobId = job.id;

  const bidRes = await jsonRequest(`${base}/api/freelancer/jobs/${jobId}/bids`, {
    method: "POST",
    headers: authHeaders(counterparty.accessToken),
    body: JSON.stringify({
      amountMinor: JOB_GROSS_MINOR,
      coverNote: "Usta defterine escrow-hold DEBIT basmak için vizeli teklif.",
    }),
  });
  if (bidRes.status !== 201 || bidRes.body.ok !== true) {
    fail(`Usta ilan teklifi ${bidRes.status}: ${JSON.stringify(bidRes.body)}`);
  }
  const bid = bidRes.body.bid as { id?: string } | undefined;
  if (!bid?.id) {
    fail("Usta ilan teklif id yok.");
  }

  const accept = await jsonRequest(`${base}/api/freelancer/jobs/${jobId}/accept`, {
    method: "POST",
    headers: {
      ...authHeaders(usta.accessToken),
      "Idempotency-Key": randomUUID(),
    },
    body: JSON.stringify({ bidId: bid.id }),
  });
  if (accept.status === 503) {
    console.log("→ Usta kabul 503: Pazaryeri henüz bağlı değil. Sahte DEBIT yok.");
    return;
  }
  if (accept.status !== 200 || accept.body.ok !== true) {
    fail(`Usta kabul ${accept.status}: ${JSON.stringify(accept.body)}`);
  }
  const contract = accept.body.contract as { id?: string; netMinor?: number } | undefined;
  if (!contract?.id) {
    fail(`Usta sözleşme yok: ${JSON.stringify(contract)}`);
  }

  const delivery = await jsonRequest(`${base}/api/freelancer/contracts/${contract.id}/messages`, {
    method: "POST",
    headers: authHeaders(counterparty.accessToken),
    body: JSON.stringify({
      kind: "DELIVERY",
      body: "T4 usta dört halka teslim.",
      artifactUrl: "https://example.test/t4-usta-four-ring.zip",
    }),
  });
  if (delivery.status !== 201 || delivery.body.ok !== true) {
    fail(`Usta teslim ${delivery.status}: ${JSON.stringify(delivery.body)}`);
  }

  const release = await jsonRequest(`${base}/api/freelancer/contracts/${contract.id}/release`, {
    method: "POST",
    headers: authHeaders(usta.accessToken),
  });
  if (release.status !== 200 || release.body.ok !== true) {
    fail(`Usta hakediş ${release.status}: ${JSON.stringify(release.body)}`);
  }

  const proof = await withDirectClient((pg) =>
    readHoldProof(pg, jobId, usta.userId, counterparty.userId, contract.id ?? null),
  );
  if (proof.status !== "RELEASED" || proof.debitMinor) {
    fail(`Usta hold mühürü eksik veya sahte DEBIT: ${JSON.stringify(proof)}`);
  }
  if (proof.holdBps !== catalogHoldBps) {
    fail(`Usta hold bps ${proof.holdBps} ≠ ${catalogHoldBps}.`);
  }
  console.log(`→ usta dört halka kilitlendi ${usta.userId.slice(0, 8)}… hold DEBIT ${proof.debitMinor}`);
}

void main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error));
});
