#!/usr/bin/env tsx
/**
 * @yetkin/kernel paket mührü — Prisma/Supabase sızmaz; Dron paketi tüketir.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function walkTs(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      files.push(...walkTs(full));
    } else if (entry.endsWith(".ts")) {
      files.push(full);
    }
  }
  return files;
}

const kernelPkgPath = join(ROOT, "packages/kernel/package.json");
if (!existsSync(kernelPkgPath)) {
  fail("@yetkin/kernel yok — packages/kernel/package.json");
}
const kernelPkg = JSON.parse(readFileSync(kernelPkgPath, "utf8")) as { name?: string };
if (kernelPkg.name !== "@yetkin/kernel") {
  fail(`packages/kernel adı ${kernelPkg.name} — @yetkin/kernel beklenir`);
}

const rootPkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
  workspaces?: string[];
  dependencies?: Record<string, string>;
  scripts?: Record<string, string>;
};
if (!rootPkg.workspaces?.includes("packages/*")) {
  fail("kök workspaces packages/* içermez");
}
if (!rootPkg.dependencies?.["@yetkin/kernel"]) {
  fail("kök @yetkin/kernel bağımlılığı yok");
}
if (!rootPkg.scripts?.["verify:v1-contract-artifacts"]?.includes("verify-kernel-package.ts")) {
  fail("verify:v1-contract-artifacts kernel paket kapısını çağırmaz");
}

const railPkg = JSON.parse(readFileSync(join(ROOT, "apps/rail-is/package.json"), "utf8")) as {
  dependencies?: Record<string, string>;
};
if (!railPkg.dependencies?.["@yetkin/kernel"]) {
  fail("apps/rail-is @yetkin/kernel tüketmez");
}

const hops = readFileSync(join(ROOT, "apps/rail-is/src/api/hops.ts"), "utf8");
if (!hops.includes("@yetkin/kernel/http/v1-hops-meta")) {
  fail("apps/rail-is hops.ts @yetkin/kernel hop meta tüketmez");
}

const amiralMeta = readFileSync(join(ROOT, "lib/kernel/http/v1-hops-meta.ts"), "utf8");
if (!amiralMeta.includes("@yetkin/kernel/http/v1-hops-meta")) {
  fail("Amiral v1-hops-meta paket re-export değil");
}

const generateSrc = readFileSync(join(ROOT, "scripts/generate-rail-v1-dron-types.ts"), "utf8");
if (!generateSrc.includes("packages/kernel/src/generated/v1.ts")) {
  fail("v1 codegen @yetkin/kernel generated hedefine yazmaz");
}

for (const file of walkTs(join(ROOT, "packages/kernel/src"))) {
  const source = readFileSync(file, "utf8");
  if (source.includes("@prisma/") || source.includes("@prisma/client") || source.includes("@supabase/")) {
    fail(`@yetkin/kernel Prisma/Supabase sızdırır: ${file}`);
  }
  if (source.includes("@/lib/") || source.includes("from \"@/")) {
    fail(`@yetkin/kernel Amiral alias sızdırır: ${file}`);
  }
}

console.log("verify:kernel-package OK — @yetkin/kernel saf; Dron tüketir.");
