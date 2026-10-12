import type { JuniorHintKind } from "@/lib/junior/content-rules";

/** Ders notu sekmesinin fasikül kopyası. Kaset transkripti bu nesneye girmez. */
export type JuniorBookletCopy = {
  concept: string;
  example: string;
  warning: string;
  recap: readonly string[];
  hint: JuniorHintKind;
};
