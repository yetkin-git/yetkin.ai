import { describe, expect, it } from "vitest";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { isAdultInTurkey, evaluateJuniorAge } from "@/lib/junior/age-gate";
import {
  grantJuniorAllowance,
  setJuniorWeeklyCap,
  upsertJuniorProfile,
  buildJuniorPulse,
} from "@/lib/junior/engine";
import { JUNIOR_PRODUCTION_LOCKED_ERROR } from "@/lib/kernel/compliance/circuit-breakers";
import { JUNIOR_HAPPY_PATH } from "@/lib/junior";
import { createMemoryLedgerStore } from "../helpers/memory-money";
import { createMemoryJuniorStore } from "../helpers/memory-junior";
import { completeJuniorGuardianship } from "../helpers/junior-bond";

const CHILD = "child-1";
const GUARDIAN = "guardian-1";
const PLATFORM = PLATFORM_TREASURY_USER_ID;
const NOW = new Date("2026-08-14T00:00:00.000Z");

describe("Junior TR yaş kapısı ve harçlık", () => {
  it("mutlu yol yaş kapısı → vekâlet → harçlıktır", () => {
    expect(JUNIOR_HAPPY_PATH).toEqual(["age-gate", "guardian-consent", "allowance"]);
  });

  it("18. yaş günü yetişkin, bir gün öncesi çocuk sayılır", () => {
    expect(isAdultInTurkey("2008-08-14", NOW)).toBe(true);
    expect(isAdultInTurkey("2008-08-15", NOW)).toBe(false);
    expect(evaluateJuniorAge("2012-03-21", NOW).isEligibleMinor).toBe(true);
    expect(evaluateJuniorAge("2018-01-01", NOW).isEligibleMinor).toBe(false);
  });

  it("geçersiz doğum tarihini reddeder", () => {
    expect(() => isAdultInTurkey("14.08.2008", NOW)).toThrow(/Geçersiz doğum tarihi/);
    expect(() => isAdultInTurkey("2026-02-31", NOW)).toThrow(/Geçersiz doğum tarihi/);
  });

  it("18+ ve 10 yaş altı profil açamaz", async () => {
    const junior = createMemoryJuniorStore();
    await expect(
      upsertJuniorProfile({ junior }, { userId: CHILD, dateOfBirth: "2000-01-01", now: NOW }),
    ).rejects.toThrow(/18 yaş altı/);
    await expect(
      upsertJuniorProfile({ junior }, { userId: CHILD, dateOfBirth: "2018-08-14", now: NOW }),
    ).rejects.toThrow(/10 yaş/);
  });

  it("onay öncesi harçlık yazılmaz; iki taraflı davet sonrası tavan ve aktarım çalışır", async () => {
    const junior = createMemoryJuniorStore();
    const ledger = createMemoryLedgerStore([
      { userId: GUARDIAN, amountMinor: 100_000 },
      { userId: CHILD, amountMinor: 5_000 },
      { userId: PLATFORM, amountMinor: 0 },
    ]);
    const ports = { junior, ledger };

    const created = await upsertJuniorProfile(ports, {
      userId: CHILD,
      dateOfBirth: "2014-01-01",
      now: NOW,
    });
    expect(created.applied).toBe(true);
    expect(created.profile.status).toBe("PENDING_GUARDIAN");
    expect(created.profile.guardianUserId).toBeNull();
    expect(created.profile.mebTrackKey).toBe("meb-ortaokul-beceri");

    const again = await upsertJuniorProfile(ports, {
      userId: CHILD,
      dateOfBirth: "2014-01-01",
      now: NOW,
    });
    expect(again.applied).toBe(false);

    await expect(
      setJuniorWeeklyCap(ports, {
        guardianUserId: GUARDIAN,
        childUserId: CHILD,
        weeklyCapMinor: 5_000,
        now: NOW,
      }),
    ).rejects.toThrow(JUNIOR_PRODUCTION_LOCKED_ERROR);

    const linked = await completeJuniorGuardianship(ports, {
      childUserId: CHILD,
      guardianUserId: GUARDIAN,
      dateOfBirth: "2014-01-01",
      now: NOW,
    });
    expect(linked.applied).toBe(true);
    expect(linked.profile.status).toBe("GUARDIAN_LINKED");
    expect(linked.profile.guardianUserId).toBe(GUARDIAN);

    await expect(
      setJuniorWeeklyCap(ports, {
        guardianUserId: GUARDIAN,
        childUserId: CHILD,
        weeklyCapMinor: 5_000,
        now: NOW,
      }),
    ).rejects.toThrow(JUNIOR_PRODUCTION_LOCKED_ERROR);

    await expect(
      grantJuniorAllowance(ports, {
        guardianUserId: GUARDIAN,
        childUserId: CHILD,
        amountMinor: 1_000,
        platformUserId: PLATFORM,
        now: NOW,
      }),
    ).rejects.toThrow(JUNIOR_PRODUCTION_LOCKED_ERROR);
    expect(ledger.snapshot(GUARDIAN).amountMinor).toBe(100_000);
    expect(ledger.snapshot(PLATFORM).amountMinor).toBe(0);
    expect(ledger.snapshot(CHILD).amountMinor).toBe(5_000);

    const pulse = await buildJuniorPulse(ports, GUARDIAN, NOW);
    expect(pulse.wardsLinked).toBe(1);
    const childPulse = await buildJuniorPulse(ports, CHILD, NOW);
    expect(childPulse.hasGuardianConsent).toBe(true);
    expect(childPulse.bondStatus).toBe("ACTIVE");
    expect(childPulse.remainingMinor).toBe(0);
  });
});
