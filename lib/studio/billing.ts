import { toAmountMinor, toPositiveAmountMinor, type AmountMinor } from "@/lib/kernel/money/amount-minor";
import { estimateLlmCostMinor } from "@/lib/kernel/ai/cost";
import type { LlmUsage } from "@/lib/kernel/ai/types";

/**
 * Cüzdan debiti = max(token maliyeti, katalog tabanı).
 * Token maliyeti 0 olsa bile katalog tabanı düşer (S11-A; taban veri).
 */
export function resolveStudioDebitMinor(
  usage: Pick<LlmUsage, "promptTokens" | "completionTokens">,
  catalogFloorMinor: number,
): AmountMinor {
  const tokenCost = estimateLlmCostMinor(usage);
  const floor = toPositiveAmountMinor(catalogFloorMinor);
  return tokenCost > floor ? tokenCost : floor;
}

export function estimatePromptTokenUsage(system: string, user: string): LlmUsage {
  const promptTokens = Math.max(1, Math.trunc((system.length + user.length) / 4));
  const completionTokens = 1;
  return {
    promptTokens,
    completionTokens,
    totalTokens: promptTokens + completionTokens,
  };
}

export function toStudioCostMinor(usage: Pick<LlmUsage, "promptTokens" | "completionTokens">): AmountMinor {
  return toAmountMinor(estimateLlmCostMinor(usage));
}
