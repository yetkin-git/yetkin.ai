#!/usr/bin/env tsx
/**
 * Yeni dron iskeleti — `npm run dron:new -- --id=ornek`.
 * Kayıt, taslak şema, hop sicili ve Expo kabuğu kapalı doğar.
 * Açmak: `DRON_<ID>_OPEN=1` ve `EXPO_PUBLIC_DRON_<ID>_OPEN=1`.
 * İkinci veritabanı, ikinci kimlik ve ikinci CREDIT ağzı açılmaz.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { RAIL_V1_HOPS_META } from "@yetkin/kernel/http/v1-hops-meta";
import { planDronScaffold } from "./dron-new-lib";

const ROOT = process.cwd();

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

function parseId(argv: string[]): string {
  const flag = argv.find((item) => item.startsWith("--id="));
  const raw = flag ? flag.slice("--id=".length) : argv.find((item) => !item.startsWith("-"));
  return raw?.trim() ?? "";
}

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

function runNpm(script: string): void {
  const result = spawnSync("npm", ["run", script], {
    cwd: ROOT,
    stdio: "inherit",
    env: process.env,
    shell: true,
  });
  if (result.error) {
    fail(`${script}: ${result.error.message}`);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const id = parseId(process.argv.slice(2));
let files;
try {
  files = planDronScaffold({
    id,
    kayitSource: read("lib/dronlar/kayit.ts"),
    onboardingSource: read("packages/kernel/src/http/dron-onboarding-hops.ts"),
    envExampleSource: read(".env.example"),
    runbookSource: read(".system_docs/OPS_RUNBOOK.md"),
    opsDronSource: read(".system_docs/ops/ops-dron.md"),
    hopCount: RAIL_V1_HOPS_META.length,
  });
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}

for (const file of files) {
  if (file.path.startsWith("lib/") && file.path.endsWith("/index.ts")) {
    const dir = join(ROOT, dirname(file.path));
    if (existsSync(dir)) {
      fail(`${file.path} klasörü zaten var`);
    }
  }
  if (
    !file.path.endsWith("kayit.ts") &&
    !file.path.endsWith("dron-onboarding-hops.ts") &&
    file.path !== ".env.example" &&
    !file.path.endsWith(".md") &&
    existsSync(join(ROOT, file.path))
  ) {
    fail(`${file.path} zaten var`);
  }
}

for (const file of files) {
  const full = join(ROOT, file.path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, file.contents, "utf8");
}

console.log(`dron:new OK — ${id} kapalı doğdu. Hop ${id}-pulse sicile yazıldı.`);
for (const file of files) {
  console.log(`  ${file.path}`);
}
console.log(`Açmak: DRON_${id.toUpperCase().replace(/-/g, "_")}_OPEN=1`);
console.log(`Expo: EXPO_PUBLIC_DRON_${id.toUpperCase().replace(/-/g, "_")}_OPEN=1`);
console.log("Kabuk kapalıyken hop çağırmaz. Yol RAIL_V1_HOPS_META.");
console.log("node_modules yoksa typecheck:clients düşer: npm ci --prefix apps/" + id);

runNpm("verify:api-auth");
runNpm("generate:openapi-v1");
runNpm("generate:v1-client");
