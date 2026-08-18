import { describe, expect, it } from "vitest";
import { isAdultInTurkey } from "@/lib/junior/age-gate";
import { JUNIOR_HAPPY_PATH } from "@/lib/junior";
import { FREELANCER_HAPPY_PATH, FREELANCER_UNHAPPY_PATH } from "@/lib/freelancer";
import { ACADEMY_HAPPY_PATH } from "@/lib/academy";
import { CAREER_HAPPY_PATH } from "@/lib/career";
import { STUDIO_HAPPY_PATH, STUDIO_IMAGE_PATH } from "@/lib/studio";
import { KURUMSAL_HAPPY_PATH } from "@/lib/kurumsal";
import { ARENA_HAPPY_PATH, ARENA_TRANSPORT } from "@/lib/arena";
import { DEVLABS_HAPPY_PATH } from "@/lib/devlabs";
import { HIBE_CATALOG_HONESTY, HIBE_HAPPY_PATH } from "@/lib/hibe";
import { PAZARYERI_ASSET_VITRINE_PATH, PAZARYERI_HAPPY_PATH, PAZARYERI_SURFACES } from "@/lib/pazaryeri";
import { SOCIAL_HAPPY_PATH } from "@/lib/social";
import { RIBBON_ROOMS, VERTICAL_ROOMS } from "@/lib/kernel/modules";
import {
  AI_LIVE_MODEL_ROLE_KEYS,
  AI_MODEL_ROLE_KEYS,
  AI_SEALED_DEAD_ROLE_KEYS,
} from "@/lib/kernel/ai/model-roles";
import type { ProofFeedItemDto } from "@/lib/social/proof-feed.dto";

