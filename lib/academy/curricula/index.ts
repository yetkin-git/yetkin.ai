import {
  academyCompactLessonDraft,
  type AcademyLessonDraft,
  type CurriculumModule,
} from "@/lib/academy/curricula/types";
import { officeAiMasteryModule } from "@/lib/academy/curricula/office_ai";
import { ecommerceAiMasteryModule } from "@/lib/academy/curricula/ecommerce_ai";
import { socialMediaAiMasteryModule } from "@/lib/academy/curricula/social_media_ai";
import { chatbotNocodeMasteryModule } from "@/lib/academy/curricula/chatbot_nocode";
import { promptPracticeMasteryModule } from "@/lib/academy/curricula/prompt_practice";

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
  academyPreviousLessonBridge,
  dialogueTurn,
  ACADEMY_INSTRUCTOR_SECTION_CLOSE,
  ACADEMY_PREVIOUS_LESSON_RECAP_HEADING,
  DIALOGUE_SPEAKER_DISPLAY,
  isAcademyInstructorSpeaker,
} from "@/lib/academy/curricula/types";
export type {
  AcademyFiveActDialogue,
  AcademyFourActInstructor,
  AcademyLessonDraft,
  CurriculumModule,
  DialogueSpeakerId,
  DialogueTurn,
  Section,
  VoiceConfig,
} from "@/lib/academy/curricula/types";

/**
 * Compact makale müfredatı — `CurriculumModule.sections` → canlı taslak.
 * Diyalog / görsel yuva istemez.
 */
export function compactDraftsFromModule(
  slug: string,
  module: CurriculumModule,
): readonly AcademyLessonDraft[] {
  return module.sections.map((section) =>
    academyCompactLessonDraft(
      `${slug}-${section.sectionNumber}`,
      section.sectionNumber,
      section.title,
      section.contentMarkdown.trim(),
      {
        videoUrl: section.videoUrl ?? module.videoUrl,
        audioUrl: section.audioUrl ?? module.audioUrl,
      },
    ),
  );
}

/**
 * Canlı yayın taslağı — ingest edilmiş compact makaleler.
 * Katman 2–3 master metinler `docs/curriculum/*.md` taslağıdır; buraya basılmaz.
 */
export const CURRICULUM_DRAFTS_BY_SLUG: Record<string, readonly AcademyLessonDraft[]> = {
  "01_office_ai": compactDraftsFromModule("01_office_ai", officeAiMasteryModule),
  "02_ecommerce_ai": compactDraftsFromModule("02_ecommerce_ai", ecommerceAiMasteryModule),
  "03_social_media_ai": compactDraftsFromModule("03_social_media_ai", socialMediaAiMasteryModule),
  "04_chatbot_nocode": compactDraftsFromModule("04_chatbot_nocode", chatbotNocodeMasteryModule),
  "05_prompt_practice": compactDraftsFromModule("05_prompt_practice", promptPracticeMasteryModule),
};
