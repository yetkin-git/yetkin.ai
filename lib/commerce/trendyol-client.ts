/** Trendyol entegrasyon kapısı. 15 Ekim 2026 sonrası sipariş yolu v2'dir. */
export const TRENDYOL_API_BASE = "https://apigw.trendyol.com";

export const TRENDYOL_USER_AGENT_INTEGRATOR = "SelfIntegration";

export const TRENDYOL_MAX_PUSH_QUANTITY = 20_000;

export const TRENDYOL_ORDER_PAGE_SIZE = 200;

export const TRENDYOL_ORDER_MAX_PAGES = 50;

/** İki hafta, getShipmentPackages v2 tavanı. */
export const TRENDYOL_ORDER_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

const SALE_STATUSES = new Set([
  "created",
  "picking",
  "invoiced",
  "shipped",
  "delivered",
  "undelivered",
  "atcollectionpoint",
  "awaiting",
  "verified",
]);

export class TrendyolRemoteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TrendyolRemoteError";
  }
}

export type TrendyolFetch = (url: string, init: RequestInit) => Promise<Response>;

export type TrendyolOrderLine = {
  lineId: string;
  barcode: string;
  quantity: number;
  orderLineItemStatusName: string | null;
};

export type TrendyolOrderPackage = {
  shipmentPackageId: string;
  orderNumber: string;
  supplierId: string;
  status: string | null;
  shipmentPackageStatus: string | null;
  currencyCode: string | null;
  lines: TrendyolOrderLine[];
};

export function trendyolUserAgent(supplierId: string): string {
  return `${supplierId} - ${TRENDYOL_USER_AGENT_INTEGRATOR}`;
}

export function trendyolBasicAuthorization(apiKey: string, apiSecret: string): string {
  return `Basic ${Buffer.from(`${apiKey}:${apiSecret}`, "utf8").toString("base64")}`;
}

export function trendyolPriceStockPath(supplierId: string): string {
  return `/integration/inventory/sellers/${encodeURIComponent(supplierId)}/products/price-and-inventory`;
}

export function trendyolOrdersPath(supplierId: string): string {
  return `/integration/order/sellers/${encodeURIComponent(supplierId)}/v2/orders`;
}

export function trendyolOrderWindow(now: Date): { startDate: number; endDate: number } {
  const endDate = now.getTime();
  return { startDate: endDate - TRENDYOL_ORDER_WINDOW_MS, endDate };
}

export function amountMinorToTry(amountMinor: number): number {
  return Number((amountMinor / 100).toFixed(2));
}

export function trendyolPushQuantity(onHandQty: number, safetyBuffer: number): number {
  const sellable = Math.max(0, onHandQty - safetyBuffer);
  if (sellable > TRENDYOL_MAX_PUSH_QUANTITY) {
    throw new TrendyolRemoteError("Trendyol stok tavanı aşıldı.");
  }
  return sellable;
}

