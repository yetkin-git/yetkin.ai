import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ACADEMY_GROWTH_SKU_SLUGS } from "@/lib/academy/pilot-sku";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { ACADEMY_COURSE_TITLES } from "@/lib/kernel/catalog-ids";
import {
  countPassportSourceKinds,
  formatPassportIssuedAt,
  latestPassportStamp,
  passportAcademyVerifyHref,
  passportFreelancerContractHref,
  passportModuleLabel,
  passportSourceLabel,
  PASSPORT_UNSET_LABEL,
} from "@/lib/kernel/passport/display";
import {
  buildPassportGrowthCard,
  PASSPORT_GROWTH_DOOR_LABELS,
  PASSPORT_GROWTH_LOCKED_LABEL,
  passportFreelancerStamps,
  passportGrowthDoorLabel,
  passportNonGrowthAcademyStamps,
  passportStampCourseHref,
  passportStampCourseSlug,
} from "@/lib/kernel/passport/growth-card";
import { toPassportVisaStamp } from "@/lib/kernel/passport/types";
import type { SealedPassportStamp } from "@/lib/kernel/passport/types";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const SAMPLE: SealedPassportStamp = {
  id: "stamp-1",
  userId: "11111111-1111-4111-8111-111111111111",
  sourceKind: "ACADEMY_CERTIFICATE",
  sourceId: "cert-1",
  visaKey: "academy.certificate:cert-1",
  moduleId: "academy",
  title: "Rail temeli",
  certificateHash: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  issuedAt: new Date("2026-08-14T17:03:00.000Z"),
  createdAt: new Date("2026-08-14T17:03:00.000Z"),
};

const RELEASE: SealedPassportStamp = {
  id: "stamp-2",
  userId: SAMPLE.userId,
  sourceKind: "FREELANCER_RELEASE",
  sourceId: "contract_abc",
  visaKey: "freelancer.release:contract_abc",
  moduleId: "freelancer",
  title: "Teslim mührü",
  certificateHash: null,
  issuedAt: new Date("2026-08-15T10:00:00.000Z"),
  createdAt: new Date("2026-08-15T10:00:00.000Z"),
};

