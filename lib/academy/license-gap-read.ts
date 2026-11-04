import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import type { AcademyLicenseSeat } from "@/lib/kernel/payments/license-gap";

/** Açılmış akademi lisansı: kullanıcı + kurs slug. Yazma yok. */
export async function loadAcademyLicenseSeats(): Promise<AcademyLicenseSeat[]> {
  const rows = await getPrisma().academyPurchase.findMany({
    select: {
      userId: true,
      course: { select: { slug: true } },
    },
  });
  const seats: AcademyLicenseSeat[] = [];
  for (const row of rows) {
    const courseSlug = row.course.slug.trim();
    if (!courseSlug) {
      continue;
    }
    seats.push({ userId: row.userId, courseSlug });
  }
  return seats;
}
