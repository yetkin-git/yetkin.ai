"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  GRANT_LIFECYCLE_PHASE_ORDER,
  GRANT_PHASE_LABEL,
  HIBE_DOCUMENT_CATEGORIES,
  hibeDocumentCategoryLabel,
  nextGrantLifecyclePhase,
} from "@/lib/yetkinhibe/grant-lifecycle";
import type { HibeApplicationView } from "@/lib/yetkinhibe/lifecycle-view";

type ProgramOption = { id: string; title: string };
type ClientOption = { id: string; companyName: string };

async function postJson(url: string, method: "POST" | "PATCH", body: Record<string, unknown>) {
  const response = await fetch(url, {
    method,
    headers: {
      "content-type": "application/json",
      "Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  if (!response.ok || payload?.ok === false) {
    throw new Error(typeof payload?.error === "string" ? payload.error : "Kayıt yazılamadı.");
  }
}

export function HibeLifecycleDesk({
  applications,
  programs,
  clients,
}: {
  applications: readonly HibeApplicationView[];
  programs: readonly ProgramOption[];
  clients: readonly ClientOption[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function run(task: () => Promise<void>) {
    if (pending) {
      return;
    }
    setPending(true);
    setError("");
    try {
      await task();
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Kayıt yazılamadı.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4" data-hibe-lifecycle="">
      <form
        className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          const grantCallId = String(form.get("grantCallId") ?? "");
          const title = String(form.get("title") ?? "");
          const clientId = String(form.get("clientId") ?? "");
          const nextDeadlineAt = String(form.get("nextDeadlineAt") ?? "");
          const notes = String(form.get("notes") ?? "");
          const formEl = event.currentTarget;
          void run(async () => {
            await postJson("/api/yetkinhibe/applications", "POST", {
              grantCallId,
              title,
              clientId: clientId || null,
              nextDeadlineAt: nextDeadlineAt ? new Date(nextDeadlineAt).toISOString() : null,
              notes: notes || null,
            });
            formEl.reset();
          });
        }}
      >
        <h2 className="text-base font-semibold">Yeni başvuru satırı</h2>
        <p className="text-sm text-[var(--muted)]">
          Faz başvuru onayından başlar. Son tarih uyarısı 7, 3 ve 1 gün kala gelir. Bu kayıt kurum kararı değildir.
        </p>
        <label className="text-sm font-medium">
          Çağrı
          <select name="grantCallId" required className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
            <option value="">Çağrı seç</option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.title}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Başlık
          <input name="title" required minLength={2} maxLength={300} className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm" />
        </label>
        <label className="text-sm font-medium">
          Müşteri kartı
          <select name="clientId" className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
            <option value="">Yok</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.companyName}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Son tarih
          <input name="nextDeadlineAt" type="date" className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm" />
        </label>
        <label className="text-sm font-medium">
          Not
          <textarea name="notes" maxLength={2000} className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm" />
        </label>
        <button type="submit" disabled={pending} className="h-10 rounded-xl bg-emerald-700 px-3 text-sm font-semibold text-white disabled:opacity-60">
          Başvuru satırı oluştur
        </button>
      </form>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      {applications.length === 0 ? (
        <p className="text-sm">Kayıtlı başvurun yok.</p>
      ) : (
        <ul className="space-y-4">
          {applications.map((row) => {
            const next = nextGrantLifecyclePhase(row.phase);
            const currentIndex = GRANT_LIFECYCLE_PHASE_ORDER.indexOf(row.phase);
            return (
              <li key={row.id} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <h3 className="font-semibold">{row.title}</h3>
                <p className="mt-1 text-sm">Şu anki faz: {row.phaseLabel}</p>
                <ol className="mt-3 grid grid-cols-5 gap-1" aria-label="Başvuru fazları">
                  {GRANT_LIFECYCLE_PHASE_ORDER.map((phase, index) => {
                    const state = index < currentIndex ? "completed" : index === currentIndex ? "active" : "upcoming";
                    return (
                      <li key={phase} data-phase-state={state} className="text-center">
                        <span
                          className={
                            state === "upcoming"
                              ? "block h-2 rounded-full bg-[var(--surface-muted)]"
                              : "block h-2 rounded-full bg-emerald-600"
                          }
                        />
                        <span className="mt-1 block text-[10px] leading-4">{GRANT_PHASE_LABEL[phase]}</span>
                      </li>
                    );
                  })}
                </ol>
                <p className="mt-3 text-sm" data-hibe-deadline="">
                  {row.remainingDays === null
                    ? "Son tarih yok."
                    : row.remainingDays < 0
                      ? "Son tarih geçti."
                      : `Son tarihe ${row.remainingDays} gün`}
                </p>
                {row.alert ? (
                  <p className="mt-1 text-sm font-semibold" data-hibe-alert={row.alertSeverity ?? ""}>
                    {row.alert}
                  </p>
                ) : null}
                {next ? (
                  <button
                    type="button"
                    disabled={pending}
                    className="mt-3 h-10 rounded-xl border border-[var(--border)] px-3 text-sm font-semibold"
                    onClick={() =>
                      void run(() =>
                        postJson(`/api/yetkinhibe/applications/${row.id}/phase`, "PATCH", { phase: next }),
                      )
                    }
                  >
                    Sıradaki faz: {GRANT_PHASE_LABEL[next]}
                  </button>
                ) : (
                  <p className="mt-3 text-sm">Ödeme fazındasın. Sonraki geçiş yok.</p>
                )}
                <ul className="mt-4 space-y-2">
                  {row.documents.map((document) => (
                    <li key={document.id} className="rounded-xl border border-[var(--border)] p-3 text-sm">
                      <p className="font-semibold">{document.title}</p>
                      <p>
                        {document.categoryLabel} · {document.statusLabel}
                      </p>
                      {document.reviewerNote ? <p className="text-[var(--muted)]">{document.reviewerNote}</p> : null}
                      <label className="mt-2 block text-xs font-medium">
                        Durum
                        <select
                          defaultValue={document.status}
                          className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
                          onChange={(event) => {
                            const status = event.target.value;
                            void run(() =>
                              postJson(`/api/yetkinhibe/applications/${row.id}/documents`, "PATCH", {
                                documentId: document.id,
                                status,
                              }),
                            );
                          }}
                        >
                          <option value="approved">Onaylı</option>
                          <option value="pending">Bekliyor</option>
                          <option value="missing">Eksik</option>
                          <option value="rejected">Red</option>
                        </select>
                      </label>
                    </li>
                  ))}
                </ul>
                <form
                  className="mt-3 grid gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const form = new FormData(event.currentTarget);
                    const formEl = event.currentTarget;
                    void run(async () => {
                      await postJson(`/api/yetkinhibe/applications/${row.id}/documents`, "POST", {
                        title: String(form.get("title") ?? ""),
                        category: String(form.get("category") ?? ""),
                        fileUrl: String(form.get("fileUrl") ?? "") || null,
                        referenceCode: String(form.get("referenceCode") ?? "") || null,
                      });
                      formEl.reset();
                    });
                  }}
                >
                  <p className="text-sm font-semibold">Evrak ekle</p>
                  <input name="title" required minLength={2} maxLength={200} placeholder="Evrak adı" className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm" />
                  <select name="category" className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm">
                    {HIBE_DOCUMENT_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {hibeDocumentCategoryLabel(category)}
                      </option>
                    ))}
                  </select>
                  <input name="referenceCode" maxLength={80} placeholder="Referans kodu" className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm" />
                  <input name="fileUrl" maxLength={500} placeholder="https:// dosya adresi" className="rounded-xl border border-[var(--border)] px-3 py-2 text-sm" />
                  <button type="submit" disabled={pending} className="h-10 rounded-xl bg-emerald-700 px-3 text-sm font-semibold text-white disabled:opacity-60">
                    Evrak kasasına ekle
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
