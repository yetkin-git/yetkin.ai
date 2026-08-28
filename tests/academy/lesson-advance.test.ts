import { describe, expect, it } from "vitest";
import {
  canAdvanceAcademyPlayerLesson,
  nextAcademyPlayerLesson,
  prevAcademyPlayerLesson,
  shouldAutoAdvanceAfterListenEnded,
  shouldStartListenAfterChallengeSkip,
} from "@/lib/academy/lesson-advance";

describe("akademi ders geçiş mimarisi", () => {
  const lessons = [
    { key: "l1", open: true, completed: false },
    { key: "l2", open: false, completed: false },
    { key: "l3", open: false, completed: false },
  ];

  it("sıradaki dersi atlamadan seçer", () => {
    expect(nextAcademyPlayerLesson(lessons, "l1")?.key).toBe("l2");
    expect(nextAcademyPlayerLesson(lessons, "l3")).toBeNull();
    expect(prevAcademyPlayerLesson(lessons, "l2")?.key).toBe("l1");
    expect(prevAcademyPlayerLesson(lessons, "l1")).toBeNull();
  });

  it("açık derste tamamlanmadan sıradaki derse geçişe izin verir", () => {
    const current = lessons[0]!;
    const next = lessons[1]!;
    expect(canAdvanceAcademyPlayerLesson(current, next)).toBe(true);
  });

  it("ödev atlandığında TTS her zaman başlar (Otomatik Geçiş kapalı olsa bile)", () => {
    expect(shouldStartListenAfterChallengeSkip(false)).toBe(true);
    expect(shouldStartListenAfterChallengeSkip(true)).toBe(true);
  });

  it("TTS fallback seste otomatik geçişi keser; CTA bekler", () => {
    expect(
      shouldAutoAdvanceAfterListenEnded({ autoAdvanceEnabled: true, fallback: true }),
    ).toBe(false);
    expect(
      shouldAutoAdvanceAfterListenEnded({ autoAdvanceEnabled: true, fallback: false }),
    ).toBe(true);
  });
});
