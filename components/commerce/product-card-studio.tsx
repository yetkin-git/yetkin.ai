"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { commerceMutate } from "@/components/commerce/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Input } from "@/components/ui/input";
import { SmartTextarea } from "@/components/ui/smart-textarea";
import { ecommerceCardToDraftProduct } from "@/lib/commerce/ecommerce-bridge";
import {
  ECOMMERCE_CATEGORY_CHIPS,
  tezgahToolById,
} from "@/lib/tezgah/catalog";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

const tool = tezgahToolById("ecommerce");

export function ProductCardStudio() {
  const router = useRouter();
  const busy = useRef(false);
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [features, setFeatures] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [pending, setPending] = useState<"generate" | "save" | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [quota, setQuota] = useState("");

  const name = productName.trim();
  const categoryValue = category.trim();
  const featureText = features.trim();
  const canGenerate =
    name.length >= 2 &&
    name.length <= 80 &&
    categoryValue.length <= 80 &&
    featureText.length >= 2 &&
    featureText.length <= 800;
  const draft = ecommerceCardToDraftProduct({
    title: productName,
    category,
    description: markdown,
  });

  async function generate() {
    if (!canGenerate || busy.current) {
      return;
    }
    busy.current = true;
    setPending("generate");
    setError("");
    setMessage("");
    setQuota("");
    try {
      const response = await fetch(
        "/api/tezgah/generate",
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            tool: "ecommerce",
            productName: name,
            category: categoryValue,
            features: featureText,
          }),
        }),
      );
      const body = (await response.json()) as {
        ok?: boolean;
        error?: string;
        data?: { markdown?: string; remaining?: number; limit?: number };
      };
      if (!response.ok || body.ok === false || !body.data?.markdown) {
        setMarkdown("");
        setError(typeof body.error === "string" ? body.error : "Ürün kartı üretilemedi.");
        return;
      }
      setMarkdown(body.data.markdown);
      if (typeof body.data.remaining === "number" && typeof body.data.limit === "number") {
        setQuota(`Kalan ücretsiz hakkınız: ${body.data.remaining} / ${body.data.limit}`);
      }
    } catch {
      setError("Bağlantı kurulamadı. Yeniden dene.");
    } finally {
      busy.current = false;
      setPending(null);
    }
  }

  async function save() {
    if (!draft.ok || busy.current) {
      setError(draft.ok ? "" : draft.error);
      return;
    }
    busy.current = true;
    setPending("save");
    setError("");
    setMessage("");
    try {
      const result = await commerceMutate<{ message?: string }>(
        "/api/commerce/os",
        "POST",
        {
          action: "pool",
          title: draft.body.title,
          category: draft.body.category,
          description: draft.body.description,
        },
        true,
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage(
        typeof result.data.message === "string"
          ? result.data.message
          : "Ürün kartı E-Ticaret havuzuna yazıldı.",
      );
      setMarkdown("");
      setProductName("");
      setCategory("");
      setFeatures("");
      router.refresh();
    } catch {
      setError("Havuza kayıt tamamlanamadı.");
    } finally {
      busy.current = false;
      setPending(null);
    }
  }

  if (!tool) {
    return null;
  }

  return (
    <section
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
      data-commerce-product-card=""
    >
      <h2 className="text-sm font-semibold">{tool.label}</h2>
      <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{tool.blurb}</p>
      <form
        className="mt-3 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          void generate();
        }}
      >
        <label className="block text-sm font-medium">
          Ürün adı
          <Input
            value={productName}
            maxLength={80}
            placeholder="Pamuklu bebek battaniyesi"
            onChange={(event) => setProductName(event.target.value)}
          />
        </label>
        <div>
          <label className="block text-sm font-medium">
            Kategori
            <Input
              value={category}
              maxLength={80}
              placeholder="Kategoriyi yazınız..."
              onChange={(event) => setCategory(event.target.value)}
            />
          </label>
          <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Hızlı kategori">
            {ECOMMERCE_CATEGORY_CHIPS.map((chip) => {
              const selected = categoryValue === chip;
              return (
                <button
                  key={chip}
                  type="button"
                  aria-pressed={selected}
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
                    selected
                      ? "border-[var(--safir)] bg-[var(--safir-soft)] text-[var(--safir-deep)]"
                      : "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground)]",
                  )}
                  onClick={() => setCategory(chip)}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        </div>
        <label className="block text-sm font-medium">
          Temel özellikler
          <div className="mt-1">
            <SmartTextarea
              context="ecommerce"
              className="min-h-24"
              value={features}
              maxLength={800}
              placeholder="Ürün özelliklerinizi buraya yazınız..."
              onChange={(event) => setFeatures(event.target.value)}
              softHint="Biraz daha detay ekleyin (ölçü, malzeme, yaş/kullanım)…"
            />
          </div>
        </label>
        {error ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
        {markdown && !draft.ok ? <p className="text-sm text-[var(--rose)]">{draft.error}</p> : null}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={!canGenerate || pending != null}>
            {pending === "generate" ? "Üretiliyor" : "Kartı üret"}
          </Button>
          <Button type="button" variant="secondary" disabled={!draft.ok || pending != null} onClick={() => void save()}>
            {pending === "save" ? "Kaydediliyor" : "Havuza kaydet"}
          </Button>
        </div>
        {quota ? <p className="text-sm text-[var(--muted)]">{quota}</p> : null}
        {message ? (
          <p className="text-sm text-[var(--foreground)]" role="status">
            {message}
          </p>
        ) : null}
      </form>
      {markdown ? (
        <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-sm leading-6">
          {markdown}
        </pre>
      ) : (
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          Başlık, açıklama, SEO ve pazaryeri uyumu bu sekmede üretilir. Havuza kaydet, kartı stok listesine yazar.
        </p>
      )}
    </section>
  );
}
