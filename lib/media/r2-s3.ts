/**
 * Cloudflare R2 için dar S3 imzası (AWS SigV4, bölge `auto`).
 * Yalnız yazma betiği çağırır. Uygulama paketine girmez.
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

export function signR2Request(input: {
  method: "PUT" | "HEAD";
  endpoint: string;
  bucket: string;
  objectKey: string;
  accessKeyId: string;
  secretAccessKey: string;
  payloadHash: string;
  contentType?: string;
  cacheControl?: string;
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
