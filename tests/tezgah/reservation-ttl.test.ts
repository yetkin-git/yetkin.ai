import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  GRANT_DOSSIER_RESERVATION_TTL_MS,
  TEZGAH_GENERATE_RESERVATION_TTL_MS,
  TEZGAH_SWEPT_RESERVATION_SCOPES,
  grantReservationExpired,
} from "@/lib/tezgah/grant/reservation-ttl";
import { TEZGAH_GENERATE_SCOPE, TEZGAH_GRANT_SCOPE } from "@/lib/tezgah/paid-lane";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("Y7 — rezerv TTL süpürgesi iki kapsamı da kapatır", () => {
  it("süpürge hem hibe hem üretim kredisi kapsamını tarar", () => {
    expect([...TEZGAH_SWEPT_RESERVATION_SCOPES]).toEqual([
      TEZGAH_GRANT_SCOPE,
      TEZGAH_GENERATE_SCOPE,
    ]);
    // Regresyon: yalnız hibe kapsamı taranırsa üretim rezervi sızar.
    expect(TEZGAH_SWEPT_RESERVATION_SCOPES).toContain("tezgah.generate");
    expect(TEZGAH_SWEPT_RESERVATION_SCOPES).toContain("tezgah.grant-dossier");
  });

  it("TTL penceresi 15 dakikadır ve iki kapsamda aynıdır", () => {
    expect(GRANT_DOSSIER_RESERVATION_TTL_MS).toBe(15 * 60 * 1000);
    expect(TEZGAH_GENERATE_RESERVATION_TTL_MS).toBe(GRANT_DOSSIER_RESERVATION_TTL_MS);
  });

  it("sınır tam 15. dakikada aşılır; bir milisaniye önce değil", () => {
    const created = new Date("2026-11-24T10:00:00.000Z");
    const justBefore = new Date(created.getTime() + GRANT_DOSSIER_RESERVATION_TTL_MS - 1);
    const atLimit = new Date(created.getTime() + GRANT_DOSSIER_RESERVATION_TTL_MS);
    expect(grantReservationExpired(created, justBefore)).toBe(false);
    expect(grantReservationExpired(created, atLimit)).toBe(true);
  });

  it("süpürge yalnız RESERVED satırları FAILED yapar", () => {
    const source = readSrc("lib/tezgah/grant/reservation-ttl.ts");
    expect(source).toContain('status: "RESERVED"');
    expect(source).toContain('status: "FAILED"');
    // Kredi düşmediği için geri yazım yoktur.
    expect(source).not.toContain("increment");
  });

  it("süpürge Inngest kancasına gerçekten bağlıdır", () => {
    const hooks = readSrc("app/api/(kernel)/jobs/register-grant-hooks.ts");
    expect(hooks).toContain("expireStaleGrantReservations");
    const route = readSrc("app/api/(kernel)/jobs/inngest/route.ts");
    expect(route).toContain("registerGrantMaintenanceHooks");
  });
});
