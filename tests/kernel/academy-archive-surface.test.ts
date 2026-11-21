import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { isFrozenShellPagePath } from "@/lib/kernel/compliance/circuit-breakers";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "dist", "coverage", "generated", "yetkin_muze"]);

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry)) out.push(relative(ROOT, full).replace(/\\/g, "/"));
  }
  return out;
}

describe("Akademi odası arşivi — canlı derleme yükünden çıktı", () => {
  it("app, tests ve kullanılmayan components academy canlı ağaçta yok", () => {
    expect(existsSync(join(ROOT, "app/academy"))).toBe(false);
    expect(existsSync(join(ROOT, "tests/academy"))).toBe(false);
    // Arşiv kopyaları durur: oda geri açılacaksa tarih burada.
    expect(existsSync(join(ROOT, "archived/academy/app/page.tsx"))).toBe(true);
    expect(existsSync(join(ROOT, "archived/academy/app/dogrula/[hash]/page.tsx"))).toBe(true);
    expect(existsSync(join(ROOT, "archived/academy/tests"))).toBe(true);
  });

  it("canlı kod arşivden import etmez (tek yön: arşiv → canlı okunmaz)", () => {
    const live = walk(join(ROOT, "app"))
      .concat(walk(join(ROOT, "lib")))
      .concat(walk(join(ROOT, "components")))
      .concat(walk(join(ROOT, "packages")));
    const offenders: string[] = [];
    for (const file of live) {
      const source = readSrc(file);
      if (/from\s+["'](@\/)?archived\//.test(source)) {
        offenders.push(file);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("kullanıcının saydığı canlı bağımlılıklar academy'den kopmadı", () => {
    // Bu üç dosya canlı akışta; academy import'u kalabilir ama kırılmamalı.
    expect(existsSync(join(ROOT, "lib/dronlar/kayit.ts"))).toBe(true);
    expect(existsSync(join(ROOT, "lib/kernel/compliance/circuit-breakers.ts"))).toBe(true);
    expect(existsSync(join(ROOT, "lib/pricing/showcase-price.ts"))).toBe(true);
    // showcase-price hâlâ pilot-sku'ya bağlı; o dosya yerinde durmalı.
    expect(existsSync(join(ROOT, "lib/academy/pilot-sku.ts"))).toBe(true);
    expect(readSrc("lib/pricing/showcase-price.ts")).toContain("@/lib/academy/pilot-sku");
  });

  it("/academy/* kenarda 410 kalır; arşiv taşıması yüzeyi açmadı", () => {
    for (const path of ["/academy", "/academy/01_office_ai", "/academy/ileri", "/academy/certificates"]) {
      expect(isFrozenShellPagePath(path), path).toBe(true);
    }
    expect(readSrc("lib/dronlar/kayit.ts")).toMatch(/id:\s*"academy"[\s\S]*?kapali:\s*true/);
    // Arşivlense de kayıt defteri satırı durur: nav ve 410 aynı SSOT'u okur.
    expect(readSrc("lib/dronlar/kayit.ts")).toContain('"academy"');
  });

  it("junior modülü ve testleri dokunulmadı", () => {
    expect(existsSync(join(ROOT, "lib/junior"))).toBe(true);
    expect(existsSync(join(ROOT, "tests/junior"))).toBe(true);
    expect(existsSync(join(ROOT, "app/junior"))).toBe(true);
    // Junior akademi takma adı yok; canlı klasöre düşer.
    expect(readSrc("vitest.aliases.ts")).toContain("LIVE_VITEST_ARCHIVE_ROOMS = []");
  });

  it("vitest canlı suite arşivi koşmaz; frozen config arşiv testlerini bilir", () => {
    const live = readSrc("vitest.config.ts");
    expect(live).toContain('"archived/**"');
    expect(live).not.toContain('"tests/academy/');
    const frozen = readSrc("vitest.frozen.config.ts");
    expect(frozen).toContain("archived/academy/tests/**/*.test.ts");
    // tsconfig arşivi tip denetimi dışında tutar.
    expect(readSrc("tsconfig.json")).toContain('"archived"');
  });
});
