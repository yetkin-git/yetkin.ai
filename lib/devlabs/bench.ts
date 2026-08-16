import { randomUUID } from "node:crypto";
import { appendLedgerEntry } from "@/lib/kernel/ledger/engine";
import type { LedgerStore } from "@/lib/kernel/ledger/types";
import { resolvePlatformTreasuryUserId } from "@/lib/kernel/escrow/engine";
import type { PriceCatalogStore } from "@/lib/kernel/pricing/catalog";
import { SETTLEMENT_CURRENCY, assertSameCurrency } from "@/lib/kernel/money/currency";
import { invokeLlm, type InvokeLlmDeps } from "@/lib/kernel/ai/llm-gateway";
import { AI_TOKEN_SOURCES } from "@/lib/kernel/ai/sources";
import type { AiTokenUsageStore } from "@/lib/kernel/ai/usage-store";
import type { InvokeLlmInput, LlmGatewayResult, LlmUsage } from "@/lib/kernel/ai/types";
import { sha256Hex } from "@/lib/kernel/crypto/sha256";
import { estimateLlmCostMinor } from "@/lib/kernel/ai/cost";
import { toAmountMinor, toPositiveAmountMinor, type AmountMinor } from "@/lib/kernel/money/amount-minor";
import { lintConstitutionalSource } from "@/lib/devlabs/constitutional-linter";
import type { DevLabsEnginePorts } from "@/lib/devlabs/engine";
import {
  DEVLABS_CODE_UNIT_KEY,
  DEVLABS_GENERATION_ROLE,
  DEVLABS_MODULE_KEY,
  type DevLabsArtifactRecord,
} from "@/lib/devlabs/types";

export const DEVLABS_SYSTEM_PROMPT =
  "Sen Yetkin Rail DevLabs kod tezgâhısın. Yalnız istenen kodu üret. Exec, sandbox runner veya sahte canlı iddia yok. Para tutarı amountMinor tam sayıdır; float TL ve amountKurus yasaktır. Çiğ SQL yazma.";

export const DEVLABS_PROMPT_MAX_CHARS = 4_000;

function resolveDevLabsDebitMinor(
  usage: Pick<LlmUsage, "promptTokens" | "completionTokens">,
  catalogFloorMinor: number,
): AmountMinor {
  const tokenCost = estimateLlmCostMinor(usage);
  const floor = toPositiveAmountMinor(catalogFloorMinor);
  return tokenCost > floor ? tokenCost : floor;
}

function estimatePromptTokenUsage(system: string, user: string): LlmUsage {
  const promptTokens = Math.max(1, Math.trunc((system.length + user.length) / 4));
  const completionTokens = 1;
  return {
    promptTokens,
    completionTokens,
    totalTokens: promptTokens + completionTokens,
  };
}

function toDevLabsCostMinor(usage: Pick<LlmUsage, "promptTokens" | "completionTokens">): AmountMinor {
  return toAmountMinor(estimateLlmCostMinor(usage));
}

export type DevLabsLlmInvoker = (
  input: InvokeLlmInput,
  deps?: InvokeLlmDeps,
) => Promise<LlmGatewayResult | null>;

export type DevLabsBenchPorts = DevLabsEnginePorts & {
  ledger: LedgerStore;
  catalog: PriceCatalogStore;
  usage: AiTokenUsageStore;
  invokeLlm?: DevLabsLlmInvoker;
  llmDeps?: InvokeLlmDeps;
};

export type GenerateDevLabsCodeCommand = {
  projectId: string;
  actorUserId: string;
  apiKeyId: string;
  prompt: string;
  platformUserId?: string;
  now?: Date;
};

export type DevLabsGenerateResult = {
  artifact: DevLabsArtifactRecord;
  debitMinor: DevLabsArtifactRecord["debitMinor"];
  linterOk: boolean;
};

function debitKey(artifactId: string): string {
  return `devlabs-debit:${artifactId}`;
}

function creditKey(artifactId: string): string {
  return `devlabs-credit:${artifactId}`;
}

function usageKey(artifactId: string): string {
  return `devlabs-usage:${artifactId}`;
}

function requirePrompt(raw: string): string {
  const prompt = raw.trim();
  if (!prompt) {
    throw new Error("Kod talebi boş.");
  }
  if (prompt.length > DEVLABS_PROMPT_MAX_CHARS) {
    throw new Error("Kod talebi çok uzun.");
  }
  return prompt;
}

/**
 * Generate → anayasal linter → artifact. Exec yoktur.
 * Artifact aktif anahtar kasasına bağlanır.
 */
