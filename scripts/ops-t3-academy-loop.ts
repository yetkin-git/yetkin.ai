#!/usr/bin/env tsx
/**
 * T3 canlı akademi nakit döngüsü — sahte bakiye YASAK.
 *
 * PayTR sandbox get-token (PENDING) + classic HMAC webhook → LedgerEntry CREDIT,
 * PaymentOrder CLEARED. Sonra katalog kilidi, rail-temel satın alma, Idempotency-Key
 * replay, müfredat, sınav ≥70, SHA256 `/academy/dogrula/[hash]`.
 *
 *   npm run ops:t3-academy-loop
 *
 * Sahte oturum bayrağı yok. Mock checkout açılmaz.
 * wallets.amount_minor doğrudan yazılmaz; CREDIT yalnız clearSuccessfulPaymentOrder.
 * PayTR localhost'a bildirim gönderemez; HMAC gövdesi production webhook handler'a verilir.
 */

import { randomBytes, randomUUID } from "node:crypto";
import { appendFileSync } from "node:fs";
import { resolve } from "node:path";
import dotenv from "dotenv";
import { Client } from "pg";
import { createClient } from "@supabase/supabase-js";
import { academyCourseSeedBySlug } from "@/lib/academy/seed";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { computePaytrWebhookHash } from "@/lib/kernel/payments/paytr/webhook";
import { WALLET_TOP_UP_MIN_MINOR } from "@/lib/kernel/payments/wallet-top-up";
import {
  resolveMigratorConnectionUrl,
  withPgLibpqSslCompat,
} from "./ops-migrate-lib";

const ROOT = process.cwd();
dotenv.config({ path: resolve(ROOT, ".env.local") });
dotenv.config({ path: resolve(ROOT, ".env") });

const COURSE_ID = "ac_rail_temel";
const COURSE_SLUG = "rail-temel";
const FOREIGN_IP = "85.105.141.10";

function fail(message: string): never {
  console.error(`ops:t3-academy-loop BAŞARISIZ: ${message}`);
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

async function waitForHealth(base: string, timeoutMs = 90_000): Promise<void> {
  const started = Date.now();
  let last = "henüz yanıt yok";
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(`${base}/api/health`);
      const body = (await response.json()) as {
        ok?: boolean;
        checks?: { db?: string; paytr?: string };
      };
      last = `HTTP ${response.status} db=${body.checks?.db ?? "?"} paytr=${body.checks?.paytr ?? "?"}`;
      if (response.status === 200 && body.ok === true && body.checks?.db === "ok") {
        console.log(`→ health ${last}`);
        return;
      }
    } catch (error) {
      last = error instanceof Error ? error.message : String(error);
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 1500));
  }
  fail(`GET /api/health yeşil değil (${last}). npm run dev ile Rail'i aç.`);
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
      body = parsed as Record<string, unknown>;
    }
  } catch {
    body = { raw: text };
  }
  return { status: response.status, body, text };
}

function persistCitizen(email: string, password: string): void {
  if (process.env.E2E_T3_EMAIL?.trim() && process.env.E2E_T3_PASSWORD?.trim()) {
    return;
  }
  appendFileSync(
    resolve(ROOT, ".env.local"),
    `\n# T3 akademi döngü vatandaşı (git dışı; icat Cloud anahtarı değil)\nE2E_T3_EMAIL="${email}"\nE2E_T3_PASSWORD="${password}"\n`,
    "utf8",
  );
}

async function confirmAuthEmail(client: Client, userId: string): Promise<void> {
  const { rows } = await client.query<{ column_name: string; is_generated: string }>(
    `SELECT column_name, is_generated
     FROM information_schema.columns
     WHERE table_schema = 'auth' AND table_name = 'users'
       AND column_name IN ('email_confirmed_at', 'confirmed_at')`,
  );
  const emailConfirm = rows.find((row) => row.column_name === "email_confirmed_at");
  // GoTrue: confirmed_at üretilmiş kolondur (yalnız DEFAULT). Sahte onay yok.
  if (emailConfirm?.is_generated === "NEVER") {
    await client.query(
      `UPDATE auth.users
       SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
       WHERE id = $1::uuid`,
      [userId],
    );
    return;
  }
  fail("auth.users yazılabilir email_confirmed_at yok.");
}

