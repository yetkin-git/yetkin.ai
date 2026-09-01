import type { AcademyLessonDraft } from "@/lib/academy/curricula/types";
import { PYTHON_TEMEL_LESSONS } from "@/lib/academy/curricula/python-temel";
import { PYTHON_ORTA_LESSONS } from "@/lib/academy/curricula/python-orta";
import { PYTHON_ILERI_LESSONS } from "@/lib/academy/curricula/python-ileri";
import { FULLSTACK_TEMEL_LESSONS } from "@/lib/academy/curricula/fullstack-temel";
import { FULLSTACK_ORTA_LESSONS } from "@/lib/academy/curricula/fullstack-orta";
import { FULLSTACK_ILERI_LESSONS } from "@/lib/academy/curricula/fullstack-ileri";
import { AI_AGENT_TEMEL_LESSONS } from "@/lib/academy/curricula/ai-agent-temel";
import { AI_AGENT_ORTA_LESSONS } from "@/lib/academy/curricula/ai-agent-orta";
import { AI_AGENT_ILERI_LESSONS } from "@/lib/academy/curricula/ai-agent-ileri";
import { AI_TEMEL_LESSONS } from "@/lib/academy/curricula/ai-temel";
import { UX_TEMEL_LESSONS } from "@/lib/academy/curricula/ux-temel";
import { SECURITY_TEMEL_LESSONS } from "@/lib/academy/curricula/security-temel";
import { SECURITY_ORTA_LESSONS } from "@/lib/academy/curricula/security-orta";
import { SECURITY_ILERI_LESSONS } from "@/lib/academy/curricula/security-ileri";
import { EXCEL_MASTERCLASS_LESSONS } from "@/lib/academy/curricula/excel-masterclass";
import { GOOGLE_ADS_MASTERCLASS_LESSONS } from "@/lib/academy/curricula/google-ads-masterclass";
import { META_ADS_MASTERCLASS_LESSONS } from "@/lib/academy/curricula/meta-ads-masterclass";
import { ETICARET_MASTERCLASS_LESSONS } from "@/lib/academy/curricula/eticaret-masterclass";
import { CANVA_MASTERCLASS_LESSONS } from "@/lib/academy/curricula/canva-masterclass";
import { LINKEDIN_MASTERCLASS_LESSONS } from "@/lib/academy/curricula/linkedin-masterclass";

