import { formatMinor } from "@/lib/kernel/money/format";
import type { GrantMatchResult, GrantProgramRecord } from "@/lib/hibe/types";
import { HIBE_SHOWCASE } from "@/lib/showcase/catalog";
import { ListingCard, Vitrine } from "@/components/showcase/listing-card";
import { IconLeaf } from "@/components/ui/icons";

function agencyLabel(agency: GrantProgramRecord["agency"]): string {
  if (agency === "TUBITAK") {
    return "TÜBİTAK";
  }
  return agency;
}

export function ProgramList({ programs }: { programs: Array<GrantProgramRecord | GrantMatchResult> }) {
  if (programs.length === 0) {
    return (
      <Vitrine hint="Bu filtreye uyan program yok. Kartlar derleme vitrinidir; canlı devlet API’si değildir.">
        <ul className="grid gap-4 md:grid-cols-2">
          {HIBE_SHOWCASE.map((item) => (
            <li key={item.title}>
              <ListingCard
                showcase
                title={item.title}
                summary={item.summary}
                badge={item.badge}
                badgeTone="emerald"
                meta={item.meta}
                href="/hibe"
                cta="Eşleştirmeyi yenile"
                icon={<IconLeaf />}
                lockLabel="Derleme"
              />
            </li>
          ))}
        </ul>
      </Vitrine>
    );
  }
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {programs.map((program) => {
        const score = "score" in program ? program.score : null;
        return (
          <li key={program.id}>
            <ListingCard
              title={program.title}
              summary={program.summary}
              badge={score != null ? `skor ${score}` : agencyLabel(program.agency)}
              badgeTone="emerald"
              price={
                program.maxAwardMinor != null
                  ? formatMinor(program.maxAwardMinor, program.currencyCode)
                  : undefined
              }
              meta={`${agencyLabel(program.agency)} · ${program.applicantKind} · ${program.jurisdiction}`}
              href={`/hibe/${program.slug}`}
              cta="Rehberi aç"
              icon={<IconLeaf />}
              lockLabel="Resmi eşleşme"
            />
          </li>
        );
      })}
    </ul>
  );
}
