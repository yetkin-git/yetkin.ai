/**
 * Operatör sertifika iptali — HTTP yok. Hash + gerekçe → revokeAcademyCertificate.
 */

import type { Client } from "pg";
import {
  revokeAcademyCertificate,
  type RevokeAcademyCertificateResult,
} from "@/lib/academy/certificate-lifecycle";
import type { AcademyCertificateRecord, AcademyStore } from "@/lib/academy/types";
import { parseAcademyCertificateHash } from "@/lib/academy/exam";

export type AcademyRevokePort = Pick<
  AcademyStore,
  "getCertificateByHash" | "revokeCertificate" | "getCourse"
>;

export type ParsedRevokeArgs = {
  hash: string;
  reason: string;
};

function toCertificate(row: {
  id: string;
  user_id: string;
  course_id: string;
  purchase_id: string;
  attempt_id: string | null;
  title: string;
  serial_key: string;
  certificate_hash: string | null;
  curriculum_seal: string | null;
  score: number | null;
  issued_at: Date;
  revoked_at: Date | null;
  revoke_reason: string | null;
  created_at: Date;
}): AcademyCertificateRecord {
  return {
    id: row.id,
    userId: row.user_id,
    courseId: row.course_id,
    purchaseId: row.purchase_id,
    attemptId: row.attempt_id,
    title: row.title,
    serialKey: row.serial_key,
    certificateHash: row.certificate_hash,
    curriculumSeal: row.curriculum_seal,
    score: row.score,
    issuedAt: row.issued_at,
    revokedAt: row.revoked_at,
    revokeReason: row.revoke_reason,
    createdAt: row.created_at,
  };
}

export function parseRevokeCliArgs(argv: string[]): ParsedRevokeArgs | { error: string } {
  let hash = "";
  let reason = "";
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const next = argv[index + 1];
    if (token === "--hash" && next) {
      hash = next.trim();
      index += 1;
    } else if (token === "--reason" && next) {
      reason = next.trim();
      index += 1;
    } else if (token?.startsWith("--hash=")) {
      hash = token.slice("--hash=".length).trim();
    } else if (token?.startsWith("--reason=")) {
      reason = token.slice("--reason=".length).trim();
    }
  }
  if (!hash) {
    return { error: "--hash gerekli (64 hex). HTTP iptal yok." };
  }
  if (!parseAcademyCertificateHash(hash) && hash.length < 8) {
    return { error: "Hash geçersiz." };
  }
  if (!reason) {
    return { error: "--reason gerekli (8–500 karakter)." };
  }
  return { hash, reason };
}

export function createPgAcademyRevokePort(client: Client): AcademyRevokePort {
  return {
    async getCertificateByHash(hash) {
      const result = await client.query<{
        id: string;
        user_id: string;
        course_id: string;
        purchase_id: string;
        attempt_id: string | null;
        title: string;
        serial_key: string;
        certificate_hash: string | null;
        curriculum_seal: string | null;
        score: number | null;
        issued_at: Date;
        revoked_at: Date | null;
        revoke_reason: string | null;
        created_at: Date;
      }>(
        `SELECT id, user_id, course_id, purchase_id, attempt_id, title, serial_key,
                certificate_hash, curriculum_seal, score, issued_at, revoked_at, revoke_reason, created_at
           FROM academy_certificates
          WHERE certificate_hash = $1 OR serial_key = $1
          LIMIT 1`,
        [hash],
      );
      const row = result.rows[0];
      return row ? toCertificate(row) : null;
    },
    async revokeCertificate(id, patch) {
      const result = await client.query<{
        id: string;
        user_id: string;
        course_id: string;
        purchase_id: string;
        attempt_id: string | null;
        title: string;
        serial_key: string;
        certificate_hash: string | null;
        curriculum_seal: string | null;
        score: number | null;
        issued_at: Date;
        revoked_at: Date | null;
        revoke_reason: string | null;
        created_at: Date;
      }>(
        `UPDATE academy_certificates
            SET revoked_at = $2, revoke_reason = $3
          WHERE id = $1
          RETURNING id, user_id, course_id, purchase_id, attempt_id, title, serial_key,
                    certificate_hash, curriculum_seal, score, issued_at, revoked_at, revoke_reason, created_at`,
        [id, patch.revokedAt, patch.revokeReason],
      );
      const row = result.rows[0];
      if (!row) {
        throw new Error("Sertifika güncellenemedi.");
      }
      return toCertificate(row);
    },
    async getCourse(id) {
      const result = await client.query<{
        id: string;
        slug: string;
        title: string;
        summary: string;
        catalog_unit_key: string;
        is_published: boolean;
        created_at: Date;
        updated_at: Date;
      }>(
        `SELECT id, slug, title, summary, catalog_unit_key, is_published, created_at, updated_at
           FROM academy_courses WHERE id = $1`,
        [id],
      );
      const row = result.rows[0];
      if (!row) {
        return null;
      }
      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        summary: row.summary,
        catalogUnitKey: row.catalog_unit_key,
        globalRank: 0,
        localRank: 0,
        trendScore: 0,
        isPublished: row.is_published,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    },
  };
}

export async function runOperatorCertificateRevoke(
  port: AcademyRevokePort,
  command: ParsedRevokeArgs,
): Promise<RevokeAcademyCertificateResult> {
  return revokeAcademyCertificate(port, command);
}
