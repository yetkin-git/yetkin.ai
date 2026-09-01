import { describe, expect, it } from "vitest";
import { FREELANCER_HAPPY_PATH, FREELANCER_UNHAPPY_PATH } from "@/lib/freelancer";
import { ACADEMY_HAPPY_PATH } from "@/lib/academy";
import { CAREER_HAPPY_PATH } from "@/lib/career";
import { RIBBON_ROOMS, VERTICAL_ROOMS } from "@/lib/kernel/modules";
import {
  isEidsPublicListingLocked,
  isJuniorProductionFrozen,
  isVitrineRoomFrozen,
} from "@/lib/kernel/compliance/circuit-breakers";
import {
  AI_LIVE_MODEL_ROLE_KEYS,
  AI_MODEL_ROLE_KEYS,
  AI_SEALED_DEAD_ROLE_KEYS,
} from "@/lib/kernel/ai/model-roles";

describe("anayasa yüzey sözleşmeleri", () => {
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

  it("AI tavanı 8 kanonik; VIDEO_GEN mühürlü-ölü; VOICE_TTS canlı factory", () => {
    expect(AI_MODEL_ROLE_KEYS).toHaveLength(8);
    expect(AI_LIVE_MODEL_ROLE_KEYS).toHaveLength(7);
    expect(AI_SEALED_DEAD_ROLE_KEYS).toEqual(["VIDEO_GEN"]);
    expect([...AI_LIVE_MODEL_ROLE_KEYS]).not.toContain("VIDEO_GEN");
    expect([...AI_LIVE_MODEL_ROLE_KEYS]).toContain("VOICE_TTS");
  });

  it("çalışan 4 oda sicili dashboard + akademi + kariyer + freelancer ile kapanır", () => {
    expect(VERTICAL_ROOMS).toHaveLength(4);
    expect(VERTICAL_ROOMS.map((room) => room.id)).toEqual([
      "dashboard",
      "academy",
      "career",
      "freelancer",
    ]);
  });

  it("anasayfa şeridi Anasayfa çipini düşürür; çalışan 3 oda kalır", () => {
    expect(RIBBON_ROOMS).toHaveLength(3);
    expect(RIBBON_ROOMS.map((room) => room.id)).toEqual(["academy", "career", "freelancer"]);
    expect(RIBBON_ROOMS.map((room) => room.id)).not.toContain("dashboard");
    expect(RIBBON_ROOMS.map((room) => room.label)).not.toContain("Anasayfa");
    expect(RIBBON_ROOMS.map((room) => room.label)).not.toContain("Pazaryeri");
    expect(VERTICAL_ROOMS.find((room) => room.id === "career")?.blurb).toBe(
      "Mühürden vize ve teklif kapısı",
    );
    expect(isEidsPublicListingLocked()).toBe(true);
    expect(isJuniorProductionFrozen()).toBe(true);
    expect(isVitrineRoomFrozen("junior")).toBe(true);
    expect(isVitrineRoomFrozen("studio")).toBe(true);
  });
});
