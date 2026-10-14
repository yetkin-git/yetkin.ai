/**
 * Atomik mikro-ders.
 * 5–12 dakikalık kaset yerinde durur; tüketim 2–4 dakikalık adımlara bölünür.
 * Young aynı sözleşmeyi `lib/young/micro-lesson.ts` üzerinden okur.
 */

import { JUNIOR_RECAP_TITLE, juniorHintKindFromCaption } from "@/lib/junior/content-rules";
import { juniorCuePauses, type JuniorPauseKind, type JuniorPlayerTimeline } from "@/lib/junior/player-clock";

/** Mikro-adım alt sınırı: 2 dakika. */
export const MICRO_LESSON_MIN_MS = 120_000;
/** Mikro-adım üst sınırı: 4 dakika. */
export const MICRO_LESSON_MAX_MS = 240_000;
/** Hedef dilim: 3 dakika. */
export const MICRO_LESSON_AIM_MS = 180_000;
/** Dikkat durağının bu kadar yakınındaki yıldız durağı kaldırılır (ms). */
export const MICRO_STAR_ATTENTION_GAP_MS = 2000;

/**
 * Oynatıcı rozeti. «Mikro ders» mühendislik adı çocuk yüzünde durmaz.
 * İlk iki dilim kavram ve örnek; sonraki dilimler özet ve pekiştirme.
 * 5–12 dk kaset 2–4 dilime bölünür.
 */
const MICRO_STEP_BADGES = [
  "🎯 1. Bölüm: Kavram",
  "💡 2. Bölüm: Örnek & Taktik",
  "🌟 3. Bölüm: Özet",
  "✨ 4. Bölüm: Pekiştir",
] as const;

export function microStepBadge(index: number): string {
  const known = MICRO_STEP_BADGES[index];
  if (known) {
    return known;
  }
  return `🌟 ${index + 1}. Bölüm`;
}

export type MicroLessonStep = {
  id: string;
  index: number;
  title: string;
  startMs: number;
  endMs: number;
};

export type MicroLessonPause = {
  endMs: number;
  kind: JuniorPauseKind;
  stepIndex: number;
  /** Dikkat kartının okunacak gövdesi. */
  attentionText?: string;
  /** Bu ana kadar aynı kart yeniden açılmaz. */
  attentionUntilMs?: number;
};

export type MicroLessonPlan = {
  steps: readonly MicroLessonStep[];
  pauses: readonly MicroLessonPause[];
};

function stepCountFor(durationMs: number): number {
  if (durationMs <= MICRO_LESSON_MAX_MS) {
    return 1;
  }
  const minCount = Math.ceil(durationMs / MICRO_LESSON_MAX_MS);
  const maxCount = Math.max(1, Math.floor(durationMs / MICRO_LESSON_MIN_MS));
  const aimCount = Math.max(1, Math.round(durationMs / MICRO_LESSON_AIM_MS));
  return Math.min(maxCount, Math.max(minCount, aimCount));
}

function snapEnd(startMs: number, targetMs: number, durationMs: number, boundaries: readonly number[]): number {
  const low = startMs + MICRO_LESSON_MIN_MS;
  const high = Math.min(durationMs, startMs + MICRO_LESSON_MAX_MS);
  const candidates = boundaries.filter((point) => point >= low && point <= high);
  if (candidates.length === 0) {
    return Math.min(durationMs, Math.max(low, Math.min(high, targetMs)));
  }
  return candidates.reduce((best, point) =>
    Math.abs(point - targetMs) < Math.abs(best - targetMs) ? point : best,
  );
}

