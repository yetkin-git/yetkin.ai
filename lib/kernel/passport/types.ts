export const PASSPORT_STAMP_SOURCE_KINDS = [
  "ACADEMY_CERTIFICATE",
  "FREELANCER_RELEASE",
] as const;

export type PassportStampSourceKind = (typeof PASSPORT_STAMP_SOURCE_KINDS)[number];

/** İnce ISO DTO — API / kanıt anahtarı yüzeyi. Sicil satırı `SealedPassportStamp`. */
export type PassportVisaStamp = {
  userId: string;
  visaKey: string;
  moduleId: string;
  issuedAt: string;
};

/** CareerVisaStamp satırının çekirdek projeksiyonu — yazma yok, dikey motor yok. */
export type SealedPassportStamp = {
  id: string;
  userId: string;
  sourceKind: PassportStampSourceKind;
  sourceId: string;
  visaKey: string;
  moduleId: string;
  title: string;
  certificateHash: string | null;
  issuedAt: Date;
  createdAt: Date;
};

export type PassportBoard = {
  stamps: SealedPassportStamp[];
};

/** Pasaport mühür motoru — yüzey `/pasaport`, tip İngilizce (S8-A). */
export const PASSPORT_SURFACE_PATH = "/pasaport" as const;
export const CAREER_STAMP_SURFACE_PATH = "/career" as const;
export const ACADEMY_STAMP_SURFACE_PATH = "/academy" as const;

export function toPassportVisaStamp(stamp: SealedPassportStamp): PassportVisaStamp {
  return {
    userId: stamp.userId,
    visaKey: stamp.visaKey,
    moduleId: stamp.moduleId,
    issuedAt: stamp.issuedAt.toISOString(),
  };
}
