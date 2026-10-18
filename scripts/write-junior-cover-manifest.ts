#!/usr/bin/env tsx
/**
 * `public/media/junior/covers/*.jpg` SHA-256 özetini yazar.
 * Katalog adresi `?v=` ile bu özetin ilk 12 karakterini taşır.
 *
 *   npx tsx scripts/write-junior-cover-manifest.ts
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { JUNIOR_AUDIO_MANIFEST } from "@/lib/junior/audio-manifest.generated";

const COVER_KEY_RE = /^jr_[a-z0-9_]+-\d+$/u;
const root = process.cwd();
const coverDir = join(root, "public", "media", "junior", "covers");
const outFile = join(root, "lib", "junior", "cover-manifest.generated.ts");

const keys = readdirSync(coverDir)
  .filter((name) => name.endsWith(".jpg"))
  .map((name) => name.slice(0, -4))
  .filter((key) => COVER_KEY_RE.test(key) && key in JUNIOR_AUDIO_MANIFEST)
  .sort((left, right) => left.localeCompare(right));

const lines = keys.map((key) => {
  const bytes = readFileSync(join(coverDir, `${key}.jpg`));
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  return `  "${key}": { sha256: "${sha256}" },`;
});

const source = `// Bu dosya \`npx tsx scripts/write-junior-cover-manifest.ts\` ile üretilir. Elle düzenlemeyin.
export const JUNIOR_COVER_MANIFEST: Readonly<Record<string, { readonly sha256: string }>> = {
${lines.join("\n")}
};
`;

writeFileSync(outFile, source);
process.stdout.write(`Junior kapak manifesti: ${keys.length} dosya\n`);
