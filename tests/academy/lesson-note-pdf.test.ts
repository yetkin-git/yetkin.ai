import { describe, expect, it } from "vitest";
import { ForbiddenError } from "@/lib/kernel/http/errors";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import { lockAcademyCoursePrice, purchaseAcademyCourse } from "@/lib/academy/engine";
import { completeAcademyLesson } from "@/lib/academy/curriculum-engine";
import { academyCanonicalProofSubmission } from "@/lib/academy/proof-of-work";
import { loadAcademyLessonNotePdf } from "@/archived/lib/academy-studio/lesson-note-engine";
import { buildAcademyLessonNote, plainAcademyLessonSections } from "@/archived/lib/academy-studio/lesson-note";
import {
  academyPdfEncodesTurkishSample,
  renderAcademyLessonNotesPdf,
} from "@/archived/lib/academy-studio/lesson-note-pdf";
import { academyCurriculumSealForSlug, academyLessonByKey } from "@/lib/academy/curriculum";
import { sha256Hex } from "@/lib/kernel/crypto/sha256";
import { canonicalAcademyProofOfWorkHash } from "@/lib/academy/proof-of-work";
import { ACADEMY_LICENSE_DURATION_MS } from "@/lib/academy/license";
import { createMemoryLedgerStore } from "../helpers/memory-money";
import { createMemoryAcademyStore, memoryCourse } from "../helpers/memory-academy";
import {
  createMemoryCheckoutPriceLockStore,
  createMemoryPriceCatalogStore,
} from "../helpers/memory-pricing";

const BUYER = "pdf-buyer";
const OTHER = "pdf-other";
const PLATFORM = PLATFORM_TREASURY_USER_ID;

function world() {
  const course = memoryCourse();
  return {
    course,
    ports: {
      ledger: createMemoryLedgerStore([
        { userId: BUYER, amountMinor: 100_000 },
        { userId: OTHER, amountMinor: 100_000 },
        { userId: PLATFORM, amountMinor: 0 },
      ]),
      catalog: createMemoryPriceCatalogStore([
        { moduleKey: ACADEMY_MODULE_KEY, unitKey: course.catalogUnitKey, amountMinor: 25_000 },
      ]),
      locks: createMemoryCheckoutPriceLockStore(),
      academy: createMemoryAcademyStore(),
    },
  };
}

async function settle(ctx: ReturnType<typeof world>) {
  await ctx.ports.academy.insertCourse(ctx.course);
  const locked = await lockAcademyCoursePrice(ctx.ports, { courseId: ctx.course.id, userId: BUYER });
  await purchaseAcademyCourse(ctx.ports, {
    courseId: ctx.course.id,
    userId: BUYER,
    lockId: locked.lock.id,
    platformUserId: PLATFORM,
  });
}

