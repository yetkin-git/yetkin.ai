/** Fırınlanmış JPEG kapağının alternatif metni. Ders başlığı ve sınıf seviyesi birlikte durur. */
export function juniorCoverAlt(input: {
  title?: string | null;
  subject: string;
  grade?: number | null;
}): string {
  const subject = input.subject.trim() || "ders";
  const title = input.title?.trim() || subject;
  const grade = typeof input.grade === "number" && input.grade > 0 ? input.grade : 6;
  return `${title} - ${grade}. Sınıf ${subject}`;
}
