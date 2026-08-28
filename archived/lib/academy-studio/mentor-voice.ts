/**
 * TTS köprüleri ve Koray özeti — mekanik kilitlemek yok.
 *
 * Müfredat geliştirme: karmaşık kilit noktalarda kültürel analoji / yerel benzetme
 * zorunlu (bkz. pedagogy-doctrine.ts — pencere kenarı bilet kanonu).
 */

export const ACADEMY_MODERATOR_SUMMARY_LEAD = "Benim anladığım kadarıyla," as const;

export const ACADEMY_MODERATOR_SUMMARY_RECAP =
  "geçen bölümde şu konuyu detaylıca ele almıştık" as const;

export function academyModeratorSummaryConfirm(honorific: string): string {
  return `Doğru mu anlıyorum ${honorific}?`;
}

export const ACADEMY_LESSON_SPOKEN_PARAM_LEAD = "Parametreler şöyle duruyor." as const;

export const ACADEMY_LESSON_SPOKEN_STEP_LEAD =
  "Adımlar şöyle ilerliyor." as const;

export const ACADEMY_LESSON_ACT_SPOKEN_BRIDGES = {
  giris: [
    "Şimdi vakit kaybetmeden konumuza hızlıca bir giriş yapalım...",
    "Şimdi konuyu hiç vakit kaybetmeden açalım...",
  ],
  syntax: [
    "Bu dersin çalışan sözdizimine bakacak olursak...",
    "Şimdi kodun nasıl yazıldığına net bakalım...",
  ],
  mantik: [
    "Meseleyi biraz daha derinlemesine inceleyecek olursak...",
    "Şimdi işin uygulama tarafına biraz daha yakından bakacağız...",
    "İşte işin düğümlendiği, kritik nokta tam da burası...",
  ],
  uygulama: [
    "Konuyu yavaş yavaş toparlayıp sonuca bağlayacak olursak...",
    "Şimdi bu bölümü toparlayıp kapatalım...",
    "Başka bir deyişle... aynı fikri bir kez daha oturtalım...",
  ],
} as const;

export type AcademySpokenAct = keyof typeof ACADEMY_LESSON_ACT_SPOKEN_BRIDGES;

function hashSeed(text: string): number {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function spokenAcademyLessonActBridge(act: AcademySpokenAct, salt: string): string {
  const bridges = ACADEMY_LESSON_ACT_SPOKEN_BRIDGES[act];
  const index = hashSeed(`${act}:${salt}`) % bridges.length;
  return bridges[index]!;
}