async function ensureCitizen(): Promise<{
  accessToken: string;
  userId: string;
  email: string;
}> {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anon = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const auth = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const existingEmail = process.env.E2E_T3_EMAIL?.trim() ?? "";
  const existingPassword = process.env.E2E_T3_PASSWORD?.trim() ?? "";
  if (existingEmail && existingPassword) {
    const signed = await auth.auth.signInWithPassword({
      email: existingEmail,
      password: existingPassword,
    });
    if (signed.error || !signed.data.session?.access_token || !signed.data.user?.id) {
      fail(`Mevcut T3 vatandaşı giriş yapamadı: ${signed.error?.message ?? "oturum yok"}`);
    }
    console.log(`→ oturum mevcut vatandaş ${signed.data.user.id.slice(0, 8)}…`);
    return {
      accessToken: signed.data.session.access_token,
      userId: signed.data.user.id,
      email: existingEmail,
    };
  }

  const email = `t3.loop.${Date.now()}@gmail.com`;
  const password = `T3.${randomBytes(12).toString("base64url")}!aA1`;
  const signedUp = await auth.auth.signUp({ email, password });
  const userId = signedUp.data.user?.id;
  if (signedUp.error || !userId) {
    fail(`Kayıt açılamadı: ${signedUp.error?.message ?? "kullanıcı yok"}`);
  }
  persistCitizen(email, password);

  const dbUrl = resolveMigratorConnectionUrl({
    DIRECT_URL: process.env.DIRECT_URL,
    DATABASE_URL: process.env.DATABASE_URL,
  });
  if (!dbUrl) {
    fail("DIRECT_URL / DATABASE_URL yok; e-posta SQL ile onaylanamaz.");
  }
  const client = new Client({ connectionString: withPgLibpqSslCompat(dbUrl) });
  await client.connect();
  try {
    await confirmAuthEmail(client, userId);
    const publicUser = await client.query<{ n: number }>(
      `SELECT count(*)::int AS n FROM public.users WHERE id = $1::text`,
      [userId],
    );
    if (Number(publicUser.rows[0]?.n ?? 0) < 1) {
      fail("public.users satırı yok — handle_new_user tetiklenmedi.");
    }
  } finally {
    await client.end();
  }

  const signedIn = await auth.auth.signInWithPassword({ email, password });
  if (signedIn.error || !signedIn.data.session?.access_token) {
    fail(`Onay sonrası giriş yok: ${signedIn.error?.message ?? "oturum yok"}`);
  }
  console.log(`→ oturum yeni vatandaş ${userId.slice(0, 8)}… (e-posta SQL onay)`);
  return {
    accessToken: signedIn.data.session.access_token,
    userId,
    email,
  };
}

async function readCashProof(
  userId: string,
  merchantOid: string,
): Promise<{
  orderStatus: string;
  orderAmount: number;
  creditMinor: number | null;
  walletMinor: number | null;
}> {
  const dbUrl = resolveMigratorConnectionUrl({
    DIRECT_URL: process.env.DIRECT_URL,
    DATABASE_URL: process.env.DATABASE_URL,
  });
  if (!dbUrl) {
    fail("Defter okunamadı: DIRECT_URL / DATABASE_URL yok.");
  }
  const client = new Client({ connectionString: withPgLibpqSslCompat(dbUrl) });
  await client.connect();
  try {
    const order = await client.query<{ status: string; amount_minor: number }>(
      `SELECT status, amount_minor FROM payment_orders WHERE merchant_oid = $1`,
      [merchantOid],
    );
    const credit = await client.query<{ amount_minor: number }>(
      `SELECT amount_minor FROM ledger_entries
       WHERE user_id = $1 AND purpose = 'wallet-top-up' AND direction = 'CREDIT'
         AND idempotency_key = $2
       LIMIT 1`,
      [userId, `wallet-top-up:${merchantOid}`],
    );
    const wallet = await client.query<{ amount_minor: number }>(
      `SELECT amount_minor FROM wallets WHERE user_id = $1 AND currency_code = 'TRY'`,
      [userId],
    );
    return {
      orderStatus: order.rows[0]?.status ?? "",
      orderAmount: Number(order.rows[0]?.amount_minor ?? 0),
      creditMinor: credit.rows[0] ? Number(credit.rows[0].amount_minor) : null,
      walletMinor: wallet.rows[0] ? Number(wallet.rows[0].amount_minor) : null,
    };
  } finally {
    await client.end();
  }
}

