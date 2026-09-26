/**
 * Faz 2 gömülmeye hazır taslak kayıt.
 * Canlı müfredat (`curriculum.ts`, `curricula/index.ts`) bu dosyayı import etmez.
 * Taslak gövdedeki bir hata canlı OFF-101 yüklemesini kesmez.
 * Oynatıcı `CURRICULUM_DRAFTS_BY_SLUG` üzerinden bu diziyi okumaz.
 * Ses, vitrin ve sınav sorusu bu kayıtta yoktur.
 */

import {
  CURRICULUM_DRAFTS_BY_SLUG,
  compactDraftsFromModule,
  type AcademyLessonDraft,
} from "@/lib/academy/curricula";
import {
  CURRICULUM_LESSON_COUNT_BY_SLUG,
  PHASE2_DRAFT_LESSON_KEYS_BY_SLUG,
} from "@/lib/academy/curricula/lesson-index";
import { parentTeacherAiModule } from "@/lib/academy/curricula/parent_teacher_ai";

export const PHASE2_CURRICULUM_DRAFTS_BY_SLUG: Readonly<Record<string, readonly AcademyLessonDraft[]>> = {
  parent_teacher_ai: compactDraftsFromModule("parent_teacher_ai", parentTeacherAiModule),
};

export function assertPhase2DraftRegistryAligned(): void {
  const indexSlugs = Object.keys(PHASE2_DRAFT_LESSON_KEYS_BY_SLUG).sort();
  const draftSlugs = Object.keys(PHASE2_CURRICULUM_DRAFTS_BY_SLUG).sort();
  if (indexSlugs.join("\n") !== draftSlugs.join("\n")) {
    throw new Error("Faz 2 taslak slug listesi lesson-index ile örtüşmüyor.");
  }
  for (const slug of indexSlugs) {
    if (slug in CURRICULUM_LESSON_COUNT_BY_SLUG) {
      throw new Error(`Faz 2 taslağı canlı ders sayacına giremez: ${slug}`);
    }
    if (slug in CURRICULUM_DRAFTS_BY_SLUG) {
      throw new Error(`Faz 2 taslağı canlı taslak kaydına giremez: ${slug}`);
    }
    const keys = PHASE2_DRAFT_LESSON_KEYS_BY_SLUG[slug] ?? [];
    const drafts = PHASE2_CURRICULUM_DRAFTS_BY_SLUG[slug] ?? [];
    if (drafts.length !== keys.length) {
      throw new Error(`Faz 2 ders adedi sapması: ${slug}`);
    }
    drafts.forEach((draft, index) => {
      if (draft.key !== keys[index]) {
        throw new Error(`Faz 2 anahtar sırası sapması: ${slug} / ${draft.key}`);
      }
      if (draft.order !== index + 1) {
        throw new Error(`Faz 2 sıra numarası sapması: ${draft.key}`);
      }
      if (draft.format !== "compact" || draft.intro.trim().length === 0) {
        throw new Error(`Faz 2 gövde boş: ${draft.key}`);
      }
      if (draft.audioUrl || draft.videoUrl) {
        throw new Error(`Faz 2 medya yolu bu turda yazılamaz: ${draft.key}`);
      }
    });
  }
}
