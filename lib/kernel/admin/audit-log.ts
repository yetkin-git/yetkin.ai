/**
 * Süper yönetici eylem günlüğü — append-only plan.
 * Rol tablosu yoktur. Yazılan kimlik yalnız `SUPER_ADMIN_USER_ID` UUID'sidir.
 * Eşleşmeyen aktör satır açmaz. UPDATE ve DELETE bu modülde yoktur.
 */
import { isSupabaseUserId } from "@/lib/kernel/auth/ids";

export const SUPER_ADMIN_AUDIT_ACTIONS = [
  "catalog_publish",
  "catalog_price",
  "license_grant",
  "manual_refund",
  "certificate_revoke",
  "room_flag",
] as const;

/** Mühür satırı açılmazsa yazma geri alınır. Sessiz geçiş yoktur. */
export const SUPER_ADMIN_AUDIT_SEAL_MISSED = "Süper yönetici mührü yazılamadı.";

export type SuperAdminAuditAction = (typeof SUPER_ADMIN_AUDIT_ACTIONS)[number];

export type SuperAdminAuditInsert = {
  actorUserId: string;
  action: SuperAdminAuditAction;
  target: string;
  detail: string;
};

export type SuperAdminAuditWriter = {
  create(data: SuperAdminAuditInsert): Promise<unknown>;
};

const TARGET_MAX = 180;
const DETAIL_MAX = 2000;

export function planSuperAdminAuditInsert(
  input: {
    actorUserId: string;
    action: SuperAdminAuditAction;
    target: string;
    detail: string;
  },
  envUserId: string | undefined = process.env.SUPER_ADMIN_USER_ID,
): SuperAdminAuditInsert | null {
  if (!(SUPER_ADMIN_AUDIT_ACTIONS as readonly string[]).includes(input.action)) {
    throw new Error("Süper yönetici günlüğü bilinmeyen eylem.");
  }
  const envId = envUserId?.trim() ?? "";
  const actor = input.actorUserId.trim();
  if (!isSupabaseUserId(envId) || actor !== envId) {
    return null;
  }
  const target = input.target.trim();
  const detail = input.detail.trim();
  if (!target || !detail) {
    throw new Error("Süper yönetici günlüğü hedef ve gerekçe ister.");
  }
  return {
    actorUserId: envId,
    action: input.action,
    target: target.slice(0, TARGET_MAX),
    detail: detail.slice(0, DETAIL_MAX),
  };
}

export function planRoomFlagAudit(
  input: { actorUserId: string; roomId: string; open: boolean },
  envUserId?: string,
): SuperAdminAuditInsert | null {
  return planSuperAdminAuditInsert(
    {
      actorUserId: input.actorUserId,
      action: "room_flag",
      target: input.roomId,
      detail: input.open ? "open" : "closed",
    },
    envUserId,
  );
}

/** Tek yazıcı. Güncelleme ve silme yoktur. */
export async function writeSuperAdminAudit(
  writer: SuperAdminAuditWriter,
  input: {
    actorUserId: string;
    action: SuperAdminAuditAction;
    target: string;
    detail: string;
  },
  envUserId?: string,
): Promise<boolean> {
  const row = planSuperAdminAuditInsert(input, envUserId);
  if (!row) {
    return false;
  }
  await writer.create(row);
  return true;
}
