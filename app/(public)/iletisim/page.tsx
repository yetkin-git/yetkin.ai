import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { LegalEntityColophon, LegalHonestyCard, LegalSupportEmailLine } from "@/components/legal/legal-section-articles";
import { YETKIN_BRAND } from "@/lib/copy/brand";
import {
  LEGAL_ADMIN_EMAIL,
  LEGAL_ADMIN_MAILTO,
  LEGAL_ENTITY,
  LEGAL_ENTITY_VKN,
  LEGAL_UPDATED_LABEL,
  LEGAL_WHATSAPP_HREF,
} from "@/lib/copy/legal-launch";

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
        <LegalHonestyCard />
        <Card title="Resmi şirket bilgileri">
          <dl className="space-y-3">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Marka
              </dt>
              <dd>{LEGAL_ENTITY.brandName}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Ticari unvan
              </dt>
              <dd>{LEGAL_ENTITY.tradeName}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                Vergi Dairesi
              </dt>
              <dd>{LEGAL_ENTITY.taxOffice}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">VKN</dt>
              <dd>{LEGAL_ENTITY_VKN}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                MERSİS No
              </dt>
              <dd>{LEGAL_ENTITY.mersis}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Adres</dt>
              <dd>{LEGAL_ENTITY.address}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">IBAN</dt>
              <dd className="break-all">{LEGAL_ENTITY.iban}</dd>
            </div>
          </dl>
        </Card>
        <Card title="Destek kanalları">
          <div className="space-y-3">
            <p>Resmi destek ve KVKK m.11 talepleri bu kanallardan yürür.</p>
            <LegalSupportEmailLine />
            <p className="text-sm text-[var(--foreground)]">
              WhatsApp destek:{" "}
              <a
                href={LEGAL_WHATSAPP_HREF}
                className="font-semibold text-[var(--safir-deep)] hover:underline"
              >
                {LEGAL_ENTITY.whatsappDisplay}
              </a>
            </p>
            <p className="text-sm text-[var(--foreground)]">
              İdari e-posta:{" "}
              <a
                href={LEGAL_ADMIN_MAILTO}
                className="font-semibold text-[var(--safir-deep)] hover:underline"
              >
                {LEGAL_ADMIN_EMAIL}
              </a>
            </p>
          </div>
        </Card>
        <Card title="Hesap içi kanal">
          <div className="space-y-3">
            <p>
              Oturumlu hesapta bildirim ve kayıtlı e-posta aynı talebi taşır. Ödeme itirazları
              (kart tahsilatı) Yetkili Ödeme Kuruluşunun kendi kanalları ve platform iade
              kurallarıyla birlikte okunur. Usta iş bedeli platform cüzdanından IBAN’a çekilmez.
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
        <LegalEntityColophon />
      </div>
    </main>
  );
}
