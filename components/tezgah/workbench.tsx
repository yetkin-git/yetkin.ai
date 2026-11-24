"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import type { Route } from "next";
import { GoogleContinueButton } from "@/components/auth/google-continue-button";
import { useIdempotencyKey } from "@/components/kernel/use-idempotency-key";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/cn";
import {
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
import { TezgahGuestCheckoutCard } from "@/components/tezgah/guest-checkout-card";
import {
  PortfolioAddButton,
  TezgahHistoryDrawer,
  TezgahOutputBridge,
  type TezgahHistoryItem,
} from "@/components/tezgah/output-portfolio";
import { TezgahSurfaceSkeleton } from "@/components/tezgah/surface-skeleton";
import { DUKKAN_FILENAME, DUKKAN_ZIP_FILENAME, type DukkanSectorId } from "@/lib/tezgah/dukkan/copy";
import type { DukkanSealResult } from "@/lib/tezgah/dukkan/render";
import { PAZARYERI_FILENAME } from "@/lib/tezgah/pazaryeri/copy";
import {
  REKLAM_FILE_STEM,
  REKLAM_GOOGLE_CSV_FILENAME,
  REKLAM_META_CSV_FILENAME,
} from "@/lib/tezgah/reklam/copy";
import { buildCitizenRegisterHref } from "@/lib/kernel/auth/redirects";
import { emitSemConversion } from "@/lib/kernel/sem/conversion";
import {
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
  tezgahToolQuotaLineForLane,
  type TezgahField,
  type TezgahToolId,
} from "@/lib/tezgah/catalog";
import { buildProStudio, type ProStudioPack } from "@/lib/tezgah/pro/build";
import { TEZGAH_OUTPUT_CONTENT_MAX } from "@/lib/tezgah/pro/archive-guard";
import { studioSceneFromMarket } from "@/lib/tezgah/pro/options";
import { guessSaasWidgetFromFeature } from "@/lib/tezgah/pro/saas-builder";
import type { StudioPhotoDelivery } from "@/components/tezgah/pro-studio-preview";
import { proposalHibeAnalysisHref, PROPOSAL_YETKINCV_HREF } from "@/lib/tezgah/proposal/bridges";
import { buildProposalDocx, buildProposalPdf } from "@/lib/tezgah/proposal/document";
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
  guide: string;
  zipBase64: string;
  seals: DukkanSealResult[];
  filename: typeof DUKKAN_FILENAME;
  zipFilename: typeof DUKKAN_ZIP_FILENAME;
};

