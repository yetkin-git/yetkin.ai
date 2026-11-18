import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ASSISTANT_REPLY_TEMPLATES, ASSISTANT_SEN } from "@/lib/copy/sen-voice/assistant";
import { CAREER_ACTION_PLAN_DISCLAIMER, CAREER_SEN } from "@/lib/copy/sen-voice/career";
import {
  assembleCareerActionLive,
  buildCareerActionPlan,
  EMPTY_CAREER_ACTION_LIVE,
  isClosedCareerActionHref,
  suggestCareerActionInput,
  type CareerActionPlan,
} from "@/lib/career/action-plan";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

function hrefs(plan: CareerActionPlan): string[] {
  return plan.steps.map((step) => step.href);
}

function assertClosed(plan: CareerActionPlan) {
  const blob = JSON.stringify(plan);
  expect(plan.steps.map((step) => step.window)).toEqual([
    "Gün 1–7",
    "Gün 8–14",
    "Gün 15–22",
    "Gün 23–30",
  ]);
  for (const href of hrefs(plan)) {
    expect(isClosedCareerActionHref(href), href).toBe(true);
  }
  expect(blob).not.toContain("/freelancer");
  expect(blob).not.toContain("SWOT");
  expect(blob).not.toContain("Yetenek Radarı");
  expect(blob).not.toMatch(/kazanırsın|işe yerleşirsin|gelir elde edersin/);
  expect(plan.disclaimer).toBe(CAREER_ACTION_PLAN_DISCLAIMER);
  expect(plan.disclaimer).toContain("garanti etmez");
}

