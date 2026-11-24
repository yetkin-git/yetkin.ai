import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  careerSealCanonicalPayload,
  CAREER_SEAL_HMAC_LAB_FALLBACK,
  signCareerSealHmac,
  verifyCareerSealHmac,
} from "@/lib/career/seal-hmac";

describe("Y4 / F2.2 — seal HMAC + verify ucu", () => {
  const payload = {
    certificateHash: "a".repeat(64),
    userId: "user_1",
    sittingId: "sitting_1",
    roleKey: "corporate",
    verticalKey: "ecommerce",
    score: 88,
    issuedAt: "2026-11-24T10:00:00.000Z",
  };

  it("kanonik yük sabit alan sırası üretir", () => {
    expect(careerSealCanonicalPayload(payload)).toContain("yetkin-cv-seal.v1");
    expect(careerSealCanonicalPayload(payload).split("\n")).toHaveLength(8);
  });

  it("HMAC-SHA256 imza üretir ve doğrular", () => {
    const signature = signCareerSealHmac(payload, CAREER_SEAL_HMAC_LAB_FALLBACK);
    expect(signature).toMatch(/^[a-f0-9]{64}$/);
    expect(verifyCareerSealHmac(payload, signature, CAREER_SEAL_HMAC_LAB_FALLBACK)).toEqual({
      present: true,
      valid: true,
    });
  });

  it("imzasız eski satır present=false / valid=false (geriye dönük)", () => {
    expect(verifyCareerSealHmac(payload, null, CAREER_SEAL_HMAC_LAB_FALLBACK)).toEqual({
      present: false,
      valid: false,
    });
  });

  it("bozuk imzayı reddeder", () => {
    const signature = signCareerSealHmac(payload, CAREER_SEAL_HMAC_LAB_FALLBACK);
    const flipped = signature.replace(/^./, signature[0] === "a" ? "b" : "a");
    expect(verifyCareerSealHmac(payload, flipped, CAREER_SEAL_HMAC_LAB_FALLBACK).valid).toBe(false);
  });

  it("kamuya açık verify rotası public + rate-limit + hmacValid alanı taşır", () => {
    const route = readFileSync(
      join(process.cwd(), "app/api/career/verify/[hash]/route.ts"),
      "utf8",
    );
    expect(route).toContain('export const auth = "public"');
    expect(route).toContain("HTTP_RATE_LIMITS.careerVerifyIp");
    expect(route).toContain("hmacValid");
    expect(route).toContain("signature");
  });

  it("YetkinCvSeal oluştururken hmacSignature yazar", () => {
    const store = readFileSync(join(process.cwd(), "lib/career/yetkincv-store.ts"), "utf8");
    expect(store).toContain("signCareerSealHmac");
    expect(store).toContain("hmacSignature");
    expect(store).toContain("verifyYetkinCvSealByHash");
  });

  it("migration HMAC kolonunu ekler", () => {
    const sql = readFileSync(
      join(process.cwd(), "prisma/migrations/20261124140000_career_faz2_ecosystem/migration.sql"),
      "utf8",
    );
    expect(sql).toContain("hmac_signature");
  });
});
