import { ContextualBridgeStrip } from "@/components/kernel/contextual-bridge-strip";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

const copy = SEN_VOICE.bridges;

/** E-Ticaret kokpiti → YetkinHibe + Kurumsal. */
export function EcommerceContextualBridges({ className = "mt-4" }: { className?: string }) {
  const row = copy.ecommerce;
  return (
    <ContextualBridgeStrip
      from="e-ticaret"
      className={className}
      title={row.title}
      body={row.body}
      targets={[row.hibe, row.kurumsal]}
    />
  );
}

/** YetkinHibe analizi → AI Tezgâh + Yetenek Vitrini. */
export function HibeContextualBridges({ className }: { className?: string }) {
  const row = copy.hibe;
  return (
    <ContextualBridgeStrip
      from="hibe"
      className={className}
      title={row.title}
      body={row.body}
      targets={[row.tezgah, row.vitrin]}
    />
  );
}

/** Kurumsal eleme kokpiti → AI Tezgâh + YetkinHibe. */
export function KurumsalContextualBridges({ className }: { className?: string }) {
  const row = copy.kurumsal;
  return (
    <ContextualBridgeStrip
      from="kurumsal"
      className={className}
      title={row.title}
      body={row.body}
      targets={[row.tezgah, row.hibe]}
    />
  );
}

/** Kariyer sınav / rozet → Açık ilanlar + E-Ticaret. */
export function CareerContextualBridges({ className }: { className?: string }) {
  const row = copy.career;
  return (
    <ContextualBridgeStrip
      from="kariyer"
      className={className}
      title={row.title}
      body={row.body}
      targets={[row.ilan, row.ecommerce]}
    />
  );
}
