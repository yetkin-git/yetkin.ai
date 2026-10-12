import { describe, expect, it } from "vitest";
import { createV1HttpClient } from "../../apps/rail-is/src/api/client";
import { assertRailIsDay0Path, juniorLessonPlayPath, juniorLessonPracticePath, juniorLessonProgressPath } from "../../apps/rail-is/src/api/hops";
import { presentJuniorLessonPlay, presentJuniorProgressStatus } from "../../apps/rail-is/src/ui/present-junior-lesson";

function envelope(data: Record<string, unknown>, status = 200): Response {
  return new Response(
    JSON.stringify({
      ok: true,
      error: null,
      requestId: "11111111-1111-4111-8111-111111111111",
      apiVersion: "1",
      data,
    }),
    { status, headers: { "content-type": "application/json" } },
  );
}

describe("Native Junior ders akışı", () => {
  it("dersi açar, gövdeyi oynatır ve ilerlemeyi kaydeder", async () => {
    expect(assertRailIsDay0Path(juniorLessonPlayPath("jr_06_mat-1"), "GET")).toBe(
      "/api/v1/junior/lessons/jr_06_mat-1/play",
    );
    expect(assertRailIsDay0Path(juniorLessonProgressPath("jr_06_mat-1"), "POST")).toBe(
      "/api/v1/junior/lessons/jr_06_mat-1/progress",
    );
    expect(assertRailIsDay0Path(juniorLessonPracticePath("jr_06_mat-1"), "POST")).toBe(
      "/api/v1/junior/lessons/jr_06_mat-1/practice",
    );

    const calls: string[] = [];
    const client = createV1HttpClient({
      baseUrl: "https://rail.test",
      getAccessToken: () => "token",
      createIdempotencyKey: () => "22222222-2222-4222-8222-222222222222",
      fetch: async (url, init) => {
        const href = String(url);
        calls.push(`${init?.method ?? "GET"} ${href}`);
        if (href.includes("/play")) {
          return envelope({
            lesson: {
              lessonKey: "jr_06_mat-1",
              title: "Üslü ifade",
              courseTitle: "Matematik",
              access: "free",
              script: "Taban altta durur. Üs kaç kez çarpılacağını söyler.",
              scene: "mat",
              steps: ["Tabanı göster."],
              preparing: false,
            },
            media: {
              audioUrl: "/media/junior/audio/jr_06_mat-1.mp3",
              warmupUrl: "/media/junior/warmup/jr_06_mat-warmup.mp4",
              coverUrl: "/media/junior/covers/jr_06_mat-1.jpg",
              expiresAt: null,
            },
            practice: [
              {
                id: "q1",
                kind: "choice",
                prompt: "Taban hangisidir?",
                choices: ["2", "3"],
              },
            ],
            progress: { status: "fresh" },
          });
        }
        if (href.includes("/progress")) {
          return envelope({
            progress: {
              lessonKey: "jr_06_mat-1",
              status: "going",
              score: 0,
              xpAwarded: 0,
              points: 0,
            },
          });
        }
        return envelope({
          result: {
            praised: "Harika anlattın.",
            missing: "Eksik kalan nokta yok.",
            advice: "Bir kez daha söyle.",
            score: 100,
            xpAwarded: 8,
            points: 8,
            correct: 1,
            total: 1,
            status: "going",
          },
        });
      },
    });

    const opened = await client.getJuniorLessonPlay("jr_06_mat-1", "jp_1");
    const play = presentJuniorLessonPlay(opened.data);
    expect(play?.script).toContain("Taban");
    expect(play?.audioUrl).toContain("jr_06_mat-1.mp3");
    expect(play?.practice).toHaveLength(1);

    const saved = await client.saveJuniorLessonProgress("jr_06_mat-1", { profileId: "jp_1" });
    expect(presentJuniorProgressStatus(saved.data)).toBe("going");

    const practiced = await client.submitJuniorLessonPractice("jr_06_mat-1", {
      profileId: "jp_1",
      answers: [{ id: "q1", choiceIndex: 0 }],
    });
    expect(practiced.data.result).toMatchObject({ score: 100, status: "going" });
    expect(calls.map((row) => row.split(" ")[0])).toEqual(["GET", "POST", "POST"]);
    expect(calls[0]).toContain("profileId=jp_1");
  });
});
