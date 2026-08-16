import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  formatProfileCreatedAt,
  PROFILE_UNSET_LABEL,
  profileDisplayName,
  profileEmail,
} from "@/lib/kernel/identity/display";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("profil kimlik yüzeyi", () => {
  it("boş görünen adı uydurmaz; e-posta User sonra oturum", () => {
    expect(profileDisplayName(null)).toBe(PROFILE_UNSET_LABEL);
    expect(profileDisplayName("  ")).toBe(PROFILE_UNSET_LABEL);
    expect(profileDisplayName("Ayşe Kaya")).toBe("Ayşe Kaya");
    expect(profileEmail("a@yetkin.rail", "b@yetkin.rail")).toBe("a@yetkin.rail");
    expect(profileEmail(null, "oturum@yetkin.rail")).toBe("oturum@yetkin.rail");
  });

  it("kayıt tarihini saat diliminde basar; bozuk dilimde düşmez", () => {
    const createdAt = new Date("2026-08-14T17:03:00.000Z");
    const istanbul = formatProfileCreatedAt(createdAt, "tr-TR", "Europe/Istanbul");
    expect(istanbul).toMatch(/2026/);
    expect(istanbul).not.toBe("");
    expect(() => formatProfileCreatedAt(createdAt, "tr-TR", "Not/AZone")).not.toThrow();
    expect(formatProfileCreatedAt(createdAt, "tr-TR", "Not/AZone")).toMatch(/2026/);
  });

  it("sayfa RoomSeal taşımaz; oturum User satırını çeker", () => {
    const page = readSrc("app/(kernel)/profil/page.tsx");
    expect(page).not.toContain("RoomSeal");
    expect(page).toContain("loadIdentityBoard");
    expect(page).toContain("getSession");
    expect(page).toContain("IdentityCard");
    expect(page).not.toContain("fetch(");
  });

  it("okuma yalnız oturum id ile findUnique; yazma displayName PATCH; e-posta SSOT", () => {
    const load = readSrc("lib/kernel/identity/load.ts");
    const card = readSrc("components/kernel/identity-card.tsx");
    const form = readSrc("components/kernel/display-name-form.tsx");
    const write = readSrc("lib/kernel/identity/display-name-write.ts");
    const route = readSrc("app/api/(kernel)/profile/route.ts");
    const page = readSrc("app/(kernel)/profil/page.tsx");
    expect(load).toContain('import "server-only"');
    expect(load).toContain("isSupabaseUserId(userId)");
    expect(load).toContain("prisma.user.findUnique");
    expect(load).toContain("where: { id: userId }");
    expect(load).toContain("DATABASE_URL");
    expect(load).toContain("displayName: true");
    expect(load).toContain("locale: true");
    expect(load).toContain("timeZone: true");
    expect(load).toContain("createdAt: true");
    expect(load).toContain("email: true");
    expect(load).not.toMatch(/\.(create|update|upsert)\(/);
    expect(`${page}\n${load}\n${card}`).not.toMatch(/UserKycIdentity/);
    expect(`${load}\n${card}`).not.toMatch(/\bavatar\b/i);
    expect(card).toContain("readOnly");
    expect(card).toContain("IdentityCard");
    expect(card).toContain("DisplayNameForm");
    expect(form).toContain("onSubmit");
    expect(form).toContain('method: "PATCH"');
    expect(form).toContain("PROFILE_WRITE_PATH");
    expect(form).not.toContain("email");
    expect(write).toContain("AuthRequiredError");
    expect(write).toContain("actorUserId");
    expect(write).toContain(".strict()");
    expect(route).toContain('export const auth = "session"');
    expect(route).toContain("export async function PATCH");
    expect(route).toContain("getSession");
    expect(route).toContain("runDisplayNamePatch");
  });
});
