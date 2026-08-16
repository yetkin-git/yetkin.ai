import { describe, expect, it } from "vitest";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { REQUIRED_CATALOG_DEFINITIONS } from "@/lib/kernel/pricing/catalog-definitions";
import {
  advanceArenaTenderRound,
  awardArenaTender,
  openArenaTender,
  refundArenaTender,
  submitArenaProposal,
} from "@/lib/arena/engine";
import { ARENA_MODULE_KEY, ARENA_TENDER_FLOOR_UNIT_KEY, ARENA_TRANSPORT } from "@/lib/arena/types";
import { createMemoryEscrowStore, createMemoryLedgerStore } from "../helpers/memory-money";
import { createMemoryPriceCatalogStore } from "../helpers/memory-pricing";
import { createMemoryArenaStore } from "../helpers/memory-arena";

const SPONSOR = "arena-sponsor-1";
const ALICE = "arena-alice";
const BOB = "arena-bob";
const PLATFORM = PLATFORM_TREASURY_USER_ID;

function world(sponsorBalance = 100_000) {
  const definition = REQUIRED_CATALOG_DEFINITIONS.find(
    (row) => row.moduleKey === ARENA_MODULE_KEY && row.unitKey === ARENA_TENDER_FLOOR_UNIT_KEY,
  );
  if (!definition) {
    throw new Error("Arena katalog tanımı yok.");
  }
  const ledger = createMemoryLedgerStore([
    { userId: SPONSOR, amountMinor: sponsorBalance },
    { userId: ALICE, amountMinor: 0 },
    { userId: BOB, amountMinor: 0 },
    { userId: PLATFORM, amountMinor: 0 },
  ]);
  return {
    ledger,
    escrow: createMemoryEscrowStore(),
    catalog: createMemoryPriceCatalogStore([
      {
        moduleKey: definition.moduleKey,
        unitKey: definition.unitKey,
        amountMinor: definition.seedAmountMinor,
        minMinor: definition.seedMinMinor,
        maxMinor: definition.seedMaxMinor,
      },
    ]),
    arena: createMemoryArenaStore(),
  };
}

