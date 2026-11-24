"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { commerceMutate } from "@/components/commerce/api";
import { cockpitHref } from "@/components/commerce/href";
import { Button } from "@/components/ui/button";
import { ecommerceCardToDraftProduct } from "@/lib/commerce/ecommerce-bridge";

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
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [editPath, setEditPath] = useState("");
  const [error, setError] = useState("");

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
      const result = await commerceMutate<{ message?: string }>("/api/commerce/os", "POST", {
        action: "pool",
        title: draft.body.title,
        category: draft.body.category,
        description: draft.body.description,
      }, true);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setEditPath("/panel/e-ticaret?sekme=havuz");
      setMessage(
        typeof result.data.message === "string"
          ? result.data.message
          : "Ürün kartı E-Ticaret havuzuna yazıldı.",
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
      <Button
        type="button"
        variant="primary"
        onClick={() => void transfer()}
        disabled={pending || !draft.ok}
      >
        {pending ? "Aktarılıyor" : "E-Ticaret Havuzuna Aktar"}
      </Button>
      {message ? <p className="mt-3 text-sm text-[var(--foreground)]">{message}</p> : null}
      {editPath ? (
        <Link
          href={cockpitHref(editPath)}
          className="mt-2 inline-block text-sm font-semibold text-[var(--safir-deep)] hover:underline"
        >
          Havuzu aç
        </Link>
      ) : null}
      {!draft.ok ? <p className="mt-3 text-sm text-[var(--rose)]">{draft.error}</p> : null}
      {error ? <p className="mt-3 text-sm text-[var(--rose)]">{error}</p> : null}
    </div>
  );
}
