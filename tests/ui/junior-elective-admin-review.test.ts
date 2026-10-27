// @vitest-environment happy-dom
import { act, createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ElectiveGrid } from "@/components/junior/elective-grid";
import { JuniorRoom } from "@/components/junior/junior-room";
import { JUNIOR_ELECTIVE_INTRO_LABEL, JUNIOR_QUIZ_PREPARING_LABEL } from "@/lib/junior/limits";
import type { JuniorCourseShelf, JuniorLessonCard, JuniorProfileView } from "@/lib/junior/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: (props: { href: string; children?: ReactNode; className?: string }) =>
    createElement("a", { href: props.href, className: props.className }, props.children),
}));

const CHILD: JuniorProfileView = {
  id: "profile-ege",
  nickname: "Ege",
  grade: 6,
  birthYear: 2014,
  selected: true,
  selectedElectives: [],
  gradeSwitchRights: 0,
};

function lesson(overrides: Partial<JuniorLessonCard> & Pick<JuniorLessonCard, "key" | "access" | "status">): JuniorLessonCard {
  return {
    title: "Konu",
    teaser: "Kısa bir giriş cümlesi.",
    thisWeek: false,
    ...overrides,
  };
}

function course(
  slug: string,
  subject: string,
  card: JuniorLessonCard,
): JuniorCourseShelf {
  return {
    slug,
    title: subject,
    subject,
    grade: 6,
    track: "elective",
    labels: [],
    lessons: [card],
  };
}

const PREPARING = course(
  "jr_06_ing",
  "İngilizce",
  lesson({
    key: "jr_06_ing-1",
    title: "Selamlaşma",
    access: "locked",
    status: "preparing",
  }),
);

const LOCKED = course(
  "jr_06_kod",
  "Bilgisayar Bilimi",
  lesson({
    key: "jr_06_kod-1",
    title: "İlk adım",
    access: "locked",
    status: "fresh",
  }),
);

const OPEN = course(
  "jr_06_alm",
  "Almanca",
  lesson({
    key: "jr_06_alm-1",
    title: "Merhaba",
    access: "free",
    status: "fresh",
  }),
);

const CARDS = [PREPARING, LOCKED, OPEN];

function adminLinks(): HTMLAnchorElement[] {
  return [...document.querySelectorAll("a")].filter(
    (node): node is HTMLAnchorElement =>
      node instanceof HTMLAnchorElement && node.textContent?.trim() === "Admin İncele",
  );
}

describe("Seçmeli kart Admin İncele", () => {
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

  async function mountGrid(audit?: boolean) {
    await act(async () => {
      root?.render(createElement(ElectiveGrid, { courses: CARDS, ...(audit === undefined ? {} : { audit }) }));
    });
  }

  it("denetim kapalıyken kilitli ve taslak kartta düğme yoktur", async () => {
    await mountGrid(false);
    expect(document.body.textContent).toContain(JUNIOR_QUIZ_PREPARING_LABEL);
    expect(document.body.textContent).toContain("Kilitli");
    expect(adminLinks()).toEqual([]);
    expect(document.body.textContent).not.toContain("Admin İncele");
    const hrefs = [...document.querySelectorAll("a")].map((node) => node.getAttribute("href"));
    expect(hrefs).toEqual(["/junior/ders/jr_06_alm-1"]);
    expect(document.body.textContent).toContain("Ücretsiz Başla");
    expect(document.body.textContent).toContain(JUNIOR_ELECTIVE_INTRO_LABEL);
    expect(document.querySelectorAll("[data-junior-elective-preview-badge]")).toHaveLength(3);
    expect(document.body.textContent).toContain("Bu kart paket vaadine girmez.");
    expect(document.querySelectorAll("[data-junior-elective-package-excluded]")).toHaveLength(1);
    expect(document.body.textContent).not.toContain("yıllık seçmeli müfredat");
  });

  it("audit prop'u verilmezse düğme basılmaz", async () => {
    await mountGrid();
    expect(adminLinks()).toEqual([]);
  });

  it("denetim açıkken yalnız kilitli ve taslak kart ders adresine gider", async () => {
    await mountGrid(true);
    const links = adminLinks();
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/junior/ders/jr_06_ing-1",
      "/junior/ders/jr_06_kod-1",
    ]);
    expect(links.every((link) => link.textContent?.trim() === "Admin İncele")).toBe(true);
    const open = [...document.querySelectorAll("a")].find((node) => node.getAttribute("href") === "/junior/ders/jr_06_alm-1");
    expect(open?.textContent?.trim()).toBe("Ücretsiz Başla");
    expect(open?.textContent).not.toContain("Admin İncele");
  });
});

describe("Junior oda seçmeli denetim düğmesi", () => {
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

  async function mountRoom(audit: boolean, profiles: JuniorProfileView[] | null) {
    await act(async () => {
      root?.render(
        createElement(JuniorRoom, {
          courses: [],
          electiveCourses: CARDS,
          loginHref: "/login?next=%2Fjunior",
          checkoutHref: "/junior/checkout",
          planActive: false,
          profiles,
          xp: profiles ? { points: 4, badges: [] } : null,
          ready: true,
          gradeSwitchRights: 0,
          selectedElectives: [],
          weeklyReport: null,
          picks: [],
          priceLabel: null,
          audit,
        }),
      );
    });
    const tab = [...document.querySelectorAll("[role='tab']")].find((node) => node.textContent === "Seçmeli Dersler");
    if (!(tab instanceof HTMLButtonElement)) {
      throw new Error("Seçmeli sekmesi yok.");
    }
    await act(async () => {
      tab.click();
    });
  }

  it("veli oturumunda seçmeli kartta Admin İncele yoktur", async () => {
    await mountRoom(false, null);
    expect(document.body.textContent).toContain("Veli girişi");
    expect(document.body.textContent).toContain("6. Sınıf İngilizce kartındadır");
    expect(document.body.textContent).not.toContain("Selamlaşma");
    expect(document.body.textContent).toContain("Kilitli");
    expect(adminLinks()).toEqual([]);
    expect(document.body.textContent).not.toContain("Denetim açık");
  });

  it("seçili çocuk profilinde Admin İncele yoktur", async () => {
    await mountRoom(false, [CHILD]);
    expect(document.body.textContent).toContain("Ege");
    expect(document.body.textContent).toContain("6. Sınıf İngilizce kartındadır");
    expect(document.body.textContent).not.toContain("Selamlaşma");
    expect(adminLinks()).toEqual([]);
    expect(document.body.textContent).not.toContain("Admin İncele");
  });

  it("denetçi oturumunda kilitli kart Admin İncele ile derse gider", async () => {
    await mountRoom(true, [CHILD]);
    expect(document.body.textContent).toContain("Denetim açık");
    expect(document.body.textContent).toContain("Ege");
    expect(adminLinks().map((link) => link.getAttribute("href"))).toEqual([
      "/junior/ders/jr_06_kod-1",
    ]);
  });
});
