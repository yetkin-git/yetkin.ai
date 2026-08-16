import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const SIZ_LEAKS = [
  "Bakiyeniz",
  "hesabınız",
  "işleriniz",
  "üretimleriniz",
  "kullanabilirsiniz",
];

const SEN_SURFACES = [
  "app/dashboard/page.tsx",
  "components/dashboard/wallet-balance-strip.tsx",
  "lib/copy/sen-voice/dashboard.ts",
];

describe("Dashboard vatandaş yüzeyi ve SEN aksı", () => {
  it("/dashboard ve cüzdan şeridi siz kaçakları taşımaz; SEN_VOICE bağlar", () => {
    expect(SEN_VOICE.dashboard.description).toContain("Bakiye");
    expect(SEN_VOICE.dashboard.description).toContain("işlerin");
    expect(SEN_VOICE.dashboard.walletStrip.body).toContain("Bakiye hesabında");
    expect(SEN_VOICE.dashboard.walletStrip.body).not.toContain("Bakiyeniz");
    expect(SEN_VOICE.dashboard.description).not.toContain("Bakiyeniz");

    for (const file of SEN_SURFACES) {
      const source = readSrc(file);
      for (const leak of SIZ_LEAKS) {
        expect(source, `${file} → ${leak}`).not.toContain(leak);
      }
    }
    expect(readSrc("app/dashboard/page.tsx")).toContain("SEN_VOICE");
    expect(readSrc("components/dashboard/wallet-balance-strip.tsx")).toContain("SEN_VOICE");
    expect(readSrc("components/dashboard/wallet-balance-strip.tsx")).toContain("walletStrip");
  });
});
