import { describe, expect, it } from "vitest";
import {
  DISPLAY_NAME_INVALID,
  DISPLAY_NAME_NOT_FOUND,
  DISPLAY_NAME_UNAUTHORIZED,
  runDisplayNamePatch,
  type DisplayNameWriteStore,
} from "@/lib/kernel/identity/display-name-write";
import { DISPLAY_NAME_MAX_LENGTH, PROFILE_WRITE_PATH } from "@/lib/kernel/identity/types";
import type { IdentityProfile } from "@/lib/kernel/identity/types";

const CITIZEN_ID = "22222222-2222-4222-8222-222222222222";
const OTHER_ID = "33333333-3333-4333-8333-333333333333";
const CITIZEN = { id: CITIZEN_ID, email: "vatandas@yetkin.rail" };

function profile(overrides: Partial<IdentityProfile> = {}): IdentityProfile {
  return {
    userId: CITIZEN_ID,
    email: "vatandas@yetkin.rail",
    displayName: null,
    locale: "tr-TR",
    timeZone: "Europe/Istanbul",
    createdAt: new Date("2026-08-14T17:03:00.000Z"),
    ...overrides,
  };
}

function createMemoryDisplayNameStore(
  users: IdentityProfile[],
): DisplayNameWriteStore & { snapshot(userId: string): IdentityProfile | null } {
  const byId = new Map(users.map((row) => [row.userId, { ...row }]));
  return {
    snapshot(userId) {
      const row = byId.get(userId);
      return row ? { ...row } : null;
    },
    async updateDisplayName(input) {
      const row = byId.get(input.userId);
      if (!row) {
        return null;
      }
      const next = { ...row, displayName: input.displayName };
      byId.set(input.userId, next);
      return { ...next };
    },
  };
}

describe("profil displayName PATCH yazma", () => {
  it("oturumsuz PATCH 401 döner", async () => {
    const response = await runDisplayNamePatch({
      session: null,
      body: { displayName: "Ayşe Kaya" },
      getStore: () => createMemoryDisplayNameStore([profile()]),
    });
    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({
      ok: false,
      error: DISPLAY_NAME_UNAUTHORIZED,
      apiVersion: "1",
      data: null,
    });
  });

  it("oturum sahibi görünen adı 200 ile günceller; e-posta dokunulmaz", async () => {
    const store = createMemoryDisplayNameStore([profile()]);
    const response = await runDisplayNamePatch({
      session: CITIZEN,
      body: { displayName: "  Ayşe Kaya  " },
      getStore: () => store,
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      ok: boolean;
      data: { profile: { displayName: string; email: string; userId: string } };
    };
    expect(body.ok).toBe(true);
    expect(body.data.profile.displayName).toBe("Ayşe Kaya");
    expect(body.data.profile.email).toBe("vatandas@yetkin.rail");
    expect(body.data.profile.userId).toBe(CITIZEN_ID);
    expect(store.snapshot(CITIZEN_ID)?.displayName).toBe("Ayşe Kaya");
    expect(store.snapshot(CITIZEN_ID)?.email).toBe("vatandas@yetkin.rail");
  });

  it("gövdedeki yabancı userId yazılmaz; yalnız oturum satırı güncellenir", async () => {
    const store = createMemoryDisplayNameStore([
      profile(),
      profile({ userId: OTHER_ID, email: "diger@yetkin.rail", displayName: "Korunan" }),
    ]);
    const response = await runDisplayNamePatch({
      session: CITIZEN,
      body: { displayName: "Ayşe Kaya", userId: OTHER_ID },
      getStore: () => store,
    });
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      ok: false,
      error: DISPLAY_NAME_INVALID,
      apiVersion: "1",
      data: null,
    });
    expect(store.snapshot(CITIZEN_ID)?.displayName).toBeNull();
    expect(store.snapshot(OTHER_ID)?.displayName).toBe("Korunan");
  });

  it("e-posta alanı gövdede varsa reddeder (SSOT Auth)", async () => {
    const store = createMemoryDisplayNameStore([profile()]);
    const response = await runDisplayNamePatch({
      session: CITIZEN,
      body: { displayName: "Ayşe Kaya", email: "hack@yetkin.rail" },
      getStore: () => store,
    });
    expect(response.status).toBe(400);
    expect(store.snapshot(CITIZEN_ID)?.email).toBe("vatandas@yetkin.rail");
  });

  it("boş ad ve User satırı yok 400/404", async () => {
    const empty = await runDisplayNamePatch({
      session: CITIZEN,
      body: { displayName: "   " },
      getStore: () => createMemoryDisplayNameStore([profile()]),
    });
    expect(empty.status).toBe(400);

    const missing = await runDisplayNamePatch({
      session: CITIZEN,
      body: { displayName: "Ayşe Kaya" },
      getStore: () => createMemoryDisplayNameStore([]),
    });
    expect(missing.status).toBe(404);
    expect(await missing.json()).toMatchObject({
      ok: false,
      error: DISPLAY_NAME_NOT_FOUND,
      apiVersion: "1",
      data: null,
    });
  });

  it("yazma yolu /api/profile; tavan 80 karakter", () => {
    expect(PROFILE_WRITE_PATH).toBe("/api/profile");
    expect(DISPLAY_NAME_MAX_LENGTH).toBe(80);
  });
});
