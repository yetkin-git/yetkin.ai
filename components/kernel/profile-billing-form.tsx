"use client";

import { useState, type FormEvent } from "react";
import { CheckoutBillingFields } from "@/components/legal/checkout-billing-fields";
import { useCheckoutBilling } from "@/components/legal/use-checkout-billing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { readCitizenEnvelope } from "@/lib/kernel/http/citizen-json";
import { PROFILE_BILLING_PATH } from "@/lib/kernel/identity/types";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

export function ProfileBillingForm() {
  const copy = SEN_VOICE.profil.billing;
  const { form, setForm, hadSaved, payload } = useCheckoutBilling();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);
    const billingPayload = payload();
    if (!billingPayload.ok) {
      setError(billingPayload.error);
      setPending(false);
      return;
    }
    const response = await fetch(
      PROFILE_BILLING_PATH,
      withRailApiVersion({
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(billingPayload.billing),
      }),
    );
    const envelope = await readCitizenEnvelope(response);
    setPending(false);
    if (!envelope.ok) {
      setError(envelope.error ?? copy.saveFail);
      return;
    }
    setMessage(copy.saved);
  }

  return (
    <Card title={copy.title} eyebrow={copy.eyebrow} bodyClassName="text-[var(--foreground)]">
      <p className="mb-4 text-sm text-[var(--muted)]">{copy.intro}</p>
      <form onSubmit={onSubmit} className="space-y-3">
        <CheckoutBillingFields value={form} onChange={setForm} hadSaved={hadSaved} />
        {error ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
        {message ? (
          <p className="text-sm text-[var(--safir)]" role="status">
            {message}
          </p>
        ) : null}
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? copy.pending : copy.save}
        </Button>
      </form>
    </Card>
  );
}
