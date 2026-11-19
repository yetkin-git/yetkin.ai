/**
 * Form koçu istemci sözleşmesi.
 * Sunucu mantığı `form-coach.ts` içindedir; bu dosya `server-only` taşımaz.
 */

export const FORM_COACH_PATH = "/api/ai/form-coach" as const;
export const FORM_COACH_MAX_INPUT_CHARS = 500;
export const FORM_COACH_MIN_CHARS_FOR_API = 30;

export const FORM_COACH_CONTEXTS = [
  "hibe",
  "tezgah",
  "kurumsal",
  "ecommerce",
  "career",
  "general",
] as const;

export type FormCoachContext = (typeof FORM_COACH_CONTEXTS)[number];
