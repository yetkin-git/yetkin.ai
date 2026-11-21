"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { CUZDAN_SEN } from "@/lib/copy/sen-voice/cuzdan";
import { emitPaytrIframeReturnIfEmbedded } from "@/lib/kernel/payments/paytr/iframe-embed";
import { trackPurchase } from "@/lib/kernel/telemetry/funnel";
import { buttonClassName } from "@/components/ui/button";

const KASA_RETURN_REDIRECT_MS = 3_000;

const KASA_RETURN_HREF = {
  tezgah: "/tezgah",
  "e-ticaret": "/e-ticaret",
  hibe: "/hibe",
  junior: "/junior",
  cuzdan: "/cuzdan",
} as const satisfies Record<string, Route>;

/** Dönüş buton metni — satın alınan masaya tek tıkla geçiş. */
const KASA_RETURN_LABEL = {
  tezgah: "Tezgâh Pro'ya Dön",
  "e-ticaret": "E-Ticaret Paneline Geç",
  hibe: "Hibe Proje Dosyasına Geç",
  junior: "Junior Derslerine Geç",
  cuzdan: "Cüzdana Dön",
} as const satisfies Record<keyof typeof KASA_RETURN_HREF, string>;

export type KasaReturnDesk = keyof typeof KASA_RETURN_HREF;

/**
 * Ödeme dönüşü çalışma masasına iner.
 * Tezgâh Pro ve kredi → tezgâh. Lisans → e-ticaret. Dosya → hibe.
 * Junior paketi → junior. Cüzdan yüklemesi → cüzdan.
 * Tanınmayan işaret tezgâha düşer. Akademi adresi üretilmez.
 */
export function kasaReturnDesk(raw: string | null | undefined): KasaReturnDesk {
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
  if (value === "cuzdan") {
    return "cuzdan";
  }
  return "tezgah";
}

export function kasaReturnHref(desk: string | null | undefined): Route {
  return KASA_RETURN_HREF[kasaReturnDesk(desk)];
}

export function kasaReturnLabel(desk: string | null | undefined): string {
  return KASA_RETURN_LABEL[kasaReturnDesk(desk)];
}

/**
 * GA4 `purchase` idempotans anahtarı — sayfa yenilemede mükerrer dönüşüm olmaz.
 *
 * `trackPurchase` aynı `transaction_id`'yi GA4 tarafında da tekilleştirir; bu
 * tarayıcı kilidi ayrıca ağ isteğini de keser. Anahtar `sessionStorage`'da tutulur
 * (çerez değil; KVKK/çerez onayı gerektirmez). Depolama kapalıysa (gizli pencere)
 * ölçüm yine bir kez dener — dönüşüm körlüğü depolama hatasına feda edilmez.
 */
export const PURCHASE_EMITTED_KEY = "yetkin:ga4:purchase-emitted";

export function markPurchaseEmitted(merchantOid: string): boolean {
  const key = merchantOid.trim();
  if (!key || typeof sessionStorage === "undefined") {
    return true;
  }
  try {
    const memoryKey = `${PURCHASE_EMITTED_KEY}:${key}`;
    if (sessionStorage.getItem(memoryKey)) {
      return false;
    }
    sessionStorage.setItem(memoryKey, "1");
    return true;
  } catch {
    return true;
  }
}

/** Eski çağrı adı. Kurs slug'ı masa seçmez; dönüş çalışma masasına iner. */
export function kasaReturnCourseHref(courseSlug: string | null | undefined): Route {
  return kasaReturnHref(courseSlug);
}

/**
 * Ödeme dönüş paneli.
 *
 * - `masa` ürün bağlamıdır (`?masa=`). Satın alınan masaya tek tıkla geçiş verir.
 * - `merchantOid` verilirse `purchase` bir kez basılır (idempotent).
 *   Verilmezse aynı masa için oturum başına tek kez basılır.
 * - `ok=false` hiçbir dönüşüm göndermez.
 */
export function KasaReturnPanel({
  ok,
  desk = null,
  merchantOid = null,
}: {
  ok: boolean;
  desk?: string | null;
  merchantOid?: string | null;
}) {
  const router = useRouter();
  const resolved = kasaReturnDesk(desk);
  const href = kasaReturnHref(desk);
  const label = kasaReturnLabel(desk);
  const [emitted, setEmitted] = useState(false);

  useEffect(() => {
    emitPaytrIframeReturnIfEmbedded(ok);
    if (!ok) {
      return;
    }
    const transactionId = merchantOid?.trim() || `kasa-${resolved}`;
    if (!markPurchaseEmitted(transactionId)) {
      setEmitted(true);
      return;
    }
    trackPurchase({ itemId: resolved, transactionId });
    setEmitted(true);
    const timer = window.setTimeout(() => {
      router.push(href);
    }, KASA_RETURN_REDIRECT_MS);
    return () => window.clearTimeout(timer);
  }, [desk, href, merchantOid, ok, resolved, router]);

  return (
    <div className="mt-6" suppressHydrationWarning>
      {ok ? (
        <div className="flex flex-col items-center gap-4 text-center" suppressHydrationWarning>
          <span
            aria-hidden="true"
            className="inline-block h-10 w-10 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--safir)]"
          />
          <p className="text-base text-[var(--foreground)]" suppressHydrationWarning>
            {CUZDAN_SEN.kasaReturnOk}
          </p>
          {emitted ? (
            <p className="text-xs text-[var(--muted)]" data-kasa-purchase-emitted="">
              Ödeme kaydı alındı.
            </p>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-[var(--foreground)]" suppressHydrationWarning>
          {CUZDAN_SEN.kasaReturnFail}
        </p>
      )}
      <Link
        href={href}
        className={buttonClassName("primary", "lg", "mt-6 w-full")}
        data-kasa-return-desk={resolved}
        suppressHydrationWarning
      >
        {ok ? label : CUZDAN_SEN.kasaReturnFailCta}
      </Link>
    </div>
  );
}
