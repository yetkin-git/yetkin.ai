import { describe, expect, it } from "vitest";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { isAdultInTurkey, evaluateJuniorAge } from "@/lib/junior/age-gate";
import {
  consentJuniorProfile,
  grantJuniorAllowance,
  setJuniorWeeklyCap,
  upsertJuniorProfile,
  buildJuniorPulse,
} from "@/lib/junior/engine";
import { JUNIOR_HAPPY_PATH } from "@/lib/junior";
import { createMemoryLedgerStore } from "../helpers/memory-money";
import { createMemoryJuniorStore } from "../helpers/memory-junior";

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

  it("18+ ve 10 yaş altı profil açamaz; kendi vekâleti yasaktır", async () => {
    const junior = createMemoryJuniorStore();
    await expect(
      upsertJuniorProfile(
        { junior },
        { userId: CHILD, dateOfBirth: "2000-01-01", guardianUserId: GUARDIAN, now: NOW },
      ),
    ).rejects.toThrow(/18 yaş altı/);
    await expect(
      upsertJuniorProfile(
        { junior },
        { userId: CHILD, dateOfBirth: "2018-08-14", guardianUserId: GUARDIAN, now: NOW },
      ),
    ).rejects.toThrow(/10 yaş/);
    await expect(
      upsertJuniorProfile(
        { junior },
        { userId: CHILD, dateOfBirth: "2012-03-21", guardianUserId: CHILD, now: NOW },
      ),
    ).rejects.toThrow(/kendi hesabına/);
  });

  it("onay öncesi harçlık yazılmaz; onay sonrası tavan ve aktarım çalışır", async () => {
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
      guardianUserId: GUARDIAN,
      now: NOW,
    });
    expect(created.applied).toBe(true);
    expect(created.profile.status).toBe("PENDING_GUARDIAN");
    expect(created.profile.mebTrackKey).toBe("meb-ortaokul-beceri");

    const again = await upsertJuniorProfile(ports, {
      userId: CHILD,
      dateOfBirth: "2014-01-01",
      guardianUserId: GUARDIAN,
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
    ).rejects.toThrow(/Ebeveyn onayı/);

    const consent = await consentJuniorProfile(ports, {
      guardianUserId: GUARDIAN,
      childUserId: CHILD,
      now: NOW,
    });
    expect(consent.applied).toBe(true);
    expect(consent.profile.status).toBe("GUARDIAN_LINKED");
    const consentAgain = await consentJuniorProfile(ports, {
      guardianUserId: GUARDIAN,
      childUserId: CHILD,
      now: NOW,
    });
    expect(consentAgain.applied).toBe(false);

    const cap = await setJuniorWeeklyCap(ports, {
      guardianUserId: GUARDIAN,
      childUserId: CHILD,
      weeklyCapMinor: 5_000,
      now: NOW,
    });
    expect(cap.amountMinor).toBe(0);

    const granted = await grantJuniorAllowance(ports, {
      guardianUserId: GUARDIAN,
      childUserId: CHILD,
      amountMinor: 1_000,
      platformUserId: PLATFORM,
      now: NOW,
    });
    expect(granted.applied).toBe(true);
    expect(granted.allowance.amountMinor).toBe(1_000);
    expect(ledger.snapshot(GUARDIAN).amountMinor).toBe(99_000);
    expect(ledger.snapshot(PLATFORM).amountMinor).toBe(1_000);
    expect(ledger.snapshot(CHILD).amountMinor).toBe(5_000);

    await expect(
      grantJuniorAllowance(ports, {
        guardianUserId: GUARDIAN,
        childUserId: CHILD,
        amountMinor: 4_500,
        platformUserId: PLATFORM,
        now: NOW,
      }),
    ).rejects.toThrow(/haftalık tavan/);
    expect(ledger.snapshot(CHILD).amountMinor).toBe(5_000);
    expect(ledger.snapshot(GUARDIAN).amountMinor).toBe(99_000);

    const pulse = await buildJuniorPulse(ports, GUARDIAN, NOW);
    expect(pulse.wardsLinked).toBe(1);
    const childPulse = await buildJuniorPulse(ports, CHILD, NOW);
    expect(childPulse.hasGuardianConsent).toBe(true);
    expect(childPulse.remainingMinor).toBe(1_000);
  });
});
