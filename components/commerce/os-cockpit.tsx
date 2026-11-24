"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { commerceMutate } from "@/components/commerce/api";
import { cockpitHref } from "@/components/commerce/href";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LinkButton } from "@/components/ui/link-button";
import { cn } from "@/components/ui/cn";
import { IconMessage, IconPlug, IconShield, IconSpark, IconStore } from "@/components/ui/icons";
import { FulfillmentDesk } from "@/components/commerce/fulfillment-desk";
import { ProductCardStudio } from "@/components/commerce/product-card-studio";
import { ProfitEnginesPanel } from "@/components/commerce/profit-engines-panel";
import { CAREER_DESK_KINDS, careerDeskStatusLabel } from "@/lib/career/desk-brief";
import { formatTryMinor } from "@/lib/commerce/storefront";
import { adPackageHref, grantDossierHrefForStore } from "@/lib/commerce/os-growth";
import { OS_CHANNEL_CATALOG, pickPoolStore, type OsTab } from "@/lib/commerce/os-rules";
import type {
  EcommerceLicenseBand,
  OsChannelView,
  OsCockpitView,
  OsInboxView,
  OsProductView,
} from "@/lib/commerce/os-types";

const TABS: Array<{ id: OsTab; label: string }> = [
  { id: "havuz", label: "Ürün & Stok Havuzu" },
  { id: "kanallar", label: "Kanallar & Eşitleme" },
  { id: "siparis", label: "Sipariş & Gelen Kutusu" },
  { id: "kargo", label: "Sipariş & Kargo" },
  { id: "buyume", label: "Kâr & Büyüme" },
];

function formatWhen(iso: string | null): string {
  if (!iso) {
    return "Henüz eşitlenmedi";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "Henüz eşitlenmedi";
  }
  return date.toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" });
}

function statusLabel(status: OsChannelView["status"]): string {
  if (status === "CONNECTED") {
    return "Bağlı";
  }
  if (status === "ERROR") {
    return "Takıldı";
  }
  return "Bağlı değil";
}

function channelChrome(kind: OsChannelView["kind"]): { bar: string; badge: string } {
  switch (kind) {
    case "TRENDYOL":
      return { bar: "!border-t-4 !border-t-orange-500", badge: "bg-orange-50 text-orange-600" };
    case "HEPSIBURADA":
      return { bar: "!border-t-4 !border-t-amber-600", badge: "bg-amber-50 text-amber-700" };
    case "AMAZON":
      return { bar: "!border-t-4 !border-t-slate-800", badge: "bg-slate-100 text-amber-700" };
    case "N11":
      return { bar: "!border-t-4 !border-t-purple-600", badge: "bg-purple-50 text-purple-700" };
    case "OWN_STORE":
      return { bar: "!border-t-4 !border-t-blue-600", badge: "bg-blue-50 text-blue-700" };
  }
}

function statusBadgeClass(status: OsChannelView["status"]): string {
  if (status === "CONNECTED") {
    return "bg-emerald-50 text-emerald-700";
  }
  if (status === "ERROR") {
    return "bg-rose-50 text-rose-700";
  }
  return "bg-slate-100 text-slate-600";
}

