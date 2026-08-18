import { createV1HttpClient, type V1HttpClient } from "../api/client";
import { createDronSupabaseAuth, readDronAccessToken, refreshDronAccessToken } from "../auth/supabase";
import {
  isDronApiConfigured,
  isDronAuthConfigured,
  readDronPublicEnv,
  type DronPublicEnv,
} from "../env";
import { createChunkedKvStore } from "../storage/chunked-store";
import { createExpoSecureStoreBackend } from "../storage/secure-store";
import type { KvStore } from "../storage/types";
import { RAIL_IS_COPY } from "../ui/copy";
import { webWalletUrl } from "../ui/present-wallet";

export type DronRuntime = {
  env: DronPublicEnv;
  store: KvStore;
  auth: ReturnType<typeof createDronSupabaseAuth> | null;
  api: V1HttpClient | null;
  webWalletUrl: string | null;
  configError: string | null;
};

export function createDronRuntime(): DronRuntime {
  const env = readDronPublicEnv();
  const store = createChunkedKvStore(createExpoSecureStoreBackend());
  const authConfigured = isDronAuthConfigured(env);
  const apiConfigured = isDronApiConfigured(env);

  let auth: DronRuntime["auth"] = null;
  if (authConfigured) {
    auth = createDronSupabaseAuth(env.supabaseUrl, env.supabaseAnonKey);
  }

  let api: V1HttpClient | null = null;
  if (apiConfigured) {
    api = createV1HttpClient({
      baseUrl: env.railApiBase,
      getAccessToken: async () => (auth ? readDronAccessToken(auth) : null),
      refreshAccessToken: async () => (auth ? refreshDronAccessToken(auth) : null),
    });
  }

  let configError: string | null = null;
  if (!authConfigured) {
    configError = RAIL_IS_COPY.login.unbound;
  } else if (!apiConfigured) {
    configError = RAIL_IS_COPY.login.apiMissing;
  }

  return {
    env,
    store,
    auth,
    api,
    webWalletUrl: apiConfigured ? webWalletUrl(env.railApiBase) : null,
    configError,
  };
}
