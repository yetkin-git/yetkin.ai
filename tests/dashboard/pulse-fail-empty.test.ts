import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { MARKETPLACE_SPLIT_LIVE } from "@/lib/kernel/payments/marketplace-split-live";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("kokpit fail ile boş nabız ayrımı", () => {
  it("PulseCard live:false 'Henüz yüklenemedi' basar; Boş nabız yok", () => {
    const pulse = readSrc("components/ui/pulse-card.tsx");
    expect(pulse).toContain("unavailableHint");
    expect(pulse).toContain("Henüz yüklenemedi");
    expect(pulse).not.toContain("Boş nabız");
    expect(SEN_VOICE.dashboard.pulse.unavailable).toBe("Henüz yüklenemedi");
  });

  it("split kapalıyken freelancer emanet sıfır lira vaadi basmaz", () => {
    expect(MARKETPLACE_SPLIT_LIVE).toBe(false);
    expect(SEN_VOICE.dashboard.pulse.freelancerEscrowInactive).toBe(
      "İlan ve teklif modülü pasiftir.",
    );
    const widget = readSrc("components/dashboard/freelancer-pulse-widget.tsx");
    expect(widget).toContain("MARKETPLACE_SPLIT_LIVE");
    expect(widget).toContain("freelancerEscrowInactive");
    expect(widget).toContain("freelancerLiveHint");
    expect(widget).toContain("copy.unavailable");
  });
});

describe("kokpit SEN sözlüğü", () => {
  it("kart başlığı oda adıdır; mühür/nabız vatandaş yüzüne sızmaz", () => {
    const pulse = SEN_VOICE.dashboard.pulse;
    const nba = SEN_VOICE.dashboard.nextBestAction;
    expect(pulse.academyTitle).toBe("Akademi");
    expect(pulse.careerTitle).toBe("Kariyer");
    expect(pulse.freelancerTitle).toBe("Freelancer");
    expect(pulse.academyEmpty).toBe("Henüz sertifika yok");
    expect(pulse.careerEmpty).toBe("Henüz doğrulanmış rozet yok");
    expect(pulse.academyTitle).not.toContain("nabzı");
    expect(pulse.academyEmpty).not.toContain("mühür");
    expect(pulse.careerEmpty).not.toContain("mühür");
    expect(nba.careerVisa.body).not.toMatch(/mühür/i);
    expect(nba.careerVisa.body).toContain("Doğrulanmış rozet");
    expect(nba.academyContinue.body).not.toMatch(/mühür/i);
    expect(nba.academyContinue.body).toContain("sertifika");
  });
});
