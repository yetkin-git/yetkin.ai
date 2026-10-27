import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { clearJuniorCourseShelfCache, juniorCourseShelves, juniorLessonAccess } from "@/lib/junior/catalog";
import { JUNIOR_ELECTIVE_QUOTA, JUNIOR_FREE_LESSON_KEY } from "@/lib/junior/limits";
import {
  JUNIOR_LOCKED_MEDIA_PREFIX,
  JUNIOR_MEDIA_GRANT_TTL_SEC,
  issueJuniorLessonMedia,
} from "@/lib/junior/media-grant";
import { createMemoryJuniorStore } from "@/lib/junior/memory-port";
import { JUNIOR_PLAN_CODE, JUNIOR_POS_PROVIDER, juniorPlanExpiry } from "@/lib/junior/plan";
import { juniorTopicEndQuestions } from "@/lib/junior/quiz";
import { createJuniorProfile, openJuniorLessonPlay, recordJuniorListenProgress, submitJuniorPractice } from "@/lib/junior/service";
import { railV1JuniorLessonPlayDataSchema } from "@/lib/kernel/http/v1-contract";
import { presignR2GetUrl } from "@/lib/media/r2-s3";

const NOW = new Date("2026-10-09T12:00:00.000Z");
const PARENT = "parent-faz3";
const SIGNING = {
  R2_BUCKET_NAME: "yetkin-media",
  R2_ACCESS_KEY_ID: "access-key",
  R2_SECRET_ACCESS_KEY: "secret-key",
  R2_ACCOUNT_ID: "a".repeat(32),
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
      consentVersion: "junior-notice-2026-10-09",
      guardianBirthYear: 1990,
    },
    NOW,
  );
  if (!created.ok) {
    throw new Error(created.error);
  }
  return created.data.profile;
}

describe("Faz 3 kilitli medya", () => {
  it("sorgu imzası kısa ömürlüdür ve sırrı adrese yazmaz", () => {
    const url = presignR2GetUrl({
      endpoint: "https://aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.r2.cloudflarestorage.com",
      bucket: "yetkin-media",
      objectKey: `${JUNIOR_LOCKED_MEDIA_PREFIX}/audio/jr_06_mat-2.mp3`,
      accessKeyId: "access-key",
      secretAccessKey: "secret-key",
      expiresSec: JUNIOR_MEDIA_GRANT_TTL_SEC,
      now: NOW,
    });
    expect(url).toContain("X-Amz-Algorithm=AWS4-HMAC-SHA256");
    expect(url).toContain("X-Amz-Expires=600");
    expect(url).toContain("X-Amz-Signature=");
    expect(url).toContain(`${JUNIOR_LOCKED_MEDIA_PREFIX}/audio/jr_06_mat-2.mp3`);
    expect(url).not.toContain("secret-key");
    expect(url).not.toContain("/media/junior/");
    expect(() =>
      presignR2GetUrl({
        endpoint: "https://aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.r2.cloudflarestorage.com",
        bucket: "yetkin-media",
        objectKey: "../secret.mp3",
        accessKeyId: "access-key",
        secretAccessKey: "secret-key",
        expiresSec: 600,
        now: NOW,
      }),
    ).toThrow(/nesne anahtarı/u);
    expect(() =>
      presignR2GetUrl({
        endpoint: "https://aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.r2.cloudflarestorage.com",
        bucket: "yetkin-media",
        objectKey: "media/junior/audio/jr_06_mat-2.mp3",
        accessKeyId: "access-key",
        secretAccessKey: "secret-key",
        expiresSec: 600,
        now: NOW,
      }),
    ).toThrow(/nesne anahtarı/u);
  });

  it("yetkisiz kilitli ders adres taşımaz; ücretli oturum özel önekten imza alır", () => {
    expect(juniorLessonAccess(JUNIOR_FREE_LESSON_KEY)).toBe("free");
    const free = issueJuniorLessonMedia({ lessonKey: JUNIOR_FREE_LESSON_KEY, entitled: false, now: NOW });
    expect(free.kind).toBe("public");
    if (free.kind === "public") {
      expect(free.urls.audioUrl).toContain(`${JUNIOR_FREE_LESSON_KEY}.mp3`);
      expect(free.urls.audioUrl).not.toContain("X-Amz-Signature");
      expect(free.urls.expiresAt).toBeNull();
    }

    const denied = issueJuniorLessonMedia({ lessonKey: "jr_06_mat-2", entitled: false, now: NOW });
    expect(denied.kind).toBe("denied");
    expect(JSON.stringify(denied)).not.toContain(".mp3");
    expect(JSON.stringify(denied)).not.toContain("private/junior");

    const missingConfig = issueJuniorLessonMedia({
      lessonKey: "jr_06_mat-2",
      entitled: true,
      now: NOW,
      env: {},
    });
    expect(missingConfig.kind).toBe("unavailable");
    expect(JSON.stringify(missingConfig)).not.toContain("/media/junior/");

    const signed = issueJuniorLessonMedia({
      lessonKey: "jr_06_mat-2",
      entitled: true,
      now: NOW,
      env: SIGNING,
    });
    expect(signed.kind).toBe("signed");
    if (signed.kind === "signed") {
      expect(signed.urls.audioUrl).toContain(`${JUNIOR_LOCKED_MEDIA_PREFIX}/audio/jr_06_mat-2.mp3`);
      expect(signed.urls.audioUrl).toContain("X-Amz-Signature=");
      expect(signed.urls.warmupUrl).toContain(`${JUNIOR_LOCKED_MEDIA_PREFIX}/warmup/jr_06_mat-warmup.mp4`);
      expect(signed.urls.coverUrl).toContain(`${JUNIOR_LOCKED_MEDIA_PREFIX}/covers/jr_06_mat-2.jpg`);
      expect(signed.urls.audioUrl).not.toContain("/media/junior/");
      expect(signed.urls.expiresAt).toBe("2026-10-09T12:10:00.000Z");
    }
  });
});

