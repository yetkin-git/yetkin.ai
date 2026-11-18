import { HibeOsCockpit } from "@/components/hibe/os-cockpit";
import { PageHeader } from "@/components/ui/page-header";
import { requirePageSession } from "@/lib/kernel/auth/session";
import { parseHibeAnalysis, parseHibeTab } from "@/lib/yetkinhibe/os-brief";
import { loadHibeCockpit } from "@/lib/yetkinhibe/os-load";

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
  const data = await loadHibeCockpit(session.id, params);
  const seed = parseHibeAnalysis(params);

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
        defaults={{
          ad: params.ad ?? "",
          isletme: params.isletme ?? "",
          nace: params.nace ?? "",
          il: params.il ?? "",
          yatirim: params.yatirim ?? "",
          calisan: params.calisan ?? "",
          yas: params.yas ?? "",
          arge: params.arge ?? "",
          ihracat: params.ihracat ?? "",
          patent: params.patent ?? "",
        }}
      />
    </div>
  );
}
