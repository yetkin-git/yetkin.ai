import { describe, expect, it } from "vitest";
import { RAIL_V1_HOPS_META } from "@yetkin/kernel/http/v1-hops-meta";
import { juniorLessonPlayPath } from "../../apps/rail-is/src/api/hops";
import { presentJuniorLessonPlay } from "../../apps/rail-is/src/ui/present-junior-lesson";
import { issueJuniorLessonMedia } from "@/lib/junior/media-grant";
import { buildJuniorLessonPlayData, juniorHopSpeech } from "@/lib/junior/play-wire";
import { readJuniorLesson } from "@/lib/junior/service";

const NOW = new Date("2026-10-17T12:00:00.000Z");
const PILOT = "jr_06_mat-1";

const SCENE_GRAPH_MARKERS = [
  "{@",
  "SPAWN_MARBLES",
  "GROUP_MARBLES",
  "keyframes",
  "markedText",
  "marble-tray",
  "validRockets",
  "wordBank",
] as const;

describe("jr_06_mat-1 mevcut play hop", () => {
  it("yeni hop açmaz; telefon düz konuşmayı okur, sahne grafiği sözleşmede yoktur", () => {
    const juniorLessonHops = RAIL_V1_HOPS_META.filter((hop) => hop.id.startsWith("junior-lesson-")).map(
      (hop) => hop.id,
    );
    expect(juniorLessonHops).toEqual([
      "junior-lesson-read",
      "junior-lesson-play",
      "junior-lesson-progress",
      "junior-lesson-practice",
    ]);
    expect(juniorLessonPlayPath(PILOT)).toBe("/api/v1/junior/lessons/jr_06_mat-1/play");

    const lesson = readJuniorLesson(PILOT, null);
    expect(lesson.access).toBe("free");
    if (lesson.access !== "free") {
      return;
    }
    const grant = issueJuniorLessonMedia({ lessonKey: PILOT, entitled: false, now: NOW });
    expect(grant.kind).toBe("public");
    if (grant.kind !== "public") {
      return;
    }

    const data = buildJuniorLessonPlayData({
      lessonKey: PILOT,
      catalogAccess: "free",
      lesson,
      media: grant.urls,
      progress: { status: "fresh" },
    });
    expect(data).not.toBeNull();
    if (!data) {
      return;
    }

    const speech = `${data.lesson.script}\n${data.lesson.steps.join("\n")}\n${JSON.stringify(data.practice)}`;
    for (const marker of SCENE_GRAPH_MARKERS) {
      expect(speech).not.toContain(marker);
    }
    const graphicWire = JSON.stringify(data.graphic);
    expect(graphicWire).not.toContain("{@");
    expect(graphicWire).not.toContain("keyframes");
    expect(graphicWire).not.toContain("markedText");
    expect(graphicWire).not.toContain("SPAWN_MARBLES");
    expect(graphicWire).not.toContain("wordBank");
    expect(data.graphic?.schemaVersion).toBe("2.0.0");
    expect(data.graphic?.fraction).toBeNull();
    expect(data.lesson.script).not.toContain("Hadi şimdi ekrandaki çizime");
    expect(data.lesson.scene).toBe("number-ops");
    expect(data.lesson.script).toContain("Masadaki şu 12 renkli bilyeye bak!");
    expect(data.lesson.steps).toEqual([
      "12 Bilye Deneyi ve Çarpan",
      "Çarpan mı, Kat mı?",
      "Son Basamak ve Son İki Basamak (2, 4, 5, 10)",
      "Rakam Toplamı ve Çifte Koşul (3, 6, 9)",
      "Altın İpucu ve Özet",
    ]);
    expect(data.beats).toHaveLength(5);
    expect(data.beats[0]?.title).toBe("12 Bilye Deneyi ve Çarpan");
    expect(data.beats[0]?.startMs).toBe(0);
    expect(data.beats[4]?.title).toBe("Altın İpucu ve Özet");
    expect(data.media.audioUrl).toContain(`${PILOT}.mp3`);
    expect(data.practice.every((item) => item.kind === "choice" || item.kind === "match")).toBe(true);
    expect(data.practice.some((item) => item.kind === "choice")).toBe(true);

    const view = presentJuniorLessonPlay(data);
    expect(view?.lessonKey).toBe(PILOT);
    expect(view?.script).toContain("12 renkli bilyeye bak");
    expect(view?.script).not.toContain("{@");
    expect(view?.steps).toHaveLength(5);
    expect(view?.beats).toHaveLength(5);
    expect(view?.beats[0]?.startMs).toBe(0);
    expect(view?.audioUrl).toContain(`${PILOT}.mp3`);
    expect(view?.practice.length).toBeGreaterThan(0);
    expect(view?.graphic?.schemaVersion).toBe("2.0.0");
    expect(view?.script).not.toContain("keyframes");
  });

  it("pilot olmayan dersin hop metni ders kaydında kalır", () => {
    const lesson = readJuniorLesson("jr_06_fen-1", null);
    expect(lesson.access).toBe("free");
    if (lesson.access !== "free") {
      return;
    }
    const grant = issueJuniorLessonMedia({ lessonKey: "jr_06_fen-1", entitled: false, now: NOW });
    expect(grant.kind).toBe("public");
    if (grant.kind !== "public") {
      return;
    }
    const data = buildJuniorLessonPlayData({
      lessonKey: "jr_06_fen-1",
      catalogAccess: "free",
      lesson,
      media: grant.urls,
      progress: null,
    });
    expect(data?.lesson.script).toBe(juniorHopSpeech(lesson.script));
    expect(data?.lesson.steps).toEqual([...(lesson.steps ?? [])]);
    expect(data?.lesson.script).not.toContain("12 Bilye Deneyi ve Çarpan");
    expect(data?.graphic).toBeNull();
  });
});
