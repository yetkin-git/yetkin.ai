import {
  isCitizenTestAccountEmail,
  isConfirmedAccountEmail,
  isSuperAdminActor,
  normalizeAccountEmail,
} from "@/lib/kernel/auth/super-admin";

/**
 * Junior kapısı. Kenar, sayfa ve API bu fonksiyonu okur.
 * Ders listesi ve ilk konu herkese açıktır.
 * İkinci konu, anlatış ve konu testi: yıllık paket veya kapalı beta izin listesi.
 * Kasa ayrıdır ve varsayılan kapalıdır.
 */

export const DRON_JUNIOR_OPEN_ENV = "DRON_JUNIOR_OPEN" as const;

export const JUNIOR_BETA_ALLOWLIST_ENV = "JUNIOR_BETA_ALLOWLIST" as const;

/** Boşken kasa kilitlidir. Açıkken üretim, deneme mağazayı satış saymaz. */
export const JUNIOR_CHECKOUT_OPEN_ENV = "JUNIOR_CHECKOUT_OPEN" as const;

const OPEN_VALUES = new Set(["1", "true", "open"]);

export type JuniorActor = {
  id?: string | null;
  email?: string | null;
  emailConfirmedAt?: string | null;
} | null;

export type JuniorEnterIntent = "vitrine" | "lesson" | "paid-action" | "profile" | "checkout";

export type JuniorGateProfile = {
  id?: string | null;
  intent?: JuniorEnterIntent;
  /** Katalog kararı. Kernel ders metnini import etmez. */
  lessonAccess?: "free" | "locked" | "missing";
  /** Aktif yıllık paket bu dersi açıyor mu? İlk konunun ücretsiz olması bu bayrağı açmaz. */
  planCovers?: boolean;
} | null;

export type JuniorGateDecision =
  | { allow: true; via: "public" | "plan" | "audit" | "beta" }
  | { allow: false; reason: "missing" | "login" | "plan" | "closed-beta" | "money" };

export const JUNIOR_CLOSED_BETA_ERROR =
  "Bu masa kapalı betada. İzin listesindeki veli hesabı gerekir.";

export const JUNIOR_CHECKOUT_LOCKED_ERROR =
  "Ödeme hattı henüz bağlanmadı. Hukuki altyapı tamamlanmadan kasa açılmaz.";

export function isDronJuniorOpen(env: NodeJS.ProcessEnv = process.env): boolean {
  const raw = env[DRON_JUNIOR_OPEN_ENV]?.trim().toLowerCase() ?? "";
  return OPEN_VALUES.has(raw);
}

export function isJuniorCheckoutLocked(env: NodeJS.ProcessEnv = process.env): boolean {
  const raw = env[JUNIOR_CHECKOUT_OPEN_ENV]?.trim().toLowerCase() ?? "";
  return !OPEN_VALUES.has(raw);
}

export function juniorBetaAllowlist(env: NodeJS.ProcessEnv = process.env): ReadonlySet<string> {
  const raw = env[JUNIOR_BETA_ALLOWLIST_ENV] ?? "";
  const emails = raw
    .split(/[,;\s]+/)
    .map((item) => normalizeAccountEmail(item))
    .filter((item) => item.length > 0 && !isCitizenTestAccountEmail(item));
  return new Set(emails);
}

/** Süper yönetici veya doğrulanmış izin listesi. Nakit satırı yazmaz. */
export function isJuniorAuditActor(
  actor: JuniorActor,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (!actor?.id || !actor.email) {
    return false;
  }
  if (isCitizenTestAccountEmail(actor.email)) {
    return false;
  }
  if (
    isSuperAdminActor({
      id: actor.id,
      email: actor.email,
      emailConfirmedAt: actor.emailConfirmedAt,
    })
  ) {
    return true;
  }
  if (!isConfirmedAccountEmail(actor.emailConfirmedAt)) {
    return false;
  }
  return juniorBetaAllowlist(env).has(normalizeAccountEmail(actor.email));
}

export function canEnterJunior(
  actor: JuniorActor,
  lessonKey: string | null = null,
  profile: JuniorGateProfile = null,
  env: NodeJS.ProcessEnv = process.env,
): JuniorGateDecision {
  const intent: JuniorEnterIntent = profile?.intent ?? (lessonKey ? "lesson" : "vitrine");

  if (intent === "vitrine") {
    return { allow: true, via: "public" };
  }

  if (intent === "checkout") {
    if (isJuniorCheckoutLocked(env) || !actor?.id) {
      return { allow: false, reason: "money" };
    }
    return { allow: true, via: "beta" };
  }

  if (intent === "profile") {
    if (isJuniorAuditActor(actor, env)) {
      return { allow: true, via: "audit" };
    }
    if (isDronJuniorOpen(env) && actor?.id) {
      return { allow: true, via: "beta" };
    }
    return { allow: false, reason: "closed-beta" };
  }

  const access = profile?.lessonAccess ?? "locked";
  if (access === "missing") {
    return { allow: false, reason: "missing" };
  }

  if (intent === "lesson") {
    if (access === "free") {
      return { allow: true, via: "public" };
    }
    if (profile?.planCovers) {
      return { allow: true, via: "plan" };
    }
    if (isJuniorAuditActor(actor, env)) {
      return { allow: true, via: "audit" };
    }
    return { allow: false, reason: "plan" };
  }

  if (!actor?.id) {
    return { allow: false, reason: "login" };
  }
  if (isJuniorAuditActor(actor, env)) {
    return { allow: true, via: "audit" };
  }
  if (profile?.planCovers) {
    return { allow: true, via: "plan" };
  }
  return { allow: false, reason: "plan" };
}
