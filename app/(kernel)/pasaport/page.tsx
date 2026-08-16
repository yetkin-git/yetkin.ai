import { PassportStampList } from "@/components/kernel/passport-stamp-list";
import { AuthNeeded } from "@/components/ui/auth-needed";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { IconBadge, IconLock, IconPassport } from "@/components/ui/icons";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { StatGrid } from "@/components/ui/stat-grid";
import { getSession } from "@/lib/kernel/auth/session";
import {
  countPassportSourceKinds,
  latestPassportStamp,
  PASSPORT_UNSET_LABEL,
} from "@/lib/kernel/passport/display";
import { loadPassportBoard } from "@/lib/kernel/passport/load";
import { CAREER_STAMP_SURFACE_PATH } from "@/lib/kernel/passport/types";

export default async function PassportPage() {
  const session = await getSession();
  const board = session ? await loadPassportBoard(session.id) : null;
  const stamps = board?.stamps ?? [];
  const latest = latestPassportStamp(stamps);

  return (
    <RoomFrame>
      <PageHeader
        eyebrow="Vatandaş kanıt sığınağı"
        title="Pasaport"
        description="Yetkinlik mühürleri CareerVisaStamp sicilinden okunur. Damgayı Kariyer basar; bu oda yalnız listeler."
        actions={
          <LinkButton href={CAREER_STAMP_SURFACE_PATH} variant="secondary">
            Kariyer odası
          </LinkButton>
        }
      />
      <StatGrid
        columns={3}
        items={[
          {
            label: "Mühür",
            value: session ? (board ? String(stamps.length) : "—") : "Oturum yok",
            hint: board ? "CareerVisaStamp sayısı" : "Bağlanınca sicil dolar",
            icon: <IconPassport />,
          },
          {
            label: "Son damga",
            value: latest?.title ?? (session ? PASSPORT_UNSET_LABEL : "—"),
            hint: latest ? "issuedAt desc" : "Uydurma başlık yok",
            icon: <IconBadge />,
          },
          {
            label: "Kaynak",
            value: board ? String(countPassportSourceKinds(stamps)) : session ? "Bekleniyor" : "—",
            hint: "Akademi / freelancer kökeni",
            icon: <IconLock />,
          },
        ]}
      />
      {!session ? (
        <AuthNeeded message="Pasaport sicili oturum ister. Sahte vize basılmaz." />
      ) : board === null ? (
        <div className="space-y-3">
          <Badge tone="amber">Liste henüz yüklenemedi — örnek düzen</Badge>
          <p className="text-sm text-[var(--muted)]">
            Veritabanı bağlanınca gerçek CareerVisaStamp satırları burada durur. Uydurma yetkinlik
            yok.
          </p>
          <PassportStampList stamps={[]} />
        </div>
      ) : (
        <PassportStampList stamps={stamps} />
      )}
      <Card variant="ink" title="Salt okunur sığınak" bodyClassName="text-white/70">
        Bu odada vize ekleme veya düzenleme formu yoktur. Sertifika Akademi sınavından, teslim
        mührü freelancer serbest bırakmasından doğar; Kariyer damgayı basar. Pasaport yalnız
        kanıt sığınağıdır.
      </Card>
    </RoomFrame>
  );
}
