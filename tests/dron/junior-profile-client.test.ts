import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { JUNIOR_GUARDIAN_NOTICE_VERSION } from "@/lib/copy/junior-guardian-notice";
import { createV1HttpClient } from "../../apps/rail-is/src/api/client";
import {
  assertRailIsDay0Path,
  juniorPilotElectivesPath,
  juniorPilotProfilesPath,
} from "../../apps/rail-is/src/api/hops";

function envelope(data: Record<string, unknown>): Response {
  return new Response(
    JSON.stringify({
      ok: true,
      error: null,
      requestId: "11111111-1111-4111-8111-111111111111",
      apiVersion: "1",
      data,
    }),
    { status: 200, headers: { "content-type": "application/json" } },
  );
}

describe("Native Junior profil masası", () => {
  it("profil yazmalarını ve seçmeliyi v1 hop'una yollar", async () => {
    expect(assertRailIsDay0Path(juniorPilotProfilesPath(), "GET")).toBe("/api/v1/junior-pilot/profiles");
    expect(assertRailIsDay0Path(juniorPilotProfilesPath(), "POST")).toBe("/api/v1/junior-pilot/profiles");
    expect(assertRailIsDay0Path(juniorPilotProfilesPath(), "PATCH")).toBe("/api/v1/junior-pilot/profiles");
    expect(assertRailIsDay0Path(juniorPilotProfilesPath(), "PUT")).toBe("/api/v1/junior-pilot/profiles");
    expect(assertRailIsDay0Path(juniorPilotProfilesPath(), "DELETE")).toBe("/api/v1/junior-pilot/profiles");
    expect(assertRailIsDay0Path(juniorPilotElectivesPath(), "POST")).toBe("/api/v1/junior-pilot/electives");
    expect(assertRailIsDay0Path("/api/v1/junior-pilot/checkout", "POST")).toBe(
      "/api/v1/junior-pilot/checkout",
    );
    expect(() => assertRailIsDay0Path("/api/v1/junior-pilot/grade", "POST")).toThrow(/allowlist/);

    const screen = readFileSync(
      join(process.cwd(), "apps/rail-is/src/screens/JuniorProfileScreen.tsx"),
      "utf8",
    );
    expect(screen).toContain(JUNIOR_GUARDIAN_NOTICE_VERSION);
    expect(readFileSync(join(process.cwd(), "apps/rail-is/App.tsx"), "utf8")).toContain("JuniorProfileScreen");

    const calls: string[] = [];
    const client = createV1HttpClient({
      baseUrl: "https://rail.test",
      getAccessToken: () => "token",
      createIdempotencyKey: () => "22222222-2222-4222-8222-222222222222",
      fetch: async (url, init) => {
        calls.push(`${init?.method ?? "GET"} ${String(url)}`);
        const method = init?.method ?? "GET";
        if (method === "GET") {
          return envelope({
            profiles: [
              {
                id: "jp_1",
                nickname: "Ada",
                grade: 6,
                birthYear: 2015,
                selected: true,
                selectedElectives: [],
                gradeSwitchRights: 1,
              },
            ],
            selectedId: "jp_1",
            xp: { points: 0, badges: [] },
            courses: [],
          });
        }
        if (method === "DELETE") {
          return envelope({ erased: true, profileId: "jp_1" });
        }
        return envelope({
          profile: {
            id: "jp_1",
            nickname: "Ada",
            grade: 6,
            birthYear: 2015,
            selected: true,
            selectedElectives: ["jr_06_kod"],
            gradeSwitchRights: 1,
          },
        });
      },
    });

    const home = await client.getJuniorProfiles();
    expect(home.data.selectedId).toBe("jp_1");
    await client.createJuniorProfile({
      nickname: "Ada",
      grade: 6,
      birthYear: 2015,
      consent: true,
      consentVersion: JUNIOR_GUARDIAN_NOTICE_VERSION,
      guardianBirthYear: 1990,
    });
    await client.selectJuniorProfile({ profileId: "jp_1" });
    await client.confirmJuniorProfileConsent({
      profileId: "jp_1",
      consent: true,
      consentVersion: JUNIOR_GUARDIAN_NOTICE_VERSION,
      guardianBirthYear: 1990,
    });
    await client.saveJuniorElectives({ profileId: "jp_1", slugs: ["jr_06_kod"] });
    const erased = await client.eraseJuniorProfile({ profileId: "jp_1" });
    expect(erased.data).toMatchObject({ erased: true, profileId: "jp_1" });
    expect(calls.map((row) => row.split(" ")[0])).toEqual(["GET", "POST", "PATCH", "PUT", "POST", "DELETE"]);
    expect(calls.filter((row) => row.includes("/electives"))).toHaveLength(1);
    expect(calls.some((row) => row.includes("/checkout"))).toBe(false);
  });
});
