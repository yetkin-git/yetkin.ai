import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { JUNIOR_ELECTIVE_COURSES } from "@/lib/junior/elective-catalog";
import {
  juniorElectiveOpenBySlug,
  juniorElectivePicks,
  juniorLessonAccess,
  juniorLessonAccessForPlan,
  juniorPaidElectives,
} from "@/lib/junior/catalog";
import { saveJuniorElectives } from "@/lib/junior/checkout";
import { juniorLessonGate, juniorPlanCoversLesson, type JuniorGateDecision } from "@/lib/junior/enter";
import { JUNIOR_GUARDIAN_NOTICE } from "@/lib/junior/guardian-notice";
import {
  JUNIOR_ELECTIVE_DRAFT_PRICE_ERROR,
  JUNIOR_ELECTIVE_QUOTA,
  JUNIOR_ELECTIVE_SOON_ERROR,
  JUNIOR_ELECTIVE_SOON_LABEL,
  JUNIOR_ELECTIVE_SOON_LESSON_ERROR,
} from "@/lib/junior/limits";
import { createMemoryJuniorStore } from "@/lib/junior/memory-port";
import { juniorPlanExpiry, JUNIOR_PLAN_CODE, JUNIOR_POS_PROVIDER } from "@/lib/junior/plan";
import { juniorProductionSealGaps } from "@/lib/junior/production-seal";
import { createJuniorProfile, readJuniorHome, readJuniorLesson } from "@/lib/junior/service";
import { JUNIOR_BAKED_AUDIO_KEYS } from "@/lib/junior/voice";

// Sahte mühür yalnız pozitif akışlar için açılır. Gerçek veri (negatif testler) kapalıdır.
const seal = vi.hoisted(() => ({ allSealed: false }));

vi.mock("@/lib/junior/production-seal", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/junior/production-seal")>();
  return {
    ...actual,
    juniorProductionSealGaps: (...args: Parameters<typeof actual.juniorProductionSealGaps>) =>
      seal.allSealed ? [] : actual.juniorProductionSealGaps(...args),
  };
});

const PARENT = "parent-seal-gate";
const NOW = new Date("2026-10-05T12:00:00+03:00");
const AUDIT = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "yapinet360@gmail.com",
  emailConfirmedAt: "2026-01-01T00:00:00.000Z",
};

async function openProfile(store: ReturnType<typeof createMemoryJuniorStore>) {
  const created = await createJuniorProfile(
    store,
    PARENT,
    {
      nickname: "Ege",
      grade: 6,
      birthYear: 2015,
      consent: true,
      consentVersion: JUNIOR_GUARDIAN_NOTICE.version,
      guardianBirthYear: 1990,
    },
    NOW,
  );
  if (!created.ok) {
    throw new Error(created.error);
  }
  return created.data.profile;
}

async function seedActivePlan(store: ReturnType<typeof createMemoryJuniorStore>) {
  await store.saveActiveSubscription({
    userId: PARENT,
    status: "ACTIVE",
    planCode: JUNIOR_PLAN_CODE,
    listPriceMinor: 549_900,
    currencyCode: "TRY",
    provider: JUNIOR_POS_PROVIDER,
    providerRef: "JRSEEDED02",
    cardLast4: "0000",
    invoiceName: "Ayse Yilmaz",
    invoiceTckn: "10000000146",
    invoicePhone: "5551112233",
    invoiceAddress: "Ataturk Mahallesi Deneme Sokak No 1",
    electiveQuota: JUNIOR_ELECTIVE_QUOTA,
    gradeSwitchRights: 1,
    activatedAt: NOW,
    expiresAt: juniorPlanExpiry(NOW),
  });
}

function electiveLessons() {
  return JUNIOR_ELECTIVE_COURSES.flatMap((course) => course.lessons.map((lesson) => ({ course, lesson })));
}

afterEach(() => {
  seal.allSealed = false;
});

