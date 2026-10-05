import { cn } from "@/components/ui/cn";
import { JUNIOR_MAARIF_SKILL_TAGS } from "@/lib/junior/types";

export const MAARIF_SKILL_TAGS = JUNIOR_MAARIF_SKILL_TAGS;

const SKILL_CLASS = [
  "bg-[var(--gold-soft)] text-[var(--foreground)]",
  "bg-[var(--safir-soft)] text-[var(--safir-deep)]",
  "bg-[var(--violet-soft)] text-[var(--violet)]",
] as const;

/** Ders etiketleri. Uygunluk yüzdesi, mühür ve fiyat bandı bu bileşende durmaz. */
export function MaarifSkillTags({ className }: { className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)} aria-label="Ders etiketleri">
      {MAARIF_SKILL_TAGS.map((label, index) => (
        <li
          key={label}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-semibold",
            SKILL_CLASS[index] ?? SKILL_CLASS[0],
          )}
        >
          {label}
        </li>
      ))}
    </ul>
  );
}