async function main(): Promise<void> {
  if (process.env.PAYTR_ALLOW_MOCK_CHECKOUT?.trim().toLowerCase() === "true") {
    fail("PAYTR_ALLOW_MOCK_CHECKOUT açık — T3 mock checkout ile yeşil boyanmaz.");
  }
  if (process.env.PAYTR_SANDBOX?.trim() !== "1") {
    fail("PAYTR_SANDBOX=1 değil. T3 yalnız sandbox nakit girişi.");
  }
  const merchantKey = requireEnv("PAYTR_MERCHANT_KEY");
  const merchantSalt = requireEnv("PAYTR_MERCHANT_SALT");
  const seed = academyCourseSeedBySlug(COURSE_SLUG);
  if (!seed) {
    fail("rail-temel tohumu yok.");
  }

  const base = appBase();
  await waitForHealth(base);
  const citizen = await ensureCitizen();
  const authHeaders = {
    Authorization: `Bearer ${citizen.accessToken}`,
    "content-type": "application/json",
  };

  const lock = await jsonRequest(`${base}/api/academy/courses/${COURSE_ID}/lock`, {
    method: "POST",
    headers: authHeaders,
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
  if (catalogMinor !== seed.seedAmountMinor) {
    console.log(
      `→ katalog kilidi ${catalogMinor} (tohum ${seed.seedAmountMinor}) — Super Admin SSOT bağlandı`,
    );
  } else {
    console.log(`→ katalog kilidi ${catalogMinor} minor (tohum ile eşit)`);
  }

  const topUpMinor = Math.max(catalogMinor, WALLET_TOP_UP_MIN_MINOR);
  const topUpKey = randomUUID();
  const topUp = await jsonRequest(`${base}/api/wallet/top-up`, {
    method: "POST",
    headers: {
      ...authHeaders,
      "Idempotency-Key": topUpKey,
      "x-forwarded-for": FOREIGN_IP,
    },
    body: JSON.stringify({ amountMinor: topUpMinor }),
  });
  if (topUp.status !== 200 || topUp.body.ok !== true) {
    fail(`Cüzdan yükleme ${topUp.status}: ${JSON.stringify(topUp.body)}`);
  }
  if (topUp.body.mockCheckout === true) {
    fail("mockCheckout=true — sahte checkout T3'te yasak.");
  }
  if (topUp.body.sandboxMode !== true) {
    fail("sandboxMode değil. T3 PayTR sandbox ister.");
  }
  const merchantOid = String(topUp.body.merchantOid ?? "");
  if (!merchantOid.startsWith("wallet-top-up-")) {
    fail("merchantOid wallet-top-up öneki taşımıyor.");
  }
  console.log(`→ PayTR sandbox token alındı oid=${merchantOid.slice(0, 24)}…`);

  const pending = await readCashProof(citizen.userId, merchantOid);
  if (pending.orderStatus !== "PENDING") {
    fail(`Sipariş PENDING değil (${pending.orderStatus || "yok"}).`);
  }

  const badWebhook = await fetch(`${base}/api/payments/webhooks/paytr`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      merchant_oid: merchantOid,
      status: "success",
      total_amount: String(topUpMinor),
      hash: "not-a-real-hmac",
    }),
  });
  if (badWebhook.status !== 400) {
    fail(`Sahte HMAC ${badWebhook.status} — 400 beklenirdi.`);
  }

  const hash = computePaytrWebhookHash(
    {
      merchantOid,
      status: "success",
      totalAmount: String(topUpMinor),
    },
    merchantKey,
    merchantSalt,
  );
  const webhook = await fetch(`${base}/api/payments/webhooks/paytr`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      merchant_oid: merchantOid,
      status: "success",
      total_amount: String(topUpMinor),
      hash,
    }),
  });
  const webhookText = (await webhook.text()).trim();
  if (webhook.status !== 200 || webhookText !== "OK") {
    fail(`PayTR webhook ${webhook.status} gövde=${webhookText}`);
  }

  const cleared = await readCashProof(citizen.userId, merchantOid);
  if (cleared.orderStatus !== "CLEARED") {
    fail(`PaymentOrder CLEARED değil (${cleared.orderStatus}).`);
  }
  if (cleared.creditMinor !== topUpMinor) {
    fail(`Ledger CREDIT yok veya tutar ${cleared.creditMinor} ≠ ${topUpMinor}.`);
  }
  if (cleared.walletMinor == null || cleared.walletMinor < catalogMinor) {
    fail(`Cüzdan bakiyesi katalog tutarını karşılamıyor (${cleared.walletMinor}).`);
  }
  console.log(
    `→ Ledger CREDIT ${cleared.creditMinor} CLEARED; cüzdan ${cleared.walletMinor} (UPDATE yok, append-only)`,
  );

  const purchaseKey = randomUUID();
  const purchase = await jsonRequest(`${base}/api/academy/courses/${COURSE_ID}/purchase`, {
    method: "POST",
    headers: {
      ...authHeaders,
      "Idempotency-Key": purchaseKey,
    },
    body: JSON.stringify({ lockId }),
  });
  if (purchase.status !== 200 || purchase.body.ok !== true) {
    fail(`Satın alma ${purchase.status}: ${JSON.stringify(purchase.body)}`);
  }
  const purchaseRow = purchase.body.purchase as
    | { id?: string; amountMinor?: number; status?: string }
    | undefined;
  if (purchaseRow?.status !== "SETTLED" || purchaseRow.amountMinor !== catalogMinor) {
    fail(`Satın alma SETTLED/${catalogMinor} değil: ${JSON.stringify(purchaseRow)}`);
  }
  const firstApplied = purchase.body.applied === true;
  console.log(
    `→ satın alma ${purchaseRow.id} applied=${String(firstApplied)} status=${purchaseRow.status}`,
  );

  const replay = await jsonRequest(`${base}/api/academy/courses/${COURSE_ID}/purchase`, {
    method: "POST",
    headers: {
      ...authHeaders,
      "Idempotency-Key": purchaseKey,
    },
    body: JSON.stringify({ lockId }),
  });
  if (replay.status !== 200 || replay.body.ok !== true) {
    fail(`Idempotency replay ${replay.status}: ${JSON.stringify(replay.body)}`);
  }
  const replayRow = replay.body.purchase as { id?: string } | undefined;
  if (replayRow?.id !== purchaseRow.id) {
    fail("Aynı Idempotency-Key ikinci purchase id üretti.");
  }
  const afterPurchase = await readCashProof(citizen.userId, merchantOid);
  const expectedWallet = (cleared.walletMinor ?? 0) - (firstApplied ? catalogMinor : 0);
  if (afterPurchase.walletMinor !== expectedWallet) {
    fail(
      `Replay debit şüphesi: cüzdan ${afterPurchase.walletMinor} beklenen ${expectedWallet}.`,
    );
  }
  console.log("→ Idempotency-Key replay ikinci debit doğurmadı");

  const lessons = curriculumForCourseSlug(COURSE_SLUG);
  if (lessons.length === 0) {
    fail("Müfredat tohumu boş.");
  }
  for (const lesson of lessons) {
    const done = await jsonRequest(`${base}/api/academy/courses/${COURSE_ID}/curriculum`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ lessonKey: lesson.key }),
    });
    if (done.status !== 200 || done.body.ok !== true) {
      fail(`Ders ${lesson.key} ${done.status}: ${JSON.stringify(done.body)}`);
    }
  }
  const player = await jsonRequest(`${base}/api/academy/courses/${COURSE_ID}/curriculum`, {
    method: "GET",
    headers: authHeaders,
  });
  const playerRow = player.body.player as { curriculumComplete?: boolean } | undefined;
  if (playerRow?.curriculumComplete !== true) {
    fail("Müfredat tamamlanmadı.");
  }
  console.log(`→ müfredat tam (${lessons.length} ders)`);

  const examGet = await jsonRequest(`${base}/api/academy/courses/${COURSE_ID}/exam`, {
    method: "GET",
    headers: authHeaders,
  });
  if (examGet.status !== 200 || examGet.body.ok !== true) {
    fail(`Sınav GET ${examGet.status}: ${JSON.stringify(examGet.body)}`);
  }
  const questions = examGet.body.questions as Array<{ id: string }> | undefined;
  if (!questions?.length) {
    fail("Sınav sorusu yok.");
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
    headers: authHeaders,
    body: JSON.stringify({ answers }),
  });
  if (examPost.status !== 200 || examPost.body.ok !== true) {
    fail(`Sınav POST ${examPost.status}: ${JSON.stringify(examPost.body)}`);
  }
  if (examPost.body.passed !== true || Number(examPost.body.score) < 70) {
    fail(`Sınav barajı geçilmedi: ${JSON.stringify(examPost.body)}`);
  }
  const certificate = examPost.body.certificate as { certificateHash?: string } | undefined;
  const certificateHash = certificate?.certificateHash ?? "";
  if (!/^[a-f0-9]{64}$/.test(certificateHash)) {
    fail("SHA256 sertifika hash basılmadı.");
  }
  console.log(`→ sınav puan=${String(examPost.body.score)} hash=${certificateHash.slice(0, 12)}…`);

  const verify = await fetch(`${base}/academy/dogrula/${certificateHash}`);
  const verifyHtml = await verify.text();
  if (verify.status >= 400) {
    fail(`Doğrulama sayfası HTTP ${verify.status}`);
  }
  if (!verifyHtml.includes("Mühür geçerli") || !verifyHtml.includes(certificateHash)) {
    fail("Doğrulama sayfası mühür/hash taşımıyor.");
  }
  console.log(`→ /academy/dogrula/${certificateHash.slice(0, 12)}… Mühür geçerli`);
  console.log("ops:t3-academy-loop OK — nakit CREDIT + rail-temel + SHA256 doğrulandı.");
}

void main().catch((error: unknown) => {
  fail(error instanceof Error ? error.message : String(error));
});
