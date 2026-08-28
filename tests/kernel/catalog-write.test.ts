import { afterEach, describe, expect, it } from "vitest";
import {
  CATALOG_PATCH_FORBIDDEN,
  CATALOG_PATCH_REASON_REQUIRED,
  CATALOG_PATCH_UNAUTHORIZED,
  runCatalogPatch,
} from "@/lib/kernel/admin/catalog-write";
import { CATALOG_WRITE_PATH } from "@/lib/kernel/admin/types";
import { CATALOG_WRITE_BAND_UNDEFINED } from "@/lib/kernel/pricing/catalog-band";
import { HOLD_BPS_MAX, HOLD_BPS_MIN } from "@/lib/kernel/pricing/hold-bps";
import { createMemoryCatalogWriteStore } from "../helpers/memory-pricing";

const ADMIN_ID = "11111111-1111-4111-8111-111111111111";
const CITIZEN_ID = "22222222-2222-4222-8222-222222222222";
const ORIGINAL_ADMIN = process.env.SUPER_ADMIN_USER_ID;

const ADMIN = { id: ADMIN_ID, email: "admin@yetkin.rail" };
const CITIZEN = { id: CITIZEN_ID, email: "vatandas@yetkin.rail" };

const REASON = {
  reasonCode: "ADMIN_MANUAL" as const,
  reason: "Studio tabanını güncelledim.",
};

function catalogStore() {
  return createMemoryCatalogWriteStore([
    {
      id: "cat_studio_generation_text",
      moduleKey: "studio",
      unitKey: "generation:text",
      amountMinor: 100,
      minMinor: 100,
      maxMinor: 1_000_000,
      description: "Studio metin üretim tabanı",
    },
    {
      id: "cat_freelancer_escrow_hold",
      moduleKey: "freelancer",
      unitKey: "escrow:hold",
      unitType: "BPS",
      amountMinor: HOLD_BPS_MIN,
      minMinor: HOLD_BPS_MIN,
      maxMinor: HOLD_BPS_MAX,
      description: "Platform hold",
    },
  ]);
}

