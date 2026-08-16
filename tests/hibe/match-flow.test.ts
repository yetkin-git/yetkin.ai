import { describe, expect, it } from "vitest";
import { HIBE_CATALOG_HONESTY } from "@/lib/hibe/types";
import { SEED_GRANT_PROGRAMS } from "@/lib/hibe/catalog";
import { matchGrantPrograms } from "@/lib/hibe/match";
import { buildHibePulse, openGrantApplicationGuide, searchGrantPrograms } from "@/lib/hibe/engine";
import { createMemoryHibeStore, seedMemoryGrantCatalog } from "../helpers/memory-hibe";

const USER = "user-1";

describe("hibe eşleştirme ve başvuru rehberi", () => {
  it("dürüstlük mührü canlı devlet API iddiası taşımaz", () => {
    expect(HIBE_CATALOG_HONESTY).toBe("catalog-not-live-government-api");
    expect(SEED_GRANT_PROGRAMS.length).toBeGreaterThanOrEqual(6);
  });

  it("birey profili yalnız BOTH/INDIVIDUAL programları döner (TÜBİTAK 1512)", async () => {
    const hibe = createMemoryHibeStore();
    await seedMemoryGrantCatalog(hibe);
    const matches = await searchGrantPrograms(
      { hibe },
      {
        jurisdiction: "TR",
        applicantKind: "INDIVIDUAL",
        hasTaxId: false,
        sectorTags: ["girisim", "yazilim"],
      },
    );
    expect(matches.every((row) => row.applicantKind === "BOTH" || row.applicantKind === "INDIVIDUAL")).toBe(
      true,
    );
    expect(matches.some((row) => row.slug === "tubitak-1512-bigg")).toBe(true);
    expect(matches.some((row) => row.slug === "kosgeb-girisimcilik")).toBe(false);
    expect(matches[0]?.matchedTags).toContain("girisim");
  });

  it("kurumsal + vergi no + kobi etiketi KOSGEB/TÜBİTAK şirket programlarını eşler", async () => {
    const hibe = createMemoryHibeStore();
    await seedMemoryGrantCatalog(hibe);
    const matches = await searchGrantPrograms(
      { hibe },
      {
        jurisdiction: "TR",
        applicantKind: "CORPORATE",
        hasTaxId: true,
        sectorTags: ["kobi", "arge"],
        agency: "KOSGEB",
      },
    );
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every((row) => row.agency === "KOSGEB")).toBe(true);
    expect(matches.some((row) => row.slug === "kosgeb-girisimcilik")).toBe(true);
  });

  it("vergi nosuz şirket requiresTaxId programlarını elemez", () => {
    const matches = matchGrantPrograms([...SEED_GRANT_PROGRAMS], {
      jurisdiction: "TR",
      applicantKind: "CORPORATE",
      hasTaxId: false,
      sectorTags: [],
    });
    expect(matches.every((row) => !row.requiresTaxId)).toBe(true);
    expect(matches.some((row) => row.slug === "tubitak-1512-bigg")).toBe(true);
    expect(matches.some((row) => row.slug === "tubitak-1501")).toBe(false);
  });

  it("metin araması TÜBİTAK BİGG kaydını bulur", () => {
    const matches = matchGrantPrograms([...SEED_GRANT_PROGRAMS], {
      jurisdiction: "TR",
      applicantKind: "INDIVIDUAL",
      hasTaxId: false,
      sectorTags: [],
      query: "bigg",
    });
    expect(matches).toHaveLength(1);
    expect(matches[0]?.slug).toBe("tubitak-1512-bigg");
  });

  it("yayında olmayan program eşleşmez", () => {
    const hidden = { ...SEED_GRANT_PROGRAMS[3]!, isPublished: false };
    const matches = matchGrantPrograms([hidden], {
      jurisdiction: "TR",
      applicantKind: "INDIVIDUAL",
      hasTaxId: false,
      sectorTags: [],
    });
    expect(matches).toHaveLength(0);
  });

  it("başvuru rehberi user+program için idempotent açılır ve kontrol listesi kapanır", async () => {
    const hibe = createMemoryHibeStore();
    await seedMemoryGrantCatalog(hibe);
    const first = await openGrantApplicationGuide(
      { hibe },
      { userId: USER, programId: "gp_tubitak_1512", now: new Date("2026-08-14T00:00:00.000Z") },
    );
    expect(first.applied).toBe(true);
    expect(first.application.status).toBe("GUIDE_OPEN");

    const again = await openGrantApplicationGuide(
      { hibe },
      { userId: USER, programId: "tubitak-1512-bigg" },
    );
    expect(again.applied).toBe(false);
    expect(again.application.id).toBe(first.application.id);

    const done = await openGrantApplicationGuide(
      { hibe },
      { userId: USER, programId: first.program.id, completeChecklist: true },
    );
    expect(done.applied).toBe(true);
    expect(done.application.status).toBe("CHECKLIST_DONE");
    expect(done.application.completedAt).not.toBeNull();

    const pulse = await buildHibePulse(
      { hibe },
      USER,
      {
        jurisdiction: "TR",
        applicantKind: "INDIVIDUAL",
        hasTaxId: false,
        sectorTags: [],
      },
    );
    expect(pulse.applicationsDone).toBe(1);
    expect(pulse.recommendations.some((row) => row.slug === "tubitak-1512-bigg")).toBe(true);
  });
});
