import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { paytrMarketplaceSplitPort } from "@/lib/kernel/payments/marketplace-split";

const ROOT = process.cwd();
const SYSTEM_DOCS_DIR = ".system_docs";

const SYSTEM_DOC_FILES = [
  "ANAYASA.md",
  "MANIFESTO.md",
  "OPS_RUNBOOK.md",
  "STORAGE_CONTRACT.md",
  "README.md",
] as const;

function missingSystemDocMessage(file: string): string {
  return [
    `Sistem belgesi eksik: .system_docs/${file}`,
    "Kalıcı belgeler /.system_docs altındadır. /docs günlük raporlama alanıdır; build fixture değildir.",
  ].join("\n");
}

function walkFiles(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === ".next") {
        continue;
      }
      out.push(...walkFiles(full));
    } else if (entry.endsWith(".test.ts")) {
      out.push(full);
    }
  }
  return out;
}

describe("Sistem Belge Sözleşmesi", () => {
  it("beş sistem dosyası durur (içerik uzunluğu fixture değildir)", () => {
    expect([...SYSTEM_DOC_FILES]).toEqual([
      "ANAYASA.md",
      "MANIFESTO.md",
      "OPS_RUNBOOK.md",
      "STORAGE_CONTRACT.md",
      "README.md",
    ]);
    for (const file of SYSTEM_DOC_FILES) {
      const full = join(ROOT, SYSTEM_DOCS_DIR, file);
      expect(existsSync(full), missingSystemDocMessage(file)).toBe(true);
    }
    expect(() => {
      const full = join(ROOT, SYSTEM_DOCS_DIR, "__yok__.md");
      if (!existsSync(full)) {
        throw new Error(missingSystemDocMessage("__yok__.md"));
      }
    }).toThrow(/Sistem belgesi eksik: \.system_docs\/__yok__\.md/);
  });

  it("kırmızı çizgiler kodda durur: float para yasak, split yoksa 503", async () => {
    expect(() => toAmountMinor(1.5)).toThrow();
    expect(() => toAmountMinor(-1)).toThrow();
    const hold = await paytrMarketplaceSplitPort.beginHold({
      buyerUserId: "alici",
      artisanUserId: "usta",
      referenceKey: "docs-contract",
      grossMinor: 10_000,
      holdBps: 1000,
      currencyCode: "TRY",
    });
    expect(hold).toEqual({ ok: false, reason: "not_configured" });
  });

  it("testler /docs markdown'ını okumaz; yalnız .system_docs doğrulanır", () => {
    const banned = [
      /read(?:FileSync|Src)\([^)]*docs\//,
      /existsSync\([^)]*docs\//,
      /["']docs\/ANAYASA\.md["']/,
      /["']docs\/07_OPS_RUNBOOK\.md["']/,
      /["']docs\/08_STORAGE_CONTRACT\.md["']/,
      /["']docs\/tedavi_raporu_[^"']+\.md["']/,
      /["']docs\/07_tedavi_raporu_[^"']+\.md["']/,
    ];
    const self = join(ROOT, "tests/kernel/system-docs-contract-surface.test.ts").replace(/\\/g, "/");
    for (const file of walkFiles(join(ROOT, "tests"))) {
      const rel = file.replace(`${ROOT}\\`, "").replace(`${ROOT}/`, "").replace(/\\/g, "/");
      if (file.replace(/\\/g, "/") === self) {
        continue;
      }
      if (rel.startsWith("tests/academy/")) {
        continue;
      }
      const source = readFileSync(file, "utf8");
      for (const pattern of banned) {
        expect(source, `${rel} ${pattern}`).not.toMatch(pattern);
      }
    }
  });
});
