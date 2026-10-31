import { describe, expect, it } from "vitest";
import { juniorShelvesForGrade } from "@/lib/junior/catalog";
import {
  authorizeJuniorLiveTutor,
  JUNIOR_LIVE_TUTOR_PLAN_ERROR,
} from "@/lib/junior/live-tutor-access";
import { JUNIOR_PILOT_GRADE, juniorElectiveNotInQuotaError } from "@/lib/junior/limits";

const parent = {
  id: "22222222-2222-4222-8222-222222222222",
  email: "veli@example.com",
  emailConfirmedAt: "2026-01-01T00:00:00.000Z",
};

const audit = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "yapinet360@gmail.com",
  emailConfirmedAt: "2026-01-01T00:00:00.000Z",
};

describe("authorizeJuniorLiveTutor", () => {
  it("keeps guests on the three pilot trial lessons", () => {
    for (const lessonKey of ["jr_06_mat-1", "jr_06_mat-2", "jr_06_mat-3"]) {
      const access = authorizeJuniorLiveTutor({
        actor: null,
        lessonKey,
        planActive: false,
        selectedElectives: [],
      });
      expect(access).toEqual({ ok: true, mode: "guest-local" });
    }
  });

  it("blocks guests outside the trial list before the model", () => {
    const access = authorizeJuniorLiveTutor({
      actor: null,
      lessonKey: "jr_06_fen-1",
      planActive: false,
      selectedElectives: [],
    });
    expect(access).toEqual({ ok: false, status: 403, error: JUNIOR_LIVE_TUTOR_PLAN_ERROR });
  });

  it("blocks a session without an active plan, including a public opener", () => {
    const access = authorizeJuniorLiveTutor({
      actor: parent,
      lessonKey: "jr_06_mat-1",
      planActive: false,
      selectedElectives: [],
    });
    expect(access).toEqual({ ok: false, status: 403, error: JUNIOR_LIVE_TUTOR_PLAN_ERROR });
  });

  it("opens a core lesson for an active plan and refuses an unselected elective", () => {
    expect(
      authorizeJuniorLiveTutor({
        actor: parent,
        lessonKey: "jr_06_mat-2",
        planActive: true,
        selectedElectives: [],
      }),
    ).toEqual({ ok: true, mode: "model" });
    expect(
      authorizeJuniorLiveTutor({
        actor: parent,
        lessonKey: "jr_06_alm-2",
        planActive: true,
        selectedElectives: [],
      }),
    ).toEqual({ ok: false, status: 403, error: juniorElectiveNotInQuotaError() });
    expect(
      authorizeJuniorLiveTutor({
        actor: parent,
        lessonKey: "jr_06_alm-2",
        planActive: true,
        selectedElectives: ["jr_06_alm"],
      }),
    ).toEqual({ ok: true, mode: "model" });
  });

  it("lets an audit actor call the model without a plan", () => {
    expect(
      authorizeJuniorLiveTutor({
        actor: audit,
        lessonKey: "jr_06_alm-2",
        planActive: false,
        selectedElectives: [],
      }),
    ).toEqual({ ok: true, mode: "model" });
  });

  it("returns 404 when the lesson is not in the catalog", () => {
    const missing = authorizeJuniorLiveTutor({
      actor: null,
      lessonKey: "jr_06_mat-999",
      planActive: false,
      selectedElectives: [],
    });
    expect(missing.ok).toBe(false);
    if (!missing.ok) {
      expect(missing.status).toBe(404);
    }
  });
});

describe("juniorShelvesForGrade", () => {
  it("serves the pilot shelf only for grade 6", () => {
    const pilot = juniorShelvesForGrade(JUNIOR_PILOT_GRADE, null);
    expect(pilot.length).toBeGreaterThan(0);
    expect(pilot.every((course) => course.grade === JUNIOR_PILOT_GRADE)).toBe(true);
    expect(juniorShelvesForGrade(5, null)).toEqual([]);
    expect(juniorShelvesForGrade(7, null)).toEqual([]);
    expect(juniorShelvesForGrade(12, null)).toEqual([]);
  });
});
