import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "../../proxy";
import { hasAcademyAdminBypass, hasAcademyOynaAccess } from "@/lib/academy/access";
import { loadAcademyFreePreviewAudioGrants } from "@/lib/academy/free-preview-audio";
import {
  ACADEMY_AUDIO_GRANT_TTL_SEC,
  academySealedObjectPathFromPlayback,
  assertAcademySealedBucket,
  decideAcademyAudioPublicRequest,
  registerAcademyStorageSigner,
  resolveAcademyMediaRead,
  withAcademyAudioGrant,
} from "@/lib/academy/lesson-audio-grant";
import { academyLessonAudioPlaybackSrc } from "@/lib/academy/lesson-audio";
import {
  academyCourseOffersFreePreview,
  isAcademyFreePreviewLessonKey,
  isAcademyLessonPaywalled,
} from "@/lib/academy/purchase-path";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { isProtectedCitizenPath } from "@/lib/kernel/security/edge-guard";

const ENV = { NODE_ENV: "test", VITEST: "true" } as const;

describe("ders sesi imza kapısı", () => {
  it("imzasız adres yasaktır; imzalı mühürlü adres geçer", async () => {
    const src = await withAcademyAudioGrant(
      academyLessonAudioPlaybackSrc("01_office_ai", "01_office_ai-1"),
      Date.now(),
      ENV,
    );
    expect(src).toContain("/media/academy/audio/01_office_ai/01_office_ai-1.mp3");
    expect(src).toContain("g=");
    const signed = new URL(src!, "https://yetkin.ai");
    expect(await decideAcademyAudioPublicRequest(signed, Date.now(), ENV)).toBe("allow");

    const naked = new URL("https://yetkin.ai/media/academy/audio/01_office_ai/01_office_ai-1.mp3");
    expect(await decideAcademyAudioPublicRequest(naked, Date.now(), ENV)).toBe("forbidden");

    const off201 = await withAcademyAudioGrant(
      "/media/academy/audio/01_office_ai_ileri/01_office_ai_ileri-1.mp3",
      Date.now(),
      ENV,
    );
    expect(off201).toContain("g=");
    const off201Url = new URL(off201!, "https://yetkin.ai");
    expect(await decideAcademyAudioPublicRequest(off201Url, Date.now(), ENV)).toBe("allow");

    for (const lesson of [2, 3, 4, 5, 6]) {
      const src = await withAcademyAudioGrant(
        `/media/academy/audio/01_office_ai_ileri/01_office_ai_ileri-${lesson}.mp3`,
        Date.now(),
        ENV,
      );
      expect(src).toContain("g=");
      const url = new URL(src!, "https://yetkin.ai");
      expect(await decideAcademyAudioPublicRequest(url, Date.now(), ENV)).toBe("allow");
    }
  });

  it("süresi dolmuş imza geçmez", async () => {
    const now = Date.now();
    const src = await withAcademyAudioGrant(
      "/media/academy/audio/01_office_ai/01_office_ai-1.mp3",
      now,
      ENV,
    );
    const url = new URL(src!, "https://yetkin.ai");
    const later = now + (ACADEMY_AUDIO_GRANT_TTL_SEC + 120) * 1000;
    expect(await decideAcademyAudioPublicRequest(url, later, ENV)).toBe("forbidden");
  });

  it("kenar imzasız isteği 403 döner", async () => {
    const denied = await proxy(
      new NextRequest(new URL("https://yetkin.ai/media/academy/audio/01_office_ai/01_office_ai-1.mp3")),
    );
    expect(denied.status).toBe(403);
    expect(denied.headers.get("cache-control")).toBe("no-store");

    const off201 = await proxy(
      new NextRequest(
        new URL("https://yetkin.ai/media/academy/audio/01_office_ai_ileri/01_office_ai_ileri-1.mp3"),
      ),
    );
    expect(off201.status).toBe(403);
    expect(off201.headers.get("cache-control")).toBe("no-store");
  });

  it("Super Admin ödeme duvarını aşar; Ders 1 anonim vitrindir, ders 2 kilitlidir", async () => {
    expect(academyCourseOffersFreePreview("01_office_ai")).toBe(true);
    expect(academyCourseOffersFreePreview("01_office_ai_ileri")).toBe(true);
    expect(academyCourseOffersFreePreview("02_ecommerce_ai")).toBe(true);
    expect(academyCourseOffersFreePreview("03_social_media_ai")).toBe(true);
    expect(academyCourseOffersFreePreview("04_chatbot_nocode")).toBe(true);
    expect(academyCourseOffersFreePreview("05_prompt_practice")).toBe(true);
    expect(isAcademyFreePreviewLessonKey("01_office_ai-1")).toBe(true);
    expect(isAcademyFreePreviewLessonKey("01_office_ai_ileri-1")).toBe(true);
    expect(isAcademyFreePreviewLessonKey("02_ecommerce_ai-1")).toBe(true);
    expect(isAcademyFreePreviewLessonKey("02_ecommerce_ai-2")).toBe(false);
    expect(isAcademyLessonPaywalled("01_office_ai", "01_office_ai-1", false)).toBe(false);
    expect(isAcademyLessonPaywalled("01_office_ai_ileri", "01_office_ai_ileri-1", false)).toBe(false);
    expect(isAcademyLessonPaywalled("01_office_ai", "01_office_ai-k1", false)).toBe(true);
    expect(isAcademyLessonPaywalled("01_office_ai_ileri", "01_office_ai_ileri-2", false)).toBe(true);
    expect(isProtectedCitizenPath("/academy/01_office_ai/oyna")).toBe(false);
    expect(isProtectedCitizenPath("/academy/01_office_ai_ileri/oyna")).toBe(false);

    const confirmed = "2026-01-01T00:00:00.000Z";
    const adminId = "11111111-1111-4111-8111-111111111111";
    const previousEmail = process.env.CANONICAL_SUPER_ADMIN_EMAIL;
    const previousId = process.env.SUPER_ADMIN_USER_ID;
    delete process.env.CANONICAL_SUPER_ADMIN_EMAIL;
    delete process.env.SUPER_ADMIN_USER_ID;
    const canonical = {
      userId: adminId,
      email: "yapinet360@gmail.com",
      emailConfirmedAt: confirmed,
    };
    const spelled = {
      userId: adminId,
      email: "yapipinet360@gmail.com",
      emailConfirmedAt: confirmed,
    };
    try {
      expect(hasAcademyAdminBypass(canonical)).toBe(true);
      expect(hasAcademyAdminBypass(spelled)).toBe(false);
      expect(hasAcademyOynaAccess(null, canonical, new Date(), "production")).toBe(true);
      expect(hasAcademyOynaAccess(null, spelled, new Date(), "production")).toBe(false);
    } finally {
      if (previousEmail == null) {
        delete process.env.CANONICAL_SUPER_ADMIN_EMAIL;
      } else {
        process.env.CANONICAL_SUPER_ADMIN_EMAIL = previousEmail;
      }
      if (previousId == null) {
        delete process.env.SUPER_ADMIN_USER_ID;
      } else {
        process.env.SUPER_ADMIN_USER_ID = previousId;
      }
    }
    expect(
      hasAcademyOynaAccess(
        null,
        { userId: "22222222-2222-4222-8222-222222222222", email: "vatandas@yetkin.rail" },
        new Date(),
        "production",
      ),
    ).toBe(false);

    const off101 = await loadAcademyFreePreviewAudioGrants("01_office_ai", Date.now(), ENV);
    expect(off101["01_office_ai-1"]?.src).toContain("g=");
    expect(off101["01_office_ai-1"]?.src).toContain("01_office_ai-1.mp3");
    expect(off101["01_office_ai-k1"]).toBeUndefined();
    const off201Grants = await loadAcademyFreePreviewAudioGrants("01_office_ai_ileri", Date.now(), ENV);
    expect(off201Grants["01_office_ai_ileri-1"]?.src).toContain("g=");
    expect(off201Grants["01_office_ai_ileri-2"]).toBeUndefined();

    const nakedLesson = new URL("https://yetkin.ai/media/academy/audio/01_office_ai/01_office_ai-1.mp3");
    expect(await decideAcademyAudioPublicRequest(nakedLesson, Date.now(), ENV)).toBe("forbidden");

    expect(ACADEMY_SEN.player.funnelTitle).toBe("Eğitimin Tamamına Erişim Sağla ve Sertifika Al");
    expect(ACADEMY_SEN.player.funnelCta("₺890")).toBe(
      "Eğitimin Tamamına Erişim Sağla ve Sertifika Al — Satın Al ₺890",
    );
    const coursePage = readFileSync(join(process.cwd(), "app/academy/[slug]/page.tsx"), "utf8");
    const player = readFileSync(join(process.cwd(), "components/academy/curriculum-player.tsx"), "utf8");
    expect(coursePage).toContain("hasAcademyAdminBypass");
    expect(coursePage).toContain("redirect(`/academy/${board.course.slug}/oyna`)");
    expect(player).toContain("data-academy-sales-funnel");
    expect(player).toContain("copy.funnelTitle");
  });

  it("local okuma kenar imzasında kalır; storage kovadan 4 saatlik adres üretir", async () => {
    expect(resolveAcademyMediaRead(ENV)).toBe("local");
    expect(resolveAcademyMediaRead({ ...ENV, ACADEMY_MEDIA_READ: "local" })).toBe("local");
    expect(resolveAcademyMediaRead({ ...ENV, ACADEMY_MEDIA_READ: "storage" })).toBe("storage");
    expect(() => assertAcademySealedBucket("lesson-audios")).toThrow(/lesson-audios/);

    const playback = academyLessonAudioPlaybackSrc("01_office_ai", "01_office_ai-1");
    const local = await withAcademyAudioGrant(
      playback,
      Date.now(),
      { ...ENV, ACADEMY_MEDIA_READ: "local" },
      async () => "https://evil.example/storage/v1/object/sign/academy-sealed/yanlis.mp3?token=x",
    );
    expect(local).toContain("/media/academy/audio/01_office_ai/01_office_ai-1.mp3");
    expect(local).toContain("g=");
    expect(local).not.toContain("evil.example");

    const objectPath = academySealedObjectPathFromPlayback(playback);
    expect(objectPath).toMatch(/^01_office_ai\/01_office_ai-1\/v[1-9]\d*\.mp3$/u);
    expect(academySealedObjectPathFromPlayback("media-bake/academy/audio/01_office_ai/01_office_ai-1.wav")).toBeNull();

    registerAcademyStorageSigner(null);
    const missingSigner = await withAcademyAudioGrant(playback, Date.now(), {
      ...ENV,
      ACADEMY_MEDIA_READ: "storage",
    });
    expect(missingSigner).toBeNull();

    let seenTtl = 0;
    const signed = await withAcademyAudioGrant(
      playback,
      Date.now(),
      { ...ENV, ACADEMY_MEDIA_READ: "storage" },
      async (path, ttl) => {
        seenTtl = ttl;
        return `https://project.supabase.co/storage/v1/object/sign/academy-sealed/${path}?token=abc`;
      },
    );
    expect(seenTtl).toBe(ACADEMY_AUDIO_GRANT_TTL_SEC);
    expect(signed).toBe(
      `https://project.supabase.co/storage/v1/object/sign/academy-sealed/${objectPath}?token=abc`,
    );

    const wrongBucket = await withAcademyAudioGrant(
      playback,
      Date.now(),
      { ...ENV, ACADEMY_MEDIA_READ: "storage" },
      async (path) => `https://project.supabase.co/storage/v1/object/sign/lesson-audios/${path}?token=abc`,
    );
    expect(wrongBucket).toBeNull();

    const storageEnv = { ...ENV, ACADEMY_MEDIA_READ: "storage" };
    const preview = await loadAcademyFreePreviewAudioGrants(
      "03_social_media_ai",
      Date.now(),
      storageEnv,
      async (path, ttl) => {
        expect(ttl).toBe(ACADEMY_AUDIO_GRANT_TTL_SEC);
        return `https://project.supabase.co/storage/v1/object/sign/academy-sealed/${path}?token=abc`;
      },
    );
    expect(preview["03_social_media_ai-1"]?.src).toContain("/academy-sealed/");
    expect(preview["03_social_media_ai-1"]?.src).toContain("03_social_media_ai-1/v");
    expect(preview["03_social_media_ai-1"]?.bedSrc).toContain(".bed.mp3");
    expect(preview["03_social_media_ai-2"]).toBeUndefined();

    const route = readFileSync(join(process.cwd(), "app/api/academy/courses/[id]/audio-grant/route.ts"), "utf8");
    expect(route).toContain("hasPurchased");
    expect(route).toContain("Satın alma tamamlanmadan ders sesi açılmaz.");
    expect(route.indexOf("if (!hasPurchased(purchase, actor))")).toBeLessThan(
      route.indexOf("ensureAcademySealedStorageSigner()"),
    );
  });
});
