import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CANONICAL_SUPER_ADMIN_EMAIL_DEFAULT } from "@/lib/kernel/auth/super-admin";
import { formatMinorCompact } from "@/lib/kernel/money/format";
import {
  canEnterJunior,
  isJuniorAuditActor,
  isJuniorCheckoutLocked,
  type JuniorActor,
} from "@/lib/kernel/security/junior-gate";
import { juniorCatalogLessonKeys, juniorLessonAccess } from "@/lib/junior/catalog";
import { completeJuniorCheckout, JUNIOR_CHECKOUT_CLOSED_MESSAGE } from "@/lib/junior/checkout";
import { juniorLessonGate } from "@/lib/junior/enter";
import { JUNIOR_PAID_ACTION_ERROR } from "@/lib/junior/limits";
import { isUnknownJuniorLessonPath, JUNIOR_KNOWN_LESSON_KEYS } from "@/lib/junior/lesson-index";
import { createMemoryJuniorStore } from "@/lib/junior/memory-port";
import { juniorYearlyPriceFromEntry } from "@/lib/junior/price";
import { createJuniorProfile, submitJuniorTell } from "@/lib/junior/service";
import type { PriceCatalogEntrySnapshot } from "@/lib/kernel/pricing/catalog";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";

const ADMIN = {
  id: "11111111-1111-4111-8111-111111111111",
  email: CANONICAL_SUPER_ADMIN_EMAIL_DEFAULT,
  emailConfirmedAt: "2026-01-01T00:00:00.000Z",
} satisfies JuniorActor;

const PARENT: JuniorActor = {
  id: "22222222-2222-4222-8222-222222222222",
  email: "veli@ornek.com",
  emailConfirmedAt: "2026-01-01T00:00:00.000Z",
};

function entry(amountMinor: number, id = "cat_junior_yearly"): PriceCatalogEntrySnapshot {
  return {
    id,
    moduleKey: "junior",
    unitKey: "yearly",
    unitType: "MINOR",
    amountMinor: toAmountMinor(amountMinor),
    currencyCode: "TRY",
    isActive: true,
    minMinor: toAmountMinor(1),
    maxMinor: toAmountMinor(50_000_000),
  };
}

