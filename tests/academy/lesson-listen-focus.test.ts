import { describe, expect, it } from "vitest";
import { ACADEMY_COURSE_SEEDS } from "@/lib/academy/seed";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { spokenAcademyLessonBody } from "@/lib/academy/lesson-body";
import { composeAcademyLessonBlocks } from "@/lib/academy/lesson-media";
import {
  ACADEMY_LISTEN_SCROLL_OVERRIDE_MS,
  ACADEMY_LISTEN_VISUAL_TAIL_RATIO,
  academyLessonListenFocusCues,
  academyLessonListenProgressRatio,
  activeAcademyLessonListenFocusIndex,
} from "@/archived/lib/academy-studio/lesson-listen-focus";

const FIXTURE_BODY = [
  "Birinci cümle burada kalır.",
  "İkinci paragraf şemadan önce durur.",
  "```params\ntutar | kuruş\n```",
  "```adim\nSatır okunur\nTutar sabitlenir\n```",
  "```json\n{\"ok\":true}\n```",
].join("\n\n");

function fixtureBlocks() {
  return composeAcademyLessonBlocks({
    body: FIXTURE_BODY,
    microVideos: [
      {
        afterParagraph: 0,
        title: "Akış",
        caption: "Sessiz döngü.",
        durationSec: 6,
        assetKey: "ledger-single-balance",
      },
    ],
    diagrams: [
      {
        afterParagraph: 1,
        title: "Şema",
        caption: "Tek yazıcı.",
        diagramKey: "ledger-single-balance",
      },
    ],
  });
}

function kindAt(
  blocks: ReturnType<typeof fixtureBlocks>,
  progress: number,
): string | null {
  const cues = academyLessonListenFocusCues(blocks);
  const index = activeAcademyLessonListenFocusIndex(cues, progress);
  return index === null ? null : blocks[index]?.kind ?? null;
}

describe("dersi dinle odak zaman çizelgesi", () => {
  it("konuşulan uzunluk TTS gövdesi ile örtüşür; kod çiti odağa girmez", () => {
    const blocks = fixtureBlocks();
    const cues = academyLessonListenFocusCues(blocks);
    expect(blocks.map((block) => block.kind)).toEqual([
      "text",
      "micro-video",
      "text",
      "diagram",
      "params",
      "steps",
      "code",
    ]);
    expect(cues.at(-1)?.end).toBe(spokenAcademyLessonBody(FIXTURE_BODY).length);
    expect(cues.some((cue) => blocks[cue.blockIndex]?.kind === "code")).toBe(false);
    expect(ACADEMY_LISTEN_VISUAL_TAIL_RATIO).toBe(0.2);
    expect(ACADEMY_LISTEN_SCROLL_OVERRIDE_MS).toBe(8_000);
  });

  it("ses ilerlemesi metin → mikro-video → metin → şema → parametre → adım izler", () => {
    const blocks = fixtureBlocks();
    const cues = academyLessonListenFocusCues(blocks);
    const total = cues.at(-1)!.end;
    const mid = (cue: (typeof cues)[number]) => (cue.start + cue.end) / 2 / total;
    const byKind = (kind: string) => cues.find((cue) => blocks[cue.blockIndex]?.kind === kind)!;

    expect(kindAt(blocks, 0)).toBe("text");
    expect(kindAt(blocks, mid(byKind("micro-video")))).toBe("micro-video");
    expect(kindAt(blocks, mid(byKind("diagram")))).toBe("diagram");
    expect(kindAt(blocks, mid(byKind("params")))).toBe("params");
    expect(kindAt(blocks, mid(byKind("steps")))).toBe("steps");
    expect(kindAt(blocks, 1)).toBe("steps");
    expect(academyLessonListenProgressRatio(30, 60)).toBe(0.5);
    expect(academyLessonListenProgressRatio(90, 60)).toBe(1);
    expect(academyLessonListenProgressRatio(0, 0)).toBe(0);
  });

  it("36 yayında derste mikro-video ve şema kuyruk odağındadır", { timeout: 40_000 }, () => {
    for (const row of ACADEMY_COURSE_SEEDS) {
      for (const lesson of curriculumForCourseSlug(row.slug)) {
        const blocks = composeAcademyLessonBlocks(lesson);
        const cues = academyLessonListenFocusCues(blocks);
        const kinds = new Set(cues.map((cue) => blocks[cue.blockIndex]!.kind));
        expect(kinds.has("text"), lesson.key).toBe(true);
        expect(kinds.has("micro-video"), lesson.key).toBe(true);
        expect(kinds.has("diagram"), lesson.key).toBe(true);
        expect(kinds.has("params"), lesson.key).toBe(true);
        expect(kinds.has("steps"), lesson.key).toBe(true);
        expect(kinds.has("code"), lesson.key).toBe(false);
        expect(cues.at(-1)?.end, lesson.key).toBe(spokenAcademyLessonBody(lesson.body).length);
      }
    }
  });
});