export function microLessonSteps(lessonKey: string, timeline: JuniorPlayerTimeline): MicroLessonStep[] {
  const durationMs = Math.max(0, timeline.durationMs);
  const key = lessonKey.trim() || "ders";
  if (durationMs <= 0) {
    return [{ id: `${key}:0`, index: 0, title: microStepBadge(0), startMs: 0, endMs: 0 }];
  }
  const count = stepCountFor(durationMs);
  const boundaries = timeline.windows.map((window) => window.endMs).filter((end) => end > 0 && end < durationMs);
  const steps: MicroLessonStep[] = [];
  let startMs = 0;
  for (let index = 0; index < count; index += 1) {
    const last = index === count - 1;
    const target = last ? durationMs : startMs + durationMs / count;
    const endMs = last ? durationMs : snapEnd(startMs, target, durationMs, boundaries);
    const safeEnd = endMs > startMs ? endMs : Math.min(durationMs, startMs + MICRO_LESSON_AIM_MS);
    steps.push({
      id: `${key}:${index}`,
      index,
      title: microStepBadge(index),
      startMs,
      endMs: last ? durationMs : safeEnd,
    });
    startMs = last ? durationMs : safeEnd;
  }
  const tail = steps[steps.length - 1];
  if (tail && tail.endMs !== durationMs) {
    tail.endMs = durationMs;
  }
  return steps;
}

function stepIndexAt(steps: readonly MicroLessonStep[], ms: number): number {
  const found = steps.findIndex((step, index) => {
    const last = index === steps.length - 1;
    return ms >= step.startMs && (last ? ms <= step.endMs : ms < step.endMs);
  });
  return found < 0 ? Math.max(0, steps.length - 1) : found;
}

/**
 * Defter, dikkat ve yıldız damgaları zaman çubuğunda işaret olarak durur.
 * Kaset bu damgalarda kendiliğinden durmaz.
 * Ara mikro-adımın sonunda defter durağı yoksa yıldız işareti konur.
 * Çocuk işarete dokunursa veya anlatımı kendisi durdurursa kart açılır.
 * Dersin son milisaniyesi karar ekranına bırakılır.
 */
export function microLessonPlan(lessonKey: string, timeline: JuniorPlayerTimeline): MicroLessonPlan {
  const steps = microLessonSteps(lessonKey, timeline);
  const ceiling = timeline.durationMs - 1500;
  const pauses: MicroLessonPause[] = [];
  for (const cue of juniorCuePauses(timeline, {
    attention: (text) => juniorHintKindFromCaption(text) !== null,
    attentionStop: (text) => text.trim().startsWith(JUNIOR_RECAP_TITLE),
  })) {
    if (cue.endMs >= timeline.durationMs - 80 || cue.endMs > ceiling) {
      continue;
    }
    pauses.push({
      endMs: cue.endMs,
      kind: cue.kind,
      stepIndex: stepIndexAt(steps, cue.endMs),
      attentionText: cue.attentionText,
      attentionUntilMs: cue.attentionUntilMs,
    });
  }
  for (let index = 0; index < steps.length - 1; index += 1) {
    const step = steps[index];
    if (!step || step.endMs >= timeline.durationMs - 80) {
      continue;
    }
    const covered = pauses.some(
      (pause) => pause.stepIndex === index && Math.abs(pause.endMs - step.endMs) < 2000,
    );
    if (covered) {
      continue;
    }
    pauses.push({ endMs: step.endMs, kind: "turn", stepIndex: index });
  }
  pauses.sort((left, right) => left.endMs - right.endMs);
  const unique: MicroLessonPause[] = [];
  for (const pause of pauses) {
    const previous = unique[unique.length - 1];
    if (previous && Math.abs(previous.endMs - pause.endMs) < 800) {
      if (pause.kind === "attention") {
        previous.kind = "attention";
        previous.stepIndex = pause.stepIndex;
        previous.attentionText = pause.attentionText ?? previous.attentionText;
        previous.attentionUntilMs = pause.attentionUntilMs ?? previous.attentionUntilMs;
      } else if (previous.kind !== "attention" && pause.kind === "notebook") {
        previous.kind = "notebook";
        previous.stepIndex = pause.stepIndex;
      }
      continue;
    }
    unique.push({ ...pause });
  }
  // Dikkat durağında (💡) yıldız (⭐) ve küçük soru paneli açılmaz: yakın yıldız durağı düşer.
  const attentionAt = unique.filter((pause) => pause.kind === "attention").map((pause) => pause.endMs);
  const kept = unique.filter(
    (pause) =>
      pause.kind !== "turn" ||
      !attentionAt.some((ms) => Math.abs(ms - pause.endMs) < MICRO_STAR_ATTENTION_GAP_MS),
  );
  return { steps, pauses: kept };
}
