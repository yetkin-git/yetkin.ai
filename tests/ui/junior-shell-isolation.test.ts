import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { breadcrumbsFromPathname } from "@/lib/ui/breadcrumbs";
import { isJuniorShellPath, shellBrandHome } from "@/lib/ui/junior-shell";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const ADULT_ROOM = /\/(dashboard|academy|career|freelancer|pasaport|cuzdan|profil)(?![a-z-])/;

describe("junior çocuk kabuğu", () => {
  it("vitrin yetişkin akademi elini basmaz", () => {
    const page = readSrc("app/junior/page.tsx");
    expect(page).not.toContain("Yetişkin iş eğitimleri");
    expect(page).not.toContain('href="/academy"');
    expect(page).not.toContain("data-room-handoff");
    expect(page).not.toContain('from "next/link"');
  });

  it("yan bar, marka ve hesap menüsü junior yolunda yetişkin odaya çıkmaz", () => {
    expect(isJuniorShellPath("/junior")).toBe(true);
    expect(isJuniorShellPath("/junior/ders/jr_06_mat-1")).toBe(true);
    expect(isJuniorShellPath("/junior/checkout")).toBe(true);
    expect(isJuniorShellPath("/academy")).toBe(false);
    expect(shellBrandHome("/junior")).toEqual({ href: "/junior", tagline: "6. Sınıf Pilot" });
    expect(shellBrandHome("/dashboard").href).toBe("/dashboard");

    const nav = readSrc("components/shell/sidebar-nav.tsx");
    const hub = readSrc("components/shell/user-hub.tsx");
    expect(nav).toContain("isJuniorShellPath");
    expect(nav).toContain('room.id === "junior"');
    expect(hub).toContain("isJuniorShellPath");
    expect(hub).toContain("!juniorShell");

    for (const path of ["/junior", "/junior/ders/jr_06_mat-1", "/junior/checkout"]) {
      for (const crumb of breadcrumbsFromPathname(path)) {
        expect(crumb.href, path).not.toMatch(ADULT_ROOM);
      }
    }
  });
});
