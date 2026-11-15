"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { GoogleContinueButton } from "@/components/auth/google-continue-button";
import { academyCheckoutHref } from "@/lib/academy/storefront-cta";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import { Input, INPUT_SURFACE_CLASS } from "@/components/ui/input";
import { LinkButton } from "@/components/ui/link-button";
import { Textarea } from "@/components/ui/textarea";
import { DukkanPreview } from "@/components/tezgah/dukkan-preview";
import { GrantProjectReportView } from "@/components/tezgah/grant-project-report";
import { PazaryeriPreview } from "@/components/tezgah/pazaryeri-preview";
import { TetkikReportView } from "@/components/tezgah/tetkik-report";
import { DUKKAN_FILENAME } from "@/lib/tezgah/dukkan/copy";
import type { GrantProjectReport } from "@/lib/tezgah/grant/types";
import { PAZARYERI_FILENAME } from "@/lib/tezgah/pazaryeri/copy";
import { REKLAM_FILE_STEM } from "@/lib/tezgah/reklam/copy";
import { GRANT_PROJECT_DISCLAIMER, isGrantWithheldNote } from "@/lib/yetkinhibe/grant-project-notes";
import { buildCitizenRegisterHref } from "@/lib/kernel/auth/redirects";
import {
  TEZGAH_GUEST_QUOTA_MESSAGE,
  TEZGAH_MEMBER_QUOTA_MESSAGE,
  TEZGAH_TOOLS,
  parseTezgahToolParam,
  tezgahQuotaLine,
  tezgahToolAnchorPath,
  tezgahToolById,
  tezgahToolHref,
  type TezgahField,
  type TezgahToolId,
} from "@/lib/tezgah/catalog";
import type { TetkikReport } from "@/lib/tezgah/tetkik/types";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

type QuotaBody = {
  remaining: number;
  limit: number;
  guest: boolean;
};

type TetkikPayload = TetkikReport & QuotaBody;

type DukkanPayload = QuotaBody & {
  tool: "dukkan";
  html: string;
  score: 100;
  filename: typeof DUKKAN_FILENAME;
};

type ReklamPayload = QuotaBody & {
  tool: "reklam";
  markdown: string;
  filename: typeof REKLAM_FILE_STEM;
};

type PazaryeriPayload = QuotaBody & {
  tool: "pazaryeri";
  csv: string;
  filename: typeof PAZARYERI_FILENAME;
  columns: string[];
  rows: string[][];
};

type CatalogPreview = {
  columns: string[];
  rows: string[][];
  csv: string;
};

const REGISTER_HREF = buildCitizenRegisterHref("/tezgah") as Route;

function fieldReady(field: TezgahField, values: Record<string, string>): boolean {
  const value = (values[field.name] ?? "").trim();
  if (field.optional) {
    return value.length === 0 || value.length >= 2;
  }
  if (field.kind === "select") {
    return (field.options ?? []).some((option) => option.value === value);
  }
  if (field.name === "services") {
    const lines = value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    return lines.length >= 3 && lines.length <= 5 && lines.every((line) => line.length >= 2 && line.length <= 80);
  }
  if (field.name === "whatsapp") {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 12;
  }
  if (field.name === "url") {
    return value.length >= 12;
  }
  if (field.name === "products") {
    return value.length >= 2 && value.length <= 4000;
  }
  if (field.name === "offer") {
    return value.length >= 2 && value.length <= 400;
  }
  if (field.name === "employeeCount") {
    return /^\d{1,6}$/.test(value) && Number(value) <= 100_000;
  }
  if (field.name === "companyAgeYears") {
    return /^\d{1,3}$/.test(value) && Number(value) <= 150;
  }
  return value.length >= 2;
}

