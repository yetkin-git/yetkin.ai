import {
  LEGAL_ENTITY,
  LEGAL_ENTITY_COLOPHON,
  LEGAL_HONESTY_BODY,
  LEGAL_SUPPORT_EMAIL,
  LEGAL_SUPPORT_LINE_LABEL,
  LEGAL_SUPPORT_MAILTO,
  type LegalLaunchSection,
} from "@/lib/copy/legal-launch";
import { Card } from "@/components/ui/card";

/** Card varsayılanı `p-6`; `cn` çakışan utility’leri silmediği için `!p-8`. */
export const LEGAL_CARD_CLASSNAME = "!p-8";

export function LegalHonestyCard() {
  const [before, after] = LEGAL_HONESTY_BODY.split(LEGAL_ENTITY.tradeName);
  return (
    <Card variant="glass" className={LEGAL_CARD_CLASSNAME}>
      <p className="text-base leading-relaxed text-slate-700">
        {before}
        <strong className="font-semibold text-zinc-800">{LEGAL_ENTITY.tradeName}</strong>
        {after}
      </p>
    </Card>
  );
}

/** Sayfa altı künye — unvan, VKN, vergi dairesi, MERSİS No, tebligat adresi. */
export function LegalEntityColophon() {
  return (
    <p className="text-sm leading-relaxed text-slate-700" data-legal-colophon="">
      {LEGAL_ENTITY_COLOPHON}
    </p>
  );
}

/** Tek satır: «Destek e-posta: destek@yetkin.ai» — mailto yalnızca adreste. */
export function LegalSupportEmailLine() {
  return (
    <p className="text-base leading-relaxed text-zinc-800">
      {LEGAL_SUPPORT_LINE_LABEL}{" "}
      <a href={LEGAL_SUPPORT_MAILTO} className="font-semibold text-[var(--safir-deep)] hover:underline">
        {LEGAL_SUPPORT_EMAIL}
      </a>
    </p>
  );
}

export function LegalSectionArticles({
  section,
  headingLevel = "h2",
}: {
  section: LegalLaunchSection;
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  return (
    <div className="space-y-8">
      {section.articles.map((article) => (
        <section key={article.id} id={article.id} className="scroll-mt-24 space-y-3">
          <Heading className="text-lg font-semibold tracking-tight text-zinc-800">
            {article.heading}
          </Heading>
          {article.paragraphs.map((paragraph, index) => (
            <p
              key={`${article.id}-${index}`}
              className="text-base leading-relaxed text-slate-700"
            >
              {paragraph}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}
