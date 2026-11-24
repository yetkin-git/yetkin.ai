import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import type { HibeAnalysisInput } from "@/lib/yetkinhibe/os-brief";

/** Kullanıcı başına tek satır. Sorgu yalnız ön-doldurur; kayıt bu şekildedir. */
export type HibeCompanyProfileWrite = {
  businessName: string;
  audience: HibeAnalysisInput["audience"];
  provinceCode: string;
  naceGroup: string;
  investmentFocus: HibeAnalysisInput["investmentFocus"];
  employeeCount: number;
  companyAgeYears: number;
  rdMaturityLevel: HibeAnalysisInput["rdMaturityLevel"];
  exportActive: boolean;
  hasPatentOrUtilityModel: boolean;
};

export function hibeProfileRecord(input: HibeAnalysisInput): HibeCompanyProfileWrite {
  return {
    businessName: input.businessName,
    audience: input.audience,
    provinceCode: input.provinceCode,
    naceGroup: input.naceGroup,
    investmentFocus: input.investmentFocus,
    employeeCount: input.employeeCount,
    companyAgeYears: input.companyAgeYears,
    rdMaturityLevel: input.rdMaturityLevel,
    exportActive: input.exportActive,
    hasPatentOrUtilityModel: input.hasPatentOrUtilityModel,
  };
}

export async function upsertHibeCompanyProfile(
  userId: string,
  data: HibeCompanyProfileWrite,
): Promise<void> {
  const id = userId.trim();
  if (!id) {
    throw new Error("Profil sahibi yok.");
  }
  await getPrisma().hibeCompanyProfile.upsert({
    where: { userId: id },
    create: { userId: id, ...data },
    update: data,
  });
}

/** Analiz gönderimi. Yazılamazsa sayfa yine açılır; satır uydurulmaz. */
export async function saveHibeCompanyProfile(
  userId: string,
  input: HibeAnalysisInput,
): Promise<boolean> {
  try {
    await upsertHibeCompanyProfile(userId, hibeProfileRecord(input));
    return true;
  } catch {
    return false;
  }
}