describe("Faz 3 ders gövdesi ve ilerleme", () => {
  it("ücretsiz dersi açar ve dinleme kaydını yazar", async () => {
    const store = createMemoryJuniorStore();
    const profile = await openProfile(store);
    const opened = await openJuniorLessonPlay(store, {
      userId: PARENT,
      profileId: profile.id,
      lessonKey: JUNIOR_FREE_LESSON_KEY,
      actor: { id: PARENT },
    });
    expect(opened.ok).toBe(true);
    if (!opened.ok) {
      return;
    }
    expect(opened.catalogAccess).toBe("free");
    expect(opened.lesson.script.length).toBeGreaterThan(20);
    expect(opened.lesson.practice.length).toBeGreaterThan(0);
    expect(opened.progress?.status).toBe("fresh");
    const grant = issueJuniorLessonMedia({ lessonKey: JUNIOR_FREE_LESSON_KEY, entitled: false, now: NOW });
    expect(grant.kind).toBe("public");
    if (grant.kind === "public") {
      const wire = railV1JuniorLessonPlayDataSchema.safeParse({
        lesson: {
          lessonKey: JUNIOR_FREE_LESSON_KEY,
          title: opened.lesson.title,
          courseTitle: opened.lesson.courseTitle,
          access: opened.catalogAccess,
          script: opened.lesson.script,
          scene: opened.lesson.scene,
          steps: opened.lesson.steps ? [...opened.lesson.steps] : [],
          preparing: opened.lesson.preparing,
        },
        media: grant.urls,
        practice: opened.lesson.practice,
        progress: opened.progress,
      });
      expect(wire.success).toBe(true);
    }

    const saved = await recordJuniorListenProgress(store, {
      userId: PARENT,
      profileId: profile.id,
      lessonKey: JUNIOR_FREE_LESSON_KEY,
      now: NOW,
      actor: { id: PARENT },
    });
    expect(saved.ok).toBe(true);
    if (!saved.ok) {
      return;
    }
    expect(saved.data.status).toBe("going");
    expect(saved.data.xpAwarded).toBe(0);
    expect(saved.data.score).toBe(0);
  });

  it("paketsiz kilitli ders gövde ve adres vermez; paketle gövde açılır", async () => {
    const store = createMemoryJuniorStore();
    const profile = await openProfile(store);
    const denied = await openJuniorLessonPlay(store, {
      userId: PARENT,
      profileId: profile.id,
      lessonKey: "jr_06_mat-2",
      actor: { id: PARENT },
    });
    expect(denied.ok).toBe(false);
    if (!denied.ok) {
      expect(denied.status).toBe(403);
      expect(denied.error).not.toContain(".mp3");
      expect(denied.error).not.toContain("private/junior");
    }

    await store.saveActiveSubscription({
      userId: PARENT,
      status: "ACTIVE",
      planCode: JUNIOR_PLAN_CODE,
      listPriceMinor: 549_900,
      currencyCode: "TRY",
      provider: JUNIOR_POS_PROVIDER,
      providerRef: "JRFAZ301",
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
    const opened = await openJuniorLessonPlay(store, {
      userId: PARENT,
      profileId: profile.id,
      lessonKey: "jr_06_mat-2",
      actor: { id: PARENT },
    });
    expect(opened.ok).toBe(true);
    if (!opened.ok) {
      return;
    }
    expect(opened.catalogAccess).toBe("locked");
    expect(opened.lesson.script.length).toBeGreaterThan(20);

    const questions = juniorTopicEndQuestions("jr_06_mat-2");
    const practiced = await submitJuniorPractice(store, {
      userId: PARENT,
      profileId: profile.id,
      lessonKey: "jr_06_mat-2",
      answers: questions.map((row) => ({ id: row.id, choiceIndex: row.correctAnswerIndex })),
      now: NOW,
      actor: { id: PARENT },
    });
    expect(practiced.ok).toBe(true);
    if (practiced.ok) {
      expect(practiced.data.correct).toBe(practiced.data.total);
      expect(practiced.data.score).toBe(100);
    }
  });
});

describe("Faz 3 vitrin ve kota", () => {
  it("raf hesabı aynı haftada yeniden kurulmaz ve çağıran önbelleği bozamaz", () => {
    clearJuniorCourseShelfCache();
    const first = juniorCourseShelves(NOW);
    first[0]!.title = "bozuk";
    const started = performance.now();
    const second = juniorCourseShelves(NOW);
    const elapsed = performance.now() - started;
    expect(second[0]!.title).not.toBe("bozuk");
    expect(second).toEqual(juniorCourseShelves(NOW));
    expect(elapsed).toBeLessThan(15);
    const otherWeek = juniorCourseShelves(new Date("2026-11-09T12:00:00.000Z"));
    expect(otherWeek).not.toBe(second);
  });

  it("seçmeli kotası tek sabittir; şema ve SQL aynı sayıyı taşır", () => {
    const limits = readFileSync(join(process.cwd(), "lib/junior/limits.ts"), "utf8");
    const assignments = limits.match(/JUNIOR_ELECTIVE_QUOTA\s*=\s*\d+/gu) ?? [];
    expect(assignments).toEqual([`JUNIOR_ELECTIVE_QUOTA = ${JUNIOR_ELECTIVE_QUOTA}`]);
    const schema = readFileSync(join(process.cwd(), "prisma/schema/junior.prisma"), "utf8");
    expect(schema).toContain(`@default(${JUNIOR_ELECTIVE_QUOTA})`);
    const plan = readFileSync(join(process.cwd(), "lib/junior/service.ts"), "utf8");
    expect(plan).toContain("electiveQuota: JUNIOR_ELECTIVE_QUOTA");
    expect(plan).not.toContain("subscription?.electiveQuota");
    for (const relative of [
      "prisma/migrations/20261005040000_junior_plan_quota/migration.sql",
      "prisma/migrations/20261005093000_junior_paytr_grade_switch/migration.sql",
      "prisma/migrations/20261006010000_junior_invoice_seal/migration.sql",
    ]) {
      const sql = readFileSync(join(process.cwd(), relative), "utf8");
      expect(sql).toContain("elective_quota");
      expect(sql).toContain(String(JUNIOR_ELECTIVE_QUOTA));
    }
  });
});
