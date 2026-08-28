import { describe, expect, it } from "vitest";
import { EMPTY_DASHBOARD_PULSE } from "@/lib/dashboard/pulse";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import {
  orderFeaturedRooms,
  resolveNextBestAction,
} from "@/lib/dashboard/next-best-action";

describe("resolveNextBestAction", () => {
  it("boş nabızda varsayılan akademi eylemini seçer", () => {
    const action = resolveNextBestAction(EMPTY_DASHBOARD_PULSE);
    expect(action).toEqual({ kind: "default", href: "/academy", room: "academy" });
  });

  it("fonlanmış / kilitli emanetli işi ilk sıraya alır", () => {
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
    expect(action.kind).toBe("freelancer_work");
    expect(action.href).toBe("/freelancer");
  });

  it("açık ilanı bekleyen teklif sinyali olarak freelancer'a bağlar", () => {
    const action = resolveNextBestAction({
      ...EMPTY_DASHBOARD_PULSE,
      freelancer: {
        ...EMPTY_DASHBOARD_PULSE.freelancer,
        live: true,
        openJobsPosted: 2,
      },
    });
    expect(action.kind).toBe("freelancer_open");
    expect(action.room).toBe("freelancer");
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

  it("satın alınmış akademi yolunu devam eylemine bağlar", () => {
    const action = resolveNextBestAction({
      ...EMPTY_DASHBOARD_PULSE,
      academy: {
        ...EMPTY_DASHBOARD_PULSE.academy,
        live: true,
        purchasesCount: 1,
      },
    });
    expect(action.kind).toBe("academy_continue");
    expect(action.href).toBe("/academy");
  });

  it("birincil odayı featured sırasının başına alır", () => {
    expect(orderFeaturedRooms("career")).toEqual(["career", "academy", "freelancer"]);
    expect(orderFeaturedRooms("freelancer")).toEqual(["freelancer", "academy", "career"]);
  });
});
