import { notFound } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PurchaseButton } from "@/components/pazaryeri/purchase-button";
import { OfferForm } from "@/components/pazaryeri/offer-form";
import { OfferActions } from "@/components/pazaryeri/offer-actions";
import { DopingButton } from "@/components/pazaryeri/doping-button";
import { DualCashPathSteps } from "@/components/pazaryeri/dual-cash-path-steps";
import { CashPhaseBadges } from "@/components/pazaryeri/cash-phase-badges";
import { loadOffersForProduct, loadProductBySlug, loadPurchaseForUserProduct } from "@/lib/pazaryeri/load";
import { formatMinor } from "@/lib/kernel/money/format";
import { getSession } from "@/lib/kernel/auth/session";
import { categoryLabel, isProductDoped } from "@/lib/pazaryeri/category";
import { YETKINILAN_BRAND, yetkinIlanHref } from "@/lib/kernel/yetkinilan";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { PRICE_LOCK_GRACE_MINUTES } from "@/lib/kernel/pricing/price-lock";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/link-button";
import {
  pazaryeriEscrowActiveStep,
  pazaryeriOfferStatusLabel,
  pazaryeriOrderStatusLabel,
  pazaryeriSettlementActiveStep,
} from "@/lib/copy/status-labels";

export default async function PazaryeriProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await loadProductBySlug(slug);
  if (!product) {
    notFound();
  }
  const session = await getSession();
  const owned = session ? await loadPurchaseForUserProduct(session.id, product.id) : null;
  const offers = session ? ((await loadOffersForProduct(product.id)) ?? []) : [];
  const isSeller = session?.id === product.userId;
  const doped = isProductDoped(product);
  const copy = SEN_VOICE.pazaryeri;
  const isDigital = product.kind === "DIGITAL_GOOD";
  const lockMinutes = PRICE_LOCK_GRACE_MINUTES;
  const holdPercent = HOLD_BPS_DEFAULT / 100;
  const path = isDigital ? "settlement" : "escrow";
  const active = isDigital
    ? pazaryeriSettlementActiveStep(owned?.status)
    : pazaryeriEscrowActiveStep(owned?.status);

  return (
    <RoomFrame className="max-w-3xl">
      <PageHeader
        eyebrow={`${categoryLabel(product.category)} · ${YETKINILAN_BRAND}`}
        title={product.title}
        description={product.summary}
        actions={
          <LinkButton href={yetkinIlanHref()} variant="outline" size="sm">
            {copy.product.catalogCta}
          </LinkButton>
        }
      />
      <div className="flex flex-wrap items-center gap-2">
        {doped ? <Badge tone="gold">{copy.product.doped}</Badge> : null}
        {product.isOfferAllowed ? <Badge tone="emerald">{copy.product.offerOpen}</Badge> : null}
      </div>
      <Card>
        {product.tkgmBlockParcel ? (
          <p className="text-sm text-[var(--muted)]">TKGM: {product.tkgmBlockParcel}</p>
        ) : null}
        {product.insuranceQuoteHook ? (
          <p className="mt-3 text-sm text-[var(--muted)]">Sigorta kancası: {product.insuranceQuoteHook}</p>
        ) : null}
        <p className="mt-3 font-medium text-[var(--foreground)]">
          {formatMinor(product.amountMinor, product.currencyCode)}
        </p>
      </Card>
      {owned ? (
        <Card
          title={pazaryeriOrderStatusLabel(owned.status)}
          eyebrow={isDigital ? copy.paths.settlementEyebrow : copy.paths.escrowEyebrow}
        >
          <p>{isDigital ? copy.product.ownedSettlement : copy.product.ownedEscrow}</p>
          <div className="mt-3">
            <CashPhaseBadges status={owned.status} />
          </div>
          <div className="mt-4">
            <DualCashPathSteps
              path={path}
              lockMinutes={lockMinutes}
              holdPercent={holdPercent}
              active={active}
            />
          </div>
          <div className="mt-4">
            <Link href={yetkinIlanHref("/siparisler")} className="text-[var(--safir)] hover:underline">
              {copy.catalog.ordersCta}
            </Link>
          </div>
        </Card>
      ) : isSeller ? (
        <Card title={copy.product.sellerTitle}>
          <p>{copy.product.sellerBody}</p>
          <div className="mt-4">
            <DualCashPathSteps path={path} lockMinutes={lockMinutes} holdPercent={holdPercent} />
          </div>
          {doped ? null : (
            <div className="mt-3">
              <DopingButton productId={product.id} />
            </div>
          )}
          {offers.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {offers.map((offer) => (
                <li key={offer.id} className="rounded-md border border-[var(--border)] p-3 text-sm">
                  <p>
                    {formatMinor(offer.amountMinor, offer.currencyCode)} ·{" "}
                    {pazaryeriOfferStatusLabel(offer.status)}
                  </p>
                  {offer.status === "OPEN" ? (
                    <div className="mt-2">
                      <OfferActions offerId={offer.id} />
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </Card>
      ) : product.status === "LISTED" ? (
        <>
          <Card
            title={
              isDigital ? copy.product.purchaseSettlementEyebrow : copy.product.purchaseEscrowEyebrow
            }
            eyebrow={isDigital ? copy.paths.settlementEyebrow : copy.paths.escrowEyebrow}
          >
            {session ? (
              <div className="mt-3">
                <PurchaseButton productId={product.id} kind={product.kind} />
              </div>
            ) : (
              <div className="mt-3 space-y-4">
                <DualCashPathSteps path={path} lockMinutes={lockMinutes} holdPercent={holdPercent} />
                <p>
                  {copy.product.loginLead}{" "}
                  <Link href="/login" className="text-[var(--safir)] hover:underline">
                    {copy.product.loginCta}
                  </Link>
                  .
                </p>
              </div>
            )}
          </Card>
          {product.isOfferAllowed && session ? (
            <Card title={copy.product.offerTitle}>
              <p>{copy.product.offerBody}</p>
              <OfferForm productId={product.id} />
            </Card>
          ) : null}
        </>
      ) : (
        <Card>{copy.product.noSale}</Card>
      )}
    </RoomFrame>
  );
}
