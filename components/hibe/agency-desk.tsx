"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CHECKOUT_LEGAL_CONSENT_PAYLOAD } from "@/lib/kernel/legal/checkout-consent";
import { GRANT_NACE_GROUPS, GRANT_PROVINCES, GRANT_RD_LEVELS } from "@/lib/yetkinhibe/grant-brief-axes";
import {
  AGENCY_FOCUS_OPTIONS,
  agencyFocusLabel,
  type AgencyCatalogMatch,
  type AgencyClientCard,
} from "@/lib/yetkinhibe/agency-match";
import { isAgencyMode } from "@/lib/yetkinhibe/grant-profile-mode";
import { persistGrantProfileMode } from "@/lib/yetkinhibe/grant-profile-mode";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

export function HibeAgencyDesk({
  clients,
  matrix,
  agencyPriceLabel,
  agencyActive = false,
}: {
  clients: readonly AgencyClientCard[];
  matrix: readonly AgencyCatalogMatch[];
  agencyPriceLabel: string | null;
  agencyActive?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [buyConsent, setBuyConsent] = useState(false);
  const [buyPending, setBuyPending] = useState(false);
  const [buyError, setBuyError] = useState("");
  const [iframeUrl, setIframeUrl] = useState("");
  const agency = isAgencyMode("agency");

  useEffect(() => {
    persistGrantProfileMode("agency");
  }, []);

  async function buyAgency() {
    if (buyPending || !buyConsent || !agencyPriceLabel) {
      return;
    }
    setBuyPending(true);
    setBuyError("");
    try {
      const response = await fetch(
        "/api/tezgah/checkout",
        withRailApiVersion({
          method: "POST",
          headers: {
            "content-type": "application/json",
            "Idempotency-Key": crypto.randomUUID(),
          },
          body: JSON.stringify({
            kind: "hibe-agency",
            ...CHECKOUT_LEGAL_CONSENT_PAYLOAD,
          }),
        }),
      );
      const body = (await response.json()) as {
        ok?: boolean;
        error?: string;
        data?: { kind?: string; iframeUrl?: string };
      };
      if (!response.ok || body.ok === false) {
        setBuyError(typeof body.error === "string" ? body.error : "Ödeme penceresi açılmadı.");
        return;
      }
      if (body.data?.kind === "iframe" && typeof body.data.iframeUrl === "string") {
        setIframeUrl(body.data.iframeUrl);
        return;
      }
      setBuyError("Ödeme penceresi açılmadı. Bir süre sonra yeniden dene.");
    } catch {
      setBuyError("Ödeme penceresi açılmadı. Bir süre sonra yeniden dene.");
    } finally {
      setBuyPending(false);
    }
  }

  return (
    <div className="space-y-4" data-hibe-agency="">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <h2 className="text-base font-semibold">Ajans portföyü</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {agency
            ? "Tek hesapta müşteri kartlarını sen tutarsın. Matris yalnız açık ve doğrulanmış çağrıları yazar."
            : "Ajans modu kapalı."}
        </p>
        <p className="mt-2 text-sm" data-hibe-agency-price="">
          {agencyActive
            ? "Ajans paketi açık. Portföy matrisi ve yatırım odağı eşleşmesi etkin."
            : agencyPriceLabel ?? "Ajans katalog satırı açık değil. Tutar uydurulmaz."}
        </p>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Kart yatırım odağını taşır. Odak belirtilmezse yatırım odaklı çağrı uyum listesine girmez,
          «eksik» kovasında tek tek görünür.
        </p>
        {!agencyActive && agencyPriceLabel ? (
          <div className="mt-3 space-y-2" data-hibe-agency-buy="">
            <label className="flex items-start gap-2 text-xs leading-5">
              <input type="checkbox" checked={buyConsent} onChange={(event) => setBuyConsent(event.target.checked)} />
              <span>Mesafeli satış sözleşmesini ve dijital içeriğin anında ifasını kabul ediyorum.</span>
            </label>
            <button
              type="button"
              disabled={!buyConsent || buyPending}
              onClick={() => void buyAgency()}
              className="inline-flex h-10 items-center rounded-xl bg-emerald-700 px-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {buyPending ? "Ödeme açılıyor…" : "Ajans Paketini Satın Al (PayTR)"}
            </button>
            {buyError ? <p className="text-sm text-[var(--red-700,#b91c1c)]">{buyError}</p> : null}
            {iframeUrl ? (
              <iframe
                title="PayTR ödeme"
                src={iframeUrl}
                className="h-[520px] w-full rounded-xl border border-[var(--border)]"
              />
            ) : null}
          </div>
        ) : null}
      </section>

      <form
        className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (pending) {
            return;
          }
          const form = new FormData(event.currentTarget);
          const formEl = event.currentTarget;
          setPending(true);
          setError("");
          void fetch("/api/yetkinhibe/clients", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "Idempotency-Key": crypto.randomUUID(),
            },
            body: JSON.stringify({
              companyName: String(form.get("companyName") ?? ""),
              naceGroup: String(form.get("naceGroup") ?? ""),
              provinceCode: String(form.get("provinceCode") ?? ""),
              audience: String(form.get("audience") ?? ""),
              employeeCount: Number(form.get("employeeCount")),
              companyAgeYears: Number(form.get("companyAgeYears")),
              rdMaturityLevel: String(form.get("rdMaturityLevel") ?? ""),
              exportActive: form.get("exportActive") === "evet",
              investmentFocus: String(form.get("investmentFocus") ?? "genel"),
            }),
          })
            .then(async (response) => {
              const payload = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
              if (!response.ok || payload?.ok === false) {
                throw new Error(typeof payload?.error === "string" ? payload.error : "Müşteri yazılamadı.");
              }
              formEl.reset();
              router.refresh();
            })
            .catch((cause: unknown) => {
              setError(cause instanceof Error ? cause.message : "Müşteri yazılamadı.");
            })
            .finally(() => setPending(false));
        }}
      >
        <label className="text-sm font-medium sm:col-span-2">
          Firma adı
          <input name="companyName" required minLength={2} maxLength={160} className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm" />
        </label>
        <label className="text-sm font-medium">
          NACE
          <select name="naceGroup" required className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
            {GRANT_NACE_GROUPS.map((row) => (
              <option key={row.id} value={row.id}>
                {row.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          İl
          <select name="provinceCode" required className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
            {GRANT_PROVINCES.map((row) => (
              <option key={row.code} value={row.code}>
                {row.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Kitle
          <select name="audience" className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
            <option value="mevcut_kobi">Mevcut KOBİ</option>
            <option value="yeni_girisimci">Yeni girişimci</option>
          </select>
        </label>
        <label className="text-sm font-medium">
          Ar-Ge
          <select name="rdMaturityLevel" className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
            {GRANT_RD_LEVELS.map((row) => (
              <option key={row.id} value={row.id}>
                {row.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Yatırım odağı
          <select
            name="investmentFocus"
            defaultValue="genel"
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
          >
            {AGENCY_FOCUS_OPTIONS.map((row) => (
              <option key={row.id} value={row.id}>
                {row.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Çalışan
          <input name="employeeCount" required inputMode="numeric" defaultValue="1" className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm" />
        </label>
        <label className="text-sm font-medium">
          Yaş
          <input name="companyAgeYears" required inputMode="numeric" defaultValue="1" className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm" />
        </label>
        <label className="text-sm font-medium">
          İhracat
          <select name="exportActive" className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
            <option value="hayir">Hayır</option>
            <option value="evet">Evet</option>
          </select>
        </label>
        <button type="submit" disabled={pending} className="h-10 rounded-xl bg-emerald-700 px-3 text-sm font-semibold text-white disabled:opacity-60 sm:col-span-2">
          Müşteri ekle
        </button>
      </form>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      {clients.length === 0 ? (
        <p className="text-sm">Müşteri portföyün boş.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
          <table className="min-w-full text-sm">
            <thead className="bg-[var(--surface-muted)] text-left">
              <tr>
                <th className="px-3 py-2 font-semibold">Müşteri</th>
                <th className="px-3 py-2 font-semibold">İl / NACE / ölçek</th>
                <th className="px-3 py-2 font-semibold">Yatırım odağı</th>
                <th className="px-3 py-2 font-semibold">Uyan açık çağrılar</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((row) => {
                const client = clients.find((item) => item.id === row.clientId);
                return (
                  <tr key={row.clientId} className="border-t border-[var(--border)]" data-hibe-matrix-row={row.clientId}>
                    <td className="px-3 py-2 align-top font-semibold">{row.companyName}</td>
                    <td className="px-3 py-2 align-top">
                      {client ? `${client.provinceCode} · ${client.naceGroup} · ${client.employeeCount} çalışan` : "—"}
                    </td>
                    <td className="px-3 py-2 align-top" data-hibe-matrix-focus={row.clientId}>
                      {agencyFocusLabel(client?.investmentFocus)}
                    </td>
                    <td className="px-3 py-2 align-top">
                      {row.eligible.length === 0 ? (
                        <span>Bu karta uyan açık çağrı yok.</span>
                      ) : (
                        <ul className="space-y-1">
                          {row.eligible.map((call) => (
                            <li key={call.grantId}>{call.title}</li>
                          ))}
                        </ul>
                      )}
                      {row.incomplete.length > 0 ? (
                        <p className="mt-2 text-xs text-[var(--muted)]">
                          {row.incomplete.length} çağrı yatırım odağı veya patent eksik olduğu için dışarıda.
                        </p>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
