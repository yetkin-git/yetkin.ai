/**
 * Set satışı planı.
 *
 * Saf plan üyeleri ve idempotency anahtarlarını üretir; yazmaz.
 * Yazım, çağıranın açtığı veritabanı işleminin içindedir. Bir üye reddedilirse
 * işlem geri alınır — ilk üye düşüp ikincisi havada kalmaz.
 */

import { readBundleMembers } from "@/lib/commerce/set-catalog";
import { CommerceRollback, type CommerceRepository } from "@/lib/commerce/repository";
import type { MoveCommand, MoveResult } from "@/lib/commerce/types";

export type SetMemberPlan = {
  variantId: string;
  quantity: number;
  idempotencyKey: string;
  note: string;
};

export type SetMemberDraw = {
  ok: true;
  /** Düşülen üye varyantları ve adetleri. */
  drawn: Array<{ variantId: string; quantity: number }>;
} | {
  ok: false;
  status: 404 | 409 | 422;
  error: string;
};

/** Kanal işlemi üye stokunu yazamazsa fırlatılır; çağıran işlem geri alınır. */
export class BundleMemberStockError extends Error {
  readonly status: 409 | 422;

  constructor(status: 409 | 422, message: string) {
    super(message);
    this.name = "BundleMemberStockError";
    this.status = status;
  }
}

/**
 * Set satışının üye hareketleri.
 *
 * Üye bağı yoksa boş dizi: satılan kart tekildir, çağıran ek yazım yapmaz.
 * Adet geçersizse 422. Aynı üye iki kez yazılmaz.
 */
export function planSetMemberDraws(input: {
  attributes: unknown;
  quantity: number;
  idempotencyKey: string;
  note: string;
}): { ok: true; draws: SetMemberPlan[] } | { ok: false; status: 422; error: string } {
  if (!Number.isInteger(input.quantity) || input.quantity < 1) {
    return { ok: false, status: 422, error: "Adet en az 1 olmalıdır." };
  }
  const seen = new Set<string>();
  const memberVariantIds = readBundleMembers(input.attributes).filter((variantId) => {
    if (seen.has(variantId)) {
      return false;
    }
    seen.add(variantId);
    return true;
  });
  const note = `Set üyesi: ${input.note}`.slice(0, 500);
  return {
    ok: true,
    draws: memberVariantIds.map((variantId) => ({
      variantId,
      quantity: input.quantity,
      idempotencyKey: `${input.idempotencyKey}:set:${variantId}`,
      note,
    })),
  };
}

/**
 * Planı uygular. `apply` reddeder veya varyantı bulamazsa önceki yazımlar
 * çağıranın işleminde geri alınmalıdır; bu fonksiyon kendisi commit etmez.
 */
export async function applyBundleMemberPlans(input: {
  attributes: unknown;
  quantity: number;
  idempotencyKey: string;
  note: string;
  apply: (draw: SetMemberPlan) => Promise<"applied" | "replay" | "rejected" | "missing">;
}): Promise<SetMemberDraw> {
  const plan = planSetMemberDraws(input);
  if (!plan.ok) {
    return plan;
  }
  const drawn: Array<{ variantId: string; quantity: number }> = [];
  for (const draw of plan.draws) {
    const outcome = await input.apply(draw);
    if (outcome === "rejected") {
      return { ok: false, status: 409, error: "Set üyesinde satılabilir stok yetmiyor." };
    }
    if (outcome === "missing") {
      return { ok: false, status: 404, error: "Set üyesi varyant bulunamadı." };
    }
    drawn.push({ variantId: draw.variantId, quantity: draw.quantity });
  }
  return { ok: true, drawn };
}

/**
 * Ana hareketi ve, kart bir setse, üye hareketlerini **aynı işlemde** yazar.
 * Üye kısa stokta ana hareket de geri alınır ve sonuç `rejected` olur.
 */
export async function moveWithSetMembers(repo: CommerceRepository, command: MoveCommand): Promise<MoveResult> {
  try {
    return await repo.transaction(async (tx) => {
      const moved = await tx.applyMovement(command);
      if (moved.outcome !== "applied" || (command.type !== "SALE" && command.type !== "RETURN")) {
        return moved;
      }
      const variant = await tx.findVariant(command.storeId, command.variantId);
      if (!variant) {
        return moved;
      }
      const owner = await tx.findProduct(command.storeId, variant.productId);
      const memberPushes: Array<{ variantId: string; onHandAfter: number; amountMinor: number | null }> = [];
      const expanded = await applyBundleMemberPlans({
        attributes: owner?.product.attributes ?? [],
        quantity: command.quantity,
        idempotencyKey: command.idempotencyKey,
        note: command.note,
        apply: async (draw) => {
          const memberMoved = await tx.applyMovement({
            id: draw.idempotencyKey,
            storeId: command.storeId,
            variantId: draw.variantId,
            actorUserId: command.actorUserId,
            type: command.type,
            direction: command.direction,
            quantity: draw.quantity,
            note: draw.note,
            idempotencyKey: draw.idempotencyKey,
          });
          if (memberMoved.outcome === "applied") {
            memberPushes.push({
              variantId: memberMoved.variant.id,
              onHandAfter: memberMoved.variant.onHandQty,
              amountMinor: memberMoved.variant.amountMinor,
            });
          }
          return memberMoved.outcome;
        },
      });
      if (!expanded.ok) {
        throw new CommerceRollback({ ok: false, status: expanded.status, error: expanded.error });
      }
      return memberPushes.length > 0 ? { ...moved, memberPushes } : moved;
    });
  } catch (error) {
    if (error instanceof CommerceRollback) {
      return { outcome: "rejected" };
    }
    throw error;
  }
}

/**
 * Yalnız üye düşümü. Set kartının kendi stoğuna dokunmaz.
 * Bir üyede stok yetmezse işlem geri alınır; hiçbir üye yazılmaz.
 */
export async function drawSetMembers(
  repo: CommerceRepository,
  input: {
    storeId: string;
    actorUserId: string;
    /** Set ürününün `attributes` alanı. */
    attributes: unknown;
    quantity: number;
    idempotencyKey: string;
    note: string;
  },
): Promise<SetMemberDraw> {
  if (!isSetProduct(input.attributes)) {
    return { ok: false, status: 422, error: "Set üyesi bağlı değil." };
  }
  try {
    return await repo.transaction(async (tx) => {
      const applied = await applyBundleMemberPlans({
        attributes: input.attributes,
        quantity: input.quantity,
        idempotencyKey: input.idempotencyKey,
        note: input.note,
        apply: async (draw) => {
          const moved = await tx.applyMovement({
            id: draw.idempotencyKey,
            storeId: input.storeId,
            variantId: draw.variantId,
            actorUserId: input.actorUserId,
            type: "SALE",
            direction: "OUT",
            quantity: draw.quantity,
            note: draw.note,
            idempotencyKey: draw.idempotencyKey,
          });
          return moved.outcome;
        },
      });
      if (!applied.ok) {
        throw new CommerceRollback({ ok: false, status: applied.status, error: applied.error });
      }
      return applied;
    });
  } catch (error) {
    if (error instanceof CommerceRollback && !error.result.ok) {
      const status = error.result.status;
      if (status === 404 || status === 409 || status === 422) {
        return { ok: false, status, error: error.result.error };
      }
    }
    throw error;
  }
}

/** Set kartı mı? Üye bağı varsa evet. */
export function isSetProduct(attributes: unknown): boolean {
  return readBundleMembers(attributes).length > 0;
}
