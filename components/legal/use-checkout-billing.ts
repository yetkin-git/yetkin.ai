"use client";

import { useEffect, useState } from "react";
import { readCitizenEnvelope } from "@/lib/kernel/http/citizen-json";
import {
  billingToForm,
  EMPTY_CHECKOUT_BILLING_FORM,
  isCheckoutBillingComplete,
  normalizeBillingInput,
  parseBillingFromUnknown,
  type CheckoutBillingFormState,
  type CheckoutBillingInfo,
} from "@/lib/kernel/identity/billing-info";
import { PROFILE_BILLING_PATH } from "@/lib/kernel/identity/types";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

export function useCheckoutBilling() {
  const [form, setForm] = useState<CheckoutBillingFormState>(EMPTY_CHECKOUT_BILLING_FORM);
  const [hadSaved, setHadSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch(PROFILE_BILLING_PATH, withRailApiVersion())
      .then((response) => readCitizenEnvelope(response))
      .then((envelope) => {
        if (cancelled || !envelope.ok) {
          return;
        }
        const billing = parseBillingFromUnknown(envelope.body.billing);
        if (!billing) {
          return;
        }
        setForm(billingToForm(billing));
        setHadSaved(true);
      })
      .catch(() => {
        /* kayıtlı künye yoksa boş form */
      })
      .finally(() => {
        if (!cancelled) {
          setHydrated(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function payload(): { ok: true; billing: CheckoutBillingInfo } | { ok: false; error: string } {
    return normalizeBillingInput(form);
  }

  return {
    form,
    setForm,
    hadSaved,
    hydrated,
    complete: isCheckoutBillingComplete(form),
    payload,
  };
}