describe("admin katalog PATCH yazma", () => {
  afterEach(() => {
    if (ORIGINAL_ADMIN == null) {
      delete process.env.SUPER_ADMIN_USER_ID;
    } else {
      process.env.SUPER_ADMIN_USER_ID = ORIGINAL_ADMIN;
    }
  });

  it("oturumsuz PATCH 401 döner", async () => {
    process.env.SUPER_ADMIN_USER_ID = ADMIN_ID;
    const response = await runCatalogPatch({
      session: null,
      body: { id: "cat_studio_generation_text", amountMinor: 150, ...REASON },
      getStore: catalogStore,
    });
    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({
      ok: false,
      error: CATALOG_PATCH_UNAUTHORIZED,
      apiVersion: "1",
      data: null,
    });
  });

  it("oturumlu gayri-admin PATCH 403 döner", async () => {
    process.env.SUPER_ADMIN_USER_ID = ADMIN_ID;
    const store = catalogStore();
    const response = await runCatalogPatch({
      session: CITIZEN,
      body: { id: "cat_studio_generation_text", amountMinor: 150, ...REASON },
      getStore: () => store,
    });
    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({
      ok: false,
      error: CATALOG_PATCH_FORBIDDEN,
      apiVersion: "1",
      data: null,
    });
    expect(store.snapshot("cat_studio_generation_text")?.amountMinor).toBe(100);
  });

  it("boş SUPER_ADMIN_USER_ID kimseyi admin yapmaz", async () => {
    delete process.env.SUPER_ADMIN_USER_ID;
    const response = await runCatalogPatch({
      session: ADMIN,
      body: { id: "cat_studio_generation_text", amountMinor: 150, ...REASON },
      getStore: catalogStore,
    });
    expect(response.status).toBe(403);
  });

  it("gerekçesiz PATCH 400 döner; satır değişmez", async () => {
    process.env.SUPER_ADMIN_USER_ID = ADMIN_ID;
    const store = catalogStore();
    const response = await runCatalogPatch({
      session: ADMIN,
      body: { id: "cat_studio_generation_text", amountMinor: 150 },
      getStore: () => store,
    });
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      ok: false,
      error: CATALOG_PATCH_REASON_REQUIRED,
    });
    expect(store.snapshot("cat_studio_generation_text")?.amountMinor).toBe(100);
    expect(store.decisions()).toHaveLength(0);
  });

  it("Super Admin geçerli MINOR güncellemesi 200, deftere yazar, updatedBy mühürler", async () => {
    process.env.SUPER_ADMIN_USER_ID = ADMIN_ID;
    const store = catalogStore();
    const response = await runCatalogPatch({
      session: ADMIN,
      body: { id: "cat_studio_generation_text", amountMinor: 150, ...REASON },
      getStore: () => store,
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      ok: boolean;
      data: { entry: { amountMinor: number; updatedBy: string; id: string } };
    };
    expect(body.ok).toBe(true);
    expect(body.data.entry.amountMinor).toBe(150);
    expect(body.data.entry.updatedBy).toBe(ADMIN_ID);
    expect(store.snapshot("cat_studio_generation_text")?.updatedBy).toBe(ADMIN_ID);
    expect(store.snapshot("cat_studio_generation_text")?.amountMinor).toBe(150);
    expect(store.decisions()[0]).toMatchObject({
      catalogEntryId: "cat_studio_generation_text",
      reasonCode: "ADMIN_MANUAL",
      oldMinor: 100,
      newMinor: 150,
      actorUserId: ADMIN_ID,
    });
  });

  it("MINOR taban altı ve tavan üstü 400; satır değişmez", async () => {
    process.env.SUPER_ADMIN_USER_ID = ADMIN_ID;
    const store = catalogStore();
    const below = await runCatalogPatch({
      session: ADMIN,
      body: { id: "cat_studio_generation_text", amountMinor: 50, ...REASON },
      getStore: () => store,
    });
    expect(below.status).toBe(400);
    expect(store.snapshot("cat_studio_generation_text")?.amountMinor).toBe(100);

    const above = await runCatalogPatch({
      session: ADMIN,
      body: { id: "cat_studio_generation_text", amountMinor: 1_000_001, ...REASON },
      getStore: () => store,
    });
    expect(above.status).toBe(400);
    expect(store.snapshot("cat_studio_generation_text")?.amountMinor).toBe(100);
    expect(store.decisions()).toHaveLength(0);
  });

  it("MINOR tavan tanımsızsa fail-closed 400", async () => {
    process.env.SUPER_ADMIN_USER_ID = ADMIN_ID;
    const store = createMemoryCatalogWriteStore([
      {
        id: "cat_open_ceiling",
        moduleKey: "studio",
        unitKey: "generation:open",
        amountMinor: 100,
        minMinor: 100,
        maxMinor: null,
      },
    ]);
    const response = await runCatalogPatch({
      session: ADMIN,
      body: { id: "cat_open_ceiling", amountMinor: 150, ...REASON },
      getStore: () => store,
    });
    expect(response.status).toBe(400);
    const body = (await response.json()) as { error: string };
    expect(body.error).toBe(CATALOG_WRITE_BAND_UNDEFINED);
    expect(store.snapshot("cat_open_ceiling")?.amountMinor).toBe(100);
  });

  it("Super Admin hold bps bandı içini 200 ile yazar", async () => {
    process.env.SUPER_ADMIN_USER_ID = ADMIN_ID;
    const store = catalogStore();
    const response = await runCatalogPatch({
      session: ADMIN,
      body: { id: "cat_freelancer_escrow_hold", amountMinor: 1250, ...REASON },
      getStore: () => store,
    });
    expect(response.status).toBe(200);
    expect(store.snapshot("cat_freelancer_escrow_hold")?.amountMinor).toBe(1250);
  });

  it("geçersiz BPS ve negatif tutar 400 döner; satır değişmez", async () => {
    process.env.SUPER_ADMIN_USER_ID = ADMIN_ID;
    const store = catalogStore();
    const tooLow = await runCatalogPatch({
      session: ADMIN,
      body: { id: "cat_freelancer_escrow_hold", amountMinor: HOLD_BPS_MIN - 1, ...REASON },
      getStore: () => store,
    });
    expect(tooLow.status).toBe(400);
    expect(store.snapshot("cat_freelancer_escrow_hold")?.amountMinor).toBe(HOLD_BPS_MIN);

    const tooHigh = await runCatalogPatch({
      session: ADMIN,
      body: { id: "cat_freelancer_escrow_hold", amountMinor: HOLD_BPS_MAX + 1, ...REASON },
      getStore: () => store,
    });
    expect(tooHigh.status).toBe(400);

    const negative = await runCatalogPatch({
      session: ADMIN,
      body: { id: "cat_studio_generation_text", amountMinor: -1, ...REASON },
      getStore: () => store,
    });
    expect(negative.status).toBe(400);
    expect(store.snapshot("cat_studio_generation_text")?.amountMinor).toBe(100);
  });

  it("yazma yolu /api/admin/catalog sabitidir", () => {
    expect(CATALOG_WRITE_PATH).toBe("/api/admin/catalog");
  });
});
