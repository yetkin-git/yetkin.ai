import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  coachFormField,
  FORM_COACH_MAX_INPUT_CHARS,
  FORM_COACH_MAX_OUTPUT_TOKENS,
  FORM_COACH_MIN_CHARS_FOR_API,
  FORM_COACH_MODEL_ID,
  FORM_COACH_PATH,
  FORM_COACH_ROLE,
  FORM_COACH_SYSTEM,
  type FormCoachQuotaPort,
} from "@/lib/kernel/ai/form-coach";
import type { InvokeLlmInput, LlmGatewayResult } from "@/lib/kernel/ai/types";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

function memoryQuota(limit = 20): FormCoachQuotaPort {
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
    model: FORM_COACH_MODEL_ID,
    provider: "gemini",
    usage: { promptTokens: 40, completionTokens: 20, totalTokens: 60 },
  };
}

describe("form coach", () => {
  it("LITE_STREAM + kısa sistem + 120 token tavanı ile koçluk üretir", async () => {
    const invoke = vi.fn(async (input: InvokeLlmInput) => {
      expect(input.role).toBe(FORM_COACH_ROLE);
      expect(FORM_COACH_MODEL_ID).toBe("gemini-3.5-flash-lite");
      expect(input.maxOutputTokens).toBe(FORM_COACH_MAX_OUTPUT_TOKENS);
      expect(input.system).toBe(FORM_COACH_SYSTEM);
      expect(input.system.length).toBeLessThan(420);
      expect(input.system).not.toMatch(/gemini|google|openai|anthropic/i);
      expect(input.user).toContain("hibe");
      expect(input.user).toContain("Seramik atölyesi için");
      return llmResult(
        "💡 İpucu: Bütçe aralığını veya hedef müşteri kitlenizi de eklerseniz çok daha nokta atışı bir çıktı alırsınız.",
      );
    });

    const result = await coachFormField(
      {
        userId: "user-1",
        text: "Seramik atölyesi için yeni fırın yatırımı planlıyoruz ve kapasiteyi ikiye katlamak istiyoruz.",
        context: "hibe",
      },
      { invoke, quota: memoryQuota() },
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.source).toBe("llm");
      expect(result.tip).toContain("💡");
      expect(result.remaining).toBe(19);
    }
    expect(invoke).toHaveBeenCalledOnce();
  });

  it("çok kısa metni 400 ile reddeder", async () => {
    const invoke = vi.fn(async () => llmResult("kaçmamalı"));
    const result = await coachFormField(
      { userId: "user-2", text: "kısa metin", context: "general" },
      { invoke, quota: memoryQuota() },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
    }
    expect(invoke).not.toHaveBeenCalled();
  });

  it("kota dolunca 429 döner", async () => {
    const invoke = vi.fn(async () => llmResult("kaçmamalı"));
    const result = await coachFormField(
      {
        userId: "user-3",
        text: "Kurumsal ekibimiz için yetkinlik ölçümü ve ilan elemesi paneli istiyoruz, aynı hafta kurulum.",
        context: "kurumsal",
      },
      { invoke, quota: memoryQuota(0) },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(429);
    }
    expect(invoke).not.toHaveBeenCalled();
  });

  it("LLM boşsa fail-safe ipucu döner", async () => {
    const invoke = vi.fn(async () => null);
    const result = await coachFormField(
      {
        userId: "user-4",
        text: "Pamuklu bebek battaniyesi, 100x100 cm, yıkanabilir kumaş, 0-3 yaş grubu için uygundur.",
        context: "ecommerce",
      },
      { invoke, quota: memoryQuota() },
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.source).toBe("fail-safe");
      expect(result.tip.length).toBeGreaterThan(10);
    }
  });

  it("rota, bileşen ve sabitler mühürlüdür", () => {
    expect(FORM_COACH_PATH).toBe("/api/ai/form-coach");
    expect(FORM_COACH_MAX_INPUT_CHARS).toBe(500);
    expect(FORM_COACH_MIN_CHARS_FOR_API).toBe(30);
    expect(FORM_COACH_MAX_OUTPUT_TOKENS).toBe(120);

    const route = readSrc("app/api/ai/form-coach/route.ts");
    expect(route).toContain('export const auth = "public"');
    expect(route).toContain("formCoachIp");
    expect(route).toContain("coachFormField");

    const component = readSrc("components/ui/smart-textarea.tsx");
    expect(component).toContain("FORM_COACH_PATH");
    expect(component).toContain("assessIdeaDetail");
    expect(component).toContain("data-smart-textarea");
    expect(component).toContain("DEBOUNCE_MS = 2_000");

    const rate = readSrc("lib/kernel/security/http-rate-limit.ts");
    expect(rate).toContain('"/api/ai/form-coach"');
    expect(rate).toContain("formCoachIp");
    expect(rate).toContain("formCoachUser");
  });
});
