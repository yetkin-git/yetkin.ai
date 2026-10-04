import { z } from "zod";
import {
  JUNIOR_GRADE_MAX,
  JUNIOR_GRADE_MIN,
  JUNIOR_NICKNAME_MAX,
  JUNIOR_NICKNAME_MIN,
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

export const juniorProfileSelectSchema = z
  .object({
    profileId: z.string().trim().min(1).max(40),
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

export function juniorProfileFieldError(
  input: unknown,
  now = new Date(),
): string | null {
  if (input && typeof input === "object") {
    const keys = Object.keys(input as Record<string, unknown>);
    if (keys.some((key) => /mail|eposta|e-posta|email/i.test(key))) {
      return "Bu formda e-posta yok. Çocuk, veli hesabının altında bir profildir.";
    }
  }
  const parsed = juniorProfileCreateSchema.safeParse(input);
  if (!parsed.success) {
    return "Veli onayı olmadan profil açılmaz.";
  }
  if (!normalizeJuniorNickname(parsed.data.nickname)) {
    return "Takma ad iki ile yirmi harf arasında olsun. E-posta ve rakam yazma.";
  }
  if (
    !Number.isInteger(parsed.data.grade) ||
    parsed.data.grade < JUNIOR_GRADE_MIN ||
    parsed.data.grade > JUNIOR_GRADE_MAX
  ) {
    return "Sınıf 5 ile 12 arasında olsun.";
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
