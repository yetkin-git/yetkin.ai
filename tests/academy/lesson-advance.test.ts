import { describe, expect, it } from "vitest";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { academyBedOutroTailSec } from "@/lib/academy/lesson-bed-duck";
import { academyPlayerClockDurationSec, academySealedAudioDurationSec } from "@/lib/academy/lesson-audio";
import { formatAcademyCinemaClock } from "@/lib/academy/lesson-cinema";
import {
  ACADEMY_LESSON_AUTO_ADVANCE_DEFAULT,
  ACADEMY_LESSON_AUTO_ADVANCE_STORAGE_KEY,
  canAdvanceAcademyPlayerLesson,
  hasAcademyLessonPlaybackReachedEnd,
  isAcademyPlayerExamReady,
  academyPlayerAutoAdvanceTargetKey,
  nextAcademyPlayerLesson,
  parseStoredAcademyLessonAutoAdvance,
  prevAcademyPlayerLesson,
  readAcademyLessonAutoAdvanceFromStorage,
  resolveAcademyAutoAdvanceNextLesson,
  serializeAcademyLessonAutoAdvance,
  shouldAutoAdvanceAfterListenEnded,
  shouldSealProgressAfterDialogueEnded,
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

  it("Otomatik Geçiş tercihi academy_autoplay_enabled üzerinde varsayılan açık saklanır", () => {
    expect(ACADEMY_LESSON_AUTO_ADVANCE_STORAGE_KEY).toBe("academy_autoplay_enabled");
    expect(ACADEMY_LESSON_AUTO_ADVANCE_DEFAULT).toBe(true);
    expect(parseStoredAcademyLessonAutoAdvance(null)).toBe(true);
    expect(parseStoredAcademyLessonAutoAdvance("1")).toBe(true);
    expect(parseStoredAcademyLessonAutoAdvance("0")).toBe(false);
    expect(parseStoredAcademyLessonAutoAdvance("false")).toBe(false);
    expect(serializeAcademyLessonAutoAdvance(true)).toBe("1");
    expect(serializeAcademyLessonAutoAdvance(false)).toBe("0");
    expect(readAcademyLessonAutoAdvanceFromStorage()).toBe(true);
  });

  it("ses bitince otomatik geçiş açık ve sıradaki ders açıksa sonraki derse gider; kapalıysa son karede kalır", () => {
    const current = lessons[0]!;
    const next = { ...lessons[1]!, open: true };
    expect(
      resolveAcademyAutoAdvanceNextLesson({
        autoAdvanceEnabled: true,
        current,
        next,
      })?.key,
    ).toBe("l2");
    expect(
      resolveAcademyAutoAdvanceNextLesson({
        autoAdvanceEnabled: false,
        current,
        next,
      }),
    ).toBeNull();
    expect(
      resolveAcademyAutoAdvanceNextLesson({
        autoAdvanceEnabled: true,
        fallback: true,
        current,
        next,
      }),
    ).toBeNull();
    expect(
      resolveAcademyAutoAdvanceNextLesson({
        autoAdvanceEnabled: true,
        current,
        next: null,
      }),
    ).toBeNull();
  });

  it("ekran saati 07:05/07:05 iken kaset milisaniyesi tam cap olmasa da bitti sayılır", () => {
    const durationSec = academyPlayerClockDurationSec({
      audioDuration: 0,
      sealedDuration: academySealedAudioDurationSec("01_office_ai", "01_office_ai-5"),
      spokenDuration: 0,
      outroTailSec: academyBedOutroTailSec("01_office_ai-5"),
    });
    expect(formatAcademyCinemaClock(durationSec)).toBe("07:05");
    expect(formatAcademyCinemaClock(485)).toBe("08:05");
    expect(hasAcademyLessonPlaybackReachedEnd({ currentTime: 486, durationSec })).toBe(true);
    expect(
      hasAcademyLessonPlaybackReachedEnd({ currentTime: 485, durationSec: 485.5 }),
    ).toBe(true);
    expect(
      hasAcademyLessonPlaybackReachedEnd({ currentTime: 484.9, durationSec: 485.5 }),
    ).toBe(false);
    expect(
      hasAcademyLessonPlaybackReachedEnd({ currentTime: 481.96, durationSec: 481.96 }),
    ).toBe(true);
    expect(hasAcademyLessonPlaybackReachedEnd({ currentTime: 0, durationSec: 485.5 })).toBe(false);
    expect(hasAcademyLessonPlaybackReachedEnd({ currentTime: 8, durationSec: 0 })).toBe(false);
  });

  it("tamamlanmış 5. dersten kilitli görünen 6. derse otomatik geçişe izin verir", () => {
    const current = { key: "01_office_ai-5", open: true, completed: true };
    const next = { key: "01_office_ai-6", open: false, completed: false };
    expect(canAdvanceAcademyPlayerLesson(current, next)).toBe(true);
    expect(
      resolveAcademyAutoAdvanceNextLesson({
        autoAdvanceEnabled: true,
        current,
        next,
      })?.key,
    ).toBe("01_office_ai-6");
  });

  it("01_office_ai müfredatında 5. dersin sıradaki adımı e-posta ritüelidir", () => {
    const office = curriculumForCourseSlug("01_office_ai").map((lesson) => ({
      key: lesson.key,
      open: true,
      completed: false,
    }));
    expect(nextAcademyPlayerLesson(office, "01_office_ai-5")?.key).toBe("01_office_ai-4");
  });

  it("otomatik geçiş tamamlanmış 2. dersi atlamaz; sunucu resume 3 olsa da 1 → 2 gider", () => {
    const office = curriculumForCourseSlug("01_office_ai").map((lesson, index) => ({
      key: lesson.key,
      open: true,
      completed: index === 1,
    }));
    expect(office[0]?.key).toBe("01_office_ai-1");
    expect(office[1]?.key).toBe("01_office_ai-k1");
    expect(office[2]?.key).toBe("01_office_ai-2");
    expect(nextAcademyPlayerLesson(office, "01_office_ai-1")?.key).toBe("01_office_ai-k1");
    expect(
      academyPlayerAutoAdvanceTargetKey({
        autoAdvanceEnabled: true,
        lessons: office,
        endedLessonKey: "01_office_ai-1",
        resumeLessonKey: "01_office_ai-2",
      }),
    ).toBe("01_office_ai-k1");
    expect(
      academyPlayerAutoAdvanceTargetKey({
        autoAdvanceEnabled: false,
        lessons: office,
        endedLessonKey: "01_office_ai-1",
        resumeLessonKey: "01_office_ai-2",
      }),
    ).toBeNull();
  });

  it("gerçek diyalog bitince ilerleme mühürlenir; sahte 8 sn mühür basmaz", () => {
    expect(shouldSealProgressAfterDialogueEnded({ playbackStarted: true, reachedEnd: true })).toBe(
      true,
    );
    expect(shouldSealProgressAfterDialogueEnded({ playbackStarted: false, reachedEnd: true })).toBe(
      false,
    );
  });

  it("6/6 yerel mühürde sınav kapısı refresh beklemeden açılır", () => {
    const lessons = [
      { key: "l1", completed: true },
      { key: "l2", completed: true },
      { key: "l3", completed: true },
      { key: "l4", completed: true },
      { key: "l5", completed: true },
      { key: "l6", completed: false },
    ];
    expect(
      isAcademyPlayerExamReady({
        curriculumComplete: false,
        workTasksComplete: false,
        lessons,
        completedKeys: new Set(["l1", "l2", "l3", "l4", "l5"]),
      }),
    ).toBe(false);
    expect(
      isAcademyPlayerExamReady({
        curriculumComplete: false,
        workTasksComplete: false,
        lessons,
        completedKeys: new Set(["l1", "l2", "l3", "l4", "l5", "l6"]),
      }),
    ).toBe(true);
  });
});
