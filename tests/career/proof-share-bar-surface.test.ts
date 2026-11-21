// @vitest-environment happy-dom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CANONICAL_SITE_ORIGIN } from "@/lib/copy/seo";
import { CAREER_SEN } from "@/lib/copy/sen-voice/career";
import {
  absoluteProofCardUrl,
  linkedInProofShareUrl,
  proofShareText,
  whatsAppProofShareUrl,
} from "@/lib/career/proof-share";
import { publicTalentPath } from "@/lib/career/public-talent";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const HASH = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

/**
 * Faz 2 / P4 — viral büyüme döngüsü.
 *
 * Tespit P4/18: her YetkinCV/Akademi mührü `/vize/[id]` adresinde herkese açık
 * bir kanıt kartı üretiyordu ama kartın üzerinde tek tıkla paylaşım yoktu.
 * Bu testler üç aksiyonu (kopyala, LinkedIn, WhatsApp) ve kimlik sızdırmama
 * kuralını kilitler.
 */
describe("Faz 2 paylaşım — bağlantı üretimi", () => {
  it("göreli kart yolu mutlak adrese çevrilir; mutlak adres aynen döner", () => {
    expect(absoluteProofCardUrl(`/vize/${HASH}`)).toBe(`${CANONICAL_SITE_ORIGIN}/vize/${HASH}`);
    expect(absoluteProofCardUrl(`vize/${HASH}`)).toBe(`${CANONICAL_SITE_ORIGIN}/vize/${HASH}`);
    expect(absoluteProofCardUrl("https://example.test/vize/x")).toBe("https://example.test/vize/x");
    expect(absoluteProofCardUrl(`/vize/${HASH}`, "https://staging.test/")).toBe(
      `https://staging.test/vize/${HASH}`,
    );
  });

  it("LinkedIn share-offsite mutlak adresi kodlar", () => {
    const cardUrl = `${CANONICAL_SITE_ORIGIN}/vize/${HASH}`;
    const href = linkedInProofShareUrl(cardUrl);
    expect(href.startsWith("https://www.linkedin.com/sharing/share-offsite/?url=")).toBe(true);
    expect(href).toContain(encodeURIComponent(cardUrl));
    // Yol kodlanmamış hâlde basılmaz (çift parametre riski).
    expect(href.split("url=")).toHaveLength(2);
  });

  it("WhatsApp tek text parametresinde metin + adres taşır", () => {
    const cardUrl = `${CANONICAL_SITE_ORIGIN}/vize/${HASH}`;
    const href = whatsAppProofShareUrl(cardUrl, "Mühür");
    expect(href.startsWith("https://wa.me/?text=")).toBe(true);
    const decoded = decodeURIComponent(href.split("text=")[1] ?? "");
    expect(decoded).toContain("Mühür");
    expect(decoded).toContain(cardUrl);

    // Boş metin: yalnız adres, çift boşluk yok.
    const bare = whatsAppProofShareUrl(cardUrl, "  ");
    expect(decodeURIComponent(bare.split("text=")[1] ?? "")).toBe(cardUrl);
  });

  it("paylaşım metni başlığı taşır, kimlik taşımaz", () => {
    expect(proofShareText("")).toBe(CAREER_SEN.publicPage.shareText);
    expect(proofShareText("  ")).toBe(CAREER_SEN.publicPage.shareText);
    const named = proofShareText("Ofis Yapay Zekâ");
    expect(named).toContain("Ofis Yapay Zekâ");
    expect(named).toBe(CAREER_SEN.publicPage.shareTextNamed("Ofis Yapay Zekâ"));
    for (const text of [named, CAREER_SEN.publicPage.shareText]) {
      expect(text.toLowerCase()).not.toContain("e-posta");
      expect(text.toLowerCase()).not.toContain("email");
      expect(text).not.toMatch(/\buser_|[0-9a-f]{64}\b/i);
    }
  });
});

