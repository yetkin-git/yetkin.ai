import { describe, expect, it } from "vitest";
import {
  UIUX_URUN_FREELANCE_LISTING_PATHWAY,
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
    expect(job.visaPathwayId).toBe(UIUX_URUN_FREELANCE_LISTING_PATHWAY);
    expect(inspectListingVisaPathway(job).source).toBe("explicit");
    expect(inspectListingVisaPathway(job).pathwayId).toBe(UIUX_URUN_FREELANCE_LISTING_PATHWAY);
  });
});
