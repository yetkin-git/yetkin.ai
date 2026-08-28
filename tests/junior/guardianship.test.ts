import { describe, expect, it } from "vitest";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import {
  acceptGuardianInvite,
  createGuardianInvite,
  grantJuniorAllowance,
  JUNIOR_INVITE_INVALID,
  JUNIOR_BOND_PENDING,
  setJuniorWeeklyCap,
  upsertJuniorProfile,
} from "@/lib/junior/engine";
import { JUNIOR_PRODUCTION_LOCKED_ERROR } from "@/lib/kernel/compliance/circuit-breakers";
import {
  JUNIOR_GUARDIAN_INVITE_TTL_MS,
  hashGuardianInviteToken,
} from "@/lib/junior/invite-token";
import {
  projectGuardianWard,
  projectOwnJuniorProfile,
  projectPendingInvite,
} from "@/lib/junior/project";
import {
  acceptGuardianInviteInputSchema,
  upsertJuniorProfileInputSchema,
} from "@/lib/junior/schemas";
import { createMemoryLedgerStore } from "../helpers/memory-money";
import { createMemoryJuniorStore } from "../helpers/memory-junior";

const CHILD = "child-g1";
const GUARDIAN = "guardian-g1";
const VICTIM = "victim-stranger";
const PLATFORM = PLATFORM_TREASURY_USER_ID;
const NOW = new Date("2026-08-19T00:00:00.000Z");
const DOB = "2014-01-01";

