import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { academyCinemaActiveCue } from "@/lib/academy/lesson-cinema";
import {
  academyLessonCueSpokenDuration,
  hasAcademyLessonCues,
  loadAcademyLessonCues,
} from "@/lib/academy/lesson-cues";
import {
  academyVisualStageCardsMatchCues,
  hasAcademyLessonVisualStage,
  loadAcademyLessonVisualStage,
} from "@/lib/academy/lesson-visual-stage";
import { academyCitizenPlayerLayer } from "@/lib/academy/citizen-player-layer";
import { loadAcademySealedAudioTimings } from "@/lib/academy/lesson-audio-timings";
import { academyLessonAudioReleaseDiskPath } from "@/lib/academy/media-release-seal";
import { academyKaraokeCaptionsCompact, loadAcademyTeleprompterFlow } from "@/lib/academy/lesson-teleprompter-flow";
import { collapseAcademyLessonProse } from "@/lib/academy/lesson-body";
import {
  academySpokenScriptWordCount,
  isAcademySpokenScriptLessonKey,
  loadAcademySpokenScriptMarkdownParagraphs,
  loadAcademySpokenScriptParagraphs,
  loadAcademySpokenScriptProse,
} from "@/lib/academy/spoken-scripts";
import {
  ACADEMY_TTS_LESSON_BREATH_BLOCK_MAX,
  ACADEMY_TTS_LESSON_REQUEST_MIN,
  splitAcademyTtsBreathChunks,
} from "@/lib/academy/tts-breath-chunks";
import { isAcademyLessonAudioSealed } from "@/lib/academy/pilot-sku";

