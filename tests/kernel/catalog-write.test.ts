import { afterEach, describe, expect, it } from "vitest";
import {
  CATALOG_PATCH_FORBIDDEN,
  CATALOG_PATCH_UNAUTHORIZED,
  runCatalogPatch,
} from "@/lib/kernel/admin/catalog-write";
import { CATALOG_WRITE_PATH } from "@/lib/kernel/admin/types";
import { HOLD_BPS_MAX, HOLD_BPS_MIN } from "@/lib/kernel/pricing/hold-bps";
import { createMemoryCatalogWriteStore } from "../helpers/memory-pricing";

const ADMIN_ID = "11111111-1111-4111-8111-111111111111";
const CITIZEN_ID = "22222222-2222-4222-8222-222222222222";
const ORIGINAL_ADMIN = process.env.SUPER_ADMIN_USER_ID;

const ADMIN = { id: ADMIN_ID, email: "admin@yetkin.rail" };
const CITIZEN = { id: CITIZEN_ID, email: "vatandas@yetkin.rail" };

function catalogStore() {
  return createMemoryCatalogWriteStore([
    {
      id: "cat_studio_generation_text",
      moduleKey: "studio",
      unitKey: "generation:text",
      amountMinor: 100,
      minMinor: 100,
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
      body: { id: "cat_studio_generation_text", amountMinor: 150 },
      getStore: catalogStore,
    });
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ ok: false, error: CATALOG_PATCH_UNAUTHORIZED });
  });

  it("oturumlu gayri-admin PATCH 403 döner", async () => {
    process.env.SUPER_ADMIN_USER_ID = ADMIN_ID;
    const store = catalogStore();
    const response = await runCatalogPatch({
      session: CITIZEN,
      body: { id: "cat_studio_generation_text", amountMinor: 150 },
      getStore: () => store,
    });
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ ok: false, error: CATALOG_PATCH_FORBIDDEN });
    expect(store.snapshot("cat_studio_generation_text")?.amountMinor).toBe(100);
  });

  it("boş SUPER_ADMIN_USER_ID kimseyi admin yapmaz", async () => {
    delete process.env.SUPER_ADMIN_USER_ID;
    const response = await runCatalogPatch({
      session: ADMIN,
      body: { id: "cat_studio_generation_text", amountMinor: 150 },
      getStore: catalogStore,
    });
    expect(response.status).toBe(403);
  });

  it("Super Admin geçerli MINOR güncellemesi 200 ve updatedBy mühürler", async () => {
    process.env.SUPER_ADMIN_USER_ID = ADMIN_ID;
    const store = catalogStore();
    const response = await runCatalogPatch({
      session: ADMIN,
      body: { id: "cat_studio_generation_text", amountMinor: 150 },
      getStore: () => store,
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      ok: boolean;
      entry: { amountMinor: number; updatedBy: string; id: string };
    };
    expect(body.ok).toBe(true);
    expect(body.entry.amountMinor).toBe(150);
    expect(body.entry.updatedBy).toBe(ADMIN_ID);
    expect(store.snapshot("cat_studio_generation_text")?.updatedBy).toBe(ADMIN_ID);
    expect(store.snapshot("cat_studio_generation_text")?.amountMinor).toBe(150);
  });

  it("Super Admin hold bps bandı içini 200 ile yazar", async () => {
    process.env.SUPER_ADMIN_USER_ID = ADMIN_ID;
    const store = catalogStore();
    const response = await runCatalogPatch({
      session: ADMIN,
      body: { id: "cat_freelancer_escrow_hold", amountMinor: 1250 },
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
      body: { id: "cat_freelancer_escrow_hold", amountMinor: HOLD_BPS_MIN - 1 },
      getStore: () => store,
    });
    expect(tooLow.status).toBe(400);
    expect(store.snapshot("cat_freelancer_escrow_hold")?.amountMinor).toBe(HOLD_BPS_MIN);

    const tooHigh = await runCatalogPatch({
      session: ADMIN,
      body: { id: "cat_freelancer_escrow_hold", amountMinor: HOLD_BPS_MAX + 1 },
      getStore: () => store,
    });
    expect(tooHigh.status).toBe(400);

    const negative = await runCatalogPatch({
      session: ADMIN,
      body: { id: "cat_studio_generation_text", amountMinor: -1 },
      getStore: () => store,
    });
    expect(negative.status).toBe(400);
    expect(store.snapshot("cat_studio_generation_text")?.amountMinor).toBe(100);
  });

  it("yazma yolu /api/admin/catalog sabitidir", () => {
    expect(CATALOG_WRITE_PATH).toBe("/api/admin/catalog");
  });
});
