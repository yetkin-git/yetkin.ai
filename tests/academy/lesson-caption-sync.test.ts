import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { academyBedIntroSec, academyBedSpeechClockSec } from "@/lib/academy/lesson-bed-duck";
import {
  loadAcademySealedAudioTimings,
  parseAcademySealedAudioTimings,
} from "@/lib/academy/lesson-audio-timings";
import type { AcademyLessonCue } from "@/lib/academy/lesson-cues";
import { applyAcademySpokenPhoneticsToDisplay } from "@/lib/academy/spoken-scripts/phonetics";
import { academyLessonAudioDiskPath } from "@/lib/academy/media-release-seal";
import {
  academyKaraokeActiveWordIndex,
  academyKaraokeStripLines,
  academyKaraokeWords,
  academyKaraokeWordState,
  buildAcademyTeleprompterFlowFromTimings,
  loadAcademyTeleprompterFlow,
} from "@/lib/academy/lesson-teleprompter-flow";

const ROOT = process.cwd();
const KEY = "01_office_ai-1";

describe("01_office_ai-1 altyazı ve ses saati", () => {
  it("ekran metni chunkIndex dilimi değil, konuşulan parça metnidir", () => {
    const timings = loadAcademySealedAudioTimings(KEY);
    const flow = loadAcademyTeleprompterFlow(KEY);
    expect(timings?.pieces.length).toBeGreaterThan(0);
    expect(flow).toHaveLength(timings!.pieces.length);
    timings!.pieces.forEach((piece, index) => {
      const line = flow[index]!;
      expect(line.text).toBe(applyAcademySpokenPhoneticsToDisplay(piece.text.trim()));
      expect(line.start).toBe(piece.start);
      expect(line.end).toBe(piece.end);
      expect(line.cueId).toBe(piece.cueId);
    });
    expect(flow[0]?.text.startsWith("Selamlar, ben Gözde.")).toBe(true);
    expect(flow[0]?.text).toContain("masanın üstünde");
    expect(flow[1]?.text.startsWith("Ofiste saatlerini alan")).toBe(true);
    expect(flow[1]?.text.startsWith("Çünkü bu işi çözen")).toBe(false);
  });

  it("kaymış chunkIndex cue paragrafını ekrana basmaz", () => {
    const cues: AcademyLessonCue[] = [
      {
        id: "cue-02",
        start: 0,
        end: 20,
        text: "HOŞ GELDİN",
        section: "HOŞ GELDİN",
        paragraphs: [
          "Bu paragraf seçilmemeli.",
          "Birinci ekran dilimi burada durur. İkinci ekran dilimi burada durur.",
        ],
      },
    ];
    const flow = buildAcademyTeleprompterFlowFromTimings(cues, {
      lessonKey: KEY,
      pauseSec: 0.4,
      durationSec: 8,
      cacheV: 1,
      pieces: [
        {
          index: 0,
          cueId: "cue-02",
          cueParagraphIndex: 1,
          chunkIndex: 1,
          start: 1,
          end: 4,
          text: "Ofiste saatlerini alan Kopilot.",
        },
        {
          index: 1,
          cueId: "cue-02",
          cueParagraphIndex: 1,
          chunkIndex: 2,
          start: 4.4,
          end: 8,
          text: "Kavekaka kuralını unutma.",
        },
      ],
    });
    expect(flow?.[0]?.text).toBe("Ofiste saatlerini alan Copilot.");
    expect(flow?.[1]?.text).toBe("KVKK kuralını unutma.");
    expect(flow?.some((line) => line.text.includes("İkinci ekran dilimi"))).toBe(false);
  });

  it("kelime saati cümle penceresini karakter payına bırakmaz", () => {
    const spoken = "Kopilot masada duran ilk dosyayı hemen açtı. Kavekaka kuralı burada biter.";
    const words = [
      { text: "Kopilot", start: 0, end: 0.4 },
      { text: "masada", start: 0.4, end: 0.8 },
      { text: "duran", start: 0.8, end: 1.1 },
      { text: "ilk", start: 1.1, end: 1.3 },
      { text: "dosyayı", start: 1.3, end: 1.8 },
      { text: "hemen", start: 1.8, end: 2.1 },
      { text: "açtı.", start: 2.1, end: 2.6 },
      { text: "Kavekaka", start: 3, end: 3.6 },
      { text: "kuralı", start: 3.6, end: 4 },
      { text: "burada", start: 4, end: 4.4 },
      { text: "biter.", start: 4.4, end: 5 },
    ];
    const strip = academyKaraokeStripLines([
      {
        id: "cue-01:0:0:0",
        cueId: "cue-01",
        section: "GİRİŞ",
        text: applyAcademySpokenPhoneticsToDisplay(spoken),
        start: 0,
        end: 10,
        words,
      },
    ]);
    expect(strip[0]?.end).toBe(2.6);
    expect(strip[1]?.start).toBe(3);
    expect(strip[1]?.end).toBe(5);
    expect(strip[1]?.text).toContain("KVKK");
    const chips = academyKaraokeWords(strip[0]!);
    expect(chips[0]).toMatchObject({ text: "Copilot", start: 0, end: 0.4 });
    expect(chips.at(-1)?.end).toBe(2.6);
    const characterShare = (0.4 / applyAcademySpokenPhoneticsToDisplay(spoken).length) * 10;
    expect(chips[0]?.end).not.toBeCloseTo(characterShare, 2);
  });

  it("kelime saati zaman kütüğünden okunur; bozuk dizi parçayı düşürmez", () => {
    const parsed = parseAcademySealedAudioTimings({
      lessonKey: KEY,
      pauseSec: 0.4,
      durationSec: 3,
      cacheV: 1,
      pieces: [
        {
          index: 0,
          cueId: "cue-01",
          cueParagraphIndex: 0,
          chunkIndex: 0,
          start: 0,
          end: 2,
          text: "Kopilot",
          words: [{ text: "Kopilot", start: 0.2, end: 1.1 }],
        },
        {
          index: 1,
          cueId: "cue-01",
          cueParagraphIndex: 0,
          chunkIndex: 1,
          start: 2,
          end: 3,
          text: "Kavekaka",
          words: [{ text: "", start: 2, end: 3 }],
        },
      ],
    });
    expect(parsed?.pieces[0]?.words).toEqual([{ text: "Kopilot", start: 0.2, end: 1.1 }]);
    expect(parsed?.pieces[1]?.words).toBeUndefined();
    expect(parsed?.pieces[1]?.text).toBe("Kavekaka");
  });

  it("kelime saati varken bölüt tutmazsa karakter payı açılmaz", () => {
    const words = [
      { text: "Yabancı", start: 0.4, end: 1.1 },
      { text: "kelime.", start: 1.1, end: 1.8 },
      { text: "Başka", start: 4.2, end: 4.8 },
      { text: "cümle.", start: 5.1, end: 5.6 },
    ];
    const strip = academyKaraokeStripLines([
      {
        id: "cue-01:0:0:0",
        cueId: "cue-01",
        section: "GİRİŞ",
        text: "Birinci cümle burada biter ve yeterince uzundur. İkinci cümle burada başlar ve yeterince uzundur.",
        start: 0,
        end: 10,
        words,
      },
    ]);
    expect(strip).toHaveLength(1);
    expect(strip[0]?.start).toBe(0);
    expect(strip[0]?.end).toBe(10);
    expect(strip[0]?.words).toEqual(words);
    const chips = academyKaraokeWords(strip[0]!);
    expect(chips.map((chip) => chip.start)).toEqual([0.4, 1.1, 4.2, 5.1]);
    expect(chips.map((chip) => chip.end)).toEqual([1.1, 1.8, 4.8, 5.6]);
    expect(academyKaraokeActiveWordIndex(chips, 3)).toBeNull();
    expect(academyKaraokeWordState(chips[0]!, 1)).toBe("active");
    expect(academyKaraokeWordState(chips[2]!, 1)).toBe("future");
  });

  it("vereceğini söylenirken vurgu tek kelimesine sıçramaz", () => {
    const spoken = "Sebebi şu: yapay zekâ, sen ona neyi nasıl vereceğini bilmeden o karmaşayı tek başına çözmez.";
    const words = [
      { text: "Sebebi", start: 41.2, end: 41.7 },
      { text: "şu:", start: 41.7, end: 42 },
      { text: "yapay", start: 42.05, end: 42.4 },
      { text: "zekâ,", start: 42.4, end: 42.9 },
      { text: "sen", start: 43.5, end: 43.7 },
      { text: "ona", start: 43.75, end: 44 },
      { text: "neyi", start: 44.05, end: 44.35 },
      { text: "nasıl", start: 44.4, end: 44.8 },
      { text: "vereceğini", start: 44.85, end: 46.1 },
      { text: "bilmeden", start: 46.15, end: 46.7 },
      { text: "o", start: 46.75, end: 46.9 },
      { text: "karmaşayı", start: 46.95, end: 47.5 },
      { text: "tek", start: 48.3, end: 48.55 },
      { text: "başına", start: 48.6, end: 49 },
      { text: "çözmez.", start: 49.05, end: 49.5 },
    ];
    const chips = academyKaraokeWords({
      id: "cue-01:0:0:0:5",
      text: spoken,
      start: 41.2,
      end: 49.5,
      words,
    });
    const verecegini = chips.find((chip) => chip.text === "vereceğini");
    const tek = chips.find((chip) => chip.text === "tek");
    expect(verecegini).toMatchObject({ start: 44.85, end: 46.1 });
    expect(tek).toMatchObject({ start: 48.3, end: 48.55 });
    expect(tek!.start - verecegini!.end).toBeGreaterThan(1);
    expect(academyKaraokeActiveWordIndex(chips, 45.4)).toBe(chips.findIndex((chip) => chip.text === "vereceğini"));
    expect(academyKaraokeWordState(tek!, 45.4)).toBe("future");
    expect(academyKaraokeActiveWordIndex(chips, 47.8)).toBeNull();
    const zeka = chips.find((chip) => chip.text === "zekâ,");
    const sen = chips.find((chip) => chip.text === "sen");
    expect(sen!.start - zeka!.end).toBeGreaterThan(0.4);
    expect(academyKaraokeActiveWordIndex(chips, zeka!.end + 0.2)).toBeNull();
  });

  it("kelime saati yokken cümle penceresi taslak oranda kalır", () => {
    const strip = academyKaraokeStripLines([
      {
        id: "cue-01:0",
        cueId: "cue-01",
        section: "GİRİŞ",
        text: "Birinci cümle altı kelimeyi geçer burada. İkinci cümle de altı kelimeyi geçer burada.",
        start: 0,
        end: 10,
      },
    ]);
    expect(strip).toHaveLength(2);
    expect(strip[0]?.words).toBeUndefined();
    expect(strip[0]?.end).toBeCloseTo((10 * 6) / 13, 5);
    expect(strip[1]?.start).toBe(strip[0]?.end);
    expect(strip[1]?.end).toBe(10);
  });

  it("01_office_ai-1 kelime saati konuşma WAV'ından gelir; uydurulmaz", () => {
    const wavPath = academyLessonAudioDiskPath("01_office_ai", KEY);
    const timings = loadAcademySealedAudioTimings(KEY);
    expect(timings?.pieces).toHaveLength(12);
    expect(timings?.durationSec).toBe(696.951);
    expect(timings?.cacheV).toBe(699951);
    const bake = readFileSync(join(ROOT, "scripts/bake-academy-acoustic-words.ts"), "utf8");
    expect(bake).toContain("alignWordsByAcoustics");
    expect(bake).toContain("Dosya yazılmadı");
    const stripSource = readFileSync(join(ROOT, "components/academy/lesson-karaoke-strip.tsx"), "utf8");
    expect(stripSource).toContain("academyKaraokeActiveWordIndex");
    expect(stripSource).not.toContain("?? words[0]");
    if (!existsSync(wavPath)) {
      expect(timings!.pieces.every((piece) => piece.words == null)).toBe(true);
      return;
    }
    const flow = loadAcademyTeleprompterFlow(KEY);
    for (const piece of timings!.pieces) {
      expect(piece.words?.length).toBeGreaterThan(0);
      const words = piece.words!;
      expect(words.map((word) => word.text).join(" ")).toBe(piece.text.replace(/\s+/gu, " ").trim());
      for (let index = 0; index < words.length; index += 1) {
        const word = words[index]!;
        expect(word.start).toBeGreaterThanOrEqual(piece.start);
        expect(word.end).toBeLessThanOrEqual(piece.end);
        expect(word.end).toBeGreaterThanOrEqual(word.start);
        if (index > 0) {
          expect(word.start).toBeGreaterThanOrEqual(words[index - 1]!.end);
        }
      }
    }
    const jump = flow.find((line) => line.text.includes("vereceğini") && line.text.includes(" tek "));
    expect(jump?.words?.length).toBeGreaterThan(0);
    const chips = academyKaraokeWords(jump!);
    const verecegini = chips.find((chip) => chip.text === "vereceğini");
    const tek = chips.find((chip) => chip.text === "tek");
    expect(verecegini).toBeTruthy();
    expect(tek).toBeTruthy();
    expect(tek!.start).toBeGreaterThanOrEqual(verecegini!.end);
    expect(academyKaraokeWordState(tek!, verecegini!.start + 0.05)).toBe("future");
  });

  it("01_office_ai-1 altyazı saati 3.00 sn adelay ile örtüşür", () => {
    expect(academyBedIntroSec(KEY)).toBe(3);
    expect(academyBedSpeechClockSec(KEY, 0)).toBe(0);
    expect(academyBedSpeechClockSec(KEY, 3)).toBe(0);
    expect(academyBedSpeechClockSec(KEY, 5)).toBe(2);
    const timings = loadAcademySealedAudioTimings(KEY);
    expect(timings?.pieces[0]?.start).toBe(2);
    expect(academyBedSpeechClockSec(KEY, 5)).toBe(timings?.pieces[0]?.start);
    const player = readFileSync(join(ROOT, "components/academy/lesson-media-player.tsx"), "utf8");
    expect(player).toContain("academyBedIntroSec(lessonKey)");
    expect(player).not.toContain("ACADEMY_BED_INTRO_SEC");
  });
});
