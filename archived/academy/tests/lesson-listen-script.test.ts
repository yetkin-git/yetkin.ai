import { describe, expect, it } from "vitest";
import { ACADEMY_INSTRUCTORS_BY_VOICE } from "@/lib/academy/instructors";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { composeAcademyLessonBlocks } from "@/lib/academy/lesson-media";
import { composePedagogicalLessonBody } from "@/lib/academy/lesson-body";
import {
  academyLessonListenPreparedTurns,
  academyLessonListenSpeechSlices,
} from "@/archived/lib/academy-studio/lesson-listen";
import {
  academyListenScriptIdleCardIndex,
  academyListenTextSpokenParts,
  activeAcademyListenScriptCardIndex,
  buildAcademyLessonListenScript,
} from "@/archived/lib/academy-studio/lesson-listen-script";
import { academyLessonFlowFromBlocks } from "@/archived/lib/academy-studio/lesson-flow";

const COURSE_SLUG = "sample-course";
const INSTRUCTOR = ACADEMY_INSTRUCTORS_BY_VOICE.Erinome;

function syntheticLesson(order: number) {
  const body = composePedagogicalLessonBody(
    {
      intro: `Bu derste ${order}. oturumda tutarı sabitleyeceğiz.`,
      development: "Gel, kayda bakalım.\n\nVaka: iki ekran sapar.",
      conclusion: "Özetle tek satır durur.\n\nBir sonraki bölümde seni sabitleme bekliyor.",
      exercise: "İsteğe bağlı: 250,00 ₺ fiyatını kuruş tamsayı olarak yaz.",
    },
    {
      params: [{ label: "tutar", value: "kuruş" }],
      steps: ["Satır okunur.", "İkinci bakiye reddedilir."],
      code: { language: "json", source: '{ "amountMinor": 25000 }' },
    },
  );
  return {
    key: `${COURSE_SLUG}-${order}`,
    order,
    title: `Örnek Ders ${order}: tutar sabitleme`,
    body,
    diagrams: [],
    microVideos: [],
  };
}

function scriptFor(lessonIndex: number) {
  expect(curriculumForCourseSlug(COURSE_SLUG)).toEqual([]);
  const lesson = syntheticLesson(lessonIndex + 1);
  const blocks = composeAcademyLessonBlocks(lesson);
  return {
    lesson,
    blocks,
    sections: academyLessonFlowFromBlocks(blocks),
    script: buildAcademyLessonListenScript({
      lessonKey: lesson.key,
      title: lesson.title,
      body: lesson.body,
      courseSlug: COURSE_SLUG,
      blocks,
    }),
  };
}

describe("ders dinleme script SSOT", () => {
  it("dört perde kartı TTS sırası ile aynı kaynaktan gelir; anons ve stüdyo sarmalayıcı yok", () => {
    const { lesson, script, sections } = scriptFor(0);
    expect(lesson.title).toContain("Örnek Ders 1");
    expect(script.lessonKey).toBe(lesson.key);
    expect(script.cards).toHaveLength(4);
    expect(script.cards.some((card) => card.kind === "announcer")).toBe(false);
    expect(script.cards.some((card) => card.kind === "moderator")).toBe(false);
    expect(script.cards.some((card) => card.kind === "instructor")).toBe(true);
    expect(script.cards.some((card) => card.kind === "code")).toBe(true);
    expect(script.cards.some((card) => card.kind === "exercise")).toBe(true);
    expect(sections).toHaveLength(4);
    for (let index = 0; index < sections.length; index += 1) {
      expect(script.cards[index]?.spokenText).toBe(sections[index]?.displayText);
      expect(script.cards[index]?.spokenText).toBe(sections[index]?.spokenText);
    }

    const turns = academyLessonListenPreparedTurns(lesson.title, lesson.body, COURSE_SLUG);
    expect(turns.some((turn) => turn.speaker === "instructor")).toBe(true);
    const slices = academyLessonListenSpeechSlices(
      lesson.title,
      lesson.body,
      INSTRUCTOR,
      COURSE_SLUG,
    );
    expect(slices.some((slice) => slice.speaker === "instructor")).toBe(true);

    expect(activeAcademyListenScriptCardIndex(script.cues, 0)).toBe(0);
    const lastSpoken = script.cards.reduce(
      (index, card, cursor) => (card.durationWeight > 0 ? cursor : index),
      0,
    );
    expect(activeAcademyListenScriptCardIndex(script.cues, 1)).toBe(lastSpoken);
    expect(academyListenScriptIdleCardIndex(script)).toBe(0);
  });

  it("ders değişince script yalnız o dersin kartlarını basar", () => {
    const first = scriptFor(0);
    const second = scriptFor(1);
    expect(first.script.lessonKey).not.toBe(second.script.lessonKey);
    expect(first.lesson.body).not.toBe(second.lesson.body);
    expect(second.script.cards.every((card) => card.blockIndex >= 0)).toBe(true);
    expect(second.script.cards[0]?.spokenText).toBe(second.sections[0]?.displayText);
    expect(second.script.cards[0]?.spokenText).not.toBe(first.script.cards[0]?.spokenText);
  });

  it("metin tek eğitmen sesine düşer; Koray / Maya replik ayrımı yok", () => {
    const parts = academyListenTextSpokenParts(
      "Giriş Değişken adı etikettir. Tip netleşmeden çarpma yapma.",
    );
    expect(parts.map((part) => part.speaker)).toEqual(["instructor"]);
    expect(parts[0]?.spokenText).toContain("Değişken adı etikettir");
    expect(parts).toHaveLength(1);
  });

  it("currentTime/duration oranına göre kart atar", () => {
    const { script } = scriptFor(1);
    const mid = script.cues[Math.floor(script.cues.length / 2)]!;
    const progress = (mid.start + mid.end) / 2 / script.cues.at(-1)!.end;
    expect(activeAcademyListenScriptCardIndex(script.cues, progress)).toBe(mid.cardIndex);
  });
});
