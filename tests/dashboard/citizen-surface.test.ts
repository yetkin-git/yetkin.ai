import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { WALLET_SURFACE_PATH } from "@/lib/kernel/identity/types";
import { VERTICAL_ROOMS } from "@/lib/kernel/modules";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const SIZ_LEAKS = [
  "Bakiyeniz",
  "hesabınız",
  "işleriniz",
  "üretimleriniz",
  "kullanabilirsiniz",
];

const SEN_SURFACES = [
  "app/dashboard/page.tsx",
  "lib/copy/sen-voice/dashboard.ts",
];

describe("Dashboard vatandaş yüzeyi ve SEN aksı", () => {
  it("/dashboard siz kaçakları taşımaz; SEN_VOICE bağlar", () => {
    expect(SEN_VOICE.dashboard.title).toBe("Hoş Geldin");
    expect(SEN_VOICE.dashboard.overviewTitle).toBe("Genel Bakış");
    expect(SEN_VOICE.dashboard.description).toBe(
      "Eğitimlerin, kanıtlanmış uzmanlıkların ve çalışma süreçlerin tek bir güvenli panelde.",
    );
    expect(SEN_VOICE.dashboard.description).toContain("Eğitimlerin");
    expect(SEN_VOICE.dashboard.description).toContain("güvenli panelde");
    expect(SEN_VOICE.dashboard.description).not.toContain("yönetilir");
    expect(SEN_VOICE.dashboard.description).not.toContain("split");
    expect(SEN_VOICE.dashboard.featured).toContain("Kariyer yolculuğuna");
    expect(SEN_VOICE.dashboard.featured).toContain("Akademi'den");
    expect(SEN_VOICE.dashboard.featured).toContain("Kariyer odasından");
    expect(SEN_VOICE.dashboard.featured).not.toContain("Öğren, sınav ol");
    expect(SEN_VOICE.dashboard.featured).not.toContain("mühürlen, vize al");
    expect(SEN_VOICE.dashboard.featured).not.toContain("kokpit");
    expect(SEN_VOICE.dashboard.featured).not.toContain("sicilde");
    expect(SEN_VOICE.dashboard.featured).not.toContain("Çalışan odalar");
    expect(SEN_VOICE.dashboard.walletStrip.body).toContain("Bakiye Akademi tahsilatı içindir");
    expect(SEN_VOICE.dashboard.walletStrip.body).toContain("accept 503");
    expect(SEN_VOICE.dashboard.walletStrip.body).not.toContain("Bakiyeniz");
    expect(SEN_VOICE.dashboard.walletStrip).not.toHaveProperty("modalTitle");
    expect(SEN_VOICE.dashboard.walletStrip).not.toHaveProperty("emptyLedger");
    expect(SEN_VOICE.dashboard.walletStrip).not.toHaveProperty("close");
    expect(SEN_VOICE.dashboard.description).not.toContain("Bakiyeniz");
    expect(SEN_VOICE.dashboard.title).not.toContain("Kaldığın yer");
    expect(SEN_VOICE.dashboard.description).not.toContain("Kaldığın yer");
    expect(SEN_VOICE.dashboard).not.toHaveProperty("featuredActions");

    for (const file of SEN_SURFACES) {
      const source = readSrc(file);
      for (const leak of SIZ_LEAKS) {
        expect(source, `${file} → ${leak}`).not.toContain(leak);
      }
    }
    expect(readSrc("app/dashboard/page.tsx")).toContain("SEN_VOICE");
    expect(readSrc("app/dashboard/page.tsx")).toContain("welcomeTitle");
    expect(readSrc("app/dashboard/page.tsx")).toContain("getSession");
    expect(readSrc("app/dashboard/page.tsx")).toContain("loadIdentityBoard");
    expect(readSrc("app/dashboard/page.tsx")).toContain("NextBestActionCard");
    expect(readSrc("app/dashboard/page.tsx")).not.toContain("Kaldığın yer");
    expect(readSrc("app/dashboard/page.tsx")).not.toContain("copy.description");
    expect(readSrc("components/dashboard/next-best-action-card.tsx")).toContain("text-pretty");
    expect(readSrc("components/ui/page-header.tsx")).toContain("text-pretty");
    expect(existsSync(join(ROOT, "components/dashboard/wallet-room-modal.tsx"))).toBe(false);
    expect(readSrc("app/globals.css")).not.toContain("wallet-modal-overlay");
    expect(readSrc("app/dashboard/page.tsx")).not.toContain("DASHBOARD_WALLET_MODAL");
    expect(readSrc("app/dashboard/page.tsx")).not.toContain("searchParams");
    expect(readSrc("lib/dashboard/wallet-strip.ts")).not.toContain("/dashboard?modal=wallet");
    expect(readSrc("lib/dashboard/wallet-strip.ts")).not.toContain("DASHBOARD_WALLET_MODAL");
  });

  it("karşılama oturuma göre kişiselleşir; isimsiz oturumda Hoş Geldin kalır", () => {
    expect(SEN_VOICE.dashboard.welcomeTitle({ signedIn: false })).toBe("Genel Bakış");
    expect(SEN_VOICE.dashboard.welcomeTitle({ signedIn: true, displayName: null })).toBe(
      "Hoş Geldin",
    );
    expect(SEN_VOICE.dashboard.welcomeTitle({ signedIn: true, displayName: "  " })).toBe(
      "Hoş Geldin",
    );
    expect(
      SEN_VOICE.dashboard.welcomeTitle({ signedIn: true, displayName: "Ayşe Kaya" }),
    ).toBe("Hoş Geldin, Ayşe");
    expect(SEN_VOICE.dashboard.welcomeTitle({ signedIn: true, displayName: "Ayşe" })).toBe(
      "Hoş Geldin, Ayşe",
    );
    expect(
      SEN_VOICE.dashboard.welcomeTitle({ signedIn: true, displayName: "vatandas@yetkin.rail" }),
    ).toBe("Hoş Geldin");
  });

  it("bakiye yalnız chrome chip’tedir; kokpit gövdesinde para bandı yoktur", () => {
    const chip = readSrc("components/shell/header-wallet-chip.tsx");
    const page = readSrc("app/dashboard/page.tsx");
    expect(WALLET_SURFACE_PATH).toBe("/cuzdan");
    expect(SEN_VOICE.dashboard.walletStrip.openCta).toBe("Cüzdanı aç");
    expect(SEN_VOICE.dashboard.walletStrip.escrowLabel).toBe("Kilitli emanet");
    expect(chip).toContain("WALLET_SURFACE_PATH");
    expect(chip).toContain("tabular-nums");
    expect(page).not.toContain("WalletBalanceStrip");
    expect(page).not.toContain("pendingEscrowMinor");
    expect(page).not.toContain('href="/cuzdan"');
    expect(existsSync(join(ROOT, "components/dashboard/wallet-balance-strip.tsx"))).toBe(false);
  });

  it("asistan FAB kabukta sağ altta durur; kokpit ve kamu/auth sessiz", () => {
    expect(readSrc("components/shell/app-shell-switch.tsx")).toContain("AiChatWidget");
    expect(readSrc("app/dashboard/page.tsx")).not.toContain("AiChatWidget");
    expect(readSrc("components/shell/app-shell.tsx")).not.toContain("AiChatWidget");
    expect(readSrc("app/(public)/layout.tsx")).not.toContain("AiChatWidget");
    expect(readSrc("app/(auth)/layout.tsx")).not.toContain("AiChatWidget");
    const widget = readSrc("components/kernel/ai-chat-widget.tsx");
    expect(widget).toContain("pointer-events-none fixed z-50");
    expect(widget).toContain("pointer-events-auto relative flex h-14");
    expect(widget).toContain("absolute bottom-[calc(100%+0.75rem)]");
    expect(widget).toContain("invisible");
  });

  it("sol menü Anasayfa açıklaması Genel Bakış'tır; kaldığın yer yoktur", () => {
    const dashboard = VERTICAL_ROOMS.find((room) => room.id === "dashboard");
    expect(dashboard?.label).toBe("Anasayfa");
    expect(dashboard?.blurb).toBe("Genel bakış");
    expect(dashboard?.blurb).not.toContain("Kaldığın yer");
    expect(readSrc("lib/kernel/modules.ts")).not.toContain("Kaldığın yer");
    expect(existsSync(join(ROOT, "app/dashboard/error.tsx"))).toBe(true);
    expect(readSrc("app/dashboard/error.tsx")).toContain("retry");
  });
});
