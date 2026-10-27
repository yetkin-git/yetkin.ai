import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Konu sonu soru metinleri şablon artığı taşımaz (FAZ 37 §1).
 * Kaynaklar: `lib/junior/quiz/<ders>/<n>.ts` (TypeScript) ve `packages/junior-content/quiz/*.json` (kopya).
 * Bilinen kalıplar:
 *  - "Okulda arkadaşınla <konu> problemini çözerken şunu okuyorsun: <soru>"
 *  - "Okulda arkadaşınla <senaryo>. <soru>? Cümleyi defterindeki veriye göre işaretle."
 *  - "... cümlesini oku ve uygun yargıyı işaretle." (eski kalıp)
 */
const root = process.cwd();
const TEMPLATE_RESIDUE =
  /uygun yargıyı işaretle|cümlesini oku ve|Okulda arkadaşınla|şunu okuyorsun|problemini çözerken|Cümleyi [^"\n]{0,80}işaretle/u;

function quizSources(): { path: string; text: string }[] {
  const rows: { path: string; text: string }[] = [];
  for (const dir of ["mat", "fen", "turkce", "sosyal", "ing"]) {
    const abs = join(root, "lib/junior/quiz", dir);
    for (const name of readdirSync(abs)) {
      if (/^\d+\.ts$/u.test(name)) {
        const path = join(abs, name);
        rows.push({ path, text: readFileSync(path, "utf8") });
      }
    }
  }
  const json = join(root, "packages/junior-content/quiz");
  for (const name of readdirSync(json)) {
    if (name.endsWith(".json")) {
      const path = join(json, name);
      rows.push({ path, text: readFileSync(path, "utf8") });
    }
  }
  return rows;
}

describe("Junior quiz metinleri şablon artığı taşımaz", () => {
  it("TypeScript ve JSON kaynaklarında şablon kalıbı yoktur", () => {
    const sources = quizSources();
    expect(sources.length).toBeGreaterThan(0);
    const leaks = sources.filter((row) => TEMPLATE_RESIDUE.test(row.text)).map((row) => row.path);
    expect(leaks).toEqual([]);
  });

  it("açılış dersi üslü taslak değildir", () => {
    const scenario = readFileSync(join(root, "lib/junior/content/mat/1.ts"), "utf8");
    expect(existsSync(join(root, "lib/junior/quiz/mat/1.ts"))).toBe(true);
    expect(existsSync(join(root, "packages/junior-content/quiz/jr_06_mat-1.json"))).toBe(true);
    expect(scenario).toContain('key: "jr_06_mat-1"');
    expect(scenario).not.toContain("Üslü ifadede");
    expect(scenario).not.toContain("KARANTINA");
  });
});
