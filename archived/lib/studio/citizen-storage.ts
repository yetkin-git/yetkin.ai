import "server-only";

import { createClient } from "@supabase/supabase-js";
import { ServiceUnavailableError } from "@/lib/kernel/http/errors";
import {
  STUDIO_SIGNED_READ_TTL_SECONDS,
  STUDIO_SIGNED_UPLOAD_TTL_SECONDS,
  STUDIO_STORAGE_BUCKET,
  type StudioAllowedMimeType,
  type StudioObjectStoreGateway,
} from "@/lib/studio/storage";

function requireAnonEnv(): { url: string; anon: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) {
    throw new ServiceUnavailableError("Studio nesne depo bağlı değil.");
  }
  return { url, anon };
}

/**
 * Vatandaş JWT + anon key. `SUPABASE_SERVICE_ROLE_KEY` yoktur.
 */
export function createCitizenStorageGateway(accessToken: string): StudioObjectStoreGateway {
  const token = accessToken.trim();
  if (!token) {
    throw new ServiceUnavailableError("Studio nesne depo bağlı değil.");
  }
  const { url, anon } = requireAnonEnv();
  const client = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const bucket = client.storage.from(STUDIO_STORAGE_BUCKET);

  return {
    async createSignedUploadUrl(path, options) {
      const { data, error } = await bucket.createSignedUploadUrl(path, {
        upsert: options?.upsert ?? true,
      });
      if (error || !data?.signedUrl || !data.token) {
        throw new ServiceUnavailableError("Studio nesne depo imzası alınamadı.");
      }
      return {
        signedPutUrl: data.signedUrl,
        token: data.token,
        expiresAt: new Date(Date.now() + STUDIO_SIGNED_UPLOAD_TTL_SECONDS * 1000),
      };
    },
    async uploadToSignedUrl(path, uploadToken, body, mimeType: StudioAllowedMimeType) {
      const { error } = await bucket.uploadToSignedUrl(path, uploadToken, body, {
        contentType: mimeType,
      });
      if (error) {
        throw new ServiceUnavailableError("Studio nesne yüklemesi tamamlanamadı.");
      }
    },
    async objectInfo(path) {
      const { data, error } = await bucket.info(path);
      if (error || !data) {
        return null;
      }
      const record = data as { size?: number; contentType?: string; content_type?: string };
      const byteSize = typeof record.size === "number" ? record.size : NaN;
      if (!Number.isFinite(byteSize)) {
        return null;
      }
      const mimeType = record.contentType ?? record.content_type ?? null;
      return { byteSize, mimeType };
    },
    async createSignedReadUrl(path, expiresIn = STUDIO_SIGNED_READ_TTL_SECONDS) {
      const { data, error } = await bucket.createSignedUrl(path, expiresIn);
      if (error || !data?.signedUrl) {
        throw new ServiceUnavailableError("Studio nesne okuma imzası alınamadı.");
      }
      return data.signedUrl;
    },
  };
}
