#!/usr/bin/env tsx
/**
 * Anayasa A8 import sınırları — statik (grep). ESLint no-restricted-imports ile aynı sözleşme.
 * Canlı Postgres yok.
 *
 * 1. lib/kernel dikey oda import etmez.
 * 2. UI / sayfa Prisma ve server-only yazma motoru import etmez.
 * 3. Dikey odalar birbirinin engine/runtime/prisma-store dosyasını import etmez.
 * 4. VERTICAL_ROOMS tek SSOT (`lib/kernel/rooms.ssot.ts`); eslint ve modules ondan türer.
 *    Donmuş oda `lib/` altında yoktur; `archived/` + kenar 410. Yeni 5. çalışan oda sicile yazılmadan açılmaz.
 * 5. `app/api/**` uygulama servisidir (sınav → vize): çalışan odaları birleştirebilir.
 *    Kaçış deliği değildir — müze, donmuş oda ve UI import'u yasaktır.
 * 6. Kariyer ve freelancer `lib/academy` import etmez; müfredat kimliği `lib/kernel/catalog-ids`.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  contextOfPhase1Room,
  contextOfPrismaModel,
  isContextPrismaAllowlisted,
} from "../lib/kernel/bounded-contexts";
import { catalogSqlPreservesOperatorPrice } from "./ops-migrate-lib";
import {
  extraLibRoomMessage,
  missingLibRoomMessage,
  missingRegisteredRoomDirs,
  parseFrozenDiskRoomIdsFromSsot,
  parseVerticalRoomIdsFromSsot,
  ROOMS_SSOT_REL,
  sourceDerivesRoomsSsot,
  unexpectedLibTopDirs,
} from "./room-ceiling-lib";
import { FROZEN_DISK_ROOMS, VERTICAL_ROOMS as VERTICAL_ROOM_RECORDS } from "../lib/kernel/rooms.ssot";

const ROOT = process.cwd();
const FILE_RE = /\.(ts|tsx)$/;

/** Çalışan 4 oda — rooms.ssot.ts SSOT (kopya dizi yok). Donmuş oda canlı lib/ tavanında yoktur. */
const VERTICAL_ROOMS = VERTICAL_ROOM_RECORDS.map((room) => room.id);
const LIVE_ROOMS = VERTICAL_ROOMS;

type VerticalRoom = (typeof LIVE_ROOMS)[number];

const VERTICAL_SET = new Set<string>(LIVE_ROOMS);
const FROZEN_SET = new Set<string>(FROZEN_DISK_ROOMS);

