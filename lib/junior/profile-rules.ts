import { z } from "zod";
import {
  JUNIOR_GUARDIAN_NOTICE,
  JUNIOR_GUARDIAN_YEAR_ERROR,
  JUNIOR_NOTICE_UNSEALED_ERROR,
  JUNIOR_NOTICE_VERSION_ERROR,
  guardianBirthYearBounds,
  isJuniorNoticeUsable,
  type JuniorGuardianNotice,
} from "@/lib/junior/guardian-notice";
import {
  JUNIOR_GRADE_MAX,
  JUNIOR_GRADE_MIN,
  JUNIOR_NICKNAME_MAX,
  JUNIOR_NICKNAME_MIN,
  JUNIOR_PILOT_GRADE,
  JUNIOR_PILOT_SHELF_LINE,
  juniorBirthYearBounds,
} from "@/lib/junior/limits";

const NICKNAME_RE = /^[\p{L}][\p{L}\s]{0,19}$/u;

export const juniorProfileCreateSchema = z
  .object({
    nickname: z.string(),
    grade: z.coerce.number(),
    birthYear: z.coerce.number(),
    consent: z.literal(true),
  })
  .strict();

export const juniorProfileCreateSealedSchema = juniorProfileCreateSchema.extend({
  consentVersion: z.string(),
  guardianBirthYear: z.coerce.number(),
});

export const juniorProfileConsentUpdateSchema = z
  .object({
    profileId: z.string().trim().min(1).max(40),
    consent: z.literal(true),
    consentVersion: z.string(),
    guardianBirthYear: z.coerce.number(),
  })
  .strict();

export const juniorProfileSelectSchema = z
  .object({
    profileId: z.string().trim().min(1).max(40),
  })
  .strict();

export const juniorGradeSwitchSchema = z
  .object({
    profileId: z.string().trim().min(1).max(40),
    grade: z.coerce.number(),
  })
  .strict();

export function normalizeJuniorNickname(raw: string): string | null {
  const nickname = raw.trim().replace(/\s+/g, " ");
  if (nickname.length < JUNIOR_NICKNAME_MIN || nickname.length > JUNIOR_NICKNAME_MAX) {
    return null;
  }
  if (nickname.includes("@") || !NICKNAME_RE.test(nickname)) {
    return null;
  }
  return nickname;
}

function hasVersionField(input: unknown): boolean {
  if (!input || typeof input !== "object") {
    return false;
  }
  return Object.keys(input as Record<string, unknown>).some(
    (key) => key === "consentVersion" || key === "guardianBirthYear",
  );
}

export function juniorGuardianYearError(year: number, now = new Date()): string | null {
  const bounds = guardianBirthYearBounds(now);
  if (!Number.isInteger(year) || year < bounds.min || year > bounds.max) {
    return JUNIOR_GUARDIAN_YEAR_ERROR;
  }
  return null;
}

export function juniorProfileFieldError(
  input: unknown,
  now = new Date(),
  notice: JuniorGuardianNotice | null = JUNIOR_GUARDIAN_NOTICE,
): string | null {
  if (input && typeof input === "object") {
    const keys = Object.keys(input as Record<string, unknown>);
    if (keys.some((key) => /mail|eposta|e-posta|email/i.test(key))) {
      return "Bu formda e-posta yok. Çocuk, veli hesabının altında bir profildir.";
    }
  }
  if (notice && !isJuniorNoticeUsable(notice)) {
    return JUNIOR_NOTICE_VERSION_ERROR;
  }
  if (!notice && hasVersionField(input)) {
    return JUNIOR_NOTICE_UNSEALED_ERROR;
  }
  const parsed = (notice ? juniorProfileCreateSealedSchema : juniorProfileCreateSchema).safeParse(input);
  if (!parsed.success) {
    return notice ? JUNIOR_NOTICE_VERSION_ERROR : "Veli onayı olmadan profil açılmaz.";
  }
  if (notice) {
    const sealed = juniorProfileCreateSealedSchema.parse(input);
    if (sealed.consentVersion !== notice.version) {
      return JUNIOR_NOTICE_VERSION_ERROR;
    }
    const yearError = juniorGuardianYearError(sealed.guardianBirthYear, now);
    if (yearError) {
      return yearError;
    }
  }
  if (!normalizeJuniorNickname(parsed.data.nickname)) {
    return "Takma ad iki ile yirmi harf arasında olsun. E-posta ve rakam yazma.";
  }
  if (
    !Number.isInteger(parsed.data.grade) ||
    parsed.data.grade < JUNIOR_GRADE_MIN ||
    parsed.data.grade > JUNIOR_GRADE_MAX ||
    parsed.data.grade !== JUNIOR_PILOT_GRADE
  ) {
    return JUNIOR_PILOT_SHELF_LINE;
  }
  const bounds = juniorBirthYearBounds(now);
  if (
    !Number.isInteger(parsed.data.birthYear) ||
    parsed.data.birthYear < bounds.min ||
    parsed.data.birthYear > bounds.max
  ) {
    return "Doğum yılı, veli izni gereken yaş aralığında olsun.";
  }
  return null;
}
