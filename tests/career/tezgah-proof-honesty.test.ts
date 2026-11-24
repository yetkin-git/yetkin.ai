import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { toPublicTalentCard, publicTalentCardHasIdentityLeak } from "@/lib/career/public-talent";
import type { LiveCareerStamp } from "@/lib/career/live";
import { CAREER_SEN } from "@/lib/copy/sen-voice/career";

function src(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

const STAMP: LiveCareerStamp = {
  id: "stamp_tezgah_1",
  userId: "user_secret",
  sourceKind: "ACADEMY_CERTIFICATE",
  sourceId: "cert_secret",
  visaKey: "academy.certificate:cert_secret",
  moduleId: "academy",
  title: "Ofis Yapay Zekâ",
  certificateHash: "a".repeat(64),
  issuedAt: new Date("2026-11-01T10:00:00Z"),
  createdAt: new Date("2026-11-01T10:00:00Z"),
  courseSlug: "01_office_ai",
};

describe("Tezgâh kanıt dürüstlüğü (Y2, O7)", () => {
  it("kamu kartında tezgâh kanıtı sahte visaStampId bağlamaz", () => {
    const load = src("lib/career/public-talent-load.ts");
    expect(load).toContain('kind: "tezgah"');
    expect(load).not.toContain("visaStampId: featuredLive.id");
    const board = src("components/career/public-talent-board.tsx");
    expect(board).toContain("tezgahProofs");
    expect(CAREER_SEN.publicPage.sealsTitle).toContain("Doğrulanmış Yetkinlik");
    expect(CAREER_SEN.publicPage.tezgahProofsTitle).toContain("AI Tezgâh");
  });

  it("tezgâh eklerken outputHash yazar; /career tezgâh kanıtlarını listeler", () => {
    const bridge = src("lib/career/tezgah-portfolio.ts");
    expect(bridge).toContain("outputHash");
    expect(bridge).toContain("sha256Hex");
    expect(bridge).toContain("listTezgahPortfolioForUser");
    const store = src("lib/career/prisma-store.ts");
    expect(store).toContain('startsWith: "tezgah:"');
    const page = src("app/career/page.tsx");
    expect(page).toContain("listTezgahPortfolioForUser");
    expect(page).toContain("Portföy Çıktıları (AI Tezgâh Kayıtlı)");
  });

  it("mühür kanıtları ile tezgâh kanıtları ayrışır; PII sızmaz", () => {
    const card = toPublicTalentCard(STAMP, [STAMP], [
      { title: "Sertifika kanıtı", visaStampId: STAMP.id },
    ]);
    expect(card.proofs.every((row) => row.kind === "visa")).toBe(true);
    expect(card.tezgahProofs).toEqual([]);
    const merged = {
      ...card,
      tezgahProofs: [{ title: "Tezgâh çıktısı", kind: "tezgah" as const, detail: "kısa alıntı" }],
    };
    expect("visaStampId" in (merged.tezgahProofs[0] ?? {})).toBe(false);
    expect(publicTalentCardHasIdentityLeak(merged)).toBe(false);
  });
});