/** D2.3 kazanç duvarı — string FK / HTTP; lib çapraz import yok. */
const EARNINGS_WALL: Partial<Record<VerticalRoom, ReadonlySet<VerticalRoom>>> = {
  freelancer: new Set(["career"]),
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
const PRISMA_DELEGATE_RE = /\b(?:prisma|db)\.([A-Za-z][A-Za-z0-9]*)\./g;

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
      if (entry === "node_modules" || entry === "yetkin_muze" || entry === "yetkin.ai") {
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

function frozenOfLib(path: string): string | null {
  const match = stripExt(path).match(/^lib\/([^/]+)/);
  const id = match?.[1];
  if (id && FROZEN_SET.has(id)) {
    return id;
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
  if (name === "catalog-write" || name === "display-name-write" || name === "billing-info-write") {
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
    spec === "yetkin_muze" ||
    spec === "yetkin.ai" ||
    spec.startsWith("yetkin_muze/") ||
    spec.startsWith("yetkin.ai/") ||
    spec.startsWith("@/yetkin_muze") ||
    spec.startsWith("@/yetkin.ai") ||
    resolved.startsWith("yetkin_muze") ||
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
        add(file, spec, "ops.museum");
        continue;
      }

      if (zone === "api") {
        if (resolved.startsWith("components/")) {
          add(file, spec, "api.ui");
        }
        if (resolved.startsWith("archived/") || frozenOfLib(resolved)) {
          add(file, spec, "api.frozen");
        }
        continue;
      }

      if (zone === "kernel") {
        if (verticalOfLib(resolved) || frozenOfLib(resolved)) {
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
          if (
            (selfRoom === "career" || selfRoom === "freelancer") &&
            targetRoom === "academy"
          ) {
            add(file, spec, "a8.catalog");
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

    if (zone === "module" && !isContextPrismaAllowlisted(file)) {
      const selfContext = selfRoom ? contextOfPhase1Room(selfRoom) : null;
      const prismaCopy = new RegExp(PRISMA_DELEGATE_RE.source, PRISMA_DELEGATE_RE.flags);
      let prismaMatch: RegExpExecArray | null;
      while ((prismaMatch = prismaCopy.exec(source)) !== null) {
        const delegate = prismaMatch[1];
        if (!delegate) {
          continue;
        }
        const modelContext = contextOfPrismaModel(delegate);
        if (!modelContext) {
          continue;
        }
        if (selfContext && selfContext === modelContext) {
          continue;
        }
        add(file, `prisma.${delegate}`, "context.prisma");
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
    "Anayasa A8",
    "lib/kernel",
    "catalog-ids",
    "catalog-write",
    "VERTICAL_ROOMS",
    "room.wall",
    "EARNINGS_WALL",
    "BOUNDED_CONTEXTS",
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
  const ssotPath = join(ROOT, ROOMS_SSOT_REL);
  if (!existsSync(ssotPath)) {
    violations.push({
      file: ROOMS_SSOT_REL,
      spec: "çalışan oda SSOT yok",
      ruleId: "room.sicil",
    });
  } else {
    const ssotSource = readFileSync(ssotPath, "utf8");
    const ssotIds = parseVerticalRoomIdsFromSsot(ssotSource);
    const frozenIds = parseFrozenDiskRoomIdsFromSsot(ssotSource);
    if (!ssotIds || ssotIds.length !== 4) {
      violations.push({
        file: ROOMS_SSOT_REL,
        spec: "VERTICAL_ROOMS bloğu parse edilemedi veya 4 oda değil",
        ruleId: "room.sicil",
      });
    }
    if (!frozenIds || frozenIds.length !== 8) {
      violations.push({
        file: ROOMS_SSOT_REL,
        spec: "FROZEN_DISK_ROOMS bloğu parse edilemedi veya 8 oda değil",
        ruleId: "room.sicil",
      });
    }
  }

  const modulesPath = join(ROOT, "lib/kernel/modules.ts");
  const modulesSource = existsSync(modulesPath) ? readFileSync(modulesPath, "utf8") : "";
  if (!sourceDerivesRoomsSsot(modulesSource) || !modulesSource.includes("VERTICAL_ROOMS")) {
    violations.push({
      file: "lib/kernel/modules.ts",
      spec: "VERTICAL_ROOMS rooms.ssot.ts SSOT'tan türetilmiyor",
      ruleId: "room.sicil",
    });
  }

  const eslintSourceForSicil = existsSync(eslintPath) ? readFileSync(eslintPath, "utf8") : "";
  if (
    !eslintSourceForSicil.includes("rooms.ssot.ts") ||
    !eslintSourceForSicil.includes("parseSsotIds") ||
    !eslintSourceForSicil.includes("const VERTICAL_ROOMS")
  ) {
    violations.push({
      file: "eslint.config.mjs",
      spec: "VERTICAL_ROOMS rooms.ssot.ts SSOT'tan türetilmiyor",
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
      "verify:boundaries OK — kernel↛dikey, UI↛prisma/yazma motoru, oda↛oda engine, app/api uygulama servisi (müze/donmuş/UI yasak; çalışan oda kompozisyonu yasal), freelancer oda duvarı, kariyer/freelancer↛academy (catalog-ids), çalışan 4 oda sicili, donmuş oda lib/ tavanı yasak (archived/), Proof/Marketplace/Payments tablo sahipliği, katalog ON CONFLICT Super Admin tutarını korur.",
);
