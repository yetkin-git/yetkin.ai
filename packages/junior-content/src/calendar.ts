import type { JuniorCourseSlug, MebCourseFile, MebOutcome } from "../schema/meb-outcome";
import type { SchoolWeek, TopicCalendar } from "../schema/topic";
import { JUNIOR_CALENDAR_VERSION } from "./school-weeks";
import fenCalendar from "../calendar/jr_06_fen.json" with { type: "json" };
import ingCalendar from "../calendar/jr_06_ing_main.json" with { type: "json" };
import matCalendar from "../calendar/jr_06_mat.json" with { type: "json" };
import sosyalCalendar from "../calendar/jr_06_sosyal.json" with { type: "json" };
import turkceCalendar from "../calendar/jr_06_turkce.json" with { type: "json" };
import fenMeb from "../meb/2026-2027/fen.json" with { type: "json" };
import ingMeb from "../meb/2026-2027/ing.json" with { type: "json" };
import matMeb from "../meb/2026-2027/mat.json" with { type: "json" };
import sosyalMeb from "../meb/2026-2027/sosyal.json" with { type: "json" };
import turkceMeb from "../meb/2026-2027/turkce.json" with { type: "json" };
import schoolWeeks from "../calendar/school-weeks.json" with { type: "json" };

export { JUNIOR_CALENDAR_VERSION };

const WEEKS = schoolWeeks as SchoolWeek[];

const FILES: Record<JuniorCourseSlug, MebCourseFile> = {
  jr_06_mat: matMeb as MebCourseFile,
  jr_06_fen: fenMeb as MebCourseFile,
  jr_06_turkce: turkceMeb as MebCourseFile,
  jr_06_ing_main: ingMeb as MebCourseFile,
  jr_06_sosyal: sosyalMeb as MebCourseFile,
};

const TOPICS: Record<JuniorCourseSlug, TopicCalendar[]> = {
  jr_06_mat: matCalendar as TopicCalendar[],
  jr_06_fen: fenCalendar as TopicCalendar[],
  jr_06_turkce: turkceCalendar as TopicCalendar[],
  jr_06_ing_main: ingCalendar as TopicCalendar[],
  jr_06_sosyal: sosyalCalendar as TopicCalendar[],
};

export type JuniorCalendarBundle = {
  outcomes: readonly MebOutcome[];
  topics: readonly TopicCalendar[];
  weeks: readonly SchoolWeek[];
  weeklyHours: number;
  programHours: number;
};

export function juniorCalendarBundle(slug: JuniorCourseSlug): JuniorCalendarBundle {
  const file = FILES[slug];
  return {
    outcomes: file.outcomes,
    topics: TOPICS[slug],
    weeks: WEEKS,
    weeklyHours: file.weeklyHours,
    programHours: file.programHours,
  };
}

export function juniorSchoolWeekRows(): readonly SchoolWeek[] {
  return WEEKS;
}