function LicenseStatusBand({ license }: { license: EcommerceLicenseBand }) {
  const open = license.active;
  const trialing = license.trial.active;
  const trialDays = license.trial.daysLeft;
  const planPrefix = license.activePlanTitle ? `Aktif plan: ${license.activePlanTitle}. ` : "";
  const renewalSuffix = license.priceLabel ? `, ardından ${license.priceLabel}` : "";
  return (
    <section
      id="eticaret-lisans"
      aria-labelledby="eticaret-lisans-heading"
      data-license-band={open ? "open" : "closed"}
      data-license-band-trial={trialing ? "true" : "false"}
      data-license-plan={license.activePlanTitle ?? ""}
      className={cn(
        "mb-4 flex flex-col gap-4 rounded-2xl border p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between",
        open
          ? trialing
            ? "border-amber-300 bg-gradient-to-r from-amber-50 via-emerald-50 to-white"
            : "border-emerald-200 bg-emerald-50"
          : "border-blue-800/30 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white",
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={cn(
            "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            open ? (trialing ? "bg-amber-500 text-white" : "bg-emerald-600 text-white") : "bg-white/10 text-blue-100",
          )}
        >
          <IconShield className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p
            id="eticaret-lisans-heading"
            className={cn(
              "text-[11px] font-semibold uppercase tracking-[0.16em]",
              open ? (trialing ? "text-amber-800" : "text-emerald-800") : "text-blue-200",
            )}
          >
            {trialing ? "Ücretsiz Deneme" : "Lisans & Paket Durumu"}
          </p>
          <p className={cn("mt-1 text-sm leading-6", open ? "text-[var(--foreground)]" : "text-white")}>
            {trialing ? (
              <>
                <strong className="font-semibold">
                  {trialDays != null && trialDays > 0
                    ? `Ücretsiz Deneme Aktif — Kalan ${trialDays} Gün`
                    : "Ücretsiz Deneme Aktif — son gün"}
                </strong>
                {renewalSuffix ? <> ({renewalSuffix.trim()})</> : null}
              </>
            ) : license.priceLabel ? (
              <>
                {open ? (
                  <>
                    {planPrefix}Çok Kanallı E-Ticaret Lisansı aktif.{" "}
                    <strong className="font-semibold">{license.priceLabel}</strong>
                  </>
                ) : (
                  <>
                    İlk 30 gün ücretsiz, ardından{" "}
                    <strong className="font-semibold">{license.priceLabel}</strong>
                  </>
                )}{" "}
                (Trendyol ve Hepsiburada dahil)
              </>
            ) : (
              <>
                Çok Kanallı E-Ticaret Lisansı (Trendyol ve Hepsiburada dahil). Paket tutarları katalogda
                açık değil.
              </>
            )}
          </p>
          {!open && license.trialEligible ? (
            <p className="mt-1 text-xs font-medium text-blue-100">
              Bugün yalnız 1,00 TL kart doğrulama bedeli tahsil edilir. Dönem sonu iptali tek tıkla mağaza panelinde.
            </p>
          ) : null}
        </div>
      </div>
      {open ? (
        <LinkButton href={cockpitHref(license.activateHref)} size="sm" variant="outline" className="shrink-0">
          {trialing ? "Denemeyi yönet" : "Lisans ayrıntısı"}
        </LinkButton>
      ) : (
        <LinkButton
          href={cockpitHref(license.activateHref)}
          size="md"
          variant="secondary"
          className="!shrink-0 !bg-white !text-slate-950 shadow-md hover:!bg-blue-50"
          data-license-activate=""
        >
          {license.trialEligible ? "30 Gün Ücretsiz Başlat →" : "Lisansı Aktifleştir →"}
        </LinkButton>
      )}
    </section>
  );
}

function CockpitMetrics({ view }: { view: OsCockpitView }) {
  const drafts =
    view.products.filter((product) => product.pendingDraft).length +
    view.inbox.filter((item) => item.messageStatus === "DRAFT").length;
  const cards = [
    {
      label: "Toplam Ürün",
      hint: "Havuzdaki kart",
      value: view.products.length,
      icon: IconStore,
      wrap: "bg-blue-50 text-blue-700",
    },
    {
      label: "Bağlı Kanal",
      hint: "Bağlantısı açık",
      value: view.channels.filter((channel) => channel.status === "CONNECTED").length,
      icon: IconPlug,
      wrap: "bg-orange-50 text-orange-700",
    },
    {
      label: "Bekleyen Sipariş",
      hint: "Açık sipariş",
      value: view.inbox.filter((item) => item.kind === "ORDER" && item.orderStatus === "OPEN").length,
      icon: IconMessage,
      wrap: "bg-amber-50 text-amber-700",
    },
    {
      label: "AI Hazır Taslak",
      hint: "Onay bekleyen taslak",
      value: drafts,
      icon: IconSpark,
      wrap: "bg-emerald-50 text-emerald-700",
    },
  ];
  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Kokpit özeti">
      {cards.map((card) => (
        <li key={card.label} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{card.label}</p>
            <span className={cn("inline-flex h-9 w-9 items-center justify-center rounded-xl", card.wrap)}>
              <card.icon className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight text-[var(--foreground)]">{card.value}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">{card.hint}</p>
        </li>
      ))}
    </ul>
  );
}

function EmptyPoolCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed border-blue-200 bg-gradient-to-b from-blue-50/80 to-white px-6 py-10 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
        <IconSpark className="h-6 w-6" />
      </span>
      <p className="mt-4 text-base font-semibold text-[var(--foreground)]">{title}</p>
      <p className="mt-1 max-w-md text-sm leading-6 text-[var(--muted)]">{body}</p>
    </div>
  );
}

