import { describe, expect, it } from "vitest";

import {
  deriveGrantProjectTitle,
  filterActiveLifecycleApplications,
  pickPrimaryLifecycleApplication,
  type ActiveLifecycleApplication,
} from "@/lib/yetkinhibe/grant-lifecycle";

const BASE_APP: ActiveLifecycleApplication = {
  id: "app-test-001",
  grantId: "kosgeb-arge-inovasyon-2026",
  grantTitle: "KOSGEB Ar-Ge ve İnovasyon Destek Programı",
  projectTitle: "Akıllı üretim hattı optimizasyonu",
  status: "SUBMITTED",
  matchScorePct: 82,
  readinessPct: 76,
  totalBudgetLabel: "₺1.250.000",
  requestedSupportLabel: "₺875.000",
  updatedAt: "2026-04-01T10:00:00.000Z",
};

describe("grant-lifecycle — deriveGrantProjectTitle", () => {
  it("iş paketi adından proje başlığı türetir", () => {
    expect(
      deriveGrantProjectTitle(
        [{ name: "Prototip geliştirme" }],
        "KOSGEB Ar-Ge ve İnovasyon Destek Programı",
      ),
    ).toBe("Prototip geliştirme");
  });

  it("iş paketi yoksa hibe başlığını kullanır", () => {
    expect(deriveGrantProjectTitle(null, "TÜBİTAK 1501")).toBe("TÜBİTAK 1501");
  });
});

describe("grant-lifecycle — filterActiveLifecycleApplications", () => {
  it("yalnızca IN_PREPARATION ve SUBMITTED durumlarını döner", () => {
    const apps: ActiveLifecycleApplication[] = [
      { ...BASE_APP, id: "a1", status: "SUBMITTED" },
      { ...BASE_APP, id: "a2", status: "IN_PREPARATION" },
      { ...BASE_APP, id: "a3", status: "MATCHED" },
      { ...BASE_APP, id: "a4", status: "ARCHIVED" },
    ];
    const active = filterActiveLifecycleApplications(apps);
    expect(active.map((a) => a.id)).toEqual(["a1", "a2"]);
  });
});

describe("grant-lifecycle — pickPrimaryLifecycleApplication", () => {
  it("SUBMITTED durumunu IN_PREPARATION'a tercih eder", () => {
    const apps: ActiveLifecycleApplication[] = [
      { ...BASE_APP, id: "prep", status: "IN_PREPARATION", readinessPct: 90 },
      { ...BASE_APP, id: "sub", status: "SUBMITTED", readinessPct: 50 },
    ];
    expect(pickPrimaryLifecycleApplication(apps)?.id).toBe("sub");
  });
});

describe("grant-lifecycle — sahte durum üretici yok (A5)", () => {
  it("buildGrantLifecycleState modülden dışa açılmaz", async () => {
    const mod = await import("@/lib/yetkinhibe/grant-lifecycle");
    expect(Object.keys(mod)).not.toContain("buildGrantLifecycleState");
  });
});
