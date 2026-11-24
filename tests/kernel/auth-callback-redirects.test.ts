import { describe, expect, it } from "vitest";
import { PASSWORD_RECOVERY_PATH } from "@/lib/kernel/auth/password";
import {
  AUTH_CALLBACK_DEFAULT_NEXT,
  AUTH_CALLBACK_PATH,
  AUTH_LOGOUT_API_PATH,
  AUTH_REGISTER_API_PATH,
  AUTH_RESET_PASSWORD_API_PATH,
  AUTH_SIGNUP_FIRST_VALUE_NEXT,
  buildCitizenLoginHref,
  buildPasswordResetRedirectTo,
  buildSignupEmailRedirectTo,
  isSafeAuthNextPath,
  markSignupFirstValueLanding,
  resolveAuthCallbackNext,
  resolvePostLoginPath,
  supabaseDashboardRedirectUrls,
} from "@/lib/kernel/auth/redirects";

describe("Auth redirect sicili", () => {
  it("Dashboard URL listesi callback + sifre-yenile taşır", () => {
    expect(supabaseDashboardRedirectUrls("https://rail.example/")).toEqual([
      "https://rail.example/auth/callback",
      "https://rail.example/sifre-yenile",
    ]);
    expect(PASSWORD_RECOVERY_PATH).toBe("/sifre-yenile");
    expect(AUTH_CALLBACK_PATH).toBe("/auth/callback");
    expect(AUTH_LOGOUT_API_PATH).toBe("/api/auth/logout");
    expect(AUTH_REGISTER_API_PATH).toBe("/api/auth/register");
    expect(AUTH_RESET_PASSWORD_API_PATH).toBe("/api/auth/reset-password");
  });

  it("next allowlist dışı ve açık yönü dashboard'a düşürür", () => {
    expect(isSafeAuthNextPath("/dashboard")).toBe(true);
    expect(isSafeAuthNextPath("//evil.example")).toBe(false);
    expect(isSafeAuthNextPath("https://evil.example")).toBe(false);
    expect(isSafeAuthNextPath("/admin")).toBe(false);
    expect(isSafeAuthNextPath("/admin/catalog")).toBe(true);
    expect(isSafeAuthNextPath("/admin/curriculum-revisions")).toBe(false);
    expect(buildCitizenLoginHref("/admin/catalog")).toBe("/login?next=%2Fadmin%2Fcatalog");
    expect(resolvePostLoginPath("/admin/catalog")).toBe("/admin/catalog");
    expect(buildCitizenLoginHref("/admin")).toBe("/login");
    expect(isSafeAuthNextPath("/magazam")).toBe(true);
    expect(isSafeAuthNextPath("/e-ticaret")).toBe(true);
    expect(isSafeAuthNextPath("/panel/e-ticaret")).toBe(true);
    expect(isSafeAuthNextPath("/hibe")).toBe(true);
    expect(buildCitizenLoginHref("/hibe")).toBe("/login?next=%2Fhibe");
    expect(resolvePostLoginPath("/hibe?sekme=analiz")).toBe("/hibe");
    expect(isSafeAuthNextPath("/kurumsal")).toBe(true);
    expect(isSafeAuthNextPath("/kurumsal/ilanlar")).toBe(true);
    expect(isSafeAuthNextPath("/kurumsal/ilan/yeni")).toBe(false);
    expect(isSafeAuthNextPath("/ilan/depo-sorumlusu")).toBe(true);
    expect(isSafeAuthNextPath("/magazam/yeni")).toBe(true);
    expect(isSafeAuthNextPath("/magaza/ornek")).toBe(false);
    expect(buildCitizenLoginHref("/magazam/yeni")).toBe("/login?next=%2Fmagazam%2Fyeni");
    expect(isSafeAuthNextPath("/junior")).toBe(true);
    expect(isSafeAuthNextPath("/junior/ders/jr_06_mat-1")).toBe(true);
    expect(resolvePostLoginPath("/junior")).toBe("/junior");
    expect(resolveAuthCallbackNext({ next: "/sifre-yenile" })).toBe("/sifre-yenile");
    expect(resolveAuthCallbackNext({ type: "recovery" })).toBe("/sifre-yenile");
    expect(resolveAuthCallbackNext({ next: "//phish" })).toBe("/dashboard");
    expect(buildSignupEmailRedirectTo("http://localhost:3000")).toContain("/auth/callback");
    expect(buildPasswordResetRedirectTo("http://localhost:3000")).toContain("next=");
  });

  it("akademi kasa çapasını next içinde taşır; güvenli olmayan hash düşer", () => {    expect(isSafeAuthNextPath("/academy/01_office_ai#satin-al")).toBe(true);
    expect(buildCitizenLoginHref("/academy/01_office_ai#satin-al")).toBe(
      "/login?next=%2Facademy%2F01_office_ai%23satin-al",
    );
    expect(resolvePostLoginPath("/academy/01_office_ai#satin-al")).toBe(
      "/academy/01_office_ai#satin-al",
    );
    expect(resolveAuthCallbackNext({ next: "/academy/01_office_ai#satin-al" })).toBe(
      "/academy/01_office_ai#satin-al",
    );
    expect(buildCitizenLoginHref("/academy/01_office_ai#javascript:alert(1)")).toBe(
      "/login?next=%2Facademy%2F01_office_ai",
    );
    expect(buildCitizenLoginHref("/admin#satin-al")).toBe("/login");
  });

  /**
   * B-03 (Tedavi) — kayıt sonrası ilk değer anı.
   *
   * Giriş yapan mevcut kullanıcı kokpite döner; **yeni** kullanıcı (kayıt
   * doğrulaması) Tezgâh'ta ilk çıktısını üretmeye iner. Özel `next` hedefi
   * verilmişse ona dokunulmaz ve açık yön allowlist'i değişmez.
   */
  it("kayıt doğrulaması Tezgâh'a iner; giriş ve özel hedef korunur", () => {
    expect(AUTH_CALLBACK_DEFAULT_NEXT).toBe("/dashboard");
    expect(AUTH_SIGNUP_FIRST_VALUE_NEXT).toBe("/tezgah");

    // Signup + varsayılan hedef → ilk değer anı.
    expect(resolveAuthCallbackNext({ next: "/dashboard", type: "signup" })).toBe(
      "/tezgah?tool=proposal&ilk=1",
    );
    expect(resolveAuthCallbackNext({ type: "signup" })).toBe("/tezgah?tool=proposal&ilk=1");
    // Açık yön denemesi de güvenli hedefe düşer.
    expect(resolveAuthCallbackNext({ next: "https://evil.example", type: "signup" })).toBe(
      "/tezgah?tool=proposal&ilk=1",
    );

    // Özel hedef korunur (kullanıcı ne istediyse oraya gider).
    expect(resolveAuthCallbackNext({ next: "/e-ticaret", type: "signup" })).toBe("/e-ticaret");
    expect(resolveAuthCallbackNext({ next: "/tezgah" , type: "signup" })).toBe("/tezgah");
    // Hash'li hedef de korunur; işaret eklenmez.
    expect(resolveAuthCallbackNext({ next: "/dashboard#x", type: "signup" })).toBe("/dashboard#x");

    // Signup değilse davranış değişmez.
    expect(resolveAuthCallbackNext({ next: "/dashboard" })).toBe("/dashboard");
    expect(resolveAuthCallbackNext({})).toBe("/dashboard");
    expect(resolveAuthCallbackNext({ type: "recovery" })).toBe("/sifre-yenile");
    expect(resolvePostLoginPath(undefined)).toBe("/dashboard");

    // `ilk` işaretçisi yalnız varsayılan Tezgâh hedefinde eklenir.
    expect(markSignupFirstValueLanding({ next: "/tezgah", type: "signup" })).toBe(
      "/tezgah?tool=proposal&ilk=1",
    );
    expect(markSignupFirstValueLanding({ next: "/e-ticaret", type: "signup" })).toBe("/e-ticaret");
    expect(markSignupFirstValueLanding({ next: "/tezgah" })).toBe("/tezgah");
  });
});
