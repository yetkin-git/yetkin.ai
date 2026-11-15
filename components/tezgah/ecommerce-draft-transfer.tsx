"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { commerceMutate } from "@/components/commerce/api";
import { cockpitHref } from "@/components/commerce/href";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ecommerceCardToDraftProduct } from "@/lib/commerce/ecommerce-bridge";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

type StoreOption = {
  id: string;
  name: string;
};

export function EcommerceDraftTransfer({
  title,
  category,
  description,
}: {
  title: string;
  category: string;
  description: string;
}) {
  const draft = ecommerceCardToDraftProduct({ title, category, description });
  const busy = useRef(false);
  const [stores, setStores] = useState<StoreOption[] | null>(null);
  const [storeId, setStoreId] = useState("");
  const [storeName, setStoreName] = useState("");
  const [loadingStores, setLoadingStores] = useState(true);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [editPath, setEditPath] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadStores() {
      setLoadingStores(true);
      setError("");
      try {
        const response = await fetch("/api/commerce/stores", withRailApiVersion());
        const parsed = parseRailClientJson<{ stores?: StoreOption[] }>(await response.json());
        if (cancelled) {
          return;
        }
        if (!parsed.ok || !Array.isArray(parsed.data.stores)) {
          setError(parsed.ok ? "Mağazalar alınamadı." : parsed.error);
          setStores([]);
          return;
        }
        setStores(parsed.data.stores);
        setStoreId(parsed.data.stores[0]?.id ?? "");
      } catch {
        if (!cancelled) {
          setError("Mağazalar alınamadı.");
          setStores([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingStores(false);
        }
      }
    }
    void loadStores();
    return () => {
      cancelled = true;
    };
  }, []);

  async function createStore(): Promise<string | null> {
    const name = storeName.trim();
    if (name.length < 1) {
      setError("Mağaza adı gerekli.");
      return null;
    }
    const result = await commerceMutate<{ store?: StoreOption }>("/api/commerce/stores", "POST", { name }, true);
    if (!result.ok || typeof result.data.store?.id !== "string") {
      setError(result.ok ? "Mağaza açılamadı." : result.error);
      return null;
    }
    const store = result.data.store;
    setStores((current) => [store, ...(current ?? [])]);
    setStoreId(store.id);
    setStoreName("");
    return store.id;
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
    setEditPath("");
    try {
      const named = storeName.trim();
      const target = named ? await createStore() : storeId;
      if (!target) {
        if (!named) {
          setError("Mağaza seç veya yeni mağaza adı yaz.");
        }
        return;
      }
      const result = await commerceMutate<{ product?: { id?: string } }>(
        `/api/commerce/stores/${target}/products`,
        "POST",
        draft.body,
        true,
      );
      if (!result.ok || typeof result.data.product?.id !== "string") {
        setError(result.ok ? "Aktarma tamamlanamadı." : result.error);
        return;
      }
      setEditPath(`/magazam/${target}/urunler/${result.data.product.id}`);
      setMessage(
        draft.trimmed
          ? "Ürün kartı mağazana taslak olarak yazıldı. Açıklama 4000 karakterde kesildi."
          : "Ürün kartı mağazana taslak olarak yazıldı.",
      );
    } catch {
      setError("Aktarma tamamlanamadı.");
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  return (
    <div className="mt-4 border-t border-[var(--border)] pt-4 print:hidden" data-ecommerce-draft-transfer="">
      {stores == null ? (
        <p className="text-sm text-[var(--muted)]">Mağazalar yükleniyor.</p>
      ) : stores.length > 0 ? (
        <div className="grid gap-3">
          <div>
            <Label htmlFor="ecommerce-draft-store">Mağaza</Label>
            <select
              id="ecommerce-draft-store"
              className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-base text-[var(--foreground)]"
              value={storeId}
              onChange={(event) => {
                const next = event.target.value;
                setStoreId(next);
                if (next) {
                  setStoreName("");
                }
              }}
            >
              <option value="">Yeni mağaza</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="ecommerce-draft-store-quick">Hızlı mağaza</Label>
            <Input
              id="ecommerce-draft-store-quick"
              value={storeName}
              maxLength={80}
              placeholder="Yeni mağaza adı"
              disabled={storeId.length > 0}
              onChange={(event) => {
                const next = event.target.value;
                setStoreName(next);
                if (next.trim()) {
                  setStoreId("");
                }
              }}
            />
            {storeName.trim() ? (
              <p className="mt-1 text-sm text-[var(--muted)]" role="status">
                Yeni mağaza açılacak
              </p>
            ) : null}
          </div>
        </div>
      ) : (
        <div>
          <Label htmlFor="ecommerce-draft-store-name">Yeni mağaza</Label>
          <Input
            id="ecommerce-draft-store-name"
            value={storeName}
            maxLength={80}
            placeholder="Mağaza adı"
            onChange={(event) => setStoreName(event.target.value)}
          />
          {storeName.trim() ? (
            <p className="mt-1 text-sm text-[var(--muted)]" role="status">
              Yeni mağaza açılacak
            </p>
          ) : null}
        </div>
      )}
      <Button
        type="button"
        className="mt-3"
        variant="primary"
        onClick={() => void transfer()}
        disabled={pending || loadingStores || stores == null || !draft.ok}
      >
        {pending ? "Aktarılıyor" : "Mağazama Taslak Olarak Aktar"}
      </Button>
      {message ? <p className="mt-3 text-sm text-[var(--foreground)]">{message}</p> : null}
      {editPath ? (
        <Link href={cockpitHref(editPath)} className="mt-2 inline-block text-sm font-semibold text-[var(--safir-deep)] hover:underline">
          Taslağı düzenle
        </Link>
      ) : null}
      {!draft.ok ? <p className="mt-3 text-sm text-[var(--rose)]">{draft.error}</p> : null}
      {error ? <p className="mt-3 text-sm text-[var(--rose)]">{error}</p> : null}
    </div>
  );
}
