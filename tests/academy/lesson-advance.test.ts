import { describe, expect, it } from "vitest";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { academyBedOutroTailSec, academyPlayerOutroTailSec, ACADEMY_OUTRO_BREATH_MS, ACADEMY_OUTRO_BREATH_SEC } from "@/lib/academy/lesson-bed-duck";
import { academyPlayerClockDurationSec, academySealedAudioDurationSec } from "@/lib/academy/lesson-audio";
import { formatAcademyCinemaClock } from "@/lib/academy/lesson-cinema";
import { academyPlaybackCueAtTime, loadAcademyLessonPlaybackCues } from "@/lib/academy/lesson-cues";
import { loadAcademySealedAudioTimings } from "@/lib/academy/lesson-audio-timings";
import {
  academyVisualStageActiveCard,
  loadAcademyLessonVisualStage,
} from "@/lib/academy/lesson-visual-stage";
import {
  ACADEMY_LESSON_AUTO_ADVANCE_DEFAULT,
  ACADEMY_LESSON_AUTO_ADVANCE_STORAGE_KEY,
  academyOutroBreathRemainMs,
  canAdvanceAcademyPlayerLesson,
  academyLessonAudioEndedIsComplete,
  hasAcademyLessonPlaybackReachedEnd,
  hasAcademyOutroBreathElapsed,
  isAcademyPlayerExamReady,
  academyPlayerAutoAdvanceTargetKey,
  nextAcademyPlayerLesson,
  parseStoredAcademyLessonAutoAdvance,
  prevAcademyPlayerLesson,
  readAcademyLessonAutoAdvanceFromStorage,
  resolveAcademyAutoAdvanceNextLesson,
  serializeAcademyLessonAutoAdvance,
  shouldAutoAdvanceAfterListenEnded,
  shouldAutoAdvanceAfterOutroBreath,
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

  it("sıradaki ders open değilse geçişe izin vermez", () => {
    const current = lessons[0]!;
    const next = lessons[1]!;
    expect(canAdvanceAcademyPlayerLesson(current, next)).toBe(false);
    expect(canAdvanceAcademyPlayerLesson(current, { ...next, open: true })).toBe(true);
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

  it("ses bitince 2.5 sn outro nefes payı dolmadan otomatik geçiş yok; dip fade bu sürede sıfırlanır", () => {
    expect(ACADEMY_OUTRO_BREATH_MS).toBe(2_500);
    expect(ACADEMY_OUTRO_BREATH_SEC).toBe(2.5);
    expect(hasAcademyOutroBreathElapsed(0)).toBe(false);
    expect(hasAcademyOutroBreathElapsed(2_499)).toBe(false);
    expect(hasAcademyOutroBreathElapsed(2_500)).toBe(true);
    expect(
      shouldAutoAdvanceAfterOutroBreath({
        autoAdvanceEnabled: true,
        fallback: false,
        intoBreathMs: 0,
      }),
    ).toBe(false);
    expect(
      shouldAutoAdvanceAfterOutroBreath({
        autoAdvanceEnabled: true,
        fallback: false,
        intoBreathMs: 2_500,
      }),
    ).toBe(true);
    expect(
      shouldAutoAdvanceAfterOutroBreath({
        autoAdvanceEnabled: false,
        fallback: false,
        intoBreathMs: 2_500,
      }),
    ).toBe(false);
    expect(academyOutroBreathRemainMs({ elapsedSec: 100, durationSec: 100 })).toBe(2_500);
    expect(academyOutroBreathRemainMs({ elapsedSec: 100, durationSec: 102.5 })).toBe(2_500);
    expect(
      academyOutroBreathRemainMs({
        elapsedSec: 104,
        durationSec: 104.5,
        intoBreathMs: 4_000,
        breathMs: 4_500,
      }),
    ).toBe(500);
    expect(academyPlayerOutroTailSec("unknown-lesson")).toBe(ACADEMY_OUTRO_BREATH_SEC);
    expect(academyPlayerOutroTailSec("01_office_ai-5")).toBe(academyBedOutroTailSec("01_office_ai-5"));
    expect(academyPlayerOutroTailSec("01_office_ai-5")).toBeGreaterThanOrEqual(ACADEMY_OUTRO_BREATH_SEC);
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

  it("ekran saati 09:17 iken kaset milisaniyesi tam cap olmasa da bitti sayılır", () => {
    const durationSec = academyPlayerClockDurationSec({
      audioDuration: 0,
      sealedDuration: academySealedAudioDurationSec("01_office_ai", "01_office_ai-5"),
      spokenDuration: 0,
      outroTailSec: academyBedOutroTailSec("01_office_ai-5"),
    });
    expect(formatAcademyCinemaClock(durationSec)).toBe("09:17");
    expect(formatAcademyCinemaClock(485)).toBe("08:05");
    expect(
      hasAcademyLessonPlaybackReachedEnd({ currentTime: Math.floor(durationSec), durationSec }),
    ).toBe(true);
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

  it("11:32 kaset 3. saniyede ve ilk cue sonunda bitmez; sahne cue damgasında kalır", () => {
    const lessonKey = "01_office_ai_ileri-4";
    const timings = loadAcademySealedAudioTimings(lessonKey);
    const sealed = timings?.durationSec ?? 0;
    expect(sealed).toBeGreaterThan(11 * 60);
    expect(
      academyLessonAudioEndedIsComplete({ ended: false, currentTime: 3, sealedDurationSec: sealed }),
    ).toBe(false);
    expect(
      academyLessonAudioEndedIsComplete({ ended: true, currentTime: 3, sealedDurationSec: sealed }),
    ).toBe(false);
    const firstCueEnd = timings?.pieces.find((piece) => piece.cueId === "cue-01")?.end ?? 0;
    expect(firstCueEnd).toBeGreaterThan(3);
    expect(
      academyLessonAudioEndedIsComplete({
        ended: true,
        currentTime: firstCueEnd,
        sealedDurationSec: sealed,
      }),
    ).toBe(false);
    expect(
      academyLessonAudioEndedIsComplete({
        ended: false,
        currentTime: sealed,
        sealedDurationSec: sealed,
      }),
    ).toBe(false);
    expect(
      academyLessonAudioEndedIsComplete({
        ended: true,
        currentTime: sealed,
        sealedDurationSec: sealed,
      }),
    ).toBe(true);

    const cues = loadAcademyLessonPlaybackCues(lessonKey);
    const stage = loadAcademyLessonVisualStage(lessonKey);
    expect(stage).not.toBeNull();
    const openingId = cues[0]?.id;
    expect(academyPlaybackCueAtTime(cues, 3)?.id).toBe(openingId);
    expect(academyVisualStageActiveCard(stage!, 3)?.cueId).toBe(openingId);
    for (let second = 0; second <= Math.floor(sealed); second += 1) {
      const cue = academyPlaybackCueAtTime(cues, second);
      const card = academyVisualStageActiveCard(stage!, second);
      if (cue) {
        expect(card?.cueId).toBe(cue.id);
      }
      expect(
        academyLessonAudioEndedIsComplete({
          ended: second + 1.5 < sealed,
          currentTime: second,
          sealedDurationSec: sealed,
        }),
      ).toBe(false);
    }
  });

  it("kilitli sıradaki derse otomatik geçiş null döner", () => {
    const current = { key: "01_office_ai-5", open: true, completed: true };
    const next = { key: "01_office_ai-6", open: false, completed: false };
    expect(canAdvanceAcademyPlayerLesson(current, next)).toBe(false);
    expect(
      resolveAcademyAutoAdvanceNextLesson({
        autoAdvanceEnabled: true,
        current,
        next,
      }),
    ).toBeNull();
    expect(
      academyPlayerAutoAdvanceTargetKey({
        autoAdvanceEnabled: true,
        lessons: [current, next],
        endedLessonKey: current.key,
      }),
    ).toBeNull();
  });

  it("01_office_ai müfredatında 5. dersin sıradaki adımı e-posta ritüelidir", () => {
    const office = curriculumForCourseSlug("01_office_ai").map((lesson) => ({
      key: lesson.key,
      open: true,
      completed: false,
    }));
    expect(nextAcademyPlayerLesson(office, "01_office_ai-5")?.key).toBe("01_office_ai-g1");
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
