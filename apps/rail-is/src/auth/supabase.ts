import { createClient, type SupportedStorage } from "@supabase/supabase-js";
import { createChunkedKvStore } from "../storage/chunked-store";
import { createExpoSecureStoreBackend } from "../storage/secure-store";
import type { KvStore } from "../storage/types";

function asSupabaseStorage(store: KvStore): SupportedStorage {
  return {
    getItem: (key) => store.getItem(key),
    setItem: (key, value) => store.setItem(key, value),
    removeItem: (key) => store.removeItem(key),
  };
}

/**
 * Native Supabase Auth. Refresh Keychain/Keystore'dadır.
 * Çerez yok. service_role yok. `/api/v1/auth/refresh` yok.
 */
export function createDronSupabaseAuth(url: string, anonKey: string) {
  if (!url.trim() || !anonKey.trim()) {
    throw new Error("Supabase anon yapılandırması yok. Giriş henüz bağlanmadı.");
  }
  const storage = createChunkedKvStore(createExpoSecureStoreBackend());
  return createClient(url.trim(), anonKey.trim(), {
    auth: {
      storage: asSupabaseStorage(storage),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: "pkce",
    },
  });
}

export async function readDronAccessToken(
  client: ReturnType<typeof createDronSupabaseAuth>,
): Promise<string | null> {
  const { data } = await client.auth.getSession();
  return data.session?.access_token?.trim() || null;
}

export async function refreshDronAccessToken(
  client: ReturnType<typeof createDronSupabaseAuth>,
): Promise<string | null> {
  const { data, error } = await client.auth.refreshSession();
  if (error) {
    return null;
  }
  return data.session?.access_token?.trim() || null;
}
