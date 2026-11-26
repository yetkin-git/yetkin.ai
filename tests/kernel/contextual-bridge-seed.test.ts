import { describe, expect, it } from "vitest";
import {
  buildCitizenLoginHref,
  buildCitizenRegisterHref,
  buildAuthCallbackRedirectTo,
  isSafeAuthNextPath,
  readPostLoginPathFromSearch,
  resolveAuthCallbackNext,
  resolvePostLoginPath,
} from "@/lib/kernel/auth/redirects";
import {
  applyHibeBridgeDefaults,
  applyTezgahBridgeSeed,
  hibeBridgeContext,
  tezgahBridgeHintFor,
} from "@/lib/kernel/contextual-bridge-seed";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

/** `next=` değerini login/register href'inden çözer. */
function nextOf(href: string): string | null {
  const query = href.split("?")[1];
  return query ? new URLSearchParams(query).get("next") : null;
}

describe("giriş dönüşü — köprü ön-doldurması kaybolmaz", () => {
  /**
   * Denetim (443363f4): `buildCitizenLoginHref` sorguyu tamamen düşürüyordu.
   * `/kurumsal/ilanlar?pozisyon=…` köprüsüyle gelen oturumsuz kullanıcı giriş
   * yaptıktan sonra **boş** forma dönüyordu; köprünün tek işi olan ön-doldurma
   * oturum duvarında ölüyordu.
   */
  it("pozisyon parametresi login → callback → hedef zincirinde korunur", () => {
    const target = "/kurumsal/ilanlar?pozisyon=E-Ticaret+Operasyon+Sorumlusu";
    const login = buildCitizenLoginHref(target);
    const next = nextOf(login) ?? "";
    expect(decodeURIComponent(next)).toContain("E-Ticaret+Operasyon+Sorumlusu");

    // Login formu → hedef
    expect(resolvePostLoginPath(next)).toBe(target);
    // Google OAuth → /auth/callback → hedef
    expect(resolveAuthCallbackNext({ next })).toBe(target);
    // Supabase callback redirect_to taşıması
    expect(buildAuthCallbackRedirectTo("https://yetkin.ai", target)).toContain("pozisyon");
    // Kayıt akışı da aynı sözleşmeyi taşır.
    expect(resolvePostLoginPath(nextOf(buildCitizenRegisterHref(target)))).toBe(target);
  });

  it("Türkçe karakterli pozisyon hedef sayfada doğru çözülür", () => {
    const target = "/kurumsal/ilanlar?pozisyon=Satış Müdürü";
    const next = nextOf(buildCitizenLoginHref(target)) ?? "";
    const resolved = resolvePostLoginPath(next);
    const params = new URL(`https://yetkin.ai${resolved}`).searchParams;
    expect(params.get("pozisyon")).toBe("Satış Müdürü");
  });

  it("kaynak parametresi panel hedeflerinde korunur", () => {
    for (const target of ["/panel/hibe?kaynak=e-ticaret", "/tezgah?kaynak=hibe"]) {
      const next = nextOf(buildCitizenLoginHref(target));
      expect(resolvePostLoginPath(next)).toBe(target);
      expect(resolveAuthCallbackNext({ next })).toBe(target);
    }
  });

  it("güvenli çapa köprü sorgusuyla birlikte yaşar", () => {
    const next = nextOf(buildCitizenLoginHref("/tezgah?kaynak=hibe#tetkik"));
    expect(next).toBe("/tezgah?kaynak=hibe#tetkik");
    expect(resolvePostLoginPath(next)).toBe("/tezgah?kaynak=hibe#tetkik");
  });

  it("güvenli olmayan çapa yine düşer", () => {
    expect(nextOf(buildCitizenLoginHref("/academy/01_office_ai#javascript:alert(1)"))).toBe(
      "/academy/01_office_ai",
    );
  });

  /**
   * Sorgu taşımak açık yön yüzeyi açmamalı. İzinsiz anahtarlar, PII ve dış URL
   * `next` içine **hiç** girmez.
   */
  it("izinsiz query anahtarları ve PII next'e taşınmaz", () => {
    const next =
      nextOf(
        buildCitizenLoginHref(
          "/kurumsal/ilanlar?pozisyon=Satış+Müdürü&utm_source=x&redirect=https://evil.example&tckn=12345678901",
        ),
      ) ?? "";
    // Yüzde kodlaması taşınır (URL sözleşmesi); sayfa değeri doğru çözer.
    const params = new URL(`https://yetkin.ai${next}`).searchParams;
    expect(params.get("pozisyon")).toBe("Satış Müdürü");
    expect(params.get("utm_source")).toBeNull();
    expect(params.get("redirect")).toBeNull();
    expect(params.get("tckn")).toBeNull();
    expect(next).not.toContain("evil");
  });

  it("PII taşıyan pozisyon tamamen düşer, yol kalır", () => {
    const next = nextOf(buildCitizenLoginHref("/kurumsal/ilanlar?pozisyon=VKN%3A1234567890"));
    expect(next).toBe("/kurumsal/ilanlar");
  });

  it("açık yön ve protokol göreli adresler hâlâ reddedilir", () => {
    expect(buildCitizenLoginHref("//evil.example/x?kaynak=hibe")).toBe("/login");
    expect(buildCitizenLoginHref("https://evil.example/x")).toBe("/login");
    expect(buildCitizenLoginHref("/\\evil.example")).toBe("/login");
    expect(buildCitizenLoginHref("/../etc/passwd")).toBe("/login");
    expect(buildCitizenLoginHref("/admin?kaynak=hibe")).toBe("/login");
    expect(isSafeAuthNextPath("/admin")).toBe(false);
  });

  it("allowlist dışı hedef sorgu taşısa bile login köküne düşer", () => {
    expect(buildCitizenLoginHref("/admin?pozisyon=Müdür")).toBe("/login");
    expect(buildCitizenLoginHref("/magaza/ornek?pozisyon=Müdür")).toBe("/login");
  });

  it("query'siz hedefler eskisi gibi davranır", () => {
    expect(buildCitizenLoginHref("/panel/hibe")).toBe("/login?next=%2Fpanel%2Fhibe");
    expect(buildCitizenLoginHref("/dashboard")).toBe("/login?next=%2Fdashboard");
    expect(buildCitizenLoginHref(null)).toBe("/login");
    expect(readPostLoginPathFromSearch(null, "/panel/hibe?kaynak=hibe")).toBe(
      "/panel/hibe?kaynak=hibe",
    );
  });

  it("signup ilk değer işareti query'li hedefte de çalışır", () => {
    // Varsayılan hedef + signup → Tezgâh ilk değer anı.
    expect(resolveAuthCallbackNext({ next: "/dashboard", type: "signup" })).toBe(
      "/tezgah?tool=proposal&ilk=1",
    );
    // Açık köprü hedefi verilmişse kullanıcının niyeti korunur.
    expect(resolveAuthCallbackNext({ next: "/panel/hibe?kaynak=hibe", type: "signup" })).toBe(
      "/panel/hibe?kaynak=hibe",
    );
  });
});

