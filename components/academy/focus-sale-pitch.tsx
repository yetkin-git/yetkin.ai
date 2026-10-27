import { Card } from "@/components/ui/card";
import { academyFocusSalePitch } from "@/lib/academy/focus-sale-pitch";
import { FreePreviewLink } from "@/components/academy/free-preview-link";

/**
 * Kurs detayı — dört basamak: iş sonucu, pratik çıktı, ücretsiz önizleme, güven.
 * Önizleme düğmesi bu bandın içinde, satın alma kartının üstünde durur.
 */
export function FocusSalePitch({
  slug,
  previewHref = null,
}: {
  slug: string;
  previewHref?: string | null;
}) {
  const rows = academyFocusSalePitch(slug);
  if (!rows) {
    return null;
  }
  return (
    <section aria-labelledby="academy-value-promise" className="space-y-3" data-academy-sale-pitch="">
      <h2 id="academy-value-promise" className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
        Bu eğitimde ne yaparsın
      </h2>
      <ol className="grid gap-3">
        {rows.map((row, index) => {
          const preview = row.id === "preview";
          return (
            <li key={row.id} data-pitch-step={row.id}>
              <Card
                variant={preview ? "featured" : "default"}
                eyebrow={String(index + 1)}
                title={row.label}
              >
                <p className="text-sm leading-6 text-[var(--foreground)]">{row.text}</p>
                {preview && previewHref ? (
                  <div className="mt-4">
                    <FreePreviewLink href={previewHref} surface="promise" className="w-full sm:w-auto" />
                  </div>
                ) : null}
              </Card>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
