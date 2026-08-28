import { afterEach, describe, expect, it, vi } from "vitest";
import { frozenRoomGone } from "@/lib/kernel/http/frozen-gone-route";
import { openArenaTender, submitArenaProposal } from "@/lib/arena/engine";
import { queryTenderBoard } from "@/lib/arena/tender-board";
import { ARENA_MODULE_KEY, ARENA_TENDER_FLOOR_UNIT_KEY } from "@/lib/arena/types";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { REQUIRED_CATALOG_DEFINITIONS } from "@/lib/kernel/pricing/catalog-definitions";
import { createMemoryEscrowStore, createMemoryLedgerStore } from "../helpers/memory-money";
import { createMemoryPriceCatalogStore } from "../helpers/memory-pricing";
import { createMemoryArenaStore, withMemoryArenaAtomic } from "../helpers/memory-arena";
import { assertWireContains, assertWireOmits } from "../helpers/idor-leak";

const SPONSOR = "arena-idor-sponsor";
const ALICE = "arena-idor-alice";
const BOB = "arena-idor-bob";
const STRANGER = "arena-idor-stranger";
const PLATFORM = PLATFORM_TREASURY_USER_ID;

const IDOR_PROPOSAL_ALICE = "IDOR_PROPOSAL_ALICE";
const IDOR_PROPOSAL_BOB = "IDOR_PROPOSAL_BOB";

function world() {
  const definition = REQUIRED_CATALOG_DEFINITIONS.find(
    (row) => row.moduleKey === ARENA_MODULE_KEY && row.unitKey === ARENA_TENDER_FLOOR_UNIT_KEY,
  );
  if (!definition) {
    throw new Error("Arena katalog tanımı yok.");
  }
  return withMemoryArenaAtomic({
    ledger: createMemoryLedgerStore([
      { userId: SPONSOR, amountMinor: 100_000 },
      { userId: ALICE, amountMinor: 0 },
      { userId: BOB, amountMinor: 0 },
      { userId: PLATFORM, amountMinor: 0 },
    ]),
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
  });
}

async function seededTender(ports: ReturnType<typeof world>) {
  const tender = await openArenaTender(ports, {
    sponsorUserId: SPONSOR,
    title: "IDOR ihale",
    brief: "Teslim metni sızmamalı.",
    prizePoolMinor: 20_000,
  });
  const alice = await submitArenaProposal(ports, {
    tenderId: tender.id,
    submitterId: ALICE,
    proposal: IDOR_PROPOSAL_ALICE,
  });
  const bob = await submitArenaProposal(ports, {
    tenderId: tender.id,
    submitterId: BOB,
    proposal: IDOR_PROPOSAL_BOB,
  });
  return { tender, alice, bob };
}

function publicSecrets(escrowHoldId: string): string[] {
  return [IDOR_PROPOSAL_ALICE, IDOR_PROPOSAL_BOB, escrowHoldId];
}

function tenderGetRequest(tenderId: string): Request {
  return new Request(new URL(`/api/arena/tenders/${tenderId}`, "http://localhost:3000"), {
    method: "GET",
  });
}

describe("arena ihale detayı IDOR — teslim ve proposal", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sponsor tüm teslimleri görür; rakip ve anonim proposal/hold sızmaz", async () => {
    const ports = world();
    const { tender, alice, bob } = await seededTender(ports);

    const owner = await queryTenderBoard(ports.arena, tender.id, SPONSOR);
    expect(owner?.viewerRole).toBe("owner");
    expect(owner?.submissions).toHaveLength(2);
    expect(owner?.tender.escrowHoldId).toBe(tender.escrowHoldId);
    assertWireContains(owner, [IDOR_PROPOSAL_ALICE, IDOR_PROPOSAL_BOB, tender.escrowHoldId]);

    const rival = await queryTenderBoard(ports.arena, tender.id, ALICE);
    expect(rival?.viewerRole).toBe("participant");
    expect(rival?.submissions).toEqual([
      expect.objectContaining({ id: alice.id, proposal: IDOR_PROPOSAL_ALICE }),
    ]);
    expect(rival?.submissions.find((row) => row.id === bob.id)).toBeUndefined();
    expect(rival?.submissions[0]?.proposal).toBe(IDOR_PROPOSAL_ALICE);
    expect(rival?.tender.escrowHoldId).toBeUndefined();
    assertWireOmits(rival, [IDOR_PROPOSAL_BOB, tender.escrowHoldId]);

    const stranger = await queryTenderBoard(ports.arena, tender.id, STRANGER);
    expect(stranger?.viewerRole).toBe("third_party");
    expect(stranger?.submissions).toEqual([]);
    expect(stranger?.awards).toEqual([]);
    expect(stranger?.tender.escrowHoldId).toBeUndefined();
    assertWireOmits(stranger, publicSecrets(tender.escrowHoldId));

    const anonymous = await queryTenderBoard(ports.arena, tender.id, null);
    expect(anonymous?.viewerRole).toBe("third_party");
    expect(anonymous?.submissions).toEqual([]);
    expect(anonymous?.submissions[0]?.proposal).toBeUndefined();
    assertWireOmits(anonymous, publicSecrets(tender.escrowHoldId));
  });

  it("GET /api/arena/tenders/[id] donmuş oda 410 basar; engine sızdırmaz", async () => {
    const ports = world();
    const { tender } = await seededTender(ports);
    const ownerRes = await frozenRoomGone(tenderGetRequest(tender.id));
    expect(ownerRes.status).toBe(410);
    const ownerBody = (await ownerRes.json()) as {
      ok: boolean;
      error?: string;
      submissions?: unknown;
    };
    expect(ownerBody.ok).toBe(false);
    expect(ownerBody.error).toBe("Bu oda üretimde kapalı.");
    expect(ownerBody.submissions).toBeUndefined();
    assertWireOmits(ownerBody, publicSecrets(tender.escrowHoldId));
  });
});
