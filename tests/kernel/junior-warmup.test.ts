import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  JUNIOR_CORE_WARMUP_SRC,
  JUNIOR_WARMUP_FAILSAFE_MS,
  JUNIOR_WARMUP_MAX_SEC,
  juniorWarmupSrc,
} from "@/lib/junior/warmup";

const root = process.cwd();

describe("Junior ısınma kaseti", () => {
  it("beş çekirdek dersi kendi kasetine bağlar", () => {
    expect(juniorWarmupSrc("jr_06_mat-1")).toBe("/media/junior/warmup/jr_06_mat-warmup.mp4");
    expect(juniorWarmupSrc("jr_06_fen-12")).toBe("/media/junior/warmup/jr_06_fen-warmup.mp4");
    expect(juniorWarmupSrc("jr_06_turkce-3")).toBe("/media/junior/warmup/jr_06_turkce-warmup.mp4");
    expect(juniorWarmupSrc("jr_06_sosyal-20")).toBe("/media/junior/warmup/jr_06_sosyal-warmup.mp4");
    expect(juniorWarmupSrc("jr_06_ing_main-1")).toBe("/media/junior/warmup/jr_06_ing_main-warmup.mp4");
    expect(juniorWarmupSrc("jr_06_ing_main")).toBe(JUNIOR_CORE_WARMUP_SRC.jr_06_ing_main);
  });

  it("seçmeli ders ve boş anahtarda kaset açmaz", () => {
    expect(juniorWarmupSrc("jr_06_ing-1")).toBeNull();
    expect(juniorWarmupSrc("jr_06_alm-2")).toBeNull();
    expect(juniorWarmupSrc("jr_06_fra-1")).toBeNull();
    expect(juniorWarmupSrc("jr_06_siyer-1")).toBeNull();
    expect(juniorWarmupSrc("jr_06_kod-1")).toBeNull();
    expect(juniorWarmupSrc("jr_06_arp-2")).toBeNull();
    expect(juniorWarmupSrc("")).toBeNull();
    expect(juniorWarmupSrc("jr_06_math-1")).toBeNull();
  });

  it("süre tavanı 10 saniyedir; gitignore dışı kaset klonda zorunlu değildir", () => {
    expect(JUNIOR_WARMUP_MAX_SEC).toBe(10);
    expect(JUNIOR_WARMUP_FAILSAFE_MS).toBeGreaterThan(JUNIOR_WARMUP_MAX_SEC * 1000);
    const paths = Object.values(JUNIOR_CORE_WARMUP_SRC).map((src) =>
      join(root, "public", src.replace(/^\//, "")),
    );
    const present = paths.filter((path) => existsSync(path));
    if (present.length === 0) {
      expect(readFileSync(join(root, ".gitignore"), "utf8")).toContain(
        "public/media/junior/warmup/",
      );
      return;
    }
    expect(present).toEqual(paths);
  });
});
