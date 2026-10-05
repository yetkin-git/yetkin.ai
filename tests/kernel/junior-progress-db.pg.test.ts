import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { insertLabCitizen, labUserId, pgConstraint, withLabPg } from "../helpers/pg-lab";

describe("junior_progress quiz — Postgres CHECK", () => {
  it("quiz satırı yazılır; tanımsız mod junior_progress_shape ile düşer", async () => {
    const userId = labUserId("junior-quiz");
    const profileId = randomUUID();
    const progressId = randomUUID();
    await insertLabCitizen({ id: userId, email: `junior-quiz-${userId}@lab.rail` });

    await withLabPg(async (client) => {
      await client.query(
        `INSERT INTO junior_profiles (
           id, user_id, nickname, grade, birth_year, consent_at, selected, created_at, updated_at
         ) VALUES ($1, $2, 'Ege', 6, 2015, NOW(), true, NOW(), NOW())`,
        [profileId, userId],
      );
      await client.query(
        `INSERT INTO junior_progress (
           id, user_id, profile_id, lesson_key, mode, praised, missing, advice, score, xp_awarded, created_at
         ) VALUES ($1, $2, $3, 'jr_06_mat-1', 'quiz', 'Pay doğru.', 'Payda eksik.', 'Tekrar anlat.', 80, 10, NOW())`,
        [progressId, userId, profileId],
      );
    });

    const row = await withLabPg(async (client) => {
      const result = await client.query<{ mode: string }>(
        `SELECT mode FROM junior_progress WHERE id = $1`,
        [progressId],
      );
      return result.rows[0]?.mode ?? null;
    });
    expect(row).toBe("quiz");

    const rejected = await withLabPg(async (client) => {
      try {
        await client.query(
          `INSERT INTO junior_progress (
             id, user_id, profile_id, lesson_key, mode, praised, missing, advice, score, xp_awarded, created_at
           ) VALUES ($1, $2, $3, 'jr_06_mat-1', 'listen', 'x', 'y', 'z', 1, 0, NOW())`,
          [randomUUID(), userId, profileId],
        );
        return null;
      } catch (error) {
        return pgConstraint(error);
      }
    });
    expect(rejected?.code).toBe("23514");
    expect(rejected?.constraint).toBe("junior_progress_shape");
  });
});
