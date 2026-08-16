export { invokeLlm, generateImage, normalizeUsage, resolveGeminiGatewayClient } from "@/lib/kernel/ai/llm-gateway";
export type { InvokeLlmDeps, UsageRecorder } from "@/lib/kernel/ai/llm-gateway";
export {
  AI_MODEL_ROLE_DEFAULTS,
  AI_MODEL_ROLE_KEYS,
  canonicalizeAiModelRole,
  getDefaultModelId,
  isAiModelRoleKey,
  type AiModelRoleKey,
} from "@/lib/kernel/ai/model-roles";
export { AI_TOKEN_SOURCES, type AiTokenSource } from "@/lib/kernel/ai/sources";
export { estimateLlmCostMinor } from "@/lib/kernel/ai/cost";
export {
  assertGatewayBudgetAllows,
  createMemoryBudgetShieldPort,
  startOfEuropeIstanbulDay,
  GATEWAY_USER_DAILY_TOKEN_QUOTA,
  DEFAULT_PLATFORM_DAILY_AI_CAP_MINOR,
} from "@/lib/kernel/ai/budget-shield";
export { createPrismaBudgetShieldPort } from "@/lib/kernel/ai/prisma-budget-shield";
export type { InvokeLlmInput, InvokeImageInput, LlmGatewayResult, ImageGatewayResult } from "@/lib/kernel/ai/types";
export type { AiTokenUsageRecord, AiTokenUsageStore } from "@/lib/kernel/ai/usage-store";
