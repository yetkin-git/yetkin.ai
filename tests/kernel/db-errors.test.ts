import { describe, expect, it } from "vitest";
import {
  DATABASE_BUSY_ERROR,
  isPrismaClientError,
  isPrismaForeignKeyViolation,
  isPrismaPoolBusyError,
  isPrismaTransientConnectionError,
  isPrismaUniqueViolation,
  isPrismaUnavailableError,
} from "@/lib/kernel/db-errors";

function withCode(message: string, code: string, name = "PrismaClientKnownRequestError") {
  const error = new Error(message);
  error.name = name;
  (error as unknown as { code: string }).code = code;
  return error;
}

describe("Prisma havuz / kopuk soket etiketleri", () => {
  it("P2024 ve pg kuyruk timeout'u havuz meşgul sayılır; yeniden deneme değildir", () => {
    const pool = withCode(
      "Timed out fetching a new connection from the connection pool.",
      "P2024",
    );
    expect(isPrismaPoolBusyError(pool)).toBe(true);
    expect(isPrismaTransientConnectionError(pool)).toBe(false);
    expect(isPrismaUnavailableError(pool)).toBe(true);

    const pg = new Error("timeout exceeded when trying to connect");
    expect(isPrismaPoolBusyError(pg)).toBe(true);
    expect(isPrismaTransientConnectionError(pg)).toBe(false);
  });

  it("ECONNRESET / P1017 geçici kopmadır; unique ihlali değildir", () => {
    const reset = new Error("read ECONNRESET");
    expect(isPrismaTransientConnectionError(reset)).toBe(true);
    expect(isPrismaPoolBusyError(reset)).toBe(false);

    const closed = withCode("Server has closed the connection.", "P1017");
    expect(isPrismaTransientConnectionError(closed)).toBe(true);

    const unique = withCode("Unique constraint failed", "P2002");
    expect(isPrismaUnavailableError(unique)).toBe(false);
    expect(isPrismaUniqueViolation(unique)).toBe(true);
    expect(DATABASE_BUSY_ERROR).toMatch(/meşgul/);
  });

  it("P2002 / 23505 unique ihlali mevcut satır olarak yakalanır", () => {
    const prisma = withCode("Unique constraint failed on the constraint: `academy_purchases_user_id_course_id_key`", "P2002");
    expect(isPrismaUniqueViolation(prisma)).toBe(true);
    expect(isPrismaUnavailableError(prisma)).toBe(false);

    const pg = withCode("duplicate key value violates unique constraint", "23505");
    expect(isPrismaUniqueViolation(pg)).toBe(true);
    expect(isPrismaClientError(prisma)).toBe(true);
    expect(isPrismaClientError(new Error("plain"))).toBe(false);
  });

  it("P2003 yabancı anahtar 503 değildir; oturum senkronu olarak yakalanır", () => {
    const fk = withCode(
      "Foreign key constraint violated on the constraint: `http_idempotency_records_user_id_fkey`",
      "P2003",
    );
    expect(isPrismaForeignKeyViolation(fk)).toBe(true);
    expect(isPrismaUnavailableError(fk)).toBe(false);

    const pg = withCode("insert or update on table violates foreign key constraint", "23503");
    expect(isPrismaForeignKeyViolation(pg)).toBe(true);
  });
});
