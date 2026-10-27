import type { Metadata } from "next";
import {
  faqPageJsonLd,
  jsonLdDocument,
  juniorOnlineCourseJsonLd,
  type JsonLdDocument,
} from "@/lib/copy/json-ld";
import {
  JUNIOR_SEO_KEYWORDS,
  PAGE_SEO,
  juniorLessonSeoTitle,
  pageMetadata,
} from "@/lib/copy/seo";
import { juniorCourseByLessonKey, juniorLessonAccess, juniorLessonByKey } from "@/lib/junior/catalog";
import { juniorCoverSrc } from "@/lib/junior/covers";

export const JUNIOR_DESCRIPTION_MAX = 180;

/**
 * Alt sınır: SERP'te açıklamanın kesilmeden görünen bölümü ~120 karakterdir.
 * Bunun altında kalan açıklama «boş kart» gibi durur.
 */
export const JUNIOR_DESCRIPTION_MIN = 120;

/**
 * Meta açıklama: **tam cümlelerle** kurulmuş, 180 karakter tavanlı metin.
 *
 * Cümle ortasında kesilen açıklama («…ya da Bu konu, 6. sınıf…») SERP'te özensiz durur.
 * Bu yüzden tavanı aşmayan son tam cümleye kadar toplanır. Hâlâ
 * `JUNIOR_DESCRIPTION_MIN` altındaysa `filler` (kamu sözleşmesi cümlesi) eklenir.
 * Uydurma iddia yazılmaz — tüm cümleler çağıranın verdiği metinden gelir.
 */
export function juniorSeoDescription(text: string, filler?: string): string {
  const assembled = completeSentences(text, JUNIOR_DESCRIPTION_MAX);
  if (assembled.length >= JUNIOR_DESCRIPTION_MIN) {
    return assembled;
  }
  const tail = filler?.trim();
  if (!tail) {
    return assembled;
  }
  // Filler her zaman tam cümledir; teaser tarafı tavana sığacak kadar kırpılır.
  const budget = JUNIOR_DESCRIPTION_MAX - tail.length - 1;
  const head = budget > 0 ? completeSentences(text, budget) : "";
  const joined = head ? `${head} ${tail}` : tail;
  return joined.length <= JUNIOR_DESCRIPTION_MAX
    ? joined
    : `${cutAtWord(joined, JUNIOR_DESCRIPTION_MAX - 1)}…`;
}

/**
 * Metnin başından, `max` sınırını aşmayan **tam cümleleri** döndürür.
 * Hiç tam cümle sığmıyorsa ilk cümleyi kelime sınırında kısaltıp tek cümle döndürür.
 */
function completeSentences(text: string, max: number): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (!trimmed) {
    return "";
  }
  const sentences = trimmed.match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/gu) ?? [trimmed];
  let assembled = "";
  for (const sentence of sentences) {
    const candidate = assembled ? `${assembled} ${sentence.trim()}` : sentence.trim();
    if (candidate.length > max) {
      break;
    }
    assembled = candidate;
  }
  if (assembled) {
    return assembled;
  }
  return `${cutAtWord(trimmed, Math.max(0, max - 1))}…`;
}

/**
 * Metni `max` sınırında **kelime ortasından kesmeden** kısaltır.
 * «…büyük Bu…» gibi yarım sözcükler SERP'te özensiz görünür; son tam kelimede durulur.
 */
function cutAtWord(text: string, max: number): string {
  if (text.length <= max) {
    return text.trimEnd();
  }
  const hard = text.slice(0, max);
  const lastSpace = hard.lastIndexOf(" ");
  return (lastSpace > 0 ? hard.slice(0, lastSpace) : hard).trimEnd();
}

export function juniorLessonKeywords(subject: string): string[] {
  const specific = `6. sınıf ${subject.trim().toLocaleLowerCase("tr-TR")}`;
  const rest = JUNIOR_SEO_KEYWORDS.filter((keyword) => keyword !== specific);
  return [specific, ...rest];
}

export const JUNIOR_LANDING_FAQ = [
  {
    question: "6. sınıf derslerinin ilk konusu ücretsiz mi?",
    answer:
      "Evet. Çekirdek derslerin ve her seçmeli kartın yalnız ilk konusu ücretsizdir. Seçmeli kartın ikinci konusu ve çekirdek derslerin sonraki konuları yıllık paketle açılır.",
  },
  {
    question: "Kilitli konular nasıl açılır?",
    answer: "Kilitli konular tek bir yıllık paketle açılır. Her hafta ayrı satılmaz.",
  },
  {
    question: "Dersi kim açar?",
    answer: "Hesap veliye aittir. Çocuk profili, veli aydınlatması onaylanmadan açılmaz.",
  },
  {
    question: "Hangi sınıf yayında?",
    answer: "Şu an 6. sınıf pilotu aktiftir. Başka sınıfın dersi henüz yoktur.",
  },
] as const;

