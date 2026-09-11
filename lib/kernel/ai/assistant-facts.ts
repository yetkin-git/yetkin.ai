import { ASSISTANT_SEN } from "@/lib/copy/sen-voice/assistant";

export type AssistantLocalFactKind = keyof typeof ASSISTANT_SEN.facts;

const CONTACT_RE = /e-?posta|e-?mail|\bemail\b|\bmail\b|iletişim|iletisim/;
const ACADEMY_RE = /akademi|eğitim|egitim|sertifika|sınav|sinav|\bders\b|kurs/;
const CAREER_RE = /kariyer|rozet|hedef\s*rol/;

function foldAssistantMessage(message: string): string {
  return message.toLocaleLowerCase("tr-TR").replace(/\s+/g, " ").trim();
}

/** SSOT eşlemesi — e-posta / Akademi / Kariyer. Uydurma yok; eşleşmezse null. */
export function matchAssistantLocalFact(message: string): AssistantLocalFactKind | null {
  const folded = foldAssistantMessage(message);
  if (!folded) {
    return null;
  }
  if (CONTACT_RE.test(folded)) {
    return "contact";
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
