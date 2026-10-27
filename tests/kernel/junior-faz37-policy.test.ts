import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  juniorCatalogLessonKeys,
  juniorCourseShelves,
  juniorFreeLessonKeys,
  juniorLessonAccess,
  juniorLessonByKey,
} from "@/lib/junior/catalog";
import { JUNIOR_MAT_5 } from "@/lib/junior/content/mat/1";
import { JUNIOR_HYBRID_OPENINGS, juniorLessonGreeting } from "@/lib/junior/content-rules";
import { JUNIOR_LEGACY_ARCHIVE_LABEL } from "@/lib/junior/meb";
import { JUNIOR_ARCHIVED_OPENER_KEYS, JUNIOR_FREE_LESSON_KEY } from "@/lib/junior/limits";
import { juniorLessonNote } from "@/lib/junior/lesson-note";
import { juniorLessonMediaIsPublicPreview } from "@/lib/junior/media-visibility";
import { MICRO_STAR_ATTENTION_GAP_MS, microLessonPlan } from "@/lib/junior/micro-lesson";
import { JUNIOR_NARRATION_MAX_MS, JUNIOR_NARRATION_MIN_MS, juniorPlayerTimeline } from "@/lib/junior/player-clock";
import { juniorNarrationDurationMs } from "@/lib/junior/scenario";
import { chunkJuniorLocalSpeech } from "@/lib/junior/speech";
import { juniorActiveLessonKeys } from "@/lib/junior/week";

/** FAZ 37 sonrası: ücretsiz kapı, 1. ünite açılışı, karşılama hizası. Müfredat dışı arşiv silindi. */

/** Bugün (11 Ekim 2026, 4. okul haftası). */
const WEEK_4_NOON = new Date("2026-10-11T12:00:00+03:00");

describe("FAZ 37 ücretsiz kapı ve arşiv", () => {
  it("ücretsiz matematik kapısı kartın ilk mühürlü dersidir; hafta ikinci bedava ders açmaz", () => {
    expect(JUNIOR_FREE_LESSON_KEY).toBe("jr_06_mat-1");
    expect(juniorFreeLessonKeys().filter((key) => key.startsWith("jr_06_mat-"))).toEqual(["jr_06_mat-1"]);
    expect(juniorLessonAccess(JUNIOR_FREE_LESSON_KEY)).toBe("free");
    expect(juniorLessonAccess("jr_06_mat-4")).toBe("locked");
    expect(juniorActiveLessonKeys("jr_06_mat", WEEK_4_NOON)).not.toEqual([JUNIOR_FREE_LESSON_KEY]);
  });

  it("matematik rafı 1. ünite ile açılır; müfredat dışı arşiv anahtarı yoktur", () => {
    expect(JUNIOR_ARCHIVED_OPENER_KEYS).toEqual([]);
    expect(juniorFreeLessonKeys()).toContain("jr_06_mat-1");
    expect(juniorLessonAccess("jr_06_mat-1")).toBe("free");
    expect(JUNIOR_LEGACY_ARCHIVE_LABEL).toBe("Müfredat dışı / Arşiv");
    const mat = juniorCourseShelves(WEEK_4_NOON).find((course) => course.slug === "jr_06_mat");
    expect(mat?.lessons[0]?.key).toBe("jr_06_mat-1");
    expect(mat?.lessons[0]?.archiveLabel).toBeUndefined();
    expect(mat?.lessons[0]?.unitTitle).toBe("Sayılar ve nicelikler");
    expect(mat?.lessons.some((lesson) => lesson.archiveLabel === JUNIOR_LEGACY_ARCHIVE_LABEL)).toBe(false);
  });

  it("ücretsiz küme ile medya görünürlüğü her ders için birebir aynıdır", () => {
    const free = new Set(juniorFreeLessonKeys());
    for (const key of juniorCatalogLessonKeys()) {
      expect(free.has(key), key).toBe(juniorLessonMediaIsPublicPreview(key));
      expect(juniorLessonAccess(key) === "free", key).toBe(free.has(key));
    }
  });
});

