/**
 * Anonim asistan sayacı. İlk giriş 0; her başarılı yanıt +1.
 * localStorage ve `guest_question_count` çerezi aynı değeri taşır.
 * Sunucu kotası ayrıca `guest:<ip>` kovasıdır; bu sayaç istemci kapısıdır.
 * Üye oturumu bu sayacı okumaz.
 */

export const GUEST_QUESTION_COUNT_KEY = "guest_question_count";
export const GUEST_QUESTION_WINDOW_KEY = "guest_question_count_at";
/** Üye kotasıyla aynı tavan. Sapma `assistant-chat` testinde kilitlenir. */
export const ASSISTANT_GUEST_QUESTION_LIMIT = 5;
export const GUEST_QUESTION_WINDOW_MS = 24 * 60 * 60 * 1000;

export type GuestCountStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export function parseGuestQuestionCount(raw: string | null | undefined): number | null {
  if (raw == null) {
    return null;
  }
  const trimmed = raw.trim();
  if (!/^\d+$/.test(trimmed)) {
    return null;
  }
  const value = Number(trimmed);
  if (!Number.isSafeInteger(value)) {
    return null;
  }
  return value;
}

function windowIsFresh(openedAt: number, now: number): boolean {
  return Number.isFinite(openedAt) && openedAt <= now && now - openedAt < GUEST_QUESTION_WINDOW_MS;
}

/** Anahtar yoksa veya günlük pencere dolmuşsa 0 yazar. */
export function ensureGuestQuestionCount(
  storage: GuestCountStorage,
  now: number = Date.now(),
): number {
  const existing = parseGuestQuestionCount(storage.getItem(GUEST_QUESTION_COUNT_KEY));
  const openedAt = Number(storage.getItem(GUEST_QUESTION_WINDOW_KEY));
  if (existing == null || !windowIsFresh(openedAt, now)) {
    storage.setItem(GUEST_QUESTION_COUNT_KEY, "0");
    storage.setItem(GUEST_QUESTION_WINDOW_KEY, String(now));
    return 0;
  }
  storage.setItem(GUEST_QUESTION_COUNT_KEY, String(existing));
  return existing;
}

/** Başarılı anonim yanıt. Dönüş yeni sayaçtır. */
export function incrementGuestQuestionCount(
  storage: GuestCountStorage,
  now: number = Date.now(),
): number {
  const next = ensureGuestQuestionCount(storage, now) + 1;
  storage.setItem(GUEST_QUESTION_COUNT_KEY, String(next));
  return next;
}

/** Sunucunun kalan hakkından türetilen mutlak sayaç. */
export function writeGuestQuestionCount(
  storage: GuestCountStorage,
  count: number,
  now: number = Date.now(),
): number {
  const safe = Number.isSafeInteger(count) && count >= 0 ? count : 0;
  const openedAt = Number(storage.getItem(GUEST_QUESTION_WINDOW_KEY));
  if (!windowIsFresh(openedAt, now)) {
    storage.setItem(GUEST_QUESTION_WINDOW_KEY, String(now));
  }
  storage.setItem(GUEST_QUESTION_COUNT_KEY, String(safe));
  return safe;
}

export function guestQuestionsUsed(limit: number, remaining: number): number {
  if (!Number.isFinite(limit) || !Number.isFinite(remaining)) {
    return 0;
  }
  const cap = Math.max(0, Math.floor(limit));
  const left = Math.max(0, Math.floor(remaining));
  return Math.max(0, cap - left);
}

export function guestQuotaExhausted(
  count: number,
  limit: number = ASSISTANT_GUEST_QUESTION_LIMIT,
): boolean {
  return count >= limit;
}

/**
 * Oturum yoksa veya ölü yenileme jetonu oturumu null bıraktıysa anonim kova.
 * Geçerli üye kimliği kendi kotasında kalır.
 */
export function assistantActorId(
  sessionUserId: string | null | undefined,
  guestIp: string,
): { userId: string; guest: boolean } {
  const id = sessionUserId?.trim() ?? "";
  if (id.length > 0) {
    return { userId: id, guest: false };
  }
  const ip = guestIp.trim() || "unknown";
  return { userId: `guest:${ip}`, guest: true };
}

export function readGuestQuestionCookieValue(cookieHeader: string): string | null {
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf("=");
    if (eq <= 0) {
      continue;
    }
    if (trimmed.slice(0, eq) !== GUEST_QUESTION_COUNT_KEY) {
      continue;
    }
    const value = trimmed.slice(eq + 1);
    return parseGuestQuestionCount(value) == null ? null : value;
  }
  return null;
}

export function formatGuestQuestionCookie(value: string): string {
  const safe = parseGuestQuestionCount(value) ?? 0;
  return `${GUEST_QUESTION_COUNT_KEY}=${safe}; Path=/; Max-Age=86400; SameSite=Lax`;
}

export function createMirroredGuestCountStorage(
  local: GuestCountStorage,
  readCookie: () => string | null,
  writeCookie: (value: string) => void,
): GuestCountStorage {
  return {
    getItem(key) {
      const fromLocal = local.getItem(key);
      if (fromLocal != null) {
        return fromLocal;
      }
      if (key === GUEST_QUESTION_COUNT_KEY) {
        return readCookie();
      }
      return null;
    },
    setItem(key, value) {
      local.setItem(key, value);
      if (key === GUEST_QUESTION_COUNT_KEY) {
        writeCookie(value);
      }
    },
  };
}

function browserGuestCountStorage(): GuestCountStorage | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const local = window.localStorage;
    return createMirroredGuestCountStorage(
      local,
      () => readGuestQuestionCookieValue(document.cookie),
      (value) => {
        document.cookie = formatGuestQuestionCookie(value);
      },
    );
  } catch {
    return null;
  }
}

export function ensureBrowserGuestQuestionCount(now: number = Date.now()): number {
  const storage = browserGuestCountStorage();
  if (!storage) {
    return 0;
  }
  try {
    return ensureGuestQuestionCount(storage, now);
  } catch {
    return 0;
  }
}

export function incrementBrowserGuestQuestionCount(now: number = Date.now()): number {
  const storage = browserGuestCountStorage();
  if (!storage) {
    return 0;
  }
  try {
    return incrementGuestQuestionCount(storage, now);
  } catch {
    return 0;
  }
}
