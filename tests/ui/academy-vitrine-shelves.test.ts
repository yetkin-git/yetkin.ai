// @vitest-environment happy-dom
import { act, createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CourseList } from "@/components/academy/course-list";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import type { AcademyCourseWithPrice } from "@/lib/academy/types";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
    ...rest
  }: {
    href: string;
    children?: ReactNode;
    className?: string;
  }) => createElement("a", { href, className, ...rest }, children),
}));

vi.mock("next/image", () => ({
  default: (props: { alt?: string; src?: string }) =>
    createElement("img", { alt: props.alt ?? "", src: props.src ?? "" }),
}));

function course(slug: string, title: string): AcademyCourseWithPrice {
  const now = new Date("2026-10-26T12:00:00.000Z");
  return {
    id: `course-${slug}`,
    slug,
    title,
    summary: "Özet",
    catalogUnitKey: `course:${slug}`,
    globalRank: 1,
    localRank: 1,
    trendScore: 0,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
    priceMinor: toAmountMinor(89_000),
    currencyCode: SETTLEMENT_CURRENCY,
    purchasable: true,
  };
}

describe("Akademi vitrin rafları — açık katalog", () => {
  (
    globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  let root: Root | null = null;
  let host: HTMLDivElement | null = null;

  beforeEach(() => {
    host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);
  });

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    host?.remove();
    root = null;
    host = null;
  });

  it("vitrin temel kartı ve ileri modülleri aynı sayfada basar; her kart kendi eğitimine gider", async () => {
    await act(async () => {
      root?.render(
        createElement(CourseList, {
          courses: [
            course("02_ecommerce_ai", "E-Ticaret ve Pazaryeri Yapay Zekâ"),
            course("03_social_media_ai", "Sosyal Medya Yapay Zekâ"),
            course("01_office_ai", "Ofiste Yapay Zekâ"),
          ],
        }),
      );
    });

    const flagshipCards = document.querySelectorAll("[data-academy-flagship-card]");
    expect(flagshipCards).toHaveLength(1);
    expect(flagshipCards[0]?.getAttribute("data-academy-catalog-series")).toBe("01_office_ai");
    expect(
      flagshipCards[0]?.querySelector("[data-academy-catalog-hit]")?.getAttribute("href"),
    ).toBe("/academy/01_office_ai");

    expect(document.querySelector("[data-academy-vitrine-mix]")).not.toBeNull();
    expect(document.querySelector("[data-academy-advanced-door]")).toBeNull();
    expect(document.querySelector("[data-academy-vitrine-single-hero]")).toBeNull();
    expect(
      document.querySelector("[data-academy-pilot-room]")?.getAttribute("data-academy-vitrine-mode"),
    ).toBe("mix");

    const advanced = document.querySelectorAll("[data-academy-advanced-module]");
    expect(advanced).toHaveLength(2);
    expect(
      document
        .querySelector("[data-academy-catalog-series='02_ecommerce_ai'] [data-academy-catalog-hit]")
        ?.getAttribute("href"),
    ).toBe("/academy/02_ecommerce_ai");
    expect(
      document
        .querySelector("[data-academy-catalog-series='03_social_media_ai'] [data-academy-catalog-hit]")
        ?.getAttribute("href"),
    ).toBe("/academy/03_social_media_ai");
    expect(
      document
        .querySelector("[data-academy-catalog-series='02_ecommerce_ai'] [data-academy-catalog-secondary-cta]")
        ?.getAttribute("href"),
    ).toBe("/academy/02_ecommerce_ai/oyna");

    const preview = document.querySelector("[data-academy-hero-preview-cta]");
    const browse = document.querySelector("[data-academy-hero-browse-cta]");
    expect(preview?.getAttribute("href")).toBe("/academy/01_office_ai/oyna");
    expect(preview?.textContent).toContain(ACADEMY_SEN.catalog.heroPreviewCta);
    expect(browse?.getAttribute("href")).toBe("/academy");
    expect(browse?.textContent).toContain("Eğitimleri İncele");

    expect(document.body.textContent).toContain(ACADEMY_SEN.catalog.flagshipShelfTitle);
    expect(document.body.textContent).toContain(ACADEMY_SEN.catalog.advancedShelfTitle);
    expect(document.querySelector("[data-academy-coming-soon-card]")).toBeNull();
  });

  it("ileri raf kipi yalnız ileri modülleri basar; kahraman kart orada tekrarlanmaz", async () => {
    await act(async () => {
      root?.render(
        createElement(CourseList, {
          advancedOnly: true,
          courses: [
            course("02_ecommerce_ai", "E-Ticaret ve Pazaryeri Yapay Zekâ"),
            course("01_office_ai", "Ofiste Yapay Zekâ"),
          ],
        }),
      );
    });

    expect(document.querySelector("[data-academy-advanced-room]")).not.toBeNull();
    expect(
      document.querySelector("[data-academy-pilot-room]")?.getAttribute("data-academy-vitrine-mode"),
    ).toBe("advanced");
    // Kahraman kart ikincil rafta basılmaz.
    expect(document.querySelectorAll("[data-academy-flagship-card]")).toHaveLength(0);
    const advanced = document.querySelectorAll("[data-academy-advanced-module]");
    expect(advanced).toHaveLength(1);
    expect(advanced[0]?.getAttribute("data-academy-catalog-series")).toBe("02_ecommerce_ai");
    expect(
      advanced[0]?.querySelector("[data-academy-catalog-hit]")?.getAttribute("href"),
    ).toBe("/academy/02_ecommerce_ai");
  });
});
