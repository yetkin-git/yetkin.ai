import { describe, expect, it } from "vitest";

import { parseGrantProfileModeParam } from "@/lib/yetkinhibe/grant-profile-mode";
import {
  buildGrantWizardHref,
  DEFAULT_CONSULTING_CAP_TRY,
  parseConsultingCapParam,
  parseIdeaParam,
} from "@/lib/yetkinhibe/wizard-navigation";

describe("YetkinHibe sihirbaz yönlendirmesi", () => {
  it("parametresiz href kokpitteki proje sekmesine gider", () => {
    expect(buildGrantWizardHref({})).toBe("/panel/hibe?sekme=proje");
  });

  it("hibe, bütçe, mod ve fikir parametrelerini sırayla yazar", () => {
    expect(
      buildGrantWizardHref({
        grantId: "g-1",
        consultingCap: 50_000,
        mode: "agency",
        idea: "  Test fikri  ",
      }),
    ).toBe("/panel/hibe?sekme=proje&grantId=g-1&consultingCap=50000&mode=agency&idea=Test+fikri");
  });

  it("bireysel mod URL'e yazılmaz (varsayılan)", () => {
    expect(buildGrantWizardHref({ mode: "individual" })).toBe("/panel/hibe?sekme=proje");
  });

  it("var olmayan /yetkinhibe/olustur yolunu üretmez", () => {
    expect(buildGrantWizardHref({ grantId: "g-1" })).not.toContain("/yetkinhibe/olustur");
    expect(buildGrantWizardHref({ grantId: "g-1" })).toContain("/panel/hibe");
  });

  it("geçersiz consultingCap değerinde varsayılana döner", () => {
    expect(parseConsultingCapParam(undefined)).toBe(DEFAULT_CONSULTING_CAP_TRY);
    expect(parseConsultingCapParam("-5")).toBe(DEFAULT_CONSULTING_CAP_TRY);
    expect(parseConsultingCapParam("99.5")).toBe(DEFAULT_CONSULTING_CAP_TRY);
    expect(parseConsultingCapParam("1e15")).toBe(DEFAULT_CONSULTING_CAP_TRY);
    expect(parseConsultingCapParam("200000")).toBe(200_000);
  });

  it("fikir metni kırpılır ve 2.000 karakterle sınırlanır", () => {
    expect(parseIdeaParam(undefined)).toBe("");
    expect(parseIdeaParam("   ")).toBe("");
    expect(parseIdeaParam("a".repeat(2_500))).toHaveLength(2_000);
  });

  it("profil modu parametresi bilinmeyen değerde bireysele döner", () => {
    expect(parseGrantProfileModeParam("agency")).toBe("agency");
    expect(parseGrantProfileModeParam("freelancer")).toBe("freelancer");
    expect(parseGrantProfileModeParam("x")).toBe("individual");
    expect(parseGrantProfileModeParam(undefined)).toBe("individual");
  });
});
