#!/usr/bin/env tsx
/**
 * `apps/*` istemci tip denetimi.
 * Kök `typecheck` bu dosyayı çağırır. Yeni dron `apps/<ad>/package.json`
 * içine `typecheck` yazınca zincire kendiliğinden girer.
 * Workspace dışıdır: her uygulamanın kendi `node_modules` klasörü gerekir.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const APPS = join(ROOT, "apps");

function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

if (!existsSync(APPS)) {
  fail("apps/ yok — istemci tip denetimi düşer.");
}

const clients = readdirSync(APPS, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

let ran = 0;
for (const name of clients) {
  const dir = join(APPS, name);
  const pkgPath = join(dir, "package.json");
  if (!existsSync(pkgPath)) {
    continue;
  }
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as {
    scripts?: Record<string, string>;
  };
  if (!pkg.scripts?.typecheck) {
    continue;
  }
  if (!existsSync(join(dir, "node_modules"))) {
    fail(
      `apps/${name} typecheck düşer: node_modules yok. Çalıştır: npm ci --prefix apps/${name}`,
    );
  }
  console.log(`typecheck:clients — apps/${name}`);
  const result = spawnSync("npm run typecheck", {
    cwd: dir,
    stdio: "inherit",
    env: process.env,
    shell: true,
  });
  if (result.error) {
    fail(`apps/${name}: ${result.error.message}`);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
  ran += 1;
}

if (ran === 0) {
  fail("apps/ altında typecheck betiği olan istemci yok.");
}

console.log(`typecheck:clients OK — ${ran} istemci.`);
