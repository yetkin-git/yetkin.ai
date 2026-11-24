"use client";

import { useEffect, useMemo, useState } from "react";
import { commerceMutate, commerceRead } from "@/components/commerce/api";
import { ShippingLabelSheet, type ShippingLabelItem } from "@/components/commerce/shipping-label-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DeskItem = { sku: string; title: string; variant: string; quantity: number };

type DeskOrder = {
  id: string;
  channel: string;
  channelLabel: string;
  externalOrderNo: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  cargoCompany: string;
  cargoTrackingCode: string;
  items: DeskItem[];
  totalLabel: string;
  status: "NEW" | "PREPARED" | "SHIPPED" | "DELIVERED" | "CANCELED";
  statusLabel: string;
};

type DeskLabel = {
  storeName: string;
  logoUrl: string | null;
  senderTitle: string;
  senderPhone: string;
  senderAddress: string;
};

type DeskPayload = {
  orders: DeskOrder[];
  pickList: DeskItem[];
  label: DeskLabel;
};

const COLUMNS = [
  { id: "NEW", label: "Sipariş geldi" },
  { id: "PREPARED", label: "Hazırlandı" },
  { id: "SHIPPED", label: "Kargoya verildi" },
] as const;

function toLabel(order: DeskOrder, sender: DeskLabel, trackingCode: string): ShippingLabelItem {
  return {
    logoUrl: sender.logoUrl,
    senderTitle: sender.senderTitle || sender.storeName,
    senderPhone: sender.senderPhone,
    senderAddress: sender.senderAddress,
    channelLabel: order.channelLabel,
    cargoCompany: order.cargoCompany,
    trackingCode: trackingCode || order.cargoTrackingCode || order.externalOrderNo,
    orderNo: order.externalOrderNo,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    shippingAddress: order.shippingAddress,
    items: order.items,
  };
}

