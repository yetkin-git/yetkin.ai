import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { RIBBON_ROOMS } from "@/lib/kernel/modules";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(path.join(ROOT, relative), "utf8");
}

describe("dashboard kokpit kompozisyonu", () => {
  it("çalışan 3 odayı Anasayfa olmadan taşır", () => {
    expect(RIBBON_ROOMS.map((room) => room.id)).toEqual(["academy", "career", "freelancer"]);
    expect(RIBBON_ROOMS.map((room) => room.label)).toEqual(["Akademi", "Kariyer", "Freelancer"]);
  });

  it("üçüncü oda şeridi ve gövde cüzdan bandı yoktur", () => {
    expect(existsSync(path.join(ROOT, "components/dashboard/module-ribbon.tsx"))).toBe(false);
    expect(existsSync(path.join(ROOT, "components/dashboard/wallet-balance-strip.tsx"))).toBe(false);
    const page = readSrc("app/dashboard/page.tsx");
    const card = readSrc("components/dashboard/next-best-action-card.tsx");
    expect(page).not.toContain("ModuleRibbon");
    expect(page).not.toContain("WalletBalanceStrip");
    expect(page).not.toContain('variant="ink"');
    expect(card).not.toContain("ModuleRibbon");
    expect(card).not.toContain("flex-wrap");
    expect(card).not.toContain("orderFeaturedRooms");
    expect(card).not.toContain("featuredActions");
  });

  it("NBA tek komut satırıdır: eyebrow, gövde, tek CTA", () => {
    const page = readSrc("app/dashboard/page.tsx");
    const card = readSrc("components/dashboard/next-best-action-card.tsx");
    expect(page).toContain("NextBestActionCard");
    expect(page).toContain("compact");
    expect(page).not.toContain("copy.description");
    expect(card).toContain("text-pretty");
    expect(card).toContain('variant="featured"');
    expect(card).toContain("copy.featured");
    expect(card).toContain("nextBestAction");
    expect(card).toContain("resolveNextBestAction");
    expect(card).toContain("LinkButton");
    expect(card).toContain("sm:flex-row sm:items-center sm:justify-between");
    const featuredOpen = card.indexOf("<Card");
    const featuredClose = card.indexOf("</Card>");
    const ctaAt = card.indexOf("personalized.cta");
    const ribbonAt = card.indexOf("ModuleRibbon");
    expect(featuredOpen).toBeGreaterThan(-1);
    expect(ctaAt).toBeGreaterThan(featuredOpen);
    expect(ctaAt).toBeLessThan(featuredClose);
    expect(ribbonAt).toBe(-1);
  });

  it("üç nabız eşit enstrüman sözleşmesi taşır", () => {
    const pulse = readSrc("components/ui/pulse-card.tsx");
    const freelancer = readSrc("components/dashboard/freelancer-pulse-widget.tsx");
    expect(pulse).toContain("flex h-full min-w-0 flex-col");
    expect(pulse).toContain("mt-auto");
    expect(pulse).toContain("grid-cols-2");
    expect(pulse).toContain("slice(0, 2)");
    expect(pulse).not.toContain("StatGrid");
    expect(pulse).not.toContain("pointer-events-none");
    expect(pulse).not.toContain("Oturum veya veritabanı yok");
    expect(freelancer).toContain("freelancerOpen");
    expect(freelancer).toContain("freelancerActive");
    expect(freelancer).toContain("fundedAsClient");
    expect(freelancer).toContain("fundedAsFreelancer");
    expect(freelancer).not.toContain("freelancerFundedClient");
    expect(freelancer).not.toContain("freelancerReleased");
  });

  it("yükleme iskeleti hap şeridi ve cüzdan bandı taşımaz", () => {
    const skeleton = readSrc("components/ui/room-skeleton.tsx");
    const loading = readSrc("app/dashboard/loading.tsx");
    expect(loading).toContain('variant="cockpit"');
    expect(skeleton).toContain("HeaderPulses compact");
    expect(skeleton).toContain("h-16 rounded-[var(--radius-card)]");
    expect(skeleton).toContain("lg:grid-cols-3");
    expect(skeleton).not.toContain("h-10 w-28 rounded-full");
  });
});
