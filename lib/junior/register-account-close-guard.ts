import { juniorAccountCloseGuard } from "@/lib/junior/account-close-guard";
import { registerAccountCloseGuard } from "@/lib/kernel/identity/close-account-gate";

/** Hesap kapanışında Junior paket, çocuk profili ve ödeme kapısını kernel'e kaydeder (T-02). Kayıt idempotenttir. */
export function registerJuniorAccountCloseGuard(): void {
  registerAccountCloseGuard(juniorAccountCloseGuard);
}
