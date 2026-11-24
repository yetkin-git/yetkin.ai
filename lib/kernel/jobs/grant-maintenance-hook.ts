/**
 * YetkinHibe bakım kancaları.
 * Kernel `lib/yetkinhibe` ve `lib/tezgah` import etmez.
 * Kayıt Inngest serve rotasındadır.
 */

export type GrantCatalogVerifyView = {
  scanned: number;
  closedWarnings: number;
  staleWarnings: number;
};

export type GrantReservationSweepView = {
  expired: number;
};

export type HibeLifecycleReminderView = {
  scanned: number;
  notified: number;
  skipped: number;
  reason: "ok" | "mail-unconfigured" | "no-database";
};

export type GrantCatalogVerifyHook = () => Promise<GrantCatalogVerifyView>;
export type GrantReservationSweepHook = () => Promise<GrantReservationSweepView>;
export type HibeLifecycleReminderHook = () => Promise<HibeLifecycleReminderView>;

let verifyHook: GrantCatalogVerifyHook | null = null;
let sweepHook: GrantReservationSweepHook | null = null;
let reminderHook: HibeLifecycleReminderHook | null = null;

export function registerGrantCatalogVerifyHook(next: GrantCatalogVerifyHook): void {
  verifyHook = next;
}

export function registerGrantReservationSweepHook(next: GrantReservationSweepHook): void {
  sweepHook = next;
}

export function registerHibeLifecycleReminderHook(next: HibeLifecycleReminderHook): void {
  reminderHook = next;
}

export async function notifyGrantCatalogVerifyHook(): Promise<GrantCatalogVerifyView | null> {
  if (!verifyHook) {
    return null;
  }
  return verifyHook();
}

export async function notifyGrantReservationSweepHook(): Promise<GrantReservationSweepView | null> {
  if (!sweepHook) {
    return null;
  }
  return sweepHook();
}

export async function notifyHibeLifecycleReminderHook(): Promise<HibeLifecycleReminderView | null> {
  if (!reminderHook) {
    return null;
  }
  return reminderHook();
}
