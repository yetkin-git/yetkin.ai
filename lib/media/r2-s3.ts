/**
 * Cloudflare R2 için dar S3 imzası (AWS SigV4, bölge `auto`).
 * Başlık imzası yazma betiğindedir. Sorgu imzalı GET, erişim kararı sonrası kısa ömürlü okuma adresidir.
 */

import { createHash, createHmac } from "node:crypto";

const REGION = "auto";
const SERVICE = "s3";
const EMPTY_PAYLOAD_HASH = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

export type R2SignedRequest = {
  url: string;
  headers: Record<string, string>;
};

function sha256Hex(data: Buffer | string): string {
  return createHash("sha256").update(data).digest("hex");
}

function hmac(key: Buffer | string, data: string): Buffer {
  return createHmac("sha256", key).update(data, "utf8").digest();
}

function awsUriEncode(value: string): string {
  return encodeURIComponent(value).replace(/[!'()*]/gu, (ch) =>
    `%${ch.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function encodeObjectKey(objectKey: string): string {
  return objectKey.split("/").map(awsUriEncode).join("/");
}

function amzDates(now: Date): { amz: string; stamp: string } {
  const iso = now.toISOString().replace(/[-:]/gu, "").replace(/\.\d{3}Z$/u, "Z");
  return { amz: iso, stamp: iso.slice(0, 8) };
}

function signingKey(secret: string, stamp: string): Buffer {
  const dateKey = hmac(`AWS4${secret}`, stamp);
  const regionKey = hmac(dateKey, REGION);
  const serviceKey = hmac(regionKey, SERVICE);
  return hmac(serviceKey, "aws4_request");
}

export type R2Method = "PUT" | "HEAD" | "GET" | "DELETE";

const META_NAME = /^[a-z0-9-]{1,64}$/u;

/** Meta veri adı `x-amz-meta-` önekiyle, küçük harfle yazılır. Değer satır sonu içermez, kırpılmış olmalıdır. */
function metadataHeaders(metadata: Readonly<Record<string, string>> | undefined): Array<[string, string]> {
  if (!metadata) {
    return [];
  }
  return Object.entries(metadata).map(([rawName, value]) => {
    const name = rawName.toLowerCase();
    if (!META_NAME.test(name)) {
      throw new Error("R2 meta veri adı geçersiz.");
    }
    if (value.length === 0 || value.length > 1024 || /[\r\n]/u.test(value) || value.trim() !== value) {
      throw new Error("R2 meta veri değeri geçersiz.");
    }
    return [`x-amz-meta-${name}`, value];
  });
}

export function signR2Request(input: {
  method: R2Method;
  endpoint: string;
  bucket: string;
  objectKey: string;
  accessKeyId: string;
  secretAccessKey: string;
  payloadHash: string;
  contentType?: string;
  cacheControl?: string;
  /** Nesne meta verisi. Örn. `{ sha256: "…" }` → `x-amz-meta-sha256` başlığı imzalanır. */
  metadata?: Readonly<Record<string, string>>;
  now?: Date;
}): R2SignedRequest {
  const endpoint = new URL(input.endpoint);
  const host = endpoint.host;
  const amz = amzDates(input.now ?? new Date());
  const canonicalUri = `/${awsUriEncode(input.bucket)}/${encodeObjectKey(input.objectKey)}`;
  const headerPairs: Array<[string, string]> = [
    ["host", host],
    ["x-amz-content-sha256", input.payloadHash],
    ["x-amz-date", amz.amz],
  ];
  if (input.contentType) {
    headerPairs.push(["content-type", input.contentType]);
  }
  if (input.cacheControl) {
    headerPairs.push(["cache-control", input.cacheControl]);
  }
  const extraMeta = metadataHeaders(input.metadata);
  for (const pair of extraMeta) {
    headerPairs.push(pair);
  }
  headerPairs.sort((a, b) => a[0].localeCompare(b[0]));
  const canonicalHeaders = headerPairs.map(([name, value]) => `${name}:${value.trim()}\n`).join("");
  const signedHeaders = headerPairs.map(([name]) => name).join(";");
  const canonicalRequest = [
    input.method,
    canonicalUri,
    "",
    canonicalHeaders,
    signedHeaders,
    input.payloadHash,
  ].join("\n");
  const scope = `${amz.stamp}/${REGION}/${SERVICE}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amz.amz, scope, sha256Hex(canonicalRequest)].join("\n");
  const signature = createHmac("sha256", signingKey(input.secretAccessKey, amz.stamp))
    .update(stringToSign, "utf8")
    .digest("hex");
  const headers: Record<string, string> = {
    Host: host,
    "x-amz-content-sha256": input.payloadHash,
    "x-amz-date": amz.amz,
    Authorization: `AWS4-HMAC-SHA256 Credential=${input.accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
  };
  if (input.contentType) {
    headers["Content-Type"] = input.contentType;
  }
  if (input.cacheControl) {
    headers["Cache-Control"] = input.cacheControl;
  }
  for (const [name, value] of extraMeta) {
    headers[name] = value;
  }
  return {
    url: `${endpoint.origin}${canonicalUri}`,
    headers,
  };
}

export function hashPayload(body: Buffer): string {
  return sha256Hex(body);
}

export const R2_EMPTY_PAYLOAD_HASH = EMPTY_PAYLOAD_HASH;

export const R2_OBJECT_CACHE_CONTROL = "public, max-age=31536000, immutable";

export const R2_PRESIGN_MIN_SEC = 60;
export const R2_PRESIGN_MAX_SEC = 900;
const UNSIGNED_PAYLOAD = "UNSIGNED-PAYLOAD";

/**
 * Sorgu imzası yalnız özel önek içindir.
 * Kamu `media/junior/...` anahtarı imzalanmaz; ücretli dosya tahmin edilebilir yola düşmez.
 */
function assertPresignObjectKey(objectKey: string): void {
  if (
    !objectKey ||
    !objectKey.startsWith("private/") ||
    objectKey.startsWith("/") ||
    objectKey.includes("..") ||
    objectKey.includes("\\") ||
    objectKey.includes("//") ||
    objectKey.endsWith("/")
  ) {
    throw new Error("R2 nesne anahtarı geçersiz.");
  }
  const segments = objectKey.split("/");
  if (segments.some((segment) => segment.length === 0 || segment === ".")) {
    throw new Error("R2 nesne anahtarı geçersiz.");
  }
}

/**
 * Sorgu imzalı GET. İmza sorguya yazılır; gizli anahtar adreste durmaz.
 * Süre aralığın dışındaysa adres üretilmez.
 */
export function presignR2GetUrl(input: {
  endpoint: string;
  bucket: string;
  objectKey: string;
  accessKeyId: string;
  secretAccessKey: string;
  expiresSec: number;
  now?: Date;
}): string {
  if (!Number.isInteger(input.expiresSec) || input.expiresSec < R2_PRESIGN_MIN_SEC || input.expiresSec > R2_PRESIGN_MAX_SEC) {
    throw new Error("R2 imzalı adres süresi 60 ile 900 saniye arasında olmalıdır.");
  }
  assertPresignObjectKey(input.objectKey);
  const endpoint = new URL(input.endpoint);
  const host = endpoint.host;
  const amz = amzDates(input.now ?? new Date());
  const scope = `${amz.stamp}/${REGION}/${SERVICE}/aws4_request`;
  const credential = `${input.accessKeyId}/${scope}`;
  const queryPairs: Array<[string, string]> = [
    ["X-Amz-Algorithm", "AWS4-HMAC-SHA256"],
    ["X-Amz-Credential", credential],
    ["X-Amz-Date", amz.amz],
    ["X-Amz-Expires", String(input.expiresSec)],
    ["X-Amz-SignedHeaders", "host"],
  ];
  queryPairs.sort((left, right) => (left[0] < right[0] ? -1 : left[0] > right[0] ? 1 : 0));
  const canonicalQuery = queryPairs.map(([name, value]) => `${awsUriEncode(name)}=${awsUriEncode(value)}`).join("&");
  const canonicalUri = `/${awsUriEncode(input.bucket)}/${encodeObjectKey(input.objectKey)}`;
  const canonicalRequest = ["GET", canonicalUri, canonicalQuery, `host:${host}\n`, "host", UNSIGNED_PAYLOAD].join("\n");
  const stringToSign = ["AWS4-HMAC-SHA256", amz.amz, scope, sha256Hex(canonicalRequest)].join("\n");
  const signature = createHmac("sha256", signingKey(input.secretAccessKey, amz.stamp))
    .update(stringToSign, "utf8")
    .digest("hex");
  return `${endpoint.origin}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}
