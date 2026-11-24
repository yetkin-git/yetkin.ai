/**
 * Sipariş masası — sahiplik `owner_user_id` ile. Stok defterine yazılmaz.
 */

import "server-only";

import { randomUUID } from "node:crypto";
import {
  buildPickList,
  fulfillmentChannelLabel,
  fulfillmentStatusLabel,
  parseLabelSettings,
  planFulfillmentStatus,
  queueCargoNotice,
  readFulfillmentItems,
  slaDeadline,
  type FulfillmentChannel,
  type FulfillmentDraft,
  type FulfillmentStatus,
} from "@/lib/commerce/fulfillment-rules";
import { enforcePlanFeature } from "@/lib/commerce/plan-guard";
import { commerceFail, type CommerceResult } from "@/lib/commerce/types";
import { formatTryMinor } from "@/lib/commerce/storefront";
import { getPrisma } from "@/lib/kernel/db";

const MISSING = "Mağaza bulunamadı.";

function orderJson(row: {
  id: string;
  storeId: string;
  channel: FulfillmentChannel;
  externalOrderNo: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  cargoCompany: string;
  cargoTrackingCode: string;
  itemsJson: unknown;
  totalMinor: number;
  status: FulfillmentStatus;
  labelPrintedAt: Date | null;
  shippedAt: Date | null;
  slaDeadlineAt: Date | null;
  createdAt: Date;
}) {
  const items = readFulfillmentItems(row.itemsJson);
  return {
    id: row.id,
    storeId: row.storeId,
    channel: row.channel,
    channelLabel: fulfillmentChannelLabel(row.channel),
    externalOrderNo: row.externalOrderNo,
    customerName: row.customerName,
    customerPhone: row.customerPhone,
    shippingAddress: row.shippingAddress,
    cargoCompany: row.cargoCompany,
    cargoTrackingCode: row.cargoTrackingCode,
    items,
    totalMinor: row.totalMinor,
    totalLabel: formatTryMinor(row.totalMinor),
    status: row.status,
    statusLabel: fulfillmentStatusLabel(row.status),
    labelPrintedAt: row.labelPrintedAt ? row.labelPrintedAt.toISOString() : null,
    shippedAt: row.shippedAt ? row.shippedAt.toISOString() : null,
    slaDeadlineAt: row.slaDeadlineAt ? row.slaDeadlineAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}

async function ownedStore(userId: string, storeId: string) {
  return getPrisma().commerceStore.findFirst({
    where: { id: storeId, ownerUserId: userId },
    select: {
      id: true,
      name: true,
      logoUrl: true,
      senderTitle: true,
      senderPhone: true,
      senderAddress: true,
      planCode: true,
    },
  });
}

/** Çekim ve webhook aynı siparişi ikinci kez `NEW` yapmaz. İptal, hazırlanmamış siparişi kapatır. */
export async function upsertFulfillmentDraft(draft: FulfillmentDraft): Promise<void> {
  if (!draft.externalOrderNo || draft.items.length === 0) {
    return;
  }
  const prisma = getPrisma();
  const existing = await prisma.commerceFulfillmentOrder.findUnique({
    where: {
      storeId_channel_externalOrderNo: {
        storeId: draft.storeId,
        channel: draft.channel,
        externalOrderNo: draft.externalOrderNo,
      },
    },
    select: { id: true, status: true },
  });
  if (!existing) {
    await prisma.commerceFulfillmentOrder.create({
      data: {
        id: randomUUID(),
        storeId: draft.storeId,
        channel: draft.channel,
        externalOrderNo: draft.externalOrderNo,
        customerName: draft.customerName,
        customerPhone: draft.customerPhone,
        shippingAddress: draft.shippingAddress,
        cargoCompany: draft.cargoCompany,
        cargoTrackingCode: draft.cargoTrackingCode,
        itemsJson: draft.items,
        totalMinor: draft.totalMinor,
        status: draft.status,
        slaDeadlineAt: slaDeadline(draft.now),
      },
    });
    return;
  }
  if (draft.status === "CANCELED" && (existing.status === "NEW" || existing.status === "PREPARED")) {
    await prisma.commerceFulfillmentOrder.update({
      where: { id: existing.id },
      data: { status: "CANCELED" },
    });
  }
}

export async function recordFulfillmentQuiet(draft: FulfillmentDraft): Promise<void> {
  try {
    await upsertFulfillmentDraft(draft);
  } catch {
    // Masa yazılamazsa stok çekimi düşmez.
  }
}

export async function listFulfillmentOrders(
  userId: string,
  storeId: string,
  status: FulfillmentStatus | null,
): Promise<CommerceResult<Record<string, unknown>>> {
  const store = await ownedStore(userId, storeId);
  if (!store) {
    return commerceFail(404, MISSING);
  }
  const rows = await getPrisma().commerceFulfillmentOrder.findMany({
    where: { storeId, ...(status ? { status } : {}) },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  const orders = rows.map((row) => orderJson(row));
  return {
    ok: true,
    data: {
      orders,
      pickList: buildPickList(orders),
      label: {
        storeName: store.name,
        logoUrl: store.logoUrl,
        senderTitle: store.senderTitle ?? store.name,
        senderPhone: store.senderPhone ?? "",
        senderAddress: store.senderAddress ?? "",
      },
    },
  };
}

export async function patchFulfillmentStatus(
  userId: string,
  storeId: string,
  orderId: string,
  raw: unknown,
): Promise<CommerceResult<Record<string, unknown>>> {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return commerceFail(422, "İstek geçersiz.");
  }
  const body = raw as Record<string, unknown>;
  const next = body.status;
  if (next !== "PREPARED" && next !== "SHIPPED" && next !== "DELIVERED" && next !== "CANCELED") {
    return commerceFail(422, "Durum geçersiz.");
  }
  const store = await ownedStore(userId, storeId);
  if (!store) {
    return commerceFail(404, MISSING);
  }
  const prisma = getPrisma();
  const row = await prisma.commerceFulfillmentOrder.findFirst({
    where: { id: orderId, storeId },
  });
  if (!row) {
    return commerceFail(404, "Sipariş bulunamadı.");
  }
  const tracking =
    typeof body.cargoTrackingCode === "string" ? body.cargoTrackingCode.trim().slice(0, 64) : row.cargoTrackingCode;
  const cargoCompany =
    typeof body.cargoCompany === "string" && body.cargoCompany.trim()
      ? body.cargoCompany.trim().slice(0, 40)
      : row.cargoCompany;
  const now = new Date();
  const planned = planFulfillmentStatus({
    from: row.status,
    to: next,
    cargoTrackingCode: tracking,
    now,
    labelPrintedAt: row.labelPrintedAt,
    shippedAt: row.shippedAt,
  });
  if (!planned.ok) {
    return commerceFail(422, planned.error);
  }
  const saved = await prisma.commerceFulfillmentOrder.update({
    where: { id: row.id },
    data: {
      status: next,
      cargoTrackingCode: tracking,
      cargoCompany,
      labelPrintedAt: planned.labelPrintedAt,
      shippedAt: planned.shippedAt,
    },
  });
  const notice = next === "SHIPPED" ? queueCargoNotice(saved.channel, saved.cargoTrackingCode) : null;
  return {
    ok: true,
    data: {
      order: orderJson(saved),
      ...(notice ? { cargoNotice: notice } : {}),
    },
  };
}

export async function bulkPrepareLabels(
  userId: string,
  storeId: string,
  raw: unknown,
): Promise<CommerceResult<Record<string, unknown>>> {
  const denied = await enforcePlanFeature(userId, storeId, "bulkLabel");
  if (denied) {
    return denied;
  }
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    return commerceFail(422, "İstek geçersiz.");
  }
  const ids = (raw as { orderIds?: unknown }).orderIds;
  if (!Array.isArray(ids) || ids.length < 1 || ids.length > 50 || ids.some((id) => typeof id !== "string" || !id.trim())) {
    return commerceFail(422, "Sipariş seçimi geçersiz.");
  }
  const store = await ownedStore(userId, storeId);
  if (!store) {
    return commerceFail(404, MISSING);
  }
  const prisma = getPrisma();
  const rows = await prisma.commerceFulfillmentOrder.findMany({
    where: { storeId, id: { in: ids.map((id) => (id as string).trim()) } },
  });
  if (rows.length !== ids.length) {
    return commerceFail(404, "Seçilen sipariş bulunamadı.");
  }
  const now = new Date();
  const prepared = [];
  for (const row of rows) {
    if (row.status === "NEW") {
      const saved = await prisma.commerceFulfillmentOrder.update({
        where: { id: row.id },
        data: { status: "PREPARED", labelPrintedAt: row.labelPrintedAt ?? now },
      });
      prepared.push(orderJson(saved));
    } else if (row.status === "PREPARED" || row.status === "SHIPPED") {
      if (!row.labelPrintedAt) {
        await prisma.commerceFulfillmentOrder.update({
          where: { id: row.id },
          data: { labelPrintedAt: now },
        });
      }
      prepared.push(orderJson({ ...row, labelPrintedAt: row.labelPrintedAt ?? now }));
    } else {
      return commerceFail(422, "İptal veya teslim siparişe etiket basılmaz.");
    }
  }
  return {
    ok: true,
    data: {
      orders: prepared,
      label: {
        storeName: store.name,
        logoUrl: store.logoUrl,
        senderTitle: store.senderTitle ?? store.name,
        senderPhone: store.senderPhone ?? "",
        senderAddress: store.senderAddress ?? "",
      },
    },
  };
}

export async function patchLabelSettings(
  userId: string,
  storeId: string,
  raw: unknown,
): Promise<CommerceResult<Record<string, unknown>>> {
  const parsed = parseLabelSettings(raw);
  if (!parsed.ok) {
    return commerceFail(422, parsed.error);
  }
  const store = await ownedStore(userId, storeId);
  if (!store) {
    return commerceFail(404, MISSING);
  }
  const saved = await getPrisma().commerceStore.update({
    where: { id: store.id },
    data: {
      logoUrl: parsed.logoUrl,
      senderTitle: parsed.senderTitle,
      senderPhone: parsed.senderPhone,
      senderAddress: parsed.senderAddress,
    },
    select: {
      logoUrl: true,
      senderTitle: true,
      senderPhone: true,
      senderAddress: true,
      name: true,
    },
  });
  return {
    ok: true,
    data: {
      label: {
        storeName: saved.name,
        logoUrl: saved.logoUrl,
        senderTitle: saved.senderTitle ?? saved.name,
        senderPhone: saved.senderPhone ?? "",
        senderAddress: saved.senderAddress ?? "",
      },
    },
  };
}
