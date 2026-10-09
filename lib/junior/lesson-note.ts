import { JUNIOR_TELL_CLOSE } from "@/lib/junior/content-rules";

const TELL_CLOSE = JUNIOR_TELL_CLOSE;

/**
 * Okul notu ile günlük kullanım aynı öğretmen sesinde okunur.
 * Günlük sahne Giriş’e örülmüşse ikinci kez eklenmez.
 * Kapanış cümlesi bir kez, anlatımın sonunda durur.
 */
export function juniorLessonNote(mebNote: string, lifeUse: string): string {
  const hasClose = mebNote.includes(TELL_CLOSE);
  const school = (hasClose ? mebNote.replace(TELL_CLOSE, "") : mebNote).trim();
  const life = lifeUse.trim();
  const alreadyWoven = life.length > 0 && school.includes(life);
  const body = alreadyWoven
    ? school
    : [school, life].filter((part) => part.length > 0).join("\n\n");
  if (!hasClose) {
    return body;
  }
  return body.length > 0 ? `${body}\n\n${TELL_CLOSE}` : TELL_CLOSE;
}
