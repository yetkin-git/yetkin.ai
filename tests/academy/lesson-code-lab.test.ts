import { describe, expect, it } from "vitest";
import {
  academyLabLanguageLabel,
  pickAcademyLabSource,
  runAcademyLabSource,
  transpileAcademyPythonSubset,
} from "@/archived/lib/academy-studio/lesson-code-lab-run";
import { PYTHON_PATHWAY_PRACTICE } from "@/lib/academy/lesson-practice-python";
import { AI_AGENT_ILERI_PRACTICE, AI_AGENT_ORTA_PRACTICE, AI_AGENT_TEMEL_PRACTICE } from "@/lib/academy/lesson-practice-ai-agent";

describe("akademi kod laboratuvarı", () => {
  it("python-temel değişken, dal ve döngüyü çalıştırır", () => {
    const kutular = runAcademyLabSource("py", PYTHON_PATHWAY_PRACTICE["python-temel-1"]!.code.source);
    expect(kutular.ok).toBe(true);
    expect(kutular.kind).toBe("ran");
    expect(kutular.stdout).toContain("Ayşe");
    expect(kutular.stdout).toContain("50000");

    const dal = runAcademyLabSource("py", PYTHON_PATHWAY_PRACTICE["python-temel-2"]!.code.source);
    expect(dal.ok).toBe(true);
    expect(dal.stdout).toContain("geçti");

    const toplam = runAcademyLabSource("py", PYTHON_PATHWAY_PRACTICE["python-temel-3"]!.code.source);
    expect(toplam.ok).toBe(true);
    expect(toplam.stdout).toContain("15");
  });

  it("input() girdi kuyruğunu okur; pandas önizlemedir", () => {
    const adet = runAcademyLabSource("py", PYTHON_PATHWAY_PRACTICE["python-temel-6"]!.code.source);
    expect(adet.ok).toBe(true);
    expect(adet.stdout).toContain("3");

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

  it("ai-agent-temel laboratuvarı sohbet ve durma kapısını çalıştırır", () => {
    const ajan = runAcademyLabSource("py", AI_AGENT_TEMEL_PRACTICE["ai-agent-temel-1"]!.code.source);
    expect(ajan.ok).toBe(true);
    expect(ajan.kind).toBe("ran");
    expect(ajan.stdout).toContain("Sanirim hava güzel.");
    expect(ajan.stdout).toContain("18");
    expect(ajan.stdout).toContain("islem durur");
  });

  it("ai-agent-orta laboratuvarı boş getiri kapısını çalıştırır", () => {
    const rag = runAcademyLabSource("py", AI_AGENT_ORTA_PRACTICE["ai-agent-orta-1"]!.code.source);
    expect(rag.ok).toBe(true);
    expect(rag.kind).toBe("ran");
    expect(rag.stdout).toContain("18 palet");
    expect(rag.stdout).toContain("islem durur");
  });

  it("ai-agent-ileri laboratuvarı kenar ve korkuluk kapısını çalıştırır", () => {
    const grafik = runAcademyLabSource("py", AI_AGENT_ILERI_PRACTICE["ai-agent-ileri-1"]!.code.source);
    expect(grafik.ok).toBe(true);
    expect(grafik.kind).toBe("ran");
    expect(grafik.stdout).toContain("18");
    expect(grafik.stdout).toContain("islem durur");
    const korkuluk = runAcademyLabSource("py", AI_AGENT_ILERI_PRACTICE["ai-agent-ileri-3"]!.code.source);
    expect(korkuluk.ok).toBe(true);
    expect(korkuluk.stdout).toContain("yetkisiz eylem");
    expect(korkuluk.stdout).toContain("enjeksiyon");
  });
});