describe("Faz 2 paylaşım — çubuk bileşeni", () => {
  (
    globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  let root: Root | null = null;
  let host: HTMLDivElement | null = null;

  beforeEach(() => {
    vi.resetModules();
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

  it("üç aksiyonu basar: kopyala, LinkedIn, WhatsApp", async () => {
    const { ProofShareBar } = await import("@/components/career/proof-share-bar");
    await act(async () => {
      root?.render(
        createElement(ProofShareBar, { path: `/vize/${HASH}`, title: "Ofis Yapay Zekâ" }),
      );
    });

    const bar = document.querySelector("[data-proof-share-bar]");
    expect(bar).not.toBeNull();
    expect(bar?.getAttribute("aria-label")).toBe(CAREER_SEN.publicPage.shareBarTitle);
    expect(document.body.textContent).toContain(CAREER_SEN.publicPage.shareBarTitle);
    expect(document.body.textContent).toContain(CAREER_SEN.publicPage.shareCopyLink);
    expect(document.body.textContent).toContain(CAREER_SEN.publicPage.shareLinkedIn);
    expect(document.body.textContent).toContain(CAREER_SEN.publicPage.shareWhatsApp);

    const anchors = [...document.querySelectorAll("a")];
    const linkedIn = anchors.find((a) => a.href.includes("linkedin.com/sharing/share-offsite"));
    const whatsApp = anchors.find((a) => a.href.includes("wa.me"));
    expect(linkedIn?.getAttribute("href")).toContain(encodeURIComponent(`/vize/${HASH}`));
    expect(linkedIn?.getAttribute("target")).toBe("_blank");
    expect(linkedIn?.getAttribute("rel")).toBe("noopener noreferrer");
    expect(whatsApp?.getAttribute("target")).toBe("_blank");
    expect(whatsApp?.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("kopyalama görsel onay geri bildirimi verir ve canlı bölgeye yazar", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    const { ProofShareBar } = await import("@/components/career/proof-share-bar");
    await act(async () => {
      root?.render(createElement(ProofShareBar, { path: `/vize/${HASH}`, title: "Mühür" }));
    });

    const copyButton = [...document.querySelectorAll("button")].find((button) =>
      (button.textContent ?? "").includes(CAREER_SEN.publicPage.shareCopyLink),
    );
    expect(copyButton).toBeDefined();

    await act(async () => {
      copyButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await Promise.resolve();
    });

    expect(writeText).toHaveBeenCalledWith(absoluteProofCardUrl(`/vize/${HASH}`));
    expect(document.body.textContent).toContain(CAREER_SEN.publicPage.shareCopied);
    const live = document.querySelector('[role="status"][aria-live="polite"]');
    expect(live?.textContent).toBe(CAREER_SEN.publicPage.shareCopied);
  });
});

describe("Faz 2 paylaşım — kamu kartına bağlama", () => {
  it("/vize/[id] üç kart tipinde de paylaşım çubuğu basar", () => {
    const page = readSrc("app/(public)/vize/[id]/page.tsx");
    expect(page).toContain("ProofShareBar");
    expect(page).toContain("YetkinCvCard");
    // YetkinCV kartı: kanonik verify yolu kullanılır.
    expect(page).toContain("path={seal.verifyPath}");

    const board = readSrc("components/career/public-talent-board.tsx");
    expect(board).toContain("ProofShareBar");
    expect(board).toContain("publicTalentPath(card.featured.id)");
    // Mevcut hızlı paylaşım şeridi korunur (WhatsApp + X).
    expect(board).toContain("SealShareQuickBar");
  });

  it("paylaşım yolu kamu kanoniğidir; oturum istemez", () => {
    const page = readSrc("app/(public)/vize/[id]/page.tsx");
    expect(page).not.toContain("requirePageSession");
    expect(publicTalentPath("stamp_public_1")).toBe("/vize/stamp_public_1");
    // Çubuk istemci bileşenidir; sunucu verisi gerektirmez.
    expect(readSrc("components/career/proof-share-bar.tsx")).toContain('"use client"');
  });
});
