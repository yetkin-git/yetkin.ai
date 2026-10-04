import "server-only";

import { JUNIOR_PILOT_GRADE, JUNIOR_PILOT_SLUGS } from "@/lib/junior/limits";
import type { JuniorCourseShelf, JuniorLessonCard } from "@/lib/junior/types";

export type JuniorLessonScript = {
  key: string;
  title: string;
  teaser: string;
  listenText: string;
  outcomes: readonly string[];
};

export type JuniorPilotCourse = {
  slug: (typeof JUNIOR_PILOT_SLUGS)[number];
  code: string;
  title: string;
  subject: string;
  grade: typeof JUNIOR_PILOT_GRADE;
  lessons: readonly JuniorLessonScript[];
};

export const JUNIOR_PILOT_COURSES = [
  {
    slug: "jr_06_mat",
    code: "JR-06-MAT",
    title: "6. Sınıf Matematik",
    subject: "Matematik",
    grade: JUNIOR_PILOT_GRADE,
    lessons: [
      {
        key: "jr_06_mat-1",
        title: "Bir bütünü eşit parçaya bölmek",
        teaser: "Kesir, bir bütünün eşit parçasıdır. Pay üstte, payda altta durur.",
        listenText:
          "Bir elmayı dört eşit parçaya böl. Bir parçayı al. Bu parça bütünün dörtte biridir. Bu sayıya kesir deriz. Üstteki sayı paydır. Alttaki sayı paydadır. Payda, bütünün kaç eşit parçaya bölündüğünü söyler. Parçalar eşit değilse o sayı kesir olmaz.",
        outcomes: [
          "Kesir, bir bütünün eşit parçasıdır.",
          "Pay üstteki sayıdır.",
          "Payda alttaki sayıdır.",
          "Payda, bütünün kaç eşit parçaya bölündüğünü söyler.",
        ],
      },
      {
        key: "jr_06_mat-2",
        title: "Payda aynıyken toplama",
        teaser: "Paydalar aynıysa paylar toplanır. Payda yerinde kalır.",
        listenText:
          "İki kesrin paydası aynıysa paylar toplanır. Payda değişmez. Dörtte bir ile dörtte ikiyi toplarsan dörtte üç olur. Paydalar farklıysa bu kural tek başına yetmez. Önce paydalar eşitlenir.",
        outcomes: ["Aynı paydada paylar toplanır.", "Payda toplama sırasında değişmez."],
      },
    ],
  },
  {
    slug: "jr_06_fen",
    code: "JR-06-FEN",
    title: "6. Sınıf Fen Bilimleri",
    subject: "Fen Bilimleri",
    grade: JUNIOR_PILOT_GRADE,
    lessons: [
      {
        key: "jr_06_fen-1",
        title: "İtmek ve çekmek kuvvettir",
        teaser: "Kuvvet, bir cismi iten veya çeken etkidir. Yönü vardır.",
        listenText:
          "Kapıyı itersin. Çekmeceyi çekersin. İkisi de kuvvettir. Kuvvet, bir cismi iten veya çeken etkidir. Kuvvetin yönü vardır. İtmek bir yöndür. Çekmek ters yöndür. Durmakta olan bir cisim, yeterli kuvvet uygulanınca hareket edebilir. Kuvvet görünmez. Etkisi görünür.",
        outcomes: [
          "Kuvvet, bir cismi iten veya çeken etkidir.",
          "Kuvvetin yönü vardır.",
          "Durmakta olan bir cisim, kuvvet uygulanınca hareket edebilir.",
        ],
      },
      {
        key: "jr_06_fen-2",
        title: "Sürtünme",
        teaser: "Sürtünme, hareketi zorlaştıran bir kuvvettir.",
        listenText:
          "Pürüzlü yerde kaymak zordur. Bu zorluğa sürtünme deriz. Sürtünme de bir kuvvettir. Hareketin tersi yönde etki eder. Pürüz artınca sürtünme artar. Buzda sürtünme azdır. Bu yüzden kaymak kolaylaşır.",
        outcomes: ["Sürtünme bir kuvvettir.", "Sürtünme hareketi zorlaştırır."],
      },
    ],
  },
  {
    slug: "jr_06_turkce",
    code: "JR-06-TUR",
    title: "6. Sınıf Türkçe",
    subject: "Türkçe",
    grade: JUNIOR_PILOT_GRADE,
    lessons: [
      {
        key: "jr_06_turkce-1",
        title: "Metnin ana fikri",
        teaser: "Ana fikir, yazarın okura asıl söylemek istediğidir.",
        listenText:
          "Bir metni okudun. Yazar senden tek bir şeyi hatırlamanı ister. Buna ana fikir deriz. Ana fikir, yazarın asıl söylemek istediğidir. Çoğu kez tek cümleyle söylenir. Metindeki örnek, sayı ve olay ayrıntıdır. Ayrıntı ana fikri destekler. Ayrıntı, ana fikrin kendisi değildir.",
        outcomes: [
          "Ana fikir, yazarın okura asıl söylemek istediğidir.",
          "Ana fikir çoğu kez tek cümleyle söylenir.",
          "Ayrıntı ana fikri destekler. Ayrıntı ana fikir değildir.",
        ],
      },
      {
        key: "jr_06_turkce-2",
        title: "Yardımcı fikir",
        teaser: "Yardımcı fikir, ana fikri taşıyan küçük cümledir.",
        listenText:
          "Ana fikir tek başına durmaz. Onu taşıyan küçük cümleler vardır. Bunlara yardımcı fikir deriz. Yardımcı fikir, ana fikrin bir parçasını açıklar. Ana fikrin yerine geçmez. Metinde birden fazla yardımcı fikir olabilir. Hepsi aynı ana fikre bağlanır.",
        outcomes: ["Yardımcı fikir ana fikri taşır.", "Yardımcı fikir ana fikrin yerine geçmez."],
      },
    ],
  },
] as const satisfies readonly JuniorPilotCourse[];

export function juniorCourseBySlug(slug: string): JuniorPilotCourse | null {
  return JUNIOR_PILOT_COURSES.find((course) => course.slug === slug) ?? null;
}

export function juniorCourseByLessonKey(lessonKey: string): JuniorPilotCourse | null {
  return JUNIOR_PILOT_COURSES.find((course) => course.lessons.some((lesson) => lesson.key === lessonKey)) ?? null;
}

export function juniorLessonByKey(lessonKey: string): JuniorLessonScript | null {
  for (const course of JUNIOR_PILOT_COURSES) {
    const lesson = course.lessons.find((row) => row.key === lessonKey);
    if (lesson) {
      return lesson;
    }
  }
  return null;
}

export function juniorLessonAccess(lessonKey: string): "free" | "locked" | "missing" {
  const course = juniorCourseByLessonKey(lessonKey);
  if (!course) {
    return "missing";
  }
  return course.lessons[0]?.key === lessonKey ? "free" : "locked";
}

export function juniorCourseShelves(): JuniorCourseShelf[] {
  return JUNIOR_PILOT_COURSES.map((course) => ({
    slug: course.slug,
    title: course.title,
    lessons: course.lessons.map(
      (lesson): JuniorLessonCard => ({
        key: lesson.key,
        title: lesson.title,
        teaser: lesson.teaser,
        access: course.lessons[0]?.key === lesson.key ? "free" : "locked",
      }),
    ),
  }));
}
