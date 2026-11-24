import { beforeEach, describe, expect, it } from "vitest";
import type { InvokeLlmInput, LlmGatewayResult } from "@/lib/kernel/ai/types";
import { TEZGAH_FAIL_MESSAGE, TEZGAH_GUEST_QUOTA_MESSAGE } from "@/lib/tezgah/catalog";
import { resetTezgahQuotaForTests } from "@/lib/tezgah/quota";
import {
  REKLAM_AIM_CTA,
  REKLAM_DISCLAIMER,
  REKLAM_FILE_STEM,
  REKLAM_GOOGLE_DESCRIPTION_MAX,
  REKLAM_GOOGLE_TITLE_MAX,
  REKLAM_SECTOR_INTERESTS,
  REKLAM_VARIANTS,
} from "@/lib/tezgah/reklam/copy";
import { generateReklamPackage, REKLAM_MAX_OUTPUT_TOKENS, REKLAM_MODEL_ROLE } from "@/lib/tezgah/reklam/engine";
import { clipReklamUnits, sealReklamMarkdown, sealReklamPackage } from "@/lib/tezgah/reklam/guard";
import { reklamSystemPrompt } from "@/lib/tezgah/reklam/prompts";
import { readReklamDraft, type ReklamGenerateRequest } from "@/lib/tezgah/reklam/schema";

const NOW = new Date("2026-11-14T12:00:00+03:00");

const REQUEST: ReklamGenerateRequest = {
  businessName: "Karaoğlu Fırın",
  sector: "restoran",
  place: "Kadıköy, İstanbul",
  aim: "whatsapp",
  offer: "199 TL ile ikinci poğaça",
};

function okText(text: string): LlmGatewayResult {
  return {
    text,
    model: "gemini-3.5-flash-lite",
    provider: "gemini",
    usage: { promptTokens: 20, completionTokens: 40, totalTokens: 60 },
  };
}

function variantBlock(
  heading: string,
  googleTitle: string,
  googleDescription: string,
  extras: string[] = [],
): string {
  return [
    `## ${heading}`,
    "### Google başlıklar",
    `- ${googleTitle}`,
    `- ${googleTitle} 2`,
    `- ${googleTitle} 3`,
    "### Google açıklamalar",
    `- ${googleDescription}`,
    `- ${googleDescription} ek`,
    "### Meta başlık",
    "Kadıköy fırını",
    "### Meta metin",
    "Taze ekmek ve poğaça için dükkana bekleriz.",
    "### Anahtar kelimeler",
    "- kadıköy fırın",
    "- taze ekmek",
    "- poğaça",
    "### Negatif anahtar kelimeler",
    "- ucuz fırın",
    "- toptan un",
    "### Görsel brif",
    "Kadraj: tezgah üstü ekmek",
    "Görsel üstü yazı: Taze çıktı",
    "Gösterilmeyecek: fiyat etiketi",
    ...extras,
  ].join("\n");
}

function modelPack(googleTitle: string, googleDescription: string): string {
  return REKLAM_VARIANTS.map((row) => variantBlock(row.heading, googleTitle, googleDescription)).join(
    "\n\n",
  );
}

const SHORT_TITLE = "Taze ekmek Kadıköy";
const SHORT_DESCRIPTION = "Kadıköy'de taze ekmek ve poğaça. Bugün tezgaha yazın.";

