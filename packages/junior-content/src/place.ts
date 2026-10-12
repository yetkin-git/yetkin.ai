import type { SchoolWeek, TopicCalendar } from "../schema/topic";

export type StripTopic = {
  lessonKey: string;
  outcomeCodes: readonly string[];
  hours: number;
  band: "tymm" | "legacy-2018";
  shell?: boolean;
  title?: string;
  teaser?: string;
  /** Saat eklemeden tema haftasına bağlanan uydu. İkisi birlikte 0 ise takvim şeridi yoktur. */
  startWeek?: number;
  endWeek?: number;
  /** Verilen hafta aralığında kalır. Saat, ardışık öğretim şeridini tüketmez. */
  pinned?: boolean;
};

/**
 * Saatleri yalnız `teach` haftalarına dizer.
 * Bütçe son haftada birkaç saat taşarsa konu o haftada kalır, sonraki tatile kaymaz.
 */
export function placeTopics(
  topics: readonly StripTopic[],
  weeklyHours: number,
  weeks: readonly SchoolWeek[],
): TopicCalendar[] {
  const teach = weeks.filter((week) => week.kind === "teach").map((week) => week.week);
  const lastTeach = teach[teach.length - 1];
  if (!lastTeach) {
    throw new Error("Öğretim haftası yok.");
  }
  let index = 0;
  let used = 0;
  const placed: TopicCalendar[] = [];
  for (const topic of topics) {
    if (topic.pinned) {
      const start = topic.startWeek ?? 0;
      const end = topic.endWeek ?? 0;
      if (start < 1 || end < start) {
        throw new Error(`${topic.lessonKey} sabit hafta aralığı yarım.`);
      }
      placed.push({
        lessonKey: topic.lessonKey,
        outcomeCodes: [...topic.outcomeCodes],
        band: topic.band,
        startWeek: start,
        endWeek: end,
        hours: topic.hours,
      });
      continue;
    }
    if (topic.band !== "tymm" || topic.hours <= 0) {
      const start = topic.startWeek ?? 0;
      const end = topic.endWeek ?? 0;
      if ((start === 0) !== (end === 0) || start > end) {
        throw new Error(`${topic.lessonKey} hafta aralığı yarım.`);
      }
      placed.push({
        lessonKey: topic.lessonKey,
        outcomeCodes: [...topic.outcomeCodes],
        band: topic.band,
        startWeek: start,
        endWeek: end,
        hours: 0,
      });
      continue;
    }
    if (index >= teach.length) {
      throw new Error(`${topic.lessonKey} için öğretim haftası kalmadı.`);
    }
    const start = teach[index]!;
    let remaining = topic.hours;
    let end = start;
    while (remaining > 0) {
      if (index >= teach.length) {
        if (remaining > weeklyHours) {
          throw new Error(`${topic.lessonKey} saati son öğretim haftasına sığmadı.`);
        }
        end = lastTeach;
        remaining = 0;
        break;
      }
      const room = weeklyHours - used;
      if (room <= 0) {
        index += 1;
        used = 0;
        continue;
      }
      const take = Math.min(room, remaining);
      remaining -= take;
      used += take;
      end = teach[index]!;
      if (used === weeklyHours) {
        index += 1;
        used = 0;
      }
    }
    placed.push({
      lessonKey: topic.lessonKey,
      outcomeCodes: [...topic.outcomeCodes],
      band: "tymm",
      startWeek: start,
      endWeek: end,
      hours: topic.hours,
    });
  }
  return placed;
}

export function activeLessonKeys(topics: readonly TopicCalendar[], week: number, kind: SchoolWeek["kind"]): string[] {
  if (kind !== "teach") {
    return [];
  }
  return topics
    .filter(
      (topic) =>
        topic.band === "tymm" &&
        topic.startWeek >= 1 &&
        topic.startWeek <= week &&
        week <= topic.endWeek,
    )
    .map((topic) => topic.lessonKey);
}
