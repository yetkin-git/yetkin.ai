import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("AI gümrük varsayılan bütçe zırhı yüzeyi", () => {
  it("invokeLlm ve generateImage çağrı başına bellek kovası açmaz", () => {
    const gateway = readSrc("lib/kernel/ai/llm-gateway.ts");
    expect(gateway).toContain("createPrismaBudgetShieldPort()");
    expect(gateway).not.toContain("createMemoryBudgetShieldPort");
    expect(gateway).toContain("deps.budgetPort ?? createPrismaBudgetShieldPort()");
    const defaults = gateway.split("createPrismaBudgetShieldPort()").length - 1;
    expect(defaults).toBe(2);
  });

  it("Prisma portu AiTokenUsage günlük agrega okur", () => {
    const port = readSrc("lib/kernel/ai/prisma-budget-shield.ts");
    expect(port).toContain("aiTokenUsage.aggregate");
    expect(port).toContain("costMinor");
    expect(port).toContain("totalTokens");
    expect(port).toContain("startOfEuropeIstanbulDay");
    expect(port).toContain("countUserRowsSince");
  });
});
