import { z } from "zod";

import { JUNIOR_COURSE_SLUGS } from "./meb-outcome";

export const schoolWeekKindSchema = z.enum(["teach", "exam", "break", "okul-temelli"]);

export const schoolWeekSchema = z.object({
  week: z.number().int().positive(),
  kind: schoolWeekKindSchema,
  label: z.string().min(1).optional(),
});

export type SchoolWeek = z.infer<typeof schoolWeekSchema>;

export const topicCalendarSchema = z.object({
  lessonKey: z.string().min(1),
  outcomeCodes: z.array(z.string()),
  band: z.enum(["tymm", "legacy-2018"]),
  startWeek: z.number().int().nonnegative(),
  endWeek: z.number().int().nonnegative(),
  hours: z.number().int().nonnegative(),
});

export type TopicCalendar = z.infer<typeof topicCalendarSchema>;

const lessonKeySchema = z.string().regex(/^jr_06_(?:mat|fen|turkce|ing_main|sosyal)-\d+$/u);

/** Mevcut senaryo alanları. Yeni pedagojik alan yoktur. */
export const juniorScenarioSchema = z.object({
  key: lessonKeySchema,
  title: z.string().min(1),
  teaser: z.string().min(1),
  welcome: z.string().min(1),
  concept: z.string().min(1),
  example: z.string().min(1),
  warning: z.string().min(1),
  hint: z.enum(["trap", "gold"]).optional(),
  life: z.string().min(1),
  recap: z.tuple([z.string().min(1), z.string().min(1), z.string().min(1)]),
  conceptSeal: z.string().min(1),
  voiceSeal: z.string().min(1),
  echoPrompt: z.string().min(1).optional(),
  outcomes: z.array(z.string().min(1)).min(1),
  scene: z.string().min(1),
  parentNote: z.string().min(1).optional(),
  band: z.literal("draft").optional(),
});

export type JuniorScenarioFile = z.infer<typeof juniorScenarioSchema>;

/** Eksik çıktı için boş kab. Anlatım, soru ve ses yazılmaz. */
export const juniorShellSchema = z.object({
  shell: z.literal(true),
  key: lessonKeySchema,
  title: z.string().min(1),
  teaser: z.string().min(1),
  outcomeCodes: z.array(z.string().min(1)).min(1),
  band: z.literal("tymm"),
});

export type JuniorShellFile = z.infer<typeof juniorShellSchema>;

export const juniorTopicFileSchema = z.union([juniorScenarioSchema, juniorShellSchema]);

export const juniorQuizQuestionSchema = z.object({
  id: z.string().min(1),
  level: z.enum(["concept", "apply", "skill"]),
  question: z.string().min(1),
  options: z.tuple([z.string(), z.string(), z.string(), z.string()]),
  correctAnswerIndex: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
  hint: z.string().min(1),
  explanation: z.string().min(1),
});

export const juniorQuizFileSchema = z.object({
  lessonKey: lessonKeySchema,
  title: z.string().min(1),
  tellGuides: z.union([
    z.tuple([z.string().min(1), z.string().min(1)]),
    z.tuple([z.string().min(1), z.string().min(1), z.string().min(1)]),
  ]),
  questions: z.tuple([juniorQuizQuestionSchema, juniorQuizQuestionSchema, juniorQuizQuestionSchema]),
});

export type JuniorQuizFile = z.infer<typeof juniorQuizFileSchema>;

export const juniorCourseSlugs = JUNIOR_COURSE_SLUGS;
