"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { commerceMutate } from "@/components/commerce/api";
import { cockpitHref } from "@/components/commerce/href";
import { CommerceStatusBadge } from "@/components/commerce/status-badge";
import { formatCockpitWhen } from "@/components/commerce/when";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LinkButton } from "@/components/ui/link-button";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import type { CommerceChannelName, ListingView } from "@/lib/commerce/marketplace-types";
import type { CockpitCredential } from "@/lib/commerce/cockpit-types";

export type ChannelVariantChoice = {
  id: string;
  label: string;
  mappable: boolean;
};

export function ChannelDesk({
  storeId,
  channel,
  title,
  credential,
  listings,
  variants,
}: {
  storeId: string;
  channel: CommerceChannelName;
  title: string;
  credential: CockpitCredential | null;
  listings: ListingView[];
  variants: ChannelVariantChoice[];
}) {
  const copy = SEN_VOICE.magazam;
  const slug = channel === "HEPSIBURADA" ? "hepsiburada" : "trendyol";
  const router = useRouter();
  const [supplierId, setSupplierId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [variantId, setVariantId] = useState(variants.find((row) => row.mappable)?.id ?? "");
  const [remoteBarcode, setRemoteBarcode] = useState("");
  const [remoteProductId, setRemoteProductId] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const mappable = variants.filter((row) => row.mappable);

  async function saveCredential() {
    if (pending) {
      return;
    }
    setPending(true);
    setError("");
    const result = await commerceMutate(`/api/commerce/stores/${storeId}/credentials/${slug}`, "PUT", {
      supplierId: supplierId.trim(),
      apiKey,
      apiSecret,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSupplierId("");
    setApiKey("");
    setApiSecret("");
    router.refresh();
  }

  async function removeCredential() {
    if (pending) {
      return;
    }
    setPending(true);
    setError("");
    const result = await commerceMutate(`/api/commerce/stores/${storeId}/credentials/${slug}`, "DELETE");
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function saveListing() {
    if (pending || !variantId) {
      return;
    }
    setPending(true);
    setError("");
    const result = await commerceMutate(`/api/commerce/stores/${storeId}/listings/${slug}`, "PUT", {
      variantId,
      remoteBarcode: remoteBarcode.trim(),
      remoteProductId: remoteProductId.trim(),
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setRemoteBarcode("");
    setRemoteProductId("");
    router.refresh();
  }

  async function removeListing(targetId: string) {
    if (pending) {
      return;
    }
    setPending(true);
    setError("");
    const result = await commerceMutate(
      `/api/commerce/stores/${storeId}/listings/${slug}?variantId=${encodeURIComponent(targetId)}`,
      "DELETE",
    );
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <Card title={title}>
      <div className="grid gap-4">
        {credential ? (
          <p className="text-sm">
            {copy.hintLabel}: <span className="font-mono">{credential.supplierHint}</span>
            <span className="mt-1 block text-xs text-[var(--muted)]">{formatCockpitWhen(credential.updatedAt)}</span>
          </p>
        ) : (
          <p className="text-sm text-[var(--muted)]">{copy.noCredential}</p>
        )}
        <div>
          <Label htmlFor={`${slug}-supplier`}>{copy.supplierId}</Label>
          <Input
            id={`${slug}-supplier`}
            value={supplierId}
            autoComplete="off"
            onChange={(event) => setSupplierId(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`${slug}-key`}>{copy.apiKey}</Label>
          <Input
            id={`${slug}-key`}
            value={apiKey}
            autoComplete="off"
            onChange={(event) => setApiKey(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`${slug}-secret`}>{copy.apiSecret}</Label>
          <Input
            id={`${slug}-secret`}
            type="password"
            value={apiSecret}
            autoComplete="new-password"
            onChange={(event) => setApiSecret(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => void saveCredential()} disabled={pending}>
            {copy.saveCredential}
          </Button>
          {credential ? (
            <Button type="button" variant="danger" onClick={() => void removeCredential()} disabled={pending}>
              {copy.deleteCredential}
            </Button>
          ) : null}
        </div>
        <div className="border-t border-[var(--border)] pt-4">
          <p className="text-sm font-medium">{copy.listingTitle}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">{copy.licensePush}</p>
          <LinkButton href={cockpitHref(`/magazam/${storeId}/lisans`)} variant="ghost" size="sm" className="mt-2">
            {copy.licenseGo}
          </LinkButton>
        </div>
        {mappable.length === 0 ? <p className="text-sm text-[var(--muted)]">{copy.noMappable}</p> : null}
        <div>
          <Label htmlFor={`${slug}-variant`}>{copy.variantPick}</Label>
          <select
            id={`${slug}-variant`}
            className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-base"
            value={variantId}
            onChange={(event) => setVariantId(event.target.value)}
          >
            {mappable.map((row) => (
              <option key={row.id} value={row.id}>
                {row.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor={`${slug}-remote`}>{copy.remoteBarcode}</Label>
          <Input
            id={`${slug}-remote`}
            value={remoteBarcode}
            maxLength={40}
            onChange={(event) => setRemoteBarcode(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor={`${slug}-remote-id`}>{copy.remoteProductId}</Label>
          <Input
            id={`${slug}-remote-id`}
            value={remoteProductId}
            maxLength={64}
            onChange={(event) => setRemoteProductId(event.target.value)}
          />
          <p className="mt-1 text-xs text-[var(--muted)]">{copy.remoteProductHint}</p>
        </div>
        <Button type="button" onClick={() => void saveListing()} disabled={pending || mappable.length === 0}>
          {copy.saveListing}
        </Button>
        {listings.length === 0 ? <p className="text-sm text-[var(--muted)]">{copy.listingEmpty}</p> : null}
        <ul className="grid gap-3">
          {listings.map((listing) => (
            <li key={listing.id} className="rounded-2xl border border-[var(--border)] p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm">{listing.sku}</span>
                <CommerceStatusBadge group="sync" value={listing.syncStatus} />
              </div>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {listing.barcode} → {listing.remoteBarcode}
                {listing.remoteProductId ? ` · ${listing.remoteProductId}` : ""}
              </p>
              {listing.syncStatus === "FAILED" && listing.lastError ? (
                <p className="mt-1 text-sm text-[var(--rose)]">
                  {copy.lastError}: {listing.lastError}
                </p>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => void removeListing(listing.variantId)}
                disabled={pending}
              >
                {copy.deleteListing}
              </Button>
            </li>
          ))}
        </ul>
        {error ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
      </div>
    </Card>
  );
}
