import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PulseCard } from "@/components/ui/pulse-card";
import { shownPulseStat } from "@/lib/dashboard/shown-pulse-stat";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("shownPulseStat", () => {
  it("canlı 0 sayacı gizler; 1 ve üzeri görünür; yüklenmemiş nabız tire kalır", () => {
    expect(shownPulseStat("Sertifika", 0, true)).toBeNull();
    expect(shownPulseStat("Satın alma", 0, true)).toBeNull();
    expect(shownPulseStat("Rozet", 0, true)).toBeNull();
    expect(shownPulseStat("Portföy", 0, true)).toBeNull();
    expect(shownPulseStat("Sertifika", 1, true)).toEqual({ label: "Sertifika", value: 1 });
    expect(shownPulseStat("Rozet", 3, true)).toEqual({ label: "Rozet", value: 3 });
    expect(shownPulseStat("Sertifika", 0, false)).toEqual({ label: "Sertifika", value: "—" });
  });

  it("akademi ve kariyer kartı sıfırı shownPulseStat ile eler, davet cümlesini basar", () => {
    const academy = readSrc("components/dashboard/academy-pulse-widget.tsx");
    const career = readSrc("components/dashboard/career-pulse-widget.tsx");
    expect(academy).toContain("shownPulseStat");
    expect(academy).toContain("academyEmptyCta");
    expect(academy).toContain("certificatesHeld === 0");
    expect(academy).not.toContain('value: pulse.live ? pulse.purchasesCount : "—"');
    expect(career).toContain("shownPulseStat");
    expect(career).toContain("careerEmptyCta");
    expect(career).toContain("portfolioEmpty");
    expect(career).toContain("visaCount === 0");
    expect(career).not.toContain('value: pulse.live ? pulse.visaCount : "—"');
  });

  it("sıfır sayaçlı kart davet cümlesini basar, rakam 0 basmaz", () => {
    const empty = renderToStaticMarkup(
      createElement(PulseCard, {
        title: "Akademi",
        live: true,
        stats: [],
        href: "/academy",
        hrefLabel: "Akademi odası",
        invite: {
          message: "İlk eğitimini tamamla, sertifikanı kap!",
          cta: "Eğitimleri İncele",
        },
      }),
    );
    expect(empty).toContain("İlk eğitimini tamamla, sertifikanı kap!");
    expect(empty).toContain("Eğitimleri İncele");
    expect(empty).toContain('href="/academy"');
    expect(empty).not.toContain(">0<");

    const mixed = renderToStaticMarkup(
      createElement(PulseCard, {
        title: "Akademi",
        live: true,
        stats: [shownPulseStat("Satın alma", 2, true)!],
        href: "/academy",
        hrefLabel: "Akademi odası",
        invite: {
          message: "İlk eğitimini tamamla, sertifikanı kap!",
          cta: "Eğitimleri İncele",
        },
      }),
    );
    expect(mixed).toContain(">2<");
    expect(mixed).toContain("Satın alma");
    expect(mixed).not.toContain(">0<");
    expect(mixed).not.toContain("Sertifika");
  });
});
