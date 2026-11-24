import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import {
  emptyCareerCv,
  type CareerCvDraft,
  type CareerCvView,
} from "@/lib/career/cv-model";

function toView(row: {
  fullName: string;
  headline: string;
  city: string;
  summary: string;
  experiences: unknown;
  educations: unknown;
  skills: unknown;
  languages: unknown;
  links: unknown;
  contactOptInAt: Date | null;
  updatedAt: Date;
}): CareerCvView {
  const base = emptyCareerCv();
  return {
    fullName: row.fullName,
    headline: row.headline,
    city: row.city,
    summary: row.summary,
    experiences: Array.isArray(row.experiences) ? (row.experiences as CareerCvView["experiences"]) : base.experiences,
    educations: Array.isArray(row.educations) ? (row.educations as CareerCvView["educations"]) : base.educations,
    skills: Array.isArray(row.skills) ? (row.skills as string[]) : base.skills,
    languages: Array.isArray(row.languages) ? (row.languages as CareerCvView["languages"]) : base.languages,
    links: Array.isArray(row.links) ? (row.links as CareerCvView["links"]) : base.links,
    contactOptIn: row.contactOptInAt != null,
    contactOptInAt: row.contactOptInAt?.toISOString() ?? null,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function loadCareerCv(userId: string): Promise<CareerCvView> {
  const row = await getPrisma().careerCv.findUnique({ where: { userId } });
  return row ? toView(row) : emptyCareerCv();
}

export async function upsertCareerCv(userId: string, draft: CareerCvDraft): Promise<CareerCvView> {
  const now = new Date();
  const existing = await getPrisma().careerCv.findUnique({
    where: { userId },
    select: { contactOptInAt: true },
  });
  let contactOptInAt: Date | null = existing?.contactOptInAt ?? null;
  if (draft.contactOptIn && !contactOptInAt) {
    contactOptInAt = now;
  }
  if (!draft.contactOptIn) {
    contactOptInAt = null;
  }
  const row = await getPrisma().careerCv.upsert({
    where: { userId },
    create: {
      userId,
      fullName: draft.fullName,
      headline: draft.headline,
      city: draft.city,
      summary: draft.summary,
      experiences: draft.experiences,
      educations: draft.educations,
      skills: draft.skills,
      languages: draft.languages,
      links: draft.links,
      contactOptInAt,
    },
    update: {
      fullName: draft.fullName,
      headline: draft.headline,
      city: draft.city,
      summary: draft.summary,
      experiences: draft.experiences,
      educations: draft.educations,
      skills: draft.skills,
      languages: draft.languages,
      links: draft.links,
      contactOptInAt,
    },
  });
  return toView(row);
}

export async function deleteCareerCv(userId: string): Promise<void> {
  await getPrisma().careerCv.deleteMany({ where: { userId } });
}

/** Yayınlı mühür + contactOptInAt açık mı? Kamu vitrin iletişim formu için. */
export async function loadContactOptInForSealHash(certificateHash: string): Promise<boolean> {
  try {
    const seal = await getPrisma().yetkinCvSeal.findUnique({
      where: { certificateHash },
      select: { userId: true, sealedPublication: true },
    });
    if (!seal?.sealedPublication) {
      return false;
    }
    const cv = await getPrisma().careerCv.findUnique({
      where: { userId: seal.userId },
      select: { contactOptInAt: true },
    });
    return cv?.contactOptInAt != null;
  } catch {
    return false;
  }
}