describe("Junior kapalı beta kapısı", () => {
  it("anonim ziyaretçi ilk konuyu görür; ikinci konu, anlatış ve kasa kapalıdır", () => {
    expect(canEnterJunior(null, null, { intent: "vitrine" }).allow).toBe(true);
    const first = canEnterJunior(null, "jr_06_mat-1", { intent: "lesson", lessonAccess: "free" });
    expect(first.allow).toBe(true);
    if (first.allow) {
      expect(first.via).toBe("public");
    }
    const locked = canEnterJunior(null, "jr_06_mat-2", { intent: "lesson", lessonAccess: "locked" });
    expect(locked.allow).toBe(false);
    if (!locked.allow) {
      expect(locked.reason).toBe("plan");
    }
    const paid = canEnterJunior(PARENT, "jr_06_mat-1", {
      intent: "paid-action",
      lessonAccess: "free",
      planCovers: false,
    });
    expect(paid.allow).toBe(false);
    expect(canEnterJunior(null, null, { intent: "profile" }).allow).toBe(false);
    expect(canEnterJunior(PARENT, null, { intent: "checkout" }).allow).toBe(false);
    expect(isJuniorCheckoutLocked()).toBe(true);
  });

  it("doğrulanmış yapinet360@gmail.com kilitli konuyu açar, abonelik yazmaz, kasa 503 kalır", async () => {
    expect(ADMIN.email).toBe("yapinet360@gmail.com");
    expect(CANONICAL_SUPER_ADMIN_EMAIL_DEFAULT).toBe("yapinet360@gmail.com");
    expect(isJuniorAuditActor(ADMIN)).toBe(true);
    expect(
      canEnterJunior(ADMIN, "jr_06_mat-2", {
        intent: "lesson",
        lessonAccess: "locked",
        planCovers: false,
      }),
    ).toEqual({ allow: true, via: "audit" });
    const store = createMemoryJuniorStore();
    const paid = await completeJuniorCheckout(store, ADMIN.id, {}, new Date("2026-10-08T12:00:00+03:00"), {
      env: {} as NodeJS.ProcessEnv,
    });
    expect(paid).toEqual({ ok: false, status: 503, error: JUNIOR_CHECKOUT_CLOSED_MESSAGE });
    expect(await store.getSubscription(ADMIN.id)).toBeNull();
  });

  it("doğrulanmış süper yönetici ikinci konuyu, anlatışı ve profil masasını açar; kasayı açmaz", () => {
    expect(isJuniorAuditActor(ADMIN)).toBe(true);
    const lesson = canEnterJunior(ADMIN, "jr_06_mat-2", {
      intent: "lesson",
      lessonAccess: "locked",
      planCovers: false,
    });
    expect(lesson).toEqual({ allow: true, via: "audit" });
    const paid = canEnterJunior(ADMIN, "jr_06_kod-2", {
      intent: "paid-action",
      lessonAccess: "locked",
      planCovers: false,
      id: "profil",
    });
    expect(paid).toEqual({ allow: true, via: "audit" });
    expect(canEnterJunior(ADMIN, null, { intent: "profile" })).toEqual({ allow: true, via: "audit" });
    expect(canEnterJunior(ADMIN, null, { intent: "checkout" }).allow).toBe(false);
    const view = juniorLessonGate(ADMIN, "jr_06_mat-2", {
      active: false,
      selectedElectives: [],
      profileId: "profil",
    });
    expect(view.lesson.allow).toBe(true);
    expect(view.renderPlan?.active).toBe(true);
    expect(view.renderPlan?.selectedElectives).toContain("jr_06_kod");
  });

  it("izin listesindeki doğrulanmış test postası denetler; vatandaş test hesabı ve doğrulanmamış posta denetlemez", () => {
    const env = {
      ...process.env,
      JUNIOR_BETA_ALLOWLIST: "beta.veli@ornek.com, yetkin.vision@gmail.com",
    };
    const beta: JuniorActor = {
      id: "33333333-3333-4333-8333-333333333333",
      email: "beta.veli@ornek.com",
      emailConfirmedAt: "2026-02-01T00:00:00.000Z",
    };
    const unconfirmed: JuniorActor = { ...beta, emailConfirmedAt: null };
    const citizen: JuniorActor = {
      id: beta.id,
      email: "yetkin.vision@gmail.com",
      emailConfirmedAt: "2026-02-01T00:00:00.000Z",
    };
    expect(canEnterJunior(beta, "jr_06_fen-2", { intent: "lesson", lessonAccess: "locked" }, env).allow).toBe(
      true,
    );
    expect(canEnterJunior(unconfirmed, "jr_06_fen-2", { intent: "lesson", lessonAccess: "locked" }, env).allow).toBe(
      false,
    );
    expect(canEnterJunior(citizen, "jr_06_fen-2", { intent: "lesson", lessonAccess: "locked" }, env).allow).toBe(
      false,
    );
    expect(canEnterJunior({ ...ADMIN, emailConfirmedAt: null }, "jr_06_fen-2", {
      intent: "lesson",
      lessonAccess: "locked",
    }).allow).toBe(false);
  });

  it("DRON_JUNIOR_OPEN profil masasını oturumlu veliye açar; kasayı açmaz", () => {
    const env = { ...process.env, DRON_JUNIOR_OPEN: "1" };
    expect(canEnterJunior(PARENT, null, { intent: "profile" }, env).allow).toBe(true);
    expect(canEnterJunior(null, null, { intent: "profile" }, env).allow).toBe(false);
    expect(canEnterJunior(PARENT, "jr_06_mat-2", { intent: "lesson", lessonAccess: "locked" }, env).allow).toBe(
      false,
    );
    expect(canEnterJunior(PARENT, null, { intent: "checkout" }, env).allow).toBe(false);
  });
});

describe("Junior fiyatı katalog satırındandır", () => {
  it("cat_junior_yearly tutarını etikete çevirir; başka satırı ve kod sabitini okumaz", () => {
    const price = juniorYearlyPriceFromEntry(entry(120_000));
    expect(price?.amountMinor).toBe(120_000);
    expect(price?.label).toBe(formatMinorCompact(120_000, "TRY"));
    expect(price?.label).not.toBe("5.499 TL");
    expect(juniorYearlyPriceFromEntry(entry(120_000, "baska"))).toBeNull();
    expect(juniorYearlyPriceFromEntry({ ...entry(120_000), isActive: false })).toBeNull();
    const limits = readFileSync(join(process.cwd(), "lib/junior/limits.ts"), "utf8");
    expect(limits).not.toContain("549_900");
    expect(limits).not.toContain("5.499");
  });
});

