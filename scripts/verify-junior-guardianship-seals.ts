#!/usr/bin/env tsx
/**
 * Junior vekâlet / sosyal mühendislik mühürleri — statik (grep). Canlı Postgres yok.
 * Rastgele guardianUserId yazımı yok; TTL'li hash davet; iki taraflı onay olmadan harçlık yok.
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
    file: "archived/lib/junior/schemas.ts",
    must: [
      { needle: "upsertJuniorProfileInputSchema", label: "profil şeması" },
      { needle: ".strict()", label: "extra key reddi" },
      { needle: "acceptGuardianInviteInputSchema", label: "davet kabul şeması" },
      { needle: "guardianInviteTokenSchema", label: "token şeması" },
    ],
    mustNot: [
      { needle: "guardianUserId: z.string()", label: "serbest guardianUserId şeması yok" },
    ],
  },
  {
    file: "archived/lib/junior/engine.ts",
    must: [
      { needle: "export async function createGuardianInvite", label: "davet oluşturma" },
      { needle: "export async function acceptGuardianInvite", label: "davet kabul" },
      { needle: "hashGuardianInviteToken", label: "token hash" },
      { needle: "guardianUserId: null", label: "profilde boş vekâlet" },
      { needle: "JUNIOR_BOND_PENDING", label: "askıda harçlık yasağı" },
      { needle: "her iki tarafın açık onayı", label: "iki taraflı onay" },
      { needle: "consumePendingInvite", label: "atomik davet tüketimi" },
    ],
    mustNot: [
      { needle: "guardianUserId: command.guardianUserId", label: "komuttan rastgele guardian yazımı yok" },
      { needle: "export async function consentJuniorProfile", label: "tek taraflı consent yok" },
    ],
  },
  {
    file: "archived/lib/junior/invite-token.ts",
    must: [
      { needle: "export function hashGuardianInviteToken", label: "HMAC hash" },
      { needle: "export function generateGuardianInvitePlaintext", label: "CSPRNG token" },
      { needle: "randomBytes", label: "cryptographically secure" },
      { needle: "JUNIOR_GUARDIAN_INVITE_TTL_MS", label: "TTL" },
    ],
  },
  {
    file: "archived/lib/junior/project.ts",
    must: [
      { needle: "export function maskAccountId", label: "hesap maskesi" },
      { needle: "export function maskDateOfBirth", label: "doğum tarihi maskesi" },
      { needle: 'active ? "ACTIVE" : "PENDING"', label: "PENDING/ACTIVE projeksiyon" },
      { needle: 'bondStatus: "ACTIVE"', label: "ACTIVE projeksiyon" },
    ],
  },
  {
    file: "app/api/_gone/[...path]/route.ts",
    must: [
      { needle: "frozenRoomGone", label: "donmuş oda 410" },
    ],
    mustNot: [
      { needle: "parsed.data.guardianUserId", label: "profil yazımında guardianUserId yok" },
      { needle: "consentJuniorProfile", label: "eski tek taraflı consent yok" },
    ],
  },
  {
    file: "archived/prisma/schema/junior.prisma",
    must: [
      { needle: "model GuardianInviteToken", label: "GuardianInviteToken modeli" },
      { needle: '@@map("junior_guardian_invites")', label: "davet tablosu" },
      { needle: "tokenHash", label: "hash kolonu" },
      { needle: "guardianUserId    String?", label: "nullable guardian" },
    ],
    mustNot: [
      { needle: "plaintext", label: "ham token kolonu yok" },
    ],
  },
  {
    file: "archived/components/junior/profile-form.tsx",
    must: [
      { needle: "dateOfBirth", label: "doğum tarihi alanı" },
    ],
    mustNot: [
      { needle: "guardianUserId", label: "formda rastgele guardian yok" },
    ],
  },
  {
    file: "archived/lib/junior/prisma-store.ts",
    must: [
      { needle: "consumePendingInvite", label: "Prisma atomik tüketim" },
      { needle: 'status: "PENDING", expiresAt: { gt: now }', label: "TTL + PENDING kilidi" },
    ],
  },
  {
    file: "tests/junior/guardianship.test.ts",
    must: [
      { needle: "guardianUserId: VICTIM", label: "rastgele iddia senaryosu" },
      { needle: "JUNIOR_INVITE_INVALID", label: "geçersiz/süreli token" },
      { needle: "JUNIOR_GUARDIAN_INVITE_TTL_MS", label: "TTL testi" },
      { needle: "Ebeveyn onayı", label: "harçlık askı testi" },
      { needle: "JUNIOR_PRODUCTION_LOCKED_ERROR", label: "Faz 1 üretim kilidi" },
      { needle: "projectGuardianWard", label: "maske testi" },
      { needle: "Junior profili ebeveyn vekâleti olamaz", label: "çocuk-çocuk bağ yasağı" },
    ],
  },
];

const REQUIRED_FILES = [
  "tests/junior/guardianship.test.ts",
  "tests/junior/guardianship-seals-surface.test.ts",
  "archived/lib/junior/invite-token.ts",
  "archived/lib/junior/project.ts",
  "app/api/_gone/[...path]/route.ts",
  "prisma/migrations/20260819020000_junior_guardian_invites/migration.sql",
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
    issues.push(`${file}: zorunlu vekâlet testi/kaynak yok`);
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
  const seal = scripts["verify:junior-guardianship-seals"] ?? "";
  if (!seal.includes("scripts/verify-junior-guardianship-seals.ts")) {
    issues.push(
      "package.json verify:junior-guardianship-seals: scripts/verify-junior-guardianship-seals.ts hedefi yok",
    );
  }
  if (!seal.includes("tests/junior/guardianship.test.ts")) {
    issues.push("package.json verify:junior-guardianship-seals: vekâlet vitest yok");
  }
  if (prebuild.includes("verify:junior-guardianship-seals")) {
    issues.push(
      "package.json verify:prebuild: junior-guardianship 410 envanteridir; canlı prebuild'e girmez",
    );
  }
  if (nightly.includes("verify:junior-guardianship-seals")) {
    issues.push(
      "package.json verify:nightly: junior-guardianship canlı ürün yeşili değildir; test:frozen / elle",
    );
  }
}

if (issues.length > 0) {
  console.error(
    ["verify:junior-guardianship-seals BAŞARISIZ:", ...issues.map((row) => `  ✗ ${row}`)].join(
      "\n",
    ),
  );
  process.exit(1);
}

console.log(
  "verify:junior-guardianship-seals OK — rastgele guardianUserId yok, TTL hash davet, iki taraflı onay olmadan harçlık yok.",
);
