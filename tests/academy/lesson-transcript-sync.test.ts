import { describe, expect, it } from "vitest";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { composeAcademyLessonBlocks } from "@/lib/academy/lesson-media";
import { academyLessonListenPreparedTurns, academyListenReadingDurationSec } from "@/archived/lib/academy-studio/lesson-listen";
import {
  ACADEMY_TTS_AUDIO_LEAD_IN_SEC,
  academyTranscriptElapsedSec,
  academyTranscriptScriptLeadInSec,
  academyTranscriptTextUnits,
  academyTtsAudioLeadInSec,
  activeAcademyTranscriptCueIndex,
  buildAcademyTranscriptTrack,
  splitAcademyTranscriptSentences,
} from "@/archived/lib/academy-studio/lesson-transcript-sync";

const FIXTURE_BODY = [
  "Giriş",
  "Birinci cümle burada kalır. İkinci cümle büyük harfle başlar.",
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
  }).filter((block) => block.kind !== "diagram" && block.kind !== "micro-video" && block.kind !== "exercise");
}

describe("canlı anlatım metni zaman çizelgesi", () => {
  it("sayı sıra noktasını cümle sanmaz; büyük harfle yeni cümle keser", () => {
    expect(splitAcademyTranscriptSentences("3. ders burada durur. Şimdi ikinci cümle gelir.")).toEqual([
      "3. ders burada durur.",
      "Şimdi ikinci cümle gelir.",
    ]);
  });

  it("kod çiti cue almaz; anons lead-in’de cümle yanmaz", () => {
    const blocks = fixtureBlocks();
    const track = buildAcademyTranscriptTrack({
      lessonKey: "fixture-1",
      title: "Tutar nasıl tutulur",
      body: FIXTURE_BODY,
      courseSlug: "python-temel",
      blocks,
    });
    expect(track.leadInSec).toBeGreaterThan(0);
    expect(track.audioLeadInSec).toBeGreaterThan(0);
    expect(track.audioLeadInSec).toBe(
      academyTtsAudioLeadInSec(Math.round(track.audioLeadInSec / ACADEMY_TTS_AUDIO_LEAD_IN_SEC)),
    );
    expect(track.bodyDuration).toBeGreaterThan(0);
    expect(track.cues.some((cue) => cue.kind === "text")).toBe(true);
    expect(track.cues.some((cue) => cue.kind === "params")).toBe(true);
    expect(track.cues.some((cue) => cue.kind === "steps")).toBe(true);
    expect(track.cues.every((cue) => cue.start >= track.leadInSec)).toBe(true);
    expect(activeAcademyTranscriptCueIndex(track.cues, 0)).toBeNull();
    expect(activeAcademyTranscriptCueIndex(track.cues, track.leadInSec - 0.01)).toBeNull();
    expect(activeAcademyTranscriptCueIndex(track.cues, track.leadInSec)).toBe(0);
    expect(track.cues[0]?.text).toBe("Giriş");
    const turns = academyLessonListenPreparedTurns("Tutar nasıl tutulur", FIXTURE_BODY, "python-temel");
    expect(turns[0]?.speaker).toBe("announcer");
    expect(academyListenReadingDurationSec(turns[0]!.text)).toBeGreaterThan(0);
    const scriptLeadIn = academyTranscriptScriptLeadInSec(
      "Tutar nasıl tutulur",
      FIXTURE_BODY,
      "python-temel",
    );
    expect(track.leadInSec).toBeCloseTo(scriptLeadIn, 5);
  });

  it("WAV süresi kelime saatine oranlanır; kısa kaset tüm cümleleri yakmaz", () => {
    expect(
      academyTranscriptElapsedSec({
        currentTime: 5,
        audioDuration: 10,
        spokenDuration: 100,
      }),
    ).toBe(50);
    expect(
      academyTranscriptElapsedSec({
        currentTime: 5,
        audioDuration: 10,
        spokenDuration: 100,
        audioLeadInSec: 2,
      }),
    ).toBe(51);
    expect(academyTtsAudioLeadInSec(4)).toBe(4 * ACADEMY_TTS_AUDIO_LEAD_IN_SEC);
    const blocks = fixtureBlocks();
    const track = buildAcademyTranscriptTrack({
      lessonKey: "fixture-1",
      title: "Tutar nasıl tutulur",
      body: FIXTURE_BODY,
      courseSlug: "python-temel",
      blocks,
    });
    const earlyIndex = activeAcademyTranscriptCueIndex(track.cues, track.leadInSec + 0.02);
    const lateIndex = activeAcademyTranscriptCueIndex(
      track.cues,
      track.leadInSec + track.bodyDuration * 0.85,
    );
    expect(earlyIndex).toBe(0);
    expect(lateIndex).not.toBeNull();
    expect(lateIndex).toBeGreaterThan(earlyIndex!);
    expect(lateIndex).toBeLessThan(track.cues.length);
  });

  it("yayındaki Python dersinde cümle cue’ları TTS gövdesiyle aynı sırada akar", () => {
    const lesson = curriculumForCourseSlug("python-temel")[1]!;
    const blocks = composeAcademyLessonBlocks(lesson).filter(
      (block) => block.kind !== "diagram" && block.kind !== "micro-video" && block.kind !== "exercise",
    );
    const track = buildAcademyTranscriptTrack({
      lessonKey: lesson.key,
      title: lesson.title,
      body: lesson.body,
      courseSlug: "python-temel",
      blocks,
    });
    expect(track.cues.length).toBeGreaterThan(6);
    const textUnits = blocks
      .filter((block) => block.kind === "text")
      .flatMap((block) => academyTranscriptTextUnits(block.text));
    expect(textUnits.length).toBeGreaterThan(0);
    const firstText = track.cues.find((cue) => cue.kind === "text");
    expect(firstText?.text).toBe(textUnits[0]?.text);
    expect(track.leadInSec).toBeCloseTo(
      academyTranscriptScriptLeadInSec(lesson.title, lesson.body, "python-temel"),
      5,
    );
    expect(track.leadInSec).toBeLessThan(track.spokenDuration - track.bodyDuration);
    expect(track.audioLeadInSec).toBeGreaterThan(0);
    const mid = track.leadInSec + track.bodyDuration * 0.45;
    const index = activeAcademyTranscriptCueIndex(track.cues, mid);
    expect(index).not.toBeNull();
    expect(track.cues[index!]?.end).toBeGreaterThan(track.cues[index!]?.start ?? 0);
  });
});
