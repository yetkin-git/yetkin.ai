const TELL_CLOSE =
  "Aferin size! Şimdi sıra sizde, aldığınız bu güzel notları mikrofona kendi sözlerinizle anlatma vakti!";

/**
 * Okul notu ile günlük kullanım aynı öğretmen sesinde art arda okunur.
 * Kapanış cümlesi bir kez, anlatımın sonunda durur.
 */
export function juniorLessonNote(mebNote: string, lifeUse: string): string {
  const hasClose = mebNote.includes(TELL_CLOSE);
  const school = (hasClose ? mebNote.replace(TELL_CLOSE, "") : mebNote).trim();
  const life = lifeUse.trim();
  const body = [school, life].filter((part) => part.length > 0).join("\n\n");
  if (!hasClose) {
    return body;
  }
  return body.length > 0 ? `${body}\n\n${TELL_CLOSE}` : TELL_CLOSE;
}
