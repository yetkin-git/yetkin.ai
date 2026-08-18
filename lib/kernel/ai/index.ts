export { invokeLlm, generateImage, normalizeUsage, resolveGeminiGatewayClient } from "@/lib/kernel/ai/llm-gateway";
export type { InvokeLlmDeps, UsageRecorder } from "@/lib/kernel/ai/llm-gateway";
export {
  AI_LIVE_MODEL_ROLE_KEYS,
  AI_MODEL_ROLE_DEFAULTS,
  AI_MODEL_ROLE_KEYS,
  AI_SEALED_DEAD_FACTORY_ERROR,
  AI_SEALED_DEAD_ROLE_KEYS,
  AiGatewayForbiddenError,
  assertLiveAiModelRole,
  canonicalizeAiModelRole,
  getDefaultModelId,
  isAiModelRoleKey,
  isLiveAiModelRoleKey,
  isSealedDeadAiModelRole,
  type AiLiveModelRoleKey,
  type AiModelRoleKey,
  type AiSealedDeadRoleKey,
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
