import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { jsonFromUnknown } from "@/lib/kernel/http/json";
import { ForbiddenError } from "@/lib/kernel/http/errors";
import { invokeLlm } from "@/lib/kernel/ai/llm-gateway";
import { createMemoryBudgetShieldPort } from "@/lib/kernel/ai/budget-shield";
import {
  AI_LIVE_MODEL_ROLE_KEYS,
  AI_MODEL_ROLE_DEFAULTS,
  AI_MODEL_ROLE_KEYS,
  AI_SEALED_DEAD_FACTORY_ERROR,
  AI_SEALED_DEAD_ROLE_KEYS,
  AiGatewayForbiddenError,
  assertLiveAiModelRole,
  getDefaultModelId,
  isLiveAiModelRoleKey,
  isSealedDeadAiModelRole,
} from "@/lib/kernel/ai/model-roles";
import type { InvokeLlmInput, LlmProviderAdapter } from "@/lib/kernel/ai/types";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("VIDEO_GEN mühürlü-ölü; VOICE_TTS generateSpeech factory", () => {
  it("tavan 8 kalır; canlı 7; VIDEO_GEN factory default taşımaz; VOICE_TTS taşır", () => {
    expect(AI_MODEL_ROLE_KEYS).toHaveLength(8);
    expect(AI_LIVE_MODEL_ROLE_KEYS).toHaveLength(7);
    expect(AI_SEALED_DEAD_ROLE_KEYS).toEqual(["VIDEO_GEN"]);
    expect("VIDEO_GEN" in AI_MODEL_ROLE_DEFAULTS).toBe(false);
    expect("VOICE_TTS" in AI_MODEL_ROLE_DEFAULTS).toBe(true);
    expect(isSealedDeadAiModelRole("VIDEO_GEN")).toBe(true);
    expect(isSealedDeadAiModelRole("VOICE_TTS")).toBe(false);
    expect(isLiveAiModelRoleKey("VIDEO_GEN")).toBe(false);
    expect(isLiveAiModelRoleKey("VOICE_TTS")).toBe(true);
    expect(isLiveAiModelRoleKey("FAST_STREAM")).toBe(true);
  });

  it("assert ve getDefaultModelId VIDEO_GEN'de AiGatewayForbiddenError fırlatır", () => {
    expect(() => assertLiveAiModelRole("VIDEO_GEN")).toThrow(AiGatewayForbiddenError);
    expect(() => assertLiveAiModelRole("VIDEO_GEN")).toThrow(AI_SEALED_DEAD_FACTORY_ERROR);
    expect(() => getDefaultModelId("VIDEO_GEN")).toThrow(AiGatewayForbiddenError);
    expect(getDefaultModelId("VOICE_TTS")).toBe("gemini-3.1-flash-tts-preview");
    expect(getDefaultModelId("FAST_STREAM")).toBe("gemini-3.6-flash");
    expect(getDefaultModelId("LITE_STREAM")).toBe("gemini-3.5-flash-lite");
  });

  it("invokeLlm mühürlü rolde sağlayıcıya gitmeden 403 kapısına düşer", async () => {
    let completeCalls = 0;
    const fake: LlmProviderAdapter = {
      id: "gemini",
      async complete() {
        completeCalls += 1;
        return {
          text: "kaçmamalı",
          usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
        };
      },
    };
    await expect(
      invokeLlm(
        {
          provider: "gemini",
          role: "VIDEO_GEN",
          system: "sys",
          user: "hello",
          billing: { userId: "u1", source: "gateway" },
        } as unknown as InvokeLlmInput,
        {
          providers: { gemini: fake },
          budgetPort: createMemoryBudgetShieldPort(),
        },
      ),
    ).rejects.toBeInstanceOf(AiGatewayForbiddenError);

    const denied = jsonFromUnknown(new AiGatewayForbiddenError());
    expect(denied.status).toBe(403);
    expect(new AiGatewayForbiddenError()).toBeInstanceOf(ForbiddenError);
    expect(completeCalls).toBe(0);
  });

  it("gümrük ve sicil factory açmaz; dikey odalar mühürlü rol adı taşımaz", () => {
    const gateway = readSrc("lib/kernel/ai/llm-gateway.ts");
    expect(gateway).toContain("assertLiveAiModelRole");
    expect(gateway).toContain("export async function invokeLlm");
    expect(gateway).toContain("export async function generateImage");
    expect(gateway).toContain("export async function generateSpeech");
    expect(gateway).not.toContain("export async function generateVideo");
    expect(readSrc("lib/kernel/ai/providers/gemini.ts")).toContain("collectGeminiInlineAudioParts");
    expect(readSrc("lib/kernel/ai/providers/gemini.ts")).not.toContain("parts?.[0]?.inlineData");
    expect(gateway).not.toContain("elevenlabs");
    expect(gateway).not.toContain("veo-3.0");

    const roles = readSrc("lib/kernel/ai/model-roles.ts");
    expect(roles).toContain("AI_SEALED_DEAD_ROLE_KEYS");
    expect(roles).toContain("class AiGatewayForbiddenError");
    expect(roles).toContain("Kesilmiş ölü yuva");
    expect(roles).toContain("gemini-3.1-flash-tts-preview");
    expect(roles).toContain("gemini-2.5-flash-preview-tts");
    expect(roles).not.toContain("veo-3.0");
    expect(roles).not.toContain("elevenlabs");

    const types = readSrc("lib/kernel/ai/types.ts");
    expect(types).toContain("role?: AiLiveModelRoleKey");
    expect(types).toContain("generateVideo?: never");
    expect(types).toContain("generateSpeech?");
    expect(types).not.toContain("generateSpeech?: never");

    const verticals = [
      "archived/lib/studio/engine.ts",
      "archived/lib/studio/image-engine.ts",
      "archived/lib/devlabs/bench.ts",
      "lib/freelancer/dispute-engine.ts",
    ];
    for (const file of verticals) {
      const source = readSrc(file);
      expect(source, file).not.toContain("VIDEO_GEN");
      expect(source, file).not.toContain("VOICE_TTS");
    }
  });
});
