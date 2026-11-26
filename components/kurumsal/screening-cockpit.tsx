"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PaytrCheckoutIframe } from "@/components/kernel/paytr-checkout-iframe";
import { CheckoutBillingFields } from "@/components/legal/checkout-billing-fields";
import { CheckoutConsentFields } from "@/components/legal/checkout-consent-fields";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconCopy } from "@/components/ui/icons";
import { INPUT_SURFACE_CLASS, Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CHECKOUT_LEGAL_CONSENT_PAYLOAD } from "@/lib/kernel/legal/checkout-consent";
import {
  EMPTY_CHECKOUT_BILLING_FORM,
  isCheckoutBillingComplete,
  normalizeBillingInput,
  type CheckoutBillingFormState,
} from "@/lib/kernel/identity/billing-info";
import { readPaytrIframeSrcFromCheckout } from "@/lib/kernel/payments/paytr/iframe-embed";
import {
  KURUMSAL_CRITERIA_MAX,
  KURUMSAL_CRITERIA_MIN,
  KURUMSAL_DEFAULT_MIN_SCORE,
  KURUMSAL_DEFAULT_SHORTLIST,
  KURUMSAL_JOB_VERTICALS,
  KURUMSAL_SHORTLIST_MAX,
  type KurumsalJobVerticalId,
  type KurumsalSkillCatalog,
  type KurumsalSkillOption,
  type OwnerJobView,
} from "@/lib/sales/kurumsal-screening";
import type { KurumsalOfferQuote } from "@/lib/sales/kurumsal-offers";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

const OPENING_WEIGHTS = ["50", "30", "20"] as const;

function presetWeights(skills: readonly KurumsalSkillOption[]): Record<string, string> {
  const weights: Record<string, string> = {};
  skills.forEach((skill, index) => {
    if (index < KURUMSAL_CRITERIA_MIN) {
      weights[skill.key] = OPENING_WEIGHTS[index] ?? "";
    }
  });
  return weights;
}

function openingKeys(skills: readonly KurumsalSkillOption[]): string[] {
  return skills.slice(0, KURUMSAL_CRITERIA_MIN).map((skill) => skill.key);
}

function bandLabel(job: OwnerJobView, band: OwnerJobView["applicants"][number]["band"]): string {
  if (band === "SHORTLISTED") {
    return `Mülakata Uygun (Top ${job.shortlistLimit})`;
  }
  if (band === "QUALIFIED_NOT_SHORTLISTED") {
    return "Barajı geçti — yedek liste";
  }
  if (band === "BELOW_THRESHOLD") {
    return "Baraj altı";
  }
  return "Test bekleniyor";
}

