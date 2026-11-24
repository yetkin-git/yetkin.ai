import { Card } from "@/components/ui/card";
import { IconLeaf, IconShield } from "@/components/ui/icons";

export function KurumsalRoadmapCards({ offerHref }: { offerHref: string }) {
  return (
    <div className="grid gap-4" data-kurumsal-column="roadmap">
      <Card eyebrow="YetkinHibe" title="Şirketine Özel Hibe & Destek Fırsatı">
        <p className="text-sm leading-6 text-[var(--foreground)]">
          Firma profilini girince eşleşen programın kriter uyum puanı, kapatılabilir eksikler ve üç aşamalı
          hazırlık planı açılır. Yüzde kriter karşılama puanıdır. Son tarih katalog satırında varsa oradan okunur.
        </p>
        <a
          href="/panel/hibe?sekme=analiz"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-800"
          data-kurumsal-hibe=""
        >
          <IconLeaf className="h-4 w-4" />
          Firma uyum analizini başlat
        </a>
      </Card>
      <Card eyebrow="Faz 2" title="ISO ve Kalite Doküman Denetçisi">
        <p className="text-sm leading-6 text-[var(--foreground)]">
          Prosedür ve talimatlar arasındaki revizyon çelişkisini tarayacak doküman tutarlılık modülü.
          Henüz işletimde değil. Talebinizi bırakın; kurumsal paneliniz tanımlanınca bu modül açılır.
        </p>
        <a href={offerHref} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--safir)]">
          <IconShield className="h-4 w-4" />
          Talebinizi bırakın
        </a>
      </Card>
      <Card eyebrow="Faz 3" title="Şirket Beyni (Toplantı & Karar Hafızası)">
        <p className="text-sm leading-6 text-[var(--foreground)]">
          Şirket içi toplantı kayıt ve dökümlerini analiz ederek yönetici özeti, alınan kararlar ve kişi
          bazlı aksiyon planı çıkaran kurumsal hafıza modülü. Henüz işletimde değil; talebinizi bırakın,
          panel tanımlanınca açılır.
        </p>
        <a href={offerHref} className="mt-4 inline-flex text-sm font-semibold text-[var(--safir)]">
          Talebinizi bırakın
        </a>
      </Card>
    </div>
  );
}