describe("Junior bilinmeyen ders adresi", () => {
  it("katalog anahtarları ile kenar listesi aynıdır; olmayan anahtar 404 adayıdır", () => {
    expect([...JUNIOR_KNOWN_LESSON_KEYS].sort()).toEqual([...juniorCatalogLessonKeys()].sort());
    expect(juniorLessonAccess("jr_06_mat-99")).toBe("missing");
    expect(isUnknownJuniorLessonPath("/junior/ders/jr_06_mat-99")).toBe(true);
    expect(isUnknownJuniorLessonPath("/junior/ders/jr_06_mat-1")).toBe(false);
    expect(isUnknownJuniorLessonPath("/junior")).toBe(false);
    expect(isUnknownJuniorLessonPath("/academy/yok")).toBe(false);
    const proxy = readFileSync(join(process.cwd(), "proxy.ts"), "utf8");
    expect(proxy).toContain("isUnknownJuniorLessonPath(pathname)");
    expect(proxy).toContain("status: 404");
  });
});

describe("Junior denetim anlatışı", () => {
  it("süper yönetici kendi profilinde ikinci konuyu paketsiz anlatır; paketsiz veli anlatamaz", async () => {
    const store = createMemoryJuniorStore();
    const owner = "audit-parent";
    const actor: JuniorActor = {
      id: owner,
      email: CANONICAL_SUPER_ADMIN_EMAIL_DEFAULT,
      emailConfirmedAt: "2026-01-01T00:00:00.000Z",
    };
    const created = await createJuniorProfile(
      store,
      owner,
      {
        nickname: "Denet",
        grade: 6,
        birthYear: 2015,
        consent: true,
        consentVersion: "junior-notice-2026-10-09",
        guardianBirthYear: 1990,
      },
      new Date("2026-10-05T12:00:00+03:00"),
    );
    expect(created.ok).toBe(true);
    if (!created.ok) {
      return;
    }
    const text = "Dünya kendi çevresinde döner. Bu dönüş gece ve gündüzü oluşturur.";
    const told = {
      text: JSON.stringify({
        onTopic: true,
        praised: "Dönüşü söyledin.",
        missing: "Eksenin eğik olduğunu da ekle.",
        advice: "Bir kez daha anlat.",
        score: 80,
      }),
      model: "gemini-3.8-live",
      provider: "gemini" as const,
      usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
    };
    const denied = await submitJuniorTell(
      store,
      {
        userId: owner,
        profileId: created.data.profile.id,
        lessonKey: "jr_06_mat-2",
        mode: "write",
        text,
        now: new Date("2026-10-05T12:00:00+03:00"),
      },
      { invoke: async () => told },
    );
    expect(denied.ok).toBe(false);
    if (!denied.ok) {
      expect(denied.status).toBe(403);
      expect(denied.error).toContain("yıllık paket");
    }
    const opened = await submitJuniorTell(
      store,
      {
        userId: owner,
        profileId: created.data.profile.id,
        lessonKey: "jr_06_mat-2",
        mode: "write",
        text,
        now: new Date("2026-10-05T12:00:00+03:00"),
        actor,
      },
      { invoke: async () => told },
    );
    expect(opened.ok).toBe(true);
    const firstWithoutPlan = await submitJuniorTell(
      store,
      {
        userId: owner,
        profileId: created.data.profile.id,
        lessonKey: "jr_06_mat-1",
        mode: "write",
        text: "Kesir bir bütünün eşit parçasıdır. Pay üstte, payda altta durur.",
        now: new Date("2026-10-05T12:00:00+03:00"),
      },
      { invoke: async () => told },
    );
    expect(firstWithoutPlan.ok).toBe(false);
    if (!firstWithoutPlan.ok) {
      expect(firstWithoutPlan.error).toBe(JUNIOR_PAID_ACTION_ERROR);
    }
  });
});
