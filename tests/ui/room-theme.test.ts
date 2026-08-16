import { describe, expect, it } from "vitest";
import { roomIdFromPath, roomLabelFromId } from "@/lib/ui/room-theme";

describe("oda teması yolu", () => {
  it("dikey oda ve alt yolları tanır", () => {
    expect(roomIdFromPath("/devlabs")).toBe("devlabs");
    expect(roomIdFromPath("/devlabs/projeler/abc")).toBe("devlabs");
    expect(roomIdFromPath("/junior/ebeveyn")).toBe("junior");
    expect(roomIdFromPath("/pazaryeri/tezgah")).toBe("pazaryeri");
    expect(roomIdFromPath("/yetkinilan")).toBe("pazaryeri");
    expect(roomIdFromPath("/yetkinilan/siparisler")).toBe("pazaryeri");
  });

  it("çekirdek yüzeyleri kernel olarak bırakır", () => {
    expect(roomIdFromPath("/profil")).toBe("kernel");
    expect(roomIdFromPath("/cuzdan")).toBe("kernel");
    expect(roomIdFromPath(null)).toBe("kernel");
  });

  it("oda etiketini çözer", () => {
    expect(roomLabelFromId("arena")).toBe("Arena");
    expect(roomLabelFromId("pazaryeri")).toBe("Yetkinİlan");
    expect(roomLabelFromId("kernel")).toBe("Çekirdek");
  });
});
