/**
 * Operatör oda bayrağı env'ini Vercel'de çevirdikten sonra append-only günlük satırı.
 */

import {
  appendRoomFlagAudit,
  listRoomFlagAuditTargets,
  resolveRoomFlagAuditTarget,
} from "@/lib/kernel/admin/room-flag-audit";
import type { SuperAdminAuditInsert } from "@/lib/kernel/admin/audit-log";

export type RoomFlagAuditPort = {
  writeAudit(row: SuperAdminAuditInsert): Promise<void>;
};

export function parseRoomFlagArgs(argv: string[]): { roomId: string; open: boolean; note: string } {
  let roomId = "";
  let open: boolean | null = null;
  let note = "";
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const next = argv[index + 1];
    if (token === "--room" && next) {
      roomId = next.trim().toLowerCase();
      index += 1;
      continue;
    }
    if (token?.startsWith("--room=")) {
      roomId = token.slice("--room=".length).trim().toLowerCase();
      continue;
    }
    if (token === "--open" && next) {
      open = parseOpenToken(next);
      index += 1;
      continue;
    }
    if (token?.startsWith("--open=")) {
      open = parseOpenToken(token.slice("--open=".length));
      continue;
    }
    if (token === "--note" && next) {
      note = next.trim();
      index += 1;
      continue;
    }
    if (token?.startsWith("--note=")) {
      note = token.slice("--note=".length).trim();
    }
  }
  if (!roomId || open === null) {
    const rooms = listRoomFlagAuditTargets().map((row) => row.roomId).join(", ");
    throw new Error(
      `--room ve --open zorunlu. Env bayraklı odalar: ${rooms || "(yok)"}. Örnek: --room=junior --open=1 --note="Vercel prod"`,
    );
  }
  return { roomId, open, note };
}

function parseOpenToken(raw: string): boolean {
  const value = raw.trim().toLowerCase();
  if (value === "1" || value === "true" || value === "open") {
    return true;
  }
  if (value === "0" || value === "false" || value === "closed") {
    return false;
  }
  throw new Error(`--open değeri anlaşılmadı: ${raw}. 1|true|open veya 0|false|closed kullan.`);
}

export async function runSuperAdminRoomFlagAudit(
  port: RoomFlagAuditPort,
  input: { roomId: string; open: boolean; note?: string },
): Promise<{ roomId: string; envKey: string; written: boolean }> {
  const target = resolveRoomFlagAuditTarget(input.roomId);
  if (!target) {
    throw new Error(`Oda bulunamadı veya bayrak env'i yok: ${input.roomId}`);
  }
  const written = await appendRoomFlagAudit(
    { create: (data) => port.writeAudit(data) },
    { roomId: input.roomId, open: input.open, note: input.note },
  );
  return { roomId: target.roomId, envKey: target.envKey, written };
}
