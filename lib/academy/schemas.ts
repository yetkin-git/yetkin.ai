import { z } from "zod";

export const purchaseCourseInputSchema = z.object({
  lockId: z.string().trim().min(1).optional(),
});

export const submitAcademyExamInputSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().trim().min(1),
        choiceIndex: z.number().int().min(0),
      }),
    )
    .min(1),
});

export const completeAcademyLessonInputSchema = z.object({
  lessonKey: z
    .string()
    .trim()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9-]+$/),
});

export type PurchaseCourseInput = z.infer<typeof purchaseCourseInputSchema>;
export type SubmitAcademyExamInput = z.infer<typeof submitAcademyExamInputSchema>;
export type CompleteAcademyLessonInput = z.infer<typeof completeAcademyLessonInputSchema>;
