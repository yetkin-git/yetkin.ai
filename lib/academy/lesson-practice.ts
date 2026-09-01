/**
 * Ders pratikleri — müfredat laboratuvarı (vitrin SKU listesinden bağımsız).
 */

import type { AcademyLessonPractice } from "@/lib/academy/lesson-body";
import { PYTHON_PATHWAY_PRACTICE } from "@/lib/academy/lesson-practice-python";
import { AI_AGENT_ILERI_PRACTICE, AI_AGENT_ORTA_PRACTICE, AI_AGENT_TEMEL_PRACTICE } from "@/lib/academy/lesson-practice-ai-agent";
import { FULLSTACK_ILERI_PRACTICE, FULLSTACK_ORTA_PRACTICE, FULLSTACK_TEMEL_PRACTICE } from "@/lib/academy/lesson-practice-fullstack";
import { SECURITY_ILERI_PRACTICE, SECURITY_ORTA_PRACTICE, SECURITY_TEMEL_PRACTICE } from "@/lib/academy/lesson-practice-security";
import { EXCEL_MASTERCLASS_PRACTICE } from "@/lib/academy/lesson-practice-excel";
import { GOOGLE_ADS_MASTERCLASS_PRACTICE } from "@/lib/academy/lesson-practice-google-ads";
import { META_ADS_MASTERCLASS_PRACTICE } from "@/lib/academy/lesson-practice-meta-ads";
import { ETICARET_MASTERCLASS_PRACTICE } from "@/lib/academy/lesson-practice-eticaret";
import { CANVA_MASTERCLASS_PRACTICE } from "@/lib/academy/lesson-practice-canva";
import { LINKEDIN_MASTERCLASS_PRACTICE } from "@/lib/academy/lesson-practice-linkedin";
import { ACADEMY_GROWTH_LESSON_PRACTICE } from "@/lib/academy/lesson-practice-growth";

const CURRICULUM_PRACTICE_PREFIXES = [
  "ai-agent-temel-",
  "ai-agent-orta-",
  "ai-agent-ileri-",
  "python-temel-",
  "python-orta-",
  "python-ileri-",
  "fullstack-temel-",
  "fullstack-orta-",
  "fullstack-ileri-",
  "security-temel-",
  "security-orta-",
  "security-ileri-",
  "ai-temel-",
  "ux-temel-",
  "excel-masterclass-",
  "google-ads-masterclass-",
  "meta-ads-masterclass-",
  "eticaret-masterclass-",
  "canva-masterclass-",
  "linkedin-masterclass-",
] as const;

export const LESSON_PRACTICE: Record<string, AcademyLessonPractice> = Object.fromEntries(
  [
    ...Object.entries(PYTHON_PATHWAY_PRACTICE),
    ...Object.entries(AI_AGENT_TEMEL_PRACTICE),
    ...Object.entries(AI_AGENT_ORTA_PRACTICE),
    ...Object.entries(AI_AGENT_ILERI_PRACTICE),
    ...Object.entries(FULLSTACK_TEMEL_PRACTICE),
    ...Object.entries(FULLSTACK_ORTA_PRACTICE),
    ...Object.entries(FULLSTACK_ILERI_PRACTICE),
    ...Object.entries(SECURITY_TEMEL_PRACTICE),
    ...Object.entries(SECURITY_ORTA_PRACTICE),
    ...Object.entries(SECURITY_ILERI_PRACTICE),
    ...Object.entries(EXCEL_MASTERCLASS_PRACTICE),
    ...Object.entries(GOOGLE_ADS_MASTERCLASS_PRACTICE),
    ...Object.entries(META_ADS_MASTERCLASS_PRACTICE),
    ...Object.entries(ETICARET_MASTERCLASS_PRACTICE),
    ...Object.entries(CANVA_MASTERCLASS_PRACTICE),
    ...Object.entries(LINKEDIN_MASTERCLASS_PRACTICE),
    ...Object.entries(ACADEMY_GROWTH_LESSON_PRACTICE),
  ].filter(([key]) => CURRICULUM_PRACTICE_PREFIXES.some((prefix) => key.startsWith(prefix))),
);
