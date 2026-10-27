/**
 * 6. sınıf matematik MEB şerit taşıması.
 * Yönlendirme yalnız katalogda kalmayan numaralar içindir (27..38).
 * Canlı anahtar canlı anahtara bağlanan satırlar çalışma zamanında işlemezdi
 * ve yerel izi misafir deneme kancasına yapıştırırdı. O satırlar silindi.
 * Misafir deneme kancası `JUNIOR_GUEST_TRIAL_HOOKS` yerinde kalır.
 */

/** Bir kez anlatış ve bir kez konu testi. `JUNIOR_PILOT_TRIAL_LESSON_KEYS` ile aynı üçlü. */
export const JUNIOR_GUEST_TRIAL_HOOKS = ["jr_06_mat-1", "jr_06_mat-2", "jr_06_mat-3"] as const;

export const JUNIOR_MAT_LEGACY_LESSON_KEY = {
  "jr_06_mat-27": "jr_06_mat-6",
  "jr_06_mat-28": "jr_06_mat-12",
  "jr_06_mat-29": "jr_06_mat-13",
  "jr_06_mat-30": "jr_06_mat-14",
  "jr_06_mat-31": "jr_06_mat-15",
  "jr_06_mat-32": "jr_06_mat-16",
  "jr_06_mat-33": "jr_06_mat-17",
  "jr_06_mat-34": "jr_06_mat-20",
  "jr_06_mat-35": "jr_06_mat-21",
  "jr_06_mat-36": "jr_06_mat-22",
  "jr_06_mat-37": "jr_06_mat-25",
  "jr_06_mat-38": "jr_06_mat-26",
} as const;

const LIVE_MATH_KEYS = new Set<string>(Object.values(JUNIOR_MAT_LEGACY_LESSON_KEY));
const GUEST_TRIAL_HOOKS = new Set<string>(JUNIOR_GUEST_TRIAL_HOOKS);

const STORAGE_HEADS = [
  "yetkin.junior.lesson-progress.v1",
  "yetkin.junior.micro.v1",
  "yetkin.young.micro.v1",
] as const;

const REKEY_FLAG = "yetkin.junior.mat-meb-rekey.v1";

export function canonicalJuniorLessonKey(lessonKey: string): string {
  const key = lessonKey.trim();
  if (GUEST_TRIAL_HOOKS.has(key) || LIVE_MATH_KEYS.has(key)) return key;
  return JUNIOR_MAT_LEGACY_LESSON_KEY[key as keyof typeof JUNIOR_MAT_LEGACY_LESSON_KEY] ?? key;
}

/** Eski ders adresi katalogda yoksa yeni adresi döner. Canlı ders kendi adresinde kalır. */
export function juniorLegacyLessonRedirectPath(pathname: string): string | null {
  const bare = (pathname.split("#")[0] ?? "").split("?")[0] ?? "";
  const path = bare.length > 1 && bare.endsWith("/") ? bare.slice(0, -1) : bare;
  const match = /^\/junior\/ders\/([^/]+)$/u.exec(path);
  if (!match?.[1]) return null;
  let key = match[1];
  try {
    key = decodeURIComponent(key);
  } catch {
    return null;
  }
  const canonical = canonicalJuniorLessonKey(key);
  if (canonical === key) return null;
  return `/junior/ders/${canonical}`;
}

type KeyedStorage = Pick<Storage, "getItem" | "setItem" | "removeItem" | "key"> & { length: number };

function asKeyedStorage(storage: object | null | undefined): KeyedStorage | null {
  if (!storage) return null;
  const candidate = storage as Partial<KeyedStorage>;
  if (
    typeof candidate.getItem !== "function" ||
    typeof candidate.setItem !== "function" ||
    typeof candidate.removeItem !== "function" ||
    typeof candidate.key !== "function" ||
    typeof candidate.length !== "number"
  ) {
    return null;
  }
  return candidate as KeyedStorage;
}

function splitStorageKey(storageKey: string): { head: string; profile: string; lesson: string } | null {
  for (const head of STORAGE_HEADS) {
    const prefix = `${head}:`;
    if (!storageKey.startsWith(prefix)) continue;
    const rest = storageKey.slice(prefix.length);
    const sep = rest.lastIndexOf(":");
    if (sep <= 0) return null;
    const lesson = rest.slice(sep + 1);
    if (!lesson.startsWith("jr_06_mat-")) return null;
    return { head, profile: rest.slice(0, sep), lesson };
  }
  return null;
}

/**
 * Tarayıcı izini tek seferde taşır. Önce bütün eski anahtarlar okunur, sonra yazılır.
 * İkinci geçiş bayrak yüzünden durur. Misafir deneme kancasına yazılmaz.
 */
export function migrateJuniorMatLessonStorage(storage: KeyedStorage): void {
  if (storage.getItem(REKEY_FLAG) === "1") return;
  const keys: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key) keys.push(key);
  }
  const rows: { storageKey: string; head: string; profile: string; lesson: string; raw: string }[] = [];
  for (const storageKey of keys) {
    const parsed = splitStorageKey(storageKey);
    if (!parsed) continue;
    if (GUEST_TRIAL_HOOKS.has(parsed.lesson)) continue;
    if (!(parsed.lesson in JUNIOR_MAT_LEGACY_LESSON_KEY)) continue;
    const raw = storage.getItem(storageKey);
    if (raw == null) continue;
    rows.push({ storageKey, ...parsed, raw });
  }
  try {
    storage.setItem(REKEY_FLAG, "1");
  } catch {
    return;
  }
  const bucket = new Map<string, string>();
  const slot = (head: string, profile: string, lesson: string) => `${head}\u0000${profile}\u0000${lesson}`;
  for (const row of rows) {
    const nextLesson = JUNIOR_MAT_LEGACY_LESSON_KEY[row.lesson as keyof typeof JUNIOR_MAT_LEGACY_LESSON_KEY];
    if (GUEST_TRIAL_HOOKS.has(nextLesson)) continue;
    bucket.set(slot(row.head, row.profile, nextLesson), row.raw);
  }
  for (const [id, raw] of bucket) {
    const [head, profile, lesson] = id.split("\u0000");
    if (!head || profile == null || !lesson) continue;
    try {
      storage.setItem(`${head}:${profile}:${lesson}`, raw);
    } catch {
      /* dolu disk eski izi yerinde bırakır */
    }
  }
  for (const row of rows) {
    const wanted = bucket.get(slot(row.head, row.profile, row.lesson));
    if (wanted !== undefined && LIVE_MATH_KEYS.has(row.lesson)) continue;
    try {
      storage.removeItem(row.storageKey);
    } catch {
      /* silinemeyen emekli anahtar yeni dersi bozmaz */
    }
  }
}

export function migrateJuniorLessonStores(storage: object | null | undefined): void {
  const keyed = asKeyedStorage(storage);
  if (!keyed) return;
  migrateJuniorMatLessonStorage(keyed);
}
