import { describe, expect, it } from "vitest";
import { EMPTY_DASHBOARD_PULSE } from "@/lib/dashboard/pulse";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { MARKETPLACE_SPLIT_LIVE } from "@/lib/kernel/payments/marketplace-split-live";
import {
  academyContinueHref,
  orderFeaturedRooms,
  resolveNextBestAction,
} from "@/lib/dashboard/next-best-action";

describe("resolveNextBestAction", () => {
  it("PayTR Split ürün yüzeyi gün 0 kapalıdır", () => {
    expect(MARKETPLACE_SPLIT_LIVE).toBe(false);
  });

  it("boş nabızda varsayılan akademi eylemini seçer", () => {
    const action = resolveNextBestAction(EMPTY_DASHBOARD_PULSE);
    expect(action).toEqual({ kind: "default", href: "/academy", room: "academy" });
  });

  it("split kapalıyken fonlanmış işi Akademi'nin önüne koymaz", () => {
    const action = resolveNextBestAction({
      ...EMPTY_DASHBOARD_PULSE,
      freelancer: {
        ...EMPTY_DASHBOARD_PULSE.freelancer,
        live: true,
        fundedAsFreelancer: 1,
        pendingEscrowMinor: toAmountMinor(50_000),
      },
      career: {
        ...EMPTY_DASHBOARD_PULSE.career,
        live: true,
        visaCount: 2,
      },
    });
    expect(action.kind).toBe("career_visa");
    expect(action.href).toBe("/career");
  });

  it("split kapalıyken açık ilanı freelancer NBA yapmaz", () => {
    const action = resolveNextBestAction({
      ...EMPTY_DASHBOARD_PULSE,
      freelancer: {
        ...EMPTY_DASHBOARD_PULSE.freelancer,
        live: true,
        openJobsPosted: 2,
      },
    });
    expect(action.kind).toBe("default");
    expect(action.room).toBe("academy");
    expect(action.href).toBe("/academy");
  });

  it("aktif vizeyi kariyer eylemine yükseltir", () => {
    const action = resolveNextBestAction({
      ...EMPTY_DASHBOARD_PULSE,
      career: {
        ...EMPTY_DASHBOARD_PULSE.career,
        live: true,
        visaCount: 1,
        lastVisaTitle: "PayTR Split",
      },
    });
    expect(action).toEqual({ kind: "career_visa", href: "/career", room: "career" });
  });

  it("satın alınmış akademi yolunu vizeden önce devam eylemine bağlar", () => {
    const action = resolveNextBestAction({
      ...EMPTY_DASHBOARD_PULSE,
      academy: {
        ...EMPTY_DASHBOARD_PULSE.academy,
        live: true,
        purchasesCount: 1,
      },
      career: {
        ...EMPTY_DASHBOARD_PULSE.career,
        live: true,
        visaCount: 1,
      },
    });
    expect(action.kind).toBe("academy_continue");
    expect(action.href).toBe("/academy");
  });

  it("yarım kalan kursu ders oynatıcısına derin bağlar; slug yoksa katalog kalır", () => {
    expect(academyContinueHref(null)).toBe("/academy");
    expect(academyContinueHref("01_office_ai")).toBe("/academy/01_office_ai/oyna");
    expect(academyContinueHref("../evil")).toBe("/academy");

    const resume = resolveNextBestAction({
      ...EMPTY_DASHBOARD_PULSE,
      academy: {
        ...EMPTY_DASHBOARD_PULSE.academy,
        live: true,
        purchasesCount: 1,
        lastCourseSlug: "01_office_ai",
        nextLessonKey: "01_office_ai-3",
      },
    });
    expect(resume).toEqual({
      kind: "academy_continue",
      href: "/academy/01_office_ai/oyna",
      room: "academy",
    });

    const catalogOnly = resolveNextBestAction({
      ...EMPTY_DASHBOARD_PULSE,
      academy: {
        ...EMPTY_DASHBOARD_PULSE.academy,
        live: true,
        purchasesCount: 2,
        lastCourseSlug: null,
        nextLessonKey: null,
      },
    });
    expect(catalogOnly.kind).toBe("academy_continue");
    expect(catalogOnly.href).toBe("/academy");
  });

  it("birincil odayı featured sırasının başına alır", () => {
    expect(orderFeaturedRooms("career")).toEqual(["career", "academy", "freelancer"]);
    expect(orderFeaturedRooms("freelancer")).toEqual(["freelancer", "academy", "career"]);
  });
});