export function juniorFreeLessonPublicLine(subject: string): string {
  return `Bu konu, 6. sınıf ${subject} dersinin ücretsiz ilk konusudur. Sonraki konular yıllık paketle açılır.`;
}

/**
 * SERP için kısa ücretsiz-ders teklifi.
 * `juniorFreeLessonPublicLine` gövde metnidir (uzun); meta açıklamada bütçe kısıtlıdır
 * ve tıklama nedeni tek cümlede durmalıdır. İkisi aynı sözleşmeyi söyler.
 */
export const JUNIOR_FREE_LESSON_META_OFFER =
  "İlk konu ücretsiz; sonraki konular yıllık pakette." as const;

export function juniorFreeLessonFaq(subject: string): { question: string; answer: string }[] {
  return [
    {
      question: `6. sınıf ${subject} dersinin ilk konusu ücretsiz mi?`,
      answer: juniorFreeLessonPublicLine(subject),
    },
    {
      question: "Sonraki konular nasıl açılır?",
      answer: "Sonraki konular yıllık paketle açılır.",
    },
  ];
}

function juniorCoverImage(lessonKey: string): string | undefined {
  try {
    return juniorCoverSrc(lessonKey);
  } catch {
    return undefined;
  }
}

/**
 * İndekslenen ücretsiz ders açıklaması.
 *
 * Sıra önemlidir: önce dersin kendi içeriği (aranan niyet), sonra ücretsiz-ders
 * teklifi (tıklama nedeni). Teklif cümlesi **her zaman** korunur; teaser tarafı
 * kalan bütçeye tam cümlelerle sığdırılır. İkisi de tam cümle kalır.
 */
function juniorFreeLessonDescription(lesson: { teaser: string }, subject: string): string {
  const offer = JUNIOR_FREE_LESSON_META_OFFER;
  const budget = JUNIOR_DESCRIPTION_MAX - offer.length - 1;
  const body = budget >= JUNIOR_DESCRIPTION_MIN / 2 ? completeSentences(lesson.teaser, budget) : "";
  return body ? `${body} ${offer}` : juniorSeoDescription(lesson.teaser, offer);
}

/** Katalogdaki ücretsiz ilk konu indekslenir. Kilitli konu ve bilinmeyen anahtar indekslenmez. */
export function juniorLessonPageMetadata(lessonKey: string): Metadata {
  const lesson = juniorLessonByKey(lessonKey);
  const course = juniorCourseByLessonKey(lessonKey);
  if (!lesson || !course || juniorLessonAccess(lessonKey) !== "free") {
    return {
      title: lesson?.title ?? "Ders",
      description: "Bu ders sayfası arama dizinine kapalıdır.",
      robots: { index: false, follow: false },
    };
  }
  return pageMetadata({
    title: juniorLessonSeoTitle(lesson.title, course.subject),
    description: juniorFreeLessonDescription(lesson, course.subject),
    path: `/junior/ders/${lesson.key}`,
    keywords: juniorLessonKeywords(course.subject),
    image: juniorCoverImage(lesson.key),
    robots: { index: true, follow: true },
  });
}

export function juniorLandingJsonLd(): JsonLdDocument {
  return jsonLdDocument([
    juniorOnlineCourseJsonLd({
      name: "6. Sınıf Online Dersler",
      description: PAGE_SEO.junior.description,
      path: PAGE_SEO.junior.path,
      isAccessibleForFree: false,
    }),
    faqPageJsonLd(JUNIOR_LANDING_FAQ),
  ]);
}

/** Yalnız ücretsiz ilk konuda Course + FAQPage basılır. */
export function juniorPublicLessonJsonLd(lessonKey: string): JsonLdDocument | null {
  const lesson = juniorLessonByKey(lessonKey);
  const course = juniorCourseByLessonKey(lessonKey);
  if (!lesson || !course || juniorLessonAccess(lessonKey) !== "free") {
    return null;
  }
  return jsonLdDocument([
    juniorOnlineCourseJsonLd({
      name: lesson.title,
      description: juniorFreeLessonDescription(lesson, course.subject),
      path: `/junior/ders/${lesson.key}`,
      subject: course.subject,
      imagePath: juniorCoverImage(lesson.key) ?? null,
      isAccessibleForFree: true,
    }),
    faqPageJsonLd(juniorFreeLessonFaq(course.subject)),
  ]);
}
