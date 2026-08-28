import { describe, expect, it } from "vitest";
import { appendLedgerEntry } from "@/lib/kernel/ledger/engine";
import {
  EscrowWalletFundedHoldError,
  ESCROW_WALLET_FUNDED_HOLD_FORBIDDEN,
  PLATFORM_TREASURY_USER_ID,
  createEscrowHold,
  refundEscrowHold,
  releaseEscrowHold,
} from "@/lib/kernel/escrow/engine";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import {
  createMemoryEscrowStore,
  createMemoryLedgerStore,
  withMemoryAcceptAtomic,
} from "../helpers/memory-money";

const CLIENT = "ghost-client-1";
const PAYEE = "ghost-payee-1";
const PLATFORM = PLATFORM_TREASURY_USER_ID;

function world() {
  return withMemoryAcceptAtomic({
    ledger: createMemoryLedgerStore([
      { userId: CLIENT, amountMinor: 100_000 },
      { userId: PAYEE, amountMinor: 0 },
      { userId: PLATFORM, amountMinor: 0 },
    ]),
    escrow: createMemoryEscrowStore(),
  });
}

async function seedWalletFundedHold(
  ports: ReturnType<typeof world>,
  input: { referenceKey: string; walletId: string | null; withDebit: boolean },
) {
  const hold = await ports.escrow.insertHold({
    id: `hold-${input.referenceKey}`,
    walletId: input.walletId,
    pspPaymentId: null,
    userId: CLIENT,
    referenceKey: input.referenceKey,
    currencyCode: SETTLEMENT_CURRENCY,
    grossMinor: 10_000,
    holdMinor: 1_000,
    netMinor: 9_000,
    holdBps: HOLD_BPS_DEFAULT,
    expiresAt: new Date("2026-09-01T00:00:00.000Z"),
  });
  if (input.withDebit) {
    await appendLedgerEntry(ports.ledger, {
      userId: CLIENT,
      currencyCode: SETTLEMENT_CURRENCY,
      amountMinor: 10_000,
      direction: "DEBIT",
      label: "Eski cüzdan emanet DEBIT",
      purpose: "escrow-hold",
      idempotencyKey: `escrow-hold:${input.referenceKey}`,
    });
  }
  return hold;
}

describe("emanet cüzdan-DEBIT hayaleti fail-closed", () => {
  it("PENDING walletId hold serbest bırakılmaz; status PENDING kalır", async () => {
    const ports = world();
    const hold = await seedWalletFundedHold(ports, {
      referenceKey: "ghost-wallet-id",
      walletId: "wallet-legacy",
      withDebit: false,
    });
    await expect(
      releaseEscrowHold(ports, {
        referenceKey: hold.referenceKey,
        payeeUserId: PAYEE,
        platformUserId: PLATFORM,
      }),
    ).rejects.toBeInstanceOf(EscrowWalletFundedHoldError);
    const still = await ports.escrow.findById(hold.id);
    expect(still?.status).toBe("PENDING");
    expect(ports.ledger.snapshot(CLIENT).amountMinor).toBe(100_000);
    expect(ports.ledger.snapshot(PAYEE).amountMinor).toBe(0);
  });

  it("eski escrow-hold DEBIT satırı varsa split kapalı olsa bile RELEASED yazılmaz", async () => {
    const ports = world();
    const hold = await seedWalletFundedHold(ports, {
      referenceKey: "ghost-debit-key",
      walletId: null,
      withDebit: true,
    });
    await expect(
      releaseEscrowHold(ports, {
        referenceKey: hold.referenceKey,
        payeeUserId: PAYEE,
        platformUserId: PLATFORM,
      }),
    ).rejects.toThrow(ESCROW_WALLET_FUNDED_HOLD_FORBIDDEN);
    const still = await ports.escrow.findById(hold.id);
    expect(still?.status).toBe("PENDING");
    expect(ports.ledger.snapshot(CLIENT).amountMinor).toBe(90_000);
  });

  it("mevcut wallet-funded hold createEscrowHold ile yeniden geçerli sayılmaz", async () => {
    const ports = world();
    const hold = await seedWalletFundedHold(ports, {
      referenceKey: "ghost-create-existing",
      walletId: "wallet-legacy",
      withDebit: true,
    });
    await expect(
      createEscrowHold(ports, {
        userId: CLIENT,
        referenceKey: hold.referenceKey,
        currencyCode: SETTLEMENT_CURRENCY,
        grossMinor: 10_000,
        holdBps: HOLD_BPS_DEFAULT,
        funding: "psp",
        pspPaymentId: "psp-ignored",
      }),
    ).rejects.toBeInstanceOf(EscrowWalletFundedHoldError);
    const still = await ports.escrow.findById(hold.id);
    expect(still?.status).toBe("PENDING");
  });

  it("cüzdan-fonlu hold iade CREDIT yazmaz ve REFUNDED işaretlemez", async () => {
    const ports = world();
    const hold = await seedWalletFundedHold(ports, {
      referenceKey: "ghost-refund",
      walletId: "wallet-legacy",
      withDebit: true,
    });
    await expect(
      refundEscrowHold(ports, { referenceKey: hold.referenceKey }),
    ).rejects.toBeInstanceOf(EscrowWalletFundedHoldError);
    const still = await ports.escrow.findById(hold.id);
    expect(still?.status).toBe("PENDING");
    expect(ports.ledger.snapshot(CLIENT).amountMinor).toBe(90_000);
    expect(await ports.ledger.findByIdempotencyKey(`escrow-refund:${hold.id}`)).toBeNull();
  });
});