export {
  academyCompactLessonDraft,
  academyDialogueSpeakerDisplayName,
  academyDialogueSpeakerIdFromDisplayName,
  academyFiveActLessonDraft,
  academyInstructorApplication,
  academyInstructorIntro,
  academyInstructorLessonDraft,
  academyInstructorProblem,
  academyInstructorSummary,
  academyLessonDraft,
  academyLessonDraftWithStudio,
  dialogueTurn,
  DIALOGUE_SPEAKER_DISPLAY,
  isAcademyInstructorSpeaker,
} from "@/lib/academy/curricula/types";
export type {
  AcademyFiveActDialogue,
  AcademyFourActInstructor,
  AcademyLessonDraft,
  DialogueSpeakerId,
  DialogueTurn,
} from "@/lib/academy/curricula/types";
export {
  PYTHON_TEMEL_EXAM_QUESTIONS,
  PYTHON_TEMEL_LESSONS,
} from "@/lib/academy/curricula/python-temel";
export {
  PYTHON_ORTA_EXAM_QUESTIONS,
  PYTHON_ORTA_LESSONS,
} from "@/lib/academy/curricula/python-orta";
export {
  PYTHON_ILERI_EXAM_QUESTIONS,
  PYTHON_ILERI_LESSONS,
} from "@/lib/academy/curricula/python-ileri";
export {
  AI_AGENT_TEMEL_EXAM_QUESTIONS,
  AI_AGENT_TEMEL_LESSONS,
} from "@/lib/academy/curricula/ai-agent-temel";
export {
  AI_AGENT_ORTA_EXAM_QUESTIONS,
  AI_AGENT_ORTA_LESSONS,
} from "@/lib/academy/curricula/ai-agent-orta";
export {
  AI_AGENT_ILERI_EXAM_QUESTIONS,
  AI_AGENT_ILERI_LESSONS,
} from "@/lib/academy/curricula/ai-agent-ileri";
export {
  FULLSTACK_TEMEL_EXAM_QUESTIONS,
  FULLSTACK_TEMEL_LESSONS,
} from "@/lib/academy/curricula/fullstack-temel";
export {
  FULLSTACK_ORTA_EXAM_QUESTIONS,
  FULLSTACK_ORTA_LESSONS,
} from "@/lib/academy/curricula/fullstack-orta";
export {
  FULLSTACK_ILERI_EXAM_QUESTIONS,
  FULLSTACK_ILERI_LESSONS,
} from "@/lib/academy/curricula/fullstack-ileri";
export { AI_TEMEL_LESSONS } from "@/lib/academy/curricula/ai-temel";
export { UX_TEMEL_LESSONS } from "@/lib/academy/curricula/ux-temel";
export {
  SECURITY_TEMEL_EXAM_QUESTIONS,
  SECURITY_TEMEL_LESSONS,
} from "@/lib/academy/curricula/security-temel";
export {
  SECURITY_ORTA_EXAM_QUESTIONS,
  SECURITY_ORTA_LESSONS,
} from "@/lib/academy/curricula/security-orta";
export {
  SECURITY_ILERI_EXAM_QUESTIONS,
  SECURITY_ILERI_LESSONS,
} from "@/lib/academy/curricula/security-ileri";
export {
  EXCEL_MASTERCLASS_EXAM_QUESTIONS,
  EXCEL_MASTERCLASS_LESSONS,
} from "@/lib/academy/curricula/excel-masterclass";
export {
  GOOGLE_ADS_MASTERCLASS_EXAM_QUESTIONS,
  GOOGLE_ADS_MASTERCLASS_LESSONS,
} from "@/lib/academy/curricula/google-ads-masterclass";
export {
  META_ADS_MASTERCLASS_EXAM_QUESTIONS,
  META_ADS_MASTERCLASS_LESSONS,
} from "@/lib/academy/curricula/meta-ads-masterclass";
export {
  ETICARET_MASTERCLASS_EXAM_QUESTIONS,
  ETICARET_MASTERCLASS_LESSONS,
} from "@/lib/academy/curricula/eticaret-masterclass";
export {
  CANVA_MASTERCLASS_EXAM_QUESTIONS,
  CANVA_MASTERCLASS_LESSONS,
} from "@/lib/academy/curricula/canva-masterclass";
export {
  LINKEDIN_MASTERCLASS_EXAM_QUESTIONS,
  LINKEDIN_MASTERCLASS_LESSONS,
} from "@/lib/academy/curricula/linkedin-masterclass";

export const CURRICULUM_DRAFTS_BY_SLUG: Record<string, readonly AcademyLessonDraft[]> = {
  "ai-agent-temel": AI_AGENT_TEMEL_LESSONS,
  "ai-agent-orta": AI_AGENT_ORTA_LESSONS,
  "ai-agent-ileri": AI_AGENT_ILERI_LESSONS,
  "python-temel": PYTHON_TEMEL_LESSONS,
  "python-orta": PYTHON_ORTA_LESSONS,
  "python-ileri": PYTHON_ILERI_LESSONS,
  "fullstack-temel": FULLSTACK_TEMEL_LESSONS,
  "fullstack-orta": FULLSTACK_ORTA_LESSONS,
  "fullstack-ileri": FULLSTACK_ILERI_LESSONS,
  "ai-temel": AI_TEMEL_LESSONS,
  "ux-temel": UX_TEMEL_LESSONS,
  "security-temel": SECURITY_TEMEL_LESSONS,
  "security-orta": SECURITY_ORTA_LESSONS,
  "security-ileri": SECURITY_ILERI_LESSONS,
  "excel-masterclass": EXCEL_MASTERCLASS_LESSONS,
  "google-ads-masterclass": GOOGLE_ADS_MASTERCLASS_LESSONS,
  "meta-ads-masterclass": META_ADS_MASTERCLASS_LESSONS,
  "eticaret-masterclass": ETICARET_MASTERCLASS_LESSONS,
  "canva-masterclass": CANVA_MASTERCLASS_LESSONS,
  "linkedin-masterclass": LINKEDIN_MASTERCLASS_LESSONS,
};
