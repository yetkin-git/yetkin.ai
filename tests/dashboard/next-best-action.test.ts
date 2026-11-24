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

  /**
   * B-03 (Tedavi): boş nabız artık kilitli `/hibe` odasına değil, ilk değer anına
   * (Tezgâh) iner. `/hibe` korumalı bir odadır; yeni kullanıcı orada ikinci bir
   * kayıt duvarına çarpıyordu.
   */
  it("boş nabızda ilk değer anına (Tezgâh) iner; kilitli hibe odasına değil", () => {
    const action = resolveNextBestAction(EMPTY_DASHBOARD_PULSE);
    expect(action).toEqual({ kind: "tezgah_first", href: "/tezgah", room: "academy" });
  });

  it("cüzdanı veya üretimi olan kullanıcı hibe odasına yönlenir", () => {
    // Bakiye yüklenmiş ama harcanmamış kullanıcı "yeni" sayılmaz.
    const funded = resolveNextBestAction({
      ...EMPTY_DASHBOARD_PULSE,
      wallet: {
        ...EMPTY_DASHBOARD_PULSE.wallet,
        live: true,
        amountMinor: toAmountMinor(50_000),
      },
    });
    expect(funded).toEqual({ kind: "default", href: "/panel/hibe", room: "academy" });
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
    // Freelancer yüzeyi kilitli; açık ilan "split" işine dönüşmez ve Tezgâh'ın
    // önüne geçmez. İlanı olan kullanıcı artık "yeni" değildir → hibe odası.
    expect(action.kind).toBe("default");
    expect(action.room).toBe("academy");
    expect(action.href).toBe("/panel/hibe");
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

  it("sınav sonrası damga varsa NBA Kariyer Vizesine iner; yarım ders vizeden önce kalır", () => {
    const stamped = resolveNextBestAction({
      ...EMPTY_DASHBOARD_PULSE,
      academy: {
        ...EMPTY_DASHBOARD_PULSE.academy,
        live: true,
        purchasesCount: 1,
        certificatesHeld: 1,
      },
      career: {
        ...EMPTY_DASHBOARD_PULSE.career,
        live: true,
        visaCount: 1,
      },
    });
    expect(stamped).toEqual({ kind: "career_visa", href: "/career", room: "career" });

    const incomplete = resolveNextBestAction({
      ...EMPTY_DASHBOARD_PULSE,
      academy: {
        ...EMPTY_DASHBOARD_PULSE.academy,
        live: true,
        purchasesCount: 1,
        lastCourseSlug: "01_office_ai",
        nextLessonKey: "01_office_ai-3",
      },
      career: {
        ...EMPTY_DASHBOARD_PULSE.career,
        live: true,
        visaCount: 1,
      },
    });
    expect(incomplete).toEqual({
      kind: "academy_continue",
      href: "/tezgah",
      room: "academy",
    });
  });

  it("yarım kalan kursu ders oynatıcısına derin bağlar; slug yoksa katalog kalır", () => {
    expect(academyContinueHref(null)).toBe("/tezgah");
    expect(academyContinueHref("01_office_ai")).toBe("/tezgah");
    expect(academyContinueHref("../evil")).toBe("/tezgah");

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
      href: "/tezgah",
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
    expect(catalogOnly.href).toBe("/tezgah");
  });

  it("birincil odayı featured sırasının başına alır", () => {
    expect(orderFeaturedRooms("career")).toEqual(["career", "academy"]);
    expect(orderFeaturedRooms("freelancer")).toEqual(["academy", "career"]);
  });
});
