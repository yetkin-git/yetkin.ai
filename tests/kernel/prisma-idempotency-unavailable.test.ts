import { describe, expect, it } from "vitest";
import { DATABASE_BUSY_ERROR } from "@/lib/kernel/db-errors";
import { ServiceUnavailableError } from "@/lib/kernel/http/errors";
import { bindHttpIdempotencyStore } from "@/lib/kernel/http/prisma-idempotency-store";

function poolTimeoutError(): Error {
  const error = new Error("Timed out fetching a new connection from the connection pool.");
  error.name = "PrismaClientKnownRequestError";
  (error as unknown as { code: string }).code = "P2024";
  return error;
}

function uniqueViolation(): Error {
  const error = new Error("Unique constraint failed on the fields: (`user_id`,`route`,`key`)");
  error.name = "PrismaClientKnownRequestError";
  (error as unknown as { code: string }).code = "P2002";
  return error;
}

function foreignKeyViolation(): Error {
  const error = new Error(
    "Foreign key constraint violated on the constraint: `http_idempotency_records_user_id_fkey`",
  );
  error.name = "PrismaClientKnownRequestError";
  (error as unknown as { code: string }).code = "P2003";
  return error;
}

describe("Prisma HTTP idempotency havuz kopması", () => {
  it("begin P2024'te ServiceUnavailableError + vatandaş cümlesi basar", async () => {
    const store = bindHttpIdempotencyStore({
      httpIdempotencyRecord: {
        create: async () => {
          throw poolTimeoutError();
        },
      },
    } as never);

    await expect(
      store.begin({
        userId: "user-1",
        route: "/api/freelancer/jobs",
        key: "550e8400-e29b-41d4-a716-446655440000",
        requestHash: "abc",
      }),
    ).rejects.toSatisfy((error: unknown) => {
      return error instanceof ServiceUnavailableError && error.message === DATABASE_BUSY_ERROR;
    });
  });

  it("P2002 unique ihlali 503'e çevrilmez; mevcut satır okunur", async () => {
    const store = bindHttpIdempotencyStore({
      httpIdempotencyRecord: {
        create: async () => {
          throw uniqueViolation();
        },
        findUnique: async () => ({
          id: "row-1",
          userId: "user-1",
          route: "/api/freelancer/jobs",
          key: "550e8400-e29b-41d4-a716-446655440000",
          requestHash: "abc",
          status: "completed",
          statusCode: 201,
          responseJson: JSON.stringify({ job: { id: "fj_1" } }),
          createdAt: new Date("2026-08-30T00:00:00.000Z"),
        }),
      },
    } as never);

    const began = await store.begin({
      userId: "user-1",
      route: "/api/freelancer/jobs",
      key: "550e8400-e29b-41d4-a716-446655440000",
      requestHash: "abc",
    });
    expect(began.kind).toBe("replay");
  });

  it("P2003 yabancı anahtar 503 basmaz; begin bypassed döner", async () => {
    const store = bindHttpIdempotencyStore({
      httpIdempotencyRecord: {
        create: async () => {
          throw foreignKeyViolation();
        },
      },
    } as never);

    const began = await store.begin({
      userId: "user-missing",
      route: "/api/freelancer/jobs",
      key: "550e8400-e29b-41d4-a716-446655440000",
      requestHash: "abc",
    });
    expect(began.kind).toBe("bypassed");
  });

  it("userId veritabanında yoksa create çağrılmaz; bypassed döner", async () => {
    let created = 0;
    const store = bindHttpIdempotencyStore({
      user: {
        findUnique: async () => null,
      },
      httpIdempotencyRecord: {
        create: async () => {
          created += 1;
          throw new Error("create çağrılmamalı");
        },
      },
    } as never);

    const began = await store.begin({
      userId: "user-missing",
      route: "/api/freelancer/jobs",
      key: "550e8400-e29b-41d4-a716-446655440000",
      requestHash: "abc",
    });
    expect(began.kind).toBe("bypassed");
    expect(created).toBe(0);
  });
});
