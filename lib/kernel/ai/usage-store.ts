import type { AmountMinor } from "@/lib/kernel/money/amount-minor";
import type { CurrencyCode } from "@/lib/kernel/money/currency";

/** LLM kullanım defteri — gümrük sonrası yazılır; nakit debit ayrı ledger kapısından. */
export type AiTokenUsageRecord = {
  id: string;
  userId: string | null;
  source: string;
  provider: string;
  model: string;
  roleKey: string | null;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costMinor: AmountMinor;
  currencyCode: CurrencyCode;
  idempotencyKey: string | null;
  createdAt: Date;
};

export type AiTokenUsageStore = {
  insert(record: AiTokenUsageRecord): Promise<AiTokenUsageRecord>;
  findByIdempotencyKey(idempotencyKey: string): Promise<AiTokenUsageRecord | null>;
};
