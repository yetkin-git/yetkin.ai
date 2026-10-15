"use client";

import Link from "next/link";
import { juniorLessonChain } from "@/lib/junior/lesson-nav";

const press =
  "inline-flex h-8 min-h-8 shrink-0 cursor-pointer items-center justify-center rounded-lg px-3 text-xs font-bold text-white shadow-md transition duration-150 hover:brightness-110 active:translate-y-0.5 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:text-sm";

/** Branşın son konusunda sonraki hedef yok: o buton durur, basılmaz. */
const idle =
  "disabled inline-flex h-8 min-h-8 shrink-0 cursor-not-allowed items-center justify-center rounded-lg bg-gray-200 px-3 text-xs font-bold text-gray-400 opacity-50 shadow-none sm:text-sm";

const prevPress = `${press} bg-gradient-to-r from-sky-500 to-indigo-600 shadow-[0_10px_22px_rgba(79,70,229,0.4)] focus-visible:outline-indigo-600`;

/** Ders sayfası sağ üstü: aynı branşın sırası yan yana iki buton. Branşın ilk konusunda sol buton ders listesine döner. */
export function JuniorLessonHeaderNav({ lessonKey }: { lessonKey: string }) {
  const { prevLesson: prev, nextLesson: next } = juniorLessonChain(lessonKey);

  return (
    <nav
      aria-label="Konu sırası"
      data-junior-lesson-nav=""
      className="flex flex-nowrap items-center justify-end gap-2"
    >
      {prev ? (
        <Link
          href={`/junior/ders/${prev.key}`}
          data-junior-prev-topic=""
          data-junior-prev-topic-state="ready"
          title={prev.title}
          className={prevPress}
        >
          ← Önceki Konu
        </Link>
      ) : (
        <Link
          href="/junior"
          data-junior-prev-topic=""
          data-junior-prev-topic-state="ready"
          title="Junior ders listesi"
          className={prevPress}
        >
          ← Ders Listesi
        </Link>
      )}
      {next ? (
        <Link
          href={`/junior/ders/${next.key}`}
          data-junior-next-topic=""
          data-junior-next-topic-state="ready"
          title={next.title}
          className={`${press} bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-600 shadow-[0_10px_24px_rgba(217,70,239,0.5)] focus-visible:outline-fuchsia-600`}
        >
          Sonraki Konu ➔
        </Link>
      ) : (
        <button
          type="button"
          disabled
          data-junior-next-topic=""
          data-junior-next-topic-state="disabled"
          className={idle}
          aria-label="Sonraki konu yok"
        >
          Sonraki Konu ➔
        </button>
      )}
    </nav>
  );
}
