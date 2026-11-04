/**
 * Oda bayrağı env değişimi — append-only günlük satırı.
 * Bayrak hâlâ süreç ortamıdır; bu modül yalnız denetim izini yazar.
 */
import { DRON_KAYIT } from "@/lib/dronlar/kayit";
import { writeSuperAdminAudit, type SuperAdminAuditWriter } from "@/lib/kernel/admin/audit-log";

export type RoomFlagAuditTarget = {
  roomId: string;
  envKey: string;
};

export function resolveRoomFlagAuditTarget(roomId: string): RoomFlagAuditTarget | null {
  const normalized = roomId.trim().toLowerCase();
  const row = DRON_KAYIT.find((entry) => entry.id === normalized);
  if (!row || !("bayrakEnv" in row) || !row.bayrakEnv) {
    return null;
  }
  return { roomId: row.id, envKey: row.bayrakEnv };
}

export function listRoomFlagAuditTargets(): RoomFlagAuditTarget[] {
  return DRON_KAYIT.flatMap((row) => {
    if (!("bayrakEnv" in row) || !row.bayrakEnv) {
      return [];
    }
    return [{ roomId: row.id, envKey: row.bayrakEnv }];
  });
}

export async function appendRoomFlagAudit(
  writer: SuperAdminAuditWriter,
  input: { roomId: string; open: boolean; note?: string },
  envUserId?: string,
): Promise<boolean> {
  const target = resolveRoomFlagAuditTarget(input.roomId);
  if (!target) {
    throw new Error(`Oda bayrağı günlüğü: bilinmeyen veya env'siz oda (${input.roomId}).`);
  }
  const state = input.open ? "open" : "closed";
  const note = input.note?.trim();
  const detail = note ? `${state} env=${target.envKey} — ${note}` : `${state} env=${target.envKey}`;
  return writeSuperAdminAudit(
    writer,
    {
      actorUserId: envUserId?.trim() ?? process.env.SUPER_ADMIN_USER_ID?.trim() ?? "",
      action: "room_flag",
      target: target.roomId,
      detail,
    },
    envUserId,
  );
}
