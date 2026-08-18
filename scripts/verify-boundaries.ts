#!/usr/bin/env tsx
/**
 * Anayasa §2.8 import sınırları — statik (grep). ESLint no-restricted-imports ile aynı sözleşme.
 * Canlı Postgres yok.
 *
 * 1. lib/kernel dikey oda import etmez.
 * 2. UI / sayfa Prisma ve server-only yazma motoru import etmez.
 * 3. Dikey odalar birbirinin engine/runtime/prisma-store dosyasını import etmez.
 * 4. VERTICAL_ROOMS üç kopyası eleman eleman aynıdır; lib/ sicil dışı oda açmaz.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { catalogSqlPreservesOperatorPrice } from "./ops-migrate-lib";
import {
  extraLibRoomMessage,
  missingLibRoomMessage,
  missingRegisteredRoomDirs,
  parseVerticalRoomIdsFromEslint,
  parseVerticalRoomIdsFromModules,
  roomIdListsEqual,
  unexpectedLibTopDirs,
  verticalRoomsSicilDriftMessage,
} from "./room-ceiling-lib";

const ROOT = process.cwd();
const FILE_RE = /\.(ts|tsx)$/;

/** Anayasa §2.8 — 12 dikey oda. Sıra mühürlü; lib/kernel/modules.ts ve eslint.config.mjs ile eleman eleman aynı. */
const VERTICAL_ROOMS = [
  "dashboard",
  "studio",
  "academy",
  "career",
  "freelancer",
  "devlabs",
  "kurumsal",
  "hibe",
  "arena",
  "pazaryeri",
  "junior",
  "social",
] as const;

type VerticalRoom = (typeof VERTICAL_ROOMS)[number];

const VERTICAL_SET = new Set<string>(VERTICAL_ROOMS);

/** D2.3 kazanç duvarı — string FK / HTTP; lib çapraz import yok. */
const EARNINGS_WALL: Partial<Record<VerticalRoom, ReadonlySet<VerticalRoom>>> = {
  freelancer: new Set(["kurumsal", "career"]),
  kurumsal: new Set(["freelancer", "career"]),
};

const SCAN_DIRS = ["lib", "app", "components"] as const;

const CATALOG_SQL = [
  "supabase/migrations/20260814040000_price_catalog_definitions.sql",
  "supabase/migrations/20260814090000_academy_course_seed.sql",
  "supabase/migrations/20260814110000_freelancer_job_seed.sql",
] as const;

const FROM_RE = /\bfrom\s+["']([^"']+)["']/g;
const DYNAMIC_RE = /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;
const SIDE_EFFECT_RE = /^import\s+["']([^"']+)["']/gm;

type Zone = "kernel" | "module" | "shared" | "ui" | "page" | "api";

type Violation = { file: string; spec: string; ruleId: string };

function rel(file: string): string {
  return relative(ROOT, file).replace(/\\/g, "/");
}

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
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

function normalizePosix(path: string): string {
  const parts: string[] = [];
  for (const part of path.replace(/\\/g, "/").split("/")) {
    if (!part || part === ".") {
      continue;
    }
    if (part === "..") {
      parts.pop();
      continue;
    }
    parts.push(part);
  }
  return parts.join("/");
}

function stripExt(path: string): string {
  return path.replace(/\.(ts|tsx)$/, "");
}

function resolveSpec(fromRel: string, spec: string): string {
  if (spec.startsWith("@/")) {
    return normalizePosix(spec.slice(2));
  }
  if (spec.startsWith(".")) {
    const dir = fromRel.includes("/") ? fromRel.slice(0, fromRel.lastIndexOf("/")) : "";
    return normalizePosix(`${dir}/${spec}`);
  }
  return spec;
}

function collectSpecs(source: string): string[] {
  const specs: string[] = [];
  for (const re of [FROM_RE, DYNAMIC_RE, SIDE_EFFECT_RE]) {
    const copy = new RegExp(re.source, re.flags);
    let match: RegExpExecArray | null;
    while ((match = copy.exec(source)) !== null) {
      const spec = match[1];
      if (spec) {
        specs.push(spec);
      }
    }
  }
  return specs;
}

