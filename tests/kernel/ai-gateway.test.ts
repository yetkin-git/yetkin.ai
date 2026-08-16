import { describe, expect, it } from "vitest";
import { invokeLlm, generateImage } from "@/lib/kernel/ai/llm-gateway";
import { createMemoryBudgetShieldPort } from "@/lib/kernel/ai/budget-shield";
import { AI_MODEL_ROLE_KEYS } from "@/lib/kernel/ai/model-roles";
import type { LlmProviderAdapter } from "@/lib/kernel/ai/types";

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
  it("sekiz kanonik rol taşır", () => {
    expect(AI_MODEL_ROLE_KEYS).toHaveLength(8);
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
