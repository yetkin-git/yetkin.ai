import { describe, expect, it } from "vitest";
import { officeAiSections } from "@/lib/academy/curricula/office_ai";
import {
  academyCitizenLessonOrdinal,
  curriculumLessonKeysForSlug,
} from "@/lib/academy/curricula/lesson-index";
import { loadAcademySealedAudioTimings } from "@/lib/academy/lesson-audio-timings";
import { isAcademyAiLessonDurationMinutes } from "@/lib/academy/production-standard";

const SLUG = "01_office_ai";

type BridgeCtx = {
  ordinal: number;
  nextOrdinal: number | null;
  lastOrdinal: number;
};

/** Kapanış köprüsü — vatandaş sırası `lesson-index.ts` SSOT'undan türetilir. */
const CLOSING_BRIDGE: Record<string, (ctx: BridgeCtx) => RegExp> = {
  "01_office_ai-1": ({ nextOrdinal }) => new RegExp(`${nextOrdinal}\\. derste buluşalım`, "u"),
  "01_office_ai-k1": ({ ordinal }) => new RegExp(`Bu ${ordinal}\\. derstir[\\s\\S]*Sıradaki kapı rapor`, "u"),
  "01_office_ai-2": ({ nextOrdinal }) => new RegExp(`${nextOrdinal}\\. ders kapsamında`, "u"),
  "01_office_ai-3": ({ nextOrdinal }) => new RegExp(`${nextOrdinal}\\. derste[\\s\\S]*Hata Avı`, "u"),
  "01_office_ai-5": () => /Sıradaki ders e-posta ritüeli/u,
  "01_office_ai-4": () => /bir sonraki derste Gmail Gemini/iu,
  "01_office_ai-g1": ({ lastOrdinal }) => new RegExp(`o ${lastOrdinal}\\. ders bitince`, "u"),
  "01_office_ai-w1": ({ ordinal, lastOrdinal }) =>
    new RegExp(`Bu ${ordinal}\\. derstir[\\s\\S]*${lastOrdinal}\\. ders`, "u"),
  "01_office_ai-6": () => /sınav kapısı yalnız bu kapanış dersinden sonra açılır/iu,
};

function sealedMinutes(durationSec: number): number {
  return Math.round(durationSec / 6) / 10;
}

describe("01_office_ai giriş/kapanış köprü kilidi", () => {
  it("ders sırası, sectionNumber ve kapanış köprüleri vatandaş indeksine kilitlenir", () => {
    const keys = curriculumLessonKeysForSlug(SLUG);
    expect(keys).toEqual([
      "01_office_ai-1",
      "01_office_ai-k1",
      "01_office_ai-2",
      "01_office_ai-3",
      "01_office_ai-5",
      "01_office_ai-4",
      "01_office_ai-g1",
      "01_office_ai-w1",
      "01_office_ai-6",
    ]);
    expect(officeAiSections.map((section) => section.lessonKey)).toEqual([...keys]);
    const lastOrdinal = keys.length;
    for (let index = 0; index < keys.length; index += 1) {
      const lessonKey = keys[index]!;
      const section = officeAiSections[index]!;
      const ordinal = index + 1;
      expect(academyCitizenLessonOrdinal(SLUG, lessonKey)).toBe(ordinal);
      expect(section.sectionNumber).toBe(ordinal);
      expect(section.lessonKey).toBe(lessonKey);
      const ctx: BridgeCtx = {
        ordinal,
        nextOrdinal: index < keys.length - 1 ? ordinal + 1 : null,
        lastOrdinal,
      };
      const lock = CLOSING_BRIDGE[lessonKey];
      expect(lock, lessonKey).toBeTypeOf("function");
      expect(section.contentMarkdown, lessonKey).toMatch(lock!(ctx));
    }
  });

  it("1. ders ataş adımında erken KVKK köprüsü durur; ham dosya yükletmez", () => {
    const lessonOne = officeAiSections[0]!;
    expect(lessonOne.lessonKey).toBe("01_office_ai-1");
    expect(lessonOne.contentMarkdown).toMatch(
      /Copilot varsa şeritten doğrudan okut; yoksa dosyayı ataş ile yükle\. \(Kişisel verileri maskeleme kuralını 2\. derste kilitleyeceğiz\.\)/u,
    );
    expect(lessonOne.contentMarkdown).toMatch(/anonimize edilmiş/u);
    expect(lessonOne.contentMarkdown).toMatch(/temiz örnek/u);
    expect(lessonOne.contentMarkdown).not.toMatch(/masaüstünde duran ya da sana yakın zamanda gönderilmiş/u);
  });

  it("targetDurationMinutes mühürlü timings saniyesine yuvarlanır", () => {
    for (const section of officeAiSections) {
      const timings = loadAcademySealedAudioTimings(section.lessonKey);
      expect(timings?.durationSec, section.lessonKey).toBeGreaterThan(0);
      expect(section.targetDurationMinutes, section.lessonKey).toBe(sealedMinutes(timings!.durationSec));
      expect(isAcademyAiLessonDurationMinutes(section.targetDurationMinutes)).toBe(true);
    }
  });
});
