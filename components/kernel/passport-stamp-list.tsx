import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import {
  formatPassportIssuedAt,
  passportAcademyVerifyHref,
  passportModuleLabel,
  passportSourceLabel,
} from "@/lib/kernel/passport/display";
import type { SealedPassportStamp } from "@/lib/kernel/passport/types";

export function PassportStampList({ stamps }: { stamps: SealedPassportStamp[] }) {
  return (
    <Card
      title="Mühürlenmiş yetkinlikler"
      eyebrow="Salt okunur sicil"
      bodyClassName="text-[var(--foreground)]"
    >
      <p className="mb-4 text-sm text-[var(--muted)]">
        Satırlar CareerVisaStamp kayıtlarıdır. Bu odada vize eklenmez veya düzenlenmez.
      </p>
      {stamps.length === 0 ? (
        <p className="rounded-[var(--radius-card)] border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-6 text-sm text-[var(--muted)]">
          Henüz mühür yok. Akademi sertifikası ve freelancer teslim mührü Kariyer odasında damgaya
          dönüşür; uydurma vize basılmaz.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]">
          <table className="w-full min-w-[40rem] text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                <th className="px-4 py-3">Damga</th>
                <th className="px-4 py-3">Yetkinlik</th>
                <th className="px-4 py-3">Kaynak</th>
                <th className="px-4 py-3">Vize anahtarı</th>
                <th className="px-4 py-3">Kanıt</th>
              </tr>
            </thead>
            <tbody>
              {stamps.map((stamp) => {
                const verifyHref = passportAcademyVerifyHref(stamp);
                return (
                <tr key={stamp.id} className="border-b border-[var(--border)] last:border-b-0">
                  <td className="whitespace-nowrap px-4 py-3 text-[var(--muted)]">
                    {formatPassportIssuedAt(stamp.issuedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[var(--foreground)]">{stamp.title}</p>
                    <p className="text-[11px] text-[var(--muted)]">
                      {passportModuleLabel(stamp.moduleId)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={stamp.sourceKind === "ACADEMY_CERTIFICATE" ? "safir" : "emerald"}>
                      {passportSourceLabel(stamp.sourceKind)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-[var(--muted)]">{stamp.visaKey}</td>
                  <td className="px-4 py-3">
                    {verifyHref ? (
                      <LinkButton href={verifyHref} variant="outline" size="sm">
                        Doğrula
                      </LinkButton>
                    ) : (
                      <span className="text-[11px] text-[var(--muted)]">—</span>
                    )}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
