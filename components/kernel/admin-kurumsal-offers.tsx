"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { INPUT_SURFACE_CLASS } from "@/components/ui/input";
import { ADMIN_SEN } from "@/lib/copy/sen-voice/admin";
import {
  KURUMSAL_OFFER_STATUSES,
  type KurumsalOfferRow,
  type KurumsalOfferStatusFilter,
} from "@/lib/kernel/admin/kurumsal-offer-parse";
import { ADMIN_B2B_OFFER_PATH } from "@/lib/kernel/admin/types";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

const STATUS_ACTIONS = ["CONTACTED", "QUALIFIED", "WON", "LOST"] as const;

export function AdminKurumsalOffers({
  rows,
  page,
  pageSize,
  total,
  status,
}: {
  rows: readonly KurumsalOfferRow[];
  page: number;
  pageSize: number;
  total: number;
  status: KurumsalOfferStatusFilter;
}) {
  const router = useRouter();
  const copy = ADMIN_SEN.b2b;
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>(() =>
    Object.fromEntries(rows.map((row) => [row.id, row.adminNote])),
  );
  const [statuses, setStatuses] = useState<Record<string, string>>(() =>
    Object.fromEntries(rows.map((row) => [row.id, row.status])),
  );

  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  function hrefFor(nextPage: number, nextStatus: KurumsalOfferStatusFilter): string {
    const params = new URLSearchParams();
    if (nextStatus !== "ALL") {
      params.set("status", nextStatus);
    }
    if (nextPage > 1) {
      params.set("page", String(nextPage));
    }
    const qs = params.toString();
    return qs ? `/admin/b2b?${qs}` : "/admin/b2b";
  }

  async function save(row: KurumsalOfferRow) {
    setPendingId(row.id);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(
        `${ADMIN_B2B_OFFER_PATH}/${row.id}`,
        withRailApiVersion({
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            status: statuses[row.id] ?? row.status,
            adminNote: notes[row.id] ?? "",
          }),
        }),
      );
      const parsed = parseRailClientJson<Record<string, unknown>>(await response.json());
      setPendingId(null);
      if (!parsed.ok) {
        setError(parsed.error ?? ADMIN_SEN.ops.failed);
        return;
      }
      setNotice(ADMIN_SEN.ops.saved);
      router.refresh();
    } catch {
      setPendingId(null);
      setError(ADMIN_SEN.ops.failed);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          {copy.offersStatus}
          <select
            className={INPUT_SURFACE_CLASS}
            value={status}
            onChange={(event) => {
              router.push(hrefFor(1, event.target.value as KurumsalOfferStatusFilter));
            }}
          >
            <option value="ALL">{copy.offersFilterAll}</option>
            {KURUMSAL_OFFER_STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <p className="text-xs text-[var(--muted)]">
          {total} talep · sayfa {page}/{pageCount}
        </p>
      </div>
      {error ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
      {notice ? <p className="text-sm text-[var(--emerald)]">{notice}</p> : null}
      {rows.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">{copy.offersEmpty}</p>
      ) : (
        <ul className="divide-y divide-[var(--border)]">
          {rows.map((row) => (
            <li key={row.id} className="space-y-2 py-3 text-sm">
              <p className="font-medium text-[var(--foreground)]">
                {row.companyName}
                <span className="ml-2 font-normal text-[var(--muted)]">{row.city}</span>
                <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                  {row.status}
                </span>
              </p>
              <p className="text-[var(--muted)]">
                {copy.offersPackage}: {row.packageLabel}
                <span className="mx-2">·</span>
                {row.email}
                {row.quotedAmountMinor != null ? (
                  <>
                    <span className="mx-2">·</span>
                    {copy.offersQuoted}: {(row.quotedAmountMinor / 100).toLocaleString("tr-TR")} ₺
                  </>
                ) : null}
              </p>
              <p className="text-xs text-[var(--muted)]">
                {copy.offersWhen}: {row.createdAt.slice(0, 16).replace("T", " ")}
              </p>
              {row.note ? <p className="text-[var(--foreground)]">{row.note}</p> : null}
              <div className="grid gap-2 sm:grid-cols-[10rem_minmax(0,1fr)_auto]">
                <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                  {copy.offersStatus}
                  <select
                    className={INPUT_SURFACE_CLASS}
                    value={statuses[row.id] ?? row.status}
                    onChange={(event) =>
                      setStatuses((prev) => ({ ...prev, [row.id]: event.target.value }))
                    }
                  >
                    {STATUS_ACTIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                  {copy.offersAdminNote}
                  <input
                    className={INPUT_SURFACE_CLASS}
                    value={notes[row.id] ?? ""}
                    onChange={(event) =>
                      setNotes((prev) => ({ ...prev, [row.id]: event.target.value }))
                    }
                  />
                </label>
                <div className="flex items-end">
                  <Button
                    type="button"
                    size="sm"
                    disabled={pendingId !== null}
                    onClick={() => void save(row)}
                  >
                    {copy.offersSaveStatus}
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={page <= 1}
          onClick={() => router.push(hrefFor(page - 1, status))}
        >
          {copy.offersPagePrev}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={page >= pageCount}
          onClick={() => router.push(hrefFor(page + 1, status))}
        >
          {copy.offersPageNext}
        </Button>
      </div>
    </div>
  );
}
