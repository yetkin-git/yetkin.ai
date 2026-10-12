import { ConflictError } from "@/lib/kernel/http/errors";
import { WALLET_SURFACE_PATH } from "@/lib/kernel/identity/types";

export const ACCOUNT_CLOSE_BALANCE_BLOCK =
  `Cüzdanda kullanılmamış bakiye var. Hesabı kapatmadan önce ${WALLET_SURFACE_PATH} üzerinde Bakiyemi İade Et adımını tamamla.`;

export const ACCOUNT_CLOSE_REFUND_OPEN =
  "Kart iadesi henüz bitmedi. Hesap, iade kapanınca kapatılabilir.";

export const ACCOUNT_CLOSE_CONFIRM = "KAPAT" as const;

export function anonymizedCitizenEmail(userId: string): string {
  return `closed.${userId}@anon.yetkin.invalid`;
}

export function assertAccountCloseable(balanceMinor: number): void {
  if (balanceMinor > 0) {
    throw new ConflictError(ACCOUNT_CLOSE_BALANCE_BLOCK);
  }
}

/**
 * Ürün kapıları (T-02). Hesap silinmeden önce çalışır ve yalnız okur; reddetmek için hata fırlatır.
 * Kernel ürün adı bilmez: ürün modülü kendi kapısını `registerAccountCloseGuard` ile kaydeder.
 */
export type AccountCloseGuard = (userId: string) => Promise<void>;

const accountCloseGuards = new Set<AccountCloseGuard>();

/** Kaydı geri alan fonksiyon döner; testler ve yeniden yükleme için. */
export function registerAccountCloseGuard(guard: AccountCloseGuard): () => void {
  accountCloseGuards.add(guard);
  return () => {
    accountCloseGuards.delete(guard);
  };
}

export async function runAccountCloseGuards(userId: string): Promise<void> {
  for (const guard of accountCloseGuards) {
    await guard(userId);
  }
}