describe("Junior seçmeli mühür kapısı, gerçek veri (T-06 / T-15)", () => {
  it("mühürsüz seçmeli vitrinde 'Yakında' olarak işaretlenir; hazır olmayan ders hazır sayılmaz", () => {
    for (const pick of juniorElectivePicks()) {
      expect(pick.ready).toBe(juniorElectiveOpenBySlug(pick.slug));
    }
    // Fırınlanmış sesi olmayan her seçmeli ders mühürsüzdür. Bu kural veri değiştiğinde de geçerli kalır.
    for (const { course, lesson } of electiveLessons()) {
      if (!(JUNIOR_BAKED_AUDIO_KEYS as readonly string[]).includes(lesson.key)) {
        expect(juniorProductionSealGaps(lesson), lesson.key).toContain("audio");
        expect(juniorElectiveOpenBySlug(course.slug), course.slug).toBe(false);
      }
    }
  });

  it("mühürsüz seçmeli pakete yeni eklenemez; kota ve taslak kuralları değişmez", async () => {
    const store = createMemoryJuniorStore();
    const profile = await openProfile(store);
    const ready = await saveJuniorElectives(store, PARENT, {
      profileId: profile.id,
      slugs: ["jr_06_alm"],
    });
    expect(ready.ok).toBe(true);
    expect((await store.getProfile(PARENT, profile.id))?.selectedElectives).toEqual(["jr_06_alm"]);

    const draft = await saveJuniorElectives(store, PARENT, { profileId: profile.id, slugs: ["jr_06_ing"] });
    expect(draft).toEqual({ ok: false, status: 400, error: JUNIOR_ELECTIVE_DRAFT_PRICE_ERROR });
  });

  it("mevcut seçim yeniden kaydedilebilir ve çıkarılabilir; eklenmez", async () => {
    const store = createMemoryJuniorStore();
    const profile = await openProfile(store);
    // Doğrudan yazılmış (eski) seçim: mühür kapısından önce kaydedilmiş olabilir.
    await store.setSelectedElectives(PARENT, profile.id, ["jr_06_alm"]);

    const keep = await saveJuniorElectives(store, PARENT, { profileId: profile.id, slugs: ["jr_06_alm"] });
    expect(keep.ok).toBe(true);
    const removed = await saveJuniorElectives(store, PARENT, { profileId: profile.id, slugs: [] });
    expect(removed.ok).toBe(true);
    expect((await store.getProfile(PARENT, profile.id))?.selectedElectives).toEqual([]);
  });

  it("mühürlü seçmeli ücretli pakette açılır; taslak fiyat dışı kilitli kalır", async () => {
    expect(juniorPlanCoversLesson("jr_06_alm-1", true, ["jr_06_alm"])).toBe(true);
    expect(juniorPlanCoversLesson("jr_06_alm-2", true, ["jr_06_alm"])).toBe(true);
    expect(juniorPlanCoversLesson("jr_06_alm-2", false, ["jr_06_alm"])).toBe(false);
    expect(juniorPlanCoversLesson("jr_06_ing-2", true, ["jr_06_ing"])).toBe(false);
    expect(juniorPlanCoversLesson("jr_06_mat-2", true, [])).toBe(true);

    const gate = juniorLessonGate({ id: PARENT, email: null, emailConfirmedAt: null }, "jr_06_alm-2", {
      active: true,
      selectedElectives: ["jr_06_alm"],
      profileId: null,
    });
    expect(gate.planCovers).toBe(true);
    expect(gate.renderPlan?.selectedElectives ?? []).toContain("jr_06_alm");

    const body = readJuniorLesson("jr_06_alm-2", {
      active: true,
      selectedElectives: juniorPaidElectives(["jr_06_alm"]),
    });
    expect(body.access).toBe("free");
  });

  it("seçmeli ikinci konu paketsiz kilitlidir; yıllık paket seçimle açar", () => {
    // Her kartta yalnız 1. konu ücretsiz: paketin vaadi gerçek bir kapı açar.
    for (const slug of ["jr_06_alm", "jr_06_fra", "jr_06_siyer", "jr_06_kod", "jr_06_arp"] as const) {
      expect(juniorLessonAccess(`${slug}-1`), slug).toBe("free");
      expect(juniorLessonAccess(`${slug}-2`), slug).toBe("locked");
      expect(
        juniorLessonAccessForPlan(`${slug}-2`, { active: true, selectedElectives: [slug] }),
        slug,
      ).toBe("free");
      expect(
        juniorLessonAccessForPlan(`${slug}-2`, { active: true, selectedElectives: [] }),
        slug,
      ).toBe("locked");
    }
    // Fiyat dışı kart erişilemez kart olmaktan çıktı: 1. konu kamuya açık, 2. konu pakete girmez.
    expect(juniorLessonAccess("jr_06_ing-1")).toBe("free");
    expect(juniorLessonAccess("jr_06_ing-2")).toBe("locked");
    expect(
      juniorLessonAccessForPlan("jr_06_ing-1", { active: false, selectedElectives: [] }),
    ).toBe("free");
  });

  it("paid elective süzgeci yalnız mühürlü ve bilinen seçmelileri geçirir", () => {
    const requested = ["jr_06_alm", "jr_06_ing", "jr_06_bilinmeyen"];
    expect(juniorPaidElectives(requested)).toEqual(requested.filter((slug) => juniorElectiveOpenBySlug(slug)));
    expect(juniorPaidElectives(["jr_06_ing"])).toEqual([]);
    expect(juniorPaidElectives(["jr_06_bilinmeyen"])).toEqual([]);
  });

  it("denetim dalı paket dışı seçmeliyi görür; tanıtım dersi plandan bağımsız açıktır", () => {
    const viaOf = (decision: JuniorGateDecision): string | null =>
      decision.allow ? decision.via : null;

    const intro = juniorLessonGate(AUDIT, "jr_06_alm-1", { active: false, selectedElectives: [], profileId: null });
    expect(viaOf(intro.lesson)).toBe("public");
    expect(intro.lessonAccess).toBe("free");
    expect(intro.renderPlan).toBeNull();
    expect(readJuniorLesson("jr_06_alm-1", null).access).toBe("free");
    // 2. konu paketsiz kilitli; denetim aktörü yine de açabilir.
    expect(readJuniorLesson("jr_06_alm-2", null).access).toBe("locked");
    expect(
      viaOf(
        juniorLessonGate(AUDIT, "jr_06_alm-2", { active: false, selectedElectives: [], profileId: null })
          .lesson,
      ),
    ).toBe("audit");

    const gate = juniorLessonGate(AUDIT, "jr_06_ing-1", { active: false, selectedElectives: [], profileId: null });
    expect(viaOf(gate.lesson)).toBe("public");
    expect(gate.lessonAccess).toBe("free");
    expect(readJuniorLesson("jr_06_ing-1", gate.renderPlan).access).toBe("free");
    expect(readJuniorLesson("jr_06_ing-2", gate.renderPlan).access).toBe("locked");
  });

  it("süzgeçler ve Yakında etiketi kaynak dosyalarda bağlıdır", () => {
    const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");
    expect(read("app/junior/page.tsx")).toContain("juniorPaidElectives(selectedElectives)");
    expect(read("lib/junior/service.ts")).toContain("juniorPaidElectives(electives)");
    expect(read("lib/junior/service.ts")).toContain("JUNIOR_ELECTIVE_SOON_LESSON_ERROR");
    expect(read("lib/junior/enter.ts")).toContain("juniorPaidElectives(plan.selectedElectives)");
    expect(read("lib/junior/load.ts")).toContain("juniorPaidElectives(home.selected?.selectedElectives ?? [])");
    expect(read("lib/junior/checkout.ts")).toContain("juniorElectiveOpenBySlug(slug)");
    expect(read("lib/junior/checkout.ts")).toContain("JUNIOR_ELECTIVE_SOON_ERROR");
    expect(read("components/junior/elective-quota-modal.tsx")).toContain("disabled={soon}");
    expect(read("components/junior/elective-quota-modal.tsx")).toContain("JUNIOR_ELECTIVE_SOON_LABEL");
    expect(JUNIOR_ELECTIVE_SOON_LABEL).toBe("Yakında");
    expect(JUNIOR_ELECTIVE_SOON_LESSON_ERROR).toContain("Paketinde açılmaz");
  });
});