function verticalOfLib(path: string): VerticalRoom | null {
  const match = stripExt(path).match(/^lib\/([^/]+)/);
  const id = match?.[1];
  if (id && VERTICAL_SET.has(id)) {
    return id as VerticalRoom;
  }
  return null;
}

function zoneOf(file: string): Zone | null {
  if (file.startsWith("lib/kernel/")) {
    return "kernel";
  }
  if (
    file.startsWith("lib/copy/") ||
    file.startsWith("lib/showcase/") ||
    file.startsWith("lib/ui/")
  ) {
    return "shared";
  }
  if (verticalOfLib(file)) {
    return "module";
  }
  if (file.startsWith("components/")) {
    return "ui";
  }
  if (file.startsWith("app/api/")) {
    return "api";
  }
  if (file.startsWith("app/")) {
    return "page";
  }
  return null;
}

function isInnerServerPath(path: string): boolean {
  const base = stripExt(path);
  const name = base.slice(base.lastIndexOf("/") + 1);
  if (name === "engine" || name === "runtime" || name === "prisma-store") {
    return true;
  }
  if (name.startsWith("prisma-")) {
    return true;
  }
  if (name.endsWith("-engine")) {
    return true;
  }
  if (name === "catalog-write" || name === "display-name-write") {
    return true;
  }
  if (base === "lib/kernel/db") {
    return true;
  }
  return false;
}

function isModuleBarrel(path: string): boolean {
  const base = stripExt(path);
  const room = verticalOfLib(base);
  if (!room) {
    return false;
  }
  return base === `lib/${room}` || base === `lib/${room}/index`;
}

function isPrismaSurface(spec: string, resolved: string): boolean {
  if (spec === "@prisma/client" || spec.startsWith("@prisma/client/")) {
    return true;
  }
  if (spec === "server-only") {
    return true;
  }
  return (
    resolved.startsWith("generated/prisma") ||
    resolved.startsWith("lib/kernel/db") ||
    resolved.startsWith("@/generated/prisma")
  );
}

function isMuseum(spec: string, resolved: string): boolean {
  return (
    spec === "yetkin.ai" ||
    spec.startsWith("yetkin.ai/") ||
    spec.startsWith("@/yetkin.ai") ||
    resolved.startsWith("yetkin.ai")
  );
}

const violations: Violation[] = [];

function add(file: string, spec: string, ruleId: string) {
  violations.push({ file, spec, ruleId });
}

for (const dir of SCAN_DIRS) {
  for (const abs of walk(join(ROOT, dir))) {
    const file = rel(abs);
    const zone = zoneOf(file);
    if (!zone) {
      continue;
    }
    const source = stripComments(readFileSync(abs, "utf8"));
    const selfRoom = verticalOfLib(file);

    for (const spec of collectSpecs(source)) {
      const resolved = resolveSpec(file, spec);

      if (isMuseum(spec, resolved)) {
        add(file, spec, "s9.museum");
        continue;
      }

      if (zone === "api") {
        continue;
      }

      if (zone === "kernel") {
        const targetRoom = verticalOfLib(resolved);
        if (targetRoom) {
          add(file, spec, "kernel.vertical");
        }
        continue;
      }

      if (zone === "module" || zone === "shared") {
        const targetRoom = verticalOfLib(resolved);
        if (targetRoom && targetRoom !== selfRoom) {
          if (isInnerServerPath(resolved) || isModuleBarrel(resolved)) {
            add(file, spec, "module.engine");
          }
          const banned = selfRoom ? EARNINGS_WALL[selfRoom] : undefined;
          if (banned?.has(targetRoom)) {
            add(file, spec, "room.wall");
          }
        }
        continue;
      }

      if (zone === "ui" || zone === "page") {
        if (isPrismaSurface(spec, resolved) || isInnerServerPath(resolved)) {
          add(file, spec, "ui.server");
        }
        if (resolved === "lib/kernel/admin" || resolved === "lib/kernel/admin/index") {
          add(file, spec, "ui.server");
        }
        if (resolved === "lib/kernel/identity" || resolved === "lib/kernel/identity/index") {
          add(file, spec, "ui.server");
        }
      }
    }
  }
}

