#!/usr/bin/env tsx
/**
 * Web oturum kalkanı mühürleri — statik (grep). Canlı Postgres yok.
 * Origin / Sec-Fetch-Site, SameSite=Lax + httpOnly, trusted-proxy XFF, LRU kova.
 * Davranış testleri package.json zincirinde vitest ile koşar.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

type Needle = { needle: string; label: string };

type FileRule = {
  file: string;
  must: Needle[];
  mustNot?: Needle[];
};

const FILE_RULES: FileRule[] = [
  {
    file: "lib/kernel/security/origin-guard.ts",
    must: [
      { needle: "export function decideWebOriginGuard", label: "origin kapısı" },
      { needle: "cross-site", label: "Sec-Fetch-Site cross-site" },
      { needle: "isApiV1Pathname", label: "v1 muafiyeti" },
      { needle: 'authKind === "webhook"', label: "webhook muafiyeti" },
      { needle: "WEB_ORIGIN_FORBIDDEN", label: "403 metni" },
    ],
    mustNot: [
      { needle: "@/lib/freelancer", label: "çekirdek freelancer import etmez" },
    ],
  },
  {
    file: "proxy.ts",
    must: [
      { needle: "decideWebOriginGuard", label: "kenar origin kalkanı" },
      { needle: "originDecision.kind === \"deny\"", label: "fail-closed 403" },
      { needle: "isApiV1Pathname(pathname)", label: "v1 yolu ayrı" },
    ],
  },
  {
    file: "lib/kernel/auth/cookie-options.ts",
    must: [
      { needle: "httpOnly: true", label: "httpOnly kalkanı" },
      { needle: 'return "lax"', label: "SameSite lax" },
      { needle: "useSecureCookies", label: "üretim Secure" },
    ],
    mustNot: [
      { needle: "httpOnly: false", label: "okunabilir oturum çerezi yok" },
      { needle: 'return "none"', label: "SameSite none yazılmaz" },
    ],
  },
  {
    file: "lib/kernel/security/rate-limit-port.ts",
    must: [
      { needle: "evictOldestWhileOverflow", label: "bounded LRU" },
      { needle: "buckets.keys().next()", label: "en eski kova" },
    ],
    mustNot: [
      { needle: "buckets.size > maxBuckets", label: "eski tavan-clear yok" },
    ],
  },
  {
    file: "lib/kernel/security/trusted-proxy.ts",
    must: [
      { needle: "export function resolveTrustedForwardedIp", label: "trusted-proxy XFF" },
      { needle: "parts.length - hops", label: "sağ hop" },
      { needle: "x-forwarded-for", label: "tek XFF kaynağı" },
    ],
    mustNot: [
      { needle: "x-real-ip", label: "platform dışı IP başlığı yedek değil" },
    ],
  },
  {
    file: "lib/kernel/security/http-rate-limit.ts",
    must: [
      { needle: "resolveTrustedForwardedIp", label: "IP trusted-proxy" },
      { needle: "financialMutationIp", label: "finansal mutasyon kotası" },
      { needle: "llmIp", label: "LLM kotası" },
      { needle: "isLlmMutationPath", label: "LLM yol eşleyici" },
    ],
  },
  {
    file: "tests/kernel/origin-guard.test.ts",
    must: [
      { needle: "sec-fetch-site", label: "Sec-Fetch-Site senaryosu" },
      { needle: "https://evil.example", label: "çapraz köken" },
      { needle: "toBe(403)", label: "403 assert" },
      { needle: "/api/v1/", label: "v1 muafiyet testi" },
    ],
  },
  {
    file: "components/auth/reset-password-form.tsx",
    must: [
      { needle: "/api/auth/session", label: "httpOnly oturum yoklaması" },
      { needle: "/api/auth/password", label: "sunucu şifre yazması" },
    ],
    mustNot: [
      { needle: "createSupabaseBrowserClient", label: "yenileme tarayıcı çerezi okumaz" },
    ],
  },
];

const REQUIRED_FILES = [
  "tests/kernel/origin-guard.test.ts",
  "tests/kernel/http-rate-limit.test.ts",
  "tests/kernel/auth-cookie-surface.test.ts",
  "tests/kernel/web-security-seals-surface.test.ts",
  "lib/kernel/security/origin-guard.ts",
  "lib/kernel/security/trusted-proxy.ts",
] as const;

const issues: string[] = [];

function readProjectFile(relPath: string): string | null {
  const full = join(ROOT, relPath);
  if (!existsSync(full)) {
    return null;
  }
  return readFileSync(full, "utf8");
}

for (const rule of FILE_RULES) {
  const raw = readProjectFile(rule.file);
  if (raw === null) {
    issues.push(`${rule.file}: yok`);
    continue;
  }
  for (const item of rule.must) {
    if (!raw.includes(item.needle)) {
      issues.push(`${rule.file}: eksik — ${item.label} (\`${item.needle}\`)`);
    }
  }
  for (const item of rule.mustNot ?? []) {
    if (raw.includes(item.needle)) {
      issues.push(`${rule.file}: yasak — ${item.label} (\`${item.needle}\`)`);
    }
  }
}

for (const file of REQUIRED_FILES) {
  if (!existsSync(join(ROOT, file))) {
    issues.push(`${file}: zorunlu web güvenlik testi/kaynak yok`);
  }
}

const pkgRaw = readProjectFile("package.json");
if (pkgRaw === null) {
  issues.push("package.json yok");
} else {
  const pkg = JSON.parse(pkgRaw) as { scripts?: Record<string, string> };
  const scripts = pkg.scripts ?? {};
  const prebuild = scripts["verify:prebuild"] ?? "";
  const nightly = scripts["verify:nightly"] ?? "";
  const web = scripts["verify:web-security-seals"] ?? "";
  if (prebuild.includes("verify:web-security-seals")) {
    issues.push("package.json verify:prebuild: web-security nightly kovasına taşınır");
  }
  if (!nightly.includes("verify:web-security-seals")) {
    issues.push("package.json verify:nightly: verify:web-security-seals yok");
  }
  const webAt = nightly.indexOf("verify:web-security-seals");
  const surfaceAt = nightly.indexOf("test:surface");
  if (webAt < 0) {
    issues.push("package.json verify:nightly: web-security yok");
  }
  if (surfaceAt < 0 || surfaceAt < webAt) {
    issues.push("package.json verify:nightly: web-security surface vitest'ten önce değil");
  }
  if (!web.includes("scripts/verify-web-security-seals.ts")) {
    issues.push("package.json verify:web-security-seals: scripts/verify-web-security-seals.ts hedefi yok");
  }
  if (!web.includes("tests/kernel/origin-guard.test.ts")) {
    issues.push("package.json verify:web-security-seals: origin-guard vitest yok");
  }
  if (!web.includes("tests/kernel/http-rate-limit.test.ts")) {
    issues.push("package.json verify:web-security-seals: rate-limit vitest yok");
  }
  if (!web.includes("tests/kernel/auth-cookie-surface.test.ts")) {
    issues.push("package.json verify:web-security-seals: cookie vitest yok");
  }
}

if (issues.length > 0) {
  console.error(["verify:web-security-seals BAŞARISIZ:", ...issues.map((row) => `  ✗ ${row}`)].join("\n"));
  process.exit(1);
}

console.log(
  "verify:web-security-seals OK — Origin/Sec-Fetch kalkanı, SameSite/httpOnly, trusted-proxy XFF, LRU kova kilitli.",
);