describe("Junior seçmeli mühür kapısı, mühürlü ortam (regresyon)", () => {
  it("mühürlü seçmeliler kota içinde seçilir ve ücretli pakette açılır", async () => {
    seal.allSealed = true;
    const store = createMemoryJuniorStore();
    const profile = await openProfile(store);

    const picks = juniorElectivePicks().filter((pick) => pick.slug !== "jr_06_ing");
    expect(picks.every((pick) => pick.ready)).toBe(true);

    const picked = await saveJuniorElectives(store, PARENT, {
      profileId: profile.id,
      slugs: ["jr_06_alm", "jr_06_siyer", "jr_06_kod"],
    });
    expect(picked.ok).toBe(true);
    const overflow = await saveJuniorElectives(store, PARENT, {
      profileId: profile.id,
      slugs: ["jr_06_alm", "jr_06_fra", "jr_06_siyer", "jr_06_kod"],
    });
    expect(overflow.ok).toBe(false);

    await seedActivePlan(store);
    const home = await readJuniorHome(store, PARENT, NOW);
    const german = home.courses.find((course) => course.slug === "jr_06_alm");
    expect(german?.lessons.every((lesson) => lesson.access === "free")).toBe(true);
    expect(juniorPlanCoversLesson("jr_06_alm-2", true, ["jr_06_alm"])).toBe(true);
    expect(juniorPlanCoversLesson("jr_06_ing-2", true, ["jr_06_ing"])).toBe(false);
  });
});
