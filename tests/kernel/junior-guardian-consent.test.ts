import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { sha256Hex } from "@/lib/kernel/crypto/sha256";
import { isJuniorCheckoutLocked } from "@/lib/kernel/security/junior-gate";
import { juniorGuardianNoticeCanonical } from "@/lib/copy/junior-guardian-notice";
import { RLS_FORCE_TABLES } from "@/lib/kernel/security/rls-policy-registry";
import { JUNIOR_CHECKOUT_CLOSED_MESSAGE, JUNIOR_CHECKOUT_NOT_CONFIGURED } from "@/lib/junior/checkout";
import {
  JUNIOR_CLOSED_PROFILE_NICKNAME,
  JUNIOR_CONSENT_REQUIRED_ERROR,
  JUNIOR_GUARDIAN_NOTICE,
  JUNIOR_GUARDIAN_NOTICE_SHA256,
  JUNIOR_NOTICE_UNSEALED_ERROR,
  isJuniorNoticeUsable,
  JUNIOR_PROFILE_CLOSED_ERROR,
  juniorLessonConsentBlock,
  type JuniorGuardianNotice,
} from "@/lib/junior/guardian-notice";
import {
  JUNIOR_ELECTIVE_QUOTA,
  JUNIOR_FREE_LESSON_KEY,
  JUNIOR_PILOT_SHELF_LINE,
  JUNIOR_PLAN_CODE,
} from "@/lib/junior/limits";
import { createMemoryJuniorStore } from "@/lib/junior/memory-port";
import { JUNIOR_POS_PROVIDER, juniorPlanExpiry } from "@/lib/junior/plan";
import {
  confirmJuniorGuardianConsent,
  createJuniorProfile,
  eraseJuniorChildProfile,
  submitJuniorTell,
} from "@/lib/junior/service";
import type { LlmGatewayResult } from "@/lib/kernel/ai/types";
import { catalogSqlPreservesOperatorPrice } from "../../scripts/ops-migrate-lib";

const JUNIOR_FIXTURE_PRICE_MINOR = 549_900;
const ROOT = process.cwd();
const NOW = new Date("2026-10-05T16:00:00+03:00");
const PARENT = "parent-a";
const OTHER = "parent-b";
const NOTICE: JuniorGuardianNotice = {
  version: "junior-notice-2026-10-05",
  sha256: "ab".repeat(32),
};

function told(): LlmGatewayResult {
  return {
    text: JSON.stringify({
      onTopic: true,
      praised: "Payın üstte olduğunu söyledin.",
      missing: "Paydanın bütünü böldüğünü de ekle.",
      advice: "Pay üstte, payda altta. Bunu bir kez daha anlat.",
      score: 80,
    }),
    model: "gemini-3.8-live",
    provider: "gemini",
    usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
  };
}

