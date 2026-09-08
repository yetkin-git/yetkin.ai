import { describe, expect, it } from "vitest";
import { ForbiddenError } from "@/lib/kernel/http/errors";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import { lockAcademyCoursePrice, purchaseAcademyCourse } from "@/lib/academy/engine";
import { completeAcademyLesson } from "@/lib/academy/curriculum-engine";
import { loadAcademyLessonNotePdf } from "@/archived/lib/academy-studio/lesson-note-engine";
import {
  buildAcademyLessonNote,
  plainAcademyLessonSections,
  type AcademyLessonNote,
} from "@/archived/lib/academy-studio/lesson-note";
import {
  academyPdfEncodesTurkishSample,
  renderAcademyLessonNotesPdf,
} from "@/archived/lib/academy-studio/lesson-note-pdf";
import {
  academyCurriculumSealForSlug,
  academyLessonByKey,
  curriculumForCourseSlug,
} from "@/lib/academy/curriculum";
import { attachAcademyLessonActHeading } from "@/lib/academy/lesson-body";
import { createMemoryLedgerStore } from "../helpers/memory-money";
import { createMemoryAcademyStore, memoryCourse } from "../helpers/memory-academy";
import {
  createMemoryCheckoutPriceLockStore,
  createMemoryPriceCatalogStore,
} from "../helpers/memory-pricing";

const BUYER = "pdf-buyer";
const OTHER = "pdf-other";
const PLATFORM = PLATFORM_TREASURY_USER_ID;

const SYNTHETIC_FIVE_ACT_BODY = [
  attachAcademyLessonActHeading("warmup", "Bu derste tutarı kuruş cinsinden sabitleyeceğiz."),
  attachAcademyLessonActHeading("problem", "Öğrenci yanlış birimi seçerse mühür bozulur."),
  attachAcademyLessonActHeading("development", "Parametre kilidi tek yazıcıdan geçer."),
  attachAcademyLessonActHeading("conclusion", "Özet: tutar sabittir."),
  attachAcademyLessonActHeading("assessment", "Kanıtı gönder."),
  "```alistirma\nTutarı sabitle.\n```",
].join("\n\n");

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

describe("mühürlü PDF ders notu — boş müfredat", () => {
  it("Noto Sans Unicode ile Türkçe glifleri kayıpsız kodlar", () => {
    expect(academyPdfEncodesTurkishSample()).toBe(true);
  });

  it("sentetik beş perde gövdesi görsel etiketsiz bölüm basar; müfredat tohumu boştur", () => {
    expect(curriculumForCourseSlug("sample-course")).toEqual([]);
    expect(academyLessonByKey("sample-course", "sample-course-1")).toBeNull();
    expect(academyCurriculumSealForSlug("sample-course")).toBeNull();
    expect(
      buildAcademyLessonNote({
        courseSlug: "sample-course",
        courseTitle: "Örnek Kurs",
        lessonKey: "sample-course-1",
        proofOfWorkHash: "a".repeat(64),
        curriculumSeal: null,
      }),
    ).toBeNull();

    const sections = plainAcademyLessonSections(SYNTHETIC_FIVE_ACT_BODY);
    expect(sections.map((row) => row.act)).toEqual([
      "warmup",
      "problem",
      "development",
      "conclusion",
      "assessment",
    ]);
    expect(sections.some((row) => row.prose.includes("Teknik şema"))).toBe(false);
    expect(sections.some((row) => row.prose.includes("Mikro-video"))).toBe(false);

    const note: AcademyLessonNote = {
      courseTitle: "Örnek Kurs",
      courseSlug: "sample-course",
      lessonKey: "sample-course-1",
      lessonTitle: "Örnek Ders",
      instructorName: "Erinome",
      level: "Temel",
      sections,
      practice: {
        kind: "param-lock",
        brief: "Tutarı sabitle.",
        params: [{ label: "tutar", value: "kuruş" }],
        example: "tutar=100",
      },
      curriculumSeal: null,
      proofOfWorkHash: "b".repeat(64),
    };
    const pdf = renderAcademyLessonNotesPdf([note]);
    const text = Buffer.from(pdf).toString("latin1");
    expect(text.startsWith("%PDF-1.4")).toBe(true);
    expect(text).toContain("%%EOF");
    expect(text).toContain("/Subtype /Type0");
    expect(text).toContain("/Encoding /Identity-H");
    expect(text).toContain("/FontFile2");
    expect(text).toMatch(/<011[Ff]>/);
    expect(text).toMatch(/<0130>/);
    expect(text).toMatch(/<015[Ff]>/);
    expect(pdf.byteLength).toBeGreaterThan(50_000);
  });

  it("satın alma sonrası boş müfredatta ders tamamlama ve PDF fail-closed kapanır", async () => {
    const ctx = world();
    await settle(ctx);
    expect(curriculumForCourseSlug(ctx.course.slug)).toEqual([]);

    await expect(
      loadAcademyLessonNotePdf(ctx.ports, {
        courseId: ctx.course.id,
        userId: BUYER,
        lessonKey: "sample-course-1",
      }),
    ).rejects.toThrow();

    await expect(
      completeAcademyLesson(ctx.ports, {
        courseId: ctx.course.id,
        userId: BUYER,
        lessonKey: "sample-course-1",
      }),
    ).rejects.toThrow(/Müfredat tohumu yok|Ders müfredatta yok/);

    await expect(
      loadAcademyLessonNotePdf(ctx.ports, {
        courseId: ctx.course.id,
        userId: OTHER,
        lessonKey: "sample-course-1",
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("Super Admin lab da boş müfredatta PDF basamaz; vatandaş kapalı kalır", async () => {
    const ADMIN = "11111111-1111-4111-8111-111111111111";
    const ADMIN_EMAIL = "admin@yetkin.test";
    const prevEmail = process.env.CANONICAL_SUPER_ADMIN_EMAIL;
    process.env.CANONICAL_SUPER_ADMIN_EMAIL = ADMIN_EMAIL;
    try {
      const course = memoryCourse();
      const ports = {
        academy: createMemoryAcademyStore(),
      };
      await ports.academy.insertCourse(course);

      await expect(
        loadAcademyLessonNotePdf(ports, {
          courseId: course.id,
          userId: BUYER,
          lessonKey: "sample-course-1",
        }),
      ).rejects.toBeInstanceOf(ForbiddenError);

      await expect(
        loadAcademyLessonNotePdf(ports, {
          courseId: course.id,
          userId: ADMIN,
          email: ADMIN_EMAIL,
          lessonKey: "sample-course-1",
        }),
      ).rejects.toThrow(/Müfredat tohumu yok|Ders müfredatta yok|Eğitmen/);
    } finally {
      if (prevEmail == null) {
        delete process.env.CANONICAL_SUPER_ADMIN_EMAIL;
      } else {
        process.env.CANONICAL_SUPER_ADMIN_EMAIL = prevEmail;
      }
    }
  });
});
