import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  DRON_KAYIT,
  DronBayrakları,
  FROZEN_DISK_ROOMS,
  INDEPENDENT_ROOMS,
  VERTICAL_ROOMS,
} from "@/lib/dronlar/kayit";
import { isFrozenShellPagePath } from "@/lib/kernel/compliance/circuit-breakers";
import { buildGrantWizardHref } from "@/lib/yetkinhibe/wizard-navigation";

const ENV_KEY = "DRON_YETKINHIBE_OPEN";

let previousEnv: string | undefined;

beforeEach(() => {
  previousEnv = process.env[ENV_KEY];
  delete process.env[ENV_KEY];
});

afterEach(() => {
  if (previousEnv === undefined) {
    delete process.env[ENV_KEY];
  } else {
    process.env[ENV_KEY] = previousEnv;
  }
});

describe("YetkinHibe oda sicili", () => {
  it("müstakil kapalı satır olarak kayıtlıdır; hop ve kamu vitrini yoktur", () => {
    const row = DRON_KAYIT.find((entry) => entry.id === "yetkinhibe");
    expect(row).toMatchObject({
      path: "/panel/hibe",
      vitrin: false,
      kapali: false,
      hops: [],
    });
    expect(INDEPENDENT_ROOMS.map((room) => room.id)).toContain("yetkinhibe");
    expect(VERTICAL_ROOMS.map((room) => room.id)).not.toContain("yetkinhibe");
  });

  it("donmuş disk listesinde değildir; donmuş hibe kimliği ayrı kalır", () => {
    expect(FROZEN_DISK_ROOMS).not.toContain("yetkinhibe");
    expect(FROZEN_DISK_ROOMS).toContain("hibe");
    expect(DronBayrakları.isDonmus("yetkinhibe")).toBe(false);
  });

  it("açık işletim sistemidir; eski donmuş /hibe yolu 410 yemez", () => {
    expect(DronBayrakları.isKapali("yetkinhibe")).toBe(false);
    expect(isFrozenShellPagePath("/hibe")).toBe(false);
    expect(isFrozenShellPagePath("/hibe/arsiv")).toBe(false);
    const wizardPath = new URL(buildGrantWizardHref({ grantId: "g-1" }), "https://yetkin.ai").pathname;
    expect(wizardPath).toBe("/panel/hibe");
  });
});
