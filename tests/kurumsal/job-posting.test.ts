import { describe, expect, it } from "vitest";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { REQUIRED_CATALOG_DEFINITIONS } from "@/lib/kernel/pricing/catalog-definitions";
import {
  awardCorporateJobPosting,
  refundCorporateJobPosting,
  releaseCorporateJobPosting,
  sealCorporateJobPosting,
  submitCorporateJobOffer,
  upsertCorporateCompany,
} from "@/lib/kurumsal/engine";
import { KURUMSAL_JOB_FLOOR_UNIT_KEY, KURUMSAL_MODULE_KEY } from "@/lib/kurumsal/types";
import { createMemoryEscrowStore, createMemoryLedgerStore } from "../helpers/memory-money";
import { createMemoryPriceCatalogStore } from "../helpers/memory-pricing";
import { createMemoryKurumsalStore } from "../helpers/memory-kurumsal";

const OWNER = "corp-owner-1";
const WORKER = "freelancer-worker-1";
const PLATFORM = PLATFORM_TREASURY_USER_ID;

function world(ownerBalance = 100_000) {
  const definition = REQUIRED_CATALOG_DEFINITIONS.find(
    (row) => row.moduleKey === KURUMSAL_MODULE_KEY && row.unitKey === KURUMSAL_JOB_FLOOR_UNIT_KEY,
  );
  if (!definition) {
    throw new Error("Kurumsal katalog tanımı yok.");
  }
  const ledger = createMemoryLedgerStore([
    { userId: OWNER, amountMinor: ownerBalance },
    { userId: WORKER, amountMinor: 0 },
    { userId: PLATFORM, amountMinor: 0 },
  ]);
  const escrow = createMemoryEscrowStore();
  const catalog = createMemoryPriceCatalogStore([
    {
      moduleKey: definition.moduleKey,
      unitKey: definition.unitKey,
      amountMinor: definition.seedAmountMinor,
      minMinor: definition.seedMinMinor,
      maxMinor: definition.seedMaxMinor,
    },
  ]);
  const kurumsal = createMemoryKurumsalStore();
  return { ledger, escrow, catalog, kurumsal };
}

