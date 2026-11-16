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

  it("köprü oturum açmış e-ticaret çıktısında durur ve yeni rota açmaz", () => {
    const workbench = readFileSync(join(ROOT, "components/tezgah/workbench.tsx"), "utf8");
    const transfer = readFileSync(join(ROOT, "components/tezgah/ecommerce-draft-transfer.tsx"), "utf8");
    expect(workbench).toContain('active.id === "ecommerce" && signedIn');
    expect(workbench).toContain("<EcommerceDraftTransfer");
    expect(workbench).toContain("title={values.productName ?? \"\"}");
    expect(workbench).toContain("category={values.category ?? \"\"}");
    expect(workbench).toContain("description={markdown}");
    expect(transfer).toContain("E-Ticaret Havuzuna Aktar");
    expect(transfer).toContain("Havuzu aç");
    expect(transfer).toContain('"/api/commerce/os"');
    expect(transfer).toContain('"/e-ticaret?sekme=havuz"');
    expect(transfer).toContain("data-ecommerce-draft-transfer");
    expect(transfer).not.toContain("/api/tezgah/");
  });
});
