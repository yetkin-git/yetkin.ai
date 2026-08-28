import { describe, expect, it } from "vitest";
import { GENERIC_INTERNAL_ERROR, jsonFromUnknown } from "@/lib/kernel/http/json";
import { BadRequestError, ForbiddenError } from "@/lib/kernel/http/errors";

describe("jsonFromUnknown ham hata sızıntısı", () => {
  it("typed hataların mesajını açar", async () => {
    const forbidden = jsonFromUnknown(new ForbiddenError("Kapı kilitli."));
    expect(forbidden.status).toBe(403);
    expect(await forbidden.json()).toMatchObject({ ok: false, error: "Kapı kilitli." });

    const bad = jsonFromUnknown(new BadRequestError("Eksik alan."));
    expect(bad.status).toBe(400);
    expect(await bad.json()).toMatchObject({ ok: false, error: "Eksik alan." });
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
});
