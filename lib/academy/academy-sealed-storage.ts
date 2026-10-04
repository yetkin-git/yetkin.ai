/**
 * Özel academy-sealed kovasının kısa ömürlü adresi.
 * Yalnız sunucu. Tarayıcıya servis anahtarı gitmez.
 * Kenar (`proxy.ts`) bu dosyayı import etmez.
 */

import "server-only";

import { createClient } from "@supabase/supabase-js";
import {
  ACADEMY_SEALED_STORAGE_BUCKET,
  assertAcademySealedBucket,
  isAcademySealedObjectPath,
  registerAcademyStorageSigner,
} from "@/lib/academy/lesson-audio-grant";

type SealedSign = (bucket: string, objectPath: string, ttlSec: number) => Promise<string | null>;

function readServiceKey(env: Record<string, string | undefined>): string {
  return env.SUPABASE_SERVICE_ROLE_KEY?.trim() || env.SUPABASE_SECRET_KEY?.trim() || "";
}

async function signWithServiceRole(
  bucket: string,
  objectPath: string,
  ttlSec: number,
  env: Record<string, string | undefined>,
): Promise<string | null> {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const serviceKey = readServiceKey(env);
  if (!supabaseUrl || !serviceKey) {
    return null;
  }
  const client = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.storage.from(bucket).createSignedUrl(objectPath, ttlSec);
  if (error || !data?.signedUrl) {
    return null;
  }
  return data.signedUrl;
}

/**
 * Verilen nesnenin adresini üretir. Başka bir dosyaya kaymaz.
 * Anahtar veya kova cevabı yoksa null. Çağıran 503 bırakır.
 */
export async function signAcademySealedObject(
  objectPath: string,
  ttlSec: number,
  env: Record<string, string | undefined>,
  sign?: SealedSign,
): Promise<string | null> {
  try {
    assertAcademySealedBucket(ACADEMY_SEALED_STORAGE_BUCKET);
  } catch {
    return null;
  }
  if (!isAcademySealedObjectPath(objectPath) || ttlSec <= 0) {
    return null;
  }
  const signer = sign ?? ((bucket, path, ttl) => signWithServiceRole(bucket, path, ttl, env));
  try {
    return await signer(ACADEMY_SEALED_STORAGE_BUCKET, objectPath, ttlSec);
  } catch {
    return null;
  }
}

/** Adres üreticisinin kova imzasını bağlaması için bir kez kaydeder. */
export function ensureAcademySealedStorageSigner(): void {
  registerAcademyStorageSigner((objectPath, ttlSec, env) => signAcademySealedObject(objectPath, ttlSec, env));
}
