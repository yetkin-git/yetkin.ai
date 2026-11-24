#!/usr/bin/env tsx
/**
 * YetkinCV HMAC mührünü sunucuya sormadan doğrular.
 * Kullanım:
 *   npx tsx scripts/verify-career-seal.ts --hash <sha256> --user <id> --sitting <id> \
 *     --role <role> --vertical <vertical> --score <n> --issued <iso> --signature <hex>
 */

import {
  CAREER_SEAL_HMAC_LAB_FALLBACK,
  resolveCareerSealHmacSecret,
  verifyCareerSealHmac,
} from "@/lib/career/seal-hmac";

function arg(name: string): string | null {
  const index = process.argv.indexOf(`--${name}`);
  if (index < 0) {
    return null;
  }
  return process.argv[index + 1] ?? null;
}

const certificateHash = arg("hash");
const userId = arg("user");
const sittingId = arg("sitting");
const roleKey = arg("role");
const verticalKey = arg("vertical");
const scoreRaw = arg("score");
const issuedAt = arg("issued");
const signature = arg("signature");

if (!certificateHash || !userId || !sittingId || !roleKey || !verticalKey || !scoreRaw || !issuedAt) {
  console.error(
    "Eksik argüman. Örnek: --hash --user --sitting --role --vertical --score --issued [--signature]",
  );
  process.exit(1);
}

const score = Number(scoreRaw);
if (!Number.isInteger(score) || score < 0 || score > 100) {
  console.error("score 0..100 tam sayı olmalı.");
  process.exit(1);
}

const secret = resolveCareerSealHmacSecret(process.env);
const result = verifyCareerSealHmac(
  {
    certificateHash,
    userId,
    sittingId,
    roleKey,
    verticalKey,
    score,
    issuedAt,
  },
  signature,
  secret,
);

console.log(
  JSON.stringify(
    {
      hmacPresent: result.present,
      hmacValid: result.valid,
      secretSource:
        (process.env.CAREER_SEAL_HMAC_SECRET?.trim().length ?? 0) >= 16
          ? "CAREER_SEAL_HMAC_SECRET"
          : (process.env.SUPABASE_JWT_SECRET?.trim().length ?? 0) >= 16
            ? "SUPABASE_JWT_SECRET.derive"
            : secret === CAREER_SEAL_HMAC_LAB_FALLBACK
              ? "lab-fallback"
              : "unknown",
    },
    null,
    2,
  ),
);

process.exit(result.valid || !result.present ? 0 : 1);
