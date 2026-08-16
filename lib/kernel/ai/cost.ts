import { toAmountMinor, type AmountMinor } from "@/lib/kernel/money/amount-minor";

/** TRY minor / milyon token — Super Admin kataloğu gelene kadar muhasebe tabanı. */
export const LLM_COST_PROMPT_PER_MILLION_MINOR = 50;
export const LLM_COST_COMPLETION_PER_MILLION_MINOR = 150;

function costForTokens(tokens: number, perMillionMinor: number): number {
  if (!Number.isInteger(tokens) || tokens < 0) {
    throw new Error("Token sayısı negatif olmayan tam sayı olmalıdır.");
  }
  return Math.floor((tokens * perMillionMinor) / 1_000_000);
}

export function estimateLlmCostMinor(input: {
  promptTokens: number;
  completionTokens: number;
}): AmountMinor {
  const prompt = costForTokens(input.promptTokens, LLM_COST_PROMPT_PER_MILLION_MINOR);
  const completion = costForTokens(
    input.completionTokens,
    LLM_COST_COMPLETION_PER_MILLION_MINOR,
  );
  return toAmountMinor(prompt + completion);
}