function FieldControl({
  field,
  value,
  onChange,
}: {
  field: TezgahField;
  value: string;
  onChange: (value: string) => void;
}) {
  if (field.kind === "textarea") {
    return (
      <Textarea
        className="mt-1"
        name={field.name}
        value={value}
        placeholder={field.placeholder}
        rows={field.name === "products" ? 8 : 5}
        maxLength={
          field.name === "services"
            ? 450
            : field.name === "offer"
              ? 400
              : field.name === "products"
                ? 4000
                : field.name === "project"
                  ? 1500
                  : field.name === "scheduleWindows"
                    ? 500
                    : field.name === "investmentAmounts"
                      ? 400
                      : undefined
        }
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }
  if (field.kind === "select") {
    return (
      <select
        className={cn("mt-1", INPUT_SURFACE_CLASS)}
        name={field.name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{field.placeholder}</option>
        {(field.options ?? []).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
  return (
    <Input
      name={field.name}
      type={field.name === "url" ? "url" : field.name === "whatsapp" ? "tel" : "text"}
      value={value}
      placeholder={field.placeholder}
      maxLength={
        field.name === "whatsapp" ? 32 : field.name === "employeeCount" ? 6 : field.name === "companyAgeYears" ? 3 : undefined
      }
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function isGrantPayload(data: unknown): data is GrantProjectReport & QuotaBody {
  if (!data || typeof data !== "object") {
    return false;
  }
  const row = data as Partial<GrantProjectReport & QuotaBody>;
  const withheldOk = (items: unknown): boolean =>
    Array.isArray(items) &&
    items.every((item) => {
      if (!item || typeof item !== "object") {
        return false;
      }
      const note = (item as { note?: unknown }).note;
      return typeof note === "string" && isGrantWithheldNote(note) && !("poolAmountMinor" in item) && !("supportRatioBps" in item);
    });
  return (
    row.tool === "grant" &&
    row.disclaimer === GRANT_PROJECT_DISCLAIMER &&
    typeof row.businessName === "string" &&
    typeof row.freelancerName === "string" &&
    typeof row.purpose === "string" &&
    typeof row.market === "string" &&
    typeof row.risk === "string" &&
    Array.isArray(row.eligible) &&
    row.eligible.every(
      (item) =>
        !!item &&
        typeof item.poolLabel === "string" &&
        typeof item.ceilingLabel === "string" &&
        typeof item.ratioLabel === "string" &&
        !("poolAmountMinor" in item) &&
        !("supportRatioBps" in item),
    ) &&
    withheldOk(row.closed) &&
    withheldOk(row.unverified) &&
    Array.isArray(row.schedule) &&
    row.schedule.length === 4 &&
    Array.isArray(row.investments) &&
    row.investments.length === 5 &&
    row.investments.every(
      (item) => !!item && (item.amountLabel === null || typeof item.amountLabel === "string"),
    ) &&
    typeof row.remaining === "number" &&
    typeof row.limit === "number"
  );
}

function isTetkikPayload(data: unknown): data is TetkikPayload {
  if (!data || typeof data !== "object") {
    return false;
  }
  const row = data as Partial<TetkikPayload>;
  return (
    row.tool === "tetkik" &&
    typeof row.score === "number" &&
    typeof row.narrative === "string" &&
    typeof row.disclaimer === "string" &&
    Array.isArray(row.checks) &&
    typeof row.remaining === "number" &&
    typeof row.limit === "number"
  );
}

function isReklamPayload(data: unknown): data is ReklamPayload {
  if (!data || typeof data !== "object") {
    return false;
  }
  const row = data as Partial<ReklamPayload>;
  return (
    row.tool === "reklam" &&
    typeof row.markdown === "string" &&
    row.markdown.length > 0 &&
    row.filename === REKLAM_FILE_STEM &&
    typeof row.remaining === "number" &&
    typeof row.limit === "number"
  );
}

function isPazaryeriPayload(data: unknown): data is PazaryeriPayload {
  if (!data || typeof data !== "object") {
    return false;
  }
  const row = data as Partial<PazaryeriPayload>;
  return (
    row.tool === "pazaryeri" &&
    typeof row.csv === "string" &&
    row.csv.length > 0 &&
    row.filename === PAZARYERI_FILENAME &&
    Array.isArray(row.columns) &&
    row.columns.every((column) => typeof column === "string") &&
    Array.isArray(row.rows) &&
    row.rows.every((line) => Array.isArray(line) && line.every((cell) => typeof cell === "string")) &&
    typeof row.remaining === "number" &&
    typeof row.limit === "number"
  );
}

function isDukkanPayload(data: unknown): data is DukkanPayload {
  if (!data || typeof data !== "object") {
    return false;
  }
  const row = data as Partial<DukkanPayload>;
  return (
    row.tool === "dukkan" &&
    typeof row.html === "string" &&
    row.html.length > 0 &&
    row.score === 100 &&
    row.filename === DUKKAN_FILENAME &&
    typeof row.remaining === "number" &&
    typeof row.limit === "number"
  );
}

function Deliverable({ markdown }: { markdown: string }) {
  return (
    <div className="space-y-1.5 text-sm leading-6 text-[var(--foreground)]">
      {markdown.split("\n").map((line, index) => {
        if (line.startsWith("## ")) {
          return (
            <h3 key={`${index}-${line}`} className="pt-3 text-base font-semibold first:pt-0">
              {line.slice(3)}
            </h3>
          );
        }
        if (line.startsWith("- ")) {
          return (
            <p key={`${index}-${line}`} className="pl-4">
              • {line.slice(2)}
            </p>
          );
        }
        if (/^\d+\.\s/.test(line)) {
          return (
            <p key={`${index}-${line}`} className="pl-4">
              {line}
            </p>
          );
        }
        if (!line.trim()) {
          return <div key={`gap-${index}`} className="h-2" />;
        }
        return <p key={`${index}-${line}`}>{line}</p>;
      })}
    </div>
  );
}

function downloadText(filename: string, text: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function TezgahWorkbench({
  freelancerName = "",
  signedIn = false,
}: {
  freelancerName?: string;
  signedIn?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toolParam = searchParams.get("tool");
  const pendingTool = useRef<TezgahToolId | null>(null);
  const [toolId, setToolId] = useState<TezgahToolId>(
    () => parseTezgahToolParam(toolParam) ?? "ecommerce",
  );
  const [values, setValues] = useState<Record<string, string>>((): Record<string, string> => {
    const name = freelancerName.trim();
    return name ? { freelancerName: name } : {};
  });
  const [quota, setQuota] = useState<QuotaBody | null>(null);
  const [markdown, setMarkdown] = useState("");
  const [report, setReport] = useState<TetkikReport | null>(null);
  const [grantReport, setGrantReport] = useState<GrantProjectReport | null>(null);
  const [shop, setShop] = useState<{ html: string; score: number } | null>(null);
  const [catalog, setCatalog] = useState<CatalogPreview | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const tool = tezgahToolById(toolId);

  const resetDeliverable = useCallback(() => {
    setMarkdown("");
    setReport(null);
    setGrantReport(null);
    setShop(null);
    setCatalog(null);
    setError("");
    setCopied(false);
  }, []);

  const selectTool = useCallback(
    (id: TezgahToolId) => {
      pendingTool.current = id;
      setToolId(id);
      resetDeliverable();
      router.replace(tezgahToolHref(id) as Route, { scroll: false });
    },
    [resetDeliverable, router],
  );

  useEffect(() => {
    let cancelled = false;
    async function loadQuota() {
      try {
        const response = await fetch("/api/tezgah/quota", withRailApiVersion({ method: "GET" }));
        const body = (await response.json()) as { ok?: boolean; data?: QuotaBody };
        if (!cancelled && body.ok && body.data) {
          setQuota(body.data);
        }
      } catch {
        if (!cancelled) {
          setQuota(null);
        }
      }
    }
    void loadQuota();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (toolParam !== null) {
      const next = parseTezgahToolParam(toolParam);
      if (pendingTool.current) {
        if (next === pendingTool.current) {
          pendingTool.current = null;
        }
        return;
      }
      const resolved = next ?? "ecommerce";
      if (resolved !== toolId) {
        setToolId(resolved);
        resetDeliverable();
      }
      return;
    }
    if (pendingTool.current) {
      return;
    }
    const fromHash = parseTezgahToolParam(window.location.hash.replace(/^#/, ""));
    if (fromHash) {
      if (fromHash !== toolId) {
        setToolId(fromHash);
      }
      return;
    }
    if (toolId !== "ecommerce") {
      setToolId("ecommerce");
      resetDeliverable();
    }
  }, [resetDeliverable, toolId, toolParam]);

  if (!tool) {
    return null;
  }
  const active = tool;
  const grant = active.id === "grant";
  const tetkik = active.id === "tetkik";
  const dukkan = active.id === "dukkan";
  const reklam = active.id === "reklam";
  const pazaryeri = active.id === "pazaryeri";

  const fieldsReady = active.fields.every((field) => fieldReady(field, values));
  const blocked = quota != null && quota.remaining <= 0;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!fieldsReady || pending || blocked) {
      return;
    }
    setPending(true);
    setError("");
    setCopied(false);
    try {
      if (tetkik) {
        const payload: Record<string, string> = {
          url: (values.url ?? "").trim(),
          businessName: (values.businessName ?? "").trim(),
          freelancerName: (values.freelancerName ?? "").trim(),
        };
        const agency = (values.agencyName ?? "").trim();
        if (agency.length >= 2) {
          payload.agencyName = agency;
        }
        const response = await fetch(
          "/api/tezgah/tetkik/generate",
          withRailApiVersion({
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          }),
        );
        const body = (await response.json()) as { ok?: boolean; error?: string; data?: unknown };
        if (!response.ok || body.ok === false || !isTetkikPayload(body.data)) {
          setReport(null);
          setError(typeof body.error === "string" ? body.error : "Çıktı üretilemedi.");
          if (response.status === 429 && quota) {
            setQuota({ ...quota, remaining: 0 });
          }
          return;
        }
        const data = body.data;
        setReport(data);
        setMarkdown("");
        setShop(null);
        setCatalog(null);
        setQuota({ remaining: data.remaining, limit: data.limit, guest: data.guest === true });
        return;
      }

      if (dukkan) {
        const payload = {
          businessName: (values.businessName ?? "").trim(),
          sector: (values.sector ?? "").trim(),
          place: (values.place ?? "").trim(),
          whatsapp: (values.whatsapp ?? "").trim(),
          services: (values.services ?? "").trim(),
          tone: (values.tone ?? "").trim(),
        };
        const response = await fetch(
          "/api/tezgah/dukkan/generate",
          withRailApiVersion({
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          }),
        );
        const body = (await response.json()) as { ok?: boolean; error?: string; data?: unknown };
        if (!response.ok || body.ok === false || !isDukkanPayload(body.data)) {
          setShop(null);
          setError(typeof body.error === "string" ? body.error : "Çıktı üretilemedi.");
          if (response.status === 429 && quota) {
            setQuota({ ...quota, remaining: 0 });
          }
          return;
        }
        const data = body.data;
        setShop({ html: data.html, score: data.score });
        setMarkdown("");
        setReport(null);
        setCatalog(null);
        setQuota({ remaining: data.remaining, limit: data.limit, guest: data.guest === true });
        return;
      }

      if (reklam) {
        const payload = {
          businessName: (values.businessName ?? "").trim(),
          sector: (values.sector ?? "").trim(),
          place: (values.place ?? "").trim(),
          aim: (values.aim ?? "").trim(),
          offer: (values.offer ?? "").trim(),
        };
        const response = await fetch(
          "/api/tezgah/reklam/generate",
          withRailApiVersion({
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          }),
        );
        const body = (await response.json()) as { ok?: boolean; error?: string; data?: unknown };
        if (!response.ok || body.ok === false || !isReklamPayload(body.data)) {
          setMarkdown("");
          setError(typeof body.error === "string" ? body.error : "Çıktı üretilemedi.");
          if (response.status === 429 && quota) {
            setQuota({ ...quota, remaining: 0 });
          }
          return;
        }
        const data = body.data;
        setMarkdown(data.markdown);
        setReport(null);
        setShop(null);
        setCatalog(null);
        setQuota({ remaining: data.remaining, limit: data.limit, guest: data.guest === true });
        return;
      }

      if (pazaryeri) {
        const payload = {
          market: (values.market ?? "").trim(),
          products: (values.products ?? "").trim(),
        };
        const response = await fetch(
          "/api/tezgah/pazaryeri/generate",
          withRailApiVersion({
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          }),
        );
        const body = (await response.json()) as { ok?: boolean; error?: string; data?: unknown };
        if (!response.ok || body.ok === false || !isPazaryeriPayload(body.data)) {
          setCatalog(null);
          setError(typeof body.error === "string" ? body.error : "Çıktı üretilemedi.");
          if (response.status === 429 && quota) {
            setQuota({ ...quota, remaining: 0 });
          }
          return;
        }
        const data = body.data;
        setCatalog({ columns: data.columns, rows: data.rows, csv: data.csv });
        setMarkdown("");
        setReport(null);
        setShop(null);
        setQuota({ remaining: data.remaining, limit: data.limit, guest: data.guest === true });
        return;
      }

      if (grant) {
        const payload: Record<string, string> = {
          businessName: (values.businessName ?? "").trim(),
          freelancerName: (values.freelancerName ?? "").trim(),
          provinceCode: (values.provinceCode ?? "").trim(),
          audience: (values.audience ?? "").trim(),
          naceGroup: (values.naceGroup ?? "").trim(),
          investmentFocus: (values.investmentFocus ?? "").trim(),
          employeeCount: (values.employeeCount ?? "").trim(),
          companyAgeYears: (values.companyAgeYears ?? "").trim(),
          rdMaturityLevel: (values.rdMaturityLevel ?? "").trim(),
          exportActive: (values.exportActive ?? "").trim(),
          patent: (values.patent ?? "").trim(),
          project: (values.project ?? "").trim(),
        };
        const scheduleWindows = (values.scheduleWindows ?? "").trim();
        if (scheduleWindows.length >= 2) {
          payload.scheduleWindows = scheduleWindows;
        }
        const investmentAmounts = (values.investmentAmounts ?? "").trim();
        if (investmentAmounts.length >= 2) {
          payload.investmentAmounts = investmentAmounts;
        }
        const response = await fetch(
          "/api/tezgah/grant/generate",
          withRailApiVersion({
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          }),
        );
        const body = (await response.json()) as { ok?: boolean; error?: string; data?: unknown };
        if (!response.ok || body.ok === false || !isGrantPayload(body.data)) {
          setGrantReport(null);
          setError(typeof body.error === "string" ? body.error : "Çıktı üretilemedi.");
          if (response.status === 429 && quota) {
            setQuota({ ...quota, remaining: 0 });
          }
          return;
        }
        const data = body.data;
        setGrantReport(data);
        setMarkdown("");
        setReport(null);
        setShop(null);
        setCatalog(null);
        setQuota({ remaining: data.remaining, limit: data.limit, guest: data.guest === true });
        return;
      }

      const payload: Record<string, string> = { tool: active.id };
      for (const field of active.fields) {
        payload[field.name] = (values[field.name] ?? "").trim();
      }
      const response = await fetch(
        "/api/tezgah/generate",
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        }),
      );
      const body = (await response.json()) as {
        ok?: boolean;
        error?: string;
        data?: { markdown?: string; remaining?: number; limit?: number; guest?: boolean };
      };
      if (!response.ok || body.ok === false || !body.data?.markdown) {
        setMarkdown("");
        setError(typeof body.error === "string" ? body.error : "Çıktı üretilemedi.");
        if (typeof body.data?.remaining === "number" && typeof body.data.limit === "number") {
          setQuota({
            remaining: body.data.remaining,
            limit: body.data.limit,
            guest: body.data.guest === true,
          });
        } else if (response.status === 429 && quota) {
          setQuota({ ...quota, remaining: 0 });
        }
        return;
      }
      setMarkdown(body.data.markdown);
      setReport(null);
      setShop(null);
      setCatalog(null);
      if (typeof body.data.remaining === "number" && typeof body.data.limit === "number") {
        setQuota({
          remaining: body.data.remaining,
          limit: body.data.limit,
          guest: body.data.guest === true,
        });
      }
    } catch {
      setError("Bağlantı kurulamadı. Yeniden dene.");
    } finally {
      setPending(false);
    }
  }

  async function copyOutput() {
    if (!markdown) {
      return;
    }
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
    } catch {
      setCopied(false);
      setError("Kopyalama bu tarayıcıda açılamadı. Metni seçip kopyala.");
    }
  }

  const showGuestCard =
    error === TEZGAH_GUEST_QUOTA_MESSAGE || (quota?.guest === true && quota.remaining <= 0);
  const showMemberCard =
    !showGuestCard &&
    (error === TEZGAH_MEMBER_QUOTA_MESSAGE || (quota?.guest === false && quota.remaining === 0));

  return (
    <div className="mt-6 space-y-5" data-tezgah-workbench="">
      <div className="flex flex-col gap-3 print:hidden sm:flex-row sm:items-end sm:justify-between" data-tezgah-chrome="">
        <div role="tablist" aria-label="Üretim araçları" className="flex flex-wrap gap-2">
          {TEZGAH_TOOLS.map((item) => {
            const selected = item.id === active.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => selectTool(item.id)}
                className={
                  selected
                    ? "rounded-xl bg-[var(--safir)] px-3 py-2 text-sm font-semibold text-white"
                    : "rounded-xl bg-[var(--surface-muted)] px-3 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--safir-soft)]"
                }
              >
                {item.label}
              </button>
            );
          })}
        </div>
        <p className="text-sm font-medium text-[var(--safir-deep)] print:hidden" data-tezgah-quota="">
          {quota ? tezgahQuotaLine(quota.remaining, quota.limit) : "Bugünkü ücretsiz hakkınız yükleniyor"}
        </p>
      </div>

      {showGuestCard ? (
        <div className="print:hidden" data-tezgah-guest-convert="">
          <Card variant="featured" title={TEZGAH_GUEST_QUOTA_MESSAGE} eyebrow="Kayıt">
            <p className="text-sm leading-6 text-[var(--muted)]">
              Misafir hakkı bugün doldu. Ücretsiz hesap günde 3 üretime açılır ve her gece yenilenir.
            </p>
            <div className="mt-4 space-y-4">
              <GoogleContinueButton nextPath={tezgahToolAnchorPath(active.id)} />
              <LinkButton href={REGISTER_HREF} variant="success">
                Ücretsiz kayıt ol
              </LinkButton>
            </div>
          </Card>
        </div>
      ) : showMemberCard ? (
        <div className="print:hidden" data-tezgah-member-convert="">
          <Card variant="featured" title={TEZGAH_MEMBER_QUOTA_MESSAGE} eyebrow="Üyelik">
            <p className="text-sm leading-6 text-[var(--muted)]">
              Düğme uzmanlık paketinin ödeme çapasına gider. Satın alma bugünkü üretim sayacını yükseltmez.
            </p>
            <div className="mt-4">
              <LinkButton href={academyCheckoutHref("01_office_ai") as Route} variant="success">
                Stüdyo Kotası Yükselt
              </LinkButton>
            </div>
          </Card>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] print:block">
        <div className="print:hidden">
          <Card title={active.label} eyebrow="Girdi">
            <p className="mb-4 text-sm leading-6 text-[var(--muted)]">{active.blurb}</p>
            <form className="space-y-4" onSubmit={onSubmit}>
              {active.fields.map((field) => (
                <label key={field.name} className="block text-sm font-medium text-[var(--foreground)]">
                  {field.label}
                  <FieldControl
                    field={field}
                    value={values[field.name] ?? ""}
                    onChange={(next) => setValues((current) => ({ ...current, [field.name]: next }))}
                  />
                </label>
              ))}
              {error ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
              <Button type="submit" disabled={!fieldsReady || pending || blocked}>
                {pending
                  ? "Üretiliyor"
                  : grant
                    ? "Dosyayı Üret"
                    : tetkik
                      ? "Tetkiki Üret"
                      : dukkan
                        ? "Dükkanı Üret"
                        : reklam
                          ? "Reklamı Üret"
                          : pazaryeri
                            ? "Kataloğu Üret"
                            : "Çıktıyı Üret"}
              </Button>
            </form>
          </Card>
        </div>

        {grant ? (
          grantReport ? (
            <div className="lg:col-span-2">
              <GrantProjectReportView report={grantReport} />
            </div>
          ) : (
            <div className="print:hidden">
              <Card title="Proje dosyası" eyebrow="Hibe">
                <p className="text-sm leading-6 text-[var(--muted)]">
                  İl, NACE ve yatırım odağını seç. Uygun programları kod eşleştirir. Açık ve doğrulanmış çağrı
                  yoksa liste boş kalır. Dosya yazdırılır.
                </p>
                {active.cta ? (
                  <div className="mt-5 border-t border-[var(--border)] pt-4">
                    <LinkButton href={active.cta.href} variant="success" size="sm">
                      {active.cta.label}
                    </LinkButton>
                  </div>
                ) : null}
              </Card>
            </div>
          )
        ) : tetkik ? (
          report ? (
            <div className="lg:col-span-2">
              <TetkikReportView report={report} />
            </div>
          ) : (
            <div className="print:hidden">
              <Card title="Rapor" eyebrow="Tetkik">
                <p className="text-sm leading-6 text-[var(--muted)]">
                  Adresi yazıp tetkiki üret. Skor kodda hesaplanır; rapor yazdırılır. Sonradan çizilen vitrin bu
                  puana girmez.
                </p>
              </Card>
            </div>
          )
        ) : dukkan ? (
          shop ? (
            <div className="lg:col-span-2">
              <DukkanPreview html={shop.html} score={shop.score} />
            </div>
          ) : (
            <div className="print:hidden">
              <Card title="Vitrin" eyebrow="Dükkan">
                <p className="text-sm leading-6 text-[var(--muted)]">
                  Sektörü, hizmetleri ve tonu yaz. Sayfa şablondan basılır; önizleme iframe içinde durur ve html
                  olarak iner.
                </p>
              </Card>
            </div>
          )
        ) : pazaryeri ? (
          catalog ? (
            <div className="lg:col-span-2">
              <PazaryeriPreview
                columns={catalog.columns}
                rows={catalog.rows}
                csv={catalog.csv}
                signedIn={signedIn}
                market={values.market ?? ""}
              />
            </div>
          ) : (
            <div className="print:hidden">
              <Card title="Katalog" eyebrow="Pazaryeri">
                <p className="text-sm leading-6 text-[var(--muted)]">
                  Ürünleri boş satırla ayır. Her blokta ilk satır ad, ardından Kategori ve özellik satırları durur.
                  Çıktı tablo olarak önizlenir ve pazaryeri-katalog.csv olarak iner.
                </p>
              </Card>
            </div>
          )
        ) : (
          <Card title="Çıktı" eyebrow="Teslim" variant={markdown ? "featured" : "default"}>
            {markdown ? (
              <>
                <Deliverable markdown={markdown} />
                <div className="mt-5 flex flex-wrap gap-2 print:hidden">
                  <Button type="button" variant="secondary" onClick={() => void copyOutput()}>
                    {copied ? "Kopyalandı" : "Tek Tıkla Kopyala"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => downloadText(`${active.fileStem}.md`, markdown, "text/markdown")}
                  >
                    .md İndir
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => downloadText(`${active.fileStem}.txt`, markdown, "text/plain")}
                  >
                    .txt İndir
                  </Button>
                </div>
                {active.cta ? (
                  <div className="mt-5 border-t border-[var(--border)] pt-4 print:hidden">
                    <LinkButton href={active.cta.href} variant="success" size="sm">
                      {active.cta.label}
                    </LinkButton>
                  </div>
                ) : null}
              </>
            ) : (
              <p className="text-sm leading-6 text-[var(--muted)]">
                Formu doldurup çıktıyı üret. Metin burada kart olarak durur; kopyalayıp müşterine
                verebilirsin.
              </p>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
