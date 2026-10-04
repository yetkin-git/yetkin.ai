#!/usr/bin/env tsx
/**
 * public/ klasörünün bayt toplamı.
 * 850 MB üstü: sarı uyarı, exit 0. 950 MB üstü: hata, exit 1.
 * CI bu betiği `verify:prebuild` içinde koşar.
 */

import { lstatSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  classifyPublicDirectoryBytes,
  PUBLIC_SIZE_FAIL_BYTES,
  PUBLIC_SIZE_WARN_BYTES,
} from "@/lib/kernel/public-size-budget";

const ROOT = process.cwd();
const PUBLIC_DIR = join(ROOT, "public");
const MIB = 1024 * 1024;

function directoryBytes(dir: string): number {
  let total = 0;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const stat = lstatSync(full);
    if (stat.isSymbolicLink()) {
      continue;
    }
    if (stat.isDirectory()) {
      total += directoryBytes(full);
    } else if (stat.isFile()) {
      total += stat.size;
    }
  }
  return total;
}

function formatMb(bytes: number): string {
  return (bytes / MIB).toFixed(1);
}

let bytes = 0;
try {
  bytes = directoryBytes(PUBLIC_DIR);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`HATA: public/ okunamadı. ${message}`);
  process.exit(1);
}

const verdict = classifyPublicDirectoryBytes(bytes);
const line = `public/ boyut: ${formatMb(bytes)} MB (${bytes} bayt). Uyarı eşiği ${formatMb(PUBLIC_SIZE_WARN_BYTES)} MB. Hata eşiği ${formatMb(PUBLIC_SIZE_FAIL_BYTES)} MB.`;

if (verdict === "fail") {
  console.error(line);
  console.error("HATA: public/ 950 MB hata eşiğini aştı. Derleme durur.");
  process.exit(1);
}

if (verdict === "warn") {
  console.warn(line);
  console.warn("UYARI: public/ 850 MB uyarısını aştı. 950 MB hata eşiğinin altında; derleme sürer.");
  process.exit(0);
}

console.log(line);
console.log("OK: public/ boyut bütçesi uyarı eşiğinin altında.");
