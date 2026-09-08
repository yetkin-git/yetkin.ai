import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

describe("kurs ses önizleme yüzeyi", () => {
  it("CourseAudioPreview canlı ağaçta yoktur; vitrin vaadi taşımaz", () => {
    expect(existsSync(join(ROOT, "components/academy/course-audio-preview.tsx"))).toBe(false);
    expect(existsSync(join(ROOT, "archived/components/academy-studio/course-audio-preview.tsx"))).toBe(
      true,
    );
    const player = readFileSync(join(ROOT, "components/academy/curriculum-player.tsx"), "utf8");
    expect(player).not.toContain("CourseAudioPreview");
    const antre = readFileSync(join(ROOT, "app/academy/[slug]/page.tsx"), "utf8");
    expect(antre).not.toContain("CourseAudioPreview");
  });
});
