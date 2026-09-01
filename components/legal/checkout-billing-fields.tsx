"use client";

import { useId } from "react";
import { CHECKOUT_BILLING_COPY, type CheckoutBillingFormState } from "@/lib/kernel/identity/billing-info";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CheckoutBillingFields({
  value,
  onChange,
  hadSaved = false,
}: {
  value: CheckoutBillingFormState;
  onChange: (next: CheckoutBillingFormState) => void;
  hadSaved?: boolean;
}) {
  const copy = CHECKOUT_BILLING_COPY;
  const typeName = useId();
  const individual = value.invoiceType === "individual";

  function patch(partial: Partial<CheckoutBillingFormState>) {
    onChange({ ...value, ...partial });
  }

  return (
    <fieldset className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/40 p-3">
      <legend className="px-1 text-sm font-semibold text-[var(--foreground)]">{copy.legend}</legend>
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label={copy.legend}>
        <label
          data-selected={individual ? "true" : "false"}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm font-semibold transition-[border-color,background] data-[selected=true]:border-[var(--safir)] data-[selected=true]:bg-[color-mix(in_srgb,var(--safir)_10%,var(--surface))]"
        >
          <input
            type="radio"
            name={typeName}
            className="accent-[var(--safir)]"
            checked={individual}
            onChange={() => patch({ invoiceType: "individual" })}
          />
          {copy.individual}
        </label>
        <label
          data-selected={!individual ? "true" : "false"}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm font-semibold transition-[border-color,background] data-[selected=true]:border-[var(--safir)] data-[selected=true]:bg-[color-mix(in_srgb,var(--safir)_10%,var(--surface))]"
        >
          <input
            type="radio"
            name={typeName}
            className="accent-[var(--safir)]"
            checked={!individual}
            onChange={() => patch({ invoiceType: "corporate" })}
          />
          {copy.corporate}
        </label>
      </div>
      {hadSaved ? <p className="text-[11px] leading-relaxed text-[var(--muted)]">{copy.savedHint}</p> : null}
      {individual ? (
        <>
          <Label>
            {copy.fullName}
            <Input
              value={value.fullName}
              onChange={(event) => patch({ fullName: event.target.value })}
              autoComplete="name"
              required
              maxLength={120}
            />
          </Label>
          <Label>
            {copy.tckn}
            <Input
              value={value.tckn}
              onChange={(event) => patch({ tckn: event.target.value.replace(/\D/g, "").slice(0, 11) })}
              inputMode="numeric"
              autoComplete="off"
              maxLength={11}
              minLength={value.tckn.length > 0 ? 11 : undefined}
            />
            <span className="mt-1 block text-[11px] font-normal text-[var(--muted)]">{copy.tcknHint}</span>
          </Label>
        </>
      ) : (
        <>
          <Label>
            {copy.companyTitle}
            <Input
              value={value.companyTitle}
              onChange={(event) => patch({ companyTitle: event.target.value })}
              autoComplete="organization"
              required
              maxLength={200}
            />
          </Label>
          <Label>
            {copy.taxOffice}
            <Input
              value={value.taxOffice}
              onChange={(event) => patch({ taxOffice: event.target.value })}
              required
              maxLength={120}
            />
          </Label>
          <Label>
            {copy.vkn}
            <Input
              value={value.vkn}
              onChange={(event) => patch({ vkn: event.target.value.replace(/\D/g, "").slice(0, 10) })}
              inputMode="numeric"
              autoComplete="off"
              required
              maxLength={10}
              minLength={10}
            />
            <span className="mt-1 block text-[11px] font-normal text-[var(--muted)]">{copy.vknHint}</span>
          </Label>
        </>
      )}
      <Label>
        {copy.phone}
        <Input
          type="tel"
          value={value.phone}
          onChange={(event) => patch({ phone: event.target.value.replace(/[^\d+\s]/g, "").slice(0, 16) })}
          autoComplete="tel"
          inputMode="tel"
          required
          maxLength={16}
        />
        <span className="mt-1 block text-[11px] font-normal text-[var(--muted)]">{copy.phoneHint}</span>
      </Label>
      <Label>
        {copy.address}
        <Textarea
          className="mt-1"
          value={value.address}
          onChange={(event) => patch({ address: event.target.value })}
          autoComplete="street-address"
          required
          rows={3}
          maxLength={500}
        />
      </Label>
    </fieldset>
  );
}