function read(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

async function openProfile(
  store: ReturnType<typeof createMemoryJuniorStore>,
  notice: JuniorGuardianNotice | null = null,
) {
  const created = await createJuniorProfile(
    store,
    PARENT,
    {
      nickname: "Ege",
      grade: 6,
      birthYear: 2015,
      consent: true,
      ...(notice
        ? { consentVersion: notice.version, guardianBirthYear: 1990 }
        : {}),
    },
    NOW,
    notice,
  );
  if (!created.ok) {
    throw new Error(created.error);
  }
  return created.data.profile;
}

describe("Junior veli rızası ve fiyat tohumu", () => {
  it("migrasyon append-only tabloyu açar; abonelik fiyat kilidine dokunmaz", () => {
    const sql = read("prisma/migrations/20261005160000_junior_guardian_consent/migration.sql");
    const schema = read("prisma/schema/junior.prisma");
    expect(schema).toContain('@@map("junior_guardian_consents")');
    const model = schema.slice(schema.indexOf("model JuniorGuardianConsent"), schema.indexOf("model JuniorProgress"));
    expect(model).not.toContain("updatedAt");
    expect(sql).toContain('CREATE TABLE "junior_guardian_consents"');
    expect(sql).toContain('"erased_at" TIMESTAMP(3)');
    expect(sql).not.toContain('"updated_at"');
    expect(sql).toContain("yetkin_junior_guardian_consent_append_only");
    expect(sql).toContain("BEFORE UPDATE OR DELETE");
    expect(sql).toContain('ALTER COLUMN "birth_year" DROP NOT NULL');
    expect(sql).toContain('"active_consent_id"');
    expect(sql).toContain("ON DELETE SET NULL");
    expect(sql).toContain("ON DELETE RESTRICT");
    expect(sql).not.toMatch(/ALTER TABLE "junior_subscriptions"/);
    expect(RLS_FORCE_TABLES).toContain("junior_guardian_consents");
  });

  it("yıllık fiyat tohumu Super Admin tutarını ezmez", () => {
    const sql = read("supabase/migrations/20261005160000_junior_yearly_price_seed.sql");
    expect(sql).toContain("'junior'");
    expect(sql).toContain("'yearly'");
    expect(sql).toContain("549900");
    expect(sql).toContain("'TRY'");
    expect(sql).toContain("'MINOR'");
    expect(catalogSqlPreservesOperatorPrice(sql)).toBe(true);
    expect(sql).not.toMatch(/^\s*amount_minor\s*=\s*EXCLUDED\.amount_minor\s*,?\s*$/m);
  });

  it("mühürlü aydınlatma özeti metinle aynıdır; boş metin sürüm alanını reddeder", async () => {
    expect(isJuniorNoticeUsable(JUNIOR_GUARDIAN_NOTICE)).toBe(true);
    expect(JUNIOR_GUARDIAN_NOTICE.version).toBe("junior-notice-2026-10-09");
    expect(sha256Hex(juniorGuardianNoticeCanonical())).toBe(JUNIOR_GUARDIAN_NOTICE_SHA256);
    expect(isJuniorCheckoutLocked({} as NodeJS.ProcessEnv)).toBe(true);
    expect(JUNIOR_CHECKOUT_NOT_CONFIGURED).toBe("not_configured");
    expect(JUNIOR_CHECKOUT_CLOSED_MESSAGE).not.toBe(JUNIOR_CHECKOUT_NOT_CONFIGURED);
    const store = createMemoryJuniorStore();
    const rejected = await createJuniorProfile(
      store,
      PARENT,
      { nickname: "Ege", grade: 6, birthYear: 2015, consent: true, consentVersion: NOTICE.version, guardianBirthYear: 1990 },
      NOW,
      null,
    );
    expect(rejected.ok).toBe(false);
    if (!rejected.ok) {
      expect(rejected.error).toBe(JUNIOR_NOTICE_UNSEALED_ERROR);
    }
    const profile = await openProfile(store, JUNIOR_GUARDIAN_NOTICE);
    await store.saveActiveSubscription({
      userId: PARENT,
      status: "ACTIVE",
      planCode: JUNIOR_PLAN_CODE,
      listPriceMinor: JUNIOR_FIXTURE_PRICE_MINOR,
      currencyCode: "TRY",
      provider: JUNIOR_POS_PROVIDER,
      providerRef: "JRSEEDED01",
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
    expect(profile.birthYear).toBe(2015);
    const row = await store.getProfile(PARENT, profile.id);
    expect(row?.consentAt).toEqual(NOW);
    expect(row?.activeConsentVersion).toBe(JUNIOR_GUARDIAN_NOTICE.version);
    expect(await store.listGuardianConsents(PARENT)).toHaveLength(1);
    expect(
      juniorLessonConsentBlock(
        {
          consentAt: row?.consentAt ?? null,
          birthYear: row?.birthYear ?? null,
          activeConsentVersion: null,
        },
        null,
      ),
    ).toBeNull();
    expect(
      juniorLessonConsentBlock(
        { consentAt: null, birthYear: 2015, activeConsentVersion: null },
        null,
      ),
    ).toBe(JUNIOR_CONSENT_REQUIRED_ERROR);
    expect(
      juniorLessonConsentBlock(
        { consentAt: NOW, birthYear: 2015, activeConsentVersion: null },
        NOTICE,
      ),
    ).toBe(JUNIOR_CONSENT_REQUIRED_ERROR);

    const toldLesson = await submitJuniorTell(
      store,
      {
        userId: PARENT,
        profileId: profile.id,
        lessonKey: JUNIOR_FREE_LESSON_KEY,
        mode: "write",
        text: "Pay üstte durur. Payda altta durur. Bütün bu iki parçaya ayrılır.",
        now: NOW,
      },
      { invoke: async () => told() },
    );
    expect(toldLesson.ok).toBe(true);
  });

  it("mühürlü metin rıza satırı yazar ve güncellemede eski satırı bozmaz", async () => {
    const store = createMemoryJuniorStore();
    const profile = await openProfile(store, NOTICE);
    const first = await store.listGuardianConsents(PARENT);
    expect(first).toHaveLength(1);
    expect(first[0]?.guardianUserId).toBe(PARENT);
    expect(first[0]?.profileId).toBe(profile.id);
    expect(first[0]?.noticeSha256).toBe(NOTICE.sha256);
    expect(first[0]?.guardianDeclaredAdult).toBe(true);
    expect(first[0]?.guardianBirthYear).toBe(1990);
    const linked = await store.getProfile(PARENT, profile.id);
    expect(linked?.activeConsentId).toBe(first[0]?.id);
    expect(linked?.activeConsentVersion).toBe(NOTICE.version);
    expect(
      juniorLessonConsentBlock(
        {
          consentAt: linked?.consentAt ?? null,
          birthYear: linked?.birthYear ?? null,
          activeConsentVersion: linked?.activeConsentVersion ?? null,
        },
        NOTICE,
      ),
    ).toBeNull();

    const again = await confirmJuniorGuardianConsent(
      store,
      PARENT,
      {
        profileId: profile.id,
        consent: true,
        consentVersion: NOTICE.version,
        guardianBirthYear: 1988,
      },
      new Date("2026-10-06T10:00:00+03:00"),
      NOTICE,
    );
    expect(again.ok).toBe(true);
    const rows = await store.listGuardianConsents(PARENT);
    expect(rows).toHaveLength(2);
    expect(rows[0]?.noticeSha256).toBe(NOTICE.sha256);
    expect(rows[0]?.guardianBirthYear).toBe(1990);
    expect(rows[1]?.guardianBirthYear).toBe(1988);
    const active = await store.getProfile(PARENT, profile.id);
    expect(active?.activeConsentId).toBe(rows[1]?.id);

    const unsealed = await confirmJuniorGuardianConsent(
      store,
      PARENT,
      {
        profileId: profile.id,
        consent: true,
        consentVersion: NOTICE.version,
        guardianBirthYear: 1988,
      },
      new Date("2026-10-06T10:00:00+03:00"),
      null,
    );
    expect(unsealed.ok).toBe(false);
    if (!unsealed.ok) {
      expect(unsealed.error).toBe(JUNIOR_NOTICE_UNSEALED_ERROR);
    }
  });

  it("veli kendi çocuğunun ilerleme, quiz ve puanını siler; rıza kanıtı, lisans ve başkasının verisi durur", async () => {
    const store = createMemoryJuniorStore();
    const profile = await openProfile(store, NOTICE);
    await store.recordOutcome({
      progress: {
        userId: PARENT,
        profileId: profile.id,
        lessonKey: JUNIOR_FREE_LESSON_KEY,
        mode: "speak",
        praised: "Payın üstte olduğunu söyledin.",
        missing: "Paydanın bütünü böldüğünü de ekle.",
        advice: "Pay üstte, payda altta. Bunu bir kez daha anlat.",
        score: 80,
        xpAwarded: 12,
      },
      points: 12,
      badges: ["ilk-anlatis"],
    });
    await store.recordOutcome({
      progress: {
        userId: PARENT,
        profileId: profile.id,
        lessonKey: JUNIOR_FREE_LESSON_KEY,
        mode: "quiz",
        praised: "Tamamlandı.",
        missing: "Eksik kalan nokta yok.",
        advice: "Bu ders bitti. İstersen sıradaki konuya geç.",
        score: 80,
        xpAwarded: 10,
      },
      points: 22,
      badges: ["ilk-anlatis"],
    });
    await store.saveActiveSubscription({
      userId: PARENT,
      status: "ACTIVE",
      planCode: JUNIOR_PLAN_CODE,
      listPriceMinor: JUNIOR_FIXTURE_PRICE_MINOR,
      currencyCode: "TRY",
      provider: JUNIOR_POS_PROVIDER,
      providerRef: "JRSEEDED01",
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
    const other = await createJuniorProfile(
      store,
      OTHER,
      {
        nickname: "Ada",
        grade: 6,
        birthYear: 2014,
        consent: true,
        consentVersion: JUNIOR_GUARDIAN_NOTICE.version,
        guardianBirthYear: 1990,
      },
      NOW,
    );
    if (!other.ok) {
      throw new Error(other.error);
    }
    await store.recordOutcome({
      progress: {
        userId: OTHER,
        profileId: other.data.profile.id,
        lessonKey: JUNIOR_FREE_LESSON_KEY,
        mode: "quiz",
        praised: "Tamamlandı.",
        missing: "Eksik kalan nokta yok.",
        advice: "Bu ders bitti. İstersen sıradaki konuya geç.",
        score: 70,
        xpAwarded: 10,
      },
      points: 10,
      badges: [],
    });

    const foreign = await eraseJuniorChildProfile(store, OTHER, profile.id, NOW);
    expect(foreign.ok).toBe(false);

    const erased = await eraseJuniorChildProfile(store, PARENT, profile.id, NOW);
    expect(erased.ok).toBe(true);
    expect(await store.listProgress(PARENT, profile.id)).toEqual([]);
    expect(await store.getXp(PARENT, profile.id)).toBeNull();
    const proof = await store.listGuardianConsents(PARENT);
    expect(proof).toHaveLength(1);
    expect(proof[0]?.profileId).toBeNull();
    expect(proof[0]?.erasedAt).toEqual(NOW);
    expect(proof[0]?.noticeSha256).toBe(NOTICE.sha256);
    expect(proof[0]?.guardianUserId).toBe(PARENT);
    const closed = await store.getProfile(PARENT, profile.id);
    expect(closed?.nickname).toBe(JUNIOR_CLOSED_PROFILE_NICKNAME);
    expect(closed?.birthYear).toBeNull();
    expect(closed?.activeConsentId).toBeNull();
    expect(closed?.selected).toBe(false);
    expect(closed?.selectedElectives).toEqual([]);
    const license = await store.getSubscription(PARENT);
    expect(license?.invoiceTckn).toBe("10000000146");
    expect(license?.listPriceMinor).toBe(549900);
    expect(license?.status).toBe("ACTIVE");
    expect(await store.listProgress(OTHER, other.data.profile.id)).toHaveLength(1);

    const lesson = await submitJuniorTell(store, {
      userId: PARENT,
      profileId: profile.id,
      lessonKey: JUNIOR_FREE_LESSON_KEY,
      mode: "write",
      text: "Pay üstte durur. Payda altta durur. Bütün bu iki parçaya ayrılır.",
      now: NOW,
    });
    expect(lesson.ok).toBe(false);
    if (!lesson.ok) {
      expect(lesson.error).toBe(JUNIOR_PROFILE_CLOSED_ERROR);
    }

    const load = read("lib/junior/load.ts");
    const body = load.slice(load.indexOf("async eraseChildData"), load.indexOf("async selectProfile"));
    expect(body).toContain('mode: "quiz"');
    expect(body).toContain("juniorProgress.deleteMany");
    expect(body).toContain("juniorXp.deleteMany");
    expect(body).not.toContain("ledgerEntry");
    expect(body).not.toContain("userBillingInfo");
    expect(body).not.toContain("paymentOrder");
    expect(body).not.toContain("juniorSubscription");
  });

  it("vitrin dayanaksız cümleyi basmaz; sınıf cümlesi pilotu söyler; silme rotası kilitten önce açılmaz", () => {
    const room = read("components/junior/junior-room.tsx");
    const form = read("components/junior/profile-switcher.tsx");
    const route = read("app/api/junior-pilot/profiles/route.ts");
    expect(JUNIOR_PILOT_SHELF_LINE).toBe(
      "Bu sınıf yakında gelecektir. Şu an sadece 6. Sınıf Pilot aktiftir.",
    );
    expect(form).toContain("JUNIOR_PILOT_SHELF_LINE");
    expect(form).not.toContain("Raf, yeni sınıfa göre açılır");
    expect(room).not.toContain("MaarifSealLabel");
    expect(room).not.toContain("MaarifSkillTags");
    expect(room).not.toContain("%100 Uygun");
    expect(room).not.toContain("Maarif Mührü");
    const deletion = route.slice(route.indexOf("export async function DELETE"));
    expect(deletion.indexOf("juniorLockedResponse")).toBeGreaterThanOrEqual(0);
    expect(deletion.indexOf("juniorLockedResponse")).toBeLessThan(deletion.indexOf("eraseJuniorChildProfile"));
  });
});
