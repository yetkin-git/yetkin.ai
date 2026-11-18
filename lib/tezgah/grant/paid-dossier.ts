import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { appendLedgerEntry } from "@/lib/kernel/ledger/engine";
import { createPrismaLedgerStore } from "@/lib/kernel/ledger/prisma-store";
import { toAmountMinor, toPositiveAmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { isInsufficientBalanceError } from "@/lib/kernel/money/insufficient-balance";
import { classifyExistingPaidCommand } from "@/lib/kernel/ai/paid-command";
import { grantDossierDocxBase64 } from "@/lib/tezgah/grant/docx";
import { generateGrantProject } from "@/lib/tezgah/grant/engine";
import { renderGrantProjectText } from "@/lib/tezgah/grant/render";
import type { GrantGenerateRequest } from "@/lib/tezgah/grant/schema";
import type { GrantProjectReport } from "@/lib/tezgah/grant/types";
import {
  readTezgahCatalogAmount,
  TEZGAH_GRANT_DEBIT_PURPOSE,
  TEZGAH_GRANT_SCOPE,
  TEZGAH_GRANT_UNIT,
  tezgahRequestHash,
} from "@/lib/tezgah/paid-lane";

export const TEZGAH_GRANT_DOSSIER_CLOSED =
  "Tam hibe dosyasının katalog fiyatı açık değil. Ücretsiz özet günlük hakla sürer.";

export type PaidGrantDossierResult =
  | {
      ok: true;
      report: GrantProjectReport;
      markdown: string;
      docxBase64: string;
      filename: string;
    }
  | { ok: false; error: string; status: 400 | 402 | 409 | 422 | 429 | 503 };

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code: unknown }).code === "P2002";
}

function filename(): string {
  return "hibe-proje-dosyasi.docx";
}

/**
 * Tam hibe dosyası. Katalog satırı yoksa üretilmez.
 * Idempotency-Key aynı gövdeyle ikinci kez tahsil etmez.
 */
export async function generatePaidGrantDossier(input: {
  userId: string;
  commandKey: string;
  request: GrantGenerateRequest;
  now?: Date;
}): Promise<PaidGrantDossierResult> {
  const amount = await readTezgahCatalogAmount(TEZGAH_GRANT_UNIT);
  if (amount == null) {
    return { ok: false, error: TEZGAH_GRANT_DOSSIER_CLOSED, status: 422 };
  }
  if (!input.request.details) {
    return { ok: false, error: "Tam dosya ayrıntı ister.", status: 400 };
  }
  const now = input.now ?? new Date();
  const requestHash = tezgahRequestHash(input.request);
  const prisma = getPrisma();
  const where = {
    userId_scope_commandKey: {
      userId: input.userId,
      scope: TEZGAH_GRANT_SCOPE,
      commandKey: input.commandKey,
    },
  };
  try {
    await prisma.paidCommandReservation.create({
      data: {
        userId: input.userId,
        scope: TEZGAH_GRANT_SCOPE,
        commandKey: input.commandKey,
        requestHash,
        status: "RESERVED",
        estimatedMinor: amount,
        currencyCode: SETTLEMENT_CURRENCY,
        createdAt: now,
        updatedAt: now,
      },
    });
  } catch (error) {
    if (!isUniqueViolation(error)) {
      return { ok: false, error: "Dosya rezervi yazılamadı.", status: 503 };
    }
  }
  const existing = await prisma.paidCommandReservation.findUnique({ where });
  if (!existing) {
    return { ok: false, error: "Dosya rezervi kilitlenemedi.", status: 503 };
  }
  if (existing.requestHash !== requestHash) {
    return { ok: false, error: "Bu Idempotency-Key başka bir dosyada.", status: 409 };
  }
  if (existing.status === "SETTLED" && existing.providerJson) {
    const stored = JSON.parse(existing.providerJson) as {
      markdown?: string;
      report?: GrantProjectReport;
    };
    if (stored.markdown && stored.report) {
      return {
        ok: true,
        report: stored.report,
        markdown: stored.markdown,
        docxBase64: grantDossierDocxBase64(stored.markdown),
        filename: filename(),
      };
    }
  }
  const classified = classifyExistingPaidCommand(
    {
      id: existing.id,
      userId: existing.userId,
      scope: TEZGAH_GRANT_SCOPE,
      commandKey: existing.commandKey,
      requestHash: existing.requestHash,
      status: existing.status,
      estimatedMinor: toAmountMinor(existing.estimatedMinor),
      currencyCode: "TRY",
      providerJson: existing.providerJson,
      resultId: existing.resultId,
      createdAt: existing.createdAt,
      updatedAt: existing.updatedAt,
      settledAt: existing.settledAt,
    },
    requestHash,
  );
  if (classified.kind === "conflict") {
    return { ok: false, error: "Bu Idempotency-Key başka bir dosyada.", status: 409 };
  }
  const generated = await generateGrantProject({
    actorId: input.userId,
    guest: false,
    request: input.request,
    quotaMode: "prepaid",
  });
  if (!generated.ok) {
    return { ok: false, error: generated.error, status: generated.status };
  }
  const { remaining: _remaining, limit: _limit, guest: _guest, ok: _ok, ...report } = generated;
  const markdown = renderGrantProjectText(report);
  try {
    await appendLedgerEntry(createPrismaLedgerStore(), {
      userId: input.userId,
      currencyCode: "TRY",
      amountMinor: toPositiveAmountMinor(amount),
      direction: "DEBIT",
      label: "Hibe proje dosyası",
      purpose: TEZGAH_GRANT_DEBIT_PURPOSE,
      idempotencyKey: `${TEZGAH_GRANT_DEBIT_PURPOSE}:${input.userId}:${input.commandKey}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (isInsufficientBalanceError(message)) {
      return { ok: false, error: "Cüzdan bakiyesi bu dosya için yetmiyor.", status: 402 };
    }
    throw error;
  }
  await prisma.paidCommandReservation.update({
    where,
    data: {
      status: "SETTLED",
      providerJson: JSON.stringify({ markdown, report }),
      settledAt: now,
      updatedAt: now,
    },
  });
  return {
    ok: true,
    report,
    markdown,
    docxBase64: grantDossierDocxBase64(markdown),
    filename: filename(),
  };
}
