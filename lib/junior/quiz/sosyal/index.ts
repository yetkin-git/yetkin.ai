import { juniorSealedQuizPacks } from "@/lib/junior/content-source";
import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** Geriye dönük adaptör. Dizi, JuniorContentSource kapısından okunur. */
export const JUNIOR_SOSYAL_QUIZ_PACKS: readonly JuniorLessonQuizPack[] = juniorSealedQuizPacks("jr_06_sosyal");
