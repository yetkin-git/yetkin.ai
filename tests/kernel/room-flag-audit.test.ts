import { describe, expect, it, vi } from "vitest";
import { appendRoomFlagAudit, resolveRoomFlagAuditTarget } from "@/lib/kernel/admin/room-flag-audit";

const ENV_ID = "11111111-1111-4111-8111-111111111111";

describe("oda bayrağı günlüğü", () => {
  it("junior hedefi env anahtarıyla çözülür", () => {
    expect(resolveRoomFlagAuditTarget("junior")).toEqual({
      roomId: "junior",
      envKey: "DRON_JUNIOR_ROOM_OPEN",
    });
    expect(resolveRoomFlagAuditTarget("dashboard")).toBeNull();
  });

  it("writeSuperAdminAudit yolundan room_flag satırı yazar", async () => {
    const create = vi.fn(async () => undefined);
    const written = await appendRoomFlagAudit(
      { create },
      { roomId: "young", open: true, note: "Vercel" },
      ENV_ID,
    );
    expect(written).toBe(true);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        actorUserId: ENV_ID,
        action: "room_flag",
        target: "young",
        detail: expect.stringContaining("DRON_YOUNG_OPEN"),
      }),
    );
  });
});
