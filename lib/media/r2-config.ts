/**
 * Cloudflare R2 (S3 uyumlu) yazma ayarı.
 * Anahtarlar yalnız süreç ortamından okunur. Bu dosya sır yazmaz.
 */

import { readMediaPublicBaseUrl } from "@/lib/media/public-url";

export type R2MediaConfig = {
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
  mediaBaseUrl: string;
};

export type R2MediaEnv = {
  R2_BUCKET_NAME?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_ENDPOINT?: string;
  R2_ACCOUNT_ID?: string;
  NEXT_PUBLIC_MEDIA_BASE_URL?: string;
};

const BUCKET_NAME = /^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/u;
const ACCOUNT_ID = /^[a-f0-9]{32}$/u;

export function normalizeR2Endpoint(raw: string): string {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new Error("R2_ENDPOINT geçerli bir https adresi olmalıdır.");
  }
  if (url.protocol !== "https:") {
    throw new Error("R2_ENDPOINT https olmalıdır.");
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error("R2_ENDPOINT kullanıcı, sorgu veya parça içeremez.");
  }
  const path = url.pathname.replace(/\/+$/u, "");
  if (path !== "") {
    throw new Error("R2_ENDPOINT yol içeremez. Kova adı R2_BUCKET_NAME içindedir.");
  }
  return url.origin;
}

/** Yazma betiği için tam ayar. Eksik alan varsa fırlatır. Sır metnini tekrarlamaz. */
export function readR2MediaConfig(env: R2MediaEnv): R2MediaConfig {
  const missing: string[] = [];
  const bucket = env.R2_BUCKET_NAME?.trim() ?? "";
  const accessKeyId = env.R2_ACCESS_KEY_ID?.trim() ?? "";
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY?.trim() ?? "";
  const endpointRaw = env.R2_ENDPOINT?.trim() ?? "";
  const accountId = env.R2_ACCOUNT_ID?.trim() ?? "";
  const mediaBaseUrl = readMediaPublicBaseUrl(env.NEXT_PUBLIC_MEDIA_BASE_URL);

  if (!bucket) {
    missing.push("R2_BUCKET_NAME");
  }
  if (!accessKeyId) {
    missing.push("R2_ACCESS_KEY_ID");
  }
  if (!secretAccessKey) {
    missing.push("R2_SECRET_ACCESS_KEY");
  }
  if (!endpointRaw && !accountId) {
    missing.push("R2_ENDPOINT veya R2_ACCOUNT_ID");
  }
  if (!mediaBaseUrl) {
    missing.push("NEXT_PUBLIC_MEDIA_BASE_URL");
  }
  if (missing.length > 0) {
    throw new Error(`Eksik veya geçersiz ortam değişkeni: ${missing.join(", ")}.`);
  }
  if (!BUCKET_NAME.test(bucket)) {
    throw new Error("R2_BUCKET_NAME yalnız küçük harf, rakam, nokta ve tire olabilir.");
  }

  let endpoint = "";
  if (endpointRaw) {
    endpoint = normalizeR2Endpoint(endpointRaw);
  } else {
    if (!ACCOUNT_ID.test(accountId)) {
      throw new Error("R2_ACCOUNT_ID 32 karakterlik onaltılık hesap kimliği olmalıdır.");
    }
    endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
  }

  return {
    bucket,
    accessKeyId,
    secretAccessKey,
    endpoint,
    mediaBaseUrl: mediaBaseUrl as string,
  };
}
