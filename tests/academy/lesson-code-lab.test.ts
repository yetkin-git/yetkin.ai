import { describe, expect, it } from "vitest";
import {
  academyLabLanguageLabel,
  pickAcademyLabSource,
  runAcademyLabSource,
  transpileAcademyPythonSubset,
} from "@/archived/lib/academy-studio/lesson-code-lab-run";
import { PYTHON_PATHWAY_PRACTICE } from "@/lib/academy/lesson-practice-python";

describe("akademi kod laboratuvarı", () => {
  it("python-temel print ve dalı çalıştırır", () => {
    const merhaba = runAcademyLabSource("py", PYTHON_PATHWAY_PRACTICE["python-temel-1"]!.code.source);
    expect(merhaba.ok).toBe(true);
    expect(merhaba.kind).toBe("ran");
    expect(merhaba.stdout).toContain("Merhaba, Yetkin");

    const dal = runAcademyLabSource("py", PYTHON_PATHWAY_PRACTICE["python-temel-3"]!.code.source);
    expect(dal.ok).toBe(true);
    expect(dal.stdout).toContain("geçti");

    const toplam = runAcademyLabSource("py", PYTHON_PATHWAY_PRACTICE["python-temel-4"]!.code.source);
    expect(toplam.ok).toBe(true);
    expect(toplam.stdout).toContain("15");
  });

  it("input() girdi kuyruğunu okur; pandas önizlemedir", () => {
    const adet = runAcademyLabSource("py", PYTHON_PATHWAY_PRACTICE["python-temel-6"]!.code.source, "3");
    expect(adet.ok).toBe(true);
    expect(adet.stdout).toContain("adet=3");

    const pandas = runAcademyLabSource("py", PYTHON_PATHWAY_PRACTICE["python-orta-1"]!.code.source);
    expect(pandas.ok).toBe(true);
    expect(pandas.kind).toBe("preview");
  });

  it("json doğrular; kod bloğunu dersten seçer", () => {
    const json = runAcademyLabSource("json", '{ "ok": true }');
    expect(json.ok).toBe(true);
    expect(json.kind).toBe("json");
    expect(json.stdout).toContain('"ok": true');
    expect(academyLabLanguageLabel("py")).toBe("python");
    const picked = pickAcademyLabSource({
      blocks: [{ kind: "code", language: "py", source: 'print("x")' }],
    });
    expect(picked?.source).toContain("print");
    expect(transpileAcademyPythonSubset('print("Merhaba")')).toContain("print(");
  });
});
