import { describe, expect, it } from "vitest";
import {
  draftMembersToShareBps,
  parseStoredStandaloneSquads,
  parseStandaloneSquadDraft,
  percentToShareBps,
} from "@/lib/freelancer/standalone-squad-store";

describe("standalone squad store", () => {
  it("geçerli ön takımı parse eder; boş üyeyi reddeder", () => {
    const ok = parseStandaloneSquadDraft({
      id: "s1",
      name: "Safir Üçlüsü",
      leadSharePercent: 60,
      members: [{ invite: "a@x.com", role: "tasarım", sharePercent: 40 }],
      createdAt: "2026-08-24T00:00:00.000Z",
    });
    expect(ok?.name).toBe("Safir Üçlüsü");
    expect(ok?.members[0]?.invite).toBe("a@x.com");

    expect(
      parseStandaloneSquadDraft({
        id: "s2",
        name: "Boş",
        leadSharePercent: 100,
        members: [],
        createdAt: "2026-08-24T00:00:00.000Z",
      }),
    ).toBeNull();
  });

  it("localStorage JSON dizisini güvenli parse eder", () => {
    expect(parseStoredStandaloneSquads(null)).toEqual([]);
    expect(parseStoredStandaloneSquads("{")).toEqual([]);
    const list = parseStoredStandaloneSquads(
      JSON.stringify([
        {
          id: "a",
          name: "A",
          leadSharePercent: 70,
          members: [{ invite: "u1", role: "", sharePercent: 30 }],
          createdAt: "2026-08-24T00:00:00.000Z",
        },
        { id: "bad" },
      ]),
    );
    expect(list).toHaveLength(1);
    expect(list[0]?.id).toBe("a");
  });

  it("yüzde → shareBps toplamı 10_000’e yuvarlanır", () => {
    expect(percentToShareBps(70)).toBe(7000);
    const bps = draftMembersToShareBps({
      id: "x",
      name: "X",
      leadSharePercent: 33.3,
      members: [
        { invite: "b", role: "", sharePercent: 33.3 },
        { invite: "c", role: "", sharePercent: 33.4 },
      ],
      createdAt: "2026-08-24T00:00:00.000Z",
    });
    expect(bps.reduce((sum, row) => sum + row.shareBps, 0)).toBe(10_000);
  });
});
