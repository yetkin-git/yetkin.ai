/**
 * YetkinHibe fail-closed sinyalleri — yetkisiz erişim ve bulunamayan çağrı durumlarında
 * HTTP durum koduna eşlenen hata sınıfı. Rota katmanı (F3b) bu sınıfı fırlatır ve eşler.
 */

import { YETKINHIBE_COPY } from "@/lib/yetkinhibe/copy";

export type GrantFailClosedCode =
  | "company_membership_required"
  | "grant_not_found"
  | "application_not_found";

export class GrantFailClosedError extends Error {
  readonly code: GrantFailClosedCode;
  readonly userFacingMessage: string;

  constructor(code: GrantFailClosedCode) {
    const userFacingMessage =
      code === "company_membership_required"
        ? YETKINHIBE_COPY.failClosed.companyMembershipRequired
        : code === "grant_not_found"
          ? YETKINHIBE_COPY.errors.grantNotFound
          : YETKINHIBE_COPY.errors.applicationNotFound;
    super(userFacingMessage);
    this.name = "GrantFailClosedError";
    this.code = code;
    this.userFacingMessage = userFacingMessage;
  }
}

export function isGrantFailClosedError(error: unknown): error is GrantFailClosedError {
  return error instanceof GrantFailClosedError;
}

export function grantFailClosedHttpStatus(code: GrantFailClosedCode): number {
  return code === "company_membership_required" ? 403 : 404;
}
