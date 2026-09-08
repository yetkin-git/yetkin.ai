import { afterEach, describe, expect, it, vi } from "vitest";
import {
  FREELANCER_ROOM_DEFAULT_LISTING_PATHWAY,
  YZ_ICERIK_LISTING_PATHWAY,
  inspectListingVisaPathway,
} from "@/lib/career/listing-visa-scope";
import { createFreelancerJob } from "@/lib/freelancer/engine";
import { createJobInputSchema } from "@/lib/freelancer/schemas";
import {
  createMemoryEscrowStore,
  createMemoryFreelancerStore,
  createMemoryLedgerStore,
  withMemoryAcceptAtomic,
} from "../helpers/memory-money";

const SUPER_ADMIN_ID = "11111111-1111-4111-8111-111111111111";
const SUPER_ADMIN_EMAIL = "admin@yetkin.test";

function ports() {
  return withMemoryAcceptAtomic({
    ledger: createMemoryLedgerStore([]),
    escrow: createMemoryEscrowStore(),
    freelancer: createMemoryFreelancerStore(),
  });
}

describe("freelancer ilan visaPathwayId kilidi", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

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

  it("serbest pazaryeri kategorisi OPEN yazılır; vize kilidi Açık Deneme mantığıdır", async () => {
    const job = await createFreelancerJob(ports(), {
      clientId: "client-1",
      title: "Kurumsal web uygulaması",
      brief: "Next.js ve mobil istemci; vize istenmez.",
      budgetMinor: 25_000,
      visaPathwayId: "yazilim-web-mobil",
    });
    expect(job.visaPathwayId).toBe("yazilim-web-mobil");
    expect(job.status).toBe("OPEN");
    expect(job.visibility).toBe("PUBLIC");
    expect(inspectListingVisaPathway(job)).toEqual({
      pathwayId: "yazilim-web-mobil",
      source: "explicit",
    });
  });

  it("Bölüm B grafik kimlik şemadan geçer ve OPEN kayda yazılır", async () => {
    const parsed = createJobInputSchema.safeParse({
      title: "Logo ve kartvizit seti",
      brief: "Kurumsal kimlik: logo, kartvizit ve antetli kâğıt.",
      budgetMinor: 250_000,
      visaPathwayId: "grafik-tasarim-kimlik",
    });
    expect(parsed.success).toBe(true);
    const job = await createFreelancerJob(ports(), {
      clientId: "client-1",
      title: "Logo ve kartvizit seti",
      brief: "Kurumsal kimlik: logo, kartvizit ve antetli kâğıt.",
      budgetMinor: 250_000,
      visaPathwayId: "grafik-tasarim-kimlik",
    });
    expect(job.visaPathwayId).toBe("grafik-tasarim-kimlik");
    expect(job.status).toBe("OPEN");
    expect(job.budgetMinor).toBe(250_000);
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

  it("Super Admin public.users yokken ensureUser ile Bölüm B ilanı açar", async () => {
    vi.stubEnv("SUPER_ADMIN_USER_ID", SUPER_ADMIN_ID);
    vi.stubEnv("CANONICAL_SUPER_ADMIN_EMAIL", SUPER_ADMIN_EMAIL);
    let exists = false;
    const freelancer = createMemoryFreelancerStore();
    const world = withMemoryAcceptAtomic({
      ledger: createMemoryLedgerStore([]),
      escrow: createMemoryEscrowStore(),
      freelancer: {
        ...freelancer,
        hasUser: async () => exists,
        ensureUser: async () => {
          exists = true;
        },
      },
    });
    const job = await createFreelancerJob(world, {
      clientId: SUPER_ADMIN_ID,
      clientEmail: SUPER_ADMIN_EMAIL,
      title: "Logo ve kartvizit seti",
      brief: "Kurumsal kimlik: logo, kartvizit ve antetli kâğıt.",
      budgetMinor: 250_000,
      visaPathwayId: "grafik-tasarim-kimlik",
    });
    expect(exists).toBe(true);
    expect(job.clientId).toBe(SUPER_ADMIN_ID);
    expect(job.visaPathwayId).toBe("grafik-tasarim-kimlik");
    expect(job.status).toBe("OPEN");
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
