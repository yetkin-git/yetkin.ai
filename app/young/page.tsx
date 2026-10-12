import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { DronBayrakları } from "@/lib/dronlar/kayit";
import { YOUNG_SCHOOL_SEGMENT } from "@/lib/kernel/catalog-ids/school-segments";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Young — Lise",
  description: "9, 10, 11 ve 12. sınıf ile YKS hazırlık rafı.",
  robots: { index: false, follow: false },
};

export default function YoungPage() {
  if (DronBayrakları.isKapali("young")) {
    notFound();
  }

  const grades = YOUNG_SCHOOL_SEGMENT.grades.join(", ");

  return (
    <RoomFrame>
      <PageHeader
        eyebrow="Young"
        title="Lise rafı"
        description={`Sınıflar ${grades}. Yaş ${YOUNG_SCHOOL_SEGMENT.ageMin}–${YOUNG_SCHOOL_SEGMENT.ageMax}. YKS hazırlık aynı dikeydedir. Ders kartı mühürlenince burada açılır.`}
      />
      <ul className="mt-6 grid gap-3 sm:grid-cols-2" data-young-subject-shelf="">
        {YOUNG_SCHOOL_SEGMENT.subjects.map((subject) => (
          <li key={subject.id} className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
            <p className="text-base font-semibold">{subject.label}</p>
            <p className="mt-1 text-sm text-[var(--muted)]">İçerik kartı henüz yok.</p>
          </li>
        ))}
      </ul>
    </RoomFrame>
  );
}
