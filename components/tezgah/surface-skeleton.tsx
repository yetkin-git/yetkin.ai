/**
 * Tezgâh ağır yüzey iskeleti.
 *
 * `next/dynamic` ile tembel yüklenen önizleme/rapor bileşenleri indirilirken
 * basılır. Amaç: kullanıcı yalnız seçtiği aracın kodunu indirsin; ilk boyama
 * boş kutu veya zıplayan düzen göstermesin. Kart yüksekliği önizlemelerin
 * gerçek ölçüsüne yakın tutulur (CLS yok), içerik nabız animasyonu taşımaz
 * (`prefers-reduced-motion` altında statik kalır — `.room-led` sözleşmesi).
 */
export function TezgahSurfaceSkeleton({ label, lines = 3 }: { label: string; lines?: number }) {
  return (
    <div
      data-tezgah-surface-skeleton=""
      role="status"
      aria-live="polite"
      aria-label={label}
      className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm"
    >
      <p className="text-sm font-medium text-[var(--foreground)]">{label}</p>
      <div className="mt-4 space-y-2.5">
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className="h-3 rounded-full bg-[var(--surface-muted)]"
            style={{ width: `${[100, 88, 72, 94, 64][index % 5]}%` }}
          />
        ))}
      </div>
      <p className="mt-4 text-xs text-[var(--muted)]">Hazırlanıyor…</p>
    </div>
  );
}
