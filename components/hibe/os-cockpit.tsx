import Link from "next/link";
import type { Route } from "next";
import { HibeAgencyDesk } from "@/components/hibe/agency-desk";
import { HibeGrantDossierBuy } from "@/components/hibe/grant-dossier-buy";
import { HibeLifecycleDesk } from "@/components/hibe/lifecycle-desk";
import { HibePrepPlanCard } from "@/components/hibe/prep-plan-card";
import { HibeProjectDesk } from "@/components/hibe/project-desk";
import { HibeContextualBridges } from "@/components/kernel/contextual-bridge-presets";
import { cn } from "@/components/ui/cn";
import { EmptyAwareSelect } from "@/components/ui/empty-aware-select";
import { IconLeaf, IconShield } from "@/components/ui/icons";
import { PLACEHOLDER_TYPO_CLASS } from "@/components/ui/input";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import {
  HIBE_BUSINESS_KINDS,
  HIBE_FORM_LISTS,
  HIBE_TABS,
  type HibeTab,
} from "@/lib/yetkinhibe/os-brief";
import type { HibeAnalysisInput } from "@/lib/yetkinhibe/os-brief";
import type { BridgeKaynak } from "@/lib/kernel/contextual-bridge-params";
import { grantPrepPlanNote } from "@/lib/yetkinhibe/master-plan";
import type { HibeCockpitData } from "@/lib/yetkinhibe/os-load";

const TAB_LABEL: Record<HibeTab, string> = {
  analiz: "Firma Hibe Uygunluk Analizi",
  programlar: "Destek ve Kredi Rehberi",
  proje: "Proje Dosyası",
  arsiv: "Proje Dosyalarım",
  basvuru: "Başvurularım & Evraklar",
  ajans: "Ajans Modu",
};

const ORIENTATION = [
  {
    title: "KOSGEB",
    body: "Girişimci, ileri girişimci ve dijital dönüşüm çağrıları kurum ilanına bağlıdır. Kim başvurur ve hangi belge istenir, katalog satırında yoksa ilandan okunur.",
  },
  {
    title: "TÜBİTAK",
    body: "1501 ve 1507 sanayi Ar-Ge çağrıları başvuru penceresi ve belge listesiyle katalogda durur. Pencere kapalıysa satır uygun listeye girmez.",
  },
  {
    title: "Ticaret Bakanlığı",
    body: "E-ihracat ve pazarlama destekleri ihracat faaliyeti şartına bağlanabilir. Oran ve tavan katalog tutarıdır; ilan edilmemiş havuz sıfır yazılmaz.",
  },
  {
    title: "Kalkınma Ajansları",
    body: "İl ve bölge kısıtı çağrı satırındadır. Ajans ilanı resmî bağlantıdadır. Bu ekran başvuru yapmaz.",
  },
] as const;

function tabHref(tab: HibeTab, extra?: Record<string, string>): Route {
  const search = new URLSearchParams({ sekme: tab, ...extra });
  if (tab === "ajans" && !search.get("mod")) {
    search.set("mod", "agency");
  }
  return `/panel/hibe?${search.toString()}` as Route;
}

function projectHref(grantId: string, defaults: Record<string, string>): Route {
  return tabHref("proje", {
    grantId,
    hesap: "1",
    ad: defaults.ad ?? "",
    isletme: defaults.isletme || "kobi",
    nace: defaults.nace || "47",
    il: defaults.il || "34",
    yatirim: defaults.yatirim || "makine_techizat",
    calisan: defaults.calisan ?? "",
    yas: defaults.yas ?? "",
    arge: defaults.arge || "NONE",
    ihracat: defaults.ihracat || "hayir",
    patent: defaults.patent || "hayir",
  });
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{label}</p>
      <p className="mt-2 truncate text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
    </article>
  );
}

