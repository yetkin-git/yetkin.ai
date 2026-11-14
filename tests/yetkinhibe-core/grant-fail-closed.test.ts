import { describe, expect, it } from "vitest";

import { YETKINHIBE_COPY } from "@/lib/yetkinhibe/copy";
import {
  GrantFailClosedError,
  grantFailClosedHttpStatus,
  isGrantFailClosedError,
} from "@/lib/yetkinhibe/grant-fail-closed";

describe("GrantFailClosedError — fail-closed sinyalleri", () => {
  it("üyelik eksikliği 403 ve kurumsal mühür metniyle döner", () => {
    const error = new GrantFailClosedError("company_membership_required");

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("GrantFailClosedError");
    expect(error.code).toBe("company_membership_required");
    expect(error.userFacingMessage).toBe(YETKINHIBE_COPY.failClosed.companyMembershipRequired);
    expect(error.message).toBe(error.userFacingMessage);
    expect(grantFailClosedHttpStatus(error.code)).toBe(403);
  });

  it("bulunamayan çağrı 404 döner ve kendi metnini kullanır", () => {
    const error = new GrantFailClosedError("grant_not_found");

    expect(error.userFacingMessage).toBe("Bu hibe çağrısı bulunamadı.");
    expect(grantFailClosedHttpStatus(error.code)).toBe(404);
  });

  it("bulunamayan dosya 404 döner ve kendi metnini kullanır", () => {
    const error = new GrantFailClosedError("application_not_found");

    expect(error.userFacingMessage).toBe("Bu hibe dosyası bulunamadı.");
    expect(grantFailClosedHttpStatus(error.code)).toBe(404);
  });

  it("isGrantFailClosedError yalnız bu sınıfın örneklerini tanır", () => {
    expect(isGrantFailClosedError(new GrantFailClosedError("grant_not_found"))).toBe(true);
    expect(isGrantFailClosedError(new Error("başka hata"))).toBe(false);
    expect(isGrantFailClosedError(null)).toBe(false);
  });
});
