import "server-only";

import { SUPER_ADMIN_AUDIT_SEAL_MISSED, writeSuperAdminAudit } from "@/lib/kernel/admin/audit-log";
import { bindSuperAdminAuditWriter } from "@/lib/kernel/admin/prisma-super-admin-audit";
import {
  invalidateProductModelCache,
  PRODUCT_MODEL_SETTING_ID,
  PRODUCT_MODEL_SLOTS,
  type ProductModelSlot,
} from "@/lib/kernel/ai/product-models";
import { getPrisma } from "@/lib/kernel/db";
import { ConflictError } from "@/lib/kernel/http/errors";

function columnData(slots: Record<ProductModelSlot, string | null>, actorUserId: string) {
  return {
    textEasyModelId: slots.textEasy,
    textDeepModelId: slots.textDeep,
    imageEasyModelId: slots.imageEasy,
    imageDeepModelId: slots.imageDeep,
    voiceEasyModelId: slots.voiceEasy,
    voiceDeepModelId: slots.voiceDeep,
    updatedBy: actorUserId,
  };
}

/** Tek satır upsert. Mühür satırı açılmazsa yazma geri alınır. */
export async function saveProductModelSettings(
  actorUserId: string,
  slots: Record<ProductModelSlot, string | null>,
): Promise<void> {
  const data = columnData(slots, actorUserId);
  const detail = PRODUCT_MODEL_SLOTS.map((slot) => `${slot}=${slots[slot] ?? "default"}`).join(" ");
  await getPrisma().$transaction(async (tx) => {
    await tx.aiProductModelSetting.upsert({
      where: { id: PRODUCT_MODEL_SETTING_ID },
      create: { id: PRODUCT_MODEL_SETTING_ID, ...data },
      update: data,
    });
    const sealed = await writeSuperAdminAudit(bindSuperAdminAuditWriter(tx), {
      actorUserId,
      action: "ai_model_bind",
      target: PRODUCT_MODEL_SETTING_ID,
      detail,
    });
    if (!sealed) {
      throw new ConflictError(SUPER_ADMIN_AUDIT_SEAL_MISSED);
    }
  });
  invalidateProductModelCache();
}
