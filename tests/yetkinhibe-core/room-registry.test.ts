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
      path: "/yetkinhibe",
      vitrin: false,
      kapali: true,
      hops: [],
      bayrakEnv: ENV_KEY,
    });
    expect(INDEPENDENT_ROOMS.map((room) => room.id)).toContain("yetkinhibe");
    expect(VERTICAL_ROOMS.map((room) => room.id)).not.toContain("yetkinhibe");
  });

  it("donmuş disk listesinde değildir; donmuş hibe kimliği ayrı kalır", () => {
    expect(FROZEN_DISK_ROOMS).not.toContain("yetkinhibe");
    expect(FROZEN_DISK_ROOMS).toContain("hibe");
    expect(DronBayrakları.isDonmus("yetkinhibe")).toBe(false);
  });

  it("bayrak yokken kapalıdır; open ve closed değerleri kapıyı çevirir", () => {
    expect(DronBayrakları.isKapali("yetkinhibe")).toBe(true);
    process.env[ENV_KEY] = "open";
    expect(DronBayrakları.isKapali("yetkinhibe")).toBe(false);
    process.env[ENV_KEY] = "closed";
    expect(DronBayrakları.isKapali("yetkinhibe")).toBe(true);
  });

  it("kapalıyken oda ve sihirbaz yolu kapalı yüzey yolu sayılır", () => {
    expect(isFrozenShellPagePath("/yetkinhibe")).toBe(true);
    const wizardPath = new URL(buildGrantWizardHref({ grantId: "g-1" }), "https://yetkin.ai").pathname;
    expect(wizardPath).toBe("/yetkinhibe/olustur");
    expect(isFrozenShellPagePath(wizardPath)).toBe(true);
  });
});
