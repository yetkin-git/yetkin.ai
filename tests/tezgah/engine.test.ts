import { beforeEach, describe, expect, it } from "vitest";
import type { InvokeLlmInput, LlmGatewayResult } from "@/lib/kernel/ai/types";
import { TEZGAH_FAIL_MESSAGE, TEZGAH_GUEST_QUOTA_MESSAGE, TEZGAH_MEMBER_QUOTA_MESSAGE } from "@/lib/tezgah/catalog";
import { generateTezgahOutput, TEZGAH_MAX_OUTPUT_TOKENS, TEZGAH_MODEL_ROLE } from "@/lib/tezgah/engine";
import { resetTezgahQuotaForTests } from "@/lib/tezgah/quota";
import { ecommerceCategoryNeedsLeaf, tezgahSystemPrompt, tezgahUserPrompt } from "@/lib/tezgah/prompts";
import { tezgahGenerateRequestSchema, type TezgahGenerateRequest } from "@/lib/tezgah/schema";

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

  it("ürün kartı ve teklif sistem metnini taşır; hibe genel yoldan çıkmıştır", () => {
    expect(tezgahSystemPrompt(ecommerce)).toContain("## SEO anahtar kelimeleri");
    expect(tezgahSystemPrompt(ecommerce)).toContain("ürün adından Trendyol ve Hepsiburada uyumlu alt kategoriyi belirle");
    expect(
      tezgahSystemPrompt({
        tool: "proposal",
        jobPost: "Kırk ürün kartı toparlanacak.",
        expertise: "Pazaryeri metni",
      }),
    ).toContain("## Teslimat adımları");
    expect(
      tezgahGenerateRequestSchema.safeParse({
        tool: "grant",
        sector: "Gıda",
        businessStatus: "KOBİ, 4 çalışan",
        project: "Soğuk zincir deposu",
      }).success,
    ).toBe(false);
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
      expect(result.remaining).toBe(2);
      expect(result.limit).toBe(3);
    }
    expect(seen[0]?.role).toBe(TEZGAH_MODEL_ROLE);
    expect(seen[0]?.maxOutputTokens).toBe(TEZGAH_MAX_OUTPUT_TOKENS);
    expect(seen[0]?.billing).toMatchObject({ source: "tezgah", recordUsage: true, userId: null });
    expect(seen[0]?.user).toContain("Pamuklu battaniye");
    expect(seen[0]?.rateLimit?.scope).toBe("tezgah");
    for (let extra = 0; extra < 2; extra += 1) {
      const mid = await generateTezgahOutput(
        { actorId: "guest:203.0.113.9", guest: true, request: ecommerce },
        { now: () => NOW, invoke: async () => okText("ara") },
      );
      expect(mid.ok).toBe(true);
    }
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
    expect(broken).toMatchObject({ ok: false, status: 400, remaining: 3 });
    const next = await generateTezgahOutput(
      { actorId: "guest:203.0.113.10", guest: true, request: ecommerce },
      { now: () => NOW, invoke: async () => okText("## Başlık\nOldu") },
    );
    expect(next.ok).toBe(true);
  });

  it("boş veya tek kelimelik kategori ürün adından alt kategori ister; hazır yolu korur", async () => {
    expect(ecommerceCategoryNeedsLeaf("")).toBe(true);
    expect(ecommerceCategoryNeedsLeaf("Giyim")).toBe(true);
    expect(ecommerceCategoryNeedsLeaf("Anne & Bebek")).toBe(true);
    expect(ecommerceCategoryNeedsLeaf("Anne ve Bebek > Bebek Tekstili > Bebek Battaniyesi")).toBe(false);

    const empty = tezgahGenerateRequestSchema.safeParse({ ...ecommerce, category: "" });
    const word = tezgahGenerateRequestSchema.safeParse({ ...ecommerce, category: "Battaniye" });
    const path = tezgahGenerateRequestSchema.safeParse({
      ...ecommerce,
      category: "Anne ve Bebek > Bebek Tekstili > Bebek Battaniyesi",
    });
    const tooLong = tezgahGenerateRequestSchema.safeParse({ ...ecommerce, category: "K".repeat(81) });
    expect(empty.success).toBe(true);
    expect(word.success).toBe(true);
    expect(path.success).toBe(true);
    expect(tooLong.success).toBe(false);
    if (!empty.success || !word.success || !path.success) {
      return;
    }

    expect(tezgahUserPrompt(empty.data)).toContain("Kategori boş.");
    expect(tezgahUserPrompt(empty.data)).toContain("Pamuklu battaniye");
    expect(tezgahUserPrompt(empty.data)).toContain("Trendyol ve Hepsiburada uyumlu alt kategori yolunu belirle");
    expect(tezgahUserPrompt(word.data)).toContain("Kategori ipucu (tek kelime): Battaniye");
    expect(tezgahUserPrompt({ ...ecommerce, category: "Anne & Bebek" })).toContain(
      "Kategori ipucu (ana kategori veya ürün türü): Anne & Bebek",
    );
    expect(tezgahUserPrompt(path.data)).toContain("Bu kategori yolunu olduğu gibi kullan.");
    expect(tezgahUserPrompt(path.data)).not.toContain("Kategori boş.");
    expect(tezgahSystemPrompt(path.data)).toContain("Verilen `>` kategori yolunu olduğu gibi kullan.");

    const seen: InvokeLlmInput[] = [];
    const result = await generateTezgahOutput(
      { actorId: "guest:203.0.113.40", guest: true, request: empty.data },
      {
        now: () => NOW,
        invoke: async (input) => {
          seen.push(input);
          return okText("Kategori: Anne ve Bebek > Bebek Tekstili > Bebek Battaniyesi\n## Başlık\nPamuklu battaniye");
        },
      },
    );
    expect(result.ok).toBe(true);
    expect(seen[0]?.user).toContain("Kategori boş.");
    expect(seen[0]?.system).toContain("tek kelimeyse");
  });
});
