import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { commandQuotaLane, projectCommandCenter } from "@/lib/dashboard/command-center";
import { EMPTY_DASHBOARD_PULSE } from "@/lib/dashboard/pulse";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { formatMinor } from "@/lib/kernel/money/format";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { TEZGAH_FREE_MONTHLY_CREDITS, TEZGAH_TOOLS } from "@/lib/tezgah/catalog";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const quotaDown = {
  live: false,
  remaining: 0,
  limit: TEZGAH_FREE_MONTHLY_CREDITS,
  lane: "CLOSED" as const,
};

describe("komuta merkezi projeksiyonu", () => {
  it("katalog on araçtır; üye aylık kredisi 30'dur", () => {
    expect(TEZGAH_TOOLS).toHaveLength(10);
    expect(TEZGAH_FREE_MONTHLY_CREDITS).toBe(30);
  });

  it("okunamayan odalar tire basar; boş mağaza cümlesini iddia etmez", () => {
    const [commerce, hibe, tezgah, career, kurumsal] = projectCommandCenter({
      pulse: EMPTY_DASHBOARD_PULSE,
      stores: { kind: "down" },
      quota: quotaDown,
      toolCount: TEZGAH_TOOLS.length,
    });
    const copy = SEN_VOICE.dashboard.command;

    expect(tezgah.cta).toBe("Tezgâhı Aç");
    expect(tezgah.href).toBe("/tezgah");
    expect(tezgah.stats[0]?.label).toBe("Bu ayki kredi");
    expect(tezgah.stats[0]?.value).toBe("—");
    expect(tezgah.detail).toBe("10 araç hazır");

    expect(commerce.cta).toBe("Kokpiti Aç");
    expect(commerce.href).toBe("/panel/e-ticaret");
    expect(commerce.stats[0]?.value).toBe("—");
    expect(commerce.detail).toBe(SEN_VOICE.dashboard.pulse.unavailable);
    expect(commerce.detail).not.toBe(copy.commerceNone);

    expect(hibe.href).toBe("/panel/hibe");
    expect(hibe.cta).toBe("YetkinHibe’yi aç");
    expect(hibe.stats[0]?.value).toBe("—");

    expect(career.title).toBe("Kariyer & Cüzdan");
    expect(career.cta).toBe("Kariyeri Aç");
    expect(career.href).toBe("/career");
    expect(career.stats.map((item) => item.value)).toEqual(["—", "—"]);
    expect(career.detail).toBe(SEN_VOICE.dashboard.pulse.unavailable);

    expect(kurumsal.key).toBe("kurumsal");
    expect(kurumsal.title).toBe("Kurumsal");
    expect(kurumsal.href).toBe("/kurumsal/ilanlar");
    expect(kurumsal.cta).toBe("Kurumsal’ı Aç");
  });

  it("canlı kota, boş mağaza, akademi devamı ve cüzdan bakiyesini ayırır", () => {
    const amount = toAmountMinor(1_500);
    const [commerce, hibe, tezgah, career] = projectCommandCenter({
      pulse: {
        ...EMPTY_DASHBOARD_PULSE,
        academy: {
          ...EMPTY_DASHBOARD_PULSE.academy,
          live: true,
          purchasesCount: 2,
          certificatesHeld: 1,
          lastCertificateTitle: "Ofis AI",
          lastCourseSlug: "01_office_ai",
        },
        career: {
          ...EMPTY_DASHBOARD_PULSE.career,
          live: true,
          visaCount: 1,
          lastVisaTitle: "Ofis AI rozeti",
        },
        wallet: {
          live: true,
          amountMinor: amount,
          currencyCode: SETTLEMENT_CURRENCY,
        },
      },
      stores: { kind: "ok", stores: [] },
      quota: { live: true, remaining: 2, limit: 3, lane: "FREE_DAILY" },
      toolCount: TEZGAH_TOOLS.length,
    });

    expect(tezgah.stats[0]?.label).toBe("Bu ayki kredi");
    expect(tezgah.stats[0]?.value).toBe("2/3");
    expect(`${tezgah.stats[0]?.label} (${tezgah.stats[0]?.value})`).toBe(
      "Bu ayki kredi (2/3)",
    );
    expect(tezgah.detail).toBe("10 araç hazır");

    expect(commerce.stats[0]?.value).toBe("0");
    expect(commerce.detail).toBe("Henüz mağaza açılmadı");
    expect(commerce.cta).toBe("Kokpiti Aç");
    expect(commerce.href).toBe("/panel/e-ticaret");

    expect(hibe.href).toBe("/panel/hibe");
    expect(hibe.stats[0]?.value).toBe("—");

    expect(career.stats[0]?.value).toBe("1");
    expect(career.stats[1]?.value).toBe(formatMinor(amount, SETTLEMENT_CURRENCY));
    expect(career.detail).toContain("Ofis AI rozeti");
    expect(career.detail).toContain("30 günlük plan Kariyer'de açılır");
  });

  it("açık vitrin sayılır; rozetsiz planda kur cümlesi durur", () => {
    const [commerce, , , career] = projectCommandCenter({
      pulse: {
        ...EMPTY_DASHBOARD_PULSE,
        career: { ...EMPTY_DASHBOARD_PULSE.career, live: true, visaCount: 0 },
        wallet: {
          ...EMPTY_DASHBOARD_PULSE.wallet,
          live: true,
        },
      },
      stores: {
        kind: "ok",
        stores: [
          { status: "DRAFT" },
          { status: "ACTIVE" },
        ],
      },
      quota: { live: true, remaining: 0, limit: 3, lane: "FREE_DAILY" },
      toolCount: 7,
    });

    expect(commerce.stats.map((item) => item.value)).toEqual(["2", "1"]);
    expect(commerce.detail).toBeNull();
    expect(commerce.cta).toBe("Kokpiti Aç");
    expect(career.stats[1]?.value).toBe(formatMinor(0, SETTLEMENT_CURRENCY));
    expect(career.detail).toBe("Doğrulanmış rozet yok. 30 günlük plan Kariyer'de kurulur.");

    const draftOnly = projectCommandCenter({
      pulse: EMPTY_DASHBOARD_PULSE,
      stores: { kind: "ok", stores: [{ status: "DRAFT" }] },
      quota: quotaDown,
      toolCount: 7,
    })[0];
    expect(draftOnly.stats.map((item) => item.value)).toEqual(["1", "0"]);
    expect(draftOnly.detail).toBe("Vitrin taslak");
    expect(draftOnly.cta).toBe("Kokpiti Aç");
  });

  it("kredi bakiyesini bugünkü hak diye basmaz; Pro sınırsız erişimdir", () => {
    const credit = projectCommandCenter({
      pulse: EMPTY_DASHBOARD_PULSE,
      stores: { kind: "ok", stores: [] },
      quota: { live: true, remaining: 5, limit: 5, lane: "CREDIT_PACK" },
      toolCount: TEZGAH_TOOLS.length,
    })[2];
    expect(credit.stats[0]).toEqual({ label: "Kalan üretim kredisi", value: "5" });
    expect(`${credit.stats[0]?.label} (${credit.stats[0]?.value})`).toBe(
      "Kalan üretim kredisi (5)",
    );
    expect(credit.stats[0]?.label).not.toContain("ayki kredi");

    const spent = projectCommandCenter({
      pulse: EMPTY_DASHBOARD_PULSE,
      stores: { kind: "ok", stores: [] },
      quota: { live: true, remaining: 0, limit: 3, lane: "CLOSED" },
      toolCount: TEZGAH_TOOLS.length,
    })[2];
    expect(spent.stats[0]).toEqual({ label: "Bu ayki kredi", value: "0/3" });

    const pro = projectCommandCenter({
      pulse: EMPTY_DASHBOARD_PULSE,
      stores: { kind: "ok", stores: [] },
      quota: { live: true, remaining: 3, limit: 3, lane: "PRO" },
      toolCount: TEZGAH_TOOLS.length,
    })[2];
    expect(pro.stats[0]).toEqual({ label: "Tezgâh Pro", value: "Sınırsız Erişim" });
    expect(`${pro.stats[0]?.label} (${pro.stats[0]?.value})`).toBe(
      "Tezgâh Pro (Sınırsız Erişim)",
    );
    expect(pro.stats[0]?.value).not.toBe("3/3");

    expect(commandQuotaLane("free")).toBe("FREE_DAILY");
    expect(commandQuotaLane("credit")).toBe("CREDIT_PACK");
    expect(commandQuotaLane("prepaid")).toBe("CREDIT_PACK");
    expect(commandQuotaLane("pro")).toBe("PRO");
    expect(commandQuotaLane("closed")).toBe("CLOSED");
    expect(readSrc("app/dashboard/load-command.ts")).toContain("commandQuotaLane");
    expect(readSrc("app/dashboard/load-command.ts")).toContain("quota.error");
  });

  it("sayfa dört okumayı Promise.all ile toplar; gövde cüzdan bandı açmaz", () => {
    const loader = readSrc("app/dashboard/load-command.ts");
    const page = readSrc("app/dashboard/page.tsx");
    const view = readSrc("components/dashboard/command-center.tsx");
    expect(page).toContain("Promise.all");
    expect(page).toContain("loadDashboardPulse");
    expect(page).toContain("loadOwnerStores");
    expect(page).toContain("readMemberTezgahQuota");
    expect(loader).toContain("peekTezgahQuota");
    expect(page).toContain("CommandCenter");
    expect(page).toContain("PublicHomePanel");
    expect(view).toContain("md:grid-cols-2");
    expect(view).toContain("xl:grid-cols-5");
    expect(view).not.toContain('href="/cuzdan"');
    expect(view).not.toContain("WalletBalanceStrip");
    expect(page).not.toContain('href="/cuzdan"');
  });
});
