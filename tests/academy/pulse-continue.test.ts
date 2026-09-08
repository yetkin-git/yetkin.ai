import { describe, expect, it } from "vitest";
import {
  academyPulseContinueFields,
  pickLastIncompleteAcademyPurchase,
} from "@/lib/academy/pulse-continue";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import {
  createMemoryAcademyStore,
  memoryCourse,
} from "../helpers/memory-academy";

const USER = "pulse-continue-user";
const NOW = new Date("2026-08-14T00:00:00.000Z");

describe("akademi nabzı kaldığın ders", () => {
  it("sertifikasız son satın almayı seçer; sertifikalıyı atlar", () => {
    const older = { id: "p-old", settledAt: new Date("2026-08-01T00:00:00.000Z") };
    const newer = { id: "p-new", settledAt: new Date("2026-08-14T00:00:00.000Z") };
    expect(pickLastIncompleteAcademyPurchase([older, newer], new Set(["p-new"]))?.id).toBe("p-old");
    expect(pickLastIncompleteAcademyPurchase([older, newer], new Set(["p-old", "p-new"]))).toBeNull();
  });

  it("slug ve tamamlanan derslerden sıradaki anahtarı üretir", () => {
    expect(
      academyPulseContinueFields({
        courseSlug: "01_office_ai",
        completedLessonKeys: ["01_office_ai-1", "01_office_ai-2"],
      }),
    ).toEqual({
      lastCourseSlug: "01_office_ai",
      nextLessonKey: "01_office_ai-3",
    });
    expect(
      academyPulseContinueFields({
        courseSlug: "01_office_ai",
        completedLessonKeys: [
          "01_office_ai-1",
          "01_office_ai-2",
          "01_office_ai-3",
          "01_office_ai-4",
          "01_office_ai-5",
          "01_office_ai-6",
        ],
      }),
    ).toEqual({
      lastCourseSlug: "01_office_ai",
      nextLessonKey: null,
    });
    expect(academyPulseContinueFields({ courseSlug: "  ", completedLessonKeys: [] })).toEqual({
      lastCourseSlug: null,
      nextLessonKey: null,
    });
  });

  it("bellek store nabzı yarım kurs slug ve nextLessonKey basar", async () => {
    const academy = createMemoryAcademyStore();
    const course = memoryCourse({
      id: "ac_01_office_ai",
      slug: "01_office_ai",
      catalogUnitKey: "course:01_office_ai",
    });
    await academy.insertCourse(course);
    await academy.insertPurchase({
      id: "purchase-1",
      userId: USER,
      courseId: course.id,
      priceLockId: "lock-1",
      amountMinor: toAmountMinor(89_000),
      currencyCode: SETTLEMENT_CURRENCY,
      status: "SETTLED",
      settledAt: NOW,
      createdAt: NOW,
      updatedAt: NOW,
    });
    await academy.insertLessonCompletion({
      id: "done-1",
      userId: USER,
      courseId: course.id,
      purchaseId: "purchase-1",
      lessonKey: "01_office_ai-1",
      proofOfWorkHash: null,
      completedAt: NOW,
      createdAt: NOW,
    });

    const pulse = await academy.pulseForUser(USER);
    expect(pulse.purchasesCount).toBe(1);
    expect(pulse.certificatesHeld).toBe(0);
    expect(pulse.lastCourseSlug).toBe("01_office_ai");
    expect(pulse.nextLessonKey).toBe("01_office_ai-2");
  });
});
