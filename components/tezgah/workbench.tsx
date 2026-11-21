"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import type { Route } from "next";
import { GoogleContinueButton } from "@/components/auth/google-continue-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import {
  IconBadge,
  IconBriefcase,
  IconBuilding,
  IconCode,
  IconGrid,
  IconImage,
  IconMegaphone,
  IconPulse,
  IconSearch,
  IconStore,
} from "@/components/ui/icons";
import { Input, INPUT_SURFACE_CLASS, selectValueTypoClass } from "@/components/ui/input";
import { LinkButton } from "@/components/ui/link-button";
import { SmartTextarea } from "@/components/ui/smart-textarea";
import { TezgahUpgradeCard } from "@/components/tezgah/upgrade-card";
import {
  TezgahHistoryDrawer,
  TezgahOutputBridge,
  type TezgahHistoryItem,
} from "@/components/tezgah/output-portfolio";
import { EcommerceDraftTransfer } from "@/components/tezgah/ecommerce-draft-transfer";
import { TezgahSurfaceSkeleton } from "@/components/tezgah/surface-skeleton";
import { GrantDetailWizard } from "@/components/tezgah/grant-detail-wizard";
import { DUKKAN_FILENAME } from "@/lib/tezgah/dukkan/copy";
import type { GrantDetailsInput } from "@/lib/tezgah/grant/details-input";
import { isGrantDossierPayload } from "@/lib/tezgah/grant/payload";
import type { GrantProjectReport } from "@/lib/tezgah/grant/types";
import { PAZARYERI_FILENAME } from "@/lib/tezgah/pazaryeri/copy";
import { REKLAM_FILE_STEM } from "@/lib/tezgah/reklam/copy";
import { GRANT_PROJECT_DISCLAIMER, isGrantWithheldNote } from "@/lib/yetkinhibe/grant-project-notes";
import { buildCitizenRegisterHref } from "@/lib/kernel/auth/redirects";
import {
  ECOMMERCE_CATEGORY_CHIPS,
  TEZGAH_CATALOG_CLOSED_MESSAGE,
  TEZGAH_DESK_DEFAULT,
  TEZGAH_GUEST_QUOTA_MESSAGE,
  TEZGAH_MEMBER_PAID_MESSAGE,
  TEZGAH_MEMBER_QUOTA_MESSAGE,
  TEZGAH_TETKIK_DOMAIN_CLAIMED_MESSAGE,
  TEZGAH_TETKIK_GUEST_QUOTA_MESSAGE,
  TEZGAH_TETKIK_MEMBER_QUOTA_MESSAGE,
  TEZGAH_TOOLS,
  isProStudioTool,
  isTezgahDeskTool,
  isTezgahQuotaExemptPool,
  parseTezgahToolParam,
  readDeskTaskId,
  readTezgahPrefill,
  resolveTezgahDeskTool,
  tezgahDeskHref,
  tezgahPoolForTool,
  tezgahRelocatedOsHref,
  tezgahToolAnchorPath,
  tezgahToolById,
  tezgahToolQuotaLine,
  type TezgahField,
  type TezgahToolId,
} from "@/lib/tezgah/catalog";
import { buildProStudio, type ProStudioPack } from "@/lib/tezgah/pro/build";
import { normalizeTetkikSiteAddress } from "@/lib/tezgah/tetkik/site-address";
import type { TetkikReport } from "@/lib/tezgah/tetkik/types";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