describe("mühürlü PDF ders notu", () => {
  it("Noto Sans Unicode ile Türkçe glifleri kayıpsız kodlar", () => {
    expect(academyPdfEncodesTurkishSample()).toBe(true);
  });

  it("görsel etiketsiz üç perde ve pratik görev basar", () => {
    const lesson = academyLessonByKey("python-temel", "python-temel-1");
    expect(lesson).not.toBeNull();
    const sections = plainAcademyLessonSections(lesson!.body);
    expect(sections.map((row) => row.act)).toEqual(["giris", "syntax", "mantik", "uygulama"]);
    expect(sections.some((row) => row.prose.includes("Teknik şema"))).toBe(false);
    expect(sections.some((row) => row.prose.includes("Mikro-video"))).toBe(false);
    const hash = canonicalAcademyProofOfWorkHash("python-temel-1", sha256Hex)!;
    const note = buildAcademyLessonNote({
      courseSlug: "python-temel",
      courseTitle: "yetkin.ai temeli",
      lessonKey: "python-temel-1",
      proofOfWorkHash: hash,
      curriculumSeal: academyCurriculumSealForSlug("python-temel"),
    });
    expect(note?.practice.kind).toBe("param-lock");
    const pdf = renderAcademyLessonNotesPdf([note!]);
    const text = Buffer.from(pdf).toString("latin1");
    expect(text.startsWith("%PDF-1.4")).toBe(true);
    expect(text).toContain("%%EOF");
    expect(text).toContain("/Subtype /Type0");
    expect(text).toContain("/Encoding /Identity-H");
    expect(text).toContain("/FontFile2");
    // ToUnicode: ğ=011F, İ=0130, ş=015F (Identity-H gövdesinde düz ASCII hash yok)
    expect(text).toMatch(/<011[Ff]>/);
    expect(text).toMatch(/<0130>/);
    expect(text).toMatch(/<015[Ff]>/);
    expect(pdf.byteLength).toBeGreaterThan(50_000);
    expect(note!.proofOfWorkHash).toBe(hash);
  });

  it("tamamlanan ders PDF üretir; proofsuz ve yabancı IDOR kapanır; lisans bitince de basılır", async () => {
    const ctx = world();
    await settle(ctx);
    await expect(
      loadAcademyLessonNotePdf(ctx.ports, {
        courseId: ctx.course.id,
        userId: BUYER,
        lessonKey: "python-temel-1",
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);

    await completeAcademyLesson(ctx.ports, {
      courseId: ctx.course.id,
      userId: BUYER,
      lessonKey: "python-temel-1",
      proof: academyCanonicalProofSubmission("python-temel-1") ?? undefined,
    });
    const fresh = await loadAcademyLessonNotePdf(ctx.ports, {
      courseId: ctx.course.id,
      userId: BUYER,
      lessonKey: "python-temel-1",
    });
    expect(fresh.filename).toBe("ders-notu-python-temel-1.pdf");
    expect(Buffer.from(fresh.bytes).toString("latin1").startsWith("%PDF-1.4")).toBe(true);

    await expect(
      loadAcademyLessonNotePdf(ctx.ports, {
        courseId: ctx.course.id,
        userId: OTHER,
        lessonKey: "python-temel-1",
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);

    const purchase = await ctx.ports.academy.getPurchaseByUserAndCourse(BUYER, ctx.course.id);
    expect(purchase).not.toBeNull();
    await ctx.ports.academy.updatePurchase(purchase!.id, {
      settledAt: new Date(Date.now() - ACADEMY_LICENSE_DURATION_MS - 86_400_000),
      amountMinor: purchase!.amountMinor,
      priceLockId: purchase!.priceLockId,
      updatedAt: new Date(),
    });
    const expired = await loadAcademyLessonNotePdf(ctx.ports, {
      courseId: ctx.course.id,
      userId: BUYER,
      lessonKey: "python-temel-1",
    });
    expect(expired.bytes.byteLength).toBeGreaterThan(200);
  });

  it("Super Admin lab tamamlanmadan python-temel ders notu basar; vatandaş kapalı kalır", async () => {
    const ADMIN = "11111111-1111-4111-8111-111111111111";
    const ADMIN_EMAIL = "admin@yetkin.test";
    const prevEmail = process.env.CANONICAL_SUPER_ADMIN_EMAIL;
    process.env.CANONICAL_SUPER_ADMIN_EMAIL = ADMIN_EMAIL;
    try {
      const course = memoryCourse({
        id: "ac_python_lab",
        slug: "python-temel",
        title: "Python ile Sıfırdan Programlama ve Problem Çözme",
        catalogUnitKey: "course:python-temel",
      });
      const ports = {
        academy: createMemoryAcademyStore(),
      };
      await ports.academy.insertCourse(course);

      await expect(
        loadAcademyLessonNotePdf(ports, {
          courseId: course.id,
          userId: BUYER,
          lessonKey: "python-temel-1",
        }),
      ).rejects.toBeInstanceOf(ForbiddenError);

      const lab = await loadAcademyLessonNotePdf(ports, {
        courseId: course.id,
        userId: ADMIN,
        email: ADMIN_EMAIL,
          lessonKey: "python-temel-1",
      });
      expect(lab.filename).toBe("ders-notu-python-temel-1.pdf");
      expect(Buffer.from(lab.bytes).toString("latin1").startsWith("%PDF-1.4")).toBe(true);
      expect(lab.bytes.byteLength).toBeGreaterThan(50_000);

      const all = await loadAcademyLessonNotePdf(ports, {
        courseId: course.id,
        userId: ADMIN,
        email: ADMIN_EMAIL,
      });
      expect(all.filename).toBe("mufredat-notu-python-temel.pdf");
      expect(Buffer.from(all.bytes).toString("latin1").startsWith("%PDF-1.4")).toBe(true);
    } finally {
      if (prevEmail == null) {
        delete process.env.CANONICAL_SUPER_ADMIN_EMAIL;
      } else {
        process.env.CANONICAL_SUPER_ADMIN_EMAIL = prevEmail;
      }
    }
  });
});
