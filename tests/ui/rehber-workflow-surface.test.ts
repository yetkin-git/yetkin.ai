import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  isOpenGuestTryPath,
  moduleTotalLabel,
  moduleTotalMinutes,
  parseWorkflowModuleId,
  stepMinutes,
  TRIAL_VERIFY_AMOUNT_LABEL,
  trialRenewalAmountLabel,
  WORKFLOW_CHAIN,
  WORKFLOW_MODULES,
  workflowInviteHref,
  workflowModule,
  workflowStepHref,
} from "@/lib/rehber/workflows";
import { COMMERCE_TRIAL_VERIFY_MINOR } from "@/lib/commerce/subscription-lifecycle";
import { formatMinor } from "@/lib/kernel/money/format";
import { isProtectedCitizenPath } from "@/lib/kernel/security/edge-guard";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("/rehber — Görsel İş Akış ve Kurulum Merkezi", () => {
  it("dört aktif ticari modülü tekil kimlikle taşır; kapalı Akademi yoktur", () => {
    expect(WORKFLOW_MODULES.map((item) => item.id)).toEqual([
      "ecommerce",
      "hibe",
      "tezgah",
      "career",
    ]);
    expect(new Set(WORKFLOW_MODULES.map((item) => item.id)).size).toBe(4);
    expect(WORKFLOW_MODULES.map((item) => item.href)).toEqual([
      "/e-ticaret",
      "/hibe",
      "/tezgah",
      "/career",
    ]);
    for (const item of WORKFLOW_MODULES) {
      expect(item.label.length).toBeGreaterThan(0);
      expect(item.outcome.length).toBeGreaterThan(0);
      expect(item.invite.headline.length).toBeGreaterThan(0);
      expect(item.invite.cta.length).toBeGreaterThan(0);
      expect(item.steps.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("her adım numara, süre, girdi, çıktı, ipucu, örnek önizleme ve canlı aksiyon taşır", () => {
    for (const item of WORKFLOW_MODULES) {
      item.steps.forEach((step, index) => {
        // Sıra numarası veriden gelir ve 1'den başlar; şerit sırası bozulmaz.
        expect(step.order, `${item.id} adım sırası`).toBe(index + 1);
        expect(step.title.trim().length).toBeGreaterThan(0);
        expect(step.duration).toMatch(/\d/u);
        expect(step.input.trim().length).toBeGreaterThan(0);
        expect(step.output.trim().length).toBeGreaterThan(0);
        expect(step.tip.trim().length).toBeGreaterThan(0);
        expect(step.samplePreview.trim().length).toBeGreaterThan(0);
        expect(step.cta.trim().length).toBeGreaterThan(0);
        // Aksiyon butonu ölü adrese basmaz: kök iç yol olmalı.
        expect(step.href.startsWith("/"), `${item.id}#${step.order} href`).toBe(true);
        expect(step.href).not.toContain("/academy");
      });
    }
  });

  it("E-Ticaret akışı dört adımı korur ve ilk adım deneme vaadini vatandaş dilinde yazar", () => {
    const ecommerce = workflowModule("ecommerce");
    expect(ecommerce).not.toBeNull();
    expect(ecommerce!.steps.map((step) => step.title)).toEqual([
      "30 gün ücretsiz denemeyi başlat",
      "Pazaryeri bağlantısını kur",
      "Ürünleri eşleştir, stoğu senkronla",
      "Müşteri sorularına AI yanıtı aç",
    ]);
    expect(ecommerce!.steps[0]!.href).toBe("/e-ticaret");
    expect(ecommerce!.steps[1]!.href).toBe("/e-ticaret");
    expect(ecommerce!.steps[1]!.input).toContain("Trendyol");
    expect(ecommerce!.steps[1]!.input).toContain("Hepsiburada");

    // Parasal dürüstlük: 1 TL "iade edilir" iddiası yasak; tahsil edilen bedel denir.
    const first = ecommerce!.steps[0]!;
    expect(first.input).toContain(TRIAL_VERIFY_AMOUNT_LABEL);
    expect(first.input).toMatch(/sadece .+ çekilir/u);
    expect(first.output).toContain("30 gün");
    expect(first.output).toContain("tek tıkla iptal");
    for (const step of ecommerce!.steps) {
      expect(step.tip).not.toContain("iade edilir");
      expect(step.input).not.toContain("iade edilir");
      expect(step.tip).not.toContain("çekim değildir");
      expect(step.samplePreview.length).toBeGreaterThan(20);
    }
    // VKN/TCKN zorunluluğu ve tek deneme kuralı metinde görünür.
    expect(first.tip).toContain("VKN veya TCKN");
    expect(first.tip).toContain("iade taahhüdü değildir");
    expect(first.tip).toMatch(/tek tıkla iptal|İptal dönem sonunda/iu);
    // Mekanik / hukuki dil yok.
    expect(first.output).not.toContain("kart saklanır");
    expect(ecommerce!.steps[1]!.tip).not.toContain("Secret tarayıcıya değil");
  });

  it("1 TL etiketi tek kaynaktan (COMMERCE_TRIAL_VERIFY_MINOR) türetilir", () => {
    expect(TRIAL_VERIFY_AMOUNT_LABEL).toBe(formatMinor(COMMERCE_TRIAL_VERIFY_MINOR, "TRY"));
    expect(TRIAL_VERIFY_AMOUNT_LABEL).toContain("1,00");
    // Yenileme tutarı katalogdan okunur; katalog yoksa uydurulmaz.
    expect(trialRenewalAmountLabel(null)).toBeNull();
    expect(trialRenewalAmountLabel(0)).toBeNull();
    expect(trialRenewalAmountLabel(149_000)).toContain("1.490");
  });

  it("YetkinHibe akışı NACE/ölçek → eşleştirme → proje dosyası sırasını korur", () => {
    const hibe = workflowModule("hibe");
    expect(hibe!.steps.map((step) => step.order)).toEqual([1, 2, 3]);
    expect(hibe!.steps[0]!.input).toContain("NACE");
    expect(hibe!.steps[1]!.output).toContain("KOSGEB");
    expect(hibe!.steps[2]!.output).toContain("kontrol listesi");
    expect(hibe!.steps.every((step) => step.href === "/hibe")).toBe(true);
  });

  it("AI Tezgâh akışı ücretsiz haktan pakete, paketten üretime gider", () => {
    const tezgah = workflowModule("tezgah");
    expect(tezgah!.steps[0]!.href).toBe("/tezgah");
    // Paket seçimi fiyatlandırmaya gider; tezgâh butonu değildir.
    expect(tezgah!.steps[1]!.href).toBe("/fiyatlandirma");
    expect(tezgah!.steps[1]!.output).toContain("Tezgâh Pro");
    expect(tezgah!.steps[1]!.output).toContain("kredi");
    expect(tezgah!.steps[0]!.output).toMatch(/[Gg]ünde \d+ üretim/u);
  });

  it("YetkinCV akışı testten rozete, rozetten kamu kanıt linkine gider", () => {
    const career = workflowModule("career");
    expect(career!.steps[0]!.href).toBe("/career");
    expect(career!.steps[1]!.output).toContain("Rozet");
    expect(career!.steps[2]!.href).toBe("/pasaport");
    expect(career!.steps[2]!.output).toContain("/vize/[id]");
  });

  it("bilinmeyen modül sorgusu ilk modüle düşer; geçerli anahtar korunur", () => {
    expect(parseWorkflowModuleId("hibe")).toBe("hibe");
    expect(parseWorkflowModuleId("tezgah")).toBe("tezgah");
    expect(parseWorkflowModuleId(undefined)).toBe("ecommerce");
    expect(parseWorkflowModuleId("")).toBe("ecommerce");
    expect(parseWorkflowModuleId("akademi")).toBe("ecommerce");
  });

  it("korumalı CTA ham adrese basmaz: next parametreli kayıt yoluna çevrilir", () => {
    // `/e-ticaret`, `/hibe`, `/pasaport` kenarda korumalıdır (auth-307).
    expect(workflowStepHref("/e-ticaret")).toBe("/register?next=%2Fe-ticaret");
    expect(workflowStepHref("/hibe")).toBe("/register?next=%2Fhibe");
    expect(workflowStepHref("/pasaport")).toBe("/register?next=%2Fpasaport");
    // Kamu yolu olduğu gibi kalır.
    expect(workflowStepHref("/tezgah")).toBe("/tezgah");
    expect(workflowStepHref("/fiyatlandirma")).toBe("/fiyatlandirma");
    // Dış adres kayıt yoluna düşer (açık yön kapalı).
    expect(workflowStepHref("https://evil.example")).toBe("/register");
  });

  it("modül davet kartı korumalı hedefte kayıt yoluna, açık araçta doğrudan ürüne gider", () => {
    expect(workflowInviteHref(workflowModule("ecommerce")!)).toBe("/register?next=%2Fe-ticaret");
    expect(workflowInviteHref(workflowModule("hibe")!)).toBe("/register?next=%2Fhibe");
    expect(workflowInviteHref(workflowModule("tezgah")!)).toBe("/tezgah");
    expect(workflowInviteHref(workflowModule("career")!)).toBe("/career");
  });

  it("açık misafir deneme yolları kayıt istemez", () => {
    expect(isOpenGuestTryPath("/tezgah")).toBe(true);
    expect(isOpenGuestTryPath("/career")).toBe(true);
    expect(isOpenGuestTryPath("/tetkik")).toBe(true);
    expect(isOpenGuestTryPath("/e-ticaret")).toBe(false);
    expect(isOpenGuestTryPath("/hibe")).toBe(false);
    expect(isOpenGuestTryPath("/pasaport")).toBe(false);
    expect(isProtectedCitizenPath("/e-ticaret")).toBe(true);
    expect(isProtectedCitizenPath("/tezgah")).toBe(false);
    expect(isProtectedCitizenPath("/career")).toBe(false);
  });

  it("adımlar arası toplam süre özeti okunabilir biçimde üretilir", () => {
    expect(stepMinutes("≈ 3 dk")).toBe(3);
    expect(stepMinutes("≈ 10 dk")).toBe(10);
    expect(stepMinutes("≈ 1 dk · otomatik")).toBe(1);
    expect(stepMinutes("≈ 3 dk / çıktı")).toBe(3);
    expect(stepMinutes("süre yok")).toBe(0);
    const ecommerce = workflowModule("ecommerce")!;
    expect(moduleTotalMinutes(ecommerce)).toBe(23);
    expect(moduleTotalLabel(ecommerce)).toBe("≈ 23 dk");
    for (const item of WORKFLOW_MODULES) {
      expect(moduleTotalMinutes(item)).toBeGreaterThan(0);
      expect(moduleTotalLabel(item)).toMatch(/^≈ /u);
    }
    // Uzun modülde saat biçimi.
    expect(
      moduleTotalLabel({ ...ecommerce, steps: [{ ...ecommerce.steps[0]!, duration: "≈ 75 dk" }] }),
    ).toBe("≈ 1 sa 15 dk");
  });

  it("modül zinciri Tezgâh → E-Ticaret → Hibe → Kariyer sırasını taşır", () => {
    expect(WORKFLOW_CHAIN).toEqual(["tezgah", "ecommerce", "hibe", "career"]);
    for (const id of WORKFLOW_CHAIN) {
      expect(workflowModule(id), id).not.toBeNull();
    }
  });

  it("sayfa makale gövdesi değil, modüller arası akış + sunucuda çözülen sekme + şema basar", () => {
    const page = readSrc("app/(public)/rehber/page.tsx");
    expect(page).toContain("WorkflowModuleTabs");
    expect(page).toContain("WorkflowStepper");
    expect(page).toContain("WorkflowFlowMap");
    expect(page).toContain("readWorkflowProgress");
    expect(page).toContain("searchParams");
    expect(page).toContain("signedIn");
    expect(page).toContain("getSession");
    // Deneme dürüstlüğü sayfada yazılı.
    expect(page).toContain("TRIAL_VERIFY_AMOUNT_LABEL");
    expect(page).toContain("iade taahhüdü değildir");
    // Hero'da erken kayıt duvarı yok.
    expect(page).not.toContain("workflowStepHref");
    // Eski makale dizini gövdesi sayfadan çıktı.
    expect(page).not.toContain("guide.sections");
    expect(page).not.toContain("copy.steps.map");
    expect(page).not.toContain("guideArticleJsonLd");
  });

  it("akış haritası dört modülü sıralı liste + SVG okla bağlar; kayıt duvarına atmaz", () => {
    const map = readSrc("components/rehber/workflow-flow-map.tsx");
    expect(map).toContain("data-workflow-flow-map");
    expect(map).toContain("data-workflow-flow-node");
    expect(map).toContain("<ol");
    expect(map).toContain("<li");
    // Gerçek ok başı: SVG path, yatay ve dikey varyant.
    expect(map).toContain("<svg");
    expect(map).toContain("data-workflow-flow-arrow");
    expect(map).toContain("strokeLinejoin");
    // Zincirin dört halkası ada ile bağlı.
    for (const title of ["AI Tezgâh", "E-Ticaret İşletme OS", "YetkinHibe", "YetkinCV & Vize"]) {
      expect(map, title).toContain(title);
    }
    // Modül seçimi rehber sekmesine gider; /register duvarı yok.
    expect(map).toContain("?modul=");
    expect(map).not.toContain("workflowStepHref");
    // İstemci bileşeni değil: sunucuda basılır, JS gerekmez.
    expect(map).not.toContain("use client");
  });

  it("stepper oturumsuz ziyaretçiyi adım içinde /register duvarına zorlamaz; tek ana CTA en altta", () => {
    const stepper = readSrc("components/rehber/workflow-stepper.tsx");
    // Adımlar arasında görsel bağlantı çizgisi.
    expect(stepper).toContain("bg-gradient-to-b");
    expect(stepper).toContain("last ? null");
    // Adımlar arasında gerçek yön oku (yalnız buton ikonu değil).
    expect(stepper).toContain("IconArrowDown");
    expect(stepper).toContain("data-workflow-step-arrow");
    // Adım numarası.
    expect(stepper).toContain("step.order");
    expect(stepper).toContain("<LinkButton");
    expect(stepper).toContain("IconArrow");
    // Misafir: korumalı adımda örnek önizleme, açık araçta kayıt gerekmez bağı.
    expect(stepper).toContain("samplePreview");
    expect(stepper).toContain("data-workflow-step-preview");
    expect(stepper).toContain("Ücretsiz Dene (Kayıt Gerekmez)");
    expect(stepper).toContain("isOpenGuestTryPath");
    expect(stepper).toContain("isProtectedCitizenPath");
    // Tek ana davet kartı listenin altında.
    expect(stepper).toContain("data-workflow-invite");
    expect(stepper).toContain("ModuleInviteCard");
    expect(stepper).toContain("workflowInviteHref");
    expect(stepper).toContain("module.invite");
    // Adım kartı içinde misafiri doğrudan /register'a atan yol yok.
    expect(stepper).not.toContain("workflowStepHref(step.href)");
    // Tamamlanan adım rozeti.
    expect(stepper).toContain("Tamamlandı ✓");
    // Modül toplam süre özeti.
    expect(stepper).toContain("data-workflow-total-duration");
    expect(stepper).toContain("moduleTotalLabel");
    // Sekme gezinmesi JS gerektirmez.
    expect(stepper).toContain("?modul=");
    expect(stepper).toContain("aria-current");
    expect(stepper).not.toContain("use client");
  });

  it("sabit alt menü içerik üzerine binmesin diye kamu layout yeterli alt boşluk taşır", () => {
    const layout = readSrc("app/(public)/layout.tsx");
    expect(layout).toContain("LegalSiteFooter");
    expect(layout).toMatch(/pb-3[02]/u);
  });

  it("canlı durum okuması güvenli: oturum/DB hatasında ziyaretçiye düşer, yazmaz", () => {
    const progress = readSrc("lib/rehber/progress.ts");
    expect(progress).toContain('import "server-only"');
    expect(progress).toContain("getSession");
    // Her okuma yakalanır; biri patlarsa sayfa 500 olmaz.
    expect(progress).toContain(".catch(");
    expect(progress).toContain("completed: []");
    // Kamu sayfası yazma motoru import etmez.
    expect(progress).not.toContain("writeSuperAdminAudit");
    expect(progress).not.toContain("purchase");
    expect(progress).not.toContain("@/lib/academy");
  });

  it("ölü `guide` kopya bloğu sen-voice kamu yüzeyinden silindi", () => {
    const publicCopy = readSrc("lib/copy/sen-voice/public.ts");
    expect(publicCopy).not.toContain("Ofiste yapay zekâyı Excel ve e-postada kullan");
    expect(publicCopy).not.toContain("Rehber soruları");
    expect(publicCopy).not.toContain("guide: {");
    // Kamu yüzeyinin canlı blokları korunur.
    expect(publicCopy).toContain("resources");
    expect(publicCopy).toContain("home:");
  });
});