export function KurumsalScreeningCockpit({
  jobs,
  skills,
  boardUnavailable,
  signedIn,
  loginHref,
  screeningPrice,
}: {
  jobs: OwnerJobView[];
  skills: KurumsalSkillCatalog;
  boardUnavailable: boolean;
  signedIn: boolean;
  loginHref: string;
  screeningPrice: KurumsalOfferQuote;
}) {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [title, setTitle] = useState("");
  const [vertical, setVertical] = useState<KurumsalJobVerticalId>("ECOMMERCE");
  const [description, setDescription] = useState("");
  const [minScore, setMinScore] = useState(String(KURUMSAL_DEFAULT_MIN_SCORE));
  const [shortlistLimit, setShortlistLimit] = useState(String(KURUMSAL_DEFAULT_SHORTLIST));
  const [deadlineAt, setDeadlineAt] = useState("");
  const [included, setIncluded] = useState<string[]>(() => openingKeys(skills.ECOMMERCE));
  const [weights, setWeights] = useState<Record<string, string>>(() => presetWeights(skills.ECOMMERCE));
  const [pending, setPending] = useState(false);
  const [jobActionPending, setJobActionPending] = useState(false);
  const [buyPending, setBuyPending] = useState(false);
  const [distanceAccepted, setDistanceAccepted] = useState(false);
  const [digitalAccepted, setDigitalAccepted] = useState(false);
  /**
   * F2.12 — fatura künyesi. Sunucu `billing` alanını zorunlu tutar; burada
   * toplanmazsa satın alma düğmesi her zaman 422 alırdı ("Fatura künyesi gerekli").
   */
  const [billing, setBilling] = useState<CheckoutBillingFormState>(EMPTY_CHECKOUT_BILLING_FORM);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [selectedId, setSelectedId] = useState(jobs[0]?.id ?? "");

  useEffect(() => {
    if (!jobs.some((job) => job.id === selectedId)) {
      setSelectedId(jobs[0]?.id ?? "");
    }
  }, [jobs, selectedId]);

  const selected = jobs.find((job) => job.id === selectedId) ?? jobs[0] ?? null;
  const verticalSkills = skills[vertical] ?? [];
  const chosen = verticalSkills
    .filter((skill) => included.includes(skill.key))
    .map((skill) => ({ ...skill, weight: Number(weights[skill.key]) }));
  const weightTotal = chosen.reduce((sum, row) => sum + (Number.isInteger(row.weight) ? row.weight : 0), 0);
  const weightsReady =
    chosen.length >= KURUMSAL_CRITERIA_MIN &&
    chosen.length <= KURUMSAL_CRITERIA_MAX &&
    chosen.every((row) => Number.isInteger(row.weight) && row.weight >= 1 && row.weight <= 100) &&
    weightTotal === 100;
  const weightLine = chosen.map((row) => `${row.label} %${Number.isInteger(row.weight) ? row.weight : "—"}`).join(" + ");
  const purchaseLive = screeningPrice.honesty === "live" && screeningPrice.amountMinor != null;
  const billingReady = isCheckoutBillingComplete(billing);
  const purchaseReady = purchaseLive && billingReady && distanceAccepted && digitalAccepted && !buyPending;

  function selectVertical(next: KurumsalJobVerticalId) {
    setVertical(next);
    setIncluded(openingKeys(skills[next] ?? []));
    setWeights(presetWeights(skills[next] ?? []));
  }

  function toggleSkill(key: string) {
    setIncluded((current) => {
      if (current.includes(key)) {
        return current.filter((item) => item !== key);
      }
      if (current.length >= KURUMSAL_CRITERIA_MAX) {
        return current;
      }
      return [...current, key];
    });
  }

  async function onPurchase() {
    if (!purchaseReady) {
      return;
    }
    const normalized = normalizeBillingInput(billing);
    if (!normalized.ok) {
      setError(normalized.error);
      return;
    }
    setBuyPending(true);
    setError("");
    setIframeUrl(null);
    try {
      const response = await fetch(
        "/api/kurumsal/satin-al",
        withRailApiVersion({
          method: "POST",
          headers: {
            "content-type": "application/json",
            "Idempotency-Key": crypto.randomUUID(),
          },
          body: JSON.stringify({
            ...CHECKOUT_LEGAL_CONSENT_PAYLOAD,
            billing: normalized.billing,
          }),
        }),
      );
      const body = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
        data?: Record<string, unknown>;
      } | null;
      if (!response.ok || body?.ok === false || !body?.data) {
        setError(typeof body?.error === "string" ? body.error : "Ödeme penceresi açılmadı.");
        return;
      }
      if (body.data.kind === "settled") {
        router.refresh();
        return;
      }
      const iframe = readPaytrIframeSrcFromCheckout(body.data);
      if (!iframe) {
        setError("Ödeme penceresi açılmadı.");
        return;
      }
      setIframeUrl(iframe);
    } catch {
      setError("Bağlantı kurulamadı. Yeniden dene.");
    } finally {
      setBuyPending(false);
    }
  }

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    if (!weightsReady) {
      setError("3 ile 5 yetkinlik seç. Ağırlıkların toplamı %100 olmalı.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const response = await fetch(
        "/api/kurumsal/ilanlar",
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            companyName,
            taxNumber,
            title,
            vertical,
            description,
            criteriaWeights: chosen.map((row) => ({ key: row.key, weight: row.weight })),
            minScore: Number(minScore),
            shortlistLimit: Number(shortlistLimit),
            deadlineAt: deadlineAt === "" ? null : deadlineAt,
          }),
        }),
      );
      const parsed = parseRailClientJson<{ job?: { id?: string } }>(await response.json().catch(() => null));
      if (!parsed.ok) {
        setError(parsed.error);
        return;
      }
      setTitle("");
      setDescription("");
      setTaxNumber("");
      setDeadlineAt("");
      router.refresh();
    } catch {
      setError("Bağlantı kurulamadı. Yeniden dene.");
    } finally {
      setPending(false);
    }
  }

  async function toggleJobActive(job: OwnerJobView) {
    setJobActionPending(true);
    setError("");
    try {
      const response = await fetch(
        `/api/kurumsal/ilanlar/${job.id}`,
        withRailApiVersion({
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ isActive: !job.isActive }),
        }),
      );
      const parsed = parseRailClientJson<{ job?: { id?: string } }>(await response.json().catch(() => null));
      if (!parsed.ok) {
        setError(parsed.error);
        return;
      }
      router.refresh();
    } catch {
      setError("İlan durumu güncellenemedi. Yeniden dene.");
    } finally {
      setJobActionPending(false);
    }
  }

  function downloadCsv(job: OwnerJobView) {
    window.location.assign(`/api/kurumsal/ilanlar/${job.id}/export?format=csv`);
  }

  async function copyLink(path: string) {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(path);
    } catch {
      setCopied("");
      setError("Bağlantı kopyalanamadı.");
    }
  }

  return (
    <>
      <section className="min-w-0" data-kurumsal-cockpit="create" data-kurumsal-column="compose">
        <Card eyebrow="Ana sütun" title="İş ilanı ve yetkinlik ağırlığı">
          <p className="text-sm leading-6 text-[var(--foreground)]">
            İlan, paylaştığın adresten başvuru alır. Aday, seçtiğin yetkinliklerin YetkinCV vaka testini sunucuda çözer.
            Ağırlıklı puan o alt testlerden hesaplanır. Puan satın alınmaz. Sahte ilan ve sahte aday yazılmaz.
          </p>
          <p className="mt-3 text-2xl font-semibold tracking-tight" data-price-honesty={screeningPrice.honesty}>
            {screeningPrice.label}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Kurumsal İlan ve Otomatik Aday Eleme Paketi. Lisans ilan açma hakkı verir; puan satın alınmaz.
          </p>
          {signedIn && purchaseLive ? (
            <div className="mt-4 grid gap-3" data-kurumsal-purchase="">
              <CheckoutBillingFields value={billing} onChange={setBilling} />
              <CheckoutConsentFields
                distanceAccepted={distanceAccepted}
                digitalAccepted={digitalAccepted}
                onDistanceChange={setDistanceAccepted}
                onDigitalChange={setDigitalAccepted}
              />
              <Button type="button" disabled={!purchaseReady} onClick={() => void onPurchase()}>
                {buyPending ? "Ödeme açılıyor…" : `Paketi satın al — ${screeningPrice.label}`}
              </Button>
              {!billingReady ? (
                <p className="text-xs text-[var(--muted)]">
                  Fatura künyesi olmadan tahsilat açılmaz. Ad, adres ve telefon zorunludur.
                </p>
              ) : null}
              {iframeUrl ? <PaytrCheckoutIframe src={iframeUrl} title="Kurumsal paket ödemesi" /> : null}
            </div>
          ) : null}
          {signedIn && !purchaseLive ? (
            <p className="mt-3 text-sm text-[var(--muted)]">
              Paket katalogda henüz satışa açık değil. Ön talep formundan yazabilirsin.
            </p>
          ) : null}
          {signedIn ? (
            <form className="mt-4 grid gap-3" onSubmit={(event) => void onCreate(event)}>
              <label className="grid gap-1.5 text-sm font-medium">
                Şirket adı
                <Input value={companyName} onChange={(event) => setCompanyName(event.target.value)} required maxLength={120} />
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                Vergi / TCKN no
                <Input
                  value={taxNumber}
                  onChange={(event) => setTaxNumber(event.target.value)}
                  inputMode="numeric"
                  required
                  minLength={10}
                  maxLength={11}
                  placeholder="10 veya 11 rakam"
                />
              </label>
              <p className="text-xs text-[var(--muted)]">
                Numara kaydedilir; kurumsal kimlik doğrulaması ayrı mühürdür. Doğrulanmamış ilan arama motorunda
                indekslenmez.
              </p>
              <label className="grid gap-1.5 text-sm font-medium">
                Pozisyon adı
                <Input value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={160} />
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                Uzmanlık
                <select
                  className={INPUT_SURFACE_CLASS}
                  value={vertical}
                  onChange={(event) => selectVertical(event.target.value as KurumsalJobVerticalId)}
                >
                  {KURUMSAL_JOB_VERTICALS.map((row) => (
                    <option key={row.id} value={row.id}>
                      {row.label}
                    </option>
                  ))}
                </select>
              </label>
              <fieldset className="grid gap-2">
                <legend className="text-sm font-medium">Yetkinlik ağırlıkları</legend>
                <p className="text-xs leading-5 text-[var(--muted)]">
                  Liste bu uzmanlığın vaka bankasından gelir. 3 ile 5 yetkinlik seç, toplam %100 olsun.
                </p>
                <ul className="grid gap-2">
                  {verticalSkills.map((skill) => {
                    const on = included.includes(skill.key);
                    return (
                      <li key={skill.key} className="grid grid-cols-[auto_minmax(0,1fr)_4.5rem] items-center gap-2">
                        <input
                          type="checkbox"
                          checked={on}
                          aria-label={skill.label}
                          onChange={() => toggleSkill(skill.key)}
                        />
                        <span className="text-sm">{skill.label}</span>
                        <Input
                          type="number"
                          min={1}
                          max={100}
                          value={weights[skill.key] ?? ""}
                          disabled={!on}
                          aria-label={`${skill.label} ağırlığı`}
                          onChange={(event) =>
                            setWeights((current) => ({ ...current, [skill.key]: event.target.value }))
                          }
                        />
                      </li>
                    );
                  })}
                </ul>
                <p
                  className={weightsReady ? "text-sm font-semibold text-emerald-700" : "text-sm font-semibold text-rose-700"}
                  data-weight-total={weightTotal}
                  data-weight-ready={weightsReady ? "yes" : "no"}
                >
                  {weightLine.length > 0 ? `${weightLine} = %${weightTotal}` : "Yetkinlik seçilmedi"}
                </p>
              </fieldset>
              <label className="grid gap-1.5 text-sm font-medium">
                Son başvuru tarihi
                <Input type="date" value={deadlineAt} onChange={(event) => setDeadlineAt(event.target.value)} />
              </label>
              <p className="text-xs leading-5 text-[var(--muted)]">
                İsteğe bağlı. Seçilen gün Türkiye saatiyle gün sonuna kadar açık kalır. Boşsa kapanış günü yoktur.
              </p>
              <label className="grid gap-1.5 text-sm font-medium">
                İş tanımı ve aranan nitelikler
                <Textarea value={description} onChange={(event) => setDescription(event.target.value)} required minLength={40} maxLength={4000} rows={5} />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-medium">
                  Baraj puanı
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={minScore}
                    onChange={(event) => setMinScore(event.target.value)}
                    required
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-medium">
                  Mülakata çağrılacak aday (N)
                  <Input
                    type="number"
                    min={1}
                    max={KURUMSAL_SHORTLIST_MAX}
                    value={shortlistLimit}
                    onChange={(event) => setShortlistLimit(event.target.value)}
                    required
                  />
                </label>
              </div>
              {error ? <p className="text-sm text-rose-700">{error}</p> : null}
              <Button type="submit" disabled={pending || !weightsReady}>
                {pending ? "Kaydediliyor" : "İlanı aç"}
              </Button>
            </form>
          ) : (
            <a href={loginHref} className={buttonClassName("primary", "md", "mt-4")}>
              İlan açmak için giriş yap
            </a>
          )}
          {boardUnavailable ? (
            <p className="mt-4 text-sm text-[var(--foreground)]">İlan listesi şu an okunamadı. Sahte ilan basılmaz.</p>
          ) : null}
          {jobs.length > 0 ? (
            <ul className="mt-4 grid gap-2">
              {jobs.map((job) => (
                <li key={job.id} className="rounded-xl border border-[var(--border)] px-3 py-2">
                  <button type="button" className="text-left" onClick={() => setSelectedId(job.id)}>
                    <span className="block text-sm font-semibold">{job.title}</span>
                    <span className="block text-xs text-[var(--muted)]">
                      {job.companyName} · {job.verticalLabel} · {job.isActive ? "Açık" : "Kapalı"}
                      {job.employerVerified ? " · Doğrulanmış İşveren ✓" : " · Kimlik doğrulaması beklemede"}
                    </span>
                    {job.deadlineLabel ? (
                      <span className="mt-1 block text-xs text-[var(--muted)]">Son başvuru {job.deadlineLabel}</span>
                    ) : null}
                    {job.criteriaLine ? <span className="mt-1 block text-xs leading-5">{job.criteriaLine}</span> : null}
                  </button>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--safir)]"
                      onClick={() => void copyLink(job.applyPath)}
                    >
                      <IconCopy className="h-3.5 w-3.5" />
                      {copied === job.applyPath ? "Kopyalandı" : "Başvuru bağlantısını kopyala"}
                    </button>
                    <button
                      type="button"
                      className="text-xs font-semibold text-[var(--foreground)] underline-offset-2 hover:underline"
                      disabled={jobActionPending}
                      onClick={() => void toggleJobActive(job)}
                    >
                      {job.isActive ? "İlanı kapat" : "Yeniden aç"}
                    </button>
                    <button
                      type="button"
                      className="text-xs font-semibold text-[var(--foreground)] underline-offset-2 hover:underline"
                      onClick={() => downloadCsv(job)}
                    >
                      Kısa listeyi CSV indir
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : signedIn && !boardUnavailable ? (
            <p className="mt-4 text-sm text-[var(--muted)]">Henüz ilan yok. Açtığın ilan burada durur.</p>
          ) : null}
        </Card>
      </section>
      <section className="min-w-0" data-kurumsal-cockpit="shortlist" data-kurumsal-column="shortlist">
        <Card eyebrow="Sıralama" title="Ağırlıklı mülakat kısa listesi">
          {!selected ? (
            <p className="text-sm leading-6 text-[var(--foreground)]">
              İlan açılınca testi bitiren adaylar ağırlıklı puana göre dizilir. Örnek aday yazılmaz.
            </p>
          ) : (
            <>
              <label className="grid gap-1.5 text-sm font-medium">
                İlan
                <select
                  className={INPUT_SURFACE_CLASS}
                  value={selected.id}
                  onChange={(event) => setSelectedId(event.target.value)}
                >
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                    </option>
                  ))}
                </select>
              </label>
              <p className="mt-3 text-sm leading-6">
                {selected.criteriaLine ?? "Bu ilanın yetkinlik ağırlığı yok."}
                {selected.deadlineLabel ? ` Son başvuru ${selected.deadlineLabel}.` : ""} Baraj {selected.minScore}/100. Mülakat
                kontenjanı ilk {selected.shortlistLimit} aday. Sıra, yuvarlanmış ağırlıklı puana göredir. CV özeti yalnız
                bu ilanın sahibine görünür.
              </p>
              {selected.applicants.length === 0 ? (
                <p className="mt-3 text-sm text-[var(--muted)]">Bu ilana henüz başvuru yok.</p>
              ) : (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-[40rem] text-left text-sm">
                    <caption className="sr-only">Ağırlıklı aday sıralaması</caption>
                    <thead className="text-xs uppercase tracking-wide text-[var(--muted)]">
                      <tr>
                        <th className="py-2 pr-3">Sıra</th>
                        <th className="py-2 pr-3">Aday</th>
                        <th className="py-2 pr-3">Ağırlıklı puan</th>
                        <th className="py-2 pr-3">Alt kırılım</th>
                        <th className="py-2 pr-3">Durum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selected.applicants.map((row) => (
                        <tr key={row.id} className="border-t border-[var(--border)] align-top">
                          <td className="py-2 pr-3">{row.rank ?? "—"}</td>
                          <td className="py-2 pr-3">
                            <span className="block font-medium">{row.candidateName}</span>
                            <span className="block text-xs text-[var(--muted)]">{row.candidateEmail}</span>
                            <details className="mt-1">
                              <summary className="cursor-pointer text-xs text-[var(--safir)]">CV özeti</summary>
                              <p
                                className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-800"
                                data-candidate-claim-label="unverified"
                              >
                                Aday beyanı (doğrulanmamış metin)
                              </p>
                              <p className="mt-1 max-w-md whitespace-pre-wrap text-xs leading-5">{row.cvSummary}</p>
                            </details>
                          </td>
                          <td className="py-2 pr-3 font-semibold">
                            {row.weightedScore === null
                              ? row.testScore === null
                                ? "—"
                                : `YetkinCV ${row.testScore}/100`
                              : `${row.weightedScore}/100`}
                          </td>
                          <td className="py-2 pr-3 text-xs leading-5">
                            {row.skillLine ?? (row.band === "PENDING_TEST" ? "Test bekleniyor" : "Alt kırılım yok")}
                          </td>
                          <td className="py-2 pr-3">
                            <span
                              className={
                                row.band === "SHORTLISTED"
                                  ? "inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800"
                                  : row.band === "QUALIFIED_NOT_SHORTLISTED"
                                    ? "inline-flex rounded-full bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-800"
                                    : row.band === "BELOW_THRESHOLD"
                                      ? "inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                                      : "inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800"
                              }
                            >
                              {bandLabel(selected, row.band)}
                            </span>
                            {row.verifyPath ? (
                              <a href={row.verifyPath} className="mt-1 block text-xs font-semibold text-[var(--safir)]">
                                Doğrulama bağı
                              </a>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </Card>
      </section>
    </>
  );
}
