import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { RETIRED_SYSTEM_DOC, SYSTEM_DOC_FILES } from "./system-docs-manifest";

const ROOT = process.cwd();

function walk(dir: string, out: string[]): void {
  if (!existsSync(dir)) {
    return;
  }
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next") {
      continue;
    }
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walk(full, out);
    } else if (/\.(ts|tsx|mjs|js)$/.test(entry)) {
      out.push(full);
    }
  }
}

describe("sistem belge kapsaması", () => {
  it("her belge README bilgi evinde, bir kod veya test atfında ve ops indekste durur", () => {
    const readme = readFileSync(join(ROOT, ".system_docs", "README.md"), "utf8");
    const runbook = readFileSync(join(ROOT, ".system_docs", "OPS_RUNBOOK.md"), "utf8");
    const sources: string[] = [];
    for (const dir of ["tests", "lib", "app", "scripts", "components"]) {
      walk(join(ROOT, dir), sources);
    }
    const self = join(ROOT, "tests", "kernel", "system-docs-coverage.test.ts");
    const corpus = sources
      .filter((file) => file !== self)
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");

    for (const file of SYSTEM_DOC_FILES) {
      expect(existsSync(join(ROOT, ".system_docs", file)), file).toBe(true);
      expect(readme, file).toContain(file);
      expect(corpus, file).toContain(file);
      if (file.startsWith("ops/")) {
        expect(runbook, file).toContain(file.slice("ops/".length));
      }
    }

    expect(corpus).toContain("AKADEMI_URETIM_ANAYASASI.md");
    expect(corpus).toContain("ops/ops-paytr.md");
    expect(corpus).toContain("ops/ops-inngest.md");
    expect(existsSync(join(ROOT, ".system_docs", RETIRED_SYSTEM_DOC))).toBe(false);
  });
});