import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { appendLedgerEntry } from "@/lib/kernel/ledger/engine";
import { createPrismaLedgerStore } from "@/lib/kernel/ledger/prisma-store";
import { toAmountMinor, toPositiveAmountMinor } from "@/lib/kernel/money/amount-minor";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { isInsufficientBalanceError } from "@/lib/kernel/money/insufficient-balance";
import { classifyExistingPaidCommand } from "@/lib/kernel/ai/paid-command";
import { grantReportDocxBase64 } from "@/lib/tezgah/grant/docx";
import { generateGrantProject } from "@/lib/tezgah/grant/engine";
import { grantReservationExpired } from "@/lib/tezgah/grant/reservation-ttl";
import { renderGrantProjectText } from "@/lib/tezgah/grant/render";
import type { GrantGenerateRequest } from "@/lib/tezgah/grant/schema";
import type { GrantProjectReport } from "@/lib/tezgah/grant/types";
import {
  readTezgahCatalogAmount,
  TEZGAH_GRANT_DEBIT_PURPOSE,
  TEZGAH_GRANT_SCOPE,
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
 *
 * Ş3 / B-03 — **tek komut bağı**. Ödeme başlatılırken üretilen `commandKey`
 * (`Idempotency-Key`) buraya taşınır: aynı anahtar hem rezervasyonu hem defter
 * DEBIT'ini hem `hibe_dossiers.command_key` satırını bağlar. Kullanıcı ödedikten
 * sonra formu baştan doldurmaz; dosya üretimi ilk çağrıda kaldığı yerden sürer.
 */
export async function generatePaidGrantDossier(input: {
  userId: string;
  commandKey: string;
  request: GrantGenerateRequest;
  now?: Date;
}): Promise<PaidGrantDossierResult> {
  const amount = await readTezgahCatalogAmount("hibe/dossier");
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
  let existing = await prisma.paidCommandReservation.findUnique({ where });
  if (existing && existing.requestHash !== requestHash) {
    return { ok: false, error: "Bu Idempotency-Key başka bir dosyada.", status: 409 };
  }
  if (existing?.status === "SETTLED" && existing.providerJson) {
    const stored = JSON.parse(existing.providerJson) as {
      markdown?: string;
      report?: GrantProjectReport;
    };
    if (stored.markdown && stored.report) {
      return {
        ok: true,
        report: stored.report,
        markdown: stored.markdown,
        docxBase64: grantReportDocxBase64(stored.report),
        filename: filename(),
      };
    }
  }
  if (existing?.status === "RESERVED" && grantReservationExpired(existing.createdAt, now)) {
    existing = await prisma.paidCommandReservation.update({
      where,
      data: { status: "FAILED", updatedAt: now },
    });
  }
  if (existing?.status === "RESERVED") {
    return { ok: false, error: "Bu dosya hazırlanıyor.", status: 409 };
  }
  const wallet = await prisma.wallet.findUnique({
    where: { userId_currencyCode: { userId: input.userId, currencyCode: SETTLEMENT_CURRENCY } },
    select: { amountMinor: true },
  });
  if (!wallet || wallet.amountMinor < amount) {
    return { ok: false, error: "Cüzdan bakiyesi bu dosya için yetmiyor.", status: 402 };
  }
  if (!existing) {
    try {
      existing = await prisma.paidCommandReservation.create({
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
      return { ok: false, error: "Bu dosya hazırlanıyor.", status: 409 };
    }
  } else {
    existing = await prisma.paidCommandReservation.update({
      where,
      data: {
        status: "RESERVED",
        requestHash,
        estimatedMinor: amount,
        createdAt: now,
        updatedAt: now,
        providerJson: null,
        settledAt: null,
      },
    });
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
    await prisma.paidCommandReservation.update({
      where,
      data: { status: "FAILED", updatedAt: now },
    });
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
      await prisma.paidCommandReservation.update({
        where,
        data: { status: "FAILED", updatedAt: now },
      });
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
  await prisma.hibeDossier.upsert({
    where: { userId_commandKey: { userId: input.userId, commandKey: input.commandKey } },
    create: {
      userId: input.userId,
      grantId: report.eligible[0]?.grantId ?? null,
      title: report.businessName,
      markdown,
      reportJson: JSON.parse(JSON.stringify(report)) as object,
      commandKey: input.commandKey,
      createdAt: now,
    },
    update: {
      grantId: report.eligible[0]?.grantId ?? null,
      title: report.businessName,
      markdown,
      reportJson: JSON.parse(JSON.stringify(report)) as object,
    },
  });
  return {
    ok: true,
    report,
    markdown,
    docxBase64: grantReportDocxBase64(report),
    filename: filename(),
  };
}
