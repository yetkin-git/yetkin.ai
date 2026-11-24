import { HibeOsCockpit } from "@/components/hibe/os-cockpit";
import { PageHeader } from "@/components/ui/page-header";
import { requirePageSession } from "@/lib/kernel/auth/session";
import { saveHibeCompanyProfile } from "@/lib/yetkinhibe/company-profile";
import { parseHibeAnalysis, parseHibeTab } from "@/lib/yetkinhibe/os-brief";
import { loadHibeCockpit } from "@/lib/yetkinhibe/os-load";
import { readStoreHibePrefill } from "@/lib/yetkinhibe/store-prefill-live";

export default async function HibeOsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requirePageSession();
  const raw = await searchParams;
  const one = (key: string) => {
    const value = raw[key];
    return typeof value === "string" ? value : undefined;
  };
  const params = {
    isletme: one("isletme"),
    nace: one("nace"),
    il: one("il"),
    yatirim: one("yatirim"),
    calisan: one("calisan"),
    yas: one("yas"),
    arge: one("arge"),
    ihracat: one("ihracat"),
    patent: one("patent"),
    ad: one("ad"),
    hesap: one("hesap"),
  };
  const submitted = parseHibeAnalysis(params);
  if (submitted) {
    await saveHibeCompanyProfile(session.id, submitted);
  }
  const storeId = one("store");
  const storeSeed = storeId ? await readStoreHibePrefill(session.id, storeId) : null;
  const data = await loadHibeCockpit(session.id, params);
  const seed = parseHibeAnalysis(params) ?? data.savedProfile;
  const saved = data.savedProfile;
  // Ş3 — `/cuzdan` dönüşü ödeme anahtarını taşır: dosya üretimi aynı komuta bağlanır.
  const paymentCommandKey = one("odeme") ?? null;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-4 py-4 sm:px-6">
      <PageHeader
        compact
        eyebrow="YetkinHibe"
        title="Hibe İşletim Sistemi"
        description="Firma uygunluğu, hazırlık planı, destek rehberi ve proje dosyası. Katalog tutarı veritabanından okunur."
      />
      <HibeOsCockpit
        tab={parseHibeTab(one("sekme"))}
        data={data}
        seed={seed}
        grantId={one("grantId") ?? ""}
        storeNote={storeSeed?.scaleLabel ?? null}
        paymentCommandKey={paymentCommandKey}
        defaults={{
          ad: params.ad ?? storeSeed?.ad ?? saved?.businessName ?? "",
          isletme: params.isletme ?? (storeSeed?.isletme || saved?.businessKind) ?? "",
          nace: params.nace ?? (storeSeed?.nace || saved?.naceGroup) ?? "",
          il: params.il ?? saved?.provinceCode ?? "",
          yatirim: params.yatirim ?? storeSeed?.yatirim ?? saved?.investmentFocus ?? "",
          calisan: params.calisan ?? (saved ? String(saved.employeeCount) : ""),
          yas: params.yas ?? (saved ? String(saved.companyAgeYears) : ""),
          arge: params.arge ?? saved?.rdMaturityLevel ?? "",
          ihracat: params.ihracat ?? (saved ? (saved.exportActive ? "evet" : "hayir") : ""),
          patent: params.patent ?? (saved ? (saved.hasPatentOrUtilityModel ? "evet" : "hayir") : ""),
        }}
      />
    </div>
  );
}
