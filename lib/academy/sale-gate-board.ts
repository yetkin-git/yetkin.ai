import "server-only";

import { curriculumLessonKeysForSlug } from "@/lib/academy/curricula/lesson-index";
import { ACADEMY_FLAGSHIP_SKU_SLUG, ACADEMY_VITRINE_SHELL_SKU_SLUGS } from "@/lib/academy/pilot-sku";
import { ensureAcademyProductionDiskProbe } from "@/lib/academy/production-seal-disk";
import {
  ACADEMY_PRODUCTION_LAYER_LABEL,
  ACADEMY_PRODUCTION_MEDIA_LAYERS,
  academyCourseSaleTier,
  academyCourseVoiceTextSealed,
  academyProductionLayerPresence,
} from "@/lib/academy/production-standard";
import { courseRegistryBySlug } from "@yetkin/kernel/catalog-ids/course-registry";
import {
  academySaleGateGaps,
  type AcademySaleGateGap,
  type AcademySaleGateTierLabel,
} from "@/lib/kernel/admin/sale-gate";
import type { AcademyCoursePublishRow, SealedCatalogEntry } from "@/lib/kernel/admin/types";

/**
 * Vitrin satış kapısı tahtası — **academy odası** (B1 import duvarı).
 *
 * Neden burada: bu modül mühürlü ses/metin katmanını ve fiyat kataloğunu okur,
 * yani `lib/academy/*` import eder. `lib/kernel` dikey oda import etmez (B1).
 * Saf karar (`academySaleGateGaps`) kernel'de kalır; oda bağımlı birleştirme burada durur.
 * İki dosya birlikte Anayasa B3 satış kapısını kurar; kural tek yerde (kernel) tanımlıdır.
 */

export const ACADEMY_SALE_GATE_GAPS = ["Yayın", "Fiyat", "Ses ve metin"] as const;

export type AcademySaleGateRow = {
  slug: string;
  title: string;
  gaps: AcademySaleGateGap[];
  mediaDetail: string;
  /** Temel Akademi eğitimi (`01_office_ai`, OFF-101) — şeritte ilk sırada ve öne çıkan durur. */
  isFlagship: boolean;
  /** Kademeli yayın kademesi: closed / showcase (vitrin açık, satış kapalı) / sale. */
  tier: AcademySaleGateTierLabel;
  tierDetail: string;
  /** İlk kırmızı rozeti kapatan somut sonraki iş. Yeşilse boş. */
  nextAction: string;
};

const NEXT_ACTION: Record<AcademySaleGateGap, string> = {
  Yayın: "Admin katalogdan kursu yayına al.",
  Fiyat: "Gerekçeli aktif fiyat satırı yaz (PriceCatalogEntry).",
  "Ses ve metin": "Konuşma metnini ve mühürlü sesi tamamla. Isınma, görsel ve müzik stüdyo mührüdür.",
};

function courseHasActivePrice(slug: string, entries: readonly SealedCatalogEntry[]): boolean {
  return entries.some(
    (entry) =>
      entry.unitKey === `course:${slug}` &&
      entry.isActive &&
      entry.unitType === "MINOR" &&
      entry.amountMinor > 0,
  );
}

function courseIsPublished(slug: string, rows: readonly AcademyCoursePublishRow[]): boolean {
  const row = rows.find((item) => item.slug === slug || item.unitKey === `course:${slug}`);
  return row?.isPublished === true;
}

function missingLayerLabels(
  slug: string,
  layers: readonly (typeof ACADEMY_PRODUCTION_MEDIA_LAYERS)[number][],
): string[] {
  const keys = curriculumLessonKeysForSlug(slug);
  if (keys.length === 0) {
    return ["ders yolu yok"];
  }
  const missing = new Set<string>();
  for (const lessonKey of keys) {
    const presence = academyProductionLayerPresence(slug, lessonKey);
    for (const layer of layers) {
      if (presence[layer] !== true) {
        missing.add(ACADEMY_PRODUCTION_LAYER_LABEL[layer]);
      }
    }
  }
  return [...missing];
}

/** Vitrin kartları. Satın Al’ın neden kapalı olduğu bu satırda durur. Öne çıkan eğitim ilk sıradadır. */
export function readAcademyVitrineSaleGates(
  entries: readonly SealedCatalogEntry[],
  coursePublish: readonly AcademyCoursePublishRow[],
): AcademySaleGateRow[] {
  ensureAcademyProductionDiskProbe();
  const rows = ACADEMY_VITRINE_SHELL_SKU_SLUGS.map((slug) => {
    const voiceGap = missingLayerLabels(slug, ["text", "voice"]);
    const cinemaGap = missingLayerLabels(slug, ["video", "visual", "music"]);
    const keys = curriculumLessonKeysForSlug(slug);
    const mediaSealed = keys.length > 0 && academyCourseVoiceTextSealed(slug, keys);
    const gaps = academySaleGateGaps({
      published: courseIsPublished(slug, coursePublish),
      activePrice: courseHasActivePrice(slug, entries),
      mediaSealed,
    });
    const firstGap = gaps[0];
    const saleTier = academyCourseSaleTier(slug, keys);
    const detail = [
      voiceGap.length > 0 ? voiceGap.join(", ") : "",
      cinemaGap.length > 0 ? `Stüdyo notu: ${cinemaGap.join(", ")}` : "",
    ].filter((part) => part.length > 0);
    return {
      slug,
      title: courseRegistryBySlug(slug)?.title ?? slug,
      gaps,
      mediaDetail: detail.join(" · "),
      isFlagship: slug === ACADEMY_FLAGSHIP_SKU_SLUG,
      tier: saleTier.tier,
      tierDetail:
        saleTier.tier === "closed"
          ? "Hazırlanıyor"
          : saleTier.tier === "showcase"
            ? `Vitrin açık, satış kapalı (${saleTier.sealedLessons}/${saleTier.totalLessons} derste ses ve metin)`
            : saleTier.cinemaLessons === saleTier.totalLessons
              ? "Tam mühür"
              : "Ses ve metin hazır",
      nextAction: firstGap ? NEXT_ACTION[firstGap] : "",
    };
  });
  return rows.sort((a, b) => Number(b.isFlagship) - Number(a.isFlagship));
}
