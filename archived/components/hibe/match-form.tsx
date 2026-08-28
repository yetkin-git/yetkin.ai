import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function MatchForm({
  jurisdiction,
  applicantKind,
  hasTaxId,
  tags,
  agency,
  query,
}: {
  jurisdiction: string;
  applicantKind: string;
  hasTaxId: boolean;
  tags: string;
  agency: string;
  query: string;
}) {
  return (
    <form method="get" className="grid gap-3 sm:grid-cols-2">
      <label className="block text-sm">
        Yargı
        <Input name="jurisdiction" defaultValue={jurisdiction} />
      </label>
      <label className="block text-sm">
        Başvuran
        <select
          name="applicantKind"
          defaultValue={applicantKind}
          className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--safir)] focus:ring-4 focus:ring-[var(--safir-soft)]"
        >
          <option value="INDIVIDUAL">Birey</option>
          <option value="CORPORATE">Kurumsal şirket</option>
        </select>
      </label>
      <label className="block text-sm">
        Etiketler (virgül)
        <Input name="tags" defaultValue={tags} placeholder="kobi, arge, yazilim" />
      </label>
      <label className="block text-sm">
        Ajans
        <select
          name="agency"
          defaultValue={agency}
          className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--safir)] focus:ring-4 focus:ring-[var(--safir-soft)]"
        >
          <option value="">Tümü</option>
          <option value="KOSGEB">KOSGEB</option>
          <option value="TUBITAK">TÜBİTAK</option>
          <option value="OTHER">Diğer</option>
        </select>
      </label>
      <label className="block text-sm sm:col-span-2">
        Arama
        <Input name="q" defaultValue={query} placeholder="BİGG, 1507, ihracat…" />
      </label>
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input type="checkbox" name="hasTaxId" value="1" defaultChecked={hasTaxId} />
        Vergi no var (şirket eşlemesi)
      </label>
      <div className="sm:col-span-2">
        <Button type="submit">Eşleştir</Button>
      </div>
    </form>
  );
}
