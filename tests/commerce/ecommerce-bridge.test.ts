import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ecommerceCardToDraftProduct } from "@/lib/commerce/ecommerce-bridge";

const ROOT = process.cwd();

describe("e-ticaret kartı taslak aktarımı", () => {
  it("başlık, kategori ve açıklamayı taslak gövdeye yazar", () => {
    const draft = ecommerceCardToDraftProduct({
      title: "  Pamuklu battaniye  ",
      category: " Anne ve bebek ",
      description: "  ## Ürün açıklaması\n- Yıkanabilir  ",
    });
    expect(draft.ok).toBe(true);
    if (!draft.ok) {
      return;
    }
    expect(draft.trimmed).toBe(false);
    expect(draft.body).toEqual({
      mode: "draft",
      title: "Pamuklu battaniye",
      category: "Anne ve bebek",
      description: "## Ürün açıklaması\n- Yıkanabilir",
      attributes: [],
      other: "",
      sku: null,
      onHandQty: 0,
      safetyBuffer: 0,
    });
    expect(draft.body).not.toHaveProperty("barcode");
    expect(draft.body).not.toHaveProperty("amountMinor");
  });

  it("boş alanı ve uzun başlığı reddeder; açıklamayı 4000 karakterde keser", () => {
    expect(
      ecommerceCardToDraftProduct({ title: " ", category: "Bebek", description: "Metin" }).ok,
    ).toBe(false);
    const longTitle = ecommerceCardToDraftProduct({
      title: "A".repeat(201),
      category: "Bebek",
      description: "Metin",
    });
    expect(longTitle.ok).toBe(false);
    if (!longTitle.ok) {
      expect(longTitle.error).toBe("Ürün adı en çok 200 karakter olmalıdır.");
    }
    const longCategory = ecommerceCardToDraftProduct({
      title: "Battaniye",
      category: "K".repeat(81),
      description: "Metin",
    });
    expect(longCategory.ok).toBe(false);
    const longDescription = ecommerceCardToDraftProduct({
      title: "Battaniye",
      category: "Bebek",
      description: "M".repeat(4_001),
    });
    expect(longDescription.ok).toBe(true);
    if (longDescription.ok) {
      expect(longDescription.trimmed).toBe(true);
      expect(longDescription.body.description).toHaveLength(4_000);
      expect(longDescription.body.mode).toBe("draft");
    }
  });

  it("köprü gerçek e-ticaret kartı stüdyosunda durur ve yeni tezgâh rotası açmaz", () => {
    const workbench = readFileSync(join(ROOT, "components/tezgah/workbench.tsx"), "utf8");
    const studio = readFileSync(join(ROOT, "components/commerce/product-card-studio.tsx"), "utf8");
    // Y4: workbench'teki ölü e-ticaret dalı ve transfer bileşeni kaldırıldı.
    expect(workbench).not.toContain("<EcommerceDraftTransfer");
    expect(workbench).not.toContain('active.id === "ecommerce" && signedIn');
    // Köprü hâlâ vardır — ama sahibi e-ticaret işletim sistemi kokpitidir.
    expect(studio).toContain('"/api/commerce/os"');
    expect(studio).toContain('action: "pool"');
    expect(studio).toContain('"/api/tezgah/generate"');
    expect(studio).toContain('tool: "ecommerce"');
    expect(studio).toContain("Havuza kaydet");
  });
});
