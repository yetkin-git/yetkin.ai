import {
  JUNIOR_ADULT_AGE_YEARS,
  JUNIOR_JURISDICTION,
  JUNIOR_MIN_AGE_YEARS,
  type JuniorAgeVerdict,
} from "@/lib/junior/types";

export const MODULE_ID = "junior" as const;

export type JuniorAgeGate = {
  dateOfBirth: string;
  jurisdiction: typeof JUNIOR_JURISDICTION;
};

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseDateOfBirthIso(dateOfBirthIso: string): Date {
  const match = ISO_DATE.exec(dateOfBirthIso.trim());
  if (!match) {
    throw new Error("Geçersiz doğum tarihi.");
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const dob = new Date(Date.UTC(year, month - 1, day));
  if (
    Number.isNaN(dob.getTime()) ||
    dob.getUTCFullYear() !== year ||
    dob.getUTCMonth() !== month - 1 ||
    dob.getUTCDate() !== day
  ) {
    throw new Error("Geçersiz doğum tarihi.");
  }
  return dob;
}

export function yearsCompletedInTurkey(dateOfBirthIso: string, now = new Date()): number {
  const dob = parseDateOfBirthIso(dateOfBirthIso);
  if (now.getTime() < dob.getTime()) {
    throw new Error("Doğum tarihi gelecekte olamaz.");
  }
  let years = now.getUTCFullYear() - dob.getUTCFullYear();
  const anniversary = new Date(
    Date.UTC(dob.getUTCFullYear() + years, dob.getUTCMonth(), dob.getUTCDate()),
  );
  if (now.getTime() < anniversary.getTime()) {
    years -= 1;
  }
  return years;
}

/** TR yaş kapısı — harçlık yetişkin Wallet ile aynı risk sınıfında değildir (S1-A). */
export function isAdultInTurkey(dateOfBirthIso: string, now = new Date()): boolean {
  const dob = parseDateOfBirthIso(dateOfBirthIso);
  const eighteenth = new Date(
    Date.UTC(dob.getUTCFullYear() + JUNIOR_ADULT_AGE_YEARS, dob.getUTCMonth(), dob.getUTCDate()),
  );
  return now.getTime() >= eighteenth.getTime();
}

export function evaluateJuniorAge(dateOfBirthIso: string, now = new Date()): JuniorAgeVerdict {
  const years = yearsCompletedInTurkey(dateOfBirthIso, now);
  const isAdult = isAdultInTurkey(dateOfBirthIso, now);
  return {
    dateOfBirth: dateOfBirthIso.trim(),
    years,
    isAdult,
    isEligibleMinor: !isAdult && years >= JUNIOR_MIN_AGE_YEARS,
  };
}

export function assertEligibleJuniorMinor(dateOfBirthIso: string, now = new Date()): JuniorAgeVerdict {
  const verdict = evaluateJuniorAge(dateOfBirthIso, now);
  if (verdict.isAdult) {
    throw new Error("Junior 18 yaş altı alandır.");
  }
  if (!verdict.isEligibleMinor) {
    throw new Error("Junior MEB alanı 10 yaş ve üzeri içindir.");
  }
  return verdict;
}

export function assertGuardianIsNotChild(childUserId: string, guardianUserId: string): void {
  if (!guardianUserId.trim()) {
    throw new Error("Ebeveyn vekâleti zorunludur.");
  }
  if (childUserId === guardianUserId) {
    throw new Error("Ebeveyn vekâleti kendi hesabına bağlanamaz.");
  }
}
