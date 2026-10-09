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

/** Meta açıklama: ilk cümle, 180 karakter tavanı. */
export function juniorSeoDescription(text: string): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  const sentence = trimmed.match(/^.*?[.!?](?=\s|$)/u)?.[0]?.trim() ?? trimmed;
  if (sentence.length <= JUNIOR_DESCRIPTION_MAX) {
    return sentence;
  }
  return `${sentence.slice(0, JUNIOR_DESCRIPTION_MAX - 1).trimEnd()}…`;
}

export function juniorLessonKeywords(subject: string): string[] {
  const specific = `6. sınıf ${subject.trim().toLocaleLowerCase("tr-TR")}`;
  const rest = JUNIOR_SEO_KEYWORDS.filter((keyword) => keyword !== specific);
  return [specific, ...rest];
}

export const JUNIOR_LANDING_FAQ = [
  {
    question: "6. sınıf derslerinin ilk konusu ücretsiz mi?",
    answer: "Evet. Her dersin ilk konusu ücretsiz kalır. Sonraki konular yıllık paketle açılır.",
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

/** Katalogdaki ücretsiz ilk konu indekslenir. Kilitli konu ve bilinmeyen anahtar indekslenmez. */
export function juniorLessonPageMetadata(lessonKey: string): Metadata {
  const lesson = juniorLessonByKey(lessonKey);
  const course = juniorCourseByLessonKey(lessonKey);
  if (!lesson || !course || juniorLessonAccess(lessonKey) !== "free") {
    return {
      title: lesson?.title ?? "Ders",
      robots: { index: false, follow: false },
    };
  }
  return pageMetadata({
    title: juniorLessonSeoTitle(lesson.title, course.subject),
    description: juniorSeoDescription(lesson.teaser),
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
      description: juniorSeoDescription(lesson.teaser),
      path: `/junior/ders/${lesson.key}`,
      subject: course.subject,
      imagePath: juniorCoverImage(lesson.key) ?? null,
      isAccessibleForFree: true,
    }),
    faqPageJsonLd(juniorFreeLessonFaq(course.subject)),
  ]);
}
