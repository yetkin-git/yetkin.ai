import { describe, expect, it } from "vitest";
import { AuthRequiredError, sessionUserNotInDatabaseMessage } from "@/lib/kernel/auth/require-session";
import { GENERIC_INTERNAL_ERROR, jsonFromUnknown } from "@/lib/kernel/http/json";
import { BadRequestError, ForbiddenError, ServiceUnavailableError } from "@/lib/kernel/http/errors";
import { RAIL_V1_ACCEPT_MARKETPLACE_UNAVAILABLE } from "@/lib/kernel/http/v1-contract";

describe("jsonFromUnknown ham hata sızıntısı", () => {
  it("typed hataların mesajını açar", async () => {
    const forbidden = jsonFromUnknown(new ForbiddenError("Kapı kilitli."));
    expect(forbidden.status).toBe(403);
    expect(await forbidden.json()).toMatchObject({ ok: false, error: "Kapı kilitli." });

    const bad = jsonFromUnknown(new BadRequestError("Eksik alan."));
    expect(bad.status).toBe(400);
    expect(await bad.json()).toMatchObject({ ok: false, error: "Eksik alan." });

    const unavailable = jsonFromUnknown(
      new ServiceUnavailableError(RAIL_V1_ACCEPT_MARKETPLACE_UNAVAILABLE),
    );
    expect(unavailable.status).toBe(503);
    expect(await unavailable.json()).toMatchObject({
      ok: false,
      error: RAIL_V1_ACCEPT_MARKETPLACE_UNAVAILABLE,
    });
  });

  it("bilinmeyen Error.message sızmaz; 500 + requestId", async () => {
    const error = new Error("Prisma P2002: unique constraint failed on secret_table");
    const response = jsonFromUnknown(error, 400, "11111111-1111-4111-8111-111111111111");
    expect(response.status).toBe(500);
    expect(response.headers.get("x-request-id") ?? response.headers.get("X-Request-Id")).toBeTruthy();
    expect(await response.json()).toMatchObject({
      ok: false,
      error: GENERIC_INTERNAL_ERROR,
    });
    const body = (await jsonFromUnknown(error).json()) as { error?: string };
    expect(body.error).not.toContain("Prisma");
    expect(body.error).not.toContain("secret_table");
  });

  it("P2024 havuz kilidi 503 + vatandaş cümlesi; SQL sızmaz", async () => {
    const error = new Error("Timed out fetching a new connection from the connection pool.");
    error.name = "PrismaClientKnownRequestError";
    (error as unknown as { code: string }).code = "P2024";
    const response = jsonFromUnknown(error, 400, "11111111-1111-4111-8111-111111111111");
    expect(response.status).toBe(503);
    const body = (await response.json()) as { error?: string };
    expect(body.error).toBe("Veritabanı geçici olarak meşgul. Lütfen birkaç saniye sonra tekrar deneyin.");
    expect(body.error).not.toContain("P2024");
    expect(body.error).not.toContain("connection pool");
  });

  it("oturum user satırı yok 401; Prisma P2003 sızmaz", async () => {
    const response = jsonFromUnknown(
      new AuthRequiredError(sessionUserNotInDatabaseMessage({ NODE_ENV: "development" })),
      400,
      "11111111-1111-4111-8111-111111111111",
    );
    expect(response.status).toBe(401);
    const body = (await response.json()) as { error?: string };
    expect(body.error).toContain("veritabanında yok");
    expect(body.error).toContain("Geliştirme");
    expect(body.error).not.toContain("P2003");
    expect(sessionUserNotInDatabaseMessage({ NODE_ENV: "production" })).not.toContain("Geliştirme");
  });
});
