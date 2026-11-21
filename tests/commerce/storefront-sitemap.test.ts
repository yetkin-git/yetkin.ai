import { describe, expect, it, vi } from "vitest";

/**
 * Faz 2 / P2 — kamu vitrini site haritası yükleyicisi.
 *
 * `/magaza/[slug]` sitemap'e Faz 2'de eklendi. Yükleyici **tek** sorgu atar,
 * yalnız `ACTIVE` mağazayı ve rafta satılabilir satırı olanı listeler, hata
 * durumunda güvenli boş dizi döner (site haritası üretimi düşmez).
 */
const findMany = vi.fn();

vi.mock("@/lib/kernel/db", () => ({
  getPrisma: () => ({ commerceStore: { findMany } }),
}));

const { listPublicStorefrontSlugs } = await import("@/lib/commerce/storefront-sitemap");

type Row = {
  slug: string;
  products: { id: string; variants: { amountMinor: number | null; onHandQty: number; safetyBuffer: number }[] }[];
};

function store(slug: string, products: Row["products"]): Row {
  return { slug, products };
}

describe("Faz 2 sitemap — kamu vitrini yükleyicisi", () => {
  it("satılabilir satırı olan aktif mağazaları listeler", async () => {
    findMany.mockResolvedValueOnce([
      store("aktif-magaza", [
        { id: "p1", variants: [{ amountMinor: 12_900, onHandQty: 5, safetyBuffer: 0 }] },
      ]),
      store("ikinci-magaza", [
        { id: "p2", variants: [{ amountMinor: 500, onHandQty: 3, safetyBuffer: 1 }] },
      ]),
    ]);

    await expect(listPublicStorefrontSlugs()).resolves.toEqual(["aktif-magaza", "ikinci-magaza"]);
    expect(findMany).toHaveBeenCalledTimes(1);
    // Yalnız aktif mağaza ve aktif varyant ürünleri okunur (tek sorgu).
    const args = findMany.mock.calls[0]![0] as {
      where: { status: string };
      take: number;
      select: { products: { where: { status: string } } };
    };
    expect(args.where.status).toBe("ACTIVE");
    expect(args.select.products.where.status).toBe("ACTIVE");
    expect(args.take).toBeGreaterThan(0);
  });

  it("satılabilir satırı olmayan (boş raf) mağaza listeye girmez", async () => {
    findMany.mockResolvedValueOnce([
      // Fiyat yok.
      store("fiyatsiz", [{ id: "p1", variants: [{ amountMinor: null, onHandQty: 9, safetyBuffer: 0 }] }]),
      // Stok güvenlik payının altında.
      store("stoksuz", [{ id: "p2", variants: [{ amountMinor: 900, onHandQty: 2, safetyBuffer: 2 }] }]),
      // Hiç ürün yok.
      store("bos", []),
      // Satılabilir: tek geçerli kayıt.
      store("gecerli", [{ id: "p3", variants: [{ amountMinor: 900, onHandQty: 3, safetyBuffer: 0 }] }]),
    ]);

    await expect(listPublicStorefrontSlugs()).resolves.toEqual(["gecerli"]);
  });

  it("boş slug ve yinelenen satır temizlenir", async () => {
    findMany.mockResolvedValueOnce([
      store("  ", [{ id: "p1", variants: [{ amountMinor: 100, onHandQty: 1, safetyBuffer: 0 }] }]),
      store("ayni", [{ id: "p2", variants: [{ amountMinor: 100, onHandQty: 1, safetyBuffer: 0 }] }]),
    ]);
    await expect(listPublicStorefrontSlugs()).resolves.toEqual(["ayni"]);
  });

  it("DB hatasında boş dizi döner; site haritası düşmez", async () => {
    findMany.mockRejectedValueOnce(new Error("connect ECONNREFUSED"));
    await expect(listPublicStorefrontSlugs()).resolves.toEqual([]);
  });

  it("DB tanımsızsa da boş dizi döner", async () => {
    findMany.mockImplementationOnce(() => {
      throw new Error("getPrisma: DATABASE_URL yok");
    });
    await expect(listPublicStorefrontSlugs()).resolves.toEqual([]);
  });
});
