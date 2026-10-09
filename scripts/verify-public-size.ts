#!/usr/bin/env tsx
/**
 * public/ klasörünün Vercel paketine giren bayt toplamı.
 * Junior ses, kapak ve ısınma kaseti sayılmaz; onlar CDN kökündedir.
 * 850 MB üstü: sarı uyarı, exit 0. 950 MB üstü: hata, exit 1.
 * CI bu betiği `verify:prebuild` içinde koşar.
 */

import { lstatSync, readdirSync, type Stats } from "node:fs";
import { join, relative } from "node:path";
import { isOffloadedPublicPath } from "@/lib/media/offload";
import {
  classifyPublicDirectoryBytes,
  PUBLIC_SIZE_FAIL_BYTES,
  PUBLIC_SIZE_WARN_BYTES,
} from "@/lib/kernel/public-size-budget";

const ROOT = process.cwd();
const PUBLIC_DIR = join(ROOT, "public");
const MIB = 1024 * 1024;

function treeBytes(full: string, stat: Stats): number {
  if (stat.isSymbolicLink()) {
    return 0;
  }
  if (stat.isFile()) {
    return stat.size;
  }
  if (!stat.isDirectory()) {
    return 0;
  }
  let total = 0;
  for (const name of readdirSync(full)) {
    const child = join(full, name);
    total += treeBytes(child, lstatSync(child));
  }
  return total;
}

/** Vercel paketine giren bayt. CDN'e bırakılan Junior kökleri ayrı sayılır. */
function directoryBytes(dir: string): { shipped: number; offloaded: number } {
  let shipped = 0;
  let offloaded = 0;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const stat = lstatSync(full);
    if (stat.isSymbolicLink()) {
      continue;
    }
    const rel = relative(ROOT, full).replaceAll("\\", "/");
    if (isOffloadedPublicPath(rel)) {
      offloaded += treeBytes(full, stat);
      continue;
    }
    if (stat.isDirectory()) {
      const nested = directoryBytes(full);
      shipped += nested.shipped;
      offloaded += nested.offloaded;
    } else if (stat.isFile()) {
      shipped += stat.size;
    }
  }
  return { shipped, offloaded };
}

function formatMb(bytes: number): string {
  return (bytes / MIB).toFixed(1);
}

let shipped = 0;
let offloaded = 0;
try {
  const measured = directoryBytes(PUBLIC_DIR);
  shipped = measured.shipped;
  offloaded = measured.offloaded;
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`HATA: public/ okunamadı. ${message}`);
  process.exit(1);
}

const verdict = classifyPublicDirectoryBytes(shipped);
const line = `public/ Vercel paketi: ${formatMb(shipped)} MB (${shipped} bayt). CDN'de bırakılan: ${formatMb(offloaded)} MB. Uyarı eşiği ${formatMb(PUBLIC_SIZE_WARN_BYTES)} MB. Hata eşiği ${formatMb(PUBLIC_SIZE_FAIL_BYTES)} MB.`;

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
