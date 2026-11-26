import { describe, expect, it } from "vitest";
import {
  parseBridgeKaynak,
  parseBridgeKonu,
  parseBridgePozisyon,
  sanitizeBridgeQueryValue,
} from "@/lib/kernel/contextual-bridge-params";

describe("bağlamsal köprü query sanitizer", () => {
  it("güvenli metni kırpar ve boşlukları sadeleştirir", () => {
    expect(sanitizeBridgeQueryValue("  E-Ticaret  Operasyon  ")).toBe("E-Ticaret Operasyon");
    expect(sanitizeBridgeQueryValue(["  Hibe dosyası  ", "diğer"])).toBe("Hibe dosyası");
  });

  it("XSS / injection yüzeylerini reddeder", () => {
    expect(sanitizeBridgeQueryValue('<script>alert(1)</script>')).toBe("");
    expect(sanitizeBridgeQueryValue('"><img src=x onerror=alert(1)>')).toBe("");
    expect(sanitizeBridgeQueryValue("javascript:alert(1)")).toBe("");
    expect(sanitizeBridgeQueryValue("data:text/html,<svg>")).toBe("");
    expect(sanitizeBridgeQueryValue("onclick=alert(1)")).toBe("");
    expect(sanitizeBridgeQueryValue("başlık\u0000gizli")).toBe("başlıkgizli");
  });

  it("PII kalıplarını (e-posta, TCKN, VKN) reddeder", () => {
    expect(sanitizeBridgeQueryValue("ali@ornek.com")).toBe("");
    expect(sanitizeBridgeQueryValue("12345678901")).toBe("");
    expect(sanitizeBridgeQueryValue("1234567890")).toBe("");
    expect(sanitizeBridgeQueryValue("123-456-7890")).toBe("");
    expect(parseBridgePozisyon("12345678901")).toBe("");
    expect(parseBridgeKonu("ik@sirket.com")).toBe("");
  });

  it("pozisyon başlığını 3–160 aralığında güvenli tutar", () => {
    expect(parseBridgePozisyon("E-Ticaret Operasyon Sorumlusu")).toBe(
      "E-Ticaret Operasyon Sorumlusu",
    );
    expect(parseBridgePozisyon("ab")).toBe("");
    expect(parseBridgePozisyon("A".repeat(200))).toHaveLength(160);
    expect(parseBridgePozisyon('Müdür "Satış"')).toBe("Müdür Satış");
  });

  it("kaynak allowlist dışını null döner", () => {
    expect(parseBridgeKaynak("e-ticaret")).toBe("e-ticaret");
    expect(parseBridgeKaynak("hibe")).toBe("hibe");
    expect(parseBridgeKaynak("kurumsal")).toBe("kurumsal");
    expect(parseBridgeKaynak("kariyer")).toBe("kariyer");
    expect(parseBridgeKaynak("admin")).toBeNull();
    expect(parseBridgeKaynak('<script>hibe</script>')).toBeNull();
    expect(parseBridgeKaynak("HIBE")).toBe("hibe");
  });

  it("köprü URL'lerinde PII query anahtarı taşınmaz", async () => {
    const { readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const bridges = readFileSync(join(process.cwd(), "lib/copy/sen-voice/bridges.ts"), "utf8");
    expect(bridges).not.toMatch(/[?&](tckn|vkn|email|e-posta|vergi)=/i);
    expect(bridges).toContain("?kaynak=e-ticaret");
    expect(bridges).toContain("?kaynak=hibe");
    expect(bridges).toContain("?kaynak=kurumsal");
    expect(bridges).toContain("?pozisyon=E-Ticaret+Operasyon+Sorumlusu");
  });
});

describe("bağlamsal köprü yüzeyleri", () => {
  it("ortak şerit ve dört merkez preset'i bağlıdır", async () => {
    const { readFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const root = process.cwd();
    const strip = readFileSync(join(root, "components/kernel/contextual-bridge-strip.tsx"), "utf8");
    const presets = readFileSync(join(root, "components/kernel/contextual-bridge-presets.tsx"), "utf8");
    const ecommerce = readFileSync(join(root, "components/commerce/os-cockpit.tsx"), "utf8");
    const hibe = readFileSync(join(root, "components/hibe/os-cockpit.tsx"), "utf8");
    const kurumsal = readFileSync(join(root, "components/kurumsal/screening-cockpit.tsx"), "utf8");
    const career = readFileSync(join(root, "app/career/page.tsx"), "utf8");
    const tezgah = readFileSync(join(root, "components/tezgah/workbench.tsx"), "utf8");
    const ilanlar = readFileSync(join(root, "app/(kernel)/kurumsal/ilanlar/page.tsx"), "utf8");

    expect(strip).toContain("ContextualBridgeStrip");
    expect(strip).toContain("data-contextual-bridge");
    expect(presets).toContain("EcommerceContextualBridges");
    expect(presets).toContain("HibeContextualBridges");
    expect(presets).toContain("KurumsalContextualBridges");
    expect(presets).toContain("CareerContextualBridges");
    expect(ecommerce).toContain("<EcommerceContextualBridges");
    expect(hibe).toContain("<HibeContextualBridges");
    expect(kurumsal).toContain("<KurumsalContextualBridges");
    expect(career).toContain("<CareerContextualBridges");
    expect(tezgah).toContain("parseBridgeKaynak");
    expect(tezgah).toContain("data-tezgah-bridge-hint");
    expect(ilanlar).toContain("parseBridgePozisyon");
  });
});
