import { Card } from "@/components/ui/card";
import { academyFocusSalePitch } from "@/lib/academy/focus-sale-pitch";

export function FocusSalePitch({ slug }: { slug: string }) {
  const rows = academyFocusSalePitch(slug);
  if (!rows) {
    return null;
  }
  return (
    <Card eyebrow="Bu eğitim" title="Ne işe yarar">
      <ol className="space-y-3" data-academy-sale-pitch="">
        {rows.map((row) => (
          <li key={row.id} data-pitch-step={row.id} className="text-sm leading-6 text-[var(--foreground)]">
            <span className="font-semibold">{row.label}. </span>
            {row.text}
          </li>
        ))}
      </ol>
    </Card>
  );
}
