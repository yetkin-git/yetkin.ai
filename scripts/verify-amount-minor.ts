#!/usr/bin/env tsx
/**
 * amountMinor disiplini — float para, amountKurus kolon adı ve TL alan sızıntısı yasak.
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const PROJECT_ROOT = process.cwd();

const SCAN_DIRS = ["lib/kernel", "prisma/schema", "app/api"] as const;

const ALLOWLIST_TOFIXED = new Set(["lib/kernel/payments/paytr/checkout.ts"]);

const REQUIRED_SEAL_FILES = [
  "lib/kernel/money/amount-minor.ts",
  "lib/kernel/payments/paytr/checkout.ts",
  "lib/kernel/payments/paytr/webhook.ts",
  "lib/kernel/payments/provider.ts",
  "prisma/schema/kernel.prisma",
] as const;

const BANNED_TL_FIELD = /\b(?:amountTL|amountTl|priceTl|balanceTl|amount_tl|price_tl|balance_tl)\b/g;
const BANNED_KURUS_COLUMN = /\b(?:amountKurus|balanceKurus|costKurus|unitPriceKurus)\b/g;
const PARSE_FLOAT = /\bparseFloat\s*\(/g;
const TO_FIXED_2 = /\.toFixed\s*\(\s*2\s*\)/g;
const FILE_RE = /\.(ts|tsx|prisma)$/;

type Violation = { file: string; ruleId: string; excerpt: string };

function rel(file: string): string {
  return relative(PROJECT_ROOT, file).replace(/\\/g, "/");
}

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}

function collectHits(source: string, pattern: RegExp): string[] {
  const hits: string[] = [];
  const re = new RegExp(pattern.source, "g");
  let match: RegExpExecArray | null;
  while ((match = re.exec(source)) !== null) {
    hits.push(match[0]);
  }
  return hits;
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
      files.push(...walk(fullPath));
    } else if (FILE_RE.test(entry)) {
      files.push(fullPath);
    }
  }
  return files;
}

function scanTree(): Violation[] {
  const violations: Violation[] = [];
  for (const dir of SCAN_DIRS) {
    for (const file of walk(join(PROJECT_ROOT, dir))) {
      const pathRel = rel(file);
      const source = stripComments(readFileSync(file, "utf8"));

      for (const hit of collectHits(source, BANNED_TL_FIELD)) {
        violations.push({ file: pathRel, ruleId: "minor.banned-tl-field", excerpt: hit });
      }
      for (const hit of collectHits(source, BANNED_KURUS_COLUMN)) {
        violations.push({ file: pathRel, ruleId: "minor.banned-kurus-column", excerpt: hit });
      }
      if (
        pathRel.startsWith("lib/kernel/money/") ||
        pathRel.startsWith("lib/kernel/ledger/") ||
        pathRel.startsWith("lib/kernel/payments/") ||
        pathRel.startsWith("lib/kernel/escrow/") ||
        pathRel.startsWith("lib/kernel/pricing/")
      ) {
        for (const hit of collectHits(source, PARSE_FLOAT)) {
          violations.push({ file: pathRel, ruleId: "minor.parseFloat", excerpt: hit });
        }
      }
      if (!ALLOWLIST_TOFIXED.has(pathRel)) {
        for (const hit of collectHits(source, TO_FIXED_2)) {
          violations.push({ file: pathRel, ruleId: "minor.toFixed2", excerpt: hit });
        }
      }
    }
  }
  return violations;
}

function assertPaytrBoundarySeal(): Violation[] {
  const violations: Violation[] = [];
  const paytrPath = join(PROJECT_ROOT, "lib/kernel/payments/paytr/checkout.ts");
  const source = readFileSync(paytrPath, "utf8");
  const required = [
    { needle: "formatPaytrPaymentAmount", hint: "PayTR TL string dönüşümü eksik" },
    { needle: "Number.isInteger(paymentAmountMinor)", hint: "PayTR integer minor kapısı eksik" },
    { needle: "paymentAmountMinor", hint: "PayTR tutar alanı amountMinor değil" },
    { needle: ".toFixed(2)", hint: "PayTR sınır katmanı .toFixed(2) kayboldu" },
  ] as const;
  for (const req of required) {
    if (!source.includes(req.needle)) {
      violations.push({
        file: "lib/kernel/payments/paytr/checkout.ts",
        ruleId: "paytr.boundary",
        excerpt: req.hint,
      });
    }
  }

  const amountSource = readFileSync(
    join(PROJECT_ROOT, "lib/kernel/money/amount-minor.ts"),
    "utf8",
  );
  if (!amountSource.includes("export function toAmountMinor")) {
    violations.push({
      file: "lib/kernel/money/amount-minor.ts",
      ruleId: "minor.toAmountMinor-export",
      excerpt: "toAmountMinor giriş kapısı kayboldu",
    });
  }

  const prismaSource = readFileSync(join(PROJECT_ROOT, "prisma/schema/kernel.prisma"), "utf8");
  if (!prismaSource.includes("amountMinor") || !prismaSource.includes("currencyCode")) {
    violations.push({
      file: "prisma/schema/kernel.prisma",
      ruleId: "minor.prisma-columns",
      excerpt: "amountMinor + currencyCode şema mührü kayboldu",
    });
  }
  return violations;
}

function assertRequiredFiles(): Violation[] {
  return REQUIRED_SEAL_FILES.filter((file) => !existsSync(join(PROJECT_ROOT, file))).map(
    (file) => ({
      file,
      ruleId: "minor.missing-seal-file",
      excerpt: "zorunlu mühür dosyası yok",
    }),
  );
}

const violations = [
  ...assertRequiredFiles(),
  ...scanTree(),
  ...assertPaytrBoundarySeal(),
];

if (violations.length > 0) {
  console.error(
    [
      "verify:amount-minor BAŞARISIZ:",
      ...violations.map((row) => `  ✗ ${row.file} [${row.ruleId}] ${row.excerpt}`),
    ].join("\n"),
  );
  process.exit(1);
}

console.log("verify:amount-minor OK — integer minor + PayTR sınır katmanı mühürlü.");
