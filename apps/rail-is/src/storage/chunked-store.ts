import type { KvStore } from "./types";

/** Android Keystore tek kayıt tavanı 2048 bayt; oturum JSON'u parçalanır. */
export const RAIL_SECURE_STORE_CHUNK_SIZE = 1800;
const CHUNK_COUNT_SUFFIX = ".n";

function chunkKey(key: string, index: number): string {
  return `${key}.${index}`;
}

function countKey(key: string): string {
  return `${key}${CHUNK_COUNT_SUFFIX}`;
}

/**
 * SecureStore / Keychain üstü parçalı depo.
 * Düz metin tercih deposu kullanılmaz. Çerez yazılmaz.
 */
export function createChunkedKvStore(backend: KvStore): KvStore {
  return {
    async getItem(key: string): Promise<string | null> {
      const countRaw = await backend.getItem(countKey(key));
      if (!countRaw) {
        return backend.getItem(key);
      }
      const count = Number.parseInt(countRaw, 10);
      if (!Number.isSafeInteger(count) || count <= 0) {
        return null;
      }
      const parts: string[] = [];
      for (let index = 0; index < count; index += 1) {
        const part = await backend.getItem(chunkKey(key, index));
        if (part == null) {
          return null;
        }
        parts.push(part);
      }
      return parts.join("");
    },

    async setItem(key: string, value: string): Promise<void> {
      await this.removeItem(key);
      if (value.length <= RAIL_SECURE_STORE_CHUNK_SIZE) {
        await backend.setItem(key, value);
        return;
      }
      const chunks: string[] = [];
      for (let offset = 0; offset < value.length; offset += RAIL_SECURE_STORE_CHUNK_SIZE) {
        chunks.push(value.slice(offset, offset + RAIL_SECURE_STORE_CHUNK_SIZE));
      }
      await backend.setItem(countKey(key), String(chunks.length));
      for (let index = 0; index < chunks.length; index += 1) {
        const part = chunks[index];
        if (part === undefined) {
          continue;
        }
        await backend.setItem(chunkKey(key, index), part);
      }
    },

    async removeItem(key: string): Promise<void> {
      const countRaw = await backend.getItem(countKey(key));
      const count = countRaw ? Number.parseInt(countRaw, 10) : 0;
      await backend.removeItem(key);
      await backend.removeItem(countKey(key));
      if (Number.isSafeInteger(count) && count > 0) {
        for (let index = 0; index < count; index += 1) {
          await backend.removeItem(chunkKey(key, index));
        }
      }
    },
  };
}

export function createMemoryKvStore(seed?: Record<string, string>): KvStore {
  const map = new Map<string, string>(Object.entries(seed ?? {}));
  return {
    async getItem(key) {
      return map.get(key) ?? null;
    },
    async setItem(key, value) {
      map.set(key, value);
    },
    async removeItem(key) {
      map.delete(key);
    },
  };
}
