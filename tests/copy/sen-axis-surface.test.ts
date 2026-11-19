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
  "components/public/home-account-nav.tsx",
  "app/error.tsx",
  "app/not-found.tsx",
  "app/(kernel)/profil/page.tsx",
  "app/academy/dogrula/page.tsx",
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
    expect(SEN_VOICE.public.home.title).toBe(
      "İşinizi Büyüten Yapay Zeka Araçları. Tek Hesap, Sıfır Karmaşa.",
    );
    expect(SEN_VOICE.public.home.description).toContain("profesyonel belgeler");
    expect(SEN_VOICE.public.home.description).toContain("e-ticaret");
    expect(SEN_VOICE.public.home.description).toContain("hibeleri");
    expect(SEN_VOICE.public.home.tracksKicker).toBe("Çözümler");
    expect(SEN_VOICE.public.home.tracksTitle).toBe("İhtiyacına göre bir alan seç");
    expect(SEN_VOICE.public.home.description).not.toContain("teklif ver");
    expect(SEN_VOICE.public.home.description).not.toContain("işletim sistemi");
    expect(SEN_VOICE.public.home.description).not.toContain("SHA-256");
    expect(SEN_VOICE.career.description).toContain("doğrulama bağı herkese açıktır");
    expect(SEN_VOICE.career.description).not.toContain("Sahte rozet");
    expect(SEN_VOICE.career.proofEmpty).toContain("Satın alma tek başına rozet basmaz");
    expect(SEN_VOICE.career.footnote).toContain("İşe yerleşmeyi veya gelir elde etmeyi garanti etmez");
    expect(SEN_VOICE.cuzdan.balanceHintLive).toBe("Canlı bakiye");
    expect(SEN_VOICE.public.home.description).not.toContain("üretim band");
    expect(SEN_VOICE.public.home.description).not.toContain("hazırlanıyor");
    expect(SEN_VOICE.public.home.trust.join("\n")).toContain("PayTR iFrame");
    expect(SEN_VOICE.profil.description).toContain("Görünen adını");
    expect(readSrc("archived/lib/copy/sen-voice/arena.ts")).toContain("kazananı sen dağıt");
    expect(readSrc("archived/lib/copy/sen-voice/kurumsal.ts")).toContain("Şirket profilini kur");
    expect(readSrc("archived/lib/copy/sen-voice/hibe.ts")).toContain("Açık rehberlerin");
    expect(SEN_VOICE.career.title).toBe("Yetkinliğini Gerçek Testle Kanıtla, Fark Yarat.");

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
