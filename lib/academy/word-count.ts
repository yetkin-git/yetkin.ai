/**
 * Compact makale kelime sayımı — `estimatedWordCount` ile aynı kural.
 * Bake script’leri boşluksuz split kullanır; bu fonksiyon o kuralın SSOT’udur.
 */

export function countAcademyMarkdownWords(markdown: string): number {
  const trimmed = markdown.replace(/\s+/gu, " ").trim();
  if (!trimmed) {
    return 0;
  }
  return trimmed.split(" ").filter((part) => part.length > 0).length;
}
