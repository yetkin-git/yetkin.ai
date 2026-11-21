"use client";

/**
 * `/cuzdan` ödeme dönüşü — GA4 `purchase` dönüşüm sinyali + masaya geçiş.
 *
 * CRO (P0): tüm tarayıcı ödemeleri `/cuzdan`'a düşüyordu ve burada `trackPurchase`
 * **hiç** çağrılmıyordu (tek davranış `router.refresh()`). GA4 `purchase` gerçek
 * ödemelerde tetiklenmediği için reklam ROI'si kör kalıyordu.
 *
 * Sözleşme:
 * - Dönüşüm yalnız **sunucuda doğrulanmış** ödeme emriyle basılır
 *   (`loadVerifiedPurchase`: oturum sahibi + status PAID/CLEARED). `sonuc=ok`
 *   tek başına yetmez; kullanıcı o parametreyi elle yazabilir.
 * - `sessionStorage` + `transaction_id` (merchantOid) ile **idempotent**:
 *   sayfa yenilemede mükerrer `purchase` gitmez.
 * - `masa` ürün bağlamıdır; buton satın alınan masaya tek tıkla geçirir.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { trackPurchase } from "@/lib/kernel/telemetry/funnel";
import { buttonClassName } from "@/components/ui/button";
import { markPurchaseEmitted } from "@/components/kernel/kasa-return-panel";

const RETURN_HREF = {
  tezgah: "/tezgah",
  "e-ticaret": "/e-ticaret",
  hibe: "/hibe",
  junior: "/junior",
  cuzdan: "/cuzdan",
} as const satisfies Record<string, Route>;

const RETURN_LABEL = {
  tezgah: "Tezgâh Pro'ya Dön",
  "e-ticaret": "E-Ticaret Paneline Geç",
  hibe: "Hibe Proje Dosyasına Geç",
  junior: "Junior Derslerine Geç",
  cuzdan: "Cüzdanda Kal",
} as const satisfies Record<keyof typeof RETURN_HREF, string>;

export type CuzdanReturnDesk = keyof typeof RETURN_HREF;

/** `masa` sorgusu → masa. Tanınmayan değer cüzdana düşer (nötr). */
export function cuzdanReturnDesk(raw: string | null | undefined): CuzdanReturnDesk {
  const value = raw?.trim().toLowerCase() ?? "";
  if (value === "e-ticaret" || value === "eticaret" || value === "commerce" || value === "lisans") {
    return "e-ticaret";
  }
  if (value === "hibe" || value === "grant" || value === "dosya") {
    return "hibe";
  }
  if (value === "junior") {
    return "junior";
  }
  if (value === "tezgah") {
    return "tezgah";
  }
  return "cuzdan";
}

export function cuzdanReturnHref(raw: string | null | undefined): Route {
  return RETURN_HREF[cuzdanReturnDesk(raw)];
}

export function cuzdanReturnLabel(raw: string | null | undefined): string {
  return RETURN_LABEL[cuzdanReturnDesk(raw)];
}

export type CuzdanVerifiedPurchase = {
  merchantOid: string;
  desk: string;
  amountMinor: number;
  currencyCode: string;
};

export function CuzdanReturnSignal({ purchase }: { purchase: CuzdanVerifiedPurchase | null }) {
  const [emitted, setEmitted] = useState(false);

  useEffect(() => {
    if (!purchase) {
      return;
    }
    if (!markPurchaseEmitted(purchase.merchantOid)) {
      setEmitted(true);
      return;
    }
    trackPurchase({
      itemId: purchase.desk,
      valueMinor: purchase.amountMinor,
      currency: purchase.currencyCode,
      transactionId: purchase.merchantOid,
    });
    setEmitted(true);
  }, [purchase]);

  if (!purchase) {
    return null;
  }

  const desk = cuzdanReturnDesk(purchase.desk);
  return (
    <div
      className="mt-4 rounded-2xl border border-emerald-300 bg-emerald-50/70 p-4"
      data-cuzdan-return-ok=""
      data-cuzdan-return-desk={desk}
      data-cuzdan-return-oid={purchase.merchantOid}
      suppressHydrationWarning
    >
      <p className="text-sm font-semibold text-emerald-900">Ödeme alındı.</p>
      <p className="mt-1 text-sm leading-6 text-emerald-900/80">
        Bakiyen ve satın aldığın paket hesabına işlendi.
        {emitted ? " Dönüşüm ölçümü kaydedildi." : ""}
      </p>
      <div className="mt-3">
        <Link href={RETURN_HREF[desk]} className={buttonClassName("primary", "md")}>
          {RETURN_LABEL[desk]}
        </Link>
      </div>
    </div>
  );
}