export function EcommerceOsCockpit({
  initialTab,
  view,
  license,
  prefill,
}: {
  initialTab: OsTab;
  view: OsCockpitView;
  license: EcommerceLicenseBand;
  prefill?: { title: string; category: string; targetPriceMinor: number | null };
}) {
  const router = useRouter();
  const [tab, setTab] = useState<OsTab>(initialTab);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [qty, setQty] = useState<Record<string, string>>({});
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [sellerIds, setSellerIds] = useState<Record<string, string>>({});
  const [secrets, setSecrets] = useState<Record<string, string>>({});
  const [question, setQuestion] = useState("");
  const [questionProduct, setQuestionProduct] = useState(view.products[0]?.id ?? "");
  const [questionChannel, setQuestionChannel] = useState("OWN_STORE");
  const [expertProduct, setExpertProduct] = useState(
    view.products.find((product) => product.highStock)?.id ?? view.products[0]?.id ?? "",
  );
  const [licenseBlock, setLicenseBlock] = useState<string | null>(null);

  function selectTab(next: OsTab) {
    setTab(next);
    const url = new URL(window.location.href);
    url.searchParams.set("sekme", next);
    window.history.replaceState(null, "", `${url.pathname}?${url.searchParams.toString()}`);
  }

  async function run(body: Record<string, unknown>) {
    if (pending) {
      return;
    }
    setPending(true);
    setMessage("");
    setError("");
    const result = await commerceMutate<{ message?: string }>(
      "/api/commerce/os",
      "POST",
      body,
      true,
    );
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage(typeof result.data.message === "string" ? result.data.message : "İşlem yazıldı.");
    router.refresh();
  }

  useEffect(() => {
    if (!licenseBlock) {
      return;
    }
    document.getElementById("lisans-kapisi")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [licenseBlock]);

  function connectChannel(kind: string, connect: boolean, apiKey?: string) {
    const row = view.channels.find((channel) => channel.kind === kind);
    if (connect && row?.needsKey && license.gate) {
      setLicenseBlock(row.label);
      setError("");
      setMessage("");
      return;
    }
    setLicenseBlock(null);
    void run({
      action: "channel",
      kind,
      connect,
      // P0.3 — pazaryeri kimliği tek sözleşme: Satıcı ID + API Key + API Secret.
      ...(apiKey ? { apiKey } : {}),
      ...(sellerIds[kind] ? { supplierId: sellerIds[kind] } : {}),
      ...(secrets[kind] ? { apiSecret: secrets[kind] } : {}),
    });
  }

  return (
    <div className="mt-4" data-os-cockpit="">
      <LicenseStatusBand license={license} />
      <CockpitMetrics view={view} />
      {view.stores.length > 0 ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <label htmlFor="os-store" className="text-sm font-semibold">
            Mağaza
          </label>
          <select
            id="os-store"
            data-store-switcher=""
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm"
            value={view.selectedStoreId ?? ""}
            onChange={(event) => {
              const url = new URL(window.location.href);
              url.searchParams.set("magaza", event.target.value);
              router.push(`${url.pathname}?${url.searchParams.toString()}`);
            }}
          >
            {view.stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="E-Ticaret kokpiti">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-semibold",
              tab === item.id
                ? "bg-[var(--safir)] text-white"
                : "bg-[var(--surface-muted)] text-[var(--foreground)]",
            )}
            onClick={() => selectTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {view.stores.length > 0 ? (
        <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
          {view.stores.map((store) => (
            <Link key={store.id} href={cockpitHref(`/magazam/${store.id}`)} className="hover:underline">
              {store.name}
            </Link>
          ))}
        </p>
      ) : null}
      {message ? (
        <p className="mt-3 text-sm text-[var(--foreground)]" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="mt-3 text-sm text-[var(--rose)]" role="alert">
          {error}
        </p>
      ) : null}
      {tab === "havuz" ? (
        <PoolTab
          products={view.products}
          qty={qty}
          pending={pending}
          prefill={prefill}
          onQty={(id, value) => setQty((current) => ({ ...current, [id]: value }))}
          onDraft={(productId, quantity) => void run({ action: "stock-draft", productId, quantity })}
          onApprove={(productId, draftId) => void run({ action: "stock-approve", productId, draftId })}
        />
      ) : null}
      {tab === "kanallar" ? (
        <ChannelTab
          channels={view.channels}
          keys={keys}
          sellerIds={sellerIds}
          secrets={secrets}
          pending={pending}
          canSimulate={view.products.length > 0}
          licenseBlock={licenseBlock}
          activateHref={license.activateHref}
          onKey={(kind, value) => setKeys((current) => ({ ...current, [kind]: value }))}
          onSellerId={(kind, value) => setSellerIds((current) => ({ ...current, [kind]: value }))}
          onSecret={(kind, value) => setSecrets((current) => ({ ...current, [kind]: value }))}
          onConnect={connectChannel}
          onSync={() => void run({ action: "sync" })}
          onSimulate={() =>
            void run({
              action: "simulate-sale",
              ...(view.products[0] ? { productId: view.products[0].id } : {}),
            })
          }
        />
      ) : null}
      {tab === "siparis" ? (
        <InboxTab
          view={view}
          pending={pending}
          canSimulate={view.products.length > 0}
          onSimulate={() =>
            void run({
              action: "simulate-sale",
              ...(view.products[0] ? { productId: view.products[0].id } : {}),
            })
          }
          question={question}
          questionProduct={questionProduct}
          questionChannel={questionChannel}
          onQuestion={setQuestion}
          onProduct={setQuestionProduct}
          onChannel={setQuestionChannel}
          onSave={() =>
            void run({
              action: "question",
              productId: questionProduct,
              channel: questionChannel,
              body: question,
            })
          }
          onSuggest={(entryId) => void run({ action: "reply-draft", entryId })}
          onSend={(entryId) => void run({ action: "reply-send", entryId })}
          onSimulateQuestion={() =>
            void run({
              action: "simulate-question",
              ...(view.products[0] ? { productId: view.products[0].id } : {}),
            })
          }
        />
      ) : null}
      {tab === "kargo" ? <FulfillmentDesk storeId={view.selectedStoreId} /> : null}
      {tab === "buyume" ? (
        <GrowthTab
          view={view}
          expertProduct={expertProduct}
          pending={pending}
          onExpertProduct={setExpertProduct}
          onExpert={(taskKind) => void run({ action: "expert", productId: expertProduct, taskKind })}
        />
      ) : null}
    </div>
  );
}

function PoolTab({
  products,
  qty,
  pending,
  prefill,
  onQty,
  onDraft,
  onApprove,
}: {
  products: OsProductView[];
  qty: Record<string, string>;
  pending: boolean;
  prefill?: { title: string; category: string; targetPriceMinor: number | null };
  onQty: (id: string, value: string) => void;
  onDraft: (productId: string, quantity: number) => void;
  onApprove: (productId: string, draftId: string) => void;
}) {
  return (
    <div className="mt-3 space-y-4">
      <ProductCardStudio prefill={prefill} />
      {products.length === 0 ? (
        <EmptyPoolCard
          title="Ürün havuzu boş"
          body="Henüz kayıtlı ürün kartı yok. Kartı yukarıda üretip havuza kaydet."
        />
      ) : (
    <ul className="divide-y divide-[var(--border)]">
      {products.map((product) => {
        const raw = qty[product.id] ?? "";
        const quantity = Number(raw);
        const price = product.priceMinor > 0 ? formatTryMinor(product.priceMinor) : "Fiyat yok";
        return (
          <li key={product.id} className="grid gap-2 py-3 lg:grid-cols-[minmax(0,1.4fr)_auto_auto] lg:items-center">
            <div className="min-w-0">
              <p className="truncate font-semibold">{product.title}</p>
              <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
                {product.sku || "SKU yok"} · {price}
                {product.variantCount > 1 ? ` · ${product.variantCount} varyant` : ""}
                {product.criticalStockQty > 0 ? ` · eşik ${product.criticalStockQty}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold">{product.approvedStockQty} adet</span>
              {product.critical ? (
                <span className="rounded-full bg-[var(--rose-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--rose)]">
                  Kritik stok
                </span>
              ) : null}
              {product.pendingDraft ? (
                <span className="text-xs text-[var(--muted)]">Taslak {product.pendingDraft.quantity}</span>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                aria-label={`${product.title} stok adedi`}
                className="mt-0 w-24"
                inputMode="numeric"
                value={raw}
                onChange={(event) => onQty(product.id, event.target.value)}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pending || !Number.isInteger(quantity) || quantity < 1}
                onClick={() => onDraft(product.id, quantity)}
              >
                + Stok Gir
              </Button>
              {product.pendingDraft ? (
                <Button
                  type="button"
                  size="sm"
                  disabled={pending}
                  onClick={() => onApprove(product.id, product.pendingDraft?.id ?? "")}
                >
                  Onayla ve Kanallara Yay
                </Button>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
      )}
    </div>
  );
}

/** Üretimde her zaman 403 dönen örnek düğmeler gizlenir; yalnız geliştirme/testte görünür. */
const SHOW_SIMULATION_CONTROLS = process.env.NODE_ENV !== "production";

function SimulateSaleButton({
  pending,
  disabled,
  onSimulate,
}: {
  pending: boolean;
  disabled: boolean;
  onSimulate: () => void;
}) {
  if (!SHOW_SIMULATION_CONTROLS) {
    return null;
  }
  return (
    <Button type="button" size="sm" variant="outline" disabled={pending || disabled} onClick={onSimulate}>
      Örnek Kanal Siparişi Simüle Et (Trendyol -1 Adet)
    </Button>
  );
}

function orderStatusLabel(status: "OPEN" | "CANCELLED" | "RETURNED" | null): string {
  if (status === "CANCELLED") {
    return "İptal";
  }
  if (status === "RETURNED") {
    return "İade";
  }
  if (status === "OPEN") {
    return "Açık";
  }
  return "";
}

function ChannelCredentialFields({
  kind,
  label,
  apiKey,
  sellerId,
  secret,
  onKey,
  onSellerId,
  onSecret,
}: {
  kind: string;
  label: string;
  apiKey: string;
  sellerId: string;
  secret: string;
  onKey: (value: string) => void;
  onSellerId: (value: string) => void;
  onSecret: (value: string) => void;
}) {
  return (
    <div className="mt-2 grid gap-2" data-channel-credential-fields={kind}>
      <Input
        aria-label={`${label} satıcı ID`}
        autoComplete="off"
        className="mt-0"
        placeholder={kind === "HEPSIBURADA" ? "Satıcı ID (ör. HB00001234)" : "Satıcı ID (ör. 27380001)"}
        value={sellerId}
        onChange={(event) => onSellerId(event.target.value)}
      />
      <Input
        aria-label={`${label} API anahtarı`}
        type="password"
        autoComplete="off"
        className="mt-0"
        placeholder="API Key"
        value={apiKey}
        onChange={(event) => onKey(event.target.value)}
      />
      <Input
        aria-label={`${label} API sırrı`}
        type="password"
        autoComplete="off"
        className="mt-0"
        placeholder="API Secret"
        value={secret}
        onChange={(event) => onSecret(event.target.value)}
      />
    </div>
  );
}

function ChannelTab({
  channels,
  keys,
  sellerIds,
  secrets,
  pending,
  canSimulate,
  licenseBlock,
  activateHref,
  onKey,
  onSellerId,
  onSecret,
  onConnect,
  onSync,
  onSimulate,
}: {
  channels: OsChannelView[];
  keys: Record<string, string>;
  sellerIds: Record<string, string>;
  secrets: Record<string, string>;
  pending: boolean;
  canSimulate: boolean;
  licenseBlock: string | null;
  activateHref: string;
  onKey: (kind: string, value: string) => void;
  onSellerId: (kind: string, value: string) => void;
  onSecret: (kind: string, value: string) => void;
  onConnect: (kind: string, connect: boolean, apiKey?: string) => void;
  onSync: () => void;
  onSimulate: () => void;
}) {
  return (
    <div className="mt-3">
      {licenseBlock ? (
        <div
          id="lisans-kapisi"
          role="status"
          className="mb-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
        >
          <p className="font-semibold">{licenseBlock} bağlamak için lisans gerekir.</p>
          <p className="mt-1 leading-6">
            {licenseBlock} bağlantısı aktif mağaza lisansı ister. Lisansı aktifleştir, ardından API anahtarını kaydet.
          </p>
          <LinkButton href={cockpitHref(activateHref)} size="sm" className="mt-3">
            Lisansı Aktifleştir →
          </LinkButton>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" disabled={pending} onClick={onSync}>
          Bağlı Kanallara Kuyruk Yaz
        </Button>
        <SimulateSaleButton pending={pending} disabled={!canSimulate} onSimulate={onSimulate} />
      </div>
      <p className="mt-2 text-xs text-[var(--muted)]">
        Trendyol ve Hepsiburada için satıcı ID, API anahtarı ve API sırrı birlikte gerekir. Bağlanan kanal aynı kimlikle
        sipariş çeker. İlan fiyatı ve stoğu pazaryeri eşitleme kuyruğuna alındı. Mağaza masasının kanal sayfası durur;
        sipariş kimliği bu kayıttır.
      </p>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {channels.map((channel) => {
          const chrome = channelChrome(channel.kind);
          return (
          <li
            key={channel.kind}
            className={cn(
              "rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm",
              chrome.bar,
            )}
          >
            <div className="flex items-center gap-2">
              <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-xl", chrome.badge)}>
                <IconStore className="h-4 w-4" />
              </span>
              <p className="font-semibold">{channel.label}</p>
              {channel.comingSoon ? (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">Yakında</span>
              ) : null}
            </div>
            <p className="mt-2">
              <span
                className={cn(
                  "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                  statusBadgeClass(channel.status),
                )}
              >
                {statusLabel(channel.status)}
              </span>
              {channel.hint ? (
                <span className="ml-1 text-xs text-[var(--muted)]">····{channel.hint}</span>
              ) : null}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">{formatWhen(channel.lastSyncedAt)}</p>
            {channel.lastError ? <p className="mt-1 text-xs text-[var(--rose)]">{channel.lastError}</p> : null}
            {channel.needsKey && !channel.comingSoon ? (
              channel.kind === "TRENDYOL" || channel.kind === "HEPSIBURADA" ? (
                <ChannelCredentialFields
                  kind={channel.kind}
                  label={channel.label}
                  apiKey={keys[channel.kind] ?? ""}
                  sellerId={sellerIds[channel.kind] ?? ""}
                  secret={secrets[channel.kind] ?? ""}
                  onKey={(value) => onKey(channel.kind, value)}
                  onSellerId={(value) => onSellerId(channel.kind, value)}
                  onSecret={(value) => onSecret(channel.kind, value)}
                />
              ) : (
                <Input
                  aria-label={`${channel.label} API anahtarı`}
                  type="password"
                  autoComplete="off"
                  className="mt-2"
                  placeholder="API anahtarı"
                  value={keys[channel.kind] ?? ""}
                  onChange={(event) => onKey(channel.kind, event.target.value)}
                />
              )
            ) : null}
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={
                  pending ||
                  channel.comingSoon ||
                  (channel.kind === "TRENDYOL" || channel.kind === "HEPSIBURADA"
                    ? !(sellerIds[channel.kind] ?? "").trim() ||
                      !(keys[channel.kind] ?? "").trim() ||
                      !(secrets[channel.kind] ?? "").trim()
                    : false)
                }
                onClick={() => onConnect(channel.kind, true, keys[channel.kind])}
              >
                {channel.comingSoon ? "Yakında" : channel.needsKey ? "Bağla" : "Vitrini bağla"}
              </Button>
              {channel.status === "CONNECTED" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={() => onConnect(channel.kind, false)}
                >
                  Bağlantıyı kes
                </Button>
              ) : null}
            </div>
          </li>
          );
        })}
      </ul>
    </div>
  );
}

function InboxTab({
  view,
  pending,
  canSimulate,
  question,
  questionProduct,
  questionChannel,
  onQuestion,
  onProduct,
  onChannel,
  onSave,
  onSuggest,
  onSend,
  onSimulate,
  onSimulateQuestion,
}: {
  view: OsCockpitView;
  pending: boolean;
  canSimulate: boolean;
  question: string;
  questionProduct: string;
  questionChannel: string;
  onQuestion: (value: string) => void;
  onProduct: (value: string) => void;
  onChannel: (value: string) => void;
  onSave: () => void;
  onSuggest: (entryId: string) => void;
  onSend: (entryId: string) => void;
  onSimulate: () => void;
  onSimulateQuestion: () => void;
}) {
  return (
    <div className="mt-3 grid gap-3">
      <SimulateSaleButton pending={pending} disabled={!canSimulate} onSimulate={onSimulate} />
      {SHOW_SIMULATION_CONTROLS ? (
        <Button type="button" size="sm" disabled={pending || !canSimulate} onClick={onSimulateQuestion}>
          Örnek Müşteri Sorusu Simüle Et (Trendyol)
        </Button>
      ) : null}
      <div className="grid gap-2 rounded-2xl border border-[var(--border)] p-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="os-question-product">Ürün</Label>
          <select
            id="os-question-product"
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            value={questionProduct}
            onChange={(event) => onProduct(event.target.value)}
          >
            {view.products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="os-question-channel">Kanal</Label>
          <select
            id="os-question-channel"
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            value={questionChannel}
            onChange={(event) => onChannel(event.target.value)}
          >
            {OS_CHANNEL_CATALOG.map((channel) => (
              <option key={channel.kind} value={channel.kind}>
                {channel.label}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="os-question-body">Müşteri sorusu</Label>
          <textarea
            id="os-question-body"
            className="mt-1 min-h-20 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            maxLength={2000}
            value={question}
            onChange={(event) => onQuestion(event.target.value)}
          />
          <Button
            type="button"
            size="sm"
            className="mt-2"
            disabled={pending || question.trim().length < 2 || !questionProduct}
            onClick={onSave}
          >
            Soruyu kutuya yaz
          </Button>
        </div>
      </div>
      {view.inbox.length === 0 ? (
        <EmptyPoolCard
          title="Gelen kutu boş"
          body="Sipariş veya müşteri sorusu geldiğinde burada listelenir. Ürün kartını Ürün ve Stok Havuzu sekmesinde üretebilirsin."
        />
      ) : (
        <ul className="divide-y divide-[var(--border)]">
          {view.inbox.map((item) => (
            <li key={item.id} className="py-3">
              <p className="text-sm font-semibold">
                {item.title}
                <span className="ml-2 font-normal text-[var(--muted)]">{item.channelLabel}</span>
                {orderStatusLabel(item.orderStatus) ? (
                  <span className="ml-2 font-normal text-[var(--muted)]">{orderStatusLabel(item.orderStatus)}</span>
                ) : null}
                {item.priority >= 80 ? (
                  <span className="ml-2 rounded-full bg-[var(--rose-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--rose)]">
                    Yüksek öncelik
                  </span>
                ) : null}
              </p>
              {item.productTitle ? (
                <p className="mt-1 text-xs text-[var(--muted)]">{item.productTitle}</p>
              ) : null}
              <p className="mt-1 text-sm">{item.body}</p>
              {item.deskStatus ? (
                <p className="mt-1 text-xs font-semibold text-[var(--safir-deep)]">
                  {careerDeskStatusLabel(item.deskStatus)}
                </p>
              ) : null}
              {item.deskNote ? <p className="mt-1 text-xs text-[var(--muted)]">{item.deskNote}</p> : null}
              {messageStatusLabel(item.messageStatus) ? (
                <p className="mt-1 text-xs text-[var(--muted)]">{messageStatusLabel(item.messageStatus)}</p>
              ) : null}
              {item.replyBody ? <p className="mt-2 text-sm text-[var(--foreground)]">{item.replyBody}</p> : null}
              {item.canSuggest ? (
                <Button type="button" size="sm" className="mt-2" disabled={pending} onClick={() => onSuggest(item.id)}>
                  AI Yanıt Öner
                </Button>
              ) : null}
              {item.canSend ? (
                <Button type="button" size="sm" className="mt-2 ml-2" disabled={pending} onClick={() => onSend(item.id)}>
                  Onayla ve Kanala Gönder
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function messageStatusLabel(status: OsInboxView["messageStatus"]): string {
  if (status === "DRAFT") {
    return "Taslak";
  }
  if (status === "ANSWERED") {
    return "Yanıtlandı";
  }
  if (status === "PENDING_CREDENTIALS") {
    return "Kimlik bekliyor";
  }
  return "";
}

function GrowthTab({
  view,
  expertProduct,
  pending,
  onExpertProduct,
  onExpert,
}: {
  view: OsCockpitView;
  expertProduct: string;
  pending: boolean;
  onExpertProduct: (value: string) => void;
  onExpert: (taskKind: string) => void;
}) {
  const products = view.products;
  const storeName =
    view.stores.find((store) => store.id === view.selectedStoreId)?.name ??
    pickPoolStore(view.stores)?.name ??
    "Mağaza";
  const ads = products.filter((product) => product.adEligible);
  const support = view.exportSupport;
  return (
    <div className="mt-3 grid gap-4 lg:grid-cols-3">
      <section className="rounded-2xl border border-[var(--border)] p-3">
        <h2 className="text-sm font-semibold">Otonom reklam</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Onaylı stoğu kritik eşiğin en az üç katı olan kartlar.
        </p>
        {ads.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted)]">Eşiğin üç katında kart yok.</p>
        ) : (
          <ul className="mt-2 grid gap-2">
            {ads.map((product) => (
              <li key={product.id} className="flex items-center justify-between gap-2">
                <span className="min-w-0 truncate text-sm">
                  {product.title}
                  <span className="ml-1 text-[var(--muted)]">{product.approvedStockQty}</span>
                </span>
                <Link
                  href={cockpitHref(
                    adPackageHref({
                      storeName,
                      title: product.title,
                      sku: product.sku,
                      approvedStockQty: product.approvedStockQty,
                    }),
                  )}
                  className="shrink-0 text-sm font-semibold text-[var(--safir-deep)] hover:underline"
                >
                  Otonom Reklam Paketi Oluştur
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="rounded-2xl border border-[var(--border)] p-3">
        <h2 className="text-sm font-semibold">Otonom Hibe & Destek</h2>
        <p className="mt-2 text-sm">{support.note}</p>
        {support.lines.length > 0 ? (
          <ul className="mt-2 grid gap-2">
            {support.lines.map((line) => (
              <li key={line.title} className="text-sm">
                <span className="font-semibold">{line.title}</span>
                <span className="mt-0.5 block text-xs text-[var(--muted)]">
                  {line.source} · {line.statusLabel} · {line.remainingDays} gün
                </span>
              </li>
            ))}
          </ul>
        ) : null}
        <Link
      href={cockpitHref(
        grantDossierHrefForStore({
          storeName,
          storeId: view.selectedStoreId,
          // Ş12 — odak mağaza durumundan: ihracat satırı varsa ihracat, ürün varsa yazılım.
          exportActive: support.lines.length > 0,
          hasProducts: products.length > 0,
        }),
      )}
          className="mt-2 inline-block text-sm font-semibold text-[var(--safir-deep)] hover:underline"
        >
          Proje dosyasını hazırla
        </Link>
      </section>
      <section className="rounded-2xl border border-[var(--border)] p-3">
        <h2 className="text-sm font-semibold">Uzman Tezgâhı Köprüsü</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">
          Kamu ilanı açılmaz. Paket senin Kariyer çalışma odana yazılır.
        </p>
        {products.length === 0 ? (
          <p className="mt-2 text-sm text-[var(--muted)]">Önce havuza ürün yaz.</p>
        ) : (
          <>
            <Label htmlFor="os-expert-product" className="mt-2">
              Ürün
            </Label>
            <select
              id="os-expert-product"
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
              value={expertProduct}
              onChange={(event) => onExpertProduct(event.target.value)}
            >
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.title}
                </option>
              ))}
            </select>
            <div className="mt-2 grid gap-2">
              {CAREER_DESK_KINDS.map((task) => (
                <Button
                  key={task.id}
                  type="button"
                  size="sm"
                  disabled={pending || !expertProduct}
                  onClick={() => onExpert(task.id)}
                >
                  {task.label}
                </Button>
              ))}
            </div>
          </>
        )}
      </section>
      <div className="lg:col-span-3">
        <ProfitEnginesPanel view={view} />
      </div>
    </div>
  );
}
