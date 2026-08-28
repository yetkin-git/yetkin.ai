#!/usr/bin/env tsx
/**
 * İnce sızıntı taraması — prebuild.
 * Canlı Postgres yok. Müze parmak izi listesi taşınmaz.
 *
 * Tarar: kaynak, prisma, docs, tests, scripts, .env.example
 * Yasak: PEM, service_role JWT, .env.example'da dolu yasaklı anahtar, git'te .env
 */

import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();

const SCAN_DIRS = ["lib", "app", "components", "scripts", "prisma", "docs", "tests", "supabase", "apps"] as const;
const ROOT_FILES = [".env.example", "package.json"] as const;

const SKIP_DIR_NAMES = new Set(["node_modules", "yetkin_muze", "yetkin.ai", "generated", ".next", ".git"]);

const SKIP_FILE_NAMES = new Set([
  ".env",
  ".env.local",
  ".env.development",
  ".env.production",
  ".env.test",
]);

const FORBIDDEN_GIT_ENV = [
  ".env",
  ".env.local",
  ".env.production",
  ".env.development",
  ".env.test",
];
const FORBIDDEN_GIT_BASENAMES = new Set(["credentials.json", "serviceAccount.json"]);
const FORBIDDEN_GIT_SUFFIX = /\.(pem|p12|pfx|p8|jks)$/i;

const FORBIDDEN_EXAMPLE_KEYS = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SECRET_KEY",
  "AUTH_COOKIE_SECRET",
  "REDIS_URL",
];

const FILE_RE = /\.(ts|tsx|js|mjs|cjs|json|md|prisma|sql|example|toml)$/i;
const PEM_RE = /-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----/;
const JWT_RE = /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g;
const SK_LIVE_RE = /\bsk_live_[A-Za-z0-9]{16,}\b/;
const AWS_KEY_RE = /\bAKIA[0-9A-Z]{16}\b/;

type Violation = { file: string; ruleId: string; excerpt: string };

function rel(file: string): string {
  return relative(ROOT, file).replace(/\\/g, "/");
}

function walk(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIR_NAMES.has(entry) || SKIP_FILE_NAMES.has(entry)) {
      continue;
    }
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      files.push(...walk(full));
    } else if (FILE_RE.test(entry) || entry === ".env.example") {
      files.push(full);
    }
  }
  return files;
}

function stripComments(source: string, file: string): string {
  if (file.endsWith(".md") || file.endsWith(".sql")) {
    return source;
  }
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}

function jwtHasServiceRole(token: string): boolean {
  const payload = token.split(".")[1];
  if (!payload) {
    return false;
  }
  try {
    const padded = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(padded, "base64").toString("utf8");
    return /"role"\s*:\s*"service_role"/.test(json);
  } catch {
    return false;
  }
}

function assignedEnvValue(line: string, key: string): string | null {
  const match = line.match(new RegExp(`^(?:export )?${key}\\s*=\\s*(.*)$`));
  if (!match) {
    return null;
  }
  return match[1]!.trim().replace(/^["']|["']$/g, "");
}

function listTrackedEnvLeaks(): string[] {
  try {
    const tracked = execSync("git ls-files -z", {
      cwd: ROOT,
      encoding: "buffer",
      stdio: ["ignore", "pipe", "pipe"],
    })
      .toString("utf8")
      .split("\0")
      .filter(Boolean)
      .map((row) => row.replace(/\\/g, "/"));
    return tracked.filter((file) => {
      const normalized = file.replace(/\\/g, "/");
      const base = normalized.split("/").pop() ?? normalized;
      return (
        FORBIDDEN_GIT_ENV.includes(normalized) ||
        FORBIDDEN_GIT_ENV.includes(base) ||
        normalized.endsWith("/.env") ||
        FORBIDDEN_GIT_BASENAMES.has(base) ||
        FORBIDDEN_GIT_SUFFIX.test(normalized)
      );
    });
  } catch {
    return [];
  }
}

function scanFile(abs: string): Violation[] {
  const file = rel(abs);
  if (file.startsWith("yetkin_muze/") || file.startsWith("yetkin.ai/")) {
    return [];
  }
  let source: string;
  try {
    source = readFileSync(abs, "utf8");
  } catch {
    return [];
  }
  const code = stripComments(source, file);
  const violations: Violation[] = [];

  if (PEM_RE.test(code)) {
    violations.push({ file, ruleId: "secrets.pem", excerpt: "PRIVATE KEY" });
  }
  if (SK_LIVE_RE.test(code)) {
    violations.push({ file, ruleId: "secrets.sk_live", excerpt: "sk_live_" });
  }
  if (AWS_KEY_RE.test(code)) {
    violations.push({ file, ruleId: "secrets.akia", excerpt: "AKIA" });
  }

  for (const match of code.matchAll(JWT_RE)) {
    const token = match[0];
    if (jwtHasServiceRole(token)) {
      violations.push({ file, ruleId: "secrets.service_role_jwt", excerpt: "service_role JWT" });
    }
  }

  if (file.endsWith(".env.example")) {
    for (const line of source.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }
      for (const key of FORBIDDEN_EXAMPLE_KEYS) {
        const value = assignedEnvValue(trimmed, key);
        if (value !== null && value.length > 0) {
          violations.push({
            file,
            ruleId: "secrets.env_example_forbidden",
            excerpt: key,
          });
        }
      }
      const serviceAssign = assignedEnvValue(trimmed, "SUPABASE_SERVICE_ROLE_KEY");
      if (serviceAssign !== null) {
        violations.push({
          file,
          ruleId: "secrets.service_role_assignment",
          excerpt: "SUPABASE_SERVICE_ROLE_KEY",
        });
      }
    }
  }

  return violations;
}

const violations: Violation[] = [];

for (const dir of SCAN_DIRS) {
  for (const abs of walk(join(ROOT, dir))) {
    violations.push(...scanFile(abs));
  }
}
for (const name of ROOT_FILES) {
  const abs = join(ROOT, name);
  if (existsSync(abs)) {
    violations.push(...scanFile(abs));
  }
}

for (const file of listTrackedEnvLeaks()) {
  violations.push({ file, ruleId: "secrets.git_env", excerpt: file });
}

if (violations.length > 0) {
  console.error(
    [
      "verify:no-secrets BAŞARISIZ:",
      ...violations.map((row) => `  ✗ ${row.file} [${row.ruleId}] ${row.excerpt}`),
    ].join("\n"),
  );
  process.exit(1);
}

console.log("verify:no-secrets OK — PEM / service_role JWT / yasaklı .env.example ataması / git .env yok.");
