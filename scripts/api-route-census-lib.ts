/**
 * app/api route fiilleri — sicil sayımı.
 * Davranış yoktur. verify-boundaries ve yüzey testi aynı yürüyüşü kullanır.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { toPublicApiPath } from "../lib/kernel/security/api-auth";

const HTTP_METHODS = ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"] as const;

const NAMED_RE = /export\s+(?:async\s+)?function\s+(GET|HEAD|POST|PUT|PATCH|DELETE)\b/g;
const CONST_RE = /export\s+const\s+(GET|HEAD|POST|PUT|PATCH|DELETE)\b/g;
const REEXPORT_RE = /export\s*\{([^}]+)\}/g;

export type AppApiRouteRecord = {
  file: string;
  path: string;
  methods: string[];
};

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}

function walkRoutes(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      files.push(...walkRoutes(full));
    } else if (entry === "route.ts") {
      files.push(full);
    }
  }
  return files;
}

export function httpMethodsInRouteSource(source: string): string[] {
  const stripped = stripComments(source);
  const found = new Set<string>();
  for (const re of [NAMED_RE, CONST_RE]) {
    const copy = new RegExp(re.source, re.flags);
    let match: RegExpExecArray | null;
    while ((match = copy.exec(stripped)) !== null) {
      const method = match[1];
      if (method) {
        found.add(method);
      }
    }
  }
  const reexport = new RegExp(REEXPORT_RE.source, REEXPORT_RE.flags);
  let block: RegExpExecArray | null;
  while ((block = reexport.exec(stripped)) !== null) {
    const body = block[1] ?? "";
    for (const part of body.split(",")) {
      const name = part.trim().split(/\s+as\s+/)[0]?.trim();
      if (name && (HTTP_METHODS as readonly string[]).includes(name)) {
        found.add(name);
      }
    }
  }
  return HTTP_METHODS.filter((method) => found.has(method));
}

export function collectAppApiRoutes(root: string): AppApiRouteRecord[] {
  const apiDir = join(root, "app", "api");
  return walkRoutes(apiDir)
    .map((abs) => {
      const file = relative(root, abs).replace(/\\/g, "/");
      return {
        file,
        path: toPublicApiPath(file),
        methods: httpMethodsInRouteSource(readFileSync(abs, "utf8")),
      };
    })
    .sort((left, right) => left.path.localeCompare(right.path));
}
