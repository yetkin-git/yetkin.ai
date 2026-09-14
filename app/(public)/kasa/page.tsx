import type { Metadata } from "next";
import { CUZDAN_SEN } from "@/lib/copy/sen-voice/cuzdan";
import { PaytrCheckoutIframe } from "@/components/kernel/paytr-checkout-iframe";
import { tryGetPaytrIframeUrl } from "@/lib/kernel/payments/paytr/iframe-embed";
import {
  WALLET_CHECKOUT_PASSPORT_INVALID,
  WALLET_CHECKOUT_PASSPORT_QUERY,
  verifyWalletCheckoutPassport,
} from "@/lib/kernel/payments/wallet-checkout-passport";

export const metadata: Metadata = {
  title: CUZDAN_SEN.kasaTitle,
  robots: { index: false, follow: false },
};

export default async function DronKasaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const raw = query[WALLET_CHECKOUT_PASSPORT_QUERY];
  const token = Array.isArray(raw) ? raw[0] : raw;
  const payload = verifyWalletCheckoutPassport(token);
  const iframe = payload ? tryGetPaytrIframeUrl(payload.tok) : null;

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        {CUZDAN_SEN.kasaTitle}
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{CUZDAN_SEN.topUpTitle}</h1>
      {iframe ? (
        <>
          <p className="mt-2 text-sm text-[var(--muted)]">{CUZDAN_SEN.kasaLead}</p>
          <PaytrCheckoutIframe src={iframe} title={CUZDAN_SEN.topUpTitle} />
        </>
      ) : (
        <p className="mt-4 text-sm text-[var(--foreground)]">
          {WALLET_CHECKOUT_PASSPORT_INVALID}
        </p>
      )}
    </main>
  );
}
