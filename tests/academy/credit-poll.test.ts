import { describe, expect, it } from "vitest";
import {
  ACADEMY_CREDIT_POLL_GAPS_MS,
  ACADEMY_CREDIT_POLL_WINDOW_MS,
  pollWalletCredit,
} from "@/lib/academy/credit-poll";

describe("Akademi CREDIT yoklaması (K2 kademeli)", () => {
  it("kademeli aralıklarla bakiye yetince true döner", async () => {
    const reads = [100, 100, 890];
    const waits: number[] = [];
    const funded = await pollWalletCredit({
      requiredMinor: 890,
      readBalance: async () => ({ live: true, amountMinor: reads.shift() ?? 0 }),
      wait: async (ms) => {
        waits.push(ms);
      },
    });
    expect(funded).toBe(true);
    // İlk iki kademeli aralık: 500 ms, 1000 ms (eski sabit 3×1sn değil).
    expect(waits).toEqual([500, 1_000]);
  });

  it("pencere ~10 saniyedir ve yoklama başarısızlığı sahte true üretmez", async () => {
    const waits: number[] = [];
    const phases: string[] = [];
    const funded = await pollWalletCredit({
      requiredMinor: 890,
      readBalance: async () => ({ live: true, amountMinor: 0 }),
      wait: async (ms) => {
        waits.push(ms);
      },
      onPhase: (phase) => phases.push(phase),
    });
    expect(funded).toBe(false);
    expect(waits.reduce((a, b) => a + b, 0)).toBe(ACADEMY_CREDIT_POLL_WINDOW_MS);
    expect(waits).toEqual([...ACADEMY_CREDIT_POLL_GAPS_MS]);
    expect(phases.at(-1)).toBe("pending");
  });

  it("özel gapMs verilirse eski çağıranlar kırılmaz", async () => {
    const waits: number[] = [];
    const funded = await pollWalletCredit({
      requiredMinor: 890,
      readBalance: async () => ({ live: true, amountMinor: 0 }),
      wait: async (ms) => {
        waits.push(ms);
      },
      attempts: 3,
      gapMs: 1_000,
    });
    expect(funded).toBe(false);
    expect(waits).toEqual([1_000, 1_000]);
  });
});
