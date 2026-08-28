import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { ARENA_SEN } from "@/archived/lib/copy/sen-voice/arena";
import { HIBE_SEN } from "@/archived/lib/copy/sen-voice/hibe";
import { KURUMSAL_SEN } from "@/archived/lib/copy/sen-voice/kurumsal";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const SIZ_LEAKS = [
  "hesabınız",
  "cüzdanınız",
  "hoş geldiniz",
  "Bakiyeniz",
  "kullanabilirsiniz",
  "Kimliğiniz",
  "Paranız",
  "üretiminiz",
  "korunursunuz",
  "profilinizi",
  "rehberleriniz",
  "bakiyenizi",
  "dönebilirsiniz",
  "kilitleyin",
  "dağıtın",
];

const SEN_SURFACES = [
  "app/(public)/page.tsx",
  "app/error.tsx",
  "app/not-found.tsx",
  "app/(kernel)/profil/page.tsx",
  "app/career/page.tsx",
  "lib/copy/sen-voice/auth.ts",
  "lib/copy/sen-voice/profil.ts",
  "lib/copy/sen-voice/public.ts",
  "lib/copy/sen-voice/career.ts",
  "lib/copy/sen-voice/index.ts",
  "archived/lib/copy/sen-voice/hibe.ts",
  "archived/lib/copy/sen-voice/arena.ts",
  "archived/lib/copy/sen-voice/junior.ts",
  "archived/lib/copy/sen-voice/social.ts",
  "archived/lib/copy/sen-voice/kurumsal.ts",
];

describe("SEN yayılımı ve verify:sen-axis", () => {
  it("ince sen-axis betiği canlıdır; donmuş copy yalnız archived altındadır", () => {
    expect(existsSync(join(ROOT, "scripts/verify-sen-axis.ts"))).toBe(true);
    const script = readSrc("scripts/verify-sen-axis.ts");
    const pkg = JSON.parse(readSrc("package.json")) as { scripts: Record<string, string> };
    expect(pkg.scripts["verify:sen-axis"]).toBe("tsx scripts/verify-sen-axis.ts");
    expect(pkg.scripts["verify:prebuild"]).not.toContain("verify:sen-axis");
    expect(pkg.scripts["verify:grep-seals"]).toContain("verify:sen-axis");
    expect(pkg.scripts["verify:nightly"]).toContain("verify:grep-seals");
    expect(script).toContain("lib/copy");
    expect(script).toContain("hesabınız");
    expect(script).toContain("cüzdanınız");
    expect(script).toContain("canlı sen-voice donmuş oda");
    expect(script).not.toContain("quality-gate");
    expect(script).not.toContain("runSenAxisGate");
    expect(existsSync(join(ROOT, "lib/copy/sen-voice/arena.ts"))).toBe(false);
    expect(existsSync(join(ROOT, "archived/lib/copy/sen-voice/arena.ts"))).toBe(true);
  });

  it("kamu, profil ve kalan odalar siz kaçakları taşımaz; SEN_VOICE bağlar", () => {
    expect(SEN_VOICE.public.home.description).toContain("kariyer vizenle");
    expect(SEN_VOICE.public.home.description).toContain("ödeme henüz bağlanmadı");
    expect(SEN_VOICE.profil.description).toContain("Görünen adını");
    expect(ARENA_SEN.description).toContain("kazananı sen dağıt");
    expect(KURUMSAL_SEN.description).toContain("Şirket profilini kur");
    expect(HIBE_SEN.openGuidesTitle).toBe("Açık rehberlerin");
    expect(SEN_VOICE.career.title).toBe("Vize ve Geçiş Defteri");

    for (const file of SEN_SURFACES) {
      const source = readSrc(file);
      for (const leak of SIZ_LEAKS) {
        expect(source, `${file} → ${leak}`).not.toContain(leak);
      }
    }
    expect(readSrc("app/(public)/page.tsx")).toContain("SEN_VOICE");
    expect(readSrc("app/(kernel)/profil/page.tsx")).toContain("SEN_VOICE");
    expect(readSrc("app/career/page.tsx")).toContain("SEN_VOICE");
    expect(readSrc("lib/copy/sen-voice/index.ts")).toContain("AUTH_SEN");
    expect(readSrc("lib/copy/sen-voice/index.ts")).toContain("PROFIL_SEN");
  });
});
