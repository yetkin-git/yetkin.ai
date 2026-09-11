import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { LEGAL_SUPPORT_EMAIL } from "@/lib/copy/legal-launch";
import { ASSISTANT_SEN } from "@/lib/copy/sen-voice/assistant";
import {
  answerAssistantChat,
  ASSISTANT_CHAT_LIMIT_ERROR,
  ASSISTANT_CHAT_MESSAGE_LIMIT,
  ASSISTANT_CHAT_PATH,
  scrubAssistantCitizenJargon,
  scrubAssistantProviderLeak,
  type AssistantChatQuotaPort,
} from "@/lib/kernel/ai/assistant-chat";
import {
  matchAssistantLocalFact,
  resolveAssistantLocalReply,
} from "@/lib/kernel/ai/assistant-facts";
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
      expect(input.system).toContain(LEGAL_SUPPORT_EMAIL);
      expect(input.system).not.toMatch(/gemini|google|openai|anthropic/i);
      expect(input.user).toBe("Freelancer ilanı nasıl açılır?");
      return llmResult("İlanı aç, teklifleri incele; kariyer vizesi sicile basılmaz.");
    });
    const result = await answerAssistantChat(
      { userId: "user-1", message: "Freelancer ilanı nasıl açılır?" },
      { invoke, quota: memoryQuota() },
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.source).toBe("llm");
      expect(result.reply).toContain("uzmanlık seviyesi");
      expect(result.reply).not.toMatch(/vize|mühür|dikey kapsam/i);
      expect(result.remaining).toBe(4);
      expect(result.limit).toBe(5);
    }
    expect(invoke).toHaveBeenCalledOnce();
  });

  it("Selam. Mail adresiniz var mı? LLM'siz SSOT e-posta basar", async () => {
    const invoke = vi.fn(async () => llmResult("kaçmamalı"));
    const result = await answerAssistantChat(
      { userId: "user-mail", message: "Selam. Mail adresiniz var mı?" },
      { invoke, quota: memoryQuota() },
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.source).toBe("local-fact");
      expect(result.reply).toBe(ASSISTANT_SEN.facts.contact);
      expect(result.reply).toContain(LEGAL_SUPPORT_EMAIL);
      expect(result.reply).toContain("/academy");
      expect(result.reply).toContain("/career");
    }
    expect(invoke).not.toHaveBeenCalled();
  });

  it("Akademi ve Kariyer soruları gümrüğü beklemeden SSOT yönlendirir", async () => {
    const invoke = vi.fn(async () => llmResult("kaçmamalı"));
    const academy = await answerAssistantChat(
      { userId: "user-rooms", message: "Akademi belgesi nasıl alınır?" },
      { invoke, quota: memoryQuota() },
    );
    const career = await answerAssistantChat(
      { userId: "user-rooms-2", message: "Kariyer planımı nasıl kurarım?" },
      { invoke, quota: memoryQuota() },
    );
    expect(academy).toMatchObject({
      ok: true,
      source: "local-fact",
      reply: ASSISTANT_SEN.facts.academy,
    });
    expect(career).toMatchObject({
      ok: true,
      source: "local-fact",
      reply: ASSISTANT_SEN.facts.career,
    });
    expect(invoke).not.toHaveBeenCalled();
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

  it("gümrük null dönerse sahte bilgi uydurmaz; destek e-postasına yönlendirir", async () => {
    const result = await answerAssistantChat(
      { userId: "user-down", message: "Freelancer emanet nedir?" },
      { invoke: async () => null, quota: memoryQuota() },
    );
    expect(result).toMatchObject({
      ok: true,
      source: "fail-safe",
      reply: ASSISTANT_SEN.failSafe,
    });
    if (result.ok) {
      expect(result.reply).toContain(LEGAL_SUPPORT_EMAIL);
      expect(result.reply).toContain("/academy");
      expect(result.reply).toContain("/career");
      expect(result.reply).not.toMatch(/emanet|escrow|bakiye kilit/i);
    }
  });

  it("yerel fact eşlemesi iletişim / oda sorularını ayırır", () => {
    expect(matchAssistantLocalFact("Selam. Mail adresiniz var mı?")).toBe("contact");
    expect(matchAssistantLocalFact("e-posta adresiniz nedir")).toBe("contact");
    expect(resolveAssistantLocalReply("İletişim için yazacak yer var mı?")).toBe(
      ASSISTANT_SEN.facts.contact,
    );
    expect(matchAssistantLocalFact("Akademi nedir?")).toBe("academy");
    expect(matchAssistantLocalFact("Doğrulanmış rozet nerede durur?")).toBe("career");
    expect(matchAssistantLocalFact("Selam")).toBeNull();
    expect(resolveAssistantLocalReply("Freelancer emanet nedir?")).toBeNull();
  });

  it("yanıttan sağlayıcı adını siler", () => {
    expect(scrubAssistantProviderLeak("Bu Gemini modelidir, Google üretir.")).toBe(
      `Bu ${YETKIN_BRAND} modelidir, ${YETKIN_BRAND} üretir.`,
    );
  });

  it("yanıttan mühür / vize / dikey kapsam kaçağını siler", () => {
    expect(
      scrubAssistantCitizenJargon(
        "Mühürlenince kariyer vizesi ve dikey kapsam açılır; mühürlü belge vizeli teklif kapısını açar.",
      ),
    ).toBe(
      "Belge alınca uzmanlık seviyesi ve uzmanlık alanı açılır; onaylı belge erişim hakkı olan teklif kapısını açar.",
    );
  });
});

