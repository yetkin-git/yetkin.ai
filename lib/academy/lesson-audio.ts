/**
 * Ders ses medyası — Zero-Cost Streaming bağlayıcısı.
 * İzleme anında canlı TTS tetiklenmez; mühürlü WAV kamu yolundan okunur.
 */

import { ACADEMY_MEDIA_PUBLIC_ROOT } from "@/lib/academy/lesson-media";
import { isAcademyLessonAudioSealed } from "@/lib/academy/pilot-sku";

export function academyLessonAudioPublicPath(courseSlug: string, lessonKey: string): string {
  const slug = courseSlug.trim();
  const key = lessonKey.trim();
  return `${ACADEMY_MEDIA_PUBLIC_ROOT}/audio/${slug}/${key}.wav`;
}

export { isAcademyLessonAudioSealed };
