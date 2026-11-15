import { notFound } from "next/navigation";
import { CommerceDown } from "@/components/commerce/commerce-down";
import { CommerceFrame } from "@/components/commerce/commerce-frame";
import { formatCockpitWhen } from "@/components/commerce/when";
import { LicenseCheckout } from "@/components/commerce/license-checkout";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { loadOwnerLicense, loadOwnerStore } from "@/lib/commerce/cockpit-load";
import { requirePageSession } from "@/lib/kernel/auth/session";
import { formatMinor } from "@/lib/kernel/money/format";

export default async function MagazamLicensePage({ params }: { params: Promise<{ storeId: string }> }) {
  const session = await requirePageSession();
  const { storeId } = await params;
  const store = await loadOwnerStore(session.id, storeId);
  if (store.kind === "missing") {
    notFound();
  }
  if (store.kind === "down") {
    return (
      <CommerceFrame>
        <CommerceDown />
      </CommerceFrame>
    );
  }
  const license = await loadOwnerLicense(session.id, storeId);
  if (license.kind === "missing") {
    notFound();
  }
  if (license.kind === "down") {
    return (
      <CommerceFrame storeId={store.value.id}>
        <CommerceDown />
      </CommerceFrame>
    );
  }
  const copy = SEN_VOICE.magazam;
  const phase =
    license.value.phase === "open"
      ? copy.licenseOpen
      : license.value.phase === "pending"
        ? copy.licensePending
        : license.value.phase === "closed"
          ? copy.licenseClosed
          : copy.licenseAbsent;

  return (
    <CommerceFrame storeId={store.value.id}>
      <PageHeader eyebrow={copy.eyebrow} title={copy.licenseTitle} description={copy.licenseDescription} />
      <Card title={phase}>
        <LicenseCheckout
          storeId={store.value.id}
          license={license.value}
          expiresLabel={license.value.expiresAt ? formatCockpitWhen(license.value.expiresAt) : null}
          amountLabel={
            license.value.amountMinor == null ? null : formatMinor(license.value.amountMinor, "TRY")
          }
        />
      </Card>
    </CommerceFrame>
  );
}
