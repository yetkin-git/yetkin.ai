import {
  MAT_5_AUTHORED_CUES,
  MAT_5_HERO_FOCUS,
  parseMarkedCueText,
} from "@/lib/junior/pilot-engine/mat-1.choreography";
import {
  MAT_6_AUTHORED_CUES,
  MAT_6_HERO_FOCUS,
} from "@/lib/junior/pilot-engine/mat-6.choreography";
import { JUNIOR_PILOT_PLAYBACK_LESSON_KEY } from "@/lib/junior/pilot-engine/playback-key";
import type { TimelineJSON } from "@/lib/junior/pilot-engine/schema";

/**
 * Mühürlü zaman çizelgesinin konuşması yazar koreografiden kopmuşsa fırlatır.
 * Saat (milisaniye) PCM fırınınındır; bu kapı saati yeniden yazmaz.
 */
export function assertSealedPilotTimeline(timeline: TimelineJSON): void {
  if (timeline.lessonKey !== JUNIOR_PILOT_PLAYBACK_LESSON_KEY) {
    throw new Error("Pilot zaman çizelgesi ders anahtarı yazarlıkla uyuşmuyor.");
  }
  if (timeline.cues.length !== MAT_5_AUTHORED_CUES.length) {
    throw new Error("Pilot zaman çizelgesi sekans sayısı yazarlıkla uyuşmuyor.");
  }
  for (let index = 0; index < MAT_5_AUTHORED_CUES.length; index += 1) {
    const spec = MAT_5_AUTHORED_CUES[index];
    const cue = timeline.cues[index];
    if (!spec || !cue) {
      throw new Error("Pilot zaman çizelgesi sekansı eksik.");
    }
    const clean = parseMarkedCueText(spec.markedText).cleanText;
    if (cue.id !== spec.id || cue.chapterId !== spec.chapterId || cue.text !== clean) {
      throw new Error(`Pilot zaman çizelgesi ${spec.id} konuşması yazarlıktan koptu.`);
    }
  }
}

const MAT_5_SPOKEN_FORBIDDEN = ["hiç işlem yapmadan", "küçültür", "çarpar ve büyütür"] as const;

/**
 * Pilot konuşması yazarla aynı mı, ve MAT.6.1.2'nin yedi kuralı kulakta mı.
 * Saat bu fonksiyonun işi değildir.
 */
export function mat5NarrationSealIssue(timeline: TimelineJSON): string | null {
  try {
    assertSealedPilotTimeline(timeline);
  } catch (error) {
    return error instanceof Error ? error.message : "Pilot sekansı yazarlıkla eşleşmedi.";
  }
  const spoken = timeline.cues.map((cue) => cue.text).join("\n").toLocaleLowerCase("tr-TR");
  const forbidden = MAT_5_SPOKEN_FORBIDDEN.find((phrase) => spoken.includes(phrase));
  if (forbidden) {
    return `Pilot konuşması kapsül dışı iz taşıyor: ${forbidden}.`;
  }
  if (!spoken.includes("9 kuralı") || !spoken.includes("10 kuralı")) {
    return "Pilot konuşması 9 ve 10 kurallarını taşımıyor.";
  }
  if (!spoken.includes("son iki basamak") || !spoken.includes("100 bölü 4")) {
    return "Pilot konuşması 4 kuralının basamak değeri gerekçesini taşımıyor.";
  }
  if (!spoken.includes("çifte koşul") || !spoken.includes("hem 2'ye hem 3'e")) {
    return "Pilot konuşması 6 kuralının çifte koşulunu taşımıyor.";
  }
  if (!/2,\s*3,\s*4,\s*5,\s*6,\s*9\s*ve\s*10/u.test(MAT_5_HERO_FOCUS)) {
    return "Hero yedi kuralı saymıyor.";
  }
  return null;
}

/**
 * `jr_06_mat-2` konuşması yazarın 12 sekansından kopmuşsa fırlatır.
 * Saat PCM fırınınındır. Bu kapı saati yeniden yazmaz.
 */