type QuotaBody = {
  remaining: number;
  limit: number;
  guest: boolean;
  lane?: string;
  poolKey?: string;
  unlimited?: boolean;
  line?: string;
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

type TetkikHandoff = {
  kind: "dukkan" | "saas";
  businessName: string;
  pageTitle: string;
  url: string;
  detail: string;
};

const REGISTER_HREF = buildCitizenRegisterHref("/tezgah") as Route;

/**
 * Ağır önizleme ve rapor yüzeyleri tembel yüklenir.
 *
 * Sorun (tespit §5.3): 1.400+ satırlık tek `"use client"` dosyası 10 aracı ve
 * 4 ağır önizlemeyi aynı anda indiriyordu — tek sekme açan kullanıcı hepsini
 * ödüyordu. Artık her yüzey kendi chunk'ında; indirme yalnız o araç seçilip
 * çıktı üretildiğinde başlar.
 *
 * `ssr: false` bilinçlidir: bu bloklar yalnız istemci durumundan (`shop`,
 * `catalog`, `pro`, `report`) doğar; sunucuda hiçbir zaman basılmaz. Sunucu
 * ön-render'ı bu yüzden kaybedilmez, boşa chunk da inmez.
 */
const SURFACE_LOADING = <TezgahSurfaceSkeleton label="Önizleme hazırlanıyor" />;

const DukkanPreview = dynamic(
  () => import("@/components/tezgah/dukkan-preview").then((mod) => mod.DukkanPreview),
  { ssr: false, loading: () => SURFACE_LOADING },
);

const PazaryeriPreview = dynamic(
  () => import("@/components/tezgah/pazaryeri-preview").then((mod) => mod.PazaryeriPreview),
  { ssr: false, loading: () => SURFACE_LOADING },
);

const ProStudioPreview = dynamic(
  () => import("@/components/tezgah/pro-studio-preview").then((mod) => mod.ProStudioPreview),
  { ssr: false, loading: () => SURFACE_LOADING },
);

const TetkikReportView = dynamic(
  () => import("@/components/tezgah/tetkik-report").then((mod) => mod.TetkikReportView),
  { ssr: false, loading: () => <TezgahSurfaceSkeleton label="Analiz karnesi hazırlanıyor" lines={5} /> },
);

const GrantProjectReportView = dynamic(
  () => import("@/components/tezgah/grant-project-report").then((mod) => mod.GrantProjectReportView),
  { ssr: false, loading: () => <TezgahSurfaceSkeleton label="Proje dosyası hazırlanıyor" lines={5} /> },
);


function toolMark(id: TezgahToolId): { Icon: (props: { className?: string }) => ReactNode; chip: string } {
  switch (id) {
    case "ecommerce":
      return { Icon: IconStore, chip: "bg-orange-50 text-orange-600" };
    case "proposal":
      return { Icon: IconBriefcase, chip: "bg-blue-50 text-blue-700" };
    case "grant":
      return { Icon: IconBadge, chip: "bg-emerald-50 text-emerald-700" };
    case "tetkik":
      return { Icon: IconSearch, chip: "bg-slate-100 text-slate-700" };
    case "dukkan":
      return { Icon: IconBuilding, chip: "bg-amber-50 text-amber-700" };
    case "reklam":
      return { Icon: IconMegaphone, chip: "bg-rose-50 text-rose-700" };
    case "pazaryeri":
      return { Icon: IconGrid, chip: "bg-orange-50 text-orange-700" };
    case "studio-photo":
      return { Icon: IconImage, chip: "bg-pink-50 text-pink-700" };
    case "technical-drawing":
      return { Icon: IconPulse, chip: "bg-cyan-50 text-cyan-700" };
    case "saas-builder":
      return { Icon: IconCode, chip: "bg-indigo-50 text-indigo-700" };
  }
}

function fieldReady(field: TezgahField, values: Record<string, string>): boolean {
  const value = (values[field.name] ?? "").trim();
  if (field.name === "category") {
    return value.length <= 80;
  }
  if (field.name === "url") {
    return normalizeTetkikSiteAddress(value) !== null;
  }
  if (field.optional && field.name === "businessName") {
    return value.length <= 80;
  }
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
  if (field.name === "widthPx" || field.name === "heightPx") {
    return /^\d{1,5}$/.test(value) && Number(value) >= 1 && Number(value) <= 8000;
  }
  if (field.name === "widthMm" || field.name === "heightMm" || field.name === "depthMm") {
    return /^\d{1,5}$/.test(value) && Number(value) >= 1 && Number(value) <= 10000;
  }
  if (field.name === "feature") {
    return value.length >= 2 && value.length <= 300;
  }
  return value.length >= 2;
}

function tezgahCoachContext(toolId: TezgahToolId, fieldName: string): "hibe" | "ecommerce" | "tezgah" {
  if (toolId === "grant" || fieldName === "project") {
    return "hibe";
  }
  if (toolId === "ecommerce" || fieldName === "features" || fieldName === "products") {
    return "ecommerce";
  }
  return "tezgah";
}

function FieldControl({
  field,
  value,
  onChange,
  toolId,
}: {
  field: TezgahField;
  value: string;
  onChange: (value: string) => void;
  toolId: TezgahToolId;
}) {
  if (field.kind === "textarea") {
    const ideaField = field.name === "project";
    return (
      <div className="mt-1">
        <SmartTextarea
          context={tezgahCoachContext(toolId, field.name)}
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
                        : field.name === "feature"
                          ? 300
                          : undefined
          }
          softHint={
            ideaField
              ? "Daha doğru sonuç için ne yapacağınızı birkaç kelimeyle daha açın."
              : "Biraz daha detay ekleyin…"
          }
          readyHint={ideaField ? "✓ İş fikriniz analiz için hazır." : "✓ Temel detaylar yeterli"}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    );
  }
  if (field.kind === "select") {
    return (
      <select
        className={cn("mt-1", INPUT_SURFACE_CLASS, selectValueTypoClass(value))}
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
      type={field.name === "whatsapp" ? "tel" : "text"}
      inputMode={field.name === "url" ? "url" : undefined}
      value={value}
      placeholder={field.placeholder}
      maxLength={
        field.name === "url"
          ? 300
          : field.name === "businessName" || field.name === "category"
            ? 80
            : field.name === "whatsapp"
              ? 32
              : field.name === "employeeCount"
                ? 6
                : field.name === "companyAgeYears"
                  ? 3
                  : field.name === "widthPx" ||
                      field.name === "heightPx" ||
                      field.name === "widthMm" ||
                      field.name === "heightMm" ||
                      field.name === "depthMm"
                    ? 5
                    : undefined
      }
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function EcommerceCategoryChips({
  value,
  onPick,
}: {
  value: string;
  onPick: (next: string) => void;
}) {
  const current = value.trim();
  return (
    <div
      className="mt-2 flex w-full min-w-0 flex-nowrap gap-1.5 overflow-x-auto"
      data-ecommerce-category-chips=""
      role="group"
      aria-label="Hızlı kategori"
    >
      {ECOMMERCE_CATEGORY_CHIPS.map((chip) => {
        const selected = current === chip;
        return (
          <button
            key={chip}
            type="button"
            aria-pressed={selected}
            className={cn(
              "inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium",
              selected
                ? "border-[var(--safir)] bg-[var(--safir-soft)] text-[var(--safir-deep)]"
                : "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground)] hover:border-[var(--safir)]",
            )}
            onClick={() => onPick(chip)}
          >
            {chip}
          </button>
        );
      })}
    </div>
  );
}

function grantRequestBody(values: Record<string, string>, details?: GrantDetailsInput): Record<string, unknown> {
  const payload: Record<string, unknown> = {
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
  if (details) {
    payload.details = details;
  }
  return payload;
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
    "dossier" in row &&
    (row.dossier === null || isGrantDossierPayload(row.dossier)) &&
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

function readOutputId(data: unknown): string | null {
  if (!data || typeof data !== "object" || !("outputId" in data)) {
    return null;
  }
  const id = (data as { outputId?: unknown }).outputId;
  return typeof id === "string" && id.length > 0 ? id : null;
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
    () => resolveTezgahDeskTool(toolParam),
  );
  const [values, setValues] = useState<Record<string, string>>((): Record<string, string> => {
    const name = freelancerName.trim();
    const id = resolveTezgahDeskTool(toolParam);
    const seeded = readTezgahPrefill(id, searchParams);
    return { ...seeded, ...(name ? { freelancerName: name } : {}) };
  });
  const [quota, setQuota] = useState<QuotaBody | null>(null);
  const [markdown, setMarkdown] = useState("");
  const [report, setReport] = useState<TetkikReport | null>(null);
  const [grantReport, setGrantReport] = useState<GrantProjectReport | null>(null);
  const [detailError, setDetailError] = useState("");
  const [shop, setShop] = useState<{ html: string; score: number } | null>(null);
  const [catalog, setCatalog] = useState<CatalogPreview | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [outputId, setOutputId] = useState<string | null>(null);
  const [history, setHistory] = useState<TezgahHistoryItem[]>([]);
  const [handoff, setHandoff] = useState<TetkikHandoff | null>(null);
  const [pro, setPro] = useState<ProStudioPack | null>(null);
  const [quotaAnchor, setQuotaAnchor] = useState<HTMLElement | null>(null);
  const deskTaskId = readDeskTaskId(searchParams.get("desk"));

  useEffect(() => {
    if (!signedIn) {
      return;
    }
    let cancelled = false;
    void fetch("/api/tezgah/outputs", withRailApiVersion({ method: "GET" }))
      .then(async (response) => {
        const body = (await response.json()) as {
          ok?: boolean;
          data?: { outputs?: TezgahHistoryItem[] };
        };
        if (!cancelled && response.ok && body.ok !== false && Array.isArray(body.data?.outputs)) {
          setHistory(body.data.outputs);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [signedIn, outputId]);
  const tool = tezgahToolById(toolId);

  function productionHeaders(): HeadersInit {
    const headers: Record<string, string> = { "content-type": "application/json" };
    if (signedIn) {
      headers["Idempotency-Key"] = crypto.randomUUID();
    }
    return headers;
  }

  const resetDeliverable = useCallback(() => {
    setMarkdown("");
    setReport(null);
    setGrantReport(null);
    setDetailError("");
    setShop(null);
    setCatalog(null);
    setPro(null);
    setError("");
    setCopied(false);
  }, []);

  const selectTool = useCallback(
    (id: TezgahToolId, options?: { keepHandoff?: boolean }) => {
      if (!options?.keepHandoff) {
        setHandoff(null);
      }
      pendingTool.current = id;
      setToolId(id);
      resetDeliverable();
      router.replace(tezgahDeskHref(id, deskTaskId) as Route, { scroll: false });
    },
    [deskTaskId, resetDeliverable, router],
  );

  useLayoutEffect(() => {
    setQuotaAnchor(document.getElementById("tezgah-header-quota"));
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadQuota() {
      try {
        const response = await fetch(
          `/api/tezgah/quota?tool=${encodeURIComponent(toolId)}`,
          withRailApiVersion({ method: "GET" }),
        );
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
  }, [toolId]);

  useEffect(() => {
    const fromQuery = tezgahRelocatedOsHref(toolParam);
    if (fromQuery) {
      router.replace(fromQuery as Route);
      return;
    }
    if (toolParam !== null) {
      const next = parseTezgahToolParam(toolParam);
      if (pendingTool.current) {
        if (next === pendingTool.current) {
          pendingTool.current = null;
        }
        return;
      }
      const resolved = next && isTezgahDeskTool(next) ? next : TEZGAH_DESK_DEFAULT;
      if (resolved !== "dukkan" && resolved !== "saas-builder") {
        setHandoff(null);
      }
      if (resolved !== toolId) {
        setToolId(resolved);
        resetDeliverable();
      }
      return;
    }
    if (pendingTool.current) {
      return;
    }
    const hash = window.location.hash.replace(/^#/, "");
    const fromHashMoved = tezgahRelocatedOsHref(hash);
    if (fromHashMoved) {
      router.replace(fromHashMoved as Route);
      return;
    }
    const fromHash = parseTezgahToolParam(hash);
    if (fromHash && isTezgahDeskTool(fromHash)) {
      if (fromHash !== "dukkan" && fromHash !== "saas-builder") {
        setHandoff(null);
      }
      if (fromHash !== toolId) {
        setToolId(fromHash);
      }
      return;
    }
    if (toolId !== TEZGAH_DESK_DEFAULT) {
      setHandoff(null);
      setToolId(TEZGAH_DESK_DEFAULT);
      resetDeliverable();
    }
  }, [resetDeliverable, router, toolId, toolParam]);

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
  const proStudio = isProStudioTool(active.id);
  const quotaExempt = isTezgahQuotaExemptPool(tezgahPoolForTool(active.id));
  const blocked = quota != null && !quota.unlimited && quota.remaining <= 0;
  const quotaBlocked = blocked && !quotaExempt;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (pending || quotaBlocked) {
      return;
    }
    if (!fieldsReady) {
      if (grant) {
        setError("Lütfen iş fikrinizi yazın, sektör ve il seçin.");
      }
      return;
    }
    setPending(true);
    setError("");
    setDetailError("");
    setCopied(false);
    setOutputId(null);
    try {
      if (proStudio) {
        const built = buildProStudio(active.id, values);
        if (!built.ok) {
          setPro(null);
          setError(built.error);
          return;
        }
        setPro(built.pack);
        setMarkdown("");
        setReport(null);
        setGrantReport(null);
        setShop(null);
        setCatalog(null);
        if (signedIn) {
          const response = await fetch(
            "/api/tezgah/outputs",
            withRailApiVersion({
              method: "POST",
              headers: productionHeaders(),
              body: JSON.stringify({
                toolKey: active.id,
                title: built.pack.summary.slice(0, 160) || built.pack.filename,
                inputSummary: built.pack.filename,
                outputContent: (built.pack.markdown || built.pack.body || built.pack.summary).slice(0, 20_000),
              }),
            }),
          );
          const saved = (await response.json()) as { ok?: boolean; data?: { outputId?: string } };
          setOutputId(response.ok && saved.ok !== false ? readOutputId(saved.data) : null);
        }
        return;
      }
      if (tetkik) {
        const url = normalizeTetkikSiteAddress(values.url ?? "");
        if (!url) {
          setError("Site adresini https ile veya alan adı olarak yaz.");
          return;
        }
        const payload: Record<string, string> = { url };
        const response = await fetch(
          "/api/tezgah/tetkik/generate",
          withRailApiVersion({
            method: "POST",
            headers: productionHeaders(),
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
        setOutputId(readOutputId(data));
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
            headers: productionHeaders(),
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
        setOutputId(readOutputId(data));
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
            headers: productionHeaders(),
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
        setOutputId(readOutputId(data));
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
            headers: productionHeaders(),
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
        setOutputId(readOutputId(data));
        setCatalog({ columns: data.columns, rows: data.rows, csv: data.csv });
        setMarkdown("");
        setReport(null);
        setShop(null);
        setQuota({ remaining: data.remaining, limit: data.limit, guest: data.guest === true });
        return;
      }

      if (grant) {
        const response = await fetch(
          "/api/tezgah/grant/generate",
          withRailApiVersion({
            method: "POST",
            headers: productionHeaders(),
            body: JSON.stringify(grantRequestBody(values)),
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
        setOutputId(readOutputId(data));
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
      setOutputId(readOutputId(body.data));
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

  async function onDeepen(details: GrantDetailsInput) {
    if (!fieldsReady || pending) {
      return;
    }
    if (!signedIn) {
      setDetailError("Tam dosya için oturum gerekir.");
      return;
    }
    setPending(true);
    setDetailError("");
    setCopied(false);
    try {
      const response = await fetch(
        "/api/tezgah/grant/dossier",
        withRailApiVersion({
          method: "POST",
          headers: {
            "content-type": "application/json",
            "Idempotency-Key": crypto.randomUUID(),
          },
          body: JSON.stringify(grantRequestBody(values, details)),
        }),
      );
      const body = (await response.json()) as { ok?: boolean; error?: string; data?: unknown };
      if (!response.ok || body.ok === false || !isGrantPayload(body.data) || body.data.dossier === null) {
        setDetailError(typeof body.error === "string" ? body.error : "Çıktı üretilemedi.");
        if (response.status === 429 && quota) {
          setQuota({ ...quota, remaining: 0 });
        }
        return;
      }
      const data = body.data;
      setOutputId(readOutputId(data));
      setGrantReport(data);
      setQuota({ remaining: data.remaining, limit: data.limit, guest: data.guest === true });
    } catch {
      setDetailError("Bağlantı kurulamadı. Yeniden dene.");
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
    error === TEZGAH_GUEST_QUOTA_MESSAGE ||
    error === TEZGAH_TETKIK_GUEST_QUOTA_MESSAGE ||
    (error === TEZGAH_TETKIK_DOMAIN_CLAIMED_MESSAGE && quota?.guest === true) ||
    (quota?.guest === true && !quotaExempt && quota.remaining <= 0);
  const showMemberCard =
    !showGuestCard &&
    (error === TEZGAH_MEMBER_QUOTA_MESSAGE ||
      error === TEZGAH_MEMBER_PAID_MESSAGE ||
      error === TEZGAH_CATALOG_CLOSED_MESSAGE ||
      error === TEZGAH_TETKIK_MEMBER_QUOTA_MESSAGE ||
      error === TEZGAH_TETKIK_DOMAIN_CLAIMED_MESSAGE ||
      (quota?.guest === false &&
        !quotaExempt &&
        quota.remaining === 0 &&
        quota.lane !== "pro" &&
        quota.lane !== "credit"));

  const quotaBadgeText = quota
    ? (quota.line ?? tezgahToolQuotaLine(active.id, quota.remaining, quota.limit))
    : "Ücretsiz hakkınız yükleniyor";

  const quotaBadge = (
    <p className="text-sm font-medium text-[var(--safir-deep)] print:hidden" data-tezgah-quota="">
      {quotaBadgeText}
    </p>
  );

  return (
    <div className="space-y-3" data-tezgah-workbench="">
      {quotaAnchor ? createPortal(quotaBadge, quotaAnchor) : null}
      <div className="print:hidden" data-tezgah-chrome="">
        <div
          role="tablist"
          aria-label="Üretim araçları"
          className="flex flex-wrap gap-2"
        >
          {TEZGAH_TOOLS.filter((item) => isTezgahDeskTool(item.id)).map((item) => {
            const selected = item.id === active.id;
            const mark = toolMark(item.id);
            const MarkIcon = mark.Icon;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => selectTool(item.id)}
                className={
                  selected
                    ? "inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-xs font-semibold tracking-tight text-white shadow-md ring-2 ring-blue-400/60"
                    : "inline-flex items-center gap-1.5 rounded-xl bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-semibold tracking-tight text-[var(--foreground)] hover:bg-[var(--safir-soft)]"
                }
              >
                <span
                  className={cn(
                    "inline-flex h-5 w-5 items-center justify-center rounded-md",
                    selected ? "bg-white/15 text-white" : mark.chip,
                  )}
                >
                  <MarkIcon className="h-3.5 w-3.5" />
                </span>
                {item.label}
              </button>
            );
          })}
        </div>
        {quotaAnchor ? null : <div className="mt-2 flex justify-end">{quotaBadge}</div>}
      </div>
      {signedIn ? <TezgahHistoryDrawer items={history} /> : null}

      {showGuestCard ? (
        <div className="print:hidden" data-tezgah-guest-convert="">
          <Card variant="featured" title={TEZGAH_GUEST_QUOTA_MESSAGE} eyebrow="Kayıt">
            <p className="text-sm leading-6 text-[var(--muted)]">
              Bugünkü ücretsiz hakkın doldu. Sayaç İstanbul gece yarısında yenilenir. Çıktıları portföyüne
              yazmak için ücretsiz hesap aç.
            </p>
            <div className="mt-4 space-y-4">
              <GoogleContinueButton nextPath={tezgahToolAnchorPath(active.id)} />
              <LinkButton href={REGISTER_HREF} variant="success">
                Ücretsiz kayıt ol
              </LinkButton>
            </div>
          </Card>
        </div>
      ) : null}
      {showMemberCard && signedIn ? (
        <div className="print:hidden" data-tezgah-member-convert="">
          <TezgahUpgradeCard />
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Kurs satın almak bugünkü üretim sayacını yükseltmez.
          </p>
          <div className="mt-3">
            <LinkButton href="/hibe" variant="outline">
              YetkinHibe’yi aç
            </LinkButton>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] print:block">
        <div className="min-w-0 print:hidden">
          <Card title={active.label} eyebrow="Girdi" snug bodyClassName="leading-5">
            <p className="mb-2 text-sm leading-5 text-[var(--muted)]">{active.blurb}</p>
            {dukkan && handoff?.kind === "dukkan" ? (
              <p className="mb-2 text-sm leading-5 text-[var(--foreground)]" data-tetkik-handoff="">
                Web Site Analizi bulgularınız otomatik aktarıldı; şimdi hazır çözümünüzü üretebilirsiniz.
                {handoff.pageTitle ? ` Ölçülen sayfa başlığı: ${handoff.pageTitle}.` : ""}
                {handoff.url ? (
                  <>
                    {" "}
                    Adres: <span className="break-all">{handoff.url}</span>.
                  </>
                ) : null}
              </p>
            ) : null}
            {active.id === "saas-builder" && handoff?.kind === "saas" ? (
              <p className="mb-2 text-sm leading-5 text-[var(--foreground)]" data-tetkik-codepack-handoff="">
                Web Site Analizi bulgularınız otomatik aktarıldı; şimdi hazır çözümünüzü üretebilirsiniz.
                {handoff.url ? (
                  <>
                    {" "}
                    Adres: <span className="break-all">{handoff.url}</span>.
                  </>
                ) : null}
              </p>
            ) : null}
            <form className="space-y-2" onSubmit={onSubmit}>
              {active.fields.map((field) => (
                <div key={field.name} className="min-w-0">
                  <label className="block text-sm font-medium text-[var(--foreground)]">
                    {field.label}
                    <FieldControl
                      field={field}
                      toolId={active.id}
                      value={values[field.name] ?? ""}
                      onChange={(next) => setValues((current) => ({ ...current, [field.name]: next }))}
                    />
                  </label>
                  {active.id === "ecommerce" && field.name === "category" ? (
                    <EcommerceCategoryChips
                      value={values.category ?? ""}
                      onPick={(next) => setValues((current) => ({ ...current, category: next }))}
                    />
                  ) : null}
                </div>
              ))}
              {error ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
              <Button
                type="submit"
                disabled={pending || quotaBlocked || (!grant && !fieldsReady)}
                className={
                  grant || tetkik
                    ? "!bg-[var(--safir)] !text-white shadow-lg shadow-[color-mix(in_srgb,var(--safir)_28%,transparent)] hover:!bg-[var(--safir-deep)] disabled:opacity-70"
                    : undefined
                }
              >
                {pending
                  ? tetkik
                    ? "Analiz ediliyor"
                    : "Üretiliyor"
                  : grant
                    ? "Dosyayı Üret"
                    : tetkik
                      ? "Analizi Başlat"
                      : dukkan
                        ? "Dükkanı Üret"
                        : reklam
                          ? "Reklamı Üret"
                          : pazaryeri
                            ? "Kataloğu Üret"
                            : active.id === "studio-photo"
                              ? "Stüdyoyu Üret"
                              : active.id === "technical-drawing"
                                ? "Şemayı Üret"
                                : active.id === "saas-builder"
                                  ? "Bileşeni Üret"
                                  : "Çıktıyı Üret"}
              </Button>
            </form>
          </Card>
        </div>

        {grant ? (
          grantReport ? (
            <div className="space-y-5 lg:col-span-2">
              <GrantDetailWizard
                key={grantReport.preparedAt}
                programs={grantReport.eligible.map((program) => ({
                  grantId: program.grantId,
                  title: program.title,
                  sourceLabel: program.sourceLabel,
                }))}
                pending={pending}
                blocked={blocked}
                briefReady={fieldsReady}
                error={detailError}
                onSubmit={(details) => void onDeepen(details)}
              />
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
              <TetkikReportView
                report={report}
                onRebuild={() => {
                  const businessName = report.businessName.trim();
                  if (businessName.length < 2) {
                    return;
                  }
                  setHandoff({
                    kind: "dukkan",
                    businessName,
                    pageTitle: report.pageTitle.trim(),
                    url: report.url.trim(),
                    detail: "",
                  });
                  setValues((current) => ({ ...current, businessName }));
                  selectTool("dukkan", { keepHandoff: true });
                }}
                onCodePack={() => {
                  const gaps = report.checks.filter((check) => !check.passed).map((check) => check.label);
                  const title = report.businessName.trim().slice(0, 80);
                  const detail = (
                    gaps.length > 0 ? gaps.join(", ") : "Ölçülen sayfada açık madde kalmadı. Yine de bir bileşen üretilebilir."
                  ).slice(0, 300);
                  setHandoff({
                    kind: "saas",
                    businessName: title,
                    pageTitle: report.pageTitle.trim(),
                    url: report.url.trim(),
                    detail,
                  });
                  setValues((current) => ({
                    ...current,
                    title: title.length >= 2 ? title : "Site eksikleri",
                    detail,
                  }));
                  selectTool("saas-builder", { keepHandoff: true });
                }}
              />
            </div>
          ) : (
            <div className="print:hidden">
              <Card title="Yönetici karnesi" eyebrow="Web Site Analizi">
                <p className="text-sm leading-6 text-[var(--muted)]">
                  Site adresini yazıp analizi başlatın. SEO, ikna ve dönüşüm karnesi kartlarla açılır; eksikler hazır
                  çözümlerle gelir.
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
        ) : proStudio ? (
          pro ? (
            <div className="lg:col-span-2">
              <ProStudioPreview pack={pro} deskTaskId={deskTaskId} signedIn={signedIn} />
            </div>
          ) : (
            <div className="print:hidden">
              <Card title="Önizleme" eyebrow="Uzman tezgâhı">
                <p className="text-sm leading-6 text-[var(--muted)]">
                  Alanları doldurup üret. Çıktı burada önizlenir; kopyalanır, indirilir ve açık çalışma odası görevine
                  teslim edilir.
                </p>
              </Card>
            </div>
          )
        ) : (
          <Card title="Çıktı" eyebrow="Teslim" snug bodyClassName="leading-5" variant={markdown ? "featured" : "default"}>
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
                {active.id === "ecommerce" && signedIn ? (
                  <EcommerceDraftTransfer
                    title={values.productName ?? ""}
                    category={values.category ?? ""}
                    description={markdown}
                  />
                ) : null}
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
                Formu doldurup çıktıyı üret. Hazırlanan çıktı burada kart olarak görünür; doğrudan kopyalayabilir veya indirebilirsin.
              </p>
            )}
          </Card>
        )}
      </div>
      {markdown || report || grantReport || shop || catalog || pro ? (
        <TezgahOutputBridge toolId={active.id} outputId={outputId} signedIn={signedIn} />
      ) : null}
    </div>
  );
}