describe("kurumsal mühürlü emanetli ilan", () => {
  it("şirket → mühür (hold) → freelancer ödül → release: %10 platform, net çalışanda", async () => {
    const ports = world();
    await upsertCorporateCompany(ports, { userId: OWNER, legalName: "Yetkin Ray A.Ş." });
    const posting = await sealCorporateJobPosting(ports, {
      actorUserId: OWNER,
      title: "API mühür",
      brief: "Freelancer tezgâhında REST teslim.",
      budgetMinor: 10_000,
      workbenchKind: "FREELANCER",
      holdBps: HOLD_BPS_DEFAULT,
    });

    expect(posting.status).toBe("SEALED");
    expect(posting.grossMinor).toBe(10_000);
    expect(posting.holdMinor).toBe(1_000);
    expect(posting.netMinor).toBe(9_000);
    expect(ports.ledger.snapshot(OWNER).amountMinor).toBe(90_000);
    const hold = await ports.escrow.findById(posting.escrowHoldId);
    expect(hold?.status).toBe("PENDING");

    const awarded = await awardCorporateJobPosting(ports, {
      postingId: posting.id,
      actorUserId: OWNER,
      awardedUserId: WORKER,
    });
    expect(awarded.status).toBe("AWARDED");
    expect(awarded.awardedUserId).toBe(WORKER);

    const released = await releaseCorporateJobPosting(ports, {
      postingId: posting.id,
      actorUserId: OWNER,
      platformUserId: PLATFORM,
    });
    expect(released.status).toBe("RELEASED");
    expect(ports.ledger.snapshot(OWNER).amountMinor).toBe(90_000);
    expect(ports.ledger.snapshot(WORKER).amountMinor).toBe(0);
    expect(ports.ledger.snapshot(PLATFORM).amountMinor).toBe(0);
  });

  it("mühürlü ilana teklif emaneti değiştirmez; ödül teklifi kabul eder", async () => {
    const ports = world();
    await upsertCorporateCompany(ports, { userId: OWNER, legalName: "Yetkin Ray A.Ş." });
    const posting = await sealCorporateJobPosting(ports, {
      actorUserId: OWNER,
      title: "Teklif kapısı",
      brief: "Vize HTTP'dedir; teklif tutar yazmaz.",
      budgetMinor: 10_000,
      workbenchKind: "FREELANCER",
    });
    const ownerAfterSeal = ports.ledger.snapshot(OWNER).amountMinor;
    const offer = await submitCorporateJobOffer(ports, {
      postingId: posting.id,
      bidderId: WORKER,
      coverNote: "Kapıdan geçtim, tutar aynı.",
    });
    expect(offer.status).toBe("SUBMITTED");
    expect(ports.ledger.snapshot(OWNER).amountMinor).toBe(ownerAfterSeal);
    const hold = await ports.escrow.findById(posting.escrowHoldId);
    expect(hold?.status).toBe("PENDING");
    expect(hold?.grossMinor).toBe(10_000);

    const awarded = await awardCorporateJobPosting(ports, {
      postingId: posting.id,
      actorUserId: OWNER,
      awardedUserId: WORKER,
    });
    expect(awarded.awardedUserId).toBe(WORKER);
    const accepted = await ports.kurumsal.getOffer(offer.id);
    expect(accepted?.status).toBe("ACCEPTED");
  });

  it("DevLabs tezgâhında proje kimliği olmadan ödül vermez", async () => {
    const ports = world();
    await upsertCorporateCompany(ports, { userId: OWNER, legalName: "Yetkin Ray A.Ş." });
    const posting = await sealCorporateJobPosting(ports, {
      actorUserId: OWNER,
      title: "Sandbox işi",
      brief: "DevLabs dar sandbox teslimi.",
      budgetMinor: 10_000,
      workbenchKind: "DEVLABS",
    });
    await expect(
      awardCorporateJobPosting(ports, {
        postingId: posting.id,
        actorUserId: OWNER,
        awardedUserId: WORKER,
      }),
    ).rejects.toThrow(/DevLabs/);
  });

  it("yetersiz bakiyede mühür açılmaz", async () => {
    const ports = world(500);
    await upsertCorporateCompany(ports, { userId: OWNER, legalName: "Yetkin Ray A.Ş." });
    await expect(
      sealCorporateJobPosting(ports, {
        actorUserId: OWNER,
        title: "Tuzak",
        brief: "Bakiye yetmezken kilit denemesi.",
        budgetMinor: 10_000,
        workbenchKind: "FREELANCER",
      }),
    ).rejects.toThrow();
    expect(ports.ledger.snapshot(OWNER).amountMinor).toBe(500);
    expect(await ports.kurumsal.listPostingsByOwner(OWNER)).toHaveLength(0);
  });

  it("mühürlü ilanı iade eder; brüt şirkete döner", async () => {
    const ports = world();
    await upsertCorporateCompany(ports, { userId: OWNER, legalName: "Yetkin Ray A.Ş." });
    const posting = await sealCorporateJobPosting(ports, {
      actorUserId: OWNER,
      title: "İptal",
      brief: "Kapsam değişti, iade.",
      budgetMinor: 10_000,
      workbenchKind: "FREELANCER",
    });
    const refunded = await refundCorporateJobPosting(ports, {
      postingId: posting.id,
      actorUserId: OWNER,
    });
    expect(refunded.status).toBe("REFUNDED");
    expect(ports.ledger.snapshot(OWNER).amountMinor).toBe(100_000);
    expect(ports.ledger.snapshot(PLATFORM).amountMinor).toBe(0);
  });

  it("katalog tabanı yoksa fail-closed", async () => {
    const ledger = createMemoryLedgerStore([
      { userId: OWNER, amountMinor: 100_000 },
      { userId: PLATFORM, amountMinor: 0 },
    ]);
    const ports = {
      ledger,
      escrow: createMemoryEscrowStore(),
      catalog: createMemoryPriceCatalogStore([]),
      kurumsal: createMemoryKurumsalStore(),
    };
    await upsertCorporateCompany(ports, { userId: OWNER, legalName: "Yetkin Ray A.Ş." });
    await expect(
      sealCorporateJobPosting(ports, {
        actorUserId: OWNER,
        title: "Katalogsuz",
        brief: "Taban tanımsızken ilan.",
        budgetMinor: 10_000,
        workbenchKind: "FREELANCER",
      }),
    ).rejects.toThrow(/Fiyat kataloğu yok/);
  });
});