export function assertSealedMat6Timeline(timeline: TimelineJSON): void {
  if (timeline.lessonKey !== "jr_06_mat-2") {
    throw new Error("jr_06_mat-2 zaman çizelgesi ders anahtarı yazarlıkla uyuşmuyor.");
  }
  if (timeline.production?.status !== "locked" || timeline.production.readiness !== "ready") {
    throw new Error("jr_06_mat-2 üretim durumu locked/ready değil.");
  }
  if (timeline.cues.length !== MAT_6_AUTHORED_CUES.length) {
    throw new Error("jr_06_mat-2 zaman çizelgesi sekans sayısı yazarlıkla uyuşmuyor.");
  }
  for (let index = 0; index < MAT_6_AUTHORED_CUES.length; index += 1) {
    const spec = MAT_6_AUTHORED_CUES[index];
    const cue = timeline.cues[index];
    if (!spec || !cue) {
      throw new Error("jr_06_mat-2 zaman çizelgesi sekansı eksik.");
    }
    const clean = parseMarkedCueText(spec.markedText).cleanText;
    if (cue.id !== spec.id || cue.chapterId !== spec.chapterId || cue.text !== clean) {
      throw new Error(`jr_06_mat-2 zaman çizelgesi ${spec.id} konuşması yazarlıktan koptu.`);
    }
  }
}

/**
 * Konuşma mührü. Kalbur, Eratosthenes ve yüzlük tablo çocuk eleğindedir;
 * bu üç kelime dersi düşürmez. Jargon hâlâ konuşmaya girmez.
 */
export const MAT_6_SPOKEN_FORBIDDEN = ["kavramsal anlayış", "ifade gücü"] as const;

/** Pilot konuşması yazarla aynı mı, ve asal kapsülü kulakta mı. */
export function mat6NarrationSealIssue(timeline: TimelineJSON): string | null {
  try {
    assertSealedMat6Timeline(timeline);
  } catch (error) {
    return error instanceof Error ? error.message : "jr_06_mat-2 sekansı yazarlıkla eşleşmedi.";
  }
  const spoken = timeline.cues.map((cue) => cue.text).join("\n").toLocaleLowerCase("tr-TR");
  const forbidden = MAT_6_SPOKEN_FORBIDDEN.find((phrase) => spoken.includes(phrase));
  if (forbidden) {
    return `jr_06_mat-2 konuşması kapsül dışı iz taşıyor: ${forbidden}.`;
  }
  if (!spoken.includes("yalnız 1'e ve kendisine") || !spoken.includes("1'den büyük")) {
    return "jr_06_mat-2 konuşması asal tanımını taşımıyor.";
  }
  if (!spoken.includes("1 sayısı asla asal") || !spoken.includes("tek çift sayı")) {
    return "jr_06_mat-2 konuşması 1 ve 2 özel durumunu taşımıyor.";
  }
  if (!spoken.includes("9 tek bir sayıdır") || !spoken.includes("3 çarpı 3")) {
    return "jr_06_mat-2 konuşması 9 tuzağını taşımıyor.";
  }
  if (!spoken.includes("2 çarpı 2 çarpı 3")) {
    return "jr_06_mat-2 konuşması 12'nin çarpan ağacını taşımıyor.";
  }
  if (!MAT_6_HERO_FOCUS.includes("2 × 2 × 3") || !MAT_6_HERO_FOCUS.includes("1 asal değildir")) {
    return "jr_06_mat-2 hero kapsülü saymıyor.";
  }
  return null;
}

/** Taslak hece saati mühürlü PCM saatinin yerine geçmişse doğrudur. */
export function pilotTimelineUsesDraftClock(sealed: TimelineJSON, draft: TimelineJSON): boolean {
  if (sealed.cues.length === 0 || sealed.cues.length !== draft.cues.length) {
    return false;
  }
  return sealed.cues.every((cue, index) => {
    const other = draft.cues[index];
    return Boolean(other && cue.startMs === other.startMs && cue.endMs === other.endMs);
  });
}
