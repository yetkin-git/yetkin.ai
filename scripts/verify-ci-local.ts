#!/usr/bin/env tsx
/**
 * Yerel CI senkronu — `.github/workflows/ci.yml` iş adımları.
 * npm ci çalıştırılmaz (yerel node_modules silinmesin).
 * Kanonik dal: main. Actions Node: 20.19.x.
 * Playwright / next build / verify:nightly yok (vitrin ikincil CI işindedir).
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

const STEPS: readonly { name: string; script: string }[] = [
  { name: "lint", script: "lint" },
  { name: "verify:prebuild", script: "verify:prebuild" },
  { name: "typecheck", script: "typecheck" },
  { name: "test", script: "test" },
  { name: "typecheck:rail-is", script: "typecheck:rail-is" },
];

function fail(message: string): never {
  console.error(`verify:ci BAŞARISIZ: ${message}`);
  process.exit(1);
}

if (!existsSync(join(ROOT, "package-lock.json"))) {
  fail("kök package-lock.json yok — GitHub `npm ci` düşer.");
}
if (!existsSync(join(ROOT, "apps/rail-is/package-lock.json"))) {
  fail("apps/rail-is/package-lock.json yok — rail-is işi `npm ci` düşer.");
}

const node = process.version;
if (!node.startsWith("v20.19")) {
  console.warn(
    `verify:ci UYARI: yerel Node ${node}; Actions setup-node 20.19 kullanır. Sapma buradan gelebilir.`,
  );
}

console.log("verify:ci — yerel senkron (npm ci hariç). Kanonik dal: main.");

for (const step of STEPS) {
  console.log(`\n=== CI adım: ${step.name} ===`);
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(npmCmd, ["run", step.script], {
    cwd: ROOT,
    stdio: "inherit",
    env: process.env,
  });
  if (result.error) {
    fail(`${step.name}: ${result.error.message}`);
  }
  if (result.status !== 0) {
    fail(`${step.name} çıkış ${result.status ?? "null"}`);
  }
}

console.log("\nverify:ci OK — lint + prebuild + typecheck + test + typecheck:rail-is.");
