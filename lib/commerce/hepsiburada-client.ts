/** Hepsiburada liste ve sipariş kapısı. Kimlik Basic `apiKey:apiSecret`, satıcı numarası yoldadır. */
export const HEPSIBURADA_LISTING_BASE = "https://listing-external.hepsiburada.com";

export const HEPSIBURADA_OMS_BASE = "https://oms-external.hepsiburada.com";

export const HEPSIBURADA_ORDER_PAGE_SIZE = 50;

export const HEPSIBURADA_ORDER_MAX_PAGES = 20;

export const HEPSIBURADA_ORDER_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

const SALE_STATUSES = new Set(["open", "packaged", "intransit", "shipped", "delivered", "picking", "invoiced"]);

export class HepsiburadaRemoteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HepsiburadaRemoteError";
  }
}

export type HepsiburadaFetch = (url: string, init: RequestInit) => Promise<Response>;

export type HepsiburadaOrderLine = {
  lineId: string;
  barcode: string;
  quantity: number;
  status: string | null;
};

export type HepsiburadaOrderPackage = {
  packageId: string;
  orderNumber: string;
  merchantId: string;
  status: string | null;
  currencyCode: string | null;
  lines: HepsiburadaOrderLine[];
};

export function hepsiburadaStockPath(merchantId: string): string {
  return `/listings/merchantid/${encodeURIComponent(merchantId)}/stock-uploads`;
}

export function hepsiburadaPricePath(merchantId: string): string {
  return `/listings/merchantid/${encodeURIComponent(merchantId)}/price-uploads`;
}

export function hepsiburadaOrdersPath(merchantId: string): string {
  return `/orders/merchantid/${encodeURIComponent(merchantId)}`;
}

export function hepsiburadaOrderWindow(now: Date): { beginDate: string; endDate: string } {
  const end = now.getTime();
  return {
    beginDate: new Date(end - HEPSIBURADA_ORDER_WINDOW_MS).toISOString(),
    endDate: now.toISOString(),
  };
}

export function hepsiburadaPushQuantity(onHandQty: number, safetyBuffer: number): number {
  const sellable = Math.max(0, onHandQty - safetyBuffer);
  if (!Number.isSafeInteger(sellable)) {
    throw new HepsiburadaRemoteError("Hepsiburada stok tavanı aşıldı.");
  }
  return sellable;
}

function amountMinorToTry(amountMinor: number): number {
  return Number((amountMinor / 100).toFixed(2));
}

function assertMerchantId(merchantId: string): void {
  if (!/^[A-Za-z0-9]{4,40}$/.test(merchantId) || !/\d{4}$/.test(merchantId)) {
    throw new HepsiburadaRemoteError("Hepsiburada satıcı numarası geçersiz.");
  }
}

function headers(merchantId: string, apiKey: string, apiSecret: string): Headers {
  return new Headers({
    authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`, "utf8").toString("base64")}`,
    "user-agent": `${merchantId} - SelfIntegration`,
    "content-type": "application/json",
    accept: "application/json",
  });
}

function readText(value: unknown, max: number): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const text = value.trim();
  if (text.length < 1 || text.length > max) {
    return null;
  }
  return text;
}

function readId(value: unknown): string | null {
  const text = typeof value === "number" && Number.isSafeInteger(value) && value > 0 ? String(value) : readText(value, 64);
  if (!text || !/^[A-Za-z0-9-]{1,64}$/.test(text)) {
    return null;
  }
  return text;
}

function readLine(value: unknown): HepsiburadaOrderLine | null {
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const row = value as Record<string, unknown>;
  const lineId = readId(row.lineId ?? row.lineItemId ?? row.id);
  const barcode = readText(row.barcode, 40) ?? readText(row.merchantSku, 40) ?? readText(row.hepsiburadaSku, 40);
  const quantity = row.quantity;
  if (!lineId || !barcode || typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) {
    return null;
  }
  return { lineId, barcode, quantity, status: readText(row.status, 40) };
}