describe("anayasa yüzey sözleşmeleri", () => {
  it("Junior TR 18 yaş kapısını hesaplar", () => {
    const now = new Date("2026-08-14T00:00:00.000Z");
    expect(isAdultInTurkey("2008-08-14", now)).toBe(true);
    expect(isAdultInTurkey("2008-08-15", now)).toBe(false);
  });

  it("freelancer mutlu yol ilan → emanet → release; mutsuz yol tahkim", () => {
    expect(FREELANCER_HAPPY_PATH).toEqual(["listing", "escrow", "release"]);
    expect(FREELANCER_UNHAPPY_PATH).toEqual([
      "dispute",
      "rebuttal",
      "ai-report",
      "split-or-human-review",
    ]);
  });

  it("akademi mutlu yol katalog → kilit → settlement → müfredat → sınav → sertifika", () => {
    expect(ACADEMY_HAPPY_PATH).toEqual([
      "catalog",
      "price-lock",
      "settle",
      "curriculum",
      "exam",
      "certificate",
    ]);
  });

  it("kariyer mutlu yol kanıt → vize → portföy", () => {
    expect(CAREER_HAPPY_PATH).toEqual(["proof", "visa-stamp", "portfolio"]);
  });

  it("studio mutlu yol taslak → gümrük → token defteri → cüzdan debit", () => {
    expect(STUDIO_HAPPY_PATH).toEqual(["draft", "invoke-llm", "token-usage", "wallet-debit"]);
    expect(STUDIO_IMAGE_PATH).toEqual([
      "prompt",
      "generate-image",
      "token-usage",
      "wallet-debit",
      "digital-asset",
    ]);
  });

  it("kurumsal mutlu yol şirket → mühür → ödül → serbest", () => {
    expect(KURUMSAL_HAPPY_PATH).toEqual(["company", "seal-escrow", "award", "release"]);
  });

  it("arena mutlu yol ihale emaneti → teslim → değerlendirme → ödül dağıtımı", () => {
    expect(ARENA_HAPPY_PATH).toEqual(["tender-escrow", "submission", "evaluate", "award-payout"]);
    expect(ARENA_TRANSPORT).toBe("http+inngest");
  });

  it("DevLabs mutlu yol proje → anahtar → generate → linter → artifact", () => {
    expect(DEVLABS_HAPPY_PATH).toEqual(["project", "issue-key", "generate", "lint", "artifact"]);
  });

  it("pazaryeri mutlu yol ilan → kilit → anında veya emanet → teslim; emlak/vasıta yalnız listing", () => {
    expect(PAZARYERI_HAPPY_PATH).toEqual(["listing", "price-lock", "settle-or-escrow", "deliver"]);
    expect(PAZARYERI_ASSET_VITRINE_PATH).toEqual(["listing"]);
    expect(PAZARYERI_SURFACES).toEqual(["digital-goods", "services", "real-estate", "vehicles"]);
  });

  it("hibe mutlu yol katalog → eşleştirme → başvuru rehberi", () => {
    expect(HIBE_HAPPY_PATH).toEqual(["catalog", "match", "application-guide"]);
    expect(HIBE_CATALOG_HONESTY).toBe("catalog-not-live-government-api");
  });

  it("YetkinX mobil DTO boost alanı taşımaz", () => {
    const item: ProofFeedItemDto = {
      id: "p1",
      authorId: "u1",
      kind: "visa",
      title: "Kariyer vizesi",
      body: "mühür",
      sealedAt: "2026-08-14T00:00:00.000Z",
      passportVisaKey: "career.portfolio",
      mediaUrl: null,
    };
    expect(item).not.toHaveProperty("boost");
    expect(item.kind).toBe("visa");
  });

  it("AI tavanı 8 kanonik; VIDEO_GEN ve VOICE_TTS mühürlü-ölü, canlı listede yok", () => {
    expect(AI_MODEL_ROLE_KEYS).toHaveLength(8);
    expect(AI_LIVE_MODEL_ROLE_KEYS).toHaveLength(6);
    expect(AI_SEALED_DEAD_ROLE_KEYS).toEqual(["VIDEO_GEN", "VOICE_TTS"]);
    expect([...AI_LIVE_MODEL_ROLE_KEYS]).not.toContain("VIDEO_GEN");
    expect([...AI_LIVE_MODEL_ROLE_KEYS]).not.toContain("VOICE_TTS");
  });

  it("Junior mutlu yol yaş kapısı → vekâlet → harçlık", () => {
    expect(JUNIOR_HAPPY_PATH).toEqual(["age-gate", "guardian-consent", "allowance"]);
  });

  it("YetkinX mutlu yol mühürlü kanıt → akış → meydan", () => {
    expect(SOCIAL_HAPPY_PATH).toEqual(["sealed-proof", "feed", "square"]);
  });

  it("on iki asil oda sicili Junior ve YetkinX ile kapanır", () => {
    expect(VERTICAL_ROOMS).toHaveLength(12);
    expect(VERTICAL_ROOMS.map((room) => room.id)).toEqual([
      "dashboard",
      "studio",
      "academy",
      "career",
      "freelancer",
      "devlabs",
      "kurumsal",
      "hibe",
      "arena",
      "pazaryeri",
      "junior",
      "social",
    ]);
  });

  it("anasayfa şeridi Anasayfa çipini düşürür; on bir asil oda kalır", () => {
    expect(RIBBON_ROOMS).toHaveLength(11);
    expect(RIBBON_ROOMS.map((room) => room.id)).toEqual([
      "studio",
      "academy",
      "career",
      "freelancer",
      "devlabs",
      "kurumsal",
      "hibe",
      "arena",
      "pazaryeri",
      "junior",
      "social",
    ]);
    expect(RIBBON_ROOMS.map((room) => room.id)).not.toContain("dashboard");
    expect(RIBBON_ROOMS.map((room) => room.label)).not.toContain("Anasayfa");
    expect(RIBBON_ROOMS.map((room) => room.label)).not.toContain("Pazaryeri");
    const studio = VERTICAL_ROOMS.find((room) => room.id === "studio");
    expect(studio?.blurb).toContain("LLM Debit");
    expect(studio?.blurb).not.toContain("bakiyenizden");
    const devlabs = VERTICAL_ROOMS.find((room) => room.id === "devlabs");
    expect(devlabs?.blurb).toContain("exec yoktur");
    expect(devlabs?.blurb).not.toContain("yönetin");
    const yetkinIlan = VERTICAL_ROOMS.find((room) => room.id === "pazaryeri");
    expect(yetkinIlan?.label).toBe("Yetkinİlan");
    expect(yetkinIlan?.path).toBe("/yetkinilan");
    expect(yetkinIlan?.blurb).toBe(
      "Dijital üründe anında teslim. Hizmette emanet kilit. Emlak/vasıta yalnız vitrin.",
    );
  });
});
