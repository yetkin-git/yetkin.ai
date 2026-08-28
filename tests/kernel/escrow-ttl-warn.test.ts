import { afterEach, describe, expect, it } from "vitest";
import {
  createEscrowHold,
  ESCROW_HOLD_TTL_MS,
  ESCROW_TTL_WARN_WINDOW_MS,
} from "@/lib/kernel/escrow/engine";
import {
  clearEscrowRefundHooks,
  registerEscrowTtlApproachingHook,
} from "@/lib/kernel/escrow/refund-hooks";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { setCitizenNoticeSink, type CitizenNotice } from "@/lib/kernel/notice";
import {
  applyEscrowTtlApproachingNotice,
  isEscrowTtlApproaching,
  runEscrowTtlApproachingNotices,
} from "@/lib/kernel/jobs/escrow-ttl-warn";
import { createMemoryEscrowStore, createMemoryLedgerStore } from "../helpers/memory-money";

const CLIENT = "client-1";
const PLATFORM = "00000000-0000-4000-8000-000000000001";

function world() {
  const ledger = createMemoryLedgerStore([
    { userId: CLIENT, amountMinor: 50_000 },
    { userId: PLATFORM, amountMinor: 0 },
  ]);
  const escrow = createMemoryEscrowStore();
  return { ledger, escrow };
}

describe("emanet TTL yaklaşım bildirimi", () => {
  afterEach(() => {
    clearEscrowRefundHooks();
    setCitizenNoticeSink(null);
  });

  it("48 saat kala yakalar; süresi dolmuş ve dondurulmuş hold'u atlar", async () => {
    const fundedAt = new Date("2026-08-01T00:00:00.000Z");
    const ports = world();
    const approachingAt = new Date(fundedAt.getTime() + ESCROW_HOLD_TTL_MS - ESCROW_TTL_WARN_WINDOW_MS / 2);
    const { hold } = await createEscrowHold(ports, {
      userId: CLIENT,
      referenceKey: "ttl-warn-hold",
      grossMinor: 10_000,
      holdBps: HOLD_BPS_DEFAULT,
      currencyCode: SETTLEMENT_CURRENCY,
      now: fundedAt,
      funding: "psp",
    });
    expect(isEscrowTtlApproaching(hold, approachingAt)).toBe(true);
    expect(isEscrowTtlApproaching(hold, fundedAt)).toBe(false);
    expect(
      isEscrowTtlApproaching(hold, new Date(fundedAt.getTime() + ESCROW_HOLD_TTL_MS)),
    ).toBe(false);

    const seen: CitizenNotice[] = [];
    setCitizenNoticeSink((notice) => seen.push(notice));
    const hooked: string[] = [];
    registerEscrowTtlApproachingHook("freelancer", async (purpose, holdId) => {
      hooked.push(`${purpose}:${holdId}`);
    });

    const tooEarly = await runEscrowTtlApproachingNotices(ports, { now: fundedAt });
    expect(tooEarly.warned).toBe(0);

    const warned = await runEscrowTtlApproachingNotices(ports, { now: approachingAt });
    expect(warned.warned).toBe(1);
    expect(warned.holds[0]?.holdId).toBe(hold.id);
    expect(seen.map((row) => row.kind)).toEqual(["escrow_ttl_approaching"]);
    expect(seen[0]?.userId).toBe(CLIENT);
    expect(hooked).toEqual([`freelancer:${hold.id}`]);

    await ports.escrow.freezeExpiry(hold.id);
    const frozen = await applyEscrowTtlApproachingNotice(ports, hold.id, { now: approachingAt });
    expect(frozen.applied).toBe(false);
  });
});
