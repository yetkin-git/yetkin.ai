import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { classifyLlmProviderFailure } from "@/lib/kernel/ai/llm-gateway";
import {
  describeGeminiApiKeyIssue,
  sanitizeGeminiApiKey,
} from "@/lib/kernel/ai/providers/gemini";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("GEMINI_API_KEY gümrük okuma", () => {
  it("BOM, CR ve sarmal tırnakları düşürür; kısa/boş değeri reddeder", () => {
    expect(sanitizeGeminiApiKey('"AQ.fakeVertexExpressKeyValueXXXX"')).toBe(
      "AQ.fakeVertexExpressKeyValueXXXX",
    );
    expect(sanitizeGeminiApiKey("\uFEFF'AIzaSyDummyKeyValueHere'")).toBe(
      "AIzaSyDummyKeyValueHere",
    );
    expect(sanitizeGeminiApiKey('""')).toBeNull();
    expect(sanitizeGeminiApiKey("short")).toBeNull();
    expect(sanitizeGeminiApiKey("   ")).toBeNull();
    expect(sanitizeGeminiApiKey(undefined)).toBeNull();
  });

  it("eksik veya tırnaklı anahtarı anahtar sızdırmadan sınıflar", () => {
    expect(describeGeminiApiKeyIssue(undefined)).toBe("missing-gemini-key");
    expect(describeGeminiApiKeyIssue("")).toBe("missing-gemini-key");
    expect(describeGeminiApiKeyIssue('"AQ.fakeVertexExpressKeyValueXXXX"')).toBe(
      "quoted-gemini-key",
    );
    expect(describeGeminiApiKeyIssue("short")).toBe("gemini-key-too-short");
  });

  it("sağlayıcı hatalarını güvenli reason'a çevirir", () => {
    expect(classifyLlmProviderFailure(new Error("Gemini client yapılandırılamadı."))).toBe(
      "missing-or-invalid-api-key",
    );
    expect(classifyLlmProviderFailure(new Error("API key not valid. 401 UNAUTHENTICATED"))).toBe(
      "gemini-auth-failed",
    );
    expect(classifyLlmProviderFailure({ status: 404, message: "not found" })).toBe(
      "gemini-model-not-found",
    );
    const abort = new Error("");
    abort.name = "AbortError";
    expect(classifyLlmProviderFailure(abort)).toBe("gemini-timeout");
    expect(
      classifyLlmProviderFailure(
        Object.assign(new Error("Connect Timeout Error"), {
          name: "ConnectTimeoutError",
          code: "UND_ERR_CONNECT_TIMEOUT",
        }),
      ),
    ).toBe("gemini-timeout");
    expect(
      classifyLlmProviderFailure(
        Object.assign(new Error("INVALID_ARGUMENT systemInstruction"), { status: 400 }),
      ),
    ).toBe("gemini-bad-request");
    expect(
      classifyLlmProviderFailure(
        Object.assign(new Error("RESOURCE_EXHAUSTED 429 quota"), { status: 429 }),
      ),
    ).toBe("gemini-quota");
    expect(
      classifyLlmProviderFailure(
        Object.assign(new Error("Please retry in 37.91s RESOURCE_EXHAUSTED"), { status: 429 }),
      ),
    ).toBe("gemini-quota");
  });

  it("invokeLlm process.env.GEMINI_API_KEY okur; Developer API client kurar", () => {
    const gemini = readSrc("lib/kernel/ai/providers/gemini.ts");
    expect(gemini).toContain("process.env.GEMINI_API_KEY");
    expect(gemini).toContain("sanitizeGeminiApiKey");
    expect(gemini).toContain("new GoogleGenAI({");
    expect(gemini).toContain("GEMINI_FAST_FAIL_HTTP_OPTIONS");
    expect(gemini).toContain("attempts: 1");
    expect(gemini).not.toContain("vertexai: true");
    const gateway = readSrc("lib/kernel/ai/llm-gateway.ts");
    expect(gateway).toContain("classifyLlmProviderFailure");
    expect(gateway).toContain("llm.gateway.provider_failed");
  });
});
