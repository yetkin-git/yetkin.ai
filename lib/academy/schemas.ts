import { z } from "zod";
import { checkoutLegalConsentSchema } from "@/lib/kernel/legal/checkout-consent";
import { checkoutBillingInfoSchema } from "@/lib/kernel/identity/billing-info";

const lessonKeySchema = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9-]+$/);

const proofSlotsSchema = z.record(z.string(), z.string());

export const academyProofSubmissionSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("amount-kurus"),
    amountText: z.string().trim().min(1).max(32),
    currencyText: z.string().trim().min(1).max(8),
  }),
  z.object({
    kind: z.literal("prompt-pack"),
    prompt: z.string().trim().min(1).max(4_000),
    slots: proofSlotsSchema,
  }),
  z.object({
    kind: z.literal("param-lock"),
    slots: proofSlotsSchema,
  }),
]);

export const purchaseCourseInputSchema = checkoutLegalConsentSchema.extend({
  lockId: z.string().trim().min(1).optional(),
  /** Serbest seviye etiketi — kapalı Temel/Orta/İleri enum’u değildir. */
  level: z.string().trim().min(1).max(64).optional(),
  /** Dürüst kapı — eğitim oynatıcı veya doğrudan sınav/vize. */
  path: z.enum(["training", "exam"]).optional(),
  billing: checkoutBillingInfoSchema,
});

export const submitAcademyExamInputSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string().trim().min(1),
        choiceIndex: z.number().int().min(0),
      }),
    )
    .max(64),
  /** Fail-closed: boş jeton ile havuz puanlama yok. */
  sessionToken: z.string().trim().min(1),
  timedOut: z.boolean().optional(),
  proof: academyProofSubmissionSchema.optional(),
});

export const completeAcademyLessonInputSchema = z.object({
  lessonKey: lessonKeySchema,
  /** Faz 1 — UI kilidi yok; gövde boşsa motor kanonik özeti basar. */
  proof: academyProofSubmissionSchema.optional(),
}).strict();

export const academyReviewInputSchema = z.object({
  courseId: z.string().trim().min(1).max(64),
  lessonKey: lessonKeySchema.optional(),
  stars: z.number().int().min(1).max(5),
  comment: z.string().trim().min(1).max(800),
});

export const academyDiscussionQuerySchema = z.object({
  courseId: z.string().trim().min(1).max(64),
  lessonKey: lessonKeySchema,
});

export const academyDiscussionInputSchema = z.object({
  courseId: z.string().trim().min(1).max(64),
  lessonKey: lessonKeySchema,
  body: z.string().trim().min(1).max(800),
});

export const academyCurriculumRevisionApproveSchema = z.object({
  revisionId: z.string().trim().min(1).max(128),
});

export type PurchaseCourseInput = z.infer<typeof purchaseCourseInputSchema>;
export type SubmitAcademyExamInput = z.infer<typeof submitAcademyExamInputSchema>;
export type CompleteAcademyLessonInput = z.infer<typeof completeAcademyLessonInputSchema>;
export type AcademyReviewInput = z.infer<typeof academyReviewInputSchema>;
export type AcademyDiscussionInput = z.infer<typeof academyDiscussionInputSchema>;
export type AcademyCurriculumRevisionApproveInput = z.infer<
  typeof academyCurriculumRevisionApproveSchema
>;
