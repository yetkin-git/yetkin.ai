import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PUBLIC_SEN } from "@/lib/copy/sen-voice/public";
import {
  EIDS_PUBLIC_LISTING_LOCKED,
  FREELANCER_PUBLIC_SURFACE_LOCKED,
  FROZEN_SHELL_PAGE_ALIASES,
  FROZEN_SHELL_ROOM_IDS,
  JUNIOR_PRODUCTION_LOCKED,
  WORKING_SHELL_NAV_ROOM_IDS,
  isFrozenShellPagePath,
  isVitrineRoomFrozen,
} from "@/lib/kernel/compliance/circuit-breakers";
import {
  FROZEN_ROOM_GONE_HEADLINE,
  renderFrozenRoomGoneHtml,
} from "@/lib/kernel/http/frozen-410-html";
import { EDGE_API_FROZEN_ROOM_ERROR } from "@/lib/kernel/security/edge-api-auth";
import { FROZEN_DISK_ROOMS, VERTICAL_ROOMS } from "@/lib/kernel/rooms.ssot";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("üretim kilitleri ve donmuş oda yüzey mühürü", () => {
  it("EİDS, Junior ve Freelancer kamu yüzeyi kilitleri kapalı kalır", () => {
    expect(EIDS_PUBLIC_LISTING_LOCKED).toBe(true);
    expect(JUNIOR_PRODUCTION_LOCKED).toBe(true);
    expect(FREELANCER_PUBLIC_SURFACE_LOCKED).toBe(true);
    const src = readSrc("lib/kernel/compliance/circuit-breakers.ts");
    expect(src).toContain("EIDS_PUBLIC_LISTING_LOCKED_ERROR");
    expect(src).toContain("JUNIOR_PRODUCTION_LOCKED_ERROR");
    expect(src).toContain("FREELANCER_PUBLIC_SURFACE_LOCKED_ERROR");
  });

  it("kamu vitrin nav üç oda basar; freelancer sicilde durur ama menüden düşer", () => {
    expect([...WORKING_SHELL_NAV_ROOM_IDS]).toEqual(["dashboard", "academy", "career"]);
    expect(WORKING_SHELL_NAV_ROOM_IDS).toHaveLength(3);
    expect(VERTICAL_ROOMS.map((r) => r.id)).toEqual(["dashboard", "academy", "career", "freelancer"]);
  });

  it("donmuş disk odaları SSOT FROZEN_DISK_ROOMS ile hizalıdır", () => {
    expect([...FROZEN_SHELL_ROOM_IDS]).toEqual([...FROZEN_DISK_ROOMS]);
    expect(FROZEN_SHELL_ROOM_IDS).toHaveLength(8);
  });

  it("donmuş sayfa yolları ve marka aliasları 410 yüzeyi taşır", () => {
    expect(isFrozenShellPagePath("/studio")).toBe(true);
    expect(isFrozenShellPagePath("/pazaryeri/tezgah")).toBe(true);
    expect(isFrozenShellPagePath("/yetkinilan")).toBe(true);
    expect(isFrozenShellPagePath("/dashboard")).toBe(false);
    expect(isFrozenShellPagePath("/academy")).toBe(false);
    expect(isFrozenShellPagePath("/freelancer")).toBe(true);
    expect(isFrozenShellPagePath("/freelancer/jobs/fj_1")).toBe(true);
    expect(isFrozenShellPagePath("/junior")).toBe(true);
    expect(isFrozenShellPagePath("/junior/ebeveyn")).toBe(true);
    expect([...FROZEN_SHELL_PAGE_ALIASES]).toEqual(["/yetkinx", "/corporate", "/market"]);
  });

  it("vitrin donu: çalışan olmayan oda + junior + kilitli freelancer kamu yüzeyi", () => {
    expect(isVitrineRoomFrozen("studio")).toBe(true);
    expect(isVitrineRoomFrozen("junior")).toBe(true);
    expect(isVitrineRoomFrozen("academy")).toBe(false);
    expect(isVitrineRoomFrozen("freelancer")).toBe(true);
  });

  it("kenar HTML/JSON 410 vatandaş dili SEN aksı ve Quiet Luxury dürüstlüğüyle hizalıdır", () => {
    expect(EDGE_API_FROZEN_ROOM_ERROR).toBe(PUBLIC_SEN.gone.headline);
    expect(FROZEN_ROOM_GONE_HEADLINE).toBe(PUBLIC_SEN.gone.headline);
    expect(PUBLIC_SEN.gone.description).toContain("Sahte vitrin basılmaz");
    expect(PUBLIC_SEN.gone.description).toContain("donmuş backlog");
    const html = renderFrozenRoomGoneHtml("/studio");
    expect(html).toContain(PUBLIC_SEN.gone.eyebrow);
    expect(html).toContain(PUBLIC_SEN.gone.headline);
    expect(html).toContain(PUBLIC_SEN.gone.description);
    expect(html).toContain(PUBLIC_SEN.gone.status);
    expect(html).toContain(`>${PUBLIC_SEN.gone.homeCta}<`);
    expect(html).toContain(`>${PUBLIC_SEN.gone.academyCta}<`);
    expect(html).toContain("Studio üretimde kapalı");
    expect(readSrc("lib/kernel/http/frozen-410-html.ts")).toContain("PUBLIC_SEN.gone");
    expect(readSrc("lib/kernel/http/frozen-gone-route.ts")).toContain("EDGE_API_FROZEN_ROOM_ERROR");
    expect(readSrc("components/shell/frozen-room-gone-page.tsx")).toContain("PUBLIC_SEN.gone");
  });
});
