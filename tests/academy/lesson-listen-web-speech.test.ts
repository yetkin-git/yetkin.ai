import { describe, expect, it } from "vitest";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import {
  academyListenWebSpeechScript,
  academyWebSpeechSliceFromOffset,
  canUseAcademyWebSpeech,
  pickAcademyWebSpeechVoice,
  splitAcademyWebSpeechChunks,
} from "@/archived/lib/academy-studio/lesson-listen-web-speech";
import { isAcademyListenAbortError } from "@/archived/lib/academy-studio/lesson-listen";

const SYNTHETIC_TITLE = "Örnek Ders 1";
const SYNTHETIC_BODY = Array.from(
  { length: 40 },
  (_, i) => `Bu cümle ${i + 1}. tutarı kuruş cinsinden sabitlemeyi anlatır.`,
).join(" ");

describe("dersi dinle Web Speech yedek hoparlör", () => {
  it("AbortError adını tanır", () => {
    const abort = new Error("The operation was aborted.");
    abort.name = "AbortError";
    expect(isAcademyListenAbortError(abort)).toBe(true);
    expect(isAcademyListenAbortError(new Error("network"))).toBe(false);
  });

  it("konuşma metni sentetik gövdeden üretilir ve cümlelere bölünür", () => {
    expect(curriculumForCourseSlug("sample-course")).toEqual([]);
    const script = academyListenWebSpeechScript(SYNTHETIC_TITLE, SYNTHETIC_BODY, "sample-course");
    expect(script.length).toBeGreaterThan(80);
    const chunks = splitAcademyWebSpeechChunks(script);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((chunk) => chunk.trim().length > 0)).toBe(true);
    expect(academyWebSpeechSliceFromOffset(script, 0, 100)).toBe(script);
    expect(academyWebSpeechSliceFromOffset(script, 50, 100).length).toBeLessThan(script.length);
  });

  it("Türkçe sesi tercih eder; hoparlör yoksa false döner", () => {
    expect(canUseAcademyWebSpeech(null)).toBe(false);
    const picked = pickAcademyWebSpeechVoice([
      { lang: "en-US" },
      { lang: "tr-TR", default: true },
    ]);
    expect(picked?.lang).toBe("tr-TR");
  });
});
