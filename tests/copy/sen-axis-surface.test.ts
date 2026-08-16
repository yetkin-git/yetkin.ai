import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

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
  "app/hibe/page.tsx",
  "app/arena/page.tsx",
  "app/junior/page.tsx",
  "app/social/page.tsx",
  "app/kurumsal/page.tsx",
  "lib/copy/sen-voice/auth.ts",
  "lib/copy/sen-voice/profil.ts",
  "lib/copy/sen-voice/public.ts",
  "lib/copy/sen-voice/career.ts",
  "lib/copy/sen-voice/hibe.ts",
  "lib/copy/sen-voice/arena.ts",
  "lib/copy/sen-voice/junior.ts",
  "lib/copy/sen-voice/social.ts",
  "lib/copy/sen-voice/kurumsal.ts",
  "lib/copy/sen-voice/index.ts",
];

describe("SEN yayılımı ve verify:sen-axis", () => {
  it("ince sen-axis betiği prebuild zincirindedir; müze glob’u yoktur", () => {
    expect(existsSync(join(ROOT, "scripts/verify-sen-axis.ts"))).toBe(true);
    const script = readSrc("scripts/verify-sen-axis.ts");
    const pkg = JSON.parse(readSrc("package.json")) as { scripts: Record<string, string> };
    expect(pkg.scripts["verify:sen-axis"]).toBe("tsx scripts/verify-sen-axis.ts");
    expect(pkg.scripts["verify:prebuild"]).toContain("verify:sen-axis");
    expect(script).toContain("lib/copy");
    expect(script).toContain("hesabınız");
    expect(script).toContain("cüzdanınız");
    expect(script).not.toContain("quality-gate");
    expect(script).not.toContain("runSenAxisGate");
    expect(script).not.toContain("yetkin.ai/lib/copy");
  });

  it("kamu, profil ve kalan odalar siz kaçakları taşımaz; SEN_VOICE bağlar", () => {
    expect(SEN_VOICE.public.home.description).toContain("Paran, işin ve üretimin");
    expect(SEN_VOICE.profil.description).toContain("Görünen adını");
    expect(SEN_VOICE.arena.description).toContain("kazananı sen dağıt");
    expect(SEN_VOICE.kurumsal.description).toContain("Şirket profilini kur");
    expect(SEN_VOICE.hibe.openGuidesTitle).toBe("Açık rehberlerin");
    expect(SEN_VOICE.career.title).toBe("Kariyer pasaportu");

    for (const file of SEN_SURFACES) {
      const source = readSrc(file);
      for (const leak of SIZ_LEAKS) {
        expect(source, `${file} → ${leak}`).not.toContain(leak);
      }
    }
    expect(readSrc("app/(public)/page.tsx")).toContain("SEN_VOICE");
    expect(readSrc("app/(kernel)/profil/page.tsx")).toContain("SEN_VOICE");
    expect(readSrc("app/career/page.tsx")).toContain("SEN_VOICE");
    expect(readSrc("app/hibe/page.tsx")).toContain("SEN_VOICE");
    expect(readSrc("app/arena/page.tsx")).toContain("SEN_VOICE");
    expect(readSrc("app/junior/page.tsx")).toContain("SEN_VOICE");
    expect(readSrc("app/social/page.tsx")).toContain("SEN_VOICE");
    expect(readSrc("app/kurumsal/page.tsx")).toContain("SEN_VOICE");
    expect(readSrc("lib/copy/sen-voice/index.ts")).toContain("AUTH_SEN");
    expect(readSrc("lib/copy/sen-voice/index.ts")).toContain("PROFIL_SEN");
  });
});