describe("FAZ 37 karşılama hizası", () => {
  it("mühürlü sesli dersin ekran selamı konuşulan açılışla aynıdır", () => {
    const odd = juniorLessonGreeting({ lessonKey: "jr_06_mat-1", nickname: "Ela", sealedVoice: true });
    expect(odd).toBe("Merhaba sevgili çocuklar!");
    expect(juniorLessonGreeting({ lessonKey: "jr_06_mat-2", nickname: "Ela", sealedVoice: true })).toBe(
      JUNIOR_HYBRID_OPENINGS[1],
    );
    const spoken = juniorLessonByKey("jr_06_mat-1")?.listenText ?? "";
    expect(spoken.startsWith(odd ?? "")).toBe(true);
  });

  it("mühür yokken rumuzlu sıcak açılış kullanılır; rumuz yoksa selam yoktur", () => {
    expect(juniorLessonGreeting({ lessonKey: "jr_06_mat-1", nickname: "Ela", sealedVoice: false })).toBe(
      "Merhaba Ela, bu konuya birlikte bakacağız.",
    );
    expect(juniorLessonGreeting({ lessonKey: "jr_06_mat-1", nickname: null, sealedVoice: false })).toBeNull();
  });

  it("oynatıcı selamı katalog kararından okur (rumuz sabit selamı bozmaz)", () => {
    const source = readFileSync(join(process.cwd(), "components", "junior", "vector-player.tsx"), "utf8");
    expect(source).toContain("juniorLessonGreeting({");
  });
});

describe("FAZ 37 dikkat durağı ve yıldız", () => {
  it("hiçbir yıldız durağı dikkat durağının yakınına düşmez (tüm dersler)", () => {
    for (const key of juniorCatalogLessonKeys()) {
      const lesson = juniorLessonByKey(key);
      expect(lesson, key).not.toBeNull();
      if (!lesson) {
        continue;
      }
      const note = juniorLessonNote(lesson.mebNote, lesson.lifeUse);
      const timeline = juniorPlayerTimeline(note, chunkJuniorLocalSpeech(note), lesson.steps?.length ?? 12);
      const pauses = microLessonPlan(key, timeline).pauses;
      const attention = pauses.filter((pause) => pause.kind === "attention").map((pause) => pause.endMs);
      for (const pause of pauses) {
        if (pause.kind !== "turn") {
          continue;
        }
        for (const ms of attention) {
          expect(Math.abs(ms - pause.endMs), key).toBeGreaterThanOrEqual(MICRO_STAR_ATTENTION_GAP_MS);
        }
      }
    }
  });

  it("jr_06_mat-1 dikkat durağı 💡 olarak kalır", () => {
    const lesson = juniorLessonByKey("jr_06_mat-1");
    expect(lesson).not.toBeNull();
    if (!lesson) {
      return;
    }
    const note = juniorLessonNote(lesson.mebNote, lesson.lifeUse);
    const timeline = juniorPlayerTimeline(note, chunkJuniorLocalSpeech(note), lesson.steps?.length ?? 12);
    const plan = microLessonPlan("jr_06_mat-1", timeline);
    expect(plan.pauses.some((pause) => pause.kind === "attention")).toBe(true);
  });
});

describe("1. ünite açılışı jr_06_mat-1", () => {
  const text = JUNIOR_MAT_5.listenText;

  it("çarpan ve bölünebilme cümlesini taşır; silinen üslü anlatım yoktur", () => {
    expect(text).toContain("kalansız");
    expect(text).not.toContain("Alttaki sayı tabandır");
    expect(text).not.toContain("Üslü ifade");
  });

  it("karakter saati 3 dakika tabanı ile 12 dakika tavanı arasındadır", () => {
    const ms = juniorNarrationDurationMs(JUNIOR_MAT_5.mebNote, JUNIOR_MAT_5.lifeUse);
    expect(ms).toBeGreaterThanOrEqual(JUNIOR_NARRATION_MIN_MS);
    expect(ms).toBeLessThanOrEqual(JUNIOR_NARRATION_MAX_MS);
  });
});
