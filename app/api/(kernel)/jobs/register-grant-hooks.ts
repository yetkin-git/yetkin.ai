import {
  registerGrantCatalogVerifyHook,
  registerGrantReservationSweepHook,
  registerHibeLifecycleReminderHook,
} from "@/lib/kernel/jobs/grant-maintenance-hook";
import { runGrantCatalogVerify } from "@/lib/yetkinhibe/grant-catalog-verify";
import { runHibeLifecycleReminders } from "@/lib/yetkinhibe/lifecycle-reminders";
import { expireStaleGrantReservations } from "@/lib/tezgah/grant/reservation-ttl";

export function registerGrantMaintenanceHooks(): void {
  registerGrantCatalogVerifyHook(() => runGrantCatalogVerify());
  registerGrantReservationSweepHook(() => expireStaleGrantReservations());
  registerHibeLifecycleReminderHook(() => runHibeLifecycleReminders());
}
