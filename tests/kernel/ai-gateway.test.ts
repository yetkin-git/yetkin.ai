import { describe, expect, it } from "vitest";
import { invokeLlm, generateImage } from "@/lib/kernel/ai/llm-gateway";
import { createMemoryBudgetShieldPort } from "@/lib/kernel/ai/budget-shield";
import {
  AI_LIVE_MODEL_ROLE_KEYS,
  AI_MODEL_ROLE_KEYS,
  AI_SEALED_DEAD_ROLE_KEYS,
  AiGatewayForbiddenError,
  getDefaultModelId,
} from "@/lib/kernel/ai/model-roles";
import type { InvokeLlmInput, LlmProviderAdapter } from "@/lib/kernel/ai/types";

const fakeGemini: LlmProviderAdapter = {
  id: "gemini",
  async complete() {
    return {
      text: "mühür",
      usage: { promptTokens: 10, completionTokens: 4, totalTokens: 14 },
    };
  },
};

describe("invokeLlm gümrük kapısı", () => {
  it("sekiz kanonik rol taşır; altısı canlı, ikisi mühürlü-ölü", () => {
    expect(AI_MODEL_ROLE_KEYS).toHaveLength(8);
    expect(AI_LIVE_MODEL_ROLE_KEYS).toHaveLength(6);
    expect(AI_SEALED_DEAD_ROLE_KEYS).toEqual(["VIDEO_GEN", "VOICE_TTS"]);
    expect([...AI_LIVE_MODEL_ROLE_KEYS]).not.toContain("VIDEO_GEN");
    expect([...AI_LIVE_MODEL_ROLE_KEYS]).not.toContain("VOICE_TTS");
  });

  it("VIDEO_GEN ve VOICE_TTS invokeLlm'de AiGatewayForbiddenError fırlatır; sağlayıcı çağrılmaz", async () => {
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
    const deps = {
      providers: { gemini: fake },
      budgetPort: createMemoryBudgetShieldPort(),
    };
    for (const role of AI_SEALED_DEAD_ROLE_KEYS) {
      await expect(
        invokeLlm(
          {
            provider: "gemini",
            role,
            system: "sys",
            user: "hello",
            billing: { userId: "u1", source: "gateway" },
          } as unknown as InvokeLlmInput,
          deps,
        ),
      ).rejects.toBeInstanceOf(AiGatewayForbiddenError);
      expect(() => getDefaultModelId(role)).toThrow(AiGatewayForbiddenError);
    }
    expect(completeCalls).toBe(0);
  });

  it("bütçe reddinde null döner, fırlatmaz", async () => {
    const result = await invokeLlm(
      {
        provider: "gemini",
        role: "FAST_STREAM",
        system: "sys",
        user: "hello",
        billing: { userId: "u1", source: "gateway" },
      },
      {
        providers: { gemini: fakeGemini },
        budgetPort: createMemoryBudgetShieldPort({ spentMinor: 999_999_999 }),
      },
    );
    expect(result).toBeNull();
  });

  it("izinli çağrıda metin ve usage döner", async () => {
    const result = await invokeLlm(
      {
        provider: "gemini",
        role: "FAST_STREAM",
        system: "sys",
        user: "hello",
        billing: { userId: "u1", source: "gateway" },
      },
      {
        providers: { gemini: fakeGemini },
        budgetPort: createMemoryBudgetShieldPort(),
      },
    );
    expect(result?.text).toBe("mühür");
    expect(result?.usage.totalTokens).toBe(14);
    expect(result?.provider).toBe("gemini");
  });

  it("generateImage adapter yoksa null döner; varsa görsel basar", async () => {
    const withoutImage = await generateImage(
      {
        provider: "gemini",
        role: "IMAGE_GEN",
        prompt: "ray",
        billing: { userId: "u1", source: "studio" },
      },
      {
        providers: { gemini: fakeGemini },
        budgetPort: createMemoryBudgetShieldPort(),
      },
    );
    expect(withoutImage).toBeNull();

    const withImage: LlmProviderAdapter = {
      ...fakeGemini,
      async generateImage() {
        return {
          mimeType: "image/png",
          dataBase64: "aaaa",
          usage: { promptTokens: 2, completionTokens: 1, totalTokens: 3 },
        };
      },
    };
    const result = await generateImage(
      {
        provider: "gemini",
        role: "IMAGE_GEN",
        prompt: "ray",
        billing: { userId: "u1", source: "studio" },
      },
      {
        providers: { gemini: withImage },
        budgetPort: createMemoryBudgetShieldPort(),
      },
    );
    expect(result?.dataBase64).toBe("aaaa");
    expect(result?.mimeType).toBe("image/png");
  });
});
