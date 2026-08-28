import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

function sliceBetween(source: string, start: string, end: string): string {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from + start.length);
  expect(from).toBeGreaterThan(-1);
  expect(to).toBeGreaterThan(from);
  return source.slice(from, to);
}

describe("çalışan oda düz zemin", () => {
  it("kabuk grid overlay basmaz; freelancer çapraz tarama taşımaz", () => {
    const scope = readSrc("components/theme/room-scope.tsx");
    const css = readSrc("app/globals.css");
    expect(scope).not.toContain("room-atmosphere-grid");
    expect(scope).toContain("room-atmosphere-wash");

    const freelancer = sliceBetween(css, "/* Freelancer", "/* Yetkinİlan");
    expect(freelancer).toContain("background: var(--background)");
    expect(freelancer).not.toContain("repeating-linear-gradient");
    expect(freelancer).not.toContain("135deg");

    const academy = sliceBetween(css, '[data-room="academy"]', '[data-room="career"]');
    expect(academy).toContain("background: var(--background)");
    expect(academy).not.toContain("repeating-linear-gradient");
    expect(academy).not.toContain("radial-gradient");

    const career = sliceBetween(css, '[data-room="career"]', '[data-room="social"]');
    expect(career).toContain("background: var(--background)");
    expect(career).not.toContain("repeating-linear-gradient");
    expect(career).not.toContain("radial-gradient");

    const dashboard = sliceBetween(css, '[data-room="dashboard"]', ".action-bridge-stack");
    expect(dashboard).toContain("background: var(--background)");
    expect(dashboard).not.toContain("repeating-linear-gradient");
    expect(dashboard).not.toContain("radial-gradient");
  });

  it("kart ve rozetler düz zeminde shadow-sm + %10 kenarlık taşır", () => {
    const card = readSrc("components/ui/card.tsx");
    const stats = readSrc("components/ui/stat-grid.tsx");
    const badge = readSrc("components/ui/badge.tsx");
    expect(card).toContain("shadow-sm");
    expect(card).toContain("var(--foreground)_10%");
    expect(stats).toContain("shadow-sm");
    expect(stats).toContain("var(--foreground)_10%");
    expect(badge).toContain("shadow-sm");
  });
});
