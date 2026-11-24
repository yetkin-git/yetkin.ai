import "server-only";

import { getPrisma } from "@/lib/kernel/db";

const ANON_NAME = "Anonim aday" as const;
const ANON_EMAIL = "anonim@yetkin.local" as const;
const ANON_SUMMARY = "Kişisel veri KVKK talebiyle silindi." as const;

/**
 * KVKK silme / anonimleştirme.
 * CV, mühür, portföy ve iletişim talepleri silinir.
 * Kurumsal başvurulardaki kişisel alanlar anonimleştirilir (ilan sahibi sıralaması bozulmaz).
 */
export async function eraseCareerPersonalData(userId: string): Promise<{
  cvDeleted: number;
  sealsDeleted: number;
  sittingsDeleted: number;
  portfolioDeleted: number;
  contactsDeleted: number;
  applicationsAnonymized: number;
}> {
  const prisma = getPrisma();
  const [cv, seals, sittings, portfolio, contacts, applications] = await prisma.$transaction([
    prisma.careerCv.deleteMany({ where: { userId } }),
    prisma.yetkinCvSeal.deleteMany({ where: { userId } }),
    prisma.yetkinCvSitting.deleteMany({ where: { userId } }),
    prisma.careerPortfolioItem.deleteMany({ where: { userId } }),
    prisma.careerContactRequest.deleteMany({ where: { talentUserId: userId } }),
    prisma.kurumsalJobApplication.updateMany({
      where: { candidateUserId: userId },
      data: {
        candidateName: ANON_NAME,
        candidateEmail: ANON_EMAIL,
        cvSummary: ANON_SUMMARY,
      },
    }),
  ]);
  return {
    cvDeleted: cv.count,
    sealsDeleted: seals.count,
    sittingsDeleted: sittings.count,
    portfolioDeleted: portfolio.count,
    contactsDeleted: contacts.count,
    applicationsAnonymized: applications.count,
  };
}
