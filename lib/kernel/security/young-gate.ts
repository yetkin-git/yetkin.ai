import { DRON_YOUNG_OPEN_ENV } from "@/lib/dronlar/kayit";

/**
 * Young kapısı. Oda kapısıdır. Profil masası değildir.
 * `1|true|open` lise rafını açar. Boşken kayıt satırının `kapali` değeri durur.
 */

export { DRON_YOUNG_OPEN_ENV };

const OPEN_VALUES = new Set(["1", "true", "open"]);

export function isDronYoungOpen(env: NodeJS.ProcessEnv = process.env): boolean {
  const raw = env[DRON_YOUNG_OPEN_ENV]?.trim().toLowerCase() ?? "";
  return OPEN_VALUES.has(raw);
}
