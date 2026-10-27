/**
 * Eski numaralı grafik saat. Oynatıcı bu dosyayı okumaz.
 * Canlı saat kilitli `packages/junior-content/timelines/*.timeline.json` dosyasıdır.
 * Bu harita yalnız `scripts/seal-junior-graph-clock.ts` içindir:
 * grafik tahtasını kilitli kasete taşırken kaynak olarak durur.
 * `jr_06_mat-6` canlı anahtardır; dosya adı `mat-27` eski numarayı taşır.
 */

import { JR_06_FEN_10_TIMELINE } from "@/lib/junior/pilot-engine/fen-10.graph";
import { JR_06_FEN_21_TIMELINE } from "@/lib/junior/pilot-engine/fen-21.graph";
import { JR_06_FEN_37_TIMELINE } from "@/lib/junior/pilot-engine/fen-37.graph";
import { JR_06_FEN_38_TIMELINE } from "@/lib/junior/pilot-engine/fen-38.graph";
import { JR_06_FEN_9_TIMELINE } from "@/lib/junior/pilot-engine/fen-9.graph";
import { JR_06_MAT_11_TIMELINE } from "@/lib/junior/pilot-engine/mat-11.graph";
import { JR_06_MAT_12_TIMELINE } from "@/lib/junior/pilot-engine/mat-12.graph";
import { JR_06_MAT_13_TIMELINE } from "@/lib/junior/pilot-engine/mat-13.graph";
import { JR_06_MAT_21_TIMELINE } from "@/lib/junior/pilot-engine/mat-21.graph";
import { JR_06_MAT_22_TIMELINE } from "@/lib/junior/pilot-engine/mat-22.graph";
import { JR_06_MAT_27_TIMELINE } from "@/lib/junior/pilot-engine/mat-27.graph";
import { JR_06_MAT_30_TIMELINE } from "@/lib/junior/pilot-engine/mat-30.graph";
import { JR_06_MAT_31_TIMELINE } from "@/lib/junior/pilot-engine/mat-31.graph";
import { JR_06_MAT_32_TIMELINE } from "@/lib/junior/pilot-engine/mat-32.graph";
import { JR_06_MAT_33_TIMELINE } from "@/lib/junior/pilot-engine/mat-33.graph";
import { JR_06_MAT_34_TIMELINE } from "@/lib/junior/pilot-engine/mat-34.graph";
import { JR_06_MAT_35_TIMELINE } from "@/lib/junior/pilot-engine/mat-35.graph";
import { JR_06_MAT_36_TIMELINE } from "@/lib/junior/pilot-engine/mat-36.graph";
import { JR_06_MAT_7_TIMELINE } from "@/lib/junior/pilot-engine/mat-7.graph";
import type { TimelineJSON } from "@/lib/junior/pilot-engine/schema";

const GRAPH_TIMELINES: Readonly<Record<string, TimelineJSON>> = {
  "jr_06_mat-3": JR_06_MAT_7_TIMELINE,
  "jr_06_mat-7": JR_06_MAT_11_TIMELINE,
  "jr_06_mat-8": JR_06_MAT_12_TIMELINE,
  "jr_06_mat-9": JR_06_MAT_13_TIMELINE,
  "jr_06_mat-19": JR_06_MAT_21_TIMELINE,
  "jr_06_mat-18": JR_06_MAT_22_TIMELINE,
  "jr_06_mat-6": JR_06_MAT_27_TIMELINE,
  "jr_06_mat-14": JR_06_MAT_30_TIMELINE,
  "jr_06_mat-15": JR_06_MAT_31_TIMELINE,
  "jr_06_mat-16": JR_06_MAT_32_TIMELINE,
  "jr_06_mat-17": JR_06_MAT_33_TIMELINE,
  "jr_06_mat-20": JR_06_MAT_34_TIMELINE,
  "jr_06_mat-21": JR_06_MAT_35_TIMELINE,
  "jr_06_mat-22": JR_06_MAT_36_TIMELINE,
  "jr_06_fen-9": JR_06_FEN_9_TIMELINE,
  "jr_06_fen-10": JR_06_FEN_10_TIMELINE,
  "jr_06_fen-21": JR_06_FEN_21_TIMELINE,
  "jr_06_fen-37": JR_06_FEN_37_TIMELINE,
  "jr_06_fen-38": JR_06_FEN_38_TIMELINE,
};

/** Mühür betiğinin kaynak saati. Oynatıcı yolu bunu çağırmaz. */
export function getGraphTimelineFallback(lessonKey: string): TimelineJSON | null {
  return GRAPH_TIMELINES[lessonKey.trim()] ?? null;
}
