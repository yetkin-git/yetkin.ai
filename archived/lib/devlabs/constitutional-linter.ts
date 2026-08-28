/**
 * Anayasal statik linter — float/kuruş, çiğ SQL, güvenlik.
 * Exec / sandbox runner yoktur (S59-A). Saf fonksiyon.
 */

export type ConstitutionalViolationKind = "kurus_discipline" | "raw_sql" | "security";

export type ConstitutionalViolation = {
  kind: ConstitutionalViolationKind;
  ruleId: string;
  line: number;
  column: number;
  excerpt: string;
  message: string;
};

export type ConstitutionalLinterReport = {
  ok: boolean;
  score: number;
  violationCount: number;
  violations: ConstitutionalViolation[];
};

const KURUS_FLOAT_PATTERNS: ReadonlyArray<{
  ruleId: string;
  pattern: RegExp;
  message: string;
}> = [
  {
    ruleId: "minor.amountTL",
    pattern: /\bamountTL\b/g,
    message: "amountTL yasaktır — yalnızca amountMinor (tam sayı) kullan.",
  },
  {
    ruleId: "minor.parseFloat",
    pattern: /\bparseFloat\s*\(/g,
    message: "parseFloat para dönüşümü yasaktır — toAmountMinor kullan.",
  },
  {
    ruleId: "minor.toFixed2",
    pattern: /\.toFixed\s*\(\s*2\s*\)/g,
    message: ".toFixed(2) float TL temsili yasaktır — integer minor disiplini.",
  },
  {
    ruleId: "minor.priceTl",
    pattern: /\b(?:priceTl|balanceTl|amount_tl|price_tl)\b/gi,
    message: "TL float alan adı yasaktır — amountMinor zorunlu.",
  },
  {
    ruleId: "minor.amountKurus",
    pattern: /\b(?:amountKurus|balanceKurus|costKurus|unitPriceKurus)\b/g,
    message: "amountKurus kolon adı yasaktır — Yetkin.ai amountMinor kullanır.",
  },
];

const RAW_SQL_PATTERNS: ReadonlyArray<{
  ruleId: string;
  pattern: RegExp;
  message: string;
}> = [
  {
    ruleId: "sql.raw.unsafe",
    pattern:
      /\b(?:prisma\.\$queryRaw(?:Unsafe)?|\$executeRaw(?:Unsafe)?|queryRawUnsafe|executeRawUnsafe)\s*(?:`|\()/g,
    message: "Çiğ SQL / queryRawUnsafe — enjeksiyon riski; parametreli sorgu kullan.",
  },
  {
    ruleId: "sql.concat",
    pattern:
      /(?:SELECT|INSERT|UPDATE|DELETE)\s+[\s\S]{0,80}(?:\$\{|\+\s*(?:req\.|request\.|params\.|body\.|userInput))/gi,
    message: "Dinamik SQL birleştirme — SQL injection riski.",
  },
];

const SECURITY_PATTERNS: ReadonlyArray<{
  ruleId: string;
  pattern: RegExp;
  message: string;
}> = [
  {
    ruleId: "security.eval",
    pattern: /\beval\s*\(/g,
    message: "eval yasaktır — DevLabs exec/sandbox runner açmaz (S59-A).",
  },
  {
    ruleId: "security.function",
    pattern: /\bnew\s+Function\s*\(/g,
    message: "new Function dinamik exec yasaktır.",
  },
  {
    ruleId: "security.child_process",
    pattern: /\b(?:child_process|execSync|spawnSync)\b/g,
    message: "İşlem spawn / exec yasaktır — tezgâh artifact basar, çalıştırmaz.",
  },
  {
    ruleId: "security.vm",
    pattern: /\bvm\.runIn(?:New)?Context\s*\(/g,
    message: "vm.runInContext sandbox runner yasaktır (S59-A).",
  },
  {
    ruleId: "security.leak.secret",
    pattern:
      /\b(?:password|secret|hmac|privateKey|merchantKey|apiSecret|accessToken)\b\s*[:=]/gi,
    message: "Hassas alan istemci yüzeyine sızdırılabilir — allowlist kullan.",
  },
];

function lineColumnAt(source: string, index: number): { line: number; column: number } {
  let line = 1;
  let column = 1;
  for (let i = 0; i < index && i < source.length; i += 1) {
    if (source[i] === "\n") {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }
  return { line, column };
}

function excerptAt(source: string, index: number, length: number): string {
  const start = Math.max(0, index - 12);
  const end = Math.min(source.length, index + length + 12);
  return source.slice(start, end).replace(/\s+/g, " ").trim();
}

function pushMatchViolations(
  code: string,
  kind: ConstitutionalViolationKind,
  ruleId: string,
  pattern: RegExp,
  message: string,
  into: ConstitutionalViolation[],
): void {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  const re = new RegExp(pattern.source, flags);
  let match: RegExpExecArray | null;
  while ((match = re.exec(code)) !== null) {
    const { line, column } = lineColumnAt(code, match.index);
    into.push({
      kind,
      ruleId,
      line,
      column,
      excerpt: excerptAt(code, match.index, match[0].length),
      message,
    });
  }
}

function scan(
  code: string,
  kind: ConstitutionalViolationKind,
  rules: ReadonlyArray<{ ruleId: string; pattern: RegExp; message: string }>,
): ConstitutionalViolation[] {
  const violations: ConstitutionalViolation[] = [];
  for (const rule of rules) {
    pushMatchViolations(code, kind, rule.ruleId, rule.pattern, rule.message, violations);
  }
  return violations;
}

export function lintConstitutionalSource(code: string): ConstitutionalLinterReport {
  const violations = [
    ...scan(code, "kurus_discipline", KURUS_FLOAT_PATTERNS),
    ...scan(code, "raw_sql", RAW_SQL_PATTERNS),
    ...scan(code, "security", SECURITY_PATTERNS),
  ].sort((a, b) => a.line - b.line || a.column - b.column);

  const penalty = Math.min(100, violations.length * 15);
  const score = 100 - penalty;
  return {
    ok: violations.length === 0,
    score,
    violationCount: violations.length,
    violations,
  };
}
