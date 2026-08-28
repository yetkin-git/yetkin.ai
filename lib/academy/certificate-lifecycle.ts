import type { AcademyCertificateRecord, AcademyStore } from "@/lib/academy/types";
import { BadRequestError, NotFoundError } from "@/lib/kernel/http/errors";

export const ACADEMY_CERTIFICATE_REVOKE_REASON_MIN = 8;
export const ACADEMY_CERTIFICATE_REVOKE_REASON_MAX = 500;

export type RevokeAcademyCertificateCommand = {
  hash: string;
  reason: string;
  now?: Date;
};

export type RevokeAcademyCertificateResult = {
  applied: boolean;
  certificate: AcademyCertificateRecord;
};

/**
 * Sicil iptali. Hash yükü değişmez; iptal ayrı kayıttır.
 * HTTP yüzeyi bu fazda yok — Super Admin hop'u ayrı ADR.
 */
export type AcademyCertificateRevokePort = Pick<
  AcademyStore,
  "getCertificateByHash" | "revokeCertificate"
>;

export async function revokeAcademyCertificate(
  academy: AcademyCertificateRevokePort,
  command: RevokeAcademyCertificateCommand,
): Promise<RevokeAcademyCertificateResult> {
  const reason = command.reason.trim();
  if (
    reason.length < ACADEMY_CERTIFICATE_REVOKE_REASON_MIN ||
    reason.length > ACADEMY_CERTIFICATE_REVOKE_REASON_MAX
  ) {
    throw new BadRequestError("İptal gerekçesi geçersiz.");
  }
  const certificate = await academy.getCertificateByHash(command.hash);
  if (!certificate) {
    throw new NotFoundError("Sertifika bulunamadı.");
  }
  if (certificate.revokedAt) {
    return { applied: false, certificate };
  }
  const now = command.now ?? new Date();
  const revoked = await academy.revokeCertificate(certificate.id, {
    revokedAt: now,
    revokeReason: reason,
  });
  return { applied: true, certificate: revoked };
}
