#!/usr/bin/env tsx
/**
 * Her app/api route.ts dosyasi `export const auth` tasimak zorundadir.
 * Kenar K6 haritasi: lib/kernel/security/route-auth-map.ts (grup klasorleri URL'de yoktur).
 * --check: üretilen haritayı diske yazmaz. Git'teki dosya saparsa exit 1.
 * CI bu bayrağı `verify:prebuild` içinde koşar. Yazmak için: npm run verify:api-auth
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { API_AUTH_KINDS, isApiAuthKind, toPublicApiPath } from "@/lib/kernel/security/api-auth";

const ROOT = process.cwd();
const API_DIR = join(ROOT, "app", "api");
const AUTH_EXPORT_REGEX = /export\s+const\s+auth\s*=\s*["']([^"']+)["']/;
const CHECK = process.argv.includes("--check");
const ROUTE_AUTH_MAP_PATH = join(ROOT, "lib", "kernel", "security", "route-auth-map.ts");

function normalizeNewlines(value: string): string {
  return value.replace(/\r\n/g, "\n");
}

function walk(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      files.push(...walk(full));
    } else if (entry === "route.ts") {
      files.push(full);
    }
  }
  return files;
}

const files = walk(API_DIR);
const invalid: string[] = [];
const map: Record<string, string> = {};

for (const file of files) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  const source = readFileSync(file, "utf8");
  const match = source.match(AUTH_EXPORT_REGEX);
  const value = match?.[1];
  if (!value || !isApiAuthKind(value)) {
    invalid.push(`${rel}: export const auth eksik veya geçersiz`);
    continue;
  }
  const route = toPublicApiPath(rel);
  if (route.includes("(") || route.includes(")")) {
    invalid.push(`${rel}: public API yolu grup segmenti taşıyor: ${route}`);
    continue;
  }
  const previous = map[route];
  if (previous && previous !== value) {
    invalid.push(`${rel}: ${route} kind çatışması (${previous} ≠ ${value})`);
    continue;
  }
  map[route] = value;
}

if (invalid.length > 0) {
  console.error(["verify:api-auth BAŞARISIZ:", ...invalid.map((row) => `  ✗ ${row}`)].join("\n"));
  process.exit(1);
}

const sorted = Object.fromEntries(Object.keys(map).sort().map((key) => [key, map[key]!]));

const entries = Object.entries(sorted)
  .map(([path, kind]) => `  ${JSON.stringify(path)}: ${JSON.stringify(kind)}`)
  .join(",\n");

const routeAuthMapSource = `/**
 * Üretir: npm run verify:api-auth
 * Kenar K6 bu haritayı okur. Route grupları ((kernel)) URL'de yoktur.
 */
export const ROUTE_AUTH_MAP = {
${entries}
} as const;

export type RouteAuthPath = keyof typeof ROUTE_AUTH_MAP;
`;

const counts = Object.fromEntries(API_AUTH_KINDS.map((kind) => [kind, 0]));
for (const kind of Object.values(sorted)) {
  counts[kind] = (counts[kind] ?? 0) + 1;
}

if (CHECK) {
  const onDisk = existsSync(ROUTE_AUTH_MAP_PATH) ? readFileSync(ROUTE_AUTH_MAP_PATH, "utf8") : "";
  if (normalizeNewlines(onDisk) !== normalizeNewlines(routeAuthMapSource)) {
    console.error(
      [
        "verify:api-auth --check BAŞARISIZ: lib/kernel/security/route-auth-map.ts route'larla örtüşmüyor.",
        "Kenar bu dosyayı okur. Yeniden yazıp commit et: npm run verify:api-auth",
      ].join("\n"),
    );
    process.exit(1);
  }
  console.log(
    `verify:api-auth --check OK — ${files.length} route. ${JSON.stringify(counts)}`,
  );
  process.exit(0);
}

const outDir = join(ROOT, "generated");
if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}
writeFileSync(join(outDir, "route-auth-map.json"), `${JSON.stringify(sorted, null, 2)}\n`);
writeFileSync(ROUTE_AUTH_MAP_PATH, routeAuthMapSource);

console.log(
  `verify:api-auth OK — ${files.length} route. ${JSON.stringify(counts)}`,
);