describe("Tezgâh köprü tohumu — gerçekten çalışır", () => {
  const hints = SEN_VOICE.bridges.tezgahHint;

  it("kaynak=hibe teklif yazıcıyı hibe şablonuyla doldurur", () => {
    const seeded = applyTezgahBridgeSeed({
      toolId: "proposal",
      kaynak: "hibe",
      values: {},
      hints,
    });
    expect(seeded.jobPost).toBe(hints.hibe.jobPostSeed);
    expect(seeded.expertise).toBe(hints.hibe.expertiseSeed);
    expect(seeded.deliveryMode).toBe("summary");
  });

  it("kaynak=kurumsal mülakat şablonunu yazar, hibe şablonunu değil", () => {
    const seeded = applyTezgahBridgeSeed({
      toolId: "proposal",
      kaynak: "kurumsal",
      values: {},
      hints,
    });
    expect(seeded.jobPost).toBe(hints.kurumsal.jobPostSeed);
    expect(seeded.jobPost).not.toBe(hints.hibe.jobPostSeed);
    expect(seeded.expertise).toBe(hints.kurumsal.expertiseSeed);
  });

  /** Paylaşılan bir link kullanıcının yazdığını silmemeli. */
  it("kullanıcının kendi metnini ezmez", () => {
    const seeded = applyTezgahBridgeSeed({
      toolId: "proposal",
      kaynak: "hibe",
      values: { jobPost: "kendi ihtiyacım", expertise: "kendi uzmanlığım", deliveryMode: "b2b" },
      hints,
    });
    expect(seeded.jobPost).toBe("kendi ihtiyacım");
    expect(seeded.expertise).toBe("kendi uzmanlığım");
    expect(seeded.deliveryMode).toBe("b2b");
  });

  it("yalnız boş alanı doldurur", () => {
    const seeded = applyTezgahBridgeSeed({
      toolId: "proposal",
      kaynak: "hibe",
      values: { jobPost: "kendi ihtiyacım" },
      hints,
    });
    expect(seeded.jobPost).toBe("kendi ihtiyacım");
    expect(seeded.expertise).toBe(hints.hibe.expertiseSeed);
  });

  /**
   * Şablon yalnız `proposal` aracının alan adlarını bilir. Tetraştırma aracına
   * (`tetkik`) yazılırsa form çöp olur — bu yüzden hiç dokunulmaz.
   */
  it("başka araçta forma yazmaz", () => {
    for (const toolId of ["tetkik", "grant", "dukkan", "saas-builder"]) {
      expect(
        applyTezgahBridgeSeed({ toolId, kaynak: "hibe", values: {}, hints }),
      ).toEqual({});
    }
  });

  it("tanınmayan kaynakta forma yazmaz", () => {
    expect(applyTezgahBridgeSeed({ toolId: "proposal", kaynak: null, values: {}, hints })).toEqual({});
    expect(
      applyTezgahBridgeSeed({ toolId: "proposal", kaynak: "kariyer", values: {}, hints }),
    ).toEqual({});
  });
});

