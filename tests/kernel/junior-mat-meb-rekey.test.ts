import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  canonicalJuniorLessonKey,
  juniorLegacyLessonRedirectPath,
  JUNIOR_GUEST_TRIAL_HOOKS,
  JUNIOR_MAT_LEGACY_LESSON_KEY,
  migrateJuniorMatLessonStorage,
} from "@/lib/junior/lesson-key-alias";
import { JUNIOR_PILOT_TRIAL_LESSON_KEYS } from "@/lib/junior/limits";

class MemoryStorage implements Storage {
  private readonly rows = new Map<string, string>();

  get length(): number {
    return this.rows.size;
  }

  clear(): void {
    this.rows.clear();
  }

  getItem(key: string): string | null {
    return this.rows.get(key) ?? null;
  }

  key(index: number): string | null {
    return [...this.rows.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.rows.delete(key);
  }

  setItem(key: string, value: string): void {
    this.rows.set(key, value);
  }
}

describe("matematik MEB anahtar taşıması", () => {
  it("canlı anahtarı ve misafir deneme kancasını yerinde bırakır", () => {
    expect(Object.keys(JUNIOR_MAT_LEGACY_LESSON_KEY)).toHaveLength(12);
    expect(JUNIOR_GUEST_TRIAL_HOOKS).toEqual([...JUNIOR_PILOT_TRIAL_LESSON_KEYS]);
    expect(canonicalJuniorLessonKey("jr_06_mat-1")).toBe("jr_06_mat-1");
    expect(canonicalJuniorLessonKey("jr_06_mat-2")).toBe("jr_06_mat-2");
    expect(canonicalJuniorLessonKey("jr_06_mat-3")).toBe("jr_06_mat-3");
    expect(canonicalJuniorLessonKey("jr_06_mat-5")).toBe("jr_06_mat-5");
    expect(canonicalJuniorLessonKey("jr_06_mat-6")).toBe("jr_06_mat-6");
    expect(canonicalJuniorLessonKey("jr_06_mat-27")).toBe("jr_06_mat-6");
    expect(canonicalJuniorLessonKey("jr_06_mat-38")).toBe("jr_06_mat-26");
    expect(canonicalJuniorLessonKey("jr_06_fen-1")).toBe("jr_06_fen-1");
    expect(juniorLegacyLessonRedirectPath("/junior/ders/jr_06_mat-6")).toBeNull();
    expect(juniorLegacyLessonRedirectPath("/junior/ders/jr_06_mat-27")).toBe("/junior/ders/jr_06_mat-6");
    expect(juniorLegacyLessonRedirectPath("/junior/ders/jr_06_mat-1?devam=1")).toBeNull();
  });

  it("emekli numarayı taşır, misafir kancasını ve canlı dersi yerinde bırakır", () => {
    const storage = new MemoryStorage();
    storage.setItem("yetkin.junior.lesson-progress.v1:cocuk:jr_06_mat-1", "carpan");
    storage.setItem("yetkin.junior.lesson-progress.v1:cocuk:jr_06_mat-2", "asal");
    storage.setItem("yetkin.junior.lesson-progress.v1:cocuk:jr_06_mat-3", "ortak");
    storage.setItem("yetkin.junior.lesson-progress.v1:cocuk:jr_06_mat-5", "canli-bes");
    storage.setItem("yetkin.junior.lesson-progress.v1:cocuk:jr_06_mat-38", "olasilik");
    storage.setItem("yetkin.junior.micro.v1:cocuk:jr_06_mat-27", "uzunluk");
    storage.setItem("yetkin.junior.lesson-progress.v1:cocuk:jr_06_fen-1", "fen");

    migrateJuniorMatLessonStorage(storage);

    expect(storage.getItem("yetkin.junior.lesson-progress.v1:cocuk:jr_06_mat-1")).toBe("carpan");
    expect(storage.getItem("yetkin.junior.lesson-progress.v1:cocuk:jr_06_mat-2")).toBe("asal");
    expect(storage.getItem("yetkin.junior.lesson-progress.v1:cocuk:jr_06_mat-3")).toBe("ortak");
    expect(storage.getItem("yetkin.junior.lesson-progress.v1:cocuk:jr_06_mat-5")).toBe("canli-bes");
    expect(storage.getItem("yetkin.junior.lesson-progress.v1:cocuk:jr_06_mat-26")).toBe("olasilik");
    expect(storage.getItem("yetkin.junior.micro.v1:cocuk:jr_06_mat-6")).toBe("uzunluk");
    expect(storage.getItem("yetkin.junior.micro.v1:cocuk:jr_06_mat-27")).toBeNull();
    expect(storage.getItem("yetkin.junior.lesson-progress.v1:cocuk:jr_06_mat-38")).toBeNull();
    expect(storage.getItem("yetkin.junior.lesson-progress.v1:cocuk:jr_06_fen-1")).toBe("fen");

    storage.setItem("yetkin.junior.lesson-progress.v1:cocuk:jr_06_mat-5", "yerinde");
    migrateJuniorMatLessonStorage(storage);
    expect(storage.getItem("yetkin.junior.lesson-progress.v1:cocuk:jr_06_mat-1")).toBe("carpan");
    expect(storage.getItem("yetkin.junior.lesson-progress.v1:cocuk:jr_06_mat-5")).toBe("yerinde");
  });

  it("veritabanı güncellemesi tek CASE cümlesidir", () => {
    const sql = readFileSync(
      join(process.cwd(), "prisma/migrations/20261024170000_junior_mat_meb_lesson_key/migration.sql"),
      "utf8",
    );
    const updates = sql.match(/\bUPDATE\b/gu) ?? [];
    expect(updates).toHaveLength(1);
    expect(sql).toContain("CASE \"lesson_key\"");
    expect(sql).toContain("WHEN 'jr_06_mat-5' THEN 'jr_06_mat-1'");
    expect(sql).toContain("WHEN 'jr_06_mat-26' THEN 'jr_06_mat-5'");
    expect(sql).toContain("WHEN 'jr_06_mat-38' THEN 'jr_06_mat-26'");
  });
});
