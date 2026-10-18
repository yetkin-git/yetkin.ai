import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/junior/lessons/[key]/route";
import { juniorLessonAccess } from "@/lib/junior/catalog";
import { JUNIOR_FREE_LESSON_KEY } from "@/lib/junior/limits";

/** T-01: herkese açık ders uç noktası, ses yolunu yalnız erişim `free` iken döner. */

async function readCard(lessonKey: string): Promise<Record<string, unknown>> {
  const request = new Request(`http://localhost/api/junior/lessons/${lessonKey}`);
  const response = await GET(request, { params: Promise.resolve({ key: lessonKey }) });
  expect(response.status).toBe(200);
  const body = (await response.json()) as Record<string, unknown>;
  const data = (body.data ?? body) as { card: Record<string, unknown> };
  return data.card;
}

describe("Junior ders uç noktası ses yolu kapısı (T-01)", () => {
  it("serbest ders ses yolunu döner; kilitli ders için audioPath null", async () => {
    expect(juniorLessonAccess(JUNIOR_FREE_LESSON_KEY)).toBe("free");
    const free = await readCard(JUNIOR_FREE_LESSON_KEY);
    expect(free.access).toBe("free");
    expect(typeof free.audioPath).toBe("string");
    expect(String(free.audioPath)).toContain(`${JUNIOR_FREE_LESSON_KEY}.mp3`);
    expect(String(free.audioPath)).not.toContain("X-Amz-Signature");
    expect(typeof free.coverPath).toBe("string");

    expect(juniorLessonAccess("jr_06_mat-1")).toBe("missing");
    const opener = await readCard("jr_06_mat-5");
    expect(opener.lessonKey).toBe("jr_06_mat-5");
    expect(opener.title).toBe("Çarpanlar, Katlar ve Bölünebilme");
    expect(opener.subject).toBe("Matematik");

    expect(juniorLessonAccess("jr_06_mat-6")).toBe("locked");
    const locked = await readCard("jr_06_mat-6");
    expect(locked.access).toBe("locked");
    expect(locked.audioPath).toBeNull();
    expect(locked.warmupPath).toBeNull();
    expect(locked.coverPath).toBeNull();
  });

  it("kilitli bütün çekirdek dersler için audioPath boştur; kilitli sesli ders bile sızdırmaz", async () => {
    for (const lessonKey of ["jr_06_fen-2", "jr_06_turkce-2", "jr_06_sosyal-2", "jr_06_ing_main-3"]) {
      expect(juniorLessonAccess(lessonKey)).toBe("locked");
      const card = await readCard(lessonKey);
      expect(card.access).toBe("locked");
      expect(card.audioPath).toBeNull();
      expect(card.warmupPath).toBeNull();
      expect(card.coverPath).toBeNull();
      expect(JSON.stringify(card)).not.toContain(".mp3");
      expect(JSON.stringify(card)).not.toContain(".mp4");
      expect(JSON.stringify(card)).not.toContain(".jpg");
    }
  });

  it("route kaynağı kilitli medyayı adresten keser", () => {
    const src = readFileSync(join(process.cwd(), "app/api/junior/lessons/[key]/route.ts"), "utf8");
    expect(src).toContain("issueJuniorLessonMedia");
    expect(src).toContain("entitled: false");
    expect(src).not.toContain("juniorCoverSrc(");
    expect(src).not.toContain("juniorLessonAudioSrc(");
  });
});
