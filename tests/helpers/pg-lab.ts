import { randomUUID } from "node:crypto";
import { Client } from "pg";
import { ensurePrismaQueryEngine, getPrisma } from "@/lib/kernel/db";
import { LEDGER_EXTERNAL_CREDIT_PURPOSE } from "@/lib/kernel/ledger/credit-purposes";
import { appendLedgerEntry } from "@/lib/kernel/ledger/engine";
import { bindLedgerStore } from "@/lib/kernel/ledger/prisma-store";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { toPositiveAmountMinor } from "@/lib/kernel/money/amount-minor";
import {
  LAB_POSTGRES_DEFAULT_URL,
  isLabLoopbackUrl,
  withPgLibpqSslCompat,
} from "../../scripts/ops-migrate-lib";

function bindLabEnv(): string {
  if (process.env.RAIL_PG_INTEGRATION !== "1") {
    throw new Error(
      "RAIL_PG_INTEGRATION=1 değil. test:pg hosted DIRECT_URL'e vurmaz. npm run verify:pg-lab",
    );
  }
  const candidate = (
    process.env.DIRECT_URL?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    LAB_POSTGRES_DEFAULT_URL
  ).trim();
  const url = isLabLoopbackUrl(candidate) ? candidate : LAB_POSTGRES_DEFAULT_URL;
  if (!isLabLoopbackUrl(url)) {
    throw new Error("test:pg yalnız loopback lab Postgres.");
  }
  process.env.DATABASE_URL = url;
  process.env.DIRECT_URL = url;
  return url;
}

export const PG_LAB_URL = bindLabEnv();

export async function warmLabPrisma(): Promise<void> {
  const ready = await ensurePrismaQueryEngine();
  if (!ready) {
    throw new Error("lab prisma warmup failed");
  }
}

export function labUserId(label: string): string {
  return randomUUID();
}

export async function withLabPg<T>(work: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({ connectionString: withPgLibpqSslCompat(PG_LAB_URL) });
  await client.connect();
  try {
    return await work(client);
  } finally {
    await client.end();
  }
}

export function labPrisma() {
  return getPrisma();
}

export async function insertLabCitizen(input: { id: string; email: string }): Promise<void> {
  await warmLabPrisma();
  const prisma = labPrisma();
  await prisma.user.create({
    data: {
      id: input.id,
      email: input.email,
      locale: "tr-TR",
      timeZone: "Europe/Istanbul",
    },
  });
}

export async function creditLabWallet(input: {
  userId: string;
  amountMinor: number;
  purpose: string;
}): Promise<void> {
  const prisma = labPrisma();
  await prisma.$transaction(async (tx) => {
    await appendLedgerEntry(bindLedgerStore(tx), {
      userId: input.userId,
      currencyCode: SETTLEMENT_CURRENCY,
      amountMinor: toPositiveAmountMinor(input.amountMinor),
      direction: "CREDIT",
      label: "lab opening",
      purpose: LEDGER_EXTERNAL_CREDIT_PURPOSE,
      idempotencyKey: `lab-open:${input.purpose}:${input.userId}`,
    });
  });
}

export async function labWalletMinor(userId: string): Promise<number> {
  const wallet = await labPrisma().wallet.findUnique({
    where: { userId_currencyCode: { userId, currencyCode: SETTLEMENT_CURRENCY } },
  });
  return wallet?.amountMinor ?? 0;
}

export function pgConstraint(error: unknown): { code?: string; constraint?: string; message: string } {
  let code: string | undefined;
  let constraint: string | undefined;
  const walk = (value: unknown, depth: number) => {
    if (depth > 6 || !value || typeof value !== "object") {
      return;
    }
    const record = value as Record<string, unknown>;
    if (typeof record.code === "string" && /^\d{5}$/.test(record.code)) {
      code = record.code;
    }
    if (typeof record.constraint === "string") {
      constraint = record.constraint;
    }
    walk(record.cause, depth + 1);
    walk(record.meta, depth + 1);
  };
  walk(error, 0);
  const message = error instanceof Error ? error.message : String(error);
  if (!constraint) {
    const named = message.match(
      /\b(escrow_holds_[a-z_]+|wallets_amount_minor_non_negative|ledger_entries_amount_minor_positive|http_idempotency_records_user_id_route_key_key)\b/,
    );
    if (named) {
      constraint = named[1];
    }
  }
  return { code, constraint, message };
}