describe("asistan yüzey mührü", () => {
  it("widget ve rota yetkin.ai Asistanı taşır; Gemini vitrine çıkmaz", () => {
    expect(ASSISTANT_CHAT_PATH).toBe("/api/ai/chat");
    expect(ASSISTANT_SEN.title).toBe(`${YETKIN_BRAND} Asistanı`);
    expect(ASSISTANT_SEN.role).toBe("Kariyer Danışmanı");
    expect(ASSISTANT_CHAT_LIMIT_ERROR).toBe("Bugünlük soru limitine ulaştın.");
    expect(ASSISTANT_SEN.welcome).toContain(`${YETKIN_BRAND} kariyer danışmanınım`);
    expect(ASSISTANT_SEN.welcome).toContain("Akademi veya Kariyer");
    expect(ASSISTANT_SEN.system).toContain("/academy");
    expect(ASSISTANT_SEN.system).toContain("/career");
    expect(ASSISTANT_SEN.system).toContain("/iletisim");
    expect(ASSISTANT_SEN.system).toContain(LEGAL_SUPPORT_EMAIL);
    expect(ASSISTANT_SEN.system).toContain("Sertifika");
    expect(ASSISTANT_SEN.system).toContain("Doğrulanmış Rozet");
    expect(ASSISTANT_SEN.system).toContain("Yetkinlik Belgesi");
    expect(ASSISTANT_SEN.system).toContain("Uzmanlık Seviyesi");
    expect(ASSISTANT_SEN.system).toContain("Erişim Hakkı");
    expect(ASSISTANT_SEN.system).toContain(ASSISTANT_SEN.templates.certificate);
    expect(ASSISTANT_SEN.facts.contact).toContain(LEGAL_SUPPORT_EMAIL);
    expect(ASSISTANT_SEN.failSafe).toContain(LEGAL_SUPPORT_EMAIL);
    expect(ASSISTANT_SEN.unavailable).toBe(ASSISTANT_SEN.failSafe);
    const citizenFacing = [
      ASSISTANT_SEN.welcome,
      ASSISTANT_SEN.unavailable,
      ASSISTANT_SEN.failSafe,
      ASSISTANT_SEN.placeholder,
      ...Object.values(ASSISTANT_SEN.templates),
      ...Object.values(ASSISTANT_SEN.facts),
    ].join("\n");
    expect(citizenFacing).not.toMatch(/mühür|vize|dikey kapsam/i);
    const widget = readSrc("components/kernel/ai-chat-widget.tsx");
    const route = readSrc("app/api/(kernel)/ai/chat/route.ts");
    const engine = readSrc("lib/kernel/ai/assistant-chat.ts");
    expect(widget).toContain("ASSISTANT_SEN.title");
    expect(widget).toContain("ASSISTANT_SEN.role");
    expect(widget).toContain("ASSISTANT_SEN.academyCta");
    expect(widget).toContain("ASSISTANT_SEN.careerCta");
    expect(widget).toContain('href="/academy"');
    expect(widget).toContain('href="/career"');
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
    expect(engine).toContain("resolveAssistantLocalReply");
    expect(engine).toContain("scrubAssistantCitizenJargon");
    expect(engine).toContain('"fail-safe"');
    expect(engine).toContain('"local-fact"');
    expect(readSrc("components/shell/app-shell-switch.tsx")).toContain("AiChatWidget");
    expect(readSrc("components/shell/app-shell.tsx")).not.toContain("AiChatWidget");
    expect(readSrc("app/dashboard/page.tsx")).not.toContain("AiChatWidget");
    expect(readSrc("app/(public)/layout.tsx")).not.toContain("AiChatWidget");
    expect(readSrc("app/(auth)/layout.tsx")).not.toContain("AiChatWidget");
    const gemini = readSrc("lib/kernel/ai/providers/gemini.ts");
    expect(gemini).toContain("process.env.GEMINI_API_KEY");
    expect(gemini).toContain("sanitizeGeminiApiKey");
    expect(route).toContain('reason: result.status === 429 ? "quota" : "invalid"');
    expect(route).toContain("assistant.chat.fail_safe");
    expect(route).toContain("result.source");
  });
});
