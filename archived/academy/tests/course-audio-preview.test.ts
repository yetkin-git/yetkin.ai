import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

describe("kurs ses önizleme yüzeyi", () => {
  it("CourseAudioPreview canlı ağaçta yoktur; vitrin vaadi taşımaz", () => {
    expect(existsSync(join(ROOT, "archived/academy/components/course-audio-preview.tsx"))).toBe(false);
    expect(existsSync(join(ROOT, "archived/components/academy-studio/course-audio-preview.tsx"))).toBe(
      true,
    );
    const player = readFileSync(join(ROOT, "archived/academy/components/curriculum-player.tsx"), "utf8");
    expect(player).not.toContain("CourseAudioPreview");
    const antre = readFileSync(join(ROOT, "archived/academy/app/[slug]/page.tsx"), "utf8");
    expect(antre).not.toContain("CourseAudioPreview");
  });
});
