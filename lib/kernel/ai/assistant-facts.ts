import { ASSISTANT_SEN } from "@/lib/copy/sen-voice/assistant";

export type AssistantLocalFactKind = keyof typeof ASSISTANT_SEN.facts;

const CONTACT_RE = /e-?posta|e-?mail|\bemail\b|\bmail\b|iletişim|iletisim/;
const EXAM_SCORE_RE =
  /kaç\s*puan|kac\s*puan|puan\s*almak|puan\s*gerek|sınav\s*puan|sinav\s*puan|\bbaraj\b|geçme\s*not|gecme\s*not/;
const SPOKEN_LESSONS_RE =
  /kaç\s*ders|kac\s*ders|ders\s*say|sesli\s*ders|ders\w*\s+sesli|kaç\s*tane\s*ders|kac\s*tane\s*ders/;
const CAREER_SEAL_RE =
  /kariyer\s*vize|vizeye|vizesi|vizen|(?:sertifika|belge).{0,48}(?:dönüş|donus|kariyer)|kariyer.{0,48}(?:dönüş|donus|işlen|islen)/;
const ACADEMY_RE = /akademi|eğitim|egitim|sertifika|sınav|sinav|\bders\b|kurs/;
const CAREER_RE = /kariyer|rozet|hedef\s*rol/;

function foldAssistantMessage(message: string): string {
  return message.toLocaleLowerCase("tr-TR").replace(/\s+/g, " ").trim();
}

/** SSOT eşlemesi — e-posta, baraj, ders sayısı, kariyer belgesi, oda. Uydurma yok. */
export function matchAssistantLocalFact(message: string): AssistantLocalFactKind | null {
  const folded = foldAssistantMessage(message);
  if (!folded) {
    return null;
  }
  if (CONTACT_RE.test(folded)) {
    return "contact";
  }
  if (EXAM_SCORE_RE.test(folded)) {
    return "examScore";
  }
  if (SPOKEN_LESSONS_RE.test(folded)) {
    return "spokenLessons";
  }
  if (CAREER_SEAL_RE.test(folded)) {
    return "careerSeal";
  }
  if (ACADEMY_RE.test(folded)) {
    return "academy";
  }
  if (CAREER_RE.test(folded)) {
    return "career";
  }
  return null;
}

export function resolveAssistantLocalReply(message: string): string | null {
  const kind = matchAssistantLocalFact(message);
  if (!kind) {
    return null;
  }
  return ASSISTANT_SEN.facts[kind];
}

export function assistantFailSafeReply(message: string): string {
  return resolveAssistantLocalReply(message) ?? ASSISTANT_SEN.failSafe;
}
