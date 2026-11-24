/**
 * Son 24 saatteki iade / iptal fişinin kâr etkisi.
 * Defter tipi `RETURN_RESTOCK` hem iade hem iptal yazar; not `ORDER_RETURNED` / `ORDER_CANCELLED` ayırır.
 * `RETURN` ve `CANCEL` tipleri de aynı hesaba girer. Tutar uydurulmaz.
 */

export type ReturnLedgerRow = {
  type: string;
  note: string;
  quantity: number;
  productId: string;
};

export type ReturnImpact = {
  returnImpactMinor: number;
  returnedUnits: number;
  cancelledUnits: number;
};

export function classifyStockMovement(type: string, note: string): "RETURN" | "CANCEL" | null {
  const cancel =
    type === "CANCEL" || note.includes("ORDER_CANCELLED") || /(?:^|\s)event=CANCEL(?:\s|$)/.test(note);
  if (cancel && (type === "CANCEL" || type === "RETURN_RESTOCK" || type === "RETURN" || note.includes("ORDER_CANCELLED"))) {
    return "CANCEL";
  }
  if (type === "RETURN" || type === "RETURN_RESTOCK" || note.includes("ORDER_RETURNED")) {
    return "RETURN";
  }
  return null;
}

function variantIdFromNote(note: string): string {
  const match = /(?:^|\s)variant=([A-Za-z0-9_-]{1,64})(?:\s|$)/.exec(note);
  return match?.[1] ?? "";
}

/**
 * İade edilen kâr = birim net × adet. Birim net bilinmiyorsa o satırın tutarı 0 kalır.
 */
export function summarizeReturnImpact(input: {
  ledgers: readonly ReturnLedgerRow[];
  netMinorByVariantId: Readonly<Record<string, number>>;
  variantIdsByProductId: Readonly<Record<string, readonly string[]>>;
}): ReturnImpact {
  let returnImpactMinor = 0;
  let returnedUnits = 0;
  let cancelledUnits = 0;

  for (const row of input.ledgers) {
    const kind = classifyStockMovement(row.type, row.note);
    if (!kind || !Number.isInteger(row.quantity) || row.quantity < 1) {
      continue;
    }
    if (kind === "CANCEL") {
      cancelledUnits += row.quantity;
    } else {
      returnedUnits += row.quantity;
    }
    const noted = variantIdFromNote(row.note);
    let net: number | null = null;
    if (noted && Object.prototype.hasOwnProperty.call(input.netMinorByVariantId, noted)) {
      net = input.netMinorByVariantId[noted] ?? null;
    } else {
      const known = (input.variantIdsByProductId[row.productId] ?? []).filter((id) =>
        Object.prototype.hasOwnProperty.call(input.netMinorByVariantId, id),
      );
      if (known.length === 1) {
        net = input.netMinorByVariantId[known[0]!] ?? null;
      }
    }
    if (net != null) {
      returnImpactMinor += net * row.quantity;
    }
  }

  return { returnImpactMinor, returnedUnits, cancelledUnits };
}
