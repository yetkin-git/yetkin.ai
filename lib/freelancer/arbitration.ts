import { z } from "zod";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import {
  allocateMinorByShareBps,
  computeShareMinorFromBps,
  type AllocatedShare,
} from "@/lib/kernel/escrow/share-bps";

export const FREELANCER_ARBITRATION_SYSTEM = `Sen ${YETKIN_BRAND} freelancer tahkim bilirkişisisin.
Yalnız geçerli JSON üret. Rastgele hash, adillik tiyatrosu veya mahkeme evrakı yok.
Zorunlu şema:
{"rationale":"gerekçe","employerRefundBps":0,"arbitrationReady":true}
employerRefundBps, işveren iadesinin emanet NET payına oranıdır (0 = net çalışana, 10000 = net işverene).
Platform hold bu raporda değişmez. Kanıt yetersizse arbitrationReady=false yaz.`;

export const arbitrationReportSchema = z.object({
  rationale: z.string().trim().min(8).max(4000),
  employerRefundBps: z.number().int().min(0).max(10_000),
  arbitrationReady: z.boolean(),
});

export type ArbitrationReport = z.infer<typeof arbitrationReportSchema>;

export function parseArbitrationReportJson(text: string): ArbitrationReport | null {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = (fenced?.[1] ?? trimmed).trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  const result = arbitrationReportSchema.safeParse(parsed);
  return result.success ? result.data : null;
}

export function buildArbitrationPayees(input: {
  clientId: string;
  freelancerId: string;
  netMinor: number;
  employerRefundBps: number;
  squadMembers: Array<{ userId: string; shareBps: number }> | null;
}): { payees: AllocatedShare[]; allowPayerCredit: boolean } {
  const employerRefundMinor = computeShareMinorFromBps(input.netMinor, input.employerRefundBps);
  const workerPoolMinor = input.netMinor - employerRefundMinor;
  const payees: AllocatedShare[] = [];
  if (employerRefundMinor > 0) {
    payees.push({ userId: input.clientId, amountMinor: employerRefundMinor });
  }
  if (workerPoolMinor > 0) {
    if (input.squadMembers && input.squadMembers.length > 0) {
      payees.push(...allocateMinorByShareBps(workerPoolMinor, input.squadMembers));
    } else {
      payees.push({ userId: input.freelancerId, amountMinor: toAmountMinor(workerPoolMinor) });
    }
  }
  const unique = new Set(payees.map((row) => row.userId));
  if (unique.size !== payees.length) {
    throw new Error("Tahkim paydaşları çakışamaz.");
  }
  const sum = payees.reduce((total, row) => total + row.amountMinor, 0);
  if (sum !== input.netMinor) {
    throw new Error(`Tahkim neti ${sum} ≠ emanet neti ${input.netMinor}.`);
  }
  return { payees, allowPayerCredit: employerRefundMinor > 0 };
}
