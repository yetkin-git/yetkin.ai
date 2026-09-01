import type { AcademyExamQuestion } from "@/lib/academy/types";
import { ACADEMY_PILOT_SKU_SLUG } from "@/lib/academy/pilot-sku";
import { PYTHON_TEMEL_EXAM_QUESTIONS } from "@/lib/academy/curricula/python-temel";
import { PYTHON_ORTA_EXAM_QUESTIONS } from "@/lib/academy/curricula/python-orta";
import { PYTHON_ILERI_EXAM_QUESTIONS } from "@/lib/academy/curricula/python-ileri";
import { AI_AGENT_TEMEL_EXAM_QUESTIONS } from "@/lib/academy/curricula/ai-agent-temel";
import { AI_AGENT_ORTA_EXAM_QUESTIONS } from "@/lib/academy/curricula/ai-agent-orta";
import { AI_AGENT_ILERI_EXAM_QUESTIONS } from "@/lib/academy/curricula/ai-agent-ileri";
import { FULLSTACK_TEMEL_EXAM_QUESTIONS } from "@/lib/academy/curricula/fullstack-temel";
import { FULLSTACK_ORTA_EXAM_QUESTIONS } from "@/lib/academy/curricula/fullstack-orta";
import { FULLSTACK_ILERI_EXAM_QUESTIONS } from "@/lib/academy/curricula/fullstack-ileri";
import { SECURITY_TEMEL_EXAM_QUESTIONS } from "@/lib/academy/curricula/security-temel";
import { SECURITY_ORTA_EXAM_QUESTIONS } from "@/lib/academy/curricula/security-orta";
import { SECURITY_ILERI_EXAM_QUESTIONS } from "@/lib/academy/curricula/security-ileri";
import { EXCEL_MASTERCLASS_EXAM_QUESTIONS } from "@/lib/academy/curricula/excel-masterclass";
import { GOOGLE_ADS_MASTERCLASS_EXAM_QUESTIONS } from "@/lib/academy/curricula/google-ads-masterclass";
import { META_ADS_MASTERCLASS_EXAM_QUESTIONS } from "@/lib/academy/curricula/meta-ads-masterclass";
import { ETICARET_MASTERCLASS_EXAM_QUESTIONS } from "@/lib/academy/curricula/eticaret-masterclass";
import { CANVA_MASTERCLASS_EXAM_QUESTIONS } from "@/lib/academy/curricula/canva-masterclass";
import { LINKEDIN_MASTERCLASS_EXAM_QUESTIONS } from "@/lib/academy/curricula/linkedin-masterclass";
import { AI_TEMEL_QUESTIONS, UX_TEMEL_QUESTIONS } from "@/lib/academy/exam-pools-growth";

/** Amiral Ders (Pilot SKU) sınav havuzu — ders quiz’i + sentez. */
export const PYTHON_TEMEL_QUESTIONS: AcademyExamQuestion[] = PYTHON_TEMEL_EXAM_QUESTIONS;

export const PYTHON_ORTA_QUESTIONS: AcademyExamQuestion[] = PYTHON_ORTA_EXAM_QUESTIONS;

export const PYTHON_ILERI_QUESTIONS: AcademyExamQuestion[] = PYTHON_ILERI_EXAM_QUESTIONS;

export const AI_AGENT_TEMEL_QUESTIONS: AcademyExamQuestion[] = AI_AGENT_TEMEL_EXAM_QUESTIONS;

export const AI_AGENT_ORTA_QUESTIONS: AcademyExamQuestion[] = AI_AGENT_ORTA_EXAM_QUESTIONS;

export const AI_AGENT_ILERI_QUESTIONS: AcademyExamQuestion[] = AI_AGENT_ILERI_EXAM_QUESTIONS;

export const FULLSTACK_TEMEL_QUESTIONS: AcademyExamQuestion[] = FULLSTACK_TEMEL_EXAM_QUESTIONS;

export const FULLSTACK_ORTA_QUESTIONS: AcademyExamQuestion[] = FULLSTACK_ORTA_EXAM_QUESTIONS;

export const FULLSTACK_ILERI_QUESTIONS: AcademyExamQuestion[] = FULLSTACK_ILERI_EXAM_QUESTIONS;

export const SECURITY_TEMEL_QUESTIONS: AcademyExamQuestion[] = SECURITY_TEMEL_EXAM_QUESTIONS;

export const SECURITY_ORTA_QUESTIONS: AcademyExamQuestion[] = SECURITY_ORTA_EXAM_QUESTIONS;

export const SECURITY_ILERI_QUESTIONS: AcademyExamQuestion[] = SECURITY_ILERI_EXAM_QUESTIONS;

export const EXCEL_MASTERCLASS_QUESTIONS: AcademyExamQuestion[] = EXCEL_MASTERCLASS_EXAM_QUESTIONS;

export const GOOGLE_ADS_MASTERCLASS_QUESTIONS: AcademyExamQuestion[] = GOOGLE_ADS_MASTERCLASS_EXAM_QUESTIONS;

export const META_ADS_MASTERCLASS_QUESTIONS: AcademyExamQuestion[] = META_ADS_MASTERCLASS_EXAM_QUESTIONS;

export const ETICARET_MASTERCLASS_QUESTIONS: AcademyExamQuestion[] = ETICARET_MASTERCLASS_EXAM_QUESTIONS;

export const CANVA_MASTERCLASS_QUESTIONS: AcademyExamQuestion[] = CANVA_MASTERCLASS_EXAM_QUESTIONS;

export const LINKEDIN_MASTERCLASS_QUESTIONS: AcademyExamQuestion[] = LINKEDIN_MASTERCLASS_EXAM_QUESTIONS;

const POOL_BY_SLUG: Record<string, readonly AcademyExamQuestion[]> = {
  [ACADEMY_PILOT_SKU_SLUG]: PYTHON_TEMEL_QUESTIONS,
  "python-orta": PYTHON_ORTA_QUESTIONS,
  "python-ileri": PYTHON_ILERI_QUESTIONS,
  "ai-agent-temel": AI_AGENT_TEMEL_QUESTIONS,
  "ai-agent-orta": AI_AGENT_ORTA_QUESTIONS,
  "ai-agent-ileri": AI_AGENT_ILERI_QUESTIONS,
  "fullstack-temel": FULLSTACK_TEMEL_EXAM_QUESTIONS,
  "fullstack-orta": FULLSTACK_ORTA_EXAM_QUESTIONS,
  "fullstack-ileri": FULLSTACK_ILERI_EXAM_QUESTIONS,
  "security-temel": SECURITY_TEMEL_QUESTIONS,
  "security-orta": SECURITY_ORTA_QUESTIONS,
  "security-ileri": SECURITY_ILERI_QUESTIONS,
  "excel-masterclass": EXCEL_MASTERCLASS_QUESTIONS,
  "google-ads-masterclass": GOOGLE_ADS_MASTERCLASS_QUESTIONS,
  "meta-ads-masterclass": META_ADS_MASTERCLASS_QUESTIONS,
  "eticaret-masterclass": ETICARET_MASTERCLASS_QUESTIONS,
  "canva-masterclass": CANVA_MASTERCLASS_QUESTIONS,
  "linkedin-masterclass": LINKEDIN_MASTERCLASS_QUESTIONS,
  "ai-temel": AI_TEMEL_QUESTIONS,
  "ux-temel": UX_TEMEL_QUESTIONS,
};

export function academyExamPoolForSlug(slug: string): AcademyExamQuestion[] {
  return [...(POOL_BY_SLUG[slug] ?? [])];
}
