#!/usr/bin/env tsx
/**
 * Rail SEN aksı — ince mühür. Müze glob / sen-voice kopyası değildir.
 *
 * Tarama: app + components + lib/copy (yetkin.ai yok).
 * Yasak: siz kaçakları (hesabınız, cüzdanınız, hoş geldiniz, Bakiyeniz…).
 *
 *   npm run verify:sen-axis
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const FILE_RE = /\.(ts|tsx)$/;
const SCAN_DIRS = ["app", "components", "lib/copy"] as const;

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

const issues: string[] = [];

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
      if (entry === "node_modules" || entry === "yetkin.ai") {
        continue;
      }
      files.push(...walk(fullPath));
    } else if (FILE_RE.test(entry)) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = SCAN_DIRS.flatMap((dir) => walk(join(ROOT, dir)));

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
  `verify:sen-axis OK — ${files.length} dosya, ${SIZ_LEAKS.length} siz kaçağı tarandı (app + components + lib/copy).`,
);
