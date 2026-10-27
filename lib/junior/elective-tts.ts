/**
 * Seçmeli ders fırınının bütçe modeli.
 * Çekirdek `VOICE_TTS` kimliğinin yerine geçmez ve ona düşmez.
 */
export const JUNIOR_ELECTIVE_TTS_MODEL_ID = "gemini-3.8-flash-lite-tts" as const;

export const JUNIOR_ELECTIVE_BAKE_SLUGS = [
  "jr_06_ing",
  "jr_06_alm",
  "jr_06_fra",
  "jr_06_siyer",
  "jr_06_kod",
  "jr_06_arp",
] as const;

export function juniorLessonUsesElectiveTts(lessonKey: string): boolean {
  const slug = lessonKey.trim().replace(/-\d+$/u, "");
  return (JUNIOR_ELECTIVE_BAKE_SLUGS as readonly string[]).includes(slug);
}
