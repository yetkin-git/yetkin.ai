import { Card } from "@/components/ui/card";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import type { AcademyPrepStrip } from "@/lib/academy/prep-strip";

export function PrepStripTeaser({ strip }: { strip: AcademyPrepStrip }) {
  const copy = ACADEMY_SEN.outline;
  return (
    <div data-academy-prep-teaser="">
    <Card
      eyebrow={strip.badge}
      title={strip.title}
    >
      <p className="text-sm leading-7 text-[var(--foreground)]">
        Sınav ve mühür yoluna girmez. Hesap açma, ücretsiz ile ücretli farkı, sohbet ekranı, ilk
        istem ve Türkçe mi İngilizce mi yazılacağı bu şeritte durur. Satın alma sonrası oynatma
        listesinin tepesinde «{strip.badge}» rozetiyle açılır.
      </p>
      <p className="mt-2 text-xs text-[var(--muted)]">
        {copy.prepKind} · {copy.durationMin(strip.estimatedMinutes)} · 9 dersin sayısını değiştirmez
      </p>
    </Card>
    </div>
  );
}