describe("Junior vekâlet davet protokolü", () => {
  it("serbest guardianUserId gövdesini şemada reddeder ve profile yazmaz", async () => {
    expect(
      upsertJuniorProfileInputSchema.safeParse({
        dateOfBirth: DOB,
        guardianUserId: VICTIM,
      }).success,
    ).toBe(false);

    const junior = createMemoryJuniorStore();
    const created = await upsertJuniorProfile(
      { junior },
      {
        userId: CHILD,
        dateOfBirth: DOB,
        now: NOW,
        guardianUserId: VICTIM,
      } as never,
    );
    expect(created.profile.guardianUserId).toBeNull();
    expect(created.profile.status).toBe("PENDING_GUARDIAN");
    expect(created.profile.guardianConsentAt).toBeNull();

    const view = projectOwnJuniorProfile(created.profile);
    expect(view.bondStatus).toBe("PENDING");
    expect(view.guardianUserIdMasked).toBeNull();
    expect(view.mebTrackKey).toBeNull();
    expect(projectGuardianWard(created.profile)).toBeNull();

    await expect(
      setJuniorWeeklyCap(
        { junior },
        { guardianUserId: VICTIM, childUserId: CHILD, weeklyCapMinor: 1_000, now: NOW },
      ),
    ).rejects.toThrow(JUNIOR_PRODUCTION_LOCKED_ERROR);
  });

  it("geçersiz veya süresi dolmuş token ile bağ kurulamaz", async () => {
    const junior = createMemoryJuniorStore();
    const ports = { junior };
    await upsertJuniorProfile(ports, { userId: CHILD, dateOfBirth: DOB, now: NOW });
    const created = await createGuardianInvite(ports, { actorUserId: CHILD, now: NOW });
    expect(created.invite.tokenHash).toBe(hashGuardianInviteToken(created.plaintext));
    expect(created.invite.tokenHash).not.toBe(created.plaintext);
    expect(created.invite.tokenHash).toHaveLength(64);

    const bogus = "yrg_" + "a".repeat(40);
    await expect(
      acceptGuardianInvite(ports, { actorUserId: GUARDIAN, token: bogus, now: NOW }),
    ).rejects.toThrow(JUNIOR_INVITE_INVALID);

    await expect(
      acceptGuardianInvite(ports, {
        actorUserId: GUARDIAN,
        token: created.plaintext,
        now: new Date(NOW.getTime() + JUNIOR_GUARDIAN_INVITE_TTL_MS + 1),
      }),
    ).rejects.toThrow(JUNIOR_INVITE_INVALID);

    await expect(
      acceptGuardianInvite(ports, { actorUserId: CHILD, token: created.plaintext, now: NOW }),
    ).rejects.toThrow(/kendi token/);
  });

  it("iki taraflı onay tamamlanmadan harçlık akışı gerçekleşmez", async () => {
    const junior = createMemoryJuniorStore();
    const ledger = createMemoryLedgerStore([
      { userId: GUARDIAN, amountMinor: 50_000 },
      { userId: CHILD, amountMinor: 0 },
      { userId: PLATFORM, amountMinor: 0 },
    ]);
    const ports = { junior, ledger };

    await upsertJuniorProfile(ports, { userId: CHILD, dateOfBirth: DOB, now: NOW });
    const created = await createGuardianInvite(ports, { actorUserId: CHILD, now: NOW });
    const pendingView = projectPendingInvite(created.invite, NOW);
    expect(pendingView?.status).toBe("PENDING");
    expect(pendingView).not.toHaveProperty("tokenHash");
    expect(JSON.stringify(pendingView)).not.toContain(created.plaintext);

    await expect(
      grantJuniorAllowance(ports, {
        guardianUserId: GUARDIAN,
        childUserId: CHILD,
        amountMinor: 500,
        platformUserId: PLATFORM,
        now: NOW,
      }),
    ).rejects.toThrow(JUNIOR_PRODUCTION_LOCKED_ERROR);
    expect(ledger.snapshot(GUARDIAN).amountMinor).toBe(50_000);
    expect(JUNIOR_BOND_PENDING).toContain("Ebeveyn onayı");

    const linked = await acceptGuardianInvite(ports, {
      actorUserId: GUARDIAN,
      token: created.plaintext,
      now: NOW,
    });
    expect(linked.profile.status).toBe("GUARDIAN_LINKED");
    expect(linked.profile.guardianUserId).toBe(GUARDIAN);
    expect(projectOwnJuniorProfile(linked.profile).bondStatus).toBe("ACTIVE");
    const ward = projectGuardianWard(linked.profile);
    expect(ward?.bondStatus).toBe("ACTIVE");
    expect(ward?.dateOfBirthMasked).toBe("2014-••-••");
    expect(ward?.childUserIdMasked).toMatch(/^••••/);

    await expect(
      acceptGuardianInvite(ports, { actorUserId: GUARDIAN, token: created.plaintext, now: NOW }),
    ).rejects.toThrow(JUNIOR_INVITE_INVALID);

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
        amountMinor: 800,
        platformUserId: PLATFORM,
        now: NOW,
      }),
    ).rejects.toThrow(JUNIOR_PRODUCTION_LOCKED_ERROR);
    expect(ledger.snapshot(GUARDIAN).amountMinor).toBe(50_000);
  });

  it("ebeveyn başlatmalı daveti çocuk oturumuyla bağlar", async () => {
    const junior = createMemoryJuniorStore();
    const ports = { junior };
    await upsertJuniorProfile(ports, { userId: CHILD, dateOfBirth: DOB, now: NOW });
    const created = await createGuardianInvite(ports, { actorUserId: GUARDIAN, now: NOW });
    expect(created.invite.initiatorRole).toBe("GUARDIAN");
    expect(created.invite.guardianApprovedAt).not.toBeNull();
    expect(created.invite.childApprovedAt).toBeNull();

    const linked = await acceptGuardianInvite(ports, {
      actorUserId: CHILD,
      token: created.plaintext,
      now: NOW,
    });
    expect(linked.profile.guardianUserId).toBe(GUARDIAN);
    expect(linked.profile.status).toBe("GUARDIAN_LINKED");
  });

  it("kabul şeması childUserId ile bağ kurmaz", () => {
    expect(acceptGuardianInviteInputSchema.safeParse({ childUserId: CHILD }).success).toBe(false);
    expect(acceptGuardianInviteInputSchema.safeParse({ token: "yrg_" + "b".repeat(40) }).success).toBe(
      true,
    );
  });

  it("Junior profili olan hesap ebeveyn vekâleti olamaz", async () => {
    const junior = createMemoryJuniorStore();
    const ports = { junior };
    const otherChild = "child-g2";
    await upsertJuniorProfile(ports, { userId: CHILD, dateOfBirth: DOB, now: NOW });
    await upsertJuniorProfile(ports, { userId: otherChild, dateOfBirth: "2013-06-01", now: NOW });
    const created = await createGuardianInvite(ports, { actorUserId: CHILD, now: NOW });
    await expect(
      acceptGuardianInvite(ports, { actorUserId: otherChild, token: created.plaintext, now: NOW }),
    ).rejects.toThrow(/Junior profili ebeveyn vekâleti olamaz/);
    const still = await junior.getProfileByUserId(CHILD);
    expect(still?.guardianUserId).toBeNull();
    expect(still?.status).toBe("PENDING_GUARDIAN");
  });

  it("tek taraflı onay damgası olmadan bağ ACTIVE olmaz", async () => {
    const junior = createMemoryJuniorStore();
    const ports = { junior };
    await upsertJuniorProfile(ports, { userId: CHILD, dateOfBirth: DOB, now: NOW });
    const created = await createGuardianInvite(ports, { actorUserId: CHILD, now: NOW });
    await junior.updateInvite(created.invite.id, { childApprovedAt: null, updatedAt: NOW });
    await expect(
      acceptGuardianInvite(ports, { actorUserId: GUARDIAN, token: created.plaintext, now: NOW }),
    ).rejects.toThrow(/her iki tarafın açık onayı/);
    const still = await junior.getProfileByUserId(CHILD);
    expect(still?.status).toBe("PENDING_GUARDIAN");
    expect(projectOwnJuniorProfile(still!).bondStatus).toBe("PENDING");
    expect(projectOwnJuniorProfile(still!).dateOfBirthMasked).toBe("2014-••-••");
  });

  it("tüketilmiş token ikinci kabulde yarışı kaybeder", async () => {
    const junior = createMemoryJuniorStore();
    const ports = { junior };
    await upsertJuniorProfile(ports, { userId: CHILD, dateOfBirth: DOB, now: NOW });
    const created = await createGuardianInvite(ports, { actorUserId: CHILD, now: NOW });
    const claimed = await junior.consumePendingInvite(created.invite.id, NOW, {
      juniorProfileId: created.invite.juniorProfileId,
      counterpartUserId: GUARDIAN,
      childApprovedAt: NOW,
      guardianApprovedAt: NOW,
      consumedAt: NOW,
      updatedAt: NOW,
    });
    expect(claimed?.status).toBe("CONSUMED");
    await expect(
      acceptGuardianInvite(ports, { actorUserId: GUARDIAN, token: created.plaintext, now: NOW }),
    ).rejects.toThrow(JUNIOR_INVITE_INVALID);
  });
});
