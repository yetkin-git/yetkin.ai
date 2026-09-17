import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const SHELTER_PAGES = [
  "app/dashboard/page.tsx",
  "app/(kernel)/cuzdan/page.tsx",
  "app/(kernel)/pasaport/page.tsx",
  "app/(kernel)/profil/page.tsx",
  "app/academy/certificates/page.tsx",
  "app/career/page.tsx",
] as const;

describe("sığınak sayfa oturum kalkanı", () => {
  it("kokpit ve sığınaklar requirePageSession bağlar; getSession boş gövde basmaz", () => {
    for (const file of SHELTER_PAGES) {
      const source = readSrc(file);
      expect(source, file).toContain("requirePageSession");
      expect(source, file).not.toContain("getSession");
      expect(source, file).not.toContain("AuthNeeded");
    }
  });

  it("kamu TTFB: fra1 köken, nonce connection, Prisma HTML soğuk yolunda yok", () => {
    expect(readSrc("vercel.json")).toContain('"fra1"');
    expect(readSrc("app/layout.tsx")).toContain("connection()");
    expect(readSrc("app/layout.tsx")).not.toMatch(/export const preferredRegion/);
    expect(readSrc("instrumentation.ts")).not.toContain("@/lib/kernel/db");
    expect(readSrc("lib/kernel/auth/require-session.ts")).toContain(
      "hasSupabaseAuthCookieHint(incoming.list)",
    );
    expect(readSrc("next.config.ts")).toContain("PUBLIC_HTML_WITHOUT_PRISMA");
    expect(readSrc("next.config.ts")).toContain("publicHtmlPrismaTraceExcludes");
  });
});
