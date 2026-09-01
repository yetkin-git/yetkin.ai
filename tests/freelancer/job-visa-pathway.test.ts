import { describe, expect, it } from "vitest";
import {
  FREELANCER_ROOM_DEFAULT_LISTING_PATHWAY,
  YZ_ICERIK_LISTING_PATHWAY,
  inspectListingVisaPathway,
} from "@/lib/career/listing-visa-scope";
import { createFreelancerJob } from "@/lib/freelancer/engine";
import {
  createMemoryEscrowStore,
  createMemoryFreelancerStore,
  createMemoryLedgerStore,
  withMemoryAcceptAtomic,
} from "../helpers/memory-money";

function ports() {
  return withMemoryAcceptAtomic({
    ledger: createMemoryLedgerStore([]),
    escrow: createMemoryEscrowStore(),
    freelancer: createMemoryFreelancerStore(),
  });
}

describe("freelancer ilan visaPathwayId kilidi", () => {
  it("açık visaPathwayId kayda yazılır ve inspect explicit döner", async () => {
    const job = await createFreelancerJob(ports(), {
      clientId: "client-1",
      title: "React ve freelance teslimi",
      brief: "Full stack AWS işi; kelime piyangosu YZ olmamalı.",
      budgetMinor: 25_000,
      visaPathwayId: YZ_ICERIK_LISTING_PATHWAY,
    });
    expect(job.visaPathwayId).toBe(YZ_ICERIK_LISTING_PATHWAY);
    expect(inspectListingVisaPathway(job)).toEqual({
      pathwayId: YZ_ICERIK_LISTING_PATHWAY,
      source: "explicit",
    });
  });

  it("alan yoksa oda varsayılanı kilitler; teklif kapısı kapanmaz", async () => {
    const job = await createFreelancerJob(ports(), {
      clientId: "client-1",
      title: "Genel teslim",
      brief: "Kapsam belirsiz; dikey kilit yok.",
      budgetMinor: 25_000,
    });
    expect(job.visaPathwayId).toBe(FREELANCER_ROOM_DEFAULT_LISTING_PATHWAY);
    expect(inspectListingVisaPathway(job).source).toBe("explicit");
    expect(inspectListingVisaPathway(job).pathwayId).toBe(FREELANCER_ROOM_DEFAULT_LISTING_PATHWAY);
  });

  it("oturum userId yoksa 401 vatandaş cümlesi; ilan yazılmaz", async () => {
    const freelancer = createMemoryFreelancerStore();
    const world = withMemoryAcceptAtomic({
      ledger: createMemoryLedgerStore([]),
      escrow: createMemoryEscrowStore(),
      freelancer: {
        ...freelancer,
        hasUser: async () => false,
      },
    });
    await expect(
      createFreelancerJob(world, {
        clientId: "missing-client",
        title: "React teslimi",
        brief: "Oturum senkronu kırık; ilan doğmamalı.",
        budgetMinor: 25_000,
      }),
    ).rejects.toMatchObject({
      name: "AuthRequiredError",
      status: 401,
    });
    expect(await freelancer.listOpenJobs()).toEqual([]);
  });

  it("insertJob P2003 401 vatandaş cümlesine çevrilir", async () => {
    const freelancer = createMemoryFreelancerStore();
    const world = withMemoryAcceptAtomic({
      ledger: createMemoryLedgerStore([]),
      escrow: createMemoryEscrowStore(),
      freelancer: {
        ...freelancer,
        insertJob: async () => {
          const error = new Error("Foreign key constraint failed") as Error & { code: string };
          error.code = "P2003";
          throw error;
        },
      },
    });
    await expect(
      createFreelancerJob(world, {
        clientId: "stale-session",
        title: "React teslimi",
        brief: "FK ihlali 500 basmamalı.",
        budgetMinor: 25_000,
      }),
    ).rejects.toMatchObject({
      name: "AuthRequiredError",
      message: expect.stringContaining("veritabanında yok"),
    });
  });
});
