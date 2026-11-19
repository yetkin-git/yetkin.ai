import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ROOM_ICONS } from "@/components/ui/icons";
import { COMMERCE_NAV, KERNEL_SURFACES } from "@/lib/kernel/modules";
import { isSafeAuthNextPath } from "@/lib/kernel/auth/redirects";
import { isProtectedKernelPath, PROTECTED_KERNEL_PATHS } from "@/lib/kernel/security/edge-guard";

const ROOT = process.cwd();

const COCKPIT_PAGES = [
  "app/(kernel)/e-ticaret/page.tsx",
  "app/(kernel)/magazam/page.tsx",
  "app/(kernel)/magazam/yeni/page.tsx",
  "app/(kernel)/magazam/[storeId]/page.tsx",
  "app/(kernel)/magazam/[storeId]/urunler/page.tsx",
  "app/(kernel)/magazam/[storeId]/urunler/[productId]/page.tsx",
  "app/(kernel)/magazam/[storeId]/stok/page.tsx",
  "app/(kernel)/magazam/[storeId]/kanallar/page.tsx",
  "app/(kernel)/magazam/[storeId]/lisans/page.tsx",
] as const;

function read(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("Yetkin Commerce kokpit yüzeyi", () => {
  it("kokpit sayfaları oturum ister ve vitrin ağacına ikinci dinamik segment açmaz", () => {
    expect(COCKPIT_PAGES).toHaveLength(9);
    for (const file of COCKPIT_PAGES) {
      expect(read(file), file).toContain("requirePageSession");
    }
    expect(read("app/(kernel)/magazam/[storeId]/page.tsx")).toContain("/magaza/${");
    expect(existsSync(join(ROOT, "app/(kernel)/magaza"))).toBe(false);
    expect(readdirSync(join(ROOT, "app/(public)/magaza")).sort()).toEqual(["[slug]"]);
  });

  it("E-Ticaret sol raydadır; hesap menüsü ve vitrin dönüşü karışmaz", () => {
    expect(COMMERCE_NAV.path).toBe("/e-ticaret");
    expect(COMMERCE_NAV.label).toBe("E-Ticaret");
    expect(COMMERCE_NAV.blurb).toBe("Stok, kanal ve sipariş");
    expect(KERNEL_SURFACES.map((surface) => surface.id)).not.toContain("magazam");
    const nav = read("components/shell/sidebar-nav.tsx");
    expect(nav).toContain("COMMERCE_NAV");
    expect(nav).not.toContain("KERNEL_SURFACES");
    expect(read("components/ui/icons.tsx")).toContain("magazam: IconStore");
    expect(ROOM_ICONS.magazam).toBeTypeOf("function");
    expect(PROTECTED_KERNEL_PATHS).toContain("/magazam");
    expect(PROTECTED_KERNEL_PATHS).toContain("/e-ticaret");
    expect(isProtectedKernelPath("/e-ticaret")).toBe(true);
    expect(isProtectedKernelPath("/magazam/yeni")).toBe(true);
    expect(isProtectedKernelPath("/magaza/ornek")).toBe(false);
    expect(isSafeAuthNextPath("/magazam/yeni")).toBe(true);
    expect(isSafeAuthNextPath("/e-ticaret")).toBe(true);
    expect(isSafeAuthNextPath("/magaza/ornek")).toBe(false);
    const transfer = read("components/tezgah/master-sku-transfer.tsx");
    expect(transfer).toContain("/e-ticaret?sekme=havuz");
    expect(transfer).toContain("Taslakları düzenle");
  });
});
