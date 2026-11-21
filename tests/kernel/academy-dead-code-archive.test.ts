import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "dist",
  "coverage",
  "generated",
  "yetkin_muze",
]);

function walkLive(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) {
    return out;
  }
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walkLive(full, out);
    else if (/\.(ts|tsx)$/.test(entry)) out.push(relative(ROOT, full).replace(/\\/g, "/"));
  }
  return out;
}

/**
 * Faz 2 / P2 — mimari temizlik: ölü satış vitrini bileşenleri arşivlendi.
 *
 * Tespit #13: `components/academy` altındaki `course-card`, `course-list` ve
 * `begin-checkout-link` hiçbir canlı rota tarafından kullanılmıyordu; `/academy`
 * odası arşivde olduğu için bu üç dosya canlı derleme yükündeydi.
 *
 * **Korunan zincir:** `/vize/[id]` sertifika doğrulaması (`loadPublicAcademyVerifyByHash`,
 * `pilot-sku`, `production-seal`) ve `course-cover-image`, `certificate-share-actions`,
 * `certificate-verify-qr` bileşenleri canlıdır — bunlara dokunulmadı.
 */
describe("Faz 2 mimari temizlik — ölü vitrin bileşenleri arşivde", () => {
  it("üç ölü satış vitrini bileşeni canlı ağaçta yok, arşivde var", () => {
    for (const name of ["course-card", "course-list", "begin-checkout-link"]) {
      expect(existsSync(join(ROOT, `components/academy/${name}.tsx`)), name).toBe(false);
      expect(existsSync(join(ROOT, `archived/academy/components/${name}.tsx`)), name).toBe(true);
    }
  });

  it("canlı bileşenler yerinde durur (doğrulama ve ödeme zinciri)", () => {
    for (const name of [
      "course-cover-image",
      "certificate-share-actions",
      "certificate-verify-qr",
    ]) {
      expect(existsSync(join(ROOT, `components/academy/${name}.tsx`)), name).toBe(true);
    }
    // Kapak bileşeni kamu listeleme kartında hâlâ kullanılır.
    expect(readSrc("components/showcase/listing-card.tsx")).toContain(
      "@/components/academy/course-cover-image",
    );
    // Paylaşım ve QR bileşenleri kamu kanıt kartında canlıdır.
    expect(readSrc("components/career/public-talent-board.tsx")).toContain(
      "@/components/academy/certificate-share-actions",
    );
    expect(readSrc("components/career/public-talent-board.tsx")).toContain(
      "@/components/academy/certificate-verify-qr",
    );
  });

  it("hiçbir canlı dosya taşınan üç bileşeni import etmez", () => {
    const liveTrees = ["app", "components", "lib", "packages"];
    const offenders: string[] = [];
    for (const tree of liveTrees) {
      for (const file of walkLive(join(ROOT, tree))) {
        const source = readSrc(file);
        for (const name of ["course-card", "course-list", "begin-checkout-link"]) {
          if (source.includes(`@/components/academy/${name}`)) {
            offenders.push(`${file} → ${name}`);
          }
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("korunan doğrulama zinciri kırılmadı", () => {
    expect(existsSync(join(ROOT, "lib/academy/load.ts"))).toBe(true);
    expect(readSrc("app/(public)/vize/[id]/page.tsx")).toContain("loadPublicAcademyVerifyByHash");
    expect(existsSync(join(ROOT, "lib/academy/pilot-sku.ts"))).toBe(true);
    expect(existsSync(join(ROOT, "lib/academy/production-standard.ts"))).toBe(true);
    expect(existsSync(join(ROOT, "lib/academy/production-seal-manifest.ts"))).toBe(true);
  });

  it("arşiv testleri taşınan bileşenleri arşiv yolundan okur", () => {
    const frozen = readSrc("vitest.frozen.config.ts");
    expect(frozen).toContain("archived/academy/components");
    expect(frozen).toContain("course-card");
    expect(frozen).toContain("course-list");
    expect(frozen).toContain("begin-checkout-link");
  });
});
