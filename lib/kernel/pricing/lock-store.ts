import type { CheckoutPriceLockSnapshot } from "@/lib/kernel/pricing/price-lock";

export type CheckoutPriceLockWrite = Omit<CheckoutPriceLockSnapshot, "id" | "consumedAt"> & {
  id?: string;
  consumedAt?: Date | null;
};

export type CheckoutPriceLockStore = {
  findById(id: string): Promise<CheckoutPriceLockSnapshot | null>;
  findByUserAndLockKey(userId: string, lockKey: string): Promise<CheckoutPriceLockSnapshot | null>;
  upsertLock(input: CheckoutPriceLockWrite): Promise<CheckoutPriceLockSnapshot>;
  markConsumed(id: string, at: Date): Promise<CheckoutPriceLockSnapshot>;
};
