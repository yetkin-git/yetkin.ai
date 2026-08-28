import { parseSha256Hex } from "@/lib/kernel/crypto/sha256";
import {
  ACADEMY_STAMP_SURFACE_PATH,
  FREELANCER_CONTRACT_SURFACE_PATH,
  type PassportStampSourceKind,
  type SealedPassportStamp,
} from "@/lib/kernel/passport/types";

export const PASSPORT_UNSET_LABEL = "Henüz mühür yok" as const;
export const PASSPORT_DEFAULT_LOCALE = "tr-TR" as const;
export const PASSPORT_DEFAULT_TIME_ZONE = "Europe/Istanbul" as const;

const SOURCE_LABEL: Record<PassportStampSourceKind, string> = {
  ACADEMY_CERTIFICATE: "Akademi sertifikası",
  FREELANCER_RELEASE: "Freelancer teslim mührü",
};

const MODULE_LABEL: Record<string, string> = {
  academy: "Akademi",
  freelancer: "Freelancer",
  career: "Kariyer",
};

export function passportSourceLabel(kind: PassportStampSourceKind): string {
  return SOURCE_LABEL[kind];
}

export function passportModuleLabel(moduleId: string): string {
  return MODULE_LABEL[moduleId] ?? moduleId;
}

export function formatPassportIssuedAt(issuedAt: Date, timeZone: string = PASSPORT_DEFAULT_TIME_ZONE): string {
  try {
    return issuedAt.toLocaleString(PASSPORT_DEFAULT_LOCALE, {
      timeZone,
      dateStyle: "long",
      timeStyle: "short",
    });
  } catch {
    return issuedAt.toLocaleString(PASSPORT_DEFAULT_LOCALE, {
      timeZone: PASSPORT_DEFAULT_TIME_ZONE,
      dateStyle: "long",
      timeStyle: "short",
    });
  }
}

export function countPassportSourceKinds(stamps: readonly SealedPassportStamp[]): number {
  return new Set(stamps.map((stamp) => stamp.sourceKind)).size;
}

export function latestPassportStamp(
  stamps: readonly SealedPassportStamp[],
): SealedPassportStamp | null {
  return stamps[0] ?? null;
}

/** Akademi SHA256 mührü için kamu doğrulama yolu. Geçersiz hex'te null — uydurma link yok. */
export function passportAcademyVerifyHref(
  stamp: Pick<SealedPassportStamp, "sourceKind" | "certificateHash">,
): string | null {
  if (stamp.sourceKind !== "ACADEMY_CERTIFICATE") {
    return null;
  }
  const hash = stamp.certificateHash ? parseSha256Hex(stamp.certificateHash) : null;
  if (!hash) {
    return null;
  }
  return `${ACADEMY_STAMP_SURFACE_PATH}/dogrula/${hash}`;
}

/** Freelancer teslim mührü → sözleşme detayı. Boş sourceId'de null — uydurma link yok. */
export function passportFreelancerContractHref(
  stamp: Pick<SealedPassportStamp, "sourceKind" | "sourceId">,
): string | null {
  if (stamp.sourceKind !== "FREELANCER_RELEASE") {
    return null;
  }
  const id = stamp.sourceId.trim();
  if (!id) {
    return null;
  }
  return `${FREELANCER_CONTRACT_SURFACE_PATH}/${id}`;
}
