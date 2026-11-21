/** Oynatıcı bu adresi çağırır. İmza sırrı bu dosyada durmaz. */

export function academyAudioGrantApiPath(courseSlug: string, lessonKey: string): string {
  const params = new URLSearchParams({ lesson: lessonKey.trim() });
  return `/api/academy/courses/${encodeURIComponent(courseSlug.trim())}/audio-grant?${params.toString()}`;
}