describe("30 günlük aksiyon planı", () => {
  it("misafir ofis planı dört kapalı adıma yayılır", () => {
    const plan = buildCareerActionPlan({
      situation: "new",
      timeBand: "hours_3_7",
      focus: "office",
      live: EMPTY_CAREER_ACTION_LIVE,
    });
    assertClosed(plan);
    expect(hrefs(plan)).toEqual([
      "/tezgah",
      "/tezgah?tool=tetkik",
      "/tezgah",
      "/tezgah?tool=proposal",
    ]);
    expect(plan.overrideNote).toBeNull();
    expect(plan.lead).toContain("3 ile 7 saat");
    expect(suggestCareerActionInput(null)).toEqual({
      situation: "new",
      timeBand: "hours_3_7",
      focus: "office",
    });
  });

  it("misafir e-ticaret ve hibe odakları kendi kapılarını seçer", () => {
    const shop = buildCareerActionPlan({
      situation: "new",
      timeBand: "under_3",
      focus: "ecommerce",
    });
    assertClosed(shop);
    expect(shop.lead).toContain("3 saatin altında");
    expect(hrefs(shop)).toEqual([
      "/e-ticaret",
      "/tezgah?tool=ecommerce",
      "/e-ticaret",
      "/tezgah?tool=dukkan",
    ]);

    const grant = buildCareerActionPlan({
      situation: "producing",
      timeBand: "over_7",
      focus: "grant",
    });
    assertClosed(grant);
    expect(grant.lead).toContain("7 saatin üzerinde");
    expect(hrefs(grant)[0]).toBe("/hibe");
    expect(hrefs(grant)[1]).toBe("/tezgah?tool=grant");
    expect(hrefs(grant)[2]).toBe("/tezgah");
    expect(hrefs(grant)[3]).toBe("/tezgah?tool=proposal");
  });

  it("form rozet dese de canlı kart yoksa vize adresi uydurmaz", () => {
    const plan = buildCareerActionPlan({
      situation: "stamped",
      timeBand: "hours_3_7",
      focus: "social",
      live: EMPTY_CAREER_ACTION_LIVE,
    });
    assertClosed(plan);
    expect(plan.overrideNote).toContain("rozet uydurmaz");
    expect(hrefs(plan).join(" ")).not.toContain("/vize/");
    expect(hrefs(plan)[2]).toBe("/tezgah");
  });

  it("oturumlu yarım ders, form yeni dese de oynatıcıyı öne alır", () => {
    const live = assembleCareerActionLive({
      academy: {
        certificatesHeld: 0,
        lastCertificateTitle: null,
        lastCourseSlug: "02_ecommerce_ai",
        nextLessonKey: "l3",
      },
      stamps: [],
      stores: [],
    });
    expect(suggestCareerActionInput(live).situation).toBe("learning");
    expect(suggestCareerActionInput(live).focus).toBe("ecommerce");
    const plan = buildCareerActionPlan({
      situation: "new",
      timeBand: "under_3",
      focus: "office",
      live,
    });
    assertClosed(plan);
    expect(plan.overrideNote).toContain("Canlı kayıt");
    expect(hrefs(plan)[0]).toBe("/e-ticaret");
    expect(plan.steps[0]?.body).toContain("l3");
    expect(hrefs(plan)[0]).not.toBe("/tezgah");
    expect(hrefs(plan)[2]).toBe("/e-ticaret");
  });

  it("canlı rozet paylaşım kartını sınav kapısının önüne alır", () => {
    const live = assembleCareerActionLive({
      academy: {
        certificatesHeld: 1,
        lastCertificateTitle: "Yapay Zekâ ile Sosyal Medya İçeriği",
        lastCourseSlug: null,
        nextLessonKey: null,
      },
      stamps: [
        {
          title: "Yapay Zekâ ile Sosyal Medya İçeriği",
          publicHref: "/vize/stamp_1",
          courseSlug: "03_social_media_ai",
        },
      ],
      stores: [],
    });
    const plan = buildCareerActionPlan({
      situation: "new",
      timeBand: "hours_3_7",
      focus: "office",
      live,
    });
    assertClosed(plan);
    expect(hrefs(plan)[2]).toBe("/vize/stamp_1");
    expect(plan.steps[2]?.title).toBe("Paylaşım kartı");
    expect(hrefs(plan)[0]).toBe("/tezgah");
    expect(hrefs(plan).join(" ")).not.toContain("/seviye");
  });

  it("açık mağaza dördüncü adımı vitrine bağlar; taslak ve bozuk adres düşer", () => {
    const draft = assembleCareerActionLive({
      academy: null,
      stamps: [],
      stores: [
        { status: "DRAFT", slug: "taslak-dukkan", name: "Taslak" },
        { status: "ACTIVE", slug: "TEZGAH", name: "Bozuk" },
        { status: "ACTIVE", slug: "tezgah-vitrin", name: "Tezgâh Vitrin" },
      ],
    });
    expect(draft.activeStore).toEqual({ slug: "tezgah-vitrin", name: "Tezgâh Vitrin" });
    const plan = buildCareerActionPlan({
      situation: "new",
      timeBand: "hours_3_7",
      focus: "office",
      live: draft,
    });
    assertClosed(plan);
    expect(hrefs(plan)[3]).toBe("/magaza/tezgah-vitrin");
    expect(plan.overrideNote).toContain("mağazayı");

    const poisoned = assembleCareerActionLive({
      academy: {
        certificatesHeld: 0,
        lastCertificateTitle: null,
        lastCourseSlug: "javascript:alert(1)",
        nextLessonKey: "../freelancer",
      },
      stamps: [{ title: "x", publicHref: "https://evil.example/vize/stamp_1", courseSlug: "06_n8n_automation" }],
      stores: [{ status: "ACTIVE", slug: "../admin", name: "SWOT Mağaza" }],
    });
    expect(poisoned.continuePlay).toBeNull();
    expect(poisoned.examGateSlug).toBeNull();
    expect(poisoned.publicCardHref).toBeNull();
    expect(poisoned.activeStore).toBeNull();
    const safe = buildCareerActionPlan({
      situation: "new",
      timeBand: "hours_3_7",
      focus: "store",
      live: {
        ...EMPTY_CAREER_ACTION_LIVE,
        continuePlay: { slug: "https://evil.example", lessonKey: "<script>" },
        publicCardHref: "javascript:alert(1)",
        activeStore: { slug: "../admin", name: "Yetenek Radarı" },
      },
    });
    assertClosed(safe);
    expect(hrefs(safe).join(" ")).not.toContain("evil");
    expect(hrefs(safe).join(" ")).not.toContain("javascript:");
    expect(hrefs(safe).join(" ")).not.toContain("/magaza/");
    expect(hrefs(safe).join(" ")).not.toContain("/vize/");
  });

  it("kapalı kapı yabancı tezgâh, freelancer ve açık adresi reddeder", () => {
    expect(isClosedCareerActionHref("/tezgah?tool=ecommerce")).toBe(true);
    expect(isClosedCareerActionHref("/tezgah?tool=studio-photo")).toBe(true);
    expect(isClosedCareerActionHref("/tezgah?tool=bilinmeyen")).toBe(false);
    expect(isClosedCareerActionHref("/freelancer")).toBe(false);
    expect(isClosedCareerActionHref("/freelancer/jobs")).toBe(false);
    expect(isClosedCareerActionHref("/academy/06_n8n_automation")).toBe(false);
    expect(isClosedCareerActionHref("/academy/02_ecommerce_ai/oyna")).toBe(true);
    expect(isClosedCareerActionHref("/magaza/tezgah-vitrin")).toBe(true);
    expect(isClosedCareerActionHref("/magaza/BOZUK")).toBe(false);
    expect(isClosedCareerActionHref("/vize/stamp_1")).toBe(true);
    expect(isClosedCareerActionHref("/vize/ab")).toBe(false);
    expect(isClosedCareerActionHref("https://evil.example/academy")).toBe(false);
  });

  it("sayfa planı her iki kola basar; asistan cümlesi planla hizalanır", () => {
    const page = readSrc("app/career/page.tsx");
    const panel = readSrc("components/career/public-career-panel.tsx");
    const planner = readSrc("lib/career/action-plan.ts");
    expect(page.match(/<ActionPlanPanel/g)?.length).toBe(2);
    expect(page).toContain("PublicCareerPanel");
    expect(page).toContain("loadAcademyActionPulse");
    expect(page).toContain("listCommerceStores");
    expect(panel).toContain("{plan}");
    expect(panel).toContain("data-sample-certificate");
    expect(planner).not.toContain("invokeLlm");
    expect(planner).not.toContain("prisma");
    expect(planner).not.toContain("/freelancer");
    expect(CAREER_SEN.title).toBe("YetkinCV — Test Edilmiş & Mühürlü Kariyer Merkezi");
    expect(CAREER_SEN.footnote).toContain(CAREER_ACTION_PLAN_DISCLAIMER);
    expect(CAREER_SEN.footnote).not.toContain("Hedef rol");
    expect(readSrc("lib/copy/sen-voice/career.ts")).not.toContain("SWOT");
    expect(ASSISTANT_REPLY_TEMPLATES.path).toContain("30 günlük aksiyon planını Kariyer'de oluştur");
    expect(ASSISTANT_REPLY_TEMPLATES.path).toContain("garanti etmez");
    expect(ASSISTANT_SEN.facts.career).toContain(ASSISTANT_REPLY_TEMPLATES.path);
    expect(ASSISTANT_SEN.system).toContain("30 günlük aksiyon planı");
    const citizenFacing = [
      ASSISTANT_SEN.welcome,
      ...Object.values(ASSISTANT_SEN.templates),
      ...Object.values(ASSISTANT_SEN.facts),
    ].join("\n");
    expect(citizenFacing).not.toMatch(/mühür|vize|dikey kapsam/i);
  });
});
