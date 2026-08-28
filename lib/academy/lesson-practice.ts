/**
 * Ders pratikleri — büyüme kataloğu laboratuvarı.
 */

import type { AcademyLessonPractice } from "@/lib/academy/lesson-body";
import { PYTHON_PATHWAY_PRACTICE } from "@/lib/academy/lesson-practice-python";
import { ACADEMY_GROWTH_LESSON_PRACTICE } from "@/lib/academy/lesson-practice-growth";
import { ACADEMY_GROWTH_SKU_SLUGS } from "@/lib/academy/pilot-sku";

const prefixes = ACADEMY_GROWTH_SKU_SLUGS.map((slug) => `${slug}-`);

export const LESSON_PRACTICE: Record<string, AcademyLessonPractice> = Object.fromEntries(
  [
    ...Object.entries(PYTHON_PATHWAY_PRACTICE),
    ...Object.entries(ACADEMY_GROWTH_LESSON_PRACTICE),
  ].filter(([key]) => prefixes.some((prefix) => key.startsWith(prefix))),
);