const ROOT = process.cwd();
const POSTER = join(ROOT, "public/academy/cinema/03_social_media_ai-1-eye.jpg");
const LESSONS = [1, 2, 3, 4, 5, 6].map((n) => `03_social_media_ai-${n}` as const);

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("03_social_media_ai spoken script ve cue", () => {
  it.each(LESSONS)("%s Deniz cue F.1.1 akışına kilitlenir", (lessonKey) => {
    expect(isAcademySpokenScriptLessonKey(lessonKey)).toBe(true);
    expect(hasAcademyLessonCues(lessonKey)).toBe(true);
    expect(academyKaraokeCaptionsCompact(lessonKey)).toBe(true);
    expect(hasAcademyLessonVisualStage(lessonKey)).toBe(true);
    expect(academyVisualStageCardsMatchCues(lessonKey)).toBe(true);
    expect(loadAcademyLessonVisualStage(lessonKey)?.posterSrc).toBe(
      "/academy/cinema/03_social_media_ai-1-eye.jpg",
    );

    const prose = loadAcademySpokenScriptProse(lessonKey);
    const words = academySpokenScriptWordCount(prose);
    expect(prose).not.toMatch(/```/u);
    expect(words).toBeGreaterThanOrEqual(640);
    expect(words).toBeLessThanOrEqual(1600);
    expect(prose).toMatch(/Ben Deniz/u);
    expect(prose).not.toMatch(/\bMidjourney\b/u);
    expect(prose).not.toMatch(/\bCapCut\b/u);
    expect(prose).not.toMatch(/\bChatGPT\b/u);

    const paragraphs = loadAcademySpokenScriptParagraphs(lessonKey);
    expect(paragraphs).toEqual(loadAcademySpokenScriptMarkdownParagraphs(lessonKey));
    expect(paragraphs.length).toBe(12);
    const breathChunks = paragraphs.flatMap((paragraph) => splitAcademyTtsBreathChunks(paragraph));
    expect(breathChunks.length).toBeGreaterThanOrEqual(ACADEMY_TTS_LESSON_REQUEST_MIN);
    expect(breathChunks.length).toBeLessThanOrEqual(ACADEMY_TTS_LESSON_BREATH_BLOCK_MAX);

    const cues = loadAcademyLessonCues(lessonKey);
    expect(cues).toHaveLength(4);
    expect(cues.map((cue) => cue.id)).toEqual(["cue-01", "cue-02", "cue-03", "cue-04"]);
    expect(cues[0]).toMatchObject({ start: 0, end: 90, section: "Isınma & İş Problemi" });
    expect(cues[1]).toMatchObject({ start: 90, end: 300, section: "Temel Yöntem" });
    expect(cues[2]).toMatchObject({ start: 300, end: 510, section: "İstisna & Kritik Durum" });
    expect(cues[3]).toMatchObject({ start: 510, end: 600, section: "Özet & Saha Görevi" });
    expect(academyLessonCueSpokenDuration(cues)).toBe(600);

    const cueScript = cues.flatMap((cue) => cue.paragraphs ?? []).join(" ");
    expect(cueScript).toMatch(/Ben Deniz/u);
    expect(cueScript).not.toMatch(/Midcörni/u);
    expect(cueScript).not.toMatch(/Kepkat/u);

    const fromCues = collapseAcademyLessonProse(cues.flatMap((cue) => cue.paragraphs ?? []).join(" "));
    const fromMd = collapseAcademyLessonProse(
      readSrc(`lib/academy/spoken-scripts/${lessonKey}.md`)
        .replace(/<!--[\s\S]*?-->/gu, " ")
        .replace(/\s+/gu, " ")
        .trim(),
    );
    expect(fromCues).toBe(fromMd);

    const at = (currentTime: number) =>
      academyCinemaActiveCue({
        cues,
        currentTime,
        audioDuration: 600,
        spokenDuration: 600,
        audioLeadInSec: 0,
        clock: "media",
      })?.id;
    expect(at(0)).toBe("cue-01");
    expect(at(90)).toBe("cue-02");
    expect(at(300)).toBe("cue-03");
    expect(at(510)).toBe("cue-04");

    const flow = loadAcademyTeleprompterFlow(lessonKey);
    expect(flow.length).toBeGreaterThan(0);
    expect(flow[0]?.start).toBe(0);
  });

  it("saha görevi ve erişim köprüsü her bölümde durur", () => {
    expect(loadAcademySpokenScriptProse("03_social_media_ai-1")).toMatch(
      /otuz günlük takvim taslağını elinde görmeden ikinci bölüme geçme/u,
    );
    expect(loadAcademySpokenScriptProse("03_social_media_ai-2")).toMatch(
      /stüdyo karesini görmeden üçüncü bölüme geçme/u,
    );
    expect(loadAcademySpokenScriptProse("03_social_media_ai-1")).toMatch(/Midcörni/u);
    expect(loadAcademySpokenScriptProse("03_social_media_ai-2")).toMatch(/Midcörni/u);
    expect(loadAcademySpokenScriptProse("03_social_media_ai-2")).toMatch(/Flaks/u);
    expect(loadAcademySpokenScriptProse("03_social_media_ai-3")).toMatch(
      /kancanın ekranda nasıl parladığını görmeden dördüncü bölüme geçme/u,
    );
    expect(loadAcademySpokenScriptProse("03_social_media_ai-4")).toMatch(
      /profesyonel bir sesten duymadan beşinci bölüme geçme/u,
    );
    expect(loadAcademySpokenScriptProse("03_social_media_ai-5")).toMatch(
      /telefonunda izlemeden altıncı bölüme geçme/u,
    );
    expect(loadAcademySpokenScriptProse("03_social_media_ai-6")).toMatch(
      /takvime düşmeden kendini mezun sayma/u,
    );
    expect(loadAcademySpokenScriptProse("03_social_media_ai-5")).toMatch(/Kepkat/u);
    expect(loadAcademySpokenScriptProse("03_social_media_ai-5")).toMatch(/Ranvey/u);
    expect(loadAcademySpokenScriptProse("03_social_media_ai-5")).toMatch(/Kiling/u);
  });

  it.each(LESSONS)("%s diskte mühürlü WAV ve 12 timings parçası durur", (lessonKey) => {
    expect(isAcademyLessonAudioSealed("03_social_media_ai", lessonKey)).toBe(true);
    const timings = loadAcademySealedAudioTimings(lessonKey);
    expect(timings).not.toBeNull();
    expect(timings!.pieces.length).toBe(12);
    expect(timings!.durationSec).toBeGreaterThanOrEqual(360);
    const diskPath = academyLessonAudioReleaseDiskPath("03_social_media_ai", lessonKey, ROOT);
    expect(existsSync(diskPath)).toBe(true);
    expect(readFileSync(diskPath).subarray(0, 3).toString()).toBe("ID3");
    const layer = academyCitizenPlayerLayer("03_social_media_ai", lessonKey);
    expect(layer.kind).toBe("article+karaoke");
    if (layer.kind !== "article+karaoke") {
      return;
    }
    expect(layer.audioSrc).toContain(`/media/academy/audio/03_social_media_ai/${lessonKey}.mp3`);
    expect(layer.durationSec).toBe(Math.round(timings!.durationSec));
    expect(layer.cues.length).toBeGreaterThanOrEqual(timings!.pieces.length);
  });

  it("göz katmanı plakası JPEG durur; mühürlü karaoke katmanı açılır", () => {
    expect(existsSync(POSTER)).toBe(true);
    expect(readFileSync(POSTER).subarray(0, 3)).toEqual(Buffer.from([0xff, 0xd8, 0xff]));
    expect(isAcademyLessonAudioSealed("03_social_media_ai", "03_social_media_ai-1")).toBe(true);
    const layer = academyCitizenPlayerLayer("03_social_media_ai", "03_social_media_ai-1");
    expect(layer.kind).toBe("article+karaoke");
    if (layer.kind !== "article+karaoke") {
      return;
    }
    expect(layer.audioSrc).toContain("/media/academy/audio/03_social_media_ai/03_social_media_ai-1.mp3");
    expect(layer.durationSec).toBeGreaterThanOrEqual(360);
  });
});
