import type { AcademyLessonDraft } from "@/lib/academy/curricula/types";
import { PYTHON_TEMEL_LESSONS } from "@/lib/academy/curricula/python-temel";
import { FULLSTACK_TEMEL_LESSONS } from "@/lib/academy/curricula/fullstack-temel";
import { AI_TEMEL_LESSONS } from "@/lib/academy/curricula/ai-temel";
import { UX_TEMEL_LESSONS } from "@/lib/academy/curricula/ux-temel";

export type { AcademyLessonDraft } from "@/lib/academy/curricula/types";
export {
  academyCompactLessonDraft,
  academyLessonDraft,
  academyLessonDraftWithStudio,
} from "@/lib/academy/curricula/types";
export { PYTHON_TEMEL_LESSONS } from "@/lib/academy/curricula/python-temel";
export { FULLSTACK_TEMEL_LESSONS } from "@/lib/academy/curricula/fullstack-temel";
export { AI_TEMEL_LESSONS } from "@/lib/academy/curricula/ai-temel";
export { UX_TEMEL_LESSONS } from "@/lib/academy/curricula/ux-temel";

export const CURRICULUM_DRAFTS_BY_SLUG: Record<string, readonly AcademyLessonDraft[]> = {
  "python-temel": PYTHON_TEMEL_LESSONS,
  "fullstack-temel": FULLSTACK_TEMEL_LESSONS,
  "ai-temel": AI_TEMEL_LESSONS,
  "ux-temel": UX_TEMEL_LESSONS,
};
