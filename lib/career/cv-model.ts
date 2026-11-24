/** Yapılandırılmış CareerCv sözleşmesi. XSS yok; HTML basılmaz. */

export const CAREER_CV_SUMMARY_MAX = 4000 as const;
export const CAREER_CV_NAME_MAX = 120 as const;
export const CAREER_CV_HEADLINE_MAX = 200 as const;
export const CAREER_CV_CITY_MAX = 40 as const;
export const CAREER_CV_LIST_MAX = 20 as const;
export const CAREER_CV_SKILL_MAX = 40 as const;

export type CareerCvExperience = {
  title: string;
  company: string;
  period: string;
  detail: string;
};

export type CareerCvEducation = {
  school: string;
  degree: string;
  period: string;
};

export type CareerCvLink = {
  label: string;
  url: string;
};

export type CareerCvLanguage = {
  name: string;
  level: string;
};

export type CareerCvDraft = {
  fullName: string;
  headline: string;
  city: string;
  summary: string;
  experiences: CareerCvExperience[];
  educations: CareerCvEducation[];
  skills: string[];
  languages: CareerCvLanguage[];
  links: CareerCvLink[];
  contactOptIn: boolean;
};

export type CareerCvView = CareerCvDraft & {
  updatedAt: string | null;
  contactOptInAt: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function clip(raw: string, max: number): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, max);
}

function readExperiences(value: unknown): CareerCvExperience[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const rows: CareerCvExperience[] = [];
  for (const item of value.slice(0, CAREER_CV_LIST_MAX)) {
    if (!isRecord(item)) {
      continue;
    }
    rows.push({
      title: clip(typeof item.title === "string" ? item.title : "", 120),
      company: clip(typeof item.company === "string" ? item.company : "", 120),
      period: clip(typeof item.period === "string" ? item.period : "", 60),
      detail: clip(typeof item.detail === "string" ? item.detail : "", 800),
    });
  }
  return rows;
}

function readEducations(value: unknown): CareerCvEducation[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const rows: CareerCvEducation[] = [];
  for (const item of value.slice(0, CAREER_CV_LIST_MAX)) {
    if (!isRecord(item)) {
      continue;
    }
    rows.push({
      school: clip(typeof item.school === "string" ? item.school : "", 120),
      degree: clip(typeof item.degree === "string" ? item.degree : "", 120),
      period: clip(typeof item.period === "string" ? item.period : "", 60),
    });
  }
  return rows;
}

function readSkills(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const skills: string[] = [];
  for (const item of value.slice(0, CAREER_CV_SKILL_MAX)) {
    if (typeof item !== "string") {
      continue;
    }
    const skill = clip(item, 40);
    if (skill && !skills.includes(skill)) {
      skills.push(skill);
    }
  }
  return skills;
}

function readLanguages(value: unknown): CareerCvLanguage[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const rows: CareerCvLanguage[] = [];
  for (const item of value.slice(0, 12)) {
    if (!isRecord(item)) {
      continue;
    }
    const name = clip(typeof item.name === "string" ? item.name : "", 40);
    const level = clip(typeof item.level === "string" ? item.level : "", 40);
    if (name) {
      rows.push({ name, level });
    }
  }
  return rows;
}

function readLinks(value: unknown): CareerCvLink[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const rows: CareerCvLink[] = [];
  for (const item of value.slice(0, 12)) {
    if (!isRecord(item)) {
      continue;
    }
    const label = clip(typeof item.label === "string" ? item.label : "", 60);
    const url = clip(typeof item.url === "string" ? item.url : "", 300);
    if (label && url && /^https?:\/\//i.test(url)) {
      rows.push({ label, url });
    }
  }
  return rows;
}

export function emptyCareerCv(): CareerCvView {
  return {
    fullName: "",
    headline: "",
    city: "",
    summary: "",
    experiences: [],
    educations: [],
    skills: [],
    languages: [],
    links: [],
    contactOptIn: false,
    contactOptInAt: null,
    updatedAt: null,
  };
}

export function parseCareerCvDraft(
  raw: unknown,
): { ok: true; value: CareerCvDraft } | { ok: false; error: string } {
  if (!isRecord(raw)) {
    return { ok: false, error: "İstek gövdesi okunamadı." };
  }
  const fullName = clip(typeof raw.fullName === "string" ? raw.fullName : "", CAREER_CV_NAME_MAX);
  const headline = clip(typeof raw.headline === "string" ? raw.headline : "", CAREER_CV_HEADLINE_MAX);
  const city = clip(typeof raw.city === "string" ? raw.city : "", CAREER_CV_CITY_MAX);
  const summary = clip(typeof raw.summary === "string" ? raw.summary : "", CAREER_CV_SUMMARY_MAX);
  if (fullName.length < 2) {
    return { ok: false, error: "Ad en az 2 karakter olmalı." };
  }
  return {
    ok: true,
    value: {
      fullName,
      headline,
      city,
      summary,
      experiences: readExperiences(raw.experiences),
      educations: readEducations(raw.educations),
      skills: readSkills(raw.skills),
      languages: readLanguages(raw.languages),
      links: readLinks(raw.links),
      contactOptIn: raw.contactOptIn === true,
    },
  };
}

/** AI koç düz metin CV'sini yapılandırılmış taslağa taşır. */
export function careerCvFromCoachText(input: {
  fullName?: string;
  headline?: string;
  city?: string;
  cvText: string;
}): CareerCvDraft {
  return {
    fullName: clip(input.fullName ?? "", CAREER_CV_NAME_MAX) || "Ad Soyad",
    headline: clip(input.headline ?? "", CAREER_CV_HEADLINE_MAX),
    city: clip(input.city ?? "", CAREER_CV_CITY_MAX),
    summary: clip(input.cvText, CAREER_CV_SUMMARY_MAX),
    experiences: [],
    educations: [],
    skills: [],
    languages: [],
    links: [],
    contactOptIn: false,
  };
}
