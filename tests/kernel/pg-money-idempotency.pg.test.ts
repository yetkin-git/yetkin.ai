import { describe, expect, it } from "vitest";
import { createEscrowHold } from "@/lib/kernel/escrow";
import { bindEscrowStore } from "@/lib/kernel/escrow/prisma-store";
import {
  hashIdempotencyPayload,
  settleHttpIdempotency,
} from "@/lib/kernel/http/idempotency";
import { createClientIdempotencyKey } from "@/lib/kernel/http/idempotency-key";
import { createPrismaHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";
import { appendLedgerEntry } from "@/lib/kernel/ledger/engine";
import { bindLedgerStore } from "@/lib/kernel/ledger/prisma-store";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { toPositiveAmountMinor } from "@/lib/kernel/money/amount-minor";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import {
  creditLabWallet,
  insertLabCitizen,
  labPrisma,
  labUserId,
  labWalletMinor,
} from "../helpers/pg-lab";

describe("Postgres eşzamanlılık ve Money UoW rollback", () => {
  it("aynı Idempotency-Key eşzamanlı begin'de unique index ikinci execute'u keser", async () => {
    const userId = labUserId("idem");
    await insertLabCitizen({ id: userId, email: `idem-${userId}@lab.rail` });
    const store = createPrismaHttpIdempotencyStore();
    const key = createClientIdempotencyKey();
    const input = {
      store,
      userId,
      route: "/api/freelancer/jobs/[id]/accept",
      key,
      requestHash: hashIdempotencyPayload({ bidId: "lab" }),
      requestId: createClientIdempotencyKey(),
    };
    let runs = 0;
    const results = await Promise.all(
      [0, 1].map(() =>
        settleHttpIdempotency(input, async () => {
          runs += 1;
          await new Promise((resolve) => setTimeout(resolve, 40));
          return { status: 200, body: { marker: "once" } };
        }),
      ),
    );
    expect(runs).toBe(1);
    const statuses = results.map((row) => row.status).sort();
    expect(statuses[0]).toBe(200);
    expect(statuses[1] === 200 || statuses[1] === 409).toBe(true);
    const bodies = await Promise.all(results.map((row) => row.json() as Promise<Record<string, unknown>>));
    if (statuses[1] === 200) {
      expect(bodies[0]).toMatchObject({ ok: true, data: { marker: "once" } });
      expect(bodies[1]).toMatchObject({ ok: true, data: { marker: "once" } });
    } else {
      const okBody = bodies.find((body) => body.ok === true);
      const failBody = bodies.find((body) => body.ok === false);
      expect(okBody).toMatchObject({ data: { marker: "once" } });
      expect(failBody?.error).toMatch(/Idempotency-Key/);
    }
    const rows = await labPrisma().httpIdempotencyRecord.findMany({
      where: { userId, route: input.route, key },
    });
    expect(rows).toHaveLength(1);
    expect(rows[0]?.status).toBe("completed");
  });

  it("started slot varken aynı anahtar in_progress 409 basar; execute bir kez", async () => {
    const userId = labUserId("idem-gate");
    await insertLabCitizen({ id: userId, email: `idem-gate-${userId}@lab.rail` });
    const store = createPrismaHttpIdempotencyStore();
    const key = createClientIdempotencyKey();
    const input = {
      store,
      userId,
      route: "/api/academy/courses/[id]/purchase",
      key,
      requestHash: hashIdempotencyPayload({ courseId: "ac_rail_temel" }),
      requestId: createClientIdempotencyKey(),
    };
    let runs = 0;
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    let startedResolve!: () => void;
    const started = new Promise<void>((resolve) => {
      startedResolve = resolve;
    });
    const first = settleHttpIdempotency(input, async () => {
      runs += 1;
      startedResolve();
      await gate;
      return { status: 200, body: { applied: true } };
    });
    await started;
    const second = await settleHttpIdempotency(input, async () => {
      runs += 1;
      return { status: 200, body: { applied: false } };
    });
    expect(second.status).toBe(409);
    expect(runs).toBe(1);
    release();
    const firstResponse = await first;
    expect(firstResponse.status).toBe(200);
    expect(runs).toBe(1);
  });

  it("Money UoW yarıda kalınca hold ve debit yoktur — prisma.$transaction rollback", async () => {
    const userId = labUserId("uow");
    await insertLabCitizen({ id: userId, email: `uow-${userId}@lab.rail` });
    await creditLabWallet({ userId, amountMinor: 80_000, purpose: "uow-open" });
    const prisma = labPrisma();
    const referenceKey = `lab-uow:${userId}`;

    await expect(
      prisma.$transaction(async (tx) => {
        const ledger = bindLedgerStore(tx);
        const escrow = bindEscrowStore(tx);
        await createEscrowHold(
          { ledger, escrow },
          {
            userId,
            referenceKey,
            grossMinor: 10_000,
            holdBps: HOLD_BPS_DEFAULT,
            currencyCode: SETTLEMENT_CURRENCY,
            funding: "psp",
          },
        );
        throw new Error("pg-lab-rollback");
      }),
    ).rejects.toThrow("pg-lab-rollback");

    expect(await labWalletMinor(userId)).toBe(80_000);
    expect(await prisma.escrowHold.findUnique({ where: { referenceKey } })).toBeNull();
    expect(
      await prisma.ledgerEntry.findUnique({
        where: { idempotencyKey: `escrow-hold:${referenceKey}` },
      }),
    ).toBeNull();
  });

  it("UoW commit sonrası debit kalır; ikinci aynı hold idempotenttir", async () => {
    const userId = labUserId("uow-ok");
    await insertLabCitizen({ id: userId, email: `uow-ok-${userId}@lab.rail` });
    await creditLabWallet({ userId, amountMinor: 80_000, purpose: "uow-ok" });
    const prisma = labPrisma();
    const referenceKey = `lab-uow-ok:${userId}`;

    await prisma.$transaction(async (tx) => {
      await createEscrowHold(
        { ledger: bindLedgerStore(tx), escrow: bindEscrowStore(tx) },
        {
          userId,
          referenceKey,
          grossMinor: 10_000,
          holdBps: HOLD_BPS_DEFAULT,
          currencyCode: SETTLEMENT_CURRENCY,
          funding: "psp",
        },
      );
    });
    expect(await labWalletMinor(userId)).toBe(80_000);
    const hold = await prisma.escrowHold.findUniqueOrThrow({ where: { referenceKey } });
    expect(hold.walletId).toBeNull();
    expect(hold.pspPaymentId).toBe(referenceKey);
    expect(hold.grossMinor).toBe(10_000);
    expect(hold.holdMinor + hold.netMinor).toBe(hold.grossMinor);

    await prisma.$transaction(async (tx) => {
      const again = await createEscrowHold(
        { ledger: bindLedgerStore(tx), escrow: bindEscrowStore(tx) },
        {
          userId,
          referenceKey,
          grossMinor: 10_000,
          holdBps: HOLD_BPS_DEFAULT,
          currencyCode: SETTLEMENT_CURRENCY,
          funding: "psp",
        },
      );
      expect(again.applied).toBe(false);
    });
    expect(await labWalletMinor(userId)).toBe(80_000);
  });

  it("paralel farklı ledger anahtarları bakiyeyi CAS ile korur", async () => {
    const userId = labUserId("cas");
    await insertLabCitizen({ id: userId, email: `cas-${userId}@lab.rail` });
    await creditLabWallet({ userId, amountMinor: 20_000, purpose: "cas-open" });
    const prisma = labPrisma();
    const parallel = 10;
    const debitMinor = 1_000;
    await Promise.all(
      Array.from({ length: parallel }, (_, index) =>
        prisma.$transaction((tx) =>
          appendLedgerEntry(bindLedgerStore(tx), {
            userId,
            currencyCode: SETTLEMENT_CURRENCY,
            amountMinor: toPositiveAmountMinor(debitMinor),
            direction: "DEBIT",
            label: `cas ${index}`,
            purpose: "cas-debit",
            idempotencyKey: `lab-cas:${userId}:${index}`,
          }),
        ),
      ),
    );
    expect(await labWalletMinor(userId)).toBe(20_000 - parallel * debitMinor);
    expect(await prisma.ledgerEntry.count({ where: { userId, purpose: "cas-debit" } })).toBe(
      parallel,
    );
  });
});
