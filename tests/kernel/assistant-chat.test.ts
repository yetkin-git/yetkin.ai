import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { ASSISTANT_SEN } from "@/lib/copy/sen-voice/assistant";
import {
  answerAssistantChat,
  ASSISTANT_CHAT_LIMIT_ERROR,
  ASSISTANT_CHAT_MESSAGE_LIMIT,
  ASSISTANT_CHAT_PATH,
  scrubAssistantProviderLeak,
  type AssistantChatQuotaPort,
} from "@/lib/kernel/ai/assistant-chat";
import type { InvokeLlmInput, LlmGatewayResult } from "@/lib/kernel/ai/types";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

function memoryQuota(limit: number = ASSISTANT_CHAT_MESSAGE_LIMIT): AssistantChatQuotaPort {
  const counts = new Map<string, number>();
  return {
    consume(userId) {
      const next = (counts.get(userId) ?? 0) + 1;
      counts.set(userId, next);
      return {
        allowed: next <= limit,
        remaining: Math.max(0, limit - next),
        limit,
      };
    },
  };
}

function llmResult(text: string): LlmGatewayResult {
  return {
    text,
    model: "hidden",
    provider: "gemini",
    usage: { promptTokens: 8, completionTokens: 6, totalTokens: 14 },
  };
}

describe("yetkin.ai asistan sohbet kotası", () => {
  it("LITE_STREAM gümrüğünden geçer; sistem talimatı sağlayıcı adı taşımaz", async () => {
    const invoke = vi.fn(async (input: InvokeLlmInput) => {
      expect(input.role).toBe("LITE_STREAM");
      expect(input.system).toBe(ASSISTANT_SEN.system);
      expect(input.system).not.toMatch(/gemini|google|openai|anthropic/i);
      expect(input.user).toBe("Akademi vizesi nasıl alınır?");
      return llmResult("Kursu bitir, sınavı geç, kariyer vizesi sicile basılır.");
    });
    const result = await answerAssistantChat(
      { userId: "user-1", message: "Akademi vizesi nasıl alınır?" },
      { invoke, quota: memoryQuota() },
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.reply).toContain("kariyer vizesi");
      expect(result.remaining).toBe(4);
      expect(result.limit).toBe(5);
    }
    expect(invoke).toHaveBeenCalledOnce();
  });

  it("beşinci mesajdan sonra LLM çağırmaz ve limit uyarısı basar", async () => {
    const invoke = vi.fn(async () => llmResult("kısa yanıt"));
    const quota = memoryQuota(5);
    for (let i = 0; i < 5; i += 1) {
      const ok = await answerAssistantChat(
        { userId: "user-limit", message: `soru ${i + 1}` },
        { invoke, quota },
      );
      expect(ok.ok).toBe(true);
    }
    const denied = await answerAssistantChat(
      { userId: "user-limit", message: "altıncı soru" },
      { invoke, quota },
    );
    expect(denied.ok).toBe(false);
    if (!denied.ok) {
      expect(denied.error).toBe(ASSISTANT_CHAT_LIMIT_ERROR);
      expect(denied.status).toBe(429);
      expect(denied.remaining).toBe(0);
    }
    expect(invoke).toHaveBeenCalledTimes(5);
  });

  it("boş gövde kotayı yakmaz", async () => {
    const invoke = vi.fn(async () => llmResult("kaçmamalı"));
    const quota = memoryQuota(1);
    const empty = await answerAssistantChat(
      { userId: "user-empty", message: "   " },
      { invoke, quota },
    );
    expect(empty.ok).toBe(false);
    if (!empty.ok) {
      expect(empty.status).toBe(400);
    }
    const ok = await answerAssistantChat(
      { userId: "user-empty", message: "Freelancer emanet nedir?" },
      { invoke, quota },
    );
    expect(ok.ok).toBe(true);
    expect(invoke).toHaveBeenCalledOnce();
  });

  it("gümrük null dönerse sahte cevap basmaz", async () => {
    const result = await answerAssistantChat(
      { userId: "user-down", message: "Akademi nedir?" },
      { invoke: async () => null, quota: memoryQuota() },
    );
    expect(result).toMatchObject({
      ok: false,
      status: 503,
      error: ASSISTANT_SEN.unavailable,
    });
  });

  it("yanıttan sağlayıcı adını siler", () => {
    expect(scrubAssistantProviderLeak("Bu Gemini modelidir, Google üretir.")).toBe(
      `Bu ${YETKIN_BRAND} modelidir, ${YETKIN_BRAND} üretir.`,
    );
  });
});

describe("asistan yüzey mührü", () => {
  it("widget ve rota yetkin.ai Asistanı taşır; Gemini vitrine çıkmaz", () => {
    expect(ASSISTANT_CHAT_PATH).toBe("/api/ai/chat");
    expect(ASSISTANT_SEN.title).toBe(`${YETKIN_BRAND} Asistanı`);
    expect(ASSISTANT_CHAT_LIMIT_ERROR).toBe("Bugünlük soru limitine ulaştın.");
    expect(ASSISTANT_SEN.welcome).toContain(`${YETKIN_BRAND} yapay zekâ asistanıyım`);
    const widget = readSrc("components/kernel/ai-chat-widget.tsx");
    const route = readSrc("app/api/(kernel)/ai/chat/route.ts");
    const engine = readSrc("lib/kernel/ai/assistant-chat.ts");
    expect(widget).toContain("ASSISTANT_SEN.title");
    expect(widget).toContain("bottom-6 right-6");
    expect(widget).toContain("z-50");
    expect(widget).toContain("pointer-events-none fixed z-50");
    expect(widget).toContain("pointer-events-auto relative flex h-14");
    expect(widget).toContain("withRailApiVersion");
    expect(widget).toContain("readCitizenEnvelope");
    expect(widget.toLowerCase()).not.toContain("gemini");
    expect(widget.toLowerCase()).not.toContain("google");
    expect(route).toContain('export const auth = "session"');
    expect(route).toContain("answerAssistantChat");
    expect(engine).toContain("LITE_STREAM");
    expect(engine).toContain("invokeLlm");
    expect(readSrc("components/shell/app-shell.tsx")).not.toContain("AiChatWidget");
    expect(readSrc("app/dashboard/page.tsx")).not.toContain("AiChatWidget");
    expect(readSrc("app/(public)/layout.tsx")).not.toContain("AiChatWidget");
    expect(readSrc("app/(auth)/layout.tsx")).not.toContain("AiChatWidget");
    const gemini = readSrc("lib/kernel/ai/providers/gemini.ts");
    expect(gemini).toContain("process.env.GEMINI_API_KEY");
    expect(gemini).toContain("sanitizeGeminiApiKey");
    expect(route).toContain('reason: result.status === 429 ? "quota" : "gateway"');
  });
});
