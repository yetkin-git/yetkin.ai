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
} from "@/lib/tezgah/reklam/copy";
import { generateReklamPackage, REKLAM_MAX_OUTPUT_TOKENS, REKLAM_MODEL_ROLE } from "@/lib/tezgah/reklam/engine";
import { sealReklamMarkdown } from "@/lib/tezgah/reklam/guard";
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

function modelPack(googleTitle: string, googleDescription: string): string {
  return [
    "## Kancalar",
    "- Sabah taze çıkar",
    "- 199 TL ile ikinci poğaça",
    "- Mahallede aynı gün",
    "- 10 bin gösterim ve 500 TL",
    "## Meta başlık",
    "Kadıköy fırını",
    "## Meta metin",
    "Taze ekmek ve poğaça için dükkana bekleriz.",
    "## Google başlık",
    googleTitle,
    "## Google açıklama",
    googleDescription,
    "## Anahtar kelimeler",
    "- kadıköy fırın",
    "- taze ekmek",
    "- poğaça",
    "## Görsel brif",
    "Kadraj: tezgah üstü ekmek",
    "Görsel üstü yazı: Taze çıktı",
    "Gösterilmeyecek: fiyat etiketi",
    "## Hedef kitle",
    "İlgi: lüks yat",
    "## Amaç çağrısı",
    "Hemen arayın",
  ].join("\n");
}

const SHORT_TITLE = "Taze ekmek Kadıköy";
const SHORT_DESCRIPTION = "Kadıköy'de taze ekmek ve poğaça. Bugün tezgaha yazın.";

describe("reklam paketi", () => {
  beforeEach(() => {
    resetTezgahQuotaForTests();
  });

  it("Google sınırını, şehir sözlüğünü ve amaç çağrısını kod mühürler", () => {
    const draft = readReklamDraft(REQUEST);
    const sealed = sealReklamMarkdown(modelPack("A".repeat(30), "B".repeat(90)), draft);
    expect(sealed).not.toBeNull();
    if (!sealed) {
      return;
    }
    const google = sealed.split("## Google Arama")[1]?.split("## Hedef kitle")[0] ?? "";
    const title = google.split("\n").find((line) => line.startsWith("Başlık: "))?.slice("Başlık: ".length) ?? "";
    const description = google.split("\n").find((line) => line.startsWith("Açıklama: "))?.slice("Açıklama: ".length) ?? "";
    expect([...title].length).toBe(REKLAM_GOOGLE_TITLE_MAX);
    expect([...description].length).toBe(REKLAM_GOOGLE_DESCRIPTION_MAX);
    expect(sealReklamMarkdown(modelPack("A".repeat(31), SHORT_DESCRIPTION), draft)).toBeNull();
    expect(sealReklamMarkdown(modelPack(SHORT_TITLE, "B".repeat(91)), draft)).toBeNull();

    expect(sealed.startsWith("# Karaoğlu Fırın")).toBe(true);
    expect(sealed).toContain("Şehir: Kadıköy, İstanbul");
    expect(sealed).toContain(`İlgi alanları: ${REKLAM_SECTOR_INTERESTS.restoran.join(", ")}`);
    expect(sealed).not.toContain("lüks yat");
    expect(sealed).toContain("199 TL");
    expect(sealed).not.toContain("500");
    expect(sealed).not.toContain("gösterim");
    expect(sealed).toContain(REKLAM_AIM_CTA.whatsapp);
    expect(sealed).not.toContain(REKLAM_AIM_CTA.call);
    expect(sealed).not.toContain(REKLAM_AIM_CTA.visit);
    expect(sealed.endsWith(REKLAM_DISCLAIMER)).toBe(true);
    expect(sealed.split("## Meta")[0]?.match(/^- /gm)?.length).toBe(3);

    const kuafor = sealReklamMarkdown(modelPack(SHORT_TITLE, SHORT_DESCRIPTION), {
      ...draft,
      sector: "kuafor",
    });
    expect(kuafor).toContain(`İlgi alanları: ${REKLAM_SECTOR_INTERESTS.kuafor.join(", ")}`);
    expect(kuafor).not.toContain(REKLAM_SECTOR_INTERESTS.restoran[0]);
  });

  it("hak düşer, taşan Google başlığı hakkı geri yazar, bozuk istek hak yemez", async () => {
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
    expect(first.remaining).toBe(2);
    expect(first.limit).toBe(3);
    expect(first.markdown).toContain(REKLAM_DISCLAIMER);
    expect(seen[0]?.role).toBe(REKLAM_MODEL_ROLE);
    expect(seen[0]?.temperature).toBe(0.4);
    expect(seen[0]?.maxOutputTokens).toBe(REKLAM_MAX_OUTPUT_TOKENS);
    expect(seen[0]?.maxAttempts).toBe(1);
    expect(seen[0]?.timeoutMs).toBe(25_000);
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

    let overflowCalls = 0;
    const overflow = await generateReklamPackage(
      { actorId: "guest:reklam-overflow", guest: true, request: REQUEST },
      {
        now: () => NOW,
        invoke: async () => {
          overflowCalls += 1;
          return okText(modelPack("A".repeat(31), SHORT_DESCRIPTION));
        },
      },
    );
    expect(overflowCalls).toBe(1);
    expect(overflow).toMatchObject({ ok: false, status: 503, error: TEZGAH_FAIL_MESSAGE, remaining: 3 });

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
