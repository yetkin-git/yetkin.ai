import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { resolvePublicAcademyCertificate } from "@/lib/academy/certificate-verify";
import { academyCurriculumSealForSlug } from "@/lib/academy/curriculum";
import { computeAcademyCertificateHash } from "@/lib/academy/exam";
import { insertLabCitizen, labUserId, withLabPg } from "../helpers/pg-lab";
import {
  createPgAcademyRevokePort,
  runOperatorCertificateRevoke,
} from "../../scripts/ops-revoke-academy-certificate-lib";

describe("operatör iptal betiği — Postgres, HTTP yok", () => {
  it("hash + gerekçe applied=true; ikinci çağrı applied=false; kamu revoked", async () => {
    const userId = labUserId("revoke-ops");
    const issuedAt = new Date("2026-08-20T00:00:00.000Z");
    const attemptId = randomUUID();
    const purchaseId = randomUUID();
    const certId = randomUUID();
    const curriculumSeal = academyCurriculumSealForSlug("python-temel");
    expect(curriculumSeal).toMatch(/^[a-f0-9]{64}$/);
    const hash = computeAcademyCertificateHash({
      userId,
      courseId: "ac_rail_temel",
      attemptId,
      score: 100,
      issuedAt,
      curriculumSeal: curriculumSeal!,
    });
    await insertLabCitizen({ id: userId, email: `revoke-${userId}@lab.rail` });

    await withLabPg(async (client) => {
      const exam = await client.query<{ id: string }>(
        `SELECT id FROM academy_exams WHERE course_id = 'ac_rail_temel' LIMIT 1`,
      );
      expect(exam.rows[0]?.id).toBeTruthy();
      await client.query(
        `INSERT INTO academy_purchases
           (id, user_id, course_id, price_lock_id, amount_minor, currency_code, status, settled_at, created_at, updated_at)
         VALUES ($1, $2, 'ac_rail_temel', $3, 25000, 'TRY', 'SETTLED', $4, $4, $4)`,
        [purchaseId, userId, randomUUID(), issuedAt],
      );
      await client.query(
        `INSERT INTO academy_exam_attempts
           (id, exam_id, user_id, purchase_id, answers_json, score, passed, status, submitted_at, created_at)
         VALUES ($1, $2, $3, $4, $5, 100, true, 'GRADED', $6, $6)`,
        [attemptId, exam.rows[0]!.id, userId, purchaseId, "[]", issuedAt],
      );
      await client.query(
        `INSERT INTO academy_certificates
           (id, user_id, course_id, purchase_id, attempt_id, title, serial_key, certificate_hash, curriculum_seal, score, issued_at, created_at)
         VALUES ($1, $2, 'ac_rail_temel', $3, $4, 'Rail Temel', $5, $5, $6, 100, $7, $7)`,
        [certId, userId, purchaseId, attemptId, hash, curriculumSeal, issuedAt],
      );

      const port = createPgAcademyRevokePort(client);
      const first = await runOperatorCertificateRevoke(port, {
        hash,
        reason: "saha pilotu sahte belge denemesi",
      });
      expect(first.applied).toBe(true);
      expect(first.certificate.revokedAt).toBeTruthy();
      expect(JSON.stringify(first)).not.toMatch(/@lab\.rail/);

      const second = await runOperatorCertificateRevoke(port, {
        hash,
        reason: "saha pilotu sahte belge denemesi",
      });
      expect(second.applied).toBe(false);

      const publicView = await resolvePublicAcademyCertificate(port, hash);
      expect(publicView.status).toBe("found");
      if (publicView.status === "found") {
        expect(publicView.view.sealStatus).toBe("revoked");
        expect(publicView.view).not.toHaveProperty("userId");
        expect(publicView.view).not.toHaveProperty("learnerId");
      }
    });
  });
});
