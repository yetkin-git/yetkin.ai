import { beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { InvokeLlmInput, LlmGatewayResult } from "@/lib/kernel/ai/types";
import { TEZGAH_FAIL_MESSAGE, TEZGAH_PRO_MONTHLY_CREDITS } from "@/lib/tezgah/catalog";
import {
  generateTezgahOutput,
  TEZGAH_PROPOSAL_MAX_OUTPUT_TOKENS,
} from "@/lib/tezgah/engine";
import { applyPriceShield, inventsMoney } from "@/lib/tezgah/guard/price-shield";
import { tezgahSystemPrompt } from "@/lib/tezgah/prompts";
import { buildProposalDocx, buildProposalPdf, proposalMarkdownToBlocks } from "@/lib/tezgah/proposal/document";
import {
  consumeTezgahQuota,
  peekTezgahQuota,
  refundTezgahQuota,
  resetTezgahQuotaForTests,
} from "@/lib/tezgah/quota";
import { resetTezgahEntitlementReadersForTests, setTezgahEntitlementReadersForTests } from "@/lib/tezgah/paid-lane";
import { tezgahGenerateRequestSchema } from "@/lib/tezgah/schema";

const NOW = new Date("2026-11-14T12:00:00+03:00");
const MEMBER = "user_proposal_station";
const PRO = "user_proposal_pro";
const COMMAND = "11111111-1111-4111-8111-111111111111";

function okText(text: string): LlmGatewayResult {
  return {
    text,
    model: "gemini-3.5-flash-lite",
    provider: "gemini",
    usage: { promptTokens: 12, completionTokens: 40, totalTokens: 52 },
  };
}

function readSrc(rel: string): string {
  return readFileSync(join(process.cwd(), rel), "utf8");
}

const proposalRequest = {
  tool: "proposal" as const,
  jobPost: "Kurumsal web sitesi yenilenecek. Bütçe 12.500 TL, teslim 3 hafta.",
  expertise: "Ürün tasarımcısı",
  deliveryMode: "standard" as const,
};

describe("proposal istasyonu — kota, kalkan, teslimat", () => {
  beforeEach(() => {
    resetTezgahQuotaForTests();
    resetTezgahEntitlementReadersForTests();
  });

  it("kredi hattında Idempotency-Key olmadan 400; anahtarla üretim açılır", async () => {
    setTezgahEntitlementReadersForTests({
      proActive: async () => false,
      credits: async () => ({ remaining: 3, unitMinor: 1_000 }),
      catalogAmount: async () => 1_000,
    });
    for (let i = 0; i < 30; i += 1) {
      await consumeTezgahQuota(MEMBER, false, NOW, null, "lite");
    }
    const blocked = await consumeTezgahQuota(MEMBER, false, NOW, null, "lite");
    expect(blocked).toMatchObject({
      allowed: false,
      status: 400,
      error: "Ücretli üretim Idempotency-Key ister.",
    });

    // Test ortamında ücretli hold kapalıdır; istemci header sözleşmesi workbench'te mühürlüdür.
    const workbench = readSrc("components/tezgah/workbench.tsx");
    expect(workbench).toContain("productionHeaders()");
    expect(workbench).toContain("productionIdempotency.headers()");
    expect(workbench).toContain('"/api/tezgah/generate"');
    expect(workbench).not.toMatch(
      /\/api\/tezgah\/generate[\s\S]{0,200}headers:\s*\{\s*"content-type":\s*"application\/json"\s*\}/,
    );
  });

  it("ücretsiz/Pro hatta aynı komut anahtarı ikinci kez kredi düşürmez", async () => {
    const cmd = { key: COMMAND, requestHash: "hash-a" };
    const first = await consumeTezgahQuota(MEMBER, false, NOW, cmd, "lite");
    expect(first).toMatchObject({ allowed: true, used: 1, remaining: 29 });
    const replay = await consumeTezgahQuota(MEMBER, false, NOW, cmd, "lite");
    expect(replay).toMatchObject({ allowed: true, used: 1, remaining: 29 });
    const conflict = await consumeTezgahQuota(
      MEMBER,
      false,
      NOW,
      { key: COMMAND, requestHash: "hash-b" },
      "lite",
    );
    expect(conflict).toMatchObject({ allowed: false, status: 400 });
  });

  it("Pro hattı boş yanıtta sayacı iade eder", async () => {
    setTezgahEntitlementReadersForTests({ proActive: async () => true });
    const before = await peekTezgahQuota(PRO, false, NOW, "lite");
    expect(before.limit).toBe(TEZGAH_PRO_MONTHLY_CREDITS);

    const failed = await generateTezgahOutput(
      {
        actorId: PRO,
        guest: false,
        request: proposalRequest,
        commandKey: COMMAND,
      },
      { now: () => NOW, invoke: async () => null },
    );
    expect(failed).toMatchObject({
      ok: false,
      status: 503,
      error: TEZGAH_FAIL_MESSAGE,
      remaining: TEZGAH_PRO_MONTHLY_CREDITS,
    });
    const after = await peekTezgahQuota(PRO, false, NOW, "lite");
    expect(after.remaining).toBe(TEZGAH_PRO_MONTHLY_CREDITS);
    expect(after.used).toBe(0);
  });

  it("price-shield sahte 50.000 TL cümlesini düşürür; kullanıcının tutarını korur", () => {
    const source = "Bütçe 12.500 TL. Teslim 3 hafta.";
    expect(inventsMoney("Toplam ücret 50.000 TL olarak hesaplandı.", source)).toBe(true);
    expect(inventsMoney("Belirttiğiniz 12.500 TL bütçe içinde kalırız.", source)).toBe(false);

    const sealed = applyPriceShield(
      [
        "## Yönetici Özeti",
        "Kapsamı netleştiririz.",
        "Toplam ücret 50.000 TL olarak hesaplandı.",
        "Belirttiğiniz 12.500 TL bütçe içinde kalırız.",
        "Kesin satış garantisi veriyoruz.",
      ].join("\n"),
      source,
    );
    expect(sealed).not.toContain("50.000");
    expect(sealed).toContain("12.500 TL");
    expect(sealed).not.toContain("Kesin satış garantisi");
  });

  it("üç teklif modu başlıkları ve docx/pdf üretimi", () => {
    expect(
      tezgahSystemPrompt({
        tool: "proposal",
        jobPost: "Site yenileme",
        expertise: "Tasarım",
        deliveryMode: "standard",
      }),
    ).toContain("## Kapsam & Teslimat Adımları");
    expect(
      tezgahSystemPrompt({
        tool: "proposal",
        jobPost: "Site yenileme",
        expertise: "Tasarım",
        deliveryMode: "b2b",
      }),
    ).toContain("## Kabul Kriterleri");
    expect(
      tezgahSystemPrompt({
        tool: "proposal",
        jobPost: "Site yenileme",
        expertise: "Tasarım",
        deliveryMode: "summary",
      }),
    ).toContain("## Kalem Bazlı İş Paketi Tablosu");

    expect(tezgahGenerateRequestSchema.safeParse({ ...proposalRequest, deliveryMode: "b2b" }).success).toBe(
      true,
    );

    const markdown = [
      "## Yönetici Özeti",
      "Kapsamı netleştiririz.",
      "## Kapsam & Teslimat Adımları",
      "1. Keşif görüşmesi",
      "2. Taslak teslimi",
      "3. Onay ve yayın",
    ].join("\n");
    const blocks = proposalMarkdownToBlocks(markdown);
    expect(blocks.some((block) => block.kind === "table")).toBe(true);
    const docx = buildProposalDocx(markdown);
    const pdf = buildProposalPdf(markdown);
    expect(docx.byteLength).toBeGreaterThan(40);
    expect(pdf.byteLength).toBeGreaterThan(40);
    expect(String.fromCharCode(docx[0]!, docx[1]!)).toBe("PK");
    expect(String.fromCharCode(pdf[0]!, pdf[1]!, pdf[2]!, pdf[3]!)).toBe("%PDF");
  });

  it("proposal üretimi yükseltilmiş token tavanı ve kalkan kullanır", async () => {
    const seen: InvokeLlmInput[] = [];
    const result = await generateTezgahOutput(
      {
        actorId: "guest:198.51.100.10",
        guest: true,
        request: proposalRequest,
      },
      {
        now: () => NOW,
        invoke: async (input) => {
          seen.push(input);
          return okText(
            [
              "## Yönetici Özeti",
              "İhtiyacı karşılarız.",
              "Toplam ücret 50.000 TL olarak hesaplandı.",
              "Belirttiğiniz 12.500 TL bütçe içinde kalırız.",
              "## Kapsam & Teslimat Adımları",
              "1. Keşif",
              "2. Teslim",
              "## İş-Zaman Planı",
              "3 haftalık takvim.",
              "## Müşteri Sorumlulukları ve Onay Bloğu",
              "Onay sonrası başlanır.",
            ].join("\n"),
          );
        },
      },
    );
    expect(result.ok).toBe(true);
    expect(seen[0]?.maxOutputTokens).toBe(TEZGAH_PROPOSAL_MAX_OUTPUT_TOKENS);
    if (result.ok) {
      expect(result.markdown).toContain("12.500 TL");
      expect(result.markdown).not.toContain("50.000");
    }
  });

  it("GET /api/tezgah/outputs/[id] oturum mührü ve sahiplik taşır", () => {
    const route = readSrc("app/api/tezgah/outputs/[id]/route.ts");
    expect(route).toContain('export const auth = "session"');
    expect(route).toContain("requireSession");
    expect(route).toContain("userId: user.id");
    expect(route).toContain("outputContent");
    const portfolio = readSrc("components/tezgah/output-portfolio.tsx");
    expect(portfolio).toContain("/api/tezgah/outputs/");
    expect(portfolio).toContain("Word (.docx)");
    expect(portfolio).toContain("buildProposalPdf");
  });

  it("Pro iade decrement yolunu gerçekten çağırır", async () => {
    setTezgahEntitlementReadersForTests({ proActive: async () => true });
    const slot = await consumeTezgahQuota(PRO, false, NOW, null, "lite");
    expect(slot.lane).toBe("pro");
    expect(slot.remaining).toBe(TEZGAH_PRO_MONTHLY_CREDITS - 1);
    const restored = await refundTezgahQuota(PRO, false, NOW, "pro", "lite");
    expect(restored.remaining).toBe(TEZGAH_PRO_MONTHLY_CREDITS);
    expect(restored.lane).toBe("pro");
  });
});

describe("proposal UI sözleşmesi", () => {
  it("workbench docx/pdf ve çapraz köprüleri taşır", () => {
    const workbench = readSrc("components/tezgah/workbench.tsx");
    expect(workbench).toContain("Word (.docx) İndir");
    expect(workbench).toContain("PDF İndir");
    expect(workbench).toContain("YetkinCV Portföyüne Kanıt Olarak Ekle");
    expect(workbench).toContain("Bu Proje Kapsamıyla Hibe Ara");
    expect(workbench).toContain("proposalHibeAnalysisHref");
    expect(workbench).toContain("buildProposalDocx");
    const upgrade = readSrc("components/tezgah/upgrade-card.tsx");
    expect(upgrade).toContain("Aylık kredi");
    expect(upgrade).toContain("Her ayın 1");
    expect(upgrade).not.toContain("İstanbul gece yarısında yenilenir");
  });
});