describe("Tezgâh ipucu şeridi — vaat ile davranış aynı", () => {
  const hints = SEN_VOICE.bridges.tezgahHint;

  /** 443363f4: şerit yalnız `kaynak`'a bakıyordu, `?tool=tetkik` ile de "teklif hazır" diyordu. */
  it("yalnız teklif aracında basılır", () => {
    expect(tezgahBridgeHintFor({ toolId: "tetkik", kaynak: "hibe", hints })).toBeNull();
    expect(tezgahBridgeHintFor({ toolId: "grant", kaynak: "hibe", hints })).toBeNull();
    expect(tezgahBridgeHintFor({ toolId: "proposal", kaynak: "hibe", hints })).toBe(hints.hibe);
  });

  it("tanınmayan veya köprüsüz kaynakta basılmaz", () => {
    expect(tezgahBridgeHintFor({ toolId: "proposal", kaynak: null, hints })).toBeNull();
    expect(tezgahBridgeHintFor({ toolId: "proposal", kaynak: "e-ticaret", hints })).toBeNull();
    expect(tezgahBridgeHintFor({ toolId: "proposal", kaynak: "tezgah", hints })).toBeNull();
  });
});

describe("YetkinHibe köprü bağlamı — ölü parametre artık yaşıyor", () => {
  /** 443363f4: `/panel/hibe?kaynak=e-ticaret` hiç okunmuyordu. */
  it("E-Ticaret köprüsü perakende ve ihracat odağını seçer", () => {
    const context = hibeBridgeContext("e-ticaret");
    expect(context).not.toBeNull();
    expect(context?.noteKey).toBe("ecommerce");
    expect(context?.defaults).toEqual({ nace: "47", yatirim: "ihracat", ihracat: "evet" });
  });

  it("Kurumsal köprüsü Ar-Ge odağını seçer", () => {
    const context = hibeBridgeContext("kurumsal");
    expect(context?.noteKey).toBe("kurumsal");
    expect(context?.defaults.yatirim).toBe("arge");
  });

  it("köprüsüz veya alakasız kaynakta bağlam üretmez", () => {
    expect(hibeBridgeContext(null)).toBeNull();
    expect(hibeBridgeContext("hibe")).toBeNull();
    expect(hibeBridgeContext("kariyer")).toBeNull();
    expect(hibeBridgeContext("tezgah")).toBeNull();
  });

  it("boş varsayılanı doldurur", () => {
    const defaults = applyHibeBridgeDefaults(
      { nace: "", yatirim: "", ihracat: "", il: "34" },
      hibeBridgeContext("e-ticaret"),
    );
    expect(defaults).toEqual({ nace: "47", yatirim: "ihracat", ihracat: "evet", il: "34" });
  });

  /** Kullanıcının açık seçimi her zaman kazanır. */
  it("kullanıcının seçtiği değeri ezmez", () => {
    const defaults = applyHibeBridgeDefaults(
      { nace: "62", yatirim: "arge", ihracat: "hayir" },
      hibeBridgeContext("e-ticaret"),
    );
    expect(defaults).toEqual({ nace: "62", yatirim: "arge", ihracat: "hayir" });
  });

  it("kayıtlı profil varsa köprü onu ezmez", () => {
    const defaults = applyHibeBridgeDefaults(
      { nace: "25", yatirim: "makine_techizat", ihracat: "hayir", calisan: "12", yas: "7" },
      hibeBridgeContext("e-ticaret"),
    );
    expect(defaults.nace).toBe("25");
    expect(defaults.yatirim).toBe("makine_techizat");
    expect(defaults.ihracat).toBe("hayir");
    expect(defaults.calisan).toBe("12");
  });
});
