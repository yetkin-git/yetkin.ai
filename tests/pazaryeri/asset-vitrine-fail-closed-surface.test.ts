import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ForbiddenError } from "@/lib/kernel/http/errors";
import { jsonFromUnknown } from "@/lib/kernel/http/json";
import {
  ASSET_VITRINE_ONLY_ERROR,
  cashPathForCategory,
  settlementKindForCategory,
} from "@/lib/pazaryeri/category";
import { PAZARYERI_ASSET_VITRINE_PATH } from "@/lib/pazaryeri";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("Yetkinİlan emlak/vasıta vitrin fail-closed yüzeyi", () => {
  it("settlementKindForCategory varlıkları SERVICE saymaz; nakit kapısı 403 döner", () => {
    expect(cashPathForCategory("REAL_ESTATE")).toBe("VITRINE");
    expect(cashPathForCategory("VEHICLE")).toBe("VITRINE");
    expect(cashPathForCategory("SERVICE")).toBe("SERVICE");
    expect(() => settlementKindForCategory("REAL_ESTATE")).toThrow(ForbiddenError);
    expect(() => settlementKindForCategory("VEHICLE")).toThrow(ASSET_VITRINE_ONLY_ERROR);
    expect(PAZARYERI_ASSET_VITRINE_PATH).toEqual(["listing"]);

    const denied = jsonFromUnknown(new ForbiddenError(ASSET_VITRINE_ONLY_ERROR));
    expect(denied.status).toBe(403);
  });

  it("satın alma, teklif, kilit ve doping motorları kategori kapısını çağırır", () => {
    const engine = readSrc("archived/lib/pazaryeri/engine.ts");
    expect(engine).toContain("assertCashPathAllowedForCategory");
    expect(engine).toContain("assertEidsPublicListingAllowed");
    expect(engine).toContain("isAssetCategory(category) ? false");
    expect(engine).not.toContain("command.isOfferAllowed ?? isAssetCategory");

    const offers = readSrc("archived/lib/pazaryeri/offer-engine.ts");
    expect(offers).toContain("assertCashPathAllowedForCategory");

    const doping = readSrc("archived/lib/pazaryeri/doping-engine.ts");
    expect(doping).toContain("assertCashPathAllowedForCategory");

    const category = readSrc("archived/lib/pazaryeri/category.ts");
    expect(category).not.toContain('category === "DIGITAL_GOOD" ? "DIGITAL_GOOD" : "SERVICE"');
    expect(category).toContain('return "VITRINE"');
  });

  it("API yazma uçları donmuş 410 stub'dur", () => {
    const routes = ["app/api/_gone/[...path]/route.ts"];
    for (const file of routes) {
      const source = readSrc(file);
      expect(source, file).toContain("frozenRoomGone");
    }
  });

  it("Prisma ve sicil emlak/vasıtayı emanet siparişi olarak yazmaz", () => {
    const schema = readSrc("prisma/schema/pazaryeri.prisma");
    expect(schema).toContain("emlak/vasıta yalnız vitrin");
    expect(schema).not.toContain("Hizmet/emlak/vasıta: AWAITING_DELIVERY + EscrowHold");

    const index = readSrc("archived/lib/pazaryeri/index.ts");
    expect(index).toContain("PAZARYERI_ASSET_VITRINE_PATH");
    expect(index).not.toContain("Teklif ve doping çekirdek emanette");
  });
});
