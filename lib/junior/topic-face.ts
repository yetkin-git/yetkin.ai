import { JUNIOR_QUIZ_PREPARING_LABEL } from "@/lib/junior/limits";
import type { JuniorLessonStatus } from "@/lib/junior/types";

export type JuniorTopicCardTone = "emerald" | "amber" | "safir" | "neutral";

export type JuniorTopicCardFace = {
  badge: string;
  tone: JuniorTopicCardTone;
  /** Açık derslerde CTA metni. Kilitli kartta düğme yok. */
  action: string | null;
  destination: "lesson" | "locked";
};

/**
 * Konu kartının rozeti ve düğmesi.
 * `opener` dersin ilk konusudur; yalnız o, başlanmamışken ücretsiz başlangıç taşır.
 * Paketle açılmış sonraki konu «Başla» der. Kilit, henüz açılmamış konudadır.
 * Kilitli kartta «Paketi Al» basılmaz; vitrin üstündeki tek paket kapısı veya bilgi penceresi kullanılır.
 */
export function juniorTopicCardFace(
  lesson: { access: "free" | "locked"; status: JuniorLessonStatus },
  opener: boolean,
): JuniorTopicCardFace {
  if (lesson.status === "done") {
    return {
      badge: "Tamamlandı ✅",
      tone: "emerald",
      action: "Tekrar Et",
      destination: "lesson",
    };
  }
  if (lesson.access === "locked") {
    return {
      badge: "Kilitli",
      tone: "neutral",
      action: null,
      destination: "locked",
    };
  }
  if (lesson.status === "preparing") {
    return {
      badge: JUNIOR_QUIZ_PREPARING_LABEL,
      tone: "neutral",
      action: "Taslağı gör",
      destination: "lesson",
    };
  }
  if (lesson.status === "going") {
    return {
      badge: "Devam Et 🔄",
      tone: "amber",
      action: "Devam Et",
      destination: "lesson",
    };
  }
  if (opener) {
    return {
      badge: "Ücretsiz Başla",
      tone: "safir",
      action: "Ücretsiz Başla",
      destination: "lesson",
    };
  }
  return {
    badge: "Başla",
    tone: "safir",
    action: "Başla",
    destination: "lesson",
  };
}
