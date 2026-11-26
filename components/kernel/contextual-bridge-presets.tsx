import { ContextualBridgeStrip } from "@/components/kernel/contextual-bridge-strip";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import type { BridgeKaynak } from "@/lib/kernel/contextual-bridge-params";

const copy = SEN_VOICE.bridges;

/**
 * Köprü hedefleri `id` taşır. `id` olmadan döngü bastırma çalışmaz: kullanıcı
 * `?kaynak=hibe` ile geldiyse Hibe'ye geri gönderen köprü basılmamalıdır.
 */
type Came = { cameFrom?: BridgeKaynak | null };

/** E-Ticaret kokpiti → YetkinHibe + Kurumsal. */
export function EcommerceContextualBridges({
  className = "mt-4",
  cameFrom = null,
}: Came & { className?: string }) {
  const row = copy.ecommerce;
  return (
    <ContextualBridgeStrip
      from="e-ticaret"
      className={className}
      title={row.title}
      body={row.body}
      cameFrom={cameFrom}
      targets={[
        { id: "hibe", ...row.hibe },
        { id: "kurumsal", ...row.kurumsal },
      ]}
    />
  );
}

/** YetkinHibe analizi → AI Tezgâh + Yetenek Vitrini. */
export function HibeContextualBridges({
  className,
  cameFrom = null,
}: Came & { className?: string }) {
  const row = copy.hibe;
  return (
    <ContextualBridgeStrip
      from="hibe"
      className={className}
      title={row.title}
      body={row.body}
      cameFrom={cameFrom}
      targets={[
        { id: "tezgah", ...row.tezgah },
        { id: "kariyer", ...row.vitrin },
      ]}
    />
  );
}

/** Kurumsal eleme kokpiti → AI Tezgâh + YetkinHibe. */
export function KurumsalContextualBridges({
  className,
  cameFrom = null,
}: Came & { className?: string }) {
  const row = copy.kurumsal;
  return (
    <ContextualBridgeStrip
      from="kurumsal"
      className={className}
      title={row.title}
      body={row.body}
      cameFrom={cameFrom}
      targets={[
        { id: "tezgah", ...row.tezgah },
        { id: "hibe", ...row.hibe },
      ]}
    />
  );
}

/** Kariyer sınav / rozet → Açık ilanlar + E-Ticaret. */
export function CareerContextualBridges({
  className,
  cameFrom = null,
}: Came & { className?: string }) {
  const row = copy.career;
  return (
    <ContextualBridgeStrip
      from="kariyer"
      className={className}
      title={row.title}
      body={row.body}
      cameFrom={cameFrom}
      targets={[
        { id: "kurumsal", ...row.ilan },
        { id: "e-ticaret", ...row.ecommerce },
      ]}
    />
  );
}
