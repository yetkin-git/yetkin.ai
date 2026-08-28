import { describe, expect, it } from "vitest";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { createMemoryBudgetShieldPort } from "@/lib/kernel/ai/budget-shield";
import type { LlmProviderAdapter, LlmUsage } from "@/lib/kernel/ai/types";
import {
  createDevLabsProject,
  issueDevLabsApiKey,
} from "@/lib/devlabs/engine";
import { generateDevLabsCode } from "@/lib/devlabs/bench";
import { lintConstitutionalSource } from "@/lib/devlabs/constitutional-linter";
import { DEVLABS_CODE_UNIT_KEY, DEVLABS_MODULE_KEY } from "@/lib/devlabs/types";
import { createMemoryLedgerStore } from "../helpers/memory-money";
import { createMemoryPriceCatalogStore } from "../helpers/memory-pricing";
import { createMemoryAiTokenUsageStore } from "../helpers/memory-studio";
import { createMemoryDevLabsStore } from "../helpers/memory-devlabs";
import { createMemoryPaidCommandStore, mintTestCommandKey } from "../helpers/memory-paid-command";

const OWNER = "devlabs-bench-owner";
const PLATFORM = PLATFORM_TREASURY_USER_ID;
const CATALOG_FLOOR = 150;
const LIGHT_USAGE: LlmUsage = { promptTokens: 12, completionTokens: 20, totalTokens: 32 };

const CLEAN_CODE = `export function debit(amountMinor: number) {
  return amountMinor;
}
`;

const DIRTY_CODE = `const amountTL = parseFloat("10.50");
await prisma.$queryRawUnsafe("SELECT * FROM users WHERE id = " + req.query.id);
eval(userInput);
`;

function fakeGemini(text: string): LlmProviderAdapter & { calls: number } {
  const adapter = {
    id: "gemini" as const,
    calls: 0,
    async complete() {
      adapter.calls += 1;
      return { text, usage: LIGHT_USAGE };
    },
  };
  return adapter;
}

async function seeded(text: string, buyerBalance = 10_000) {
  const adapter = fakeGemini(text);
  const ledger = createMemoryLedgerStore([
    { userId: OWNER, amountMinor: buyerBalance },
    { userId: PLATFORM, amountMinor: 0 },
  ]);
  const catalog = createMemoryPriceCatalogStore([
    { moduleKey: DEVLABS_MODULE_KEY, unitKey: DEVLABS_CODE_UNIT_KEY, amountMinor: CATALOG_FLOOR },
  ]);
  const usage = createMemoryAiTokenUsageStore();
  const devlabs = createMemoryDevLabsStore();
  const ports = {
    devlabs,
    ledger,
    catalog,
    usage,
    commands: createMemoryPaidCommandStore(),
    llmDeps: { providers: { gemini: adapter }, budgetPort: createMemoryBudgetShieldPort() },
  };
  const project = await createDevLabsProject(ports, {
    ownerUserId: OWNER,
    name: "Tezgâh",
    summary: "Generate + linter.",
  });
  const issued = await issueDevLabsApiKey(ports, {
    projectId: project.id,
    actorUserId: OWNER,
    name: "ci",
  });
  return { adapter, ledger, usage, ports, project, issued };
}

describe("DevLabs anayasal linter ve kod tezgâhı", () => {
  it("temiz kod: generate + yeşil linter + artifact kasa anahtarına bağlı + debit", async () => {
    const ctx = await seeded(CLEAN_CODE);
    const result = await generateDevLabsCode(ctx.ports, {
      projectId: ctx.project.id,
      actorUserId: OWNER,
      apiKeyId: ctx.issued.record.id,
      commandKey: mintTestCommandKey(),
      prompt: "amountMinor debit fonksiyonu yaz.",
      platformUserId: PLATFORM,
    });
    expect(ctx.adapter.calls).toBe(1);
    expect(result.linterOk).toBe(true);
    expect(result.artifact.linterScore).toBe(100);
    expect(result.artifact.apiKeyId).toBe(ctx.issued.record.id);
    expect(result.artifact.contentHash).toMatch(/^[a-f0-9]{64}$/);
    expect(result.debitMinor).toBe(CATALOG_FLOOR);
    expect(ctx.ledger.snapshot(OWNER).amountMinor).toBe(10_000 - CATALOG_FLOOR);
    expect(ctx.usage.list()).toHaveLength(1);
    expect(ctx.usage.list()[0]?.source).toBe("devlabs");
    expect(JSON.stringify(result.artifact)).not.toContain(ctx.issued.plaintext);
  });

  it("float/kuruş + çiğ SQL + eval: linter kırmızı, artifact yine mühürlenir", async () => {
    const staticReport = lintConstitutionalSource(DIRTY_CODE);
    expect(staticReport.ok).toBe(false);
    expect(staticReport.violations.some((row) => row.kind === "kurus_discipline")).toBe(true);
    expect(staticReport.violations.some((row) => row.kind === "raw_sql")).toBe(true);
    expect(staticReport.violations.some((row) => row.kind === "security")).toBe(true);

    const ctx = await seeded(DIRTY_CODE);
    const result = await generateDevLabsCode(ctx.ports, {
      projectId: ctx.project.id,
      actorUserId: OWNER,
      apiKeyId: ctx.issued.record.id,
      commandKey: mintTestCommandKey(),
      prompt: "kirli örnek",
      platformUserId: PLATFORM,
    });
    expect(result.linterOk).toBe(false);
    expect(result.artifact.outputCode).toContain("parseFloat");
    expect(ctx.ledger.snapshot(OWNER).amountMinor).toBe(10_000 - CATALOG_FLOOR);
  });

  it("yetersiz bakiyede LLM yok; iptal anahtara bağlanmaz", async () => {
    const ctx = await seeded(CLEAN_CODE, 10);
    await expect(
      generateDevLabsCode(ctx.ports, {
        projectId: ctx.project.id,
        actorUserId: OWNER,
        apiKeyId: ctx.issued.record.id,
        commandKey: mintTestCommandKey(),
        prompt: "kod",
        platformUserId: PLATFORM,
      }),
    ).rejects.toThrow(/Yetersiz bakiye/);
    expect(ctx.adapter.calls).toBe(0);

    const rich = await seeded(CLEAN_CODE);
    await rich.ports.devlabs.updateApiKey(rich.issued.record.id, { revokedAt: new Date() });
    await expect(
      generateDevLabsCode(rich.ports, {
        projectId: rich.project.id,
        actorUserId: OWNER,
        apiKeyId: rich.issued.record.id,
        commandKey: mintTestCommandKey(),
        prompt: "kod",
        platformUserId: PLATFORM,
      }),
    ).rejects.toThrow(/İptal anahtar/);
    expect(rich.adapter.calls).toBe(0);
  });
});
