import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  countPassportSourceKinds,
  formatPassportIssuedAt,
  latestPassportStamp,
  passportAcademyVerifyHref,
  passportModuleLabel,
  passportSourceLabel,
  PASSPORT_UNSET_LABEL,
} from "@/lib/kernel/passport/display";
import { toPassportVisaStamp } from "@/lib/kernel/passport/types";
import type { SealedPassportStamp } from "@/lib/kernel/passport/types";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const SAMPLE: SealedPassportStamp = {
  id: "stamp-1",
  userId: "11111111-1111-4111-8111-111111111111",
  sourceKind: "ACADEMY_CERTIFICATE",
  sourceId: "cert-1",
  visaKey: "academy.certificate:cert-1",
  moduleId: "academy",
  title: "Rail temeli",
  certificateHash: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  issuedAt: new Date("2026-08-14T17:03:00.000Z"),
  createdAt: new Date("2026-08-14T17:03:00.000Z"),
};

describe("pasaport vize yüzeyi", () => {
  it("kaynak etiketini uydurmaz; ISO DTO issuedAt string taşır", () => {
    expect(passportSourceLabel("ACADEMY_CERTIFICATE")).toBe("Akademi sertifikası");
    expect(passportSourceLabel("FREELANCER_RELEASE")).toBe("Freelancer teslim mührü");
    expect(passportModuleLabel("academy")).toBe("Akademi");
    expect(passportModuleLabel("freelancer")).toBe("Freelancer");
    expect(PASSPORT_UNSET_LABEL).toBe("Henüz mühür yok");
    const dto = toPassportVisaStamp(SAMPLE);
    expect(dto.issuedAt).toBe("2026-08-14T17:03:00.000Z");
    expect(dto.visaKey).toBe(SAMPLE.visaKey);
    expect(countPassportSourceKinds([SAMPLE])).toBe(1);
    expect(latestPassportStamp([])).toBeNull();
    expect(latestPassportStamp([SAMPLE])?.title).toBe("Rail temeli");
    expect(passportAcademyVerifyHref(SAMPLE)).toBe(
      "/academy/dogrula/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    );
    expect(
      passportAcademyVerifyHref({ sourceKind: "FREELANCER_RELEASE", certificateHash: SAMPLE.certificateHash }),
    ).toBeNull();
  });

  it("damga tarihini saat diliminde basar; bozuk dilimde düşmez", () => {
    const istanbul = formatPassportIssuedAt(SAMPLE.issuedAt, "Europe/Istanbul");
    expect(istanbul).toMatch(/2026/);
    expect(istanbul).not.toBe("");
    expect(() => formatPassportIssuedAt(SAMPLE.issuedAt, "Not/AZone")).not.toThrow();
    expect(formatPassportIssuedAt(SAMPLE.issuedAt, "Not/AZone")).toMatch(/2026/);
  });

  it("sayfa RoomSeal taşımaz; oturum sicilini çeker; kariyer yazmasına bağlanmaz", () => {
    const page = readSrc("app/(kernel)/pasaport/page.tsx");
    expect(page).not.toContain("RoomSeal");
    expect(page).toContain("loadPassportBoard");
    expect(page).toContain("getSession");
    expect(page).toContain("PassportStampList");
    expect(page).not.toContain("loadCareerBoard");
    expect(page).not.toContain("syncCareerVisaStamps");
    expect(page).not.toContain("@/lib/career");
    expect(page).not.toContain("fetch(");
    expect(page).not.toContain("/api/career");
    expect(page).not.toContain("/api/passport");
  });

  it("sorgu yalnız oturum userId ile findMany; yazma ve dikey import yok", () => {
    const load = readSrc("lib/kernel/passport/load.ts");
    const list = readSrc("components/kernel/passport-stamp-list.tsx");
    const page = readSrc("app/(kernel)/pasaport/page.tsx");
    const careerStore = readSrc("lib/career/prisma-store.ts");
    const careerLoad = readSrc("lib/career/load.ts");
    const combined = `${page}\n${load}\n${list}`;
    expect(load).toContain('import "server-only"');
    expect(load).toContain("isSupabaseUserId(userId)");
    expect(load).toContain("prisma.careerVisaStamp.findMany");
    expect(load).toContain("where: { userId }");
    expect(load).toContain("DATABASE_URL");
    expect(load).not.toContain("@/lib/career");
    expect(load).not.toMatch(/\.(create|update|upsert)\(/);
    expect(careerStore).toContain("findPassportStampsForUser");
    expect(careerLoad).toContain("findPassportStampsForUser");
    expect(careerStore).not.toContain("prisma.careerVisaStamp.findMany");
    expect(list).not.toContain("onSubmit");
    expect(page).not.toContain("<form");
    expect(combined).not.toMatch(/Vize ekle/);
    expect(combined).not.toMatch(/visa-form/i);
    expect(list).toContain("passportAcademyVerifyHref");
    expect(readSrc("lib/kernel/passport/display.ts")).toContain("/dogrula/");
  });
});