describe("pasaport vize yüzeyi", () => {
  it("kaynak etiketini uydurmaz; ISO DTO issuedAt string taşır", () => {
    expect(passportSourceLabel("ACADEMY_CERTIFICATE")).toBe("Akademi sertifikası");
    expect(passportSourceLabel("FREELANCER_RELEASE")).toBe("Freelancer teslim damgası");
    expect(passportModuleLabel("academy")).toBe("Akademi");
    expect(passportModuleLabel("freelancer")).toBe("Freelancer");
    expect(PASSPORT_UNSET_LABEL).toBe("Henüz damga yok");
    const dto = toPassportVisaStamp(SAMPLE);
    expect(dto.issuedAt).toBe("2026-08-14T17:03:00.000Z");
    expect(dto.visaKey).toBe(SAMPLE.visaKey);
    expect(countPassportSourceKinds([SAMPLE])).toBe(1);
    expect(latestPassportStamp([])).toBeNull();
    expect(latestPassportStamp([SAMPLE])?.title).toBe("Rail temeli");
    expect(passportAcademyVerifyHref(SAMPLE)).toBe(
      "/academy/dogrula/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    );
    expect(
      passportAcademyVerifyHref({ sourceKind: "FREELANCER_RELEASE", certificateHash: SAMPLE.certificateHash }),
    ).toBeNull();
    expect(passportFreelancerContractHref(RELEASE)).toBe("/freelancer/contracts/contract_abc");
    expect(passportFreelancerContractHref(SAMPLE)).toBeNull();
    expect(
      passportFreelancerContractHref({ sourceKind: "FREELANCER_RELEASE", sourceId: "  " }),
    ).toBeNull();
  });

  it("damga tarihini saat diliminde basar; bozuk dilimde düşmez", () => {
    const istanbul = formatPassportIssuedAt(SAMPLE.issuedAt, "Europe/Istanbul");
    expect(istanbul).toMatch(/2026/);
    expect(istanbul).not.toBe("");
    expect(() => formatPassportIssuedAt(SAMPLE.issuedAt, "Not/AZone")).not.toThrow();
    expect(formatPassportIssuedAt(SAMPLE.issuedAt, "Not/AZone")).toMatch(/2026/);
  });

  it("sayfa RoomSeal taşımaz; oturum sicilini çeker; kariyer yazmasına bağlanmaz", () => {
    const page = readSrc("app/(kernel)/pasaport/page.tsx");
    expect(page).not.toContain("RoomSeal");
    expect(page).toContain("loadPassportBoard");
    expect(page).toContain("requirePageSession");
    expect(page).toContain("PassportStampList");
    expect(page).toContain("SEN_VOICE.pasaport");
    expect(page).not.toContain("örnek düzen");
    expect(page).not.toContain('tone="amber"');
    expect(page).not.toContain("unbound");
    expect(page).toContain("loadSoft");
    expect(page).toContain("FREELANCER_STAMP_SURFACE_PATH");
    expect(page).toContain("ACADEMY_STAMP_SURFACE_PATH");
    expect(page).toContain("CAREER_STAMP_SURFACE_PATH");
    expect(page).toContain("ACADEMY_CERTIFICATES_SURFACE_PATH");
    expect(page).toContain("LegalColophonStrip");
    expect(page).toContain("copy.certificatesCta");
    expect(page).toContain("copy.freelancerBoardCta");
    expect(page).not.toContain("loadCareerBoard");
    expect(page).not.toContain("syncCareerVisaStamps");
    expect(page).not.toContain("@/lib/career");
    expect(page).not.toContain("fetch(");
    expect(page).not.toContain("/api/career");
    expect(page).not.toContain("/api/passport");
  });

  it("sorgu yalnız oturum userId ile findMany; yazma ve dikey import yok", () => {
    const load = readSrc("lib/kernel/passport/load.ts");
    const list = readSrc("components/kernel/passport-stamp-list.tsx");
    const page = readSrc("app/(kernel)/pasaport/page.tsx");
    const sen = readSrc("lib/copy/sen-voice/pasaport.ts");
    const careerStore = readSrc("lib/career/prisma-store.ts");
    const careerLoad = readSrc("lib/career/load.ts");
    const combined = `${page}\n${load}\n${list}`;
    expect(load).toContain('import "server-only"');
    expect(load).toContain("isSupabaseUserId(userId)");
    expect(load).toContain("prisma.careerVisaStamp.findMany");
    expect(load).toContain("where: { userId }");
    expect(load).toContain("DATABASE_URL");
    expect(load).not.toContain("@/lib/career");
    expect(load).not.toMatch(/\.(create|update|upsert)\(/);
    expect(careerStore).toContain("findPassportStampsForUser");
    expect(careerLoad).toContain("projectLiveCareerBoard");
    expect(load).toContain("projectLivePassportStamps");
    expect(readSrc("lib/kernel/passport/live.ts")).toContain("bindLivePassportStamps");
    expect(readSrc("lib/career/live.ts")).toContain("bindLivePassportStamps");
    expect(load).toContain("createPrismaProofReadPort");
    expect(careerStore).toContain("return findPassportStampsForUser(userId)");
    expect(list).not.toContain("onSubmit");
    expect(page).not.toContain("<form");
    expect(combined).not.toMatch(/Vize ekle/);
    expect(combined).not.toMatch(/visa-form/i);
    expect(list).toContain("VisaWaxSeal");
    expect(list).toContain("VisaPageFrame");
    expect(list).toContain("CertificateShareActions");
    expect(list).toContain("passportAcademyVerifyHref");
    expect(list).toContain("passportFreelancerContractHref");
    expect(list).toContain("openContractCta");
    expect(list).toContain("verifyCta");
    expect(list).toContain("ACADEMY_STAMP_SURFACE_PATH");
    expect(list).toContain("FREELANCER_STAMP_SURFACE_PATH");
    expect(list).not.toContain("SEN_VOICE.career");
    expect(list).not.toContain('tone="amber"');
    expect(list).not.toContain("unbound");
    expect(list).not.toContain("örnek düzen");
    expect(sen).toContain("PASAPORT_SEN");
    expect(sen).toContain("openContractCta");
    expect(sen).toContain("Pasaport Vize Damgası");
    expect(sen).toContain("Doğrulanmış Rozet");
    expect(sen).toContain("Teklif Kapısı");
    expect(sen).toContain("Erişim Hakkı");
    expect(sen).toContain("Sertifikalarım");
    expect(sen).toContain("Freelancer İlan Panosu");
    expect(sen).not.toContain("Mühür Defteri");
    expect(sen).not.toContain("Mühürlü");
    expect(sen).not.toContain("Freelancer Nitelikli Teklif");
    expect(readSrc("lib/kernel/passport/display.ts")).toContain("/dogrula/");
    expect(readSrc("lib/kernel/passport/display.ts")).toContain("passportFreelancerContractHref");
  });

  it("Büyüme Beşlisi karnesi beş compact SKU yuvasını kilitli basar; sahte damga yok", () => {
    const list = readSrc("components/kernel/passport-stamp-list.tsx");
    const growth = readSrc("lib/kernel/passport/growth-card.ts");
    expect(list).toContain("buildPassportGrowthCard");
    expect(list).toContain("PASSPORT_GROWTH_LOCKED_LABEL");
    expect(list).toContain("data-passport-growth-card");
    expect(list).not.toContain("@/lib/career");
    expect(growth).toContain("01_office_ai");
    expect(growth).toContain("05_prompt_practice");
    expect(growth).not.toContain("@/lib/academy");
    expect(growth).not.toContain("@/lib/career");
    const empty = buildPassportGrowthCard([]);
    expect(empty).toHaveLength(ACADEMY_GROWTH_SKU_SLUGS.length);
    expect(empty.map((slot) => slot.slug)).toEqual([...ACADEMY_GROWTH_SKU_SLUGS]);
    expect(empty.every((slot) => slot.held === false)).toBe(true);
    expect(empty.every((slot) => slot.stampId === null)).toBe(true);
    expect(PASSPORT_GROWTH_LOCKED_LABEL).toBe("Henüz damga yok / Kilitli");
    expect(SEN_VOICE.pasaport.growth.locked).toBe(PASSPORT_GROWTH_LOCKED_LABEL);
    expect(SEN_VOICE.pasaport.list.sealed).toBe("Doğrulanmış Rozet");
    expect(SEN_VOICE.pasaport.careerCta).toBe("Kariyer");
    expect(SEN_VOICE.pasaport.certificatesCta).toBe("Sertifikalarım");
    expect(SEN_VOICE.pasaport.freelancerBoardCta).toBe("Freelancer İlan Panosu");
    expect(PASSPORT_GROWTH_DOOR_LABELS["01_office_ai"]).toBe("Ofis Yapay Zekâ");
    expect(PASSPORT_GROWTH_DOOR_LABELS["02_ecommerce_ai"]).toBe("E-Ticaret Asistanlığı");
    expect(PASSPORT_GROWTH_DOOR_LABELS["03_social_media_ai"]).toBe("Görsel/Sosyal Medya");
    expect(PASSPORT_GROWTH_DOOR_LABELS["04_chatbot_nocode"]).toBe("Chatbot & Müşteri Hizmetleri");
    expect(PASSPORT_GROWTH_DOOR_LABELS["05_prompt_practice"]).toBe("Prompt & Üretkenlik");
    expect(passportGrowthDoorLabel("06_n8n_automation")).toBeNull();
    expect(passportFreelancerStamps([])).toEqual([]);
    expect(passportNonGrowthAcademyStamps([])).toEqual([]);
  });

  it("kazanılmış SKU yalnız kendi Teklif Kapısını açar; freelancer teslimi karnede damga uydurmaz", () => {
    const office: SealedPassportStamp = {
      ...SAMPLE,
      courseSlug: "01_office_ai",
      title: ACADEMY_COURSE_TITLES["01_office_ai"],
    };
    const byTitle: SealedPassportStamp = {
      ...SAMPLE,
      id: "stamp-title",
      courseSlug: null,
      title: ACADEMY_COURSE_TITLES["05_prompt_practice"],
    };
    const card = buildPassportGrowthCard([office, RELEASE, byTitle]);
    expect(card.find((slot) => slot.slug === "01_office_ai")?.held).toBe(true);
    expect(card.find((slot) => slot.slug === "01_office_ai")?.doorLabel).toBe("Ofis Yapay Zekâ");
    expect(card.find((slot) => slot.slug === "05_prompt_practice")?.held).toBe(true);
    expect(card.find((slot) => slot.slug === "05_prompt_practice")?.doorLabel).toBe(
      "Prompt & Üretkenlik",
    );
    expect(card.filter((slot) => slot.held)).toHaveLength(2);
    expect(card.find((slot) => slot.slug === "02_ecommerce_ai")?.held).toBe(false);
    expect(passportStampCourseSlug(office)).toBe("01_office_ai");
    expect(passportStampCourseSlug(RELEASE)).toBeNull();
    expect(passportStampCourseHref(office)).toBe("/academy/01_office_ai");
    expect(passportStampCourseHref(RELEASE)).toBeNull();
    expect(passportFreelancerStamps([office, RELEASE])).toEqual([RELEASE]);
    expect(passportNonGrowthAcademyStamps([office, byTitle, RELEASE])).toEqual([]);
  });
});
