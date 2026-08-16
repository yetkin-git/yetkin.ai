import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { RIBBON_ROOMS } from "@/lib/kernel/modules";
import {
  DEFAULT_RIBBON_ORDER,
  RIBBON_ORDER_STORAGE_KEY,
  applyStoredRibbonOrder,
  isRibbonRoomId,
  moveRibbonRoom,
  parseStoredRibbonOrder,
} from "@/lib/dashboard/ribbon-order";

describe("dashboard modül şeridi sıralaması", () => {
  it("varsayılan sıra on bir asil odayı Anasayfa olmadan taşır", () => {
    expect(DEFAULT_RIBBON_ORDER).toEqual([
      "studio",
      "academy",
      "career",
      "freelancer",
      "devlabs",
      "kurumsal",
      "hibe",
      "arena",
      "pazaryeri",
      "junior",
      "social",
    ]);
    expect(RIBBON_ROOMS.map((room) => room.label)).toEqual([
      "Studio",
      "Akademi",
      "Kariyer",
      "Freelancer",
      "DevLabs",
      "Kurumsal",
      "Hibe",
      "Arena",
      "Yetkinİlan",
      "Junior",
      "YetkinX",
    ]);
    expect(isRibbonRoomId("dashboard")).toBe(false);
    expect(isRibbonRoomId("studio")).toBe(true);
  });

  it("kayıtlı sırayı uygular, yabancı ve dashboard id düşer, yeni oda sona eklenir", () => {
    expect(
      applyStoredRibbonOrder(DEFAULT_RIBBON_ORDER, [
        "social",
        "studio",
        "dashboard",
        "ghost",
        "studio",
        "junior",
      ]),
    ).toEqual([
      "social",
      "studio",
      "junior",
      "academy",
      "career",
      "freelancer",
      "devlabs",
      "kurumsal",
      "hibe",
      "arena",
      "pazaryeri",
    ]);
  });

  it("bozuk JSON ve boş depo varsayılana düşer", () => {
    expect(parseStoredRibbonOrder(null)).toEqual([]);
    expect(parseStoredRibbonOrder("{")).toEqual([]);
    expect(parseStoredRibbonOrder("{\"nope\":1}")).toEqual([]);
    expect(parseStoredRibbonOrder("[1, \"studio\", null]")).toEqual(["studio"]);
    expect(applyStoredRibbonOrder(DEFAULT_RIBBON_ORDER, [])).toEqual([...DEFAULT_RIBBON_ORDER]);
  });

  it("sürükle-bırak hedefe taşır; aynı id ve yabancı id no-op", () => {
    const start = [...DEFAULT_RIBBON_ORDER];
    expect(moveRibbonRoom(start, "studio", "pazaryeri")[8]).toBe("studio");
    expect(moveRibbonRoom(start, "yetkinx", "studio")).toEqual(start);
    expect(moveRibbonRoom(start, "studio", "studio")).toEqual(start);
    expect(moveRibbonRoom(start, "junior", "studio")[0]).toBe("junior");
  });

  it("şerit kaynağı Anasayfa çipi taşımaz; flex-wrap ve gizli scrollbar giyer", () => {
    const source = readFileSync(
      path.join(process.cwd(), "components/dashboard/module-ribbon.tsx"),
      "utf8",
    );
    expect(source).toContain("RIBBON_ROOMS");
    expect(source).not.toContain("VERTICAL_ROOMS");
    expect(source).toContain("flex-wrap");
    expect(source).toContain("scrollbar-none");
    expect(source).toContain("writeRibbonOrderToStorage");
    expect(source).toContain("draggable");
    expect(source).not.toContain("Anasayfa");
    expect(source).not.toContain("Pazaryeri");
    expect(RIBBON_ORDER_STORAGE_KEY).toBe("yetkin-rail.dashboard.ribbon-order");
  });
});
