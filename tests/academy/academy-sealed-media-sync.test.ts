import { describe, expect, it } from "vitest";
import { resolveAcademyMediaRead } from "@/lib/academy/lesson-audio-grant";
import { academyProductionFilePresent } from "@/lib/academy/production-seal-disk";
import {
  academyAudioSyncHasBlockers,
  inspectAcademySealedAudio,
  parseAcademyMediaSyncArgs,
} from "../../scripts/ops-sync-media-to-storage-lib";

describe("yayın sesi depo sayımı", () => {
  it("bayrak yokken kuru sayım, --apply kopya, ikisi birden ve eski kova reddedilir", () => {
    expect(parseAcademyMediaSyncArgs([])).toEqual({ mode: "dry-run" });
    expect(parseAcademyMediaSyncArgs(["--dry-run"])).toEqual({ mode: "dry-run" });
    expect(parseAcademyMediaSyncArgs(["--apply"])).toEqual({ mode: "apply" });
    expect(() => parseAcademyMediaSyncArgs(["--dry-run", "--apply"])).toThrow(/birlikte/);
    expect(() => parseAcademyMediaSyncArgs(["--bucket=lesson-audios"])).toThrow(/lesson-audios/);
    expect(() => parseAcademyMediaSyncArgs(["--from=media-bake"])).toThrow(/media-bake/);
  });

  it("sınav yolu, hazırlık şeridi ve fon yatağı 77 dosyadır; wav ve yetim dışarıdadır", () => {
    const report = inspectAcademySealedAudio(process.cwd());
    expect(report.bucket).toBe("academy-sealed");
    expect(report.speech).toBe(39);
    expect(report.bed).toBe(38);
    expect(report.total).toBe(77);
    const unaccounted = [...report.missing, ...report.empty].filter(
      (path) => !academyProductionFilePresent(path),
    );
    expect(unaccounted).toEqual([]);
    expect(report.oversize).toEqual([]);
    expect(report.orphans).toEqual([]);
    expect(report.rejected).toEqual([]);
    if (resolveAcademyMediaRead(process.env) === "storage") {
      expect(academyAudioSyncHasBlockers({ ...report, missing: unaccounted, empty: [] })).toBe(false);
    } else {
      expect(academyAudioSyncHasBlockers(report)).toBe(false);
      expect(report.bytes).toBeGreaterThan(0);
    }

    const prep = report.items.find((item) => item.lessonKey === "01_office_ai-0");
    expect(prep?.kind).toBe("speech");
    expect(prep?.diskRelative).toBe("public/media/academy/audio/01_office_ai/01_office_ai-0.mp3");
    expect(prep?.objectPath).toMatch(/^01_office_ai\/01_office_ai-0\/v[1-9]\d*\.mp3$/u);

    expect(report.items.some((item) => item.lessonKey === "01_office_ai-4")).toBe(false);
    for (const item of report.items) {
      expect(item.diskRelative.endsWith(".wav")).toBe(false);
      expect(item.diskRelative.includes("media-bake")).toBe(false);
      expect(item.objectPath).toMatch(/\/v[1-9]\d*\.(?:bed\.)?mp3$/u);
    }
  });
});