function readDigits(value: unknown, max: number): string | null {
  if (typeof value === "number" && Number.isSafeInteger(value) && value > 0) {
    const text = String(value);
    return text.length <= max ? text : null;
  }
  if (typeof value === "string" && /^\d{1,32}$/.test(value) && value.length <= max) {
    return value;
  }
  return null;
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

function readLine(value: unknown): TrendyolOrderLine | null {
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const row = value as Record<string, unknown>;
  const lineId = readDigits(row.lineId, 20);
  const barcode = readText(row.barcode, 40);
  const quantity = row.quantity;
  if (!lineId || !barcode || typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) {
    return null;
  }
  const status = readText(row.orderLineItemStatusName, 40);
  return { lineId, barcode, quantity, orderLineItemStatusName: status };
}

function readPackage(value: unknown): TrendyolOrderPackage | null {
  if (value == null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const row = value as Record<string, unknown>;
  const shipmentPackageId = readDigits(row.shipmentPackageId, 20);
  const supplierId = readDigits(row.supplierId, 20);
  if (!shipmentPackageId || !supplierId || !Array.isArray(row.lines)) {
    return null;
  }
  const lines = row.lines.flatMap((line) => {
    const parsed = readLine(line);
    return parsed ? [parsed] : [];
  });
  return {
    shipmentPackageId,
    orderNumber: readDigits(row.orderNumber, 32) ?? shipmentPackageId,
    supplierId,
    status: readText(row.status, 40),
    shipmentPackageStatus: readText(row.shipmentPackageStatus, 40),
    currencyCode: readText(row.currencyCode, 3),
    lines,
  };
}

export function readTrendyolOrderPackages(payload: unknown): TrendyolOrderPackage[] {
  if (payload != null && typeof payload === "object" && !Array.isArray(payload) && "content" in payload) {
    const content = (payload as { content?: unknown }).content;
    if (Array.isArray(content)) {
      return content.flatMap((item) => {
        const parsed = readPackage(item);
        return parsed ? [parsed] : [];
      });
    }
  }
  const single = readPackage(payload);
  return single ? [single] : [];
}

export function trendyolPackageConsumesStock(pkg: Pick<TrendyolOrderPackage, "status" | "shipmentPackageStatus">): boolean {
  const values = [pkg.status, pkg.shipmentPackageStatus].filter((value): value is string => Boolean(value));
  if (values.length === 0) {
    return false;
  }
  return values.every((value) => SALE_STATUSES.has(value.toLowerCase()));
}

export function trendyolLineConsumesStock(line: TrendyolOrderLine): boolean {
  if (!line.orderLineItemStatusName) {
    return true;
  }
  return SALE_STATUSES.has(line.orderLineItemStatusName.toLowerCase());
}

export function trendyolHeaders(supplierId: string, apiKey: string, apiSecret: string): Headers {
  return new Headers({
    authorization: trendyolBasicAuthorization(apiKey, apiSecret),
    "user-agent": trendyolUserAgent(supplierId),
    "content-type": "application/json",
    storefrontcode: "TR",
    "accept-language": "tr",
  });
}

function assertSupplierId(supplierId: string): void {
  if (!/^\d{4,20}$/.test(supplierId)) {
    throw new TrendyolRemoteError("Trendyol satıcı numarası geçersiz.");
  }
}

async function readErrorStatus(response: Response, label: string): Promise<never> {
  const text = (await response.text()).slice(0, 300);
  if (response.status === 400 && /15 dakika|same request|tekrar/i.test(text)) {
    throw new TrendyolDuplicateWindow();
  }
  throw new TrendyolRemoteError(`${label} ${response.status}`);
}

export class TrendyolDuplicateWindow extends Error {
  constructor() {
    super("Trendyol aynı stok gövdesini kısa pencerede yeniden kabul etmedi.");
    this.name = "TrendyolDuplicateWindow";
  }
}

export async function pushTrendyolPriceAndStock(
  input: {
    supplierId: string;
    apiKey: string;
    apiSecret: string;
    barcode: string;
    quantity: number;
    salePrice: number;
    listPrice: number;
    fetchImpl?: TrendyolFetch;
    baseUrl?: string;
  },
): Promise<{ batchRequestId: string | null }> {
  assertSupplierId(input.supplierId);
  const fetchImpl = input.fetchImpl ?? fetch;
  const base = (input.baseUrl ?? TRENDYOL_API_BASE).replace(/\/$/, "");
  const response = await fetchImpl(`${base}${trendyolPriceStockPath(input.supplierId)}`, {
    method: "POST",
    headers: trendyolHeaders(input.supplierId, input.apiKey, input.apiSecret),
    body: JSON.stringify({
      items: [
        {
          barcode: input.barcode,
          quantity: input.quantity,
          salePrice: input.salePrice,
          listPrice: input.listPrice,
        },
      ],
    }),
  });
  if (!response.ok) {
    try {
      await readErrorStatus(response, "Trendyol stok itme");
    } catch (error) {
      if (error instanceof TrendyolDuplicateWindow) {
        return { batchRequestId: null };
      }
      throw error;
    }
  }
  const json: unknown = await response.json().catch(() => null);
  const batch =
    json != null && typeof json === "object" && "batchRequestId" in json && typeof json.batchRequestId === "string"
      ? json.batchRequestId
      : null;
  if (!batch) {
    throw new TrendyolRemoteError("Trendyol stok yanıtı batchRequestId taşımıyor.");
  }
  return { batchRequestId: batch };
}

export async function pullTrendyolOrderPage(
  input: {
    supplierId: string;
    apiKey: string;
    apiSecret: string;
    startDate: number;
    endDate: number;
    page: number;
    fetchImpl?: TrendyolFetch;
    baseUrl?: string;
  },
): Promise<TrendyolOrderPackage[]> {
  assertSupplierId(input.supplierId);
  const fetchImpl = input.fetchImpl ?? fetch;
  const base = (input.baseUrl ?? TRENDYOL_API_BASE).replace(/\/$/, "");
  const query = new URLSearchParams({
    startDate: String(input.startDate),
    endDate: String(input.endDate),
    page: String(input.page),
    size: String(TRENDYOL_ORDER_PAGE_SIZE),
    orderByField: "PackageLastModifiedDate",
    orderByDirection: "ASC",
  });
  const response = await fetchImpl(`${base}${trendyolOrdersPath(input.supplierId)}?${query.toString()}`, {
    method: "GET",
    headers: trendyolHeaders(input.supplierId, input.apiKey, input.apiSecret),
  });
  if (!response.ok) {
    await readErrorStatus(response, "Trendyol sipariş çekme");
  }
  const json: unknown = await response.json().catch(() => null);
  return readTrendyolOrderPackages(json);
}