type ReklamPayload = QuotaBody & {
  tool: "reklam";
  markdown: string;
  googleCsv: string;
  metaCsv: string;
  filename: typeof REKLAM_FILE_STEM;
  googleCsvFilename: typeof REKLAM_GOOGLE_CSV_FILENAME;
  metaCsvFilename: typeof REKLAM_META_CSV_FILENAME;
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
  kind: "dukkan" | "saas" | "reklam";
  businessName: string;
  pageTitle: string;
  url: string;
  detail: string;
  offer?: string;
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

const ReklamPreview = dynamic(
  () => import("@/components/tezgah/reklam-preview").then((mod) => mod.ReklamPreview),
  { ssr: false, loading: () => SURFACE_LOADING },
);


function toolMark(id: TezgahToolId): { Icon: (props: { className?: string }) => ReactNode; chip: string } {
  switch (id) {
    case "proposal":
      return { Icon: IconBriefcase, chip: "bg-blue-50 text-blue-700" };
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
    case "ecommerce":
    case "grant":
      // Y4: bu iki masa kendi işletim sistemine taşındı (`tezgahRelocatedOsHref`).
      // Sayfa onları yönlendirdiği için tezgâh sekmesinde hiç görünmezler; yine de
      // tip birliği dardır, bu yüzden güvenli bir varsayılan döner.
      return { Icon: IconStore, chip: "bg-slate-100 text-slate-600" };
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
  if (field.name === "packages") {
    if (!value) {
      return true;
    }
    const lines = value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    if (lines.length > 6) {
      return false;
    }
    return lines.every((line) => {
      const parts = line.split("|").map((part) => part.trim());
      return parts.length === 3 && parts.every((part) => part.length >= 1 && part.length <= 120);
    });
  }
  if (field.name === "faq") {
    if (!value) {
      return true;
    }
    const lines = value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    if (lines.length > 5) {
      return false;
    }
    return lines.every((line) => {
      const parts = line.split("|").map((part) => part.trim());
      return parts.length === 2 && parts.every((part) => part.length >= 2 && part.length <= 200);
    });
  }
  if (field.name === "hours") {
    return value.length === 0 || (value.length >= 2 && value.length <= 120);
  }
  if (field.name === "budgetTl") {
    if (!value) {
      return true;
    }
    const digits = value.replace(/[^\d]/g, "");
    return digits.length >= 1 && digits.length <= 8;
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
              ? "Daha doğru sonuç için ne yapacağını birkaç kelimeyle daha aç."
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
    typeof row.googleCsv === "string" &&
    row.googleCsv.length > 0 &&
    typeof row.metaCsv === "string" &&
    row.metaCsv.length > 0 &&
    row.filename === REKLAM_FILE_STEM &&
    row.googleCsvFilename === REKLAM_GOOGLE_CSV_FILENAME &&
    row.metaCsvFilename === REKLAM_META_CSV_FILENAME &&
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
    typeof row.guide === "string" &&
    typeof row.zipBase64 === "string" &&
    row.zipBase64.length > 0 &&
    Array.isArray(row.seals) &&
    row.seals.length > 0 &&
    row.seals.every(
      (seal) =>
        seal &&
        typeof seal === "object" &&
        typeof (seal as DukkanSealResult).id === "string" &&
        typeof (seal as DukkanSealResult).label === "string" &&
        (seal as DukkanSealResult).passed === true,
    ) &&
    row.filename === DUKKAN_FILENAME &&
    row.zipFilename === DUKKAN_ZIP_FILENAME &&
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

function downloadBytes(filename: string, bytes: Uint8Array, mime: string) {
  const copy = new Uint8Array(bytes);
  const blob = new Blob([copy.buffer], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function downloadText(filename: string, text: string, mime: string) {
  downloadBytes(filename, new TextEncoder().encode(text), mime);
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
  const productionIdempotency = useIdempotencyKey();
  /**
   * Y2 — niyet imzası. Aynı form gövdesiyle yeniden deneme **aynı** anahtarla
   * gider (ağ hatası / çift tıklama ikinci kez sayılmaz). Form değişirse bu
   * *başka bir niyettir*: anahtar döner, aksi hâlde sunucu 400 çakışma dönerdi.
   */
  const lastIntentRef = useRef<string>("");
  /** saas-builder: kullanıcı bileşeni açıkça seçtiyse feature otomatik seçiciyi kilitlemez. */
  const saasWidgetTouchedRef = useRef(false);
  const [toolId, setToolId] = useState<TezgahToolId>(
    () => resolveTezgahDeskTool(toolParam),
  );
  const [values, setValues] = useState<Record<string, string>>((): Record<string, string> => {
    const name = freelancerName.trim();
    const id = resolveTezgahDeskTool(toolParam);
    const seeded = readTezgahPrefill(id, searchParams);
    if (id === "studio-photo" && !seeded.scene) {
      const market = searchParams.get("market");
      if (market) {
        seeded.scene = studioSceneFromMarket(market);
      }
    }
    if (id === "studio-photo" && !seeded.galleryCount) {
      seeded.galleryCount = "4";
    }
    if (id === "saas-builder" && seeded.widget) {
      saasWidgetTouchedRef.current = true;
    }
    if (id === "saas-builder" && !seeded.widget && seeded.feature && seeded.feature.trim().length >= 2) {
      seeded.widget = guessSaasWidgetFromFeature(seeded.feature);
    }
    return {
      deliveryMode: "standard",
      ...seeded,
      ...(name ? { freelancerName: name } : {}),
    };
  });
  const [quota, setQuota] = useState<QuotaBody | null>(null);
  const [markdown, setMarkdown] = useState("");
  const [report, setReport] = useState<TetkikReport | null>(null);
  const [shop, setShop] = useState<{
    html: string;
    seals: DukkanSealResult[];
    zipBase64: string;
    zipFilename: string;
    businessName: string;
    sector: DukkanSectorId;
    place: string;
    services: string[];
  } | null>(null);
  const [catalog, setCatalog] = useState<CatalogPreview | null>(null);
  const [reklamFiles, setReklamFiles] = useState<{ googleCsv: string; metaCsv: string } | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [outputId, setOutputId] = useState<string | null>(null);
  const [history, setHistory] = useState<TezgahHistoryItem[]>([]);
  const [historyCursor, setHistoryCursor] = useState<string | null>(null);
  const [handoff, setHandoff] = useState<TetkikHandoff | null>(null);
  const [pro, setPro] = useState<ProStudioPack | null>(null);
  const [studio, setStudio] = useState<StudioPhotoDelivery | null>(null);
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
          data?: { outputs?: TezgahHistoryItem[]; nextCursor?: string | null };
        };
        if (!cancelled && response.ok && body.ok !== false && Array.isArray(body.data?.outputs)) {
          setHistory(body.data.outputs);
          setHistoryCursor(body.data.nextCursor ?? null);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [signedIn, outputId]);
  const tool = tezgahToolById(toolId);

  function productionHeaders(body?: unknown): HeadersInit {
    const headers: Record<string, string> = { "content-type": "application/json" };
    if (signedIn) {
      if (body !== undefined) {
        prepareIntent(body);
      }
      Object.assign(headers, productionIdempotency.headers());
    }
    return headers;
  }

  /**
   * Y2 — form gövdesine göre anahtar niyeti.
   *
   * `productionHeaders()` tek başına yetmez: kullanıcı başarısız bir denemeden
   * sonra formu **değiştirirse** aynı anahtar farklı gövdeyle gider ve sunucu
   * bunu `400` "Idempotency-Key başka bir üretimde" diye reddeder. Doğrusu:
   * gövde değiştiyse niyet değişmiştir, anahtar döner.
   */
  function prepareIntent(body: unknown) {
    const signature = JSON.stringify(body);
    if (signature === lastIntentRef.current) {
      return;
    }
    if (lastIntentRef.current !== "") {
      rotateProductionKey();
    }
    lastIntentRef.current = signature;
  }

  function rotateProductionKey() {
    if (signedIn) {
      productionIdempotency.rotate();
    }
  }

  const resetDeliverable = useCallback(() => {
    setMarkdown("");
    setReport(null);
    setShop(null);
    setCatalog(null);
    setReklamFiles(null);
    setPro(null);
    setStudio(null);
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
      if (resolved !== "dukkan" && resolved !== "saas-builder" && resolved !== "reklam") {
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
      if (fromHash !== "dukkan" && fromHash !== "saas-builder" && fromHash !== "reklam") {
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
  const tetkik = active.id === "tetkik";
  const dukkan = active.id === "dukkan";
  const reklam = active.id === "reklam";
  const pazaryeri = active.id === "pazaryeri";

  const fieldsReady = active.fields.every((field) => fieldReady(field, values));
  const proStudio = isProStudioTool(active.id);
  const studioPhoto = active.id === "studio-photo";
  const quotaExempt = isTezgahQuotaExemptPool(tezgahPoolForTool(active.id));
  const blocked = quota != null && !quota.unlimited && quota.remaining <= 0;
  const quotaBlocked = blocked && !quotaExempt;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (pending || quotaBlocked) {
      return;
    }
    if (!fieldsReady) {
      return;
    }
    setPending(true);
    setError("");
    setCopied(false);
    setOutputId(null);
    try {
      if (studioPhoto) {
        if (!signedIn) {
          setStudio(null);
          setError("Görsel stüdyo için oturum aç.");
          return;
        }
        const payload = {
          productName: (values.productName ?? "").trim(),
          features: (values.features ?? "").trim(),
          scene: (values.scene ?? "").trim(),
          galleryCount: (values.galleryCount ?? "4").trim(),
        };
        const response = await fetch(
          "/api/tezgah/studio-photo",
          withRailApiVersion({
            method: "POST",
            headers: productionHeaders(payload),
            body: JSON.stringify(payload),
          }),
        );
        const body = (await response.json()) as {
          ok?: boolean;
          error?: string;
          data?: StudioPhotoDelivery & QuotaBody & { outputId?: string };
        };
        if (!response.ok || body.ok === false || !body.data?.dataUrl || !body.data.imageBase64) {
          setStudio(null);
          setError(typeof body.error === "string" ? body.error : "Çıktı üretilemedi.");
          if (response.status === 429 && quota) {
            setQuota({ ...quota, remaining: 0 });
          }
          return;
        }
        const data = body.data;
        setStudio({
          tool: "studio-photo",          summary: data.summary,
          markdown: data.markdown,
          guideMarkdown: data.guideMarkdown,
          standardLabel: data.standardLabel,
          scene: data.scene,
          sceneLabel: data.sceneLabel,
          productName: payload.productName,
          features: payload.features,
          dataUrl: data.dataUrl,
          imageBase64: data.imageBase64,
          mimeType: data.mimeType,
          zipBase64: data.zipBase64,
          filename: data.filename,
          imageFilename: data.imageFilename,
          zipFilename: data.zipFilename,
          guideFilename: data.guideFilename,
          targetWidthPx: data.targetWidthPx,
          targetHeightPx: data.targetHeightPx,
          producedWidthPx: data.producedWidthPx,
          producedHeightPx: data.producedHeightPx,
        });
        setPro(null);
        setMarkdown("");
        setReport(null);
        setShop(null);
        setCatalog(null);
        setReklamFiles(null);
        setOutputId(readOutputId(data));
        setQuota({ remaining: data.remaining, limit: data.limit, guest: data.guest === true });
        rotateProductionKey();
        return;
      }
      if (proStudio) {
        const built = buildProStudio(active.id, values);
        if (!built.ok) {
          setPro(null);
          setError(built.error);
          return;
        }
        setPro(built.pack);
        setStudio(null);
        setMarkdown("");
        setReport(null);
        setShop(null);
        setCatalog(null);
        setReklamFiles(null);
        if (signedIn) {
          // Y3/K2: technical-drawing / saas-builder arşive özet değil asıl teslimat zarfı.
          const archiveContent =
            built.pack.tool === "technical-drawing" || built.pack.tool === "saas-builder"
              ? built.pack.body
              : built.pack.markdown || built.pack.body || built.pack.summary;
          const archiveBody = {
            toolKey: active.id,
            title: built.pack.summary.slice(0, 160) || built.pack.filename,
            inputSummary: built.pack.filename,
            // O8: sunucu zarfı şema + boyut + XSS açısından doğrular.
            outputContent: archiveContent.slice(0, TEZGAH_OUTPUT_CONTENT_MAX),
          };
          const response = await fetch(
            "/api/tezgah/outputs",
            withRailApiVersion({
              method: "POST",
              headers: productionHeaders(archiveBody),
              body: JSON.stringify(archiveBody),
            }),
          );
          const saved = (await response.json()) as { ok?: boolean; data?: { outputId?: string } };
          setOutputId(response.ok && saved.ok !== false ? readOutputId(saved.data) : null);
          if (response.ok && saved.ok !== false) {
            rotateProductionKey();
          }
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
            headers: productionHeaders(payload),
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
        setReklamFiles(null);
        setQuota({ remaining: data.remaining, limit: data.limit, guest: data.guest === true });
        rotateProductionKey();
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
          packages: (values.packages ?? "").trim(),
          hours: (values.hours ?? "").trim(),
          faq: (values.faq ?? "").trim(),
        };
        const response = await fetch(
          "/api/tezgah/dukkan/generate",
          withRailApiVersion({
            method: "POST",
            headers: productionHeaders(payload),
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
        const services = payload.services
          .split(/\r?\n/)
          .map((line) => line.trim())
          .filter((line) => line.length > 0);
        setOutputId(readOutputId(data));
        setShop({
          html: data.html,
          seals: data.seals,
          zipBase64: data.zipBase64,
          zipFilename: data.zipFilename,
          businessName: payload.businessName,
          sector: payload.sector as DukkanSectorId,
          place: payload.place,
          services,
        });
        setMarkdown("");
        setReport(null);
        setCatalog(null);
        setReklamFiles(null);
        setQuota({ remaining: data.remaining, limit: data.limit, guest: data.guest === true });
        rotateProductionKey();
        return;
      }

      if (reklam) {
        const payload = {
          businessName: (values.businessName ?? "").trim(),
          sector: (values.sector ?? "").trim(),
          place: (values.place ?? "").trim(),
          aim: (values.aim ?? "").trim(),
          offer: (values.offer ?? "").trim(),
          budgetTl: (values.budgetTl ?? "").trim(),
        };
        const response = await fetch(
          "/api/tezgah/reklam/generate",
          withRailApiVersion({
            method: "POST",
            headers: productionHeaders(payload),
            body: JSON.stringify(payload),
          }),
        );
        const body = (await response.json()) as { ok?: boolean; error?: string; data?: unknown };
        if (!response.ok || body.ok === false || !isReklamPayload(body.data)) {
          setMarkdown("");
          setReklamFiles(null);
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
        setReklamFiles({ googleCsv: data.googleCsv, metaCsv: data.metaCsv });
        setQuota({ remaining: data.remaining, limit: data.limit, guest: data.guest === true });
        rotateProductionKey();
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
            headers: productionHeaders(payload),
            body: JSON.stringify(payload),
          }),
        );
        const body = (await response.json()) as { ok?: boolean; error?: string; data?: unknown };
        if (!response.ok || body.ok === false || !isPazaryeriPayload(body.data)) {
          setCatalog(null);
          setReklamFiles(null);
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
        rotateProductionKey();
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
          headers: productionHeaders(payload),
          body: JSON.stringify(payload),
        }),
      );
      const body = (await response.json()) as {
        ok?: boolean;
        error?: string;
        data?: {
          markdown?: string;
          remaining?: number;
          limit?: number;
          guest?: boolean;
          firstOutput?: boolean;
        };
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
      setReklamFiles(null);
      if (typeof body.data.remaining === "number" && typeof body.data.limit === "number") {
        setQuota({
          remaining: body.data.remaining,
          limit: body.data.limit,
          guest: body.data.guest === true,
        });
      }
      // 4.4: aktivasyon hunisinin tek gerçek ölçüsü. Sunucu yalnız ilk kalıcı
      // çıktıda `firstOutput: true` döner; istemci karar vermez.
      if (body.data.firstOutput === true) {
        emitSemConversion("tezgahFirstOutput", {
          tool: active.id,
          guest: body.data.guest === true,
        });
      }
      rotateProductionKey();
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
        // B-02: Pro hattı artık tükenebilir (günlük 100). Tavanı dolan Pro
        // kullanıcı kredi paketi teklifini görür; kredi hattında kart basılmaz.
        quota.lane !== "credit"));

  const quotaBadgeText = quota
    ? (quota.line ??
      tezgahToolQuotaLineForLane(
        active.id,
        quota.remaining,
        quota.limit,
        quota.lane,
        quota.guest,
      ))
    : "Kredin yükleniyor";

  /**
   * 4.4 — kota duvarı olayı. Duvar **göründüğünde** bir kez basılır; her render'da
   * değil. Aynı araçta duvar açık kaldığı sürece tekrar sayılmaz, araç değişince
   * yeniden ölçülür (farklı araç = farklı dönüşüm niyeti).
   */
  const wallShown = showGuestCard || showMemberCard;
  const wallKey = `${active.id}:${showGuestCard ? "guest" : "member"}`;
  useEffect(() => {
    if (!wallShown) {
      return;
    }
    emitSemConversion("tezgahQuotaWall", {
      tool: active.id,
      wall: showGuestCard ? "guest_register" : "member_upgrade",
      lane: quota?.lane ?? "unknown",
    });
    // `wallKey` bağımlılığı: duvar aynı araçta kalırsa yeniden basılmaz.
  }, [wallShown, wallKey, active.id, showGuestCard, quota?.lane]);
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
      {signedIn ? <TezgahHistoryDrawer items={history} nextCursor={historyCursor} /> : null}

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
            {/* Faz 3 / §4.1 — misafir ödeme. Kayıt olmadan Pro'ya geçiş; hesap
                ödeme sonrası `/claim/[token]` bağlantısıyla açılır. En yüksek niyet
                anında 4 adım yerine 1 adım. */}
            <div className="mt-4 border-t border-[var(--border)] pt-4">
              <TezgahGuestCheckoutCard />
            </div>
          </Card>
        </div>
      ) : null}
      {showMemberCard && signedIn ? (
        <div className="print:hidden" data-tezgah-member-convert="">
          <TezgahUpgradeCard />
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Kurs satın almak aylık kredi havuzunu yükseltmez.
          </p>
          <div className="mt-3">
            <LinkButton href="/panel/hibe" variant="outline">
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
            {reklam && handoff?.kind === "reklam" ? (
              <p className="mb-2 text-sm leading-5 text-[var(--foreground)]" data-tetkik-ads-handoff-banner="">
                Web Site Analizi özeti reklam masasına aktarıldı; kampanya amacını seçip paketi üretebilirsiniz.
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
                      onChange={(next) => {
                        if (active.id === "saas-builder" && field.name === "widget") {
                          saasWidgetTouchedRef.current = next.trim().length > 0;
                        }
                        setValues((current) => {
                          const updated = { ...current, [field.name]: next };
                          if (
                            active.id === "saas-builder" &&
                            field.name === "feature" &&
                            !saasWidgetTouchedRef.current &&
                            next.trim().length >= 2
                          ) {
                            updated.widget = guessSaasWidgetFromFeature(next);
                          }
                          return updated;
                        });
                      }}
                    />
                  </label>
                </div>
              ))}
              {error ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
              <Button
                type="submit"
                disabled={pending || quotaBlocked || !fieldsReady}
                className={
                  tetkik
                    ? "!bg-[var(--safir)] !text-white shadow-lg shadow-[color-mix(in_srgb,var(--safir)_28%,transparent)] hover:!bg-[var(--safir-deep)] disabled:opacity-70"
                    : undefined
                }
              >
                {pending
                  ? tetkik
                    ? "Analiz ediliyor"
                    : "Üretiliyor"
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

        {tetkik ? (
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
                onAdsPack={() => {
                  const businessName = report.businessName.trim();
                  const summary = (report.analysis?.summary || report.action.body || report.narrative).trim();
                  const offer = (
                    summary ||
                    `Hedef site: ${report.url}. Skor ${report.score}/100. Kapı: ${report.action.title}.`
                  ).slice(0, 500);
                  setHandoff({
                    kind: "reklam",
                    businessName: businessName.length >= 2 ? businessName : "İşletme",
                    pageTitle: report.pageTitle.trim(),
                    url: report.url.trim(),
                    detail: "",
                    offer,
                  });
                  setValues((current) => ({
                    ...current,
                    businessName: businessName.length >= 2 ? businessName : current.businessName ?? "",
                    offer,
                  }));
                  selectTool("reklam", { keepHandoff: true });
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
              <DukkanPreview
                html={shop.html}
                seals={shop.seals}
                zipBase64={shop.zipBase64}
                zipFilename={shop.zipFilename}
                businessName={shop.businessName}
                sector={shop.sector}
                place={shop.place}
                services={shop.services}
              />
            </div>
          ) : (
            <div className="print:hidden">
              <Card title="Vitrin" eyebrow="Dükkan">
                <p className="text-sm leading-6 text-[var(--muted)]">
                  Sektörü, hizmetleri ve tonu yaz. İsteğe bağlı paket ve SSS ekle. Sayfa şablondan basılır; önizleme
                  iframe içinde durur, html ve zip olarak iner.
                </p>
              </Card>
            </div>
          )
        ) : reklam ? (
          markdown && reklamFiles ? (
            <div className="lg:col-span-2">
              <ReklamPreview
                markdown={markdown}
                googleCsv={reklamFiles.googleCsv}
                metaCsv={reklamFiles.metaCsv}
                businessName={(values.businessName ?? "").trim() || "İşletme"}
                sector={((values.sector ?? "servis") as DukkanSectorId)}
                place={(values.place ?? "").trim() || "Türkiye"}
                offer={(values.offer ?? "").trim()}
                onCopy={() => void copyOutput()}
                copied={copied}
              />
            </div>
          ) : (
            <div className="print:hidden">
              <Card title="Kampanya matrisi" eyebrow="Reklam">
                <p className="text-sm leading-6 text-[var(--muted)]">
                  İşletme, teklif ve isteğe bağlı bütçeyi yaz. Üç A/B varyantı, Google/Meta CSV, Word ve PDF kod
                  mührüyle iner. Erişim, tıklama ve satış vaadi üretilmez.
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
                  Ürünleri boş satırla ayır (en çok 25). İlk satır düz ad veya `Ad | Marka | Fiyat | Stok` olabilir.
                  Kategori zorunlu. Fiyat/stok sen yazarsan CSV dosyasına geçer; LLM uydurmaz. CSV, Word ve PDF iner.
                </p>
              </Card>
            </div>
          )
        ) : studioPhoto ? (
          studio ? (
            <div className="lg:col-span-2">
              <ProStudioPreview studio={studio} deskTaskId={deskTaskId} signedIn={signedIn} />
            </div>
          ) : (
            <div className="print:hidden">
              <Card title="Önizleme" eyebrow="Görsel stüdyo">
                <p className="text-sm leading-6 text-[var(--muted)]">
                  Hedef pazaryeri standardını seçip üret. Gerçek ürün görseli burada önizlenir; .png ve stüdyo paketi
                  (.zip) iner. Oturum ve kota gerekir.
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
                  {active.id === "proposal" ? (
                    <>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() =>
                          downloadBytes(
                            `${active.fileStem}.docx`,
                            buildProposalDocx(markdown),
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                          )
                        }
                      >
                        Word (.docx) İndir
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() =>
                          downloadBytes(`${active.fileStem}.pdf`, buildProposalPdf(markdown), "application/pdf")
                        }
                      >
                        PDF İndir
                      </Button>
                    </>
                  ) : null}
                </div>
                {active.id === "proposal" ? (
                  <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--border)] pt-4 print:hidden">
                    {signedIn && outputId ? (
                      <PortfolioAddButton
                        outputId={outputId}
                        label="YetkinCV Portföyüne Kanıt Olarak Ekle"
                      />
                    ) : (
                      <LinkButton href={PROPOSAL_YETKINCV_HREF as Route} variant="outline" size="sm">
                        YetkinCV Portföyüne Kanıt Olarak Ekle
                      </LinkButton>
                    )}
                    <LinkButton
                      href={proposalHibeAnalysisHref({
                        expertise: values.expertise ?? "",
                        jobPost: values.jobPost ?? "",
                      })}
                      variant="success"
                      size="sm"
                    >
                      Bu Proje Kapsamıyla Hibe Ara
                    </LinkButton>
                  </div>
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
      {markdown || report || shop || catalog || pro || studio ? (
        <TezgahOutputBridge toolId={active.id} outputId={outputId} signedIn={signedIn} />
      ) : null}
    </div>
  );
}