describe("arena ihale ödül havuzu", () => {
  it("HTTP+Inngest taşır; socket doğmaz", () => {
    expect(ARENA_TRANSPORT).toBe("http+inngest");
  });

  it("ihale → iki teslim → neti kazananlara dağıtır, hold platformda", async () => {
    const ports = world();
    const tender = await openArenaTender(ports, {
      sponsorUserId: SPONSOR,
      title: "Mühürlü çağrı",
      brief: "İki çözüm, net paylaşımı.",
      prizePoolMinor: 20_000,
    });
    expect(tender.status).toBe("OPEN");
    expect(tender.round).toBe("SUBMISSION");
    expect(tender.holdMinor).toBe(2_000);
    expect(tender.netMinor).toBe(18_000);
    expect(ports.ledger.snapshot(SPONSOR).amountMinor).toBe(80_000);

    const alice = await submitArenaProposal(ports, {
      tenderId: tender.id,
      submitterId: ALICE,
      proposal: "Alice çözümü, testli teslim.",
    });
    const bob = await submitArenaProposal(ports, {
      tenderId: tender.id,
      submitterId: BOB,
      proposal: "Bob çözümü, alternatif yaklaşım.",
    });

    const awarded = await awardArenaTender(ports, {
      tenderId: tender.id,
      actorUserId: SPONSOR,
      winners: [
        { submissionId: alice.id, amountMinor: 9_000 },
        { submissionId: bob.id, amountMinor: 9_000 },
      ],
      platformUserId: PLATFORM,
    });

    expect(awarded.tender.status).toBe("AWARDED");
    expect(awarded.tender.round).toBe("CLOSED");
    expect(awarded.awards).toHaveLength(2);
    expect(ports.ledger.snapshot(SPONSOR).amountMinor).toBe(80_000);
    expect(ports.ledger.snapshot(ALICE).amountMinor).toBe(9_000);
    expect(ports.ledger.snapshot(BOB).amountMinor).toBe(9_000);
    expect(ports.ledger.snapshot(PLATFORM).amountMinor).toBe(2_000);

    const hold = await ports.escrow.findById(tender.escrowHoldId);
    expect(hold?.status).toBe("RELEASED");
  });

  it("teslim penceresi bitince Inngest turu EVALUATION'a alır; değerlendirme bitince iade", async () => {
    const now = new Date("2026-08-14T00:00:00.000Z");
    const ports = world();
    const tender = await openArenaTender(ports, {
      sponsorUserId: SPONSOR,
      title: "Zaman aşımı",
      brief: "Tur geçişi HTTP zamanlayıcı ile.",
      prizePoolMinor: 10_000,
      submissionWindowMs: 60_000,
      evaluationWindowMs: 60_000,
      now,
    });

    const afterSubmission = new Date(now.getTime() + 60_001);
    const evaluating = await advanceArenaTenderRound(ports, {
      tenderId: tender.id,
      now: afterSubmission,
    });
    expect(evaluating.status).toBe("EVALUATING");
    expect(evaluating.round).toBe("EVALUATION");
    expect(ports.ledger.snapshot(SPONSOR).amountMinor).toBe(90_000);

    const afterEval = new Date(now.getTime() + 120_001);
    const refunded = await advanceArenaTenderRound(ports, {
      tenderId: tender.id,
      now: afterEval,
    });
    expect(refunded.status).toBe("REFUNDED");
    expect(refunded.round).toBe("CLOSED");
    expect(ports.ledger.snapshot(SPONSOR).amountMinor).toBe(100_000);
  });

  it("sponsor kendi ihalesine teslim edemez; yetersiz bakiyede havuz kilitlenmez", async () => {
    const rich = world();
    const tender = await openArenaTender(rich, {
      sponsorUserId: SPONSOR,
      title: "Kendine teslim yok",
      brief: "Sponsor çözüm gönderemez.",
      prizePoolMinor: 10_000,
    });
    await expect(
      submitArenaProposal(rich, {
        tenderId: tender.id,
        submitterId: SPONSOR,
        proposal: "Kendi çözümüm olamaz.",
      }),
    ).rejects.toThrow();

    const poor = world(500);
    await expect(
      openArenaTender(poor, {
        sponsorUserId: SPONSOR,
        title: "Yetersiz",
        brief: "Bakiye yetmez.",
        prizePoolMinor: 10_000,
      }),
    ).rejects.toThrow();
    expect(poor.ledger.snapshot(SPONSOR).amountMinor).toBe(500);
  });

  it("iade brütü sponsora döndürür; ödül sonrası iade yok", async () => {
    const ports = world();
    const tender = await openArenaTender(ports, {
      sponsorUserId: SPONSOR,
      title: "İade",
      brief: "Kazanan yok, havuz geri.",
      prizePoolMinor: 10_000,
    });
    const alice = await submitArenaProposal(ports, {
      tenderId: tender.id,
      submitterId: ALICE,
      proposal: "Alice teslimi, kapsam net.",
    });
    await refundArenaTender(ports, { tenderId: tender.id, actorUserId: SPONSOR });
    expect(ports.ledger.snapshot(SPONSOR).amountMinor).toBe(100_000);

    const second = await openArenaTender(ports, {
      sponsorUserId: SPONSOR,
      title: "Tek kazanan",
      brief: "Net tek alıcıya.",
      prizePoolMinor: 10_000,
    });
    const win = await submitArenaProposal(ports, {
      tenderId: second.id,
      submitterId: ALICE,
      proposal: "Kazanan teslim, testli.",
    });
    await awardArenaTender(ports, {
      tenderId: second.id,
      actorUserId: SPONSOR,
      winners: [{ submissionId: win.id, amountMinor: 9_000 }],
      platformUserId: PLATFORM,
    });
    await expect(
      refundArenaTender(ports, { tenderId: second.id, actorUserId: SPONSOR }),
    ).rejects.toThrow();
    expect(alice.id).toBeTruthy();
  });
});