export function FulfillmentDesk({ storeId }: { storeId: string | null }) {
  const [desk, setDesk] = useState<DeskPayload | null>(null);
  const [filter, setFilter] = useState<(typeof COLUMNS)[number]["id"] | "ALL">("ALL");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [tracking, setTracking] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [printLabels, setPrintLabels] = useState<ShippingLabelItem[] | null>(null);
  const [layout, setLayout] = useState<"thermal" | "a4">("thermal");
  const [pickOpen, setPickOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sender, setSender] = useState({ logoUrl: "", senderTitle: "", senderPhone: "", senderAddress: "" });

  async function load() {
    if (!storeId) {
      return;
    }
    const query = filter === "ALL" ? "" : `?status=${filter}`;
    const result = await commerceRead<DeskPayload>(`/api/commerce/stores/${storeId}/orders${query}`);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setDesk(result.data);
    setSender({
      logoUrl: result.data.label.logoUrl ?? "",
      senderTitle: result.data.label.senderTitle,
      senderPhone: result.data.label.senderPhone,
      senderAddress: result.data.label.senderAddress,
    });
  }

  useEffect(() => {
    void load();
    // Mağaza veya süzgeç değişince liste yenilenir.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, filter]);

  const visible = useMemo(() => desk?.orders ?? [], [desk]);
  const selectedIds = Object.entries(selected)
    .filter(([, on]) => on)
    .map(([id]) => id);

  async function run(task: () => Promise<{ ok: true; data: Record<string, unknown> } | { ok: false; error: string }>) {
    setPending(true);
    setError("");
    setMessage("");
    const result = await task();
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return null;
    }
    await load();
    return result.data;
  }

  async function markPrepared(orderId: string) {
    if (!storeId) {
      return;
    }
    const data = await run(() =>
      commerceMutate(`/api/commerce/stores/${storeId}/orders/${orderId}/status`, "PATCH", { status: "PREPARED" }, true),
    );
    if (data) {
      setMessage("Sipariş hazırlandı.");
    }
  }

  async function ship(order: DeskOrder) {
    if (!storeId) {
      return;
    }
    const code = (tracking[order.id] ?? order.cargoTrackingCode).trim();
    const data = await run(() =>
      commerceMutate(
        `/api/commerce/stores/${storeId}/orders/${order.id}/status`,
        "PATCH",
        { status: "SHIPPED", cargoTrackingCode: code, cargoCompany: order.cargoCompany },
        true,
      ),
    );
    if (data) {
      const notice = data.cargoNotice as { message?: string } | undefined;
      setMessage(notice?.message ?? "Sipariş kargoya verildi.");
    }
  }

  function printOne(order: DeskOrder) {
    if (!desk) {
      return;
    }
    setPrintLabels([toLabel(order, desk.label, tracking[order.id] ?? "")]);
  }

  async function printSelected() {
    if (!storeId || selectedIds.length === 0) {
      return;
    }
    const data = await run(() =>
      commerceMutate<{ orders: DeskOrder[]; label: DeskLabel }>(
        `/api/commerce/stores/${storeId}/orders/bulk-label`,
        "POST",
        { orderIds: selectedIds },
        true,
      ),
    );
    if (!data) {
      return;
    }
    const payload = data as { orders?: DeskOrder[]; label?: DeskLabel };
    const rows = payload.orders ?? [];
    const label = payload.label ?? desk?.label;
    if (!label) {
      return;
    }
    setPrintLabels(rows.map((order) => toLabel(order, label, tracking[order.id] ?? "")));
    setMessage("Seçilen siparişler hazırlandı. Etiketler basıma hazır.");
  }

  async function saveSender() {
    if (!storeId) {
      return;
    }
    const data = await run(() =>
      commerceMutate(
        `/api/commerce/stores/${storeId}/label-settings`,
        "PATCH",
        {
          logoUrl: sender.logoUrl,
          senderTitle: sender.senderTitle,
          senderPhone: sender.senderPhone,
          senderAddress: sender.senderAddress,
        },
        true,
      ),
    );
    if (data) {
      setSettingsOpen(false);
      setMessage("Gönderici bilgisi kaydedildi.");
    }
  }

  if (!storeId) {
    return <p className="mt-4 text-sm text-[var(--muted)]">Önce bir mağaza seç.</p>;
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant={filter === "ALL" ? "primary" : "outline"} onClick={() => setFilter("ALL")}>
          Tümü
        </Button>
        {COLUMNS.map((column) => (
          <Button
            key={column.id}
            type="button"
            size="sm"
            variant={filter === column.id ? "primary" : "outline"}
            onClick={() => setFilter(column.id)}
          >
            {column.label}
          </Button>
        ))}
        <Button type="button" size="sm" variant="outline" disabled={pending || selectedIds.length === 0} onClick={() => void printSelected()}>
          Seçilenlere toplu etiket bas
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => setPickOpen(true)}>
          Depo toplama listesi
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setSettingsOpen(true)}>
          Logo ve gönderici
        </Button>
        <label className="ml-auto flex items-center gap-2 text-xs">
          Baskı
          <select
            className="rounded border border-[var(--border)] bg-[var(--surface)] px-2 py-1"
            value={layout}
            onChange={(event) => setLayout(event.target.value === "a4" ? "a4" : "thermal")}
          >
            <option value="thermal">100×100 mm termal</option>
            <option value="a4">A4 çoklu</option>
          </select>
        </label>
      </div>
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? (
        <p className="text-sm text-[var(--rose)]" role="alert">
          {error}
        </p>
      ) : null}
      {visible.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">Bu süzgeçte sipariş yok.</p>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-3">
          {COLUMNS.map((column) => (
            <li key={column.id} className="rounded-2xl border border-[var(--border)] p-3">
              <h3 className="text-sm font-semibold">{column.label}</h3>
              <ul className="mt-2 space-y-3">
                {visible
                  .filter((order) => (filter === "ALL" ? order.status === column.id : true))
                  .filter((order) => filter === "ALL" || order.status === column.id)
                  .map((order) => (
                    <li key={order.id} className="rounded-xl bg-[var(--surface-muted)] p-3 text-sm">
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={selected[order.id] === true}
                          onChange={(event) => setSelected((current) => ({ ...current, [order.id]: event.target.checked }))}
                        />
                        Seç
                      </label>
                      <p className="mt-1 font-semibold">
                        {order.channelLabel} · {order.externalOrderNo}
                      </p>
                      <p className="text-xs text-[var(--muted)]">
                        {order.customerName} · {order.totalLabel}
                      </p>
                      <p className="mt-1 text-xs">{order.items.map((item) => `${item.sku} ×${item.quantity}`).join(", ")}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button type="button" size="sm" variant="outline" onClick={() => printOne(order)}>
                          Barkodlu etiket yazdır
                        </Button>
                        {order.status === "NEW" ? (
                          <Button type="button" size="sm" disabled={pending} onClick={() => void markPrepared(order.id)}>
                            Hazırlandı işaretle
                          </Button>
                        ) : null}
                      </div>
                      {order.status === "PREPARED" ? (
                        <div className="mt-2 grid gap-2">
                          <Input
                            aria-label={`${order.externalOrderNo} kargo takip kodu`}
                            value={tracking[order.id] ?? order.cargoTrackingCode}
                            placeholder="Kargo takip kodu"
                            onChange={(event) => setTracking((current) => ({ ...current, [order.id]: event.target.value }))}
                          />
                          <Button type="button" size="sm" disabled={pending} onClick={() => void ship(order)}>
                            Kargoya ver
                          </Button>
                        </div>
                      ) : null}
                    </li>
                  ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
      {printLabels && printLabels.length > 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-white p-4 text-black">
          <div className="mb-3 flex gap-2 print:hidden">
            <Button type="button" size="sm" onClick={() => window.print()}>
              Yazdır
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setPrintLabels(null)}>
              Kapat
            </Button>
          </div>
          <ShippingLabelSheet labels={printLabels} layout={layout} />
        </div>
      ) : null}
      {pickOpen ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="max-h-[80vh] w-full max-w-lg overflow-auto rounded-2xl bg-[var(--surface)] p-4 shadow-xl">
            <h3 className="text-base font-semibold">Depo toplama listesi</h3>
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr>
                  <th className="py-1 text-left">SKU</th>
                  <th className="py-1 text-left">Ürün / beden</th>
                  <th className="py-1 text-right">Adet</th>
                </tr>
              </thead>
              <tbody>
                {(desk?.pickList ?? []).map((line) => (
                  <tr key={`${line.sku}-${line.variant}`}>
                    <td className="py-1 font-mono">{line.sku}</td>
                    <td className="py-1">
                      {line.title}
                      {line.variant ? ` / ${line.variant}` : ""}
                    </td>
                    <td className="py-1 text-right">{line.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button type="button" className="mt-3" size="sm" variant="outline" onClick={() => setPickOpen(false)}>
              Kapat
            </Button>
          </div>
        </div>
      ) : null}
      {settingsOpen ? (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/40">
          <form
            className="h-full w-full max-w-md overflow-auto bg-[var(--surface)] p-5 shadow-xl"
            onSubmit={(event) => {
              event.preventDefault();
              void saveSender();
            }}
          >
            <h3 className="text-base font-semibold">Logo ve gönderici</h3>
            <Label className="mt-4" htmlFor="sender-title">
              Gönderici unvanı
            </Label>
            <Input id="sender-title" value={sender.senderTitle} onChange={(event) => setSender((current) => ({ ...current, senderTitle: event.target.value }))} />
            <Label className="mt-3" htmlFor="sender-phone">
              Telefon
            </Label>
            <Input id="sender-phone" value={sender.senderPhone} onChange={(event) => setSender((current) => ({ ...current, senderPhone: event.target.value }))} />
            <Label className="mt-3" htmlFor="sender-address">
              Adres
            </Label>
            <Input id="sender-address" value={sender.senderAddress} onChange={(event) => setSender((current) => ({ ...current, senderAddress: event.target.value }))} />
            <Label className="mt-3" htmlFor="sender-logo">
              Logo (https)
            </Label>
            <Input id="sender-logo" value={sender.logoUrl} onChange={(event) => setSender((current) => ({ ...current, logoUrl: event.target.value }))} />
            <div className="mt-4 flex gap-2">
              <Button type="submit" size="sm" disabled={pending}>
                Kaydet
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setSettingsOpen(false)}>
                Kapat
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
