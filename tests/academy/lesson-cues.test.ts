import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { academyCinemaActiveCue, academyCinemaCaptionText } from "@/lib/academy/lesson-cinema";
import {
  academyLessonCueSpokenDuration,
  hasAcademyLessonCues,
  loadAcademyLessonCues,
} from "@/lib/academy/lesson-cues";
import { ACADEMY_MEDIA_SEALED_AUDIO } from "@/lib/academy/pilot-sku";

const ROOT = process.cwd();
const CUE_PATH = join(ROOT, "lib/academy/lesson-cues/01_office_ai-1.json");

describe("01_office_ai-1 sinematik cue SSOT", () => {
  it("beş sahne JSON diskte durur ve oynatıcıya yüklenir", () => {
    expect(existsSync(CUE_PATH)).toBe(true);
    const raw = JSON.parse(readFileSync(CUE_PATH, "utf8")) as unknown;
    expect(Array.isArray(raw)).toBe(true);
    expect((raw as unknown[]).length).toBe(5);

    const cues = loadAcademyLessonCues("01_office_ai-1");
    expect(cues).toHaveLength(5);
    expect(cues.map((cue) => cue.id)).toEqual(["cue-01", "cue-02", "cue-03", "cue-04", "cue-05"]);
    expect(cues[0]).toMatchObject({
      start: 0,
      end: 45,
      section: "Giriş & Problem",
      text: "Her gün mesai saatlerinin en az iki saatinin nereye gittiğini hiç düşündün mü?",
    });
    expect(cues[4]).toMatchObject({
      start: 375,
      end: 450,
      section: "Kapanış & Saha Görevi",
    });
    expect(academyLessonCueSpokenDuration(cues)).toBe(450);
    expect(hasAcademyLessonCues("01_office_ai-1")).toBe(true);
    expect(hasAcademyLessonCues("01_office_ai-2")).toBe(true);
    expect(hasAcademyLessonCues("01_office_ai-3")).toBe(true);
    expect(hasAcademyLessonCues("01_office_ai-4")).toBe(true);
    expect(hasAcademyLessonCues("01_office_ai-5")).toBe(true);
    expect(hasAcademyLessonCues("01_office_ai-6")).toBe(true);
    expect(loadAcademyLessonCues("01_office_ai-2")).toHaveLength(5);
    expect(loadAcademyLessonCues("01_office_ai-3")).toHaveLength(5);
    expect(loadAcademyLessonCues("01_office_ai-4")).toHaveLength(5);
    expect(loadAcademyLessonCues("01_office_ai-5")).toHaveLength(5);
    expect(loadAcademyLessonCues("01_office_ai-6")).toHaveLength(5);
  });

  it("saat currentTime’dır; WAV süresi cue duvar saatine oranlanır", () => {
    const cues = loadAcademyLessonCues("01_office_ai-1");
    const spokenDuration = academyLessonCueSpokenDuration(cues);
    const atScene = (currentTime: number, audioDuration: number) =>
      academyCinemaActiveCue({
        cues,
        currentTime,
        audioDuration,
        spokenDuration,
        audioLeadInSec: 0,
      });

    expect(atScene(0, 0)?.id).toBe("cue-01");
    expect(atScene(90, 0)?.id).toBe("cue-02");
    expect(atScene(200, 0)?.id).toBe("cue-03");
    expect(atScene(300, 0)?.id).toBe("cue-04");
    expect(atScene(400, 0)?.id).toBe("cue-05");
    expect(
      academyCinemaCaptionText({
        cues,
        currentTime: 22.5,
        audioDuration: 90,
        spokenDuration,
        audioLeadInSec: 0,
      }),
    ).toBe("Soyut tanımları bir kenara bırakalım; doğrudan masadaki gerçek probleme bakalım.");
    expect(ACADEMY_MEDIA_SEALED_AUDIO["01_office_ai"]).toEqual(["01_office_ai-1", "01_office_ai-2"]);
  });

  it("compact taslak şişmez; cue ayrı dosyadadır", () => {
    const section = readFileSync(join(ROOT, "lib/academy/curricula/office_ai/section_1.ts"), "utf8");
    const curriculum = readFileSync(join(ROOT, "lib/academy/curriculum.ts"), "utf8");
    expect(section).not.toContain("cue-01");
    expect(curriculum).not.toContain("lesson-cues");
    expect(readFileSync(join(ROOT, "lib/academy/citizen-player-layer.ts"), "utf8")).toContain(
      "loadAcademyTeleprompterFlow",
    );
    expect(readFileSync(join(ROOT, "components/academy/curriculum-player.tsx"), "utf8")).toContain(
      "<LessonTeleprompter",
    );
    expect(readFileSync(join(ROOT, "components/academy/lesson-media-player.tsx"), "utf8")).not.toContain(
      "loadAcademyLessonCues",
    );
  });
});
