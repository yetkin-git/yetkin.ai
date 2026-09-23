import type { Route } from "next";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import {
  isAcademyPrepStripAudioSealed,
  type AcademyPrepStrip,
} from "@/lib/academy/prep-strip";

export function PrepStripTeaser({ strip }: { strip: AcademyPrepStrip }) {
  const copy = ACADEMY_SEN.outline;
  const audioSealed = isAcademyPrepStripAudioSealed(strip.slug);
  return (
    <div data-academy-prep-teaser="">
    <Card
      eyebrow={strip.badge}
      title={strip.title}
    >
      <p className="text-sm leading-7 text-[var(--foreground)]">
        Ücretsiz önizleme. Sınav ve mühür yoluna girmez. Hesap açma, ücretsiz ile ücretli farkı,
        sohbet ekranı, ilk istem ve Türkçe mi İngilizce mi yazılacağı bu şeritte
        {audioSealed ? " sesli anlatım olarak açılır." : " açılır."} 1. dersten itibaren sekiz ders
        ödeme sonrası açılır.
      </p>
      <p className="mt-2 text-xs text-[var(--muted)]">
        {copy.prepKind} · {copy.durationMin(strip.estimatedMinutes)} · 8 dersin sayısını değiştirmez
      </p>
      <div className="mt-4">
        <LinkButton href={`/academy/${strip.slug}/oyna` as Route} size="sm" data-academy-prep-preview="">
          Ücretsiz önizlemeyi aç
        </LinkButton>
      </div>
    </Card>
    </div>
  );
}
