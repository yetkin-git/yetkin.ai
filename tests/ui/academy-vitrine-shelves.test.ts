// @vitest-environment happy-dom
import { act, createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CourseList } from "@/components/academy/course-list";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import type { AcademyCourseWithPrice } from "@/lib/academy/types";

vi.mock("next/link", () => {
  const React = require("react") as typeof import("react");
  return {
    default: (props: { href: string; children?: ReactNode; className?: string }) =>
      React.createElement("a", { href: props.href, className: props.className }, props.children),
  };
});

vi.mock("next/image", () => {
  const React = require("react") as typeof import("react");
  return {
    default: (props: { alt?: string; src?: string }) =>
      React.createElement("img", { alt: props.alt ?? "", src: props.src ?? "" }),
  };
});

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

function render(node: ReactNode) {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  act(() => {
    root.render(node);
  });
  return { root, host };
}

describe("Akademi vitrin rafları — tek kahraman stratejisi", () => {
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

  it("vitrin tek kahraman kartı basar; ileri modüller ana akışta kart olarak durmaz", async () => {
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

    // Kahraman kart tam olarak bir tane ve doğru SKU.
    const flagshipCards = document.querySelectorAll("[data-academy-flagship-card]");
    expect(flagshipCards).toHaveLength(1);
    expect(flagshipCards[0]?.getAttribute("data-academy-catalog-series")).toBe("01_office_ai");

    // Vitrin modu: tek karar noktası.
    expect(
      document.querySelector("[data-academy-vitrine-single-hero]"),
    ).not.toBeNull();
    expect(
      document.querySelector("[data-academy-pilot-room]")?.getAttribute("data-academy-vitrine-mode"),
    ).toBe("hero");

    // İleri modüller ana akışta KART olarak basılmaz — yalnız kapı durur.
    expect(document.querySelectorAll("[data-academy-advanced-module]")).toHaveLength(0);
    const door = document.querySelector("[data-academy-advanced-door]");
    expect(door).not.toBeNull();
    // Kapı düğmesi ikincil rafa gider; kartlar silinmez.
    expect(door?.textContent).toContain(ACADEMY_SEN.catalog.advancedDoorCta(2));
    const doorHref = door?.querySelector("a")?.getAttribute("href");
    expect(doorHref).toBe("/academy/ileri");

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
  });
});