function readPackage(value: unknown): HepsiburadaOrderPackage | null {
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const row = value as Record<string, unknown>;
  const packageId = readId(row.packageId ?? row.packageNumber ?? row.id);
  const merchantId = readText(row.merchantId, 40);
  if (!packageId || !merchantId || !Array.isArray(row.lines ?? row.items)) {
    return null;
  }
  const rawLines = (row.lines ?? row.items) as unknown[];
  return {
    packageId,
    orderNumber: readId(row.orderNumber) ?? packageId,
    merchantId,
    status: readText(row.status, 40),
    currencyCode: readText(row.currencyCode ?? row.currency, 3),
    lines: rawLines.flatMap((line) => {
      const parsed = readLine(line);
      return parsed ? [parsed] : [];
    }),
  };
}

export function readHepsiburadaOrderPackages(payload: unknown): HepsiburadaOrderPackage[] {
  if (Array.isArray(payload)) {
    return payload.flatMap((item) => {
      const parsed = readPackage(item);
      return parsed ? [parsed] : [];
    });
  }
  if (payload != null && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    for (const key of ["content", "items", "data"] as const) {
      if (Array.isArray(record[key])) {
        return (record[key] as unknown[]).flatMap((item) => {
          const parsed = readPackage(item);
          return parsed ? [parsed] : [];
        });
      }
    }
  }
  const single = readPackage(payload);
  return single ? [single] : [];
}

export function hepsiburadaPackageConsumesStock(pkg: Pick<HepsiburadaOrderPackage, "status">): boolean {
  if (!pkg.status) {
    return false;
  }
  return SALE_STATUSES.has(pkg.status.toLowerCase());
}

export function hepsiburadaLineConsumesStock(line: HepsiburadaOrderLine): boolean {
  if (!line.status) {
    return true;
  }
  return SALE_STATUSES.has(line.status.toLowerCase());
}

async function assertOk(response: Response, label: string): Promise<void> {
  if (response.ok) {
    return;
  }
  throw new HepsiburadaRemoteError(`${label} ${response.status}`);
}

export async function pushHepsiburadaPriceAndStock(input: {
  merchantId: string;
  apiKey: string;
  apiSecret: string;
  merchantSku: string;
  hepsiburadaSku: string;
  quantity: number;
  amountMinor: number;
  fetchImpl?: HepsiburadaFetch;
  baseUrl?: string;
}): Promise<void> {
  assertMerchantId(input.merchantId);
  const fetchImpl = input.fetchImpl ?? fetch;
  const base = (input.baseUrl ?? HEPSIBURADA_LISTING_BASE).replace(/\/$/, "");
  const head = headers(input.merchantId, input.apiKey, input.apiSecret);
  const stock = await fetchImpl(`${base}${hepsiburadaStockPath(input.merchantId)}`, {
    method: "POST",
    headers: head,
    body: JSON.stringify([
      {
        merchantSku: input.merchantSku,
        hepsiburadaSku: input.hepsiburadaSku,
        availableStock: input.quantity,
      },
    ]),
  });
  await assertOk(stock, "Hepsiburada stok itme");
  const price = await fetchImpl(`${base}${hepsiburadaPricePath(input.merchantId)}`, {
    method: "POST",
    headers: head,
    body: JSON.stringify([
      {
        merchantSku: input.merchantSku,
        hepsiburadaSku: input.hepsiburadaSku,
        price: amountMinorToTry(input.amountMinor),
      },
    ]),
  });
  await assertOk(price, "Hepsiburada fiyat itme");
}

export async function pullHepsiburadaOrderPage(input: {
  merchantId: string;
  apiKey: string;
  apiSecret: string;
  beginDate: string;
  endDate: string;
  page: number;
  fetchImpl?: HepsiburadaFetch;
  baseUrl?: string;
}): Promise<HepsiburadaOrderPackage[]> {
  assertMerchantId(input.merchantId);
  const fetchImpl = input.fetchImpl ?? fetch;
  const base = (input.baseUrl ?? HEPSIBURADA_OMS_BASE).replace(/\/$/, "");
  const query = new URLSearchParams({
    begindate: input.beginDate,
    enddate: input.endDate,
    offset: String(input.page * HEPSIBURADA_ORDER_PAGE_SIZE),
    limit: String(HEPSIBURADA_ORDER_PAGE_SIZE),
  });
  const response = await fetchImpl(`${base}${hepsiburadaOrdersPath(input.merchantId)}?${query.toString()}`, {
    method: "GET",
    headers: headers(input.merchantId, input.apiKey, input.apiSecret),
  });
  await assertOk(response, "Hepsiburada sipariş çekme");
  const json: unknown = await response.json().catch(() => null);
  return readHepsiburadaOrderPackages(json);
}
