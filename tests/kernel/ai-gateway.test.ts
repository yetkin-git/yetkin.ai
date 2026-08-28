import { afterEach, describe, expect, it } from "vitest";
import { invokeLlm, generateImage, generateSpeech, resetSpeechGatewayCooldownForTests } from "@/lib/kernel/ai/llm-gateway";
import { isSpeechGatewayFail } from "@/lib/kernel/ai/types";
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
  afterEach(() => {
    resetSpeechGatewayCooldownForTests();
  });
  it("sekiz kanonik rol taşır; yedisi canlı, VIDEO_GEN mühürlü-ölü", () => {
    expect(AI_MODEL_ROLE_KEYS).toHaveLength(8);
    expect(AI_LIVE_MODEL_ROLE_KEYS).toHaveLength(7);
    expect(AI_SEALED_DEAD_ROLE_KEYS).toEqual(["VIDEO_GEN"]);
    expect([...AI_LIVE_MODEL_ROLE_KEYS]).not.toContain("VIDEO_GEN");
    expect([...AI_LIVE_MODEL_ROLE_KEYS]).toContain("VOICE_TTS");
  });

  it("VIDEO_GEN invokeLlm'de AiGatewayForbiddenError fırlatır; sağlayıcı çağrılmaz", async () => {
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

  it("generateSpeech adapter yoksa null döner; varsa WAV tamponu basar", async () => {
    const withoutSpeech = await generateSpeech(
      {
        provider: "gemini",
        role: "VOICE_TTS",
        text: "Ders gövdesi",
        billing: { userId: "u1", source: "academy" },
      },
      {
        providers: { gemini: fakeGemini },
        budgetPort: createMemoryBudgetShieldPort(),
      },
    );
    expect(withoutSpeech).toBeNull();

    let spokenText = "";
    let spokenInstruction = "";
    const withSpeech: LlmProviderAdapter = {
      ...fakeGemini,
      async generateSpeech(input) {
        spokenText = input.text;
        spokenInstruction = input.instruction ?? "";
        return {
          mimeType: "audio/wav",
          dataBase64: "UklGRg==",
          usage: { promptTokens: 4, completionTokens: 1, totalTokens: 5 },
        };
      },
    };
    const result = await generateSpeech(
      {
        provider: "gemini",
        role: "VOICE_TTS",
        text: "Ders gövdesi",
        billing: { userId: "u1", source: "academy" },
      },
      {
        providers: { gemini: withSpeech },
        budgetPort: createMemoryBudgetShieldPort(),
      },
    );
    expect(isSpeechGatewayFail(result)).toBe(false);
    expect(result && "dataBase64" in result ? result.dataBase64 : undefined).toBe("UklGRg==");
    expect(result && "mimeType" in result ? result.mimeType : undefined).toBe("audio/wav");
    expect(result && "model" in result ? result.model : undefined).toBe("gemini-3.1-flash-tts-preview");
    // NO META IN AUDIO: pedagoji mührü text'e sızmaz; instruction kanalındadır.
    expect(spokenText).toBe("Ders gövdesi");
    expect(spokenText).not.toContain("le-le-me");
    expect(spokenInstruction).toContain("le-le-me");
    expect(spokenInstruction).toContain("el-el-em");
  });

  it("generateSpeech sağlayıcı hatasında fail zarfı basar; null yutmaz", async () => {
    const boom: LlmProviderAdapter = {
      ...fakeGemini,
      async generateSpeech() {
        throw Object.assign(new Error("429 RESOURCE_EXHAUSTED quota"), { status: 429 });
      },
    };
    const failed = await generateSpeech(
      {
        provider: "gemini",
        role: "VOICE_TTS",
        text: "Ders gövdesi",
        billing: { userId: "u1", source: "academy" },
        maxAttempts: 1,
      },
      {
        providers: { gemini: boom },
        budgetPort: createMemoryBudgetShieldPort(),
      },
    );
    expect(isSpeechGatewayFail(failed)).toBe(true);
    if (isSpeechGatewayFail(failed)) {
      expect(failed.reason).toBe("gemini-quota");
    }
  });

  it("generateSpeech AbortError'u gemini-timeout basar ve bir kez dener", async () => {
    let calls = 0;
    const flaky: LlmProviderAdapter = {
      ...fakeGemini,
      async generateSpeech() {
        calls += 1;
        if (calls === 1) {
          const abort = new Error("");
          abort.name = "AbortError";
          throw abort;
        }
        return {
          mimeType: "audio/wav",
          dataBase64: "UklGRg==",
          usage: { promptTokens: 4, completionTokens: 1, totalTokens: 5 },
        };
      },
    };
    const result = await generateSpeech(
      {
        provider: "gemini",
        role: "VOICE_TTS",
        text: "Ders gövdesi",
        billing: { userId: "u1", source: "academy" },
        timeoutMs: 80,
      },
      {
        providers: { gemini: flaky },
        budgetPort: createMemoryBudgetShieldPort(),
      },
    );
    expect(calls).toBe(2);
    expect(isSpeechGatewayFail(result)).toBe(false);
    expect(result && "dataBase64" in result ? result.dataBase64 : undefined).toBe("UklGRg==");
  });

  it("generateSpeech ConnectTimeoutError'u yeniden denemez", async () => {
    let calls = 0;
    const boom: LlmProviderAdapter = {
      ...fakeGemini,
      async generateSpeech() {
        calls += 1;
        throw Object.assign(new Error("Connect Timeout Error"), {
          name: "ConnectTimeoutError",
          code: "UND_ERR_CONNECT_TIMEOUT",
        });
      },
    };
    const failed = await generateSpeech(
      {
        provider: "gemini",
        role: "VOICE_TTS",
        text: "Ders gövdesi",
        billing: { userId: "u1", source: "academy" },
        maxAttempts: 5,
        timeoutMs: 80,
      },
      {
        providers: { gemini: boom },
        budgetPort: createMemoryBudgetShieldPort(),
      },
    );
    expect(calls).toBe(1);
    expect(isSpeechGatewayFail(failed)).toBe(true);
    if (isSpeechGatewayFail(failed)) {
      expect(failed.reason).toBe("gemini-timeout");
    }
  });

  it("generateSpeech 429 kotasında yeniden denemez ve Gemini'yi soğutur", async () => {
    let calls = 0;
    const boom: LlmProviderAdapter = {
      ...fakeGemini,
      async generateSpeech() {
        calls += 1;
        throw Object.assign(new Error("429 RESOURCE_EXHAUSTED quota"), { status: 429 });
      },
    };
    const deps = {
      providers: { gemini: boom },
      budgetPort: createMemoryBudgetShieldPort(),
    };
    const started = Date.now();
    const failed = await generateSpeech(
      {
        provider: "gemini",
        role: "VOICE_TTS",
        text: "Ders gövdesi",
        billing: { userId: "u1", source: "academy" },
        maxAttempts: 5,
      },
      deps,
    );
    expect(Date.now() - started).toBeLessThan(400);
    expect(calls).toBe(1);
    expect(isSpeechGatewayFail(failed)).toBe(true);
    const cooled = await generateSpeech(
      {
        provider: "gemini",
        role: "VOICE_TTS",
        text: "İkinci dilim",
        billing: { userId: "u1", source: "academy" },
        maxAttempts: 5,
      },
      deps,
    );
    expect(calls).toBe(1);
    expect(isSpeechGatewayFail(cooled)).toBe(true);
    if (isSpeechGatewayFail(cooled)) {
      expect(cooled.reason).toBe("gemini-quota");
    }
  });

  it("generateSpeech 50x üst katmanda en fazla bir kez dener", async () => {
    let calls = 0;
    const boom: LlmProviderAdapter = {
      ...fakeGemini,
      async generateSpeech() {
        calls += 1;
        throw Object.assign(new Error("503 Bad Gateway"), { status: 503 });
      },
    };
    const failed = await generateSpeech(
      {
        provider: "gemini",
        role: "VOICE_TTS",
        text: "Ders gövdesi",
        billing: { userId: "u1", source: "academy" },
        maxAttempts: 5,
      },
      {
        providers: { gemini: boom },
        budgetPort: createMemoryBudgetShieldPort(),
      },
    );
    expect(calls).toBe(2);
    expect(isSpeechGatewayFail(failed)).toBe(true);
    if (isSpeechGatewayFail(failed)) {
      expect(failed.reason).toBe("gemini-upstream");
    }
  });

  it("generateSpeech 400 INVALID_ARGUMENT yeniden denemez; gemini-bad-request basar", async () => {
    let calls = 0;
    const boom: LlmProviderAdapter = {
      ...fakeGemini,
      async generateSpeech() {
        calls += 1;
        throw Object.assign(new Error("INVALID_ARGUMENT systemInstruction"), { status: 400 });
      },
    };
    const failed = await generateSpeech(
      {
        provider: "gemini",
        role: "VOICE_TTS",
        text: "Ders gövdesi",
        billing: { userId: "u1", source: "academy" },
        maxAttempts: 5,
      },
      {
        providers: { gemini: boom },
        budgetPort: createMemoryBudgetShieldPort(),
      },
    );
    expect(calls).toBe(1);
    expect(isSpeechGatewayFail(failed)).toBe(true);
    if (isSpeechGatewayFail(failed)) {
      expect(failed.reason).toBe("gemini-bad-request");
    }
  });
});
