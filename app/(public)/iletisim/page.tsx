import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import { LEGAL_HONESTY_BODY, LEGAL_UPDATED_LABEL } from "@/lib/copy/legal-launch";

export const metadata: Metadata = {
  title: "İletişim",
  description: `${YETKIN_BRAND} iletişim ve destek kanalı.`,
};

export default function ContactPage() {
  return (
    <main className="relative mx-auto max-w-3xl px-6 pb-20 pt-16">
      <div className="relative space-y-6">
        <Badge tone="safir">İletişim</Badge>
        <h1 className="text-3xl font-semibold tracking-tight">İletişim</h1>
        <p className="text-xs text-[var(--muted)]">{LEGAL_UPDATED_LABEL}</p>
        <Card variant="glass">{LEGAL_HONESTY_BODY}</Card>
        <Card title="Nasıl ulaşırsın">
          <div className="space-y-3">
            <p>
              Destek ve KVKK m.11 talepleri, hesap içi bildirim ve kayıtlı e-posta
              üzerinden yürür. Bu sayfada sahte kamu hukuk adresi, VKN veya MERSİS
              yazılmaz.
            </p>
            <p>
              Ödeme itirazları (kart tahsilatı) lisanslı kuruluşun (PayTR) kendi
              kanalları ve platform iade kurallarıyla birlikte okunur. Usta iş
              bedeli platform cüzdanından IBAN’a çekilmez.
            </p>
          </div>
        </Card>
        <div className="flex flex-wrap gap-3">
          <LinkButton href="/legal" variant="outline" size="sm">
            Yasal metinler
          </LinkButton>
          <LinkButton href="/" variant="outline" size="sm">
            Ana sayfa
          </LinkButton>
        </div>
      </div>
    </main>
  );
}
