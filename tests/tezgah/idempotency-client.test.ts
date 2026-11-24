import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

/**
 * Y2 — istemci sabit niyet anahtarı.
 *
 * Kural: aynı niyet (aynı form gövdesi) yeniden denendiğinde **aynı**
 * `Idempotency-Key` gider; başarıda anahtar döner; gövde değişirse niyet
 * değişmiştir ve anahtar döner (aksi hâlde sunucu 400 çakışma döndürür).
 */
describe("Y2 — istemci niyet anahtarı", () => {
  const workbench = readSrc("components/tezgah/workbench.tsx");

  it("her denemede yeni UUID üretmez; paylaşılan kanca kullanılır", () => {
    expect(workbench).toContain("useIdempotencyKey");
    expect(workbench).toContain("productionIdempotency");
    // Regresyon: ham `crypto.randomUUID()` üretim başlığında kullanılmamalı.
    expect(workbench).not.toContain('"Idempotency-Key": crypto.randomUUID()');
  });

  it("genel hat da idempotency başlığı gönderir (K1)", () => {
    // Genel `/api/tezgah/generate` çağrısı artık `productionHeaders` kullanır.
    const generic = workbench.slice(workbench.indexOf('"/api/tezgah/generate"'));
    expect(generic).toContain("productionHeaders(payload)");
    expect(generic).not.toContain('headers: { "content-type": "application/json" }');
  });

  it("niyet imzası gövdeye bağlıdır; gövde değişince anahtar döner", () => {
    expect(workbench).toContain("lastIntentRef");
    expect(workbench).toContain("prepareIntent");
    expect(workbench).toContain("JSON.stringify(body)");
    const intent = workbench.slice(workbench.indexOf("function prepareIntent"));
    expect(intent).toContain("rotateProductionKey()");
  });

  it("başarılı üretimden sonra anahtar döner", () => {
    const rotations = workbench.match(/rotateProductionKey\(\)/g) ?? [];
    // Başarı yollarının her biri artı niyet değişimi ve tanım — en az 6 çağrı.
    expect(rotations.length).toBeGreaterThanOrEqual(6);
  });

  it("hibe dosyası yolu tezgâhta kendi UUID'sini üretmez", () => {
    // `onDeepen` kaldırıldı (Y4); hibe dosyası kendi odasında `paymentCommandKey` taşır.
    expect(workbench).not.toContain('"/api/tezgah/grant/dossier"');
    const desk = readSrc("components/hibe/project-desk.tsx");
    expect(desk).toContain("paymentCommandKey");
  });
});
