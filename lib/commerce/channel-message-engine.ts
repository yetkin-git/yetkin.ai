import { messageIdempotencyKey, type ChannelMessagePayload } from "@/lib/commerce/channel-message";
import type { OsChannelKind } from "@/lib/commerce/os-rules";

export type ChannelMessageRow = {
  id: string;
  productId: string | null;
  eventType: ChannelMessagePayload["eventType"];
  externalMessageId: string;
};

export type ChannelMessageInsert = {
  storeId: string;
  productId: string | null;
  channel: OsChannelKind;
  eventType: ChannelMessagePayload["eventType"];
  externalMessageId: string;
  customerLabel: string;
  body: string;
  idempotencyKey: string;
  priority: number;
};

export type ChannelMessageUnit = {
  findByKey: (key: string) => Promise<ChannelMessageRow | null>;
  findProduct: (storeId: string, sku: string, externalProductId: string) => Promise<{ id: string } | null>;
  insert: (row: ChannelMessageInsert) => Promise<ChannelMessageRow>;
};

export type ChannelMessageCommit =
  | {
      ok: true;
      replayed: boolean;
      entryId: string;
      productId: string | null;
      linked: boolean;
      eventType: ChannelMessagePayload["eventType"];
    }
  | { ok: false; status: number; error: string };

function isUnique(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2002";
}

function priorityOf(eventType: ChannelMessagePayload["eventType"]): number {
  return eventType === "CUSTOMER_QUESTION" ? 20 : 10;
}

export async function commitChannelMessage(
  unit: ChannelMessageUnit,
  input: ChannelMessagePayload & { channel: OsChannelKind },
): Promise<ChannelMessageCommit> {
  const key = messageIdempotencyKey(input.channel, input.storeId, input.externalMessageId);
  const prior = await unit.findByKey(key);
  if (prior) {
    return {
      ok: true,
      replayed: true,
      entryId: prior.id,
      productId: prior.productId,
      linked: prior.productId != null,
      eventType: prior.eventType,
    };
  }
  const product = await unit.findProduct(input.storeId, input.sku, input.externalProductId);
  const draft: ChannelMessageInsert = {
    storeId: input.storeId,
    productId: product?.id ?? null,
    channel: input.channel,
    eventType: input.eventType,
    externalMessageId: input.externalMessageId,
    customerLabel: input.customerLabel,
    body: input.body,
    idempotencyKey: key,
    priority: priorityOf(input.eventType),
  };
  try {
    const row = await unit.insert(draft);
    return {
      ok: true,
      replayed: false,
      entryId: row.id,
      productId: row.productId,
      linked: row.productId != null,
      eventType: row.eventType,
    };
  } catch (error) {
    if (!isUnique(error)) {
      throw error;
    }
    const again = await unit.findByKey(key);
    if (!again) {
      return { ok: false, status: 409, error: "Mesaj fişi çakıştı." };
    }
    return {
      ok: true,
      replayed: true,
      entryId: again.id,
      productId: again.productId,
      linked: again.productId != null,
      eventType: again.eventType,
    };
  }
}