export function HibeOsCockpit({
  tab,
  data,
  seed,
  grantId,
  defaults,
  storeNote,
  paymentCommandKey = null,
  bridgeNoteKey = null,
  bridgeCameFrom = null,
}: {
  tab: HibeTab;
  data: HibeCockpitData;
  seed: HibeAnalysisInput | null;
  grantId: string;
  defaults: Record<string, string>;
  storeNote?: string | null;
  /** `/cuzdan?odeme=…` dönüşünde taşınan ödeme anahtarı (Ş3). */
  paymentCommandKey?: string | null;
  /**
   * Köprü bağlamı (`?kaynak=e-ticaret|kurumsal`). Yalnız analiz sekmesinde,
   * formun üstünde basılır. Metin `SEN_VOICE.bridges.hibeContext`'ten çözülür.
   * Bilinçli olarak **bağlantısızdır**: kaynağa geri link vermek köprüyü
   * döngüye çevirirdi.
   */
  bridgeNoteKey?: "ecommerce" | "kurumsal" | null;
  /** `?kaynak=` — köprü döngüsünü kırmak için gelinen merkez. */
  bridgeCameFrom?: BridgeKaynak | null;
}) {
  const price = data.price;
  const matchedPlan = data.analysis?.find((row) => row.grantId === grantId)?.masterPlan ?? null;
  const planNote = matchedPlan ? grantPrepPlanNote(matchedPlan) : null;
  return (
    <div className="space-y-4" data-hibe-os="">
      <section
        className={cn(
          "flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between",
          price.priceLabel
            ? "border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-amber-50"
            : "border-[var(--border)] bg-[var(--surface)]",
        )}
        data-hibe-price=""
      >
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-amber-500 text-white">
            <IconLeaf className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-800">Tam Proje Dosyası</p>
            <p className="mt-1 text-sm leading-6">
              {price.priceLabel ? <strong>{price.priceLabel}</strong> : "Katalog satırı açık değil. Tutar uydurulmaz."}
              {price.proActive ? " AI Tezgâh Pro aktif. Tam dosya yine katalog tutarıyla tahsil edilir." : ""}
            </p>
            {price.dossierCatalogLabel ? (
              <p className="mt-1 text-xs text-[var(--muted)]">Dosya kataloğu: {price.dossierCatalogLabel}</p>
            ) : null}
            <HibeGrantDossierBuy priceLabel={price.priceLabel} />
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-xs text-[var(--muted)]">
          <IconShield className="h-3.5 w-3.5" />
          Resmî onay değildir
        </span>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Hibe özeti">
        <Kpi label="Analiz edilen firma profili" value={data.kpis.profiles} />
        <Kpi label="Eşleşen destek programı" value={data.kpis.matched} />
        <Kpi label="Hazırlanan proje dosyası" value={data.kpis.dossiers} />
        <Kpi label="En yüksek tek program tavanı" value={data.kpis.scopeLabel} />
      </section>

      <HibeContextualBridges cameFrom={bridgeCameFrom} />

      <nav className="flex gap-2 overflow-x-auto" aria-label="Hibe sekmeleri">
        {HIBE_TABS.map((id) => (
          <Link
            key={id}
            href={tabHref(id)}
            className={cn(
              "shrink-0 rounded-full px-3 py-2 text-sm font-medium",
              tab === id
                ? "bg-gradient-to-r from-emerald-600 to-amber-500 text-white"
                : "bg-[var(--surface-muted)] text-[var(--foreground)]",
            )}
            data-hibe-tab={id}
          >
            {TAB_LABEL[id]}
          </Link>
        ))}
      </nav>

      {tab === "analiz" ? (
        <section className="space-y-4">
          {bridgeNoteKey ? (
            <p
              data-hibe-bridge-note={bridgeNoteKey}
              className="rounded-[var(--radius-card)] border border-[color-mix(in_srgb,var(--safir)_28%,transparent)] bg-[color-mix(in_srgb,var(--safir-soft)_55%,white)] px-3 py-2 text-sm leading-6 text-[var(--foreground)]"
            >
              <span className="font-semibold">{SEN_VOICE.bridges.hibeContext[bridgeNoteKey].eyebrow}. </span>
              {SEN_VOICE.bridges.hibeContext[bridgeNoteKey].body}
            </p>
          ) : null}
          {storeNote ? (
            <p className="text-sm" data-hibe-store-prefill="">
              {storeNote}
            </p>
          ) : null}
          <form className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4" action="/panel/hibe" method="get">
            <input type="hidden" name="sekme" value="analiz" />
            <input type="hidden" name="hesap" value="1" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-sm font-medium">
                Firma adı
                <input
                  name="ad"
                  defaultValue={defaults.ad ?? ""}
                  className={cn(
                    "mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm",
                    PLACEHOLDER_TYPO_CLASS,
                  )}
                />
              </label>
              <label className="text-sm font-medium">
                İşletme türü
                <select name="isletme" defaultValue={defaults.isletme || "kobi"} className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm not-italic font-medium text-slate-900">
                  {HIBE_BUSINESS_KINDS.map((row) => (
                    <option key={row.id} value={row.id}>{row.label}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                Sektör / NACE
                <EmptyAwareSelect
                  name="nace"
                  defaultValue={defaults.nace || ""}
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                >
                  <option value="">Sektör seç</option>
                  {HIBE_FORM_LISTS.nace.map((row) => (
                    <option key={row.id} value={row.id}>{row.label}</option>
                  ))}
                </EmptyAwareSelect>
              </label>
              <label className="text-sm font-medium">
                İl
                <EmptyAwareSelect
                  name="il"
                  defaultValue={defaults.il || ""}
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                >
                  <option value="">İl seç</option>
                  {HIBE_FORM_LISTS.provinces.map((row) => (
                    <option key={row.code} value={row.code}>{row.name}</option>
                  ))}
                </EmptyAwareSelect>
              </label>
              <label className="text-sm font-medium">
                Yatırım amacı
                <select name="yatirim" defaultValue={defaults.yatirim || "makine_techizat"} className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
                  {HIBE_FORM_LISTS.foci.map((row) => (
                    <option key={row.id} value={row.id}>{row.label}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                Çalışan sayısı
                <input
                  name="calisan"
                  required
                  inputMode="numeric"
                  defaultValue={defaults.calisan ?? ""}
                  className={cn(
                    "mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm",
                    PLACEHOLDER_TYPO_CLASS,
                  )}
                />
              </label>
              <label className="text-sm font-medium">
                Şirket yaşı
                <input
                  name="yas"
                  required
                  inputMode="numeric"
                  defaultValue={defaults.yas ?? ""}
                  className={cn(
                    "mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm",
                    PLACEHOLDER_TYPO_CLASS,
                  )}
                />
              </label>
              <label className="text-sm font-medium">
                Ar-Ge
                <select name="arge" defaultValue={defaults.arge || "NONE"} className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
                  {HIBE_FORM_LISTS.rd.map((row) => (
                    <option key={row.id} value={row.id}>{row.label}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                İhracat
                <select name="ihracat" defaultValue={defaults.ihracat || "hayir"} className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
                  <option value="hayir">Hayır</option>
                  <option value="evet">Evet</option>
                </select>
              </label>
              <label className="text-sm font-medium">
                Patent veya faydalı model
                <select name="patent" defaultValue={defaults.patent || "hayir"} className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
                  <option value="hayir">Hayır</option>
                  <option value="evet">Evet</option>
                </select>
              </label>
            </div>
            <button type="submit" className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white">
              Hesapla
            </button>
          </form>
          {data.analysisNote ? <p className="text-sm text-[var(--rose)]">{data.analysisNote}</p> : null}
          {data.analysis ? (
            <ul className="space-y-3">
              {data.analysis.length === 0 ? (
                <li className="text-sm">Katalogda bu profil için çağrı listelenmedi.</li>
              ) : (
                data.analysis.map((row) => {
                  const next = projectHref(row.grantId, defaults);
                  return (
                    <li key={row.grantId} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">{row.sourceLabel}</p>
                          <h3 className="mt-1 text-base font-semibold">{row.title}</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-semibold tabular-nums">
                            {row.fitPct === null ? "—" : `%${row.fitPct}`}
                          </p>
                          <p className="text-xs text-[var(--muted)]">
                            {row.constrainedCount === 0
                              ? "Kısıtlı kriter yok"
                              : `Kısıtlı kriter ${row.passedConstrained}/${row.constrainedCount}`}
                          </p>
                          <p className="text-xs text-[var(--muted)]">Kısıt yok: {row.unconstrainedCount}</p>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        Kısıtlı kriter uyumu. Kısıtsız kriter yüzdeye eklenmez. Resmî onay oranı değildir.
                      </p>
                      {row.ceilingLabel ? <p className="mt-2 text-sm">Katalog tavanı: {row.ceilingLabel}</p> : null}
                      <ul className="mt-2 space-y-1 text-sm leading-6">
                        {row.reasons.map((reason) => (
                          <li key={reason}>{reason}</li>
                        ))}
                      </ul>
                      <Link href={next} className="mt-3 inline-flex text-sm font-semibold text-emerald-800">
                        Bu Çağrıya Proje Hazırla →
                      </Link>
                      <HibePrepPlanCard plan={row.masterPlan} projectHref={next} />
                    </li>
                  );
                })
              )}
            </ul>
          ) : null}
        </section>
      ) : null}

      {tab === "programlar" ? (
        <section className="space-y-4">
          <ul className="grid gap-3 md:grid-cols-2">
            {ORIENTATION.map((card) => (
              <li key={card.title} className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <h3 className="font-semibold text-amber-950">{card.title}</h3>
                <p className="mt-2 text-sm leading-6 text-amber-950">{card.body}</p>
              </li>
            ))}
          </ul>
          {data.programsNote ? <p className="text-sm">{data.programsNote}</p> : null}
          <ul className="grid gap-3">
            {data.programs.map((card) => (
              <li key={card.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{card.sourceLabel}</p>
                <h3 className="mt-1 text-base font-semibold">{card.title}</h3>
                <p className="mt-2 text-sm leading-6">{card.summary}</p>
                <p className="mt-2 text-sm">Kimler: {card.who}</p>
                <p className="mt-1 text-sm">{card.windowLabel}</p>
                {card.documents.length > 0 ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                    {card.documents.map((doc) => (
                      <li key={doc}>{doc}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-[var(--muted)]">Belge listesi bu satırda yok. Kurum ilanına bak.</p>
                )}
                {card.officialInfoUrl.startsWith("https://") ? (
                  <a href={card.officialInfoUrl} className="mt-2 inline-flex text-sm font-semibold text-[var(--safir-deep)]">
                    Resmî ilan
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {tab === "proje" ? (
        <HibeProjectDesk
          seed={seed}
          grantId={grantId}
          initialBusinessName={defaults.ad}
          initialInvestmentFocus={defaults.yatirim}
          planNote={planNote}
          paymentCommandKey={paymentCommandKey}
        />
      ) : null}

      {tab === "basvuru" ? (
        <HibeLifecycleDesk
          applications={data.applications}
          programs={data.programs.map((program) => ({ id: program.id, title: program.title }))}
          clients={data.clients.map((client) => ({ id: client.id, companyName: client.companyName }))}
        />
      ) : null}

      {tab === "ajans" ? (
        <HibeAgencyDesk
          clients={data.clients}
          matrix={data.agencyMatrix}
          agencyPriceLabel={data.price.agencyPriceLabel}
          agencyActive={data.price.agencyActive}
        />
      ) : null}

      {tab === "arsiv" ? (
        <section>
          {data.archive.length === 0 ? (
            <p className="text-sm">Kayıtlı hibe analizi veya proje dosyası yok.</p>
          ) : (
            <ul className="space-y-3">
              {data.archive.map((row) => (
                <li key={row.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">Proje dosyası</p>
                  <h3 className="mt-1 font-semibold">{row.title}</h3>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {new Date(row.createdAt).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })}
                  </p>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-semibold text-emerald-800">Tam dosyayı aç</summary>
                    <pre className="mt-3 whitespace-pre-wrap text-sm leading-6">{row.markdown}</pre>
                  </details>
                  <p className="mt-3 flex flex-wrap gap-3 text-sm font-semibold text-emerald-800">
                    <a href={`/api/yetkinhibe/dossier/${row.id}/export?format=docx`}>Word (.docx) İndir</a>
                    <a href={`/api/yetkinhibe/dossier/${row.id}/export?format=pdf`}>PDF İndir</a>
                    <a href={`/api/yetkinhibe/dossier/${row.id}/export?format=md`}>Markdown (.md) İndir</a>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}