describe("reklam paketi", () => {
  beforeEach(() => {
    resetTezgahQuotaForTests();
  });

  it("Google sınırını kırpar, şehir sözlüğünü ve amaç çağrısını kod mühürler", () => {
    const draft = readReklamDraft(REQUEST);
    const sealed = sealReklamMarkdown(modelPack("A".repeat(30), "B".repeat(90)), draft);
    expect(sealed).not.toBeNull();
    if (!sealed) {
      return;
    }
    expect(sealed).toContain("## Varyant A — Sorun & Çözüm");
    expect(sealed).toContain("## Varyant B — Güven & Uzmanlık");
    expect(sealed).toContain("## Varyant C — Net Teklif & Hızlı Aksiyon");
    expect(sealed).toContain("## Bütçe dağılımı");
    expect(sealed).toContain("Soğuk Test: %60");
    expect(sealed).toContain("Tutar girilmedi");

    const google = sealed.split("### Google Arama")[1]?.split("### Meta")[0] ?? "";
    const title = google.split("\n").find((line) => line.startsWith("Başlık 1: "))?.slice("Başlık 1: ".length) ?? "";
    const description =
      google.split("\n").find((line) => line.startsWith("Açıklama 1: "))?.slice("Açıklama 1: ".length) ?? "";
    expect([...title].length).toBe(REKLAM_GOOGLE_TITLE_MAX);
    expect([...description].length).toBe(REKLAM_GOOGLE_DESCRIPTION_MAX);

    const clippedTitle = sealReklamMarkdown(modelPack("A".repeat(31), SHORT_DESCRIPTION), draft);
    expect(clippedTitle).not.toBeNull();
    expect(clippedTitle).toContain(`Başlık 1: ${"A".repeat(30)}`);
    const clippedDesc = sealReklamMarkdown(modelPack(SHORT_TITLE, "B".repeat(91)), draft);
    expect(clippedDesc).not.toBeNull();
    expect(clippedDesc).toContain(`Açıklama 1: ${"B".repeat(90)}`);
    expect(clipReklamUnits("A".repeat(31), 30)).toBe("A".repeat(30));

    expect(sealed.startsWith("# Karaoğlu Fırın")).toBe(true);
    expect(sealed).toContain("Şehir: Kadıköy, İstanbul");
    expect(sealed).toContain(`İlgi alanları: ${REKLAM_SECTOR_INTERESTS.restoran.join(", ")}`);
    const withOffer = sealReklamMarkdown(
      modelPack(SHORT_TITLE, SHORT_DESCRIPTION).replace(
        "Taze ekmek ve poğaça için dükkana bekleriz.",
        "199 TL ile ikinci poğaça için yazın.",
      ),
      draft,
    );
    expect(withOffer).toContain("199 TL");
    expect(sealed).toContain(REKLAM_AIM_CTA.whatsapp);
    expect(sealed).not.toContain(REKLAM_AIM_CTA.call);
    expect(sealed).not.toContain(REKLAM_AIM_CTA.visit);
    expect(sealed.endsWith(REKLAM_DISCLAIMER)).toBe(true);

    const withBudget = sealReklamPackage(modelPack(SHORT_TITLE, SHORT_DESCRIPTION), {
      ...draft,
      budgetTl: 1000,
      budget: readReklamDraft({ ...REQUEST, budgetTl: "1000" }).budget,
    });
    expect(withBudget?.budget.coldTestTl).toBe(600);
    expect(withBudget?.budget.remarketingTl).toBe(250);
    expect(withBudget?.budget.scaleTl).toBe(150);

    const guzellik = sealReklamMarkdown(modelPack(SHORT_TITLE, SHORT_DESCRIPTION), {
      ...draft,
      sector: "guzellik",
    });
    expect(guzellik).toContain(`İlgi alanları: ${REKLAM_SECTOR_INTERESTS.guzellik.join(", ")}`);
    expect(guzellik).not.toContain(REKLAM_SECTOR_INTERESTS.restoran[0]);
  });

  it("hak düşer, eksik varyant hakkı geri yazar, bozuk istek hak yemez", async () => {
    const seen: InvokeLlmInput[] = [];
    const actorId = "guest:reklam-engine";
    const first = await generateReklamPackage(
      { actorId, guest: true, request: REQUEST },
      {
        now: () => NOW,
        invoke: async (input) => {
          seen.push(input);
          return okText(modelPack(SHORT_TITLE, SHORT_DESCRIPTION));
        },
      },
    );
    expect(first.ok).toBe(true);
    if (!first.ok) {
      return;
    }
    expect(first.tool).toBe("reklam");
    expect(first.filename).toBe(REKLAM_FILE_STEM);
    expect(first.googleCsv).toContain("Campaign");
    expect(first.metaCsv).toContain("Primary Text");
    expect(first.remaining).toBe(2);
    expect(first.limit).toBe(3);
    expect(first.markdown).toContain(REKLAM_DISCLAIMER);
    expect(seen[0]?.role).toBe(REKLAM_MODEL_ROLE);
    expect(seen[0]?.temperature).toBe(0.4);
    expect(seen[0]?.maxOutputTokens).toBe(REKLAM_MAX_OUTPUT_TOKENS);
    expect(seen[0]?.maxAttempts).toBe(1);
    expect(seen[0]?.timeoutMs).toBe(45_000);
    expect(seen[0]?.rateLimit).toMatchObject({ scope: "tezgah", limit: 8, windowMs: 60_000 });
    expect(seen[0]?.billing).toMatchObject({ source: "tezgah", recordUsage: true, userId: null });
    expect(seen[0]?.system).toBe(reklamSystemPrompt());
    expect(seen[0]?.system).toContain(String(REKLAM_GOOGLE_TITLE_MAX));
    expect(seen[0]?.system).toContain(String(REKLAM_GOOGLE_DESCRIPTION_MAX));
    expect(seen[0]?.system).toContain("yok say");
    expect(seen[0]?.user).toContain("199 TL ile ikinci poğaça");
    expect(seen[0]?.user?.startsWith("{")).toBe(true);

    for (let extra = 0; extra < 2; extra += 1) {
      const mid = await generateReklamPackage(
        { actorId, guest: true, request: REQUEST },
        { now: () => NOW, invoke: async () => okText(modelPack(SHORT_TITLE, SHORT_DESCRIPTION)) },
      );
      expect(mid.ok).toBe(true);
    }
    const blocked = await generateReklamPackage(
      { actorId, guest: true, request: REQUEST },
      { now: () => NOW, invoke: async () => okText(modelPack(SHORT_TITLE, SHORT_DESCRIPTION)) },
    );
    expect(blocked).toMatchObject({ ok: false, status: 429, error: TEZGAH_GUEST_QUOTA_MESSAGE, remaining: 0 });

    let brokenCalls = 0;
    const broken = await generateReklamPackage(
      { actorId: "guest:reklam-broken", guest: true, request: REQUEST },
      {
        now: () => NOW,
        invoke: async () => {
          brokenCalls += 1;
          return okText("## Varyant A — Sorun & Çözüm\n### Meta başlık\nyalnız bu");
        },
      },
    );
    expect(brokenCalls).toBe(1);
    expect(broken).toMatchObject({ ok: false, status: 503, error: TEZGAH_FAIL_MESSAGE, remaining: 3 });

    let rejectedCalls = 0;
    const rejected = await generateReklamPackage(
      {
        actorId: "guest:reklam-rejected",
        guest: true,
        request: { ...REQUEST, aim: "sms" as ReklamGenerateRequest["aim"] },
      },
      {
        now: () => NOW,
        invoke: async () => {
          rejectedCalls += 1;
          return okText("yok");
        },
      },
    );
    expect(rejectedCalls).toBe(0);
    expect(rejected).toMatchObject({ ok: false, status: 400, remaining: 3, limit: 3 });
  });
});
