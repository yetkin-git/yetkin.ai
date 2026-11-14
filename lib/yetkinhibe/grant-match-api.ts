import { z } from "zod";

import {
  matchBandForScore,
  type GrantMatchBand,
} from "@/lib/yetkinhibe/match-grants-for-profile";
import type { GrantMatchCriterionResult, GrantMatchResult } from "@/lib/yetkinhibe/types";

/**
 * YetkinHibe ücretsiz eşleştirme (F3b) — istek sözleşmesi ve yanıt haritası.
 * Rota (`POST /api/yetkinhibe/grant/match`) bu modülü kullanır. Profil hiçbir yere yazılmaz.
 *
 * Sözleşmede olmayan alanlar (gelir, bölge, şirket kimliği) reddedilir. Eşleşme kuralı bunları
 * okumaz, bu yüzden toplanmazlar (veri asgarisi). Yanıt öneri metni taşımaz; uyum bandı döner (A5).
 */

/** Gövde üst sınırı (bayt, UTF-8). Geçerli bir profil birkaç yüz bayttır. */
export const GRANT_MATCH_MAX_BODY_BYTES = 8_192;

/**
 * Gövdeyi en fazla `maxBytes` bayt okur. Sınır akış sırasında uygulanır: aşılırsa okuma durur,
 * akış kapatılır ve `null` döner. Büyük gövde bu yüzden tamamen belleğe alınmaz.
 */
export async function readGrantMatchBodyText(
  request: Request,
  maxBytes: number = GRANT_MATCH_MAX_BODY_BYTES,
): Promise<string | null> {
  if (request.body === null) {
    return "";
  }
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

export const grantMatchRequestSchema = z.strictObject({
  sectorCode: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .regex(/^[\p{L}\p{N}-]+$/u)
    .transform((value) => value.toLocaleLowerCase("tr-TR")),
  employeeCount: z.number().int().min(0).max(100_000),
  companyAgeYears: z.number().int().min(0).max(200),
  rdMaturityLevel: z.enum(["NONE", "EARLY", "ESTABLISHED", "ADVANCED"]),
  exportActive: z.boolean(),
  isKobi: z.boolean(),
  hasPatentOrUtilityModel: z.boolean(),
});

export type GrantMatchRequest = z.output<typeof grantMatchRequestSchema>;

export type GrantMatchWire = {
  grantId: string;
  grantTitle: string;
  source: GrantMatchResult["source"];
  matchScorePct: number;
  band: GrantMatchBand;
  remainingDays: number;
  /** Kuruş cinsinden tam sayı (A1). */
  poolAmountMinor: number;
  maxSupportMinor: number;
  criteria: readonly GrantMatchCriterionResult[];
};

export function toGrantMatchWire(result: GrantMatchResult): GrantMatchWire {
  return {
    grantId: result.grantId,
    grantTitle: result.grantTitle,
    source: result.source,
    matchScorePct: result.matchScorePct,
    band: matchBandForScore(result.matchScorePct),
    remainingDays: result.remainingDays,
    poolAmountMinor: result.poolAmountMinor,
    maxSupportMinor: result.maxSupportMinor,
    criteria: result.criteria,
  };
}
