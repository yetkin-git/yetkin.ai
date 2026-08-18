import * as SecureStore from "expo-secure-store";
import type { KvStore } from "./types";

const OPTIONS: SecureStore.SecureStoreOptions = {
  keychainService: "rail.is.dron",
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
};

/** iOS Keychain / Android Keystore. Düz SharedPreferences veya AsyncStorage değildir. */
export function createExpoSecureStoreBackend(): KvStore {
  return {
    async getItem(key: string): Promise<string | null> {
      return SecureStore.getItemAsync(key, OPTIONS);
    },
    async setItem(key: string, value: string): Promise<void> {
      await SecureStore.setItemAsync(key, value, OPTIONS);
    },
    async removeItem(key: string): Promise<void> {
      await SecureStore.deleteItemAsync(key, OPTIONS);
    },
  };
}
