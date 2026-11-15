"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { catalogTableToDraftImport } from "@/lib/commerce/pazaryeri-bridge";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

type StoreOption = {
  id: string;
  name: string;
  status: string;
};

function newKey(): string {
  return crypto.randomUUID();
}

async function readEnvelope(response: Response): Promise<{ ok: boolean; error: string; data: unknown }> {
  const body = (await response.json()) as { ok?: boolean; error?: string; data?: unknown };
  return {
    ok: response.ok && body.ok !== false,
    error: typeof body.error === "string" ? body.error : "Aktarma tamamlanamadı.",
    data: body.data,
  };
}

export function MasterSkuTransfer({
  market,
  columns,
  rows,
}: {
  market: string;
  columns: readonly string[];
  rows: readonly (readonly string[])[];
}) {
  const draft = catalogTableToDraftImport({ market, columns, rows });
  const busy = useRef(false);
  const [open, setOpen] = useState(false);
  const [stores, setStores] = useState<StoreOption[] | null>(null);
  const [storeId, setStoreId] = useState("");
  const [storeName, setStoreName] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadStores() {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/commerce/stores", withRailApiVersion());
      const body = await readEnvelope(response);
      const data = body.data as { stores?: StoreOption[] } | undefined;
      if (!body.ok || !data || !Array.isArray(data.stores)) {
        setError(body.error);
        setStores([]);
        return;
      }
      setStores(data.stores);
      setStoreId(data.stores[0]?.id ?? "");
    } catch {
      setError("Mağazalar alınamadı.");
      setStores([]);
    } finally {
      setPending(false);
    }
  }

  async function openPanel() {
    setOpen(true);
    setMessage("");
    setError("");
    if (!draft.ok) {
      setError(draft.error);
      return;
    }
    if (stores == null) {
      await loadStores();
    }
  }

  async function createStore(): Promise<string | null> {
    const name = storeName.trim();
    if (name.length < 1) {
      setError("Mağaza adı gerekli.");
      return null;
    }
    const response = await fetch(
      "/api/commerce/stores",
      withRailApiVersion({
        method: "POST",
        headers: { "content-type": "application/json", "Idempotency-Key": newKey() },
        body: JSON.stringify({ name }),
      }),
    );
    const body = await readEnvelope(response);
    const data = body.data as { store?: StoreOption } | undefined;
    if (!body.ok || !data?.store?.id) {
      setError(body.error);
      return null;
    }
    setStores((current) => [data.store as StoreOption, ...(current ?? [])]);
    setStoreId(data.store.id);
    setStoreName("");
    return data.store.id;
  }

  async function transfer() {
    if (!draft.ok) {
      setError(draft.error);
      return;
    }
    if (busy.current) {
      return;
    }
    busy.current = true;
    setPending(true);
    setError("");
    setMessage("");
    try {
      const target = storeName.trim() ? await createStore() : storeId || (await createStore());
      if (!target) {
        return;
      }
      const response = await fetch(
        `/api/commerce/stores/${target}/imports/pazaryeri`,
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json", "Idempotency-Key": newKey() },
          body: JSON.stringify(draft.body),
        }),
      );
      const body = await readEnvelope(response);
      const data = body.data as { products?: unknown[] } | undefined;
      if (!body.ok || !data?.products) {
        setError(body.error);
        return;
      }
      setMessage(`${data.products.length} kart Master SKU havuzuna taslak olarak yazıldı.`);
    } catch {
      setError("Aktarma tamamlanamadı.");
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  return (
    <div className="mt-4 border-t border-[var(--border)] pt-4 print:hidden" data-master-sku-transfer="">
      <Button type="button" variant="primary" onClick={() => void openPanel()} disabled={pending && !open}>
        Master SKU Havuzuna Aktar
      </Button>
      {open ? (
        <div className="mt-4 grid gap-3">
          {stores == null ? (
            <p className="text-sm text-[var(--muted)]">Mağazalar yükleniyor.</p>
          ) : stores.length > 0 ? (
            <div>
              <Label htmlFor="commerce-store">Mağaza</Label>
              <select
                id="commerce-store"
                className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-base text-[var(--foreground)]"
                value={storeId}
                onChange={(event) => setStoreId(event.target.value)}
              >
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <Label htmlFor="commerce-store-name">Yeni mağaza</Label>
              <Input
                id="commerce-store-name"
                value={storeName}
                maxLength={80}
                placeholder="Mağaza adı"
                onChange={(event) => setStoreName(event.target.value)}
              />
            </div>
          )}
          {stores != null && stores.length > 0 ? (
            <div>
              <Label htmlFor="commerce-store-quick">Hızlı mağaza</Label>
              <Input
                id="commerce-store-quick"
                value={storeName}
                maxLength={80}
                placeholder="Yeni mağaza adı"
                onChange={(event) => setStoreName(event.target.value)}
              />
            </div>
          ) : null}
          <Button type="button" onClick={() => void transfer()} disabled={pending || !draft.ok}>
            {pending ? "Aktarılıyor" : stores != null && stores.length === 0 ? "Mağaza aç ve aktar" : "Taslak olarak aktar"}
          </Button>
          {message ? <p className="text-sm text-[var(--foreground)]">{message}</p> : null}
          {error ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
