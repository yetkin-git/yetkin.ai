import { beforeEach, describe, expect, it } from "vitest";
import type { InvokeLlmInput, LlmGatewayResult } from "@/lib/kernel/ai/types";
import { TEZGAH_FAIL_MESSAGE, TEZGAH_GUEST_QUOTA_MESSAGE, TEZGAH_MEMBER_QUOTA_MESSAGE } from "@/lib/tezgah/catalog";
import { generateTezgahOutput, TEZGAH_MAX_OUTPUT_TOKENS, TEZGAH_MODEL_ROLE } from "@/lib/tezgah/engine";
import { resetTezgahQuotaForTests } from "@/lib/tezgah/quota";
import { tezgahSystemPrompt } from "@/lib/tezgah/prompts";
import type { TezgahGenerateRequest } from "@/lib/tezgah/schema";

const NOW = new Date("2026-11-14T12:00:00+03:00");

function okText(text: string): LlmGatewayResult {
  return {
    text,
    model: "gemini-3.5-flash-lite",
    provider: "gemini",
    usage: { promptTokens: 12, completionTokens: 40, totalTokens: 52 },
  };
}

const ecommerce: TezgahGenerateRequest = {
  tool: "ecommerce",
  productName: "Pamuklu battaniye",
  category: "Anne ve bebek",
  features: "100 cm, yıkanabilir",
};

describe("tezgâh üretim motoru", () => {
  beforeEach(() => {
    resetTezgahQuotaForTests();
  });

  it("üç aracın sistem metni teslim başlıklarını taşır ve hibe notu skor uydurmaz", () => {
    expect(tezgahSystemPrompt(ecommerce)).toContain("## SEO anahtar kelimeleri");
    expect(
      tezgahSystemPrompt({
        tool: "proposal",
        jobPost: "Kırk ürün kartı toparlanacak.",
        expertise: "Pazaryeri metni",
      }),
    ).toContain("## Teslimat adımları");
    const grant = tezgahSystemPrompt({
      tool: "grant",
      sector: "Gıda",
      businessStatus: "KOBİ, 4 çalışan",
      project: "Soğuk zincir deposu",
    });
    expect(grant).toContain("Bu not resmi uygunluk kararı değildir.");
    expect(grant).toContain("KOBİ statüsü");
    expect(grant).toContain("patent veya faydalı model");
    expect(grant).not.toContain("amountMinor");
  });

  it("başarılı çağrı hakkı düşürür, token tavanını ve cüzdansız kaydı kilitler", async () => {
    const seen: InvokeLlmInput[] = [];
    const result = await generateTezgahOutput(
      { actorId: "guest:203.0.113.9", guest: true, request: ecommerce },
      {
        now: () => NOW,
        invoke: async (input) => {
          seen.push(input);
          return okText("## Başlık\nPamuklu battaniye");
        },
      },
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.markdown).toContain("Pamuklu battaniye");
      expect(result.remaining).toBe(0);
      expect(result.limit).toBe(1);
    }
    expect(seen[0]?.role).toBe(TEZGAH_MODEL_ROLE);
    expect(seen[0]?.maxOutputTokens).toBe(TEZGAH_MAX_OUTPUT_TOKENS);
    expect(seen[0]?.billing).toMatchObject({ source: "tezgah", recordUsage: false, userId: null });
    expect(seen[0]?.user).toContain("Pamuklu battaniye");
    expect(seen[0]?.rateLimit?.scope).toBe("tezgah");
    const again = await generateTezgahOutput(
      { actorId: "guest:203.0.113.9", guest: true, request: ecommerce },
      { now: () => NOW, invoke: async () => okText("ikinci") },
    );
    expect(again).toMatchObject({ ok: false, status: 429, error: TEZGAH_GUEST_QUOTA_MESSAGE });
  });

  it("üye 3 hak kullanır; boş model yanıtı hakkı geri yazar", async () => {
    const actorId = "user_engine_1";
    const invokeEmpty = async () => null;
    const failed = await generateTezgahOutput(
      { actorId, guest: false, request: ecommerce },
      { now: () => NOW, invoke: invokeEmpty },
    );
    expect(failed).toMatchObject({ ok: false, status: 503, error: TEZGAH_FAIL_MESSAGE, remaining: 3 });
    for (let index = 0; index < 3; index += 1) {
      const row = await generateTezgahOutput(
        { actorId, guest: false, request: ecommerce },
        { now: () => NOW, invoke: async () => okText(`## Teklif\n${index}`) },
      );
      expect(row.ok).toBe(true);
    }
    const blocked = await generateTezgahOutput(
      { actorId, guest: false, request: ecommerce },
      { now: () => NOW, invoke: async () => okText("fazla") },
    );
    expect(blocked).toMatchObject({ ok: false, status: 429, error: TEZGAH_MEMBER_QUOTA_MESSAGE });
  });

  it("eksik alan hak düşürmez", async () => {
    const broken = await generateTezgahOutput(
      {
        actorId: "guest:203.0.113.10",
        guest: true,
        request: { ...ecommerce, productName: "a" },
      },
      { now: () => NOW, invoke: async () => okText("olmamalı") },
    );
    expect(broken).toMatchObject({ ok: false, status: 400, remaining: 1 });
    const next = await generateTezgahOutput(
      { actorId: "guest:203.0.113.10", guest: true, request: ecommerce },
      { now: () => NOW, invoke: async () => okText("## Başlık\nOldu") },
    );
    expect(next.ok).toBe(true);
  });
});
