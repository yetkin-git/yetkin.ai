import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/** Satır 22–57, LF normalize. A1–A5 karakteri değişirse bu özet kırılır. */
const A_LAYER_SHA256 = "d633c71d187ede4093c13232ae85983a27a26df8481dacb361c0eeeabe7b634c";

function aLayerBlock(): string {
  const text = readFileSync(join(process.cwd(), ".system_docs", "ANAYASA.md"), "utf8");
  return text.split(/\r?\n/).slice(21, 57).join("\n");
}

describe("A katmanı mührü", () => {
  it("A1–A5 bloğunun SHA-256 özeti ve kırmızı çizgileri kilitlidir", () => {
    const block = aLayerBlock();
    expect(block.startsWith("# BÖLÜM A — SERT KIRMIZI ÇİZGİLER (DEĞİŞMEZLER)")).toBe(true);
    expect(block).toContain("## A1. Tek Defter, Tek Birim (`amountMinor`) ve Finansal SSOT");
    expect(block).toContain("## A2. Ödeme Kuruluşu Değiliz");
    expect(block).toContain("## A3. Güvenlik, Kimlik ve İzolasyon");
    expect(block).toContain("## A4. Kanıt Satın Alınamaz");
    expect(block).toContain("## A5. Dürüst Kapalı Yüzey");
    expect(block).toContain("amountMinor");
    expect(block).toContain("LedgerEntry");
    expect(block).toContain("/api/wallet/withdraw");
    expect(block).toContain("Satın Alınamaz");
    expect(block).toContain("Sahte Finansal Veri");
    expect(createHash("sha256").update(block).digest("hex")).toBe(A_LAYER_SHA256);
  });
});
