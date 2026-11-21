import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { readStyleBundle } from "../helpers/style-bundle";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

/**
 * Faz 2 / P3 — performans tedavisi.
 *
 * Kilitlenen davranışlar:
 *   1. `workbench.tsx` ağır önizlemeleri statik import etmez; her yüzey
 *      `next/dynamic` ile kendi chunk'ında iner (yalnız seçilen araç).
 *   2. `/tezgah` kabuğundaki inline `<style>` bloğu kaldırıldı; yazdırma
 *      kuralları global stil katmanındadır.
 *   3. `globals.css` token ve `@keyframes` katmanları ayrı dosyalara bölündü;
 *      hiçbir token adı veya görsel değer değişmedi.
 */
describe("Faz 2 performans — workbench kod bölme", () => {
  it("ağır önizlemeler next/dynamic ile tembel yüklenir, statik import edilmez", () => {
    const workbench = readSrc("components/tezgah/workbench.tsx");
    expect(workbench).toContain('import dynamic from "next/dynamic"');

    const heavy = [
      { name: "DukkanPreview", module: "@/components/tezgah/dukkan-preview" },
      { name: "PazaryeriPreview", module: "@/components/tezgah/pazaryeri-preview" },
      { name: "ProStudioPreview", module: "@/components/tezgah/pro-studio-preview" },
      { name: "TetkikReportView", module: "@/components/tezgah/tetkik-report" },
      { name: "GrantProjectReportView", module: "@/components/tezgah/grant-project-report" },
    ] as const;

    for (const row of heavy) {
      // Statik import yok: `import { X } from "..."` biçimi kalmamalı.
      expect(workbench, row.name).not.toContain(`import { ${row.name} } from "${row.module}"`);
      // Dinamik yükleme var.
      expect(workbench, row.name).toContain(`import("${row.module}")`);
      expect(workbench, row.name).toContain(`const ${row.name} = dynamic(`);
    }

    // Her dinamik yükleme bir iskelet taşır (boş kutu / CLS yok).
    const dynamicCalls = workbench.match(/dynamic\(/g) ?? [];
    const loadingHints = workbench.match(/loading: \(\) =>/g) ?? [];
    expect(dynamicCalls.length).toBe(5);
    expect(loadingHints.length).toBe(5);
    expect(workbench).toContain("TezgahSurfaceSkeleton");
  });

  it("hafif iskelet ayrı modüldür ve erişilebilirlik metni taşır", () => {
    const skeleton = readSrc("components/tezgah/surface-skeleton.tsx");
    expect(skeleton).toContain("data-tezgah-surface-skeleton");
    expect(skeleton).toContain('role="status"');
    expect(skeleton).toContain('aria-live="polite"');
    expect(skeleton).toContain("Hazırlanıyor");
    // CSS animasyonu yok: `prefers-reduced-motion` bedeli doğmaz.
    expect(skeleton).not.toContain("animate-");
  });

  it("tezgâh kabuğu inline <style> basmaz; yazdırma kuralı global katmandadır", () => {
    const layout = readSrc("app/tezgah/layout.tsx");
    expect(layout).not.toContain("<style");
    expect(layout).not.toMatch(/@media print \{/);
    // Test kancası korunur (diğer yüzey testleri buna dayanır).
    expect(layout).toContain("LegalColophonStrip");

    // Kural kaybolmadı: global katmanda ve seçici aynı.
    const css = readStyleBundle();
    expect(css).toContain("[data-tezgah-chrome]");
    expect(css).toMatch(/@media print \{[\s\S]*\[data-tezgah-chrome\][\s\S]*display: none !important/);
  });
});

describe("Faz 2 performans — globals.css modülerleştirme", () => {
  it("token, animasyon ve ana katman ayrı dosyalardadır", () => {
    expect(existsSync(join(ROOT, "app/styles/tokens.css"))).toBe(true);
    expect(existsSync(join(ROOT, "app/styles/animations.css"))).toBe(true);

    const globals = readSrc("app/globals.css");
    expect(globals).toContain('@import "./styles/tokens.css"');
    expect(globals).toContain('@import "./styles/animations.css"');
    // Tailwind ilk sırada kalır (katman sırası bozulmaz).
    expect(globals.indexOf('@import "tailwindcss"')).toBeLessThan(
      globals.indexOf('@import "./styles/tokens.css"'),
    );
  });

  it("hiçbir @keyframes ana dosyada kalmaz; hepsi animasyon katmanındadır", () => {
    const globals = readSrc("app/globals.css");
    const animations = readSrc("app/styles/animations.css");
    expect(globals).not.toContain("@keyframes");
    const names = [
      "room-led",
      "nav-progress-indeterminate",
      "junior-card-shake",
      "academy-intro-bloom",
      "delivery-hero-glow",
      "junior-star-glow",
    ];
    for (const name of names) {
      expect(animations, name).toContain(`@keyframes ${name}`);
    }
    // Adlar korunur: hiçbir tüketici sınıfı kırılmaz.
    expect(globals).toContain("animation: room-led 2.4s ease-in-out infinite");
    expect(globals).toContain("animation: nav-progress-indeterminate 1.05s ease-in-out infinite");
  });

  it("token değerleri birebir korunur; ad değişmez", () => {
    const tokens = readSrc("app/styles/tokens.css");
    const pairs = [
      ["--background: #eef2f7;", true],
      ["--foreground: #0f172a;", true],
      ["--safir: #1a8cff;", true],
      ["--radius-card: 1.15rem;", true],
      ["--player-stage-min: 17.5rem;", true],
      ["--junior-page-chrome-h: 7rem;", true],
    ] as const;
    for (const [needle] of pairs) {
      expect(tokens, needle).toContain(needle);
    }
    // Kök token bloğu tek yerde: ana dosyada `:root` tanımı kalmadı.
    expect(readSrc("app/globals.css")).not.toContain(":root {");
    // Animasyon katmanında token tanımı yok (katman disiplini).
    expect(readSrc("app/styles/animations.css")).not.toContain("--safir:");
  });

  it("ana dosya küçüldü ve tek parça dev dosya değil", () => {
    const globals = readSrc("app/globals.css");
    const lineCount = globals.split(/\r?\n/).length;
    // Önce 7.013 satırdı; token (33) + 27 @keyframes (≈285) satırı çıktı.
    expect(lineCount).toBeLessThan(6_800);
    expect(lineCount).toBeGreaterThan(6_000);
  });
});