const eslintPath = join(ROOT, "eslint.config.mjs");
if (!existsSync(eslintPath)) {
  violations.push({
    file: "eslint.config.mjs",
    spec: "",
    ruleId: "eslint.missing",
  });
} else {
  const eslintSource = readFileSync(eslintPath, "utf8");
  for (const needle of [
    "no-restricted-imports",
    "Anayasa §2.8",
    "lib/kernel",
    "catalog-write",
    "VERTICAL_ROOMS",
    "room.wall",
    "EARNINGS_WALL",
  ]) {
    if (!eslintSource.includes(needle)) {
      violations.push({
        file: "eslint.config.mjs",
        spec: needle,
        ruleId: "eslint.seal",
      });
    }
  }
}

for (const sqlFile of CATALOG_SQL) {
  const full = join(ROOT, sqlFile);
  if (!existsSync(full)) {
    violations.push({ file: sqlFile, spec: "", ruleId: "catalog.missing" });
    continue;
  }
  if (!catalogSqlPreservesOperatorPrice(readFileSync(full, "utf8"))) {
    violations.push({
      file: sqlFile,
      spec: "ON CONFLICT amount_minor",
      ruleId: "catalog.preserve",
    });
  }
}

{
  const localIds = [...VERTICAL_ROOMS];
  const modulesPath = join(ROOT, "lib/kernel/modules.ts");
  const modulesIds = existsSync(modulesPath)
    ? parseVerticalRoomIdsFromModules(readFileSync(modulesPath, "utf8"))
    : null;
  if (!modulesIds) {
    violations.push({
      file: "lib/kernel/modules.ts",
      spec: "VERTICAL_ROOMS bloğu parse edilemedi",
      ruleId: "room.sicil",
    });
  } else if (!roomIdListsEqual(localIds, modulesIds)) {
    violations.push({
      file: "lib/kernel/modules.ts",
      spec: verticalRoomsSicilDriftMessage(
        "scripts/verify-boundaries.ts",
        localIds,
        "lib/kernel/modules.ts",
        modulesIds,
      ),
      ruleId: "room.sicil",
    });
  }

  const eslintIds = existsSync(eslintPath)
    ? parseVerticalRoomIdsFromEslint(readFileSync(eslintPath, "utf8"))
    : null;
  if (!eslintIds) {
    violations.push({
      file: "eslint.config.mjs",
      spec: "VERTICAL_ROOMS bloğu parse edilemedi",
      ruleId: "room.sicil",
    });
  } else if (!roomIdListsEqual(localIds, eslintIds)) {
    violations.push({
      file: "eslint.config.mjs",
      spec: verticalRoomsSicilDriftMessage(
        "scripts/verify-boundaries.ts",
        localIds,
        "eslint.config.mjs",
        eslintIds,
      ),
      ruleId: "room.sicil",
    });
  }

  const libRoot = join(ROOT, "lib");
  const libDirs = existsSync(libRoot)
    ? readdirSync(libRoot, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
    : [];
  for (const extra of unexpectedLibTopDirs(libDirs, VERTICAL_ROOMS)) {
    violations.push({
      file: `lib/${extra}`,
      spec: extraLibRoomMessage(extra, VERTICAL_ROOMS),
      ruleId: "room.ceiling",
    });
  }
  for (const missing of missingRegisteredRoomDirs(libDirs, VERTICAL_ROOMS)) {
    violations.push({
      file: `lib/${missing}`,
      spec: missingLibRoomMessage(missing),
      ruleId: "room.missing",
    });
  }
}

if (violations.length > 0) {
  console.error(
    [
      "verify:boundaries BAŞARISIZ — katman sızıntısı:",
      ...violations.map((row) =>
        row.spec
          ? `  ✗ ${row.file} [${row.ruleId}] ${row.spec}`
          : `  ✗ ${row.file} [${row.ruleId}]`,
      ),
    ].join("\n"),
  );
  process.exit(1);
}

console.log(
  "verify:boundaries OK — kernel↛dikey, UI↛prisma/yazma motoru, oda↛oda engine, freelancer/kurumsal oda duvarı, 12 oda sicili, katalog ON CONFLICT Super Admin tutarını korur.",
);
