#!/usr/bin/env tsx
/**
 * Rail SEN aksı — isteğe bağlı marka/dil taraması.
 * Prebuild ve nightly mühür zincirinde yoktur. Ürün kalitesi ≠ güvenlik.
 *
 * Tarama: app + components + lib/copy (yetkin_muze yok; 410 sen-voice hariç).
 * Yasak: siz kaçakları (hesabınız, cüzdanınız, hoş geldiniz, Bakiyeniz…).
 *
 *   npm run verify:sen-axis
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const FILE_RE = /\.(ts|tsx)$/;
const SCAN_DIRS = ["app", "components", "lib/copy"] as const;

/** 410 envanteri — canlı `lib/copy/sen-voice` tavanında yoktur. Kaynak `archived/`. */
const FROZEN_SEN_VOICE = new Set([
  "archived/lib/copy/sen-voice/arena.ts",
  "archived/lib/copy/sen-voice/devlabs.ts",
  "archived/lib/copy/sen-voice/hibe.ts",
  "archived/lib/copy/sen-voice/junior.ts",
  "archived/lib/copy/sen-voice/kurumsal.ts",
  "archived/lib/copy/sen-voice/pazaryeri.ts",
  "archived/lib/copy/sen-voice/social.ts",
  "archived/lib/copy/sen-voice/studio.ts",
]);

const SIZ_LEAKS = [
  "hesabınız",
  "cüzdanınız",
  "hoş geldiniz",
  "Hoş geldiniz",
  "Bakiyeniz",
  "kullanabilirsiniz",
  "Kimliğiniz",
  "hesabınıza",
  "yapabilirsiniz",
  "dönebilirsiniz",
  "kutunuzu",
  "e-postanıza",
  "profilinizi",
  "rehberleriniz",
  "bakiyenizi",
  "Paranız",
  "üretiminiz",
  "korunursunuz",
  "kopyalayın",
  "unutmayın",
  "kilitleyin",
  "dağıtın",
  "Hesap açın",
  "mühürleyin",
  "sizi buraya",
] as const;

const LIVE_FROZEN_SEN_VOICE = [
  "arena.ts",
  "devlabs.ts",
  "hibe.ts",
  "junior.ts",
  "kurumsal.ts",
  "pazaryeri.ts",
  "social.ts",
  "studio.ts",
] as const;

const issues: string[] = [];

for (const name of LIVE_FROZEN_SEN_VOICE) {
  const live = join(ROOT, "lib/copy/sen-voice", name);
  if (existsSync(live)) {
    issues.push(`canlı sen-voice donmuş oda — arşive çek: lib/copy/sen-voice/${name}`);
  }
}

function rel(file: string): string {
  return relative(ROOT, file).replace(/\\/g, "/");
}

function walk(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === "yetkin_muze" || entry === "yetkin.ai") {
        continue;
      }
      files.push(...walk(fullPath));
    } else if (FILE_RE.test(entry)) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = SCAN_DIRS.flatMap((dir) => walk(join(ROOT, dir))).filter((file) => {
  const path = rel(file);
  return !FROZEN_SEN_VOICE.has(path);
});

for (const file of files) {
  const source = readFileSync(file, "utf8");
  const path = rel(file);
  for (const leak of SIZ_LEAKS) {
    if (source.includes(leak)) {
      issues.push(`${path}: siz kaçağı — \`${leak}\``);
    }
  }
}

if (issues.length > 0) {
  console.error(["verify:sen-axis BAŞARISIZ:", ...issues.map((row) => `  ✗ ${row}`)].join("\n"));
  process.exit(1);
}

console.log(
  `verify:sen-axis OK — ${files.length} dosya, ${SIZ_LEAKS.length} siz kaçağı tarandı (app + components + lib/copy; 410 sen-voice hariç).`,
);