export async function generateDevLabsCode(
  ports: DevLabsBenchPorts,
  command: GenerateDevLabsCodeCommand,
): Promise<DevLabsGenerateResult> {
  const prompt = requirePrompt(command.prompt);
  const project = await ports.devlabs.getProject(command.projectId);
  if (!project) {
    throw new Error("Proje bulunamadı.");
  }
  if (project.userId !== command.actorUserId) {
    throw new Error("Yalnız proje sahibi kod üretebilir.");
  }
  if (project.status !== "ACTIVE") {
    throw new Error("Arşivlenmiş projede tezgâh kapalı.");
  }

  const apiKey = await ports.devlabs.getApiKey(command.apiKeyId);
  if (!apiKey || apiKey.projectId !== project.id || apiKey.userId !== command.actorUserId) {
    throw new Error("Anahtar bu projeye bağlı değil.");
  }
  if (apiKey.revokedAt) {
    throw new Error("İptal anahtara artifact bağlanamaz.");
  }

  const entry = await ports.catalog.findActiveEntry(DEVLABS_MODULE_KEY, DEVLABS_CODE_UNIT_KEY);
  if (!entry) {
    throw new Error("DevLabs kod üretim fiyatı katalogda yok.");
  }
  if (entry.unitType !== "MINOR") {
    throw new Error("DevLabs kod üretim fiyatı MINOR biriminde olmalıdır.");
  }
  assertSameCurrency(entry.currencyCode, SETTLEMENT_CURRENCY);
  const catalogFloor = { amountMinor: entry.amountMinor, currencyCode: SETTLEMENT_CURRENCY };

  const estimatedUsage = estimatePromptTokenUsage(DEVLABS_SYSTEM_PROMPT, prompt);
  const estimatedDebit = resolveDevLabsDebitMinor(estimatedUsage, catalogFloor.amountMinor);
  const wallet = await ports.ledger.lockWallet(command.actorUserId, catalogFloor.currencyCode);
  if (wallet.amountMinor < estimatedDebit) {
    throw new Error("Yetersiz bakiye.");
  }

  const platformUserId = command.platformUserId ?? resolvePlatformTreasuryUserId();
  if (platformUserId === command.actorUserId) {
    throw new Error("Platform hazinesi üretici ile çakışamaz.");
  }

  const invoke = ports.invokeLlm ?? invokeLlm;
  const llm = await invoke(
    {
      role: DEVLABS_GENERATION_ROLE,
      system: DEVLABS_SYSTEM_PROMPT,
      user: prompt,
      rateLimit: { identifier: command.actorUserId, scope: DEVLABS_MODULE_KEY },
      billing: {
        userId: command.actorUserId,
        source: AI_TOKEN_SOURCES.DEVLABS,
        recordUsage: false,
      },
    },
    ports.llmDeps,
  );
  if (!llm) {
    throw new Error("DevLabs üretimi durduruldu (kota veya gümrük).");
  }

  const now = command.now ?? new Date();
  const artifactId = randomUUID();
  const costMinor = toDevLabsCostMinor(llm.usage);
  const debitMinor = resolveDevLabsDebitMinor(llm.usage, catalogFloor.amountMinor);
  const settledWallet = await ports.ledger.lockWallet(command.actorUserId, catalogFloor.currencyCode);
  if (settledWallet.amountMinor < debitMinor) {
    throw new Error("Yetersiz bakiye.");
  }

  const report = lintConstitutionalSource(llm.text);
  const ledgerDebitKey = debitKey(artifactId);

  const usage = await ports.usage.insert({
    id: randomUUID(),
    userId: command.actorUserId,
    source: AI_TOKEN_SOURCES.DEVLABS,
    provider: llm.provider,
    model: llm.model,
    roleKey: DEVLABS_GENERATION_ROLE,
    promptTokens: llm.usage.promptTokens,
    completionTokens: llm.usage.completionTokens,
    totalTokens: llm.usage.totalTokens,
    costMinor,
    currencyCode: catalogFloor.currencyCode,
    idempotencyKey: usageKey(artifactId),
    createdAt: now,
  });

  await appendLedgerEntry(ports.ledger, {
    userId: command.actorUserId,
    currencyCode: catalogFloor.currencyCode,
    amountMinor: debitMinor,
    direction: "DEBIT",
    label: "DevLabs kod üretim",
    purpose: "devlabs-generation",
    idempotencyKey: ledgerDebitKey,
  });

  await appendLedgerEntry(ports.ledger, {
    userId: platformUserId,
    currencyCode: catalogFloor.currencyCode,
    amountMinor: debitMinor,
    direction: "CREDIT",
    label: "DevLabs kod settlement",
    purpose: "devlabs-settlement",
    idempotencyKey: creditKey(artifactId),
  });

  const artifact = await ports.devlabs.insertArtifact({
    id: artifactId,
    projectId: project.id,
    userId: command.actorUserId,
    apiKeyId: apiKey.id,
    prompt,
    outputCode: llm.text,
    linterOk: report.ok,
    linterScore: report.score,
    linterReportJson: JSON.stringify(report),
    contentHash: sha256Hex(llm.text),
    roleKey: DEVLABS_GENERATION_ROLE,
    provider: llm.provider,
    model: llm.model,
    promptTokens: llm.usage.promptTokens,
    completionTokens: llm.usage.completionTokens,
    totalTokens: llm.usage.totalTokens,
    costMinor,
    debitMinor,
    currencyCode: catalogFloor.currencyCode,
    usageId: usage.id,
    ledgerDebitKey,
    createdAt: now,
  });

  return { artifact, debitMinor, linterOk: report.ok };
}
