import { getPrisma } from "@/lib/kernel/db";

/**
 * Site haritasının okuduğu yayın süzgeci.
 * Sayfa `lib/kernel/db` dosyasını doğrudan import etmez.
 */
export async function readPublishedAcademySlugs(): Promise<ReadonlySet<string> | null> {
  if (process.env.VITEST === "true" || !process.env.DATABASE_URL?.trim()) {
    return null;
  }
  try {
    const rows = await getPrisma().academyCourse.findMany({
      where: { isPublished: true },
      select: { slug: true },
    });
    return new Set(rows.map((row) => row.slug));
  } catch {
    return null;
  }
}
