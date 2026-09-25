"use client";

import { useEffect, useState } from "react";
import { readCitizenEnvelope } from "@/lib/kernel/http/citizen-json";
import {
  checkoutBillingFormSeed,
  isCheckoutBillingComplete,
  normalizeBillingInput,
  parseBillingFromUnknown,
  parseBillingProfileIdentity,
  type CheckoutBillingFormState,
  type CheckoutBillingInfo,
} from "@/lib/kernel/identity/billing-info";
import { PROFILE_BILLING_PATH } from "@/lib/kernel/identity/types";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

export function useCheckoutBilling(profileSeed?: { fullName?: string | null; phone?: string | null }) {
  const seedFullName = profileSeed?.fullName ?? "";
  const seedPhone = profileSeed?.phone ?? "";
  const [form, setForm] = useState<CheckoutBillingFormState>(
    () =>
      checkoutBillingFormSeed({
        stored: null,
        profileFullName: seedFullName,
        profilePhone: seedPhone,
      }).form,
  );
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
        const profile = parseBillingProfileIdentity(envelope.body.profile);
        const next = checkoutBillingFormSeed({
          stored: parseBillingFromUnknown(envelope.body.billing),
          profileFullName: profile.fullName || seedFullName,
          profilePhone: profile.phone || seedPhone,
        });
        setForm(next.form);
        setHadSaved(next.hadSaved);
      })
      .catch(() => {
        /* kayıtlı künye yoksa profil tohumu durur */
      })
      .finally(() => {
        if (!cancelled) {
          setHydrated(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [seedFullName, seedPhone]);

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
