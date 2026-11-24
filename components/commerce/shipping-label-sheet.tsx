"use client";

import { renderCode128Svg } from "@/lib/commerce/barcode-svg";

export type ShippingLabelItem = {
  logoUrl: string | null;
  senderTitle: string;
  senderPhone: string;
  senderAddress: string;
  channelLabel: string;
  cargoCompany: string;
  trackingCode: string;
  orderNo: string;
  customerName: string;
  customerPhone: string;
  shippingAddress: string;
  items: readonly { sku: string; title: string; variant: string; quantity: number }[];
};

const HTTPS_LOGO = /^https:\/\/[^\s]+$/;

function logoSrc(url: string | null): string | null {
  if (!url || !HTTPS_LOGO.test(url)) {
    return null;
  }
  return url;
}

function LabelCard({ label }: { label: ShippingLabelItem }) {
  const code = label.trackingCode.trim() || label.orderNo.trim();
  const svg = code ? renderCode128Svg(code, { module: 2, height: 64 }) : null;
  const logo = logoSrc(label.logoUrl);
  return (
    <article className="shipping-label">
      <header className="flex items-start justify-between gap-2">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="" className="h-8 max-w-[28mm] object-contain" />
        ) : (
          <p className="rounded bg-black px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            {label.senderTitle || "Mağaza"}
          </p>
        )}
        <p className="text-right text-[10px] font-semibold uppercase">
          {label.channelLabel}
          <span className="mt-0.5 block font-medium normal-case">{label.cargoCompany || "Kargo"}</span>
        </p>
      </header>
      <div className="mt-2 flex justify-center bg-white">
        {svg ? <div dangerouslySetInnerHTML={{ __html: svg }} /> : <p className="text-xs">Barkod kodu yok</p>}
      </div>
      <p className="mt-1 text-center font-mono text-sm font-semibold tracking-wider">{code || "—"}</p>
      <div className="mt-2 grid gap-1 text-[11px] leading-4">
        <p>
          <span className="font-semibold">Alıcı </span>
          {label.customerName || "Ad yok"}
          {label.customerPhone ? ` · ${label.customerPhone}` : ""}
        </p>
        <p>{label.shippingAddress || "Adres yok"}</p>
        <p>
          <span className="font-semibold">Gönderici </span>
          {label.senderTitle}
          {label.senderPhone ? ` · ${label.senderPhone}` : ""}
        </p>
        {label.senderAddress ? <p>{label.senderAddress}</p> : null}
      </div>
      <table className="mt-2 w-full border-collapse text-[10px]">
        <thead>
          <tr>
            <th className="border border-black px-1 py-0.5 text-left">SKU</th>
            <th className="border border-black px-1 py-0.5 text-left">Ürün / beden</th>
            <th className="border border-black px-1 py-0.5 text-right">Adet</th>
          </tr>
        </thead>
        <tbody>
          {label.items.map((item) => (
            <tr key={`${item.sku}-${item.variant}`}>
              <td className="border border-black px-1 py-0.5 font-mono">{item.sku}</td>
              <td className="border border-black px-1 py-0.5">
                {item.title}
                {item.variant ? ` / ${item.variant}` : ""}
              </td>
              <td className="border border-black px-1 py-0.5 text-right">{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}

export function ShippingLabelSheet({
  labels,
  layout,
}: {
  labels: readonly ShippingLabelItem[];
  layout: "thermal" | "a4";
}) {
  const pageSize = layout === "thermal" ? "100mm 100mm" : "A4";
  return (
    <div className={layout === "a4" ? "shipping-sheet shipping-sheet-a4" : "shipping-sheet"} data-layout={layout}>
      <style>{`
        .shipping-label {
          width: 100mm;
          height: 100mm;
          overflow: hidden;
          border: 1px solid #111;
          background: #fff;
          color: #000;
          padding: 3mm;
          break-inside: avoid;
          page-break-inside: avoid;
        }
        .shipping-sheet-a4 {
          display: grid;
          grid-template-columns: 100mm 100mm;
          gap: 6mm;
        }
        @media print {
          @page { size: ${pageSize}; margin: 4mm; }
          body * { visibility: hidden; }
          .shipping-sheet, .shipping-sheet * { visibility: visible; }
          .shipping-sheet { position: absolute; left: 0; top: 0; }
          .shipping-label { border: none; }
        }
      `}</style>
      {labels.map((label) => (
        <LabelCard key={`${label.orderNo}-${label.trackingCode}`} label={label} />
      ))}
    </div>
  );
}
