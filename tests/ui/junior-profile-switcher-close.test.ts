// @vitest-environment happy-dom
import { act, createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ProfileSwitcher } from "@/components/junior/profile-switcher";
import type { JuniorProfileView, JuniorXpView } from "@/lib/junior/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: (props: { href: string; children?: ReactNode; className?: string }) =>
    createElement("a", { href: props.href, className: props.className }, props.children),
}));

const PROFILE: JuniorProfileView = {
  id: "profile-ege",
  nickname: "Ege",
  grade: 6,
  birthYear: 2014,
  selected: true,
  selectedElectives: [],
  gradeSwitchRights: 0,
};

const XP: JuniorXpView = { points: 12, badges: [] };

function trigger(): HTMLButtonElement {
  const found = document.querySelector("button[aria-haspopup='dialog']");
  if (!(found instanceof HTMLButtonElement)) {
    throw new Error("Profil tetikleyicisi yok.");
  }
  return found;
}

function dialog(): HTMLElement | null {
  return document.querySelector("[role='dialog']");
}

function closeButton(): HTMLButtonElement {
  const found = dialog()?.querySelector("button[aria-label='Kapat']");
  if (!(found instanceof HTMLButtonElement)) {
    throw new Error("Kapat düğmesi yok.");
  }
  return found;
}

describe("Junior profil paneli kapatma", () => {
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

  async function mount() {
    await act(async () => {
      root?.render(
        createElement(ProfileSwitcher, {
          profiles: [PROFILE],
          xp: XP,
          ready: true,
        }),
      );
    });
  }

  async function openPanel() {
    await act(async () => {
      trigger().click();
    });
  }

  it("sağ üst kapat düğmesi paneli kapatır", async () => {
    await mount();
    expect(dialog()).toBeNull();

    await openPanel();
    const button = closeButton();
    expect(button.className).toContain("absolute");
    expect(button.className).toContain("top-4");
    expect(button.className).toContain("right-4");
    expect(button.querySelector("svg")).not.toBeNull();
    expect(dialog()?.textContent).toContain("Profil değiştir veya ekle");

    await act(async () => {
      button.click();
    });

    expect(dialog()).toBeNull();
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
  });

  it("Esc paneli kapatır", async () => {
    await mount();
    await openPanel();
    expect(dialog()).not.toBeNull();

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });

    expect(dialog()).toBeNull();
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
  });
});
